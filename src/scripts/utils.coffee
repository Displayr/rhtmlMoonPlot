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

  console.log ((rad + Math.PI) / (2*Math.PI))
  console.log ((rad + Math.PI) / (2*Math.PI))* length_of_line
  ((rad + Math.PI) / (2*Math.PI)) * length_of_line

