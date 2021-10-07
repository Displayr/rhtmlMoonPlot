import _ from 'lodash'
import * as d3 from 'd3'

import PlotState from './plotState'
import buildConfig from './buildConfig'
import buildLabelObjectsFromConfig from './math/buildLabelObjectsFromConfig'
import { Layout, CellNames } from './layout'

import CoreLabeller from './labellers/coreLabeller'
import SurfaceLabeller from './labellers/surfaceLabeller'

import MoonPlot from './components/moonPlot'
import Title from './components/title'
import ResetButton from './components/resetButton'

// If any of these config values change, we must reset state
// NB we may need to remove font size from this list
const configInvariants = [
  'coreLabelFontSize',
  'surfaceLabelFontSize',
  'surfaceLabelMinimumLabelDistance',
  'surfaceLabelRadialPadding',
  'surfaceLabelFontBaseSize',
  'surfaceLabelRadialPadding',
]

const configDataArrays = ['coreNodes', 'surfaceNodes', 'coreLabels', 'surfaceLabels']

class OuterPlot {
  static initClass () {
    this.widgetIndex = 0
    this.widgetName = 'moonPlot'
  }

  constructor (element) {
    this.rootElement = element
    this.registeredStateListeners = []
    this.id = `${OuterPlot.widgetName}-${OuterPlot.widgetIndex++}`

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

  // TODO does this get called ?
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

    // NB in other widgets we run initialiseComponents() in draw, but here
    // we need to know the plot dimensions after adjusting for title/subtitle/footer to check state, and this occurs BEFORE draw
    this.initialiseComponents()
  }

