import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("DeployModule", (m) => {
  const questBadges = m.contract("QuestBadges");
  
  const mockToken = m.contract("MockToken");
  
  const mockDEX = m.contract("MockDEX", [mockToken]);

  // Mint 10,000 tokens to MockDEX so it has liquidity for Quest 4
  const mintAmount = 10000n * 10n ** 18n;
  m.call(mockToken, "mint", [mockDEX, mintAmount]);

  return { questBadges, mockToken, mockDEX };
});

export default DeployModule;
