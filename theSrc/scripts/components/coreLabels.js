import _ from 'lodash'
import * as d3 from 'd3'
import 'd3-transition'
import { getLabelAnchorPoint } from '../labellers/coreLabeller'

export class CoreLabels {
  constructor ({ parentContainer, fontFamily, fontSize, fontColor, fontSelectedColor, linkWidth, linkColor, getLabels, moveLabel, center, radius, width, height }) {
    _.assign(this, { parentContainer, fontFamily, fontSize, fontColor, fontSelectedColor, linkWidth, linkColor, getLabels, moveLabel, center, radius, width, height })
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
  // * readability of detectViewportCollision
  // * detectCoreLabelBoundaryCollision uses getBBox, which typically over reports box size
  // * truncate code probably takes more than it needs as ... is shorter than most 3 letter combos
  // * unecessary number d3.select(this) ?
  adjustLabelLength (id) {
    const { radius, center } = this

    // TODO duplicated between surfaceLabels and coreLabels
    const detectViewportCollision = (label) => {
      const getScreenCoords = function (x, y, ctm) {
        const xn = ctm.e + (x * ctm.a) + (y * ctm.c)
        const yn = ctm.f + (x * ctm.b) + (y * ctm.d)
        return { x: xn, y: yn }
      }

      if (d3.select(label).node().textContent === '') {
        return false
      }

      const { width: plotWidth, height: plotHeight } = this
      const box = label.getBBox()
      const ctm = label.getCTM()
      const transformedCoords = getScreenCoords(box.x, box.y, ctm)
      box.right = transformedCoords.x + box.width
      box.left = transformedCoords.x
      box.top = transformedCoords.y
      box.bottom = transformedCoords.y + box.height

      const collideL = box.left < 0
      const collideR = box.right > plotWidth
      let collideT = false
      let collideB = false
      if (box.x < (plotWidth / 2)) { // only need to condense text on left half
        collideT = box.top < 0
        collideB = box.bottom > plotHeight
      }
      return collideL || collideR || collideT || collideB
    }

    const label = this.parentContainer
      .select(`.core-label[data-id='${id}']`)
      .node()

    // restore full text first
    d3.select(label).text(d3.select(label).data()[0].name)

    let text = d3.select(label).node().textContent
    let truncated = false
    while (detectViewportCollision(label) && text.length > 0) {
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
    const { fontColor, fontSelectedColor, getLabels, moveLabel, parentContainer } = this
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
