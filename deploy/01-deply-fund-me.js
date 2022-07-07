// when we use npx hardhad deploy everyfile in this deploy folder will be deployed so its is better to number them , so that they will be deployed in that order only
//hre- hardhat runtime enviroment
//we are exporting this as a default func so that hardhat-deploy can look for it to deploy it , can also be written as :

const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
/*
 async deploy func(hre){
    consol.log("hi");
 }
 module.exports.default = deployfunc;
 */

module.exports = async ({ getNamedAccounts, deployments }) => {
  //   const { getNamedAccounts, deployments } = hre; or you can pulll them out directly where hre is placed
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  //   for passing the pricefeed Address in args we need something like this -
  // if chainId is X use address Y , so it can chain acc to chains , so we'll use helper-hardhat-config.js file to do this (Aave uses this)
  //   const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  // it was constant so making it work for local we need to change ethUsdPriceFeedAddress depending upon whether we are on local or not so doing this -
  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    // so by usinh hardhat deploy we can get the most recent deplyment by using get , so extracting it from deployments above
    const ethUsdAggregator = await get("MockV3Aggregator"); //name of mock
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  //   this is good if we are using this on testnet but what if we test in local /chin which doesn't even have pricefeed on it , here we need mock contract so the idea of mock is if contract is not there we deploy the minimal version to carry our local testing , so mocks are technically a deploy script

  //   well what happens when we change chains as we have many evm based chains , so do we need to change the pricefeed everytime ? we need to modularize the pricefeed so that it works for every chain - so defining pricefeed in fundme contract
  //   when going for localhost or hardhat network we need to create mocks - we'll make fake pricefeed contract which we can use and control while working locally

  const FundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress], //list of parameter passed in constructr , so here we are using pricefeed address. Used the name of contract (FundMe)
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  if (!developmentChains.includes(network.name)) {
    // verify contract
    verify(FundMe.address, ethUsdPriceFeedAddress);
  }
  log("-----------------------------------------------");
};
module.exports.tags = ["all", "fundme"];

// one of the amazing thing about hardhat deploy is when we run our local blockhain , owr own blockchain node , delpy will automatically run through alll of our deploy scripts and add them to our node
