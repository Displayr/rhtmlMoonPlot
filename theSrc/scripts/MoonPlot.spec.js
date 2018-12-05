// TEMPLATE! - this import and the tests will need to be changed to match the logic and naming of your widget
import $ from 'jquery'
import MoonPlot from './MoonPlot'

describe('Template class:', () => {
  beforeEach(function () {
    this.instantiateAndSetConfigTo = function (config, width = 100, height = 100) {
      this.instance = new Template('<div class="outer-container">', width, height)
      return this.instance.setConfig(config)
    }
  })

  describe('_processConfig():', () => {
    it('accepts an empty config without throwing error', function () {
      expect(() => this.instantiateAndSetConfigTo({})).not.to.throw()
    })

    it('throws an error if colors is not an array', function () {
      expect(() => this.instantiateAndSetConfigTo({ colors: 'dog' })).to.throw()
    })

    it('throws an error if colors is an empty array', function () {
      expect(() => this.instantiateAndSetConfigTo({ colors: [] })).to.throw()
    })
  })

  describe('e2e tests:', () => {
    describe('draw the widget:', () => {
      beforeEach(function () {
        $('body').append('<div class="outer-container">')

        this.instance = new Template($('.outer-container'), 500, 500)
        this.instance.setConfig({})

        return this.instance.draw()
      })

      it('has four squares', function () {
        expect($('rect').length).to.equal(4)
      })
    })
  })
})
