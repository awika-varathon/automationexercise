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
import { filledFormElementVauleBycriteria, loopCheckElementAndCompareValues, checkElementValidationMessage, convertNowDateOrTimeForTestCaseResult, getReferenceFilePathName, getReferenceMappingJson, getObjectFromReferenceMappingJson, setTestCaseResultObject, setResultObjectKeys, convertJSONArrayToGoldenCSV } from '../support/util'

///////////////////////////////////////////
// Error: Set 'uncaught:exception' to escape error from click button 'Add to cart' after click to brands page and category page
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
});

///////////////////////////////////////////
// ++++ API & Response ++++
// API: Set website base intercept
Cypress.Commands.add('setWebsiteBaseIntercept', () => {
    // Get api info from apiConfig.json to set intercept
    // e.g. apiInfo = [{ "name": "login", "type": "login", "method": "GET", "urlType": "string", "url": "/api/auth/session", "setIntercept": true }, ...]
    const apiInfo = getReferenceMappingJson('apiConfig');

    // Loop set all website base intercept if setIntercept is true (In case cancel api)
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
            // console.log(new RegExp(info['url'], 'i'))
        }
    })
});

///////////////////////////////////////////
// ++++ Excel criteria ++++
// Excel: Get test case's criteria from excel by test case's name and set to test case criteria variable 
Cypress.Commands.add('setTestCasecriteriaVariableFromExcel', (options) => {
    const { testCaseName, testCaseType } = options;

    // Set file path name of excel
    // e.g. filePathName = cypress/fixtures/testCasecriteria/testCasecriteria_register.xlsx
    const filePathName = `${getReferenceFilePathName('testCasecriteria')}/testCasecriteria_${testCaseType}.xlsx`

    cy.task('readXlsx', { file: filePathName, sheet: testCaseName}).then((rows) => {
                
        cy.log(`++++ ${testCaseName}: Get e2e test case's detail from excel ++++`);
        console.log(`++++ ${testCaseName}: Get e2e test case's detail from excel ++++`);

        let testCasecriteria = {};

        // Info: Set this test case's info 
        // Note: Maybe do criteria format in other test type in future
        testCasecriteria['testCase'] = testCaseName;
        testCasecriteria['criteria'] = rows[0];

        // criteria: Set test case criteria to test case criteria variable by testCaseName
        cy.task('setTempVariable', { name: `testCasecriteria_${testCaseName}`, value: testCasecriteria });
        console.log(`test case criteria: ${testCaseName}`, testCasecriteria);
    });

});

