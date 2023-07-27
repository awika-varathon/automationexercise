import { e2eCheckProductsTestScriptsbyTestCase } from '../../support/test_scripts/test_checkProducts'

// ++++ Test 2e2 category by test cases ++++
// Set test cases array of test cases category
// Note: Key 'usertype' and 'category', value has to be set as same as vuale in object's key 'usertype' and 'category' in file fixtures/configJSON/productsConfig.json
const e2eTestCaseArray = [
    { type: 'category', testCaseName: 'cat_01', page: 'homepage', usertype: 'Women',  category: 'Dress' },
    { type: 'category', testCaseName: 'cat_02', page: 'homepage', usertype: 'Women',  category: 'Tops' },
    { type: 'category', testCaseName: 'cat_03', page: 'homepage', usertype: 'Women',  category: 'Saree' },
    { type: 'category', testCaseName: 'cat_04', page: 'homepage', usertype: 'Men',  category: 'Tshirts' },
    { type: 'category', testCaseName: 'cat_05', page: 'homepage', usertype: 'Men',  category: 'Jeans' },
    { type: 'category', testCaseName: 'cat_06', page: 'homepage', usertype: 'Kids',  category: 'Dress' },
    { type: 'category', testCaseName: 'cat_07', page: 'homepage', usertype: 'Kids',  category: 'Tops & Shirts' },
    { type: 'category', testCaseName: 'cat_08', page: 'products', usertype: 'Women',  category: 'Dress' },
    { type: 'category', testCaseName: 'cat_09', page: 'products', usertype: 'Women',  category: 'Tops' },
    { type: 'category', testCaseName: 'cat_10', page: 'products', usertype: 'Women',  category: 'Saree' },
    { type: 'category', testCaseName: 'cat_11', page: 'products', usertype: 'Men',  category: 'Tshirts' },
    { type: 'category', testCaseName: 'cat_12', page: 'products', usertype: 'Men',  category: 'Jeans' },
    { type: 'category', testCaseName: 'cat_13', page: 'products', usertype: 'Kids',  category: 'Dress' },
    { type: 'category', testCaseName: 'cat_14', page: 'products', usertype: 'Kids',  category: 'Tops & Shirts' }
];

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
