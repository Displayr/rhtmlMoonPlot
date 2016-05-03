var setupLunarCoreDragAndDrop, setupLunarSurfaceDragAndDrop, setupMoonResize;

setupLunarCoreDragAndDrop = function(svg, lunar_core_labels, radius, xCenter, yCenter, textColor) {
  var dragEnd, dragMove, dragStart;
  dragStart = function() {
    svg.selectAll('.core-link').remove();
    svg.selectAll('.core-label-background').remove();
    return d3.select(this).style('fill', 'red');
  };
  dragMove = function() {
    var core_label, i, len, results;
    d3.select(this).attr('x', d3.select(this).x = d3.event.x).attr('y', d3.select(this).y = d3.event.y).attr('cursor', 'all-scroll');
    results = [];
    for (i = 0, len = lunar_core_labels.length; i < len; i++) {
      core_label = lunar_core_labels[i];
      if (d3.select(this).attr('title') === core_label.id) {
        core_label.x = d3.event.x;
        results.push(core_label.y = d3.event.y);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };
  dragEnd = function() {
    svg.selectAll('.core-link').data(lunar_core_labels).enter().append('line').attr('class', 'core-link').attr('x1', function(d) {
      return d.ox;
    }).attr('y1', function(d) {
      return d.oy;
    }).attr('x2', function(d) {
      return d.x;
    }).attr('y2', function(d) {
      return d.y;
    }).attr('stroke-width', 0.6).attr('stroke', 'gray');
    d3.select(this).style('fill', textColor);
    drawBackground(svg, lunar_core_labels);
    d3.selectAll('.core-label').moveToFront();
    d3.selectAll('.moon-circle').moveToFront();
    d3.selectAll('.core-cross').moveToFront();
    d3.selectAll('.core-anchor').moveToFront();
    d3.selectAll('.surface-label').moveToFront();
    return adjustCoreLabelLength(d3.selectAll('.core-label')[0], radius, xCenter, yCenter);
  };
  return d3.behavior.drag().origin(function() {
    return {
      x: d3.select(this).attr("x"),
      y: d3.select(this).attr("y")
    };
  }).on('dragstart', dragStart).on('drag', dragMove).on('dragend', dragEnd);
};

setupLunarSurfaceDragAndDrop = function(svg, lunar_surface_labels, lunar_surface_links, radius, xCenter, yCenter, height, width, textColor) {
  var dragEnd, dragMove, dragStart;
  dragStart = function() {
    svg.selectAll('.surface-link').remove();
    return d3.select(this).style('fill', 'red');
  };
  dragMove = function() {
    return d3.select(this).attr('x', d3.select(this).x = d3.mouse(this)[0]).attr('y', d3.select(this).y = d3.mouse(this)[1]).attr('cursor', 'all-scroll');
  };
  dragEnd = function() {
    var crossColorox, ctm, i, len, ox, oy, surface_link, x2, y2;
    d3.select(this).style('fill', textColor);
    if (d3.select(this).attr('ox')) {
      crossColorox = d3.select(this).attr('ox').toString();
      ox = d3.select(this).attr('ox').toString();
      oy = d3.select(this).attr('oy').toString();
      for (i = 0, len = lunar_surface_links.length; i < len; i++) {
        surface_link = lunar_surface_links[i];
        if (surface_link.x2.toString() === ox && surface_link.y2.toString() === oy) {
          x2 = d3.mouse(this)[0];
          y2 = d3.mouse(this)[1];
          ctm = d3.select(this)[0][0].getCTM();
          surface_link.x2 = x2 * ctm.a + y2 * ctm.c + ctm.e;
          surface_link.y2 = x2 * ctm.b + y2 * ctm.d + ctm.f;
          d3.select(this).attr('ox', surface_link.x2).attr('oy', surface_link.y2);
        }
      }
    }
    svg.selectAll('.surface-link').data(lunar_surface_links).enter().append('line').attr('class', 'surface-link').attr('x1', function(d) {
      return d.x1;
    }).attr('y1', function(d) {
      return d.y1;
    }).attr('x2', function(d) {
      return d.x2;
    }).attr('y2', function(d) {
      return d.y2;
    }).attr('stroke-width', 0.6).attr('stroke', 'gray');
    return adjustSurfaceLabelLength(lunar_surface_labels, height, width);
  };
  return d3.behavior.drag().origin(function() {
    return {
      x: d3.select(this).attr("x"),
      y: d3.select(this).attr("y")
    };
  }).on('dragstart', dragStart).on('drag', dragMove).on('dragend', dragEnd);
};

setupMoonResize = function(data, svg, cx, cy, height, width, radius, textColor) {
  var drag, dragEnd, dragStart;
  drag = function() {
    var findDistance, mouseX, mouseY, newRadius;
    findDistance = function(cx, cy, x, y) {
      return Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
    };
    mouseX = d3.mouse(this)[0];
    mouseY = d3.mouse(this)[1];
    newRadius = findDistance(cx, cy, mouseX, mouseY);
    radius = newRadius;
    return d3.select(this).attr('r', newRadius);
  };
  dragStart = function() {
    svg.selectAll('.core-link').remove();
    svg.selectAll('.core-label').remove();
    svg.selectAll('.core-label-background').remove();
    svg.selectAll('.core-anchor').remove();
    svg.selectAll('.surface-link').remove();
    return svg.selectAll('.surface-label').remove();
  };
  dragEnd = function() {
    console.log("Moon resized to r=" + radius);
    drawLunarCoreLabels(data.lunarCoreLabels, svg, cx, cy, radius, textColor);
    return drawLunarSurfaceLabels(data.lunarSurfaceLabels, svg, cx, cy, radius, height, width, textColor);
  };
  return d3.behavior.drag().origin(function() {
    return {
      x: d3.select(this).attr("cy"),
      y: d3.select(this).attr("cy")
    };
  }).on('dragstart', dragStart).on('drag', drag).on('dragend', dragEnd);
};
