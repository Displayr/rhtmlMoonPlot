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
        p1l = positionAlongLine p1.a, length_of_line
        p1r = p1l + p1.h
        p2l = positionAlongLine p2.a, length_of_line
        p2r = p2l + p2.h

        if (p1r > p2l and p1l < p2r) or (p2r > p1l and p2l < p1r)
          collisions.push [p1, p2]
          console.log p1l
          console.log p1r
          console.log p2l
          console.log p2r
          console.log '------------'



  console.log collisions
  collisions


# Convert Cartesian to polar coordinates
polarCoords = (cart_coords) ->
  polar_coords = []
  for cart_coord in cart_coords
    polar_coords.push
      r: Math.sqrt(Math.pow(cart_coord.x,2) + Math.pow(cart_coord.y,2))
      a: Math.atan2 cart_coord.y, cart_coord.x
      h: cart_coord.h
  polar_coords

# Convert polar to Cartesian coordinates
cartesianCoords = (polar_coords) ->
  cart_coords = []
  for polar_coord in polar_coords
    cart_coords.push
      x: polar_coord.r * Math.cos polar_coord.a
      y: polar_coord.r * Math.sin polar_coord.a
      h: polar_coord.h
  cart_coords

# Translate angles to position on line
positionAlongLine = (rad, length_of_line) ->
  ((rad + Math.PI) / (2*Math.PI)) * length_of_line
