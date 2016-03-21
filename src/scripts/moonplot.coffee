HTMLWidgets.widget
  name: 'moonplot'
  type: 'output'
  initialize: (el, width, height) ->
    console.log 'initialized'

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
    svgContainer = d3.select('body').append('svg').attr('width', width).attr('height', height)
    xCenter = width / 2
    yCenter = xCenter
    radius = width / 3
    svgContainer.append('circle').attr('cx', xCenter).attr('cy', yCenter).attr('r', radius).style('fill', 'none').style('stroke', 'black').style 'fill-opacity', 0.2
    # TODO
    svgContainer.selectAll('circle').on 'mouseenter', (d) ->
      `var y`
      `var x`
      `var i`
      svgContainer.select('circle').style 'fill', 'red'
      return

    i = 0
    while i < xlabels.length
      if xCoords1[i] < -1
        xCoords1[i] = -0.9
      if xCoords1[i] > 1
        xCoords1[i] = 0.9
      if xCoords2[i] < -1
        xCoords2[i] = -0.9
      if xCoords2[i] > 1
        xCoords2[i] = 0.9
      x = xCoords1[i] * radius + xCenter
      y = -xCoords2[i] * radius + yCenter
      svgContainer.append('text').style('fill', 'black').attr('x', x).attr('y', y).style('font-family', 'Arial').text xlabels[i]
      i++

    i = 0
    while i < ylabels.length
      x = yCoords1[i] * radius * 0.7 + xCenter
      y = -yCoords2[i] * radius * 0.7 + yCenter
      if yCoords1[i] < 0
        svgContainer.append('text').style('fill', 'black').attr('x', x).attr('y', y).attr('font-size', (ySizes[i] * 20).toString() + 'px').attr('transform', 'rotate(' + (-yRotation[i]).toString() + ',' + x.toString() + ', ' + y.toString() + ')').attr('text-anchor', 'end').style('font-family', 'Arial').text ylabels[i]
      else
        svgContainer.append('text').style('fill', 'black').attr('x', x).attr('y', y).attr('font-size', (ySizes[i] * 20).toString() + 'px').attr('transform', 'rotate(' + (-yRotation[i]).toString() + ',' + x.toString() + ', ' + y.toString() + ')').attr('text-anchor', 'start').style('font-family', 'Arial').text ylabels[i]
      i++
    el.id = svgContainer
    return
  resize: (el, width, height, instance) ->
  renderValue: (el, x, instance) ->
