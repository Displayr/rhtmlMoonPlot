

import * as d3 from "d3"
import {Drag} from "./Drag"
import labeler from "./labeler"

export class LunarCore {
  constructor() {}

  static drawLunarCoreLabels(lunarCoreLabels,
                             svg,
                             cx,
                             cy,
                             radius,
                             textColor,
                             link_width) {
    let x, y;
    const drawLabels = function(label_data, drag2) {
      const labels = svg.selectAll('.core-label')
      .data(label_data)
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
      .call(drag2)
      .append('title').text(d => d.name);
      return svg.selectAll('.core-label');
    }

    const drawLinks = function(label_data) {
        d3.selectAll('.init-core-link').remove();
      return svg.append('g').selectAll('.init-core-link')
      .data(label_data)
      .enter()
      .append('line')
      .attr('class', 'init-core-link')
      .attr('x1', d => d.x)
      .attr('y1', d => d.y)
      .attr('x2', d => d.x)
      .attr('y2', d => d.y)
      .attr('stroke-width', link_width)
      .attr('stroke', 'gray');
    }

    let lunar_core_labels_svg = [];
    const lunar_core_labels = [];
    const anchor_array = [];
    const lunar_core_drag = Drag.setupLunarCoreDragAndDrop(svg,
                                                           lunar_core_labels,
                                                           anchor_array,
                                                           radius,
                                                           cx,
                                                           cy,
                                                           textColor);

    // prevent labels from escaping moon surface
    for (let label of Array.from(lunarCoreLabels)) {
      x = (label.x * radius) + cx;
      y = (-label.y * radius) + cy;

      lunar_core_labels.push({
        x,
        y,
        name: label.name,
        id: label.name,
        ox: x,
        oy: y
      });
    }

    lunar_core_labels_svg = drawLabels(lunar_core_labels, lunar_core_drag);

    // Size of each labeler
    let i = 0;
    while (i < lunar_core_labels.length) {
      lunar_core_labels[i].width = lunar_core_labels_svg.node().getBBox().width;
      lunar_core_labels[i].height = lunar_core_labels_svg.node().getBBox().height - 5;
      i++;
    }

    svg.selectAll('.core-label').remove();
    lunar_core_labels_svg = drawLabels(lunar_core_labels, lunar_core_drag);

    // Build the anchor arrays
    for (let lunar_core_label of Array.from(lunar_core_labels)) {
      anchor_array.push({
        x: lunar_core_label.x,
        y: lunar_core_label.y,
        r: 2,
        dr: 2
      });
    }

    // Lay the anchor
    d3.selectAll('.core-anchor').remove();
    svg.selectAll('.core-anchor')
       .data(anchor_array)
       .enter()
       .append('circle')
       .attr('stroke-width', 3)
       .attr('class', 'core-anchor')
       .attr('fill', 'black')
       .attr('cx', a => a.x)
       .attr('cy', a => a.y)
       .attr('r', a => a.dr);

    // Draw the links
    const lunar_core_links_svg = drawLinks(lunar_core_labels);

    // To do: Extend d3 with the follow functions
    // https://github.com/wbkd/d3-extended
    d3.selection.prototype.moveToFront = function() {
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };
    d3.selection.prototype.moveToBack = function() {
      return this.each(function() {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
          this.parentNode.insertBefore(this, firstChild);
        }
      });
    };
    lunar_core_links_svg.moveToBack();
    lunar_core_labels_svg.moveToFront();
    d3.selectAll('.core-anchor').moveToFront();
    d3.selectAll('.moon-circle').moveToFront();
    d3.selectAll('.core-cross').moveToFront();
    d3.selectAll('.surface-label').moveToFront();

    // Check if labels are overlapping and if need to be repositioned
    labeler()
     .svg(svg)
     .cx(cx)
     .cy(cy)
     .radius(radius)
     .anchor(anchor_array)
     .label(lunar_core_labels)
     .start(500);

    let n = 0;
    lunar_core_labels_svg.transition()
                         .duration(800)
                         .attr('x', d => d.x)
                         .attr('y', d => d.y)
                         .each(() => n++)
                         // .each('end', function() {
                         //   n--;
                         //   if (!n) { return endAll(); }
                         // });

    var endAll = function() {
      svg.selectAll('.init-core-link').remove();
      // adjustCoreLabelLength(lunar_core_labels_svg.node(), radius, cx, cy)
      return Utils.adjustCoreLinks(svg, lunar_core_labels, anchor_array, link_width);
    };

    return lunar_core_links_svg.transition()
    .duration(800)
    .attr('x2', d => d.x)
    .attr('y2', d => d.y);
  }
}