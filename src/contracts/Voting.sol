// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title VoteChain – Advanced Multi-Admin Voting Contract
/// @notice This is the source code matching the deployed contract at 0x219b1E30823236b188f38E933A3fad90E79C0883
contract Voting {

    // ─── Enums ──────────────────────────────────────────────────────────────────
    enum TargetGroup { All, VotersOnly, AdminsOnly }

    // ─── Structs ────────────────────────────────────────────────────────────────
    struct Candidate {
        uint256 id;
        string  name;
        uint256 voteCount;
    }

    struct Election {
        uint256 id;
        string  name;
        string  description;
        uint256 startTime;
        uint256 endTime;
        bool    isResultsPublished;
        bool    isPrivate;
        bool    isDeleted;
        bool    isPaused;
        uint256[] candidateIds;
        mapping(uint256 => Candidate) candidates;
        mapping(address => bool)      hasVoted;
        mapping(address => bytes32)   voteReceipts;
        uint256 totalVotes;
    }

    struct Announcement {
        uint256     id;
        string      message;
        uint256     timestamp;
        TargetGroup targetGroup;
    }

    // ─── State ──────────────────────────────────────────────────────────────────
    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(address => bool)) public allowedVoters;
    mapping(uint256 => address[]) public electionVoterRequests;
    mapping(address => bool) public isAdmin;

    Announcement[] public announcements;
    uint256 public electionCount;
    address public superAdmin;

    // ─── Events ─────────────────────────────────────────────────────────────────
    event ElectionCreated(uint256 id, string name, bool isPrivate);
    event ElectionDeleted(uint256 id);
    event ElectionRestarted(uint256 electionId, uint256 newEndTime);
    event ResultsPublished(uint256 electionId);
    event VoteCasted(uint256 electionId, address voter, uint256 candidateId);
    event AnnouncementAdded(string message, uint256 timestamp, TargetGroup targetGroup);

    // ─── Modifiers ───────────────────────────────────────────────────────────────
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Only admin can perform this action");
        _;
    }

    modifier onlyDuringVoting(uint256 _electionId) {
        require(block.timestamp >= elections[_electionId].startTime, "Voting has not started yet");
        require(block.timestamp <= elections[_electionId].endTime, "Voting has ended");
        require(!elections[_electionId].isPaused, "Election is currently paused");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────────────
    constructor() {
        superAdmin = msg.sender;
        isAdmin[msg.sender] = true;
    }

    // ─── Admin Management ────────────────────────────────────────────────────────
    function addAdmin(address _admin) external onlyAdmin {
        isAdmin[_admin] = true;
    }

    function removeAdmin(address _admin) external {
        require(msg.sender == superAdmin, "Only superAdmin can remove admins");
        require(_admin != superAdmin, "Cannot remove superAdmin");
        isAdmin[_admin] = false;
    }

    // ─── Election CRUD ───────────────────────────────────────────────────────────
    function createElection(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        string[] memory _candidateNames,
        bool _isPrivate,
        address[] memory _allowedVoters
    ) external onlyAdmin {
        require(_startTime < _endTime, "Start time must be before end time");

        electionCount++;
        Election storage e = elections[electionCount];
        e.id          = electionCount;
        e.name        = _name;
        e.description = _description;
        e.startTime   = _startTime;
        e.endTime     = _endTime;
        e.isPrivate   = _isPrivate;

        for (uint256 i = 0; i < _candidateNames.length; i++) {
            uint256 cid = i + 1;
            e.candidates[cid] = Candidate({ id: cid, name: _candidateNames[i], voteCount: 0 });
            e.candidateIds.push(cid);
        }

        if (_isPrivate) {
            for (uint256 i = 0; i < _allowedVoters.length; i++) {
                allowedVoters[electionCount][_allowedVoters[i]] = true;
            }
        }

        emit ElectionCreated(electionCount, _name, _isPrivate);
    }

    function deleteElection(uint256 _electionId) external onlyAdmin {
        elections[_electionId].isDeleted = true;
        emit ElectionDeleted(_electionId);
    }

    // ─── Candidate Management ────────────────────────────────────────────────────
    function addCandidate(uint256 _electionId, string memory _name) external onlyAdmin {
        Election storage e = elections[_electionId];
        uint256 cid = e.candidateIds.length + 1;
        e.candidates[cid] = Candidate({ id: cid, name: _name, voteCount: 0 });
        e.candidateIds.push(cid);
    }

    // ─── Voter Management ────────────────────────────────────────────────────────
    function addAllowedVoter(uint256 _electionId, address _voter) external onlyAdmin {
        allowedVoters[_electionId][_voter] = true;
    }

    function addAllowedVoters(uint256 _electionId, address[] memory _voters) external onlyAdmin {
        for (uint256 i = 0; i < _voters.length; i++) {
            allowedVoters[_electionId][_voters[i]] = true;
        }
    }

    function requestToVote(uint256 _electionId) external {
        require(elections[_electionId].isPrivate, "Election is not private");
        electionVoterRequests[_electionId].push(msg.sender);
    }

    function approveVoterRequest(uint256 _electionId, address _voter) external onlyAdmin {
        allowedVoters[_electionId][_voter] = true;
    }

    function getVoterRequests(uint256 _electionId) external view returns (address[] memory) {
        return electionVoterRequests[_electionId];
    }

    // ─── Election Controls ───────────────────────────────────────────────────────
    function pauseElection(uint256 _electionId) external onlyAdmin {
        elections[_electionId].isPaused = true;
    }

    function resumeElection(uint256 _electionId) external onlyAdmin {
        elections[_electionId].isPaused = false;
    }

    function restartElection(uint256 _electionId, uint256 _newEndTime) external onlyAdmin {
        require(_newEndTime > block.timestamp, "New end time must be in the future");
        elections[_electionId].endTime = _newEndTime;
        elections[_electionId].isResultsPublished = false;
        emit ElectionRestarted(_electionId, _newEndTime);
    }

    function publishResults(uint256 _electionId) external onlyAdmin {
        elections[_electionId].isResultsPublished = true;
        emit ResultsPublished(_electionId);
    }

    // ─── Announcements ───────────────────────────────────────────────────────────
    function addAnnouncement(string memory _message, TargetGroup _targetGroup) external onlyAdmin {
        announcements.push(Announcement({
            id:          announcements.length,
            message:     _message,
            timestamp:   block.timestamp,
            targetGroup: _targetGroup
        }));
        emit AnnouncementAdded(_message, block.timestamp, _targetGroup);
    }

    function getAnnouncements() external view returns (Announcement[] memory) {
        return announcements;
    }

    // ─── Voting ──────────────────────────────────────────────────────────────────
    function vote(uint256 _electionId, uint256 _candidateId) external onlyDuringVoting(_electionId) {
        Election storage e = elections[_electionId];

        if (e.isPrivate) {
            require(allowedVoters[_electionId][msg.sender], "Not authorized to vote in this private election");
        }

        require(!e.hasVoted[msg.sender], "You have already voted");

        bool exists = false;
        for (uint256 i = 0; i < e.candidateIds.length; i++) {
            if (e.candidateIds[i] == _candidateId) { exists = true; break; }
        }
        require(exists, "Invalid candidate ID");

        e.candidates[_candidateId].voteCount++;
        e.hasVoted[msg.sender] = true;
        e.totalVotes++;

        // Store vote receipt (hash)
        e.voteReceipts[msg.sender] = keccak256(abi.encodePacked(msg.sender, _electionId, _candidateId, block.timestamp));

        emit VoteCasted(_electionId, msg.sender, _candidateId);
    }

    // ─── View Functions ──────────────────────────────────────────────────────────
    function getElectionCount() external view returns (uint256) {
        return electionCount;
    }

    function getElectionDetails(uint256 _electionId) external view returns (
        uint256 id,
        string  memory name,
        string  memory description,
        uint256 startTime,
        uint256 endTime,
        bool    isResultsPublished,
        bool    isPrivate,
        bool    isDeleted,
        uint256 totalVotes,
        uint256 candidateCount,
        bool    isPaused
    ) {
        Election storage e = elections[_electionId];
        return (
            e.id, e.name, e.description,
            e.startTime, e.endTime,
            e.isResultsPublished, e.isPrivate, e.isDeleted,
            e.totalVotes, e.candidateIds.length, e.isPaused
        );
    }

    function getCandidates(uint256 _electionId) external view returns (
        uint256[] memory ids,
        string[]  memory names,
        uint256[] memory voteCounts
    ) {
        Election storage e = elections[_electionId];
        uint256 n = e.candidateIds.length;
        ids        = new uint256[](n);
        names      = new string[](n);
        voteCounts = new uint256[](n);

        for (uint256 i = 0; i < n; i++) {
            uint256 cid = e.candidateIds[i];
            ids[i]      = e.candidates[cid].id;
            names[i]    = e.candidates[cid].name;
            voteCounts[i] = e.isResultsPublished ? e.candidates[cid].voteCount : 0;
        }
    }

    function checkUserVoted(uint256 _electionId, address _voter) external view returns (bool) {
        return elections[_electionId].hasVoted[_voter];
    }

    function checkUserEligible(uint256 _electionId, address _voter) external view returns (bool) {
        if (!elections[_electionId].isPrivate) return true;
        return allowedVoters[_electionId][_voter];
    }

    function getVoteReceipt(uint256 _electionId, address _voter) external view returns (bytes32) {
        return elections[_electionId].voteReceipts[_voter];
    }
}
