const { expect, assert } = require("chai");
const { BigNumber } = require("ethers");
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

    it("single investor should get all rewards", async function () {
        const rewardsLevr = "1000000000000000000000000000";
        const testAccountLevr = "10000000000000000000000000";
        const rewardAmount = "100000000000000000000";
        const stakeAmount = "10000000000000000000000000";

        day = 86400;

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [accountToImpersonate],
        });
        // admin has minting rights
        const admin = await ethers.getSigner(accountToImpersonate);
        // Mint to test account
        await levr.connect(admin).mint(testAccount.address, testAccountLevr); //10M
        // Mint to stakingRewards contract
        await levr.connect(admin).mint(stakingRewards.address, rewardsLevr); //1000M

        await levr.approve(stakingRewards.address, stakeAmount);

        // Stake
        await stakingRewards.stake(stakeAmount, 30);

        // console.log(
        //     "Timestamp before: ",
        //     await (
        //         await web3.eth.getBlock("latest")
        //     ).timestamp
        // );

        await stakingRewards.notifyRewardAmount(rewardAmount);

        // 9999999999990000000
        // 99999999999990000000

        // 1 day    = 86400
        // 7   days = 604800
        // 14  days = 1209600
        // 30  days = 2592000
        // 90  days = 7776000
        // 300 days = 25920000
        await network.provider.send("evm_increaseTime", [7776000]); // 60*60*24*days
        await network.provider.send("evm_mine");

        // console.log(
        //     "Timestamp after: ",
        //     await (
        //         await web3.eth.getBlock("latest")
        //     ).timestamp
        // );

        // console.log(
        //     "Earned after time jump: ",
        //     await stakingRewards.earned(testAccount.address)
        // );

        // console.log(
        //     "Balance before claim: ",
        //     await levr.balanceOf(testAccount.address)
        // );

        //await stakingRewards.exit(testAccount.address);
        // Claim Rewards
        await stakingRewards.getReward(testAccount.address);

        let testAccountRewardBalance = await levr.balanceOf(
            testAccount.address
        );
        // console.log("Balance after claim: ", testAccountRewardBalance);

        let rewardRate = calcRewardRate(rewardAmount, 90 * day);
        let rewardPT = calcRewardPerToken(rewardRate, stakeAmount, 90 * day);

        let calculatedRewardBalance = calcReward(rewardPT, stakeAmount);
        // console.log(rewardPT);
        // console.log("Calculated Earned: ", calculatedRewardBalance);

        expect(calculatedRewardBalance.toString()).to.equal(
            testAccountRewardBalance.toString()
        );
    });

    it("should not be able to set reward bigger than reward balance", async function () {
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [accountToImpersonate],
        });
        // admin has minting rights
        const admin = await ethers.getSigner(accountToImpersonate);
        // Mint to test account
        await levr
            .connect(admin)
            .mint(testAccount.address, "10000000000000000000000000"); //10M
        // Mint to stakingRewards contract
        await levr
            .connect(admin)
            .mint(stakingRewards.address, "90000000000000000000"); // Not enough tokens for rewards

        await levr.approve(
            stakingRewards.address,
            "100000000000000000000000000000000"
        );

        // Stake
        await stakingRewards.stake("10000000000000000000000000", 90);

        await expect(
            stakingRewards.notifyRewardAmount("100000000000000000000")
        ).to.be.revertedWith(
            "reverted with reason string 'Provided reward too high'"
        );
    });

    it("should not be able to exit before lockup period is over", async function () {
        const rewardsLevr = "1000000000000000000000000000";
        const testAccountLevr = "10000000000000000000000000";
        const rewardAmount = "100000000000000000000";
        const stakeAmount = "10000000000000000000000000";

        day = 86400;

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [accountToImpersonate],
        });
        // admin has minting rights
        const admin = await ethers.getSigner(accountToImpersonate);
        // Mint to test account
        await levr.connect(admin).mint(testAccount.address, testAccountLevr); //10M
        // Mint to stakingRewards contract
        await levr.connect(admin).mint(stakingRewards.address, rewardsLevr); //1000M

        await levr.approve(stakingRewards.address, stakeAmount);

        // Stake
        await stakingRewards.stake(stakeAmount, 30);

        let testAccountBalance = await levr
            .balanceOf(testAccount.address)
            .toString();

        await stakingRewards.notifyRewardAmount(rewardAmount);

        await network.provider.send("evm_increaseTime", [1 * day]); // 60*60*24*days
        await network.provider.send("evm_mine");

        await expect(
            stakingRewards.exit(testAccount.address)
        ).to.be.revertedWith(
            "reverted with reason string 'staking period has not yet expired'"
        );
        testAccountBalance = BigNumber.from(
            await levr.balanceOf(testAccount.address)
        );
        expect(testAccountBalance.toString()).equal("0");

        await network.provider.send("evm_increaseTime", [1 * day]); // 60*60*24*days
        await network.provider.send("evm_mine");

        await expect(
            stakingRewards.exit(testAccount.address)
        ).to.be.revertedWith(
            "reverted with reason string 'staking period has not yet expired'"
        );
        testAccountBalance = BigNumber.from(
            await levr.balanceOf(testAccount.address)
        );
        expect(testAccountBalance.toString()).equal("0");

        await network.provider.send("evm_increaseTime", [10 * day]); // 60*60*24*days
        await network.provider.send("evm_mine");

        await expect(
            stakingRewards.exit(testAccount.address)
        ).to.be.revertedWith(
            "reverted with reason string 'staking period has not yet expired'"
        );
        testAccountBalance = BigNumber.from(
            await levr.balanceOf(testAccount.address)
        );
        expect(testAccountBalance.toString()).equal("0");

        await network.provider.send("evm_increaseTime", [10 * day]); // 60*60*24*days
        await network.provider.send("evm_mine");

        await expect(
            stakingRewards.exit(testAccount.address)
        ).to.be.revertedWith(
            "reverted with reason string 'staking period has not yet expired'"
        );
        testAccountBalance = BigNumber.from(
            await levr.balanceOf(testAccount.address)
        );
        expect(testAccountBalance.toString()).equal("0");

        await network.provider.send("evm_increaseTime", [10 * day]); // 60*60*24*days
        await network.provider.send("evm_mine");

        await stakingRewards.exit(testAccount.address);

        testAccountBalance = BigNumber.from(
            await levr.balanceOf(testAccount.address)
        );

        expect(testAccountBalance.toString()).not.equal("0");
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

function calcRewardRate(_reward, _duration) {
    const reward = BigNumber.from(_reward);
    const duration = BigNumber.from(_duration);

    return reward.div(duration);
}

function calcRewardPerToken(_rewardRate, _totalStaked, _durationStaked) {
    const rewardRate = BigNumber.from(_rewardRate);
    const totalStaked = BigNumber.from(_totalStaked);
    const durationStaked = BigNumber.from(_durationStaked);
    const e18 = BigNumber.from("1000000000000000000");

    return rewardRate.mul(durationStaked).mul(e18).div(totalStaked);
}

function calcReward(_rewardPerToken, _userAmount) {
    const rewardPerToken = BigNumber.from(_rewardPerToken);
    const userAmount = BigNumber.from(_userAmount);
    const e18 = BigNumber.from("1000000000000000000");

    return rewardPerToken.mul(userAmount).div(e18);
}
