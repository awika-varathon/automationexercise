import { e2eRegisterAndLoginTestScriptsbyTestCase } from '../../support/test_scripts/test_registerAndLogin'

// ++++ Test 2e2 login by test case ++++
// Set test case array, testCase has to has same name in testCase's criteria sheet
// Login = 'login_01', 'login_02', 'login_03'
const e2eTestCaseArray = [
    { type: 'login',    testCaseName: 'login_01' },
    { type: 'login',    testCaseName: 'login_02' },
    { type: 'login',    testCaseName: 'login_03' },
    { type: 'login',    testCaseName: 'login_04' },
    { type: 'login',    testCaseName: 'login_05' },
    { type: 'login',    testCaseName: 'login_06' },
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
    testCasesArray: e2eTestCaseArray, 
    writeTestCaseResult: writeTestCaseResult, 
    continuedWriteTestCaseResult: continuedWriteTestCaseResult,
});
