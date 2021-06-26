const puppeteer = require('puppeteer')
const { snapshotTesting: { renderExamplePageTestHelper } } = require('rhtmlBuildUtils')
const loadWidget = require('../lib/loadWidget.helper')

const {
  configureImageSnapshotMatcher,
  puppeteerSettings,
  testSnapshots,
  testState,
  jestTimeout,
} = renderExamplePageTestHelper

configureImageSnapshotMatcher({ collectionIdentifier: 'widget_interactions' })
jest.setTimeout(jestTimeout)

/*
    Test Summary:
    * The user can drag labels, and resize the circle
    * Each interaction should cause a state callback, and when I rerender with that new state value, I should see the same interactions applied to the widget.
    * Some config changes, all data changes, circle resizes, and widget resizes cause state to be reset
 */

describe('widget_interactions', () => {
  let browser

  beforeEach(async () => {
    browser = await puppeteer.launch(puppeteerSettings)
  })

  afterEach(async () => {
    await browser.close()
  })

  test('a new widget correctly generates and saves state', async function () {
    const { page } = await loadWidget({
      browser,
      configName: 'data.functional_tests.minimal-one-point',
      width: 500,
      height: 500,
    })

    await testSnapshots({ page, testName: 'minimal-one-point-500x500-base' })
    // does not work in CI, have not investigated why yet
    if (!process.env.TRAVIS) {
      await testState({ page, stateName: 'data.state-minimal-one-point.500x500-base', tolerance: 1.5 })
    }

    await page.close()
  })

  test('label drags update label position in state', async function () {
    const { page, moonPlot } = await loadWidget({
      browser,
      configName: 'data.functional_tests.minimal-one-point',
      width: 500,
      height: 500,
    })

    await testSnapshots({ page, testName: 'minimal-one-point-500x500-base' })

    await moonPlot.dragCoreLabel(0, 0, -20)
    await testSnapshots({ page, testName: 'minimal-one-point-500x500-after-core-label-drag' })
    // does not work in CI, have not investigated why yet
    if (!process.env.TRAVIS) {
      await testState({ page, stateName: 'data.state-minimal-one-point.500x500-after-core-label-drag', tolerance: 1.5 })
    }

    await moonPlot.dragSurfaceLabel(0, 60, -60)
    await testSnapshots({ page, testName: 'minimal-one-point-500x500-after-core-and-surface-label-drag' })
    // does not work in CI, have not investigated why yet
    if (!process.env.TRAVIS) {
      await testState({
        page,
        stateName: 'data.state-minimal-one-point.500x500-after-core-and-surface-label-drag',
        tolerance: 1.5,
      })
    }

    await page.close()
  })

  test('resizing the circle causes state to reset', async function () {
    const { page, moonPlot } = await loadWidget({
      browser,
      configName: 'data.functional_tests.minimal-one-point',
      width: 500,
      height: 500,
    })

    await testSnapshots({ page, testName: 'minimal-one-point-500x500-base' })

    await moonPlot.dragCoreLabel(0, 0, -20)
    await moonPlot.dragSurfaceLabel(0, 60, -60)
    // does not work in CI, have not investigated why yet
    if (!process.env.TRAVIS) {
      await testState({
        page,
        stateName: 'data.state-minimal-one-point.500x500-after-core-and-surface-label-drag',
        tolerance: 1.5,
      })
    }

    await moonPlot.brittleCircleResize()
    await testSnapshots({ page, testName: 'minimal-one-point-500x500-after-circle-resize-labels-are-reset' })
    // does not work in CI, have not investigated why yet
    if (!process.env.TRAVIS) {
      await testState({ page, stateName: 'data.state-minimal-one-point.500x500-after-circle-resize', tolerance: 1.5 })
    }

    await page.close()
  })
})
