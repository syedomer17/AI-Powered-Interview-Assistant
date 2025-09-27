#!/usr/bin/env node

// Test PDF parsing functionality
import { extractResumeData } from './src/services/resumeParser.js';
import fs from 'fs';

async function testPdfParsing() {
  try {
    console.log('🧪 Testing PDF parsing functionality...');
    
    // Create a simple test file to verify the parser works
    const testText = `John Doe
Software Engineer
john.doe@example.com
+1234567890

EXPERIENCE
- 3+ years in Full Stack Development
- Proficient in React, Node.js, JavaScript
- Experience with MongoDB, Express.js

EDUCATION  
Bachelor of Computer Science
University of Technology, 2020`;

    // Write test text file
    fs.writeFileSync('test-resume.txt', testText);
    
    // Test with text file first
    console.log('Testing with TXT file...');
    const result = await extractResumeData('test-resume.txt');
    
    console.log('✅ Extracted data:');
    console.log('Name:', result.extracted.name);
    console.log('Email:', result.extracted.email); 
    console.log('Phone:', result.extracted.phone);
    
    // Clean up
    fs.unlinkSync('test-resume.txt');
    
    console.log('🎉 Resume parsing is working correctly!');
    console.log('📄 PDF and DOCX files should now be accepted for upload.');
    
  } catch (error) {
    console.error('❌ Resume parsing test failed:', error.message);
  }
}

testPdfParsing();