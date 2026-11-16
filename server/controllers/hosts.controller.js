
const hostsDal = require("../dal/hosts.dal");

async function getListingsByHost(req, res) {
  const { hostId } = req.params;

  if (!/^\d+$/.test(hostId)) {
    return res.status(400).json({ error: "hostId must be a number" });
  }

  try {
    const listings = await hostsDal.getListingsByHost(Number(hostId));

    if (listings.length === 0) {
      return res.status(404).json({ error: `Host ${hostId} has no listings` });
    }

    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
}

module.exports = { getListingsByHost };