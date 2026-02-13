const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const ALLOWED_SORT_COLUMNS = ['date', 'amount', 'description', 'created_at'];

// GET /api/expenses/export — CSV download (must be before /:id)
router.get('/export', asyncHandler(async (req, res) => {
  const {
    category, business, who, payment_method,
    start_date, end_date, search,
    sort = 'date', order = 'desc',
  } = req.query;

  const safeSort = ALLOWED_SORT_COLUMNS.includes(sort) ? sort : 'date';
  const ascending = order === 'asc';

  let query = supabase
    .from('expenses')
    .select('*, categories(name), businesses(name), payment_methods(name)');

  if (category) query = query.eq('category_id', category);
  if (business) query = query.eq('business_id', business);
  if (who) query = query.eq('who_bought_it', who);
  if (payment_method) query = query.eq('payment_method_id', payment_method);
  if (start_date) query = query.gte('date', start_date);
  if (end_date) query = query.lte('date', end_date);
  if (search) query = query.ilike('description', `%${search}%`);

  query = query.order(safeSort, { ascending });

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  // Build CSV
  const csvEscape = (val) => {
    if (val == null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const headers = ['Date', 'Description', 'Amount', 'Category', 'Business', 'Who', 'Payment Method', 'Notes'];
  const rows = data.map(e => [
    csvEscape(e.date),
    csvEscape(e.description),
    csvEscape(e.amount),
    csvEscape(e.categories?.name || ''),
    csvEscape(e.businesses?.name || ''),
    csvEscape(e.who_bought_it),
    csvEscape(e.payment_methods?.name || ''),
    csvEscape(e.notes),
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="moneymap-expenses.csv"');
  res.send(csv);
}));

// GET /api/expenses — list with filtering, sorting & pagination
router.get('/', asyncHandler(async (req, res) => {
  const {
    category, business, who, payment_method,
    start_date, end_date, search,
    sort = 'date', order = 'desc',
    limit: limitStr, offset: offsetStr
  } = req.query;

  const safeSort = ALLOWED_SORT_COLUMNS.includes(sort) ? sort : 'date';
  const limit = Math.min(Math.max(parseInt(limitStr) || 50, 1), 500);
  const offset = Math.max(parseInt(offsetStr) || 0, 0);

  let query = supabase
    .from('expenses')
    .select('*, categories(name), businesses(name), payment_methods(name)', { count: 'exact' });

  if (category) query = query.eq('category_id', category);
  if (business) query = query.eq('business_id', business);
  if (who) query = query.eq('who_bought_it', who);
  if (payment_method) query = query.eq('payment_method_id', payment_method);
  if (start_date) query = query.gte('date', start_date);
  if (end_date) query = query.lte('date', end_date);
  if (search) query = query.ilike('description', `%${search}%`);

  const ascending = order === 'asc';
  query = query.order(safeSort, { ascending });
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data, total: count, limit, offset });
}));

// GET /api/expenses/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*, categories(name), businesses(name), payment_methods(name)')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Expense not found' });
  res.json(data);
}));

// POST /api/expenses
router.post('/', asyncHandler(async (req, res) => {
  const { amount, description, category_id, business_id, date, who_bought_it, payment_method_id, receipt_url, notes } = req.body;

  if (!amount || !description || !category_id || !who_bought_it) {
    return res.status(400).json({ error: 'amount, description, category_id, and who_bought_it are required' });
  }

  const { data, error } = await supabase
    .from('expenses')
    .insert({ amount, description, category_id, business_id, date, who_bought_it, payment_method_id, receipt_url, notes })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}));

// PUT /api/expenses/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const { amount, description, category_id, business_id, date, who_bought_it, payment_method_id, receipt_url, notes } = req.body;

  const { data, error } = await supabase
    .from('expenses')
    .update({ amount, description, category_id, business_id, date, who_bought_it, payment_method_id, receipt_url, notes, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(404).json({ error: 'Expense not found' });
  res.json(data);
}));

// DELETE /api/expenses/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
}));

module.exports = router;
