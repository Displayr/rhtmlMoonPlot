drawCircle = (svg, cx, cy, radius) ->
  svg.append('circle')
              .attr('cx', cx)
              .attr('cy', cy)
              .attr('r', radius)
              .style('fill', 'none')
              .style('stroke', 'black')
              .style 'fill-opacity', 0.2
              .on('mousedown', mouseDownEvent)

# TODO: Unsure why you need to declare this
mouseDownEvent = ->
