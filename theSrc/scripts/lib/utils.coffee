# Detect if there is intersection between lunar surface labels
# Return the pairs of collisions
detectSurfaceCollisions = (polar_coords, length_of_line) ->
  error_allowed = 5
  collisions = []
  i = 0
  while i < polar_coords.length
    p1 = polar_coords[i]
    i++
    j = i
    while j < polar_coords.length
      p2 = polar_coords[j]
      j++
      unless p1 == p2
        p1l = positionAlongLine(p1.a, length_of_line) + error_allowed
        p1r = p1l + p1.h - error_allowed
        p2l = positionAlongLine(p2.a, length_of_line) + error_allowed
        p2r = p2l + p2.h - error_allowed
        if p1r > p2l and p1l < p2r
          p1.collision_r = true
          p2.collision_l = true
          collisions.push [p1, p2]
        else if p2r > p1l and p2l < p1r
          p1.collision_l = true
          p2.collision_r = true
          collisions.push [p1, p2]
  collisions

# Move the colliding pairs after collision is detected
moveSurfaceCollsions = (polar_coords, length_of_line, radius) ->
  for pc in polar_coords
    pc.r = radius

  polar_coords = _.sortBy polar_coords, (coords) -> coords.a
  move_amount = 0.2 / 360 * 2 * Math.PI # deg to rad
  altitude_incr = 0.1 * length_of_line / 360
  collisions = detectSurfaceCollisions(polar_coords, length_of_line)

  max_moves = 500
  while collisions.length > 0 and max_moves > 0
    max_moves--
    console.log 'Moved surface labels'
    for pc in polar_coords
      if pc.collision_l
        # Save original coords
        unless pc.oa and pc.or
          pc.oa = pc.a
          pc.or = pc.r

        if pc.a > .5*Math.PI # UL
          pc.a += move_amount
        else if pc.a < -0.5*Math.PI # LL
          pc.a += move_amount
        else if pc.a > -.5*Math.PI and pc.a < 0 #LR
          pc.a += move_amount
        else if pc.a > 0 and pc.a < .5*Math.PI #UR
          pc.a += move_amount
        pc.collision_l = false
        pc.r += altitude_incr

      else if pc.collision_r
        # Save original coords
        unless pc.oa and pc.or
          pc.oa = pc.a
          pc.or = pc.r

        if pc.a > .5*Math.PI #UL
          pc.a -= move_amount
        else if pc.a < -.5*Math.PI #LL
          pc.a -= move_amount
        else if pc.a > -.5*Math.PI and pc.a < 0 #LR
          pc.a -= move_amount
        else if pc.a > 0 and pc.a < .5*Math.PI #UR
          pc.a -= move_amount

        pc.collision_r = false
        pc.r += altitude_incr

      collisions = detectSurfaceCollisions(polar_coords, length_of_line)


# Convert Cartesian to polar coordinates
polarCoords = (cart_coords) ->
  polar_coords = []
  for cart_coord in cart_coords
    polar_coords.push polarCoord cart_coord
  polar_coords

polarCoord = (cart_coord) ->
  r: Math.sqrt(Math.pow(cart_coord.x,2) + Math.pow(cart_coord.y,2))
  a: Math.atan2 cart_coord.y, cart_coord.x
  h: cart_coord.h

# Convert polar to Cartesian coordinates
cartesianCoords = (polar_coords) ->
  cart_coords = []
  for polar_coord in polar_coords
    cart_coords.push cartesianCoord polar_coord
  cart_coords

cartesianCoord = (polar_coord) ->
  x: polar_coord.r * Math.cos polar_coord.a
  y: polar_coord.r * Math.sin polar_coord.a
  h: polar_coord.h

# Translate angles to position on line
positionAlongLine = (rad, length_of_line) ->
  ((rad + Math.PI) / (2*Math.PI)) * length_of_line

calculateLabelRotation = (angle_rad) ->
  angle_rad / 2 / Math.PI * 360

