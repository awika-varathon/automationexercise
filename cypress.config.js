const { defineConfig } = require("cypress");
const readXlsx = require('./cypress/plugins/read-xlsx');

module.exports = defineConfig({
	e2e: {
		setupNodeEvents(on, config) {
			// implement node event listeners here
			on('task', {
				'readXlsx': readXlsx.read
      		});
		},
	},
});
