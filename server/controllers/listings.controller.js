// Controller for /api/listings - reads req.query / req.params, validates, calls the DAL,
// sets the status code and sends JSON. No SQL here.
//
// Step 2: getListings(req, res)
//   - read neighbourhood, roomType, minPrice, maxPrice, sort, limit from req.query
//   - validate: limit (default 20, max 50), minPrice/maxPrice are numbers, sort is "price" or "rating"
//     (anything else -> 400 { error })
//   - map sort to a column name here: ORDER BY can't be a parameter
//
// Step 3: getListingById(req, res)
//   - id is not a number -> 400, no such id -> 404
//   - convert hostIsSuperhost 't' / 'f' to true / false
//
// Every controller: try/catch -> 500 { error } when the DAL throws.


const listingsDal = require("../dal/listings.dal");

function isValidPrice(value) {
  if (value.trim() === "") return false;
  const n = Number(value);
  return !isNaN(n) && n >= 0;
}

// ===== Endpoint 1: all cards =====
async function getListings(req, res) {
  const { neighbourhood, roomType, minPrice, maxPrice } = req.query;
  const sort = req.query.sort ?? "price";

  let orderBy;
  if (sort === "price") {
    orderBy = "price ASC";
  } else if (sort === "rating") {
    orderBy = "review_scores_rating DESC";
  } else {
    return res.status(400).json({ error: "sort must be 'price' or 'rating'" });
  }

  let limit = 20;
  if (req.query.limit !== undefined) {
    const isWholeNumber = /^\d+$/.test(req.query.limit);
    if (!isWholeNumber || Number(req.query.limit) < 1) {
      return res.status(400).json({ error: "limit must be a whole number from 1 to 50" });
    }
    limit = Math.min(Number(req.query.limit), 50);
  }

  if (minPrice !== undefined && !isValidPrice(minPrice)) {
    return res.status(400).json({ error: "minPrice must be a non-negative number" });
  }
  if (maxPrice !== undefined && !isValidPrice(maxPrice)) {
    return res.status(400).json({ error: "maxPrice must be a non-negative number" });
  }

  try {
    const rows = await listingsDal.getListings({
      neighbourhood,
      roomType,
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      orderBy,
      limit,
    });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
}

// ===== Endpoint 2: one listing by id =====
async function getListingById(req, res) {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "id must be a number" });
  }

  try {

    const listing = await listingsDal.getListingById(Number(id));

    if (!listing) {
      return res.status(404).json({ error: `Listing ${id} not found` });
    }

    listing.hostIsSuperhost = listing.hostIsSuperhost === "t";

    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
}

module.exports = { getListings, getListingById };