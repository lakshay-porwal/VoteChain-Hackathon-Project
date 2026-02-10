// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Election {
        uint256 id;
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isResultsPublished;
        bool isPrivate; // If true, only allowed voters can vote
        bool isDeleted; // Soft delete flag
        uint256[] candidateIds;
        mapping(uint256 => Candidate) candidates;
        mapping(address => bool) hasVoted;
        uint256 totalVotes;
    }
    
    struct Announcement {
        uint256 id;
        string message;
        uint256 timestamp;
    }

    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(address => bool)) public allowedVoters; // For private elections
    Announcement[] public announcements;
    
    uint256 public electionCount;
    address public admin;

    event ElectionCreated(uint256 id, string name, bool isPrivate);
    event ElectionDeleted(uint256 id);
    event VoteCasted(uint256 electionId, address voter, uint256 candidateId);
    event ResultsPublished(uint256 electionId);
    event ElectionRestarted(uint256 electionId, uint256 newEndTime);
    event AnnouncementAdded(string message, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyDuringVoting(uint256 _electionId) {
        require(block.timestamp >= elections[_electionId].startTime, "Voting has not started yet");
        require(block.timestamp <= elections[_electionId].endTime, "Voting has ended");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // 1. Create Election (Enhanced)
    function createElection(
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        string[] memory _candidateNames,
        bool _isPrivate,
        address[] memory _allowedVoters
    ) public onlyAdmin {
        require(_startTime < _endTime, "Start time must be before end time");

        electionCount++;
        Election storage newElection = elections[electionCount];
        newElection.id = electionCount;
        newElection.name = _name;
        newElection.description = _description;
        newElection.startTime = _startTime;
        newElection.endTime = _endTime;
        newElection.isResultsPublished = false;
        newElection.isPrivate = _isPrivate;
        newElection.isDeleted = false;
        newElection.totalVotes = 0;

        for (uint256 i = 0; i < _candidateNames.length; i++) {
            uint256 candidateId = i + 1;
            newElection.candidates[candidateId] = Candidate({
                id: candidateId,
                name: _candidateNames[i],
                voteCount: 0
            });
            newElection.candidateIds.push(candidateId);
        }
        
        // Add allowed voters if private
        if (_isPrivate) {
            for (uint256 i = 0; i < _allowedVoters.length; i++) {
                allowedVoters[electionCount][_allowedVoters[i]] = true;
            }
        }

        emit ElectionCreated(electionCount, _name, _isPrivate);
    }

    // 2. Restart Election
    function restartElection(uint256 _electionId, uint256 _newEndTime) public onlyAdmin {
        require(block.timestamp > elections[_electionId].endTime, "Election is still active");
        require(_newEndTime > block.timestamp, "New end time must be in future");
        
        elections[_electionId].endTime = _newEndTime;
        elections[_electionId].isResultsPublished = false; // Hide results if they were published
        
        emit ElectionRestarted(_electionId, _newEndTime);
    }
    
    // 3. Add Announcement
    function addAnnouncement(string memory _message) public onlyAdmin {
        announcements.push(Announcement({
            id: announcements.length,
            message: _message,
            timestamp: block.timestamp
        }));
        emit AnnouncementAdded(_message, block.timestamp);
    }
    
    // 4. Vote (Enhanced with Private check)
    function vote(uint256 _electionId, uint256 _candidateId) public onlyDuringVoting(_electionId) {
        Election storage election = elections[_electionId];
        
        if (election.isPrivate) {
            require(allowedVoters[_electionId][msg.sender], "You are not authorized to vote in this private election");
        }
        
        require(!election.hasVoted[msg.sender], "You have already voted in this election");
        
        bool candidateExists = false;
        for(uint i=0; i<election.candidateIds.length; i++) {
            if(election.candidateIds[i] == _candidateId) {
                candidateExists = true;
                break;
            }
        }
        require(candidateExists, "Invalid candidate ID");

        election.candidates[_candidateId].voteCount++;
        election.hasVoted[msg.sender] = true;
        election.totalVotes++;

        emit VoteCasted(_electionId, msg.sender, _candidateId);
    }

    function deleteElection(uint256 _electionId) public onlyAdmin {
        elections[_electionId].isDeleted = true;
        emit ElectionDeleted(_electionId);
    }
    
    // 5. Add Voter to Whitelist (Post-creation & Batch)
    function addAllowedVoter(uint256 _electionId, address _voter) public onlyAdmin {
        allowedVoters[_electionId][_voter] = true;
    }

    function addAllowedVoters(uint256 _electionId, address[] memory _voters) public onlyAdmin {
        for (uint256 i = 0; i < _voters.length; i++) {
            allowedVoters[_electionId][_voters[i]] = true;
        }
    }

    function publishResults(uint256 _electionId) public onlyAdmin {
        require(block.timestamp > elections[_electionId].endTime, "Voting is still ongoing");
        elections[_electionId].isResultsPublished = true;
        emit ResultsPublished(_electionId);
    }

    function getElectionDetails(uint256 _electionId) public view returns (
        uint256 id,
        string memory name,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        bool isResultsPublished,
        bool isPrivate,
        bool isDeleted,
        uint256 totalVotes,
        uint256 candidateCount
    ) {
        Election storage election = elections[_electionId];
        return (
            election.id,
            election.name,
            election.description,
            election.startTime,
            election.endTime,
            election.isResultsPublished,
            election.isPrivate,
            election.isDeleted,
            election.totalVotes,
            election.candidateIds.length
        );
    }
    
    function getCandidates(uint256 _electionId) public view returns (uint256[] memory ids, string[] memory names, uint256[] memory voteCounts) {
        Election storage election = elections[_electionId];
        uint256 count = election.candidateIds.length;
        
        ids = new uint256[](count);
        names = new string[](count);
        voteCounts = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            uint256 catId = election.candidateIds[i];
            Candidate storage candidate = election.candidates[catId];
            ids[i] = candidate.id;
            names[i] = candidate.name;
            if (election.isResultsPublished) {
                voteCounts[i] = candidate.voteCount;
            } else {
                voteCounts[i] = 0;
            }
        }
    }
    
    function checkUserVoted(uint256 _electionId, address _voter) public view returns (bool) {
        return elections[_electionId].hasVoted[_voter];
    }
    
    function checkUserEligible(uint256 _electionId, address _voter) public view returns (bool) {
        if (!elections[_electionId].isPrivate) return true;
        return allowedVoters[_electionId][_voter];
    }

    function getElectionCount() public view returns (uint256) {
        return electionCount;
    }
    
    function getAnnouncements() public view returns (Announcement[] memory) {
        return announcements;
    }
}
