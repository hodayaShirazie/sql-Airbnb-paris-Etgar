
const { sql, poolPromise } = require("../config/db");
const { CARD_COLUMNS } = require("./listings.dal");

async function getListingsByHost(hostId) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("hostId", sql.Float, hostId)
    .query(`
      SELECT ${CARD_COLUMNS},
        UPPER(host_name) AS hostName
      FROM dbo.Paris_Airbnb_listings
      WHERE host_id = @hostId AND price IS NOT NULL
      ORDER BY price ASC
    `);

  return result.recordset;
}

module.exports = { getListingsByHost };