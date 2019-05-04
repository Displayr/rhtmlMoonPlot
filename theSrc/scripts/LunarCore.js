import * as d3 from 'd3'
import {Drag} from './Drag'
import labeler from './labeler'

export class LunarCore {
  static drawLunarCoreLabels (lunarCoreLabelsData,
                             svg,
                             cx,
                             cy,
                             radius,
                             textColor,
                             linkWidth) {
    let x, y
    const drawLabels = function (labelData, drag2) {
      svg.selectAll('.core-label')
         .data(labelData)
         .enter()
         .append('text')
         .style('fill', textColor)
         .attr('class', 'core-label')
         .attr('x', d => d.x)
         .attr('y', d => d.y)
         .attr('ox', d => d.x)
         .attr('oy', d => d.y)
         .attr('cursor', 'all-scroll')
         .attr('text-anchor', 'middle')
         .style('font-family', 'Arial')
         .attr('title', d => d.name)
         .text(d => d.name)
         // .call(drag2)
         .append('title').text(d => d.name)
      return svg.selectAll('.core-label')
    }

    const drawLinks = function (labelData) {
        d3.selectAll('.init-core-link').remove()
      return svg.append('g').selectAll('.init-core-link')
      .data(labelData)
      .enter()
      .append('line')
      .attr('class', 'init-core-link')
      .attr('x1', d => d.x)
      .attr('y1', d => d.y)
      .attr('x2', d => d.x)
      .attr('y2', d => d.y)
      .attr('stroke-width', linkWidth)
      .attr('stroke', 'gray')
    }

    let lunarCoreLabelsSvg = []
    const lunarCoreLabels = []
    const anchorArray = []
    const lunarCoreDrag = null
    // const lunarCoreDrag = Drag.setupLunarCoreDragAndDrop(svg,
    //                                                        lunarCoreLabels,
    //                                                        anchorArray,
    //                                                        radius,
    //                                                        cx,
    //                                                        cy,
    //                                                        textColor)

    // prevent labels from escaping moon surface
    for (let label of Array.from(lunarCoreLabelsData)) {
      x = (label.x * radius) + cx
      y = (-label.y * radius) + cy

      lunarCoreLabels.push({
        x,
        y,
        name: label.name,
        id: label.name,
        ox: x,
        oy: y
      })
    }

    lunarCoreLabelsSvg = drawLabels(lunarCoreLabels, lunarCoreDrag)

    // Size of each labeler
    let i = 0
    while (i < lunarCoreLabels.length) {
      lunarCoreLabels[i].width = lunarCoreLabelsSvg.node().getBBox().width
      lunarCoreLabels[i].height = lunarCoreLabelsSvg.node().getBBox().height - 5
      i++
    }

    svg.selectAll('.core-label').remove()
    lunarCoreLabelsSvg = drawLabels(lunarCoreLabels, lunarCoreDrag)

    // Build the anchor arrays
    for (let lunarCoreLabel of Array.from(lunarCoreLabels)) {
      anchorArray.push({
        x: lunarCoreLabel.x,
        y: lunarCoreLabel.y,
        r: 2,
        dr: 2
      })
    }

    // Lay the anchor
    d3.selectAll('.core-anchor').remove()
    svg.selectAll('.core-anchor')
       .data(anchorArray)
       .enter()
       .append('circle')
       .attr('stroke-width', 3)
       .attr('class', 'core-anchor')
       .attr('fill', 'black')
       .attr('cx', a => a.x)
       .attr('cy', a => a.y)
       .attr('r', a => a.dr)

    // Draw the links
    const lunarCoreLinksSvg = drawLinks(lunarCoreLabels)

    // To do: Extend d3 with the follow functions
    // https://github.com/wbkd/d3-extended
    d3.selection.prototype.moveToFront = function () {
      return this.each(function () {
        this.parentNode.appendChild(this)
      })
    }
    d3.selection.prototype.moveToBack = function () {
      return this.each(function () {
        let firstChild = this.parentNode.firstChild
        if (firstChild) {
          this.parentNode.insertBefore(this, firstChild)
        }
      })
    }
    lunarCoreLinksSvg.moveToBack()
    lunarCoreLabelsSvg.moveToFront()
    d3.selectAll('.core-anchor').moveToFront()
    d3.selectAll('.moon-circle').moveToFront()
    d3.selectAll('.core-cross').moveToFront()
    d3.selectAll('.surface-label').moveToFront()

    // Check if labels are overlapping and if need to be repositioned
    labeler()
     .svg(svg)
     .cx(cx)
     .cy(cy)
     .radius(radius)
     .anchor(anchorArray)
     .label(lunarCoreLabels)
     .start(500)

    let n = 0
    // lunarCoreLabelsSvg.transition()
    //                      .duration(800)
    //                      .attr('x', d => d.x)
    //                      .attr('y', d => d.y)
    //                      .each(() => n++)

                         // ALREADY OFF
                         // .each('end', function() {
                         //   n--
                         //   if (!n) { return endAll() }
                         // })

    // ALREADY OFF
    // var endAll = function() {
    //   svg.selectAll('.init-core-link').remove()
    //   // adjustCoreLabelLength(lunarCoreLabelsSvg.node(), radius, cx, cy)
    //   return Utils.adjustCoreLinks(svg, lunarCoreLabels, anchorArray, linkWidth)
    // }

    // lunarCoreLinksSvg.transition()
    //                  .duration(800)
    //                  .attr('x2', d => d.x)
    //                  .attr('y2', d => d.y)
  }
}
