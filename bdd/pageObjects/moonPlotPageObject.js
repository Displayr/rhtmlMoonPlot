
class MoonPlotPageObject {
  surfaceLabel (id) {
    return element(by.css(`.surface-label[data-index='${id}']`))
  }

  coreLabel (id) {
    return element(by.css(`.core-label[data-index='${id}']`))
  }
}

module.exports = MoonPlotPageObject
