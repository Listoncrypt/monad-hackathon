// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract QuestBadges {
    mapping(address => mapping(uint8 => bool)) public completed;
    event QuestCompleted(address indexed user, uint8 indexed questId, uint256 timestamp);

    function completeQuest(uint8 questId) external {
        require(!completed[msg.sender][questId], "Already completed");
        completed[msg.sender][questId] = true;
        emit QuestCompleted(msg.sender, questId, block.timestamp);
    }

    function hasCompleted(address user, uint8 questId) external view returns (bool) {
        return completed[user][questId];
    }
}
