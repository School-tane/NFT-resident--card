require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

const infura_url = "https://ropsten.infura.io/v3/55bd501e41924fee9ae78506959da324";
const mnemonic = process.env.MNEMONIC;  // .env ファイルからウォレット復元フレーズを取得

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*",
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, infura_url);
      },
      network_id: 3, // Ropsten のネットワーク ID
      gas: 5000000,  // ガスリミット
    },
  },
  contracts_directory: './client/src/contracts/',
  contracts_build_directory: './client/src/abis/',
  compilers: {
    solc: {
      version: "0.8.20", // 使用する Solidity バージョン
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
