import _ from 'lodash'
import distanceFromCenter from './distanceFromCenter'

module.exports = (config) => {
  const normalizedCoreNodes = normalizeCoreNodes(config.lunarCoreNodes)
  const lunarSurfaceSizes = calculateSurfaceLabelSizes(config.lunarSurfaceNodes, 1.5, 0.5)
  const surfaceNodePositions = calculateSurfaceNodePositions(config.lunarSurfaceNodes)

  const lunarCoreLabels = _(normalizedCoreNodes)
    .map((node,i) => ({
      name: config.lunarCoreLabels[i],
      x: node[0],
      y: node[1]
    }))
    .value()

  const lunarSurfaceLabels = _(surfaceNodePositions)
    .map((node,i) => ({
      name: config.lunarSurfaceLabels[i],
      x: node[0],
      y: node[1],
      size: lunarSurfaceSizes[i]
    }))
    .value()

  return {
    lunarCoreLabels,
    lunarSurfaceLabels
  }
}

// normalization between -1 and 1 (padded by threshold)
const normalizeCoreNodes = (rawCoreNodes, threshold = 0.1) => {
  let maxDistanceFromCenter = _(rawCoreNodes)
    .map(node => distanceFromCenter(node[0], node[1]) * (1 + threshold))
    .max()

  return _(rawCoreNodes)
    .map(node => [node[0] / maxDistanceFromCenter, node[1] / maxDistanceFromCenter])
    .value()
}

// TODO scaleFactor, equalizeFactor to config
const calculateSurfaceLabelSizes = (rawSurfaceNodes, scaleFactor, equalizeFactor) => {
  const lunarSurfaceSizes = _(rawSurfaceNodes)
    .map(node => distanceFromCenter(node[0], node[1]))
    .value()
  let maxSize = _(lunarSurfaceSizes).max()

  return _(lunarSurfaceSizes)
    .map(s => scaleFactor * Math.pow((s / maxSize), equalizeFactor))
    .value()
}

const calculateSurfaceNodePositions = (rawSurfaceNodes) => {
  return _(rawSurfaceNodes)
    .map(node => Math.atan2(node[1], node[0]))
    .map(angle => [Math.cos(angle), Math.sin(angle)])
    .value()
}
