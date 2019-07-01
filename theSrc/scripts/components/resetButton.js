import _ from 'lodash'

class ResetButton {
  constructor ({ parentContainer, fontFamily, plotWidth, plotHeight, onReset }) {
    _.assign(this, { parentContainer, fontFamily, plotWidth, plotHeight, onReset })
  }

  draw () {
    const svgResetButton = this.parentContainer.append('text')
      .attr('class', 'plot-reset-button')
      .attr('font-family', this.fontFamily)
      .attr('fill', '#5B9BD5')
      .attr('font-size', 10)
      .attr('font-weight', 'normal')
      .style('opacity', 0)
      .style('cursor', 'pointer')
      .text('Reset')
      .on('click', () => this.onReset())

    this.parentContainer
      .on('mouseover', () => { svgResetButton.style('opacity', 1) })
      .on('mouseout', () => svgResetButton.style('opacity', 0))

    const svgResetButtonBB = svgResetButton.node().getBBox()
    const xAxisPadding = 5
    svgResetButton
      .attr('x', this.plotWidth - svgResetButtonBB.width - xAxisPadding)
      .attr('y', this.plotHeight - svgResetButtonBB.height)
  }
}

module.exports = ResetButton
