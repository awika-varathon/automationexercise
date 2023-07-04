// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import { convertNowDateOrTimeForTestCaseResult, getReferenceFilePathName, getReferenceMappingJson, getObjectFromReferenceMappingJson, setTestCaseResultObject, convertJSONArrayToGoldenCSV } from '../support/util'
///////////////////////////////////////////
// ++++ API & Response ++++
// API: Set DMS's website base intercept
Cypress.Commands.add('setWebsiteBaseIntercept', () => {
    // Get api info from apiConfig.json to set intercept
    // e.g. apiInfo = [{ "name": "login", "type": "login", "method": "GET", "urlType": "string", "url": "/api/auth/session", "setIntercept": true }, ...]
    const apiInfo = getReferenceMappingJson('apiConfig');

    // Loop set all DMS's website base intercept if setIntercept is true (In case cancel api)
    apiInfo.forEach(info => {
        if(info['setIntercept']) {
            // Set intercept from 'method', 'url' and 'name' for 'url' check 'urlType' if is 'regex' convert 'url' from string to regex 
            // Note: In JSON config need to use '\\' as '\' to escape when read JSON file
            // e.g. JSON: "https:\\/\\/googleads\\.g\\.doubleclick\\.net\\/pagead\\/adview.*" => Read JSON: "https:\/\/googleads\.g\.doubleclick\.net\/pagead\/adview.*" => new RegExp: /https:\/\/googleads\.g\.doubleclick\.net\/pagead\/adview.*/i
            // e.g.1 cy.intercept({ method: 'GET', url: 'https://pagead2.googlesyndication.com/getconfig/sodar?sv=200&tid=gda&tv=r20230627&st=env'}).as('login');
            // e.g.2 cy.intercept({ method: 'GET', url: /https:\/\/googleads\.g\.doubleclick\.net\/pagead\/adview.*/i }).as('homepage');
            cy.intercept({ 
                method: info['method'], 
                url: info['urlType'] === "regex" ? new RegExp(info['url'], 'i') : info['url']
            }).as(info['name']);
        }
    })
});

///////////////////////////////////////////
// ++++ Excel Criterial ++++
// Excel: Get test case's criterial from excel by test case's name and set to test case criterial variable 
Cypress.Commands.add('setFormTestCaseCriterialVariableFromExcel', (options) => {
    const { testCaseName, testCaseType } = options;

    // Set file path name of excel
    // e.g. filePathName = cypress/fixtures/testCaseCriterial/testCaseCriterial_e2eRegisterAndLogin.xlsx
    const filePathName = `${getReferenceFilePathName('testCaseCriterial')}/testCaseCriterial_${testCaseType}.xlsx`

    cy.task('readXlsx', { file: filePathName, sheet: testCaseName}).then((rows) => {
                
        cy.log(`++++ ${testCaseName}: Get e2e test case's detail from excel ++++`);
        console.log(`++++ ${testCaseName}: Get e2e test case's detail from excel ++++`);

        let testCaseCriterial = {};

        // Info: Set this test case's form info 
        // Note: Maybe do criterial format in other test type in future
        testCaseCriterial['testCase'] = testCaseName;
        testCaseCriterial['criterial'] = rows[0];

        // Criterial: Set test case criterial to test case criterial variable by testCaseName
        cy.task('setTempVariable', { name: `testCaseCriterial_${testCaseName}`, value: testCaseCriterial });
        console.log(`test case criterial: ${testCaseName}`, testCaseCriterial);
    });

});

///////////////////////////////////////////
// ++++ Visit ++++
// Visit: Visit Homepage
Cypress.Commands.add('visitHomepage', () => {
    cy.visit('/');
    cy.wait('@homepage');
});

// Visit: Visit page from click menu
// e.g. pageName = 'Home', 'Products', 'Cart', 'Signup / Login', 'Test Cases', 'API Testing', 'Video Tutorials', 'login'  
Cypress.Commands.add('visitPageFromClickMenu', (pageName) => {
    cy.contains(`.shop-menu ul li`, pageName).click();
    cy.wait('@homepage');
});

///////////////////////////////////////////
// ++++ Login & Logout ++++
// Login: Login by email and password from criterial
Cypress.Commands.add('loginWebsite', (options) => {
    cy.log(`Login to your account`);
    console.log(`Login to your account`);
    cy.get('.login-form').within(() => {
        // Clear & type email
        cy.get('input[data-qa="login-email"]')
            .clear()
            .type(options['login|email']);
        // Clear & type password
        cy.get('input[data-qa="login-password"]')
            .clear()
            .type(options['login|password']);
        // Click login and wait api
        cy.get('button[data-qa="login-button"]').click();
        // cy.wait('@login'); 
    });
    
});

// Login: Check login message 
// Note: Need to set as options not pass all criterial in case set result different from criterial
// e.g. result = 'success', 'failed' , 'logout'  
Cypress.Commands.add('checkLoginMessage', (options) => {
    switch(options['result']) {
        case 'success':
            // success: Check menu 'Signup / Login' li's text is changed to 'Logout'
            cy.get('.shop-menu ul li a i.fa-lock').closest('a').should(($text => {
                expect($text.text()).to.contains('Logout');
            }));;
            // success: Check 'Login Name' li's text should have name in text
            cy.get('.shop-menu ul').find('li a i.fa-user').closest('a').should(($text => {
                expect($text.text()).to.contains(options['name']);
            }));
        break;
        case 'failed':
            // failed: Check show error message under login box
            cy.get('.login-form form p').should(($text) => {
                expect($text.text()).to.equal('Your email or password is incorrect!');
            }); 
        break;
        case 'logout':
            // logout: Check menu 'Signup / Login' li's text is changed to 'Signup / Login
            cy.get('.shop-menu ul li a i.fa-lock').closest('a').should(($text => {
                expect($text.text()).to.contains('Signup / Login');
            }));;
            // logout: Check 'Login Name' li should not exist
            cy.get('.shop-menu ul li a i.fa-user').should('not.exist');
        break;
    }
});

