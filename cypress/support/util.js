import * as _ from 'lodash'
import moment from 'moment';

///////////////////////////////////////////
// ++++ Filled & Do Action Element Value  ++++
// Form: Filled form element value by criteria value base on form type
// Note: Created function in case can using in different section
// Section: Signin
// e.g. formcriteria = { "name": "signup|name", "formTitle": "Name", "elementName": "[data-qa='name']", "formType": "input", "howToFilled": "autofilled-type", "defaultValue": ["login|name"], "isRequiredField": "requierd" }
export const filledFormElementVauleBycriteria = (options) => {

    const { formcriteria, criteria } = options;
    const { name, elementName, formType, howToFilled, defaultValue } = formcriteria;
    let checkValue = '';

    // Checking: If howToFilled is 'reference', check vaule first is same as reference value or not in case some filled is not disable can change value after that
    // Note: If filled is disable setting howToFilled as 'autofilled'
    if(howToFilled === 'reference') {
        // Check condition by form Type to check 
        switch (true) {
            case formType === 'input':
                cy.log(`Check Form Element Vaule: ${name}: ${criteria[defaultValue[0]]}-${formType}`);
                console.log(`Check Form Element Vaule: ${name}: ${criteria[defaultValue[0]]}-${formType}`);

                // INPUT: Check with 1st defaultValue as reference value 
                // e.g. { "name": "signup|name", "formTitle": "Name", "elementName": "[data-qa='name']", "formType": "input", "howToFilled": "autofilled-type", "defaultValue": ["login|name"], "isRequiredField": "requierd" }
                cy.get(`input${elementName}`)
                    .should('have.value', criteria[defaultValue[0]]);
                    checkValue = criteria[defaultValue[0]];
                break;
        }
    }

    // Filled: Filled value by formType & howToFilled if criteria has set value
    if(criteria[name] === undefined || criteria[name] === '' || criteria[name] === checkValue) {
        cy.log(`NOT Filled Form Element Vaule: ${name}`);
        console.log(`NOT Filled Form Element Vaule: ${name}`);
    }
    else {
    // if(criteria[name] !== undefined || criteria[name] !== '' || criteria[name] !== checkValue) {

        cy.log(`Filled Form Element Vaule: ${name}: ${criteria[name]}-${formType}-${howToFilled}`);
        console.log(`Filled Form Element Vaule: ${name}: ${criteria[name]}-${formType}-${howToFilled}`);

        switch (true) {
            case formType === 'none': 
                break;
            case formType === 'input' && (howToFilled === 'type' || howToFilled === 'reference'):
                // INPUT & TYPE: Filled input with criteria's value by type's value and click body to clear in case this input trigger other input
                // e.g. element name = input[data-qa='name']
                cy.get(`input${elementName}`).clear().type(criteria[name]);
                cy.get('body').click(0,0);
                break;
            case formType === 'textarea':
                // TEXTAREA: Filled input with criteria's value by type's value and click body to clear in case this input trigger other input
                // e.g. element name = input[data-qa='name']
                cy.get(`textarea${elementName}`).clear().type(criteria[name]);
                cy.get('body').click(0,0);
                break;
            case formType === 'input' && howToFilled === 'autofilled':
                // INPUT & AUTOFILLED: Input will be filled by action before, only check input value is equal criteria's value and should be disabled
                // e.g. element name = input[data-qa='name']
                cy.get(`input${elementName}`)
                    .should('have.value', criteria[name])
                    // .should('have.attr', 'disabled');
                break;
            case formType === 'dropdown':
                // DROPDOWN:  Select value from dropdown
                // Note: 'force: true' for dropdown that not visible which need to scroll down to see options
                // e.g. element name = select[data-qa='days']
                cy.get(`select${elementName}`).select(criteria[name], { force: true });
                break;
            case formType === 'checkbox': 
                // CHECKBOX: Check or uncheck checkbox's input by criteria's value
                // e.g. element name = div[id='uniform-optin'] input[type="checkbox"]
                if(criteria[name] === 'check') {
                    cy.get(`div${elementName} input[type="checkbox"]`).check();
                } else if(criteria[name] === 'uncheck'){
                    cy.get(`div${elementName} input[type="checkbox"]`).uncheck();
                }
                break;
            case formType === 'radio': 
                // RADIO: Check radio's input by criteria's value
                // e.g. element name = 'div[data-qa="title"] input[type="radio"]'
                cy.get(`div${elementName} input[type="radio"]`).check(criteria[name].replace('.', ''));
                break;
            case formType === 'upload': 
                // RADIO: Check radio's input by criteria's value
                // e.g. <input type="file" class="form-control" name="upload_file">
                cy.get(`input${elementName}`).selectFile(`${getReferenceFilePathName('upload')}/${criteria[name]}`)
                break;
        }
    } 
    // else {
    //     cy.log(`NOT Filled Form Element Vaule: ${name}`);
    //     console.log(`NOT Filled Form Element Vaule: ${name}`);
    // }
};

