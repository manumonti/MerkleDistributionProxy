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

  // Deploy Proxy Factory
  let proxyFactory = await deployments.getOrNull("DSProxyFactory");

  if (!proxyFactory) {
    log("No Proxy Factory contract deployed. Deploying...");
    proxyFactory = await deploy("DSProxyFactory", {
      from: deployer,
      log: true,
    });
  } else {
    log(
      "Using Proxy Factory contract previously deployed:",
      proxyFactory.address
    );
  }

  // Deploy Proxy and set council as owner
  log("Deploying proxy using Proxy Factory...");
  const txReceipt = await execute(
    "DSProxyFactory",
    { from: deployer, log: true },
    "build(address)",
    council
  );

  if (!txReceipt.events) {
    log("Something went wrong. No event received.");
    return;
  }

  const event = txReceipt.events.find(
    (event) =>
      event.eventSignature === "Created(address,address,address,address)"
  );

  if (!event.args) {
    log("Something went wrong. No proxy address received");
    return;
  }

  log("Proxy contract deployed:", event.args.proxy);
  log("Proxy cache:", event.args.cache)
};

export default func;
