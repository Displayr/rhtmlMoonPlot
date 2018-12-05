// TEMPLATE : this is a testing page object, which abstracts all interactions with your widget while under BDD test.
// See here for details of this pattern : https://martinfowler.com/bliki/PageObject.html.
// You will need to rename this file and modify it to support interactions with your widget under test.

class TemplatePage {
  selectSquare (squareName) {
    return element(by.css(`.text.${squareName}`)).click()
  }

  isSelected (squareName) {
    return element(by.css(`.text.${squareName}.selected`)).isPresent()
  }
}

module.exports = TemplatePage
