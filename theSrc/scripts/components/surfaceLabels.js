import * as d3 from 'd3'
import { toDegrees } from '../math/coord'
import _ from 'lodash'

export class SurfaceLabels {
  constructor ({ parentContainer, plotState, fontFamily, fontSize, fontColor, fontSelectedColor, linkWidth, linkColor }) {
    _.assign(this, { parentContainer, plotState, fontFamily, fontSize, fontColor, fontSelectedColor, linkWidth, linkColor })
  }

  draw () {
     this.parentContainer.selectAll('.surface-link')
      .data(this.plotState.getSurfaceLabels())
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

    const center = this.plotState.getCenter()
    this.parentContainer.selectAll('.surface-label')
      .data(this.plotState.getSurfaceLabels())
      .enter()
      .append('text')
      .style('fill', this.fontColor)
      .attr('class', 'surface-label')
      .attr('data-id', d => d.id)
      .attr('data-label', d =>  d.name)
      .attr('x', d => d.label.x)
      .attr('y', d => d.label.y)
      .attr('transform', d => buildRotationTransform({circleCenter: center, rotationCenter: d.label}))
      .attr('font-size', d => (d.size * this.fontSize).toString() + 'px')
      .attr('text-anchor', d => (d.label.x < center.x) ? 'end' : 'start')
      .attr('alignment-baseline', 'middle')
      .attr('cursor', 'all-scroll')
      .style('font-family', 'Arial Narrow')
      .attr('title', d => d.name)
      .text(d => d.name)
      .call(this.setupDrag())

    this.plotState.getSurfaceLabels().forEach(({id}) => this.adjustLabelLength(id))
  }

  // TODO needs a cleanup:
  // * readability of detectViewportCollision and getScreenCoords
  // * use of getBBox, which typically over reports box size
  // * truncate code probably takes more than it needs as ... is shorter than most 3 letter combos
  // * unecessary number d3.select(this) ?
  adjustLabelLength (id) {
    const detectViewportCollision = (label) => {
      const getScreenCoords = function (x, y, ctm) {
        const xn = ctm.e + (x * ctm.a) + (y * ctm.c)
        const yn = ctm.f + (x * ctm.b) + (y * ctm.d)
        return { x: xn, y: yn }
      }

      if (d3.select(label).node().textContent === '') {
        return false
      }

      const {width: plotWidth, height: plotHeight} = this.plotState.getPlotSize()
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
       .select(`.surface-label[data-id='${id}']`)
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
      d3.select(label).text(text.slice(0, -3) + '...')
    }
  }

  setupDrag () {
    const { fontColor, fontSelectedColor, plotState, parentContainer } = this
    const adjustLabelLength = this.adjustLabelLength.bind(this)

    const dragStart = function (d) {
      parentContainer.selectAll(`.surface-link[data-id='${d.id}']`).attr('opacity', 0)
      d3.select(this).style('fill', fontSelectedColor)
    }

    // src : https://groups.google.com/forum/#!topic/d3-js/2usoXlTKY_8
    // NB we interchange d3.mouse and d3.event here because mouse gives relative, and event gives absolute
    // (i am not 100% on the mechanics of this but it works)
    const dragMove = function (d) {
      d3.select(this)
        .attr('x', d3.mouse(this)[0])
        .attr('y', d3.mouse(this)[1])
        .attr('cursor', 'all-scroll')

      d.label.x = d3.event.x
      d.label.y = d3.event.y
    }

    const dragEnd = function (d) {
      d3.select(this).style('fill', fontColor)
      parentContainer.selectAll(`.surface-link[data-id='${d.id}']`)
        .attr('x2', d => d.label.x)
        .attr('y2', d => d.label.y)
        .attr('opacity', 1)

      adjustLabelLength(d.id)
      plotState.moveSurfaceLabel(d.id, d.label)
    }

    return d3.drag()
      .on('start', dragStart)
      .on('drag', dragMove)
      .on('end', dragEnd)
  }
}

module.exports = SurfaceLabels

const buildRotationTransform = ({circleCenter, rotationCenter}) => {
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
