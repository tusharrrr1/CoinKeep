// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.12;

import "openzeppelin-contracts/contracts/proxy/utils/Initializable.sol";
import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeTransferLib } from "lib/solady/src/utils/SafeTransferLib.sol";
import {PaymentInfo, TokenCollectionStrategy, calculatePaymentInfoHash} from "./utils/Utils.sol";

contract PayIntentContract is Initializable, ReentrancyGuard {
    bytes32 paymentInfoHash;

    constructor() {
        _disableInitializers();
    }

    function initialize(bytes32 _paymentInfoHash) public initializer {
        paymentInfoHash = _paymentInfoHash;
    }

    /// Collect tokens from a payer.
    function collectTokens(
        PaymentInfo calldata paymentInfo,
        uint256 amount,
        TokenCollectionStrategy strategy
    ) external {
        require(calculatePaymentInfoHash(paymentInfo) == paymentInfoHash, "PI: paymentInfo");
        require(msg.sender == paymentInfo.escrow, "PI: only escrow");

        if(strategy == TokenCollectionStrategy.preApproved) {
            SafeTransferLib.safeTransferFrom(paymentInfo.sourceToken, paymentInfo.payer, address(this), amount);
        } else if (strategy == TokenCollectionStrategy.preTransferred) {
            uint256 balance = IERC20(paymentInfo.sourceToken).balanceOf(address(this));
            if (balance < amount) {
                revert("PI: insufficient balance");
            }
        } else {
            revert("PI: invalid strategy");
        }
    }

    function sendTokenByAddress(
        PaymentInfo calldata paymentInfo,
        address recipient,
        uint256 amount,
        address token
        ) external {
        require(calculatePaymentInfoHash(paymentInfo) == paymentInfoHash, "PI: paymentInfo");
        require(msg.sender == paymentInfo.escrow, "PI: only escrow");
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance < amount) {
            revert("PI: insufficient balance");
        }
        SafeTransferLib.safeTransfer(token, recipient, amount);
    }

    function sendTokens(
        PaymentInfo calldata paymentInfo,
        address recipient,
        uint256 amount
    ) external {
        require(calculatePaymentInfoHash(paymentInfo) == paymentInfoHash, "PI: paymentInfo");
        require(msg.sender == paymentInfo.escrow, "PI: only escrow");
        SafeTransferLib.safeTransfer(paymentInfo.sourceToken, recipient, amount);
    }

    /// Accept native-token (eg ETH) inputs
    receive() external payable {}
}
