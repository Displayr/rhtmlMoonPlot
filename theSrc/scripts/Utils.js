import * as d3 from 'd3'
import _ from 'lodash'

class Utils {
  static detectSurfaceCollisions (polarCoords, lengthOfLine) {
    const errorAllowed = 5
    const collisions = []
    let i = 0
    while (i < polarCoords.length) {
      const p1 = polarCoords[i]
      i++
      let j = i
      while (j < polarCoords.length) {
        const p2 = polarCoords[j]
        j++
        if (p1 !== p2) {
          const p1l = this.positionAlongLine(p1.a, lengthOfLine) + errorAllowed
          const p1r = (p1l + p1.h) - errorAllowed
          const p2l = this.positionAlongLine(p2.a, lengthOfLine) + errorAllowed
          const p2r = (p2l + p2.h) - errorAllowed
          if ((p1r > p2l) && (p1l < p2r)) {
            p1.collision_r = true
            p2.collision_l = true
            collisions.push([p1, p2])
          } else if ((p2r > p1l) && (p2l < p1r)) {
            p1.collision_l = true
            p2.collision_r = true
            collisions.push([p1, p2])
          }
        }
      }
    }
    return collisions
  }

  // Move the colliding pairs after collision is detected
  static moveSurfaceCollsions (polarCoords, lengthOfLine, radius) {
    for (let pc of Array.from(polarCoords)) {
      pc.r = radius
    }

    polarCoords = _.sortBy(polarCoords, coords => coords.a)
    const moveAmount = (0.2 / 360) * 2 * Math.PI // deg to rad
    const altitudeIncr = (0.1 * lengthOfLine) / 360
    let collisions = this.detectSurfaceCollisions(polarCoords, lengthOfLine)

    let maxMoves = 500
    return (() => {
      const result = []
      while ((collisions.length > 0) && (maxMoves > 0)) {
        maxMoves--
        console.log('Moved surface labels')
        result.push((() => {
          const result1 = []
          for (let pc of Array.from(polarCoords)) {
            if (pc.collision_l) {
              // Save original coords
              if (!pc.oa || !pc.or) {
                pc.oa = pc.a
                pc.or = pc.r
              }

              if (pc.a > (0.5 * Math.PI)) { // UL
                pc.a += moveAmount
              } else if (pc.a < (-0.5 * Math.PI)) { // LL
                pc.a += moveAmount
              } else if ((pc.a > (-0.5 * Math.PI)) && (pc.a < 0)) { // LR
                pc.a += moveAmount
              } else if ((pc.a > 0) && (pc.a < (0.5 * Math.PI))) { // UR
                pc.a += moveAmount
              }
              pc.collision_l = false
              pc.r += altitudeIncr
            } else if (pc.collision_r) {
              // Save original coords
              if (!pc.oa || !pc.or) {
                pc.oa = pc.a
                pc.or = pc.r
              }

              if (pc.a > (0.5 * Math.PI)) { // UL
                pc.a -= moveAmount
              } else if (pc.a < (-0.5 * Math.PI)) { // LL
                pc.a -= moveAmount
              } else if ((pc.a > (-0.5 * Math.PI)) && (pc.a < 0)) { // LR
                pc.a -= moveAmount
              } else if ((pc.a > 0) && (pc.a < (0.5 * Math.PI))) { // UR
                pc.a -= moveAmount
              }

              pc.collision_r = false
              pc.r += altitudeIncr
            }

            result1.push(collisions = this.detectSurfaceCollisions(polarCoords, lengthOfLine))
          }
          return result1
        })())
      }
      return result
    })()
  }

  // Convert Cartesian to polar coordinates
  static polarCoords (cartCoords) {
    const polarCoords = []
    for (let cartCoord of Array.from(cartCoords)) {
      polarCoords.push(this.polarCoord(cartCoord))
    }
    return polarCoords
  }

  static polarCoord (cartCoord) {
    return ({
      r: Math.sqrt(Math.pow(cartCoord.x, 2) + Math.pow(cartCoord.y, 2)),
      a: Math.atan2(cartCoord.y, cartCoord.x),
      h: cartCoord.h
    })
  }

  // Convert polar to Cartesian coordinates
  static cartesianCoords (polarCoords) {
    const cartCoords = []
    for (let polarCoord of Array.from(polarCoords)) {
      cartCoords.push(this.cartesianCoord(polarCoord))
    }
    return cartCoords
  }

  static cartesianCoord (polarCoord) {
    return ({
      x: polarCoord.r * Math.cos(polarCoord.a),
      y: polarCoord.r * Math.sin(polarCoord.a),
      h: polarCoord.h
    })
  }

  // Translate angles to position on line
  static positionAlongLine (rad, lengthOfLine) {
    return ((rad + Math.PI) / (2 * Math.PI)) * lengthOfLine
  }

  static calculateLabelRotation (angleRad) {
    return (angleRad / 2 / Math.PI) * 360
  }

