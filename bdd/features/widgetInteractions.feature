Feature: State Interactions
  The user can drag labels, and resize the circle

  Each interaction should cause a state callback, and when I rerender with that new state value, I should see the same interactions applied to the widget.

  Some config changes, all data changes, circle resizes, and widget resizes cause state to be reset

  @applitools @state
  Scenario: A New widget correctly generates and saves state
    Given I am viewing "data.functional_tests.minimal-one-point" with dimensions 500x500
    Then the "minimal-one-point-500x500-base" snapshot matches the baseline
    And the final state callback should match "data.state-minimal-one-point.500x500-base"

  @applitools @state
  Scenario: label drags update label position in state
    Given I am viewing "data.functional_tests.minimal-one-point" with dimensions 500x500
    Then the "minimal-one-point-500x500-base" snapshot matches the baseline
    When I drag core label 0 by 0 x -20
    Then the "minimal-one-point-500x500-after-core-label-drag" snapshot matches the baseline
    And the final state callback should match "data.state-minimal-one-point.500x500-after-core-label-drag"
    When I drag surface label 0 by 30 x 0
    Then the "minimal-one-point-500x500-after-core-and-surface-label-drag" snapshot matches the baseline
    And the final state callback should match "data.state-minimal-one-point.500x500-after-core-and-surface-label-drag"

  # TODO NB cannot test, cannot programatically drag circle as it is too fickle. Need to widen up the selection area
#  @applitools @state
#  Scenario: Resizing the circle causes state to reset
#    Given I am viewing "data.functional_tests.minimal-one-point" with dimensions 500x500
#    When I drag core label 0 by 0 x -20
#    And I drag surface label 0 by 30 x 0
#    And Sleep 1
#    Then the final state callback should match "data.state-minimal-one-point.500x500-after-core-and-surface-label-drag"
#    When I drag the circle by 100 x 100
#    And Sleep 3
#    Then the final state callback should match "data.state-minimal-one-point.500x500-base"

  @applitools @state
  Scenario: I can load the widget with core and surface label moved state and see the repositioned labels
    Given I am viewing "data.functional_tests.minimal-one-point" with state "data.state-minimal-one-point.500x500-after-core-and-surface-label-drag" and dimensions 500x500
    Then the "minimal-one-point-500x500-after-core-and-surface-label-drag" snapshot matches the baseline

  @applitools @state
  Scenario: If the state "plot size" does not match the current plot size, the widget will reset state to base
    Given I am viewing "data.functional_tests.minimal-one-point" with state "data.state-minimal-one-point.500x500-new-height" and dimensions 500x500
    Then the "minimal-one-point-500x500-base" snapshot matches the baseline
    And the final state callback should match "data.state-minimal-one-point.500x500-base"

  @applitools @state
  Scenario: If the state "config invariants" does not match the current config invariants, the widget will reset state to base
    Given I am viewing "data.functional_tests.minimal-one-point" with state "data.state-minimal-one-point.500x500-new-config-invariants" and dimensions 500x500
    Then the "minimal-one-point-500x500-base" snapshot matches the baseline
    And the final state callback should match "data.state-minimal-one-point.500x500-base"

  @applitools @state
  Scenario: If the state "source data" does not match the current source data, the widget will reset state to base
    Given I am viewing "data.functional_tests.minimal-one-point" with state "data.state-minimal-one-point.500x500-new-source-data" and dimensions 500x500
    Then the "minimal-one-point-500x500-base" snapshot matches the baseline
    And the final state callback should match "data.state-minimal-one-point.500x500-base"
