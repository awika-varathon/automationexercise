import '../commands'
import { slowCypressDown } from 'cypress-slow-down'
import { getProductsObjectFromProductsConfig } from '../util'

// Check Products: Test to check products on website page by loop test cases in testCasesArray.
// category: testCasesArray = [ { type: 'category', testCaseName: 'cat_01', page: 'products', usertype: 'Women',  category: 'Dress' }]
// brand: testCasesArray = [ { type: 'brands', testCaseName: 'brands_01', page: 'products', brands: 'Polo' }]
// search: testCasesArray = [ { type: 'search', testCaseName: 'search_01', page: 'products', searchText: 'Blue' }]
// e.g. writeTestCaseResult, continuedWriteTestCaseResult = true/false
export const checkProductsOnWebsitePageTestScripts = (options) => {

    const { testCasesArray, writeTestCaseResult, continuedWriteTestCaseResult }= options;

    // Slow test cypress down for recording video when runs command 'cypress run'.
    slowCypressDown();

    before(() => {
        // Variable: Set testCaseResultVariable's object 1st times.
        cy.task('clearTestCaseResultVariable');
    });
    
    testCasesArray.forEach((testCaseDetail, testIndex) => {
        
        const { type, testCaseName, page } = testCaseDetail;
    
        describe(`${type} ${testIndex+1}.${testCaseName}-Test '${type}' to check products on website ${page} page.`, () => {
          
            beforeEach(() => {
                // API: Set website base intercept.
                cy.setWebsiteBaseIntercept();
    
                // Variable: Set testCasecriteriaVariable's object 1st times.
                cy.task('clearTempVariables');
            });
    
            it(`${testIndex+1}.1.${testCaseName}: Start test '${type}' to check products on website ${page} page.`, () => {
    
                cy.log(`++++ ${testCaseName}: Start test '${type}' to check products on website ${page} page. ++++`);
                console.log(`++++ ${testCaseName}: Start test '${type}' to check products on website ${page} page. ++++`);

                // Result: Set base test case result to test case result variable. 
                // e.g. result = { testDate: "04/07/2023", testStartTime: "10:52:12", testEndTime: "-", testCase: "login_01", testStatus: "Failed"}
                cy.setBaseTestCaseResultObject(testCaseDetail);

                // ++++ Visit page by URL ++++
                cy.visitPageByURL(page);

                // Section: Do action in section to show product cards in 'Features items' section which can be click sidebar to visit page or search in search box. 
                switch(type) {
                    case 'category': 
                        // Visit: Visit page from click category at sidebar. Set categoryName to format that using in function. 
                        // e.g. usertype: 'Women',  category: 'Dress' => 'Women|Dress'
                        cy.visitPageFromClickCategory(testCaseDetail['usertype'] + '|' + testCaseDetail['category']);
                        break;
                    case 'brand': 
                        // Visit: Visit page from click brands at sidebar. (e.g. 'Polo')
                        cy.visitPageFromClickBrands(testCaseDetail['brand']);
                        break;
                    case 'search':  
                        // Search: Search product in 'Products' page from search box (e.g. 'Blue')
                        cy.searchProductFromSearchbox(testCaseDetail['searchText']);
                        break
                }

                // Checking: Get element 'features_items' as main element to check product cards in this element.
                cy.get('.features_items').then($feature => {

                    // Check Products: Get object of products to check product details from productsConfig by objectKey, objectValue, and getValueType.
                    // e.g. checkProductsArray = [{ "id": "1", "name": "Blue Top",...}, { "id": "16", "name": "Sleeves Top and Short - Blue & Pink",...}, ...]
                    let checkProductsArray;
                    switch(type) {
                        case 'category': 
                            //  category: Get object of products of this user type and category. Set objectValue to format that same as key's 'category-type' value. 
                            // e.g. usertype: 'Women',  category: 'Dress' => objectValue = 'Women > Dress'
                            checkProductsArray = getProductsObjectFromProductsConfig({ 
                                objectKey: 'category-type', 
                                objectValue: testCaseDetail['usertype'] + ' > ' + testCaseDetail['category'] , 
                                getValueType: 'equal'
                            });
                            break;
                        case 'brand': 
                            //  brand: Get object of products of this brand. (e.g. objectValue = 'Polo')
                            checkProductsArray = getProductsObjectFromProductsConfig({ 
                                objectKey: 'brand', 
                                objectValue: testCaseDetail['brand'], 
                                getValueType: 'equal'
                            });
                            break;
                        case 'search':  
                            //  search: Get object of products of search page method. (e.g. objectValue = 'Blue')
                            checkProductsArray = getProductsObjectFromProductsConfig({ 
                                objectKey: '', 
                                objectValue: testCaseDetail['searchText'], 
                                getValueType: 'searchbox'
                            });
                            break
                    }

                    // Checking: Check all product cards in page base on checkProductsArray.
                    // Note. Have to get element '$feature' first becasue 'Home' page have elemnt '.product-image-wrapper' in 'Recommenned items' section too.
                    if(checkProductsArray.length === 0) {
                        // If checkProductsArray's length is 0 which is 'search' case, check no product card.
                        cy.get($feature).find('.product-image-wrapper').should('not.exist');
                        cy.log(`Search ${testCaseDetail['searchText']} has NO products`)

                    } else {
                        // If checkProductsArray's length > 0, check elemenst of product cards's length is equal checkProductsArray's length.
                        cy.get($feature).find('.product-image-wrapper').should('have.length', checkProductsArray.length);

                        // Loop checkProductsArray to check each product card's details is equal each object of product.
                        // Note: Loop checkProductsArray because this website doesn't have so many products so can check all product cards.
                        checkProductsArray.forEach(checkProduct => {
                            // Do action from product card, check product card's details in card.
                            cy.log(`Check product card: ${checkProduct['name']}`);
                            cy.doActionAddProductFromCard(checkProduct);
                        })
                    } 
                });

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



