var adjustCoreLabelLength, adjustCoreLinks, adjustSurfaceLabelLength, calculateLabelRotation, calculateSurfaceLabelSizes, calculateSurfaceNodePositions, cartesianCoord, cartesianCoords, condenseCoreLabel, condenseSurfaceLabel, detectCoreLabelBoundaryCollision, detectSurfaceCollisions, detectViewportCollision, distanceFromCenter, extendFullLabelName, failsCoreLabelBoundaryRules, moveSurfaceCollsions, normalizeCoreNodes, polarCoord, polarCoords, positionAlongLine;

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
            pc.a += move_amount;
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
            pc.a -= move_amount;
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
  var box, collideB, collideL, collideR, collideT, ctm, getScreenCoords, transformedCoords;
  getScreenCoords = function(x, y, ctm) {
    var xn, yn;
    xn = ctm.e + x * ctm.a + y * ctm.c;
    yn = ctm.f + x * ctm.b + y * ctm.d;
    return {
      x: xn,
      y: yn
    };
  };
  if (d3.select(surface_label)[0][0].textContent === "") {
    return false;
  }
  box = surface_label.getBBox();
  ctm = surface_label.getCTM();
  transformedCoords = getScreenCoords(box.x, box.y, ctm);
  box.right = transformedCoords.x + box.width;
  box.left = transformedCoords.x;
  box.top = transformedCoords.y;
  box.bottom = transformedCoords.y + box.height;
  collideL = box.left < 0;
  collideR = box.right > viewport_width;
  collideT = false;
  collideB = false;
  if (box.x < viewport_width / 2) {
    collideT = box.top < 0;
    collideB = box.bottom > viewport_height;
  }
  return collideL || collideR || collideT || collideB;
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
  var k, len, results, surface_label, tooltipText;
  extendFullLabelName(surface_labels);
  results = [];
  for (k = 0, len = surface_labels.length; k < len; k++) {
    surface_label = surface_labels[k];
    if (detectViewportCollision(surface_label, view_height, view_width)) {
      condenseSurfaceLabel(surface_label, view_height, view_width);
    }
    tooltipText = d3.select(surface_label).attr('title');
    results.push(d3.select(surface_label).append('title').text(tooltipText));
  }
  return results;
};

detectCoreLabelBoundaryCollision = function(core_label, radius, cx, cy) {
  var angleB, angleT, circle_boundary_rightB, circle_boundary_rightT, core_label_bb, x_right, y_rightB, y_rightT;
  core_label_bb = core_label.getBBox();
  y_rightB = core_label_bb.y;
  y_rightT = core_label_bb.y + core_label_bb.height / 2;
  x_right = core_label_bb.x + core_label_bb.width;
  angleB = Math.asin((y_rightB - cy) / radius);
  angleT = Math.asin((y_rightT - cy) / radius);
  circle_boundary_rightB = cx + radius * Math.cos(angleB);
  circle_boundary_rightT = cx + radius * Math.cos(angleT);
  return circle_boundary_rightB < x_right || circle_boundary_rightT < x_right;
};

failsCoreLabelBoundaryRules = function(core_label, radius, cx, cy) {
  return detectCoreLabelBoundaryCollision(core_label, radius, cx, cy);
};

condenseCoreLabel = function(core_label, radius, cx, cy) {
  var innerHTML;
  while (failsCoreLabelBoundaryRules(core_label, radius, cx, cy)) {
    innerHTML = d3.select(core_label)[0][0].textContent;
    d3.select(core_label).text(innerHTML.slice(0, -1));
  }
  innerHTML = d3.select(core_label)[0][0].textContent;
  d3.select(core_label).text(innerHTML.slice(0, -3) + '...');
  return d3.select(core_label).data()[0].width = core_label.getBBox().width;
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
      condenseCoreLabel(core_label, radius, cx, cy);
    }
    results.push(d3.select(core_label).append('title').text(d3.select(core_label).attr('title')));
  }
  return results;
};

distanceFromCenter = function(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
};

