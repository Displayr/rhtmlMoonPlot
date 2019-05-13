import {polarFromCartesian, cartesiansFromPolars, toDegrees } from '../math/coord'
import positionAlongLine from '../math/positionAlongLine'
import {getLabelDimensionsUsingSvgApproximation} from '../labelUtils'
import _ from 'lodash'

const positionLabels = ({
  svg,
  surfaceLabels,
  fontFamily,
  fontSize,
  cx,
  cy,
  radius,
}) => {
  const labels = _(surfaceLabels)
    .cloneDeep()
    .map(label => {
      const x = (label.x * radius) + cx // NB dont understand the 0.7 but it appears to be relevant (placement breaks without it)
      const y = (-label.y * radius) + cy // NB dont understand the 0.7 but it appears to be relevant (placement breaks without it)
      const {width, height} = getLabelDimensionsUsingSvgApproximation({
        parentContainer: svg,
        text: label.name,
        fontSize: label.size * fontSize,
        fontFamily
      })
      return {
        id: label.id,
        name: label.name,
        size: label.size,
        truncatedName: label.name,
        anchor: { x, y },
        label: { x, y },
        polarLabel: polarFromCartesian({ x: label.x, y: label.y, h: height }), // passing h in this is corny ...
        width,
        height
      }
    })
    // TODO I should have to call .value() here, but that throws an error ?

  const polarCoords = _(labels)
    .map('polarLabel')
    // .map(polarCoord => _.merge(polarCoord, { r: 1 }))
    .value()

  console.log(' before move ')
  console.log(JSON.stringify(labels.map(x => x.label), {}, 2))

  console.log(' before move polar')
  console.log(JSON.stringify(polarCoords, {}, 2))

  moveSurfaceCollisions(polarCoords, radius)

  console.log(' after move polar')
  console.log(JSON.stringify(polarCoords, {}, 2))


  const cartCoords = cartesiansFromPolars(polarCoords)
  _(labels).each((label,i) => {
    label.label = cartCoords[i]
  })

  console.log(' after move ')
  console.log(JSON.stringify(labels.map(x => x.label), {}, 2))

  // TODO do I need to do the (see below) ?
  // x: (d.newX + cx).toString(),
  // y: (-d.newY + cy).toString()

  return labels
  // return labels.map(label => _.omit(label, ['polarLabel']))
}


function moveSurfaceCollisions (polarCoords, radius) {
  const lengthOfLine = radius * 2 * Math.PI
  for (let pc of Array.from(polarCoords)) {
    pc.r = radius
  }

  polarCoords = _.sortBy(polarCoords, coords => coords.a)
  const moveAmount = (0.2 / 360) * 2 * Math.PI // deg to rad
  const altitudeIncr = (0.1 * lengthOfLine) / 360
  let collisions = detectSurfaceCollisions(polarCoords, lengthOfLine)

  let maxMoves = 500
  while ((collisions.length > 0) && (maxMoves > 0)) {
    maxMoves--
    console.log('Moved surface labels')
    for (let pc of Array.from(polarCoords)) {
      if (pc.collision_l) {
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
      collisions = detectSurfaceCollisions(polarCoords, lengthOfLine)
    }
  }
}

function detectSurfaceCollisions (polarCoords, lengthOfLine) {
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
        const p1l = positionAlongLine(p1.a, lengthOfLine) + errorAllowed
        const p1r = (p1l + p1.h) - errorAllowed
        const p2l = positionAlongLine(p2.a, lengthOfLine) + errorAllowed
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

module.exports = { positionLabels }
