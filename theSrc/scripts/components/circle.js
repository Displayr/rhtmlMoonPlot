import _ from 'lodash'
import * as d3 from "d3";
import distanceFromCenter from '../math/distanceFromCenter'

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
      .call(this.setupDrag())
  }

  setupDrag () {
    const { parentContainer, plotState, cx, cy } = this
    const dragMove = function () {
      const [mouseX,mouseY] = d3.mouse(this) // NB deliberate d3.mouse vs d3.event. Not sure why yet ...
      d3.select(this).attr('r', distanceFromCenter(cx - mouseX, cy - mouseY))
    }

    const dragStart = function () {
      console.log(`start dragging circle. Moon size is r=${plotState.getCircleRadius()}`)
      // TODO remove this coupling ?
      parentContainer.selectAll('.core-link').remove()
      parentContainer.selectAll('.core-label').remove()
      parentContainer.selectAll('.core-anchor').remove()
      parentContainer.selectAll('.surface-link').remove()
      parentContainer.selectAll('.surface-label').remove()
    }

    const dragEnd = function () {

      const [mouseX,mouseY] = d3.mouse(this) // NB deliberate d3.mouse vs d3.event. Not sure why yet ...
      const newRadius = distanceFromCenter(cx - mouseX, cy - mouseY)
      plotState.circleRadiusChanged(newRadius)
      console.log(`end circle drag. Moon resized to r=${newRadius}`)
    }

    return d3.drag()
      .on('start', dragStart)
      .on('drag', dragMove)
      .on('end', dragEnd)
  }
}

module.exports = Circle
