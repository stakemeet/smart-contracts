const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {

    console.log("---------------------------------------------------------------------------------------");
    console.log("-- Is owner? process start...");
    console.log("---------------------------------------------------------------------------------------");

    // Get accounts
    [signer] = await ethers.getSigners();

    // Instantiate StakeMeet contract
    const contractAddress = process.env.STAKEMEET_CONTRACT_ADDRESS;
    const contract_Path = "artifacts/src/contracts/StakeMeet.sol/StakeMeet.json";
    const stakeMeet_Artifact = JSON.parse(fs.readFileSync(contract_Path, 'utf8'));
    const stakeMeet_contract = await ethers.getContractAt(stakeMeet_Artifact.abi, contractAddress,signer);
    
    // Check owner
    const _OwnerAddress = "0x53Eb6187D1496eC4bBA5a11fd43Af0F832bD555D";
    const isOwner = await stakeMeet_contract.owner(_OwnerAddress);
    console.log();

    if(isOwner) {
        console.log("---------------------------------------------------------------------------------------");
        console.log("--", _OwnerAddress, "is owner");
        console.log("---------------------------------------------------------------------------------------");
    }
    else {
        console.log("---------------------------------------------------------------------------------------");
        console.log("--", _OwnerAddress, "is not owner");
        console.log("---------------------------------------------------------------------------------------");
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });