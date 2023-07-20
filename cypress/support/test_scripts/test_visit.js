import '../commands'
import { slowCypressDown } from 'cypress-slow-down'
import { getObjectFromReferenceMappingJson } from '../util'

// 2e2: Test visit by test case loop by form type
// e.g. testCasesArray= [{ type: 'visit', testCaseName: 'visit_01', page: "homepage" }, { type: 'visit', testCaseName: 'visit_02', page: "products" }]
// e.g. writeTestCaseResult, continuedWriteTestCaseResult = true/false
export const e2eVisitTestScriptsbyTestCase = (options) => {

    const { testCasesArray, writeTestCaseResult, continuedWriteTestCaseResult }= options;

    // Slow test cypress down for recording video when runs command 'cypress run' 
    slowCypressDown();

    before(() => {
        // Variable: Set testCaseResultVariable's object 1st times
        cy.task('clearTestCaseResultVariable');
    });
    
    testCasesArray.forEach((testCaseDetail, testIndex) => {
        
        const { type, testCaseName, page } = testCaseDetail;
    
        describe(`[Visit] ${testIndex+1}.${testCaseName}-e2e Test visit page: ${page} `, () => {
          
            beforeEach(() => {
                // API: Set website base intercept
                cy.setWebsiteBaseIntercept();
    
                // Variable: Set testCasecriteriaVariable's object 1st times
                cy.task('clearTempVariables');
            });
    
            it(`${testIndex+1}.1.${testCaseName}: Start e2e test visit in website`, () => {
    
                cy.log(`++++ ${testCaseName}: Start e2e test visit in website ++++`);
                console.log(`++++ ${testCaseName}: Start e2e test visit in website ++++`);

                // Result: Set base test case result to test case result variable 
                // e.g. result = { testDate: "04/07/2023", testStartTime: "10:52:12", testEndTime: "-", testCase: "login_01", testStatus: "Failed"}
                cy.setBaseTestCaseResultObject(testCaseDetail);
    
                // ++++ Visit home page ++++
                cy.visitHomepage();

                // ++++ Visit page from click menu ++++
                cy.visitPageFromClickMenu(page);

                // ++++ Check visit page element from config ++++
                cy.checkVisitPageElement({
                    pageName: page,
                    testCaseDetail: testCaseDetail
                });

                cy.wait(2000); // Wait for recording video
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

///////////////////////////////////////////
// ++++ Visit ++++
// Visit: Check visit page element
Cypress.Commands.add('checkVisitPageElement', (options) => {

    const { testCaseDetail, pageName } = options;

    // Get this page config
    // pageConfig ={ "menuName": "Home", "menuIcon": "fa-home", "url": "/", "checkElement": [{ "name": "Carousel", "type": "exist", "elementName": "div[id='slider-carousel']" },...]}
    const pageConfig = getObjectFromReferenceMappingJson('websiteMeunConfig', pageName);

    const { url, checkElement } = pageConfig;
    
    // URL: Get url to check url case
    cy.url().then(pageURL => {

        cy.log('url: ' + pageURL);

        // Element: Get body to find check element
        // Note: For page 'video_tutorials' not check elememt because is in youtube page need to  
        cy.get('body').then($body => {

            let checkElementError = [];
            const headerMessage = `Page ${pageConfig['menuName']}: `;
            
            // Set checkUrl if pageName is not 'video_tutorials', add baseUrl at front
            const checkURL = pageName === 'video_tutorials' ? url : Cypress.config('baseUrl') + url;

            // url: Check url of this page, if not same as checkURL then push errorMassage
            if(checkURL !== pageURL) {
                checkElementError.push(`URL is ${pageURL} NOT ${checkURL}`);
            }
            cy.log(headerMessage + `URL is ${pageURL}:${checkURL}`);

            // Loop check element in page
            checkElement.forEach(checkEle => {
                
                const { name, type, elementName } = checkEle;
                let testResult = 'Pass';
                let message = '';

                // Check Element by type
                switch(type) {
                    case 'exist':
                        // exist: Check element is exist on page, if not exist then push errorMassage
                        // cy.get(elementName).should('be.exist'); // DEBUG ONLY
                        if( $body.find(elementName).length === 0) {
                            testResult = 'Failed'
                            checkElementError.push(`Element ${name} is not exist`);
                        } 
                        message = `Element[${name}] ${testResult === 'Pass' ? ' IS ' : ' IS NOT ' } exist`
                        break;
                }
                cy.log(headerMessage + message);
                console.log(headerMessage + message);
            })

            // If has checkElementError, update errorMessage to test case result variable
            if(checkElementError.length > 0) {
                cy.updateTestCaseResultObject({
                    testCaseDetail: testCaseDetail, 
                    type: 'errorMessage',
                    testResultObject: {
                        errorMessage: headerMessage + checkElementError.join(', '),
                        testStatus: 'Failed'
                    }
                });
            } else {
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

