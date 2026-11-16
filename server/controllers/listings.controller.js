
const listingsDal = require("../dal/listings.dal");

function isValidPrice(value) {
  if (value.trim() === "") return false;
  const n = Number(value);
  return !isNaN(n) && n >= 0;
}

// ===== Endpoint 1: all cards =====
async function getListings(req, res) {
  const { neighbourhood, roomType, minPrice, maxPrice, minRating } = req.query; // BONUS: הוספנו minRating
  const sort = req.query.sort ?? "price";

  let orderBy;
  if (sort === "price") {
    orderBy = "price ASC, id ASC"; 
  } else if (sort === "rating") {
    orderBy = "review_scores_rating DESC, id ASC";
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

  // BONUS: minRating validation - must be a number between 0 and 5
  if (minRating !== undefined) {
    const ratingNum = Number(minRating);
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      return res.status(400).json({ error: "minRating must be a number between 0 and 5" });
    }
  }

  try {
    const rows = await listingsDal.getListings({
      neighbourhood,
      roomType,
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      minRating: minRating !== undefined ? Number(minRating) : undefined, 
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

    // BONUS 1: עיבוד המתקנים (amenities) למערך נקי
    if (listing.amenities && typeof listing.amenities === "string") {
      listing.amenities = listing.amenities
        .replace(/^{|}$/g, "") // remove the curly braces at the start and end
        .split(",") // split into an array by commas
        .map(item => item.replace(/"/g, "").trim()) // remove all quotation marks and trim whitespace
        .filter(item => item.length > 0); // ensure no empty items are included
    } else {
      listing.amenities = [];
    }

    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
}

module.exports = { getListings, getListingById };