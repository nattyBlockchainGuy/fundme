// we are going to make our own pricefeed contract so we cn use it for our local testing or use it on chains which doesnot have this contract
//  will be similar to deploy-fund-me

const { network } = require("hardhat");
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  // so we need to specify for which netork this mock will run , defining our test networ in helper-config file
  if (developmentChains.includes(network.name)) {
    log("Local network detected ! deploying mock ............................");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER], //so for args you visit mock contract in node modules and see what parameters were passed in the constructor of this contract (it was  first decimals and second initial_answer so we defined it in helper-config we could also do that in this file also)
    });
    log("Mocks deployed !");
    log("--------------------------------------------------------------------");
  }
};
// addimng tags so that we can deploy only this - npx hardhat deploy --tags mocks
module.exports.tags = ["all", "mocks"];
