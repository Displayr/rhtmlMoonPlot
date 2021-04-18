/* global HTMLWidgets */

import 'babel-polyfill'
import widgetFactory from './rhtmlMoonPlot.factory'

HTMLWidgets.widget({
  name: 'rhtmlMoonPlot',
  type: 'output',
  factory: widgetFactory,
})
