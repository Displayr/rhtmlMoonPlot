import getScreenCoords from './getScreenCoords'

module.exports = ({ label, plotWidth, plotHeight }) => {
  if (label.textContent === '') {
    return false
  }

  const box = label.getBBox()
  const ctm = label.getCTM()

  const transformedCoords = getScreenCoords(box, ctm)
  box.right = transformedCoords.x + box.width
  box.left = transformedCoords.x
  box.top = transformedCoords.y
  box.bottom = transformedCoords.y + box.height

  const collideL = box.left < 0
  const collideR = box.right > plotWidth
  let collideT = false
  let collideB = false
  if (box.x < (plotWidth / 2)) { // only need to condense text on left half
    collideT = box.top < 0
    collideB = box.bottom > plotHeight
  }
  return collideL || collideR || collideT || collideB
}
