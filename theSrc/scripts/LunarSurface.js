import Utils from './Utils'
import {Drag} from './Drag'

export class LunarSurface {
  static drawLunarSurfaceLabels (lunarSurfaceLabelsData,
                         svg,
                         cx,
                         cy,
                         radius,
                         height,
                         width,
                         textColor,
                         labelSizeConst) {
    let x, y
    const lunarSurfaceLinks = []
    const lunarSurfaceLabels = []
    const drag = Drag.setupLunarSurfaceDragAndDrop(svg,
      lunarSurfaceLabels,
      lunarSurfaceLinks,
      radius,
      cx,
      cy,
      height,
      width,
      textColor)
    let cartCoords = []
    let t = null
    for (var label of Array.from(lunarSurfaceLabelsData)) {
      x = (label.x * radius * 0.7) + cx
      y = (-label.y * radius * 0.7) + cy

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
        x: label.x,
        y: label.y,
        h: t.node().getBBox().height
      })
    }

    svg.selectAll('.surface-label').remove()
    const polarCoords = Utils.polarCoords(cartCoords)
    const lengthOfLine = radius * 2 * Math.PI

    Utils.moveSurfaceCollsions(polarCoords, lengthOfLine, radius)
    cartCoords = Utils.cartesianCoords(polarCoords)

    // Load the new cartesian coordinates into lunarSurfaceLabelsData array
    for (let i = 0; i < lunarSurfaceLabelsData.length; i++) {
      label = lunarSurfaceLabelsData[i]
      label.newX = cartCoords[i].x
      label.newY = cartCoords[i].y
      label.rotation = Utils.calculateLabelRotation(Utils.polarCoord(cartCoords[i]).a)
    }

    // Plot the surface links
    for (let pc of Array.from(polarCoords)) {
      let cc = null
      if (pc.oa) {
        cc = Utils.cartesianCoord({
          a: pc.oa,
          r: pc.or,
          h: pc.h
        })
      } else {
        cc = Utils.cartesianCoord(pc)
      }
      const ccNew = Utils.cartesianCoord(pc)
      x =  cc.x + cx
      y = -cc.y + cy
      const xNew =  ccNew.x + cx
      const yNew = -ccNew.y + cy
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

    t = null

    for (label of Array.from(lunarSurfaceLabelsData)) {
      x =  label.newX + cx
      y = -label.newY + cy

      if (label.newX < 0) {
        t = svg.append('text')
        .style('fill', textColor)
        .attr('class', 'surface-label')
        .attr('x', x)
        .attr('y', y)
        .attr('ox', x)
        .attr('oy', y)
        .attr('font-size', (label.size * labelSizeConst).toString() + 'px')
        .attr('transform', `rotate(${(180 - label.rotation).toString()},${x.toString()}, ${y.toString()})`)
        .attr('text-anchor', 'end')
        .attr('alignment-baseline', 'middle')
        .attr('cursor', 'all-scroll')
        .style('font-family', 'Arial Narrow')
        .attr('title', label.name)
        .text(label.name)
        .call(drag)
      } else {
        t = svg.append('text')
        .style('fill', textColor)
        .attr('class', 'surface-label')
        .attr('y', y)
        .attr('x', x)
        .attr('ox', x)
        .attr('oy', y)
        .attr('font-size', (label.size * labelSizeConst).toString() + 'px')
        .attr('transform', `rotate(${(-label.rotation).toString()},${x.toString()}, ${y.toString()})`)
        .attr('text-anchor', 'start')
        .attr('alignment-baseline', 'middle')
        .attr('cursor', 'all-scroll')
        .style('font-family', 'Arial Narrow')
        .attr('title', label.name)
        .text(label.name)
        .call(drag)
      }
      lunarSurfaceLabels.push(t.node())
    }
    return Utils.adjustSurfaceLabelLength(lunarSurfaceLabels, height, width)
  }
}
