import _ from 'lodash'

const defaultConfig = {
  coreLabelFontFamily: 'sans-serif',
  coreLabelFontSize: 14,
  coreLabelFontColor: '#333333',
  coreLabelFontSelectedColor: '#0000dd',
  surfaceLabelFontFamily: 'sans-serif',
  surfaceLabelFontSize: 14,
  surfaceLabelFontColor: '#333333',
  surfaceLabelFontSelectedColor: '#0000dd',
  circleStrokeWidth: 4,
  circleColor: '#042a4b',
  crossColor: 'grey',
  linkColor: 'grey',
  linkWidth: 1,
  labelSizeConst: 14
}



function buildConfig (userConfig) {
  return _.merge({}, defaultConfig, userConfig)
}

module.exports = buildConfig
