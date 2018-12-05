#### TODO clean up this file

#structure of each test definition

     test definition:
       testname: string. single or directory
       title: string. text to display at top of example
       type: string. See examples below for valid values
       width: int. Width of each widget on page
       height: int. Height of each widget on page
       rowSize: int. how many widgets per row on the page    
       data: string or array of dataStrings
       data_directory: path to a data directory, relative to the content directory
       config: string or array of configStrings
       general_comments: 
         - "this is a general comment"
         - "this is another general comment"
         - "they all appear at top of file"
       comments: array of comment objects, each containing
         - location: index of the widget to add comment to
           text: text of comment
          
#examples of different types of test definitions available:

## single

    testname: example test
    data: data.test_plan.abc_rbg
    type: single_widget_single_page

## repeat for each config

     testname: example test
     type: repeat_for_each_data
     data: data.test_plan.one_val
     config:
       - config.label_12_24
       - config.label_24

     repeat build a single page with an example for each config
     - testname: example test
       type: single_page_one_example_per_config
       data: data.450_companies
       snapshot-name: data.450_companies
       config:
         - config.defaultSettings
         - config.label_stage_1
         - config.label_stage_0
    
     build a single page with an example for each config
     - testname: example test
       data: data.450_companies
       type: single_page_one_example_per_config
       snapshot-name: data.450_companies
       config:
         - config.defaultSettings
         - config.label_stage_1
         - config.label_stage_0

     build a single page with an example for each data
     - testname: color_variations
       width: 250
       height: 300
       rowSize: 5
       type: single_page_one_example_per_data
       comments:
         - location: 18
           text: "it is all fucked, this example shows it"
         - location: general
           text: "this is a general comment"
       data:
         - data.decreasing_value_sets.1_decreasing_values
         - data.decreasing_value_sets.2_decreasing_values
   
    
    version: 1
    groupname: "Representative Examples (Misc) 1000x1000"
    tests:
      - data_directory: "data/misc"
        width: 1000
        height: 1000
        type: for_each_data_in_directory
        use_config_as_title: true
        comments:
          - location: coke_zero_sentiment_unsorted
            text: labels removed in batches (VIS-439)
            status: red
    #    config: config.debug
