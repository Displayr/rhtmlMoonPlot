(function() {

d3.labeler = function() {
  // Use Mersenne Twister seeded random number generator
  var random = new Random(Random.engines.mt19937().seed(1));
  // var random = new Random();

  var lab = [],
      anc = [],
      cx = 1;
      cy = 1;
      radius = 1;
      labeler = {}
      svg = {};

  var max_move = 5.0,
      max_angle = 2*3.1415,
      acc = 0;
      rej = 0;

  // weights
  var w_len = 5.0, // leader line length
      w_inter = 1.0, // leader line intersection
      w_lablink = 2.0, // leader line-label intersection
      w_lab2 = 10.0, // label-label overlap
      w_lab_anc = 8.0; // label-anchor overlap
      w_orient = 0.5; // orientation bias

  // booleans for user defined functions
  var user_energy = false,
      user_schedule = false;

  var user_defined_energy,
      user_defined_schedule;

  energy = function(index) {
  // energy function, tailored for label placement

      var m = lab.length,
          ener = 0,
          dx = lab[index].x + lab[index].width/2 - anc[index].x,
          dy = anc[index].y - lab[index].y,
          dy2 = anc[index].y - (lab[index].y - lab[index].height),
          dist = Math.sqrt(dx * dx + dy * dy),
          dist2 = Math.sqrt(dx * dx + dy2 * dy2),
          overlap = true,
          amount = 0
          theta = 0;

      // penalty for length of leader line
      if (dist < dist2) {
        if (dist > 0) ener += dist * w_len;
      } else {
        if (dist2 > 0) ener += dist2 * w_len;
      }

      // label orientation bias
      dx /= dist;
      dy /= dist;
      if (dx > 0 && dy > 0) { ener += 0 * w_orient; }
      else if (dx < 0 && dy > 0) { ener += 1 * w_orient; }
      else if (dx < 0 && dy < 0) { ener += 2 * w_orient; }
      else { ener += 3 * w_orient; }

      var x21 = lab[index].x - lab[index].width/2,
          y21 = lab[index].y - lab[index].height,
          x22 = lab[index].x + lab[index].width/2,
          y22 = lab[index].y;
      var x11, x12, y11, y12, x_overlap, y_overlap, overlap_area;

      for (var i = 0; i < m; i++) {
        if (i != index) {

          // penalty for intersection of leader lines
          overlap = intersect(anc[index].x, lab[index].x + lab[index].width/2, anc[i].x, lab[i].x + lab[i].width/2,
                          anc[index].y, lab[index].y, anc[i].y, lab[i].y);
          if (overlap) ener += w_inter;

          // penalty for label-label overlap
          x11 = lab[i].x - lab[i].width/2;
          y11 = lab[i].y - lab[i].height;
          x12 = lab[i].x + lab[i].width/2;
          y12 = lab[i].y;
          x_overlap = Math.max(0, Math.min(x12,x22) - Math.max(x11,x21));
          y_overlap = Math.max(0, Math.min(y12,y22) - Math.max(y11,y21 + 2.0));
          overlap_area = x_overlap * y_overlap;
          ener += (overlap_area * w_lab2);
          }

          // penalty for label-anchor overlap
          x11 = anc[i].x - anc[i].r;
          y11 = anc[i].y - anc[i].r;
          x12 = anc[i].x + anc[i].r;
          y12 = anc[i].y + anc[i].r;
          x_overlap = Math.max(0, Math.min(x12,x22) - Math.max(x11,x21));
          y_overlap = Math.max(0, Math.min(y12,y22) - Math.max(y11,y21));
          overlap_area = x_overlap * y_overlap;
          ener += (overlap_area * w_lab_anc);

          // penalty for label-leader line intersection
          var intersecBottom = intersect(lab[index].x, lab[index].x + lab[index].width, anc[i].x, lab[i].x + lab[i].width,
                                   lab[index].y, lab[index].y, anc[i].y, lab[i].y
                                  )

          var intersecTop = intersect(lab[index].x, lab[index].x + lab[index].width, anc[i].x, lab[i].x + lab[i].width,
                               lab[index].y-lab[index].height, lab[index].y-lab[index].height, anc[i].y, lab[i].y
                             );
          if (intersecBottom) ener += w_lablink
          if (intersecTop) ener += w_lablink;
      }
      return ener;
  };

  initLabBoundaries = function(lab, anc, i) {
    boundaryBuffer = 5
    if (lab[i].y - lab[i].height < cy - radius) { //top
      lab[i].y = cy - radius + lab[i].height + boundaryBuffer;
    }
    else if (lab[i].y > cy + radius) { //bot
      lab[i].y = cy + radius - boundaryBuffer;
    }


    asinangleT = Math.asin((lab[i].y - cy - lab[i].height)/radius);
    asinangleB = Math.asin((lab[i].y - cy)/radius);
    investigate = null
    investigate = 5

    //right
    if (lab[i].x + lab[i].width > cx + radius*Math.cos(asinangleT) ||
        lab[i].x + lab[i].width > cx + radius*Math.cos(asinangleB)) {
      if (lab[i].y < cy) {
        lab[i].x = cx + radius*Math.cos(asinangleT) - lab[i].width;
      }
      else {
        lab[i].x = cx + radius*Math.cos(asinangleB) - lab[i].width;
      }
      // if (i==investigate) svg.append('rect').attr('x', lab[i].x)
      //                   .attr('y', lab[i].y - lab[i].height)
      //                   .attr('width', lab[i].width)
      //                   .attr('height', lab[i].height)
      //                   .attr('fill', 'yellow')
      //                   .attr('fill-opacity', 0.1);
    }
    //left
    else if (lab[i].x < cx - radius*Math.cos(asinangleT) ||
             lab[i].x < cx - radius*Math.cos(asinangleB)) {
     if (lab[i].y < cy) {
       lab[i].x = cx - radius*Math.cos(asinangleT);
     }
     else {
       lab[i].x = cx - radius*Math.cos(asinangleB);
     }
    //  if (i==investigate) svg.append('rect').attr('x', lab[i].x)
    //                    .attr('y', lab[i].y - lab[i].height)
    //                    .attr('width', lab[i].width)
    //                    .attr('height', lab[i].height)
    //                    .attr('fill', 'blue')
    //                    .attr('fill-opacity', 0.1);
    }
  }

  adjustForBoundaries = function(lab, anc, i, x_old, y_old) {
    asinangleT = Math.asin((lab[i].y - cy - lab[i].height)/radius);
    asinangleB = Math.asin((lab[i].y - cy)/radius);
    investigate = null
    // investigate = 4


    //right
    if (lab[i].x + lab[i].width > cx + radius*Math.cos(asinangleT) ||
        lab[i].x + lab[i].width > cx + radius*Math.cos(asinangleB)) {
      if (lab[i].y < cy) {
        lab[i].x = cx + radius*Math.cos(asinangleT) - lab[i].width;
      }
      else {
        lab[i].x = cx + radius*Math.cos(asinangleB) - lab[i].width;
      }
      // if (i==investigate) svg.append('rect').attr('x', lab[i].x)
      //                   .attr('y', lab[i].y - lab[i].height)
      //                   .attr('width', lab[i].width)
      //                   .attr('height', lab[i].height)
      //                   .attr('fill', 'yellow')
      //                   .attr('fill-opacity', 0.1);
      // if (i==investigate) svg.append('rect').attr('x', x_old)
      //                   .attr('y', lab[i].y - lab[i].height)
      //                   .attr('width', lab[i].width)
      //                   .attr('height', lab[i].height)
      //                   .attr('fill', 'black')
      //                   .attr('fill-opacity', 0.1);

    }
    //left
    if (lab[i].x < cx - radius*Math.cos(asinangleT) || lab[i].x < cx - radius*Math.cos(asinangleB)) {
      if (i==investigate) svg.append('rect').attr('x', lab[i].x)
                        .attr('y', lab[i].y - lab[i].height)
                        .attr('width', lab[i].width)
                        .attr('height', lab[i].height)
                        .attr('fill', 'green')
                        .attr('fill-opacity', 0.1);
      if (lab[i].y < cy) {
        lab[i].x = cx - radius*Math.cos(asinangleT);
      }
      else {
        lab[i].x = cx - radius*Math.cos(asinangleB);
      }


      if (i==investigate) svg.append('rect').attr('x', x_old)
                        .attr('y', y_old - lab[i].height)
                        .attr('width', lab[i].width)
                        .attr('height', lab[i].height)
                        .attr('fill', 'red')
                        .attr('fill-opacity', 0.1);
      if (i==investigate) svg.append('rect').attr('x', lab[i].x)
                        .attr('y', lab[i].y - lab[i].height)
                        .attr('width', lab[i].width)
                        .attr('height', lab[i].height)
                        .attr('fill', 'blue')
                        .attr('fill-opacity', 0.1);
    }
  }

  mcmove = function(currT) {
  // Monte Carlo translation move

      // select a random label
      var i = Math.floor(random.real(0,1) * lab.length);

      // save old coordinates
      var x_old = lab[i].x;
      var y_old = lab[i].y;

      // old energy
      var old_energy;
      if (user_energy) {old_energy = user_defined_energy(i, lab, anc)}
      else {old_energy = energy(i)}

      // random translation
      lab[i].x += (random.real(0,1) - 0.5) * max_move;
      lab[i].y += (random.real(0,1) - 0.5) * max_move;

      // hard wall boundaries
      boundaryBuffer = 5
      if (lab[i].y - lab[i].height < cy - radius) { //top
        lab[i].y = cy - radius + lab[i].height + boundaryBuffer;
      }
      else if (lab[i].y > cy + radius) { //bot
        lab[i].y = cy + radius - boundaryBuffer;
      }
      adjustForBoundaries(lab, anc, i, x_old, y_old);

      // new energy
      var new_energy;
      if (user_energy) {new_energy = user_defined_energy(i, lab, anc)}
      else {new_energy = energy(i)}

      // delta E
      var delta_energy = new_energy - old_energy;

      if (random.real(0,1) < Math.exp(-delta_energy / currT)) {
      // if (delta_energy < 0) {
        acc += 1;
      } else {
        // move back to old coordinates
        lab[i].x = x_old;
        lab[i].y = y_old;
        rej += 1;
      }

  };

  mcrotate = function(currT) {
  // Monte Carlo rotation move

      // select a random label
      var i = Math.floor(random.real(0,1) * lab.length);

      // save old coordinates
      var x_old = lab[i].x;
      var y_old = lab[i].y;

      // old energy
      var old_energy;
      if (user_energy) {old_energy = user_defined_energy(i, lab, anc)}
      else {old_energy = energy(i)}

      // random angle
      var angle = (random.real(0,1) - 0.5) * max_angle;

      var s = Math.sin(angle);
      var c = Math.cos(angle);

      // translate label (relative to anchor at origin):
      lab[i].x -= anc[i].x
      lab[i].y -= anc[i].y

      // rotate label
      var x_new = lab[i].x * c - lab[i].y * s,
          y_new = lab[i].x * s + lab[i].y * c;

      // translate label back
      lab[i].x = x_new + anc[i].x
      lab[i].y = y_new + anc[i].y

      // hard wall boundaries
      boundaryBuffer = 5
      if (lab[i].y < cy - radius + lab[i].height) {
        lab[i].y = cy - radius + lab[i].height + boundaryBuffer;
      }
      else if (lab[i].y > cy + radius) {
        lab[i].y = cy + radius - boundaryBuffer;
      }
      adjustForBoundaries(lab, anc, i, x_old, y_old);

      // new energy
      var new_energy;
      if (user_energy) {new_energy = user_defined_energy(i, lab, anc)}
      else {new_energy = energy(i)}

      // delta E
      var delta_energy = new_energy - old_energy;

      if (random.real(0,1) < Math.exp(-delta_energy / currT)) {
      // if (delta_energy < 0) {
        acc += 1;
        // svg.append('rect').attr('x', lab[i].x)
        //                   .attr('y', lab[i].y - lab[i].height)
        //                   .attr('width', lab[i].width)
        //                   .attr('height', lab[i].height)
        //                   .attr('fill', 'yellow')
        //                   .attr('fill-opacity', 0.1);
      } else {
        // move back to old coordinates
        lab[i].x = x_old;
        lab[i].y = y_old;
        rej += 1;

        // svg.append('rect').attr('x', lab[i].x)
        //                   .attr('y', lab[i].y - lab[i].height)
        //                   .attr('width', lab[i].width)
        //                   .attr('height', lab[i].height)
        //                   .attr('fill', 'purple')
        //                   .attr('fill-opacity', 0.1);
      }

  };

  intersect = function(x1, x2, x3, x4, y1, y2, y3, y4) {
  // returns true if two lines intersect, else false
  // from http://paulbourke.net/geometry/lineline2d/

    var mua, mub;
    var denom, numera, numerb;

    denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    numera = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
    numerb = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);

    /* Is the intersection along the the segments */
    mua = numera / denom;
    mub = numerb / denom;
    if (!(mua < 0 || mua > 1 || mub < 0 || mub > 1)) {
        return true;
    }
    return false;
  }

  cooling_schedule = function(currT, initialT, nsweeps) {
  // linear cooling
    return (currT - (initialT / nsweeps));
  }

  labeler.start = function(nsweeps) {
    for (var i = 0; i < lab.length; i++) {
      initLabBoundaries(lab, anc, i);
    }

    // main simulated annealing function
      var m = lab.length,
          currT = 1.0,
          initialT = 1.0;

      for (var i = 0; i < nsweeps; i++) {
        for (var j = 0; j < m; j++) {
          if (random.real(0,1) < 0.5) { mcmove(currT); }
          else { mcrotate(currT); }
        }
        currT = cooling_schedule(currT, initialT, nsweeps);
      }
      for(var i=0; i<lab.length;i++) {
        lab[i].x += lab[i].width/2;
      }
  };

  labeler.cx = function(x) {
    if(!arguments.length) return cx;
    cx = x;
    return labeler;
  }

  labeler.svg = function(x) {
    svg = x;
    return labeler;
  }

  labeler.cy = function(x) {
    if(!arguments.length) return cy;
    cy = x;
    return labeler;
  }

  labeler.radius = function(x) {
    if(!arguments.length) return radius;
    radius = x;
    return labeler;
  }

  labeler.label = function(x) {
  // users insert label positions
    if (!arguments.length) return lab;
    lab = x;
    for(var i=0; i<lab.length;i++) {
      lab[i].x -= lab[i].width/2;
      lab[i].y -= 5;
      // svg.append('rect').attr('x', lab[i].x)
      //                   .attr('y', lab[i].y - lab[i].height)
      //                   .attr('width', lab[i].width)
      //                   .attr('height', lab[i].height)
      //                   .attr('fill', 'yellow')
      //                   .attr('stroke', 'blue')
      //                   .attr('opacity', 0.1);
    }
    return labeler;
  };

  labeler.anchor = function(x) {
  // users insert anchor positions
    if (!arguments.length) return anc;
    anc = x;
    return labeler;
  };

  labeler.alt_energy = function(x) {
  // user defined energy
    if (!arguments.length) return energy;
    user_defined_energy = x;
    user_energy = true;
    return labeler;
  };

  labeler.alt_schedule = function(x) {
  // user defined cooling_schedule
    if (!arguments.length) return  cooling_schedule;
    user_defined_schedule = x;
    user_schedule = true;
    return labeler;
  };

  return labeler;
};

})();