detectViewportCollision = (surface_label, viewport_height, viewport_width) ->
  box = surface_label.getBBox()
  box.right = box.x + box.width
  box.left = box.x
  box.top = box.y
  box.bottom = box.y + box.width
  box.left < 0 or box.bottom > viewport_height or box.right > viewport_width or box.top < 0

condenseSurfaceLabel = (surface_label, viewport_height, viewport_width) ->
  # Throw away chars one at a time and check if still collides w/viewport
  while detectViewportCollision surface_label, viewport_height, viewport_width
    innerHTML = d3.select(surface_label)[0][0].textContent
    d3.select(surface_label).text(innerHTML.slice(0, -1))
  innerHTML = d3.select(surface_label)[0][0].textContent
  d3.select(surface_label).text(innerHTML.slice(0, -3) + '...')

adjustSurfaceLabelLength = (surface_labels, view_height, view_width) ->
  extendFullLabelName(surface_labels)
  for surface_label in surface_labels
    if detectViewportCollision surface_label, view_height, view_width
      condenseSurfaceLabel surface_label, view_height, view_width
    tooltipText = d3.select(surface_label).attr('title')
    d3.select(surface_label).append('title').text(tooltipText)

# Detect collisions with lunar core labels and moon surface
detectCoreLabelBoundaryCollision = (core_label, radius, cx, cy) ->
  core_label_bb = core_label.getBBox()
  y_right = core_label_bb.y
  x_right = core_label_bb.x + core_label_bb.width

  # Calculate circle boundary using parametric eq for circle
  angle = Math.asin((y_right - cy)/radius)
  circle_boundary_right = cx + radius*Math.cos(angle)

  circle_boundary_right < x_right

coreLabelTooLong = (core_label, radius) ->
  core_label.getBBox().width > radius

failsCoreLabelBoundaryRules = (core_label, radius, cx, cy) ->
  detectCoreLabelBoundaryCollision(core_label, radius, cx, cy) or
    coreLabelTooLong(core_label, radius)

condenseCoreLabel = (core_label, radius, cx, cy) ->
  while failsCoreLabelBoundaryRules(core_label, radius, cx, cy)
    innerHTML = d3.select(core_label)[0][0].textContent
    d3.select(core_label).text(innerHTML.slice(0, -1))
  innerHTML = d3.select(core_label)[0][0].textContent
  d3.select(core_label).text(innerHTML.slice(0, -3) + '...')
  d3.select(core_label).data()[0].width = core_label.getBBox().width

extendFullLabelName = (labels) ->
  for label in labels
    d3.select(label).text(d3.select(label).attr('title'))

adjustCoreLabelLength = (core_labels, radius, cx, cy) ->
  extendFullLabelName(core_labels)
  for core_label in core_labels
    if failsCoreLabelBoundaryRules(core_label, radius, cx, cy)
      condenseCoreLabel core_label, radius, cx, cy
    d3.select(core_label).append('title').text(d3.select(core_label).attr('title'))

distanceFromCenter = (x, y) ->
  Math.sqrt(Math.pow(x,2) + Math.pow(y, 2))

normalizeCoreNodes = (rawCoreNodes) ->
  # normalization between -1 and 1 (padded by threshold)
  threshold = 0.1
  max = -Infinity
  min = Infinity
  for node in rawCoreNodes
    max = node[0] if node[0] > max
    max = node[1] if node[1] > max
    min = node[0] if node[0] < min
    min = node[1] if node[1] < min

  for node in rawCoreNodes
    squareX = -1 + (node[0]-min)*(2)/(max-min)
    squareY = -1 + (node[1]-min)*(2)/(max-min)

    # map square values into circular moon
    node[0] = (1-threshold) * squareX * Math.sqrt(1 - 0.5 * Math.pow(squareY,2))
    node[1] = (1-threshold) * squareY * Math.sqrt(1 - 0.5 * Math.pow(squareX,2))

calculateSurfaceNodePositions = (rawSurfaceNodes) ->
  for node in rawSurfaceNodes
    angle = Math.atan2 node[1], node[0]
    node[0] = Math.cos angle
    node[1] = Math.sin angle