// Excel: Get e2e order test case's criteria from excel by test case's name and set to test case criteria variable 
Cypress.Commands.add('setOrderTestCasecriteriaVariableFromExcel', (options) => {
    const { testCaseName, testCaseType } = options;

    // Set file path name of excel
    // e.g. filePathName = cypress/fixtures/testCasecriteria/testCasecriteria_register.xlsx
    const filePathName = `${getReferenceFilePathName('testCasecriteria')}/testCasecriteria_${testCaseType}.xlsx`

    cy.task('readXlsx', { file: filePathName, sheet: testCaseName}).then((rows) => {
                
        cy.log(`++++ ${testCaseName}: Get e2e test case's detail from excel ++++`);
        console.log(`++++ ${testCaseName}: Get e2e test case's detail from excel ++++`);

        let testCasecriteria = {};
        let orderListsArray = [];
        let orderSummaryTotal = 0;
        
        // Info: Set this test case's info 
        testCasecriteria['testCase'] = testCaseName;

        // Product: Get all products detail from config 
        const productsConfig = getReferenceMappingJson('productsConfig.json');

        // Order: Loop set order detail of each product base on action
        // rows = [{"action": "add",	"orderNo": "1",	"loginOrSignup": "firstLogin|default", "name": "Blue Top", "qty": "1", "orderFromPage": "homepage", orderFrom: "card", "addToCartFrom": "card", "ProceedToCheckoutFrom": "popup", "orderComment": "Test case order_01"},...]
        rows.forEach((row, i) => {
            // console.log(row)

            const orderList = {};

            // Product: Find this product detail by name
            const productDetail = productsConfig.find(product => product['name'] === row['name']);

            // Order: Set order's action with criteria value and product detail
            orderList['order'] = Object.assign({}, row, productDetail);

            // orderTotal: Set order total, if action 'delete' set as Rs. 0 else calculate from price*qty
            orderList['order']['orderTotal'] = orderList['order']['action'] === 'delete' ? 'Rs. 0' : 'Rs. ' + (Number((orderList['order']['price']).replace('Rs. ', ''))*orderList['order']['qty']);
            
            // Login/Signup: If this order 'loginOrSignup' is not undefined, then do login/signup at this order and get user's info to login or signup from userConfig 
            if(row['loginOrSignup'] !== undefined) {

                // Convert: Convert criteria value to action and username
                // e.g. loginConfig = ['firstLogin','default']
                const loginConfig = row['loginOrSignup'].split('|');

                // loginOrSignup: Set action of login or signup and set to main level object to check if action is signup has to delete account at the end of test.
                // first(Login/Signup before order): 'firstLogin', 'firstSignup'
                // cart(Login/Signup after order): 'cartLogin', 'cartSignup' 
                orderList['loginOrSignup'] = loginConfig[0];
                testCasecriteria['loginOrSignup'] = loginConfig[0];

                // UserInfo: Get user info from userConfig.json by username
                // e.g. testCasecriteria['userInfo'] = { "title": "Mr.", "name": "Automated Test", "email": "automated.test@mail.com", "password": "automatedTest", "day": 1, "month": "January",...}
                testCasecriteria['userInfo'] = getObjectFromReferenceMappingJson('userConfig', loginConfig[1]);
            }

            // Check Order: Set check order to check afer do action of this order which has to refer from latest checkOrders 
            if(i === 0) {
                // 1st Order: 1st Order Set check order and orderSummary as this order 
                // checkOrders: Set check order as this order 
                orderList['checkOrders'] = [orderList['order']];
                
                // orderSummary: Plus this order price
                // e.g. price: "Rs. 500" => 500
                orderSummaryTotal +=  Number((orderList['order']['orderTotal']).replace('Rs. ', ''))
            } else {

                // Clone latest checkOrder from latest order in array to set new checkOrders
                // Note: Has to use JSON.parse(JSON.stringify()); method when update new checkOrders object won't update back to latest order object 
                // e.g. latestCheckOrder = [{action: 'add', orderNo: 1, name: 'Blue Top', qty: 1, orderFromPage:, ...]
                // console.log('lastCheckOrders', orderListsArray[i-1]['checkOrders']);
                const latestCheckOrders = JSON.parse(JSON.stringify(orderListsArray[i-1]['checkOrders']));

                let orderLineNo

                // Other Order: Set check order by action
                switch(orderList['order']['action']){
                    case 'add': 
                        // checkOrders: Concat checkOrder of latest checkOrder with this order
                        orderList['checkOrders'] = (latestCheckOrders).concat(orderList['order']);

                        // orderSummaryTotal: Plus this order total to orderSummaryTotal
                        orderSummaryTotal +=  Number((orderList['order']['orderTotal']).replace('Rs. ', ''));
                        break;
                    case 'addOn':
                        // addOn: Get indexOf order that have to update qty and order total from latestCheckOrders by 'orderNo'
                        // Note: This website, if buys same product will work as add on order so for action 'addOn' in criteria value sets orderNo refer to adding order of easier to update qty and order total.
                        orderLineNo = latestCheckOrders.findIndex(latest => latest['orderNo'] === orderList['order']['orderNo'])
                        // console.log(latestCheckOrders);
                        // console.log(orderLineNo);
                        // console.log(latestCheckOrders[orderLineNo]);

                        // qty: Update order's qty to the same order in latestCheckOrders by indexOf order
                        latestCheckOrders[orderLineNo]['qty'] = (Number(latestCheckOrders[orderLineNo]['qty']) +  Number(orderList['order']['qty'])).toString();

                        // orderTotal: Update order total to the same order in latestCheckOrders by indexOf order
                        latestCheckOrders[orderLineNo]['orderTotal'] = 'Rs. ' + (Number((orderList['order']['price']).replace('Rs. ', ''))*latestCheckOrders[orderLineNo]['qty']);

                        // checkOrders: Set checkOrder as latestCheckOrders
                        orderList['checkOrders'] = latestCheckOrders;

                        // orderSummaryTotal: Plus this order total to orderSummaryTotal
                        orderSummaryTotal +=  Number((orderList['order']['orderTotal']).replace('Rs. ', '')); 
                        break;
                    case 'delete':
                        // delete: Get indexOf order that have to delete latestCheckOrders by 'orderNo'
                        // Note: For action 'delete' in criteria value sets orderNo refer to adding order of easier to set checkOrder in case has 'addOn' and 'delete' order before
                        orderLineNo = latestCheckOrders.findIndex(latest => latest['orderNo'] === orderList['order']['orderNo'])

                        // Delete: Set delete row number to click delete from table as indexOf order that have to delete latestCheckOrders to level orderList
                        orderList['deleteRowNo'] = orderLineNo;

                        // orderSummaryTotal: Minus this order total from orderSummaryTotal
                        // Note: Using orderTotal from latestCheckOrders in case criteria value hasn't set qty and update orderSummaryTotal first befor delete this order.
                        orderSummaryTotal -= Number((latestCheckOrders[orderLineNo]['orderTotal']).replace('Rs. ', '')); 
                
                        // checkOrders: Set checkOrder by removing delete order out of latestCheckOrders by orderLineNo
                        latestCheckOrders.splice(orderLineNo, 1);
                        orderList['checkOrders'] = latestCheckOrders
                        console.log('nowCheckOrders', latestCheckOrders);
                        
                        break;
                } 
            }

            // orderSummary: Set this order summary as now orderSummary
            orderList['orderSummary'] = 'Rs. ' + orderSummaryTotal;

            // orderListsArray: Push this orderList to orderListsArray
            orderListsArray.push(orderList);
        })
        testCasecriteria['orderLists'] = orderListsArray;

        // orderSummary: Set 
        // 1: checkOrders from the last checkOrder in orderListArray 
        // 2: orderSummaryTotal as now orderSummaryTotal with currency
        // 3: orderComment is set in the last row can be undefined = not do comment
        // 4: PaymentInfo from paymenyConfig by value as key
        // 5: orderResult can be 'success', 'failed-payment' 
        // Note: 'orderComment', 'paymentDetail', 'orderResult' is set in the last row with 'orderComment' can be undefined
        // e.g. 'orderSummary' = { checkOrders: [...] }, orderSummaryTotal: 'Rs. 500', paymentInfo: { "cardName": "Automated Test", "cardNumber": "1000200030004000", "cardCvc": 100, "cardExMonth": "05", "cardExYear": 2024}, orderResult: 'success' }
        testCasecriteria['orderSummary'] = {
            'checkOrders': orderListsArray[orderListsArray.length-1]['checkOrders'],
            'orderSummaryTotal': 'Rs. ' + orderSummaryTotal,
            'orderComment':  rows[rows.length-1]['orderComment'] !== undefined ? rows[rows.length-1]['orderComment'] : '',
            'paymentInfo':  getObjectFromReferenceMappingJson('paymentConfig', rows[rows.length-1]['paymentDetail']),
            'orderResult':  rows[rows.length-1]['orderResult']
        }

        // Criteria: Set test case criteria to test case criteria variable by testCaseName
        cy.task('setTempVariable', { name: `testCasecriteria_${testCaseName}`, value: testCasecriteria });
        console.log(`test case criteria: ${testCaseName}`, testCasecriteria);
    });

});

