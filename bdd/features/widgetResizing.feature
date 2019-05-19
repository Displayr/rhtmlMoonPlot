@applitools @resize
Feature: Calls to Resize
  Resize functions correctly.

  Resize causes state to be reset

  Size is stored in the state object

  Scenario: Basic Resizing Test
    Given I am viewing "data.functional_tests.minimal-one-point" with dimensions 500x500
    Then the "minimal-one-point-500x500-base" snapshot matches the baseline

    When I resize the widget to 600x600
    Then the "minimal-one-point-600x600-base" snapshot matches the baseline
    And the final state callback should match "data.state-minimal-one-point.600x600-base" within 3

    When I resize the widget to 600x300
    Then the "minimal-one-point-600x300-base" snapshot matches the baseline

    When I resize the widget to 300x600
    Then the "minimal-one-point-300x600-base" snapshot matches the baseline
    When I drag core label 0 by 0 x -20
    And I resize the widget to 500x500
    Then the "minimal-one-point-500x500-base" snapshot matches the baseline
    And the final state callback should match "data.state-minimal-one-point.500x500-base" within 3