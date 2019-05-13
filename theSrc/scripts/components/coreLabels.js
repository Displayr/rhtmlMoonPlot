import _ from 'lodash'
import * as d3 from 'd3'
import 'd3-transition'
import {getLabelAnchorPoint} from '../labellers/coreLabeller'

export class CoreLabels {
  constructor ({ parentContainer, plotState, cx, cy, fontFamily, fontSize, fontColor, fontSelectedColor, linkWidth, linkColor }) {
    _.assign(this, { parentContainer, plotState, cx, cy, fontFamily, fontSize, fontColor, fontSelectedColor, linkWidth, linkColor })
  }

  draw () {
    this.anchorSelection = this.parentContainer.selectAll('.core-anchor')
    this.anchorSelection
      .data(this.plotState.getCoreLabels())
      .enter()
      .append('circle')
      .attr('stroke-width', 3)
      .attr('class', 'core-anchor')
      .attr('fill', 'black')
      .attr('data-id', d => d.id)
      .attr('data-label', d => d.name)
      .attr('cx', d => d.anchor.x)
      .attr('cy', d => d.anchor.y)
      .attr('r', d => d.anchor.r)

    this.linkSelection = this.parentContainer.selectAll('.core-link')
    this.linkSelection
      .data(this.plotState.getCoreLabels())
      .enter()
      .append('line')
      .attr('x1', d => d.anchor.x)
      .attr('y1', d => d.anchor.y)
      // TODO labelLineConnector might be null, in which case we dont want to show the line,
      // but I do want to create the line, in case the user drags the label and I need to show the line
      // the current implementation of this behaviour is a little dodgy
      .attr('x2', d => _.get(d, 'labelLineConnector.x',d.anchor.x))
      .attr('y2', d => _.get(d, 'labelLineConnector.y',d.anchor.y))
      .attr('data-id', d => d.id)
      .attr('data-label', d => d.name)
      .attr('class', 'core-link')
      .attr('stroke-width', this.linkWidth)
      .attr('stroke', this.linkColor)
      .attr('opacity', d => _.isNull(d.labelLineConnector) ? 0 : 1)

    this.labelSelection = this.parentContainer.selectAll('.core-label')
    this.labelSelection
      .data(this.plotState.getCoreLabels())
      .enter()
      .append('text')
      .style('fill', this.fontColor)
      .attr('class', 'core-label')
      .attr('x', d => d.label.x)
      .attr('y', d => d.label.y)
      .attr('data-id', d => d.id)
      .attr('data-label', d => d.name)
      .attr('cursor', 'all-scroll')
      .attr('text-anchor', 'middle')
      .style('font-family', this.fontFamily)
      .style('font-size', this.fontSize)
      .text(d => d.name)
      .call(this.setupDrag())
      .append('title').text(d => d.name)

    this.adjustLabelLengths()
  }

  adjustLabelLengths () {
    this.plotState.getCoreLabels().forEach(({id}) => this.adjustLabelLength(id))
  }

  // TODO needs a cleanup
  adjustLabelLength (id) {
    const radius = this.plotState.getCircleRadius()
    const detectCoreLabelBoundaryCollision = (label)  => {
      const labelBb = label.getBBox()
      const yRightB = labelBb.y
      const yRightT = labelBb.y + (labelBb.height / 2)
      const xRight = labelBb.x + labelBb.width

      // Calculate circle boundary using parametric eq for circle
      const angleB = Math.asin((yRightB - this.cy) / radius)
      const angleT = Math.asin((yRightT - this.cy) / radius)
      const circleBoundaryRightB = this.cx + (radius * Math.cos(angleB))
      const circleBoundaryRightT = this.cx + (radius * Math.cos(angleT))

      return (circleBoundaryRightB < xRight) || (circleBoundaryRightT < xRight)
    }

    const label = this.parentContainer
      .select(`.core-label[data-id='${id}']`)
      .node()

    // restore full text first
    d3.select(label).text(d3.select(label).data()[0].name)

    let text = d3.select(label).node().textContent
    let truncated = false
    while (detectCoreLabelBoundaryCollision(label) && text.length > 0) {
      truncated = true
      text = d3.select(label).node().textContent
      d3.select(label).text(text.slice(0, -1))
    }
    if (truncated) {
      text = d3.select(label).node().textContent
      d3.select(label).text(text.slice(0, -3) + '...')
      d3.select(label).data()[0].width = label.getBBox().width
    }
  }

  setupDrag () {
    const { fontColor, fontSelectedColor, plotState, parentContainer } = this
    const adjustLabelLength = this.adjustLabelLength.bind(this)
    
    const dragStart = function (d) {
      parentContainer.selectAll(`.core-link[data-id='${d.id}']`).attr('opacity', 0)
      d3.select(this).style('fill', fontSelectedColor)
    }

    const dragMove = function (d) {
      d3.select(this)
        .attr('x', d3.event.x)
        .attr('y', d3.event.y)
        .attr('cursor', 'all-scroll')

      d.label.x = d3.event.x
      d.label.y = d3.event.y
    }

    const dragEnd = function (d) {
      d3.select(this).style('fill', fontColor)

      const allTheAnchors = _(plotState.getCoreLabels()).map('anchor').value()
      const labelLineConnector = getLabelAnchorPoint(d.label, d.anchor, d.name, allTheAnchors)
      d.labelLineConnector = labelLineConnector

      parentContainer.selectAll(`.core-link[data-id='${d.id}']`)
        .attr('x2', _.get(d, 'labelLineConnector.x',d.anchor.x))
        .attr('y2', _.get(d, 'labelLineConnector.y',d.anchor.y))
        .attr('opacity', _.isNull(d.labelLineConnector) ? 0 : 1)

      adjustLabelLength(d.id)
      plotState.moveCoreLabel(d.id, d.label)
    }

    return d3.drag()
      .on('start', dragStart)
      .on('drag', dragMove)
      .on('end', dragEnd)
  }
}

module.exports = CoreLabels
