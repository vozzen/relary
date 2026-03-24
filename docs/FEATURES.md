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
- 🟢 F0605: 
    - For each series with code starting with "TP.DK.", use the term after as label name in series selector. e.g. use EUR for "TP.DK.EUR.A.YTL".
- 🟢 F0606:
    - For any loaded series with code starting "TP.DK.", generate another series with code and name "₺/<series-name>". Series should have a data point for each month that user data has and value should be calculated by dividing user data value for that month to loaded series value for that month. This series should be updated whenever user data series is updated.
- 🟢 F0607:
    - Chart should show only 2 decimal digits
    - Series should be selected directly clicking on the labels on chart instead of a separate set of checkboxes. Let chart to fill that gap of removed checkbox group
- 🟢 F0608:
    - Make chart's display interval end is always current month. Keep interval beginning logic same.
- 🟢 F0609:
    - Derived series should be in chart just like user data series on page load even no user data entered yet.
- 🟢 F0610:
    - Rename user data series to "Gelir(₺)".
    - Rename user data derived series to "Gelir(<series-friendly-name>)".
- 🟢 F0611:
    - Let user to save currently entered user data to browser local storage by providing a name. Also let use to list saved data sets' names and load one of them which should immediatly replace currently entered data.
- 🟢 F0612:
    - For series "TP.FG.J0", do not display its raw form. Instead, 
        - Create another series on load with label "Enflasyon"
        - Whenever user updates data, find the value of "TP.FG.J0" on earliest user data date, and update "Enflasyon" series by dividing "TP.FG.J0" series by that value and multiplying by 100. That will make first visible value of "Enflasyon" always to be 100.
- 🟢 F0613:
    - Create another series with friendly name "Alım gücü". Update its data whenever user data changes by dividing user data by first user data value and multiplying with 100; then divide this series by "Enflasyon" series and multiply with 100.
- 🟢 F0614:
    - Sort series labels as: Gelir - Gelir(USD) - Gelir (EUR) - USD - EUR - Enflasyon - Alım Gücü
- 🟢 F0615:
    - On load, only Gelir, Gelir(USD), Alım Gücü series should be enabled

### Phase 7: Polishing
- 🟢 F0700:
    - Move user data entry and data storage management sections side-by-side and fill new space with graph.
    - Remove Kaydet/Yukle and Gizle buttons with a header and make for always visible
    - Merge two sections in a compact view
- 🟢 F0701:
    - Enable automatic semantic commit based semantic versioning and release notes using github actions
- 🟢 F0702:
    - Add the application version(version in package.json) as the last statement in footer.
- 🟢 F0703:
    - Create a github action that is triggered on weekdays at 09:15, 12:15, 15:15, 18:15.
    - It should execute `npm run fetch-series`. If successful, `/data/series.json` file should be checked it in a branch other than main(such as  gh-pages) so that it is accessible by this app later.
    - App should read this file on page load instead of directly accessing the file `/data/series.json` in repo.
- 🟢 F0704:
    - fetch-series process should add a timestamp to root object in series.json file with key "timestamp". Value should be a ISO-8601 timestamp with UTC offset representing the creation time of the file.
- 🟢 F0705:
    - Display dates on X axis at 45-degree angle for better readability. Adjusted XAxis height to 60px and tooltip date label color to lighter shade for improved contrast against dark background.

- 🟢 F0706:
    - Integrate playwright to the project.
    - Add one tests for a simple flow.
- 🟡 F0707:
    - Review the features in FEATURES.md and add playwright tests testing those features.
- 🟢F0708:
    - Migrate EVDS client from v2 to v3 API.
    - Update base URL from https://evds2.tcmb.gov.tr/service/evds to https://evds3.tcmb.gov.tr/igmevdsms-dis.
    - Add automatic chunked fetching to handle 150-observation-per-request API limit.
    - API key header authentication already compliant, no change needed.

### Phase 8: SEO & Discoverability
- 🔴 F0800: Add JSON-LD structured data
    - Add a `<script type="application/ld+json">` block to `index.html` with `WebApplication` schema.
    - Include name, description, url, applicationCategory ("FinanceApplication"), operatingSystem ("All"), offers (Free).
    - Helps Google display rich results and understand the app's purpose.
- 🔴 F0801: Replace OG image with raster format
    - Current `og:image` and `twitter:image` point to `relary.svg`. Most social platforms (Facebook, LinkedIn, WhatsApp) cannot render SVGs.
    - Create a 1200×630px PNG preview image (`public/og-image.png`) and update meta tags in `index.html`.
- 🔴 F0802: Add `<h1>` heading to HomePage
    - The main keyword ("Maaş Alım Gücü Hesaplama" or similar) only appears in `<title>`, not in the rendered HTML.
    - Add a visible or visually-hidden `<h1>` to `HomePage.tsx` to improve on-page SEO signal.
- 🔴 F0803: Add `<noscript>` fallback content
    - The HTML body is just `<div id="root"></div>`. Crawlers that don't execute JS see no content.
    - Add a `<noscript>` block inside `<body>` with descriptive Turkish text explaining what the app does.
- 🔴 F0804: Add `hreflang` tag
    - Add `<link rel="alternate" hreflang="tr" href="https://relary.sen.kim/" />` to `index.html`.
    - Helps Google serve the page to Turkish-speaking users in search results.
- 🔴 F0805: Add Web App Manifest
    - Create `public/manifest.json` with app name, short_name, description, icons, theme_color, background_color, display.
    - Link from `index.html` via `<link rel="manifest" href="/manifest.json" />`.
    - Improves mobile discoverability and enables "Add to Home Screen".
- 🔴 F0806: Update sitemap.xml and automate lastmod
    - Current `lastmod` is hardcoded to `2025-11-22`.
    - Update to current date and add a build script or Vite plugin to set `lastmod` automatically on each build.
- 🔴 F0807: Add 404 catch-all route
    - No catch-all route exists. Add a `*` route rendering a `NotFound` component with navigation back to home.
    - Helps crawlers and users when they land on non-existent paths.
- 🔴 F0808: Add descriptive content / FAQ section
    - Search engines rank pages with substantive text higher.
    - Add a collapsible "Nasıl Çalışır?" (How it works) section below the main app content in `HomePage.tsx`.
    - Explain salary purchasing power calculations, data sources (TCMB EVDS), and tool usage in Turkish.
- 🔴 F0809: Add build-time prerendering
    - Highest-impact technical SEO change. React SPA renders empty `<div id="root"></div>` — crawlers see no content.
    - Use `vite-plugin-prerender` or similar to generate static HTML at build time.
    - Since the app has a single route, setup is straightforward.
    - Verify `view-source:` of built HTML shows actual page content after prerendering.