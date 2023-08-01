import '../commands'
import { slowCypressDown } from 'cypress-slow-down'
import { checkElementValidationMessage } from '../util'

// Filled Form: Test 'subscription' to fill form  'Subscription' by loop test cases in testCasesArray.
// e.g. testCasesArray = [{ type: 'subscription', testCaseName: 'sub_01', page: 'homepage', email: 'homepage@mail.com', result: 'success'},  { type: 'subscription', testCaseName: 'sub_02', page: 'products', email: 'products@mail.com', result: 'success'  }]
// e.g. writeTestCaseResult, continuedWriteTestCaseResult = true/false
export const filledFormSubscriptionTestScripts = (options) => {

    const { testCasesArray, writeTestCaseResult, continuedWriteTestCaseResult }= options;

    // Slow test cypress down for recording video when runs command 'cypress run'. 
    slowCypressDown();

    before(() => {
        // Variable: Set testCaseResultVariable's object 1st times.
        cy.task('clearTestCaseResultVariable');
    });
    
    testCasesArray.forEach((testCaseDetail, testIndex) => {
        
        const { type, testCaseName, page, email, result } = testCaseDetail;
    
        describe(`[Filled Form] ${testIndex+1}.${testCaseName}-Test filled form 'Subscription' on ${page} page.`, () => {
          
            beforeEach(() => {
                // API: Set website base intercept.
                cy.setWebsiteBaseIntercept();
    
                // Variable: Set testCasecriteriaVariable's object 1st times.
                cy.task('clearTempVariables');
            });
    
            it(`${testIndex+1}.1.${testCaseName}: Start test filled form 'Subscription' on ${page} page.`, () => {
    
                cy.log(`++++ ${testCaseName}: Start test filled form 'Subscription' on ${page} page. ++++`);
                console.log(`++++ ${testCaseName}: Start test filled form 'Subscription' on ${page} page. ++++`);

                // Result: Set base test case result to test case result variable. 
                // e.g. result = { testDate: "04/07/2023", testStartTime: "10:52:12", testEndTime: "-", testCase: "login_01", testStatus: "Failed"}
                cy.setBaseTestCaseResultObject(testCaseDetail);

                // ++++ Visit page by URL ++++
                cy.visitPageByURL(page);

                // ++++ Subscription ++++
                // Scrolldown to 'Subscription' form.
                cy.get('input#susbscribe_email').scrollIntoView();;

                // Email: Filled 'Subscription' form if email is not ''.
                if(email !== '') {
                    cy.get('input#susbscribe_email').click().clear().type(email);
                }

                // Button: Click button 'submit' to submit form.
                cy.get('button#subscribe').click();

                // Checking: Checking show element of result base on test result 'success' or 'failed'.
                switch(result) {
                    case 'success': 
                        // success: Show element of alert message successfully submit 'Subscription' form.
                        cy.get('div#success-subscribe').should('be.visible').then($ele => {
                            expect($ele.find('.alert-success').text()).to.equal('You have been successfully subscribed!');
                        })
                        break;
                    case 'failed-formatEmail':
                        // failed-formatEmail: Checking input validation message by formatEmail.
                        checkElementValidationMessage('#susbscribe_email', 'formatEmail');
                        break;
                    case 'failed-filledEmail':
                        // failed-filledEmail: Checking input validation message by not filled email.
                        checkElementValidationMessage('#susbscribe_email', 'fillField');
                        break;
                }

                cy.wait(1000); // Wait for recording video.

                // Button: Click scrollUp to top if find scrollUp button and result is 'succees'.Check header is visible.
                cy.get('a#scrollUp').then($ele => {
                    if($ele.is(":visible") && result === 'success'){
                        cy.get($ele).click();
                        cy.get('header').should('be.visible');
                    }
                })

                // Update test case result variable 'testStatus' to 'Pass' if can finish test till this step.
                cy.updateTestCaseResultObject({
                    testCaseDetail: testCaseDetail, 
                    type: 'testStatus',
                    testResultObject: {
                        testStatus: 'Pass'
                    }
                });
            });

            // Result: Write this test case results to CSV from test case result variable. 
            // Note: Need to write by test case in case code snap during test each and the end won't write test case.
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


