const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RealEstateMarketplace", function () {
  async function deploy() {
    const [admin, investor] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("RealEstateMarketplace");
    const marketplace = await Factory.deploy();
    await marketplace.waitForDeployment();
    return { marketplace, admin, investor };
  }

  it("lists a property and records share purchases", async function () {
    const { marketplace, admin, investor } = await deploy();
    const sharePrice = ethers.parseEther("0.01");

    await marketplace.listProperty("Azure Villa", "Miami Beach, FL", 1000, sharePrice);

    const property = await marketplace.getProperty(1);
    expect(property.name).to.equal("Azure Villa");
    expect(property.seller).to.equal(admin.address);

    await marketplace
      .connect(investor)
      .buyShares(1, 10, { value: sharePrice * 10n });

    expect(await marketplace.getShares(1, investor.address)).to.equal(10n);
    expect((await marketplace.getProperty(1)).sharesSold).to.equal(10n);
  });

  it("rejects the wrong ETH amount", async function () {
    const { marketplace, investor } = await deploy();
    const sharePrice = ethers.parseEther("0.01");
    await marketplace.listProperty("Azure Villa", "Miami", 100, sharePrice);

    await expect(
      marketplace.connect(investor).buyShares(1, 2, { value: sharePrice })
    ).to.be.revertedWithCustomError(marketplace, "IncorrectPayment");
  });

  it("lets the seller withdraw proceeds", async function () {
    const { marketplace, admin, investor } = await deploy();
    const sharePrice = ethers.parseEther("0.01");
    await marketplace.listProperty("Azure Villa", "Miami", 100, sharePrice);

    await marketplace
      .connect(investor)
      .buyShares(1, 5, { value: sharePrice * 5n });

    const before = await ethers.provider.getBalance(admin.address);
    const tx = await marketplace.connect(admin).withdrawProceeds(1);
    const receipt = await tx.wait();
    const gas = receipt.gasUsed * receipt.gasPrice;
    const after = await ethers.provider.getBalance(admin.address);

    expect(after).to.equal(before + sharePrice * 5n - gas);
    expect((await marketplace.getProperty(1)).proceeds).to.equal(0n);
  });

  it("buys a cart of listings in one payment", async function () {
    const { marketplace, investor } = await deploy();
    const villa = ethers.parseEther("0.01");
    const loft = ethers.parseEther("0.012");
    await marketplace.listProperty("Azure Villa", "Miami", 1000, villa);
    await marketplace.listProperty("Loftworks", "New York", 1200, loft);

    const cost = villa * 3n + loft * 2n;
    await marketplace.connect(investor).buyCart([1, 2], [3, 2], { value: cost });

    expect(await marketplace.getShares(1, investor.address)).to.equal(3n);
    expect(await marketplace.getShares(2, investor.address)).to.equal(2n);
  });
});
