import { parseAbi } from 'viem';

export const QUEST_BADGES_ADDR = '0xA530E9242eDeb983fdB41a82A046C3330A430662';
export const DEMO_RECIPIENT_ADDR = '0x9F98cd2fC14bfd7E216eC1c18423b4f4192ffC14';
export const MOCK_TOKEN_ADDR = '0x489e22F71d706c8EBD4Da64C23E0eec6da326720';
export const MOCK_DEX_ADDR = '0x312caE32018fa015940A6112BD6388Cefb63a4bF';

export const questBadgesAbi = parseAbi([
  'function completeQuest(uint8 questId) external',
  'function hasCompleted(address user, uint8 questId) external view returns (bool)'
]);

export const mockTokenAbi = parseAbi([
  'function balanceOf(address owner) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function mint(address to, uint256 amount) external',
  'function transfer(address to, uint256 amount) external returns (bool)'
]);

export const mockDexAbi = parseAbi([
  'function pullTokens(uint256 amount) external',
  'function swapMonForToken() external payable'
]);
