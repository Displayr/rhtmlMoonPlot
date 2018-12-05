const TemplatePage = require('../pageObjects/template.page')

module.exports = function () {
  this.Before(function () {
    // TEMPLATE: you will need to use your own page object here
    // NB: This is not the instance class for the widget, it is a page object
    //     that abstracts interaction with the widget
    this.context.templatePageObject = new TemplatePage()
  })
}
