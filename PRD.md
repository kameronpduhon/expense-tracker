# MoneyMap — Product Requirements Document

## Overview

MoneyMap is a personal expense tracker to log business and personal expenses, track recurring costs, and see spending summaries. Built for Kameron (and eventually CC) to manage finances across multiple businesses and personal life.

---

## Core Features

### 1. Expense Entry

Each expense captures the following fields:

| Field | Required | Description |
|-------|----------|-------------|
| Amount | ✅ | Dollar amount of expense |
| Description | ✅ | Name/description of expense |
| Category | ✅ | Business, Wedding, Personal, or Custom |
| Date | ✅ | Date of expense |
| Business | If Business | Which business (Wedding Vendor HQ, HVAC Platform, or custom) |
| Who Bought It | ✅ | Kameron, CC, or Shared |
| Payment Method | Optional | Cash, Card, Bank, Other |
| Receipt Image | Optional | Photo upload of receipt |
| Notes | Optional | Additional notes |

### 2. Recurring Expenses

- **Frequencies**: Monthly, Yearly
- **Behavior**: Auto-logs when due
- **Reminders**: Notification sidebar shows upcoming recurring expenses

### 3. Views & Filters

| View | Description |
|------|-------------|
| List View | All expenses, most recent first |
| By Category | Expenses grouped by category |
| By Month | Monthly breakdown |
| Calendar View | Visual calendar with expenses |

**Filters available on all views:**
- Date range
- Category
- Business
- Who bought it
- Payment method

### 4. Summaries & Totals

- Total spent this month
- Total by category
- Total by business
- Total by who bought it
- Comparison to last month (% up/down)
- Charts/graphs (future enhancement)

### 5. Notification Sidebar

- Shows upcoming recurring expenses
- Reminds user when recurring expense is due

---

## Pre-loaded Data

### Businesses
- Wedding Vendor HQ
- HVAC Platform
- *(Can add custom)*

### Categories
- Business
- Wedding
- Personal
- Custom

### Who Bought It
- Kameron
- CC
- Shared

### Payment Methods
- Cash
- Card
- Bank
- Other

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js |
| Database | Supabase |
| Auth | Password protected |
| Hosting | Local (deployable later) |

---

## Design

- **Theme**: Dark mode (default), with light mode toggle
- **Platform**: Desktop browser (primary)
- **Responsive**: Future enhancement
- **UI Reference**: To be provided by Kameron before frontend build

---

## User Access

- **Phase 1**: Single user (Kameron)
- **Phase 2**: Shared account with CC (track who bought it)
- **Future**: Multi-user with separate accounts

---

## Out of Scope (v1)

The following features are planned for future versions:

- [ ] Budget tracking (per category, overall)
- [ ] Export to CSV/PDF
- [ ] Mobile app / PWA
- [ ] Multi-user authentication
- [ ] Charts and graphs
- [ ] Bank account integration

---

## Project Structure

```
moneymap/
├── README.md
├── PRD.md
├── package.json
├── server.js
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── .env
```

---

## Milestones

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | PRD & Planning | ✅ Complete |
| 2 | Database Setup (Supabase) | 🔲 Not Started |
| 3 | Backend API | 🔲 Not Started |
| 4 | Frontend (after UI reference) | 🔲 Waiting on UI |
| 5 | Recurring Expenses & Notifications | 🔲 Not Started |
| 6 | Testing & Polish | 🔲 Not Started |
| 7 | Deploy | 🔲 Not Started |

---

## Notes

- Kameron will provide a UI reference/sample before frontend development begins
- Data stored in Supabase for security and future multi-device sync
- App name: **MoneyMap** 🗺️💰

---

*Last updated: February 13, 2026*
