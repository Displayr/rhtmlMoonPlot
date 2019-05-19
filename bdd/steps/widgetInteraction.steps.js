const _ = require('lodash')
const request = require('request-promise')
var deepDiff = require('deep-diff')

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

  this.When(/^I drag the circle by (-?[0-9]+) x (-?[0-9]+)$/, function (xMovement, yMovement) {
    return wrapInPromiseAndLogErrors(() => {
      this.context.moonPlot.circle().getLocation().then((locationObject) => {
        this.context.initialLocation = locationObject
        this.context.expectedOffset = {
          x: parseInt(xMovement),
          y: parseInt(yMovement)
        }
      })

      return browser.actions()
        .mouseMove(this.context.moonPlot.circle())
        .mouseDown()
        .mouseMove({ x: parseInt(xMovement), y: parseInt(yMovement) })
        .mouseUp()
        .perform()
    })
  })

  this.Then(/^the final state callback should match "(.*)" within ([0-9.]+)$/, function (expectedStateFile, toleranceString) {
    const tolerance = parseFloat(toleranceString)
    if (_.isNaN(tolerance)) {
      throw new Error(`Invalid toleranceString '${toleranceString}', must be valid float`)
    }

    return wrapInPromiseAndLogErrors(() => {
      const replaceDotsWithSlashes = (inputString) => {
        return inputString.replace(/[.]/g, '/')
      }

      const expectedStateUrl = `http://localhost:9000/${replaceDotsWithSlashes(expectedStateFile)}.json`
      const expectedStatePromise = request(expectedStateUrl).then(JSON.parse)
      const actualStatePromise = this.context.getRecentState()

      return Promise.all([actualStatePromise, expectedStatePromise]).then(([actualState, expectedState]) => {
        if (!_.isEqual(actualState, expectedState)) {
          console.log('actualState')
          console.log(JSON.stringify(actualState, {}, 2))

          console.log('expectedState')
          console.log(JSON.stringify(expectedState, {}, 2))

          console.log('differences (left: actual, right: expected')
          console.log(JSON.stringify(deepDiff(actualState, expectedState), {}, 2))
        }
        this.expect(actualState).to.deep.equal(expectedState)
      })
    })
  })
}
