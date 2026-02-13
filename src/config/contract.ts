export const CONTRACT_ADDRESS = '0x14F8054C72c1d5B61854EB49E9205Db74eab3371' // Deploy and update this

export const NEURA_TESTNET = {
  chainId: 267,
  chainIdHex: "0x10B",
  chainName: "Neura Testnet",
  nativeCurrency: {
    name: "ANKR",
    symbol: "ANKR",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.ankr.com/neura_testnet"],
  blockExplorerUrls: ["https://explorer.neura-testnet.ankr.com"],
};

export const CONTRACT_ABI = [
  // Admin
  "function owner() view returns (address)",
  "function feeRecipient() view returns (address)",
  "function feeBps() view returns (uint256)",
  "function paused() view returns (bool)",
  "function pause()",
  "function unpause()",
  "function setParams(uint256 _feeBps, address _feeRecipient)",
  "function transferOwnership(address newOwner)",
  
  // Bounty Functions
  "function createBounty(string _title, string _description, uint256 _deadline, uint256 _reviewPeriodSeconds) payable returns (uint256)",
  "function submitSolution(uint256 _bountyId, string _evidence, string _note)",
  "function awardWinner(uint256 _bountyId, address _winner)",
  "function cancelBounty(uint256 _bountyId)",
  "function claimRefund(uint256 _bountyId)",
  
  // View Functions
  "function getBountyCore(uint256 _bountyId) view returns (uint256 id, address creator, uint256 reward, uint256 deadline, uint256 reviewEnd, uint8 status)",
  "function getBountyText(uint256 _bountyId) view returns (string title, string description)",
  "function getBountyWinner(uint256 _bountyId) view returns (address winner, bool paid)",
  "function getSubmissionCore(uint256 _bountyId, uint256 _index) view returns (address submitter, string evidence, uint256 createdAt)",
  "function getCounts(uint256 _bountyId) view returns (uint256 submissionCount)",
  "function getUserReputation(address _user) view returns (uint256)",
  "function getTreasuryBalance() view returns (uint256)",
  "function getTotalBounties() view returns (uint256)",
  "function hasSubmitted(uint256, address) view returns (bool)",
  "function bountyCounter() view returns (uint256)",
  
  // Events
  "event BountyCreated(uint256 indexed bountyId, address indexed creator, uint256 reward, uint256 deadline)",
  "event SubmissionAdded(uint256 indexed bountyId, address indexed submitter, uint256 submissionIndex)",
  "event WinnerAwarded(uint256 indexed bountyId, address indexed winner)",
  "event BountyPaid(uint256 indexed bountyId, address indexed winner, uint256 amount)",
  "event BountyCancelled(uint256 indexed bountyId)",
  "event BountyRefunded(uint256 indexed bountyId, address indexed creator, uint256 amount)",
  "event ReputationIncreased(address indexed user, uint256 newReputation)",
  "event ParamsUpdated(uint256 feeBps, address feeRecipient)",
  "event Paused(bool isPaused)",
]
