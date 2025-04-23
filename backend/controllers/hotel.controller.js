import hotelService from '../services/hotel.service.js';

export const listHotels = async (req, res) => {
  try {
    const { cityCode } = req.query;
    
    if (!cityCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'City code is required' 
      });
    }

    const hotels = await hotelService.getHotelsByCity(cityCode);
    
    res.json({
      success: true,
      data: hotels
    });
  } catch (error) {
    console.error('Error in listHotels controller:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Error listing hotels',
      error: error.message
    });
  }
};

export const getDestinations = async (req, res) => {
  try {
    const destinations = await hotelService.getDestinations();
    res.json({
      success: true,
      data: destinations
    });
  } catch (error) {
    console.error('Error getting destinations:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting destinations',
      error: error.message
    });
  }
};

export const searchHotels = async (req, res) => {
  try {
    console.log(' ' + new Date().toISOString() + ' - ' + req.method + ' ' + req.url);
    console.log(' Headers:', JSON.stringify(req.get('Content-Type')));
    console.log(' Body:', JSON.stringify(req.body));

    // Handle both GET and POST requests
    const params = req.method === 'POST' ? req.body : req.query;
    const { destination, dates, travelers, cityCode, checkInDate, checkOutDate, adults } = params;

    // Get the search parameters, preferring the POST body format
    const searchParams = {
      cityCode: cityCode || destination,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      adults: parseInt(adults || travelers) || 2
    };

    // If dates string is provided (from POST), parse it
    if (dates && dates !== 'Select dates') {
      const [start, end] = dates.split(' - ');
      if (start && end) {
        searchParams.checkInDate = start;
        searchParams.checkOutDate = end;
      }
    }

    // Validate required parameters
    if (!searchParams.cityCode) {
      return res.status(400).json({
        success: false,
        message: 'Destination city code is required'
      });
    }

    const hotels = await hotelService.searchHotels(searchParams);
    
    res.json({
      success: true,
      data: hotels
    });
  } catch (error) {
    console.error('Error in searchHotels:', error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.message || 'Error searching hotels'
    });
  }
};

export const getHotelDetails = async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    if (!hotelId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Hotel ID is required' 
      });
    }

    const hotelDetails = await hotelService.getHotelDetails(hotelId);
    
    res.json({
      success: true,
      data: hotelDetails
    });
  } catch (error) {
    console.error('Error in getHotelDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting hotel details',
      error: error.message
    });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkInDate, checkOutDate, adults } = req.query;
    
    if (!hotelId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Hotel ID, check-in date, and check-out date are required' 
      });
    }

    const availability = await hotelService.checkAvailability(
      hotelId,
      checkInDate,
      checkOutDate,
      parseInt(adults) || 1
    );
    
    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Error in checkAvailability:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking hotel availability',
      error: error.message
    });
  }
};

export const bookHotel = async (req, res) => {
  try {
    const { offerId, guests, payments } = req.body;
    
    if (!offerId || !guests || !payments) {
      return res.status(400).json({ 
        success: false, 
        message: 'Offer ID, guests, and payment information are required' 
      });
    }

    const booking = await hotelService.bookHotel(
      req.params.hotelId,
      offerId,
      guests,
      payments
    );
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error in bookHotel:', error);
    res.status(500).json({
      success: false,
      message: 'Error booking hotel',
      error: error.message
    });
  }
}; 