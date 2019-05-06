import _ from 'lodash'

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

function buildConfig (userConfig) {
  const config = _.merge({}, defaultConfig, userConfig)

  if (_.has(config, 'lunarCoreNodes') && _.has(config, 'lunarSurfaceNodes') && _.has(config, 'lunarCoreLabels') && _.has(config, 'lunarSurfaceLabels')) {
    if (!_.isArray(config.lunarCoreNodes)) {
      throw new Error('Invalid config. \'lunarCoreNodes\' must be array')
    }

    if (!_.isArray(config.lunarSurfaceNodes)) {
      throw new Error('Invalid config. \'lunarSurfaceNodes\' must be array')
    }

    if (!_.isArray(config.lunarCoreLabels)) {
      throw new Error('Invalid config. \'lunarCoreLabels\' must be array')
    }

    if (!_.isArray(config.lunarSurfaceLabels)) {
      throw new Error('Invalid config. \'lunarSurfaceLabels\' must be array')
    }
  } else {
    throw new Error('Invalid config. Missing data array')
  }

  return config
}

module.exports = buildConfig
