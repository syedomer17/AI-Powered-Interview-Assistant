// src/components/ResumeSummaryCard.jsx
import React, { useState } from 'react';

export default function ResumeSummaryCard({ candidate }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const summary = candidate?.resumeSummary || '';
  const previewLimit = 700;
  const isTruncated = summary.length > previewLimit;
  const visibleText = expanded ? summary : summary.slice(0, previewLimit);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <div className="bg-white shadow rounded-lg mt-4 sm:mt-6">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M7 3h6l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
              <path d="M13 3v6h6" />
            </svg>
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Resume Summary</h3>
            {candidate?.resumeFileName && (
              <p className="mt-0.5 text-xs text-gray-500">File: {candidate.resumeFileName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            title="Copy summary"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <rect x="2" y="2" width="13" height="13" rx="2" />
            </svg>
            {copied ? "Copied!" : "Copy"}
          </button>

          {isTruncated && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
            >
              {expanded ? (
                <>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                  Show less
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                  Show more
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="relative px-4 sm:px-6 py-4">
        <div
          className={[
            "text-sm text-gray-800 leading-relaxed whitespace-pre-wrap",
            !expanded && isTruncated ? "max-h-40 overflow-hidden" : "",
          ].join(" ")}
        >
          {visibleText}
        </div>

        {!expanded && isTruncated && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent sm:rounded-b-lg" />
        )}
      </div>
    </div>
  );
}
