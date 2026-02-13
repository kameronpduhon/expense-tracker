const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// GET /api/businesses
router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}));

module.exports = router;
