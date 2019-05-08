import * as d3 from 'd3'
import Utils from './Utils'
import {LunarSurface} from './LunarSurface'
import {LunarCore} from './LunarCore'

export class Drag {
  static setupLunarCoreDragAndDrop (svg,
                            lunarCoreLabels,
                            anchorArray,
                            xCenter,
                            yCenter,
                            textColor,
                            linkWidth,
                            plotState) {
    const dragStart = function () {
      svg.selectAll('.core-link').remove()
      return d3.select(this).style('fill', 'red')
    }

    const dragMove = function (d) {
      d3.select(this)
        .attr('x', d3.event.x)
        .attr('y', d3.event.y)
        .attr('cursor', 'all-scroll')

      d.x = d3.event.x
      d.y = d3.event.y
    }

    const dragEnd = function (d) {
      d3.select(this).style('fill', textColor)
      const coreLabels = d3.selectAll('.core-label').nodes()
      Utils.adjustCoreLabelLength(coreLabels, plotState.getCircleRadius(), xCenter, yCenter)
      Utils.adjustCoreLinks(svg, lunarCoreLabels, anchorArray, linkWidth)
      plotState.moveCoreLabel(d.id, {x: d.x, y: d.y})
    }

    return d3.drag()
             .subject(function () {
               return {
                 x: d3.select(this).attr('x'),
                 y: d3.select(this).attr('y')
               }
             })
             .on('start', dragStart)
             .on('drag', dragMove)
             .on('end', dragEnd)
  }

  static setupLunarSurfaceDragAndDrop (svg,
                               lunarSurfaceLabels,
                               lunarSurfaceLinks,
                               xCenter,
                               yCenter,
                               height,
                               width,
                               textColor,
                               plotState) {
    const dragStart = function () {
      svg.selectAll('.surface-link').remove()
      d3.select(this).style('fill', 'red')
    }

    const dragMove = function (d) {
      d3.select(this)
        .attr('x', d3.mouse(this)[0])
        .attr('y', d3.mouse(this)[1])
        .attr('cursor', 'all-scroll')

      d.x = d3.event.x
      d.y = d3.event.y
    }

    const dragEnd = function (d) {
      let x2, y2

      d3.select(this).style('fill', textColor)

      if (d3.select(this).attr('ox')) {
        // const crossColorox = d3.select(this).attr('ox').toString()
        const ox = d3.select(this).attr('ox').toString()
        const oy = d3.select(this).attr('oy').toString()
        for (let surfaceLink of Array.from(lunarSurfaceLinks)) {
          if ((surfaceLink.x2.toString() === ox) && (surfaceLink.y2.toString() === oy)) {
            x2 = d3.mouse(this)[0]
            y2 = d3.mouse(this)[1]

            // Use the context transformation matrix to rotate the link's new positions
            const ctm = d3.select(this).node().getCTM()
            surfaceLink.x2 = (x2 * ctm.a) + (y2 * ctm.c) + ctm.e
            surfaceLink.y2 = (x2 * ctm.b) + (y2 * ctm.d) + ctm.f

            d3.select(this).attr('ox', surfaceLink.x2)
            .attr('oy', surfaceLink.y2)
          }
        }
      }

      svg.selectAll('.surface-link')
         .data(lunarSurfaceLinks)
         .enter()
         .append('line')
         .attr('class', 'surface-link')
         .attr('x1', d => d.x1)
         .attr('y1', d => d.y1)
         .attr('x2', d => d.x2)
         .attr('y2', d => d.y2)
         .attr('stroke-width', 0.6)
         .attr('stroke', 'gray')

      Utils.adjustSurfaceLabelLength(lunarSurfaceLabels, height, width)
      plotState.moveSurfaceLabel(d.id, {x: d.x, y: d.y})
    }

    return d3.drag()
             .subject(function () {
               return {
                 x: d3.select(this).attr('x'),
                 y: d3.select(this).attr('y')
               }
             })
             .on('start', dragStart)
             .on('drag', dragMove)
             .on('end', dragEnd)
  }

  static setupMoonResize (lunarCoreLabels, lunarSurfaceLabels, svg, cx, cy, height, width, textColor, plotState) {
    const drag = function () {
      const findDistance = (cx, cy, x, y) => Math.sqrt(Math.pow((x - cx), 2) + Math.pow((y - cy), 2)) // TODO this is distanceFromCenter
      const mouseX = d3.mouse(this)[0] // TODO switch to d3.event. Or lookup and see if I should switch all to d3.mouse
      const mouseY = d3.mouse(this)[1] // TODO switch to d3.event. Or lookup and see if I should switch all to d3.mouse
      return d3.select(this).attr('r', findDistance(cx, cy, mouseX, mouseY))
    }

    const dragStart = function () {
      console.log(`start dragging circle. Moon size is r=${plotState.getCircleRadius()}`)
      svg.selectAll('.init-core-link').remove()
      svg.selectAll('.core-label').remove()
      svg.selectAll('.core-anchor').remove()
      svg.selectAll('.surface-link').remove()
      svg.selectAll('.surface-label').remove()
    }

    const dragEnd = function () {
      const findDistance = (cx, cy, x, y) => Math.sqrt(Math.pow((x - cx), 2) + Math.pow((y - cy), 2)) // TODO this is distanceFromCenter
      const mouseX = d3.mouse(this)[0] // TODO switch to d3.event. Or lookup and see if I should switch all to d3.mouse
      const mouseY = d3.mouse(this)[1] // TODO switch to d3.event. Or lookup and see if I should switch all to d3.mouse
      const newRadius = findDistance(cx, cy, mouseX, mouseY)
      plotState.setCircleRadius(newRadius)
      console.log(`end circle drag. Moon resized to r=${newRadius}`)

      // TODO this should be moved up to state, not called from here
      LunarCore.drawLunarCoreLabels({
        plotState,
        lunarCoreLabelsData: lunarCoreLabels,
        svg,
        cx,
        cy,
        textColor,
        linkWidth: 1}) // TODO pull from config

      // TODO this should be moved up to state, not called from here
      LunarSurface.drawLunarSurfaceLabels({
        plotState,
        lunarSurfaceLabelsData: lunarSurfaceLabels,
        svg,
        cx,
        cy,
        height,
        width,
        textColor,
        labelSizeConst: 14}) // TODO pull from config
    }

    return d3.drag()
     .on('start', dragStart)
     .on('drag', drag)
     .on('end', dragEnd)
  }
}
