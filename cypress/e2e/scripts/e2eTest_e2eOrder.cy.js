import { e2eOrderTestScriptsbyTestCase } from '../../support/test_scripts/test_e2eOrder'

// ++++ Test 2e2 order by test case ++++
// Set test case array, testCase has to has same name in testCase's criteria sheet
// order = 'order_01', 'order_02', 'order_03'
const e2eTestCaseArray = [
    { type: 'e2eOrder',    testCaseName: 'order_01' },
    // { type: 'e2eOrder',    testCaseName: 'order_05' },
    // { type: 'e2eOrder',    testCaseName: 'order_03' },
];

// Set want to write test case result in CSV or not
// If set as false will not write test case result in CSV
// const writeTestCaseResult = true;
const writeTestCaseResult = false;

// Set want to coutinue write test case result in CSV or not
// If set as false will clear and rewrite test case result in CSV
// const continuedWriteTestCaseResult = true;
const continuedWriteTestCaseResult = false;

e2eOrderTestScriptsbyTestCase ({
    formTestCaseArray: e2eTestCaseArray, 
    writeTestCaseResult: writeTestCaseResult, 
    continuedWriteTestCaseResult: continuedWriteTestCaseResult,
});
