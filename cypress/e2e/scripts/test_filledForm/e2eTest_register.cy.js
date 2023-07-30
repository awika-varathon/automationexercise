import { filledFormRegisterAndLoginTestScripts } from '../../../support/test_scripts/test_registerAndLogin'

// ++++ Test 'register' to fill form 'Signup' by test cases ++++
// Set test cases array of test cases 'register' to fill form 'Signup'.
// Note: Key 'testCaseName', value has to be set as same as the sheet name in file fixtures/testCaseCriteria/testCaseCriteria_register.xlsx which gets criteria from that sheet.
const e2eTestCaseArray = [
    { type: 'register',   testCaseName: 'reg_01' },
    { type: 'register',   testCaseName: 'reg_02' },
    { type: 'register',   testCaseName: 'reg_03' },
    { type: 'register',   testCaseName: 'reg_04' },
    { type: 'register',   testCaseName: 'reg_05' },
    { type: 'register',   testCaseName: 'reg_06' },
    { type: 'register',   testCaseName: 'reg_07' },
];

// Set want to write test case result in CSV or not.
// If set as false will not write test case result in CSV.
// const writeTestCaseResult = true;
const writeTestCaseResult = false;

// Set want to coutinue write test case result in CSV or not.
// If set as false will clear and rewrite test case result in CSV.
// const continuedWriteTestCaseResult = true;
const continuedWriteTestCaseResult = false;

filledFormRegisterAndLoginTestScripts ({
    testCasesArray: e2eTestCaseArray, 
    writeTestCaseResult: writeTestCaseResult, 
    continuedWriteTestCaseResult: continuedWriteTestCaseResult,
});
