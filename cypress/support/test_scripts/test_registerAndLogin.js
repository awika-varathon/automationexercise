import '../commands'
import { getReferenceMappingJson, filledFormElementVauleBycriteria } from '../util'

// 2e2: Test register and login by test case loop by form type
// e.g. testCasesArray= [{ type: 'login', testCase: 'login_01' }, { type: 'register', testCase: 'reg_01' }]
// e.g. writeTestCaseResult, continuedWriteTestCaseResult = true/false
export const e2eRegisterAndLoginTestScriptsbyTestCase = (options) => {

    const { testCasesArray, writeTestCaseResult, continuedWriteTestCaseResult }= options;

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
    
                // Variable: Set test case's criteria and base
                // Excel: Get test case's criteria from excel by test case's name and set to test case criteria variable 
                cy.setTestCasecriteriaVariableFromExcel({
                    testCaseType: type,
                    testCaseName: testCaseName
                });
    
                // ++++ Visit home page ++++
                cy.visitHomepage();
    
                // ++++ Register and login ++++
                // Do action of register And login test case from test case criteria variable
                // criteria: Get test case criteria from test case criteria variable by testCaseName
                cy.task('getTempVariable', { name: `testCasecriteria_${testCaseName}` }).then(testCasecriteria => {
    
                    const { criteria } = testCasecriteria;
    
                    cy.log(`++++ ${testCaseName}: Do action - ${criteria['action']} ++++`);
                    console.log(`++++ ${testCaseName}: Do action ${criteria['action']} ++++`);
                    console.log(`getTempVariable: ${testCaseName}`, testCasecriteria);

                    // ONLY: test case 'reg_06' delete account first before signup
                    if(testCaseName === 'reg_06') {
                        // ++++ Visit Signup / Login page ++++
                        cy.visitPageFromClickMenu('login');

                        // login: login with criteria & check login message
                        cy.loginWebsite({
                            'login|email': criteria['login|email'],
                            'login|password': criteria['signup|password']
                        });
                        cy.deleteAccountFromClickMenu();
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




