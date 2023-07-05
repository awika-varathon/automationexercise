import * as _ from 'lodash'
import moment from 'moment';

///////////////////////////////////////////
// ++++ Filled & Do Action Element Value  ++++
// Form: Filled form element value by criterial value base on form type
// Note: Created function in case can using in different section
// Section: Signin
// e.g. formCriterial = { "name": "signup|name", "formTitle": "Name", "elementName": "name", "formType": "input", "howToFilled": "autofilled-type", "defaultValue": ["login|name"], "isRequiredField": "requierd" }
export const filledFormElementVauleByCriterial = (options) => {

    const { formCriterial, criterial } = options;
    const { name, elementName, formType, howToFilled, defaultValue } = formCriterial;
    let checkValue = '';

    // Checking: If howToFilled is 'reference', check vaule first is same as reference value or not in case some filled is not disable can change value after that
    // Note: If filled is disable setting howToFilled as 'autofilled'
    if(howToFilled === 'reference') {
        // Check condition by form Type to check 
        switch (true) {
            case formType === 'input':
                cy.log(`Check Form Element Vaule: ${name}: ${criterial[defaultValue[0]]}-${formType}`);
                console.log(`Check Form Element Vaule: ${name}: ${criterial[defaultValue[0]]}-${formType}`);

                // INPUT: Check with 1st defaultValue as reference value 
                // e.g. { "name": "signup|name", "formTitle": "Name", "elementName": "name", "formType": "input", "howToFilled": "autofilled-type", "defaultValue": ["login|name"], "isRequiredField": "requierd" }
                cy.get(`input[data-qa="${elementName}"]`)
                    .should('have.value', criterial[defaultValue[0]]);
                    checkValue = criterial[defaultValue[0]];
                break;
        }
    }

    // Filled: Filled value by formType & howToFilled if criterial has set value
    if(criterial[name] !== undefined || criterial[name] !== checkValue) {

        cy.log(`Filled Form Element Vaule: ${name}: ${criterial[name]}-${formType}-${howToFilled}`);
        console.log(`Filled Form Element Vaule: ${name}: ${criterial[name]}-${formType}-${howToFilled}`);

        switch (true) {
            case formType === 'none': 
                break;
            case formType === 'input' && (howToFilled === 'type' || howToFilled === 'reference'):
                // INPUT & TYPE: Filled input with criterial's value by type's value and click body to clear in case this input trigger other input
                cy.get(`input[data-qa="${elementName}"]`).clear().type(criterial[name]);
                cy.get('body').click(0,0);
                break;
            case formType === 'input' && howToFilled === 'autofilled':
                // INPUT & AUTOFILLED: Input will be filled by action before, only check input value is equel criterial's value and should be disabled
                cy.get(`input[data-qa="${elementName}"]`)
                    .should('have.value', criterial[name])
                    // .should('have.attr', 'disabled');
                break;
            case formType === 'dropdown':
                // DROPDOWN:  Select value from dropdown
                // Note: 'force: true' for dropdown that not visible which need to scroll down to see options
                cy.get(`select[data-qa="${elementName}"]`).select(criterial[name], { force: true });
                break;
            case formType === 'checkbox': 
                // CHECKBOX: Check or uncheck checkbox's input by criterial's value
                if(criterial[name] === 'check') {
                    cy.get(`div[id="${elementName}"] input[type="checkbox"]`).check();
                } else if(criterial[name] === 'uncheck'){
                    cy.get(`div[id="${elementName}"] input[type="checkbox"]`).uncheck();
                }
                break;
            case formType === 'radio': 
                // RADIO: Check radio's input by criterial's value
                // e.g. element name = 'div[data-qa="title"] input[type="radio"]'
                cy.get(`div[data-qa="${elementName}"] input[type="radio"]`).check(criterial[name].replace('.', ''));
                break;
        }
    } else {
        cy.log(`NOT Filled Form Element Vaule: ${name}`);
        console.log(`NOT Filled Form Element Vaule: ${name}`);
    }
};

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

///////////////////////////////////////////
// ++++ Get File Path Name & Data From JSON ++++
// FilePath: Get reference file path's name
export const getReferenceFilePathName = (key) => {
    const object = {
        configJSON : 'cypress/fixtures/configJSON',
        testCaseCriterial : `cypress/fixtures/testCaseCriterial/`,
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
        case 'productsConfig.json':
            return require(`../${baseFolder}/productsConfig.json`);
        case 'signupConfig':
            return require(`../${baseFolder}/signupConfig.json`);
        case 'websiteMeunConfig':
            return require(`../${baseFolder}/websiteMeunConfig.json`);
        case 'updateTestCaseResultConfig':
            return require(`../${baseFolder}/updateTestCaseResultConfig.json`);
        case 'testCaseResultConfig':
            return require(`../${baseFolder}/testCaseResultConfig.json`);
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
    const resultCriterial = options.resultCriterial !== undefined ? options.resultCriterial : {};

    // Result: Set error message array for check error check value 
    let errorMessageArray = [];

    // Result: Loop set test case result by form's test case result info to test case result variable
    // e.g. formResult = [{ "name": "testEndTime", "type": "time", "setValue": "time" }, ...]
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
                // resultValue = moment(new Date()).format('MM/DD/YYYY');
                resultValue = convertNowDateOrTimeForTestCaseResult('date');
                break;
            case 'time':
                // resultValue = moment(new Date()).format('HH:mm:ss');
                resultValue = convertNowDateOrTimeForTestCaseResult('time');
                break;
            case 'criterial-value':
                // Type: 'criterial' set result vaule from testCaseDetail with 'setValue' as key
                resultValue = testCaseDetail[result['setValue']];
                break;
            case 'criterial-checkValue':
                // Type: 'criterial-checkValue' check vaule from testCaseDetail with 'setValue' as key is true all not
                // If true set result vaule as 'Failed' as base result vaule which will update result vaule to 'Pass' after test these action done and pass, if false means doesn't test this action then set result vaule as '-'  
                // e.g. testCaseDetail[createStatusBR]
                resultValue = testCaseDetail[result['setValue']] ? 'Failed' : '-';
                break;  
            case 'testResultObject-value':
                // Type: 'testResultObject-value' check vaule from testCaseDetail with 'setValue' as key is true all not
                resultValue = testResultObject[result['setValue']];
                break;
            case 'testResultObject-massage':
                // Type: 'checkCriterial' check vaule from testCaseDetail with 'setValue' as key is true all not
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
