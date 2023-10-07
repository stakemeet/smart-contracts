const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {

    console.log("---------------------------------------------------------------------------------------");
    console.log("-- Add owner process start...");
    console.log("---------------------------------------------------------------------------------------");

    // Get accounts
    [signer] = await ethers.getSigners();

    // Instantiate StakeMeet contract
    const contractAddress = process.env.STAKEMEET_CONTRACT_ADDRESS;
    const contract_Path = "artifacts/src/contracts/StakeMeet.sol/StakeMeet.json";
    const stakeMeet_Artifact = JSON.parse(fs.readFileSync(contract_Path, 'utf8'));
    stakeMeet_contract = await ethers.getContractAt(stakeMeet_Artifact.abi, contractAddress,signer);

    // Add owner
    const newOwnerAddress = "0x53Eb6187D1496eC4bBA5a11fd43Af0F832bD555D";
    const tx = await stakeMeet_contract.addOwner(newOwnerAddress);
    await tx.wait();

    // Check owner
    const isOwner = await stakeMeet_contract.owner(newOwnerAddress);
    console.log();

    if(isOwner) {
        console.log("---------------------------------------------------------------------------------------");
        console.log("-- Owner has been successfully added");
        console.log("---------------------------------------------------------------------------------------");
    }
    else {
        console.log("---------------------------------------------------------------------------------------");
        console.log("-- Owner has not been added");
        console.log("---------------------------------------------------------------------------------------");
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });