Feature: State Interactions
  Interaction should cause a state callback, and when I rerender with that new state value, I should see the same state as caused by the interaction

  @applitools @state
  Scenario: User can drag a surface label
    Given I am viewing "data.functional_tests.minimal" with dimensions 1000x600
    Then the "minimal_moonplot_1000x600" snapshot matches the baseline
    When I drag surface label 0 by 10 x 10
    And the "minimal_moonplot_1000x600_after_surface_label_drag" snapshot matches the baseline
#    And the final state callback should match "porche_label_moved_50x50" within 3

  @applitools @state
  Scenario: User can drag a core label
    Given I am viewing "data.functional_tests.minimal" with dimensions 1000x600
    Then the "minimal_moonplot_1000x600" snapshot matches the baseline
    When I drag core label 0 by 0 x -20
    And the "minimal_moonplot_1000x600_after_core_label_drag" snapshot matches the baseline
#    And the final state callback should match "porche_label_moved_50x50" within 3
