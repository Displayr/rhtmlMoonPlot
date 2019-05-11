import labeler from './simulatedAnneallingLabellingAlgorithm'
import {getLabelDimensionsUsingSvgApproximation} from '../labelUtils'
import _ from 'lodash'

// ({plotState, lunarCoreLabelsData, svg, cx, cy, textColor, linkWidth})
const positionLabels = ({
  svg,
  lunarCoreLabels,
  fontFamily,
  fontSize,
  fontColor,
  radius,
  cx,
  cy }) => {
  const labels = _(lunarCoreLabels)
    .cloneDeep()
    .map(label => {
      const x = (label.x * radius) + cx
      const y = (-label.y * radius) + cy
      const {width, height} = getLabelDimensionsUsingSvgApproximation({
        parentContainer: svg,
        text: label.name,
        fontSize,
        fontFamily
      })
      return {
        id: label.id,
        name: label.name,
        truncatedName: label.name,
        anchor: { x, y, r: 2 },
        label: { x, y, width, height }, // NB putting width and height here for labeller
        width,
        height
      }
    })
    // TODO I should have to call .value() here, but that throws an error ?

  // Check if labels are overlapping and if need to be repositioned
  labeler()
    .svg(svg)
    .cx(cx)
    .cy(cy)
    .radius(radius)
    .anchor(_(labels).map('anchor').value())
    .label(_(labels).map('label').value())
    .start(500)

  _(labels).each(label => { label.label = _.pick(label.label, ['x', 'y']) })

  return labels
}

module.exports = { positionLabels }
