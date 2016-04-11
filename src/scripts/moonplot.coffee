'use strict'

HTMLWidgets.widget
  name: 'moonplot'
  type: 'output'
  initialize: (el, width, height) ->



    xlabels = [
      'Coke'
      'V'
      'Red Bull'
      'Lift Plus'
      'Diet Coke'
      'Fanta'
      'Lift'
      'Pepsi'
    ]
    ylabels = [
      'Kids'
      'Teens'
      'Enjoy life'
      'Picks you up'
      'Refreshes'
      'Cheers you up'
      'Energy'
      'Up-to-date'
      'Fun'
      'When tired'
      'Relax'
    ]
    xCoords1 = [
      -0.24883943
      0.44569980
      0.46998036
      0.47185128
      -0.09772208
      -1.26063599
      -0.49093411
      -0.26108416
    ]

    xCoords2 = [
      -0.2010188
      0.1067263
      0.1311230
      0.1528544
      -0.5236680
      0.4705187
      -0.5165743
      -0.2601922
    ]
    yCoords1 = [
      -1.4490230
      0.2237083
      -0.4205097
      1.4263324
      -0.8261270
      -1.4761390
      1.3724406
      1.4721795
      -1.4674736
      1.4545696
      -0.7609452
    ]
    yCoords2 = [
      0.4344938
      -1.4961307
      -1.4531428
      0.5040123
      -1.2672674
      -0.3308567
      0.6362856
      0.3480518
      0.3673875
      0.4155474
      -1.3074459
    ]
    ySizes = [
      1.5000000
      0.6266882
      0.6970214
      0.9217203
      0.9309172
      0.6470796
      1.0432836
      0.7041052
      1.2600717
      0.8850954
      0.9335861
    ]
    yRotation = [
      -16.69151
      -81.49588
      73.86064
      19.46150
      56.89981
      12.63329
      24.87320
      13.30160
      -14.05532
      15.94379
      59.80021
    ]

    # Normalize lunar surface x, y coords
    # i = 0
    # maxSurfaceX = maxNum yCoords1
    # minSurfaceX = minNum yCoords1
    # maxSurfaceY = maxNum yCoords2
    # minSurfaceY = minNum yCoords2
    #
    # while i < yCoords1.length
    #   yCoords1[i] = (yCoords1[i] - minSurfaceX)/ (maxSurfaceX - minSurfaceX) * 2 - 1
    #   yCoords2[i] = (yCoords2[i] - minSurfaceY)/ (maxSurfaceY - minSurfaceY) * 2 - 1
    #   i++

    svgContainer = d3.select('body')
                     .append('svg')
                     .attr('width', width)
                     .attr('height', height)
    xCenter = 400
    yCenter = 300
    radius = Math.min(height, width) / 3

    # Drag and drop functionality
    dragMove = () ->
      d3.select(this)
        .attr('x', d3.select(this).x = d3.event.x)
        .attr('y', d3.select(this).y = d3.event.y)
        .attr('cursor', 'all-scroll')

      draggedInnerText =  this.innerHTML
      draggedText = _.find lunar_core_labels, (e) -> e.name is draggedInnerText
      draggedText.x =  d3.event.x
      draggedText.y =  d3.event.y


    dragStart = ->
      svgContainer.selectAll('line').remove()
      d3.select(this).style('fill', 'red')

    dragEnd = ->
      lunar_core_links_svg = svgContainer.selectAll('.link')
                          .data(lunar_core_labels)
                          .enter()
                          .append('line')
                          .attr('x1', (d) -> d.ox)
                          .attr('y1', (d) -> d.oy)
                          .attr('x2', (d) -> d.x)
                          .attr('y2', (d) -> d.y)
                          .attr('stroke-width', 0.6)
                          .attr('stroke', 'gray')
      drawCross(svgContainer, xCenter, yCenter)
      d3.select(this).style('fill', 'black')

    drag = d3.behavior.drag()
             .origin(() ->
               t = d3.select(this)
               {x: t.attr("x"), y: t.attr("y")}
              )
             .on('dragstart', dragStart)
             .on('drag', dragMove)
             .on('dragend', dragEnd)

    mouseDownEvent = ->

    svgContainer.append('circle')
                .attr('cx', xCenter)
                .attr('cy', yCenter)
                .attr('r', radius)
                .style('fill', 'none')
                .style('stroke', 'black')
                .style 'fill-opacity', 0.2
                .on('mousedown', mouseDownEvent)


    # Add cross to middle of circle
    drawCross(svgContainer, xCenter, yCenter)

    # Lunar core labels
    i = 0
    anchor_array = []
    lunar_core_labels = []
    while i < xlabels.length
      # Block lunar core labels from escaping the moon
      threshold = 1
      barrier = 0.8
      if xCoords1[i] < -threshold
        xCoords1[i] = -barrier
      if xCoords1[i] > threshold
        xCoords1[i] = barrier
      if xCoords2[i] < -threshold
        xCoords2[i] = -barrier
      if xCoords2[i] > threshold
        xCoords2[i] = barrier
      x = xCoords1[i] * radius + xCenter
      y = -xCoords2[i] * radius + yCenter

      lunar_core_labels.push({
        x: x
        y: y
        name: xlabels[i]
        ox: x
        oy: y
        })

      i++

    lunar_core_labels_svg = svgContainer.selectAll('.label')
                              .data(lunar_core_labels)
                              .enter()
                              .append('text')
                              .style('fill', 'black')
                              .attr('x', (d) -> d.x)
                              .attr('y', (d) -> d.y)
                              .attr('cursor', 'all-scroll')
                              .attr('text-anchor', 'start')
                              .style('font-family', 'Arial')
                              .text (d) -> d.name
                              .call(drag)

    # Size of each labeler
    for core_label in lunar_core_labels_svg[0]
      i = _.findIndex lunar_core_labels, (e) -> e.name == core_label.innerHTML
      lunar_core_labels[i].width = core_label.getBBox().width
      lunar_core_labels[i].height = core_label.getBBox().height

    # Build the anchor arrays
    for lunar_core_label in lunar_core_labels
      anchor_array.push({
        x: lunar_core_label.x
        y: lunar_core_label.y
        r: 2
        })

    # Lay the anchor
    for anchor in anchor_array
      d3.select('svg').append('circle')
                      .attr('stroke-width', 3)
                      .attr('fill', 'black')
                      .attr('cx', anchor.x)
                      .attr('cy', anchor.y)
                      .attr('r', anchor.r)

    # Draw the links
    lunar_core_links_svg = svgContainer.append('g').selectAll('.link')
                        .data(lunar_core_labels)
                        .enter()
                        .append('line')
                        .attr('x1', (d) -> d.x)
                        .attr('y1', (d) -> d.y)
                        .attr('x2', (d) -> d.x)
                        .attr('y2', (d) -> d.y)
                        .attr('stroke-width', 0.6)
                        .attr('stroke', 'gray')


    # Check if labels are overlapping and if need to be repositioned
    labeler = d3.labeler()
      .label(lunar_core_labels)
      .anchor(anchor_array)
      .width(600)
      .height(600)
      .start(100)

    lunar_core_labels_svg.transition()
        .duration(800)
        .attr('x', (d) -> d.x)
        .attr('y', (d) -> d.y)

    lunar_core_links_svg.transition()
        .duration(800)
        .attr('x2', (d) -> d.x)
        .attr('y2', (d) -> d.y)


    # ----------------------------------------------------------------
    cart_coords = []

    # Loop through lunar surface labels
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
                    .attr('transform', 'rotate(' + (-yRotation[i]).toString() + ',' + x.toString() + ', ' + y.toString() + ')')
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
                    .attr('transform', 'rotate(' + (-yRotation[i]).toString() + ',' + x.toString() + ', ' + y.toString() + ')')
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

    for polar_coord in polar_coords
      svgContainer.append('rect')
                  .attr('x', positionAlongLine polar_coord.a, length_of_line)
                  .attr('y', height-polar_coord.h)
                  .attr('width', polar_coord.h)
                  .attr('height', polar_coord.h)
                  .attr('stroke', 'red')

    moveSurfaceCollsions(polar_coords, length_of_line, radius)
    cart_coords = cartesianCoords polar_coords

    # ----------------------------------------------
    cartesian_coords = cartesianCoords polar_coords
    for pc in polar_coords
      if pc.oa
        cc = cartesianCoord {
          a: pc.oa
          r: pc.or
          h: pc.h
        }
        x =  cc.x + xCenter
        y = -cc.y + yCenter
        svgContainer.append('circle')
                    .attr('cx', x)
                    .attr('cy', y)
                    .attr('r', 3)
                    .attr('fill', 'black')
    i = 0
    while i < ylabels.length
      x =  cart_coords[i].x + xCenter
      y = -cart_coords[i].y + yCenter
      rotation = calculateLabelRotation(polarCoord(cart_coords[i]).a)

      if cart_coords[i].x < 0
        svgContainer.append('text')
                    .style('fill', 'black')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('font-size', (ySizes[i] * 20).toString() + 'px')
                    .attr('transform', 'rotate(' + (180 - rotation).toString() + ',' + x.toString() + ', ' + y.toString() + ')')
                    .attr('text-anchor', 'end')
                    .attr('cursor', 'all-scroll')
                    .style('font-family', 'Arial')
                    .text ylabels[i]
                    .call(drag)
      else
        svgContainer.append('text')
                    .style('fill', 'black')
                    .attr('y', y)
                    .attr('x', x)
                    .attr('font-size', (ySizes[i] * 20).toString() + 'px')
                    .attr('transform', 'rotate(' + (-rotation).toString() + ',' + x.toString() + ', ' + y.toString() + ')')
                    .attr('text-anchor', 'start')
                    .attr('cursor', 'all-scroll')
                    .style('font-family', 'Arial')
                    .text ylabels[i]
                    .call(drag)
      i++
    #-----------------------------------------------
    for polar_coord in polar_coords
      svgContainer.append('rect')
                  .attr('x', positionAlongLine polar_coord.a, length_of_line)
                  .attr('y', height-polar_coord.h)
                  .attr('width', polar_coord.h)
                  .attr('height', polar_coord.h)
                  .attr('fill', 'blue')



    svgContainer.append('line')
                .attr('x1', 0)
                .attr('y1', height)
                .attr('x2', length_of_line)
                .attr('y2', height)
                .attr('stroke-width', 1)
                .attr('stroke', 'black')
    collisions = detectSurfaceCollisions(polar_coords, length_of_line)

    for collision in collisions
      svgContainer.append('rect')
                  .attr('x', positionAlongLine collision[0].a, length_of_line)
                  .attr('y', height-collision[0].h)
                  .attr('width', collision[0].h)
                  .attr('height', collision[0].h)
                  .attr('fill', 'blue')
      svgContainer.append('rect')
                  .attr('x', positionAlongLine collision[1].a, length_of_line)
                  .attr('y', height-collision[1].h)
                  .attr('width', collision[1].h)
                  .attr('height', collision[1].h)
                  .attr('fill', 'green')



#    console.log polar_coords






    el.id = svgContainer

  resize: (el, width, height, instance) ->
  renderValue: (el, x, instance) ->
