import express from 'express';
import { getHotelsByCity, getHotelDetails, getAvailableRooms } from '../controllers/rentalsController.js';

const router = express.Router();

// Get hotels by city
router.get('/reference-data/locations/hotels/by-city', getHotelsByCity);

// Get hotel details by ID
router.get('/hotels/:id', getHotelDetails);

// Get available rooms for a hotel
router.get('/hotels/:id/rooms', getAvailableRooms);

export default router; 