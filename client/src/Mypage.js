import "./App.css";
import { useState, useEffect } from "react";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { Buffer } from "buffer";
import Web3 from "web3";
import Meme from "./abis/Meme.json";
import MemeNFT from "./abis/MemeNFT.json"; // NFTコントラクトのABIをインポート
import React from "react";

const projectId = "2X7EVxMkvakuKsp4tXQHQmihJa8";
const projectSecret = "f72b425c3cf76393e04dd0683b84b63b";
const authorization = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

function App() {
  const [account, setAccount] = useState("");
  const [buffer, setBuffer] = useState(null);
  const [contract, setContract] = useState(null);
  const [memeHashes, setMemeHashes] = useState([]);
  const [nftContract, setNftContract] = useState(null); // NFTコントラクト
  const [recipientAddress, setRecipientAddress] = useState(""); // 譲渡先アドレス
  const [tokenId, setTokenId] = useState(null); // NFTのトークンID

  const ipfs = ipfsHttpClient({
    url: "https://ipfs.infura.io:5001/api/v0",
    headers: {
      authorization,
    },
  });

  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
  }, []);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert("Please use Metamask!");
    }
  };

  const loadBlockchainData = async () => {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);

    const networkId = await web3.eth.net.getId();
    const memeData = Meme.networks[networkId];
    if (memeData) {
      const memeContract = new web3.eth.Contract(Meme.abi, memeData.address);
      setContract(memeContract);

      const hashCount = await memeContract.methods.getHashCount().call();
      const hashes = [];
      for (let i = 0; i < hashCount; i++) {
        const memeHash = await memeContract.methods.getHash(i).call();
        hashes.push(memeHash);
      }
      setMemeHashes(hashes);
    } else {
      window.alert("Meme contract not deployed to detected network!");
    }

    const nftData = MemeNFT.networks[networkId];
    if (nftData) {
      const nftContractInstance = new web3.eth.Contract(MemeNFT.abi, nftData.address);
      setNftContract(nftContractInstance);
    } else {
      window.alert("NFT contract not deployed to detected network!");
    }
  };

  const captureFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setBuffer(Buffer(reader.result));
    };
  };

  const onSubmit = (event) => {
    event.preventDefault();
    ipfs
      .add(buffer)
      .then((result) => {
        const memeHash = result.path;
        setMemeHashes([...memeHashes, memeHash]);
        contract.methods.set(memeHash).send({ from: account }).then(() => {
          console.log("Meme added to blockchain:", memeHash);
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const mintNFT = async (hash) => {
    if (!nftContract) return;
    const tokenURI = `https://ipfs.infura.io/ipfs/${hash}`;
    try {
      const result = await nftContract.methods.mintNFT(account, tokenURI).send({ from: account });
      const tokenId = result.events.Transfer.returnValues.tokenId;
      setTokenId(tokenId); // ミントされたトークンIDを保存
      console.log("NFT minted with URI:", tokenURI, "Token ID:", tokenId);
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  };

  const transferNFT = async () => {
    if (!nftContract || !recipientAddress || tokenId === null) return;
    try {
      await nftContract.methods
        .transferFrom(account, recipientAddress, tokenId)
        .send({ from: account });
      console.log(`NFT with Token ID ${tokenId} transferred to ${recipientAddress}`);
    } catch (error) {
      console.error("Error transferring NFT:", error);
    }
  };

  return (
    <div>
      <h1>Decentralized Meme Storage with NFTs</h1>
      <p>Account: {account}</p>
      <form className="button" onSubmit={onSubmit}>
        <input type="file" onChange={captureFile} />
        <input type="submit" />
      </form>
      <div className="images">
        {memeHashes.map((hash, index) => (
          <div key={index} style={{ marginBottom: "20px" }}>
            <a
              href={`https://ipfs.infura.io/ipfs/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={`https://ipfs.infura.io/ipfs/${hash}`}
                alt={`Meme ${index}`}
                style={{ width: "200px", margin: "10px" }}
              />
            </a>
            <button onClick={() => mintNFT(hash)}>Mint as NFT</button>
          </div>
        ))}
      </div>
      <div>
        <h2>Transfer NFT</h2>
        <input
          type="text"
          placeholder="Recipient address"
          onChange={(e) => setRecipientAddress(e.target.value)}
        />
        <button onClick={transferNFT}>Transfer</button>
      </div>
    </div>
  );
}

export default App;