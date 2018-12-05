 // TEMPLATE! - update the method signature here
 //  -You will need to update most of this file, as this is where all the specific widget stuff goes
 //  -Consider reusing this._manipulateRootElementSize() and this._addRootSvgToRootElement()

 /* global document */

import $ from 'jquery'
import _ from 'lodash'
import * as d3 from 'd3'
import MoonPlotDependency from './MoonPlotDependency'
import MoonPlotClass from './MoonPlotClass'

class MoonPlot {
  static initClass () {
    this.widgetIndex = 0
    this.widgetName = 'moonPlot'
  }

  static get defaultColors () {
    return ['red', 'blue', 'green', 'orange']
  }

  constructor (el, width, height, stateChangedCallback) {
    this.id = `${MoonPlot.widgetName}-${MoonPlot.widgetIndex++}`
    this.rootElement = _.has(el, 'length') ? el[0] : el
    this.initialWidth = width
    this.initialHeight = height
    this.state = {}
    this.stateChangedCallback = stateChangedCallback

    // NB TemplateDependency is not used,
    // it simply shows how to import and structure intra project dependencies
    const throwAway = new MoonPlotDependency()
    throwAway.doThings()

    this.plot = new MoonPlotClass(this.id, this.initialWidth, this.initialHeight)

    this.state = {
      selected: null
    }
  }

  resize (width, height) {
    console.log(`calling resize with w: ${width} h: ${height}`)
  }

  setUserState (userState = {}) {
    // TEMPLATE : your widget will need to handle state better
    // TODO: some sanity checks on provided state, and version check / version upgrade if versions do not match

    if (_.isUndefined(userState) || _.isNull(userState)) {
      this.state = {}
    } else {
      this.state = userState
    }
  }

  setConfig (config) {
    this.config = config
    console.log('setConfig. Change this function in your rhtmlWidget')
    console.log(this.config)

    if (_.has(this.config, 'colors')) {
      if (!_.isArray(this.config.colors)) {
        throw new Error("Invalid config. 'colors' must be array")
      }
      if (this.config.colors.length < 1) {
        throw new Error("Invalid config. 'colors' array must be > 0")
      }
      this.colors = this.config.colors
    } else {
      this.colors = MoonPlot.defaultColors
    }
  }

  _getColor (index) {
    return this.colors[index % this.colors.length]
  }

  draw () {
    this._clearRootElement()
    this._manipulateRootElementSize()
    this._addRootSvgToRootElement()
    return this._draw()
  }

  _clearRootElement () {
    $(this.rootElement).find('*').remove()
  }

  _manipulateRootElementSize () {
    // root element has width and height in a style tag. Clear that
    $(this.rootElement).attr('style', '')

    if (this.config.resizable) {
      return $(this.rootElement).width('100%').height('100%')
    } else {
      return $(this.rootElement).width(this.initialWidth).height(this.initialHeight)
    }
  }

  _addRootSvgToRootElement () {
    const anonSvg = $('<svg class="rhtmlwidget-outer-svg">')
      .attr('id', this.id)
      .attr('width', '100%')
      .attr('height', '100%')

    $(this.rootElement).append(anonSvg)

    this.outerSvg = d3.select(anonSvg[0])

    // NB JQuery insists on lowercasing attributes, so we must use JS directly
    // when setting viewBox and preserveAspectRatio ?!
    document.getElementById(this.id).setAttribute('viewBox', `0 0 ${this.initialWidth} ${this.initialHeight}`)
    if (this.config.preserveAspectRatio) {
      document.getElementById(this.id).setAttribute('preserveAspectRatio', this.config.preserveAspectRatio)
    }

    return null
  }

