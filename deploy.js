const fs = require("fs");
const solc = require("solc");
const { ethers } = require("ethers");

async function main() {
    const rpc = "http://127.0.0.1:8545";
    const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
    const wallet = new ethers.Wallet("0xeaf0c1dd53875022a8380a1d7743ecc842c57c79a2f03b36828d322109bc6389", provider); // ローカル用鍵

    const abi = JSON.parse(fs.readFileSync("client/src/contracts/build/CountryNFT_sol_CountryNFT.abi", "utf8"));
    const bin = fs.readFileSync("client/src/contracts/build/CountryNFT_sol_CountryNFT.bin", "utf8");

    const factory = new ethers.ContractFactory(abi, bin, wallet);
    const contract = await factory.deploy();
    console.log("Deployed:", await contract.getAddress());
}

main();