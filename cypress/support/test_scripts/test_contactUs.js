import '../commands'
import { slowCypressDown } from 'cypress-slow-down'
import { getObjectFromReferenceMappingJson, filledFormElementVauleBycriteria, checkFailedFormatEmailElementValidationMessage, checkFailedFillFieldElementValidationMessage } from '../util'

// Filled Form: Test 'contact' to fill form  'Contact Us' by loop test cases in testCasesArray.
// e.g. testCasesArray = [{ type: 'contact', testCaseName: 'contact_01' }, ...] 
// e.g. writeTestCaseResult, continuedWriteTestCaseResult = true/false
export const filledFormContactUsTestScripts = (options) => {

    const { testCasesArray, writeTestCaseResult, continuedWriteTestCaseResult } = options;

    // Slow test cypress down for recording video when runs command 'cypress run'.
    slowCypressDown();

    before(() => {
        // Variable: Set testCaseResultVariable's object 1st times.
        cy.task('clearTestCaseResultVariable');
    });
    
    testCasesArray.forEach((testCaseDetail, testIndex) => {
        
        const { type, testCaseName } = testCaseDetail;
    
        describe(`[Filled Form] ${testIndex+1}.${testCaseName}-Test filled form 'Contact Us'`, () => {
          
            beforeEach(() => {
                // API: Set website base intercept.
                cy.setWebsiteBaseIntercept();
    
                // Variable: Set testCasecriteriaVariable's object 1st times.
                cy.task('clearTempVariables');
            });
    
            it(`${testIndex+1}.1.${testCaseName}: Start test filled form 'Contact Us'`, () => {
    
                cy.log(`++++ ${testCaseName}: Start test filled form 'Contact Us' ++++`);
                console.log(`++++ ${testCaseName}: Start test filled form 'Contact Us' ++++`);

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
                    cy.visitPageByURL('contact_us');

                    cy.log(`++++ Filled Contact Us Form ++++`);
                    console.log(`++++ Filled Contact Us Form ++++`);

                    // Get 'Contact Us' form input config from inputConfig.json to loop filled input.
                    // e.g. contactInputConfig = { "formcriteria": [{ "name": "contact|name", "formTitle": "Name", "elementName": "[data-qa='name']","formType": "input", "howToFilled": "type", "elementDisplay": "enable","defaultValue": [], "isRequiredField": "requierd"}, ...]}]
                    const contactInputConfig = getObjectFromReferenceMappingJson('inputConfig', 'contactUs');

                    // Checked & Filled: Loop checked and filled 'Contact Us' form element value by criteria value base on form type.
                    contactInputConfig['formcriteria'].forEach(formcriteria => {
                        filledFormElementVauleBycriteria({
                            formcriteria: formcriteria,
                            criteria: criteria,
                        });
                    });

                    // Button: Click button 'submit' to submit form.
                    cy.get('#contact-us-form [data-qa="submit-button"]').click();

                    // Checking: Checking show element of result base on test result 'success' or 'failed'. 
                    switch(true) {
                        case criteria['contact|result'] === 'success': 
                            // Alert Confirm Popup: Checking text in alert and click 'Ok'.
                            // Note: With 'cy.onn('window:confirm'..)', Cypress default will click 'Ok' after alert.
                            cy.on('window:confirm', (text) => {
                                expect(text).to.contains('Press OK to proceed!');
                            });

                            // Show element of alert message successfully submit 'Contact Us' form.
                            cy.get('.contact-form .alert-success').should('be.visible').then($ele => {
                                expect($ele.text()).to.equal('Success! Your details have been submitted successfully.');
                            });

                            // Button: Click button 'Home' to back to homepage.
                            cy.get('#form-section .btn-success').click();
                            cy.wait('@homepage');
                            break;
                        case criteria['contact|result'] === 'cancel': 
                            // Alert Confirm Popup: Check text in alert and click 'Cancel'
                            // Note: Return false to click 'Cancel' after alert.
                            cy.on('window:confirm', (text) => {
                                expect(text).to.contains('Press OK to proceed!');
                                return false;
                            });

                            // Should not show alert message successfully submit 'Contact Us' form.
                            cy.get('.contact-form .alert-success').should('not.be.visible');
                            break;
                        case  criteria['contact|result'].startsWith('failed-format'):
                            // failed-format: Get input config to check element failed format email of input validation message.
                            // e.g. criteria['contact|result'] = 'failed-format-contact|email' => 'contact|email'                  
                            checkFailedFormatEmailElementValidationMessage(
                                contactInputConfig['formcriteria'], 
                                criteria['contact|result']
                            )
                            break;
                        case criteria['contact|result'].startsWith('failed-filled'):
                            // failed-filled: Get input config to check element failed field of input validation message.
                            // e.g. criteria['contact|result'] = 'failed-filled-contact|name' => 'contact|name'
                            checkFailedFillFieldElementValidationMessage(
                                contactInputConfig['formcriteria'], 
                                criteria['contact|result']
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




