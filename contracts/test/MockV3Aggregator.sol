// here we'll define our mock pricefeed aggregator
// chainlink repo has some mocks already so we'll use the node module and inport it

// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

// as we using 0.6.0 and compiler version is 0.8.8 so it will produce error so changing hardhat-config file so that it can run on multiple version

import "@chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol";
