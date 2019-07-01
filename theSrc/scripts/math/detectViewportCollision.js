import getScreenCoords from './getScreenCoords'

module.exports = ({ label, plotWidth, plotHeight, plotOffsetX = 0, plotOffsetY = 0 }) => {
  // TODO this conditional does not belong here ?
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

  const collideL = box.left < plotOffsetX
  const collideR = box.right > (plotWidth + plotOffsetX)
  const collideT = box.top < plotOffsetY
  const collideB = box.bottom > (plotHeight + plotOffsetY)

  return collideL || collideR || collideT || collideB
}
