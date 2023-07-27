import { e2eCheckProductsTestScriptsbyTestCase } from '../../support/test_scripts/test_checkProducts'

// ++++ Test 2e2 search by test cases ++++
// Set test cases array of test cases search
// Note: Key 'search', value has to be set as same as value in object's key 'search in file fixtures/configJSON/productsConfig.json
const e2eTestCaseArray = [
    { type: 'search', testCaseName: 'search_01', page: 'products', searchText: 'Blue' },
    { type: 'search', testCaseName: 'search_02', page: 'products', searchText: 'dress' },
    { type: 'search', testCaseName: 'search_03', page: 'products', searchText: 'top' },
    { type: 'search', testCaseName: 'search_04', page: 'products', searchText: 'shirt' },
    { type: 'search', testCaseName: 'search_05', page: 'products', searchText: 'men' },
    { type: 'search', testCaseName: 'search_06', page: 'products', searchText: 'polo' },
    { type: 'search', testCaseName: 'search_07', page: 'products', searchText: '-' },
    { type: 'search', testCaseName: 'search_08', page: 'products', searchText: 'pola' },
]

// Set want to write test case result in CSV or not
// If set as false will not write test case result in CSV
// const writeTestCaseResult = true;
const writeTestCaseResult = false;

// Set want to coutinue write test case result in CSV or not
// If set as false will clear and rewrite test case result in CSV
// const continuedWriteTestCaseResult = true;
const continuedWriteTestCaseResult = false;

e2eCheckProductsTestScriptsbyTestCase ({
    testCasesArray: e2eTestCaseArray, 
    writeTestCaseResult: writeTestCaseResult, 
    continuedWriteTestCaseResult: continuedWriteTestCaseResult,
});