///////////////////////////////////////////
// ++++ Visit ++++
// Get websiteMenuConfig from json
// e.g. pageName = 'homepage', 'products', 'cart', 'login', 'logout', 'delete_account', 'test_cases', 'api_testing', 'contact_us', 'video_tutorials', 'errorCase'  

// Visit: Visit Homepage
Cypress.Commands.add('visitHomepage', () => {
    cy.visit('/');
    cy.wait('@homepage');
});

// Visit: Visit page fBy URL
Cypress.Commands.add('visitPageByURL', (pageName) => {
    const pageConfig = getObjectFromReferenceMappingJson('websiteMenuConfig', pageName);
    cy.visit(pageConfig['url']);
    cy.wait('@homepage');
});

// Visit: Visit page from click menu
Cypress.Commands.add('visitPageFromClickMenu', (pageName) => {
    const pageConfig = getObjectFromReferenceMappingJson('websiteMenuConfig', pageName);
    cy.contains(`.shop-menu ul li`, pageConfig['menuName']).click();
    if(pageName !== 'video_tutorials') {
        cy.wait('@homepage');
    } 
    else {
        cy.wait('@video_tutorials');
    }
});

// Visit: Visit page from click 'Category' at sidebar
Cypress.Commands.add('visitPageFromClickCategory', (categoryName) => {

    // Category: Convert categoryName for click sidebar category mainMenu and subMenu
    // e.g. categoryName = category[Women|Dress] => 'Women|Dress' => ['Women', 'Dress']
    const categoryArray =  categoryName.split('[').pop().replace(']', '').split('|');

    // 1: Click category's usertype or main title to open toggle of li category
    // 2: Click li of category or sub title to page in same panel in case other panel has same category name 
    cy.contains('.category-products h4.panel-title', categoryArray[0])
        .find('a')
        .trigger('click')
        .closest('.panel-default')
        .find(`div.panel-body ul li:contains("${categoryArray[1]}") a`)
        .click();
    cy.wait('@homepage');

    // Checking: Visiting 'Category' page
    // e.g. title = 'Kids - Dress Products'
    cy.checkPageFeaturesItemsTitle(`${categoryArray[0]} - ${categoryArray[1]} Products`);
});

// Visit: Visit page from click 'Brands' at sidebar
Cypress.Commands.add('visitPageFromClickBrands', (brandsName) => {

    // Brands: Convert brandsName to object for click sidebar brands
    // e.g. brands = brands[polo] => 'polo'
    const brands =  brandsName.split('[').pop().replace(']', '');

    // Click li's brands to page
    cy.contains('.brands_products div.brands-name ul li', brands).click();
    cy.wait('@homepage')

    // Checking: Visiting 'Brands' page
    // e.g. title =  'Brand - Polo Products'
    cy.checkPageFeaturesItemsTitle(`Brand - ${brands} Products`);
});

// Visit: Checking features items's title that visit correct page 
Cypress.Commands.add('checkPageFeaturesItemsTitle', (name) => {
    cy.get('.features_items h2.title').should('contain', name)
})

// Button: Click button continue to homepage and await api
Cypress.Commands.add('clickContinueButton', () => {
    // Button: Click button continue to homepage
    cy.get('a[data-qa="continue-button"]').click();
    cy.wait('@homepage');
});

///////////////////////////////////////////
// ++++ Login & Signup & Logout ++++
// ++++ Login ++++
// Login: Login by email and password from criteria
// Note: Has to check undefined for error case that skip filled input
Cypress.Commands.add('loginWebsite', (options) => {
    cy.log(`Login to your account`);
    console.log(`Login to your account`);
    cy.get('.login-form').within(() => {

        // Email: Clear & type email
        if(options['login|email'] !== undefined) {
            cy.get('input[data-qa="login-email"]')
            .clear().type(options['login|email']);
        }
        
        // Password: Clear & type password
        if(options['login|password'] !== undefined) {
            cy.get('input[data-qa="login-password"]')
            .clear().type(options['login|password']);
        }
        
        // Button: Click button 'Login' and wait api
        cy.get('button[data-qa="login-button"]').click();
        // cy.wait('@login'); 
    });
});