calculateSurfaceLabelSizes = (rawSurfaceNodes, scaleFactor, equalizeFactor) ->
  lunarSurfaceSizes = []
  maxSize = -Infinity
  for node in rawSurfaceNodes
    size = distanceFromCenter(node[0], node[1])
    maxSize = size if size > maxSize
    lunarSurfaceSizes.push size

  _.map lunarSurfaceSizes, (s) -> scaleFactor * Math.pow((s / maxSize), equalizeFactor)


adjustCoreLinks = (lunar_core_labels, anchor_array) ->
  newPtOnLabelBorder = (lab, anc) ->
    p = [
      [lab.x - lab.width/2,     lab.y]                   # botL - 0
      [lab.x,                   lab.y]                   # botC - 1
      [lab.x + lab.width/2,     lab.y]                   # botR - 2
      [lab.x - lab.width/2,     lab.y - lab.height + 2]  # topL - 3
      [lab.x,                   lab.y - lab.height + 2]  # topC - 4
      [lab.x + lab.width/2,     lab.y - lab.height + 2]  # topR - 5
      [lab.x - lab.width/2,     lab.y - lab.height/2]    # midL - 6
      [lab.x + lab.width/2,     lab.y - lab.height/2]    # midR - 7
    ]

    padding = 10
    centered = (anc.x > lab.x - lab.width/2) and (anc.x < lab.x + lab.width/2)
    paddedCenter = (anc.x > lab.x - lab.width/2 - padding) and (anc.x < lab.x + lab.width/2 + padding)
    abovePadded = anc.y < lab.y - lab.height - padding
    above = anc.y < lab.y - lab.height
    aboveMid = anc.y < lab.y - lab.height/2
    belowPadded = anc.y > lab.y + padding
    below = anc.y > lab.y
    belowMid = anc.y >= lab.y - lab.height/2
    left = anc.x < lab.x - lab.width/2
    right = anc.x > lab.x + lab.width/2
    leftPadded = anc.x < lab.x - lab.width/2 - padding
    rightPadded = anc.x > lab.x + lab.width/2 + padding

    if centered and abovePadded
      return p[4]
    else if centered and belowPadded
      return p[1]
    else if above and left
      return p[3]
    else if above and right
      return p[5]
    else if below and left
      return p[0]
    else if below and right
      return p[2]
    else if leftPadded
      return p[6]
    else if rightPadded
      return p[7]
    else
      # Draw the link if there are any anc nearby
      ambiguityFactor = 15
      padL = p[3][0] - ambiguityFactor
      padR = p[5][0] + ambiguityFactor
      padT = p[3][1] - ambiguityFactor
      padB = p[2][1] + ambiguityFactor
      ancNearby = 0
      for anc in anchor_array
        if (anc.x > padL and anc.x < padR) and (anc.y > padT and anc.y < padB)
          ancNearby++
      if ancNearby > 1
        if not left and not right and not above and not below
          return p[1]
        else if centered and above
          return p[4]
        else if centered and below
          return p[1]
        else if left and above
          return p[3]
        else if left and below
          return p[0]
        else if right and above
          return p[5]
        else if right and below
          return p[2]
        else if left
          return p[6]
        else if right
          return p[7]




  j = 0
  while j < lunar_core_labels.length
    newLinkPt = newPtOnLabelBorder lunar_core_labels[j], anchor_array[j]
    # d3.select('svg').append('circle').attr('cx', newLinkPt[0])
    #                     .attr('stroke-width',1)
    #                     .attr('class', 'core-anchor')
    #                     .attr('fill', 'blue')
    #                     .attr('cy', newLinkPt[1])
    #                     .attr('r', 2)
    #                     .attr('stroke')
    if newLinkPt?
      svg.append('line').attr('class', 'core-link')
                     .attr('x1', anchor_array[j].x)
                     .attr('y1', anchor_array[j].y)
                     .attr('x2', newLinkPt[0])
                     .attr('y2', newLinkPt[1])
                     .attr('stroke-width', 0.6)
                     .attr('stroke', 'gray')
    j++
