
const express = require("express");
const hostsController = require("../controllers/hosts.controller");

const router = express.Router();

router.get("/:hostId/listings", hostsController.getListingsByHost);

module.exports = router;