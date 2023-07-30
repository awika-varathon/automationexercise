import { filledFormWriteYourReviewTestScripts } from '../../../support/test_scripts/test_writeYourReview'

// ++++ Test 'review' to fill form 'Writer Your Review' by test cases ++++
// Set test cases array of test cases 'review' to fill form 'Writer Your Review'.
// Note: Key 'testCaseName', value has to be set as same as the sheet name in file 'fixtures/testCaseCriteria/testCaseCriteria_review.xlsx' which gets criteria from that sheet.
const e2eTestCaseArray = [
    { type: 'review',    testCaseName: 'review_01' },
    { type: 'review',    testCaseName: 'review_02' },
    { type: 'review',    testCaseName: 'review_03' },
    { type: 'review',    testCaseName: 'review_04' },
    { type: 'review',    testCaseName: 'review_05' },
    { type: 'review',    testCaseName: 'review_06' },
];

// Set want to write test case result in CSV or not.
// If set as false will not write test case result in CSV.
// const writeTestCaseResult = true;
const writeTestCaseResult = false;

// Set want to coutinue write test case result in CSV or not.
// If set as false will clear and rewrite test case result in CSV.
// const continuedWriteTestCaseResult = true;
const continuedWriteTestCaseResult = false;

filledFormWriteYourReviewTestScripts ({
    testCasesArray: e2eTestCaseArray, 
    writeTestCaseResult: writeTestCaseResult, 
    continuedWriteTestCaseResult: continuedWriteTestCaseResult,
});
