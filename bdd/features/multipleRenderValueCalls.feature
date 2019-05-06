@applitools @rerender
Feature: Multiple Calls to Render Value
  Multiple calls to renderValue should leave the widget in a good state. Updates to the config should be rendered, and there should not be multiple widgets created or remnants of the original config left over.

  Scenario: Rerender Test
    Given I am viewing "data.functional_tests.minimal" with dimensions 1000x600 and rerender controls
    When I rerender with config "data.functional_tests.minimal"
    Then the "minimal_moonplot_1000x600" snapshot matches the baseline
    When I rerender with config "data.functional_tests.minimal|config.red"
    Then the "minimal_red_moonplot_1000x600" snapshot matches the baseline