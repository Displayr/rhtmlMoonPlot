HTMLWidgets.widget
  name: 'moonplot'
  type: 'output'
  initialize: (el, width, height) ->

    dragMove = () ->
      d3.select(this)
        .attr('x', d3.select(this).x = d3.event.x)
        .attr('y', d3.select(this).y = d3.event.y)
        .attr('cursor', 'all-scroll')

    dragStart = ->
      d3.select(this).style('fill', 'red')

    dragEnd = ->
      d3.select(this).style('fill', 'black')

    drag = d3.behavior.drag()
             .origin(() ->
               t = d3.select(this)
               {x: t.attr("x"), y: t.attr("y")}
              )
             .on('dragstart', dragStart)
             .on('drag', dragMove)
             .on('dragend', dragEnd)

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

    svgContainer = d3.select('body')
                     .append('svg')
                     .attr('width', width)
                     .attr('height', height)
    xCenter = width / 2
    yCenter = xCenter
    radius = width / 3

    mouseDownEvent = ->
      console.log 'blah'

    svgContainer.append('circle')
                .attr('cx', xCenter)
                .attr('cy', yCenter)
                .attr('r', radius)
                .style('fill', 'none')
                .style('stroke', 'black')
                .style 'fill-opacity', 0.2
                .on('mousedown', mouseDownEvent)


    # Add cross to middle of circle
    crossSize = 6
    crossWidth = 1
    crossLine1 = d3.select('svg')
                   .append('line')
                     .attr('x1', xCenter - crossSize)
                     .attr('y1', yCenter)
                     .attr('x2', xCenter + crossSize)
                     .attr('y2', yCenter)
                     .attr('stroke-width', crossWidth)
                     .attr('stroke', 'black')
    crossLine2 = d3.select('svg')
                   .append('line')
                     .attr('x1', xCenter)
                     .attr('y1', yCenter - crossSize)
                     .attr('x2', xCenter)
                     .attr('y2', yCenter + crossSize)
                     .attr('stroke-width', crossWidth)
                     .attr('stroke', 'black')


    # Lunar core labels

    i = 0
    coreLabels = []
    drags = []
    while i < xlabels.length
      # Block lunar core labels from escaping the moon
      threshold = 1
      barrier = 0.9
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



      lunarCoreLabel = d3.select('svg')
                         .append('text')
                            .style('fill', 'black')
                            .attr('x', x)
                            .attr('y', y)
                            .attr('cursor', 'all-scroll')
                            .style('font-family', 'Arial')
                            .text xlabels[i]
                            .call(drag)
      coreLabels.push(lunarCoreLabel)
      i++


    # Check if labels are overlapping and if need to be repositioned
    boundingBoxesOverlap = (box1, box2) ->
      box1 = box1.getBoundingClientRect()
      box2 = box2.getBoundingClientRect()
      if box1.bottom < box2.top # is box1 on top of box2
        false
      else if box1.top > box2.bottom # is box1 underneath box2
        false
      else if box1.right < box2.left # box1 is to the left of box2
        false
      else if box1.left > box2.right # box1 is to the right of box2
        false
      else
        true

    repositionBoxes = (box1, box2) ->
      vgap = 10
      hgap = 1
      # Get position of bounding bounding boxes
      box1Coords = box1.getBoundingClientRect()
      box2Coords = box2.getBoundingClientRect()

      console.log box1Coords

      # Increase the space between the boxes
      if  box1Coords.bottom > box2Coords.top # is box1 on top of box2
        d3.select(box1).attr('dy', -vgap)
        d3.select(box2).attr('dy', vgap)
      if box1Coords.top > box2Coords.bottom # is box1 underneath box2
        d3.select(box1).attr('dy', vgap)
        d3.select(box2).attr('dy', -vgap)
      if box1Coords.right > box2Coords.left # box1 is to the left of box2
        d3.select(box1).attr('dx', hgap)
        d3.select(box2).attr('dx', -hgap)
      if box1Coords.left < box2Coords.right  # box1 is to the right of box2
        d3.select(box1).attr('dx', hgap)
        d3.select(box2).attr('dx', -hgap)

    i = 0
    while i < coreLabels.length
      j = i + 1
      while j < coreLabels.length
        if boundingBoxesOverlap(coreLabels[i][0][0], coreLabels[j][0][0])
          repositionBoxes coreLabels[i][0][0], coreLabels[j][0][0]
          console.log coreLabels[i][0][0]
          console.log coreLabels[j][0][0]
          console.log '----'

        j++
      i++


    # Loop through lunar surface labels
    i = 0
    while i < ylabels.length
      x = yCoords1[i] * radius * 0.7 + xCenter
      y = -yCoords2[i] * radius * 0.7 + yCenter

      if yCoords1[i] < 0
        svgContainer.append('text')
                    .style('fill', 'black')
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
        svgContainer.append('text')
                    .style('fill', 'black')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('font-size', (ySizes[i] * 20).toString() + 'px')
                    .attr('transform', 'rotate(' + (-yRotation[i]).toString() + ',' + x.toString() + ', ' + y.toString() + ')')
                    .attr('text-anchor', 'start')
                    .attr('cursor', 'all-scroll')
                    .style('font-family', 'Arial')
                    .text ylabels[i]
                    .call(drag)
      i++

    el.id = svgContainer

    return
  resize: (el, width, height, instance) ->
  renderValue: (el, x, instance) ->
