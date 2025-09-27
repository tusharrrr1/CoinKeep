// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

struct ReceiverInfo {
    address receiver;
    uint256 chainId;
    address destinationToken;
    uint256 amount;
}

struct PaymentInfo {
        address operator;
        address escrow;
        address payer;
        address refundReceiver;
        address sourceToken;  
        uint256 maxAmount;
        uint48 preApprovalExpiry;
        uint48 authorizationExpiry;
        uint48 refundExpiry;
        uint16 minFeeBps;
        uint16 maxFeeBps;
        address feeReceiver;
        uint256 salt;
        ReceiverInfo[] receivers;
    }

struct Call {
    address to;
    uint256 value;
    bytes data;
}

enum TokenCollectionStrategy {
    preApproved,
    preTransferred
}

bytes32 constant PAYMENT_INFO_TYPEHASH = keccak256(
        "PaymentInfo(address operator,address escrow,address payer,address receiver,address token,uint120 maxAmount,uint48 preApprovalExpiry,uint48 authorizationExpiry,uint48 refundExpiry,uint16 minFeeBps,uint16 maxFeeBps,address feeReceiver,uint256 salt)"
    );

function calculatePaymentInfoHash(PaymentInfo calldata paymentInfo) pure returns (bytes32) {
    return keccak256(abi.encode(paymentInfo));
}