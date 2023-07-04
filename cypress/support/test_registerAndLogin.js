// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
// Alternatively you can use CommonJS syntax:
// require('./commands')
// Import commands.js using ES2015 syntax:
import './commands'
import { getReferenceMappingJson, filledFormElementVauleByCriterial } from '../support/util'

// 2e2: Test register and login by test case loop by form type
// e.g. formTestCaseArray= [{ type: 'login',    testCase: 'login_01' }, { type: 'register',   testCase: 'reg_01' }]
// e.g. writeTestCaseResult, continuedWriteTestCaseResult = true/false
export const e2eRegisterAndLoginTestFormDMCbyTestCase = (options) => {

    const { formTestCaseArray, writeTestCaseResult, continuedWriteTestCaseResult }= options;

    before(() => {
        // Variable: Set testCaseResultVariable's object 1st times
        cy.task('clearTestCaseResultVariable');
    });
    
    formTestCaseArray.forEach((formTestCase, testIndex) => {
        
        const { type, testCaseName } = formTestCase;
    
        describe(`[Register and login] ${testIndex+1}.${testCaseName}-e2e Test `, () => {
          
            beforeEach(() => {
                // API: Set DMS's website base intercept
                cy.setWebsiteBaseIntercept();
    
                // Variable: Set testCaseCriterialVariable's object 1st times
                cy.task('clearTempVariables');
            });
    
            it(`${testIndex+1}.1.${testCaseName}: Start e2e test register and login in website`, () => {
    
                cy.log(`++++ ${testCaseName}: Start e2e test register and login in website ++++`);
                console.log(`++++ ${testCaseName}: Start e2e test register and login in website ++++`);

                // Result: Set base test case result to test case result variable 
                // e.g. result = { testDate: "04/07/2023", testStartTime: "10:52:12", testEndTime: "-", testCase: "login_01", testStatus: "Failed"}
                cy.setBaseTestCaseResultObject(formTestCase);
    
                // Variable: Set test case's criterial and base
                // Excel: Get test case's criterial from excel by test case's name and set to test case criterial variable 
                cy.setFormTestCaseCriterialVariableFromExcel({
                    testCaseType: 'e2eRegisterAndLogin',
                    testCaseName: testCaseName
                });
    
                // ++++ Visit home page ++++
                cy.visitHomepage();
    
                // ++++ Visit Signup / Login page ++++
                cy.visitPageFromClickMenu('Signup / Login');
    
                // ++++ Register and login ++++
                // Do action of register And login test case from test case criterial variable
                // Criterial: Get test case criterial from test case criterial variable by testCaseName
                cy.task('getTempVariable', { name: `testCaseCriterial_${testCaseName}` }).then(testCaseCriterial => {
    
                    const { criterial } = testCaseCriterial;
    
                    cy.log(`++++ ${testCaseName}: Do action - ${criterial['action']} ++++`);
                    console.log(`++++ ${testCaseName}: Do action ${criterial['action']} ++++`);
                    console.log(`getTempVariable: ${testCaseName}`, testCaseCriterial);
    
                    // Do Action: Do action of register and login test case
                    switch(criterial['action']){
                        case 'login':
                            // login: login with criterial & check login message
                            cy.loginWebsite(criterial);
                            cy.checkLoginMessage({
                                name: criterial['login|name'],
                                result: criterial['login|result']
                            });
                            break;
                        case 'logout':
                            // logout: login with criterial & check login message & logout
                            cy.loginWebsite(criterial);
                            cy.checkLoginMessage({
                                name: criterial['login|name'],
                                result: criterial['login|result']
                            });
                            cy.logoutWebsite();
                            break;
                        case 'signup':
                            // signup: signup in S'Signup / Login' page page with criterial
                            cy.signupWebsite(criterial);
                            // signup: If signup in 'Signup / Login' page is 'success' then filled signup information
                            if(criterial['login|result'] === 'success') {
                                cy.filledSignupInformation(criterial);
                            }
                            break;
                    }
                });
            });

            // Result: Write this test case results to CSV from test case result variable 
            // Note: Need to write by test case in case code snap during test each and the end won't write test case
            if(writeTestCaseResult) {
                it(`${testIndex+1}.2.${testCaseName}: Write Test Case Result To CSV & Show Test Result`, () => {
                    cy.writeTestCaseResultToCSV({
                        type: type,
                        resultKey: testCaseName, 
                        testCaseDetail: formTestCase, 
                        continuedWriteTestCaseResult: continuedWriteTestCaseResult,
                        testIndex: testIndex 
                    });
                });
            }
    
        });
    });
};

