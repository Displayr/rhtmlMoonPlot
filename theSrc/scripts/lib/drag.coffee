setupLunarCoreDragAndDrop = (svg,
                    lunar_core_labels,
                    anchor_array,
                    radius,
                    xCenter,
                    yCenter,
                    textColor) ->
  dragStart = () ->
    svg.selectAll('.core-link').remove()
    # svg.selectAll('.core-label-background').remove()
    d3.select(this).style('fill', 'red')

  dragMove = () ->
    d3.select(this)
    .attr('x', d3.select(this).x = d3.event.x)
    .attr('y', d3.select(this).y = d3.event.y)
    .attr('cursor', 'all-scroll')

    # Save the new location of text so links can be redrawn
    for core_label in lunar_core_labels
      if d3.select(this).attr('title') == core_label.id
        core_label.x = d3.event.x
        core_label.y = d3.event.y

  dragEnd = ->
    # svg.selectAll('.core-link')
    #                     .data(lunar_core_labels)
    #                     .enter()
    #                     .append('line')
    #                     .attr('class', 'core-link')
    #                     .attr('x1', (d) -> d.ox)
    #                     .attr('y1', (d) -> d.oy)
    #                     .attr('x2', (d) -> d.x)
    #                     .attr('y2', (d) -> d.y)
    #                     .attr('stroke-width', 0.6)
    #                     .attr('stroke', 'gray')

    d3.select(this).style('fill', textColor)

    # drawBackground(svg, lunar_core_labels)

    # d3.selectAll('.core-label').moveToFront()
    # d3.selectAll('.moon-circle').moveToFront()
    # d3.selectAll('.core-cross').moveToFront()
    # d3.selectAll('.core-anchor').moveToFront()
    # d3.selectAll('.surface-label').moveToFront()
    adjustCoreLinks(lunar_core_labels, anchor_array)
    adjustCoreLabelLength(d3.selectAll('.core-label')[0], radius, xCenter, yCenter)

  d3.behavior.drag()
           .origin(() ->
             {
               x: d3.select(this).attr("x")
               y: d3.select(this).attr("y")
             }
            )
           .on('dragstart', dragStart)
           .on('drag', dragMove)
           .on('dragend', dragEnd)



setupLunarSurfaceDragAndDrop = (svg,
                    lunar_surface_labels,
                    lunar_surface_links,
                    radius,
                    xCenter,
                    yCenter,
                    height,
                    width,
                    textColor) ->
  dragStart = () ->
    svg.selectAll('.surface-link').remove()
    d3.select(this).style('fill', 'red')

  dragMove = () ->
    d3.select(this)
    .attr('x', d3.select(this).x = d3.mouse(this)[0])
    .attr('y', d3.select(this).y = d3.mouse(this)[1])
    .attr('cursor', 'all-scroll')

  dragEnd = ->
    d3.select(this).style('fill', textColor)

    if d3.select(this).attr('ox')
      crossColorox = d3.select(this).attr('ox').toString()
      ox = d3.select(this).attr('ox').toString()
      oy = d3.select(this).attr('oy').toString()
      for surface_link in lunar_surface_links
        if surface_link.x2.toString() == ox and surface_link.y2.toString() == oy
          x2 = d3.mouse(this)[0]
          y2 = d3.mouse(this)[1]

          # Use the context transformation matrix to rotate the link's new positions
          ctm = d3.select(this)[0][0].getCTM()
          surface_link.x2 = x2*ctm.a + y2*ctm.c + ctm.e
          surface_link.y2 = x2*ctm.b + y2*ctm.d + ctm.f

          d3.select(this).attr('ox', surface_link.x2)
                         .attr('oy', surface_link.y2)

    svg.selectAll('.surface-link')
      .data(lunar_surface_links)
      .enter()
      .append('line')
      .attr('class', 'surface-link')
      .attr('x1', (d) -> d.x1)
      .attr('y1', (d) -> d.y1)
      .attr('x2', (d) -> d.x2)
      .attr('y2', (d) -> d.y2)
      .attr('stroke-width', 0.6)
      .attr('stroke', 'gray')

    adjustSurfaceLabelLength lunar_surface_labels, height, width


  d3.behavior.drag()
           .origin(() ->
             {
               x: d3.select(this).attr("x")
               y: d3.select(this).attr("y")
             }
            )
           .on('dragstart', dragStart)
           .on('drag', dragMove)
           .on('dragend', dragEnd)

setupMoonResize = (data, svg, cx, cy, height, width, radius, textColor) ->
  drag = () ->

    findDistance = (cx, cy, x, y) ->
      Math.sqrt(Math.pow((x - cx), 2) + Math.pow((y - cy), 2))
    mouseX = d3.mouse(this)[0]
    mouseY = d3.mouse(this)[1]
    newRadius = findDistance(cx, cy, mouseX, mouseY)
    radius = newRadius
    d3.select(this).attr('r', newRadius)

  dragStart = () ->
    svg.selectAll('.core-link').remove()
    svg.selectAll('.core-label').remove()
    svg.selectAll('.core-label-background').remove()
    svg.selectAll('.core-anchor').remove()
    svg.selectAll('.surface-link').remove()
    svg.selectAll('.surface-label').remove()

  dragEnd = () ->
    console.log "Moon resized to r=#{radius}"
    drawLunarCoreLabels(data.lunarCoreLabels, svg,
                        cx,
                        cy,
                        radius,
                        textColor)

    drawLunarSurfaceLabels(data.lunarSurfaceLabels, svg,
                           cx,
                           cy,
                           radius,
                           height,
                           width,
                           textColor)

  d3.behavior.drag()
            .origin(() ->
              {
                x: d3.select(this).attr("cy")
                y: d3.select(this).attr("cy")
              })
            .on('dragstart', dragStart)
            .on('drag', drag)
            .on('dragend', dragEnd)
