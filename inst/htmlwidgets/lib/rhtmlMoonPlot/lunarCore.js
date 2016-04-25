var drawLunarCoreLabels;

drawLunarCoreLabels = function(lunarCoreLabels, svg, cx, cy, radius) {
  var anchor, anchor_array, drag, i, j, k, l, label, labeler, len, len1, len2, lunar_core_label, lunar_core_labels, lunar_core_labels_svg, lunar_core_links_svg, x, y;
  lunar_core_labels_svg = [];
  lunar_core_labels = [];
  drag = setupLunarCoreDragAndDrop(svg, lunar_core_labels, radius, cx, cy);
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
  lunar_core_labels_svg = svg.selectAll('.core-label').data(lunar_core_labels).enter().append('text').style('fill', 'black').attr('class', 'core-label').attr('x', function(d) {
    return d.x;
  }).attr('y', function(d) {
    return d.y;
  }).attr('ox', function(d) {
    return d.x;
  }).attr('oy', function(d) {
    return d.y;
  }).attr('cursor', 'all-scroll').attr('text-anchor', 'start').style('font-family', 'Arial').attr('title', function(d) {
    return d.name;
  }).text(function(d) {
    return d.name;
  }).call(drag);
  i = 0;
  while (i < lunar_core_labels.length) {
    lunar_core_labels[i].width = lunar_core_labels_svg[0][i].getBBox().width;
    lunar_core_labels[i].height = lunar_core_labels_svg[0][i].getBBox().height;
    i++;
  }
  anchor_array = [];
  for (k = 0, len1 = lunar_core_labels.length; k < len1; k++) {
    lunar_core_label = lunar_core_labels[k];
    anchor_array.push({
      x: lunar_core_label.x,
      y: lunar_core_label.y,
      r: 2
    });
  }
  for (l = 0, len2 = anchor_array.length; l < len2; l++) {
    anchor = anchor_array[l];
    d3.select('svg').append('circle').attr('stroke-width', 3).attr('class', 'core-anchor').attr('fill', 'black').attr('cx', anchor.x).attr('cy', anchor.y).attr('r', anchor.r);
  }
  lunar_core_links_svg = svg.append('g').selectAll('.core-link').data(lunar_core_labels).enter().append('line').attr('class', 'core-link').attr('x1', function(d) {
    return d.x;
  }).attr('y1', function(d) {
    return d.y;
  }).attr('x2', function(d) {
    return d.x;
  }).attr('y2', function(d) {
    return d.y;
  }).attr('stroke-width', 0.6).attr('stroke', 'gray');
  labeler = d3.labeler().label(lunar_core_labels).anchor(anchor_array).width(600).height(600).start(100);
  lunar_core_labels_svg.transition().duration(800).attr('x', function(d) {
    return d.x;
  }).attr('y', function(d) {
    return d.y;
  });
  lunar_core_links_svg.transition().duration(800).attr('x2', function(d) {
    return d.x;
  }).attr('y2', function(d) {
    return d.y;
  });
  return adjustCoreLabelLength(lunar_core_labels_svg[0], radius, cx, cy);
};