  _draw () {
    console.log('_draw. Change this function in your rhtmlWidget')
    console.log('the outer SVG has already been created and added to the DOM. You should do things with it')
    const data = {
      "lunarCoreNodes": [
        [ "-1.463366472005000000000000000000",
          "-0.379352165370800000000000000000" ],
        [ "-1.235356551405000000000000000000",
          "1.696363946463000000000000000000" ],
        [ "-1.150392959552000000000000000000",
          "-0.752151664016300000000000000000" ],
        [ "-1.413409716576000000000000000000",
          "-0.840777563639200000000000000000" ],
        [ "-1.490651161978000000000000000000",
          "-1.490058965443000000000000000000" ],
        [ "-0.928856779784000000000000000000",
          "1.723226724213000000000000000000" ],
        [ "-1.461162275175000000000000000000",
          "0.293618220166700000000000000000" ],
        [ "-0.428112309971200000000000000000",
          "1.560886527962000000000000000000" ],
        [ "-1.483539795699000000000000000000",
          "-1.246236216518000000000000000000" ],
        [ "-1.035105971734000000000000000000",
          "0.270154921828800000000000000000" ],
        [ "-0.694026572196700000000000000000",
          "1.648646761036000000000000000000" ],
        [ "-0.614401606572600000000000000000",
          "-0.283179409999600000000000000000" ],
        [ "-0.600334034093100000000000000000",
          "-0.152239638535000000000000000000" ],
        [ "-0.662460301569200000000000000000",
          "-1.072354472868000000000000000000" ],
        [ "-0.505413978112300000000000000000",
          "-1.107138576830000000000000000000" ],
        [ "-0.530714629472900000000000000000",
          "-1.174797044544000000000000000000" ],
        [ "-0.279776133843700000000000000000",
          "2.667682152992000000000000000000" ],
        [ "-0.536309006576800000000000000000",
          "0.237641739869500000000000000000" ],
        [ "-0.087416865554500000000000000000",
          "-0.145884367803600000000000000000" ],
        [ "-0.197088684239300000000000000000",
          "-1.214826577173000000000000000000" ],
        [ "-0.038906068056090000000000000000",
          "1.120051731034000000000000000000" ],
        [ "0.133041820941700000000000000000",
          "1.140746332418000000000000000000" ],
        [ "0.182437580250000000000000000000",
          "0.870365405141200000000000000000" ],
        [ "0.243117520135400000000000000000",
          "-0.520323394923400000000000000000" ],
        [ "0.596267863557800000000000000000",
          "0.312351981803600000000000000000" ],
        [ "0.925771780320700000000000000000",
          "0.712688210696400000000000000000" ],
        [ "0.495089869610500000000000000000",
          "-1.409354792266000000000000000000" ],
        [ "1.500520625135000000000000000000",
          "1.192577563219000000000000000000" ],
        [ "0.771534817626900000000000000000",
          "0.536753213791800000000000000000" ],
        [ "0.547511903605100000000000000000",
          "0.352335762863300000000000000000" ],
        [ "0.756945359479000000000000000000",
          "0.201980091358100000000000000000" ],
        [ "1.224315574928000000000000000000",
          "-0.713986429680700000000000000000" ],
        [ "0.805760900560400000000000000000",
          "-0.462433930967200000000000000000" ],
        [ "0.764355235597600000000000000000",
          "-1.064628191382000000000000000000" ],
        [ "0.821497889673300000000000000000",
          "-1.360865293643000000000000000000" ],
        [ "1.641650312930000000000000000000",
          "-0.254001592034900000000000000000" ],
        [ "2.025627143634000000000000000000",
          "0.221032641613100000000000000000" ],
        [ "1.146020979644000000000000000000",
          "-0.006234673891588000000000000000" ],
        [ "1.139169270299000000000000000000",
          "-0.208230171069800000000000000000" ],
        [ "1.208417377039000000000000000000",
          "-0.201231445288500000000000000000" ],
        [ "1.589810627247000000000000000000",
          "0.543439010067300000000000000000" ],
        [ "1.965506694775000000000000000000",
          "-0.229969450459200000000000000000" ]
      ],
  
      "lunarSurfaceNodes": [
        [ "-0.089228875276690000000000000",
          "-1.495366049410000000000000000" ],
        [ "1.274513486226000000000000000",
          "0.414829078874100000000000000" ],
        [ "-1.207157718790000000000000000",
          "0.385839008768300000000000000" ],
        [ "1.719968486478000000000000000",
          "0.550632044977400000000000000" ],
        [ "1.127904081587000000000000000",
          "-0.373375992870200000000000000" ],
        [ "-0.231472044464100000000000000",
          "-0.382599557578700000000000000" ],
        [ "-0.656078953943200000000000000",
          "-1.110192375426000000000000000" ],
        [ "-0.704289195138400000000000000",
          "2.593939724301000000000000000" ],
        [ "0.497429018331800000000000000",
          "-0.179500861736300000000000000" ],
        [ "-0.649491655085500000000000000",
          "0.578096833089100000000000000" ],
        [ "-0.254979960849500000000000000",
          "-0.239828189956200000000000000" ],
        [ "-0.876898104611200000000000000",
          "1.860835671888000000000000000" ],
        [ "-0.520153154417500000000000000",
          "0.017025965259180000000000000" ],
        [ "-1.790348968178000000000000000",
          "-1.446248139917000000000000000" ],
        [ "1.601830460378000000000000000",
          "-0.575895421910000000000000000" ]
      ],
  
      "lunarCoreLabels": [
        "Porsche",
        "Nike athletic shoes",
        "Mercedes",
        "Lexus",
        "Calvin Klein perfume",
        "Reebok athletic shoes",
        "Guess jeans",
        "Levi 's jeans",
        "American Express",
        "Three mobile phone network",
        "Michelin tires",
        "Visa",
        "Foxtel cable",
        "IBM computers",
        "Sony televisions",
        "Apple computers",
        "Lee jeans",
        "Telstra",
        "Qantas",
        "Revlon cosmetics",
        "Toyota",
        "Pepsi Cola",
        "Diet Coke",
        "SBS TV",
        "Kettle chips",
        "Thins chips",
        "Oil of Olay lotion",
        "Cheezels",
        "McDonald's",
        "Kodak film",
        "Mattel toys",
        "Avon cosmetics",
        "Cadbury s chocolate",
        "ABC radio",
        "Hallmark cards",
        "Arnott's",
        "Coco Pops",
        "Lego",
        "Panadol pain reliever",
        "Colgate toothpaste",
        "Kmart",
        "Campbell's soup"
      ],
  
      "lunarSurfaceLabels": [
        "Charming",
        "Cheerful",
        "Daring",
        "Down.to.earth",
        "Honest",
        "Imaginative",
        "Intelligent",
        "Outdoorsy",
        "Reliable",
        "Spirited",
        "Successful",
        "Tough",
        "Up.to.date",
        "Upper.class",
        "Wholesome"
      ]
    }
    this.plot.draw(data, this.rootElement)
    // const data = [
    //   { color: this._getColor(0), name: this._getColor(0), x: 0, y: 0 },
    //   { color: this._getColor(1), name: this._getColor(1), x: this.initialWidth / 2, y: 0 },
    //   { color: this._getColor(2), name: this._getColor(2), x: 0, y: this.initialHeight / 2 },
    //   { color: this._getColor(3), name: this._getColor(3), x: this.initialWidth / 2, y: this.initialHeight / 2 }
    // ]
    //
    // const allCells = this.outerSvg.selectAll('.node')
    //   .data(data)
    //
    // const enteringCells = allCells.enter()
    //   .append('g')
    //     .attr('class', 'node')
    //     .attr('transform', d => `translate(${d.x},${d.y})`)
    //
    // enteringCells.append('rect')
    //   .attr('width', this.initialWidth / 2)
    //   .attr('height', this.initialHeight / 2)
    //   .attr('class', 'rect')
    //
    // enteringCells.append('text')
    //   .attr('class', () => 'text')

    // this._updateText()
    // return this._updateRectangles()
  }

