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
    return instance

  renderValue: (el, params, instance) ->
    console.log 'RenderValue called'

    # setting the test data
    unless params.lunarCoreLabels
      console.log 'here'
      instance.draw(testData)
      return instance

    # setup real data
    lunarCoreLabels = []
    lunarSurfaceLabels = []
    i = 0
    while i < params.lunarCoreLabels.length
      lunarCoreLabels.push {
        name: params.lunarCoreLabels[i]
        x: params.lunarCoreNodes[i][0]
        y: params.lunarCoreNodes[i][1]
      }
      i++

    i = 0
    while i < params.lunarSurfaceLabels.length
      lunarSurfaceLabels.push {
        name: params.lunarSurfaceLabels[i]
        x: params.lunarSurfaceNodes[i][0]
        y: params.lunarSurfaceNodes[i][1]
        size: params.lunarSurfaceSizes[i]
      }
      i++

    @data =
      lunarSurfaceLabels: lunarSurfaceLabels
      lunarCoreLabels: lunarCoreLabels
    instance.draw @data

    return instance
