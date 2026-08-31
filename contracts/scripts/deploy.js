const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

const SEED = [
  { name: "Azure Villa", location: "Miami Beach, FL", totalShares: 1000, sharePrice: "0.01" },
  { name: "Shibuya Mini Tower", location: "Tokyo, Japan", totalShares: 2500, sharePrice: "0.008" },
  { name: "Belgravia House", location: "London, UK", totalShares: 800, sharePrice: "0.02" },
  { name: "Marina Crown", location: "Dubai, UAE", totalShares: 1500, sharePrice: "0.015" },
  { name: "Brooklyn Loftworks", location: "New York, NY", totalShares: 1200, sharePrice: "0.012" },
  { name: "Lisbon Courtyard", location: "Lisbon, Portugal", totalShares: 900, sharePrice: "0.007" },
];

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const Factory = await hre.ethers.getContractFactory("RealEstateMarketplace");
  const marketplace = await Factory.deploy();
  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`RealEstateMarketplace: ${address}`);

  for (const listing of SEED) {
    const tx = await marketplace.listProperty(
      listing.name,
      listing.location,
      listing.totalShares,
      hre.ethers.parseEther(listing.sharePrice)
    );
    await tx.wait();
    console.log(`Listed: ${listing.name}`);
  }

  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });

  const payload = {
    address,
    chainId: 31337,
    network: "localhost",
    deployer: deployer.address,
    listed: SEED.length,
  };

  fs.writeFileSync(
    path.join(outDir, "localhost.json"),
    JSON.stringify(payload, null, 2)
  );
  console.log("Wrote contracts/deployments/localhost.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
