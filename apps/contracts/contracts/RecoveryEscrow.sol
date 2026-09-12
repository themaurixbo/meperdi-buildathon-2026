// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title RecoveryEscrow — custodia de recompensas opcionales de ME PERDÍ.
/// @notice ME PERDÍ premia la devolución segura, nunca incentiva a salir a buscar
/// mascotas u objetos por dinero. La recompensa es siempre opcional y la fija el
/// dueño al crear el caso. El pago se libera solo cuando el verificador (backend)
/// confirma que el finder presentó el código de entrega de 6 dígitos correcto.
/// @notice On-chain solo se guardan montos, estados, fechas y un caseId que es un
/// hash (bytes32). Nunca nombre, teléfono, ubicación, fotos ni mensajes.
/// @notice Un caso sin recompensa (rewardAmount == 0) también existe on-chain como
/// registro y se completa igual, sin mover fondos.
contract RecoveryEscrow is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Rol que solo puede completar un caso ya fondeado. No puede pausar,
    /// crear casos ni cambiar montos/destinatarios fuera de lo validado al crear.
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

    /// @notice Crea un caso con recompensa opcional. Si rewardAmount > 0, transfiere
    /// ese monto desde msg.sender al contrato vía transferFrom (el dueño debe haber
    /// aprobado el gasto antes). Si es 0, el caso se registra sin mover fondos.
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

    /// @notice Libera la recompensa al helper. Solo VERIFIER_ROLE. Solo casos FUNDED.
    /// Un caso COMPLETED no puede volver a completarse (chequeo de status).
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

    /// @notice Devuelve los fondos al dueño si el caso venció sin resolverse.
    /// Cualquiera puede llamarla.
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

    /// @notice Lectura pública del caso completo, para auditar el fondo sin backend.
    function getCase(bytes32 caseId) external view returns (RecoveryCase memory) {
        return cases[caseId];
    }
}
