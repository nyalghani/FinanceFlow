# FinanceFlow

FinanceFlow is a personal finance dashboard for keeping track of income and expenses in Canadian dollars. It is a first-year frontend portfolio project built with HTML, CSS, and vanilla JavaScript.

## Features

- View your balance, total income, and total expenses.
- Add categorized transactions and delete individual entries.
- Filter your transaction history by income or expense. Newest entries appear first.
- See how much you spent in each category and what share it represents.
- Keep transactions in your browser between visits.
- Use the dashboard on a desktop or phone.

The first visit shows sample transactions. Select **Start fresh** to clear them, or add your first transaction to replace them. Data is saved in the current browser for the address where you open the app.

## Run locally

1. Download or clone the project and keep the source files in the same folder.
2. Open `index.html` in a modern browser.

For consistent storage across reloads, serve the folder locally. If Python 3 is installed, run `python3 -m http.server 8000` in the project folder and open `http://localhost:8000`. The app requires no installations or build step.

## Technologies

- **HTML5** for semantic page structure, form controls, and reusable row templates
- **CSS3** for the visual design, Grid, Flexbox, and media queries
- **JavaScript (ES6)** for events, validation, calculations, filtering, and DOM updates
- **localStorage** for browser persistence using JSON

## What I practiced

I used an array of objects as the dashboard's source of data. I connected form and button events to that array, then updated the visible summary, history, and spending bars from it. I also practiced input validation, rendering user-entered names with `textContent`, and formatting currency and dates with the built-in `Intl` API. Storing amounts as whole cents lets the app add and subtract money with integer arithmetic.

| File | Purpose |
| --- | --- |
| `index.html` | Dashboard sections, labeled controls, and templates for rows and spending bars |
| `style.css` | Layout, typography, colours, and responsive styles |
| `script.js` | Transaction data, calculations, rendering, and storage |
