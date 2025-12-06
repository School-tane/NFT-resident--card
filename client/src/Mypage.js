import React, { useState, useEffect } from "react";
import Web3 from "web3";
import CountryNFT from "./abis/CountryNFT.json";
import "./Mypage.css";

function Mypage() {
    const [account, setAccount] = useState("");
    const [nftContract, setNftContract] = useState(null);
    const [myNFTs, setMyNFTs] = useState([]);

    useEffect(() => {
        const init = async () => {
            await loadWeb3();
            await loadBlockchainData();
        };
        init();

        if (window.ethereum) {
            window.ethereum.on("accountsChanged", function (accounts) {
                setAccount(accounts[0]);
                window.location.reload();
            });
        }
    }, []);

    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            try {
                await window.ethereum.request({ method: "eth_requestAccounts" });
            } catch (error) {
                console.error("User denied account access");
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    const loadBlockchainData = async () => {
        const web3 = window.web3;
        if (!web3) return;

        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        // Government.jsと同じコントラクトアドレスを使用
        const contractAddress = "0x522307093BA5A31c5EBfeE26Fa4d6fA52546Ccdb";

        try {
            const contract = new web3.eth.Contract(CountryNFT.abi, contractAddress);
            setNftContract(contract);
            await fetchMyNFTs(contract, accounts[0]);
        } catch (error) {
            console.error("Smart contract not found or error loading", error);
        }
    };

    const fetchMyNFTs = async (contract, currentAccount) => {
        if (!contract || !currentAccount) return;

        try {
            // 自分のアドレスへのTransferイベントを取得
            const events = await contract.getPastEvents("Transfer", {
                filter: { to: currentAccount },
                fromBlock: 0,
                toBlock: "latest",
            });

            const tokenIds = new Set();
            events.forEach((event) => {
                const tokenId = event.returnValues.tokenId;
                // tokenIdがBigIntやStringで返ってくる可能性があるため、統一的に扱う
                tokenIds.add(tokenId.toString());
            });

            const nftList = [];
            for (let id of tokenIds) {
                // 現在の所有者が自分か確認
                try {
                    const owner = await contract.methods.ownerOf(id).call();
                    if (owner.toLowerCase() === currentAccount.toLowerCase()) {
                        const tokenURI = await contract.methods.tokenURI(id).call();

                        // メタデータ取得
                        try {
                            // IPFSゲートウェイなどの調整が必要な場合はここで行う
                            const response = await fetch(tokenURI);
                            if (!response.ok) throw new Error("Metadata fetch failed");
                            const metadata = await response.json();

                            nftList.push({
                                tokenId: id,
                                ...metadata
                            });
                        } catch (e) {
                            console.error(`Error fetching metadata for token ${id}`, e);
                            nftList.push({ tokenId: id, name: "Unknown Artifact", image: null });
                        }
                    }
                } catch (e) {
                    console.error(`Error checking owner for token ${id}`, e);
                }
            }
            setMyNFTs(nftList);
        } catch (err) {
            console.error("Fetch NFTs error:", err);
        }
    };

    return (
        <div className="mypage-container">
            <header className="mypage-header">
                <h1>マイページ</h1>
                <p className="account-info">Wallet: {account}</p>
            </header>

            <section className="nft-section">
                <h2>保有するデジタル住民票</h2>
                <div className="nft-grid">
                    {myNFTs.length === 0 ? (
                        <p>デジタル住民票を持っていません。</p>
                    ) : (
                        myNFTs.map((nft) => (
                            <div key={nft.tokenId} className="nft-card">
                                <div className="nft-image-container">
                                    {nft.image ? (
                                        <img src={nft.image} alt={nft.name} className="nft-image" />
                                    ) : (
                                        <div className="no-image">No Image</div>
                                    )}
                                </div>
                                <div className="nft-info">
                                    <h3>{nft.name}</h3>
                                    <p className="nft-id">ID: {nft.tokenId}</p>
                                    {nft.description && <p className="nft-desc">{nft.description}</p>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}

export default Mypage;