///////////////////////////////////////////
// ++++ Checking Element Value ++++
// Checking: Loop checkElement whic element's value is equal criteria or not which each main element has different check element so need to set check element's id and order detail object's key
export const loopCheckElementAndCompareValues = ($ele, checkElement, criteria) => {

    // Loop check product detail from element value is equal order detail
    // e.g. checkElement = [ { "key": "name", "id": "h2:eq(0)", "type": "text","matchType": "equal", "toLowerCase": false  } ... ];
    checkElement.forEach(element => {

        console.log(`${element['key']}: Element should exist & compare value`);
        console.log(JSON.stringify(element));

        // Get element's value from id or class and by element's type is text, input or attr
        let elementValue = '';
        switch(true) {
            case element['type'] === 'text':
                // If element's type is 'text', get value from text and replace all text line break
                elementValue = removeTextLinebreaks($ele.find(element['id']).text());
                // console.log('text')
                break;
            case element['type'] === 'input':
                // If element's type is 'input', get value from value
                elementValue = $ele.find(element['id']).val();
                // console.log('Input')
                break;
            case element['type'].includes('attr'):
                // If element's type includes 'attr', get attr's name get attr's value
                // e.g. element['type'] = attr|src => title
                elementValue = $ele.find(element['id']).attr(element['type'].replace('attr|', ''));
                // console.log('Attr')
                break;
            case element['type'] === 'tr|id':
                // If element's type is 'tr|id', get id from tr which is $ele level to get product's id
                // e.g. $ele = <tr id="product-1"> => 'product-1' => '1'
                elementValue = $ele.attr('id').replace('product-', '');
                break;
            case element['type'] === 'table|src':
                // If element's type is 'table|src', add '/' at front to match criteria
                // e.g. $ele = src="get_product_picture/2" => '/get_product_picture/2'
                elementValue = '/' + $ele.find(element['id']).attr('src');
                break;
        }
        
        // Get baseValue from criteria by element's key
        let baseValue = '';
        switch(true) {
            case element['key'] === 'city-state-zipcode':
                // If key is 'city-state-zipcode', concat city, state and zipcode for address mapping
                // Note: Text from element is 'New York New York\n\t\t\t\t\t\t\t\t10001' when do function 'removeTextLinebreaks' will clear all '\n', '\t' so baseValue set between state and zipcode without space
                // e.g. baseValue = `New York New York10001`
                baseValue = `${criteria['city']} ${criteria['state']}${criteria['zipcode']}`
                break;
            default: 
                // Default: Set baseValue as criteria by element's key value
                baseValue =  criteria[element['key']];
                break;
        }
        
        // Set log message
        const message = `${element['key']} from element(${elementValue}) is ${element['matchType']} raw data(${baseValue})`

        // Check if element's toLowerCase is true convert both value to lower case before compare
        if(element['toLowerCase']) {
            baseValue = baseValue.toLowerCase();
            elementValue = elementValue.toLowerCase();
        }

        cy.get($ele)
            .should(() => {
                // Check element's matchType
                if(element['matchType'] === 'equal') {
                    // If matchType is 'equal' compare to equal
                    expect(elementValue).to.equal(baseValue, message);
                } else if(element['matchType'] === 'contains') {
                    // If matchType is 'contains' compare to elementValue include in baseValue
                    expect(elementValue).to.include(baseValue, message);
                } else if(element['matchType'] === 'startsWith') {
                    // If matchType is 'startsWith' compare to elementValue startsWith in baseValue
                    expect(elementValue).to.match(new RegExp(`^${baseValue}`, 'g'), message);
                } else if(element['matchType'] === 'endsWith') {
                    // If matchType is cstartsWith compare to elementValue startsWith in baseValue
                    expect(elementValue).to.match(new RegExp(`${baseValue}$`, 'g'), message);
                }
        });
    });
}

