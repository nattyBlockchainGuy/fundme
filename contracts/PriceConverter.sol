// SPDX-License-Identifier: MIT

// see cheked and unchecked concept , mathsafe
// This is library that we are going to attach to uint256 so that we can write as msg.sender.getConversionRate() as if msg.sender is object or struct or a contract that we have created
// Libraries are similar to contracts, but you can't declare any state variable and you can't send ether.
// A library is embedded into the contract if all library functions are internal.
// Otherwise the library must be deployed and then linked before the contract is deployed.

pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        //as we are going to interact with the contract (Integratorv3) outside the blockchain we need two things
        //ABI of contact - is basically list of diff function and interactions that you can have with contract
        // we need a concept called INTERFACE to get ABI
        //address of contract - eth data feed in chanlink doc , easy - 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e (this is of rinkeby)
        //there is also a way to interact with contract withut ABI too ..
        //creating variable priceFeed of type AggregatorV3Interface which equals to contract at address this
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(
        //     0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        // ); now we no need to hardcode the pricefeed

        //as latestRoundData returms bunch of things we need only price
        (, int256 price, , , ) = priceFeed.latestRoundData(); // ETH in terms of usd 3000.00000000
        // it will return price in int256 and it will have 8 decimal places , can check with decimal() so typecasting it to uint256 and doing neccesarry maths so calulation becomes accurate
        return uint256(price * 1e10);
        // as we not modifying any state in this function so making it view
    }

    function getVersion() internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        );
        return priceFeed.version();
    }

    // no need of getVersion here just making you guys familiar with interfaces

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        // mul will have 36 decimal places so diving by 18
        return ethAmountInUsd;
    }
}
