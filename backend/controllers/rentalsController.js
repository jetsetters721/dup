import axios from 'axios';
import supabase from '../config/supabase.js';

// Get hotels by city
const getHotelsByCity = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City parameter is required'
      });
    }

    // Query hotels from Supabase
    const { data: hotels, error } = await supabase
      .from('hotels')
      .select('*')
      .ilike('city', `%${city}%`);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching hotels from database'
      });
    }

    if (!hotels || hotels.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hotels found in this city'
      });
    }

    res.status(200).json({
      success: true,
      hotels: hotels
    });

  } catch (error) {
    console.error('Error in getHotelsByCity:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get hotel details by ID
const getHotelDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Hotel ID is required'
      });
    }

    // Query hotel details from Supabase
    const { data: hotel, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching hotel details'
      });
    }

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.status(200).json({
      success: true,
      hotel: hotel
    });

  } catch (error) {
    console.error('Error in getHotelDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get available rooms for a hotel
const getAvailableRooms = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut } = req.query;

    if (!hotelId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Hotel ID, check-in and check-out dates are required'
      });
    }

    // Query available rooms from Supabase
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('hotel_id', hotelId)
      .not('booked_dates', 'cs', `{${checkIn},${checkOut}}`);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching available rooms'
      });
    }

    res.status(200).json({
      success: true,
      rooms: rooms
    });

  } catch (error) {
    console.error('Error in getAvailableRooms:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export {
  getHotelsByCity,
  getHotelDetails,
  getAvailableRooms
}; 