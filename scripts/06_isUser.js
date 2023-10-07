const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {

    console.log("---------------------------------------------------------------------------------------");
    console.log("-- Is User? process start...");
    console.log("---------------------------------------------------------------------------------------");

    // Get accounts
    [signer] = await ethers.getSigners();

    // Instantiate StakeMeet contract
    const contractAddress = process.env.STAKEMEET_CONTRACT_ADDRESS;
    const contract_Path = "artifacts/src/contracts/StakeMeet.sol/StakeMeet.json";
    const stakeMeet_Artifact = JSON.parse(fs.readFileSync(contract_Path, 'utf8'));
    const stakeMeet_contract = await ethers.getContractAt(stakeMeet_Artifact.abi, contractAddress,signer);
    
    // Check user
    const _userAddress = signer.address;
    const user = await stakeMeet_contract.user(_userAddress);
    console.log();

    const balance = await stakeMeet_contract.balanceOf(_userAddress);
    console.log(balance);

    if(user.isActive) {
        console.log("---------------------------------------------------------------------------------------");
        console.log("--", _userAddress, "is user");
        console.log("---------------------------------------------------------------------------------------");
    }
    else {
        console.log("---------------------------------------------------------------------------------------");
        console.log("--", _userAddress, "is not user");
        console.log("---------------------------------------------------------------------------------------");
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });