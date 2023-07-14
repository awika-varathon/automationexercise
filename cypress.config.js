const { defineConfig } = require("cypress");
const readXlsx = require('./cypress/plugins/read-xlsx');
const fsFunction = require('./cypress/plugins/fsFunction');

module.exports = defineConfig({
	e2e: {
		baseUrl: "https://www.automationexercise.com",
		env: {
			"EMAIL": "automated.test@mail.com",
			"USERNAME": "Automated Test",
			"PASSWORD": "automatedTest",
			"WAIT_TIME": 2000
		},
		viewportWidth: 1440,
		viewportHeight: 780, 
		defaultCommandTimeout: 20000,
		responseTimeout: 50000,
		requestTimeout: 50000,
		watchForFileChanges: false,
        chromeWebSecurity: false,
        numTestsKeptInMemory: 5,
		setupNodeEvents(on, config) {
			// implement node event listeners here
			on('task', {
				setTestCaseResultVariable: ({ name, value }) => {
                    testCaseResult[name] = value
                    return null
                },
                getTestCaseResultVariable: ({ name }) => {
                    return testCaseResult[name] || null
                },
                clearTestCaseResultVariable: () => {
                    testCaseResult = {}
                    return null
                },
                setTempVariable: ({ name, value }) => {
                    tempVariables[name] = value
                    return null
                },
                getTempVariable: ({ name }) => {
                    return tempVariables[name] || null
                },
                clearTempVariables: () => {
                    tempVariables = {}
                    return null
                },
				'readXlsx': readXlsx.read,
                'checkFileExist': fsFunction.checkFileExist
			});
		},
	}
});
