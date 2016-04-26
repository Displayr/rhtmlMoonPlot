'use strict';
HTMLWidgets.widget({
  name: 'moonplot',
  type: 'output',
  initialize: function(el, width, height) {
    console.log('Initialized');
    return new MoonPlot(width, height);
  },
  resize: function(el, width, height, instance) {
    console.log('Resized');
    instance.redraw(width, height, el);
    return instance;
  },
  renderValue: function(el, params, instance) {
    var i, lunarCoreLabels, lunarSurfaceLabels, lunarSurfaceSizes;
    console.log('RenderValue called');
    if (!params.lunarCoreLabels) {
      params = testData;
    }
    normalizeCoreNodes(params.lunarCoreNodes);
    lunarSurfaceSizes = calculateSurfaceLabelSizes(params.lunarSurfaceNodes, 1.5, 0.5);
    calculateSurfaceNodePositions(params.lunarSurfaceNodes);
    lunarCoreLabels = [];
    lunarSurfaceLabels = [];
    i = 0;
    while (i < params.lunarCoreLabels.length) {
      lunarCoreLabels.push({
        name: params.lunarCoreLabels[i],
        x: params.lunarCoreNodes[i][0],
        y: params.lunarCoreNodes[i][1]
      });
      i++;
    }
    i = 0;
    while (i < params.lunarSurfaceLabels.length) {
      lunarSurfaceLabels.push({
        name: params.lunarSurfaceLabels[i],
        x: params.lunarSurfaceNodes[i][0],
        y: params.lunarSurfaceNodes[i][1],
        size: lunarSurfaceSizes[i]
      });
      i++;
    }
    this.data = {
      lunarSurfaceLabels: lunarSurfaceLabels,
      lunarCoreLabels: lunarCoreLabels
    };
    instance.draw(this.data, el);
    return instance;
  }
});
