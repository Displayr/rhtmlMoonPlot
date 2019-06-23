// TODO make this an exported module in rhtmlBuild
// without this cucumber is not logging errors when steps fail which makes debugging painful
// think this has to do with Applitools but dont really understand ...
const wrapInPromiseAndLogErrors = function (fn) {
  return new Promise((resolve, reject) => {
    fn().then(resolve)
      .catch((err) => {
        console.log(err)
        reject(err)
      })
  }).catch((err) => {
    console.log(err)
    throw err
  })
}

module.exports = function () {
  this.When(/^I drag surface label (.+) by (-?[0-9]+) x (-?[0-9]+)$/, function (labelId, xMovement, yMovement) {
    return wrapInPromiseAndLogErrors(() => {
      return browser.actions()
        .mouseMove(this.context.moonPlot.surfaceLabel(labelId))
        .mouseDown()
        .mouseMove({ x: parseInt(xMovement), y: parseInt(yMovement) })
        .mouseUp()
        .perform()
    })
  })

  this.When(/^I drag core label (.+) by (-?[0-9]+) x (-?[0-9]+)$/, function (labelId, xMovement, yMovement) {
    return wrapInPromiseAndLogErrors(() => {
      return browser.actions()
        .mouseMove(this.context.moonPlot.coreLabel(labelId))
        .mouseDown()
        .mouseMove({ x: parseInt(xMovement), y: parseInt(yMovement) })
        .mouseUp()
        .perform()
    })
  })

  this.When(/^I do a brittle circle resize action$/, function () {
    const offsetForTopOf500x500Circle = { x: 250, y: 83 }
    return wrapInPromiseAndLogErrors(() => {
      return browser.actions()
        .mouseMove(element(by.css('svg')), offsetForTopOf500x500Circle)
        .mouseDown()
        .mouseMove({ x: 0, y: 30 })
        .mouseUp()
        .perform()
    })
  })

  this.When(/^I press the reset button$/, function () {
    return wrapInPromiseAndLogErrors(() => {
      return this.context.moonPlot.resetButton().click()
    })
  })
}
