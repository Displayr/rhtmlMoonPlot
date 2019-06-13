/* global _ */
/* global $ */
/* global fetch */
/* global Mustache */

$(document).ready(() => {
  fetch('/test_plan.json')
    .then(response => { return response.text() })
    .then(JSON.parse)
    .then(testPlanGroups => {
      return _(testPlanGroups).each(renderTestPlanGroup)
    })
    .catch(console.error)
})

const renderTestPlanGroup = function (testPlan) {
  const testGroupContainer = $(`
    <div class="test-plan-group-container">
      <h3 class="test-plan-group-name">${testPlan.groupName}</h3>
      <ul class="test-cases-container">
        ${_(testPlan.tests).map((testCase, testIndex) => renderTestCase(testCase, testIndex, testPlan.groupName)).value().join('')}
      </ul>
    </div>
  `)

  $('body').append(testGroupContainer)
}

const testCaseTemplate = `
  <li class="test-case status-{{status}}">
    <a class="load-link" href="{{ testUrl }}" title="{{ testDefinition }}" class="test-link">{{ testName }}</a>
  </li>
`

const renderTestCase = function (testCase, testIndex, groupName) {
  const testDefinition = JSON.stringify(_.omit(testCase, ['renderExampleUrl', 'testname']), {}, 2)
  const testName = testCase.testname
  const testUrl = testCase.renderExampleUrl
  const statuses = _(testCase.widgets)
    .filter(widgetConfig => _.has(widgetConfig, 'status'))
    .map('status')
    .value()

  let status = 'green'
  if (!_.isEmpty(statuses) && statuses.includes('red')) {
    status = 'red'
  } else if (!_.isEmpty(statuses)) {
    status = 'yellow'
  }

  Mustache.parse(testCaseTemplate)
  return Mustache.render(testCaseTemplate, { testName, testDefinition, testUrl, testIndex, groupName, status })
}
