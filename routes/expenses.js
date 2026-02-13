const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/expenses — list with filtering & sorting
router.get('/', async (req, res) => {
  const {
    category, business, who, payment_method,
    start_date, end_date, search,
    sort = 'date', order = 'desc'
  } = req.query;

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

  const ascending = order === 'asc';
  query = query.order(sort, { ascending });

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/expenses/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*, categories(name), businesses(name), payment_methods(name)')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Expense not found' });
  res.json(data);
});

// POST /api/expenses
router.post('/', async (req, res) => {
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
});

// PUT /api/expenses/:id
router.put('/:id', async (req, res) => {
  const { amount, description, category_id, business_id, date, who_bought_it, payment_method_id, receipt_url, notes } = req.body;

  const { data, error } = await supabase
    .from('expenses')
    .update({ amount, description, category_id, business_id, date, who_bought_it, payment_method_id, receipt_url, notes, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(404).json({ error: 'Expense not found' });
  res.json(data);
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

module.exports = router;
