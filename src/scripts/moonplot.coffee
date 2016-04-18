'use strict'



HTMLWidgets.widget
  name: 'moonplot'
  type: 'output'
  initialize: (el, width, height) ->
    lunar_core_labels_svg = []
    lunar_core_labels = []
    lunar_surface_links = []

    svgContainer = d3.select('body')
                     .append('svg')
                     .attr('width', width)
                     .attr('height', height)
    xCenter = width /2
    yCenter = height /2
    radius = Math.min(height, width) / 3

    drawCircle(svgContainer, xCenter, yCenter, radius)

    drag = setupDragAndDrop(svgContainer,
                            lunar_core_labels,
                            lunar_surface_links,
                            radius,
                            xCenter,
                            yCenter)
    drawLunarCoreLabels(svgContainer,
                        xCenter,
                        yCenter,
                        radius,
                        lunar_core_labels_svg,
                        lunar_core_labels,
                        drag)

    drawLunarSurfaceLabels(svgContainer,
                           xCenter,
                           yCenter,
                           radius,
                           lunar_surface_links,
                           drag,
                           height,
                           width)
    el.id = svgContainer

  resize: (el, width, height, instance) ->
  renderValue: (el, x, instance) ->
