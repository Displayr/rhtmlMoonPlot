const _ = require('lodash')

class MoonPlotPage {
  constructor (page) {
    this.page = page
  }

  surfaceLabelSelector (id) { return `.surface-label[data-id='${id}']` }
  coreLabelSelector (id) { return `.core-label[data-id='${id}']` }
  circleSelector () { return '.moon-circle' }
  resetButtonSelector () { return '.plot-reset-button' }

  async getCoords (selector) {
    const element = await this.page.$(selector)
    const rect = await this.page.evaluate(element => {
      const { top, left, bottom, right } = element.getBoundingClientRect()
      return { top, left, bottom, right }
    }, element)
    return rect
  }

  async dragThing (selector, xMovement, yMovement) {
    const coords = await this.getCoords(selector)
    const steps = Math.floor(Math.max(Math.abs(xMovement), Math.abs(yMovement)) / 2)
    await this.page.hover(selector)
    await this.page.mouse.down()
    await this.page.mouse.move(parseFloat(coords.left + xMovement), parseFloat(coords.top + yMovement), { steps })
    return this.page.mouse.up()
  }

  async dragSurfaceLabel (labelId, xMovement, yMovement) {
    const selector = this.surfaceLabelSelector(labelId)
    return this.dragThing(selector, xMovement, yMovement)
  }

  async dragCoreLabel (labelId, xMovement, yMovement) {
    const selector = this.coreLabelSelector(labelId)
    return this.dragThing(selector, xMovement, yMovement)
  }

  async brittleCircleResize () {
    const coords = await this.getCoords(this.circleSelector())
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
