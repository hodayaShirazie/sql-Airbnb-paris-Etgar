// // DAL for listings - runs the SQL through the pool and returns the rows. No req / res here.
// // Always pass values with .input(...) and use @name in the query.
// //
// // Step 2: getListings({ neighbourhood, roomType, minPrice, maxPrice, orderBy, limit })
// //   SELECT TOP (@limit) ... FROM dbo.Paris_Airbnb_listings WHERE price IS NOT NULL ... ORDER BY ...
// //   Build the fields in SQL: CONCAT (title), UPPER (propertyType), CAST ... AS INT, ROUND (stars)
// //
// // Step 3: getListingById(id)
// //   DATEADD (hostSince), YEAR (hostSinceYear), DATEDIFF + GETDATE (yearsHosting), LEN (aboutLength)
// const { sql, poolPromise } = require("../config/db");

// const CARD_COLUMNS = `
//   CAST(id AS INT)                                  AS id,
//   CONCAT(room_type, ' in ', neighbourhood_cleansed) AS title,
//   UPPER(property_type)                             AS propertyType,
//   room_type                                        AS roomType,
//   neighbourhood_cleansed                           AS neighbourhood,
//   CAST(price AS INT)                               AS pricePerNight,
//   ROUND(review_scores_rating / 20.0, 1)            AS stars,
//   CAST(number_of_reviews AS INT)                   AS reviewsCount,
//   CAST(bedrooms AS INT)                            AS bedrooms,
//   CAST(beds AS INT)                                AS beds,
//   CAST(accommodates AS INT)                        AS accommodates
// `;

// // ===== Endpoint 1: all cards =====
// async function getListings({ neighbourhood, roomType, minPrice, maxPrice, orderBy, limit }) {
//   const pool = await poolPromise;
//   const request = pool.request();

//   let where = "WHERE price IS NOT NULL";

//   if (neighbourhood !== undefined) {
//     where += " AND neighbourhood_cleansed = @neighbourhood";
//     request.input("neighbourhood", sql.NVarChar, neighbourhood);
//   }
//   if (roomType !== undefined) {
//     where += " AND room_type = @roomType";
//     request.input("roomType", sql.NVarChar, roomType);
//   }
//   if (minPrice !== undefined) {
//     where += " AND price >= @minPrice";
//     request.input("minPrice", sql.Float, minPrice);
//   }
//   if (maxPrice !== undefined) {
//     where += " AND price <= @maxPrice";
//     request.input("maxPrice", sql.Float, maxPrice);
//   }

//   request.input("limit", sql.Int, limit);

//   const result = await request.query(`
//     SELECT TOP (@limit) ${CARD_COLUMNS}
//     FROM dbo.Paris_Airbnb_listings
//     ${where}
//     ORDER BY ${orderBy}
//   `);

//   return result.recordset;
// }

// // ===== Endpoint 2: one listing by id =====
// async function getListingById(id) {
//   const pool = await poolPromise;

//   const result = await pool
//     .request()
//     .input("id", sql.Float, id)
//     .query(`
//       SELECT ${CARD_COLUMNS},
//         CAST(bathrooms AS INT)                                  AS bathrooms,
//         latitude,
//         longitude,
//         CAST(host_id AS INT)                                    AS hostId,
//         host_name                                               AS hostName,
//         host_is_superhost                                       AS hostIsSuperhost,
//         DATEADD(day, host_since - 2, '1900-01-01')              AS hostSince,
//         YEAR(DATEADD(day, host_since - 2, '1900-01-01'))        AS hostSinceYear,
//         DATEDIFF(year, DATEADD(day, host_since - 2, '1900-01-01'), GETDATE()) AS yearsHosting,
//         host_about                                              AS hostAbout,
//         CAST(LEN(host_about) AS INT)                            AS aboutLength
//       FROM dbo.Paris_Airbnb_listings
//       WHERE id = @id
//     `);

//   return result.recordset[0];
// }

// module.exports = { getListings, getListingById, CARD_COLUMNS };




