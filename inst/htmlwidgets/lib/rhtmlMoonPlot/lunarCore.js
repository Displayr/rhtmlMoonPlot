var drawLunarCoreLabels;

drawLunarCoreLabels = function(lunarCoreLabels, svg, cx, cy, radius, textColor, link_width) {
  var anchor, anchor_array, drag, drawLabels, drawLinks, endAll, i, j, k, l, label, labeler, len, len1, len2, lunar_core_label, lunar_core_labels, lunar_core_labels_svg, lunar_core_links_svg, n, x, y;
  drawLabels = function(label_data, drag) {
    var labels;
    labels = svg.selectAll('.core-label').data(label_data).enter().append('text').style('fill', textColor).attr('class', 'core-label').attr('x', function(d) {
      return d.x;
    }).attr('y', function(d) {
      return d.y;
    }).attr('ox', function(d) {
      return d.x;
    }).attr('oy', function(d) {
      return d.y;
    }).attr('cursor', 'all-scroll').attr('text-anchor', 'middle').style('font-family', 'Arial').attr('title', function(d) {
      return d.name;
    }).text(function(d) {
      return d.name;
    }).call(drag).append('title').text(function(d) {
      return d.name;
    });
    return svg.selectAll('.core-label');
  };
  drawLinks = function(label_data) {
    d3.selectAll('.init-core-link').remove();
    return svg.append('g').selectAll('.init-core-link').data(label_data).enter().append('line').attr('class', 'init-core-link').attr('x1', function(d) {
      return d.x;
    }).attr('y1', function(d) {
      return d.y;
    }).attr('x2', function(d) {
      return d.x;
    }).attr('y2', function(d) {
      return d.y;
    }).attr('stroke-width', link_width).attr('stroke', 'gray');
  };
  lunar_core_labels_svg = [];
  lunar_core_labels = [];
  anchor_array = [];
  drag = setupLunarCoreDragAndDrop(svg, lunar_core_labels, anchor_array, radius, cx, cy, textColor);
  for (j = 0, len = lunarCoreLabels.length; j < len; j++) {
    label = lunarCoreLabels[j];
    x = label.x * radius + cx;
    y = -label.y * radius + cy;
    lunar_core_labels.push({
      x: x,
      y: y,
      name: label.name,
      id: label.name,
      ox: x,
      oy: y
    });
  }
  lunar_core_labels_svg = drawLabels(lunar_core_labels, drag);
  i = 0;
  while (i < lunar_core_labels.length) {
    lunar_core_labels[i].width = lunar_core_labels_svg[0][i].getBBox().width;
    lunar_core_labels[i].height = lunar_core_labels_svg[0][i].getBBox().height - 5;
    i++;
  }
  svg.selectAll('.core-label').remove();
  lunar_core_labels_svg = drawLabels(lunar_core_labels, drag);
  for (k = 0, len1 = lunar_core_labels.length; k < len1; k++) {
    lunar_core_label = lunar_core_labels[k];
    anchor_array.push({
      x: lunar_core_label.x,
      y: lunar_core_label.y,
      r: 5,
      dr: 2
    });
  }
  d3.selectAll('.core-anchor').remove();
  for (l = 0, len2 = anchor_array.length; l < len2; l++) {
    anchor = anchor_array[l];
    d3.select('svg').append('circle').attr('stroke-width', 3).attr('class', 'core-anchor').attr('fill', 'black').attr('cx', anchor.x).attr('cy', anchor.y).attr('r', anchor.dr);
  }
  lunar_core_links_svg = drawLinks(lunar_core_labels);
  lunar_core_links_svg.moveToBack();
  lunar_core_labels_svg.moveToFront();
  d3.selectAll('.core-anchor').moveToFront();
  d3.selectAll('.moon-circle').moveToFront();
  d3.selectAll('.core-cross').moveToFront();
  d3.selectAll('.surface-label').moveToFront();
  labeler = d3.labeler().svg(svg).cx(cx).cy(cy).radius(radius).anchor(anchor_array).label(lunar_core_labels).start(500);
  n = 0;
  lunar_core_labels_svg.transition().duration(800).attr('x', function(d) {
    return d.x;
  }).attr('y', function(d) {
    return d.y;
  }).each(function() {
    return n++;
  }).each('end', function() {
    n--;
    if (!n) {
      return endAll();
    }
  });
  endAll = function() {
    svg.selectAll('.init-core-link').remove();
    return adjustCoreLinks(lunar_core_labels, anchor_array, link_width);
  };
  return lunar_core_links_svg.transition().duration(800).attr('x2', function(d) {
    return d.x;
  }).attr('y2', function(d) {
    return d.y;
  });
};
