import * as d3 from "d3";

class Utils {

  constructor() {}

  static detectSurfaceCollisions(polar_coords, length_of_line) {
    const error_allowed = 5;
    const collisions = [];
    let i = 0;
    while (i < polar_coords.length) {
      const p1 = polar_coords[i];
      i++;
      let j = i;
      while (j < polar_coords.length) {
        const p2 = polar_coords[j];
        j++;
        if (p1 !== p2) {
          const p1l = this.positionAlongLine(p1.a, length_of_line) + error_allowed;
          const p1r = (p1l + p1.h) - error_allowed;
          const p2l = this.positionAlongLine(p2.a, length_of_line) + error_allowed;
          const p2r = (p2l + p2.h) - error_allowed;
          if ((p1r > p2l) && (p1l < p2r)) {
            p1.collision_r = true;
            p2.collision_l = true;
            collisions.push([p1, p2]);
          } else if ((p2r > p1l) && (p2l < p1r)) {
            p1.collision_l = true;
            p2.collision_r = true;
            collisions.push([p1, p2]);
          }
        }
      }
    }
    return collisions;
  }

  // Move the colliding pairs after collision is detected
  static moveSurfaceCollsions(polar_coords, length_of_line, radius) {
    for (var pc of Array.from(polar_coords)) {
      pc.r = radius;
    }

    polar_coords = _.sortBy(polar_coords, coords => coords.a);
    const move_amount = (0.2 / 360) * 2 * Math.PI; // deg to rad
    const altitude_incr = (0.1 * length_of_line) / 360;
    let collisions = this.detectSurfaceCollisions(polar_coords, length_of_line);

    let max_moves = 500;
    return (() => {
      const result = [];
      while ((collisions.length > 0) && (max_moves > 0)) {
        max_moves--;
        console.log('Moved surface labels');
        result.push((() => {
          const result1 = [];
          for (pc of Array.from(polar_coords)) {
            if (pc.collision_l) {
              // Save original coords
              if (!pc.oa || !pc.or) {
                pc.oa = pc.a;
                pc.or = pc.r;
              }

              if (pc.a > (.5*Math.PI)) { // UL
                pc.a += move_amount;
              } else if (pc.a < (-0.5*Math.PI)) { // LL
                pc.a += move_amount;
              } else if ((pc.a > (-.5*Math.PI)) && (pc.a < 0)) { //LR
                pc.a += move_amount;
              } else if ((pc.a > 0) && (pc.a < (.5*Math.PI))) { //UR
                pc.a += move_amount;
              }
              pc.collision_l = false;
              pc.r += altitude_incr;

            } else if (pc.collision_r) {
              // Save original coords
              if (!pc.oa || !pc.or) {
                pc.oa = pc.a;
                pc.or = pc.r;
              }

              if (pc.a > (.5*Math.PI)) { //UL
                pc.a -= move_amount;
              } else if (pc.a < (-.5*Math.PI)) { //LL
                pc.a -= move_amount;
              } else if ((pc.a > (-.5*Math.PI)) && (pc.a < 0)) { //LR
                pc.a -= move_amount;
              } else if ((pc.a > 0) && (pc.a < (.5*Math.PI))) { //UR
                pc.a -= move_amount;
              }

              pc.collision_r = false;
              pc.r += altitude_incr;
            }

            result1.push(collisions = this.detectSurfaceCollisions(polar_coords, length_of_line));
          }
          return result1;
        })());
      }
      return result;
    })();
  }

  // Convert Cartesian to polar coordinates
  static polarCoords(cart_coords) {
    const polar_coords = [];
    for (let cart_coord of Array.from(cart_coords)) {
      polar_coords.push(this.polarCoord(cart_coord));
    }
    return polar_coords;
  }

  static polarCoord(cart_coord) {
    return ({
      r: Math.sqrt(Math.pow(cart_coord.x,2) + Math.pow(cart_coord.y,2)),
      a: Math.atan2(cart_coord.y, cart_coord.x),
      h: cart_coord.h
    })
  }

  // Convert polar to Cartesian coordinates
  static cartesianCoords(polar_coords) {
    const cart_coords = [];
    for (let polar_coord of Array.from(polar_coords)) {
      cart_coords.push(this.cartesianCoord(polar_coord));
    }
    return cart_coords;
  };

  static cartesianCoord(polar_coord) {
    return ({
      x: polar_coord.r * Math.cos(polar_coord.a),
      y: polar_coord.r * Math.sin(polar_coord.a),
      h: polar_coord.h
    })
  }

  // Translate angles to position on line
  static positionAlongLine(rad, length_of_line) {
    ((rad + Math.PI) / (2*Math.PI)) * length_of_line;
  }

