@applitools @rerender
Feature: Multiple Calls to Render Value
  Multiple calls to renderValue should leave the widget in a good state. Updates to the config should be rendered, and there should not be multiple widgets created or remnants of the original config left over.

  Scenario: Rerender Test
    Given I am viewing "default_template_widget" with dimensions 400x400 and rerender controls
    When I rerender with config "default_template_widget"
    Then the "default_template_widget" snapshot matches the baseline
    When I rerender with config "example1"
    Then the "example1" snapshot matches the baseline