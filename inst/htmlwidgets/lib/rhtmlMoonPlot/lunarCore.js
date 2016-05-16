var drawLunarCoreLabels;

drawLunarCoreLabels = function(lunarCoreLabels, svg, cx, cy, radius, textColor) {
  var anchor, anchor_array, drag, drawLabels, drawLinks, endAll, i, k, l, label, labeler, len, len1, len2, lunar_core_label, lunar_core_labels, lunar_core_labels_svg, lunar_core_links_svg, m, n, x, y;
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
    return svg.append('g').selectAll('.core-link').data(label_data).enter().append('line').attr('class', 'core-link').attr('x1', function(d) {
      return d.x;
    }).attr('y1', function(d) {
      return d.y;
    }).attr('x2', function(d) {
      return d.x;
    }).attr('y2', function(d) {
      return d.y;
    }).attr('stroke-width', 0.6).attr('stroke', 'gray');
  };
  lunar_core_labels_svg = [];
  lunar_core_labels = [];
  drag = setupLunarCoreDragAndDrop(svg, lunar_core_labels, radius, cx, cy, textColor);
  for (k = 0, len = lunarCoreLabels.length; k < len; k++) {
    label = lunarCoreLabels[k];
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
    lunar_core_labels[i].height = lunar_core_labels_svg[0][i].getBBox().height;
    i++;
  }
  svg.selectAll('.core-label').remove();
  lunar_core_labels_svg = drawLabels(lunar_core_labels, drag);
  anchor_array = [];
  for (l = 0, len1 = lunar_core_labels.length; l < len1; l++) {
    lunar_core_label = lunar_core_labels[l];
    anchor_array.push({
      x: lunar_core_label.x,
      y: lunar_core_label.y,
      r: 8,
      dr: 2
    });
  }
  for (m = 0, len2 = anchor_array.length; m < len2; m++) {
    anchor = anchor_array[m];
    d3.select('svg').append('circle').attr('stroke-width', 3).attr('class', 'core-anchor').attr('fill', 'black').attr('cx', anchor.x).attr('cy', anchor.y).attr('r', anchor.dr);
  }
  lunar_core_links_svg = drawLinks(lunar_core_labels);
  lunar_core_links_svg.moveToBack();
  lunar_core_labels_svg.moveToFront();
  d3.selectAll('.core-anchor').moveToFront();
  d3.selectAll('.moon-circle').moveToFront();
  d3.selectAll('.core-cross').moveToFront();
  d3.selectAll('.surface-label').moveToFront();
  labeler = d3.labeler().svg(svg).cx(cx).cy(cy).radius(radius).label(lunar_core_labels).anchor(anchor_array).start(100);
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
    var closestPtOnLabelBorder, dist, j, newLinkPt, results;
    adjustCoreLabelLength(lunar_core_labels_svg[0], radius, cx, cy);
    dist = function(x1, x2, y1, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };
    closestPtOnLabelBorder = function(lab, anc) {
      var dists, j, minPt, ptsOnLab;
      ptsOnLab = [[lab.x - lab.width / 2, lab.y], [lab.x, lab.y], [lab.x + lab.width / 2, lab.y], [lab.x - lab.width / 2, lab.y - lab.height], [lab.x, lab.y - lab.height], [lab.x + lab.width / 2, lab.y - lab.height], [lab.x - lab.width / 2, lab.y - lab.height / 2], [lab.x + lab.width / 2, lab.y - lab.height / 2]];
      j = 0;
      while (j < 8) {
        d3.select('svg').append('circle').attr('cx', ptsOnLab[j][0]).attr('stroke-width', 1).attr('fill', 'green').attr('cy', ptsOnLab[j][1]).attr('r', 1).attr('stroke');
        j++;
      }
      dists = _.map(ptsOnLab, function(e) {
        return dist(e[0], anc.x, e[1], anc.y);
      });
      d3.select('svg').append('circle').attr('cx', anc.x).attr('stroke-width', 3).attr('class', 'blah').attr('fill', 'red').attr('cy', anc.y).attr('r', 5).attr('stroke');
      minPt = _.reduce(dists, function(acc, val, i) {
        console.log(acc);
        console.log(val);
        if (val < acc.val) {
          return {
            i_min: i,
            val: val
          };
        } else {
          return {
            i_min: acc.i_min,
            val: acc.val
          };
        }
      }, {
        val: Infinity
      });
      console.log(minPt.i);
      return ptsOnLab[minPt.i_min];
    };
    j = 0;
    results = [];
    while (j < lunar_core_labels.length) {
      newLinkPt = closestPtOnLabelBorder(lunar_core_labels[j], anchor_array[j]);
      console.log(newLinkPt);
      d3.select('svg').append('circle').attr('cx', newLinkPt[0]).attr('stroke-width', 3).attr('class', 'core-anchor').attr('fill', 'blue').attr('cy', newLinkPt[1]).attr('r', 5).attr('stroke');
      results.push(j++);
    }
    return results;
  };
  return lunar_core_links_svg.transition().duration(800).attr('x2', function(d) {
    return d.x;
  }).attr('y2', function(d) {
    return d.y;
  });
};
