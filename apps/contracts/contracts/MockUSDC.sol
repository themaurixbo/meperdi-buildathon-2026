// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockUSDC — test token for the ME PERDÍ demo (Buildathon).
/// @notice NOT a real stablecoin, it has no economic value. It only exists to
/// demonstrate the reward escrow flow on the HSK Chain testnet.
contract MockUSDC is ERC20, Ownable {
    constructor() ERC20("USDC de prueba (ME PERDI demo)", "mUSDC") Ownable(msg.sender) {}

    /// @dev 6 decimals, same as real USDC, so demo amounts read the same.
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /// @notice Mints test tokens. Contract owner only.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
