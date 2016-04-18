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

    # Lunar core labels
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

    # Loop through lunar surface labels
    cart_coords = []
    t = null
    i = 0
    while i < ylabels.length
      x = yCoords1[i] * radius * 0.7 + xCenter
      y = -yCoords2[i] * radius * 0.7 + yCenter

      if yCoords1[i] < 0
        t = svgContainer.append('text')
                    .style('fill', 'black')
                    .attr('class', 'surfaceLabel')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('font-size', (ySizes[i] * 20).toString() + 'px')
                    .attr('text-anchor', 'end')
                    .attr('cursor', 'all-scroll')
                    .style('font-family', 'Arial')
                    .text ylabels[i]
                    .call(drag)
      else
        t = svgContainer.append('text')
                    .style('fill', 'black')
                    .attr('class', 'surfaceLabel')
                    .attr('y', y)
                    .attr('x', x)
                    .attr('font-size', (ySizes[i] * 20).toString() + 'px')
                    .attr('text-anchor', 'start')
                    .attr('cursor', 'all-scroll')
                    .style('font-family', 'Arial')
                    .text ylabels[i]
                    .call(drag)
      cart_coords.push
        x: yCoords1[i]
        y: yCoords2[i]
        h: t[0][0].getBBox().height
      i++

    svgContainer.selectAll('.surfaceLabel').remove()
    polar_coords = polarCoords cart_coords
    length_of_line = radius * 2 * Math.PI

    moveSurfaceCollsions(polar_coords, length_of_line, radius)
    cart_coords = cartesianCoords polar_coords


    # Plot the surface links
    for pc in polar_coords
      if pc.oa
        cc = cartesianCoord {
          a: pc.oa
          r: pc.or
          h: pc.h
        }
        cc_new = cartesianCoord pc

        x =  cc.x + xCenter
        y = -cc.y + yCenter
        x_new =  cc_new.x + xCenter
        y_new = -cc_new.y + yCenter
        l = svgContainer.append('line')
                    .attr('class', 'surface-link')
                    .attr('x1', x)
                    .attr('y1', y)
                    .attr('x2', x_new)
                    .attr('y2', y_new)
                    .attr('stroke', 'gray')
                    .attr('stroke-width', 0.6)
        lunar_surface_links.push
          x1: x
          y1: y
          x2: x_new
          y2: y_new

    t = null
    lunar_surface_labels = []
    i = 0
    while i < ylabels.length
      x =  cart_coords[i].x + xCenter
      y = -cart_coords[i].y + yCenter
      rotation = calculateLabelRotation(polarCoord(cart_coords[i]).a)

      if cart_coords[i].x < 0
        t = svgContainer.append('text')
                    .style('fill', 'black')
                    .attr('class', 'surface-label')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('ox', x)
                    .attr('oy', y)
                    .attr('font-size', (ySizes[i] * 20).toString() + 'px')
                    .attr('transform', 'rotate(' + (180 - rotation).toString() + ',' + x.toString() + ', ' + y.toString() + ')')
                    .attr('text-anchor', 'end')
                    .attr('cursor', 'all-scroll')
                    .style('font-family', 'Arial')
                    .attr('title', ylabels[i])
                    .text ylabels[i]
                    .call(drag)

      else
        t = svgContainer.append('text')
                    .style('fill', 'black')
                    .attr('class', 'surface-label')
                    .attr('y', y)
                    .attr('x', x)
                    .attr('ox', x)
                    .attr('oy', y)
                    .attr('font-size', (ySizes[i] * 20).toString() + 'px')
                    .attr('transform', 'rotate(' + (-rotation).toString() + ',' + x.toString() + ', ' + y.toString() + ')')
                    .attr('text-anchor', 'start')
                    .attr('cursor', 'all-scroll')
                    .style('font-family', 'Arial')
                    .attr('title', ylabels[i])
                    .text ylabels[i]
                    .call(drag)

      lunar_surface_labels.push t[0][0]
      i++

    adjustSurfaceLabelLength lunar_surface_labels, height, width

    el.id = svgContainer

  resize: (el, width, height, instance) ->
  renderValue: (el, x, instance) ->
