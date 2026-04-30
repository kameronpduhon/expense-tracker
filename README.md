# MoneyMap

A self-hosted personal expense tracker. Logs business and personal expenses, tracks recurring costs, generates spending summaries, and exports to CSV. Built with Node + Express + Supabase.

I built this because every expense tracker I tried either tied me to a specific bank, sold my data to advertisers, or didn't let me split spending across multiple side businesses. So I rolled my own.

## Features

- Expense tracking with amount, category, date, and notes
- Categories: Business, Personal, Custom
- Track expenses per business (configurable in seed data)
- Recurring expenses with monthly or yearly frequency and reminders
- Spending dashboard with monthly chart, summary cards, recent transactions
- Filters and sorting by date, category, business, payer, payment method
- Password authentication (bcryptjs + express-session)
- Budget goals with monthly spending limits per category
- CSV export of filtered transactions
- Toast notifications, inline form validation, skeleton loaders, styled confirm modals
- Accessible: ARIA attributes, focus trapping, keyboard navigation
- Responsive design (1024 / 768 / 480 breakpoints)
- Dark and light mode

## Tech Stack

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js with Express 5
- Database: Supabase (Postgres)
- Auth: bcryptjs + express-session
- Charts: Chart.js
- Icons: Lucide

## Setup

### Prerequisites

- Node.js v18+
- A Supabase project

### Install

```bash
npm install
```

### Database

In the Supabase SQL editor, run the contents of:

```
db/schema.sql
db/seed.sql
```

### Environment variables

Copy `.env.example` to `.env` and fill in:

```env
SUPABASE_URL=your_supabase_project_url
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

Visit `http://localhost:3000` and log in with the password you hashed.

## Project Structure

```
moneymap/
├── server.js              # Express server, auth middleware
├── routes/
│   ├── budgetGoals.js     # CRUD /api/budget-goals
│   ├── businesses.js      # GET /api/businesses
│   ├── categories.js      # GET /api/categories
│   ├── expenses.js        # CRUD /api/expenses + GET /export
│   ├── paymentMethods.js  # GET /api/payment-methods
│   ├── recurring.js       # CRUD /api/recurring
│   └── summary.js         # GET /api/summary
├── public/
│   ├── index.html         # Login screen + app shell
│   ├── styles.css         # All styles (dark / light theme)
│   └── app.js             # Frontend logic
├── db/
│   ├── schema.sql         # Tables + RLS policies
│   └── seed.sql           # Default categories, businesses, payment methods
├── .env.example
├── package.json
└── README.md
```

## License

MIT
