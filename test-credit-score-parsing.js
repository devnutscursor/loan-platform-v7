#!/usr/bin/env node

// Test Credit Score Parsing Function
// Run with: node test-credit-score-parsing.js

function parseCreditScore(creditScoreRange) {
  if (!creditScoreRange || typeof creditScoreRange !== 'string') {
    return 750; // Default fallback
  }
  
  // Handle different range formats
  if (creditScoreRange.includes('-')) {
    const [min, max] = creditScoreRange.split('-').map(num => parseInt(num.trim()));
    if (!isNaN(min) && !isNaN(max)) {
      // Return the midpoint of the range
      return Math.round((min + max) / 2);
    }
  }
  
  // If it's already a single number
  const singleScore = parseInt(creditScoreRange);
  if (!isNaN(singleScore)) {
    return singleScore;
  }
  
  // Fallback for any other format
  return 750;
}

console.log('🧪 Testing Credit Score Parsing Function...\n');

// Test cases from the form
const testCases = [
  { input: "500-850", expected: 675, description: "Outstanding 800+" },
  { input: "780-799", expected: 790, description: "Excellent 780 - 799" },
  { input: "740-779", expected: 760, description: "Very good 740 - 779" },
  { input: "720-739", expected: 730, description: "Fairly good 720 - 739" },
  { input: "700-719", expected: 710, description: "Good 700 - 719" },
  { input: "680-699", expected: 690, description: "Decent 680 - 699" },
  { input: "660-679", expected: 670, description: "Average 660 - 679" },
  { input: "750", expected: 750, description: "Single number" },
  { input: "", expected: 750, description: "Empty string" },
  { input: null, expected: 750, description: "Null value" },
  { input: undefined, expected: 750, description: "Undefined value" }
];

testCases.forEach((testCase, index) => {
  const result = parseCreditScore(testCase.input);
  const passed = result === testCase.expected;
  
  console.log(`Test ${index + 1}: ${testCase.description}`);
  console.log(`  Input: "${testCase.input}"`);
  console.log(`  Expected: ${testCase.expected}`);
  console.log(`  Result: ${result}`);
  console.log(`  Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');
});

console.log('🎯 Credit Score Parsing Test Complete!');