  static calculateLabelRotation(angle_rad) {
    return (angle_rad / 2 / Math.PI) * 360
  }

  static detectViewportCollision(surface_label, viewport_height, viewport_width) {
    const getScreenCoords = function(x, y, ctm) {
      const xn = ctm.e + (x*ctm.a) + (y*ctm.c);
      const yn = ctm.f + (x*ctm.b) + (y*ctm.d);
      return { x: xn, y: yn };
    };

    // Pass if there is no more text to condense
    if (d3.select(surface_label).node().textContent === "") {
      return false;
    }

    const box = surface_label.getBBox();
    const ctm = surface_label.getCTM();
    const transformedCoords = getScreenCoords(box.x, box.y, ctm);
    box.right = transformedCoords.x + box.width;
    box.left = transformedCoords.x;
    box.top = transformedCoords.y;
    box.bottom = transformedCoords.y + box.height;

    const collideL = box.left < 0;
    const collideR = box.right > viewport_width;
    let collideT = false;
    let collideB = false;
    if (box.x < (viewport_width/2)) { // only need to condense text on left half
      collideT = box.top < 0;
      collideB = box.bottom > viewport_height;
    }
    return collideL || collideR || collideT || collideB;
  };

  static condenseSurfaceLabel(surface_label, viewport_height, viewport_width) {
    // Throw away chars one at a time and check if still collides w/viewport
    let innerHTML;
    while (this.detectViewportCollision(surface_label, viewport_height, viewport_width)) {
      innerHTML = d3.select(surface_label).node().textContent;
      d3.select(surface_label).text(innerHTML.slice(0, -1));
    }
    innerHTML = d3.select(surface_label).node().textContent;
    return d3.select(surface_label).text(innerHTML.slice(0, -3) + '...');
  };

  static adjustSurfaceLabelLength(surface_labels, view_height, view_width) {
    this.extendFullLabelName(surface_labels);
    const result = [];
    for (let surface_label of Array.from(surface_labels)) {
      if (this.detectViewportCollision(surface_label, view_height, view_width)) {
        this.condenseSurfaceLabel(surface_label, view_height, view_width);
      }
      const tooltipText = d3.select(surface_label).attr('title');
      result.push(d3.select(surface_label).append('title').text(tooltipText));
    }
    return result;
  };

  // Detect collisions with lunar core labels and moon surface
  static detectCoreLabelBoundaryCollision(core_label, radius, cx, cy) {
    const core_label_bb = core_label.getBBox();
    const y_rightB = core_label_bb.y;
    const y_rightT = core_label_bb.y + (core_label_bb.height/2);
    const x_right = core_label_bb.x + core_label_bb.width;

    // Calculate circle boundary using parametric eq for circle
    const angleB = Math.asin((y_rightB - cy)/radius);
    const angleT = Math.asin((y_rightT - cy)/radius);
    const circle_boundary_rightB = cx + (radius*Math.cos(angleB));
    const circle_boundary_rightT = cx + (radius*Math.cos(angleT));

    return (circle_boundary_rightB < x_right) || (circle_boundary_rightT < x_right);
  };

  static failsCoreLabelBoundaryRules(core_label, radius, cx, cy) {
    return this.detectCoreLabelBoundaryCollision(core_label, radius, cx, cy);
  }

  static condenseCoreLabel(core_label, radius, cx, cy) {
    let innerHTML;
    while (this.failsCoreLabelBoundaryRules(core_label, radius, cx, cy)) {
      innerHTML = d3.select(core_label).node().textContent;
      d3.select(core_label).text(innerHTML.slice(0, -1));
    }
    innerHTML = d3.select(core_label).node().textContent;
    d3.select(core_label).text(innerHTML.slice(0, -3) + '...');
    return d3.select(core_label).data()[0].width = core_label.getBBox().width;
  };

  static extendFullLabelName(labels) {
    return Array.from(labels).map((label) =>
      d3.select(label).text(d3.select(label).attr('title')))
  }

  static adjustCoreLabelLength(core_labels, radius, cx, cy) {
    this.extendFullLabelName(core_labels);
    const result = [];
    for (let core_label of Array.from(core_labels)) {
      if (this.failsCoreLabelBoundaryRules(core_label, radius, cx, cy)) {
        this.condenseCoreLabel(core_label, radius, cx, cy);
      }
      result.push(d3.select(core_label).append('title').text(d3.select(core_label).attr('title')));
    }
    return result;
  };

  static distanceFromCenter(x, y) {
    return Math.sqrt(Math.pow(x,2) + Math.pow(y, 2));
  }