// Checking: Checking input validation message by checkCase
// e.g. elementName = '[data-qa="signup-email"]', '[id='name']'
export const checkElementValidationMessage = (elementName, checkCase) => {

    const checkCaseObject = {
        'fillField': 'Please fill out this field.',
        'formatEmail': "Please include an '@' in the email address."
    }
    
    // cy.get('input' + elementName).invoke('prop', 'validationMessage')
    cy.get(elementName).invoke('prop', 'validationMessage')
    .should('contain', checkCaseObject[checkCase])
}

///////////////////////////////////////////
// ++++ Convent Value For Test Value ++++
// Date: Convert nowDate to date or time or test case result
export const convertNowDateOrTimeForTestCaseResult = (type) => {
    switch(type){
        case 'date': 
            return moment(new Date()).format('MM/DD/YYYY');
        case 'dateFile': 
            return moment(new Date()).format('YYMMDD');
        case 'time':
            return moment(new Date()).format('HH:mm:ss');
    }
}

// Remove all text line breaks when get from function text()
export const removeTextLinebreaks = (str) => {
    return str.replaceAll(/[\r\n\t]+/gm,''); 
    // return str.replaceAll( /[\r\n\t]+/gm,'').replace(/(?:\r\n|\r|\n)/g, '').replaceAll(/(&nbsp;)*/g,'');
}

///////////////////////////////////////////
// ++++ Get Value ++++
// Products: Get object of products to check product details from productsConfig by objectKey, objectValue, and getValueType.
// Note: Can using for category, brand, search box
// e.g. options = { objectKey: 'category-type', objectValue: 'Women > Tops', getValueType: 'equal'}
export const getProductsObjectFromProductsConfig = (options) => {

    const { objectKey, objectValue, getValueType } = options;

    // Product: Get all products detail from config 
    // e.g. { "id": "1", "name": "Blue Top", "price": "Rs. 500", "brand": "Polo", "category": { "usertype": { "usertype": "Women" }, "category": "Tops" }, "category-type": "Women > Tops", "img": "/get_product_picture/1", "url": "/product_details/1", "availability": "In Stock", "condition": "New" },
    const productsConfig = getReferenceMappingJson('productsConfig.json');

    // Return products details by objectKey,objectValue and getValueType
    switch(true) {
        case objectValue === '': 
            // objectValue-'': If seachValue is '', return all products object
            return productsConfig
        case getValueType === 'equal': 
            // getValueType-equal: Return products object that objectValue equal value of productsConfig's objectKey 
            return productsConfig.filter(product => product[objectKey] === objectValue);
        case getValueType === 'searchbox':
            // getValueType-searchbox: Only Search box case. Return products object that objectValue contains in value of productsConfig's category or contains in value of productsConfig's name
            // e.g. objectValue = 'blue' => Return [{ "id": "1", "name": "Blue Top",...}, { "id": "16", "name": "Sleeves Top and Short - Blue & Pink",...}, ...]
            return  productsConfig.filter(product => 
                ((product['category']['category']).toLowerCase()).includes(objectValue.toLowerCase()) || 
                ((product['name']).toLowerCase()).includes(objectValue.toLowerCase())
            );
    }
};

// InputConfig: Get input config to check element failed format email
// e.g. criteria['contact|result'] = 'failed-format-contact|email' => 'contact|email'
export const checkFailedFormatEmailElementValidationMessage = (inputConfig, criteria) => {
    const elementCheckConfig = inputConfig.find(formcriteria => formcriteria['name'] === criteria.replace('failed-format-',''))
    checkElementValidationMessage(elementCheckConfig['elementName'], 'formatEmail');
    // return elementCheckConfig['elementName'];
    
}

