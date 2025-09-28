import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { candidateAPI, interviewAPI } from '../services/api';

const InterviewerDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');            // 'date' | 'name' | 'score'
  const [filterBy, setFilterBy] = useState('all');          // 'all' | 'interviewed' | 'not-interviewed'

  useEffect(() => {
    (async () => {
      try {
        const [cRes, iRes] = await Promise.all([candidateAPI.getAll(), interviewAPI.getAll()]);
        setCandidates(cRes.data || []);
        setInterviews(iRes.data || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---------- Helpers ----------
  const getCandidateId = (c) => String(c?._id ?? c?.id ?? '');
  const getInterviewCandidateId = (iv) =>
    String(iv?.candidate?._id ?? iv?.candidate?.id ?? iv?.candidate ?? '');

  const getCandidateInterviews = (candidate) => {
    const cid = getCandidateId(candidate);
    if (!cid) return [];
    return interviews.filter((iv) => getInterviewCandidateId(iv) === cid);
  };

  const getLatestInterviewScore = (candidate) => {
    const candidateInterviews = getCandidateInterviews(candidate).filter(
      (iv) => iv?.status === 'completed'
    );
    if (candidateInterviews.length === 0) return 0;

    // latest by createdAt
    const latest = candidateInterviews.reduce((a, b) =>
      new Date(b?.createdAt || 0) > new Date(a?.createdAt || 0) ? b : a
    );
    const score = Number(latest?.finalScore ?? latest?.score ?? 0);
    return Number.isFinite(score) ? score : 0;
  };

  const getInterviewStatus = (candidate) => {
    const ivs = getCandidateInterviews(candidate);
    if (ivs.length === 0) return 'Not Interviewed';
    const latest = ivs.reduce((a, b) =>
      new Date(b?.createdAt || 0) > new Date(a?.createdAt || 0) ? b : a
    );
    return latest?.status === 'completed' ? 'Completed' : 'In Progress';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // ---------- Derived data (memoized) ----------
  const filteredCandidates = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return candidates.filter((c) => {
      const matchesSearch =
        !term ||
        c?.name?.toLowerCase().includes(term) ||
        c?.email?.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      if (filterBy === 'interviewed') {
        return getCandidateInterviews(c).length > 0;
      }
      if (filterBy === 'not-interviewed') {
        return getCandidateInterviews(c).length === 0;
      }
      return true; // 'all'
    });
  }, [candidates, searchTerm, filterBy, interviews]); // depends on interviews because filter uses them

  const sortedCandidates = useMemo(() => {
    const arr = [...filteredCandidates];
    return arr.sort((a, b) => {
      if (sortBy === 'name') {
        return (a?.name || '').localeCompare(b?.name || '');
      }
      if (sortBy === 'score') {
        const aScore = getLatestInterviewScore(a);
        const bScore = getLatestInterviewScore(b);
        return bScore - aScore; // desc
      }
      // default: date (fallback to 0 when missing)
      const aDate = new Date(a?.createdAt || 0).getTime();
      const bDate = new Date(b?.createdAt || 0).getTime();
      return bDate - aDate; // newest first
    });
  }, [filteredCandidates, sortBy, interviews]); // score/date use interviews

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Interviewer Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Manage candidates and review interview results</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-4"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard title="Total Candidates" value={candidates.length} icon="users" />
          <StatCard title="Total Interviews" value={interviews.length} icon="docs" />
          <StatCard
            title="Completed"
            value={interviews.filter((i) => i?.status === 'completed').length}
            icon="bars"
          />
          <StatCard
            title="Avg Score"
            value={
              (() => {
                const done = interviews.filter((i) => i?.status === 'completed');
                if (!done.length) return 0;
                const sum = done.reduce((s, i) => s + (Number(i?.finalScore ?? i?.score ?? 0) || 0), 0);
                return Math.round((sum / done.length) * 10) / 10;
              })()
            }
            icon="bolt"
          />
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="space-y-4">
              <div className="flex flex-col space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Candidates</option>
                    <option value="interviewed">Interviewed</option>
                    <option value="not-interviewed">Not Interviewed</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                    <option value="score">Sort by Score</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {sortedCandidates.length} of {candidates.length} candidates
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate list */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {sortedCandidates.map((candidate) => {
              const latestScore = getLatestInterviewScore(candidate);
              const status = getInterviewStatus(candidate);

              return (
                <li key={getCandidateId(candidate)}>
                  <div className="px-4 py-4 hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-start sm:items-center min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-sm sm:text-base font-medium text-white">
                              {(candidate?.name || '')
                                .split(' ')
                                .filter(Boolean)
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                                {candidate?.name}
                              </p>
                              {latestScore > 0 && (
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(
                                    latestScore
                                  )}`}
                                >
                                  {latestScore}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="mt-1 space-y-1">
                            <p className="text-xs sm:text-sm text-gray-500 break-all">{candidate?.email}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-xs sm:text-sm text-gray-500">{candidate?.phone}</p>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  status === 'Completed'
                                    ? 'bg-green-100 text-green-800'
                                    : status === 'In Progress'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {status}
                              </span>
                            </div>

                            {Array.isArray(candidate?.missingFields) && candidate.missingFields.length > 0 && (
                              <div className="mt-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Missing: {candidate.missingFields.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end sm:ml-4">
                        <Link
                          to={`/candidate/${getCandidateId(candidate)}`}
                          className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {sortedCandidates.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4-4-4 4m0 0v4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'No candidates have registered yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Small stat card component (icons are simple placeholders)
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

export default InterviewerDashboard;
