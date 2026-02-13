// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title NeuraBountyBoard
 * @notice Decentralized bounty platform with native ANKR payments and onchain reputation
 * @dev Single file, no imports, no external libraries
 */
contract NeuraBountyBoard {
    // ============ State Variables ============
    address public owner;
    address public feeRecipient;
    uint256 public feeBps; // basis points, max 200 (2%)
    uint256 public constant MAX_FEE_BPS = 200;
    bool public paused;
    uint256 public bountyCounter;
    
    // Reentrancy guard
    uint256 private _locked;
    
    // ============ Enums ============
    enum Status { Open, Review, Awarded, Cancelled, Refundable }
    
    // ============ Structs ============
    struct Bounty {
        uint256 id;
        address creator;
        uint256 reward;
        uint256 deadline;
        uint256 reviewEnd;
        Status status;
        string title;
        string description;
        address winner;
        bool paid;
    }
    
    struct Submission {
        address submitter;
        string evidence;
        uint256 createdAt;
    }
    
    // ============ Mappings ============
    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => Submission[]) public submissions;
    mapping(uint256 => mapping(address => bool)) public hasSubmitted;
    mapping(address => uint256) public reputation;
    
    // ============ Events ============
    event BountyCreated(uint256 indexed bountyId, address indexed creator, uint256 reward, uint256 deadline);
    event SubmissionAdded(uint256 indexed bountyId, address indexed submitter, uint256 submissionIndex);
    event WinnerAwarded(uint256 indexed bountyId, address indexed winner);
    event BountyPaid(uint256 indexed bountyId, address indexed winner, uint256 amount);
    event BountyCancelled(uint256 indexed bountyId);
    event BountyRefunded(uint256 indexed bountyId, address indexed creator, uint256 amount);
    event ReputationIncreased(address indexed user, uint256 newReputation);
    event ParamsUpdated(uint256 feeBps, address feeRecipient);
    event Paused(bool isPaused);
    
    // ============ Modifiers ============
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }
    
    modifier nonReentrant() {
        require(_locked == 0, "Reentrant call");
        _locked = 1;
        _;
        _locked = 0;
    }
    
    // ============ Constructor ============
    constructor() {
        owner = msg.sender;
        feeRecipient = msg.sender;
        feeBps = 0;
        paused = false;
        bountyCounter = 0;
        _locked = 0;
    }
    
    // ============ Admin Functions ============
    function pause() external onlyOwner {
        paused = true;
        emit Paused(true);
    }
    
    function unpause() external onlyOwner {
        paused = false;
        emit Paused(false);
    }
    
    function setParams(uint256 _feeBps, address _feeRecipient) external onlyOwner {
        require(_feeBps <= MAX_FEE_BPS, "Fee too high");
        require(_feeRecipient != address(0), "Zero address");
        feeBps = _feeBps;
        feeRecipient = _feeRecipient;
        emit ParamsUpdated(_feeBps, _feeRecipient);
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        owner = newOwner;
    }
    
    // ============ Bounty Functions ============
    function createBounty(
        string calldata _title,
        string calldata _description,
        uint256 _deadline,
        uint256 _reviewPeriodSeconds
    ) external payable whenNotPaused nonReentrant returns (uint256) {
        require(msg.value > 0, "Reward required");
        require(_deadline > block.timestamp, "Deadline must be future");
        require(bytes(_title).length > 0 && bytes(_title).length <= 80, "Title 1-80 chars");
        require(bytes(_description).length <= 500, "Description max 500 chars");
        require(_reviewPeriodSeconds > 0, "Review period required");
        
        uint256 bountyId = bountyCounter;
        bountyCounter++;
        
        Bounty storage b = bounties[bountyId];
        b.id = bountyId;
        b.creator = msg.sender;
        b.reward = msg.value;
        b.deadline = _deadline;
        b.reviewEnd = _deadline + _reviewPeriodSeconds;
        b.status = Status.Open;
        b.title = _title;
        b.description = _description;
        b.winner = address(0);
        b.paid = false;
        
        emit BountyCreated(bountyId, msg.sender, msg.value, _deadline);
        return bountyId;
    }
    
    function submitSolution(
        uint256 _bountyId,
        string calldata _evidence,
        string calldata _note
    ) external whenNotPaused nonReentrant {
        require(_bountyId < bountyCounter, "Invalid bounty");
        Bounty storage b = bounties[_bountyId];
        
        _updateBountyStatus(_bountyId);
        require(b.status == Status.Open, "Not accepting submissions");
        require(block.timestamp < b.deadline, "Deadline passed");
        require(!hasSubmitted[_bountyId][msg.sender], "Already submitted");
        require(bytes(_evidence).length > 0, "Evidence required");
        require(bytes(_note).length <= 200, "Note max 200 chars");
        
        hasSubmitted[_bountyId][msg.sender] = true;
        
        Submission memory sub;
        sub.submitter = msg.sender;
        sub.evidence = string(abi.encodePacked(_evidence, "|", _note));
        sub.createdAt = block.timestamp;
        
        submissions[_bountyId].push(sub);
        
        emit SubmissionAdded(_bountyId, msg.sender, submissions[_bountyId].length - 1);
    }
    
    function awardWinner(uint256 _bountyId, address _winner) external whenNotPaused nonReentrant {
        require(_bountyId < bountyCounter, "Invalid bounty");
        require(_winner != address(0), "Zero address");
        
        Bounty storage b = bounties[_bountyId];
        _updateBountyStatus(_bountyId);
        
        require(msg.sender == b.creator, "Not creator");
        require(b.status == Status.Review, "Not in review");
        require(hasSubmitted[_bountyId][_winner], "Winner not submitted");
        require(!b.paid, "Already paid");
        
        b.winner = _winner;
        b.status = Status.Awarded;
        
        emit WinnerAwarded(_bountyId, _winner);
        
        // Calculate fee and payout
        uint256 fee = 0;
        uint256 payout = b.reward;
        
        if (feeBps > 0 && feeRecipient != address(0)) {
            fee = (b.reward * feeBps) / 10000;
            payout = b.reward - fee;
        }
        
        b.paid = true;
        
        // Transfer fee if applicable
        if (fee > 0) {
            (bool feeSuccess, ) = feeRecipient.call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        // Transfer payout to winner
        (bool success, ) = _winner.call{value: payout}("");
        require(success, "Payout failed");
        
        // Update reputation
        reputation[_winner] += 10;
        
        emit BountyPaid(_bountyId, _winner, payout);
        emit ReputationIncreased(_winner, reputation[_winner]);
    }
    
    function cancelBounty(uint256 _bountyId) external whenNotPaused nonReentrant {
        require(_bountyId < bountyCounter, "Invalid bounty");
        Bounty storage b = bounties[_bountyId];
        
        require(msg.sender == b.creator, "Not creator");
        require(b.status == Status.Open, "Cannot cancel");
        require(submissions[_bountyId].length == 0, "Has submissions");
        require(!b.paid, "Already paid");
        
        b.status = Status.Cancelled;
        
        uint256 refundAmount = b.reward;
        b.reward = 0;
        
        (bool success, ) = b.creator.call{value: refundAmount}("");
        require(success, "Refund failed");
        
        emit BountyCancelled(_bountyId);
    }
    
    function claimRefund(uint256 _bountyId) external whenNotPaused nonReentrant {
        require(_bountyId < bountyCounter, "Invalid bounty");
        Bounty storage b = bounties[_bountyId];
        
        _updateBountyStatus(_bountyId);
        
        require(msg.sender == b.creator, "Not creator");
        require(b.status == Status.Refundable, "Not refundable");
        require(!b.paid, "Already paid");
        
        b.paid = true;
        uint256 refundAmount = b.reward;
        
        (bool success, ) = b.creator.call{value: refundAmount}("");
        require(success, "Refund failed");
        
        emit BountyRefunded(_bountyId, b.creator, refundAmount);
    }
    
    // ============ Internal Functions ============
    function _updateBountyStatus(uint256 _bountyId) internal {
        Bounty storage b = bounties[_bountyId];
        
        if (b.status == Status.Open && block.timestamp >= b.deadline) {
            b.status = Status.Review;
        }
        
        if (b.status == Status.Review && block.timestamp >= b.reviewEnd && b.winner == address(0)) {
            b.status = Status.Refundable;
        }
    }
    
    // ============ View Functions ============
    function getBountyCore(uint256 _bountyId) external view returns (
        uint256 id,
        address creator,
        uint256 reward,
        uint256 deadline,
        uint256 reviewEnd,
        uint8 status
    ) {
        require(_bountyId < bountyCounter, "Invalid bounty");
        Bounty storage b = bounties[_bountyId];
        
        uint8 currentStatus = uint8(b.status);
        
        // Calculate current status without modifying state
        if (b.status == Status.Open && block.timestamp >= b.deadline) {
            currentStatus = uint8(Status.Review);
        }
        if (currentStatus == uint8(Status.Review) && block.timestamp >= b.reviewEnd && b.winner == address(0)) {
            currentStatus = uint8(Status.Refundable);
        }
        
        return (b.id, b.creator, b.reward, b.deadline, b.reviewEnd, currentStatus);
    }
    
    function getBountyText(uint256 _bountyId) external view returns (
        string memory title,
        string memory description
    ) {
        require(_bountyId < bountyCounter, "Invalid bounty");
        Bounty storage b = bounties[_bountyId];
        return (b.title, b.description);
    }
    
    function getBountyWinner(uint256 _bountyId) external view returns (address winner, bool paid) {
        require(_bountyId < bountyCounter, "Invalid bounty");
        Bounty storage b = bounties[_bountyId];
        return (b.winner, b.paid);
    }
    
    function getSubmissionCore(uint256 _bountyId, uint256 _index) external view returns (
        address submitter,
        string memory evidence,
        uint256 createdAt
    ) {
        require(_bountyId < bountyCounter, "Invalid bounty");
        require(_index < submissions[_bountyId].length, "Invalid index");
        Submission storage s = submissions[_bountyId][_index];
        return (s.submitter, s.evidence, s.createdAt);
    }
    
    function getCounts(uint256 _bountyId) external view returns (uint256 submissionCount) {
        require(_bountyId < bountyCounter, "Invalid bounty");
        return submissions[_bountyId].length;
    }
    
    function getUserReputation(address _user) external view returns (uint256) {
        return reputation[_user];
    }
    
    function getTreasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getTotalBounties() external view returns (uint256) {
        return bountyCounter;
    }
    
    // Receive function to accept native ANKR
    receive() external payable {}
}
