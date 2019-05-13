import * as d3 from 'd3'
import { toDegrees } from '../math/coord'
export class SurfaceLabels {
  constructor({ parentContainer, plotState, cx, cy, height, width, fontFamily, fontSize, fontColor, fontSelectedColor, linkWidth, linkColor }) {
    _.assign(this, { parentContainer, plotState, cx, cy, height, width, fontFamily, fontSize, fontColor, fontSelectedColor, linkWidth, linkColor })
  }

  draw () {
    this.linkSelection = this.parentContainer.selectAll('.surface-link')
    this.linkSelection
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

    const { cx, cy } = this
    this.labelSelection = this.parentContainer.selectAll('.surface-label')
    this.labelSelection
      .data(this.plotState.getSurfaceLabels())
      .enter()
      .append('text')
      .style('fill', this.fontColor)
      .attr('class', 'surface-label')
      .attr('data-id', d => d.id)
      .attr('data-label', d =>  d.name)
      .attr('x', d => d.label.x + cx)
      .attr('y', d => -d.label.y + cy)
      // .each(function (d) {
      //   const rotation = buildRotationTransform({circleCenter: { x: cx, y: cy}, labelAnchor: d.anchor })
      //   // console.log(`${d.name} buildRotationTransform({circleCenter: {x: ${cx}, y: ${cy}}, labelAnchor: {x: ${d.anchor.x}, y: ${d.anchor.y} }) = ${rotation}`)
      //   d3.select(this).attr('transform', rotation)
      // })
      .attr('transform', d => {
        const rotation = (d.polarLabel.a / 2 / Math.PI) * 360
        const x = d.label.x + cx
        const y = -d.label.y + cy
        return (d.label.x < 0)
          ? `rotate(${(180 - rotation).toString()},${x.toString()}, ${y.toString()})`
          : `rotate(${(-rotation).toString()},${x.toString()}, ${y.toString()})`
      })
      .attr('font-size', d => (d.size * this.fontSize).toString() + 'px')
      .attr('text-anchor', d => (d.label.x < cx) ? 'end' : 'start')
      .attr('alignment-baseline', 'middle')
      .attr('cursor', 'all-scroll')
      .style('font-family', 'Arial Narrow')
      .attr('title', d => d.name)
      .text(d => d.name)
      .call(this.setupDrag())

      this.adjustLabelLengths()
  }

  adjustLabelLengths () {
    this.plotState.getSurfaceLabels().forEach(({id}) => this.adjustLabelLength(id))
  }

  // TODO needs a cleanup
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

      const box = label.getBBox()
      const ctm = label.getCTM()
      const transformedCoords = getScreenCoords(box.x, box.y, ctm)
      box.right = transformedCoords.x + box.width
      box.left = transformedCoords.x
      box.top = transformedCoords.y
      box.bottom = transformedCoords.y + box.height

      const collideL = box.left < 0
      const collideR = box.right > this.width
      let collideT = false
      let collideB = false
      if (box.x < (this.width / 2)) { // only need to condense text on left half
        collideT = box.top < 0
        collideB = box.bottom > this.height
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

    // NB we choose d3.mouse and d3.event here because mouse gives relative, and event gives absolute
    // src : https://groups.google.com/forum/#!topic/d3-js/2usoXlTKY_8
    // TODO I dont really understand this but dont f*ck with it ... ?
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

const buildRotationTransform = ({circleCenter, labelAnchor}) => {
  const pos = x => (x >= 0)
  const deltaX = labelAnchor.x - circleCenter.x
  const deltaY = labelAnchor.y - circleCenter.y
  const absRotation = toDegrees(Math.atan(Math.abs(deltaY) / Math.abs(deltaX)))
  let rotationTranslation = null
  if (pos(deltaY) && pos(deltaX)) { rotationTranslation = absRotation }
  if (!pos(deltaY) && pos(deltaX)) { rotationTranslation = -absRotation }
  if (pos(deltaY) && !pos(deltaX)) { rotationTranslation = -absRotation }
  if (!pos(deltaY) && !pos(deltaX)) { rotationTranslation = absRotation }
  return `rotate(${rotationTranslation} ${labelAnchor.x} ${labelAnchor.y})`
}