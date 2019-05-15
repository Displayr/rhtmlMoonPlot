import _ from 'lodash'
import MoonPlot from './MoonPlot'
import DisplayError from './DisplayError'

// TODO: finish porting this to match "no resize just redo" style

console.log('spot 2')
module.exports = function (element, w, h, stateChangedFn) {
  console.log('spot 3')
  const stateChangedFnPresent = (typeof stateChangedFn === 'function')

  let configCopy = null
  let stateCopy = null

  const moonplot = new MoonPlot(element)

  function doRenderValue (config, state) {
    try {
      moonplot.reset()
      moonplot.setConfig(config)

      if (stateChangedFnPresent) {
        moonplot.addStateListener(stateChangedFn)
      }
      if (state && moonplot.checkState(state)) {
        moonplot.restoreState(state)
      } else {
        moonplot.resetState()
      }

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
      console.log('spot 4')
      console.log('config')
      console.log(JSON.stringify(config, {}, 2))

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
