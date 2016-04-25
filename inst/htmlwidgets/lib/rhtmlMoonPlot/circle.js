var drawCircle, drawCross;

drawCircle = function(data, svg, cx, cy, radius, height, width) {
  var moon, moonDrag;
  drawCross(svg, cx, cy);
  moonDrag = setupMoonResize(data, svg, cx, cy, height, width, radius);
  return moon = svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', radius).attr('class', 'moon-circle').attr('stroke-width', 1).attr('cursor', 'all-scroll').style('fill', 'none').style('stroke', 'black').style('fill-opacity', 0.2).call(moonDrag);
};

drawCross = function(svg, x, y) {
  var centralCross, crossSize, crossWidth;
  crossSize = 6;
  crossWidth = 1;
  centralCross = svg.append('g');
  centralCross.append('line').attr('x1', x - crossSize).attr('y1', y).attr('x2', x + crossSize).attr('y2', y).attr('stroke-width', crossWidth).attr('stroke', 'black').attr('class', 'core-cross');
  return centralCross.append('line').attr('x1', x).attr('y1', y - crossSize).attr('x2', x).attr('y2', y + crossSize).attr('stroke-width', crossWidth).attr('stroke', 'black').attr('class', 'core-cross');
};
