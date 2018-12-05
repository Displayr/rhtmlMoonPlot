@applitools @state
Feature: State Interactions
  Interaction should cause a state callback, and when I rerender with that new state value, I should see the same state as caused by the interaction

  Scenario: User can drag a click a rectangle
    Given I am viewing "default_template_widget" with dimensions 400x400
    Then the "default_template_widget" snapshot matches the baseline
    When I click the "blue" square
    Then the "blue" square should be selected
    And the "default_template_widget_blue_square_selected" snapshot matches the baseline
    And the final state callback should match "blue_square_selected"

  Scenario: User state is saved on next reload
    Given I am viewing "default_template_widget" with state "blue_square_selected" and dimensions 400x400
    Then the "default_template_widget_blue_square_selected" snapshot matches the baseline

