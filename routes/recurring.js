const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/recurring — list all recurring expenses
router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('recurring_expenses')
    .select('*, categories(name), businesses(name), payment_methods(name)')
    .order('next_due');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}));

// GET /api/recurring/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('recurring_expenses')
    .select('*, categories(name), businesses(name), payment_methods(name)')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Recurring expense not found' });
  res.json(data);
}));

// POST /api/recurring
router.post('/', asyncHandler(async (req, res) => {
  const { name, amount, frequency, next_due, category_id, business_id, who_bought_it, payment_method_id, status } = req.body;

  if (!name || !amount || !frequency || !next_due || !category_id || !who_bought_it) {
    return res.status(400).json({ error: 'name, amount, frequency, next_due, category_id, and who_bought_it are required' });
  }

  const { data, error } = await supabase
    .from('recurring_expenses')
    .insert({ name, amount, frequency, next_due, category_id, business_id, who_bought_it, payment_method_id, status })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
}));

// PUT /api/recurring/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const { name, amount, frequency, next_due, category_id, business_id, who_bought_it, payment_method_id, status } = req.body;

  const { data, error } = await supabase
    .from('recurring_expenses')
    .update({ name, amount, frequency, next_due, category_id, business_id, who_bought_it, payment_method_id, status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(404).json({ error: 'Recurring expense not found' });
  res.json(data);
}));

// DELETE /api/recurring/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('recurring_expenses')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
}));

module.exports = router;
