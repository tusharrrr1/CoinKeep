// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.12;
import {Test} from "forge-std/Test.sol";
import {console2} from "forge-std/console2.sol";
import "../src/Escrow.sol";
import {PayIntentContract} from "../src/PayIntent.sol";
import {PayIntentFactory} from "../src/PayIntentFactory.sol";
import {PaymentInfo, ReceiverInfo} from "../src/utils/Utils.sol";
import {DummyToken} from "./utils/DummyUSDC.sol";

contract EscrowBaseTest is Test {
    Escrow public escrow;
    PayIntentContract public payIntentImpl;
    PayIntentFactory public payIntentFactory;
    DummyToken public dummySourceToken;
    DummyToken public dummyDestinationToken;
    address public operator;
    address public payer;
    address public feeReceiver;
    address public receiver;

    uint16 public FEE_BPS = 100;

    function setUp() public { 
        payIntentFactory = new PayIntentFactory();
        escrow = new Escrow(address(payIntentFactory));
        dummySourceToken = new DummyToken("Dummy USDC", "DUSDC");
        dummyDestinationToken = new DummyToken("Dummy USDT", "DUSDT");
        operator = vm.addr(1);
        vm.label(operator, "operator");
        payer = vm.addr(2);
        vm.label(payer, "payer");
        feeReceiver = vm.addr(3);
        vm.label(feeReceiver, "feeReceiver");
        dummySourceToken.mint(payer, 10e6);
        receiver = vm.addr(4);
        vm.label(receiver, "receiver");
    }

    function _createPaymentInfo(address _payer,uint256 _maxAmount, address _sourceToken, address _destinationToken) internal view returns (PaymentInfo memory) {

        ReceiverInfo[] memory receiverList = new ReceiverInfo[](5);

        receiverList[0] = ReceiverInfo({
            receiver: 0x1111111111111111111111111111111111111111,
            chainId: 1, // Ethereum Mainnet
            destinationToken: _destinationToken,
            amount: 200000
        });

        receiverList[1] = ReceiverInfo({
            receiver: 0x2222222222222222222222222222222222222222,
            chainId: 137, // Polygon
            destinationToken: _destinationToken,
            amount: 100000
        });

        receiverList[2] = ReceiverInfo({
            receiver: 0x3333333333333333333333333333333333333333,
            chainId: 10, // Optimism
            destinationToken: _destinationToken,
            amount: 100000
        });

        receiverList[3] = ReceiverInfo({
            receiver: 0x4444444444444444444444444444444444444444,
            chainId: 42161, // Arbitrum
            destinationToken: _destinationToken,
            amount: 100000
        });

        receiverList[4] = ReceiverInfo({
            receiver: 0x5555555555555555555555555555555555555555,
            chainId: 56, // BNB Chain
            destinationToken: _destinationToken,
            amount: 100000
        });

        PaymentInfo memory paymentInfo = PaymentInfo({
            operator: operator,
            escrow: address(escrow),
            payer: _payer,
            refundReceiver: _payer,
            sourceToken: _sourceToken,
            maxAmount: _maxAmount,
            preApprovalExpiry: type(uint48).max,
            authorizationExpiry: type(uint48).max,
            refundExpiry: type(uint48).max,
            minFeeBps: FEE_BPS,
            maxFeeBps: FEE_BPS,
            feeReceiver: feeReceiver,
            salt: 0,
            receivers: receiverList
        });
        return paymentInfo;
    }

    function test_reverts_AuthorizeWithoutPreApproval() external {
        PaymentInfo memory paymentInfo = _createPaymentInfo(payer, 1000000, address(dummySourceToken), address(dummyDestinationToken));
        vm.startPrank(operator);
        vm.expectRevert();
        escrow.authorize(paymentInfo, 1000000);
        vm.stopPrank();
    }

    function test_AuthorizeWithPreApproval() external {

        PaymentInfo memory paymentInfo = _createPaymentInfo(payer, 1000000, address(dummySourceToken), address(dummyDestinationToken));
        address intent = address(payIntentFactory.getIntentAddress(paymentInfo));
        vm.prank(payer);
        dummySourceToken.approve(intent, paymentInfo.maxAmount);
        vm.startPrank(operator);
        escrow.authorize(paymentInfo, 1000000);
        vm.stopPrank();
    }

    function test_AuthorizeWithPreApprovalAndCapture() external {
        PaymentInfo memory paymentInfo = _createPaymentInfo(payer, 1000000, address(dummySourceToken), address(dummyDestinationToken));
        address intent = address(payIntentFactory.getIntentAddress(paymentInfo));
        vm.prank(payer);
        dummySourceToken.approve(intent, paymentInfo.maxAmount);
        vm.startPrank(operator);
        escrow.authorize(paymentInfo, 1000000);
        bytes memory callData = abi.encodeWithSignature("approve(address,uint256)", feeReceiver, 100);
        escrow.capture(paymentInfo, address(dummySourceToken), callData, 100, feeReceiver, address(dummyDestinationToken), 137);
        vm.stopPrank();
    }
}