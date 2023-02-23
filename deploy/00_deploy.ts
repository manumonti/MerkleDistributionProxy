import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, getChainId } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments } = hre;
  const { execute, log } = deployments;

  const { deployer, council } = await getNamedAccounts();
  const { deploy } = deployments;

  log("Network:", hre.network.name, await getChainId());
  log("Deployer account: ", deployer);


  // Deploy ProxyFactory contract
  let proxyFactory = await deployments.getOrNull("DSProxyFactory");

  if (!proxyFactory) {
    log("No ProxyFactory contract deployed. Deploying...");
    proxyFactory = await deploy("DSProxyFactory", {
      from: deployer,
      log: true,
    });
  } else {
    log(
      "Using ProxyFactory contract previously deployed:",
      proxyFactory.address
    );
  }


  // Deploy ClaimableRewards proxy and set council as owner
  log("Deploying ClaimableRewards proxy using ProxyFactory...");
  const txReceiptClaimableRewards = await execute(
    "DSProxyFactory",
    { from: deployer, log: true },
    "build(address)",
    council
  );

  if (!txReceiptClaimableRewards.events) {
    log("Something went wrong. No event received.");
    return;
  }

  const eventClaimableRewards = txReceiptClaimableRewards.events.find(
    (event) =>
      event.eventSignature === "Created(address,address,address,address)"
  );

  if (!eventClaimableRewards.args) {
    log("Something went wrong. No proxy address received");
    return;
  }

  log("ClaimableRewards proxy deployed:", eventClaimableRewards.args.proxy);
  log("ClaimableRewards proxy cache:", eventClaimableRewards.args.cache);


  // Deploy FutureRewards proxy and set council as owner
  log("Deploying FutureRewards proxy using ProxyFactory...");
  const txReceiptFutureRewards = await execute(
    "DSProxyFactory",
    { from: deployer, log: true },
    "build(address)",
    council
  );

  if (!txReceiptFutureRewards.events) {
    log("Something went wrong. No event received.");
    return;
  }

  const eventFutureRewards = txReceiptFutureRewards.events.find(
    (event) =>
      event.eventSignature === "Created(address,address,address,address)"
  );

  if (!eventFutureRewards.args) {
    log("Something went wrong. No proxy address received");
    return;
  }

  log("FutureRewards proxy deployed:", eventFutureRewards.args.proxy);
  log("FutureRewards proxy cache:", eventFutureRewards.args.cache);
};

export default func;
