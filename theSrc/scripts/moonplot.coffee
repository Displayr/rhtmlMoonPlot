'use strict'

HTMLWidgets.widget
  name: 'moonplot'
  type: 'output'
  initialize: (el, width, height) ->
    console.log 'Initialized'
    console.log "Given width #{width}"
    console.log "Given height #{height}"

    return new MoonPlot(width, height)

  resize: (el, width, height, instance) ->
    console.log 'Resized'
    instance.redraw(width, height, el)
    return instance

  renderValue: (el, params, instance) ->
    console.log 'RenderValue called'

    # setting the test data, for debugging
    unless params.lunarCoreLabels
      params = testData

    # process raw input data
    normalizeCoreNodes params.lunarCoreNodes
    lunarSurfaceSizes = calculateSurfaceLabelSizes params.lunarSurfaceNodes, 1.5, 0.5
    calculateSurfaceNodePositions params.lunarSurfaceNodes

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
        size: lunarSurfaceSizes[i]
      }
      i++


    @data =
      lunarSurfaceLabels: lunarSurfaceLabels
      lunarCoreLabels: lunarCoreLabels
    instance.draw @data, el

    return instance