// InputConfig: Get input config to check element failed field
// e.g. criteria['contact|result'] = 'failed-filled-contact|name' => 'contact|name'
export const checkFailedFillFieldElementValidationMessage = (inputConfig, criteria) => {
    const elementCheckConfig = inputConfig.find(formcriteria => formcriteria['name'] === criteria.replace('failed-filled-',''))
    checkElementValidationMessage(elementCheckConfig['elementName'], 'fillField');
    // return elementCheckConfig['elementName'];
}

///////////////////////////////////////////
// ++++ Get File Path Name & Data From JSON ++++
// FilePath: Get reference file path's name
export const getReferenceFilePathName = (key) => {
    const object = {
        configJSON : 'cypress/fixtures/configJSON',
        testCasecriteria : `cypress/fixtures/testCasecriteria`,
        upload : `cypress/fixtures/testCasecriteria/upload`,
        testResult : `cypress/downloads/testResult`,
    }
    return object[key];
}

// JSON: Get reference mapping's JSON file by key
export const getReferenceMappingJson = (key) => {
    const baseFolder = getReferenceFilePathName('configJSON').replace('cypress/', '');
    switch (key) {
        case 'apiConfig':
            return require(`../${baseFolder}/apiConfig.json`);
        case 'checkElementsConfig':
            return require(`../${baseFolder}/checkElementsConfig.json`);
        case 'inputConfig':
            return require(`../${baseFolder}/inputConfig.json`);
        case 'paymentConfig':
            return require(`../${baseFolder}/paymentConfig.json`);
        case 'productsConfig.json':
            return require(`../${baseFolder}/productsConfig.json`);
        case 'testCaseResultConfig':
            return require(`../${baseFolder}/testCaseResultConfig.json`);        
        case 'updateTestCaseResultConfig':
            return require(`../${baseFolder}/updateTestCaseResultConfig.json`);
        case 'userConfig':
            return require(`../${baseFolder}/userConfig.json`);
        case 'websiteMenuConfig':
            return require(`../${baseFolder}/websiteMenuConfig.json`);
    } 
}

// JSON: Get object from reference mapping's JSON file by objectKey
export const getObjectFromReferenceMappingJson = (mappingJSONFileName, objectKey) => { 
    const referenceMappingJson = getReferenceMappingJson(mappingJSONFileName);
    return referenceMappingJson[objectKey];
}

///////////////////////////////////////////
// ++++ Test case result ++++
// Result: Loop set test case result to test case result object
// Note: Set test status default as 'Failed' then update to 'Pass' if test success 
// e.g. options = { testCaseDetail: testCaseDetail, testCaseResult: testCaseResult, formResult: formResult[resultType], $element: $element }
export const setTestCaseResultObject = (options) => {

    const { testCaseDetail, testCaseResult, setResultObject } = options;
    const $element = options.$element !== undefined ? options.$element : '';
    const testResultObject = options.testResultObject !== undefined ? options.testResultObject : [];

    // Result: Loop set test case result by form's test case result info to test case result variable
    // e.g. result = [{ "name": "testEndTime", "type": "time", "setValue": "time" }, ...]
    setResultObject.forEach(result => {
        let resultValue;
        switch(result['type']) {
            case 'setValue':
                resultValue = result['setValue'] ;
                break;
            case 'elementText':
                // Type: 'elementText' get test case's result detail from html element text after submit form
                // Note: App should update element's id at result page to be easy to get value
                resultValue = $element.find(result['setValue']).text();
                break;
            case 'elementValue':
                // Type: 'elementValue' get test case's result detail from html element's value after submit form
                // Note: App should update element's id at result page to be easy to get value
                resultValue = $element.find(result['setValue']).val();
                break;
            case 'date':
                // Type: 'date' set result vaule as now date
                resultValue = convertNowDateOrTimeForTestCaseResult('date');
                break;
            case 'time':
                // Type: 'time' set result vaule as now time
                resultValue = convertNowDateOrTimeForTestCaseResult('time');
                break;
            case 'criteria-value':
                // Type: 'criteria' set result vaule from testCaseDetail with 'setValue' as key
                resultValue = testCaseDetail[result['setValue']];
                break;
            case 'testResultObject-value':
                // Type: 'testResultObject-value' set result vaule  from testResultObject with 'setValue' as key
                // e.g. { "name": "testStatus",  "type": "testResultObject-value", "setValue": "testStatus", "checkValue": "" }
                resultValue = testResultObject[result['setValue']];
                break;
            case 'testResultObject-massage':
                // Type: 'testResultObject-massage' set result vaule from testResultObject with 'setValue' as key. If message is '-' set as '-' else concat message with ',' 
                resultValue = testCaseResult[result['name']] === '-' ? testResultObject[result['setValue']] : testCaseResult[result['name']] + ', ' + testResultObject[result['setValue']];
                break;
        }
        
        testCaseResult[result['name']] = resultValue;
    });

    return testCaseResult;
}

