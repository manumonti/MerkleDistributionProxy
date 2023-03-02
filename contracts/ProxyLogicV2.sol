// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "./interfaces/IERC20.sol";

contract ProxyLogicV2 {
    address constant T = 0xCdF7028ceAB81fA0C6971208e83fa7872994beE5;
    address constant council = 0x9F6e831c8F8939DC0C830C6e492e7cEf4f9C2F5f;
    address constant merkleDistribution =
        0xeA7CA290c7811d1cC2e79f8d706bD05d8280BD37;
    address constant claimableRewardsProxy =
        0xec8183891331a845E2DCf5CD616Ee32736E2BAA4;
    address constant futureRewardsProxy =
        0xbe3e95Dc12C0aE3FAC264Bf63ef89Ec81139E3DF;

    function transfer(
        address token,
        address to,
        uint256 amount
    ) external returns (bool) {
        return IERC20(token).transfer(to, amount);
    }

    function approve(
        address token,
        address spender,
        uint256 amount
    ) external returns (bool) {
        return IERC20(token).approve(spender, amount);
    }

    function transferFrom(
        address token,
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        return IERC20(token).transferFrom(from, to, amount);
    }

    function transferT(address to, uint256 amount) public returns (bool) {
        return IERC20(T).transfer(to, amount);
    }

    function approveT(address spender, uint256 amount) public returns (bool) {
        return IERC20(T).approve(spender, amount);
    }

    function transferTFrom(
        address from,
        address to,
        uint256 amount
    ) public returns (bool) {
        return IERC20(T).transferFrom(from, to, amount);
    }

    function refillClaimableRewards(uint256 amount) external returns (bool) {
        transferTFrom(futureRewardsProxy, claimableRewardsProxy, amount);
        uint256 allowance = IERC20(T).allowance(
            claimableRewardsProxy,
            merkleDistribution
        );
        uint256 newApproval = allowance + amount;
        approveT(merkleDistribution, newApproval);
        return true;
    }
}
