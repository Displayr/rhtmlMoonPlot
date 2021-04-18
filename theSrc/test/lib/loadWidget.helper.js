const { snapshotTesting: { renderExamplePageTestHelper } } = require('rhtmlBuildUtils')

const {
  getExampleUrl,
  waitForWidgetToLoad,
} = renderExamplePageTestHelper

const MoonPlotPage = require('./moonPlotPage')

const loadWidget = async ({
  browser,
  configName = '',
  stateName,
  width = 1000,
  rerenderControls,
  height = 600,
}) => {
  const page = await browser.newPage()
  const url = getExampleUrl({ configName, stateName, rerenderControls, width, height })
  const moonPlot = new MoonPlotPage(page)

  await page.goto(url)
  await waitForWidgetToLoad({ page })

  return { page, moonPlot }
}

module.exports = loadWidget
