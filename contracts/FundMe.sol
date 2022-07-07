//SPDX-License-Identifier :MIT

// GAS_SAVING_TIPS
// 1 - using constant (naming convention : all caps ex- MINIMUM_USD) and immutable (naming convention : we place i before the name of variable ex- i_owner)can help us in saving gas , they save gas because instead of saving these variable in storage slot we actually save them directly into byte code of the contract
// 2 - using custom error , as we are using error string in the require statement so that error string is also saved in the storage hence increasing gas fee , so we can use if statement and custom error
// both of the above keyword are for the variable that can be only declared and updated once

pragma solidity ^0.8.8;
import "./PriceConverter.sol";

// get funds
// withdraw funds
// set a min sending value in usd

// smart contracts address can also store funds like a wallet because when we deploy contracts we get an address
// we'll also need help of chainlink oracle , they connect offchain stuff to blockchain

error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;
    uint256 public minimumUsd = 50 * 1e18;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;
    address public owner;
    // so this is basically function which will automatically get called when the contract is deployed
    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    //anyone can send us funds so adding public and payable
    //we also need to track who are sending us money

    function fund() public payable {
        // money maths in done in terms of wei , 1eth = 1e18 wei
        require(
            msg.value.getConversionRate(priceFeed) > minimumUsd,
            "didn't send enough money"
        );
        // as getConversionRate needs some parameter as declared in library so it will take msg.sender as its first parameter and if another parameter is mentioned it will take it as second (here priceFeed)

        // msg.value will have 18 decimal places and it will be in uint256
        // reverting -> undo any action BEFORE and sends the REMAINING gas back
        funders.push(msg.sender); // who ever call push()
        addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        // since we're withdrawing all the funds we also need to reset our funders array and adddressToAmountFunded
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        // reset the funders array - we could loop through the araay and delete the object ,let's just reset it with 0 objects in it
        funders = new address[](0);
        // actually withdraw/transfer the funds - there are three ways to do it
        // 1 - transfer
        // msg.sender is of type address and to carry out transaction typecasting it to payable , it automatically reverts if transactions fails , returns error if failed
        // payable(msg.sender).transfer(address(this).balance);
        // 2 - send
        // we need require to revert if transaction failed , returns boolean
        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success, "send failed");
        // 3 - call
        // it allows to call different function but here we need not to call any so leaving it blank with "" and it returns two variable - bool callSuccess , bytes memory dataReturned
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "call failed");
        // but now the problem with withdraw fun is that anyone can withdraw the money , we want only the owner who deploys the contract is able to withdraw the funds , so we need constructor so that it can run immediately as we deploy contract , so we use contract to define the owner of the contact and he'll able to take all money
    }

    // MODIFIER - will be the keyword that can be added in the function declaration to modify the that function
    modifier onlyOwner() {
        // require(msg.sender == owner, "sender is not owner");
        if (msg.sender != owner) {
            revert FundMe__NotOwner();
        }
        _;
        // so this means when we have onlyOwner at any function it will first check the require and then proceed with rest of the code in that function (this is what this _ means)
    }

    // now at the moment anyone can send the fund without calling the fund function so what happens is we'll get the fund but we'll not able to track the sender , we'll not able to update that funders array
    // we don't use function keyword for both of them
    // recieve() - if there is data in txn and no function is specified then it will go to receive otherwise to (no data)fallback
    receive() external payable {
        fund();
    }

    // fallback()
    fallback() external payable {
        fund();
    }
}
