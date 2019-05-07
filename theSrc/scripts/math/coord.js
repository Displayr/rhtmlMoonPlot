
// TODO is it ok to mix concerns here (e.g. , i am propogating height and id

const polarFromCartesian = (cartCoord) => {
  return ({
    r: Math.sqrt(Math.pow(cartCoord.x, 2) + Math.pow(cartCoord.y, 2)),
    a: Math.atan2(cartCoord.y, cartCoord.x),
    h: cartCoord.h,
    id: cartCoord.id
  })
}

// Convert Cartesian to polar coordinates
const polarsFromCartesians = (cartCoords) => {
  const polarCoords = []
  for (let cartCoord of Array.from(cartCoords)) {
    polarCoords.push(polarFromCartesian(cartCoord))
  }
  return polarCoords
}

const cartesianFromPolar = (polarCoord) => {
  return ({
    x: polarCoord.r * Math.cos(polarCoord.a),
    y: polarCoord.r * Math.sin(polarCoord.a),
    h: polarCoord.h,
    id: polarCoord.id
  })
}

// Convert polar to Cartesian coordinates
const cartesiansFromPolars = (polarCoords) => {
  const cartCoords = []
  for (let polarCoord of Array.from(polarCoords)) {
    cartCoords.push(cartesianFromPolar(polarCoord))
  }
  return cartCoords
}

module.exports = {
  polarsFromCartesians,
  polarFromCartesian,
  cartesiansFromPolars,
  cartesianFromPolar
}
