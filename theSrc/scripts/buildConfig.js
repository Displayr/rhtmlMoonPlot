import _ from 'lodash'

const defaultConfig = {
  coreLabelFontFamily: 'sans-serif',
  coreLabelFontSize: 14,
  coreLabelFontColor: '#333333',
  coreLabelFontSelectedColor: '#0000dd',
  coreLabelMinimumLabelDistance: 7,
  surfaceLabelFontFamily: 'sans-serif',
  surfaceLabelFontSize: 14,
  surfaceLabelFontColor: '#333333',
  surfaceLabelFontSelectedColor: '#0000dd',
  surfaceLabelMinimumLabelDistance: 15,
  surfaceLabelRadialPadding: 3,
  circleStrokeWidth: 1,
  circleColor: '#042a4b',
  crossColor: 'grey',
  linkColor: 'grey',
  linkWidth: 1
}



function buildConfig (userConfig) {
  return _.merge({}, defaultConfig, userConfig)
}

module.exports = buildConfig
