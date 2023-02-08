import { ethers } from "hardhat";
import { setBalance } from "@nomicfoundation/hardhat-network-helpers";

async function main() {
  const merkleTreeResponse = await fetch(
    "https://raw.githubusercontent.com/threshold-network/merkle-distribution/ba74c9876d762084113c19099d7d357f42c9db0e/distributions/2023-02-01/MerkleDist.json"
  );
  const merkleTree = JSON.parse(await merkleTreeResponse.text());

  // Impersonate council multisig and Merkle distribution owner
  const council = await ethers.getImpersonatedSigner(
    "0x9F6e831c8F8939DC0C830C6e492e7cEf4f9C2F5f"
  );
  const merkleOwner = await ethers.getImpersonatedSigner(
    "0x5E6a5435eDdCA1F075Eb3Fc795E199D02c4CE3Ad"
  );
  await setBalance(merkleOwner.address, 1e18);

  // Load ProxyLogicV1 contract
  const ProxyLogic = await ethers.getContractFactory("ProxyLogicV1");

  // Get T token contract
  const t = await ethers.getContractAt(
    "T",
    "0xCdF7028ceAB81fA0C6971208e83fa7872994beE5"
  );

  // Get Merkle distribution contract
  const merkleDistribution = await ethers.getContractAt(
    "ICumulativeMerkleDrop",
    "0xeA7CA290c7811d1cC2e79f8d706bD05d8280BD37"
  );

  // Deploy Proxy Factory
  const ProxyFactory = await ethers.getContractFactory("DSProxyFactory");
  const proxyFactory = await ProxyFactory.deploy();

  // Deploy Proxy and set council as owner
  let txResponse = await proxyFactory.functions["build(address)"](
    council.address
  );
  const txReceipt = await txResponse.wait();
  const createdEvent = txReceipt.events?.find(
    (event) =>
      event.eventSignature === "Created(address,address,address,address)"
  );
  const proxyAddress =
    createdEvent && createdEvent.args && createdEvent.args.proxy;

  const proxy = await ethers.getContractAt("DSProxy", proxyAddress);

  // Get current allowance to Merkle distribution contract
  const allowance = await t.allowance(
    council.address,
    merkleDistribution.address
  );

  // Stop approving spend of council's T rewards
  await t.connect(council).approve(merkleDistribution.address, 0);

  // Transfer T rewards from council to proxy contract
  await t.connect(council).transfer(proxy.address, allowance);

  // Set proxy as Merkle Distribution rewards holder
  await merkleDistribution.connect(merkleOwner).setRewardsHolder(proxy.address);

  // Approve Merkle distribution spending proxy's T
  const callData = ProxyLogic.interface.encodeFunctionData("approve", [
    t.address,
    merkleDistribution.address,
    allowance,
  ]);

  await proxy
    .connect(council)
    .functions["execute(bytes,bytes)"](ProxyLogic.bytecode, callData);

  // Claim rewards of last stake on Merkle tree
  const stakeAddress = Object.keys(merkleTree.claims)[
    Object.keys(merkleTree.claims).length - 1
  ];
  const stakeClaim = merkleTree.claims[stakeAddress];

  console.log("Stake balance before claim:");
  console.log(await t.balanceOf(stakeClaim.beneficiary));

  let tx = await merkleDistribution.functions.claim(
    stakeAddress,
    stakeClaim.beneficiary,
    stakeClaim.amount,
    merkleTree.merkleRoot,
    stakeClaim.proof
  );

  console.log("Stake balance after claim:");
  console.log(await t.balanceOf(stakeClaim.beneficiary));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
