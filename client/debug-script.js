// API Debug Script - Run this in browser console to debug interview data

async function debugInterviewData() {
  try {
    console.log('=== API DEBUG SCRIPT ===');
    
    // Fetch candidates
    const candidatesResponse = await fetch('http://localhost:8080/api/candidates');
    const candidates = await candidatesResponse.json();
    console.log('Candidates:', candidates);
    
    // Fetch interviews
    const interviewsResponse = await fetch('http://localhost:8080/api/interviews');
    const interviews = await interviewsResponse.json();
    console.log('Interviews:', interviews);
    
    // Check matching logic for each candidate
    candidates.forEach(candidate => {
      console.log(`\n--- Candidate: ${candidate.name} (ID: ${candidate._id}) ---`);
      
      const matchingInterviews = interviews.filter(interview => {
        const interviewCandidateId = interview.candidate?._id || interview.candidate?.id || interview.candidate;
        const matches = interviewCandidateId === candidate._id || interviewCandidateId === candidate.id;
        
        console.log(`  Interview candidate ID: ${interviewCandidateId}, Matches: ${matches}`);
        return matches;
      });
      
      console.log(`  Total matching interviews: ${matchingInterviews.length}`);
      console.log(`  Interviews:`, matchingInterviews);
      
      if (matchingInterviews.length > 0) {
        const latest = matchingInterviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        console.log(`  Latest interview status: ${latest.status}`);
        console.log(`  Latest interview score: ${latest.finalScore}`);
      }
    });
    
    return { candidates, interviews };
  } catch (error) {
    console.error('Debug script failed:', error);
  }
}

// Call the debug function
debugInterviewData();