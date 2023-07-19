import '../commands'
import { getReferenceMappingJson, filledFormElementVauleBycriteria } from '../util'

// 2e2: Test order by test case loop by form type
// e.g. testCasesArray= [{ type: 'login', testCase: 'login_01' }, { type: 'register', testCase: 'reg_01' }]
// e.g. writeTestCaseResult, continuedWriteTestCaseResult = true/false
export const e2eOrderTestScriptsbyTestCase = (options) => {

    const { testCasesArray, writeTestCaseResult, continuedWriteTestCaseResult }= options;

    before(() => {
        // Variable: Set testCaseResultVariable's object 1st times
        cy.task('clearTestCaseResultVariable');
    });

    // // [DEBUG ONLY] User: Loop clear userType|login's cart and deleted userType|signup from userConfig.json before test e2e order test cases
    // describe(`User: Clear user|login cart and deleted user|signup from userConfig.json`, () => {

    //     it('User: Clear user|login cart and deleted user|signup from userConfig.json', () => {

    //         // API: Set website base intercept
    //         cy.setWebsiteBaseIntercept();

    //         // ++++ Visit home page ++++
    //         cy.visitHomepage();

    //         // User: Loop clear userType|login's cart and deleted userType|signup from userConfig.json before test e2e order test cases
    //         cy.clearUserFromUserconfig('all');
    //     });
    // })
    
    // Loop e2e order test cases array
    testCasesArray.forEach((testCaseDetail, testIndex) => {
        
        const { type, testCaseName } = testCaseDetail;
    
        describe(`[order] ${testIndex+1}.${testCaseName}-e2e Test `, () => {
          
            beforeEach(() => {

                cy.clearCookies({ domain: null }) // Clear cookie to no remember username and password for form

                // API: Set website base intercept
                cy.setWebsiteBaseIntercept();
    
                // Variable: Set testCasecriteriaVariable's object 1st times
                cy.task('clearTempVariables');
            });
    
            it(`${testIndex+1}.1.${testCaseName}: Start e2e test order in website`, () => {
    
                cy.log(`++++ ${testCaseName}: Start e2e test order in website ++++`);
                console.log(`++++ ${testCaseName}: Start e2e test order in website ++++`);

                // Result: Set base test case result to test case result variable 
                // e.g. result = { testDate: "04/07/2023", testStartTime: "10:52:12", testEndTime: "-", testCase: "login_01", testStatus: "Failed"}
                cy.setBaseTestCaseResultObject(testCaseDetail);
    
                // Variable: Set test case's criteria and base
                // Excel: Get test case's criteria from excel by test case's name and set to test case criteria variable 
                cy.setOrderTestCasecriteriaVariableFromExcel({
                    testCaseType: type,
                    testCaseName: testCaseName
                });

                // ++++ Visit home page ++++
                cy.visitHomepage();

                // ++++ Order ++++
                // criteria: Get test case criteria from test case criteria variable by testCaseName
                cy.task('getTempVariable', { name: `testCasecriteria_${testCaseName}` }).then(testCasecriteria => {

                    // console.log(`getTempVariable: ${testCaseName}`, testCasecriteria);
    
                    const { orderLists, orderSummary, userInfo } = testCasecriteria;

                    // User: Clear userType|login's cart and deleted userType|signup from userConfig.json before test e2e order test cases
                    // Note: 'order_09' is error test case, has to clear 'automatedUser' cart info table before test 'order_10' 
                    if(testCaseName === 'order_10') {
                        cy.clearUserFromUserconfig(userInfo['keys']);
                    }
                    
                    // Loop do action of each order from test case criteria variable
                    orderLists.forEach((orderList, i) => {

                        const { order, checkOrders, loginOrSignup  } = orderList;
                          
                        cy.log(`++++ ${testCaseName}: Order No.${i+1} Do action - ${order['action']} ++++`);
                        console.log(`++++ ${testCaseName}: Do action ${order['action']} ++++`);
                        console.log(orderList);
                        console.log(order);

                        // Login/Signup: If loginOrSignup is not undefined and start with 'first' then login first before order.
                        if(loginOrSignup !== undefined && loginOrSignup.startsWith('first')) {
                            
                            // ++++ Visit Signup / Login page ++++
                            cy.visitPageFromClickMenu('login');
        
                            // Do Action: Do action of order test case
                            cy.doActionLoginOrSignup(loginOrSignup, userInfo);

                            // // If login or signup between ordering product, have to visit 'Shopping Cart' page first to check all added orders after as to sort order.
                            // // Note: If not visit 'Shopping Cart' page after login or signup, when adds order, order will be 1st in the list not after adding order before
                            // // Note2: Comment script to make this test case to be error test case
                            // if(i !== 0) {
                            //     cy.visitPageFromClickMenu('cart');
                            // }
                        }

                        // Do action: Do action of this product
                        if(order['action'].startsWith('add')) {
                            
                            // Action: 'add' or 'addOn', Order product by clicking 'Add to Cart'
                            // Visit: Visit page from orderFromPage
                            cy.visitPageFromClickMenu(order['orderFromPage']);

                            // Section: Order product from section to show features items's card which can be do nothing, click to visit, search 
                            switch(true) {
                                case order['orderFromSection'] === 'card':  // Do nothing
                                break;
                                case order['orderFromSection'].startsWith('category'): 
                                    // Visit: Visit page from click category at sidebar (e.g. category[women|dress])
                                    cy.visitPageFromClickCategory(order['orderFromSection']);
                                    break;
                                case order['orderFromSection'].startsWith('brands'): 
                                    // Visit: Visit page from click brands at sidebar (e.g. brands[polo])
                                    cy.visitPageFromClickBrands(order['orderFromSection']);
                                    break;
                                case order['orderFromSection'] === 'search':  
                                    // Search: Search product in page from serch box (products page only)
                                    cy.searchProductFromSearchbox(order['name']);
                                    break
                                case order['orderFromSection'] === 'recommended': 
                                    // Recommended: scrolldown to bottom to recommended section (home page only)
                                    cy.scrollTo('bottom');
                                    break;
                            }

                            // Add: Do action add product from product card
                            cy.doActionAddProductFromCard(order);
                            
                            // Proceed To Checkout: Do 'Proceed to checkout' if set this prduct's criteria has set ProceedToCheckout from popup whiich shows after adding product success 
                            // Note: Need to go to Shopping Cart page to checkOrders in Shopping Cart page every case.
                            if(order['proceedToCheckoutFrom'] !== undefined && order['proceedToCheckoutFrom'] === 'popup') {
                                // Click 'View Cart' in popup to 'Shopping Cart' page
                                cy.get('div#cartModal .modal-body p a').click();
                            } else {
                                // Click Continue Shopping in popup to close popup
                                cy.get('div#cartModal .modal-footer button').click();

                                // Visit: Visit 'Shopping Cart' page to checkOrders in 'Shopping Cart' page
                                cy.visitPageFromClickMenu('cart');
                            }
                        } else if (order['action'] === 'delete') {
                            // Visit: Visit page 'Cart' to checkOrder in 'Shopping Cart' page
                            cy.visitPageFromClickMenu('cart');

                            // Delete: Delete order from shopping cart table by row no of product
                            // Note: Only action 'delete' will set 'deleteRowNo' from setting criteria
                            // e.g. orderList = { 'deleteRowNo': 2, order: { action: delete, name:...}, checkOrders: [{name:...}]}
                            cy.deletedOrderFromShoppingCart(orderList['deleteRowNo']);
                        }

                        // +++++++++++++++++++++++++++++
                        // 'Shopping Cart' page
                        // Checking: Check shopping cart's order list by checkOrders criteria
                        cy.checkElementsInSectionAndCompareValues('shoppingCart', checkOrders);
                            
                        // +++++++++++++++++++++++++++++
                        // 'Login/Signup' Page: If loginOrSignup is not undefined and start with 'cart' then login first before order.
                        // Note: Set Login/Signup between order in case want to test Login/Signup at cart and continue do action order
                        if(loginOrSignup !== undefined && loginOrSignup.startsWith('cart')) {

                            // Button: Click button 'Proceed To Checkout' to 'Checkout' Page
                            cy.get('#do_action .check_out').trigger('click');

                            // Modal: Popup shows have to 'Register / Login' click 'Register / Login'
                            cy.get('#checkoutModal .modal-body p a').click();
                            
                            // ++++ Visit Signup / Login page ++++
                            cy.visitPageFromClickMenu('login');
        
                            // Do Action: Do action of order test case
                            cy.doActionLoginOrSignup(loginOrSignup, userInfo)

                            // Visit: Visit 'Shopping Cart' page to checkOrder
                            cy.visitPageFromClickMenu('cart');

                            // Shopping Cart Page: Check order again in case login and all orders is gone.
                            // Checking: Check shopping cart's order list after delete the product
                            cy.checkElementsInSectionAndCompareValues('shoppingCart', checkOrders);
                        }
                    });

                    // 'Shopping Cart' page 
                    // e.g. 'orderSummary' = { checkOrders: [...] }, orderSummaryTotal: 'Rs. 500', paymentInfo: { "cardName": "Automated Test", "cardNumber": "1000200030004000", "cardCvc": 100, "cardExMonth": "05", "cardExYear": 2024}, orderResult: 'success' }
                    if(orderSummary['checkOrders'].length === 0) {
                        // Visit: Visit homepage
                        cy.visitHomepage();

                        // Visit: Visit 'Shopping Cart' page to checkOrder
                        cy.visitPageFromClickMenu('cart');

                        // Checking: If checkOrders in orderSummary no order, checking elements in 'Shopping Cart' page again that show shopping cart is empty
                        cy.checkShoppingCartTableIsEmpty('default');
                    }
                    else {

                        const { checkOrders, orderSummaryTotal, orderComment, paymentInfo, orderResult } = orderSummary;
                        // If checkOrders in orderSummary has orders, do 'Proceed To Checkout' till 'orderResult' 
                        // Button: Click button 'Proceed To Checkout' to 'Checkout' Page
                        cy.get('#do_action .check_out').click();

                        // +++++++++++++++++++++++++++++
                        // 'Checkout' Page
                        // Address Details: Check 'your delivery address' section
                        cy.checkElementsInSectionAndCompareValues('deliveryAddress', userInfo); 

                        // Address Details: Check 'your billing address' section 
                        cy.checkElementsInSectionAndCompareValues('billingAddress', userInfo);  

                        // Review Your Order: Check orders lists in cart table
                        cy.checkElementsInSectionAndCompareValues('reviewYourOrder', checkOrders);

                        // Review Your Order: Check orders summary total in cart table
                        // Note: Set criteria as whole orderSummary because orderSummaryTotal sets in this object level
                        cy.checkElementsInSectionAndCompareValues('reviewYourOrderSummaryTotal', orderSummary);

                        // Review Your Order-Comment: Filled Comment section
                        if(orderSummary['orderComment'] !== '') {
                            // Comment:
                            cy.get('#ordermsg textarea').click().clear().type(orderComment);
                        }

                        // Button: Click button 'Place Order' to 'Payment' page
                        cy.get('#cart_items .check_out').click();

                        // +++++++++++++++++++++++++++++
                        // 'Payment' page
                        // Payment: Filled payment information in 'Payment' page with criteria and check payment's result
                        cy.filledPaymentInformation(paymentInfo, orderResult)

                        // +++++++++++++++++++++++++++++
                        // 'Order Placed' Page
                        // If orderResult is 'success' then check invoice's detail in 'Order Placed' Page
                        // Note: Test process can stop at step check payment's result in 'Payment' page if orderResult set payment should be error
                        if(orderResult === 'success') {
                            // Click button 'Download Invoice' by add atrr 'download' as blank before click button to not waitting for new page to load as cypress default 
                            cy.get('a.check_out').then(el => { 
                                el.attr('download', '')
                            }).click();
                            cy.wait(2000);

                            // Checking: Check text in downloaded file in folder downloads
                            // e.g. invoice.txt = 'Hi Automated Test, Your total purchase amount is 12500. Thank you
                            cy.readFile('cypress/downloads/invoice.txt').should('equal', `Hi ${userInfo['name']}, Your total purchase amount is ${orderSummaryTotal.replace('Rs. ', '')}. Thank you`);

                            // Button: Click button continue to homepage and await api
                            cy.clickContinueButton();

                            // Delete Account: If user is signup user. Delete account from click menu and check delete account success.
                            if(testCasecriteria['loginOrSignup'].includes('Signup')) {
                                cy.deleteAccountFromClickMenu();
                            }
                        }
                    } 

                    // Update test case result variable to 'Pass' if can finish test till this step
                    cy.updateTestCaseResultObject({
                        testCaseDetail: testCaseDetail, 
                        type: 'testStatus',
                        testResultObject: {
                            testStatus: 'Pass'
                        }
                    });
                });
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