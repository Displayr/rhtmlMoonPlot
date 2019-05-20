import _ from 'lodash'
import * as d3 from 'd3'

import PlotState from './plotState'
import buildConfig from './buildConfig'
import buildLabelObjectsFromConfig from './math/buildLabelObjectsFromConfig'

import CoreLabeller from './labellers/coreLabeller'
import SurfaceLabeller from './labellers/surfaceLabeller'

import CorelLabels from './components/coreLabels'
import SurfacelLabels from './components/surfaceLabels'
import Circle from './components/circle'

// If any of these config values change, we must reset state
// NB we may need to remove font size from this list
const configInvariants = [
  'coreLabelFontSize',
  'surfaceLabelFontSize',
  'surfaceLabelMinimumLabelDistance',
  'surfaceLabelRadialPadding',
  'surfaceLabelFontBaseSize',
  'surfaceLabelRadialPadding'
]

const configDataArrays = ['coreNodes', 'surfaceNodes', 'coreLabels', 'surfaceLabels']

class MoonPlot {
  static initClass () {
    this.widgetIndex = 0
    this.widgetName = 'moonPlot'
  }

  constructor (element) {
    this.rootElement = element
    this.registeredStateListeners = []
    this.id = `${MoonPlot.widgetName}-${MoonPlot.widgetIndex++}`

    const { width, height } = this.containerDimensions()
    this.svg = d3.select(this.rootElement).append('svg')
      .attr('id', this.id)
      .attr('class', 'svgContent')
      .attr('width', width)
      .attr('height', height)

    this.init()
  }

  containerDimensions () {
    const rootElement = _.has(this.rootElement, 'length') ? this.rootElement[0] : this.rootElement
    try {
      return rootElement.getBoundingClientRect()
    } catch (err) {
      err.message = `fail in this.containerDimensions: ${err.message}`
      throw err
    }
  }

  init () {
    this.plotState = new PlotState()
    this.plotState.setPlotReference(this)
    this.config = null
    this.inputData = null
  }

  reset () {
    this.registeredStateListeners.forEach(dergisterFn => dergisterFn())
    this.init()
  }

  clearPlot () {
    this.svg.selectAll('*').remove()
  }

  setConfig (config) {
    this.config = buildConfig(_.omit(config, configDataArrays))
    this.inputData = _.pick(config, configDataArrays)
  }

  static defaultState () {
    return _.cloneDeep({
      version: 1,
      sourceData: { coreLabels: [], surfaceLabels: [] },
      plot: { coreLabels: [], surfaceLabels: [] },
      plotSize: { width: null, height: null },
      circleRadius: null
    })
  }

  addStateListener (listener) {
    this.registeredStateListeners.push(this.plotState.addListener(listener))
  }

  setState (previousState) {
    if (this.checkState(previousState)) {
      this.plotState.initialiseState(previousState)
    } else {
      this.resetState()
    }
  }

  checkState (previousState) {
    const configInvariantsHaveNotChanged = _(configInvariants)
      .every(invariant => _.get(previousState, `configInvariants.${invariant}`) === this.config[invariant])

    const { width, height } = this.containerDimensions()
    const { coreLabels, surfaceLabels } = buildLabelObjectsFromConfig(this.inputData)
    const stateIsValid = !_.isEmpty(previousState) &&
      previousState.version === 1 &&
      Math.abs(previousState.plotSize.width - width) < 2 && // TODO configurable tolerance
      Math.abs(previousState.plotSize.height - height) < 2 && // TODO configurable tolerance
      _.isEqual(previousState.sourceData, { coreLabels, surfaceLabels }) &&
      _.has(previousState, 'circleRadius') &&
      _.has(previousState, 'center') &&
      configInvariantsHaveNotChanged

    return stateIsValid
  }

  // TODO passing newRadius is a bit hacky
  // when the circle is dragged, we must reset state, and in that case radius is not
  resetState (newRadius) {
    const { width, height } = this.containerDimensions()
    const radius = (newRadius) || Math.min(height, width) / 3 // TODO move the 3 to config
    const center = {x: width / 2, y: height / 2}
    const sourceData = buildLabelObjectsFromConfig(this.inputData)

    const coreLabels = CoreLabeller.positionLabels({
      svg: this.svg,
      coreLabels: sourceData.coreLabels,
      minLabelDistance: this.config.coreLabelMinimumLabelDistance,
      fontFamily: this.config.coreLabelFontFamily,
      fontSize: this.config.coreLabelFontSize,
      radius,
      center
    })

    const surfaceLabels = SurfaceLabeller.positionLabels({
      svg: this.svg,
      surfaceLabels: sourceData.surfaceLabels,
      minLabelDistance: this.config.surfaceLabelMinimumLabelDistance,
      radialPadding: this.config.surfaceLabelRadialPadding,
      fontFamily: this.config.surfaceLabelFontFamily,
      fontSize: this.config.surfaceLabelFontBaseSize,
      radius,
      center
    })

    this.plotState.setState(_.merge({}, MoonPlot.defaultState(), {
      version: 1,
      sourceData: sourceData,
      plot: { coreLabels, surfaceLabels },
      plotSize: { width, height },
      circleRadius: radius,
      center,
      configInvariants: _.pick(this.config, configInvariants)
    }))
  }

  draw () {
    this.clearPlot()
    const { width, height } = this.containerDimensions()

    this.svg
      .attr('width', width)
      .attr('height', height)

    this.coreLabels = new CorelLabels({
      parentContainer: this.svg,
      plotState: this.plotState,
      fontFamily: this.config.coreLabelFontFamily,
      fontSize: this.config.coreLabelFontSize,
      fontColor: this.config.coreLabelFontColor,
      fontSelectedColor: this.config.coreLabelFontSelectedColor,
      linkWidth: this.config.linkWidth,
      linkColor: this.config.linkColor
    })

    this.surfaceLabels = new SurfacelLabels({
      parentContainer: this.svg,
      plotState: this.plotState,
      fontFamily: this.config.surfaceLabelFontFamily,
      fontSize: this.config.surfaceLabelFontBaseSize,
      fontColor: this.config.surfaceLabelFontColor,
      fontSelectedColor: this.config.surfaceLabelFontSelectedColor,
      linkWidth: this.config.linkWidth,
      linkColor: this.config.linkColor
    })

    this.circle = new Circle({
      parentContainer: this.svg,
      plotState: this.plotState,
      circleColor: this.config.circleColor,
      crossColor: this.config.crossColor,
      circleStrokeWidth: this.config.circleStrokeWidth,
      circleDragAreaWidth: this.config.circleDragAreaWidth
    })

    this.circle.draw()
    this.coreLabels.draw()
    this.surfaceLabels.draw()
  }
}
MoonPlot.initClass()
module.exports = MoonPlot
