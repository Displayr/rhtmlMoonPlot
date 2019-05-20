import _ from 'lodash'
import * as d3 from 'd3'
import distanceFromCenter from '../math/distanceFromCenter'

class Circle {
  constructor ({parentContainer, plotState, circleColor, crossColor, circleStrokeWidth, circleDragAreaWidth}) {
    _.assign(this, {parentContainer, plotState, circleColor, crossColor, circleStrokeWidth, circleDragAreaWidth})
  }

  draw () {
    const crossSize = 6
    const crossWidth = 1
    const center = this.plotState.getCenter()

    const centralCross = this.parentContainer.append('g')
    centralCross.append('line')
      .attr('class', 'core-cross')
      .attr('x1', center.x - crossSize)
      .attr('y1', center.y)
      .attr('x2', center.x + crossSize)
      .attr('y2', center.y)
      .attr('stroke-width', crossWidth)
      .attr('stroke', this.crossColor)

    centralCross.append('line')
      .attr('class', 'core-cross')
      .attr('x1', center.x)
      .attr('y1', center.y - crossSize)
      .attr('x2', center.x)
      .attr('y2', center.y + crossSize)
      .attr('stroke-width', crossWidth)
      .attr('stroke', this.crossColor)

    this.parentContainer.append('circle')
      .attr('cx', center.x)
      .attr('cy', center.y)
      .attr('r', this.plotState.getCircleRadius())
      .attr('class', 'moon-circle')
      .attr('stroke-width', this.circleStrokeWidth)
      .style('fill', 'none')
      .style('stroke', this.circleColor)

    // NB the drag circle is not visible, but creates a larger click surface to initiate circle resizing
    this.parentContainer.append('circle')
      .attr('cx', center.x)
      .attr('cy', center.y)
      .attr('r', this.plotState.getCircleRadius())
      .attr('stroke-width', this.circleDragAreaWidth)
      .attr('class', 'drag-circle')
      .attr('cursor', 'all-scroll')
      .style('fill', 'none')
      .style('stroke', 'transparent')
      .call(this.setupDrag())
  }

  setupDrag () {
    const { parentContainer, plotState } = this
    const center = this.plotState.getCenter()

    const dragMove = function () {
      const [mouseX, mouseY] = d3.mouse(this)
      const newRadius = distanceFromCenter(center.x - mouseX, center.y - mouseY)
      parentContainer.select('.drag-circle').attr('r', newRadius)
      parentContainer.select('.moon-circle').attr('r', newRadius)
    }

    const dragStart = function () {
      // TODO remove this coupling ?
      parentContainer.selectAll('.core-link').remove()
      parentContainer.selectAll('.core-label').remove()
      parentContainer.selectAll('.core-anchor').remove()
      parentContainer.selectAll('.surface-link').remove()
      parentContainer.selectAll('.surface-label').remove()
    }

    const dragEnd = function () {
      const [mouseX, mouseY] = d3.mouse(this)
      const newRadius = distanceFromCenter(center.x - mouseX, center.y - mouseY)
      plotState.circleRadiusChanged(newRadius)
    }

    return d3.drag()
      .on('start', dragStart)
      .on('drag', dragMove)
      .on('end', dragEnd)
  }
}

module.exports = Circle
