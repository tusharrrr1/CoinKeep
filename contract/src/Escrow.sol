// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeTransferLib } from "solady/utils/SafeTransferLib.sol";
import {ReentrancyGuardTransient} from "solady/utils/ReentrancyGuardTransient.sol";
import {PaymentInfo, calculatePaymentInfoHash, TokenCollectionStrategy} from "./utils/Utils.sol";
import {PayIntentFactory} from "./PayIntentFactory.sol";
import {PayIntentContract} from "./PayIntent.sol";

contract Escrow is ReentrancyGuardTransient {
    using SafeERC20 for IERC20;
    PayIntentFactory public immutable INTENT_FACTORY;

    struct PaymentState {
        bool hasCollectedPayment;
        uint256 capturableAmount;
        uint256 refundableAmount;
    }

    uint16 internal constant _MAX_FEE_BPS = 10_000;

    mapping(bytes32 paymentInfoHash => PaymentState state) public paymentState;

    event PaymentAuthorized(
        bytes32 indexed paymentInfoHash, PaymentInfo paymentInfo, uint256 amount
    );

    event PaymentCaptured(bytes32 indexed paymentInfoHash, uint256 amount, uint16 feeBps, address feeReceiver, address tokenAddress, uint256 chainId);

    event PaymentVoided(bytes32 indexed paymentInfoHash, uint256 amount);

    event PaymentReclaimed(bytes32 indexed paymentInfoHash, uint256 amount);

    event PaymentRefunded(bytes32 indexed paymentInfoHash, uint256 amount, address refundReceiver);

    event TokenStoreCreated(address indexed operator, address tokenStore);

    error InvalidSender(address sender, address expected);

    error ZeroAmount();

    error AmountOverflow(uint256 amount, uint256 limit);

    error ExceedsMaxAmount(uint256 amount, uint256 maxAmount);

    error AfterPreApprovalExpiry(uint48 timestamp, uint48 expiry);

    error InvalidExpiries(uint48 preApproval, uint48 authorization, uint48 refund);

    error FeeBpsOverflow(uint16 feeBps);

    error InvalidFeeBpsRange(uint16 minFeeBps, uint16 maxFeeBps);

    error FeeBpsOutOfRange(uint16 feeBps, uint16 minFeeBps, uint16 maxFeeBps);

    error ZeroFeeReceiver();

    error InvalidFeeReceiver(address attempted, address expected);

    error InvalidCollectorForOperation();

    error TokenCollectionFailed();

    error PaymentAlreadyCollected(bytes32 paymentInfoHash);

    error AfterAuthorizationExpiry(uint48 timestamp, uint48 expiry);

    error InsufficientAuthorization(bytes32 paymentInfoHash, uint256 authorizedAmount, uint256 requestedAmount);

    error ZeroAuthorization(bytes32 paymentInfoHash);

    error BeforeAuthorizationExpiry(uint48 timestamp, uint48 expiry);


    error AfterRefundExpiry(uint48 timestamp, uint48 expiry);

    error RefundExceedsCapture(uint256 refund, uint256 captured);

    error AggregatorFailedToForward();

    error InsufficientBalance();


    modifier onlySender(address sender) {
        if (msg.sender != sender) revert InvalidSender(msg.sender, sender);
        _;
    }

    modifier validAmount(uint256 amount) {
        if (amount == 0) revert ZeroAmount();
        if (amount > type(uint256).max) revert AmountOverflow(amount, type(uint256).max);
        _;
    }

    constructor(address _intentFactory) {
        INTENT_FACTORY = PayIntentFactory(_intentFactory);
    }


    function authorize(
        PaymentInfo calldata paymentInfo,
        uint256 amount
    ) external nonReentrant onlySender(paymentInfo.operator) validAmount(amount) {
        _validatePayment(paymentInfo, amount);

        bytes32 paymentInfoHash = calculatePaymentInfoHash(paymentInfo);
        if (paymentState[paymentInfoHash].hasCollectedPayment) revert PaymentAlreadyCollected(paymentInfoHash);

        paymentState[paymentInfoHash] =
            PaymentState({hasCollectedPayment: true, capturableAmount: amount, refundableAmount: amount});

        _collectTokens(paymentInfo, amount);

         emit PaymentAuthorized(paymentInfoHash, paymentInfo, amount);
    }

    function capture(PaymentInfo calldata paymentInfo, address aggregator, bytes memory aggregatorData, uint16 feeBps, address feeReceiver, address tokenAddress, uint256 chainId)
        external
        payable
        nonReentrant
        onlySender(paymentInfo.operator)
    {
        _validateFee(paymentInfo, feeBps, feeReceiver);

        if (block.timestamp >= paymentInfo.authorizationExpiry) {
            revert AfterAuthorizationExpiry(uint48(block.timestamp), paymentInfo.authorizationExpiry);
        }

        bytes32 paymentInfoHash = calculatePaymentInfoHash(paymentInfo);
        PaymentState memory state = paymentState[paymentInfoHash];

        uint256 length = paymentInfo.receivers.length;

        uint256 totalAmount = 0;

        for(uint256 i; i < length; i++) {
            if(paymentInfo.receivers[i].chainId == chainId && paymentInfo.receivers[i].destinationToken == tokenAddress) {
                totalAmount += paymentInfo.receivers[i].amount;
            }
        }

        if (totalAmount == 0) revert ZeroAmount();
        if (totalAmount > type(uint256).max) revert AmountOverflow(totalAmount, type(uint256).max);

         if (state.capturableAmount < totalAmount) {
            revert InsufficientAuthorization(paymentInfoHash, state.capturableAmount, totalAmount);
        }

        state.capturableAmount -= uint256(totalAmount);
        state.refundableAmount -= uint256(totalAmount);
        paymentState[paymentInfoHash] = state;

        PayIntentContract intent = INTENT_FACTORY.createIntent(paymentInfo);
        intent.sendTokens(paymentInfo, address(this), totalAmount);

        SafeTransferLib.safeApprove(paymentInfo.sourceToken, aggregator, totalAmount);

        _call(aggregator, msg.value, aggregatorData);

        emit PaymentCaptured(paymentInfoHash, totalAmount, feeBps, feeReceiver, tokenAddress, chainId);
    }

    function authorizeAndCapture(PaymentInfo calldata paymentInfo, uint256 amount, address aggregator, bytes memory aggregatorData, uint16 feeBps, address feeReceiver, address tokenAddress, uint256 chainId)
        external
        payable
        nonReentrant
        onlySender(paymentInfo.operator)
        validAmount(amount)
    {
        _validatePayment(paymentInfo, amount);

        _validateFee(paymentInfo, feeBps, feeReceiver);

        uint256 length = paymentInfo.receivers.length;

        uint256 totalAmount = 0;

        for(uint256 i; i < length; i++) {
            if(paymentInfo.receivers[i].chainId == chainId && paymentInfo.receivers[i].destinationToken == tokenAddress) {
                totalAmount += paymentInfo.receivers[i].amount;
            }
        }

        if (totalAmount == 0) revert ZeroAmount();
        if (totalAmount > type(uint256).max) revert AmountOverflow(totalAmount, type(uint256).max);

        bytes32 paymentInfoHash = calculatePaymentInfoHash(paymentInfo);
        if (paymentState[paymentInfoHash].hasCollectedPayment) revert PaymentAlreadyCollected(paymentInfoHash);

        paymentState[paymentInfoHash] = PaymentState({hasCollectedPayment: true, capturableAmount: 0, refundableAmount: uint120(amount)});
        
        _collectTokens(paymentInfo, amount);
        PayIntentContract intent = INTENT_FACTORY.createIntent(paymentInfo);
        intent.sendTokens(paymentInfo, address(this), totalAmount);

        SafeTransferLib.safeApprove(paymentInfo.sourceToken, aggregator, totalAmount);

        _call(aggregator, msg.value, aggregatorData);

        emit PaymentCaptured(paymentInfoHash, totalAmount, feeBps, feeReceiver, tokenAddress, chainId);
    }

    function _call(address forwardAddress, uint256 sendValue, bytes memory callData) internal {
        (bool success, bytes memory response) = forwardAddress.call{ value: sendValue }(callData);
        if (!success) {
            // If there is return data, the delegate call reverted with a reason or a custom error, which we bubble up.
            if (response.length > 0) {
                assembly {
                    let returndata_size := mload(response)
                    revert(add(32, response), returndata_size)
                }
            } else {
                revert AggregatorFailedToForward();
            }
        }
    }

    function refund(
        PaymentInfo calldata paymentInfo,
        uint256 amount
    ) external nonReentrant onlySender(paymentInfo.operator) validAmount(amount) {
        if (block.timestamp >= paymentInfo.refundExpiry) {
            revert AfterRefundExpiry(uint48(block.timestamp), paymentInfo.refundExpiry);
        }

        bytes32 paymentInfoHash = calculatePaymentInfoHash(paymentInfo);
        uint256 captured = paymentState[paymentInfoHash].refundableAmount;
        if (captured < amount) revert RefundExceedsCapture(amount, captured);


        paymentState[paymentInfoHash].refundableAmount = captured - uint256(amount);
        emit PaymentRefunded(paymentInfoHash, amount, paymentInfo.refundReceiver);

        PayIntentContract intent = INTENT_FACTORY.createIntent(paymentInfo);
        intent.sendTokens(paymentInfo, paymentInfo.refundReceiver, amount);

    }

    function reclaim(PaymentInfo calldata paymentInfo) external nonReentrant onlySender(paymentInfo.payer) {
        if (block.timestamp < paymentInfo.authorizationExpiry) {
            revert BeforeAuthorizationExpiry(uint48(block.timestamp), paymentInfo.authorizationExpiry);
        }

        bytes32 paymentInfoHash = calculatePaymentInfoHash(paymentInfo);
        uint256 authorizedAmount = paymentState[paymentInfoHash].capturableAmount;
        if (authorizedAmount == 0) revert ZeroAuthorization(paymentInfoHash);

        paymentState[paymentInfoHash].capturableAmount = 0;
        emit PaymentReclaimed(paymentInfoHash, authorizedAmount);

        PayIntentContract intent = INTENT_FACTORY.createIntent(paymentInfo);
        intent.sendTokens(paymentInfo, paymentInfo.payer, authorizedAmount);
    }

    function captureFinish(PaymentInfo calldata paymentInfo, address tokenAddress)
        external
        payable
        nonReentrant
        onlySender(paymentInfo.operator)
    {

        bytes32 paymentInfoHash = calculatePaymentInfoHash(paymentInfo);

        uint256 chainId = block.chainid;

        uint256 length = paymentInfo.receivers.length;

        uint256 balance = IERC20(tokenAddress).balanceOf(address(this));

        uint256 totalAmount = 0;

        for(uint256 i; i < length; i++) {
            if(paymentInfo.receivers[i].chainId == chainId && paymentInfo.receivers[i].destinationToken == tokenAddress) {
                totalAmount += paymentInfo.receivers[i].amount;
            }
        }

        if(balance < totalAmount) revert InsufficientBalance();

        PayIntentContract intent = INTENT_FACTORY.createIntent(paymentInfo);
        intent.sendTokens(paymentInfo, address(this), totalAmount);

        for(uint256 i; i < length; i++) {
            if(paymentInfo.receivers[i].chainId == chainId && paymentInfo.receivers[i].destinationToken == tokenAddress) {
                SafeTransferLib.safeTransfer(tokenAddress, paymentInfo.receivers[i].receiver, paymentInfo.receivers[i].amount);
            }
        }

        emit PaymentCaptured(paymentInfoHash, totalAmount, 0, 0x0000000000000000000000000000000000000000, tokenAddress, chainId);
    }


    function _collectTokens(
        PaymentInfo calldata paymentInfo,
        uint256 amount
    ) internal {
        PayIntentContract intent = INTENT_FACTORY.createIntent(paymentInfo);
        intent.collectTokens(paymentInfo, amount, TokenCollectionStrategy.preApproved);
        uint256 balance = IERC20(paymentInfo.sourceToken).balanceOf(address(intent));
        if (balance < amount) revert TokenCollectionFailed();
    }

    function _validatePayment(PaymentInfo calldata paymentInfo, uint256 amount) internal view {
        uint256 maxAmount = paymentInfo.maxAmount;
        uint48 preApprovalExp = paymentInfo.preApprovalExpiry;
        uint48 authorizationExp = paymentInfo.authorizationExpiry;
        uint48 refundExp = paymentInfo.refundExpiry;
        uint16 minFeeBps = paymentInfo.minFeeBps;
        uint16 maxFeeBps = paymentInfo.maxFeeBps;
        uint48 currentTime = uint48(block.timestamp);

        if (amount > maxAmount) revert ExceedsMaxAmount(amount, maxAmount);

        if (currentTime >= preApprovalExp) revert AfterPreApprovalExpiry(currentTime, preApprovalExp);

        if (preApprovalExp > authorizationExp || authorizationExp > refundExp) {
            revert InvalidExpiries(preApprovalExp, authorizationExp, refundExp);
        }

        if (maxFeeBps > _MAX_FEE_BPS) revert FeeBpsOverflow(maxFeeBps);

        if (minFeeBps > maxFeeBps) revert InvalidFeeBpsRange(minFeeBps, maxFeeBps);
    }

    function _validateFee(PaymentInfo calldata paymentInfo, uint16 feeBps, address feeReceiver) internal pure {
        uint16 minFeeBps = paymentInfo.minFeeBps;
        uint16 maxFeeBps = paymentInfo.maxFeeBps;
        address configuredFeeReceiver = paymentInfo.feeReceiver;

        if (feeBps < minFeeBps || feeBps > maxFeeBps) revert FeeBpsOutOfRange(feeBps, minFeeBps, maxFeeBps);

        if (feeReceiver == address(0) && feeBps > 0) revert ZeroFeeReceiver();

        if (configuredFeeReceiver != address(0) && configuredFeeReceiver != feeReceiver) {
            revert InvalidFeeReceiver(feeReceiver, configuredFeeReceiver);
        }
    }

    function _useTransientReentrancyGuardOnlyOnMainnet() internal view virtual override returns (bool) {
        return false;
    }
}
