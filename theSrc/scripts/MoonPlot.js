 /* global document */

import _ from 'lodash'
import * as d3 from 'd3'
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

    const baseSvg = d3.select(rootElement).append('svg')
      .attr('class', 'svgContent')
      .attr('width', width)
      .attr('height', height)

    const xCenter = width / 2
    const yCenter = height / 2
    const radius = Math.min(height, width) / 3 // TODO move to config

    Circle.drawCircle(this.config, baseSvg, xCenter, yCenter, radius, height, width, this.config.circleColor, this.config.crossColor, this.config.textColor)
    LunarCore.drawLunarCoreLabels(this.config.lunarCoreLabels, baseSvg, xCenter, yCenter, radius, this.config.textColor, this.config.linkWidth)
    LunarSurface.drawLunarSurfaceLabels(this.config.lunarSurfaceLabels, baseSvg, xCenter, yCenter, radius, height, width, this.config.textColor, this.config.labelSizeConst)
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
