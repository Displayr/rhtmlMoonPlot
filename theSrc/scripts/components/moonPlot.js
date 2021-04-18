import _ from 'lodash'

import BaseComponent from './baseComponent'
import CorelLabels from './coreLabels'
import SurfacelLabels from './surfaceLabels'
import Circle from './circle'

const DEBUG = false

class MoonPlot extends BaseComponent {
  constructor ({ plotState, config, parentContainer }) {
    super()
    _.assign(this, { plotState, config, parentContainer })
  }

  draw (bounds) {
    this.element = this.parentContainer.append('g').attr('class', 'plot')
      .attr('transform', this.buildTransform(bounds))

    if (DEBUG) {
      this.element
        .append('rect')
        .style('stroke', 'black')
        .style('fill', 'none')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', bounds.width)
        .attr('height', bounds.height)
    }

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
      plotWidth: bounds.width,
      plotHeight: bounds.height,
      plotOffsetX: bounds.left, // TODO should not need to pass this, refactor this out
      plotOffsetY: bounds.top, // TODO should not need to pass this, refactor this out
      getLabels: plotState.getCoreLabels,
      moveLabel: plotState.moveCoreLabel,
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
      plotWidth: bounds.width,
      plotHeight: bounds.height,
      plotOffsetX: bounds.left, // TODO should not need to pass this, refactor this out
      plotOffsetY: bounds.top, // TODO should not need to pass this, refactor this out
      getLabels: plotState.getSurfaceLabels,
      moveLabel: plotState.moveSurfaceLabel,
    })

    this.circle = new Circle({
      parentContainer: element,
      circleColor: config.circleColor,
      crossColor: config.crossColor,
      circleStrokeWidth: config.circleStrokeWidth,
      circleDragAreaWidth: config.circleDragAreaWidth,
      center,
      radius,
      plotWidth: bounds.width,
      plotHeight: bounds.height,
      circleRadiusChanged: plotState.circleRadiusChanged,
    })

    this.circle.draw()
    this.coreLabels.draw()
    this.surfaceLabels.draw()
  }
}

module.exports = MoonPlot