// Login: Check login message 
// Note: Need to set as options not pass all criteria in case set result different from criteria
// e.g. result = 'success', 'failed' , 'logout'  
Cypress.Commands.add('checkLoginMessage', (options) => {
    switch(options['result']) {
        case 'success':
            // success: Check menu 'Signup / Login' li's text is changed to 'Logout'
            cy.get('.shop-menu ul li a i.fa-lock').closest('a').should(($text => {
                expect($text.text()).to.contains('Logout');
            }));;
            // success: Check 'Login Name' li's text should have name in text
            cy.get('.shop-menu ul li a i.fa-user').closest('a').should(($text => {
                expect($text.text()).to.contains(options['name']);
            }));
            break;
        case 'logout':
            // logout: Check menu 'Signup / Login' li's text is changed to 'Signup / Login
            cy.get('.shop-menu ul li a i.fa-lock').closest('a').should(($text => {
                expect($text.text()).to.contains('Signup / Login');
            }));;
            // logout: Check 'Login Name' li should not exist
            cy.get('.shop-menu ul li a i.fa-user').should('not.exist');
            break;
        case 'failed-incorrect':
            // failed: Check show error message under login box
            cy.get('.login-form form p').should(($text) => {
                expect($text.text()).to.equal('Your email or password is incorrect!');
            }); 
            break;
        case 'failed-filledEmail':
            // failed-filledEmail: Checking input validation message by not filled email
            checkElementValidationMessage('[data-qa="login-email"]', 'fillField');
            break;
        case 'failed-filledPassword':
            // failed-filledPassword: Checking input validation message by not filled email
            checkElementValidationMessage('[data-qa="login-password"]', 'fillField');
            break;
    }
});

// ++++ Logout ++++
// Logout: Logout and check logout message
Cypress.Commands.add('logoutWebsite', () => {
    cy.log(`Logout to your account`);
    console.log(`Logout to your account`);

    // Visit: Logout from click menu
    cy.visitPageFromClickMenu('logout');

    // Checking: Check logout message 
    cy.checkLoginMessage({
        result: 'logout'
    });
});

// ++++ Signup ++++
// Signup: Signup by name and email from criteria
// Note: Has to check undefined for error case that skip filled input
Cypress.Commands.add('signupWebsite', (options) => {
    cy.log(`Signup to your account`);
    console.log(`Signup to your account`);
    cy.get('.signup-form').within(() => {

        // Name: Clear & type name
        if(options['login|name'] !== undefined) {
            cy.get('input[data-qa="signup-name"]')
            .clear().type(options['login|name']);
        }
        
        // Email: Clear & type email
        if(options['login|email'] !== undefined) {
            cy.get('input[data-qa="signup-email"]')
            .clear().type(options['login|email']);
        }
       
        // Button: Click button 'Signup' and wait api
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
        case 'failed-formatEmail':
            // failed-formatEmail: Checking input validation message by formatEmail
            checkElementValidationMessage('[data-qa="signup-email"]', 'formatEmail');
            // cy.wait(2000);
            break;
        case 'failed-filledEmail':
            // failed-filledEmail: Checking input validation message by not filled email
            checkElementValidationMessage('[data-qa="signup-email"]', 'fillField');
            // cy.wait(2000);
            break;
        case 'failed-filledName':
            // failed-filledEmail: Checking input validation message by not filled name
            checkElementValidationMessage('[data-qa="signup-name"]', 'fillField');
            // cy.wait(2000);
            break;
    }
});

// Signup: Filled signup information in 'Signup' page with criteria
Cypress.Commands.add('filledSignupInformation', (criteria, type) => {

    cy.log(`++++ Filled Signup Information ++++`);
    console.log(`++++ Filled Signup Information ++++`);

    // Get signup input config from inputConfig.json to loop filled input
    // e.g. signupInputConfig = { "formcriteria": [{ "name": "signup|title", "formTitle": "Title", "elementName": "title", "formType": "radio", "howToFilled": "select", "elementDisplay": "enable","defaultValue": [], "isRequiredField": "optional" }, ...]}
    const signupInputConfig = getObjectFromReferenceMappingJson('inputConfig', 'signup');

    // Criteria: Set filledcriteria by type
    // Note: Can signup from excel's criteria (test_register) and config.json's criteria (test_e2eOrder) 
    let filledcriteria = {};
    switch(type){
        case 'register': 
            // If type is 'userConfig', set as criteria
            filledcriteria = criteria
            break;
        case 'userConfig': 
            // If type is 'userConfig', set new criteria's key 
            // Login: Set keys for set value check reference from login
            const loginKeys = ['name','email']

            // Criteria: Loop set new criteria's key for filled signup with 'signup|' refer to signup inputConfig.json
            // e.g. criteria = { "title": "Mr.", "name": "Automated Test", "email": "automated.test@mail.com", "password": "automatedTest", "day": 1, ...}
            // e.g. filledcriteria = { "signup|title": "Mr.", "signup|name": "Automated Test", "signup|email": "automated.test@mail.com", "signup|password": "automatedTest", "signup|day": 1, ...}
            Object.keys(criteria).forEach(key => {
                filledcriteria['signup|'+ key] = criteria[key];

                // Login: If key in loginKeys,set value check reference from login as new criteria's key with 'login|'
                if(loginKeys.some(login => login === key )) {
                    filledcriteria['login|'+ key] = criteria[key];
                }
            })

            // Criteria: Set signup result as 'success' to login
            filledcriteria['signup|result'] = 'success';
            break;
    } 
    // console.log(signupInputConfig);
    // console.log(filledcriteria);

    // Checked & Filled: Loop checked and filled signup form element value by criteria value base on form type
    signupInputConfig['formcriteria'].forEach(formcriteria => {
        filledFormElementVauleBycriteria({
            formcriteria: formcriteria,
            criteria: filledcriteria,
        });
    });

    // Button: Click button 'Create account'
    cy.get('button[data-qa="create-account"]').click();

    // Checking: Checking signup result success or failed  
    switch(filledcriteria['signup|result']) {
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
                name: filledcriteria['signup|name'],
                result: 'success'
            });

            // Action: Do action after signup
            if(criteria['signup|action'] !== undefined) {
                switch(criteria['signup|action']) {
                    case 'logout':
                        // Logout: Logout and check logout message
                        cy.logoutWebsite();
                        break;
                    case 'delete':
                        // Delete Account: Delete account from click menu and check delete account success
                        cy.deleteAccountFromClickMenu();
                        break;
                }
            }
        break;
        case 'failed-dateOfBirth': 
            // failed-dateOfBirth: Should not create account successfuly with verify that 'ACCOUNT CREATED!' is visible because date of birth is wrong format.
            cy.get('h2[data-qa="account-created"]').should('not.be.exist');
            break;
    }
});

