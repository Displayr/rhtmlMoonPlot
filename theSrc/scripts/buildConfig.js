import _ from 'lodash'

const defaultConfig = {
  circleColor: '#042a4b',
  circleDragAreaWidth: 8,
  circleStrokeWidth: 1,
  coreLabelFontColor: '#333333',
  coreLabelFontFamily: 'sans-serif',
  coreLabelFontSelectedColor: '#333333',
  coreLabelFontSize: 14,
  coreLabelMinimumLabelDistance: 7,
  crossColor: 'grey',
  footerFontColor: '#000000',
  footerFontFamily: 'sans-serif',
  footerFontSize: 11,
  linkColor: 'grey',
  linkWidth: 1,
  subtitleFontColor: '#000000',
  subtitleFontFamily: 'sans-serif',
  subtitleFontSize: 18,
  surfaceLabelFontBaseSize: 14,
  surfaceLabelFontColor: '#333333',
  surfaceLabelFontFamily: 'sans-serif',
  surfaceLabelFontSelectedColor: '#333333',
  surfaceLabelMinimumLabelDistance: 15,
  surfaceLabelRadialPadding: 3,
  titleFontColor: '#000000',
  titleFontFamily: 'sans-serif',
  titleFontSize: 24,
}

function buildConfig (userConfig) {
  return _.merge({}, defaultConfig, userConfig)
}

module.exports = buildConfig
