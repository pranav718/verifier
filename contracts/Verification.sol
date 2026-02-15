// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title WorkVerification
/// @notice Blockchain-based freelance & internship work verification
/// @dev Students submit work CIDs, mentors approve them on-chain
contract WorkVerification {

    struct Submission {
        address student;
        string  title;
        string  cid;        // IPFS content identifier
        address mentor;     // address(0) until approved
        bool    approved;
        uint256 submittedAt;
        uint256 approvedAt;
    }

    Submission[] public submissions;

    event WorkSubmitted(uint256 indexed id, address indexed student, string title, string cid);
    event WorkApproved(uint256 indexed id, address indexed mentor);

    /// @notice Student submits a new piece of work
    /// @param _title  Human-readable title of the work
    /// @param _cid    IPFS CID of the uploaded proof file
    function submitWork(string calldata _title, string calldata _cid) external {
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_cid).length > 0,   "CID required");

        submissions.push(Submission({
            student:     msg.sender,
            title:       _title,
            cid:         _cid,
            mentor:      address(0),
            approved:    false,
            submittedAt: block.timestamp,
            approvedAt:  0
        }));

        emit WorkSubmitted(submissions.length - 1, msg.sender, _title, _cid);
    }

    /// @notice Mentor approves an existing submission
    /// @param _id  Index of the submission to approve
    function approveWork(uint256 _id) external {
        require(_id < submissions.length, "Invalid submission ID");
        Submission storage sub = submissions[_id];
        require(!sub.approved, "Already approved");
        require(msg.sender != sub.student, "Cannot self-approve");

        sub.mentor     = msg.sender;
        sub.approved   = true;
        sub.approvedAt = block.timestamp;

        emit WorkApproved(_id, msg.sender);
    }

    /// @notice Get full details of a submission (for recruiter verification)
    /// @param _id  Index of the submission
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

    /// @notice Total number of submissions
    function getSubmissionCount() external view returns (uint256) {
        return submissions.length;
    }
}
