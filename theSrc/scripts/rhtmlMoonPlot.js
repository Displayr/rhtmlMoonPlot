/* global HTMLWidgets */

import 'babel-polyfill'
import widgetFactory from './rhtmlMoonPlot.factory'

console.log('spot 1')
HTMLWidgets.widget({
  name: 'rhtmlMoonPlot',
  type: 'output',
  factory: widgetFactory
})