///////////////////////////////////////////
// ++++ Signup ++++
// Signup: Signup by name and email from criterial
Cypress.Commands.add('signupWebsite', (options) => {
    cy.log(`Signup to your account`);
    console.log(`Signup to your account`);
    cy.get('.signup-form').within(() => {
        // Clear & type name
        cy.get('input[data-qa="signup-name"]')
            .clear()
            .type(options['login|name']);
        // Clear & type password
        cy.get('input[data-qa="signup-email"]')
            .clear()
            .type(options['login|email']);
        // Click login and wait api
        cy.get('button[data-qa="signup-button"]').click();
        // cy.wait('@signup'); 
    });
    // Check login message of login success or failed  
    cy.checkSignupMessage(options['login|result']);
});

// Signup: Check signup message of signup success or failed 
Cypress.Commands.add('checkSignupMessage', (result) => {
    cy.log(`Check Signup Message - ${result}`);
    console.log(`Check Signup Message - ${result}`);
    switch(result) {
        case 'success':
            // success: If signup in 'Signup / Login' page is 'success', should to 'Signup' page and show signup form
            cy.get('form[action="/signup"]').should('be.visible');
        break;
        case 'failed-exist':
            // failed-exist: If signup with existing email, Should show error message under signup box
            cy.get('.signup-form form p').should(($ele) => {
                expect($ele.text()).to.equal('Email Address already exist!');
            }); 
        break;
        case 'failed-format':
            // failed: Should show error message (NOT WORK CANT FIND ELEMENT)
            cy.wait(5000);
        break;
    }
});

// Signup: Filled signup information in 'Signup' page with criterial
Cypress.Commands.add('filledSignupInformation', (criterial) => {

    cy.log(`++++ Filled Signup Information ++++`);
    console.log(`++++ Filled Signup Information ++++`);

    // Get signup info from signupConfig.json to loop filled input
    // e.g. signupInfo = { "formCriterial": [{ "name": "signup|title", "formTitle": "Title", "elementName": "title", "formType": "radio", "howToFilled": "select", "elementDisplay": "enable","defaultValue": [], "isRequiredField": "optional" }, ...]}
    const signupInfo = getReferenceMappingJson('signupConfig');

    // Checked & Filled: Loop checked and filled signup form element value by criterial value base on form type
    signupInfo['formCriterial'].forEach(formCriterial => {
        filledFormElementVauleByCriterial({
            formCriterial: formCriterial,
            criterial: criterial
        });
    });

    // Submit: Click button create account
    cy.get('button[data-qa="create-account"]').click();

    // Checking: Checking signup result success or failed  
    switch(criterial['signup|result']) {
        case 'success': 
            // success: Wait api of created account
            cy.wait('@homepage');
            
            // Checking: Checking text 'Account Created'
            cy.get('h2[data-qa="account-created"]').should(($ele) => {
                expect($ele.text()).to.equal('Account Created!');
            }); 
            
            // Button: Click button continue to homepage and await api
            cy.clickContinueButton();

            // Login: Check login message of login success after signup
            cy.checkLoginMessage({
                name: criterial['signup|name'],
                result: 'success'
            });

            // Action: Do action after signup
            if(criterial['signup|action'] !== undefined) {
                switch(criterial['signup|action']) {
                    case 'logout':
                        // Logout: Logout and check logout message
                        cy.logoutWebsite();
                        break;
                    case 'delete':
                        // Delete: Delete account from click menu & Wait api delete account
                        cy.visitPageFromClickMenu('Delete Account');
                        cy.wait('@homepage');

                        // Checking: Checking text 'Account Deleted'
                        cy.get(`h2[data-qa="account-deleted"]`).should(($ele) => {
                            expect($ele.text()).to.equal('Account Deleted!');
                        });

                        // Button: Click button continue to homepage and await api
                        cy.clickContinueButton();

                        // Check logout message after delete account
                        cy.checkLoginMessage({
                            result: 'logout'
                        });
                        break;
                }
            }
        break;
        case 'failed': 
            // failed: Case Validate or somethings
            break;
    }
});


