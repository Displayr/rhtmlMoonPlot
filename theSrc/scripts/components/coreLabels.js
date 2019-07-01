import _ from 'lodash'
import * as d3 from 'd3'
import 'd3-transition'
import { getLabelAnchorPoint } from '../labellers/coreLabeller'
import getScreenCoords from '../math/getScreenCoords'
import detectViewportCollision from '../math/detectViewportCollision'

export class CoreLabels {
  constructor ({ parentContainer, fontFamily, fontSize, fontColor, fontSelectedColor, linkWidth, linkColor, getLabels, moveLabel, center, radius, plotWidth, plotHeight, plotOffsetX, plotOffsetY }) {
    _.assign(this, { parentContainer, fontFamily, fontSize, fontColor, fontSelectedColor, linkWidth, linkColor, getLabels, moveLabel, center, radius, plotWidth, plotHeight, plotOffsetX, plotOffsetY })
  }

  draw () {
    this.parentContainer.selectAll('.core-anchor')
      .data(this.getLabels())
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

    this.parentContainer.selectAll('.core-link')
      .data(this.getLabels())
      .enter()
      .append('line')
      .attr('x1', d => d.anchor.x)
      .attr('y1', d => d.anchor.y)
      // NB On labelLineConnector value
      // labelLineConnector might be null, in which case we dont want to show the line.
      // But I do want to create the line regardless : when use drags label, I may need line.
      // I dont want to deal with conditional line creation at label drag time; at drag time I just want to assume there is a line and change it's coords.
      // So create it now, even tho it might be a zero length line
      .attr('x2', d => _.get(d, 'labelLineConnector.x', d.anchor.x))
      .attr('y2', d => _.get(d, 'labelLineConnector.y', d.anchor.y))
      .attr('data-id', d => d.id)
      .attr('data-label', d => d.name)
      .attr('class', 'core-link')
      .attr('stroke-width', this.linkWidth)
      .attr('stroke', this.linkColor)
      .attr('opacity', d => _.isNull(d.labelLineConnector) ? 0 : 1)

    this.parentContainer.selectAll('.core-label')
      .data(this.getLabels())
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

    this.getLabels().forEach(({ id }) => this.adjustLabelLength(id))
  }

  // TODO needs a cleanup:
  // * truncate code probably takes more than it needs as ... is shorter than most 3 letter combos
  adjustLabelLength (id) {
    const label = this.parentContainer
      .select(`.core-label[data-id='${id}']`)
      .node()

    // restore full text first
    d3.select(label).text(d3.select(label).data()[0].name)

    let text = d3.select(label).node().textContent
    let truncated = false
    const { plotWidth, plotHeight, plotOffsetX, plotOffsetY } = this
    while (detectViewportCollision({ label, plotWidth, plotHeight, plotOffsetX, plotOffsetY }) && text.length > 0) {
      truncated = true
      text = d3.select(label).node().textContent
      d3.select(label).text(text.slice(0, -1))
    }
    if (truncated) {
      text = d3.select(label).node().textContent
      d3.select(label)
        .text(text.slice(0, -3) + '...')
        .append('title')
        .text(d => d.name)
    }
  }

  setupDrag () {
    const { fontColor, fontSelectedColor, getLabels, moveLabel, parentContainer, plotWidth, plotHeight, plotOffsetX, plotOffsetY } = this
    const adjustLabelLength = this.adjustLabelLength.bind(this)
    let mouseOffsetRelativeToLabelAnchor = { x: 0, y: 0 }
    let distanceFromMouseToLabelEdge = { right: 0, left: 0, top: 0, bottom: 0 }

    const getNewLabelAnchor = (mouse) => {
      const remainingSpaceToLeft = (mouse.x - distanceFromMouseToLabelEdge.left)
      const remainingSpaceToRight = plotWidth - (mouse.x + distanceFromMouseToLabelEdge.right)
      const remainingSpaceToTop = (mouse.y - distanceFromMouseToLabelEdge.top)
      const remainingSpaceToBottom = plotHeight - (mouse.y + distanceFromMouseToLabelEdge.bottom)

      const newAnchor = {
        x: mouse.x - mouseOffsetRelativeToLabelAnchor.x,
        y: mouse.y - mouseOffsetRelativeToLabelAnchor.y
      }

      if (remainingSpaceToLeft < 0) { newAnchor.x += Math.abs(remainingSpaceToLeft) }
      if (remainingSpaceToRight < 0) { newAnchor.x -= Math.abs(remainingSpaceToRight) }
      if (remainingSpaceToTop < 0) { newAnchor.y += Math.abs(remainingSpaceToTop) }
      if (remainingSpaceToBottom < 0) { newAnchor.y -= Math.abs(remainingSpaceToBottom) }

      return newAnchor
    }

    const dragStart = function (d) {
      parentContainer.selectAll(`.core-link[data-id='${d.id}']`).attr('opacity', 0)

      const label = d3.select(this)
      label.style('fill', fontSelectedColor)

      const labelNode = d3.select(this).node()
      const box = labelNode.getBBox()
      const ctm = labelNode.getCTM()
      const transformedCoords = getScreenCoords(box, ctm)

      distanceFromMouseToLabelEdge.left = (plotOffsetX + d3.event.x) - transformedCoords.x
      distanceFromMouseToLabelEdge.right = box.width - distanceFromMouseToLabelEdge.left
      distanceFromMouseToLabelEdge.top = (plotOffsetY + d3.event.y) - transformedCoords.y
      distanceFromMouseToLabelEdge.bottom = box.height - distanceFromMouseToLabelEdge.top
      mouseOffsetRelativeToLabelAnchor.x = (plotOffsetX + d3.event.x) - (transformedCoords.x + box.width / 2)
      mouseOffsetRelativeToLabelAnchor.y = (plotOffsetY + d3.event.y) - (transformedCoords.y + box.height / 2)
    }

    const dragMove = function (d) {
      const newAnchor = getNewLabelAnchor({ x: d3.event.x, y: d3.event.y })

      d3.select(this)
        .attr('x', newAnchor.x)
        .attr('y', newAnchor.y)
        .attr('cursor', 'all-scroll')

      d.label.x = newAnchor.x
      d.label.y = newAnchor.y
    }

    const dragEnd = function (d) {
      d3.select(this).style('fill', fontColor)

      const allTheAnchors = _(getLabels()).map('anchor').value()
      const labelLineConnector = getLabelAnchorPoint(d.label, d.anchor, d.name, allTheAnchors)
      d.labelLineConnector = labelLineConnector

      // NB see "On labelLineConnector value" comment above
      parentContainer.selectAll(`.core-link[data-id='${d.id}']`)
        .attr('x2', _.get(d, 'labelLineConnector.x', d.anchor.x))
        .attr('y2', _.get(d, 'labelLineConnector.y', d.anchor.y))
        .attr('opacity', _.isNull(d.labelLineConnector) ? 0 : 1)

      adjustLabelLength(d.id)
      moveLabel(d.id, d.label)
    }

    return d3.drag()
      .on('start', dragStart)
      .on('drag', dragMove)
      .on('end', dragEnd)
  }
}

module.exports = CoreLabels
