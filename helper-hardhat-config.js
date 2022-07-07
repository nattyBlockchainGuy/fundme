// here we are going to define network config , like hey is chainId is this use this address

const networkConfig = {
  4: {
    name: "rinkeby",
    ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  },
  137: {
    name: "polygon",
    ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
  },
  //   what about hardhat n/w ?
};
const developmentChains = ["hardhat", "localhost"]; //these are network name , used in condition to deploy mock
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
};
