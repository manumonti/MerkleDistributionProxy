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

  const byteCode =
    "0x608060405234801561001057600080fd5b506102f4806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806315dacbea14610046578063beabacc81461006d578063e1f21c6714610080575b600080fd5b61005961005436600461020e565b610093565b604051901515815260200160405180910390f35b61005961007b366004610259565b61012a565b61005961008e366004610259565b6101b9565b6040516323b872dd60e01b81526001600160a01b038481166004830152838116602483015260448201839052600091908616906323b872dd90606401602060405180830381600087803b1580156100e957600080fd5b505af11580156100fd573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101219190610295565b95945050505050565b60405163a9059cbb60e01b81526001600160a01b038381166004830152602482018390526000919085169063a9059cbb906044015b602060405180830381600087803b15801561017957600080fd5b505af115801561018d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101b19190610295565b949350505050565b60405163095ea7b360e01b81526001600160a01b038381166004830152602482018390526000919085169063095ea7b39060440161015f565b80356001600160a01b038116811461020957600080fd5b919050565b6000806000806080858703121561022457600080fd5b61022d856101f2565b935061023b602086016101f2565b9250610249604086016101f2565b9396929550929360600135925050565b60008060006060848603121561026e57600080fd5b610277846101f2565b9250610285602085016101f2565b9150604084013590509250925092565b6000602082840312156102a757600080fd5b815180151581146102b757600080fd5b939250505056fea26469706673582212203af6f65263667abc487055097ef1e5b9f06fbff8b6ef3f0182c564072212e78b64736f6c63430008090033";

  const contractInterface = [
    "function transfer(address token, address to, uint256 amount) external returns (bool)",
    "function approve(address token, address spender, uint256 amount) external returns (bool)",
    "function transferFrom(address token, address from, address to, uint256 amount) external returns (bool)",
  ];

  // Deploy T token
  const T = await ethers.getContractFactory("T");
  const t = await T.deploy(1000);
  await t.deployed();

  // Deploy Proxy Factory
  const ProxyFactory = await ethers.getContractFactory("DSProxyFactory");
  const proxyFactory = await ProxyFactory.deploy();

  // Deploy Proxy
  let txResponse = await proxyFactory.functions["build(address)"](
    council.address
  );
  const txReceipt = await txResponse.wait();
  const createdEvent = txReceipt.events?.find(
    (event) => event.event === "Created"
  );
  const proxyAddress =
    createdEvent && createdEvent.args && createdEvent.args.proxy;
  const proxy = await ethers.getContractAt("DSProxy", proxyAddress);

  // Deploy Merkle Distribution
  const MerkleDistribution = await ethers.getContractFactory(
    "CumulativeMerkleDrop"
  );
  const merkleDistribution = await MerkleDistribution.deploy(
    t.address,
    proxy.address,
    deployer.address
  );

  await merkleDistribution.functions.setMerkleRoot(merkleTree.merkleRoot);

  // Transfer T to council
  let tx = await t.functions.transfer(council.address, 600);

  // Transfer T from council to proxy
  tx = await t.connect(council).functions.transfer(proxy.address, 400);

  // Approve Merkle Distribution spending proxy's T
  const erc20DummyInterface = new ethers.utils.Interface(contractInterface);
  const callData = erc20DummyInterface.encodeFunctionData("approve", [
    t.address,
    merkleDistribution.address,
    400,
  ]);
  txResponse = await proxy
    .connect(council)
    .functions["execute(bytes,bytes)"](byteCode, callData);

  console.log("Stake1 balance before claiming");
  console.log(await t.balanceOf(stake1.address));
  console.log("Proxy balance before claiming");
  console.log(await t.balanceOf(proxy.address));

  // Claim the reward
  await merkleDistribution.functions.claim(
    stake1.address,
    stake1.address,
    200,
    merkleTree.merkleRoot,
    merkleTree.claims["0xBcd4042DE499D14e55001CcbB24a551F3b954096"].proof
  );

  console.log("Stake1 balance after claiming");
  console.log(await t.balanceOf(stake1.address));
  console.log("Proxy balance after claiming");
  console.log(await t.balanceOf(proxy.address));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
