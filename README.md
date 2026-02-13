# MoneyMap

A personal expense tracker to log business and personal expenses, track recurring costs, and see spending summaries.

## Features

- **Expense Tracking** — Log expenses with amount, category, date, and notes
- **Multiple Categories** — Business, Wedding, Personal, or Custom
- **Business Tracking** — Track expenses per business (Wedding Vendor HQ, HVAC Platform, etc.)
- **Recurring Expenses** — Set up weekly/monthly/yearly recurring costs with reminders
- **Spending Dashboard** — Monthly spending chart, summary cards, recent transactions
- **Filters & Sorting** — Filter by date, category, business, who, payment method; sort by column
- **Who Bought It** — Track purchases by Kameron, CC, or Shared
- **Password Authentication** — Session-based login with bcrypt
- **Toast Notifications** — Success/error toasts replace browser alerts
- **Form Validation** — Inline field validation with error messages
- **Reminders Panel** — Bell icon shows overdue/today/upcoming recurring expenses
- **Dark/Light Mode** — Theme toggle in Settings

## Tech Stack

- **Frontend**: HTML, CSS, vanilla JavaScript
- **Backend**: Node.js with Express
- **Database**: Supabase (PostgreSQL)
- **Auth**: bcrypt + express-session
- **Charts**: Chart.js
- **Icons**: Lucide

## Setup

### Prerequisites

- Node.js (v18+)
- A Supabase project with the required tables

### Install

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
PORT=3000
SESSION_SECRET=your_random_64_char_hex_string
PASSWORD_HASH=your_bcrypt_hash
```

Generate the session secret and password hash:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

### Run

```bash
npm start
```

Visit `http://localhost:3000`. Log in with your password.

## Project Structure

```
moneymap/
├── server.js              # Express server, auth middleware
├── routes/
│   ├── businesses.js      # GET /api/businesses
│   ├── categories.js      # GET /api/categories
│   ├── expenses.js        # CRUD /api/expenses
│   ├── paymentMethods.js  # GET /api/payment-methods
│   ├── recurring.js       # CRUD /api/recurring
│   └── summary.js         # GET /api/summary
├── public/
│   ├── index.html         # Login screen + app shell
│   ├── styles.css         # All styles (dark/light theme)
│   └── app.js             # Frontend logic
├── .env                   # Environment variables (not committed)
├── PRD.md                 # Product requirements
              # Claude Code instructions
└── package.json
```

## Status

Phases 1-5 complete. See [PRD.md](./PRD.md) for full milestones.

## License

Private — All rights reserved.
