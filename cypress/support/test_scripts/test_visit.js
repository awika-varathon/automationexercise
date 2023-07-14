import '../commands'
import { getObjectFromReferenceMappingJson, updateTestCaseResultObject} from '../util'

// 2e2: Test visit by test case loop by form type
// e.g. formTestCaseArray= [{ type: 'visit', testCaseName: 'visit_01', page: "homepage" }, { type: 'visit', testCaseName: 'visit_02', page: "products" }]
// e.g. writeTestCaseResult, continuedWriteTestCaseResult = true/false
export const e2eVisitTestScriptsbyTestCase = (options) => {

    const { formTestCaseArray, writeTestCaseResult, continuedWriteTestCaseResult }= options;

    before(() => {
        // Variable: Set testCaseResultVariable's object 1st times
        cy.task('clearTestCaseResultVariable');
    });
    
    formTestCaseArray.forEach((formTestCase, testIndex) => {
        
        const { type, testCaseName, page } = formTestCase;
    
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
                cy.setBaseTestCaseResultObject(formTestCase);
    
                // ++++ Visit home page ++++
                cy.visitHomepage();

                // ++++ Visit page from click menu ++++
                cy.visitPageFromClickMenu(page);

                // ++++ Check visit page element from config ++++
                cy.checkVisitPageElement({
                    pageName: page,
                    testCaseDetail: formTestCase
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
// ++++ Visit ++++
// Visit: Check visit page element
Cypress.Commands.add('checkVisitPageElement', (options) => {

    const { testCaseDetail, pageName } = options;

    // Get this page config
    // pageConfig ={ "menuName": "Home", "menuIcon": "fa-home", "url": "/", "checkElement": [{ "name": "Carousel", "type": "exist", "elementName": "div[id='slider-carousel']" },...]}
    const pageConfig = getObjectFromReferenceMappingJson('websiteMeunConfig', pageName);

    const { checkElement } = pageConfig;
    
    // Element: Get body to find check element
    cy.get('body').then($body => {

        let checkElementError = [];
        const headerMessage = `Page ${pageConfig['menuName']}: `;

        // Loop check element in page
        checkElement.forEach(checkEle => {
            
            const { name, type, elementName } = checkEle;
            let testResult = 'Pass';
            let message = '';

            // Check Element by type
            switch(type) {
                case 'exist':
                    // exist: Check element is exist on page, if not push errorMassage
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
                    errorMessage: headerMessage + checkElementError.join(', ')
                }
            });
        }
    })
});

