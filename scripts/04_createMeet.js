const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {

    console.log("---------------------------------------------------------------------------------------");
    console.log("-- Create Meet process start...");
    console.log("---------------------------------------------------------------------------------------");

    // Get accounts
    [signer] = await ethers.getSigners();

    // Instantiate StakeMeet contract
    const contractAddress = process.env.STAKEMEET_CONTRACT_ADDRESS;
    const contract_Path = "artifacts/src/contracts/StakeMeet.sol/StakeMeet.json";
    const stakeMeet_Artifact = JSON.parse(fs.readFileSync(contract_Path, 'utf8'));
    const stakeMeet_contract = await ethers.getContractAt(stakeMeet_Artifact.abi, contractAddress,signer);

    // Create meet
    const date = Date.now();
    const _addHours = 3600 * 2;
    const _meetDate = date + _addHours;
    const _attendeesEmail = ["vicebeatwav@gmail.com"];
    const _minStake = ethers.utils.parseEther("0.00001");

    tx = await stakeMeet_contract.createMeet(_meetDate, _attendeesEmail, { value: _minStake });
    await tx.wait();

    // Check meet index
    const _meetIndex = await stakeMeet_contract.meetIndex();

    if(_meetIndex > 0) {
        console.log("---------------------------------------------------------------------------------------");
        console.log("-- Meet has been successfully created");
        console.log("---------------------------------------------------------------------------------------");
    }
    else {
        console.log("---------------------------------------------------------------------------------------");
        console.log("-- Meet has not been created");
        console.log("---------------------------------------------------------------------------------------");
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });