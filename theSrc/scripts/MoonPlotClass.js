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

  draw (config, baseSvg) {
    Utils.normalizeCoreNodes(config.lunarCoreNodes)
    const lunarSurfaceSizes = Utils.calculateSurfaceLabelSizes(config.lunarSurfaceNodes, 1.5, 0.5)
    Utils.calculateSurfaceNodePositions(config.lunarSurfaceNodes)
    const lunarCoreLabels = []
    const lunarSurfaceLabels = []

    // TODO unwhile this. Maybe move to build config
    let i = 0
    while (i < config.lunarCoreLabels.length) {
      lunarCoreLabels.push({
        name: config.lunarCoreLabels[i],
        x: config.lunarCoreNodes[i][0],
        y: config.lunarCoreNodes[i][1]
      })
      i++
    }
    i = 0
    while (i < config.lunarSurfaceLabels.length) {
      lunarSurfaceLabels.push({
        name: config.lunarSurfaceLabels[i],
        x: config.lunarSurfaceNodes[i][0],
        y: config.lunarSurfaceNodes[i][1],
        size: lunarSurfaceSizes[i]
      })
      i++
    }
    const data = {
      lunarSurfaceLabels: lunarSurfaceLabels,
      lunarCoreLabels: lunarCoreLabels
    }

    const xCenter = this.width / 2
    const yCenter = this.height / 2
    const radius = Math.min(this.height, this.width) / 3

    Circle.drawCircle(data, baseSvg, xCenter, yCenter, radius, this.height, this.width, config.circleColor, config.crossColor, config.textColor)
    LunarCore.drawLunarCoreLabels(data.lunarCoreLabels, baseSvg, xCenter, yCenter, radius, config.textColor, config.linkWidth)
    LunarSurface.drawLunarSurfaceLabels(data.lunarSurfaceLabels, baseSvg, xCenter, yCenter, radius, this.height, this.width, config.textColor, config.labelSizeConst)
  }
}

module.exports = MoonPlotClass
