const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {

    console.log("---------------------------------------------------------------------------------------");
    console.log("-- Add user process start...");
    console.log("---------------------------------------------------------------------------------------");

    // Get accounts
    [signer] = await ethers.getSigners();

    // Instantiate StakeMeet contract
    const contractAddress = process.env.STAKEMEET_CONTRACT_ADDRESS;
    const contract_Path = "artifacts/src/contracts/StakeMeet.sol/StakeMeet.json";
    const stakeMeet_Artifact = JSON.parse(fs.readFileSync(contract_Path, 'utf8'));
    const stakeMeet_contract = await ethers.getContractAt(stakeMeet_Artifact.abi, contractAddress,signer);

    // Add User
    const newUserAddress = signer.address;
    const newUserEmail = "signer@email.com";
    let tx = await stakeMeet_contract.addUser(newUserAddress, newUserEmail);
    await tx.wait();

    // Check user
    const user = await stakeMeet_contract.user(newUserAddress);
    console.log();

    if(user.isActive) {
        console.log("---------------------------------------------------------------------------------------");
        console.log("-- User has been successfully added");
        console.log("---------------------------------------------------------------------------------------");
    }
    else {
        console.log("---------------------------------------------------------------------------------------");
        console.log("-- user has not been added");
        console.log("---------------------------------------------------------------------------------------");
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });