// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract WorkVerification {

    struct Submission {
        address student;
        string  title;
        string  cid;
        address mentor;
        bool    approved;
        uint256 submittedAt;
        uint256 approvedAt;
    }

    address public owner;
    Submission[] public submissions;

    mapping(address => string) public mentorDomains;
    mapping(address => bool) public verifiedMentors;
    mapping(address => uint256[]) private studentSubmissions;
    mapping(string => bool) private usedCids;

    event WorkSubmitted(uint256 indexed id, address indexed student, string title, string cid);
    event WorkApproved(uint256 indexed id, address indexed mentor, string domain);
    event MentorRegistered(address indexed mentor, string domain);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerMentor(address _mentor, string calldata _domain) external onlyOwner {
        require(bytes(_domain).length > 0, "Domain required");
        mentorDomains[_mentor] = _domain;
        verifiedMentors[_mentor] = true;
        emit MentorRegistered(_mentor, _domain);
    }

    function selfRegisterMentor(string calldata _domain) external {
        require(bytes(_domain).length > 0, "Domain required");
        mentorDomains[msg.sender] = _domain;
        verifiedMentors[msg.sender] = true;
        emit MentorRegistered(msg.sender, _domain);
    }

    function submitWork(string calldata _title, string calldata _cid) external {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_cid).length > 0, "CID required");
        require(!usedCids[_cid], "Duplicate CID");

        usedCids[_cid] = true;
        uint256 id = submissions.length;

        submissions.push(Submission({
            student:     msg.sender,
            title:       _title,
            cid:         _cid,
            mentor:      address(0),
            approved:    false,
            submittedAt: block.timestamp,
            approvedAt:  0
        }));

        studentSubmissions[msg.sender].push(id);
        emit WorkSubmitted(id, msg.sender, _title, _cid);
    }

    function approveWork(uint256 _id) external {
        require(_id < submissions.length, "Invalid submission ID");
        require(verifiedMentors[msg.sender], "Not a verified mentor");
        Submission storage sub = submissions[_id];
        require(!sub.approved, "Already approved");
        require(msg.sender != sub.student, "Cannot self-approve");

        sub.mentor     = msg.sender;
        sub.approved   = true;
        sub.approvedAt = block.timestamp;

        emit WorkApproved(_id, msg.sender, mentorDomains[msg.sender]);
    }

    function getSubmission(uint256 _id)
        external
        view
        returns (
            address student,
            string memory title,
            string memory cid,
            address mentor,
            bool    approved,
            uint256 submittedAt,
            uint256 approvedAt
        )
    {
        require(_id < submissions.length, "Invalid submission ID");
        Submission storage sub = submissions[_id];
        return (sub.student, sub.title, sub.cid, sub.mentor, sub.approved, sub.submittedAt, sub.approvedAt);
    }

    function getSubmissionCount() external view returns (uint256) {
        return submissions.length;
    }

    function getStudentSubmissionIds(address _student) external view returns (uint256[] memory) {
        return studentSubmissions[_student];
    }

    function getMentorDomain(address _mentor) external view returns (string memory) {
        return mentorDomains[_mentor];
    }

    function isMentorVerified(address _mentor) external view returns (bool) {
        return verifiedMentors[_mentor];
    }
}
