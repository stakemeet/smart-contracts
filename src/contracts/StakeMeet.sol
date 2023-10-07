//SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "../interfaces/IStakeMeet.sol";

/// @dev NFT interface
contract StakeMeet is IStakeMeet{

    /// constants
    string constant salt = "\x19StakeMeet:\n32";

    /// State variables

    uint256 public meetIndex;
    uint256 public userIndex;
    uint256 public decimals;
    uint256 public minStake;

    mapping(address => bool) public owner;
    mapping(address => User) public user;
    mapping(string => address) public userEmail;
    mapping(uint256 => Meet) public meet;
    mapping(uint256 => mapping(address => bool)) public attendee;
    mapping(address => uint256) public balanceOf;
    mapping(address => uint256) public withdrawAllowed;

    /// Modifiers

    modifier onlyOwner() {
        if(!owner[msg.sender]) revert NotAnOwner(msg.sender);
        _;
    }

    modifier onlyUser() {
        if(!user[msg.sender].isActive) revert NotAnUser(msg.sender);
        _;
    }

    modifier isStaking() {
        if(msg.value < minStake) revert InvalidStakeAmount(msg.sender, msg.value);
        _;
    }

    modifier onlyAuthorizedAttendee(uint256 _meetIndex, bytes32 _meetHash) {
        if(!attendee[_meetIndex][msg.sender] && meet[_meetIndex].meetHash == _meetHash) revert NotAnAuthorizedAttendee(msg.sender);
        _;
    }

    modifier hasBalanceToWithdraw() {
        if(withdrawAllowed[msg.sender] == 0) revert NoBalanceToWithdraw(msg.sender);
        _;
    }
    
    /// @notice Constructor
    constructor(uint256 _minStake, address[] memory _owner) {
        decimals = 18;
        minStake = _minStake;
        owner[msg.sender] = true;
        for (uint8 i = 0; i < _owner.length; i++) {
            address _ownerAddress = _owner[i];
            owner[_ownerAddress] = true;
        }
    }

    /// External functions

    function addOwner(address _ownerAddress) external onlyOwner {
        owner[_ownerAddress] = true;
    }

    function addUser(address _userAddress, string memory _email) external onlyOwner {
        userIndex++;
        userEmail[_email] = _userAddress;
        user[_userAddress] = User(_email, true);
    }
    
    function createMeet(uint256 _meetDate, string[] memory _attendeesEmail) external payable onlyUser() isStaking() {
        uint256 _stake = msg.value;
        Meet memory _newMeet = Meet({
            meetHash: keccak256(abi.encodePacked(salt, _stake, _meetDate, msg.sender)),
            stake: _stake,
            date: _meetDate,
            attendeesEmail: new string[](_attendeesEmail.length)
        });

        for(uint8 i = 0; i < _attendeesEmail.length; i++) {
            _newMeet.attendeesEmail[i] = _attendeesEmail[i];
        }

        meetIndex++;
        meet[meetIndex] = _newMeet;
        balanceOf[msg.sender] = _stake;
        attendee[meetIndex][msg.sender] = true;
        _loadAttendeesAddress(meetIndex, _attendeesEmail);
    }

    function getMeetAttendees(uint256 _meetIndex) external view onlyOwner() returns(string[] memory) {
        return meet[_meetIndex].attendeesEmail;
    }

    function addStake(uint256 _meetIndex, bytes32 _meetHash) external payable onlyAuthorizedAttendee(_meetIndex, _meetHash) {
        balanceOf[msg.sender] = msg.value;
        attendee[meetIndex][msg.sender] = true;
    }

    function closeMeet(uint256 _meetIndex, string[] memory _attendedEmail, string[] memory _nonAttendeesEmail) external onlyOwner() {
        Meet memory _meet = meet[_meetIndex];
        uint256 _stake = _meet.stake;
        uint256 _attendeesNumber = _attendedEmail.length;
        uint256 _nonAttendeesNumber = _nonAttendeesEmail.length;
        uint256 _amountToDivide = _stake * _nonAttendeesNumber;
        uint256 _amountEarned = _amountToDivide / _attendeesNumber;
        
        for(uint256 i = 0; i < _attendedEmail.length; i ++) {
            address _attendeeAddress = _getAddress(_nonAttendeesEmail[i]);
            balanceOf[_attendeeAddress] += _amountEarned;
            withdrawAllowed[_attendeeAddress] += _amountEarned;
        }

        for(uint256 i = 0; i < _nonAttendeesEmail.length; i ++) {
            address _attendeeAddress = _getAddress(_nonAttendeesEmail[i]);
            balanceOf[_attendeeAddress] -= _amountEarned;
        }
    }

    function redeemToken() external hasBalanceToWithdraw() {
        uint256 _amountToWithdraw = withdrawAllowed[msg.sender];
        delete withdrawAllowed[msg.sender];
        balanceOf[msg.sender] -= _amountToWithdraw;
        payable(msg.sender).transfer(_amountToWithdraw);
    }

    /// Internal functions

    function _loadAttendeesAddress(uint256 _meetIndex, string[] memory _email) internal {
        for(uint256 i = 0; i < _email.length; i ++) {
            address _attendeeAddress = userEmail[_email[i]];
            attendee[_meetIndex][_attendeeAddress] = true;
        }
    }

    function _getAddress(string memory _email) internal view returns(address) {
        return userEmail[_email];
    }
}