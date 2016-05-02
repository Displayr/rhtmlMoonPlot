var adjustCoreLabelLength, adjustSurfaceLabelLength, calculateLabelRotation, calculateSurfaceLabelSizes, calculateSurfaceNodePositions, cartesianCoord, cartesianCoords, condenseCoreLabel, condenseSurfaceLabel, coreLabelTooLong, detectCoreLabelBoundaryCollision, detectSurfaceCollisions, detectViewportCollision, distanceFromCenter, drawBackground, extendFullLabelName, failsCoreLabelBoundaryRules, moveSurfaceCollsions, normalizeCoreNodes, polarCoord, polarCoords, positionAlongLine;

detectSurfaceCollisions = function(polar_coords, length_of_line) {
  var collisions, error_allowed, i, j, p1, p1l, p1r, p2, p2l, p2r;
  error_allowed = 5;
  collisions = [];
  i = 0;
  while (i < polar_coords.length) {
    p1 = polar_coords[i];
    i++;
    j = i;
    while (j < polar_coords.length) {
      p2 = polar_coords[j];
      j++;
      if (p1 !== p2) {
        p1l = positionAlongLine(p1.a, length_of_line) + error_allowed;
        p1r = p1l + p1.h - error_allowed;
        p2l = positionAlongLine(p2.a, length_of_line) + error_allowed;
        p2r = p2l + p2.h - error_allowed;
        if (p1r > p2l && p1l < p2r) {
          p1.collision_r = true;
          p2.collision_l = true;
          collisions.push([p1, p2]);
        } else if (p2r > p1l && p2l < p1r) {
          p1.collision_l = true;
          p2.collision_r = true;
          collisions.push([p1, p2]);
        }
      }
    }
  }
  return collisions;
};

moveSurfaceCollsions = function(polar_coords, length_of_line, radius) {
  var altitude_incr, collisions, k, len, max_moves, move_amount, pc, results;
  for (k = 0, len = polar_coords.length; k < len; k++) {
    pc = polar_coords[k];
    pc.r = radius;
  }
  polar_coords = _.sortBy(polar_coords, function(coords) {
    return coords.a;
  });
  move_amount = 0.2 / 360 * 2 * Math.PI;
  altitude_incr = 0.1 * length_of_line / 360;
  collisions = detectSurfaceCollisions(polar_coords, length_of_line);
  max_moves = 500;
  results = [];
  while (collisions.length > 0 && max_moves > 0) {
    max_moves--;
    console.log('Moved surface labels');
    results.push((function() {
      var l, len1, results1;
      results1 = [];
      for (l = 0, len1 = polar_coords.length; l < len1; l++) {
        pc = polar_coords[l];
        if (pc.collision_l) {
          if (!(pc.oa && pc.or)) {
            pc.oa = pc.a;
            pc.or = pc.r;
          }
          if (pc.a > .5 * Math.PI) {
            pc.a += move_amount;
          } else if (pc.a < -0.5 * Math.PI) {
            pc.a += move_amount;
          } else if (pc.a > -.5 * Math.PI && pc.a < 0) {
            pc.a -= move_amount;
          } else if (pc.a > 0 && pc.a < .5 * Math.PI) {
            pc.a += move_amount;
          }
          pc.collision_l = false;
          pc.r += altitude_incr;
        } else if (pc.collision_r) {
          if (!(pc.oa && pc.or)) {
            pc.oa = pc.a;
            pc.or = pc.r;
          }
          if (pc.a > .5 * Math.PI) {
            pc.a -= move_amount;
          } else if (pc.a < -.5 * Math.PI) {
            pc.a -= move_amount;
          } else if (pc.a > -.5 * Math.PI && pc.a < 0) {
            pc.a += move_amount;
          } else if (pc.a > 0 && pc.a < .5 * Math.PI) {
            pc.a -= move_amount;
          }
          pc.collision_r = false;
          pc.r += altitude_incr;
        }
        results1.push(collisions = detectSurfaceCollisions(polar_coords, length_of_line));
      }
      return results1;
    })());
  }
  return results;
};

polarCoords = function(cart_coords) {
  var cart_coord, k, len, polar_coords;
  polar_coords = [];
  for (k = 0, len = cart_coords.length; k < len; k++) {
    cart_coord = cart_coords[k];
    polar_coords.push(polarCoord(cart_coord));
  }
  return polar_coords;
};

polarCoord = function(cart_coord) {
  return {
    r: Math.sqrt(Math.pow(cart_coord.x, 2) + Math.pow(cart_coord.y, 2)),
    a: Math.atan2(cart_coord.y, cart_coord.x),
    h: cart_coord.h
  };
};

cartesianCoords = function(polar_coords) {
  var cart_coords, k, len, polar_coord;
  cart_coords = [];
  for (k = 0, len = polar_coords.length; k < len; k++) {
    polar_coord = polar_coords[k];
    cart_coords.push(cartesianCoord(polar_coord));
  }
  return cart_coords;
};

cartesianCoord = function(polar_coord) {
  return {
    x: polar_coord.r * Math.cos(polar_coord.a),
    y: polar_coord.r * Math.sin(polar_coord.a),
    h: polar_coord.h
  };
};

positionAlongLine = function(rad, length_of_line) {
  return ((rad + Math.PI) / (2 * Math.PI)) * length_of_line;
};

calculateLabelRotation = function(angle_rad) {
  return angle_rad / 2 / Math.PI * 360;
};

detectViewportCollision = function(surface_label, viewport_height, viewport_width) {
  var box;
  box = surface_label.getBBox();
  box.right = box.x + box.width;
  box.left = box.x;
  box.top = box.y;
  box.bottom = box.y + box.width;
  return box.left < 0 || box.bottom > viewport_height || box.right > viewport_width || box.top < 0;
};

