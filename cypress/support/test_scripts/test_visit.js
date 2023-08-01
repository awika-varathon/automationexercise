import '../commands'
import { slowCypressDown } from 'cypress-slow-down'
import { getObjectFromReferenceMappingJson } from '../util'

// Check Elements: Test 'visit' to check elements on website page by loop test cases in testCasesArray.
// e.g. testCasesArray= [{ type: 'visit', testCaseName: 'visit_01', page: "homepage" }, { type: 'visit', testCaseName: 'visit_02', page: "products" }]
// e.g. writeTestCaseResult, continuedWriteTestCaseResult = true/false
export const visitCheckElementsOnWebsitePageTestScripts = (options) => {

    const { testCasesArray, writeTestCaseResult, continuedWriteTestCaseResult }= options;

    // Slow test cypress down for recording video when runs command 'cypress run'.
    slowCypressDown();

    before(() => {
        // Variable: Set testCaseResultVariable's object 1st times.
        cy.task('clearTestCaseResultVariable');
    });
    
    testCasesArray.forEach((testCaseDetail, testIndex) => {
        
        const { type, testCaseName, page } = testCaseDetail;
    
        describe(`[Check Elements] ${testIndex+1}.${testCaseName}-Test 'visit' to check element on website ${page} page.`, () => {
          
            beforeEach(() => {
                // API: Set website base intercept.
                cy.setWebsiteBaseIntercept();
    
                // Variable: Set testCasecriteriaVariable's object 1st times.
                cy.task('clearTempVariables');
            });
    
            it(`${testIndex+1}.1.${testCaseName}: Start test 'visit' to check elements on website ${page} page.`, () => {
    
                cy.log(`++++ ${testCaseName}: Start test 'visit' to check elements on website ${page} page. ++++`);
                console.log(`++++ ${testCaseName}: Start test 'visit' to check elements on website ${page} page. ++++`);

                // Result: Set base test case result to test case result variable. 
                // e.g. result = { testDate: "04/07/2023", testStartTime: "10:52:12", testEndTime: "-", testCase: "login_01", testStatus: "Failed"}
                cy.setBaseTestCaseResultObject(testCaseDetail);
    
                // ++++ Visit home page ++++
                cy.visitHomepage();

                // ++++ Visit page from click menu ++++
                cy.visitPageFromClickMenu(page);

                // ++++ Check element on visit page base on websitePage config ++++
                cy.checkVisitPageElement({
                    pageName: page,
                    testCaseDetail: testCaseDetail,
                    writeTestCaseResult: writeTestCaseResult
                });

                cy.wait(1000); // Wait for recording video.
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

///////////////////////////////////////////
// ++++ Visit ++++
// Visit: Check element on visit page base on websitePage config.
Cypress.Commands.add('checkVisitPageElement', (options) => {

    const { testCaseDetail, pageName, writeTestCaseResult } = options;

    // Get website page config by pageName.
    // pageConfig = { "menuName": "Home", "menuIcon": "fa-home", "url": "/", "checkElement": [{ "name": "Carousel", "type": "exist", "elementName": "div[id='slider-carousel']" },...]}
    const pageConfig = getObjectFromReferenceMappingJson('websiteMenuConfig', pageName);

    const { url, checkElement } = pageConfig;
    
    // URL: Get now website URL to check URL case.
    cy.url().then(pageURL => {
        // cy.log('url: ' + pageURL);

        // Element: Get body to find check element
        // Note: For page 'video_tutorials' not check elememts because youtube page need to get element in iframe which using different Cypress command.  
        cy.get('body').then($body => {

            let checkElementsErrorArray = [];
            const headerMessage = `Page ${pageConfig['menuName']}: `;
            
            // URL: Set checkUrl if pageName is not 'video_tutorials', add baseUrl at front.
            const checkURL = pageName === 'video_tutorials' ? url : Cypress.config('baseUrl') + url;

            // URL: Check URL of this page, if not same as checkURL then push errorMassage.
            if(checkURL !== pageURL) {
                checkElementsErrorArray.push(`URL is ${pageURL} NOT ${checkURL}`);
            }
            cy.log(headerMessage + `URL is ${pageURL}:${checkURL}`);

            // Elements: Loop check elements in page by checkElement.
            checkElement.forEach(checkEle => {
                
                const { name, type, elementName } = checkEle;
                let testResult = 'Pass';
                let message = '';

                // Elements: Check Element in page by type.
                switch(type) {
                    case 'exist':
                        // exist: Check element is exist on page, if not exist then push errorMassage.
                        // cy.get(elementName).should('be.exist'); // DEBUG ONLY
                        if( $body.find(elementName).length === 0) {
                            testResult = 'Failed'
                            checkElementsErrorArray.push(`Element ${name} is not exist`);
                        } 
                        message = `Element[${name}] ${testResult === 'Pass' ? ' IS ' : ' IS NOT ' } exist`
                        break;
                }
                cy.log(headerMessage + message);
                console.log(headerMessage + message);
            })

            // Show test result of check element
            if(checkElementsErrorArray.length > 0) {
                // If has checkElementsErrorArray, update errorMessage to test case result variable and 'testStatus' to 'Failed'.
                cy.updateTestCaseResultObject({
                    testCaseDetail: testCaseDetail, 
                    type: 'errorMessage',
                    testResultObject: {
                        errorMessage: headerMessage + checkElementsErrorArray.join(', '),
                        testStatus: 'Failed'
                    }
                }).should(() => {
                    // If writeTestCaseResult is false return error to this test case with errorMessage.
                    if(!writeTestCaseResult) {
                        expect('Failed').to.equal('Pass', headerMessage + checkElementsErrorArray.join(', '));
                    }
                });
            } else {
                // No checkElementsErrorArray, update test case result variable of testStatus to 'Pass' if can finish test till this step.
                cy.updateTestCaseResultObject({
                    testCaseDetail: testCaseDetail, 
                    type: 'testStatus',
                    testResultObject: {
                        testStatus: 'Pass'
                    }
                });
            }
        })
    });
});

