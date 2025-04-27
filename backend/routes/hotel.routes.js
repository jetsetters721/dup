import express from 'express';
import { listHotels, searchHotels, getDestinations } from '../controllers/hotel.controller.js';
import axios from 'axios';
const router = express.Router();

// Get list of destinations
router.get('/destinations', getDestinations);

// List hotels in a city
router.get('/list', listHotels);

// Search hotels with availability (support both GET and POST)
router.post('/search', searchHotels);
router.get('/search', searchHotels);

const getAccessToken = async () => {
  try {
    const response = await axios.post(
      'https://test.api.amadeus.com/v1/security/oauth2/token',
      new URLSearchParams({ grant_type: 'client_credentials' }).toString(), // form body
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: 'YuGXhM4V1ZXx1K1tpRNDYSa1VCQAGGZf',    // Make sure this is set in your .env
          password: 'nw6Gz0x0NusJ9uu3'   // Make sure this is set in your .env
        }
      }
    );

    console.log('Access Token:', response.data.access_token);
    return response.data.access_token;

  } catch (error) {
    console.error('Failed to get access token:', error.response?.data || error.message);
    throw new Error('Could not generate access token');
  }
};
// Get hotel offer by ID
router.get('/offers/:offerId', async (req, res) => {

  const token = await getAccessToken();
  const { offerId } = req.params;
  const { lang } = req.query;

  try {
    console.log('Fetching hotel offer pricing for ID:', offerId);

    const response = await axios.get(`https://test.api.amadeus.com/v3/shopping/hotel-offers/${offerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.amadeus+json'
      },
      params: {
        lang: lang || 'en'
      }
    });
    console.log(response.data)
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Amadeus hotel offer error:', error?.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
