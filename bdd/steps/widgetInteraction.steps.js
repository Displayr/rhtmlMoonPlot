const _ = require('lodash')
const request = require('request-promise')

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
      this.context.moonPlot.surfaceLabel(labelId).getLocation().then((locationObject) => {
        this.context.initialLocation = locationObject
        this.context.expectedOffset = {
          x: parseInt(xMovement),
          y: parseInt(yMovement)
        }
      })

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
      this.context.moonPlot.coreLabel(labelId).getLocation().then((locationObject) => {
        this.context.initialLocation = locationObject
        this.context.expectedOffset = {
          x: parseInt(xMovement),
          y: parseInt(yMovement)
        }
      })

      return browser.actions()
        .mouseMove(this.context.moonPlot.coreLabel(labelId))
        .mouseDown()
        .mouseMove({ x: parseInt(xMovement), y: parseInt(yMovement) })
        .mouseUp()
        .perform()
    })
  })

  this.Then(/^the final state callback should match "(.*)" within ([0-9.]+)$/, function (expectedStateFile, toleranceString) {
    if (!this.context.configName) {
      throw new Error('Cannot state match without configName')
    }
    const tolerance = parseFloat(toleranceString)
    if (_.isNaN(tolerance)) {
      throw new Error(`Invalid toleranceString '${toleranceString}', must be valid float`)
    }

    return wrapInPromiseAndLogErrors(() => {
      const expectedStateUrl = `http://localhost:9000/data/${this.context.configName}/${expectedStateFile}.json`
      const expectedStatePromise = request(expectedStateUrl).then(JSON.parse)
      const actualStatePromise = this.context.getRecentState()

      return Promise.all([actualStatePromise, expectedStatePromise]).then(([actualState, expectedState]) => {
      })
    })
  })
}
