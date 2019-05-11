 /* global document */

import _ from 'lodash'
import * as d3 from 'd3'

import PlotState from './plotState'
import buildConfig from './buildConfig'
import CoreLabeller from './labellers/coreLabeller'
import SurfaceLabeller from './labellers/surfaceLabeller'

import CorelLabels from './components/coreLabels'
import SurfacelLabels from './components/surfaceLabels'
import Circle from './components/circle'

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
      version: 1,
      sourceData: { coreLabels: [], surfaceLabels: [] },
      plot: { coreLabels: [], surfaceLabels: [] },
      plotSize: { width: null, height: null },
      circleRadius: null, // TODO just make it radius or plotRadius, or move to plot.radius
      labellerHasRan: false,
      userModifiedPositions: false
    })
  }

  addStateListener (listener) {
    this.registeredStateListeners.push(this.plotState.addListener(listener))
  }

  checkState (previousUserState) {
    const stateIsValid = !_.isNull(previousUserState) &&
      previousUserState.version === 1 &&
      _.isEqual(previousUserState.sourceData.surfaceLabels, this.config.surfaceLabels) &&
      _.isEqual(previousUserState.sourceData.coreLabels, this.config.coreLabels) &&
      _.has(previousUserState, 'plotSize') &&
      _.has(previousUserState, 'circleRadius')

    return stateIsValid
  }

  restoreState (previousUserState) {
    this.plotState.initialiseState(previousUserState)
  }

  resetState () {
    this.plotState.setState(_.merge({}, MoonPlot.defaultState(), {
      sourceData: {
        lunarSurfaceLabels: this.config.lunarSurfaceLabels,
        lunarCoreLabels: this.config.lunarCoreLabels
      }
    }))
  }

  draw (rootElement) {
    // TODO buildConfig shouldn't really be transforming the labels ...

    const { width, height } = getContainerDimensions(_.has(rootElement, 'length') ? rootElement[0] : rootElement)

    const svg = d3.select(rootElement).append('svg')
      .attr('class', 'svgContent')
      .attr('width', width)
      .attr('height', height)

    const cx = width / 2 // TODO maintain in state ?
    const cy = height / 2 // TODO maintain in state ?

    if (!this.plotState.hasCircleRadius()) {
      this.plotState.setCircleRadius(Math.min(height, width) / 3) // TODO move to config
    }

    if (!this.plotState.labellerHasRan) {
      const coreLabels = CoreLabeller.positionLabels({
        svg,
        lunarCoreLabels: this.config.lunarCoreLabels,
        fontFamily: this.config.coreLabelFontFamily,
        fontSize: this.config.coreLabelFontSize,
        radius: this.plotState.getCircleRadius(),
        cx,
        cy
      })

      const surfaceLabels = SurfaceLabeller.positionLabels({
        svg,
        surfaceLabels: this.config.lunarSurfaceLabels,
        fontFamily: this.config.surfaceLabelFontFamily,
        fontSize: this.config.surfaceLabelFontSize,
        radius: this.plotState.getCircleRadius(),
        cx,
        cy
      })

      // TODO make accessors for plotState
      this.plotState.state.labellerHasRan = true
      this.plotState.state.plot.coreLabels = coreLabels
      this.plotState.state.plot.surfaceLabels = surfaceLabels
      this.plotState.callListeners()
    }

    this.coreLabels = new CorelLabels({
      parentContainer: svg,
      plotState: this.plotState,
      cx,
      cy,
      fontFamily: this.config.coreLabelFontFamily,
      fontSize: this.config.coreLabelFontSize,
      fontColor: this.config.coreLabelFontColor,
      fontSelectedColor: this.config.coreLabelFontSelectedColor,
      linkWidth: this.config.linkWidth,
      linkColor: this.config.linkColor
    })

    this.surfaceLabels = new SurfacelLabels({
      parentContainer: svg,
      plotState: this.plotState,
      cx,
      cy,
      height,
      width,
      fontFamily: this.config.surfaceLabelFontFamily,
      fontSize: this.config.surfaceLabelFontSize,
      fontColor: this.config.surfaceLabelFontColor,
      fontSelectedColor: this.config.surfaceLabelFontSelectedColor,
      linkWidth: this.config.linkWidth,
      linkColor: this.config.linkColor
    })

    this.circle = new Circle({
      parentContainer: svg,
      plotState: this.plotState,
      cx,
      cy,
      circleColor: this.config.circleColor,
      crossColor: this.config.crossColor,
      circleStrokeWidth: this.config.circleStrokeWidth
    })

    this.coreLabels.draw()
    this.surfaceLabels.draw()
    this.circle.draw()
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
