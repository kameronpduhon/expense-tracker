const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/budget-goals — list all budget goals with category name
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('budget_goals')
    .select('*, categories(name)')
    .order('created_at', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/budget-goals — create (upsert) a budget goal
router.post('/', async (req, res) => {
  const { category_id, monthly_limit } = req.body;

  if (!category_id || monthly_limit === undefined) {
    return res.status(400).json({ error: 'category_id and monthly_limit are required' });
  }

  const { data, error } = await supabase
    .from('budget_goals')
    .upsert({ category_id, monthly_limit, updated_at: new Date().toISOString() }, { onConflict: 'category_id' })
    .select('*, categories(name)')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT /api/budget-goals/:id — update a budget goal's monthly_limit
router.put('/:id', async (req, res) => {
  const { monthly_limit } = req.body;

  const { data, error } = await supabase
    .from('budget_goals')
    .update({ monthly_limit, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select('*, categories(name)')
    .single();

  if (error) return res.status(404).json({ error: 'Budget goal not found' });
  res.json(data);
});

// DELETE /api/budget-goals/:id
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('budget_goals')
    .delete()
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

module.exports = router;
