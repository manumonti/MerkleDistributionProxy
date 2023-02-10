const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const {
  tAddress,
  councilAddress,
} = require("./constants");

describe("Proxy contract", () => {
  let ProxyLogic;
  let ProxyFactory;
  let proxyFactory;
  let proxy;
  let t;
  let deployer;
  let council;

  before(async () => {
    [deployer, acc1, acc2] = await ethers.getSigners();
    // Load ProxyLogicV1 and Proxy contract ethers factory
    ProxyLogic = await ethers.getContractFactory("ProxyLogicV1");
    ProxyFactory = await ethers.getContractFactory("DSProxyFactory");
    // Load T token and Merkle Dist contract already deployed on mainnet
    t = await ethers.getContractAt("T", tAddress);
  });

  beforeEach(async () => {
    // Impersonate council multisig and Merkle distribution owner
    council = await ethers.getImpersonatedSigner(councilAddress);
  });

  context("when deploy Proxy with council as owner", () => {
    before(async () => {
      // Deploy Proxy Factory
      proxyFactory = await ProxyFactory.deploy();
    });

    it("should emit an event that includes proxy owner address", async () => {
      await expect(proxyFactory.functions["build(address)"](council.address))
        .to.emit(proxyFactory, "Created")
        .withArgs(deployer.address, council.address, anyValue, anyValue);
    });
  });

  context("when proxy is deployed with council as owner", () => {
    beforeEach(async () => {
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
      proxy = await ethers.getContractAt("DSProxy", proxyAddress);
    });

    it("should have set council as owner", async () => {
      await expect(await proxy.owner()).to.be.equal(council.address);
    });

    it("should be possible to be called by council", async () => {
      const allowance = 1000;

      // Call data for approve function. Approve acc1 spending T
      const callData = ProxyLogic.interface.encodeFunctionData("approve", [
        t.address,
        acc1.address,
        allowance,
      ]);

      await proxy
        .connect(council)
        .functions["execute(bytes,bytes)"](ProxyLogic.bytecode, callData);

      await expect(await t.allowance(proxy.address, acc1.address)).to.be.equal(
        allowance
      );
    });

    it("should not be possible to be called by other than council", async () => {
      const allowance = 1000;

      // Call data for approve function. Approve acc1 spending T
      const callData = ProxyLogic.interface.encodeFunctionData("approve", [
        t.address,
        acc1.address,
        allowance,
      ]);

      await expect(
        proxy
          .connect(acc2)
          .functions["execute(bytes,bytes)"](ProxyLogic.bytecode, callData)
      ).to.be.revertedWith("ds-auth-unauthorized");
    });
  });
});