// Login/Signup: Do action login or signup with criteria from userConfig.json
Cypress.Commands.add('doActionLoginOrSignup', (loginOrSignup, userInfo) => {
    
    // Do Action: Do action of e2e order test cases which result always 'success'
    switch(true){
        case loginOrSignup.includes('Login'):
            // login: login with userInfo & check login message
            cy.loginWebsite({
                'login|email': userInfo['email'],
                'login|password': userInfo['password']
            });
            cy.checkLoginMessage({
                name: userInfo['name'],
                result: 'success'
            });
            break;
        case loginOrSignup.includes('Signup'):
            // signup: signup in 'Signup / Login' page page with userInfo
            cy.signupWebsite({
                'login|name': userInfo['name'],
                'login|email': userInfo['email'],
                'login|result': 'success'
            });
            cy.filledSignupInformation(userInfo, 'userConfig');
            break;
    }
});

// Delete Account: Delete account from click menu and check delete account success
Cypress.Commands.add('deleteAccountFromClickMenu', () => {
    // Visit: Delete account from click menu & Wait api delete account
    cy.visitPageFromClickMenu('delete_account');
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
});

// User: Clear userType|login's cart and deleted userType|signup from userConfig.json before test e2e order test cases
// Note: Can parse userName in case using this command to clear user between test case
Cypress.Commands.add('clearUserFromUserconfig', (userName, userObject = {}) => {

    // Set userInfo and userNameArray base on userName
    let userInfo, userNameArray

    if(userName === 'userObject') {
        // User Info: If userName is 'userObject', set user info as userObject
        // e.g. userInfo { "username":{ "userType": "signup","keys": "username", "email": criteria['signup|email'], "password": criteria['signup|password'] } }
        userInfo = userObject; 

        // User Name Array: Set userNameArray as userObject's keys
        userNameArray = Object.keys(userObject);
    } else {
        // User Info: Else, set user info from userConfig.json 
        // e.g. userInfo = { "automatedUser": { "userType": "login", "title": "Mr.", "name": "Automated Test", "email": "automated.test@mail.com", "password": "automatedTest", "day": 1, "month": "January",...}, ...}
        userInfo = getReferenceMappingJson('userConfig');
        // User Name Array: Set userNameArray from userName as keys if userName sets as 'allConfig' then loop clear all user in config
        userNameArray = userName === 'allConfig' ? Object.keys(userInfo) : [userName];
    }
    // console.log(userNameArray);
    
    // Loop clear user by userType:login's cart and deleted userType:signup
    userNameArray.forEach(user => {

        const userObject = userInfo[user];
        cy.log('Clear username: ' + user)
        console.log(user, userObject)

        // ++++ Visit Signup / Login page ++++
        cy.visitPageFromClickMenu('login');

        // userType|signup: Clear this user order in cart info table to be emtpy
        if(userObject['userType'] === 'login') {

            // login: login with criteria & check login message
            cy.loginWebsite({
                'login|email': userObject['email'],
                'login|password': userObject['password']
            });

            // Visit: Visit page 'Cart' to checkOrder in 'Shopping Cart' page
            cy.visitPageFromClickMenu('cart');

            // Check in cart info table still has orders in cart or not. If still has orders, loop clear all orders in cart. 
            cy.get('#cart_info').then($ele => {
                const tr = $ele.find('#cart_info_table tbody tr');
                cy.log('Type Login: ' + user + ' ' + tr.length > 0 ? 'HAS' : 'NO' + ' order in cart.')
                if(tr.length > 0) {
                    for(let i = 0 ; i < tr.length ; i++) {
                        cy.deletedOrderFromShoppingCart(0);
                    }
                }
            })

            // Logout: From this user
            cy.logoutWebsite();
        }

        // userType|signup: If still can login, delete account
        if(userObject['userType'] === 'signup') {

            // login: login with criteria & check login message
            cy.loginWebsite({
                'login|email': userObject['email'],
                'login|password': userObject['password']
            });
            cy.wait(1000)

            // If login is 'success' = NOT show error message => delete account
            cy.get('body').then(($ele) => {
                const form = $ele.find('.login-form > form > p');
                cy.log('Type Signup: ' + user + ' ' + form.length > 0 ? 'IS' : 'IS NOT' + ' exist.');
                if(form.length === 0) {
                    cy.deleteAccountFromClickMenu();
                }
            }); 
        }
    })
});

