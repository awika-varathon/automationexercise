import { filledFormContactUsTestScripts } from '../../../support/test_scripts/test_contactUs'

// ++++ Test 'contact' to fill form 'Contact Us' by test cases ++++
// Set test cases array of test cases 'contact' to fill form 'Contact Us'.
// Note: Key 'testCaseName', value has to be set as same as the sheet name in file 'fixtures/testCaseCriteria/testCaseCriteria_contact.xlsx' which gets criteria from that sheet.
const e2eTestCaseArray = [
    { type: 'contact',    testCaseName: 'contact_01' },
    { type: 'contact',    testCaseName: 'contact_02' },
    { type: 'contact',    testCaseName: 'contact_03' },
    { type: 'contact',    testCaseName: 'contact_04' },
    { type: 'contact',    testCaseName: 'contact_05' },
];

// Set want to write test case result in CSV or not.
// If set as false will not write test case result in CSV.
// const writeTestCaseResult = true;
const writeTestCaseResult = false;

// Set want to coutinue write test case result in CSV or not.
// If set as false will clear and rewrite test case result in CSV.
// const continuedWriteTestCaseResult = true;
const continuedWriteTestCaseResult = false;

filledFormContactUsTestScripts ({
    testCasesArray: e2eTestCaseArray, 
    writeTestCaseResult: writeTestCaseResult, 
    continuedWriteTestCaseResult: continuedWriteTestCaseResult,
});
