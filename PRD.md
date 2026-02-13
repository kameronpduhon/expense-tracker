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
- **UI Reference**: See `/ui-inspo/` folder — Inspo 3 (Copilot) is primary reference

---

## UI Requirements

### Overall Layout

Based on **Inspo 3 (Copilot)** as the primary reference.

```
┌─────────────────────────────────────────────────────────────┐
│  Logo: MoneyMap                              User / Settings │
├────────────┬────────────────────────────────────────────────┤
│            │                                                 │
│  Sidebar   │              Main Content Area                  │
│  Nav       │                                                 │
│            │                                                 │
│            │                                                 │
│            │                                                 │
│            │                                                 │
│            │                                                 │
└────────────┴────────────────────────────────────────────────┘
```

### Color Palette (Dark Mode)

| Element | Color |
|---------|-------|
| Background (primary) | `#0a0a0b` or `#0f1117` (deep navy/black) |
| Background (cards) | `#1a1a1f` or `#151922` |
| Background (hover) | `#222228` |
| Border | `#2a2a30` |
| Text (primary) | `#f5f5f7` (white) |
| Text (secondary) | `#8b8b8f` (gray) |
| Text (muted) | `#5c5c60` |
| Accent (primary) | `#8b5cf6` (purple) or `#6366f1` (indigo) |
| Accent (success) | `#22c55e` (green) |
| Accent (warning) | `#f97316` (orange) |
| Accent (danger) | `#ef4444` (red) |
| Accent (info) | `#3b82f6` (blue) |

### Left Sidebar Navigation

Fixed left sidebar with navigation items:

| Nav Item | Icon | Description |
|----------|------|-------------|
| Dashboard | 📊 grid icon | Overview with stats and graph |
| Transactions | 📝 list icon | All expenses list |
| Categories | 🏷️ tag icon | View by category |
| Recurring | 🔄 refresh icon | Manage recurring expenses |
| Settings | ⚙️ gear icon | App settings |

**Sidebar behavior:**
- Fixed width (~220px)
- Active item highlighted with accent color
- Icons + text labels
- Collapsible (future enhancement)

### Dashboard View (Main)

The primary view users see. Includes:

#### 1. Monthly Spending Graph (Hero Element)
*Reference: Inspo 3*

- **Line chart** showing spending over the current month
- X-axis: Days of month (1-31)
- Y-axis: Dollar amount
- Shows cumulative or daily spending
- Visual marker when spending exceeds a threshold
- Header shows: "Monthly Spending" + link to transactions
- Subheader shows: "$X spent" or "$X left of $Y budgeted" (if budgets added later)
- **Time period toggles**: 1W, 1M, 3M, YTD

#### 2. Summary Cards Row

Three cards showing key metrics:

| Card | Content |
|------|---------|
| Total This Month | Dollar amount + comparison to last month (↑12% or ↓5%) |
| By Category (top 3) | Mini breakdown of top spending categories |
| Recurring Due | Count of upcoming recurring expenses this month |

#### 3. Recent Transactions

- List of 5-10 most recent expenses
- Each row shows: Date, Description, Category badge, Amount
- "View All" link to Transactions page
- Quick actions on hover (edit, delete)

#### 4. Top Categories (Right Side or Below)
*Reference: Inspo 3*

- Vertical list of categories with spending amounts
- Small progress bar or icon per category
- Shows top 5-6 categories
- Color-coded category badges

#### 5. Notification/Reminders Area
*Reference: Inspo 1 "Upcoming Bills"*

- Shows upcoming recurring expenses
- Each item: Due date, Name, Amount, "Mark Paid" button
- Highlight overdue items in red/orange
- Collapsible or dismissible

### Transactions View

Full list of all expenses with:

#### Filters Bar
- Date range picker
- Category dropdown
- Business dropdown (if category = Business)
- Who bought it dropdown
- Payment method dropdown
- Search box

#### Transactions Table/List

| Column | Description |
|--------|-------------|
| Date | Date of expense |
| Description | Name/description |
| Category | Badge with category name |
| Business | If applicable |
| Who | Kameron / CC / Shared |
| Amount | Dollar amount (right-aligned) |
| Actions | Edit / Delete buttons (on hover) |

#### Sorting
- Click column headers to sort
- Default: newest first

### Categories View

- Grid or list of all categories
- Each category card shows:
  - Category name + icon
  - Total spent this month
  - Number of transactions
  - Click to see all transactions in that category

