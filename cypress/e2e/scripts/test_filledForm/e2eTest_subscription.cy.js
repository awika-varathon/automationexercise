import { filledFormSubscriptionTestScripts } from '../../../support/test_scripts/test_subscription'

// ++++ Test 'subscription' to fill form 'Subscription' by test cases ++++
// Set test cases array of test cases 'subscription' to fill form 'Subscription'.
// Note: Key 'page', value has to be set as same as object's key in file 'fixtures/configJSON/websiteMenuConfig.json'.
const e2eTestCaseArray = [
    { type: 'subscription', testCaseName: 'sub_01', page: 'homepage', email: 'homepage@mail.com', result: 'success'},
    { type: 'subscription', testCaseName: 'sub_02', page: 'products', email: 'products@mail.com', result: 'success'  },
    { type: 'subscription', testCaseName: 'sub_03', page: 'cart', email: 'cart@mail.com', result: 'success'  },
    { type: 'subscription', testCaseName: 'sub_04', page: 'login', email: 'login@mail.com', result: 'success'  },
    { type: 'subscription', testCaseName: 'sub_05', page: 'test_cases', email: 'test-cases@mail.com', result: 'success'  },
    { type: 'subscription', testCaseName: 'sub_06', page: 'api_testing', email: 'api-testing@mail.com', result: 'success'  },
    { type: 'subscription', testCaseName: 'sub_07', page: 'contact_us', email: 'contact-us@mail.com', result: 'success'  },
    { type: 'subscription', testCaseName: 'sub_08', page: 'homepage', email: 'homepage.mail.com' , result: 'failed-formatEmail' },
    { type: 'subscription', testCaseName: 'sub_09', page: 'homepage', email: '' , result: 'failed-filledEmail' },
];

// Set want to write test case result in CSV or not.
// If set as false will not write test case result in CSV.
// const writeTestCaseResult = true;
const writeTestCaseResult = false;

// Set want to coutinue write test case result in CSV or not.
// If set as false will clear and rewrite test case result in CSV.
// const continuedWriteTestCaseResult = true;
const continuedWriteTestCaseResult = false;

filledFormSubscriptionTestScripts ({
    testCasesArray: e2eTestCaseArray, 
    writeTestCaseResult: writeTestCaseResult, 
    continuedWriteTestCaseResult: continuedWriteTestCaseResult,
});
