import * as d3 from 'd3'
import { toDegrees } from '../math/coord'
import _ from 'lodash'
import getScreenCoords from '../math/getScreenCoords'
import detectViewportCollision from '../math/detectViewportCollision'

export class SurfaceLabels {
  constructor ({ parentContainer, fontFamily, fontSize, fontColor, fontSelectedColor, linkWidth, linkColor, center, plotWidth, plotHeight, getLabels, moveLabel }) {
    _.assign(this, { parentContainer, fontFamily, fontSize, fontColor, fontSelectedColor, linkWidth, linkColor, center, plotWidth, plotHeight, getLabels, moveLabel })
  }

  draw () {
     this.parentContainer.selectAll('.surface-link')
      .data(this.getLabels())
      .enter()
      .append('line')
      .attr('x1', d => d.anchor.x)
      .attr('y1', d => d.anchor.y)
      .attr('x2', d => d.label.x)
      .attr('y2', d => d.label.y)
      .attr('data-id', d => d.id)
      .attr('data-label', d => d.name)
      .attr('class', 'surface-link')
      .attr('stroke-width', this.linkWidth)
      .attr('stroke', this.linkColor)

    this.parentContainer.selectAll('.surface-label')
      .data(this.getLabels())
      .enter()
      .append('text')
      .style('fill', this.fontColor)
      .attr('class', 'surface-label')
      .attr('data-id', d => d.id)
      .attr('data-label', d =>  d.name)
      .attr('x', d => d.label.x)
      .attr('y', d => d.label.y)
      .attr('transform', d => buildRotationTransform({ circleCenter: this.center, rotationCenter: d.label }))
      .attr('font-size', d => (d.size * this.fontSize).toString() + 'px')
      .style('font-family', this.fontFamily)
      .attr('text-anchor', d => (d.label.x < this.center.x) ? 'end' : 'start')
      .attr('alignment-baseline', 'middle')
      .attr('cursor', 'all-scroll')
      .text(d => d.name)
      .call(this.setupDrag())

    this.getLabels().forEach(({ id }) => this.adjustLabelLength(id))
  }

  // TODO needs a cleanup:
  // * use of getBBox, which typically over reports box size
  // * truncate code probably takes more than it needs as ... is shorter than most 3 letter combos
  // * unecessary number d3.select(this) ?
  adjustLabelLength (id) {
    const label = this.parentContainer
       .select(`.surface-label[data-id='${id}']`)
       .node()

    // restore full text first
    d3.select(label).text(d3.select(label).data()[0].name)

    let text = d3.select(label).node().textContent
    let truncated = false
    const { plotWidth, plotHeight } = this
    while (detectViewportCollision({ label, plotWidth, plotHeight }) && text.length > 0) {
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
    const { fontColor, fontSelectedColor, moveLabel, parentContainer, plotWidth, plotHeight, center } = this
    const adjustLabelLength = this.adjustLabelLength.bind(this)

    const dragStart = function (d) {
      parentContainer.selectAll(`.surface-link[data-id='${d.id}']`).attr('opacity', 0)

      const label = d3.select(this)
      label.style('fill', fontSelectedColor)
    }

    const dragMove = function (d) {
      const xInBounds = (d3.event.x >= 0 && d3.event.x <= plotWidth)
      const yInBounds = (d3.event.y >= 0 && d3.event.y <= plotHeight)

      const label = d3.select(this)
      const labelNode = label.node()
      const box = labelNode.getBBox()
      const ctm = labelNode.getCTM()
      const transformedCoords = getScreenCoords(box, ctm)

      // NB this does not account for the switch of text-align when anchor.x < center.x
      const furthestLabelPointFromCenter = {
        x: transformedCoords.x + (box.width * 1.1 * ctm.a) + (box.height * 1.1 * ctm.c),
        y: transformedCoords.y + (box.width * 1.1 * ctm.b) + (box.height * 1.1 * ctm.d)
      }

      const remainingSpaceToLeft = furthestLabelPointFromCenter.x
      const remainingSpaceToRight = plotWidth - furthestLabelPointFromCenter.x
      const remainingSpaceToTop = furthestLabelPointFromCenter.y
      const remainingSpaceToBottom = plotHeight - furthestLabelPointFromCenter.y

      if (xInBounds && remainingSpaceToLeft > 0 && remainingSpaceToRight > 0) { d.label.x = d3.event.x }
      if (yInBounds && remainingSpaceToTop > 0 && remainingSpaceToBottom > 0) { d.label.y = d3.event.y }

      // NB allow us to recover from weird edge cases where the previous reading was a lie !
      if (remainingSpaceToRight <= 0) { d.label.x = Math.min(d.label.x, d3.event.x) }
      if (remainingSpaceToLeft <= 0) { d.label.x = Math.max(d.label.x, d3.event.x) }
      if (remainingSpaceToTop <= 0) { d.label.y = Math.max(d.label.y, d3.event.y) }
      if (remainingSpaceToBottom <= 0) { d.label.y = Math.min(d.label.y, d3.event.y) }

      label
        .attr('x', d.label.x)
        .attr('y', d.label.y)
        .attr('transform', d => buildRotationTransform({ circleCenter: center, rotationCenter: d.label }))
        .attr('cursor', 'all-scroll')
    }

    const dragEnd = function (d) {
      d3.select(this).style('fill', fontColor)
      parentContainer.selectAll(`.surface-link[data-id='${d.id}']`)
        .attr('x2', d => d.label.x)
        .attr('y2', d => d.label.y)
        .attr('opacity', 1)

      adjustLabelLength(d.id)
      moveLabel(d.id, d.label)
    }

    return d3.drag()
      .on('start', dragStart)
      .on('drag', dragMove)
      .on('end', dragEnd)
  }
}

module.exports = SurfaceLabels

const buildRotationTransform = ({ circleCenter, rotationCenter }) => {
  const pos = x => (x >= 0)
  const deltaX = rotationCenter.x - circleCenter.x
  const deltaY = rotationCenter.y - circleCenter.y
  const absRotation = (deltaX !== 0)
    ? toDegrees(Math.atan(Math.abs(deltaY) / Math.abs(deltaX)))
    : 90

  let rotationTranslation = null
  if (pos(deltaY) && pos(deltaX)) { rotationTranslation = absRotation }
  if (!pos(deltaY) && pos(deltaX)) { rotationTranslation = -absRotation }
  if (pos(deltaY) && !pos(deltaX)) { rotationTranslation = -absRotation }
  if (!pos(deltaY) && !pos(deltaX)) { rotationTranslation = absRotation }
  return `rotate(${rotationTranslation} ${rotationCenter.x} ${rotationCenter.y})`
}
