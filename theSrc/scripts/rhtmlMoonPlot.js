/* global HTMLWidgets */

import 'babel-polyfill'
// TEMPLATE! - update the template name below. Rename this file to match your widget name.
//  -In theory you dont ned to change anything else, but you can at your own discretion
import widgetFactory from './rhtmlMoonPlot.factory'

HTMLWidgets.widget({
  name: 'rhtmlMoonPlot',
  type: 'output',
  factory: widgetFactory
})