// Result: Loop set test result object from from test case result config JSON by default and test case type
// e.g. formInfo = [{  "name": "testDate", "title": "Test Date", "type": "date", "setValue": "data"},...]
export const setResultObjectKeys = (type) => {
    return [
        ...getObjectFromReferenceMappingJson('testCaseResultConfig', 'default'),
        ...getObjectFromReferenceMappingJson('testCaseResultConfig', type)
    ]
}

///////////////////////////////////////////
// ++++ Write Data ++++
export const convertJSONArrayToGoldenCSV = (options) => {

    let fileContentToWrite = '';
    let headerContentToWrite = '';

    const csvRecords = options.jsonArray;
    const filePathName  = options.filePathName ;
    const isFirstTestCase = options.isFirstTestCase === undefined ? true : options.isFirstTestCase;

    if(csvRecords.length > 0) {
        
        // Get object's keys as column name
        const keys = Object.keys(csvRecords[0]);

        // Surround keys with double quote
        const keysWithDoubleQuote = keys.map(k => `"${k}"`);

        if(isFirstTestCase) {
            // Add header row to file content to write (only for the first data iteration) if only isFirstTestCase
            fileContentToWrite += keysWithDoubleQuote.join(',') + '\r\n';
        } else {
            // Else write header to case if first test case don't have data, need to concate header to file content to write first before write
            headerContentToWrite += keysWithDoubleQuote.join(',') + '\r\n';
        }

        csvRecords.forEach((record, i) => {

            const dataToWrite = [];

            // Loop each key
            keys.forEach((key, i) => {

                // Convert to string (some record will be number)
                record[key] = record[key] ? record[key].toString() : '';
                dataToWrite.push(`"${record[key]}"`)
            })

            // Add this row data to file content to write
            fileContentToWrite += dataToWrite.join(',') + '\r\n';
        })
    }

    cy.task("checkFileExist", filePathName).then((fileExist) => {

        if(!fileExist) {
            // Check file exsit or not if not create file first in case isFirstTestCase is false
            console.log("Write CSV: File not exsit")
            cy.writeFile(filePathName, '');
        }

        if(isFirstTestCase) {
            // First test case, write file content to write with header
            console.log("First test case: Write with header")
            cy.writeFile(filePathName, '');
            cy.writeFile(filePathName, fileContentToWrite);
        } else {
            
            // If not first test, read CSV file to check if have data or not in case don't have data, need to concate header to file content to write first before write 
            cy.readFile(filePathName)
            // .then(data => {
            //     return parse(data, {
            //         columns: true,
            //         bom: true
            //     })
            // })
                .then(csvRecords => {
                
                    console.log(csvRecords)
                    // If have data, concate new data without header
                    // if(csvRecords.length === '') {
                    if(csvRecords !== '') {
                        console.log("Not first test case: Write without header")
                        cy.writeFile(filePathName, fileContentToWrite, { flag: 'a+' })
                    } else {
                        // If doesn't have data, write new data with header
                        console.log("Not first test case: Write with header")
                        cy.writeFile(filePathName, headerContentToWrite + fileContentToWrite)
                    }
                }) 
        }
    });
}
