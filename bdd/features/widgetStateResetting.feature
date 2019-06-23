Feature: State Reset Conditions
  Some config changes, all data changes, circle resizes, circle center point changes, widget resizes, and the reset button cause state to be reset

  @applitools @state
  Scenario: I can load the widget with core and surface label moved state and see the repositioned labels
    Given I am viewing "data.functional_tests.minimal-one-point" with state "data.state-minimal-one-point.500x500-after-core-and-surface-label-drag" and dimensions 500x500
    Then the "minimal-one-point-500x500-after-core-and-surface-label-drag" snapshot matches the baseline

  @applitools @state
  Scenario: If the state "plot size" does not match the current plot size, the widget will reset state to base
    Given I am viewing "data.functional_tests.minimal-one-point" with state "data.state-minimal-one-point.500x500-old-height" and dimensions 500x500
    Then the "minimal-one-point-500x500-base" snapshot matches the baseline
    And the final state callback should match "data.state-minimal-one-point.500x500-base" within 1.5

  @applitools @state
  Scenario: If the state "config invariants" does not match the current config invariants, the widget will reset state to base
    Given I am viewing "data.functional_tests.minimal-one-point" with state "data.state-minimal-one-point.500x500-old-config-invariants" and dimensions 500x500
    Then the "minimal-one-point-500x500-base" snapshot matches the baseline
    And the final state callback should match "data.state-minimal-one-point.500x500-base" within 1.5

  @applitools @state
  Scenario: If the state "source data" does not match the current source data, the widget will reset state to base
    Given I am viewing "data.functional_tests.minimal-one-point" with state "data.state-minimal-one-point.500x500-old-source-data" and dimensions 500x500
    Then the "minimal-one-point-500x500-base" snapshot matches the baseline
    And the final state callback should match "data.state-minimal-one-point.500x500-base" within 1.5

  @applitools @state
  # this would happen if the user has modified the title causing the title to wrap,
  # this shrinks the available space for the moonplot, requiring relabelling -> reset state
  Scenario: If the state "center" does not match the current center, the widget will reset state to base
    Given I am viewing "data.functional_tests.minimal-one-point" with state "data.state-minimal-one-point.500x500-old-center" and dimensions 500x500
    Then the "minimal-one-point-500x500-base" snapshot matches the baseline
    And the final state callback should match "data.state-minimal-one-point.500x500-base" within 1.5

  @applitools @state @foo
  Scenario: If the user presses reset, the widget will reset state to base
    Given I am viewing "data.functional_tests.minimal-one-point" with state "data.state-minimal-one-point.500x500-after-core-and-surface-label-drag" and dimensions 500x500
    Then the "minimal-one-point-500x500-after-core-and-surface-label-drag" snapshot matches the baseline
    When I press the reset button
    Then the "minimal-one-point-500x500-base" snapshot matches the baseline
