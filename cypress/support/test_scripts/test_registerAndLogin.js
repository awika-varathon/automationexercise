import '../commands'
import { slowCypressDown } from 'cypress-slow-down'

// 2e2: Test register and login loop by test cases 
// e.g. testCasesArray = [{ type: 'login', testCaseName: 'login_01' }, ...] 
// e.g. testCasesArray = [{ type: 'register', testCase: 'reg_01' }, ...]
// e.g. writeTestCaseResult, continuedWriteTestCaseResult = true/false
export const e2eRegisterAndLoginTestScriptsbyTestCase = (options) => {

    const { testCasesArray, writeTestCaseResult, continuedWriteTestCaseResult } = options;

    // Slow test cypress down for recording video when runs command 'cypress run' 
    slowCypressDown();

    before(() => {
        // Variable: Set testCaseResultVariable's object 1st times
        cy.task('clearTestCaseResultVariable');
    });
    
    testCasesArray.forEach((testCaseDetail, testIndex) => {
        
        const { type, testCaseName } = testCaseDetail;
    
        describe(`[Register and login] ${testIndex+1}.${testCaseName}-e2e Test `, () => {
          
            beforeEach(() => {
                // API: Set website base intercept
                cy.setWebsiteBaseIntercept();
    
                // Variable: Set testCasecriteriaVariable's object 1st times
                cy.task('clearTempVariables');
            });
    
            it(`${testIndex+1}.1.${testCaseName}: Start e2e test register and login in website`, () => {
    
                cy.log(`++++ ${testCaseName}: Start e2e test register and login in website ++++`);
                console.log(`++++ ${testCaseName}: Start e2e test register and login in website ++++`);

                // Result: Set base test case result to test case result variable 
                // e.g. result = { testDate: "04/07/2023", testStartTime: "10:52:12", testEndTime: "-", testCase: "login_01", testStatus: "Failed"}
                cy.setBaseTestCaseResultObject(testCaseDetail);
    
                // Variable: Set test case's criteria
                // Excel: Get test case's criteria from excel by test case's name and set to test case criteria variable 
                cy.setTestCasecriteriaVariableFromExcel({
                    testCaseType: type,
                    testCaseName: testCaseName
                });
    
                // ++++ Visit home page ++++
                cy.visitHomepage();
    
                // ++++ Register and login ++++
                // Do action of register or login test case from test case criteria variable
                // criteria: Get test case criteria from test case criteria variable by testCaseName
                cy.task('getTempVariable', { name: `testCasecriteria_${testCaseName}` }).then(testCasecriteria => {
    
                    const { criteria } = testCasecriteria;
    
                    cy.log(`++++ ${testCaseName}: Do action - ${criteria['action']} ++++`);
                    console.log(`++++ ${testCaseName}: Do action ${criteria['action']} ++++`);
                    console.log(`getTempVariable: ${testCaseName}`, testCasecriteria);

                    // User: Deleted user before test 'reg_06' test cases
                    // Note: 'reg_06' is error test case which after create new account will return error and account will be still exist. Before run test 'reg_06' test case has to check user is exist or not and delete this account first.
                    if(testCaseName === 'reg_06') {
                        cy.clearUserFromUserconfig('userObject', {
                            "username": {
                                "userType": "signup",
                                "keys": "username",
                                "email": criteria['signup|email'],
                                "password": criteria['signup|password']
                            }
                        })
                    }
    
                    // ++++ Visit Signup / Login page ++++
                    cy.visitPageFromClickMenu('login');

                    // Do Action: Do action of register and login test case
                    switch(criteria['action']){
                        case 'login':
                            // login: login with criteria & check login message
                            cy.loginWebsite(criteria);
                            cy.checkLoginMessage({
                                name: criteria['login|name'],
                                result: criteria['login|result']
                            });
                            break;
                        case 'logout':
                            // logout: login with criteria & check login message & logout
                            cy.loginWebsite(criteria);
                            cy.checkLoginMessage({
                                name: criteria['login|name'],
                                result: criteria['login|result']
                            });
                            cy.logoutWebsite();
                            break;
                        case 'signup':
                            // signup: signup in S'Signup / Login' page page with criteria
                            cy.signupWebsite(criteria);
                            // signup: If signup in 'Signup / Login' page is 'success' then filled signup information
                            if(criteria['login|result'] === 'success') {
                                cy.filledSignupInformation(criteria, 'register');
                            }
                            break;
                    }

                    cy.wait(2000); // Wait for recording video

                    // Update test case result variable to 'Pass' if can finish test till this step
                    cy.updateTestCaseResultObject({
                        testCaseDetail: testCaseDetail, 
                        type: 'testStatus',
                        testResultObject: {
                            testStatus: 'Pass'
                        }
                    });
                });
            });

            // Result: Write this test case results to CSV from test case result variable 
            // Note: Need to write by test case in case code snap during test each and the end won't write test case
            if(writeTestCaseResult) {
                it(`${testIndex+1}.2.${testCaseName}: Write Test Case Result To CSV & Show Test Result`, () => {
                    cy.writeTestCaseResultToCSV({
                        type: type,
                        testCaseName: testCaseName, 
                        continuedWriteTestCaseResult: continuedWriteTestCaseResult,
                        testIndex: testIndex 
                    });
                });
            }
        });
    });
};




