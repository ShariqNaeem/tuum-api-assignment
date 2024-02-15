const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    env:{
      authUrl: "https://auth-api.sandbox.tuumplatform.com/api",
      personUrl: "https://person-api.sandbox.tuumplatform.com/api",
      accountUrl: "https://account-api.sandbox.tuumplatform.com/api"
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
