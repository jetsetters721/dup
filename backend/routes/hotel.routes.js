import express from 'express';
import { listHotels, searchHotels, getDestinations } from '../controllers/hotel.controller.js';

const router = express.Router();

// Get list of destinations
router.get('/destinations', getDestinations);

// List hotels in a city
router.get('/list', listHotels);

// Search hotels with availability (support both GET and POST)
router.post('/search', searchHotels);
router.get('/search', searchHotels);

// Get hotel offer by ID
router.get('/offers/:offerId', async (req, res) => {
  try {
    console.log('Received hotel offer request for ID:', req.params.offerId);
    const offer = await hotelService.getHotelOfferById(req.params.offerId);
    res.json({ success: true, data: offer });
  } catch (error) {
    console.error('Hotel offer error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
