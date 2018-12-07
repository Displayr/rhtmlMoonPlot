import * as d3 from 'd3'
import Utils from './Utils'
import {LunarSurface} from './LunarSurface'
import {LunarCore} from './LunarCore'
import Circle from './Circle'

class MoonPlotClass {
  constructor (id, width, height) {
    this.width = width
    this.height = height
    this.id = id
  }

  draw (data, el) {
    Utils.normalizeCoreNodes(data.lunarCoreNodes)
    const lunarSurfaceSizes = Utils.calculateSurfaceLabelSizes(data.lunarSurfaceNodes, 1.5, 0.5)
    Utils.calculateSurfaceNodePositions(data.lunarSurfaceNodes)
    const lunarCoreLabels = []
    const lunarSurfaceLabels = []
    let i = 0
    while (i < data.lunarCoreLabels.length) {
      lunarCoreLabels.push({
        name: data.lunarCoreLabels[i],
        x: data.lunarCoreNodes[i][0],
        y: data.lunarCoreNodes[i][1]
      })
      i++
    }
    i = 0
    while (i < data.lunarSurfaceLabels.length) {
      lunarSurfaceLabels.push({
        name: data.lunarSurfaceLabels[i],
        x: data.lunarSurfaceNodes[i][0],
        y: data.lunarSurfaceNodes[i][1],
        size: lunarSurfaceSizes[i]
      })
      i++
    }
    this.data = {
      lunarSurfaceLabels: lunarSurfaceLabels,
      lunarCoreLabels: lunarCoreLabels
    }

    // ----------------------------------------------
    // d3.selectAll(`#${this.id}`).remove()
    // const svg = d3.select(el)
    //               .append('svg')
    //               .attr('width', this.width)
    //               .attr('height', this.height)
    //               .attr('class', 'moonplot-container')
    const svg = d3.select(`#${this.id}`)
    const xCenter = this.width / 2
    const yCenter = this.height / 2
    const radius = Math.min(this.height, this.width) / 3

    // Styling
    this.textColor = '#333333'
    this.circleColor = '#042a4b'
    this.crossColor = 'grey'
    this.linkWidth = 1

    Circle.drawCircle(this.data, svg, xCenter, yCenter, radius, this.height, this.width, this.circleColor, this.crossColor, this.textColor)
    LunarCore.drawLunarCoreLabels(this.data.lunarCoreLabels, svg, xCenter, yCenter, radius, this.textColor, this.linkWidth)
    LunarSurface.drawLunarSurfaceLabels(this.data.lunarSurfaceLabels, svg, xCenter, yCenter, radius, this.height, this.width, this.textColor, 14)
  }

  redraw (width, height, el) {
    this.width = width
    this.height = height
    d3.select('.moonplot-container').remove()
    return this.draw(this.data, el)
  }
}

module.exports = MoonPlotClass
