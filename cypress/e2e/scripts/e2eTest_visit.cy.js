import { e2eVisitTestScriptsbyTestCase } from '../../support/test_scripts/test_visit'

// ++++ Test 2e2 visit by test cases ++++
// Set test cases array of test cases visit
// Note: Key 'page', value has to be set as same as object's key in file fixtures/configJSON/websiteMeunConfig.json
const e2eTestCaseArray = [
    { type: 'visit', testCaseName: 'visit_01', page: "homepage" },
    { type: 'visit', testCaseName: 'visit_02', page: "products" },
    { type: 'visit', testCaseName: 'visit_03', page: "cart" },
    { type: 'visit', testCaseName: 'visit_04', page: "login" },
    { type: 'visit', testCaseName: 'visit_05', page: "test_cases" },
    { type: 'visit', testCaseName: 'visit_06', page: "api_testing" },
    { type: 'visit', testCaseName: 'visit_07', page: "contact_us" },
    { type: 'visit', testCaseName: 'visit_08', page: "video_tutorials" },
    // { type: 'visit', testCaseName: 'visit_09', page: "errorCase" },
];

// Set want to write test case result in CSV or not
// If set as false will not write test case result in CSV
// const writeTestCaseResult = true;
const writeTestCaseResult = false;

// Set want to coutinue write test case result in CSV or not
// If set as false will clear and rewrite test case result in CSV
// const continuedWriteTestCaseResult = true;
const continuedWriteTestCaseResult = false;

e2eVisitTestScriptsbyTestCase ({
    testCasesArray: e2eTestCaseArray, 
    writeTestCaseResult: writeTestCaseResult, 
    continuedWriteTestCaseResult: continuedWriteTestCaseResult,
});
