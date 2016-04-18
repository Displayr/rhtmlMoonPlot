drawCircle = (svg, cx, cy, radius) ->
  drawCross(svg, cx, cy)

  findDistance = (cx, cy, x, y) ->
    Math.sqrt(Math.pow((x - cx), 2) + Math.pow((y - cy), 2))

  circleResize = () ->
    mouseX = d3.mouse(this)[0]
    mouseY = d3.mouse(this)[1]
    d3.select(this).attr('r', findDistance(cx, cy, mouseX, mouseY))

  dragResize = d3.behavior.drag()
                          .origin(() ->
                            {
                              x: d3.select(this).attr("cy")
                              y: d3.select(this).attr("cy")
                            })
                          .on('drag', circleResize)




  moon = svg.append('circle')
              .attr('cx', cx)
              .attr('cy', cy)
              .attr('r', radius)
              .attr 'stroke-width', 1
              .attr('cursor', 'all-scroll')
              .style('fill', 'none')
              .style('stroke', 'black')
              .style 'fill-opacity', 0.2
              .call dragResize


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
