const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// GET /api/businesses
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('name');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
