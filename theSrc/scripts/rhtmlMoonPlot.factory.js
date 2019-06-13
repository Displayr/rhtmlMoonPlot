import _ from 'lodash'
import OuterPlot from './outerPlot'
import DisplayError from './DisplayError'

module.exports = function (element, w, h, stateChangedFn) {
  let configCopy = null
  let stateCopy = null
  const outerPlot = new OuterPlot(element)

  function doRenderValue (config, state) {
    try {
      outerPlot.reset()
      outerPlot.setConfig(config)

      if (typeof stateChangedFn === 'function') { outerPlot.addStateListener(stateChangedFn) }
      outerPlot.setState(state)
      outerPlot.addStateListener(newState => { stateCopy = newState })
      outerPlot.draw()
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
