import '../commands'
import { getReferenceMappingJson, filledFormElementVauleBycriteria } from '../util'

// 2e2: Test order by test case loop by form type
// e.g. formTestCaseArray= [{ type: 'login', testCase: 'login_01' }, { type: 'register', testCase: 'reg_01' }]
// e.g. writeTestCaseResult, continuedWriteTestCaseResult = true/false
export const e2eOrderTestScriptsbyTestCase = (options) => {

    const { formTestCaseArray, writeTestCaseResult, continuedWriteTestCaseResult }= options;

    before(() => {
        // Variable: Set testCaseResultVariable's object 1st times
        cy.task('clearTestCaseResultVariable');
    });
    
    formTestCaseArray.forEach((formTestCase, testIndex) => {
        
        const { type, testCaseName } = formTestCase;
    
        describe(`[order] ${testIndex+1}.${testCaseName}-e2e Test `, () => {
          
            beforeEach(() => {
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
                cy.setBaseTestCaseResultObject(formTestCase);
    
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
    
                    const { orderLists, orderSummary, orderComment, userInfo } = testCasecriteria;

                    // Loop do action of each order from test case criteria variable
                    orderLists.forEach((orderList, i) => {

                        const { order, checkOrders, loginOrSignup  } = orderList;
                          
                        cy.log(`++++ ${testCaseName}: Do action - ${order['action']} ++++`);
                        console.log(`++++ ${testCaseName}: Do action ${order['action']} ++++`);
                        console.log(orderList);
                        console.log(order);


                        // Login/Signup: If loginOrSignup is not undefined and start with 'first' then login first before order.
                        if(loginOrSignup !== undefined && loginOrSignup.startsWith('first')) {
                            
                            // ++++ Visit Signup / Login page ++++
                            cy.visitPageFromClickMenu('login');
        
                            // Do Action: Do action of order test case
                            cy.doActionLoginOrSignup(loginOrSignup, userInfo)
                        }

                        if(order['action'].startsWith('add')) {
                            
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
                            }

                            // Add: Do action add product from product card
                            cy.doActionAddProductFromCard(order);
                            
                            // Cart: processToCheckout
                            if(order['processToCheckoutFrom'] !== undefined && order['processToCheckoutFrom'] === 'popup') {
                                // Click 'View Cart' to Shopping Cart page
                                cy.get('div#cartModal .modal-body p a').click();
                            } else {
                                // Continue Shopping
                                cy.get('div#cartModal .modal-footer button').click();

                                // Visit: Visit page 'Cart' to checkOrder in Shopping Cart page
                                cy.visitPageFromClickMenu('cart');
                            }
                        } else if (order['action'] === 'delete') {
                            // Visit: Visit page 'Cart' to checkOrder in Shopping Cart page
                            cy.visitPageFromClickMenu('Cart');

                            // Delete: 

                        }

                        // +++++++++++++++++++++++++++++
                        // Shopping Cart Page: Check order after do action
                            
                        // +++++++++++++++++++++++++++++
                        // Login/Signup Page: If loginOrSignup is not undefined and start with 'cart' then login first before order.
                        // Note: Set Login/Signup between order in case want to test Login/Signup at cart and continue do action order
                        if(loginOrSignup !== undefined && loginOrSignup.startsWith('cart')) {

                            // Click Proceed To Checkout to checkout page
                            cy.get('#do_action .check_out').click()

                            // Modal popup show have to Register / Login click 'Register / Login'
                            cy.get('#checkoutModal .modal-body p a').click();
                            
                            // ++++ Visit Signup / Login page ++++
                            cy.visitPageFromClickMenu('login');
        
                            // Do Action: Do action of order test case
                            cy.doActionLoginOrSignup(loginOrSignup, userInfo)

                            // Visit: Visit page 'Cart' to checkOrder
                            cy.visitPageFromClickMenu('cart');

                            // Shopping Cart Page: Check order again
                        }

                        // +++++++++++++++++++++++++++++
                        // Process To Checkout
                        if(order['processToCheckoutFrom'] !== undefined) {
                            // Click Proceed To Checkout to checkout page
                            cy.get('#do_action .check_out').click();
                        } 

                    });

                    // 
                    if(orderSummary['checkOrders'].length > 0) {
                        // +++++++++++++++++++++++++++++
                        // Checkout Page
                        // Adress Details: Check your delivery address  

                        // Adress Details: Check your billing address 

                        // Review Your Order: Check orders list and total 

                        // Comment: Filled Comment section
                        if(orderComment !== '') {
                            // Comment:
                        }

                        // +++++++++++++++++++++++++++++
                        // Payment Page
                        // Filled Payment Input

                        // Click 'Pay and Confirm Order'

                        // +++++++++++++++++++++++++++++
                        // Order Placed Page

                        // Click 'Download Invoice' and check text

                        // Click 'Continue'

                    }
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