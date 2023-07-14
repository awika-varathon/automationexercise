import { getReferenceFilePathName } from '../../support/util'

describe(`[Get Data] Get all products data from product page or api`, () => {

    beforeEach(() => {
        // API: Set website base intercept
        cy.setWebsiteBaseIntercept();
    });

    const pathPath = `${getReferenceFilePathName('configJSON')}/configReference`
    const websiteDataPathNameFile = `${pathPath}/productWebsiteConfig.json`
    const apiPathDataNameFile = `${pathPath}/productApiConfig.json`
    const configPathNameFile = `${getReferenceFilePathName('configJSON')}/productsConfig.json`

    // +++++++++++++++++++++++++++++++++++++++
    it(`Get all products data from product page`, () => {

        let productArray = [];

        cy.visitHomepage('/products');

        const cardsElement = '.features_items div.product-image-wrapper';

        // Loop all product cards to get detail 
        cy.get(cardsElement).each(($div, index) => {

            const productObject = {};

            // if(index < 1) { // DEBUG ONLY
                // Card: Get product's detail from card (Note: Easily than view product page)
                // Product: id
                productObject['id'] = index+1;

                // Product: name
                // <p>Blue Top</p>
                productObject['name'] = $div.find('.productinfo p').text();

                // Product: img
                // <img src="/get_product_picture/1" alt="ecommerce website products"></img> => /get_product_picture/1
                productObject['img'] = $div.find('.productinfo img').attr('src');

                // Product: price
                // <h2>Rs. 500</h2> => 500
                productObject['price'] = $div.find('.productinfo h2').text().split('Rs. ').pop();

                // Product: url
                productObject['url'] = $div.find('.choose ul a').attr('href');

                // Click to view product detail
                cy.get(cardsElement).eq(index).find('.choose a').click();

                // Get this product information
                cy.get('.product-information').then($info => {

                    // Product: category
                    // <p>Category: Women > Tops</p>
                    const category = $info.find('p:contains("Category:")').text().split('Category: ').pop();
                    productObject['product'] = category.split(' > ').shift();
                    productObject['category'] = category.split(' > ').pop();

                    // Product: availability
                    // <p><b>Availability:</b> In Stock</p>
                    productObject['availability'] = $info.find('p:contains("Availability:")').text().split('Availability: ').pop();

                    // Product: condition
                    // <p><b>Condition:</b> New</p>
                    productObject['condition'] = $info.find('p:contains("Condition:")').text().split('Condition: ').pop();

                    // Product: brand
                    // <p><b>Brand:</b> Polo</p>
                    productObject['brand'] = $info.find('p:contains("Brand:")').text().split('Brand: ').pop();
                })
                console.log(index+1, productObject);

                // Push product detail's object to array
                productArray.push(productObject);
                // console.log(productArray);

                // Back to homepage
                cy.visitHomepage('/products');

            // }   // DEBUG ONLY
        });

        // Write all products array to JSON
        cy.writeFile(websiteDataPathNameFile, productArray)
    });

    // +++++++++++++++++++++++++++++++++++++++
    it(`Get all products data from product api`, () => {

        cy.visitHomepage('/products');

        cy.request('GET', 'https://automationexercise.com/api/productsList').then(
            (response) => {
                console.log(response);

                // Convet body text to object
                // e.g. body: "{\"responseCode\": 200, \"products\": [{\"id...}
                // => { "responseCode": 200, products: [{id: 1, name: 'Blue Top', price: 'Rs. 500', brand: 'Polo', category: {category: "Tops", usertype: {usertype: 'Women'} },...]
                const body = JSON.parse(response.body);
                expect(body.responseCode).to.equal(200) 

                // Write all products array to JSON
                cy.writeFile(apiPathDataNameFile, body.products);
            }
        )
    });

    // +++++++++++++++++++++++++++++++++++++++
    it(`Combined products data from product page &  products data from product api`, () => {

        cy.visitHomepage('/products');

        let productArray = [];

        // Get products data from product api from JSON
        // e.g. apiData: [{id: 1, name: 'Blue Top', price: 'Rs. 500', brand: 'Polo', category: {category: "Tops", usertype: {usertype: 'Women'}}, ...]
        cy.readFile(apiPathDataNameFile).then(apiDataArray => {

            // Get products data from product page from JSON
            // e.g. websiteData: [{ "id": 1,"name": "Blue Top", "img": "/get_product_picture/1", "price": "500", "url": "/product_details/1", "product": "Women", "category": "Tops", "availability": "In Stock","condition": "New","brand": "Polo"},...]
            cy.readFile(websiteDataPathNameFile).then(websiteDataArray => {

                // Loop combined product object base on products data from product api
                apiDataArray.forEach((apiData, i) => {

                    // console.log(i+1, apiData);
                    // console.log(i+1, websiteDataArray[i]);

                    const productObject = Object.assign({}, apiData);

                    // Find products data from product page by name
                    const websiteData = websiteDataArray.find(data => apiData['name'] === data['name']);

                    // Loop set data in products data's object from product page by keys
                    const keysMapping = ["img", "url", "availability", "condition"];
                    keysMapping.forEach(key => {
                        productObject[key] = websiteData[key];
                    })

                    console.log(i+1, productObject);

                    // Push combined product detail's object to array
                    productArray.push(productObject);
                })
            
            })
        })

        // Write all products array to JSON
        cy.writeFile(configPathNameFile, productArray)

    });
});