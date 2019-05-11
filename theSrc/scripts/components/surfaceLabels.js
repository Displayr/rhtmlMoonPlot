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
      .attr('x', d => d.label.x)
      .attr('y', d => d.label.y)
      .each(function (d) {
        const rotation = buildRotationTransform({circleCenter: { x: cx, y: cy}, labelAnchor: d.anchor })
        // console.log(`${d.name} buildRotationTransform({circleCenter: {x: ${cx}, y: ${cy}}, labelAnchor: {x: ${d.anchor.x}, y: ${d.anchor.y} }) = ${rotation}`)
        d3.select(this).attr('transform', rotation)
      })
      .attr('font-size', d => (d.size * this.fontSize).toString() + 'px')
      .attr('text-anchor', d => (d.label.x < cx) ? 'end' : 'start')
      .attr('alignment-baseline', 'middle')
      .attr('cursor', 'all-scroll')
      .style('font-family', 'Arial Narrow')
      .attr('title', d => d.name)
      .text(d => d.name)
      .call(this.setupDrag())

      // TODO re-enable
      //   return Utils.adjustSurfaceLabelLength(lunarLabelSvgNodes, height, width)
  }

  setupDrag () {
    const { fontColor, fontSelectedColor, plotState, parentContainer } = this

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

      // TODO re-enable
      // Utils.adjustSurfaceLabelLength(lunarSurfaceLabels, height, width)
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
  const rotationTranslation = pos(deltaY) ? -absRotation : absRotation
  return `rotate(${rotationTranslation} ${labelAnchor.x} ${labelAnchor.y})`
}