condenseSurfaceLabel = function(surface_label, viewport_height, viewport_width) {
  var innerHTML;
  while (detectViewportCollision(surface_label, viewport_height, viewport_width)) {
    innerHTML = d3.select(surface_label)[0][0].textContent;
    d3.select(surface_label).text(innerHTML.slice(0, -1));
  }
  innerHTML = d3.select(surface_label)[0][0].textContent;
  return d3.select(surface_label).text(innerHTML.slice(0, -3) + '...');
};

adjustSurfaceLabelLength = function(surface_labels, view_height, view_width) {
  var k, len, results, surface_label;
  results = [];
  for (k = 0, len = surface_labels.length; k < len; k++) {
    surface_label = surface_labels[k];
    if (detectViewportCollision(surface_label, view_height, view_width)) {
      results.push(condenseSurfaceLabel(surface_label, view_height, view_width));
    } else {
      results.push(void 0);
    }
  }
  return results;
};

detectCoreLabelBoundaryCollision = function(core_label, radius, cx, cy) {
  var angle, circle_boundary_right, core_label_bb, x_right, y_right;
  core_label_bb = core_label.getBBox();
  y_right = core_label_bb.y;
  x_right = core_label_bb.x + core_label_bb.width;
  angle = Math.asin((y_right - cy) / radius);
  circle_boundary_right = cx + radius * Math.cos(angle);
  return circle_boundary_right < x_right;
};

coreLabelTooLong = function(core_label, radius) {
  return core_label.getBBox().width > radius;
};

failsCoreLabelBoundaryRules = function(core_label, radius, cx, cy) {
  return detectCoreLabelBoundaryCollision(core_label, radius, cx, cy) || coreLabelTooLong(core_label, radius);
};

condenseCoreLabel = function(core_label, radius, cx, cy) {
  var innerHTML;
  while (failsCoreLabelBoundaryRules(core_label, radius, cx, cy)) {
    innerHTML = d3.select(core_label)[0][0].textContent;
    d3.select(core_label).text(innerHTML.slice(0, -1));
  }
  innerHTML = d3.select(core_label)[0][0].textContent;
  return d3.select(core_label).text(innerHTML.slice(0, -3) + '...');
};

extendFullLabelName = function(labels) {
  var k, label, len, results;
  results = [];
  for (k = 0, len = labels.length; k < len; k++) {
    label = labels[k];
    results.push(d3.select(label).text(d3.select(label).attr('title')));
  }
  return results;
};

adjustCoreLabelLength = function(core_labels, radius, cx, cy) {
  var core_label, k, len, results;
  extendFullLabelName(core_labels);
  results = [];
  for (k = 0, len = core_labels.length; k < len; k++) {
    core_label = core_labels[k];
    if (failsCoreLabelBoundaryRules(core_label, radius, cx, cy)) {
      results.push(condenseCoreLabel(core_label, radius, cx, cy));
    } else {
      results.push(void 0);
    }
  }
  return results;
};

distanceFromCenter = function(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
};

normalizeCoreNodes = function(rawCoreNodes) {
  var k, l, len, len1, max, min, node, results, squareX, squareY, threshold;
  threshold = .2;
  max = -Infinity;
  min = Infinity;
  for (k = 0, len = rawCoreNodes.length; k < len; k++) {
    node = rawCoreNodes[k];
    if (node[0] > max) {
      max = node[0];
    }
    if (node[1] > max) {
      max = node[1];
    }
    if (node[0] < min) {
      min = node[0];
    }
    if (node[1] < min) {
      min = node[1];
    }
  }
  results = [];
  for (l = 0, len1 = rawCoreNodes.length; l < len1; l++) {
    node = rawCoreNodes[l];
    squareX = -1 + threshold + (node[0] - min) * (2 - 2 * threshold) / (max - min);
    squareY = -1 + threshold + (node[1] - min) * (2 - 2 * threshold) / (max - min);
    node[0] = squareX * Math.sqrt(1 - 0.5 * Math.pow(squareY, 2));
    results.push(node[1] = squareY * Math.sqrt(1 - 0.5 * Math.pow(squareX, 2)));
  }
  return results;
};

calculateSurfaceNodePositions = function(rawSurfaceNodes) {
  var angle, k, len, node, results;
  results = [];
  for (k = 0, len = rawSurfaceNodes.length; k < len; k++) {
    node = rawSurfaceNodes[k];
    angle = Math.atan2(node[1], node[0]);
    node[0] = Math.cos(angle);
    results.push(node[1] = Math.sin(angle));
  }
  return results;
};

calculateSurfaceLabelSizes = function(rawSurfaceNodes, scaleFactor, equalizeFactor) {
  var k, len, lunarSurfaceSizes, maxSize, node, size;
  lunarSurfaceSizes = [];
  maxSize = -Infinity;
  for (k = 0, len = rawSurfaceNodes.length; k < len; k++) {
    node = rawSurfaceNodes[k];
    size = distanceFromCenter(node[0], node[1]);
    if (size > maxSize) {
      maxSize = size;
    }
    lunarSurfaceSizes.push(size);
  }
  return _.map(lunarSurfaceSizes, function(s) {
    return scaleFactor * Math.pow(s / maxSize, equalizeFactor);
  });
};

drawBackground = function(svg, label_data) {
  return svg.selectAll('.core-label-background').data(label_data).enter().append('rect').attr('class', 'core-label-background').attr('x', function(d) {
    return d.x - 4;
  }).attr('y', function(d) {
    return d.y - d.height + 2;
  }).attr('width', function(d) {
    return d.width + 4;
  }).attr('height', function(d) {
    return d.height + 2;
  }).attr('fill', 'white');
};
