const { expect, assert } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, web3 } = require("hardhat");

const testLevrAddress = "0xce0F718BD518E38A479fcB0187B67c2Eb57c5e1D";
const accountToImpersonate = "0x20BD917E2fc207AC80a15b034B4dBAa296065216";

let testAccount;
let testAccount2;
let testAccount3;

describe("LEVR Staking", function () {
    beforeEach(async function () {
        resetChain();

        // Get LEVR test token contract that was launched on Arbitrum
        LEVR = await hre.ethers.getContractFactory("LEVR");
        levr = await LEVR.attach(testLevrAddress);

        // Get test accounts
        [testAccount, testAccount2, testAccount3] = await ethers.getSigners();

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

    // it("single investor should get all rewards", async function () {
    //     const rewardsLevr = "1000000000000000000000000000";
    //     const testAccountLevr = "10000000000000000000000000";
    //     const rewardAmount = "100000000000000000000";
    //     const stakeAmount = "10000000000000000000000000";

    //     day = 86400;

    //     await hre.network.provider.request({
    //         method: "hardhat_impersonateAccount",
    //         params: [accountToImpersonate],
    //     });
    //     // admin has minting rights
    //     const admin = await ethers.getSigner(accountToImpersonate);
    //     // Mint to test account
    //     await levr.connect(admin).mint(testAccount.address, testAccountLevr); //10M
    //     // Mint to stakingRewards contract
    //     await levr.connect(admin).mint(stakingRewards.address, rewardsLevr); //1000M

    //     await levr.approve(stakingRewards.address, stakeAmount);

    //     // Stake
    //     await stakingRewards.stake(stakeAmount, 90);

    //     // console.log(
    //     //     "Timestamp before: ",
    //     //     await (
    //     //         await web3.eth.getBlock("latest")
    //     //     ).timestamp
    //     // );

    //     await stakingRewards.notifyRewardAmount(rewardAmount);

    //     await network.provider.send("evm_increaseTime", [7776000]); // 60*60*24*days
    //     await network.provider.send("evm_mine");

    //     // console.log(
    //     //     "Timestamp after: ",
    //     //     await (
    //     //         await web3.eth.getBlock("latest")
    //     //     ).timestamp
    //     // );

    //     // console.log(
    //     //     "Earned after time jump: ",
    //     //     await stakingRewards.earned(testAccount.address)
    //     // );

    //     // console.log(
    //     //     "Balance before claim: ",
    //     //     await levr.balanceOf(testAccount.address)
    //     // );

    //     //await stakingRewards.exit(testAccount.address);
    //     // Claim Rewards
    //     await stakingRewards.getReward(testAccount.address);

    //     let testAccountRewardBalance = await levr.balanceOf(
    //         testAccount.address
    //     );
    //     // console.log("Balance after claim: ", testAccountRewardBalance);

    //     let rewardRate = calcRewardRate(rewardAmount, 90 * day);
    //     let rewardPT = calcRewardPerToken(rewardRate, stakeAmount, 90 * day);

    //     let calculatedRewardBalance = calcReward(rewardPT, stakeAmount);
    //     // console.log(rewardPT);
    //     // console.log("Calculated Earned: ", calculatedRewardBalance);

    //     expect(calculatedRewardBalance.toString()).to.equal(
    //         testAccountRewardBalance.toString()
    //     );
    // });

    // it("should not be able to set reward bigger than reward balance", async function () {
    //     await hre.network.provider.request({
    //         method: "hardhat_impersonateAccount",
    //         params: [accountToImpersonate],
    //     });
    //     // admin has minting rights
    //     const admin = await ethers.getSigner(accountToImpersonate);
    //     // Mint to test account
    //     await levr
    //         .connect(admin)
    //         .mint(testAccount.address, "10000000000000000000000000"); //10M
    //     // Mint to stakingRewards contract
    //     await levr
    //         .connect(admin)
    //         .mint(stakingRewards.address, "90000000000000000000"); // Not enough tokens for rewards

    //     await levr.approve(
    //         stakingRewards.address,
    //         "100000000000000000000000000000000"
    //     );

    //     // Stake
    //     await stakingRewards.stake("10000000000000000000000000", 90);

    //     await expect(
    //         stakingRewards.notifyRewardAmount("100000000000000000000")
    //     ).to.be.revertedWith(
    //         "reverted with reason string 'Provided reward too high'"
    //     );
    // });

    // it("should not be able to exit before lockup period is over", async function () {
    //     const rewardsLevr = "1000000000000000000000000000";
    //     const testAccountLevr = "10000000000000000000000000";
    //     const rewardAmount = "100000000000000000000";
    //     const stakeAmount = "10000000000000000000000000";

    //     day = 86400;

    //     await hre.network.provider.request({
    //         method: "hardhat_impersonateAccount",
    //         params: [accountToImpersonate],
    //     });
    //     // admin has minting rights
    //     const admin = await ethers.getSigner(accountToImpersonate);
    //     // Mint to test account
    //     await levr.connect(admin).mint(testAccount.address, testAccountLevr); //10M
    //     // Mint to stakingRewards contract
    //     await levr.connect(admin).mint(stakingRewards.address, rewardsLevr); //1000M

    //     await levr.approve(stakingRewards.address, stakeAmount);

    //     // Stake
    //     await stakingRewards.stake(stakeAmount, 90);

    //     let testAccountBalance = await levr
    //         .balanceOf(testAccount.address)
    //         .toString();

    //     await stakingRewards.notifyRewardAmount(rewardAmount);

    //     await network.provider.send("evm_increaseTime", [1 * day]); // 60*60*24*days
    //     await network.provider.send("evm_mine");

    //     await expect(
    //         stakingRewards.exit(testAccount.address)
    //     ).to.be.revertedWith(
    //         "reverted with reason string 'staking period has not yet expired'"
    //     );
    //     testAccountBalance = BigNumber.from(
    //         await levr.balanceOf(testAccount.address)
    //     );
    //     expect(testAccountBalance.toString()).equal("0");

    //     await network.provider.send("evm_increaseTime", [1 * day]); // 60*60*24*days
    //     await network.provider.send("evm_mine");

    //     await expect(
    //         stakingRewards.exit(testAccount.address)
    //     ).to.be.revertedWith(
    //         "reverted with reason string 'staking period has not yet expired'"
    //     );
    //     testAccountBalance = BigNumber.from(
    //         await levr.balanceOf(testAccount.address)
    //     );
    //     expect(testAccountBalance.toString()).equal("0");

    //     await network.provider.send("evm_increaseTime", [30 * day]); // 60*60*24*days
    //     await network.provider.send("evm_mine");

    //     await expect(
    //         stakingRewards.exit(testAccount.address)
    //     ).to.be.revertedWith(
    //         "reverted with reason string 'staking period has not yet expired'"
    //     );
    //     testAccountBalance = BigNumber.from(
    //         await levr.balanceOf(testAccount.address)
    //     );
    //     expect(testAccountBalance.toString()).equal("0");

    //     await network.provider.send("evm_increaseTime", [30 * day]); // 60*60*24*days
    //     await network.provider.send("evm_mine");

    //     await expect(
    //         stakingRewards.exit(testAccount.address)
    //     ).to.be.revertedWith(
    //         "reverted with reason string 'staking period has not yet expired'"
    //     );
    //     testAccountBalance = BigNumber.from(
    //         await levr.balanceOf(testAccount.address)
    //     );
    //     expect(testAccountBalance.toString()).equal("0");

    //     await network.provider.send("evm_increaseTime", [30 * day]); // 60*60*24*days
    //     await network.provider.send("evm_mine");

    //     await stakingRewards.exit(testAccount.address);

    //     testAccountBalance = BigNumber.from(
    //         await levr.balanceOf(testAccount.address)
    //     );

    //     expect(testAccountBalance.toString()).not.equal("0");
    // });

    // it("Can change minimum lockup period", async function () {
    //     const rewardsLevr = "1000000000000000000000000000";
    //     const testAccountLevr = "10000000000000000000000000";
    //     const rewardAmount = "100000000000000000000";
    //     const stakeAmount = "10000000000000000000000000";

    //     let day = 86400;
    //     let defaultLockupPeriod = (90 * day).toString();
    //     let changeLockupPeriodTo = (30 * day).toString();

    //     await hre.network.provider.request({
    //         method: "hardhat_impersonateAccount",
    //         params: [accountToImpersonate],
    //     });

    //     let minLockupPeriod = await stakingRewards.lockupPeriod();
    //     console.log("min lockup time 1: ", minLockupPeriod);
    //     expect(minLockupPeriod).to.equal(defaultLockupPeriod);

    //     // Change minimum lockup time
    //     const changeTX = await stakingRewards.setLockupPeriod(
    //         changeLockupPeriodTo
    //     );

    //     minLockupPeriod = await stakingRewards.lockupPeriod();

    //     expect(minLockupPeriod).to.equal(changeLockupPeriodTo);

    //     // EVENTS
    //     expect(changeTX)
    //         .to.emit(stakingRewards, "LockupPeriodUpdated")
    //         .withArgs("2592000");
    // });

    // it("Should be able to disable minimum lockup period", async function () {
    //     const rewardsLevr = "1000000000000000000000000000";
    //     const testAccountLevr = "10000000000000000000000000";
    //     const rewardAmount = "100000000000000000000";
    //     const stakeAmount = "10000000000000000000000000";

    //     let day = 86400;

    //     await hre.network.provider.request({
    //         method: "hardhat_impersonateAccount",
    //         params: [accountToImpersonate],
    //     });
    //     // admin has minting rights
    //     const admin = await ethers.getSigner(accountToImpersonate);
    //     // Mint to test account
    //     await levr.connect(admin).mint(testAccount.address, testAccountLevr); //10M
    //     await levr.connect(admin).mint(testAccount2.address, testAccountLevr); //10M
    //     // Mint to stakingRewards contract
    //     await levr.connect(admin).mint(stakingRewards.address, rewardsLevr); //1000M

    //     await levr.approve(stakingRewards.address, stakeAmount);
    //     await levr
    //         .connect(testAccount2)
    //         .approve(stakingRewards.address, stakeAmount);

    //     // Stake
    //     await stakingRewards.stake(stakeAmount, 90);

    //     await stakingRewards.notifyRewardAmount(rewardAmount);

    //     await network.provider.send("evm_increaseTime", [30 * day]); // 60*60*24*days
    //     await network.provider.send("evm_mine");

    //     // Try to exit before lockup time expires
    //     await expect(
    //         stakingRewards.exit(testAccount.address)
    //     ).to.be.revertedWith(
    //         "reverted with reason string 'staking period has not yet expired'"
    //     );

    //     // Disable minimum lockup time
    //     const disableTX = await stakingRewards.setLockupEnabled(false);

    //     // Exit
    //     await stakingRewards.exit(testAccount.address);

    //     expect(await stakingRewards.lockupEnabled()).to.equal(false);

    //     // EVENTS
    //     expect(disableTX)
    //         .to.emit(stakingRewards, "LockupEnabledUpdated")
    //         .withArgs(false);
    // });

    // it("Should select longer lockup period", async function () {
    //     const rewardsLevr = "1000000000000000000000000000";
    //     const testAccountLevr = "100000000000000000000000000";
    //     const rewardAmount = "100000000000000000000";
    //     const stakeAmount = "100000000000000000000000";

    //     let day = 86400;

    //     await hre.network.provider.request({
    //         method: "hardhat_impersonateAccount",
    //         params: [accountToImpersonate],
    //     });
    //     // admin has minting rights
    //     const admin = await ethers.getSigner(accountToImpersonate);
    //     // Mint to test account
    //     await levr.connect(admin).mint(testAccount.address, testAccountLevr); //10M
    //     await levr.connect(admin).mint(testAccount2.address, testAccountLevr); //10M
    //     // Mint to stakingRewards contract
    //     await levr.connect(admin).mint(stakingRewards.address, rewardsLevr); //1000M

    //     await levr.approve(stakingRewards.address, testAccountLevr);
    //     await levr
    //         .connect(testAccount2)
    //         .approve(stakingRewards.address, stakeAmount);

    //     // Stake for 140 day period
    //     await stakingRewards.stake(stakeAmount, 140);

    //     // Stake for 120 day period
    //     await stakingRewards.stake(stakeAmount, 120);

    //     let currentTimestamp = await (
    //         await web3.eth.getBlock("latest")
    //     ).timestamp;

    //     // Expect first longer period is selected
    //     expect(await stakingRewards.lockupTimes(testAccount.address)).to.equal(
    //         (Number(currentTimestamp) + 140 * day - 1).toString()
    //     );

    //     // Stake for 140 day period
    //     await stakingRewards.stake(stakeAmount, 110);

    //     // Stake for 120 day period
    //     await stakingRewards.stake(stakeAmount, 150);

    //     currentTimestamp = await (await web3.eth.getBlock("latest")).timestamp;

    //     // Expect latest longer period is selected
    //     expect(await stakingRewards.lockupTimes(testAccount.address)).to.equal(
    //         (Number(currentTimestamp) + 150 * day).toString()
    //     );
    // });

    it("integration test", async function () {
        const rewardsLevr = BigNumber.from("10000000000000000000000000000");
        const testAccountLevr = BigNumber.from("100000000000000000000000000");
        const rewardAmount = BigNumber.from("100000000000000000000");
        const rewardAmount2 = BigNumber.from("200000000000000000000");
        const stakeAmount = BigNumber.from("10000000000000000000000000");

        day = 86400;

        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [accountToImpersonate],
        });
        // admin has minting rights
        const admin = await ethers.getSigner(accountToImpersonate);
        // Mint to test account
        await levr.connect(admin).mint(testAccount.address, testAccountLevr); //10M
        await levr.connect(admin).mint(testAccount2.address, testAccountLevr); //10M
        // Mint to stakingRewards contract
        await levr.connect(admin).mint(stakingRewards.address, rewardsLevr); //1000M

        await levr.approve(stakingRewards.address, testAccountLevr);
        await levr
            .connect(testAccount2)
            .approve(stakingRewards.address, testAccountLevr);

        let account1BalanceBefore = await levr.balanceOf(testAccount.address);
        let account2BalanceBefore = await levr.balanceOf(testAccount2.address);

        // Stake period 1
        await stakingRewards.setRewardsDuration(180 * day);

        await stakingRewards.connect(testAccount2).stake(stakeAmount, 90);

        await stakingRewards.notifyRewardAmount(rewardAmount);

        await network.provider.send("evm_increaseTime", [180 * day]); // 60*60*24*days
        await network.provider.send("evm_mine");

        let account2EarnedPeriod1 = await stakingRewards.earned(
            testAccount2.address
        );
        console.log(
            "Account 2 earned: ",
            await stakingRewards.earned(testAccount2.address)
        );

        let rewardRate = calcRewardRate(rewardAmount, 180 * day);
        let rewardPT = calcRewardPerToken(rewardRate, stakeAmount, 180 * day);

        let calculatedRewards = calcReward(rewardPT, stakeAmount);
        console.log("Calculated Earned: ", calculatedRewards);

        expect(calculatedRewards.toString()).to.equal(account2EarnedPeriod1);

        await stakingRewards
            .connect(testAccount2)
            .getReward(testAccount2.address);

        // Stake period 2

        //await stakingRewards.connect(testAccount2).stake(stakeAmount, 90);

        await stakingRewards.stake(stakeAmount, 180);

        await stakingRewards.notifyRewardAmount(rewardAmount);

        await network.provider.send("evm_increaseTime", [90 * day]); // 60*60*24*days
        await network.provider.send("evm_mine");

        console.log(
            "Account 2 earned: ",
            await stakingRewards.earned(testAccount2.address)
        );

        let account2EarnedPeriod2 = await stakingRewards.earned(
            testAccount2.address
        );

        let account1EarnedPeriod2 = await stakingRewards.earned(
            testAccount.address
        );

        rewardPT = calcRewardPerToken(rewardRate, stakeAmount.mul(2), 90 * day);
        console.log("rewardPT: ", rewardPT);
        console.log(
            "rewardPT stored: ",
            await stakingRewards.rewardPerTokenStored()
        );

        calculatedRewards = calcReward(rewardPT, stakeAmount);
        console.log("Calculated Earned: ", calculatedRewards);

        expect(calculatedRewards.toString()).to.equal(account2EarnedPeriod2);
        expect(calculatedRewards.toString()).to.equal(account1EarnedPeriod2);

        // Stake period 3

        await stakingRewards.exit(testAccount2.address); // account2 leaves

        await network.provider.send("evm_increaseTime", [90 * day]); // 60*60*24*days
        await network.provider.send("evm_mine");

        let rewardsAccount1P3 = await stakingRewards.earned(
            testAccount.address
        );
        console.log("Account 1 rewards P3: ", rewardsAccount1P3);

        rewardPT = calcRewardPerToken(rewardRate, stakeAmount, 90 * day);
        calculatedRewards = calculatedRewards.add(
            calcReward(rewardPT, stakeAmount)
        );

        let errorPercentage =
            (Math.abs(rewardsAccount1P3 - calculatedRewards) /
                rewardsAccount1P3) *
            100;

        expect(errorPercentage).is.lessThan(0.1);

        console.log("Error: ", errorPercentage);
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
