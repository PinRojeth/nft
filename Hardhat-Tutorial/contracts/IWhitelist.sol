// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface  IWhitelist {
    function whitelistedAddresses (address) external view  returns (bool);
}