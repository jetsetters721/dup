import express from 'express';
import { listHotels, searchHotels, getDestinations } from '../controllers/hotel.controller.js';
import axios from 'axios';
import dayjs from 'dayjs';

const router = express.Router();
// console.log('coming to this page')
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
          username: 'a9Gz1aJ5Noo7sOvTb11TJ8bwF3jyaAjX',    // Make sure this is set in your .env
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
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // add 1 because months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
// Get hotel offer by ID
router.get('/check-availability', async (req, res) => {
  const token = await getAccessToken();
  const { destination, checkInDate, checkOutDate, travelers, lang } = req.query;
 
  const checkInDate1 = formatDate(checkInDate);
  const checkOutDate1 =  formatDate(checkOutDate);

  try {
    // console.log('Fetching hotel offer pricing for ID:', req);

    const response = await axios.get(`https://test.api.amadeus.com/v3/shopping/hotel-offers`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.amadeus+json'
      },
      params: {
        hotelIds: destination,     // using destination from frontend as hotelId
        checkInDate: checkInDate1,
        checkOutDate: checkOutDate1,
        adults: travelers,
        lang: lang || 'en',
        roomQuantity: 1,
        currency: 'USD'
      }
    });
    console.log(response.data)
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Amadeus hotel offer error:', error?.response?.data || error.message);
    const amadeusErrorMessage = error?.response?.data?.errors?.[0]?.detail
    res.status(error?.response?.status || 500).json({
      success: false,
      message: amadeusErrorMessage
    });
  }
});

export default router;