  static defaultState () {
    return _.cloneDeep({
      version: 1,
      sourceData: { coreLabels: [], surfaceLabels: [] },
      plot: { coreLabels: [], surfaceLabels: [] },
      plotSize: { width: null, height: null },
      circleRadius: null,
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
    const plotBounds = this.layout.getCellBounds(CellNames.PLOT)
    const circleCenter = {
      x: plotBounds.left + plotBounds.width / 2,
      y: plotBounds.top + plotBounds.height / 2,
    }
    const { coreLabels, surfaceLabels } = buildLabelObjectsFromConfig(this.inputData)
    const stateIsValid = !_.isEmpty(previousState) &&
      previousState.version === 1 &&
      Math.abs(previousState.plotSize.width - width) < 2 && // TODO configurable tolerance
      Math.abs(previousState.plotSize.height - height) < 2 && // TODO configurable tolerance
      _.isEqual(previousState.sourceData, { coreLabels, surfaceLabels }) &&
      _.isEqual(previousState.center, circleCenter) &&
      _.has(previousState, 'circleRadius') && // circleRadius is adjustable, so might not be equal
      configInvariantsHaveNotChanged

    return stateIsValid
  }

  // TODO passing newRadius is a bit hacky
  // when the circle is dragged, we must reset state, and in that case radius is not
  resetState (newRadius) {
    const moonDimensions = this.layout.getCellBounds(CellNames.PLOT)
    const plotDimensions = this.containerDimensions()
    const radius = (newRadius) || Math.min(moonDimensions.width, moonDimensions.height) / 3 // TODO move the 3 to config
    const absoluteMoonCenter = { x: moonDimensions.left + moonDimensions.width / 2, y: moonDimensions.top + moonDimensions.height / 2 }
    const relativeMoonCenter = { x: moonDimensions.width / 2, y: moonDimensions.height / 2 }
    const sourceData = buildLabelObjectsFromConfig(this.inputData)

    const coreLabels = CoreLabeller.positionLabels({
      svg: this.svg,
      coreLabels: sourceData.coreLabels,
      minLabelDistance: this.config.coreLabelMinimumLabelDistance,
      fontFamily: this.config.coreLabelFontFamily,
      fontSize: this.config.coreLabelFontSize,
      radius,
      center: relativeMoonCenter,
    })

    const surfaceLabels = SurfaceLabeller.positionLabels({
      svg: this.svg,
      surfaceLabels: sourceData.surfaceLabels,
      minLabelDistance: this.config.surfaceLabelMinimumLabelDistance,
      radialPadding: this.config.surfaceLabelRadialPadding,
      fontFamily: this.config.surfaceLabelFontFamily,
      fontSize: this.config.surfaceLabelFontBaseSize,
      radius,
      center: relativeMoonCenter,
    })

    this.plotState.setState(_.merge({}, OuterPlot.defaultState(), {
      version: 1,
      sourceData: sourceData,
      plot: { coreLabels, surfaceLabels },
      plotSize: { width: plotDimensions.width, height: plotDimensions.height },
      circleRadius: radius,
      center: absoluteMoonCenter,
      configInvariants: _.pick(this.config, configInvariants),
    }))
  }

  draw () {
    this.rootElement.setAttribute('rhtmlwidget-status', 'loading')

    this.clearPlot()
    const { width, height } = this.containerDimensions()

    this.svg
      .attr('width', width)
      .attr('height', height)

    if (this.layout.enabled(CellNames.TITLE)) { this.components[CellNames.TITLE].draw(this.layout.getCellBounds(CellNames.TITLE)) }
    if (this.layout.enabled(CellNames.SUBTITLE)) { this.components[CellNames.SUBTITLE].draw(this.layout.getCellBounds(CellNames.SUBTITLE)) }
    if (this.layout.enabled(CellNames.FOOTER)) { this.components[CellNames.FOOTER].draw(this.layout.getCellBounds(CellNames.FOOTER)) }
    this.components[CellNames.PLOT].draw(this.layout.getCellBounds(CellNames.PLOT))

    // reset button managed outside of layout, it is fixed at bottom right
    this.components[CellNames.RESET].draw()

    this.rootElement.setAttribute('rhtmlwidget-status', 'ready')
  }

  initialiseComponents () {
    this.components = {}
    // TODO wire in inner and outer padding
    const innerPadding = 5
    const outerPadding = 0

    const { width, height } = this.containerDimensions()
    this.layout = new Layout(width, height, innerPadding, outerPadding)

    this.components[CellNames.PLOT] = new MoonPlot({
      parentContainer: this.svg,
      config: this.config, // this is lazy but a large percentage of config is shared ...
      plotState: this.plotState,
    })
    this.layout.enable(CellNames.PLOT)
    this.layout.setFillCell(CellNames.PLOT)

    if (!_.isEmpty(this.config.title)) {
      this.components[CellNames.TITLE] = new Title({
        parentContainer: this.svg,
        text: this.config.title,
        fontColor: this.config.titleFontColor,
        fontSize: this.config.titleFontSize,
        fontFamily: this.config.titleFontFamily,
        maxWidth: width,
        maxHeight: height / 4, // TODO make this configurable
        bold: false,
        innerPadding: 2, // TODO make configurable
      })

      const dimensions = this.components[CellNames.TITLE].computePreferredDimensions()
      this.layout.enable(CellNames.TITLE)
      this.layout.setPreferredDimensions(CellNames.TITLE, dimensions)
    }

    if (!_.isEmpty(this.config.subtitle)) {
      this.components[CellNames.SUBTITLE] = new Title({
        parentContainer: this.svg,
        text: this.config.subtitle,
        fontColor: this.config.subtitleFontColor,
        fontSize: this.config.subtitleFontSize,
        fontFamily: this.config.subtitleFontFamily,
        maxWidth: width,
        maxHeight: height / 4, // TODO make this configurable
        bold: false,
        innerPadding: 2, // TODO make configurable
      })

      const dimensions = this.components[CellNames.SUBTITLE].computePreferredDimensions()
      this.layout.enable(CellNames.SUBTITLE)
      this.layout.setPreferredDimensions(CellNames.SUBTITLE, dimensions)
    }

    if (!_.isEmpty(this.config.footer)) {
      this.components[CellNames.FOOTER] = new Title({
        parentContainer: this.svg,
        text: this.config.footer,
        fontColor: this.config.footerFontColor,
        fontSize: this.config.footerFontSize,
        fontFamily: this.config.footerFontFamily,
        maxWidth: width,
        maxHeight: height / 4, // TODO make this configurable
        bold: false,
        innerPadding: 2, // TODO make configurable
      })

      const dimensions = this.components[CellNames.FOOTER].computePreferredDimensions()
      this.layout.enable(CellNames.FOOTER)
      this.layout.setPreferredDimensions(CellNames.FOOTER, dimensions)
    }

    this.components[CellNames.RESET] = new ResetButton({
      parentContainer: this.svg,
      fontFamily: this.config.titleFontFamily,
      plotWidth: width,
      plotHeight: height,
      onReset: () => {
        this.resetState()
        this.draw()
      },
    })

    this.layout.allComponentsRegistered()
  }
}

OuterPlot.initClass()
module.exports = OuterPlot
