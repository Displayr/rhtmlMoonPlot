import _ from 'lodash'
import MoonPlot from './MoonPlot'
import DisplayError from './DisplayError'

// TODO: finish porting this to match "no resize just redo" style

module.exports = function (element, w, h, stateChangedFn) {
  const stateChangedFnPresent = (typeof stateChangedFn === 'function') ? 'present' : 'absent'

  let configCopy = null
  let stateCopy = null

  const moonplot = new MoonPlot()

  function doRenderValue (config, state) {
    try {
      element.innerHTML = ''
      moonplot.reset()
      moonplot.setConfig(config)
      moonplot.setUserState(state)

      // if (stateChangedFnPresent) {
      //   moonplot.addStateListener(stateChangedFn)
      // }
      // if (state && moonplot.checkState(state)) {
      //   moonplot.restoreState(state)
      // } else {
      //   moonplot.resetState()
      // }
      //
      // moonplot.addStateListener(newState => { stateCopy = newState })

      return moonplot.draw(element)
    } catch (err) {
      _showError(err, element)
    }
  }

  return {
    resize () {
      doRenderValue(configCopy, stateCopy)
    },

    renderValue (inputConfig, state) {
      try {
        const config = _parseConfig(inputConfig)
        configCopy = _.cloneDeep(config)
        doRenderValue(config, state)
      } catch (err) {
        const readableError = new Error(`MoonPlot error : Cannot parse 'settingsJsonString': ${err}`)
        _showError(readableError, element)
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


