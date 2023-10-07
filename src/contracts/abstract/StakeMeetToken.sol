//SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

contract StakeMeetToken {
    /// State variables
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    /// State mapping
    mapping(address => uint256) public balanceOf;

    /// Constrctor
    constructor(string memory _name, string memory _symbol) {
        decimals = 18;
        name = _name;
        symbol = _symbol;
    }
}