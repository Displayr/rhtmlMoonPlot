import _ from 'lodash'
import MoonPlot from './MoonPlot'
import DisplayError from './DisplayError'

module.exports = function (element, width, height, stateChangedCallback) {
  // TEMPLATE! - update the class name below to the name of your main class
  const instance = new MoonPlot(element, width, height, stateChangedCallback)
  return {
    resize (newWidth, newHeight) {
      instance.resize(newWidth, newHeight)
    },

    renderValue (inputConfig, userState) {
      let config = null
      try {
        config = _parseConfig(inputConfig)
      } catch (err) {
        const readableError = new Error(`MoonPlot error : Cannot parse 'settingsJsonString': ${err}`)
        _showError(readableError, element)
      }

      // @TODO for now ignore the width height that come through from config and use the ones passed to constructor
      // @TODO need to change this to match rhtmlPictograph
      delete config.width
      delete config.height

      try {
        instance.setConfig(config)
        instance.setUserState(userState)
        return instance.draw()
      } catch (err) {
        _showError(err, element)
      }
    }
  }
}

function _parseConfig (inputConfig) {
  if (_.isString(inputConfig) && inputConfig.match(/^{/)) {
    return JSON.parse(inputConfig)
  } else {
    return inputConfig
  }
}

function _showError (error, element) {
  console.error(error.stack)
  const errorHandler = new DisplayError(element, error)
  errorHandler.draw()
  throw new Error(error)
}
