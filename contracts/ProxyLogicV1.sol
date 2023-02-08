// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ProxyLogicV1 {
    function transfer(address token, address to, uint256 amount) external returns (bool){
        return IERC20(token).transfer(to, amount);
    }
    function approve(address token, address spender, uint256 amount) external returns (bool){
        return IERC20(token).approve(spender, amount);
    }
    function transferFrom(address token, address from, address to, uint256 amount) external returns (bool){
        return IERC20(token).transferFrom(from, to, amount);
    }
}
