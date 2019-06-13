
class MoonPlotPageObject {
  surfaceLabel (id) {
    return element(by.css(`.surface-label[data-id='${id}']`))
  }

  coreLabel (id) {
    return element(by.css(`.core-label[data-id='${id}']`))
  }

  circle () {
    return element(by.css('.moon-circle'))
  }
}

module.exports = MoonPlotPageObject
