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
import { filledFormElementVauleBycriteria, convertNowDateOrTimeForTestCaseResult, getReferenceFilePathName, getReferenceMappingJson, getObjectFromReferenceMappingJson, setTestCaseResultObject, setResultObjectKeys, convertJSONArrayToGoldenCSV } from '../support/util'
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
            console.log(new RegExp(info['url'], 'i'))
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

        // Info: Set this test case's form info 
        // Note: Maybe do criteria format in other test type in future
        testCasecriteria['testCase'] = testCaseName;
        testCasecriteria['criteria'] = rows[0];

        // criteria: Set test case criteria to test case criteria variable by testCaseName
        cy.task('setTempVariable', { name: `testCasecriteria_${testCaseName}`, value: testCasecriteria });
        console.log(`test case criteria: ${testCaseName}`, testCasecriteria);
    });

});

// Excel: Get order test case's criteria from excel by test case's name and set to test case criteria variable 
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
        let orderSummary = 0;
        
        // Info: Set this test case's info 
        testCasecriteria['testCase'] = testCaseName;

        // Product: Get all products detail from config 
        const productsConfig = getReferenceMappingJson('productsConfig.json');

        // Order: Loop set order detail of each product base on action
        // rows = [{"action": "add",	"orderNo": "1",	"loginOrSignup": "firstLogin|default", "name": "Blue Top", "qty": "1", "orderFromPage": "homepage", orderFrom: "card", "addToCartFrom": "card", "processToCheckoutFrom": "popup", "orderComment": "Test case order_01"},...]
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

                // loginOrSignup: Set action of login or signup 
                // first(Login/Signup before order): 'firstLogin', 'firstSignup'
                // cart(Login/Signup after order): 'cartLogin', 'cartSignup' 
                orderList['loginOrSignup'] = loginConfig[0];

                // UserInfo: Get user info from username
                // e.g. testCasecriteria['userInfo'] = { "title": "Mr.", "name": "Automated Test", "email": "automated.test@mail.com", "password": "automatedTest", "day": 1, "month": "January",...}
                testCasecriteria['userInfo'] = getObjectFromReferenceMappingJson('userConfig', loginConfig[1]);
            }

            // Checkout: If this order 'processToCheckoutFrom' is not undefined, then do process to check out at this order and set orderComment to main object
            // Note: 'orderComment' is set in same row as 'processToCheckoutFrom'
            if(row['processToCheckoutFrom'] !== undefined){
                orderList['processToCheckoutFrom'] = row['processToCheckoutFrom']
                testCasecriteria['orderComment'] = row['orderComment'] !== undefined ? row['orderComment'] : '';
            }

            // Check Order: Set check order to check afer do action of this order which need to refer from latest checkOrders 
            if(i === 0) {
                // 1st Order: 1st Order Set check order and orderSummary as this order 
                // checkOrders: Set check order as this order 
                orderList['checkOrders'] = [orderList['order']];
                
                // orderSummary: Plus this order price
                // e.g. price: "Rs. 500" => 500
                orderSummary +=  Number((orderList['order']['orderTotal']).replace('Rs. ', ''))
            } else {

                // Clone latest checkOrder from latest order in array to set new checkOrders
                // e.g. latestCheckOrder = [{action: 'add', orderNo: 1, name: 'Blue Top', qty: 1, orderFromPage:, ...]
                // console.log('lastCheckOrders', orderListsArray[i-1]['checkOrders']);
                const latestCheckOrders = JSON.parse(JSON.stringify(orderListsArray[i-1]['checkOrders']));

                let orderLineNo

                // Other Order: Set check order by action
                switch(orderList['order']['action']){
                    case 'add': 
                        // checkOrders: Concat checkOrder of latest checkOrder with this order
                        orderList['checkOrders'] = (latestCheckOrders).concat(orderList['order']);

                        // orderSummary: Plus this order total to orderSummary
                        orderSummary +=  Number((orderList['order']['orderTotal']).replace('Rs. ', ''));
                        break;
                    case 'addOn':

                        // Get indexOf order that have to update qty and order total from latestCheckOrders by 'orderNo'
                        // Note: This website, if buys same product will work as add on order so for action 'addOn' in criteria value sets orderNo refer to adding order of easier to update qty and order total.
                        orderLineNo = latestCheckOrders.findIndex(latest => latest['orderNo'] === orderList['order']['orderNo'])

                        console.log(latestCheckOrders);
                        console.log(orderLineNo);
                        console.log(latestCheckOrders[orderLineNo]);

                        // Update qty and order total to order in latestCheckOrders 
                        latestCheckOrders[orderLineNo]['qty'] += orderList['order']['qty'];
                        latestCheckOrders[orderLineNo]['orderTotal'] = 'Rs. ' + (Number((orderList['order']['price']).replace('Rs. ', ''))*latestCheckOrders[orderLineNo]['qty']);

                        // Set checkOrder as latestCheckOrders
                        orderList['checkOrders'] = latestCheckOrders;

                        // orderSummary: Plus this order total to orderSummary
                        orderSummary +=  Number((orderList['order']['orderTotal']).replace('Rs. ', '')); 
                        break;
                    case 'delete':

                        // Get indexOf order that have to delete latestCheckOrders by 'orderNo'
                        // Note: For action 'delete' in criteria value sets orderNo refer to adding order of easier to set checkOrder in case has 'addOn' and 'delete' order before
                        orderLineNo = latestCheckOrders.findIndex(latest => latest['orderNo'] === orderList['order']['orderNo'])

                        // orderSummary: Minus this order total from orderSummary
                        // Note: Using orderTotal from latestCheckOrders in case hasn't set in criteria value and update first befor delete this order
                        orderSummary -= Number((latestCheckOrders[orderLineNo]['orderTotal']).replace('Rs. ', '')); 
                
                        // Set checkOrder by removing delete order out of latestCheckOrders by orderLineNo
                        latestCheckOrders.splice(orderLineNo, 1);
                        orderList['checkOrders'] = latestCheckOrders
                        console.log('nowCheckOrders', latestCheckOrders);
                        
                        break;
                } 
            }

            // orderSummary: Set this order summary as now orderSummary
            orderList['orderSummary'] = 'Rs. ' + orderSummary;

            // orderListsArray: Push this orderList to orderListsArray
            orderListsArray.push(orderList);
        })
        testCasecriteria['orderLists'] = orderListsArray;

        // orderSummary: Set total order summary as checkOrders from the last checkOrder in orderListArray and order summary as now orderSummary
        testCasecriteria['orderSummary'] = {
            'checkOrders': orderListsArray[orderListsArray.length-1]['checkOrders'],
            'orderSummary': 'Rs. ' + orderSummary
        }

        // criteria: Set test case criteria to test case criteria variable by testCaseName
        cy.task('setTempVariable', { name: `testCasecriteria_${testCaseName}`, value: testCasecriteria });
        console.log(`test case criteria: ${testCaseName}`, testCasecriteria);
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
// e.g. pageName = 'homepage', 'products', 'cart', 'login', 'logout', 'delete_account', 'test_cases', 'api_testing', 'contact_us', 'video_tutorials', 'errorCase'  
Cypress.Commands.add('visitPageFromClickMenu', (pageName) => {
    const pageConfig = getObjectFromReferenceMappingJson('websiteMeunConfig', pageName);
    cy.contains(`.shop-menu ul li`, pageConfig['menuName']).click();
    if(pageName !== 'video_tutorials') {
        cy.wait('@homepage');
    } 
    // else {
    //     cy.wait('@video_tutorials');
    // }
});

