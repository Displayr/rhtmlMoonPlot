'use strict'

HTMLWidgets.widget
  name: 'moonplot'
  type: 'output'
  initialize: (el, width, height) ->
    console.log 'Initialized'
    return new MoonPlot(width, height)

  resize: (el, width, height, instance) ->
    console.log 'Resized'
    instance.redraw(width, height, el)
    return instance

  renderValue: (el, params, instance) ->
    console.log 'RenderValue called'

    # setting the test data, for debugging
    unless params.lunarCoreLabels
      instance.draw testData, el
      return instance

    # normalization between -1 and 1
    max = -Infinity
    min = Infinity
    for node in params.lunarCoreNodes
      max = node[0] if node[0] > max
      max = node[1] if node[1] > max
      min = node[0] if node[0] < min
      min = node[1] if node[1] < min

    for node in params.lunarCoreNodes
      node[0] = -1 + (node[0]-min)*2/(max-min)
      node[1] = -1 + (node[1]-min)*2/(max-min)


    distanceFromCenter = (x, y) ->
      Math.sqrt(Math.pow(x,2) + Math.pow(y, 2))

    lunarSurfaceSizes = []
    maxSize = -Infinity
    for node in params.lunarSurfaceNodes
      size = distanceFromCenter(node[0], node[1])
      maxSize = size if size > maxSize
      lunarSurfaceSizes.push size

    for size in lunarSurfaceSizes
      size = size / maxSize

    for node in params.lunarSurfaceNodes
      angle = Math.atan2 node[1], node[0]
      node[0] = Math.cos angle
      node[1] = Math.sin angle


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
