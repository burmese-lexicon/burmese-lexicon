/// <reference path="./custom_typings/steps.d.ts" />
Feature('SEO')

Scenario('show on first page google search', (I) => {
  I.amOnPage('https://google.com')
  I.fillField('q', 'burmese lexicon')
  I.pressKey('Enter')
  I.see('https://www.burmese-lexicon.com')
})
