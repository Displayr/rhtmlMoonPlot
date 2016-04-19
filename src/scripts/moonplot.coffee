'use strict'

HTMLWidgets.widget
  name: 'moonplot'
  type: 'output'
  initialize: (el, width, height) ->
    console.log 'Initialized'
    return new MoonPlot(width, height)

  resize: (el, width, height, instance) ->
    console.log 'Resized'
    instance.redraw(width, height)
    return mp

  renderValue: (el, params, instance) ->
    console.log 'RenderValue called'

    console.log "instance"
    console.log instance
    console.log "params"
    console.log params

    # setting the test data
    params.data = testData


    instance.draw(params.data)
    return
