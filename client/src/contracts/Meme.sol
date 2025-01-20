// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Meme {
    // アドレスごとに複数のmemeHashを管理
    mapping(address => string[]) private memeHashes;

    // 全体のmemeHashを管理
    string[] private allMemeHashes;

    // memeHashを設定する関数
    function set(string memory _memeHash) public {
        // アドレスごとの配列に追加
        memeHashes[msg.sender].push(_memeHash);

        // 全体の配列にも追加
        allMemeHashes.push(_memeHash);
    }

    // 自分のmemeHashを全て取得する関数
    function getAllByAddress() public view returns (string[] memory) {
        return memeHashes[msg.sender];
    }

    // 全てのmemeHashを取得する関数
    function getAll() public view returns (string[] memory) {
        return allMemeHashes;
    }
}