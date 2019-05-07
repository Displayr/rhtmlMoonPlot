import _ from 'lodash'

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
    this.state.labelPositioning.core[id] = coord
    this.callListeners()
  }

  moveSurfaceLabel (id, coord) {
    this.state.labelPositioning.surface[id] = coord
    this.callListeners()
  }

  setPlotSize ({width, height}) {
    this.state.plotSize = { width, height }
    this.callListeners()
  }

  setCircleRadius (radius) {
    this.state.circleRadius = radius
    this.callListeners()
  }

  setData (data) {
    this.state.datahash = PlotState.datahash(data)
  }
}

module.exports = PlotState
