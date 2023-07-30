import { e2eOrderTestScripts } from '../../../support/test_scripts/test_e2eOrder'

// ++++ Test 'e2eOrder' to buy products on website by test cases ++++
// Set test cases array of test cases 'e2eOrder' to buy products on website. 
// Note: Key 'testCaseName', value has to be set as same as the sheet name in file 'fixtures/testCaseCriteria/testCaseCriteria_e2eOrder.xlsx' which gets criteria from that sheet.
const e2eTestCaseArray = [
    { type: 'e2eOrder',    testCaseName: 'order_01' },
    { type: 'e2eOrder',    testCaseName: 'order_02' },
    { type: 'e2eOrder',    testCaseName: 'order_03' },
    { type: 'e2eOrder',    testCaseName: 'order_04' },
    { type: 'e2eOrder',    testCaseName: 'order_05' },
    { type: 'e2eOrder',    testCaseName: 'order_06' },
    { type: 'e2eOrder',    testCaseName: 'order_07' },
    { type: 'e2eOrder',    testCaseName: 'order_08' },
    { type: 'e2eOrder',    testCaseName: 'order_09' },
    { type: 'e2eOrder',    testCaseName: 'order_10' }
];

// Set want to write test case result in CSV or not.
// If set as false will not write test case result in CSV.
// const writeTestCaseResult = true;
const writeTestCaseResult = false;

// Set want to coutinue write test case result in CSV or not.
// If set as false will clear and rewrite test case result in CSV.
// const continuedWriteTestCaseResult = true;
const continuedWriteTestCaseResult = false;

e2eOrderTestScripts ({
    testCasesArray: e2eTestCaseArray, 
    writeTestCaseResult: writeTestCaseResult, 
    continuedWriteTestCaseResult: continuedWriteTestCaseResult,
});
