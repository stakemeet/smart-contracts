const { ethers } = require("hardhat");

async function main() {

    console.log("---------------------------------------------------------------------------------------");
    console.log("-- Deploy contracts process start...");
    console.log("---------------------------------------------------------------------------------------");

    // Get accounts
    [signer] = await ethers.getSigners();

    // Deploy StakeMeet contract
    minStake = ethers.utils.parseEther("0.00001");
    const _owners = [];
    const contract_Path = "src/contracts/StakeMeet.sol:StakeMeet";
    const stakeMeet_factory = await ethers.getContractFactory(contract_Path, signer);
    stakeMeet_contract = await stakeMeet_factory.deploy(minStake, _owners);
    
    console.log("---------------------------------------------------------------------------------------");
    console.log("-- Contracts have been successfully deployed");
    console.log("---------------------------------------------------------------------------------------");
    console.log("-- Address:", stakeMeet_contract.address);
    console.log("---------------------------------------------------------------------------------------");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });