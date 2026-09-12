// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockUSDC — token de prueba para la demo de ME PERDÍ (Buildathon).
/// @notice NO es una stablecoin real, no tiene valor económico. Solo sirve para
/// demostrar el flujo de custodia de recompensas en la testnet de HSK Chain.
contract MockUSDC is ERC20, Ownable {
    constructor() ERC20("USDC de prueba (ME PERDI demo)", "mUSDC") Ownable(msg.sender) {}

    /// @dev 6 decimales, igual que USDC real, para que los montos de demo se lean igual.
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Acuña tokens de prueba. Solo el owner del contrato.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
