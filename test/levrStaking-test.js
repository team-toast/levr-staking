const { expect } = require("chai");
const { ethers, web3 } = require("hardhat");

const testLevrAddress = "0xce0F718BD518E38A479fcB0187B67c2Eb57c5e1D";
const accountToImpersonate = "0x20BD917E2fc207AC80a15b034B4dBAa296065216";

let testAccount;

describe("LEVR Staking", function () {
    beforeEach(async function () {
        resetChain();

        // Get LEVR test token contract that was launched on Arbitrum
        LEVR = await hre.ethers.getContractFactory("LEVR");
        levr = await LEVR.attach(testLevrAddress);

        // Get test accounts
        [testAccount] = await ethers.getSigners();

        // Deploy Sale
        StakingRewards = await hre.ethers.getContractFactory("StakingRewards");
        stakingRewards = await StakingRewards.deploy(
            testAccount.address,
            testAccount.address,
            levr.address,
            levr.address
        );

        await stakingRewards.deployed();

        // send ether to admin account for gas
        await testAccount.sendTransaction({
            to: accountToImpersonate,
            value: ethers.utils.parseEther("1.0"),
        });
    });

    it("test 1", async function () {
        console.log("In test 1");

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [accountToImpersonate],
        });
        // admin has minting rights
        const admin = await ethers.getSigner(accountToImpersonate);
        // Use admin address to make Sale a minter of Levr token
        await levr
            .connect(admin)
            .mint(testAccount.address, "10000000000000000000000000"); //10M
        await levr
            .connect(admin)
            .mint(stakingRewards.address, "1000000000000000000000000000"); //1000M

        console.log("Total Supply: ", await stakingRewards.totalSupply());
        console.log(
            "Stake contract Levr balance: ",
            await levr.balanceOf(stakingRewards.address)
        );

        await levr.approve(
            stakingRewards.address,
            "100000000000000000000000000000"
        );

        // Stake
        console.log("Stake levr");
        await stakingRewards.stake("10000000000000000000000000");

        console.log(
            "Balance of stakingRewards after stake: ",
            await levr.balanceOf(stakingRewards.address)
        );
        console.log(
            "Earned before time jump: ",
            await stakingRewards.earned(testAccount.address)
        );

        console.log(
            "Timestamp before: ",
            await (
                await web3.eth.getBlock("latest")
            ).timestamp
        );

        await stakingRewards.notifyRewardAmount("10000000000000000000");
        // 1 day    = 86400
        // 7   days = 604800
        // 14  days = 1209600
        // 300 days = 25920000
        await network.provider.send("evm_increaseTime", [86400]); //15 days 60*60*24*15
        await network.provider.send("evm_mine");
        await network.provider.send("evm_mine");

        console.log(
            "Timestamp after: ",
            await (
                await web3.eth.getBlock("latest")
            ).timestamp
        );

        console.log(
            "Earned after time jump: ",
            await stakingRewards.earned(testAccount.address)
        );

        // Claim
        console.log(
            "Balance before claim: ",
            await levr.balanceOf(testAccount.address)
        );

        await stakingRewards.getReward();

        console.log(
            "Balance after claim: ",
            await levr.balanceOf(testAccount.address)
        );

        // 9999999999990000000 300 days 7 day rewards duration
        // 9999999999990000000 7 days
        // 9999999999990000000 14 days
        // 1428604497350000000 1 days
        // 111113683120000000  1 days, 90 day rewards duration
    });
});

async function resetChain() {
    await network.provider.request({
        method: "hardhat_reset",
        params: [
            {
                forking: {
                    jsonRpcUrl:
                        "https://arb-mainnet.g.alchemy.com/v2/3VktAs9-jOfFCrGAiD-dKd4KzggT13rf",
                    blockNumber: 3843242,
                },
            },
        ],
    });
}
