# Drag and drop functionality
setupDragAndDrop = (svg,
                    lunar_core_labels,
                    lunar_surface_links,
                    radius,
                    xCenter,
                    yCenter) ->


  dragStart = () ->
    svg.selectAll('.core-link').remove()
    svg.selectAll('.surface-link').remove()
    d3.select(this).style('fill', 'red')

  dragMove = () ->
    d3.select(this)
    .attr('x', d3.select(this).x = d3.mouse(this)[0])
    .attr('y', d3.select(this).y = d3.mouse(this)[1])
    .attr('cursor', 'all-scroll')

    # Save the new location of text so links can be redrawn
    for core_label in lunar_core_labels
      if d3.select(this).attr('title') == core_label.id
        core_label.x = d3.event.x
        core_label.y = d3.event.y

  dragEnd = ->
    lunar_core_links_svg = svg.selectAll('.core-link')
                        .data(lunar_core_labels)
                        .enter()
                        .append('line')
                        .attr('class', 'core-link')
                        .attr('x1', (d) -> d.ox)
                        .attr('y1', (d) -> d.oy)
                        .attr('x2', (d) -> d.x)
                        .attr('y2', (d) -> d.y)
                        .attr('stroke-width', 0.6)
                        .attr('stroke', 'gray')


    if d3.select(this).attr('ox')
      ox = d3.select(this).attr('ox').toString()
      oy = d3.select(this).attr('oy').toString()
      for surface_link in lunar_surface_links
        if surface_link.x2.toString() == ox and surface_link.y2.toString() == oy
          surface_link.x2 = d3.select(this).attr('x')
          surface_link.y2 = d3.select(this).attr('y')
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

    d3.select(this).style('fill', 'black')
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
