'use strict';
HTMLWidgets.widget({
  name: 'rhtmlMoonPlot',
  type: 'output',
  initialize: function(el, width, height) {
    console.log('rhtmlMoonPlot: Initialized');
    console.log("rhtmlMoonPlot: Given width " + width);
    console.log("rhtmlMoonPlot: Given height " + height);
    return new MoonPlot(width, height);
  },
  resize: function(el, width, height, instance) {
    console.log('rhtmlMoonPlot: Resized');
    instance.redraw(width, height, el);
    return instance;
  },
  renderValue: function(el, params, instance) {
    var i, lunarCoreLabels, lunarSurfaceLabels, lunarSurfaceSizes;
    console.log('rhtmlMoonPlot: RenderValue called');
    if (!params.lunarCoreLabels) {
      params = testData2;
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
