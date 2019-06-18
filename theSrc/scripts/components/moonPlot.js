import _ from 'lodash'

import BaseComponent from './baseComponent'
import CorelLabels from './coreLabels'
import SurfacelLabels from './surfaceLabels'
import Circle from './circle'

class MoonPlot extends BaseComponent {
  constructor ({ plotState, config, parentContainer }) {
    super()
    _.assign(this, { plotState, config, parentContainer })
  }

  draw (bounds) {
    this.element = this.parentContainer.append('g').attr('class', 'plot')
      .attr('transform', this.buildTransform(bounds))

    const center = { x: bounds.width / 2, y: bounds.height / 2 }
    const radius = this.plotState.getCircleRadius()
    const { plotState, config, element } = this

    this.coreLabels = new CorelLabels({
      parentContainer: element,
      fontFamily: config.coreLabelFontFamily,
      fontSize: config.coreLabelFontSize,
      fontColor: config.coreLabelFontColor,
      fontSelectedColor: config.coreLabelFontSelectedColor,
      linkWidth: config.linkWidth,
      linkColor: config.linkColor,
      center,
      radius,
      getLabels: plotState.getCoreLabels,
      moveLabel: plotState.moveCoreLabel
    })

    this.surfaceLabels = new SurfacelLabels({
      parentContainer: element,
      fontFamily: config.surfaceLabelFontFamily,
      fontSize: config.surfaceLabelFontBaseSize,
      fontColor: config.surfaceLabelFontColor,
      fontSelectedColor: config.surfaceLabelFontSelectedColor,
      linkWidth: config.linkWidth,
      linkColor: config.linkColor,
      center,
      width: bounds.width,
      height: bounds.height,
      getLabels: plotState.getSurfaceLabels,
      moveLabel: plotState.moveSurfaceLabel
    })

    this.circle = new Circle({
      parentContainer: element,
      circleColor: config.circleColor,
      crossColor: config.crossColor,
      circleStrokeWidth: config.circleStrokeWidth,
      circleDragAreaWidth: config.circleDragAreaWidth,
      center,
      radius,
      width: bounds.width,
      height: bounds.height,
      circleRadiusChanged: plotState.circleRadiusChanged
    })

    this.circle.draw()
    this.coreLabels.draw()
    this.surfaceLabels.draw()
  }
}

module.exports = MoonPlot