// DAL for listings - runs the SQL through the pool and returns the rows. No req / res here.
// Always pass values with .input(...) and use @name in the query.
//
// Step 2: getListings({ neighbourhood, roomType, minPrice, maxPrice, orderBy, limit })
//   SELECT TOP (@limit) ... FROM dbo.Paris_Airbnb_listings WHERE price IS NOT NULL ... ORDER BY ...
//   Build the fields in SQL: CONCAT (title), UPPER (propertyType), CAST ... AS INT, ROUND (stars)
//
// Step 3: getListingById(id)
//   DATEADD (hostSince), YEAR (hostSinceYear), DATEDIFF + GETDATE (yearsHosting), LEN (aboutLength)
const { sql, poolPromise } = require("../config/db");

const CARD_COLUMNS = `
  CAST(id AS INT)                                  AS id,
  CONCAT(room_type, ' in ', neighbourhood_cleansed) AS title,
  UPPER(property_type)                             AS propertyType,
  room_type                                        AS roomType,
  neighbourhood_cleansed                           AS neighbourhood,
  CAST(price AS INT)                               AS pricePerNight,
  ROUND(review_scores_rating / 20.0, 1)            AS stars,
  CAST(number_of_reviews AS INT)                   AS reviewsCount,
  CAST(bedrooms AS INT)                            AS bedrooms,
  CAST(beds AS INT)                                AS beds,
  CAST(accommodates AS INT)                        AS accommodates
`;

// ===== Endpoint 1: all cards =====
// BONUS: הוספנו את minRating לפרמטרים
async function getListings({ neighbourhood, roomType, minPrice, maxPrice, minRating, orderBy, limit }) {
  const pool = await poolPromise;
  const request = pool.request();

  let where = "WHERE price IS NOT NULL";

  if (neighbourhood !== undefined) {
    where += " AND neighbourhood_cleansed = @neighbourhood";
    request.input("neighbourhood", sql.NVarChar, neighbourhood);
  }
  if (roomType !== undefined) {
    where += " AND room_type = @roomType";
    request.input("roomType", sql.NVarChar, roomType);
  }
  if (minPrice !== undefined) {
    where += " AND price >= @minPrice";
    request.input("minPrice", sql.Float, minPrice);
  }
  if (maxPrice !== undefined) {
    where += " AND price <= @maxPrice";
    request.input("maxPrice", sql.Float, maxPrice);
  }
  
  // BONUS: handle minRating filter - the database stores 0-100, so we check if the rating divided by 20 is greater than or equal to the requested stars
  if (minRating !== undefined) {
    // Convert minRating to a number and ensure it's valid before adding to the query
    where += " AND (review_scores_rating / 20.0) >= @minRating";
    request.input("minRating", sql.Float, minRating);
  }

  request.input("limit", sql.Int, limit);

  const result = await request.query(`
    SELECT TOP (@limit) ${CARD_COLUMNS}
    FROM dbo.Paris_Airbnb_listings
    ${where}
    ORDER BY ${orderBy}
  `);

  return result.recordset;
}

// ===== Endpoint 2: one listing by id =====
async function getListingById(id) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input("id", sql.Float, id)
    .query(`
      SELECT ${CARD_COLUMNS},
        CAST(bathrooms AS INT)                                  AS bathrooms,
        latitude,
        longitude,
        CAST(host_id AS INT)                                    AS hostId,
        host_name                                               AS hostName,
        host_is_superhost                                       AS hostIsSuperhost,
        DATEADD(day, host_since - 2, '1900-01-01')              AS hostSince,
        YEAR(DATEADD(day, host_since - 2, '1900-01-01'))        AS hostSinceYear,
        DATEDIFF(year, DATEADD(day, host_since - 2, '1900-01-01'), GETDATE()) AS yearsHosting,
        host_about                                              AS hostAbout,
        CAST(LEN(host_about) AS INT)                            AS aboutLength,
        amenities,                                              -- BONUS 1: שולפים את עמודת המתקנים כדי לעבד ב-controller
        CONCAT(LTRIM(STR(host_response_rate)), '%')             AS hostResponseRate -- BONUS 3: מחזירים אחוז מענה כטקסט עם %
      FROM dbo.Paris_Airbnb_listings
      WHERE id = @id
    `);

  return result.recordset[0];
}

module.exports = { getListings, getListingById, CARD_COLUMNS };