// Visit: Visit page from click category at sidebar
Cypress.Commands.add('visitPageFromClickCategory', (catagoryName) => {

    // Category: Convert catagoryName for click sidebar catagory mainMenu and subMenu
    // e.g. catagoryName = category[women|dress] => 'women|dress' => ['women', 'dress']
    const catagoryArray =  catagoryName.split('[').pop().replace(']', '').split('|');

    // Click catagory's usertype or main title to open toggle
    cy.contains('.category-products h4.panel-title', catagoryArray[0]).click();

    // Click li catagory or sub title to page
    cy.contains('.category-products div.panel-body ul li', catagoryArray[1]).click();
    cy.wait('@homepage')

    // Checking: Visiting page
    // cy.checkPageFeaturesItemsTitle(`${catagoryArray[0]} - ${catagoryArray[1]} Products`);
});

// Visit: Visit page from click brands at sidebar
Cypress.Commands.add('visitPageFromClickBrands', (brandsName) => {

    // Brands: Convert brandsName to object for click sidebar brands
    // e.g. brands = brands[polo] => 'polo'
    const brands =  brandsName.split('[').pop().replace(']', '');

    // Click li's brands to page
    cy.contains('.brands_products div.brands-name ul li', brands).click();
    cy.wait('@homepage')

    // Checking: Visiting page
    // cy.checkPageFeaturesItemsTitle(`Brand - ${brands} Products`);
});

