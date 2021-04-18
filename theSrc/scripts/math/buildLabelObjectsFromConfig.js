import _ from 'lodash'
import distanceFromCenter from './distanceFromCenter'

// TODO check array length matches surface(node v label) core(node v label)
const configArrayFields = ['coreNodes', 'surfaceNodes', 'coreLabels', 'surfaceLabels']

module.exports = (config) => {
  _(configArrayFields).each(requiredArray => {
    if (!_.has(config, requiredArray)) { throw new Error(`Invalid config. Missing ${requiredArray}`) }
    if (!_.isArray(config[requiredArray])) { throw new Error(`Invalid config. ${requiredArray} must be array`) }
  })

  if (config.coreNodes.length !== config.coreLabels.length) {
    throw new Error('Invalid config. length(coreNodes) != length(coreLabels)')
  }

  if (config.surfaceNodes.length !== config.surfaceLabels.length) {
    throw new Error('Invalid config. length(surfaceNodes) != length(surfaceLabels)')
  }

  const normalizedCoreNodes = normalizeCoreNodes(config.coreNodes)
  const surfaceSizes = calculateSurfaceLabelSizes(config.surfaceNodes, 1.5, 0.5)
  const surfaceNodePositions = calculateSurfaceNodePositions(config.surfaceNodes)

  const coreLabels = _(normalizedCoreNodes)
    .map((node, i) => ({
      id: i,
      name: config.coreLabels[i],
      x: node[0],
      y: node[1],
    }))
    .value()

  const surfaceLabels = _(surfaceNodePositions)
    .map((node, i) => ({
      id: i,
      name: config.surfaceLabels[i],
      x: node[0],
      y: node[1],
      size: surfaceSizes[i],
    }))
    .value()

  return {
    coreLabels,
    surfaceLabels,
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
  const surfaceSizes = _(rawSurfaceNodes)
    .map(node => distanceFromCenter(node[0], node[1]))
    .value()
  let maxSize = _(surfaceSizes).max()

  return _(surfaceSizes)
    .map(s => scaleFactor * Math.pow((s / maxSize), equalizeFactor))
    .value()
}

const calculateSurfaceNodePositions = (rawSurfaceNodes) => {
  return _(rawSurfaceNodes)
    .map(node => Math.atan2(node[1], node[0]))
    .map(angle => [Math.cos(angle), Math.sin(angle)])
    .value()
}
