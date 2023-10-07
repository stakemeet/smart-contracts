const { ethers } = require("hardhat");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const { expect } = chai;

const fs = require('fs');
const path = require('path');

const salt = "\\x19StakeMeet:\\n32";
const date = Date.now();

let tx, provider, signer, attendee1, attendee2, attendee3, owner, stakeMeet_contract, minStake, feePercentage;
let ethBalance_contract, ethBalance_attendee1, ethBalance_attendee2, ethBalance_attendee3;
let networkFee_attendee1, networkFee_attendee2;

describe("StakeMeet contract test", () => {
    before(async () => {
        // Get accounts
        [signer, attendee1, attendee2, attendee3, owner] = await ethers.getSigners();
        provider = ethers.provider;

        // Deploy StakeMeet contract
        const _name = "StakeMeet";
        const _symbol = "STKM";
        minStake = ethers.utils.parseEther("0.1");
        feePercentage = ethers.utils.parseEther("0.05"); // 5%
        const _owners = [signer.address];
        const contract_Path = "src/contracts/StakeMeet.sol:StakeMeet";
        const stakeMeet_factory = await ethers.getContractFactory(contract_Path, signer);
        stakeMeet_contract = await stakeMeet_factory.deploy(_name, _symbol, minStake, _owners, feePercentage);
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

            it("Check feePercentage test", async () => {
                const _feePercentageReceived = await stakeMeet_contract.feePercentage();
                expect(_feePercentageReceived).to.be.be.equals(feePercentage);
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

            it("Check StakeMeet contract balance test", async () => {
                const _contractBalance = await provider.getBalance(stakeMeet_contract.address);
                expect(_contractBalance).to.be.equal(minStake);
            });

            it("Check totalSupply contract balance test", async () => {
                const _totaSupply = await stakeMeet_contract.totalSupply();
                expect(_totaSupply).to.be.equal(minStake);
            });
        });
    });

    describe("addStake method test", async () => {
        before(async () => {
            const _meetIndex = 1;
            const _meetHash = (await stakeMeet_contract.meet(_meetIndex)).meetHash;

            const stakeMeet_contract2 = await stakeMeet_contract.connect(attendee2);
            tx = await stakeMeet_contract2.addStake(_meetIndex, _meetHash, { value: minStake });
            await tx.wait();

            const stakeMeet_contract3 = await stakeMeet_contract.connect(attendee3);
            tx = await stakeMeet_contract3.addStake(_meetIndex, _meetHash, { value: minStake });
            await tx.wait();
        });

        it("Check balanceOf test", async () => {
            const _attendee2Balance = await stakeMeet_contract.balanceOf(attendee2.address);
            const _attendee3Balance = await stakeMeet_contract.balanceOf(attendee3.address);

            expect(_attendee2Balance).to.be.equal(minStake);
            expect(_attendee3Balance).to.be.equal(minStake);
        });

        it("Check totalSupply contract balance test", async () => {
            const _totaSupply = await stakeMeet_contract.totalSupply();
            expect(_totaSupply).to.be.equal(minStake.mul(3));
        });

        it("Check sender is attendee test", async () => {
            const _meetIndex = 1;
            const _attendee2IsAttendee = await stakeMeet_contract.attendee(_meetIndex, attendee2.address);
            const _attendee3IsAttendee = await stakeMeet_contract.attendee(_meetIndex, attendee3.address);
            
            expect(_attendee2IsAttendee).to.be.be.true;
            expect(_attendee3IsAttendee).to.be.be.true;
        });

        it("Check StakeMeet contract balance test", async () => {
            const _contractBalance = await provider.getBalance(stakeMeet_contract.address);
            expect(_contractBalance).to.be.equal(minStake.mul(3));
        });
    });

    describe("closeMeet method test", async () => {
        before(async () => {
            const _meetIndex = 1;
            const _attendedEmail = ["attendee1@mail.com", "attendee2@mail.com"];
            const _nonAttendeesEmail = ["attendee3@mail.com"];            

            tx = await stakeMeet_contract.closeMeet(_meetIndex, _attendedEmail, _nonAttendeesEmail);
            await tx.wait();
        });

        it("Check balanceOf test", async () => {
            const _fee = minStake.mul(feePercentage).div(ethers.utils.parseEther("1"));
            const _amountEarned = minStake.sub(_fee).div(2);
            const _expectedBalance = minStake.add(_amountEarned); 

            const _attendee1Balance = await stakeMeet_contract.balanceOf(attendee1.address);
            const _attendee2Balance = await stakeMeet_contract.balanceOf(attendee2.address);
            const _attendee3Balance = await stakeMeet_contract.balanceOf(attendee3.address);

            expect(_attendee1Balance).to.be.equal(_expectedBalance);
            expect(_attendee2Balance).to.be.equal(_expectedBalance);
            expect(_attendee3Balance).to.be.equal(0);
        });

        it("Check withdrawAllowed test", async () => {
            const _fee = minStake.mul(feePercentage).div(ethers.utils.parseEther("1"));
            const _amountEarned = minStake.sub(_fee).div(2);
            const _expectedBalance = minStake.add(_amountEarned); 

            const _attendee1Balance = await stakeMeet_contract.withdrawAllowed(attendee1.address);
            const _attendee2Balance = await stakeMeet_contract.withdrawAllowed(attendee2.address);
            const _attendee3Balance = await stakeMeet_contract.withdrawAllowed(attendee3.address);

            expect(_attendee1Balance).to.be.equal(_expectedBalance);
            expect(_attendee2Balance).to.be.equal(_expectedBalance);
            expect(_attendee3Balance).to.be.equal(0);
        });

        it("Check totalSupply contract balance test", async () => {
            const _fee = minStake.mul(feePercentage).div(ethers.utils.parseEther("1"));
            const _totaSupply = await stakeMeet_contract.totalSupply();
            expect(_totaSupply).to.be.equal(minStake.mul(2).add(minStake.sub(_fee)));
        });
    });

    describe("redeemToken method test", async () => {
        before(async () => {
            // Check balances before operation
            ethBalance_contract = await provider.getBalance(stakeMeet_contract.address);
            ethBalance_attendee1 = await provider.getBalance(attendee1.address);
            ethBalance_attendee2 = await provider.getBalance(attendee2.address);
            ethBalance_attendee3 = await provider.getBalance(attendee3.address);

            const stakeMeet_attendee1 = await stakeMeet_contract.connect(attendee1);
            tx = await stakeMeet_attendee1.redeemToken();
            const receipts1 = await provider.waitForTransaction(tx.hash);
            networkFee_attendee1 = receipts1.gasUsed.mul(tx.gasPrice);

            const stakeMeet_attendee2 = await stakeMeet_contract.connect(attendee2);
            tx = await stakeMeet_attendee2.redeemToken();
            const receipts2 = await provider.waitForTransaction(tx.hash);
            networkFee_attendee2 = receipts2.gasUsed.mul(tx.gasPrice);
        });

        describe("Negative test", async () => {
            it("Try redeemToken without balance to withdraw test", async () => {
                const stakeMeet_attendee3 = await stakeMeet_contract.connect(attendee3);
                await expect(stakeMeet_attendee3.redeemToken()).to.be.revertedWith("NoBalanceToWithdraw");
            }); 
        });
        
        describe("Positive test", async () => {
            it("Check withdrawAllowed test", async () => {
                const withdrawAllowed_attendee1 = await stakeMeet_contract.withdrawAllowed(attendee1.address);
                const withdrawAllowed_attendee2 = await stakeMeet_contract.withdrawAllowed(attendee2.address);
    
                expect(withdrawAllowed_attendee1).to.be.equal(0);
                expect(withdrawAllowed_attendee2).to.be.equal(0);
            });

            it("Check balanceOf test", async () => {
                const balanceOf_attendee1 = await stakeMeet_contract.balanceOf(attendee1.address);
                const balanceOf_attendee2 = await stakeMeet_contract.balanceOf(attendee2.address);
    
                expect(balanceOf_attendee1).to.be.equal(0);
                expect(balanceOf_attendee2).to.be.equal(0);
            });

            it("Check ETH balance after test", async () => {
                const _fee = minStake.mul(feePercentage).div(ethers.utils.parseEther("1"));
                const ethBalance_contract_after = await provider.getBalance(stakeMeet_contract.address);
                const ethBalance_attendee1_after = await provider.getBalance(attendee1.address);
                const ethBalance_attendee2_after = await provider.getBalance(attendee2.address);
                const ethBalance_attendee3_after = await provider.getBalance(attendee3.address);

                expect(ethBalance_contract).to.be.equal(minStake.mul(3));
                expect(ethBalance_contract_after).to.be.equal(_fee);
                expect(ethBalance_attendee1_after).to.be.equal(ethBalance_attendee1.add(minStake.add(minStake.sub(_fee).div(2))).sub(networkFee_attendee1));
                expect(ethBalance_attendee2_after).to.be.equal(ethBalance_attendee2.add(minStake.add(minStake.sub(_fee).div(2))).sub(networkFee_attendee2));
                expect(ethBalance_attendee3_after).to.be.lte(ethBalance_attendee3);
            });

            it("Check totalSupply contract balance test", async () => {
                const _totaSupply = await stakeMeet_contract.totalSupply();
                expect(_totaSupply).to.be.equal(0);
            });
        });
    });
});