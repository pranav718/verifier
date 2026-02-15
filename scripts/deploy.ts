import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "MATIC");

    const WorkVerification = await ethers.getContractFactory("WorkVerification");
    const contract = await WorkVerification.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("WorkVerification deployed to:", address);
    console.log("\nAdd this to your .env file:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
