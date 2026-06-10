# Plan Overview:
- Build a web application that tells a clear, interactive data story for a tile company that serves two major customer groups:
    -   Residential customers renovating homes, kitchens, bathrooms, and other personal spaces
    -   Commercial and industrial clients managing large scale projects such as condo developments, office buildings, hotels, and other high volume installations
- The goal of the application is not just to display charts, but to communicate a meaningful business story through data. The app should help users understand an important trend, comparison, or pattern in tile sales behavior.

## The Story:
- Residential customers generate more frequent, seasonal purchases, while commercial clients place fewer but far larger orders that drive a significant share of total revenue.
- The application should show that:
    - Residential demand rises during key renovation periods
    - Commercial orders are less frequent but have a much larger impact on revenue
    - Product category preferences differ across customer types
    - Volume and revenue do not always move together in the same way
- The key takeaway is that small residential orders create steady activity, but large commercial projects drive outsized revenue and change the business picture dramatically.

## Who are the intended users of this application?
- This application is intended for:
    - Sales leadership
    - Operations managers
    - Category or product managers
    - Internal business stakeholders
- They should walk away understanding:
    - How residential and commercial demand differ
    - Which product categories perform best by customer segment
    - How large commercial projects affect revenue trends
    - Why order frequency alone does not tell the full story

## Data requirements:
- Use invented or simplified data only. The goal is storytelling, not data accuracy.
- The dataset should include fields such as:
    - Order date
    - Customer type: residential or commercial
    - Project type: kitchen, bathroom, flooring, condo development, office buildout, hospitality, etc.
    - Tile category: ceramic, porcelain, stone, mosaic, large format, industrial grade
    - Order quantity
    - Revenue
    - Region or market
    - Order size classification
    - Lead time or fulfillment time
- Use faker.js to generate the fake data.
- Store the generated data in a SQLite database and read from that dataset in the application.

## Product Requirements:
- The app should present a clear story, not just a dashboard. The experience should include:
    1. Headline Summary:
    - A strong takeaway at the top of the page, for example:
        - “Commercial projects drive fewer orders but much higher revenue”
        - “Residential demand peaks seasonally, while commercial revenue arrives in larger bursts”
    2. Visual Evidence
        - Support the story with charts that make the comparison intuitive and easy to understand.
    3. Interactive Exploration
        - Allow users to filter and explore the data, but keep the interaction simple and supportive of the narrative.
    4. Written Insight
        - Include short annotations or explanation cards that point out notable trends, spikes, and differences between customer groups.

## Data Visualization Guidelines:
- The application should include a small set of focused charts such as:
    1. Primary Chart
        - Revenue over time, split by residential vs commercial customers
    2. Supporting Charts
        - Order count over time by customer type
        - Average order value by customer type
        - Revenue by tile category
        - Project type distribution across residential and commercial segments
    3. Optional Enhancements
        - Highlight major commercial project orders
        - Show seasonal demand shifts for residential renovation activity
        - Include filters for product category, region, and project type

## Interactive Features:
- Include lightweight interactions such as:
    - Filter by customer type
    - Filter by tile category
    - Filter by project type
    - Date range selection
    - Hover tooltips for exact values
    - Toggle between revenue, order count, and average order value
- Interaction should support the story rather than distract from it.

## UI / Design Requirements
- The design should be clean, modern, and easy to scan.
- Use:
    - Clear visual hierarchy
    - A top level summary area
    - Well spaced chart cards
    - Minimal, polished controls
    - Consistent color coding for residential vs commercial audiences
- The app should feel like an internal analytics prototype: professional, clear, and concise.

## Technology Requirements
- Build the application using the following stack:
    - Vite for project setup and development tooling
    - React with TypeScript for the frontend
    - Material UI for the component library and layout
    - faker.js for generating fake sample data
    - SQLite for storing the generated dataset
    - Chart.js and react-chartjs-2 for data visualization

## Application Structure
- A clean structure might include:
    - Header / Summary section
        - Displays the main story and top line metrics
    - Filter panel
        - Lets users narrow by customer type, tile category, project type, or time period
    - Chart section
        - Shows the primary revenue trend and supporting charts
    - Insight cards / annotations
        - Explains major patterns in plain language
    - Data generation and storage layer
        - Uses faker.js to create data and stores it in SQLite

## Next Steps:
    1. Read the brief carefully and build out the application structure. Make sure the root of the application is the current folder.
    2. STOP, wait for my prompt before continuing.
    3. build a SQLite seet script using faker.js, generate the fake data, then seed the database.
    4. STOP, wait for my prompt before continuing.
    5. Do code cleanup. remove any files that are part of the boiler-plate application scaffolding that we will not need.
    6. STOP, wait for my prompt before continuing.
    7. Build out the layout for the UI using placeholders; don't connect the charts to the data yet, in fact, don't even use charts, just use blank containers where charts and stuff will eventually go.
    8. STOP, wait for my prompt before continuing. I want to approve the layout and composition before we connect the UI to the database.
