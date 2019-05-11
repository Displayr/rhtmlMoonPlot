import _ from 'lodash'

class Circle {
  constructor ({ parentContainer, plotState, cx, cy, circleColor, crossColor, circleStrokeWidth}) {
    _.assign(this, {parentContainer, plotState, cx, cy, circleColor, crossColor, circleStrokeWidth})
  }

  draw () {
    const crossSize = 6
    const crossWidth = 1

    const centralCross = this.parentContainer.append('g')
    centralCross.append('line')
      .attr('class', 'core-cross')
      .attr('x1', this.cx - crossSize)
      .attr('y1', this.cy)
      .attr('x2', this.cx + crossSize)
      .attr('y2', this.cy)
      .attr('stroke-width', crossWidth)
      .attr('stroke', this.crossColor)

    centralCross.append('line')
      .attr('class', 'core-cross')
      .attr('x1', this.cx)
      .attr('y1', this.cy - crossSize)
      .attr('x2', this.cx)
      .attr('y2', this.cy + crossSize)
      .attr('stroke-width', crossWidth)
      .attr('stroke', this.crossColor)

    this.parentContainer.append('circle')
      .attr('cx', this.cx)
      .attr('cy', this.cy)
      .attr('r', this.plotState.getCircleRadius())
      .attr('class', 'moon-circle')
      .attr('stroke-width', this.circleStrokeWidth)
      .attr('cursor', 'all-scroll')
      .style('fill', 'none')
      .style('stroke', this.circleColor)
      .style('fill-opacity', 0.2) // TODO do I need this ?
      // .call(moonDrag)
  }
}

module.exports = Circle
