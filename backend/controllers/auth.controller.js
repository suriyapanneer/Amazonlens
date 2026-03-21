const db = require('../db/queries');

async function getMe(req, res) {
  try {
    const profile = await db.getProfile(req.user.id);
    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        ...profile,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { getMe };
