import {polarsFromCartesians, polarFromCartesian, cartesiansFromPolars, cartesianFromPolar} from './math/coord'
import Utils from './Utils'
import {Drag} from './Drag'
import * as d3 from 'd3'

export class LunarSurface {
  static drawLunarSurfaceLabels ({plotState, lunarSurfaceLabelsData, svg, cx, cy, height, width, textColor, labelSizeConst}) {
    let x, y
    const lunarSurfaceLinks = []
    let lunarSurfaceLabels = []
    const drag = Drag.setupLunarSurfaceDragAndDrop(svg,
      lunarSurfaceLabels,
      lunarSurfaceLinks,
      cx,
      cy,
      height,
      width,
      textColor,
      plotState)

    let cartCoords = []
    let t = null
    for (var label of Array.from(lunarSurfaceLabelsData)) {
      x = (label.x * plotState.getCircleRadius() * 0.7) + cx
      y = (-label.y * plotState.getCircleRadius() * 0.7) + cy

      if (label.x < 0) {
        t = svg.append('text')
        .attr('class', 'surface-label')
        .attr('x', x)
        .attr('y', y)
        .attr('font-size', (label.size * 20).toString() + 'px')
        .attr('text-anchor', 'end')
        .attr('alignment-baseline', 'middle')
        .style('font-family', 'Arial')
        .text(label.name)
      } else {
        t = svg.append('text')
        .attr('class', 'surface-label')
        .attr('x', x)
        .attr('y', y)
        .attr('font-size', (label.size * 20).toString() + 'px')
        .attr('text-anchor', 'start')
        .attr('alignment-baseline', 'middle')
        .style('font-family', 'Arial')
        .text(label.name)
      }

      cartCoords.push({
        id: label.id,
        x: label.x,
        y: label.y,
        h: t.node().getBBox().height
      })
    }

    svg.selectAll('.surface-label').remove()
    const polarCoords = polarsFromCartesians(cartCoords)
    const lengthOfLine = plotState.getCircleRadius() * 2 * Math.PI

    Utils.moveSurfaceCollsions(polarCoords, lengthOfLine, plotState.getCircleRadius())
    cartCoords = cartesiansFromPolars(polarCoords)

    // Load the new cartesian coordinates into lunarSurfaceLabelsData array
    for (let i = 0; i < lunarSurfaceLabelsData.length; i++) {
      label = lunarSurfaceLabelsData[i]
      label.newX = cartCoords[i].x
      label.newY = cartCoords[i].y
      label.rotation = Utils.calculateLabelRotation(polarFromCartesian(cartCoords[i]).a)
    }

    // Plot the surface links
    for (let pc of Array.from(polarCoords)) {
      let cc = null
      if (pc.oa) {
        cc = cartesianFromPolar({
          a: pc.oa,
          r: pc.or,
          h: pc.h
        })
      } else {
        cc = cartesianFromPolar(pc)
      }
      const ccNew = cartesianFromPolar(pc)
      x =  cc.x + cx
      y = -cc.y + cy

      const { x: xNew, y: yNew } = (plotState.hasSurfaceLabelBeenMoved(pc.id))
        ? plotState.getSurfaceLabelCoord(pc.id)
        : { x: ccNew.x + cx, y: -ccNew.y + cy }

      svg.append('line')
         .attr('class', 'surface-link')
         .attr('x1', x)
         .attr('y1', y)
         .attr('ox', x)
         .attr('oy', y)
         .attr('x2', xNew)
         .attr('y2', yNew)
         .attr('stroke', 'gray')
         .attr('stroke-width', 0.6)
      lunarSurfaceLinks.push({
        x1: x,
        y1: y,
        x2: xNew,
        y2: yNew,
        ox: x,
        oy: y
      })
    }

    lunarSurfaceLabels = svg.selectAll('.surface-label')
      .data(lunarSurfaceLabelsData)
      .enter()
      .append('text')
      .style('fill', textColor)
      .attr('class', 'surface-label')
      .attr('data-index', d =>  d.id)
      .attr('data-label', d =>  d.name)
      .each(function (d) {
        const {x, y} = (plotState.hasSurfaceLabelBeenMoved(d.id))
          ? plotState.getSurfaceLabelCoord(d.id)
          : {
            x: (d.newX + cx).toString(),
            y: (-d.newY + cy).toString()
          }
        d3.select(this)
          .attr('x', x)
          .attr('y', y)
          .attr('ox', x)
          .attr('oy', y)
          .attr('transform', (d.newX < 0)
            ? `rotate(${(180 - d.rotation).toString()},${x}, ${y})`
            : `rotate(${(-d.rotation).toString()},${x}, ${y})`
          )
      })
      .attr('font-size', d => (d.size * labelSizeConst).toString() + 'px')
      .attr('text-anchor', d => (d.newX < 0) ? 'end' : 'start')
      .attr('alignment-baseline', 'middle')
      .attr('cursor', 'all-scroll')
      .style('font-family', 'Arial Narrow')
      .attr('title', d => d.name)
      .text(d => d.name)
      .call(drag)

    const lunarLabelSvgNodes = lunarSurfaceLabels.nodes()

    return Utils.adjustSurfaceLabelLength(lunarLabelSvgNodes, height, width)
  }
}