///////////////////////////////////////////
// ++++ Search ++++
// Search: Search product in page from serch box (products page only)
// Note: If click button submit search without type searchText, Search page will show all products.
Cypress.Commands.add('searchProductFromSearchbox', (searchText) => {

    let checkTitle = 'All Products';

    // If searchText is not '', type searchText in search box and set checkTitle
    if(searchText !== '') {
        cy.get('input#search_product').click().clear().type(searchText);
        checkTitle = 'Searched Products'
    }

    // Button: Click button submit search, wait api and check is 'Search product' page
    cy.get('button#submit_search').click();
    cy.wait('@homepage');
    cy.checkPageFeaturesItemsTitle(checkTitle);
});

///////////////////////////////////////////
// ++++ Do action Product ++++
// Add: Do action add product from product card
Cypress.Commands.add('doActionAddProductFromCard', (order) => {

    // Set mainElement as section to find product card
    // Note: Have to check order['addToCartFrom'] is undefined because function using in 'test_checkProducts.js' too which doesn't set key 'addToCartFrom' and 'addToCartFrom' in order's object
    let mainElement 
    if(order['addToCartFrom'] !== undefined && order['addToCartFrom'] === 'recomendedCard') {
        // If addToCartFrom is 'recomendedCard', set mainElement as '.recommended_items'       
        mainElement = '.recommended_items';

        // Find product card by product name in recomended section, wait till carousel's item of this product card is active then add product to cart. 
        // Note: Recomended section has 2 carousel's items which has 3 product cards per carousel's item. Product card in carousel can have case product card not in carousel's item that is not active yet so has to wait till is active in this step first.
        cy.contains(`${mainElement} div.product-image-wrapper .productinfo p`, order['name'])
            .closest('.item', {timeout: 50000})
            .should('have.class', 'active');
    } else {
        // Else set mainElement as '.features_items' to find product card from features item section
        mainElement = '.features_items';
    }

    // addToCartFrom: Find product card by product name in mainElement section and add product to cart by addToCartFrom which is from card or view detail page
    cy.contains(`${mainElement} div.product-image-wrapper .productinfo p`, order['name'])
    .closest('.product-image-wrapper').then($card =>{
            
        switch(true) {
            case order['addToCartFrom'] === undefined:
                // addToCartFrom: if undefined means test_checkProducts
                // Checking: Check detail of product in product card is correct
                cy.checkElementsInSectionAndCompareValues('card', order, $card);
                break;
            case order['addToCartFrom'] === 'card':
            case order['addToCartFrom'] === 'recomendedCard':
                // addToCartFrom: 'card', 'recomendedCard'
                // Button: Click button 'Add to cart', wait api and check response message that added product success
                // Note: Still find way to trigger '.product-overlay' which is parse pseudo css to ':hover' for better test action
                // cy.get('.single-products').rightclick().find('.product-overlay .add-to-cart').should('be.visible').click();
                cy.get($card).find('.productinfo .add-to-cart').should('be.visible').click();
                cy.wait('@addOrder').its('response.body').should('equal', 'Added To Cart');
            break;
            case order['addToCartFrom'].startsWith('view'):
                // addToCartFrom: 'viewAdd', 'viewCheckAdd', 'viewCheck', ''viewCheckComment'
                // Button: Click button 'View Product' to View Detail page and wait api before do action in card
                cy.get($card).find('.choose a').click();
                cy.wait('@homepage');
                cy.doActionInViewDetailPage(order, order['addToCartFrom']);
            break;
        }
    })
});

// Add: Do action in view detail page 
// e.g. action = viewCheck: Check product detail only, viewAdd: add product to cart only, viewCheckAdd: Check product detail and add to cart, 
Cypress.Commands.add('doActionInViewDetailPage', (order, action) => {

    switch(action) {
        case 'viewCheck':
        case 'viewCheckAdd':
        case 'viewCheckComment':
            // Checking: Check detail of product in view detail page is correct
            cy.checkElementsInSectionAndCompareValues('productDetail', order);
            // break; // Not break to do next step if in case
        case 'viewAdd':
        case 'viewCheckAdd':
            // Add product to cart by order criteria
            cy.get('.product-details .product-information').within($ele => {
                // Qty: Edit product qty    
                cy.get('input#quantity').click().clear().type(order['qty']);

                // Button: Click button 'Add to cart', wait api and check response message that added product success
                cy.get('button.cart').click();
                cy.wait('@addOrder').its('response.body').should('equal', 'Added To Cart');
            }) 
            break;
    }
});

// Delete: Delete order from shopping cart table by row no of product (e.g. deleteRowNo: 1)
// Note: Only action 'delete' will set 'deleteRowNo' from setting criteria
Cypress.Commands.add('deletedOrderFromShoppingCart', (deleteRowNo) => {
    // Click delete icon at row of product that has to delete and wait api and check response message that delete product success
    cy.get('table#cart_info_table tbody tr').eq(deleteRowNo).find('a.cart_quantity_delete').click();
    cy.wait('@deletedOrder').its('response.body').should('equal', 'Cart removed');
});