### Recurring View

List of all recurring expenses:

| Column | Description |
|--------|-------------|
| Name | Expense name |
| Amount | Dollar amount |
| Frequency | Monthly / Yearly |
| Next Due | Next payment date |
| Category | Category badge |
| Status | Active / Paused |
| Actions | Edit / Delete / Pause |

**Add Recurring** button opens a form/modal.

### Add Expense Modal/Form

Triggered by a prominent "+ Add Expense" button (top right or floating).

**Form Fields:**
1. Amount (input, required) — large, prominent
2. Description (input, required)
3. Category (dropdown, required) — Business, Wedding, Personal, Custom
4. Business (dropdown, conditional) — shows if Category = Business
5. Date (date picker, required) — defaults to today
6. Who Bought It (dropdown, required) — Kameron, CC, Shared
7. Payment Method (dropdown, optional) — Cash, Card, Bank, Other
8. Receipt (file upload, optional) — image upload
9. Notes (textarea, optional)
10. Recurring toggle — if on, show frequency options (Monthly/Yearly)

**Buttons:** Cancel, Save

### Components Library

#### Cards
- Rounded corners (8-12px)
- Subtle border or shadow
- Padding: 16-24px
- Hover state: slight background change

#### Buttons
- Primary: Accent color background, white text
- Secondary: Transparent, border, gray text
- Danger: Red background for delete actions
- Rounded corners (6-8px)

#### Badges/Tags
- Small, rounded pills
- Color-coded by category
- Business: Blue
- Wedding: Pink
- Personal: Green
- Custom: Purple/Gray

#### Form Inputs
- Dark background (#1a1a1f)
- Border color: #2a2a30
- Focus state: Accent color border
- Rounded corners (6-8px)

#### Modals
- Centered overlay
- Dark background with slight transparency
- Card-style modal content
- Close button (X) top right

### Typography

| Element | Size | Weight |
|---------|------|--------|
| Page title | 28px | 600 |
| Section title | 16-18px | 600 |
| Card title | 14px | 600 |
| Body text | 13-14px | 400 |
| Labels | 12px | 500 |
| Small/muted | 11-12px | 400 |

**Font family:** System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', etc.)

### Icons

Use a consistent icon set:
- Lucide icons (recommended, same as Mission Control)
- Or Heroicons / Feather Icons
- Stroke-based, 1.5-2px stroke width
- Size: 16-20px typically

### Spacing System

Use consistent spacing increments:
- 4px, 8px, 12px, 16px, 24px, 32px, 48px

### Empty States

When no data exists, show helpful empty states:
- Illustration or icon
- "No expenses yet" message
- Call-to-action button ("Add your first expense")

### Loading States

- Skeleton loaders for cards/lists
- Spinner for buttons during save

---

## UI Reference Images

Located in `/ui-inspo/` folder:

| File | Description | Use For |
|------|-------------|---------|
| inspo 1.png | FIQ app | Card styling, upcoming bills section |
| inspo 2.png | Other Level's | Category icons, month selector |
| inspo 3.jpg | Copilot app | **Primary reference** — layout, monthly spending graph, sidebar nav |

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
- [x] Charts and graphs (cumulative monthly spending chart implemented)
- [ ] Bank account integration
- [ ] Receipt image upload

---

## Project Structure

```
moneymap/
├── README.md
├── PRD.md

├── package.json
├── server.js
├── routes/
│   ├── businesses.js
│   ├── categories.js
│   ├── expenses.js
│   ├── paymentMethods.js
│   ├── recurring.js
│   └── summary.js
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
| 2 | Database Setup (Supabase) | ✅ Complete |
| 3 | Backend API (Express routes) | ✅ Complete |
| 4 | Frontend UI (Dashboard, Transactions, Categories, Recurring, Settings) | ✅ Complete |
| 5 | Authentication, Toast Notifications, Form Validation, Reminders Panel | ✅ Complete |
| 6 | Testing & Polish | 🔲 Not Started |
| 7 | Deploy | 🔲 Not Started |

---

## Notes

- Data stored in Supabase for security and future multi-device sync
- App name: **MoneyMap** 🗺️💰
- Auth uses bcrypt password hashing with express-session (7-day cookie)
- All API routes are protected behind session-based authentication
- Toast notifications replace all browser alerts for better UX

---

*Last updated: February 13, 2026*
