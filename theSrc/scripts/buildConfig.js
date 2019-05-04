import _ from 'lodash'

const defaultConfig = {
  lunarCoreNodes: [],
  lunarSurfaceNodes: [],
  lunarCoreLabels: [],
  lunarSurfaceLabels: []
}

function buildConfig (userConfig) {
  const config = _.merge({}, defaultConfig, userConfig)
  if (_.isNull(config.prefix)) { config.prefix = '' }
  if (_.isNull(config.suffix)) { config.suffix = '' }
  return config
}

module.exports = buildConfig
