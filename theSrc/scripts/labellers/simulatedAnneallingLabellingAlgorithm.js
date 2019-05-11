/* eslint-disable */
import Random from 'random-js'

const labeler = function () {
  // Use Mersenne Twister seeded random number generator
  let random = new Random(Random.engines.mt19937().seed(1))
  // let random = new Random()

  let lab = []
  let anc = []
  let cx = 1
  let cy = 1
  let radius = 1
  let labeler = {}
  let svg = {}

  let max_move = 5.0
  let max_angle = 2*3.1415
  let acc = 0
  let rej = 0

  // weights
  let w_len = 10.0 // leader line length
  let w_inter = 1.0 // leader line intersection
  let w_lablink = 2.0 // leader line-label intersection
  let w_lab2 = 12.0 // label-label overlap
  let w_lab_anc = 8 // label-anchor overlap
  // let w_orient = 0.5 // orientation bias

  // booleans for user defined functions
  let user_energy = false
  let user_schedule = false

  let user_defined_energy
  let user_defined_schedule

  let energy = function(index) {
    // energy function, tailored for label placement
    
    let labelTopPadding = 5
    
    let currLab = lab[index]
    let currAnc = anc[index]
    let m = lab.length,
      ener = 0,
      dx = currLab.x - currAnc.x,
      dx2 = currLab.x - 4 - currLab.width/2 - currAnc.x,
      dx3 = currLab.x + 4 + currLab.width/2 - currAnc.x,
      dy = currLab.y - (currAnc.y - 5),
      dy2 = (currLab.y - (currLab.height + labelTopPadding)) - currAnc.y,
      dy3 = (currLab.y - currLab.height/2) - currAnc.y,
      dist = Math.sqrt(dx * dx + dy * dy),
      dist2 = Math.sqrt(dx * dx + dy2 * dy2),
      dist3 = Math.sqrt(dx2 * dx2 + dy3 * dy3),
      dist4 = Math.sqrt(dx3 * dx3 + dy3 * dy3),
      dist5 = Math.sqrt(dx2 * dx2 + dy2 * dy2),
      dist6 = Math.sqrt(dx3 * dx3 + dy * dy),
      dist7 = Math.sqrt(dx3 * dx3 + dy2 * dy2),
      dist8 = Math.sqrt(dx2 * dx2 + dy * dy),
      overlap = true
    
    // penalty for length of leader line
    let minDist = Math.min(dist, dist2, dist3, dist4, dist5, dist6, dist7, dist8)
    let perfect2Penalty = 1.5
    let perfect3Penalty = 8
    let perfect4Penalty = 15
    switch(minDist) {
      case dist:
        ener += dist * w_len
        break
      case dist2:
        ener += dist2 * w_len * perfect2Penalty
        break
      case dist3:
        ener += dist3 * w_len * perfect3Penalty
        break
      case dist4:
        ener += dist4 * w_len * perfect3Penalty
        break
      case dist5:
        ener += dist5 * w_len * perfect4Penalty
        break
      case dist6:
        ener += dist6 * w_len * perfect4Penalty
        break
      case dist7:
        ener += dist7 * w_len * perfect4Penalty
        break
      case dist8:
        ener += dist8 * w_len * perfect4Penalty
        break
    }
    
    // label orientation bias
    // dx /= dist
    // dy /= dist
    // if (dx > 0 && dy > 0) { ener += 0 * w_orient }
    // else if (dx < 0 && dy > 0) { ener += 1 * w_orient }
    // else if (dx < 0 && dy < 0) { ener += 2 * w_orient }
    // else { ener += 3 * w_orient }
    
    let x21 = currLab.x - currLab.width / 2,
      y21 = currLab.y - (currLab.height + labelTopPadding),
      x22 = currLab.x + currLab.width / 2,
      y22 = currLab.y
    let x11, x12, y11, y12, x_overlap, y_overlap, overlap_area
    
    for (let i = 0; i < m; i++) {
      if (i !== index) {
        
        // penalty for intersection of leader lines
        overlap = intersect(currAnc.x, currLab.x + currLab.width/2, anc[i].x, lab[i].x + lab[i].width/2,
          currAnc.y, currLab.y, anc[i].y, lab[i].y)
        if (overlap) ener += w_inter
        
        // penalty for label-label overlap
        x11 = lab[i].x - lab[i].width / 2
        y11 = lab[i].y - (lab[i].height + labelTopPadding)
        x12 = lab[i].x + lab[i].width / 2
        y12 = lab[i].y
        x_overlap = Math.max(0, Math.min(x12,x22) - Math.max(x11,x21))
        y_overlap = Math.max(0, Math.min(y12,y22) - Math.max(y11,y21))
        overlap_area = x_overlap * y_overlap
        ener += (overlap_area * w_lab2)
      }
      
      // penalty for label-anchor overlap
      x11 = anc[i].x - anc[i].r
      y11 = anc[i].y - anc[i].r
      x12 = anc[i].x + anc[i].r
      y12 = anc[i].y + anc[i].r
      x_overlap = Math.max(0, Math.min(x12,x22) - Math.max(x11,x21))
      y_overlap = Math.max(0, Math.min(y12,y22) - Math.max(y11,y21))
      overlap_area = x_overlap * y_overlap
      ener += (overlap_area * w_lab_anc)
      
      // penalty for label-leader line intersection
      let intersecBottom = intersect(currLab.x, currLab.x + currLab.width, anc[i].x, lab[i].x + lab[i].width,
        currLab.y, currLab.y, anc[i].y, lab[i].y
      )
      
      let intersecTop = intersect(currLab.x, currLab.x + currLab.width, anc[i].x, lab[i].x + lab[i].width,
        currLab.y-currLab.height, currLab.y-currLab.height, anc[i].y, lab[i].y
      )
      if (intersecBottom) ener += w_lablink
      if (intersecTop) ener += w_lablink
    }
    return ener
  }
  
  let adjustForBoundaries = function(lab, anc, i, x_old, y_old) {
    let asinangleT = Math.asin((lab[i].y - cy - lab[i].height)/radius)
    let asinangleB = Math.asin((lab[i].y - cy)/radius)
    // let investigate = null
    // investigate = 4
    
    
    //right
    if (lab[i].x + lab[i].width/2 > cx + radius*Math.cos(asinangleT) ||
      lab[i].x + lab[i].width/2 > cx + radius*Math.cos(asinangleB)) {
      if (lab[i].y < cy) {
        lab[i].x = cx + radius*Math.cos(asinangleT) - lab[i].width
      }
      else {
        lab[i].x = cx + radius*Math.cos(asinangleB) - lab[i].width
      }
      // if (i==investigate) svg.append('rect').attr('x', lab[i].x)
      //                   .attr('y', lab[i].y - lab[i].height)
      //                   .attr('width', lab[i].width)
      //                   .attr('height', lab[i].height)
      //                   .attr('fill', 'yellow')
      //                   .attr('fill-opacity', 0.1)
      // if (i==investigate) svg.append('rect').attr('x', x_old)
      //                   .attr('y', lab[i].y - lab[i].height)
      //                   .attr('width', lab[i].width)
      //                   .attr('height', lab[i].height)
      //                   .attr('fill', 'black')
      //                   .attr('fill-opacity', 0.1)
      
    }
    //left
    if (lab[i].x - lab[i].width/2 < cx - radius*Math.cos(asinangleT) ||
      lab[i].x - lab[i].width/2 < cx - radius*Math.cos(asinangleB)) {
      // if (i==investigate) svg.append('rect').attr('x', lab[i].x)
      //                   .attr('y', lab[i].y - lab[i].height)
      //                   .attr('width', lab[i].width)
      //                   .attr('height', lab[i].height)
      //                   .attr('fill', 'green')
      //                   .attr('fill-opacity', 0.1)
      if (lab[i].y < cy) {
        lab[i].x = cx - radius*Math.cos(asinangleT) + lab[i].width/2
      }
      else {
        lab[i].x = cx - radius*Math.cos(asinangleB) + lab[i].width/2
      }
      
      
      // if (i==investigate) svg.append('rect').attr('x', x_old)
      //                   .attr('y', y_old - lab[i].height)
      //                   .attr('width', lab[i].width)
      //                   .attr('height', lab[i].height)
      //                   .attr('fill', 'red')
      //                   .attr('fill-opacity', 0.1)
      // if (i==investigate) svg.append('rect').attr('x', lab[i].x)
      //                   .attr('y', lab[i].y - lab[i].height)
      //                   .attr('width', lab[i].width)
      //                   .attr('height', lab[i].height)
      //                   .attr('fill', 'blue')
      //                   .attr('fill-opacity', 0.1)
    }
  }
  
  let mcmove = function(currT) {
    // Monte Carlo translation move
    
    // select a random label
    let i = Math.floor(random.real(0,1) * lab.length)
    
    // save old coordinates
    let x_old = lab[i].x
    let y_old = lab[i].y
    
    // old energy
    let old_energy
    if (user_energy) {old_energy = user_defined_energy(i, lab, anc)}
    else {old_energy = energy(i)}
    
    // random translation
    lab[i].x += (random.real(0,1) - 0.5) * max_move
    lab[i].y += (random.real(0,1) - 0.5) * max_move
    
    // hard wall boundaries
    let boundaryBuffer = 5
    if (lab[i].y - lab[i].height < cy - radius) { //top
      lab[i].y = cy - radius + lab[i].height + boundaryBuffer
    }
    else if (lab[i].y > cy + radius) { //bot
      lab[i].y = cy + radius - boundaryBuffer
    }
    adjustForBoundaries(lab, anc, i, x_old, y_old)
    
    // new energy
    let new_energy
    if (user_energy) {new_energy = user_defined_energy(i, lab, anc)}
    else {new_energy = energy(i)}
    
    // delta E
    let delta_energy = new_energy - old_energy
    
    if (random.real(0,1) < Math.exp(-delta_energy / currT)) {
      // if (delta_energy < 0) {
      acc += 1
    } else {
      // move back to old coordinates
      lab[i].x = x_old
      lab[i].y = y_old
      rej += 1
    }
    
  }
  
  let mcrotate = function(currT) {
    // Monte Carlo rotation move
    
    // select a random label
    let i = Math.floor(random.real(0,1) * lab.length)
    
    // save old coordinates
    let x_old = lab[i].x
    let y_old = lab[i].y
    
    // old energy
    let old_energy
    if (user_energy) {old_energy = user_defined_energy(i, lab, anc)}
    else {old_energy = energy(i)}
    
    // random angle
    let angle = (random.real(0,1) - 0.5) * max_angle
    
    let s = Math.sin(angle)
    let c = Math.cos(angle)
    
    // translate label (relative to anchor at origin):
    lab[i].x -= anc[i].x
    lab[i].y -= anc[i].y
    
    // rotate label
    let x_new = lab[i].x * c - lab[i].y * s,
      y_new = lab[i].x * s + lab[i].y * c
    
    // translate label back
    lab[i].x = x_new + anc[i].x
    lab[i].y = y_new + anc[i].y
    
    // hard wall boundaries
    let boundaryBuffer = 5
    if (lab[i].y < cy - radius + lab[i].height) {
      lab[i].y = cy - radius + lab[i].height + boundaryBuffer
    }
    else if (lab[i].y > cy + radius) {
      lab[i].y = cy + radius - boundaryBuffer
    }
    adjustForBoundaries(lab, anc, i, x_old, y_old)
    
    // new energy
    let new_energy
    if (user_energy) {new_energy = user_defined_energy(i, lab, anc)}
    else {new_energy = energy(i)}
    
    // delta E
    let delta_energy = new_energy - old_energy
    
    if (random.real(0,1) < Math.exp(-delta_energy / currT)) {
      // if (delta_energy < 0) {
      acc += 1
      // svg.append('rect').attr('x', lab[i].x)
      //                   .attr('y', lab[i].y - lab[i].height)
      //                   .attr('width', lab[i].width)
      //                   .attr('height', lab[i].height)
      //                   .attr('fill', 'yellow')
      //                   .attr('fill-opacity', 0.1)
    } else {
      // move back to old coordinates
      lab[i].x = x_old
      lab[i].y = y_old
      rej += 1
      
      // svg.append('rect').attr('x', lab[i].x)
      //                   .attr('y', lab[i].y - lab[i].height)
      //                   .attr('width', lab[i].width)
      //                   .attr('height', lab[i].height)
      //                   .attr('fill', 'purple')
      //                   .attr('fill-opacity', 0.1)
    }
    
  }
  
  let intersect = function(x1, x2, x3, x4, y1, y2, y3, y4) {
    // returns true if two lines intersect, else false
    // from http://paulbourke.net/geometry/lineline2d/
    
    let mua, mub
    let denom, numera, numerb
    
    denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)
    numera = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)
    numerb = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)
    
    /* Is the intersection along the the segments */
    mua = numera / denom
    mub = numerb / denom
    if (!(mua < 0 || mua > 1 || mub < 0 || mub > 1)) {
      return true
    }
    return false
  }
  
  let cooling_schedule = function(currT, initialT, nsweeps) {
    // linear cooling
    return (currT - (initialT / nsweeps))
  }

  labeler.start = function(nsweeps) {
    for (let i = 0; i < lab.length; i++) {
      adjustForBoundaries(lab, anc, i)
    }
    
    // main simulated annealing function
    let m = lab.length,
      currT = 1.0,
      initialT = 1.0
    
    for (let i = 0; i < nsweeps; i++) {
      for (let j = 0; j < m; j++) {
        if (random.real(0,1) < 0.8) { mcmove(currT) }
        else { mcrotate(currT) }
      }
      currT = cooling_schedule(currT, initialT, nsweeps)
    }
  }
  
  labeler.cx = function(x) {
    if(!arguments.length) return cx
    cx = x
    return labeler
  }
  
  labeler.svg = function(x) {
    svg = x
    return labeler
  }
  
  labeler.cy = function(x) {
    if(!arguments.length) return cy
    cy = x
    return labeler
  }
  
  labeler.radius = function(x) {
    if(!arguments.length) return radius
    radius = x
    return labeler
  }
  
  labeler.label = function(x) {
    if (!arguments.length) return lab
    lab = x
    return labeler
  }
  
  labeler.anchor = function(x) {
    if (!arguments.length) return anc
    anc = x
    return labeler
  }
  
  labeler.alt_energy = function(x) {
    // user defined energy
    if (!arguments.length) return energy
    user_defined_energy = x
    user_energy = true
    return labeler
  }
  
  labeler.alt_schedule = function(x) {
    // user defined cooling_schedule
    if (!arguments.length) return  cooling_schedule
    user_defined_schedule = x
    user_schedule = true
    return labeler
  }
  
  return labeler
}

module.exports = labeler
/* eslint-enable */
