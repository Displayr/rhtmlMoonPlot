import _ from 'lodash'
import MoonPlot from './MoonPlot'
import DisplayError from './DisplayError'

module.exports = function (element, w, h, stateChangedFn) {
  let configCopy = null
  let stateCopy = null
  const moonplot = new MoonPlot(element)

  function doRenderValue (config, state) {
    try {
      moonplot.reset()
      moonplot.setConfig(config)

      if (typeof stateChangedFn === 'function') { moonplot.addStateListener(stateChangedFn) }
      moonplot.setState(state)
      moonplot.addStateListener(newState => { stateCopy = newState })
      moonplot.draw()
    } catch (err) {
      _showError(err, element)
    }
  }

  return {
    resize () {
      doRenderValue(configCopy, stateCopy)
    },

    renderValue (config, state) {
      configCopy = _.cloneDeep(config)
      doRenderValue(config, state)
    }
  }
}

function _showError (error, element) {
  console.error(error.stack)
  const errorHandler = new DisplayError(element, error)
  errorHandler.draw()
  throw new Error(error)
}
