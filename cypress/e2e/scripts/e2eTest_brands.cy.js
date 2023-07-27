import { e2eCheckProductsTestScriptsbyTestCase } from '../../support/test_scripts/test_checkProducts'

// ++++ Test 2e2 brand by test cases ++++
// Set test cases array of test cases brand
// Note: Key 'brand', value has to be set as same as value in object's key 'brand in file fixtures/configJSON/productsConfig.json
const e2eTestCaseArray = [
    { type: 'brand', testCaseName: 'brand_01', page: 'homepage', brand: 'Polo' },
    { type: 'brand', testCaseName: 'brand_02', page: 'homepage', brand: 'H&M' },
    { type: 'brand', testCaseName: 'brand_03', page: 'homepage', brand: 'Madame' },
    { type: 'brand', testCaseName: 'brand_04', page: 'homepage', brand: 'Mast & Harbour' },
    { type: 'brand', testCaseName: 'brand_05', page: 'homepage', brand: 'Babyhug' },
    { type: 'brand', testCaseName: 'brand_06', page: 'homepage', brand: 'Allen Solly Junior' },
    { type: 'brand', testCaseName: 'brand_07', page: 'homepage', brand: 'Kookie Kids' },
    { type: 'brand', testCaseName: 'brand_08', page: 'homepage', brand: 'Biba' },
    { type: 'brand', testCaseName: 'brand_09', page: 'products', brand: 'Polo' },
    { type: 'brand', testCaseName: 'brand_10', page: 'products', brand: 'H&M' },
    { type: 'brand', testCaseName: 'brand_11', page: 'products', brand: 'Madame' },
    { type: 'brand', testCaseName: 'brand_12', page: 'products', brand: 'Mast & Harbour' },
    { type: 'brand', testCaseName: 'brand_13', page: 'products', brand: 'Babyhug' },
    { type: 'brand', testCaseName: 'brand_14', page: 'products', brand: 'Allen Solly Junior' },
    { type: 'brand', testCaseName: 'brand_15', page: 'products', brand: 'Kookie Kids' },
    { type: 'brand', testCaseName: 'brand_16', page: 'products', brand: 'Biba' },
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
