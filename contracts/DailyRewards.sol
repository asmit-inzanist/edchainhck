// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
//adress 0xd652eDaB0d06B8d45db78743b46c078b53da6070
contract DailyReward {
    address public owner;
    mapping(address => uint256) public lastClaimed;
    mapping(address => uint256) public streak;
    mapping(address => uint256) public rewardBalance;

    event RewardClaimed(address indexed user, uint256 amount, uint256 streak);

    constructor() {
        owner = msg.sender;
    }

    function getRewardAmount(uint256 _streak) public pure returns (uint256) {
        if (_streak >= 31) return 200;
        if (_streak >= 15) return 100;
        if (_streak >= 7) return 50;
        if (_streak >= 4) return 20;
        if (_streak >= 1) return 10;
        return 0;
    }

    function claimReward() public {
        require(block.timestamp >= lastClaimed[msg.sender] + 1 days, "Claim once per day!");

        if (lastClaimed[msg.sender] == 0 || block.timestamp >= lastClaimed[msg.sender] + 2 days) {
            streak[msg.sender] = 1; // Reset streak if missed a day
        } else {
            streak[msg.sender] += 1; // Increase streak if claimed daily
        }

        uint256 reward = getRewardAmount(streak[msg.sender]);
        rewardBalance[msg.sender] += reward;
        lastClaimed[msg.sender] = block.timestamp;

        emit RewardClaimed(msg.sender, reward, streak[msg.sender]);
    }

    function getStreak() public view returns (uint256) {
        return streak[msg.sender];
    }

    function getRewardBalance() public view returns (uint256) {
        return rewardBalance[msg.sender];
    }
}