  _updateText () {
    this.outerSvg.selectAll('.text')
      .attr('x', () => this.initialWidth / 4) // note this is the midpoint (thats why we divide by 4 not 2)
      .attr('y', () => this.initialHeight / 4) // same midpoint consideration
      .style('text-anchor', 'middle')
      .style('dominant-baseline', 'central')
      .style('fill', 'white')
      .style('font-weight', (d) => {
        if (d.name === this.state.selected) {
          return '900'
        }
        return '200'
      })
      .style('font-size', (d) => {
        if (d.name === this.state.selected) {
          return '60px'
        }
        return '18px'
      })
      .text(d => d.name)
      .attr('class', (d) => {
        const classes = ['text', d.name]
        if (d.name === this.state.selected) {
          classes.push('selected')
        }
        return classes.join(' ')
      })
      .on('click', d => this._onClick(d.name))
  }

  _updateRectangles () {
    this.outerSvg.selectAll('.rect')
      .attr('class', d => `rect ${d.name}`)
      .attr('fill', d => d.color)
      .attr('stroke', 'black')
      .attr('stroke-width', (d) => {
        if (d.name === this.state.selected) { return 6 }
        return 0
      })
      .on('click', d => this._onClick(d.name))
  }

  _onClick (clickedSquareName) {
    this._updateState({ selected: clickedSquareName })
    this._draw()
  }

  _updateState (newState) {
    this.state = newState
    // TEMPLATE: this is an example of calling the state callback when the widget state changed !
    if (this.stateChangedCallback) {
      this.stateChangedCallback(this.state)
    }
  }
}
MoonPlot.initClass()

module.exports = MoonPlot
