const MoonPlot = require('../pageObjects/moonPlotPageObject')

module.exports = function () {
  this.Before(function () {
    this.context.moonPlot = new MoonPlot()
  })
}
