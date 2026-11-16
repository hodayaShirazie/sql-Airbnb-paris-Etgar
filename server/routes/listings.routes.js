
const express = require("express");
const listingsController = require("../controllers/listings.controller");

const router = express.Router();

router.get("/", listingsController.getListings);
router.get("/:id", listingsController.getListingById);

module.exports = router;