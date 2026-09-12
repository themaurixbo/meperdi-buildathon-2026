import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

const SIX_DECIMALS = 6n;
const toUnits = (n: string) => ethers.parseUnits(n, 6);
const DAY = 24 * 60 * 60;

async function deployFixture() {
  const [admin, verifier, owner, helper, other] = await ethers.getSigners();

  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();

  const Escrow = await ethers.getContractFactory("RecoveryEscrow");
  const escrow = await Escrow.deploy(admin.address, verifier.address);
  await escrow.waitForDeployment();

  // Fondear al dueño de demo con mUSDC de prueba
  await mockUSDC.mint(owner.address, toUnits("1000"));

  return { admin, verifier, owner, helper, other, mockUSDC, escrow };
}

function newCaseId(seed: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(seed));
}

async function deadlineIn(days: number): Promise<bigint> {
  const now = await time.latest();
  return BigInt(now + days * DAY);
}

describe("RecoveryEscrow", () => {
  it("1. Crear y fondear un caso mueve el balance del dueño al contrato", async () => {
    const { owner, mockUSDC, escrow } = await deployFixture();
    const caseId = newCaseId("case-1");
    const amount = toUnits("10");
    const tokenAddr = await mockUSDC.getAddress();
    const escrowAddr = await escrow.getAddress();

    await mockUSDC.connect(owner).approve(escrowAddr, amount);
    await expect(
      escrow.connect(owner).createCase(caseId, tokenAddr, amount, await deadlineIn(7)),
    )
      .to.emit(escrow, "CaseCreated")
      .withArgs(caseId, owner.address, tokenAddr, amount, await deadlineIn(7));

    // Balance movido: toleramos ±2s de deadline por el minado entre llamadas
    expect(await mockUSDC.balanceOf(escrowAddr)).to.equal(amount);
    const stored = await escrow.getCase(caseId);
    expect(stored.owner).to.equal(owner.address);
    expect(stored.rewardAmount).to.equal(amount);
    expect(stored.status).to.equal(1n); // FUNDED
  });

  it("2. Crear un caso con rewardAmount = 0 funciona sin mover fondos", async () => {
    const { owner, mockUSDC, escrow } = await deployFixture();
    const caseId = newCaseId("case-zero");
    const tokenAddr = await mockUSDC.getAddress();
    const escrowAddr = await escrow.getAddress();
    const before = await mockUSDC.balanceOf(owner.address);

    await escrow.connect(owner).createCase(caseId, tokenAddr, 0n, await deadlineIn(7));

    expect(await mockUSDC.balanceOf(escrowAddr)).to.equal(0n);
    expect(await mockUSDC.balanceOf(owner.address)).to.equal(before);
    const stored = await escrow.getCase(caseId);
    expect(stored.status).to.equal(1n); // FUNDED igual, sin fondos
    expect(stored.rewardAmount).to.equal(0n);
  });

  it("3. completeReturn sin VERIFIER_ROLE revierte", async () => {
    const { owner, other, helper, mockUSDC, escrow } = await deployFixture();
    const caseId = newCaseId("case-3");
    const amount = toUnits("5");
    const tokenAddr = await mockUSDC.getAddress();
    await mockUSDC.connect(owner).approve(await escrow.getAddress(), amount);
    await escrow.connect(owner).createCase(caseId, tokenAddr, amount, await deadlineIn(7));

    await expect(escrow.connect(other).completeReturn(caseId, helper.address)).to.be.revertedWithCustomError(
      escrow,
      "AccessControlUnauthorizedAccount",
    );
  });

  it("4. completeReturn dos veces revierte la segunda vez", async () => {
    const { owner, verifier, helper, mockUSDC, escrow } = await deployFixture();
    const caseId = newCaseId("case-4");
    const amount = toUnits("5");
    await mockUSDC.connect(owner).approve(await escrow.getAddress(), amount);
    await escrow
      .connect(owner)
      .createCase(caseId, await mockUSDC.getAddress(), amount, await deadlineIn(7));

    await escrow.connect(verifier).completeReturn(caseId, helper.address);
    await expect(
      escrow.connect(verifier).completeReturn(caseId, helper.address),
    ).to.be.revertedWithCustomError(escrow, "CaseNotFunded");
  });

  it("5. completeReturn transfiere el monto correcto al helper", async () => {
    const { owner, verifier, helper, mockUSDC, escrow } = await deployFixture();
    const caseId = newCaseId("case-5");
    const amount = toUnits("25");
    await mockUSDC.connect(owner).approve(await escrow.getAddress(), amount);
    await escrow
      .connect(owner)
      .createCase(caseId, await mockUSDC.getAddress(), amount, await deadlineIn(7));

    const before = await mockUSDC.balanceOf(helper.address);
    await expect(escrow.connect(verifier).completeReturn(caseId, helper.address))
      .to.emit(escrow, "CaseCompleted")
      .withArgs(caseId, helper.address, amount);
    expect(await mockUSDC.balanceOf(helper.address)).to.equal(before + amount);

    const stored = await escrow.getCase(caseId);
    expect(stored.status).to.equal(2n); // COMPLETED
  });

  it("6. refundExpired antes del deadline revierte", async () => {
    const { owner, mockUSDC, escrow } = await deployFixture();
    const caseId = newCaseId("case-6");
    const amount = toUnits("5");
    await mockUSDC.connect(owner).approve(await escrow.getAddress(), amount);
    await escrow
      .connect(owner)
      .createCase(caseId, await mockUSDC.getAddress(), amount, await deadlineIn(7));

    await expect(escrow.refundExpired(caseId)).to.be.revertedWithCustomError(
      escrow,
      "RefundNotYetAvailable",
    );
  });

  it("7. refundExpired después del deadline devuelve los fondos al dueño", async () => {
    const { owner, mockUSDC, escrow } = await deployFixture();
    const caseId = newCaseId("case-7");
    const amount = toUnits("8");
    await mockUSDC.connect(owner).approve(await escrow.getAddress(), amount);
    await escrow
      .connect(owner)
      .createCase(caseId, await mockUSDC.getAddress(), amount, await deadlineIn(1));

    await time.increase(2 * DAY);
    const before = await mockUSDC.balanceOf(owner.address);
    await expect(escrow.refundExpired(caseId)).to.emit(escrow, "CaseRefunded").withArgs(caseId);
    expect(await mockUSDC.balanceOf(owner.address)).to.equal(before + amount);

    const stored = await escrow.getCase(caseId);
    expect(stored.status).to.equal(3n); // REFUNDED
  });

  it("8. pause() bloquea completeReturn; unpause() lo vuelve a habilitar", async () => {
    const { admin, owner, verifier, helper, mockUSDC, escrow } = await deployFixture();
    const caseId = newCaseId("case-8");
    const amount = toUnits("5");
    await mockUSDC.connect(owner).approve(await escrow.getAddress(), amount);
    await escrow
      .connect(owner)
      .createCase(caseId, await mockUSDC.getAddress(), amount, await deadlineIn(7));

    await escrow.connect(admin).pause();
    await expect(
      escrow.connect(verifier).completeReturn(caseId, helper.address),
    ).to.be.revertedWithCustomError(escrow, "EnforcedPause");

    await escrow.connect(admin).unpause();
    await expect(escrow.connect(verifier).completeReturn(caseId, helper.address)).to.emit(
      escrow,
      "CaseCompleted",
    );
  });

  it("9. Crear un caso con caseId repetido revierte", async () => {
    const { owner, mockUSDC, escrow } = await deployFixture();
    const caseId = newCaseId("case-9");
    const tokenAddr = await mockUSDC.getAddress();
    await escrow.connect(owner).createCase(caseId, tokenAddr, 0n, await deadlineIn(7));
    await expect(
      escrow.connect(owner).createCase(caseId, tokenAddr, 0n, await deadlineIn(7)),
    ).to.be.revertedWithCustomError(escrow, "CaseAlreadyExists");
  });

  it("decimales de mUSDC son 6", async () => {
    const { mockUSDC } = await deployFixture();
    expect(await mockUSDC.decimals()).to.equal(SIX_DECIMALS);
    expect(await mockUSDC.symbol()).to.equal("mUSDC");
  });
});
