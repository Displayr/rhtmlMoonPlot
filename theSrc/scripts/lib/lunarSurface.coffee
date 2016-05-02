drawLunarSurfaceLabels = (lunarSurfaceLabels
                          svg,
                          cx,
                          cy,
                          radius,
                          height,
                          width) ->

  lunar_surface_links = []
  drag = setupLunarSurfaceDragAndDrop(svg,
                                      lunar_surface_links,
                                      radius,
                                      cx,
                                      cy)
  cart_coords = []
  t = null
  for label in lunarSurfaceLabels
    x = label.x * radius * 0.7 + cx
    y = -label.y * radius * 0.7 + cy

    if label.x < 0
      t = svg.append('text')
                  .attr('class', 'surface-label')
                  .attr('x', x)
                  .attr('y', y)
                  .attr('font-size', (label.size * 20).toString() + 'px')
                  .attr('text-anchor', 'end')
                  .style('font-family', 'Arial')
                  .text label.name
    else
      t = svg.append('text')
                  .attr('class', 'surface-label')
                  .attr('x', x)
                  .attr('y', y)
                  .attr('font-size', (label.size * 20).toString() + 'px')
                  .attr('text-anchor', 'start')
                  .style('font-family', 'Arial')
                  .text label.name

    cart_coords.push
      x: label.x
      y: label.y
      h: t[0][0].getBBox().height

  svg.selectAll('.surface-label').remove()
  polar_coords = polarCoords cart_coords
  length_of_line = radius * 2 * Math.PI

  moveSurfaceCollsions(polar_coords, length_of_line, radius)
  cart_coords = cartesianCoords polar_coords

  # Load the new cartesian coordinates into lunarSurfaceLabels array
  i = 0
  for label in lunarSurfaceLabels
    label.newX = cart_coords[i].x
    label.newY = cart_coords[i].y
    label.rotation = calculateLabelRotation(polarCoord(cart_coords[i]).a)
    i++


  # Plot the surface links
  for pc in polar_coords
    cc = null
    if pc.oa
      cc = cartesianCoord
        a: pc.oa
        r: pc.or
        h: pc.h

    else
      cc = cartesianCoord pc
    cc_new = cartesianCoord pc
    x =  cc.x + cx
    y = -cc.y + cy
    x_new =  cc_new.x + cx
    y_new = -cc_new.y + cy
    l = svg.append('line')
                .attr('class', 'surface-link')
                .attr('x1', x)
                .attr('y1', y)
                .attr('ox', x)
                .attr('oy', y)
                .attr('x2', x_new)
                .attr('y2', y_new)
                .attr('stroke', 'gray')
                .attr('stroke-width', 0.6)
    lunar_surface_links.push
      x1: x
      y1: y
      x2: x_new
      y2: y_new
      ox: x
      oy: y

  t = null
  lunar_surface_labels = []
  for label in lunarSurfaceLabels
    x =  label.newX + cx
    y = -label.newY + cy

    if label.newX < 0
      t = svg.append('text')
                  .style('fill', 'black')
                  .attr('class', 'surface-label')
                  .attr('x', x)
                  .attr('y', y)
                  .attr('ox', x)
                  .attr('oy', y)
                  .attr('font-size', (label.size * 20).toString() + 'px')
                  .attr('transform', 'rotate(' + (180 - label.rotation).toString() + ',' + x.toString() + ', ' + y.toString() + ')')
                  .attr('text-anchor', 'end')
                  .attr('cursor', 'all-scroll')
                  .style('font-family', 'Arial')
                  .attr('title', label.name)
                  .text label.name
                  .call(drag)

    else
      t = svg.append('text')
                  .style('fill', 'black')
                  .attr('class', 'surface-label')
                  .attr('y', y)
                  .attr('x', x)
                  .attr('ox', x)
                  .attr('oy', y)
                  .attr('font-size', (label.size * 20).toString() + 'px')
                  .attr('transform', 'rotate(' + (-label.rotation).toString() + ',' + x.toString() + ', ' + y.toString() + ')')
                  .attr('text-anchor', 'start')
                  .attr('cursor', 'all-scroll')
                  .style('font-family', 'Arial')
                  .attr('title', label.name)
                  .text label.name
                  .call(drag)
    lunar_surface_labels.push t[0][0]

  adjustSurfaceLabelLength lunar_surface_labels, height, width
