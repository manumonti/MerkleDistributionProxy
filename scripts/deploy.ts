import { ethers } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const council = signers[1];
  const stake1 = signers[10];
  const stake2 = signers[11];

  const merkleTree = {
    totalAmount: "400",
    merkleRoot:
      "0x3a3c47dcebb9d6f69cd74f55f6f282a2564e6a96c2659dcb2e8bf17e38e31ff2",
    claims: {
      "0xBcd4042DE499D14e55001CcbB24a551F3b954096": {
        beneficiary: "0xBcd4042DE499D14e55001CcbB24a551F3b954096",
        amount: "200",
        proof: [
          "0xafb33ebda860317f094db4dbd770585404ca4cad82dd451b26fc9ed30228e0d5",
        ],
      },
      "0x71bE63f3384f5fb98995898A86B02Fb2426c5788": {
        beneficiary: "0xBcd4042DE499D14e55001CcbB24a551F3b954096",
        amount: "200",
        proof: [
          "0x18fdbc48226e6fc3b41c24b1136d27b2388debb7987e046bffc80447a8db0f70",
        ],
      },
    },
  };

  // Deploy T token
  const T = await ethers.getContractFactory("T");
  const t = await T.deploy(1000);
  await t.deployed();

  // Deploy Merkle Distribution
  const MerkleDistribution = await ethers.getContractFactory(
    "CumulativeMerkleDrop"
  );
  const merkleDistribution = await MerkleDistribution.deploy(
    t.address,
    council.address,
    deployer.address
  );

  await merkleDistribution.functions.setMerkleRoot(merkleTree.merkleRoot);

  // Transfer T to council
  let tx = await t.functions.transfer(council.address, 1000);

  // Authorize Merkle Distribution spending council's T
  tx = await t
    .connect(council)
    .functions.approve(merkleDistribution.address, 1000);

  // Claim the reward
  console.log(await t.functions.balanceOf(stake1.address));
  tx = await merkleDistribution.functions.claim(
    stake1.address,
    stake1.address,
    200,
    merkleTree.merkleRoot,
    merkleTree.claims["0xBcd4042DE499D14e55001CcbB24a551F3b954096"].proof
    );
  console.log(await t.functions.balanceOf(stake1.address));

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
