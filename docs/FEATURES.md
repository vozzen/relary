# Feature Tracking

## Status Legend
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- ⚪ Blocked

## Overview
This is a single page application that would show a chart of several timeseries.

There should be a header section with app name "Relative Salary". There should be a footer section too with a text saying "Hiçbir veri sunuculara gönderilmez"

One of the time series should be entered by user. Others are fetched from backend. User should be given an text editor where he can enter/edit timeseries as key value pair where key is a date in format DD.MM.YYYY or MM.YYYY or MM-YYYY and value is a number.

For the interval user provided, other time series data should be shown on same chart with proper a legend and a separate Y axis (X axis is time and shared by all series)


## Features

### Phase 1: Core Setup
- 🟢 F001: Project initialization and structure
- 🟢 F002: Basic routing setup
- 🟢 F003: State management configuration
- 🟢 F004: API service layer

### Phase 2: UI Components
- 🟢 F005: Header/Navigation component
- 🟢 F006: Footer component
 - 🟢 F007: Home page layout: 
    - Ensure Header sticks to top of the page
    - Ensure Footer sticks to bottom of the page.
    - The chart should be in the middle of the page, centered horizontally, covering 80% of window width
    - Data entry field should be below the chart.
    - If data user entered is not valid higlight the text box with red.
    - If data user entered is valid, then highlight the text with green.

### Phase 3: Features
 - 🟢 F009: Show empty chart
 - 🟢 F010: Install and use Rechart library to render the main chart instead of current rendering.
 - 🟢 F011: User data entry component with a text box that user can enter data. When user edits data, chart gets automatically updated for the series related to user data.
 - 🟢 F012: Convert user entered data into a timeseries where there is an entry for each month between earliest and latest user data. For that ensure that user data is sorted by timestamp first and fill the gaps in interval of 2 entries so that for each month inbetween there is an entry with value of earlier timestamp. For example if user has entered 2 etries such as (01.2024, 100) and (04.2024, 123); convert it to (01.2024, 100), (02.2024, 100), (03.2024, 100), (04.2024, 123)

### Phase 4: Polish
- 🟢 F013: Responsive design
- 🟢 F014: Error handling
- 🟢 F015: Testing setup

### Phase 5: A library for fetching raw series data
- 🟢 F0500: Inspect the file "EVDS_Web_Servis_Kullanim_Kilavuzu.txt" in workspace to understand the remote API serving series data. Create a module that includes a client library to consume the service using typescript. Client should be simply a wrapper, but uses typescript structs and types (Date for dates and type/enums for parameters etc.). 
- 🟢 F0501: Create a service which fetches a configured set of series. It should fetch the series monthly, from configured start date to current month with averaging aggregation. Later, for each series, it should fetch today's value and overwrite this months value with today's value. Each series should be written to a file named as "<series-code>.json" after replacing `<series-code>` with actual series code value. It should be a JSON file. Content should be like `{ "code": "<series-code>, items: [{"date": "2025.03.01", value: "132.14"}] }`. Notice that dates are set to first day of month. Finally create a file named "series.json" to combine all files into one, where struct is like `{ series: [{ "code": "<series-code>, items: [{"date": "2025.03.01", value: "132.14"}] }] }`. Include a README.md describing the tool and how to run it as a standalone tool. Start date and series to fetch should be configurable via env vars. 

### Phase 6: Loading and displaying series

- 🟢 F0601: 
    - Application should fetch series data from a file located at a URL in web. However for now, it should import sample data from `data/series.json` and keep in memory at startup. Adapt the interfaces, DTOs etc to comply with that file content.
    - For each loaded series, there should be a checkbox like component with series' code as label which controles whether the series is rendered in chart or not.
- 🟢 F0602: 
    - When user enters a valid data, update the chart's begin and end dates so only the interval of user data is shown on chart.
    - If no data entered, default range should be from 01.2006 to today.
- 🟢 F0603:
    - Accept D.M.YYYY or D-M-YYYY as user data format too
- 🟢 F0604:
    - Each series should have its own Y axis as their magnitute can vary a lot