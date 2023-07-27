import '../commands'
import { slowCypressDown } from 'cypress-slow-down'
import { searchProductFromproductsConfig } from '../util'

// 2e2: Test visit by test case loop by form type
// e.g. testCasesArray(category) = [ { type: 'category', testCaseName: 'cat_01', page: 'products', usertype: 'Women',  category: 'Dress' }]
// e.g. testCasesArray(brand) = [ { type: 'brands', testCaseName: 'brands_01', page: 'products', brands: 'Polo' }]
// e.g. testCasesArray(search) = [ { type: 'search', testCaseName: 'search_01', page: 'products', searchText: 'Blue' }]
// e.g. writeTestCaseResult, continuedWriteTestCaseResult = true/false
export const e2eCheckProductsTestScriptsbyTestCase = (options) => {

    const { testCasesArray, writeTestCaseResult, continuedWriteTestCaseResult }= options;

    // Slow test cypress down for recording video when runs command 'cypress run' 
    slowCypressDown();

    before(() => {
        // Variable: Set testCaseResultVariable's object 1st times
        cy.task('clearTestCaseResultVariable');
    });
    
    testCasesArray.forEach((testCaseDetail, testIndex) => {
        
        const { type, testCaseName, page } = testCaseDetail;
    
        describe(`${type} ${testIndex+1}.${testCaseName}-e2e Test Check Products: ${type} from page ${page}`, () => {
          
            beforeEach(() => {
                // API: Set website base intercept
                cy.setWebsiteBaseIntercept();
    
                // Variable: Set testCasecriteriaVariable's object 1st times
                cy.task('clearTempVariables');
            });
    
            it(`${testIndex+1}.1.${testCaseName}: Start e2e test check products ${type} page in website`, () => {
    
                cy.log(`++++ ${testCaseName}: Start e2e test check products ${type} page in website ++++`);
                console.log(`++++ ${testCaseName}: Start e2e test check products ${type} page in website ++++`);

                // Result: Set base test case result to test case result variable 
                // e.g. result = { testDate: "04/07/2023", testStartTime: "10:52:12", testEndTime: "-", testCase: "login_01", testStatus: "Failed"}
                cy.setBaseTestCaseResultObject(testCaseDetail);
    
                // ++++ Visit home page ++++
                cy.visitHomepage();

                // ++++ Visit page from click menu if not homepage ++++
                if(page !== 'homepage') {
                    cy.visitPageFromClickMenu(page);
                }

                // Section: Do action to section to show features items's card which can be click to visit or search 
                switch(type) {
                    case 'category': 
                        // Visit: Visit page from click category at sidebar. Set categoryName to format that using in function (e.g. usertype: 'Women',  category: 'Dress' => Women|Dress)
                        cy.visitPageFromClickCategory(testCaseDetail['usertype'] + '|' + testCaseDetail['category']);
                        break;
                    case 'brand': 
                        // Visit: Visit page from click brands at sidebar (e.g. 'polo')
                        cy.visitPageFromClickBrands(testCaseDetail['brand']);
                        break;
                    case 'search':  
                        // Search: Search product in 'Products' page from search box (e.g. 'Blue')
                        cy.searchProductFromSearchbox(testCaseDetail['searchText']);
                        break
                }

                // Get features_items as main element to check product card is correct as 'checkProductsArray' 
                cy.get('.features_items').then($feature => {

                    // Product: Get products details from productsConfig by searchKey,searchValue and searchType
                    // e.g. checkProductsArray = [{ "id": "1", "name": "Blue Top",...}, { "id": "16", "name": "Sleeves Top and Short - Blue & Pink",...}, ...]
                    let checkProductsArray;
                    switch(type) {
                        case 'category': 
                            checkProductsArray = searchProductFromproductsConfig({ 
                                searchKey: 'category-type', 
                                searchValue: testCaseDetail['usertype'] + ' > ' + testCaseDetail['category'] , 
                                searchType: 'equel'
                            });
                            break;
                        case 'brand': 
                            checkProductsArray = searchProductFromproductsConfig({ 
                                searchKey: 'brand', 
                                searchValue: testCaseDetail['brand'], 
                                searchType: 'equel'
                            });
                            break;
                        case 'search':  
                            checkProductsArray = searchProductFromproductsConfig({ 
                                searchKey: '', 
                                searchValue: testCaseDetail['searchText'], 
                                searchType: 'search'
                            });
                            break
                    }

                    // Check product card base on checkProductsArray
                    // Note. Have to get $feature first becasue 'Home' page have '.product-image-wrapper' in 'Recommenned items' section too
                    if(checkProductsArray.length === 0) {
                        // If checkProductsArray's length is 0 which is 'search' case, check no product card.
                        cy.get($feature).find('.product-image-wrapper').should('not.exist');
                        cy.log(`Search ${testCaseDetail['searchText']} has NO products`)

                    } else {
                        // If checkProductsArray's length > 0, check product cards's length is equel checkProductsArray's  length.
                        cy.get($feature).find('.product-image-wrapper').should('have.length', checkProductsArray.length);

                        // Loop checkProductsArray to check each product card's details
                        // Note: Loop checkProductsArray because this website doesn't have so many products so can check all product cards
                        checkProductsArray.forEach(checkProduct => {
                            cy.log(`Check product card: ${checkProduct['name']}`)
                            // Check: Do action from product card, check product card's details in card
                            cy.doActionAddProductFromCard(checkProduct);
                        })
                    }

                    
                });

                cy.wait(1000); // Wait for recording video

                // Update test case result variable to 'Pass' if can finish test till this step
                cy.updateTestCaseResultObject({
                    testCaseDetail: testCaseDetail, 
                    type: 'testStatus',
                    testResultObject: {
                        testStatus: 'Pass'
                    }
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



