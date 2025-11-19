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

- 🔴 F008: Loading/Error states:

### Phase 3: Features
- 🔴 F009: Show empty chart
- 🔴 F010: User data entry component with a text box that user can enter data. When user edits data, chart gets automatically updated for the series related to user data.

### Phase 4: Polish
- 🔴 F013: Responsive design
- 🔴 F014: Error handling
- 🔴 F015: Testing setup