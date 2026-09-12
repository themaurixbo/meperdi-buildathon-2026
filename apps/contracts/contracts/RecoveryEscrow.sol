// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title RecoveryEscrow — escrow for optional ME PERDÍ rewards.
/// @notice ME PERDÍ rewards safe returns, it never incentivizes going out to look
/// for pets or objects for money. The reward is always optional and is set by the
/// owner when creating the case. Funds are released only when the verifier (backend)
/// confirms that the finder presented the correct 6-digit handoff code.
/// @notice Only amounts, states, dates and a caseId that is a hash (bytes32) are
/// stored on-chain. Never name, phone, location, photos or messages.
/// @notice A case with no reward (rewardAmount == 0) also exists on-chain as a
/// record and completes the same way, without moving funds.
contract RecoveryEscrow is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Role that can only complete an already funded case. It cannot pause,
    /// create cases, or change amounts/recipients beyond what was set at creation.
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    enum CaseStatus {
        NONE,
        FUNDED,
        COMPLETED,
        REFUNDED
    }

    struct RecoveryCase {
        address owner;
        address token;
        uint256 rewardAmount;
        uint64 deadline;
        CaseStatus status;
    }

    mapping(bytes32 => RecoveryCase) public cases;

    event CaseCreated(
        bytes32 indexed caseId,
        address indexed owner,
        address indexed token,
        uint256 rewardAmount,
        uint64 deadline
    );
    event CaseCompleted(bytes32 indexed caseId, address indexed helper, uint256 rewardAmount);
    event CaseRefunded(bytes32 indexed caseId);

    error CaseAlreadyExists();
    error CaseNotFound();
    error CaseNotFunded();
    error RefundNotYetAvailable();
    error InvalidDeadline();
    error InvalidToken();
    error ZeroAddress();

    constructor(address admin, address verifier) {
        if (admin == address(0) || verifier == address(0)) revert ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(VERIFIER_ROLE, verifier);
    }

    /// @notice Creates a case with an optional reward. If rewardAmount > 0, that amount
    /// is transferred from msg.sender to the contract via transferFrom (the owner must
    /// have approved the spend first). If 0, the case is registered without moving funds.
    function createCase(
        bytes32 caseId,
        address token,
        uint256 rewardAmount,
        uint64 deadline
    ) external whenNotPaused {
        if (cases[caseId].status != CaseStatus.NONE) revert CaseAlreadyExists();
        if (token == address(0)) revert InvalidToken();
        if (deadline <= block.timestamp) revert InvalidDeadline();

        if (rewardAmount > 0) {
            IERC20(token).safeTransferFrom(msg.sender, address(this), rewardAmount);
        }

        cases[caseId] = RecoveryCase({
            owner: msg.sender,
            token: token,
            rewardAmount: rewardAmount,
            deadline: deadline,
            status: CaseStatus.FUNDED
        });

        emit CaseCreated(caseId, msg.sender, token, rewardAmount, deadline);
    }

    /// @notice Releases the reward to the helper. VERIFIER_ROLE only. FUNDED cases only.
    /// A COMPLETED case cannot be completed again (enforced by the status check).
    function completeReturn(
        bytes32 caseId,
        address helper
    ) external onlyRole(VERIFIER_ROLE) nonReentrant whenNotPaused {
        RecoveryCase storage c = cases[caseId];
        if (c.status == CaseStatus.NONE) revert CaseNotFound();
        if (c.status != CaseStatus.FUNDED) revert CaseNotFunded();
        if (helper == address(0)) revert ZeroAddress();

        c.status = CaseStatus.COMPLETED;

        if (c.rewardAmount > 0) {
            IERC20(c.token).safeTransfer(helper, c.rewardAmount);
        }

        emit CaseCompleted(caseId, helper, c.rewardAmount);
    }

    /// @notice Returns the funds to the owner if the case expired unresolved.
    /// Anyone can call it.
    function refundExpired(bytes32 caseId) external nonReentrant {
        RecoveryCase storage c = cases[caseId];
        if (c.status == CaseStatus.NONE) revert CaseNotFound();
        if (c.status != CaseStatus.FUNDED) revert CaseNotFunded();
        if (block.timestamp < c.deadline) revert RefundNotYetAvailable();

        c.status = CaseStatus.REFUNDED;

        if (c.rewardAmount > 0) {
            IERC20(c.token).safeTransfer(c.owner, c.rewardAmount);
        }

        emit CaseRefunded(caseId);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /// @notice Public read of the full case, so the fund can be audited without the backend.
    function getCase(bytes32 caseId) external view returns (RecoveryCase memory) {
        return cases[caseId];
    }
}
