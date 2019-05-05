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

  draw (data, baseSvg) {
    Utils.normalizeCoreNodes(data.lunarCoreNodes)
    const lunarSurfaceSizes = Utils.calculateSurfaceLabelSizes(data.lunarSurfaceNodes, 1.5, 0.5)
    Utils.calculateSurfaceNodePositions(data.lunarSurfaceNodes)
    const lunarCoreLabels = []
    const lunarSurfaceLabels = []

    // TODO unwhile this. Maybe move to build config
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

    const xCenter = this.width / 2
    const yCenter = this.height / 2
    const radius = Math.min(this.height, this.width) / 3

    // Styling
    this.textColor = '#333333'
    this.circleColor = '#042a4b'
    this.crossColor = 'grey'
    this.linkWidth = 1

    Circle.drawCircle(this.data, baseSvg, xCenter, yCenter, radius, this.height, this.width, this.circleColor, this.crossColor, this.textColor)
    LunarCore.drawLunarCoreLabels(this.data.lunarCoreLabels, baseSvg, xCenter, yCenter, radius, this.textColor, this.linkWidth)
    LunarSurface.drawLunarSurfaceLabels(this.data.lunarSurfaceLabels, baseSvg, xCenter, yCenter, radius, this.height, this.width, this.textColor, 14)
  }
}

module.exports = MoonPlotClass