///////////////////////////////////////////
// ++++ Do action payment ++++
// Payment: Filled payment information in 'Payment' page with criteria
Cypress.Commands.add('filledPaymentInformation', (criteria, result) => {

    cy.log(`++++ Filled payment information ++++`);
    console.log(`++++ Filled payment information ++++`);

    // Get payment config from inputConfig.json to loop filled input
    // e.g. paymentInputConfig = { "formcriteria": [ { "name": "cardName", "formTitle": "Name on Card", "elementName": "[data-qa='name-on-card']", "formType": "input", "howToFilled": "type","elementDisplay": "enable", "defaultValue": [],"isRequiredField": "requierd" }, ...]}
    const paymentInputConfig = getObjectFromReferenceMappingJson('inputConfig', 'payment');
    
    // Checked & Filled: Loop checked and filled payment section form element value by criteria value
    paymentInputConfig['formcriteria'].forEach(formcriteria => {
        filledFormElementVauleBycriteria({
            formcriteria: formcriteria,
            criteria: criteria,
        });
    });

    // Button: Click button 'Pay and Confirm Order'
    cy.get('button[data-qa="pay-button"]').click();

    // Checking: Checking payment result success or failed  
    switch(result) {
        case 'success': 
            // Wait api to 'Order Placed' Page and check success message is shown
            // Note: Still find way to get alert message under pay-button in 'Payment' Page but after click button Cypress auto loads to 'Order Placed' Page and can't get element before load page 
            // cy.get('div#success_message .alert-success') 
            // .should('contain', 'Your order has been placed successfully!')
            cy.wait('@homepage');
            cy.get('#form .container h2[data-qa="order-placed"]').should('contain', 'Order Placed!');
            cy.get('#form .container p').should('contain', 'Congratulations! Your order has been confirmed!');
        break;
        case 'failed-paymentExp': 
            // failed-payment: Dummy error case which can happen for payment process.
            // Note: This website not check these error. 
            const errorCase = {
                'failed-paymentExp': 'Alert success should not show because of credit card is expiried'
            }
            cy.get('div#success_message .alert-success').should(($ele) => {
                expect($ele).to.not.be.visible(errorCase['result'])
            })
            break;
    }
});

///////////////////////////////////////////
// ++++ Checking Elements ++++
// Checking: Loop check elements from checkElemantsConfig.json and compare value with checkCriteria
Cypress.Commands.add('checkElementsInSectionAndCompareValues', (checkSection, checkCriteria, $mainElement = '') => {

    console.log(checkCriteria);

    // Get checkElements info from inputConfig.json to loop check value of element
    // e.g. checkElementsConfig = { "name": "productDetail", "mainElement": ".product-details", "mappingCheckElementObject": [{ "name": "orderImg", "type": "element", "elementName": ".view-product", "checkElement": [{ "key": "img","id": "img|src", "type": "attr", "matchType": "equal", "toLowerCase": false }]}, ...]}
    const checkElementsConfig = getObjectFromReferenceMappingJson('checkElementsConfig', checkSection);

    const { mainElement, mappingCheckElementObject } = checkElementsConfig;

    // Loop checkElements by mappingCheckElementObject
    mappingCheckElementObject.forEach(elementObject => {

        const { name, type, elementName, checkElement } = elementObject;
        
        cy.log(`++++ Loop check elements and compare values: ${checkSection}-${name} ++++`);
        console.log(`++++ Loop check elements and compare values: ${checkSection}-${name} ++++`);

        if(type === 'element' && checkSection !== 'card') {
            // element not 'card': Check detail in element by 'elementName'
            cy.get(mainElement)
            .find(elementObject['elementName'])
            .within($ele => {
                // Loop check element and compare value with criteria value
                loopCheckElementAndCompareValues($ele, checkElement, checkCriteria);
            });
        } else if(type === 'element' && checkSection === 'card') {
            // element & 'card': Set mainElement as $mainElement because has to specified card by product's name from function 'doActionAddProductFromCard' before check detail in element by 'elementName'
            cy.get($mainElement)
            .find(elementObject['elementName'])
            .within($ele => {
                // Loop check element and compare value with criteria value
                loopCheckElementAndCompareValues($ele, checkElement, checkCriteria);
            });
        } else if(type === 'table' && checkCriteria.length === 0) {
            // table: No order in order list, check no order
            // Checking: Checking elements in 'Shopping Cart' page that show shopping cart is empty
            cy.checkShoppingCartTableIsEmpty('afterDelete');
        } else if(type === 'table' && checkCriteria.length > 0) {
            // table: Has orders in order list, check has correct orders
            // Check table tr's length has to equal checkCriteria's length 
            // Note: Section 'Review Your Order' in 'Checkout' Page need to plus 1 rows as last row is summary total row
            cy.get(mainElement + ' ' + elementName).should('have.length', checkSection === 'reviewYourOrder' ? checkCriteria.length+1 : checkCriteria.length);

            // Loop check criteria array as order's list, check element and compare value with each order criteria value
            checkCriteria.forEach((criteria, i) => {
                cy.get(mainElement)
                    .find(elementName)
                    .eq(i)
                    .within($ele => {
                        // Loop check product detail from element value is equal order detail
                        loopCheckElementAndCompareValues($ele, checkElement, criteria);
                    });
            })
        }
    })
});

// Checking: Checking elements in 'Shopping Cart' page that show shopping cart is empty
// Note: Should fixed this method to check 'visible' or 'exist' which not every case is 'default' case
Cypress.Commands.add('checkShoppingCartTableIsEmpty', (type = 'default') => {
    cy.get('#empty_cart').should('be.visible');
    switch(type){
        case 'afterDelete': 
            cy.get('table#cart_info_table').should('not.be.visible');
            cy.get('#do_action .check_out').should('not.be.visible');
            break;
        case 'default': 
            cy.get('table#cart_info_table').should('not.be.exist');
            cy.get('#do_action .check_out').should('not.be.exist');
            break;
    } 
});

