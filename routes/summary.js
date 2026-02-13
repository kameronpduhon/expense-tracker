const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/summary — spending totals for a given month
router.get('/', asyncHandler(async (req, res) => {
  const now = new Date();
  let month = parseInt(req.query.month) || (now.getMonth() + 1);
  let year = parseInt(req.query.year) || now.getFullYear();

  // Validate bounds
  if (month < 1 || month > 12) month = now.getMonth() + 1;
  if (year < 2000 || year > 2100) year = now.getFullYear();

  // Build date range for requested month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  // Build date range for previous month (for month-over-month change)
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevStartDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
  const prevEndDate = startDate;

  // Fetch current month expenses
  const { data: expenses, error: expError } = await supabase
    .from('expenses')
    .select('amount, category_id, business_id, who_bought_it, categories(name), businesses(name)')
    .gte('date', startDate)
    .lt('date', endDate);

  if (expError) return res.status(500).json({ error: expError.message });

  // Fetch previous month total for comparison
  const { data: prevExpenses, error: prevError } = await supabase
    .from('expenses')
    .select('amount')
    .gte('date', prevStartDate)
    .lt('date', prevEndDate);

  if (prevError) return res.status(500).json({ error: prevError.message });

  // Calculate totals
  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const prevTotal = prevExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const monthOverMonthChange = prevTotal === 0 ? null : ((total - prevTotal) / prevTotal) * 100;

  // Group by category
  const byCategory = {};
  expenses.forEach(e => {
    const name = e.categories?.name || 'Uncategorized';
    byCategory[name] = (byCategory[name] || 0) + parseFloat(e.amount);
  });

  // Group by business
  const byBusiness = {};
  expenses.forEach(e => {
    const name = e.businesses?.name || 'No Business';
    byBusiness[name] = (byBusiness[name] || 0) + parseFloat(e.amount);
  });

  // Group by who
  const byWho = {};
  expenses.forEach(e => {
    byWho[e.who_bought_it] = (byWho[e.who_bought_it] || 0) + parseFloat(e.amount);
  });

  res.json({
    month,
    year,
    total: Math.round(total * 100) / 100,
    previousMonthTotal: Math.round(prevTotal * 100) / 100,
    monthOverMonthChange: monthOverMonthChange !== null ? Math.round(monthOverMonthChange * 100) / 100 : null,
    byCategory,
    byBusiness,
    byWho
  });
}));

module.exports = router;
