// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MemeNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // 修正: Ownable コンストラクタに msg.sender を渡し、ERC721 コンストラクタに必要な引数を渡す
    constructor() ERC721("MemeNFT", "MNFT") Ownable() {
        // 何もする必要はない
    }

    // NFTをミントする関数
    function mintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 newTokenId = _tokenIdCounter;
        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI); // トークンURIを設定
        _tokenIdCounter++;
        return newTokenId;
    }
}