///////////////////////////////////////////
// ++++ Test Case Result ++++
// Result: Set base test case result to test case result variable 
// e.g. testCaseDetail = { type: 'login', testCase: 'login_01' }
Cypress.Commands.add('setBaseTestCaseResultObject', (testCaseDetail) => {

    let testCaseName, setResultObject;
    testCaseName = testCaseDetail['testCaseName'];

    // Get setResultObject from test case result config JSON by test case type
    // e.g. formInfo = [{  "name": "testDate", "title": "Test Date", "type": "date", "setValue": "data"},...]
    setResultObject = setResultObjectKeys(testCaseDetail['type']);
    
    // Set base test case result by setResultObject to test case result variable 
    // Note: Set test status default as 'Failed' then update to 'Pass' if test success 
    const testCaseResult = setTestCaseResultObject({
        testCaseDetail: testCaseDetail, 
        testCaseResult: {}, 
        setResultObject: setResultObject
    });

    // Result: Set base test case result to test case result variable by testCaseName
    console.log(`++++ ${testCaseName}: Set Base Test Case Result Object ++++`);
    console.log(testCaseResult);
    cy.task('setTestCaseResultVariable', { name: testCaseName, value: testCaseResult });
});

// Result: Update test case result object then set back to test case result variable
Cypress.Commands.add('updateTestCaseResultObject', (options) => {
    
    const { testCaseDetail, type } = options;
    const testResultObject = options.testResultObject !== undefined ? options.testResultObject : [];

    let testCaseName, setResultObject, getElement
    
    // Set testCaseName as testCaseName
    testCaseName = testCaseDetail['testCaseName'];

    // Get setResultObject from test case result config JSON by test case type
    // e.g.  "errorMessage": [{ "name": "errorMessage","type": "testResultObject-massage",  "setValue": "errorMessage", "checkValue": ""}]
    setResultObject = getObjectFromReferenceMappingJson('updateTestCaseResultConfig', type);

    // Get base test case result from test case result variable 
    cy.task('getTestCaseResultVariable' , { name: testCaseName }).then(testCaseResult => {
        cy.log(`++++ ${testCaseName}: Update Test Case Result Object-${type} ++++`);
        console.log(`++++ ${testCaseName}: Update Test Case Result Object-${type} ++++`);

        // Update test case result object by setResultObject as key as from testResultObject as value then set back to test case result variable 
        testCaseResult = setTestCaseResultObject({
            testCaseDetail: testCaseDetail, 
            testCaseResult: testCaseResult, 
            testResultObject: testResultObject,
            setResultObject: setResultObject
        });
        
        cy.task('setTestCaseResultVariable', { name: testCaseName, value: testCaseResult });
        console.log('setTestCaseResultVariable', testCaseResult);
    })
});

// Result: Write test case results to CSV by test case type from test case result variable which set column from config's testCaseResult.
Cypress.Commands.add('writeTestCaseResultToCSV', (options) => {

    const { type, testCaseName, continuedWriteTestCaseResult,  testIndex } = options;
    
    let setResultObject, filename, filePathName, testStatus, errorMessage

    // setResultObject : Get setResultObject from test case result config JSON by default and test case type
    // e.g. setResultObject = [{  "name": "testDate", "title": "Test Date", "type": "date", "setValue": "data", "isBaseKey": true },
    setResultObject = setResultObjectKeys(type);

    // filePathName: Set file path name for test result
    // e.g. filePathName = cypress/download/testResult_login/230704_testResult_login.csv
    filename = `${convertNowDateOrTimeForTestCaseResult('dateFile')}_testResult_${type}.csv`
    filePathName = `${getReferenceFilePathName('testResult')}_${type}/${filename}`

    // Write test case result to CSV from test case result variable by testCase (e.g.'login_01')
    // e.g. testCaseDetail = { type: 'login', testCaseName: 'login_01' }
    // Get test case result from test case result variable 
    cy.task('getTestCaseResultVariable' , { name: testCaseName }).then(testCaseResult => {
            
        cy.log(`++++ ${testCaseName}: Write Test Case Result To CSV ++++`);
        console.log(`++++ ${testCaseName}: Write Test Case Result To CSV ++++`);
        console.log(testCaseResult);

        // const keys = Object.keys(testCaseResult);

        //  Update testEndTime as nowTime
        testCaseResult['testEndTime'] = convertNowDateOrTimeForTestCaseResult('time');

        // Loop convert testCaseResult's key to title
        // e.g. writeTestCaseResult = { "Test Date": "04/07/2023", "Start Time": "16:58:29", "End Time": "16:59:00", "Test Case": "login_01", "Test Status": "Failed", …}
        const writeTestCaseResult = {};
        setResultObject.forEach(result => {
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
        errorMessage = testCaseResult['errorMessage'] !== undefined ? testCaseResult['errorMessage']  : '-'; 

    }).should(() => {

        let message = '';
        message += `Check e2e ${type} test case(${testCaseName}): Have to Pass ${type} test`
        // Show test result by type if 'Failed', show 'Failed'
        switch(type) {
            case 'login': 
            case 'register': 
            case 'e2eOrder':
                // Check e2e form test case result from all tests status have equal 'Pass'
                expect(testStatus).to.equal('Pass', message);
                break;
            case 'visit': 
                // Check e2e form test case result from all tests status have equal 'Pass'
                message += ` (Error Message: ${errorMessage})`;
                expect(testStatus).to.equal('Pass', message);
                break;
        }
    })
});

