// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.12;

import "openzeppelin-contracts/contracts/utils/Create2.sol";
import "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import "./PayIntent.sol";
import {PaymentInfo, calculatePaymentInfoHash} from "./utils/Utils.sol";

contract PayIntentFactory {
    PayIntentContract public immutable INTENT_IMPL;

    constructor() {
        INTENT_IMPL = new PayIntentContract();
    }

    function createIntent(
        PaymentInfo calldata paymentInfo
    ) public returns (PayIntentContract ret) {
        address intentAddr = getIntentAddress(paymentInfo);
        if (intentAddr.code.length > 0) {
            return PayIntentContract(payable(intentAddr));
        }
        ret = PayIntentContract(
            payable(
                address(
                    new ERC1967Proxy{salt: bytes32(0)}(
                        address(INTENT_IMPL),
                        abi.encodeCall(
                            PayIntentContract.initialize,
                            (calculatePaymentInfoHash(paymentInfo))
                        )
                    )
                )
            )
        );
    }

    function getIntentAddress(
        PaymentInfo calldata paymentInfo
    ) public view returns (address) {
        return
            Create2.computeAddress(
                0,
                keccak256(
                    abi.encodePacked(
                        type(ERC1967Proxy).creationCode,
                        abi.encode(
                            address(INTENT_IMPL),
                            abi.encodeCall(
                                PayIntentContract.initialize,
                                (calculatePaymentInfoHash(paymentInfo))
                            )
                        )
                    )
                )
            );
    }
}
