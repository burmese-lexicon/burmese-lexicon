exports.config = {
  tests: 'specs/*.spec.js',
  timeout: 10000,
  output: './specs/output/',
  include: {},
  bootstrap: false,
  mocha: {},
  name: 'burmese-lexicon',
  helpers: {
    WebDriverIO: {
      user: process.env.CI_USER,
      key: process.env.CI_KEY,
      url: process.env.CI_URL || 'http://hub-cloud.browserstack.com/wd/hub',
      desiredCapabilities: {
        project: 'burmese-lexicon',
        browserName: 'chrome',
        'browserstack.debug': true
      },
      browser: 'chrome',
      smartWait: 5000
    }
  }

  // don't build monolithic configs
  // mocha: require('./mocha.conf.js') || {},
  // include: {
  //   I: './src/steps_file.js',
  //   loginPage: './src/pages/login_page',
  //   dashboardPage: new DashboardPage()
  // }
}
