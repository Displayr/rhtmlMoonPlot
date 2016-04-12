drawCross = (svg, x, y) ->
  crossSize = 6
  crossWidth = 1
  centralCross = svg.append('g')
  centralCross.append('line')
                   .attr('x1', x - crossSize)
                   .attr('y1', y)
                   .attr('x2', x + crossSize)
                   .attr('y2', y)
                   .attr('stroke-width', crossWidth)
                   .attr('stroke', 'black')
  centralCross.append('line')
                   .attr('x1', x)
                   .attr('y1', y - crossSize)
                   .attr('x2', x)
                   .attr('y2', y + crossSize)
                   .attr('stroke-width', crossWidth)
                   .attr('stroke', 'black')


# Detect if there is intersection between lunar surface labels
# Return the pairs of collisions
detectSurfaceCollisions = (polar_coords, length_of_line) ->
  error_allowed = 10
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

  move_amount = 0.2 / 360 * 2 * Math.PI # deg to rad
  altitude_incr = 0.05 * length_of_line / 360
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

        pc.a += move_amount
        pc.collision_l = false
        pc.r += altitude_incr

      else if pc.collision_r
        # Save original coords
        unless pc.oa and pc.or
          pc.oa = pc.a
          pc.or = pc.r

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
    d3.select(surface_label).text(surface_label.innerHTML.slice(0, -1))
  d3.select(surface_label).text(surface_label.innerHTML.slice(0, -3) + '...')

adjustSurfaceLabelLength = (surface_labels, view_height, view_width) ->
  for surface_label in surface_labels
    if detectViewportCollision surface_label, view_height, view_width
      condenseSurfaceLabel surface_label, view_height, view_width  

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
    d3.select(core_label).text(core_label.innerHTML.slice(0, -1))
  d3.select(core_label).text(core_label.innerHTML.slice(0, -3) + '...')

extendFullLabelName = (labels) ->
  for label in labels
    d3.select(label).text(d3.select(label).attr('title'))

adjustCoreLabelLength = (core_labels, radius, cx, cy) ->
  extendFullLabelName(core_labels)
  for core_label in core_labels
    if failsCoreLabelBoundaryRules(core_label, radius, cx, cy)
      condenseCoreLabel core_label, radius, cx, cy
