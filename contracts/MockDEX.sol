// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract MockDEX {
    IERC20 public token;

    constructor(address _token) {
        token = IERC20(_token);
    }

    function pullTokens(uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }

    function swapMonForToken() external payable {
        require(msg.value > 0, "Must send MON");
        uint256 tokenAmount = msg.value; // 1:1 price
        require(token.transfer(msg.sender, tokenAmount), "Token transfer failed");
    }
}
