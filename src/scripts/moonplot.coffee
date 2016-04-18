'use strict'


HTMLWidgets.widget
  name: 'moonplot'
  type: 'output'
  initialize: (el, width, height) ->
    svg = d3.select('body')
                     .append('svg')
                     .attr('width', width)
                     .attr('height', height)
                     .attr('class', 'moonplot-container')
    xCenter = width /2
    yCenter = height /2
    radius = Math.min(height, width) / 3

    drawCircle(svg, xCenter, yCenter, radius, height, width)
    drawLunarCoreLabels(svg,xCenter,yCenter,radius)
    drawLunarSurfaceLabels(svg,xCenter,yCenter,radius,height,width)

    el.id = svg

  resize: (el, width, height, instance) ->
    console.log 'Resized'
    d3.select('.moonplot-container').remove()
    svg = d3.select('body')
                     .append('svg')
                     .attr('width', width)
                     .attr('height', height)
                     .attr('class', 'moonplot-container')
    xCenter = width /2
    yCenter = height /2
    radius = Math.min(height, width) / 3

    drawCircle(svg, xCenter, yCenter, radius, height, width)
    drawLunarCoreLabels(svg,xCenter,yCenter,radius)
    drawLunarSurfaceLabels(svg,xCenter,yCenter,radius,height,width)

    el.id = svg

  renderValue: (el, x, instance) ->
