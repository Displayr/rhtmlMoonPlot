 /* global document */

import _ from 'lodash'
import * as d3 from 'd3'
import MoonPlotClass from './MoonPlotClass'
import buildConfig from './buildConfig'



class MoonPlot {
  static initClass () {
    this.widgetIndex = 0
    this.widgetName = 'moonPlot'
  }

  constructor () {
    this.id = `${MoonPlot.widgetName}-${MoonPlot.widgetIndex++}`
    this.init()
  }

  init () {
    this.state = {}
  }

  reset () {
    this.init()
  }

  setConfig (config) {
    this.config = buildConfig(config)
    console.log(this.config)
  }

  setUserState (userState = {}) {
    if (_.isUndefined(userState) || _.isNull(userState)) {
      this.state = {}
    } else {
      this.state = userState
    }
  }

  addStateListener () {
    console.log('addStateListener not implemented')
  }

  checkState () {
    console.log('checkState not implemented')
  }
  restoreState () {
    console.log('restoreState not implemented')
  }
  resetState () {
    console.log('resetState not implemented')
  }

  draw (rootElement) {
    const { width, height } = getContainerDimensions(_.has(rootElement, 'length') ? rootElement[0] : rootElement)

    this.baseSvg = d3.select(rootElement).append('svg')
      .attr('class', 'svgContent')
      .attr('width', width)
      .attr('height', height)

    this.plot = new MoonPlotClass(this.id, width, height)
    this.plot.draw(this.config, this.baseSvg)
  }
}
MoonPlot.initClass()
module.exports = MoonPlot

// TODO to utils
function getContainerDimensions(rootElement) {
  try {
    return rootElement.getBoundingClientRect()
  } catch (err) {
    err.message = `fail in getContainerDimensions: ${err.message}`
    throw err
  }
}