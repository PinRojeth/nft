import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";
import *as dotenv from 'dotenv';
dotenv.config();



module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "goerli",
  networks: {
    goerli: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey:"BFJ7KDYTECV5NQDRSPWKKRXMXIVVZ8IPEP"
  },
};
