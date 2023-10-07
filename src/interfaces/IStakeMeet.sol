//SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

interface IStakeMeet {

    /// @notice Structs
    
    struct Meet {
        bytes32 meetHash;
        uint256 stake;
        uint256 date;
        string[] attendeesEmail;
    }

    struct User {
        string email;
        bool isActive;
    }

    /// @notice External functions

    function addOwner(address _ownerAddress) external;
    function addUser(address _userAddress, string memory _email) external;
    function createMeet(uint256 _meetDate, string[] memory _attendeesEmail) external payable;
    function addStake(uint256 _meetIndex, bytes32 _meetHash) external payable;
    function closeMeet(uint256 _meetIndex, string[] memory _attendedEmail, string[] memory _nonAttendeesEmail) external;
    function redeemToken() external;

    /// @notice Events

    event NewMeet(uint256 );
    
    /// @notice Errors

    error NotAnOwner(address _caller);
    error NotAnUser(address _caller);
    error InvalidStakeAmount(address _caller, uint256 _stakeAmount);
    error NotAnAuthorizedAttendee(address _caller);
    error NoBalanceToWithdraw(address _caller);
}