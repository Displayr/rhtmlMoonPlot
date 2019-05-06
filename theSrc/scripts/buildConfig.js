import _ from 'lodash'
import buildLabelObjectsFromConfig from './math/buildLabelObjectsFromConfig'

const defaultConfig = {
  lunarCoreNodes: [],
  lunarSurfaceNodes: [],
  lunarCoreLabels: [],
  lunarSurfaceLabels: [],
  textColor: '#333333',
  circleColor: '#042a4b',
  crossColor: 'grey',
  linkWidth: 1,
  labelSizeConst: 14
}

// TODO check array length matches surface(node v label) core(node v label)

const configArrayFields = ['lunarCoreNodes', 'lunarSurfaceNodes', 'lunarCoreLabels', 'lunarSurfaceLabels']

function buildConfig (userConfig) {
  _(configArrayFields).each(requiredArray => {
    if (!_.has(userConfig, requiredArray)) { throw new Error(`Invalid config. Missing ${requiredArray}`) }
    if (!_.isArray(userConfig[requiredArray])) { throw new Error(`Invalid config. ${requiredArray} must be array`) }
  })

  if (userConfig.lunarCoreNodes.length !== userConfig.lunarCoreLabels.length) {
    throw new Error('Invalid config. length(lunarCoreNodes) != length(lunarCoreLabels)')
  }

  if (userConfig.lunarSurfaceNodes.length !== userConfig.lunarSurfaceLabels.length) {
    throw new Error('Invalid config. length(lunarSurfaceNodes) != length(lunarSurfaceLabels)')
  }

  return _.merge({}, defaultConfig, _.omit(userConfig, configArrayFields), buildLabelObjectsFromConfig(userConfig))
}

module.exports = buildConfig