  static normalizeCoreNodes(rawCoreNodes) {
    // normalization between -1 and 1 (padded by threshold)
    const threshold = 0.1;
    let maxMag = -Infinity;
    for (var node of Array.from(rawCoreNodes)) {
      const magnitude = Math.sqrt(Math.pow(node[0], 2) + Math.pow(node[1], 2));
      if (magnitude > maxMag) { maxMag = magnitude; }
    }

    maxMag *= 1 + threshold;
    for (node of Array.from(rawCoreNodes)) {
      node[0] = node[0]/maxMag;
      node[1] = node[1]/maxMag;
    }
  };

  static calculateSurfaceNodePositions(rawSurfaceNodes) {
    const result = [];
    for (let node of Array.from(rawSurfaceNodes)) {
      const angle = Math.atan2(node[1], node[0]);
      node[0] = Math.cos(angle);
      result.push(node[1] = Math.sin(angle));
    }
    return result;
  }

  static calculateSurfaceLabelSizes(rawSurfaceNodes, scaleFactor, equalizeFactor) {
    const lunarSurfaceSizes = [];
    let maxSize = -Infinity;
    for (let node of Array.from(rawSurfaceNodes)) {
      const size = this.distanceFromCenter(node[0], node[1]);
      if (size > maxSize) { maxSize = size; }
      lunarSurfaceSizes.push(size);
    }

    return _.map(lunarSurfaceSizes, s => scaleFactor * Math.pow((s / maxSize), equalizeFactor));
  };

  static adjustCoreLinks(svg, lunar_core_labels, anchor_array, link_width) {
    const newPtOnLabelBorder = function(lab, anc) {
      const p = [
        [lab.x - (lab.width/2),     lab.y],                   // botL - 0
        [lab.x,                   lab.y],                   // botC - 1
        [lab.x + (lab.width/2),     lab.y],                   // botR - 2
        [lab.x - (lab.width/2),     (lab.y - lab.height) + 2],  // topL - 3
        [lab.x,                   (lab.y - lab.height) + 2],  // topC - 4
        [lab.x + (lab.width/2),     (lab.y - lab.height) + 2],  // topR - 5
        [lab.x - (lab.width/2),     lab.y - (lab.height/2)],    // midL - 6
        [lab.x + (lab.width/2),     lab.y - (lab.height/2)]    // midR - 7
      ];

      const padding = 10;
      const centered = (anc.x > (lab.x - (lab.width/2))) && (anc.x < (lab.x + (lab.width/2)));
      const paddedCenter = (anc.x > (lab.x - (lab.width/2) - padding)) && (anc.x < (lab.x + (lab.width/2) + padding));
      const abovePadded = anc.y < (lab.y - lab.height - padding);
      const above = anc.y < (lab.y - lab.height);
      const aboveMid = anc.y < (lab.y - (lab.height/2));
      const belowPadded = anc.y > (lab.y + padding);
      const below = anc.y > lab.y;
      const belowMid = anc.y >= (lab.y - (lab.height/2));
      const left = anc.x < (lab.x - (lab.width/2));
      const right = anc.x > (lab.x + (lab.width/2));
      const leftPadded = anc.x < (lab.x - (lab.width/2) - padding);
      const rightPadded = anc.x > (lab.x + (lab.width/2) + padding);

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
        // Draw the link if there are any anc nearby
        const ambiguityFactor = 10;
        const padL = p[3][0] - ambiguityFactor;
        const padR = p[5][0] + ambiguityFactor;
        const padT = p[3][1] - ambiguityFactor;
        const padB = p[2][1] + ambiguityFactor;
        let ancNearby = 0;
        for (anc of Array.from(anchor_array)) {
          if (((anc.x > padL) && (anc.x < padR)) && ((anc.y > padT) && (anc.y < padB))) {
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

    let j = 0;
    return (() => {
      const result = [];
      while (j < lunar_core_labels.length) {
        const newLinkPt = newPtOnLabelBorder(lunar_core_labels[j], anchor_array[j]);
        // d3.select('svg').append('circle').attr('cx', newLinkPt[0])
        //                     .attr('stroke-width',1)
        //                     .attr('class', 'core-anchor')
        //                     .attr('fill', 'blue')
        //                     .attr('cy', newLinkPt[1])
        //                     .attr('r', 2)
        //                     .attr('stroke')
        if (newLinkPt != null) {
          svg.append('line').attr('class', 'core-link')
          .attr('x1', anchor_array[j].x)
          .attr('y1', anchor_array[j].y)
          .attr('x2', newLinkPt[0])
          .attr('y2', newLinkPt[1])
          .attr('stroke-width', link_width)
          .attr('stroke', 'gray');
        }
        result.push(j++);
      }
      return result;
    })();
  };
}

module.exports = Utils