  static detectViewportCollision (surfaceLabel, viewportHeight, viewportWidth) {
    const getScreenCoords = function (x, y, ctm) {
      const xn = ctm.e + (x * ctm.a) + (y * ctm.c)
      const yn = ctm.f + (x * ctm.b) + (y * ctm.d)
      return { x: xn, y: yn }
    }

    // Pass if there is no more text to condense
    if (d3.select(surfaceLabel).node().textContent === '') {
      return false
    }

    const box = surfaceLabel.getBBox()
    const ctm = surfaceLabel.getCTM()
    const transformedCoords = getScreenCoords(box.x, box.y, ctm)
    box.right = transformedCoords.x + box.width
    box.left = transformedCoords.x
    box.top = transformedCoords.y
    box.bottom = transformedCoords.y + box.height

    const collideL = box.left < 0
    const collideR = box.right > viewportWidth
    let collideT = false
    let collideB = false
    if (box.x < (viewportWidth / 2)) { // only need to condense text on left half
      collideT = box.top < 0
      collideB = box.bottom > viewportHeight
    }
    return collideL || collideR || collideT || collideB
  }

  static condenseSurfaceLabel (surfaceLabel, viewportHeight, viewportWidth) {
    // Throw away chars one at a time and check if still collides w/viewport
    let innerHTML
    while (this.detectViewportCollision(surfaceLabel, viewportHeight, viewportWidth)) {
      innerHTML = d3.select(surfaceLabel).node().textContent
      d3.select(surfaceLabel).text(innerHTML.slice(0, -1))
    }
    innerHTML = d3.select(surfaceLabel).node().textContent
    return d3.select(surfaceLabel).text(innerHTML.slice(0, -3) + '...')
  }

  static adjustSurfaceLabelLength (surfaceLabels, viewHeight, viewWidth) {
    this.extendFullLabelName(surfaceLabels)
    const result = []
    for (let surfaceLabel of Array.from(surfaceLabels)) {
      if (this.detectViewportCollision(surfaceLabel, viewHeight, viewWidth)) {
        this.condenseSurfaceLabel(surfaceLabel, viewHeight, viewWidth)
      }
      const tooltipText = d3.select(surfaceLabel).attr('title')
      result.push(d3.select(surfaceLabel).append('title').text(tooltipText))
    }
    return result
  }

  // Detect collisions with lunar core labels and moon surface
  static detectCoreLabelBoundaryCollision (coreLabel, radius, cx, cy) {
    const coreLabelBb = coreLabel.getBBox()
    const yRightB = coreLabelBb.y
    const yRightT = coreLabelBb.y + (coreLabelBb.height / 2)
    const xRight = coreLabelBb.x + coreLabelBb.width

    // Calculate circle boundary using parametric eq for circle
    const angleB = Math.asin((yRightB - cy) / radius)
    const angleT = Math.asin((yRightT - cy) / radius)
    const circleBoundaryRightB = cx + (radius * Math.cos(angleB))
    const circleBoundaryRightT = cx + (radius * Math.cos(angleT))

    return (circleBoundaryRightB < xRight) || (circleBoundaryRightT < xRight)
  }

  static failsCoreLabelBoundaryRules (coreLabel, radius, cx, cy) {
    return this.detectCoreLabelBoundaryCollision(coreLabel, radius, cx, cy)
  }

  static condenseCoreLabel (coreLabel, radius, cx, cy) {
    let innerHTML
    while (this.failsCoreLabelBoundaryRules(coreLabel, radius, cx, cy)) {
      innerHTML = d3.select(coreLabel).node().textContent
      d3.select(coreLabel).text(innerHTML.slice(0, -1))
    }
    innerHTML = d3.select(coreLabel).node().textContent
    d3.select(coreLabel).text(innerHTML.slice(0, -3) + '...')
    d3.select(coreLabel).data()[0].width = coreLabel.getBBox().width
  }

  static extendFullLabelName (labels) {
    return Array.from(labels).map((label) =>
      d3.select(label).text(d3.select(label).attr('title')))
  }

  static adjustCoreLabelLength (coreLabels, radius, cx, cy) {
    this.extendFullLabelName(coreLabels)
    const result = []
    for (let coreLabel of Array.from(coreLabels)) {
      if (this.failsCoreLabelBoundaryRules(coreLabel, radius, cx, cy)) {
        this.condenseCoreLabel(coreLabel, radius, cx, cy)
      }
      result.push(d3.select(coreLabel).append('title').text(d3.select(coreLabel).attr('title')))
    }
    return result
  }

  static distanceFromCenter (x, y) {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
  }

  static normalizeCoreNodes (rawCoreNodes) {
    // normalization between -1 and 1 (padded by threshold)
    const threshold = 0.1
    let maxMag = -Infinity
    for (var node of Array.from(rawCoreNodes)) {
      const magnitude = Math.sqrt(Math.pow(node[0], 2) + Math.pow(node[1], 2))
      if (magnitude > maxMag) { maxMag = magnitude }
    }

    maxMag *= 1 + threshold
    for (node of Array.from(rawCoreNodes)) {
      node[0] = node[0] / maxMag
      node[1] = node[1] / maxMag
    }
  }

