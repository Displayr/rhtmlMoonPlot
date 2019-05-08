 /* global document */

import _ from 'lodash'
import * as d3 from 'd3'

import PlotState from './plotState'
import {LunarSurface} from './LunarSurface'
import {LunarCore} from './LunarCore'
import Circle from './Circle'
import buildConfig from './buildConfig'

class MoonPlot {
  static initClass () {
    this.widgetIndex = 0
    this.widgetName = 'moonPlot'
  }

  constructor () {
    this.id = `${MoonPlot.widgetName}-${MoonPlot.widgetIndex++}`
    this.registeredStateListeners = []
    this.init()
  }

  init () {
    this.plotState = new PlotState()
  }

  reset () {
    this.registeredStateListeners.forEach(dergisterFn => dergisterFn())
    this.init()
  }

  setConfig (config) {
    this.config = buildConfig(config)
  }

  static defaultState () {
    return _.cloneDeep({
      lunarCoreLabels: [],
      lunarSurfaceLabels: [],
      plotSize: { width: null, height: null },
      circleRadius: null,
      labelPositioning: {
        surface: {},
        core: {}
      }
    })
  }

  addStateListener (listener) {
    this.registeredStateListeners.push(this.plotState.addListener(listener))
  }

  checkState (previousUserState) {
    const stateIsValid = !_.isNull(previousUserState) &&
      _.isEqual(previousUserState.lunarSurfaceLabels, this.config.lunarSurfaceLabels) &&
      _.isEqual(previousUserState.lunarCoreLabels, this.config.lunarCoreLabels) &&
      _.has(previousUserState, 'plotSize') &&
      _.has(previousUserState, 'circleRadius') &&
      _.has(previousUserState, 'labelPositioning')

    return stateIsValid
  }

  restoreState (previousUserState) {
    this.plotState.initialiseState(previousUserState)
  }

  resetState () {
    this.plotState.setState(_.merge({}, MoonPlot.defaultState(), {
      lunarSurfaceLabels: this.config.lunarSurfaceLabels,
      lunarCoreLabels: this.config.lunarCoreLabels
    }))
  }

  draw (rootElement) {
    const { width, height } = getContainerDimensions(_.has(rootElement, 'length') ? rootElement[0] : rootElement)

    const svg = d3.select(rootElement).append('svg')
      .attr('class', 'svgContent')
      .attr('width', width)
      .attr('height', height)

    const cx = width / 2
    const cy = height / 2

    if (!this.plotState.hasCircleRadius()) {
      this.plotState.setCircleRadius(Math.min(height, width) / 3) // TODO move to config
    }
    const {lunarCoreLabels, lunarSurfaceLabels, circleColor, crossColor, circleStrokeWidth, textColor, linkWidth, labelSizeConst} = this.config

    Circle.drawCircle({plotState: this.plotState, lunarCoreLabels, lunarSurfaceLabels, svg, cx, cy, height, width, circleColor, crossColor, textColor, circleStrokeWidth})
    LunarCore.drawLunarCoreLabels({plotState: this.plotState, lunarCoreLabelsData: lunarCoreLabels, svg, cx, cy, textColor, linkWidth}) // TODO remove need for lunarCoreLabelsData
    LunarSurface.drawLunarSurfaceLabels({plotState: this.plotState, lunarSurfaceLabelsData: lunarSurfaceLabels, svg, cx, cy, height, width, textColor, labelSizeConst}) // TODO remove need for lunarSurfaceLabelsData
  }
}
MoonPlot.initClass()
module.exports = MoonPlot

// TODO to utils
function getContainerDimensions (rootElement) {
  try {
    return rootElement.getBoundingClientRect()
  } catch (err) {
    err.message = `fail in getContainerDimensions: ${err.message}`
    throw err
  }
}
