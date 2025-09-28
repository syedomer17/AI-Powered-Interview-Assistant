import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { candidateAPI, interviewAPI, API_BASE_URL } from "../services/api";
import ResumeSummaryCard from "../components/ResumeSummaryCard.jsx";

const CandidateDetails = () => {
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    fetchCandidateDetails();
  }, [candidateId]);

  const fetchCandidateDetails = async () => {
    try {
      const candidateResponse = await candidateAPI.getById(candidateId);
      setCandidate(candidateResponse.data);

      // Fetch interviews for this candidate
      const interviewsResponse = await interviewAPI.getAll();
      const candidateInterviews = interviewsResponse.data.filter(
        (interview) => {
          const interviewCandidateId =
            interview.candidate?._id ||
            interview.candidate?.id ||
            interview.candidate;
          return interviewCandidateId === candidateId;
        }
      );

      console.log("=== CANDIDATE DETAILS DEBUG ===");
      console.log("Candidate ID:", candidateId);
      console.log("All interviews:", interviewsResponse.data);
      console.log("Matching interviews:", candidateInterviews);

      // Debug question structure
      if (candidateInterviews.length > 0 && candidateInterviews[0].questions) {
        console.log(
          "Sample question structure:",
          candidateInterviews[0].questions[0]
        );
        candidateInterviews[0].questions.forEach((q, i) => {
          console.log(
            `Question ${i + 1}: answer="${q.answer}", answered="${
              q.answered
            }", timedOut="${q.timedOut}", score="${q.score}"`
          );
        });
      }

      setInterviews(candidateInterviews);
    } catch (error) {
      console.error("Failed to fetch candidate details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Candidate not found</p>
          <Link
            to="/dashboard"
            className="mt-4 text-indigo-600 hover:text-indigo-500"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
                {candidate.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Candidate Profile & Interview History
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-4"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Candidate Information */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Profile Information
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center justify-center mb-4 sm:mb-6">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-xl sm:text-2xl font-bold text-white">
                      {candidate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{candidate.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {candidate.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Phone
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {candidate.phone}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Registration Date
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(candidate.createdAt)}
                  </p>
                </div>

                {candidate.missingFields &&
                  candidate.missingFields.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Missing Fields
                      </label>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {candidate.missingFields.join(", ")}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Resume Information */}
            {candidate.resumeSummary && (
              <ResumeSummaryCard candidate={candidate} />
            )}
          </div>

          {/* Interview History */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">
                  Interview History ({interviews.length})
                </h3>
              </div>

              {interviews.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {interviews.map((interview) => (
                    <div key={interview._id} className="px-4 sm:px-6 py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
                            <h4 className="text-sm font-medium text-gray-900">
                              Interview #{interview._id.slice(-6)}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  interview.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : interview.status === "in_progress"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {interview.status
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </span>
                              {interview.finalScore && (
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(
                                    interview.finalScore * 10
                                  )}`}
                                >
                                  {interview.finalScore}/10
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-sm text-gray-500 mb-2">
                            Started: {formatDate(interview.createdAt)}
                          </p>

                          {interview.questions && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-600 mb-2">
                                Questions: {interview.questions.length} |
                                Answered:{" "}
                                {
                                  interview.questions.filter(
                                    (q) => q.answer || q.timedOut
                                  ).length
                                }
                              </p>

                              <button
                                onClick={() =>
                                  setSelectedInterview(
                                    selectedInterview === interview._id
                                      ? null
                                      : interview._id
                                  )
                                }
                                className="text-sm text-indigo-600 hover:text-indigo-500"
                              >
                                {selectedInterview === interview._id
                                  ? "Hide Details"
                                  : "Show Details"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expanded Interview Details */}
                      {selectedInterview === interview._id && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          <div className="space-y-3 sm:space-y-4">
                            {interview.questions.map((question, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 rounded-lg p-3 sm:p-4"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 space-y-2 sm:space-y-0">
                                  <h5 className="text-sm font-medium text-gray-900">
                                    Question {index + 1}
                                  </h5>
                                  <div className="flex items-center flex-wrap gap-2">
                                    {question.score && (
                                      <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                                          question.score
                                        )}`}
                                      >
                                        {question.score}/10
                                      </span>
                                    )}
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        question.answer || question.timedOut
                                          ? "bg-green-100 text-green-800"
                                          : "bg-gray-100 text-gray-600"
                                      }`}
                                    >
                                      {question.answer || question.timedOut
                                        ? "Answered"
                                        : "Unanswered"}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-xs sm:text-sm text-gray-700 mb-2 break-words">
                                  <strong>Q:</strong> {question.text}
                                </p>

                                {question.answer && (
                                  <div className="mt-2">
                                    <p className="text-xs sm:text-sm text-gray-700 break-words">
                                      <strong>A:</strong> {question.answer}
                                    </p>
                                  </div>
                                )}

                                {(question.feedback || question.reasoning) && (
                                  <div className="mt-2 p-2 sm:p-3 bg-blue-50 rounded border-l-4 border-blue-200">
                                    <p className="text-xs sm:text-sm text-blue-700 break-words">
                                      <strong>AI Feedback:</strong>{" "}
                                      {question.feedback || question.reasoning}
                                    </p>
                                  </div>
                                )}

                                {question.startedAt && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Started: {formatDate(question.startedAt)}
                                    {question.answeredAt && (
                                      <span>
                                        {" "}
                                        | Answered:{" "}
                                        {formatDate(question.answeredAt)}
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>

                          {interview.summary && (
                            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                              <h5 className="text-sm font-medium text-indigo-900 mb-2">
                                Interview Summary
                              </h5>
                              <p className="text-sm text-indigo-800">
                                {interview.summary}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No interviews yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This candidate hasn't taken any interviews yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails;