// Logout: Logout and check logout message
Cypress.Commands.add('logoutWebsite', () => {
    cy.log(`Logout to your account`);
    console.log(`Logout to your account`);

    // Logout from click menu
    cy.visitPageFromClickMenu('Logout');

    // Check logout message 
    cy.checkLoginMessage({
        result: 'logout'
    });
});

// Button: Click button continue to homepage and await api
Cypress.Commands.add('clickContinueButton', () => {
    // Submit: Click button continue to homepage
    cy.get('a[data-qa="continue-button"]').click();
    cy.wait('@homepage');
});

///////////////////////////////////////////
// ++++ Test Case Result ++++
// Result: Set base test case result to test case result variable 
// e.g. testCaseDetail = { type: 'login', testCase: 'login_01' }
Cypress.Commands.add('setBaseTestCaseResultObject', (testCaseDetail) => {

    let resultKey, formInfo;
    resultKey = testCaseDetail['testCaseName'];

    // Get form's info from form config JSON by test case type
    // e.g. formInfo = [{  "name": "testDate", "title": "Test Date", "type": "date", "setValue": "data", "isBaseKey": true },
    formInfo = getObjectFromReferenceMappingJson('testCaseResultConfig', testCaseDetail['type']);

    // Loop set base test case result by form's test case result info to test case result variable 
    // Note: Set test status default as 'Failed' then update to 'Pass' if test success 
    const testCaseResult = setTestCaseResultObject({
        testCaseDetail: testCaseDetail, 
        testCaseResult: {}, 
        formResult: formInfo
    });

    // Result:  Set base test case result to test case result variable by testCaseName
    console.log(`++++ ${resultKey}: Set Base Test Case Result Object ++++`);
    console.log(testCaseResult);
    cy.task('setTestCaseResultVariable', { name: resultKey, value: testCaseResult });
});

// Result: Write test case results to CSV by form from test case result variable. 
// Which set column from form config's testCaseResult.
Cypress.Commands.add('writeTestCaseResultToCSV', (options) => {

    const { type, resultKey, testCaseDetail, continuedWriteTestCaseResult,  testIndex } = options;
    
    let formInfo, filename, filePathName, testStatus, errorMessage

    // formInfo: Get form's info from form config JSON by test case type
    // e.g. formInfo = [{  "name": "testDate", "title": "Test Date", "type": "date", "setValue": "data", "isBaseKey": true },
    formInfo = getObjectFromReferenceMappingJson('testCaseResultConfig', type);

    // filePathName: Set file path name for test result
    // e.g. filePathName = cypress/download/testResult_login/230704_testResult_login.csv
    filename = `${convertNowDateOrTimeForTestCaseResult('dateFile')}_testResult_${type}.csv`
    filePathName = `${getReferenceFilePathName('testResult')}_${type}/${filename}`

    // Write test case result to CSV from test case result variable by testCase (e.g.'login_01')
    // e.g. testCaseDetail = { type: 'login', testCaseName: 'login_01' }
    // Get test case result from test case result variable 
    cy.task('getTestCaseResultVariable' , { name: resultKey }).then(testCaseResult => {
            
        cy.log(`++++ ${resultKey}: Write Test Case Result To CSV ++++`);
        console.log(`++++ ${resultKey}: Write Test Case Result To CSV ++++`);
        console.log(testCaseResult);
        
        // Update testStatus as 'Pass' and testEndTime as nowTime
        testCaseResult['testStatus'] = 'Pass';
        testCaseResult['testEndTime'] = convertNowDateOrTimeForTestCaseResult('time');

        // Loop convert testCaseResult's key to title
        // e.g. writeTestCaseResult = { "Test Date": "04/07/2023", "Start Time": "16:58:29", "End Time": "16:59:00", "Test Case": "login_01", "Test Status": "Failed", …}
        const writeTestCaseResult = {};
        formInfo.forEach(result => {
            writeTestCaseResult[result['title']] = testCaseResult[result['name']];
        })
        console.log(writeTestCaseResult);

        // Write test case's result detail to CSV, set object as array  
        convertJSONArrayToGoldenCSV({
            jsonArray: [writeTestCaseResult], 
            filePathName: filePathName,
            isFirstTestCase: continuedWriteTestCaseResult ? false: testIndex === 0 ? true : false 
        });

        // Return testStatus to show test result in cypress
        testStatus = testCaseResult['testStatus']; 
        // errorMessage = testCaseResult['errorMessage']; 

    }).should(() => {

        let message = '';
        // Show test result by type if 'Failed', show 'Failed'
        switch(type) {
            case 'login': 
            case 'register': 
                // Check 2e2 form test case result from all tests status have equel 'Pass'
                message += `Check 2e2 ${type} test case(${resultKey}): Have to Pass register and login test`
                // message += ` (Error Message: ${errorMessage})`;
                expect(testStatus).to.equal('Pass', message);
                break;
        }
    })
});

