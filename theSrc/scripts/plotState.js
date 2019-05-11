import _ from 'lodash'

// State {
//   version: 1,
//   sourceData: { coreLabels: [], surfaceLabels: [] },
//   plot: { coreLabels: [], surfaceLabels: [] },
//   plotSize: { width: null, height: null },
//   circleRadius: null, // TODO just make it radius or plotRadius, or move to plot.radius
// })

class PlotState {
  constructor (plotReference) {
    this.setPlotReference(plotReference)
    this.moveCoreLabel = this.moveCoreLabel.bind(this)
    this.moveSurfaceLabel = this.moveSurfaceLabel.bind(this)
    this.circleRadiusChanged = this.circleRadiusChanged.bind(this)
    this.init()
  }

  setPlotReference (plotReference) {
    this.plotReference = plotReference
  }

  init () {
    this.state = {}
    this.listeners = {}
    this.listenerId = 0
  }


  // does not call listeners
  initialiseState (newState) {
    this.state = newState
  }

  setState (newState) {
    this.state = newState
    this.callListeners()
  }

  callListeners () {
    _.each(this.listeners, (listenerFn) => { listenerFn(_.cloneDeep(this.state)) })
  }

  addListener (listenerFn) {
    const newId = this.listenerId++
    this.listeners[newId] = listenerFn

    const deregisterListener = () => {
      delete this.listeners[newId]
    }
    return deregisterListener
  }

  moveCoreLabel (id, coord) {
    // NB in current design we dont need to update the coord in plotState, because the D3 data bind is such that d3 is sharing a direct reference to plotState coords ... (is this good ?)
    _.find(this.state.plot.coreLabels, { id }).moved = true
    this.callListeners()
  }
  
  moveSurfaceLabel (id, coord) {
    // NB in current design we dont need to update the coord in plotState, because the D3 data bind is such that d3 is sharing a direct reference to plotState coords ... (is this good ?)
    _.find(this.state.plot.surfaceLabels, { id }).moved = true
    this.callListeners()
  }

  getCircleRadius () {
    console.log('this.state.circleRadius', `${this.state.circleRadius}`)
    return this.state.circleRadius
  }

  circleRadiusChanged (radius) {
    console.log(`circleRadiusChanged called with`, radius)
    this.plotReference.clearPlot()
    this.plotReference.resetState(radius)
    this.callListeners()
    this.plotReference.draw()
  }

  getCoreLabels () {
    return this.state.plot.coreLabels
  }

  getSurfaceLabels () {
    return this.state.plot.surfaceLabels
  }
}

module.exports = PlotState
