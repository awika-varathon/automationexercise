import { e2eRegisterAndLoginTestScriptsbyTestCase } from '../../support/test_scripts/test_registerAndLogin'

// ++++ Test 2e2 register by test case ++++
// Set test case array, testCase has to has same name in testCase's criterial sheet
// Signup = 'reg_00' (case default), 'reg_01', 'reg_02'
const e2eTestCaseArray = [
    { type: 'register',   testCaseName: 'reg_01' },
    { type: 'register',   testCaseName: 'reg_02' },
];

// Set want to write test case result in CSV or not
// If set as false will not write test case result in CSV
const writeTestCaseResult = true;
// const writeTestCaseResult = false;

// Set want to coutinue write test case result in CSV or not
// If set as false will clear and rewrite test case result in CSV
// const continuedWriteTestCaseResult = true;
const continuedWriteTestCaseResult = false;

e2eRegisterAndLoginTestScriptsbyTestCase ({
    formTestCaseArray: e2eTestCaseArray, 
    writeTestCaseResult: writeTestCaseResult, 
    continuedWriteTestCaseResult: continuedWriteTestCaseResult,
});