// Visit: Checking features items's title that visit correct page 
Cypress.Commands.add('checkPageFeaturesItemsTitle', (name) => {
    cy.get('.features_items h2.title').should('include', name)
})

///////////////////////////////////////////
// ++++ Login & Logout ++++
// Login: Login by email and password from criteria
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
    cy.visitPageFromClickMenu('logout');

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

// Login/Signup: Do action login or signup with criteria from userConfig.json
Cypress.Commands.add('doActionLoginOrSignup', (loginOrSignup, userInfo) => {
    
    // Do Action: Do action of order test case
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

///////////////////////////////////////////
// ++++ Signup ++++
// Signup: Signup by name and email from criteria
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
        cy.wait('@signup'); 
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
            // failed-formatEmail: Should show error message 
            cy.get('input[data-qa="signup-email"]').invoke('prop', 'validationMessage')
            .should('contains', "Please include an '@' in the email address.")
        break;
    }
});

// Signup: Filled signup information in 'Signup' page with criteria
Cypress.Commands.add('filledSignupInformation', (criteria, type) => {

    cy.log(`++++ Filled Signup Information ++++`);
    console.log(`++++ Filled Signup Information ++++`);

    // Get signup info from inputConfig.json to loop filled input
    // e.g. signupInfo = { "elementAttr": "data-qa", "formcriteria": [{ "name": "signup|title", "formTitle": "Title", "elementName": "title", "formType": "radio", "howToFilled": "select", "elementDisplay": "enable","defaultValue": [], "isRequiredField": "optional" }, ...]}
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

    console.log(signupInputConfig);
    console.log(filledcriteria);

    // Checked & Filled: Loop checked and filled signup form element value by criteria value base on form type
    signupInputConfig['formcriteria'].forEach(formcriteria => {
        filledFormElementVauleBycriteria({
            formcriteria: formcriteria,
            criteria: filledcriteria,
        });
    });

    // Submit: Click button create account
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
                        // Delete: Delete account from click menu & Wait api delete account
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
                        break;
                }
            }
        break;
        case 'failed': 
            // failed: Case Validate or somethings
            break;
    }
});

///////////////////////////////////////////
// ++++ Search ++++
// Search: Search product in page from serch box (products page only)
Cypress.Commands.add('searchProductFromSearchbox', (searchText) => {
    cy.get('input#search_product').click().clear().type(searchText);
    cy.get('button#submit_search').click();
    cy.wait('@homepage');
    cy.checkPageFeaturesItemsTitle('SEARCHED PRODUCTS')
});

///////////////////////////////////////////
// ++++ Do action Product ++++
// Add: Do action add product from product card
Cypress.Commands.add('doActionAddProductFromCard', (order) => {
    // addToCartFrom: 
    cy.contains('.features_items div.product-image-wrapper .productinfo p', order['name'])
    .closest('.product-image-wrapper').within($card =>{
            
        switch(true) {
            case order['addToCartFrom'] === 'card':
                // Click add to cart (Notr: Wait to find way to trigger .product-overlay which is parse pseudo css)
                // cy.get('.single-products').rightclick().find('.product-overlay .add-to-cart').should('be.visible').click();
                cy.get('.productinfo .add-to-cart').should('be.visible').click();
                cy.wait('@addOrder');
            break;
            case order['addToCartFrom'] === 'view':
                cy.doActionInViewDetailPage(order, 'addToCart');
                 
            break;
        }
    })
});

