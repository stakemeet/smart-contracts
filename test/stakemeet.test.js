const { ethers } = require("hardhat");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const { expect } = chai;

const fs = require('fs');
const path = require('path');

const salt = "\\x19StakeMeet:\\n32";
const date = Date.now();

let tx, provider, signer, attendee1, attendee2, attendee3, owner, stakeMeet_contract, minStake;

describe("StakeMeet contract test", () => {
    before(async () => {
        // Get accounts
        [signer, attendee1, attendee2, attendee3, owner] = await ethers.getSigners();
        provider = ethers.provider;

        // Deploy StakeMeet contract
        minStake = ethers.utils.parseEther("0.1");
        const _owners = [signer.address];
        const contract_Path = "src/contracts/StakeMeet.sol:StakeMeet";
        const stakeMeet_factory = await ethers.getContractFactory(contract_Path, signer);
        stakeMeet_contract = await stakeMeet_factory.deploy(minStake, _owners);
    });
    
    describe("Deploy contract test", async () => {
        describe("Positive test", async () => {
            it("Check owners test", async () => {
                const _signerIsOwner = await stakeMeet_contract.owner(signer.address);
                expect(_signerIsOwner).to.be.be.true;
            });

            it("Check minStake test", async () => {
                const _minStakeReceived = await stakeMeet_contract.minStake();
                expect(_minStakeReceived).to.be.be.equals(minStake);
            });
        });
    });

    describe("addOwner method test", async () => {
        describe("Positive test", async () => {
            it("Check owners test", async () => {
                const _ownerAddress = owner.address;
                tx = await stakeMeet_contract.addOwner(_ownerAddress);
                await tx.wait();

                const _isOwner = await stakeMeet_contract.owner(_ownerAddress);
                expect(_isOwner).to.be.true;
            });
        });
    });

    describe("addUser method test", async () => {
        describe("Positive test", async () => {
            it("Check user test", async () => {
                const _userAddress = attendee1.address;
                const _userEmail = "attendee1@mail.com";
                tx = await stakeMeet_contract.addUser(_userAddress, _userEmail);
                await tx.wait();

                const _user = await stakeMeet_contract.user(_userAddress);
                expect(_user.email).to.be.equal(_userEmail);
            });
        });
    });

    describe("createMeet method test", async () => {
        before(async () => {
            let _userAddress = attendee2.address;
            let _userEmail = "attendee2@mail.com";
            tx = await stakeMeet_contract.addUser(_userAddress, _userEmail);
            await tx.wait();

            _userAddress = attendee3.address;
            _userEmail = "attendee3@mail.com";
            tx = await stakeMeet_contract.addUser(_userAddress, _userEmail);
            await tx.wait();
        });

        describe("Positive test", async () => {
            before(async () => {
                const _addHours = 3600 * 2;
                const _meetDate = date + _addHours;
                const _attendeesEmail = ["attendee1@mail.com", "attendee2@mail.com", "attendee3@mail.com"];

                const stakeMeet_contract2 = await stakeMeet_contract.connect(attendee1);
                tx = await stakeMeet_contract2.createMeet(_meetDate, _attendeesEmail, { value: minStake });
                await tx.wait();
            });

            it("Check meet index test", async () => {
                const _meetIndex = await stakeMeet_contract.meetIndex();
                expect(_meetIndex).to.be.equal(1);
            });

            it("Check meet metadata test", async () => {
                const _meetIndex = 1;
                const _addHours = 3600 * 2;
                const _meetDate = date + _addHours;
                //const _meetHash = ethers.utils.keccak256(
                //    ethers.utils.defaultAbiCoder.encode(["string", "uint256", "uint256", "address"], [bytes(salt), minStake, _meetDate, attendee1.address]));

                const _meet = await stakeMeet_contract.meet(_meetIndex);
                //expect(_meet.meetHash).to.be.equal(_meetHash);
                expect(_meet.stake).to.be.equal(minStake);
                expect(_meet.date).to.be.equal(_meetDate);
            });

            it("Check meet attendees test", async () => {
                const _meetIndex = 1;
                const _attendeesEmail = ["attendee1@mail.com", "attendee2@mail.com", "attendee3@mail.com"];

                const _attendees = await stakeMeet_contract.getMeetAttendees(_meetIndex);
                expect(_attendees[0]).to.be.equal(_attendeesEmail[0]);
                expect(_attendees[1]).to.be.equal(_attendeesEmail[1]);
                expect(_attendees[2]).to.be.equal(_attendeesEmail[2]);
            });

            it("Check balanceOf test", async () => {
                const _attendee1Balance = await stakeMeet_contract.balanceOf(attendee1.address);
                expect(_attendee1Balance).to.be.equal(minStake);
            });

            it("Check sender is attendee test", async () => {
                const _meetIndex = 1;
                const _attendee1IsAttendee = await stakeMeet_contract.attendee(_meetIndex, attendee1.address);
                expect(_attendee1IsAttendee).to.be.be.true;
            });

            it("Check attendee list mapping test", async () => {
                const _meetIndex = 1;
                const _attendee2IsAttendee = await stakeMeet_contract.attendee(_meetIndex, attendee2.address);
                const _attendee3IsAttendee = await stakeMeet_contract.attendee(_meetIndex, attendee3.address);
                expect(_attendee2IsAttendee).to.be.be.true;
                expect(_attendee3IsAttendee).to.be.be.true;
            });
        });
    });
});