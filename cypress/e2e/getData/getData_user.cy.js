import { getReferenceFilePathName } from '../../support/util'

describe(`Get user config from excel for e2e tests`, () => {

    // Set file path name of input excel and output json
    // e.g. filePathName = cypress/fixtures/testCasecriteria/testCasecriteria_register.xlsx
    const excelPathFileName = `${getReferenceFilePathName('configJSON')}/configReference/userConfig.xlsx`
    const configPathFileName = `${getReferenceFilePathName('configJSON')}/userConfig.json`

    // +++++++++++++++++++++++++++++++++++++++
    it(`Get user config from excel for e2e tests`, () => {

        // Set sheetName to get user config
        const sheetNameArray = ['reg_default', 'reg_order'];

        // Set userConfig object
        let userConfig = {};

        sheetNameArray.forEach(sheetName => {
            
            cy.task('readXlsx', { file: excelPathFileName, sheet: sheetName}).then((rows) => {
                    
                cy.log(`++++ ${sheetName}: Get userConfig from excel ++++`);
                console.log(`++++ ${sheetName}: Get userConfig from excel ++++`);
    
                let user= {};

                Object.keys(rows[0]).forEach(key => {
                    user[key.split('|').pop()] = rows[0][key];
                })
                // Info: Set this userConfig to object 
                userConfig[sheetName.replace('reg_', '')] = user;
            });
        })

            // Write all userConfig to JSON
            cy.writeFile(configPathFileName, userConfig)
        });
});