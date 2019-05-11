import _ from 'lodash'

// return _.cloneDeep({
//   version: 1,
//   sourceData: { coreLabels: [], surfaceLabels: [] },
//   plot: { coreLabels: [], surfaceLabels: [] },
//   plotSize: { width: null, height: null },
//   circleRadius: null, // TODO just make it radius or plotRadius, or move to plot.radius
//   labellerHasRan: false,
//   userModifiedPositions: false,
// })

class PlotState {
  constructor () {
    this.moveCoreLabel = this.moveCoreLabel.bind(this)
    this.moveSurfaceLabel = this.moveSurfaceLabel.bind(this)
    this.setPlotSize = this.setPlotSize.bind(this)
    this.setCircleRadius = this.setCircleRadius.bind(this)
    this.init()
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

  getState () {
    return this.state
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

  setPlotSize ({width, height}) {
    this.state.plotSize = { width, height }
    this.callListeners()
  }

  hasCircleRadius (radius) {
    return !_.isNull(this.state.circleRadius)
  }

  getCircleRadius () {
    console.log('this.state.circleRadius', `${this.state.circleRadius}`)
    return this.state.circleRadius
  }

  setCircleRadius (radius) {
    this.state.circleRadius = radius
    this.callListeners()
  }

  setData (data) {
    this.state.datahash = PlotState.datahash(data)
  }

  getCoreLabels () {
    return this.state.plot.coreLabels
  }

  getSurfaceLabels () {
    return this.state.plot.surfaceLabels
  }
}

module.exports = PlotState