  static calculateSurfaceNodePositions (rawSurfaceNodes) {
    const result = []
    for (let node of Array.from(rawSurfaceNodes)) {
      const angle = Math.atan2(node[1], node[0])
      node[0] = Math.cos(angle)
      result.push(node[1] = Math.sin(angle))
    }
    return result
  }

  static calculateSurfaceLabelSizes (rawSurfaceNodes, scaleFactor, equalizeFactor) {
    const lunarSurfaceSizes = []
    let maxSize = -Infinity
    for (let node of Array.from(rawSurfaceNodes)) {
      const size = this.distanceFromCenter(node[0], node[1])
      if (size > maxSize) { maxSize = size }
      lunarSurfaceSizes.push(size)
    }

    return _.map(lunarSurfaceSizes, s => scaleFactor * Math.pow((s / maxSize), equalizeFactor))
  }

  static adjustCoreLinks (svg, lunarCoreLabels, anchorArray, linkWidth) {
    const newPtOnLabelBorder = function (lab, anc) {
      const p = [
        [lab.x - (lab.width / 2),   lab.y],                   // botL - 0
        [lab.x,                     lab.y],                   // botC - 1
        [lab.x + (lab.width / 2),   lab.y],                   // botR - 2
        [lab.x - (lab.width / 2),   (lab.y - lab.height) + 2],  // topL - 3
        [lab.x,                     (lab.y - lab.height) + 2],  // topC - 4
        [lab.x + (lab.width / 2),   (lab.y - lab.height) + 2],  // topR - 5
        [lab.x - (lab.width / 2),   lab.y - (lab.height / 2)],    // midL - 6
        [lab.x + (lab.width / 2),   lab.y - (lab.height / 2)]    // midR - 7
      ]

      const padding = 10
      const centered = (anc.x > (lab.x - (lab.width / 2))) && (anc.x < (lab.x + (lab.width / 2)))
      // const paddedCenter = (anc.x > (lab.x - (lab.width/2) - padding)) && (anc.x < (lab.x + (lab.width/2) + padding))
      const abovePadded = anc.y < (lab.y - lab.height - padding)
      const above = anc.y < (lab.y - lab.height)
      // const aboveMid = anc.y < (lab.y - (lab.height/2))
      const belowPadded = anc.y > (lab.y + padding)
      const below = anc.y > lab.y
      // const belowMid = anc.y >= (lab.y - (lab.height/2))
      const left = anc.x < (lab.x - (lab.width / 2))
      const right = anc.x > (lab.x + (lab.width / 2))
      const leftPadded = anc.x < (lab.x - (lab.width / 2) - padding)
      const rightPadded = anc.x > (lab.x + (lab.width / 2) + padding)

      if (centered && abovePadded) {
        return p[4]
      } else if (centered && belowPadded) {
        return p[1]
      } else if (above && left) {
        return p[3]
      } else if (above && right) {
        return p[5]
      } else if (below && left) {
        return p[0]
      } else if (below && right) {
        return p[2]
      } else if (leftPadded) {
        return p[6]
      } else if (rightPadded) {
        return p[7]
      } else {
        // Draw the link if there are any anc nearby
        const ambiguityFactor = 10
        const padL = p[3][0] - ambiguityFactor
        const padR = p[5][0] + ambiguityFactor
        const padT = p[3][1] - ambiguityFactor
        const padB = p[2][1] + ambiguityFactor
        let ancNearby = 0
        for (anc of Array.from(anchorArray)) {
          if (((anc.x > padL) && (anc.x < padR)) && ((anc.y > padT) && (anc.y < padB))) {
            ancNearby++
          }
        }
        if (ancNearby > 1) {
          if (!left && !right && !above && !below) {
            return p[1]
          } else if (centered && above) {
            return p[4]
          } else if (centered && below) {
            return p[1]
          } else if (left && above) {
            return p[3]
          } else if (left && below) {
            return p[0]
          } else if (right && above) {
            return p[5]
          } else if (right && below) {
            return p[2]
          } else if (left) {
            return p[6]
          } else if (right) {
            return p[7]
          }
        }
      }
    }

    let j = 0
    return (() => {
      const result = []
      while (j < lunarCoreLabels.length) {
        const newLinkPt = newPtOnLabelBorder(lunarCoreLabels[j], anchorArray[j])
        // d3.select('svg').append('circle').attr('cx', newLinkPt[0])
        //                     .attr('stroke-width',1)
        //                     .attr('class', 'core-anchor')
        //                     .attr('fill', 'blue')
        //                     .attr('cy', newLinkPt[1])
        //                     .attr('r', 2)
        //                     .attr('stroke')
        if (newLinkPt != null) {
          svg.append('line').attr('class', 'core-link')
          .attr('x1', anchorArray[j].x)
          .attr('y1', anchorArray[j].y)
          .attr('x2', newLinkPt[0])
          .attr('y2', newLinkPt[1])
          .attr('stroke-width', linkWidth)
          .attr('stroke', 'gray')
        }
        result.push(j++)
      }
      return result
    })()
  }
}

module.exports = Utils
