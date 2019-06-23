import _ from 'lodash'

// State {
//   version: 1,
//   sourceData: { coreLabels: [], surfaceLabels: [] },
//   plot: { coreLabels: [], surfaceLabels: [] },
//   plotSize: { width: null, height: null },
//   circleRadius: null, // TODO just make it radius or plotRadius, or move to plot.radius
// })

class PlotState {
  constructor () {
    this.moveCoreLabel = this.moveCoreLabel.bind(this)
    this.moveSurfaceLabel = this.moveSurfaceLabel.bind(this)
    this.circleRadiusChanged = this.circleRadiusChanged.bind(this)
    this.getCoreLabels = this.getCoreLabels.bind(this)
    this.getSurfaceLabels = this.getSurfaceLabels.bind(this)
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

  circleRadiusChanged (radius) {
    // TODO this sequence should be in outerPlot.reset()
    this.plotReference.clearPlot()
    this.plotReference.initialiseComponents()
    this.plotReference.resetState(radius)
    this.callListeners()
    this.plotReference.draw()
  }

  getCircleRadius () {
    return this.state.circleRadius
  }

  getCenter () {
    return this.state.center
  }

  getCoreLabels () {
    return this.state.plot.coreLabels
  }

  getSurfaceLabels () {
    return this.state.plot.surfaceLabels
  }

  getPlotSize () {
    return this.state.plotSize
  }
}

module.exports = PlotState
