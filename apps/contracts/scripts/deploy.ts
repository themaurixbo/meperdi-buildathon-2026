import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Despliega MockUSDC + RecoveryEscrow en HSK testnet, otorga VERIFIER_ROLE y
 * acuña mUSDC de prueba al dueño de demo. Imprime las direcciones para el backend.
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const verifierAddress = process.env.VERIFIER_ADDRESS;
  const demoOwnerAddress = process.env.DEMO_OWNER_ADDRESS;
  if (!verifierAddress || !ethers.isAddress(verifierAddress)) {
    throw new Error("VERIFIER_ADDRESS inválida o ausente en el .env");
  }
  if (!demoOwnerAddress || !ethers.isAddress(demoOwnerAddress)) {
    throw new Error("DEMO_OWNER_ADDRESS inválida o ausente en el .env");
  }

  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const mockUSDCAddress = await mockUSDC.getAddress();
  console.log("MockUSDC desplegado en:", mockUSDCAddress);

  const Escrow = await ethers.getContractFactory("RecoveryEscrow");
  const escrow = await Escrow.deploy(deployer.address, verifierAddress);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("RecoveryEscrow desplegado en:", escrowAddress);

  console.log("VERIFIER_ROLE otorgado a:", verifierAddress, "(desde el constructor)");

  const mintAmount = ethers.parseUnits(process.env.DEMO_MINT_AMOUNT ?? "1000", 6);
  const mintTx = await mockUSDC.mint(demoOwnerAddress, mintAmount);
  await mintTx.wait();
  console.log(`mUSDC de prueba acuñados: ${mintAmount.toString()} (base units) -> ${demoOwnerAddress}`);
  console.log("tx mint:", mintTx.hash);

  console.log("\n--- Para apps/api/.env ---");
  console.log(`RECOVERY_ESCROW_ADDRESS=${escrowAddress}`);
  console.log(`MOCK_USDC_ADDRESS=${mockUSDCAddress}`);
  console.log("\nVerificar luego con:");
  console.log(`npx hardhat verify --network hskTestnet ${mockUSDCAddress}`);
  console.log(
    `npx hardhat verify --network hskTestnet ${escrowAddress} ${deployer.address} ${verifierAddress}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
