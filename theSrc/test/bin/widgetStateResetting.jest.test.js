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

configureImageSnapshotMatcher({ collectionIdentifier: 'widget_state_resetting' })
jest.setTimeout(jestTimeout)

/*
    Test Summary:
    * Some config changes, all data changes, circle resizes, circle center point changes, widget resizes, and the reset button cause state to be reset
 */

describe('widget_state_resetting', () => {
  let browser

  beforeEach(async () => {
    browser = await puppeteer.launch(puppeteerSettings)
  })

  afterEach(async () => {
    await browser.close()
  })

  test('I can load the widget with core and surface label moved state and see the repositioned labels', async function () {
    const { page } = await loadWidget({
      browser,
      configName: 'data.functional_tests.minimal-one-point',
      stateName: 'data.state-minimal-one-point.500x500-after-core-and-surface-label-drag',
      width: 500,
      height: 500,
    })

    await testSnapshots({ page, testName: 'minimal-one-point-500x500-after-core-and-surface-label-drag' })

    await page.close()
  })

  test('If the state "plot size" does not match the current plot size, the widget will reset state to base', async function () {
    const { page } = await loadWidget({
      browser,
      configName: 'data.functional_tests.minimal-one-point',
      stateName: 'data.state-minimal-one-point.500x500-old-height',
      width: 500,
      height: 500,
    })

    await testSnapshots({ page, testName: 'minimal-one-point-500x500-base' })
    await testState({ page, stateName: 'data.state-minimal-one-point.500x500-base', tolerance: 1.5 })

    await page.close()
  })

  test('If the state "config invariants" does not match the current config invariants, the widget will reset state to base', async function () {
    const { page } = await loadWidget({
      browser,
      configName: 'data.functional_tests.minimal-one-point',
      stateName: 'data.state-minimal-one-point.500x500-old-config-invariants',
      width: 500,
      height: 500,
    })

    await testSnapshots({ page, testName: 'minimal-one-point-500x500-base' })
    await testState({ page, stateName: 'data.state-minimal-one-point.500x500-base', tolerance: 1.5 })

    await page.close()
  })

  test('If the state "source data" does not match the current source data, the widget will reset state to base', async function () {
    const { page } = await loadWidget({
      browser,
      configName: 'data.functional_tests.minimal-one-point',
      stateName: 'data.state-minimal-one-point.500x500-old-source-data',
      width: 500,
      height: 500,
    })

    await testSnapshots({ page, testName: 'minimal-one-point-500x500-base' })
    await testState({ page, stateName: 'data.state-minimal-one-point.500x500-base', tolerance: 1.5 })

    await page.close()
  })

  // this would happen if the user has modified the title causing the title to wrap,
  // this shrinks the available space for the moonplot, requiring relabelling -> reset state
  test('If the state "center" does not match the current center, the widget will reset state to base', async function () {
    const { page } = await loadWidget({
      browser,
      configName: 'data.functional_tests.minimal-one-point',
      stateName: 'data.state-minimal-one-point.500x500-old-center',
      width: 500,
      height: 500,
    })

    await testSnapshots({ page, testName: 'minimal-one-point-500x500-base' })
    await testState({ page, stateName: 'data.state-minimal-one-point.500x500-base', tolerance: 1.5 })

    await page.close()
  })

  test('If the user presses reset, the widget will reset state to base', async function () {
    const { page, moonPlot } = await loadWidget({
      browser,
      configName: 'data.functional_tests.minimal-one-point',
      stateName: 'data.state-minimal-one-point.500x500-after-core-and-surface-label-drag',
      width: 500,
      height: 500,
    })

    await testSnapshots({ page, testName: 'minimal-one-point-500x500-after-core-and-surface-label-drag' })
    await moonPlot.pressResetButton()
    await testSnapshots({ page, testName: 'minimal-one-point-500x500-base' })

    await page.close()
  })
})
