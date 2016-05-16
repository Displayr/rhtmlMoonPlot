drawLunarCoreLabels = (lunarCoreLabels,
                       svg,
                       cx,
                       cy,
                       radius,
                       textColor) ->

  drawLabels = (label_data, drag) ->
    labels = svg.selectAll('.core-label')
       .data(label_data)
       .enter()
       .append('text')
       .style('fill', textColor)
       .attr('class', 'core-label')
       .attr('x', (d) -> d.x)
       .attr('y', (d) -> d.y)
       .attr('ox', (d) -> d.x)
       .attr('oy', (d) -> d.y)
       .attr('cursor', 'all-scroll')
       .attr('text-anchor', 'middle')
       .style('font-family', 'Arial')
       .attr('title', (d) -> d.name)
       .text (d) -> d.name
       .call(drag)
       .append('title').text((d) -> d.name)
    svg.selectAll('.core-label')


  drawLinks = (label_data) ->
    svg.append('g').selectAll('.core-link')
                   .data(label_data)
                   .enter()
                   .append('line')
                   .attr('class', 'core-link')
                   .attr('x1', (d) -> d.x)
                   .attr('y1', (d) -> d.y)
                   .attr('x2', (d) -> d.x)
                   .attr('y2', (d) -> d.y)
                   .attr('stroke-width', 0.6)
                   .attr('stroke', 'gray')

  lunar_core_labels_svg = []
  lunar_core_labels = []
  drag = setupLunarCoreDragAndDrop(svg,
                          lunar_core_labels,
                          radius,
                          cx,
                          cy,
                          textColor)
  # prevent labels from escaping moon surface
  for label in lunarCoreLabels
    x = label.x * radius + cx
    y = -label.y * radius + cy

    lunar_core_labels.push({
      x: x
      y: y
      name: label.name
      id: label.name
      ox: x
      oy: y
      })



  lunar_core_labels_svg = drawLabels(lunar_core_labels, drag)

  # Size of each labeler
  i = 0
  while i < lunar_core_labels.length
    lunar_core_labels[i].width = lunar_core_labels_svg[0][i].getBBox().width
    lunar_core_labels[i].height = lunar_core_labels_svg[0][i].getBBox().height
    i++

  svg.selectAll('.core-label').remove()
  # lunar_core_label_background_svg = drawBackground(svg, lunar_core_labels)
  lunar_core_labels_svg = drawLabels(lunar_core_labels, drag)


  # Build the anchor arrays
  anchor_array = []
  for lunar_core_label in lunar_core_labels
    anchor_array.push({
      x: lunar_core_label.x
      y: lunar_core_label.y
      r: 8
      dr: 2
      })

  # Lay the anchor
  for anchor in anchor_array
    d3.select('svg').append('circle')
                    .attr('stroke-width', 3)
                    .attr('class', 'core-anchor')
                    .attr('fill', 'black')
                    .attr('cx', anchor.x)
                    .attr('cy', anchor.y)
                    .attr('r', anchor.dr)

  # Draw the links
  lunar_core_links_svg = drawLinks(lunar_core_labels)
  lunar_core_links_svg.moveToBack()
  # lunar_core_label_background_svg.moveToFront()
  lunar_core_labels_svg.moveToFront()
  d3.selectAll('.core-anchor').moveToFront()
  d3.selectAll('.moon-circle').moveToFront()
  d3.selectAll('.core-cross').moveToFront()
  d3.selectAll('.surface-label').moveToFront()

  # Check if labels are overlapping and if need to be repositioned
  labeler = d3.labeler()
    .svg(svg)
    .cx(cx)
    .cy(cy)
    .radius(radius)
    .label(lunar_core_labels)
    .anchor(anchor_array)
    .start(100)

  n = 0
  lunar_core_labels_svg.transition()
      .duration(800)
      .attr('x', (d) -> d.x)
      .attr('y', (d) -> d.y)
      .each(-> n++)
      .each('end', ->
        n--
        endAll() if not n
        )

  endAll = () ->
    adjustCoreLabelLength(lunar_core_labels_svg[0], radius, cx, cy)

    dist = (x1, x2, y1, y2) ->
      Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

    closestPtOnLabelBorder = (lab, anc) ->
      ptsOnLab = [
        [lab.x - lab.width/2,     lab.y]
        [lab.x,                   lab.y]
        [lab.x + lab.width/2,     lab.y]
        [lab.x - lab.width/2,     lab.y - lab.height]
        [lab.x,                   lab.y - lab.height]
        [lab.x + lab.width/2,     lab.y - lab.height]
        [lab.x - lab.width/2,     lab.y - lab.height/2]
        [lab.x + lab.width/2,     lab.y - lab.height/2]
      ]

      j = 0
      while j < 8
        d3.select('svg').append('circle').attr('cx', ptsOnLab[j][0])
                            .attr('stroke-width', 1)
                            .attr('fill', 'green')
                            .attr('cy', ptsOnLab[j][1])
                            .attr('r', 1)
                            .attr('stroke')
        j++

      dists = _.map ptsOnLab, (e) ->
        dist(e[0], anc.x, e[1], anc.y)

      d3.select('svg').append('circle').attr('cx', anc.x)
                          .attr('stroke-width', 3)
                          .attr('class', 'blah')
                          .attr('fill', 'red')
                          .attr('cy', anc.y)
                          .attr('r', 5)
                          .attr('stroke')

      minPt = _.reduce(dists, (acc, val, i) ->
        console.log acc
        console.log val
        if val < acc.val
          return {i_min: i, val: val}
        else
          return {i_min: acc.i_min, val: acc.val}
      , {val: Infinity})
      console.log minPt.i
      ptsOnLab[minPt.i_min]


    j = 0
    while j < lunar_core_labels.length
      newLinkPt = closestPtOnLabelBorder lunar_core_labels[j], anchor_array[j]
      console.log newLinkPt
      d3.select('svg').append('circle').attr('cx', newLinkPt[0])
                          .attr('stroke-width', 3)
                          .attr('class', 'core-anchor')
                          .attr('fill', 'blue')
                          .attr('cy', newLinkPt[1])
                          .attr('r', 5)
                          .attr('stroke')
      j++



  lunar_core_links_svg.transition()
      .duration(800)
      .attr('x2', (d) -> d.x)
      .attr('y2', (d) -> d.y)

  # lunar_core_label_background_svg.transition()
  #                                .duration(800)
  #                                .attr('x', (d) -> d.x - 2 - d.width/2)
  #                                .attr('y', (d) -> d.y - d.height + 2)
