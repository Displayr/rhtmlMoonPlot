var drawLunarSurfaceLabels;

drawLunarSurfaceLabels = function(lunarSurfaceLabels, svg, cx, cy, radius, height, width) {
  var cart_coords, cc, cc_new, drag, i, index, j, k, l, label, len, len1, len2, len3, length_of_line, lunar_surface_labels, lunar_surface_links, m, pc, polar_coords, t, x, x_new, y, y_new;
  lunar_surface_links = [];
  drag = setupLunarSurfaceDragAndDrop(svg, lunar_surface_links, radius, cx, cy);
  cart_coords = [];
  t = null;
  for (i = 0, len = lunarSurfaceLabels.length; i < len; i++) {
    label = lunarSurfaceLabels[i];
    x = label.x * radius * 0.7 + cx;
    y = -label.y * radius * 0.7 + cy;
    if (label.x < 0) {
      t = svg.append('text').attr('class', 'surface-label').attr('x', x).attr('y', y).attr('font-size', (label.size * 20).toString() + 'px').attr('text-anchor', 'end').style('font-family', 'Arial').text(label.name);
    } else {
      t = svg.append('text').attr('class', 'surface-label').attr('x', x).attr('y', y).attr('font-size', (label.size * 20).toString() + 'px').attr('text-anchor', 'start').style('font-family', 'Arial').text(label.name);
    }
    cart_coords.push({
      x: label.x,
      y: label.y,
      h: t[0][0].getBBox().height
    });
  }
  svg.selectAll('.surface-label').remove();
  polar_coords = polarCoords(cart_coords);
  length_of_line = radius * 2 * Math.PI;
  moveSurfaceCollsions(polar_coords, length_of_line, radius);
  cart_coords = cartesianCoords(polar_coords);
  for (j = 0, len1 = lunarSurfaceLabels.length; j < len1; j++) {
    label = lunarSurfaceLabels[j];
    index = _.findIndex(lunarSurfaceLabels, function(e) {
      return e.name === label.name;
    });
    label.newX = cart_coords[index].x;
    label.newY = cart_coords[index].y;
    label.rotation = calculateLabelRotation(polarCoord(cart_coords[index]).a);
  }
  for (k = 0, len2 = polar_coords.length; k < len2; k++) {
    pc = polar_coords[k];
    if (pc.oa) {
      cc = cartesianCoord({
        a: pc.oa,
        r: pc.or,
        h: pc.h
      });
      cc_new = cartesianCoord(pc);
      x = cc.x + cx;
      y = -cc.y + cy;
      x_new = cc_new.x + cx;
      y_new = -cc_new.y + cy;
      l = svg.append('line').attr('class', 'surface-link').attr('x1', x).attr('y1', y).attr('x2', x_new).attr('y2', y_new).attr('stroke', 'gray').attr('stroke-width', 0.6);
      lunar_surface_links.push({
        x1: x,
        y1: y,
        x2: x_new,
        y2: y_new
      });
    }
  }
  t = null;
  lunar_surface_labels = [];
  for (m = 0, len3 = lunarSurfaceLabels.length; m < len3; m++) {
    label = lunarSurfaceLabels[m];
    x = label.newX + cx;
    y = -label.newY + cy;
    if (label.newX < 0) {
      t = svg.append('text').style('fill', 'black').attr('class', 'surface-label').attr('x', x).attr('y', y).attr('ox', x).attr('oy', y).attr('font-size', (label.size * 20).toString() + 'px').attr('transform', 'rotate(' + (180 - label.rotation).toString() + ',' + x.toString() + ', ' + y.toString() + ')').attr('text-anchor', 'end').attr('cursor', 'all-scroll').style('font-family', 'Arial').attr('title', label.name).text(label.name).call(drag);
    } else {
      t = svg.append('text').style('fill', 'black').attr('class', 'surface-label').attr('y', y).attr('x', x).attr('ox', x).attr('oy', y).attr('font-size', (label.size * 20).toString() + 'px').attr('transform', 'rotate(' + (-label.rotation).toString() + ',' + x.toString() + ', ' + y.toString() + ')').attr('text-anchor', 'start').attr('cursor', 'all-scroll').style('font-family', 'Arial').attr('title', label.name).text(label.name).call(drag);
    }
    lunar_surface_labels.push(t[0][0]);
  }
  return adjustSurfaceLabelLength(lunar_surface_labels, height, width);
};
