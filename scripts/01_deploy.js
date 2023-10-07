const { ethers } = require("hardhat");

async function main() {

    console.log("---------------------------------------------------------------------------------------");
    console.log("-- Deploy contracts process start...");
    console.log("---------------------------------------------------------------------------------------");

    // Get accounts
    [signer] = await ethers.getSigners();

    // Deploy StakeMeet contract
    const _name = "StakeMeet";
    const _symbol = "STKM";
    const _minStake = ethers.utils.parseEther("0.00001");
    const _feePercentage = ethers.utils.parseEther("0.05"); // 5%
    const _owners = ["0x53Eb6187D1496eC4bBA5a11fd43Af0F832bD555D"];
    
    const contract_Path = "src/contracts/StakeMeet.sol:StakeMeet";
    const stakeMeet_factory = await ethers.getContractFactory(contract_Path, signer);
    stakeMeet_contract = await stakeMeet_factory.deploy(_name, _symbol, _minStake, _owners, _feePercentage);
    
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