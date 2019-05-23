Feature: State Interactions
  The user can drag labels, and resize the circle

  Each interaction should cause a state callback, and when I rerender with that new state value, I should see the same interactions applied to the widget.

  Some config changes, all data changes, circle resizes, and widget resizes cause state to be reset

  @applitools @state @foo
  Scenario: A New widget correctly generates and saves state
    Given I am viewing "data.functional_tests.minimal-one-point" with dimensions 500x500
    Then the "minimal-one-point-500x500-base" snapshot matches the baseline
    And the final state callback should match "data.state-minimal-one-point.500x500-base" within 1.5

  @applitools @state
  Scenario: label drags update label position in state
    Given I am viewing "data.functional_tests.minimal-one-point" with dimensions 500x500
    Then the "minimal-one-point-500x500-base" snapshot matches the baseline
    When I drag core label 0 by 0 x -20
    Then the "minimal-one-point-500x500-after-core-label-drag" snapshot matches the baseline
    And the final state callback should match "data.state-minimal-one-point.500x500-after-core-label-drag" within 1.5
    When I drag surface label 0 by 30 x 0
    Then the "minimal-one-point-500x500-after-core-and-surface-label-drag" snapshot matches the baseline
    And the final state callback should match "data.state-minimal-one-point.500x500-after-core-and-surface-label-drag" within 1.5

  @applitools @state
  Scenario: Resizing the circle causes state to reset
    Given I am viewing "data.functional_tests.minimal-one-point" with dimensions 500x500
    When I drag core label 0 by 0 x -20
    And I drag surface label 0 by 30 x 0
    Then the final state callback should match "data.state-minimal-one-point.500x500-after-core-and-surface-label-drag" within 1.5
    When I do a brittle circle resize action
    Then the "minimal-one-point-500x500-after-circle-resize-labels-are-reset" snapshot matches the baseline
    Then the final state callback should match "data.state-minimal-one-point.500x500-after-circle-resize" within 1.5