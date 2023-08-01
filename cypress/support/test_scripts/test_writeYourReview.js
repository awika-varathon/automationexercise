import '../commands'
import { slowCypressDown } from 'cypress-slow-down'
import { getObjectFromReferenceMappingJson, filledFormElementVauleBycriteria, checkFailedFormatEmailElementValidationMessage, checkFailedFillFieldElementValidationMessage } from '../util'

// Filled Form: Test 'review' to fill form 'Writer Your Review' by loop test cases in testCasesArray.
// e.g. testCasesArray = [{ type: 'review',    testCaseName: 'review_01' }, ...] 
// e.g. writeTestCaseResult, continuedWriteTestCaseResult = true/false
export const filledFormWriteYourReviewTestScripts = (options) => {

    const { testCasesArray, writeTestCaseResult, continuedWriteTestCaseResult } = options;

    // Slow test cypress down for recording video when runs command 'cypress run'.
    slowCypressDown();

    before(() => {
        // Variable: Set testCaseResultVariable's object 1st times.
        cy.task('clearTestCaseResultVariable');
    });
    
    testCasesArray.forEach((testCaseDetail, testIndex) => {
        
        const { type, testCaseName } = testCaseDetail;
    
        describe(`[Filled Form] ${testIndex+1}.${testCaseName}-Test filled form 'Writer Your Review'`, () => {
          
            beforeEach(() => {
                // API: Set website base intercept.
                cy.setWebsiteBaseIntercept();
    
                // Variable: Set testCasecriteriaVariable's object 1st times.
                cy.task('clearTempVariables');
            });
    
            it(`${testIndex+1}.1.${testCaseName}: Start test filled form 'Writer Your Review'`, () => {
    
                cy.log(`++++ ${testCaseName}: Start test filled form 'Writer Your Review' ++++`);
                console.log(`++++ ${testCaseName}: Start test filled form 'Writer Your Review' ++++`);

                // Result: Set base test case result to test case result variable.
                // e.g. result = { testDate: "04/07/2023", testStartTime: "10:52:12", testEndTime: "-", testCase: "login_01", testStatus: "Failed"}
                cy.setBaseTestCaseResultObject(testCaseDetail);
    
                // Variable: Set test case's criteria.
                // Excel: Get test case's criteria from excel by test case's name and set to test case criteria variable. 
                cy.setTestCasecriteriaVariableFromExcel({
                    testCaseType: type,
                    testCaseName: testCaseName
                });
    
                // ++++ Contact Us ++++
                // Criteria: Get test case criteria from test case criteria variable by testCaseName.
                cy.task('getTempVariable', { name: `testCasecriteria_${testCaseName}` }).then(testCasecriteria => {
    
                    const { criteria } = testCasecriteria;
                    // console.log(`getTempVariable: ${testCaseName}`, testCasecriteria);
    
                    // ++++ Visit Contact Us page ++++
                    cy.visitPageByURL('homepage');

                    // ++++ Login ++++
                    // Login: If isLogin is not undefined then do login before 'Writer Your Review'.
                    if(criteria['loginAccount'] !== undefined) {
                            
                        // ++++ Visit Signup / Login page ++++
                        cy.visitPageFromClickMenu('login');
    
                        // Do Action: Do action of order test case.
                        cy.doActionLoginOrSignup(
                            'Login', 
                            getObjectFromReferenceMappingJson('userConfig', criteria['loginAccount'])
                        );
                    }

                    // +++++++++++++++++++++++++++++
                    // Set key addToCartFrom
                    criteria['addToCartFrom'] = 'viewComment';
                    
                    // Add: Do action to view product detail page from the product card.
                    cy.doActionAddProductFromCard(criteria);

                    // +++++++++++++++++++++++++++++
                    // Review: Write Your Review of product on view product detail page by criteria
                    cy.log(`++++ Write your review in view detail page ++++`);
                    console.log(`++++ Write your review in view detail page ++++`);
                
                    // Get 'Writer Your Review' form input config from inputConfig.json to loop filled input.
                    // e.g. writeYourReview = { "formcriteria": [{ "name": "review|name", "formTitle": "Your Name", "elementName": "[id='name']", "formType": "input", "howToFilled": "type", "elementDisplay": "enable","defaultValue": [], "isRequiredField": "requierdl" }, ...]}
                    const writeYourReviewConfig = getObjectFromReferenceMappingJson('inputConfig', 'writeYourReview');
                    
                    // Checked & Filled: Loop checked and filled 'Writer Your Review' form element value by criteria value base on form type.
                    writeYourReviewConfig['formcriteria'].forEach(formcriteria => {
                        filledFormElementVauleBycriteria({
                            formcriteria: formcriteria,
                            criteria: criteria,
                        });
                    });
                    
                    // Button: Click button 'Submit', to send review
                    cy.get('#button-review').click();
                
                    // Checking: Checking show element of result base on test result 'success' or 'failed'. 
                    switch(true) {
                        case criteria['review|result'] === 'success': 
                            // Show element of alert message successfully submit 'Writer Your Review' form.
                            cy.get('div#review-section .alert-success').should('be.visible').should('contain', 'Thank you for your review.')

                            break;
                        case criteria['review|result'].startsWith('failed-format'):
                            // failed-format: Get input config to check element failed format email of input validation message.
                            // e.g. criteria['review|result'] = 'failed-format-review|email' => 'review|email'                  
                            checkFailedFormatEmailElementValidationMessage(
                                writeYourReviewConfig['formcriteria'], 
                                criteria['review|result']
                            )
                            break;
                        case criteria['review|result'].startsWith('failed-filled'):
                            // failed-filled: Get input config to check element failed field of input validation message.
                            // e.g. criteria['review|result'] = 'failed-filled-review|email' => 'review|email'
                            checkFailedFillFieldElementValidationMessage(
                                writeYourReviewConfig['formcriteria'], 
                                criteria['review|result']
                            )
                            break;
                    }
                    
                    cy.wait(1000); // Wait for recording video.

                    // Update test case result variable 'testStatus' to 'Pass' if can finish test till this step.
                    cy.updateTestCaseResultObject({
                        testCaseDetail: testCaseDetail, 
                        type: 'testStatus',
                        testResultObject: {
                            testStatus: 'Pass'
                        }
                    });
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




