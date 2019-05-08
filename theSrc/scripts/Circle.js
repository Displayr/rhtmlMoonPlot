import {Drag} from './Drag'

class Circle {
  static drawCircle ({plotState, lunarCoreLabels, lunarSurfaceLabels, svg, cx, cy, height, width, circleColor, crossColor, textColor, circleStrokeWidth}) {
    this.drawCross(svg, cx, cy, crossColor)

    const moonDrag = Drag.setupMoonResize(lunarCoreLabels, lunarSurfaceLabels, svg, cx, cy, height, width, textColor, plotState)

    let moon = svg.append('circle')
                  .attr('cx', cx)
                  .attr('cy', cy)
                  .attr('r', plotState.getCircleRadius())
                  .attr('class', 'moon-circle')
                  .attr('stroke-width', circleStrokeWidth)
                  .attr('cursor', 'all-scroll')
                  .style('fill', 'none')
                  .style('stroke', circleColor)
                  .style('fill-opacity', 0.2)
                  .call(moonDrag)

    return moon
  }

  static drawCross (svg, x, y, crossColor) {
    const crossSize = 6
    const crossWidth = 1
    const centralCross = svg.append('g')
    centralCross.append('line')
                .attr('x1', x - crossSize)
                .attr('y1', y)
                .attr('x2', x + crossSize)
                .attr('y2', y)
                .attr('stroke-width', crossWidth)
                .attr('stroke', crossColor)
                .attr('class', 'core-cross')
    centralCross.append('line')
                .attr('x1', x)
                .attr('y1', y - crossSize)
                .attr('x2', x)
                .attr('y2', y + crossSize)
                .attr('stroke-width', crossWidth)
                .attr('stroke', crossColor)
                .attr('class', 'core-cross')
  }
}

module.exports = Circle
