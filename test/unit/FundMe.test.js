/*
Unit test are for testing minimal piece of code , are done locally
Unit test can be done in -
1 - local hardhat n/w
2 - forked hardhat n/w
 */
// to use console.log in solidity we need to import "hardhat/console.sol";
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      let fundMe, deployer, mockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1"); // 1 Eth
      beforeEach(async function () {
        // deploy our FundMe contract using hard-hat deploy
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        // fixture lets deploy all the files in deploy folder with the tags
        fundMe = await ethers.getContract("FundMe", deployer); //fundMe contract is connected with deployer
        // gets most recent contract deployed and connects it with deployer
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });
      describe("constructor", function () {
        it("sets the aggregator address correctly", async function () {
          const response = await fundMe.priceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });
      describe("fund", function () {
        it("fails if you don't send minimum ETH required", async function () {
          // using expect because when test fails it will revert
          await expect(fundMe.fund()).to.be.reverted;
        });
        it("Updates the amount funded data structure", async function () {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.addressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
          //   to rum only specific test use - npx hardhat test --grep "amount funded"
        });
        it("adds funder to array of funders", async function () {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.funders(0);
          assert.equal(funder, deployer);
        });
      });
      describe("withdraw", function () {
        // to withdraw we need some money in fund so we need to add before each
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue });
        });
        it("withdraw ETH from single funder", async function () {
          // this is how to write a test - arrange , act and assert
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //   Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          //   to check from where we can get gas cost we can check what txnreceipt has , so use debugger to see if there is anything related to gas - we found effective gas price and gas used to we can use them to calculate our gascost
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //   Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
          // using .add beacuse they will return big number
        });
        it("allows us to withdraw multiple funders", async function () {
          // arrange
          // funding contract by multiple accounts
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            // begining loop from 1 because the 0th one is of deployer and as it was connected to deployer account so we need to use connect , so whats happens untill now is anytime we call txns with fundme , the deployer is the account that is calling that txn , so we need to create an object to conect with all these deff. accounts
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //   Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );
          //   Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          );
          //   make sure to check that funder are reset properly
          await expect(fundMe.funders(0)).to.be.reverted;
          for (let i = 0; i < 6; i++) {
            assert.equal(
              await fundMe.addressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
        it("only allows owner to withdraw funds", async function () {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
            "FundMe__NotOwner"
          );
        });
      });
    });