normalizeCoreNodes = function(rawCoreNodes) {
  var k, l, len, len1, magnitude, max, node, results, threshold;
  threshold = 0.1;
  max = -Infinity;
  for (k = 0, len = rawCoreNodes.length; k < len; k++) {
    node = rawCoreNodes[k];
    if (Math.abs(node[0]) > max) {
      max = Math.abs(node[0]);
    }
    if (Math.abs(node[1]) > max) {
      max = Math.abs(node[1]);
    }
  }
  magnitude = Math.sqrt(Math.pow(max, 2) + Math.pow(max, 2)) * (1 + threshold);
  results = [];
  for (l = 0, len1 = rawCoreNodes.length; l < len1; l++) {
    node = rawCoreNodes[l];
    node[0] = node[0] / magnitude;
    results.push(node[1] = node[1] / magnitude);
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

adjustCoreLinks = function(lunar_core_labels, anchor_array, link_width) {
  var j, newLinkPt, newPtOnLabelBorder, results;
  newPtOnLabelBorder = function(lab, anc) {
    var above, aboveMid, abovePadded, ambiguityFactor, ancNearby, below, belowMid, belowPadded, centered, k, left, leftPadded, len, p, padB, padL, padR, padT, paddedCenter, padding, right, rightPadded;
    p = [[lab.x - lab.width / 2, lab.y], [lab.x, lab.y], [lab.x + lab.width / 2, lab.y], [lab.x - lab.width / 2, lab.y - lab.height + 2], [lab.x, lab.y - lab.height + 2], [lab.x + lab.width / 2, lab.y - lab.height + 2], [lab.x - lab.width / 2, lab.y - lab.height / 2], [lab.x + lab.width / 2, lab.y - lab.height / 2]];
    padding = 10;
    centered = (anc.x > lab.x - lab.width / 2) && (anc.x < lab.x + lab.width / 2);
    paddedCenter = (anc.x > lab.x - lab.width / 2 - padding) && (anc.x < lab.x + lab.width / 2 + padding);
    abovePadded = anc.y < lab.y - lab.height - padding;
    above = anc.y < lab.y - lab.height;
    aboveMid = anc.y < lab.y - lab.height / 2;
    belowPadded = anc.y > lab.y + padding;
    below = anc.y > lab.y;
    belowMid = anc.y >= lab.y - lab.height / 2;
    left = anc.x < lab.x - lab.width / 2;
    right = anc.x > lab.x + lab.width / 2;
    leftPadded = anc.x < lab.x - lab.width / 2 - padding;
    rightPadded = anc.x > lab.x + lab.width / 2 + padding;
    if (centered && abovePadded) {
      return p[4];
    } else if (centered && belowPadded) {
      return p[1];
    } else if (above && left) {
      return p[3];
    } else if (above && right) {
      return p[5];
    } else if (below && left) {
      return p[0];
    } else if (below && right) {
      return p[2];
    } else if (leftPadded) {
      return p[6];
    } else if (rightPadded) {
      return p[7];
    } else {
      ambiguityFactor = 10;
      padL = p[3][0] - ambiguityFactor;
      padR = p[5][0] + ambiguityFactor;
      padT = p[3][1] - ambiguityFactor;
      padB = p[2][1] + ambiguityFactor;
      ancNearby = 0;
      for (k = 0, len = anchor_array.length; k < len; k++) {
        anc = anchor_array[k];
        if ((anc.x > padL && anc.x < padR) && (anc.y > padT && anc.y < padB)) {
          ancNearby++;
        }
      }
      if (ancNearby > 1) {
        if (!left && !right && !above && !below) {
          return p[1];
        } else if (centered && above) {
          return p[4];
        } else if (centered && below) {
          return p[1];
        } else if (left && above) {
          return p[3];
        } else if (left && below) {
          return p[0];
        } else if (right && above) {
          return p[5];
        } else if (right && below) {
          return p[2];
        } else if (left) {
          return p[6];
        } else if (right) {
          return p[7];
        }
      }
    }
  };
  j = 0;
  results = [];
  while (j < lunar_core_labels.length) {
    newLinkPt = newPtOnLabelBorder(lunar_core_labels[j], anchor_array[j]);
    if (newLinkPt != null) {
      svg.append('line').attr('class', 'core-link').attr('x1', anchor_array[j].x).attr('y1', anchor_array[j].y).attr('x2', newLinkPt[0]).attr('y2', newLinkPt[1]).attr('stroke-width', link_width).attr('stroke', 'gray');
    }
    results.push(j++);
  }
  return results;
};