// Add: Do action in view detail page
Cypress.Commands.add('doActionInViewDetailPage', (order, action) => {

    switch(action) {
        case 'addToCart':
            // Add product to cart by order criteria
            cy.get('.product-information').within($ele => {
                // Edit product qty    
                cy.get('input#quantity').click().clear().type(order['qty']);

                // Click 'Add to cart', wait api
                cy.get('button.cart').click();
                cy.wait('@addOrder');
            }) 
            break;
        case 'checkDetail':
            // Check detail of product by order criteria
            break;
        case 'writeYourReview':
            // Write Your Review of product by order criteria
            break;
    }

});


///////////////////////////////////////////
// ++++ Test Case Result ++++
// Result: Set base test case result to test case result variable 
// e.g. testCaseDetail = { type: 'login', testCase: 'login_01' }
Cypress.Commands.add('setBaseTestCaseResultObject', (testCaseDetail) => {

    let resultKey, setResultObject;
    resultKey = testCaseDetail['testCaseName'];

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
    console.log(`++++ ${resultKey}: Set Base Test Case Result Object ++++`);
    console.log(testCaseResult);
    cy.task('setTestCaseResultVariable', { name: resultKey, value: testCaseResult });
});

// Result: Update test case result object then set back to test case result variable
// e.g.  options = { testCaseDetail: testCaseDetail, resultType: 'create'}
Cypress.Commands.add('updateTestCaseResultObject', (options) => {
    
    const { testCaseDetail, type } = options;
    const testResultObject = options.testResultObject !== undefined ? options.testResultObject : [];

    let resultKey, setResultObject, getElement
    
    // Set resultKey as testCaseName
    resultKey = testCaseDetail['testCaseName'];

    // Get setResultObject from test case result config JSON by test case type
    // e.g.  "errorMessage": [{ "name": "errorMessage","type": "testResultObject-massage",  "setValue": "errorMessage", "checkValue": ""}]
    setResultObject = getObjectFromReferenceMappingJson('updateTestCaseResultConfig', type);

    // Get base test case result from test case result variable 
    cy.task('getTestCaseResultVariable' , { name: resultKey }).then(testCaseResult => {
        cy.log(`++++ ${resultKey}: Update Test Case Result Object-${type} ++++`);
        console.log(`++++ ${resultKey}: Update Test Case Result Object-${type} ++++`);

        // Update test case result object by setResultObject as key as from testResultObject as value then set back to test case result variable 
        testCaseResult = setTestCaseResultObject({
            testCaseDetail: testCaseDetail, 
            testCaseResult: testCaseResult, 
            testResultObject: testResultObject,
            setResultObject: setResultObject
        });
        
        cy.task('setTestCaseResultVariable', { name: resultKey, value: testCaseResult });
        console.log('setTestCaseResultVariable', testCaseResult);
    })
});

// Result: Write test case results to CSV by form from test case result variable. 
// Which set column from form config's testCaseResult.
Cypress.Commands.add('writeTestCaseResultToCSV', (options) => {

    const { type, resultKey, testCaseDetail, continuedWriteTestCaseResult,  testIndex } = options;
    
    let setResultObject, filename, filePathName, testStatus, errorMessage

    // formInfo: Get form's info from form config JSON by test case type
    // e.g. formInfo = [{  "name": "testDate", "title": "Test Date", "type": "date", "setValue": "data", "isBaseKey": true },
    setResultObject = setResultObjectKeys(type);

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

        const keys = Object.keys(testCaseResult);
        
        // Update testStatus as 'Pass' and testEndTime as nowTime
        if(keys.some(key => key.includes('errorMessage')) && testCaseResult['errorMessage'] !== '-') {
            testCaseResult['testStatus'] = 'Failed';
        } else {
            testCaseResult['testStatus'] = 'Pass';
        }
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
        message += `Check 2e2 ${type} test case(${resultKey}): Have to Pass ${type} test`
        // Show test result by type if 'Failed', show 'Failed'
        switch(type) {
            case 'login': 
            case 'register': 
                // Check 2e2 form test case result from all tests status have equel 'Pass'
                expect(testStatus).to.equal('Pass', message);
                break;
            case 'visit': 
                // Check 2e2 form test case result from all tests status have equel 'Pass'
                message += ` (Error Message: ${errorMessage})`;
                expect(testStatus).to.equal('Pass', message);
                break;

        }
    })
});

