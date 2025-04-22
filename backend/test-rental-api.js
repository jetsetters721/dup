import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

async function testRentalAPI() {
  console.log('Testing Rental API Endpoints...\n');

  // Test 1: Search hotels by city
  console.log('Test 1: Search hotels by city');
  try {
    const response = await axios.get(`${API_BASE_URL}/reference-data/locations/hotels/by-city?city=New York`);
    console.log('Response:', {
      status: response.status,
      success: response.data.success,
      hotelsCount: response.data.hotels?.length || 0
    });
  } catch (error) {
    console.error('Error testing hotel search:', error.response?.data || error.message);
  }

  // Test 2: Get hotel details
  console.log('\nTest 2: Get hotel details');
  try {
    const response = await axios.get(`${API_BASE_URL}/hotels/1`);
    console.log('Response:', {
      status: response.status,
      success: response.data.success,
      hotelId: response.data.hotel?.id
    });
  } catch (error) {
    console.error('Error testing hotel details:', error.response?.data || error.message);
  }

  // Test 3: Get available rooms
  console.log('\nTest 3: Get available rooms');
  try {
    const response = await axios.get(`${API_BASE_URL}/hotels/1/rooms?checkIn=2024-05-01&checkOut=2024-05-05`);
    console.log('Response:', {
      status: response.status,
      success: response.data.success,
      roomsCount: response.data.rooms?.length || 0
    });
  } catch (error) {
    console.error('Error testing available rooms:', error.response?.data || error.message);
  }

  // Test 4: Invalid city search
  console.log('\nTest 4: Invalid city search');
  try {
    const response = await axios.get(`${API_BASE_URL}/reference-data/locations/hotels/by-city`);
    console.log('Response:', {
      status: response.status,
      success: response.data.success,
      message: response.data.message
    });
  } catch (error) {
    console.log('Expected error response:', error.response?.data || error.message);
  }
}

// Run the tests
testRentalAPI()
  .then(() => console.log('\nAll tests completed'))
  .catch(error => console.error('Test suite failed:', error)); 