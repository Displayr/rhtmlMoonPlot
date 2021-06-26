const { snapshotTesting: { interactions: { dragThing, getCoords } } } = require('rhtmlBuildUtils')

class MoonPlotPage {
  constructor (page) {
    this.page = page
  }

  surfaceLabelSelector (id) { return `.surface-label[data-id='${id}']` }
  coreLabelSelector (id) { return `.core-label[data-id='${id}']` }
  circleSelector () { return '.moon-circle' }
  resetButtonSelector () { return '.plot-reset-button' }

  async dragSurfaceLabel (labelId, xMovement, yMovement) {
    const selector = this.surfaceLabelSelector(labelId)
    return dragThing(this.page, selector, xMovement, yMovement)
  }

  async dragCoreLabel (labelId, xMovement, yMovement) {
    const selector = this.coreLabelSelector(labelId)
    return dragThing(this.page, selector, xMovement, yMovement)
  }

  async brittleCircleResize () {
    const coords = await getCoords(this.page, this.circleSelector())
    const radius = 166.67
    const offsetForTopOf500x500Circle = { x: coords.left + radius, y: coords.top }
    await this.page.mouse.move(offsetForTopOf500x500Circle.x, offsetForTopOf500x500Circle.y)
    await this.page.mouse.down()
    await this.page.mouse.move(offsetForTopOf500x500Circle.x, offsetForTopOf500x500Circle.y + 80, { steps: 40 })
    return this.page.mouse.up()
  }

  async pressResetButton () {
    return this.page.click(this.resetButtonSelector())
  }
}

module.exports = MoonPlotPage
