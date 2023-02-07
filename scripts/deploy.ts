import { ethers } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const council = signers[1];

  // Deploy T token
  const T = await ethers.getContractFactory("T");
  const t = await T.deploy(1000);
  await t.deployed();

  // Transfer T to council
  await t.functions.transfer(council.address, 500);

  // // Deploy Proxy Factory
  // const ProxyFactory = await ethers.getContractFactory("DSProxyFactory");
  // const proxyFactory = await ProxyFactory.deploy();

  // const buildFunc = await proxyFactory.functions["build(address)"];
  // const txResponse = await buildFunc(council.address);
  // const txReceipt = await txResponse.wait();
  // console.log(txReceipt.logs);
  // console.log(council.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
