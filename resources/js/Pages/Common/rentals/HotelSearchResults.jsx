import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, MapPin, Wifi, Coffee, Tv, Users, Heart, ArrowLeft } from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import axios from 'axios';

export default function HotelSearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState(location.state?.searchParams || {});
  const [searchResults, setSearchResults] = useState(location.state?.searchResults || []);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [sortBy, setSortBy] = useState('recommended');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState({});

  // Fetch search results if not available in location state
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchResults.length && searchParams.cityCode) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axios.get('http://localhost:5001/api/hotels/search', {
            params: {
              destination: searchParams.cityCode,
              checkInDate: searchParams.checkInDate,
              checkOutDate: searchParams.checkOutDate,
              travelers: searchParams.adults
            }
          });

          if (response.data.success) {
            // Access the nested data array
            const hotelsData = response.data.data?.data || [];
            console.log('Raw Hotels Data:', hotelsData);
            
            const formattedResults = hotelsData.map(hotel => {
              // Default price
              let hotelPrice = '150'; // Set a default price since the API doesn't provide prices

              console.log('Processing hotel:', {
                name: hotel.name,
                hotelId: hotel.hotelId,
                chainCode: hotel.chainCode,
                finalPrice: hotelPrice
              });

              return {
                id: hotel.hotelId || Math.random().toString(36).substr(2, 9),
                name: hotel.name || 'Hotel Name Not Available',
                location: hotel.address?.cityName || `${hotel.address?.countryCode || 'US'}`,
                price: hotelPrice,
                rating: hotel.rating || ((Math.random() * 2 + 3).toFixed(1)), // Random rating between 3.0 and 5.0
                image: hotel.media?.images?.[0]?.uri || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
                amenities: hotel.amenities || ['WiFi', 'Room Service', 'Restaurant']
              };
            });
            
            console.log('Formatted Results with Prices:', formattedResults);
            setSearchResults(formattedResults);
            setFilteredHotels(formattedResults);
          } else {
            setError(response.data.message || "No hotels found");
          }
        } catch (error) {
          console.error('Error fetching hotels:', error);
          setError(error.response?.data?.message || "Error fetching hotels");
        } finally {
          setIsLoading(false);
        }
      } else {
        setFilteredHotels(searchResults);
      }
    };

    fetchSearchResults();
  }, [searchParams, searchResults]);

  // Format price for display
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return isNaN(numPrice) ? '$0' : `$${numPrice.toFixed(2)}`;
  };

  // Filter and sort hotels
  useEffect(() => {
    if (!searchResults.length) return;

    let filtered = [...searchResults];

    // Apply price filter
    filtered = filtered.filter(hotel => {
      const price = parseFloat(hotel.price);
      return !isNaN(price) && price >= priceRange[0] && price <= priceRange[1];
    });

    // Apply amenities filter
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(hotel =>
        selectedAmenities.every(amenity =>
          hotel.amenities.includes(amenity)
        )
      );
    }

    // Apply rating filter
    if (selectedRating > 0) {
      filtered = filtered.filter(hotel =>
        parseFloat(hotel.rating) >= selectedRating
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      default:
        // Keep original order for 'recommended'
        break;
    }

    setFilteredHotels(filtered);
  }, [searchResults, sortBy, priceRange, selectedAmenities, selectedRating]);

  const toggleFavorite = (hotelId) => {
    setFavorites(prev => ({
      ...prev,
      [hotelId]: !prev[hotelId]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Return to Search
        </button>
      </div>
    );
  }

  if (!filteredHotels.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-gray-500 text-xl mb-4">No hotels found matching your criteria</div>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Modify Search
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Search Summary */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Hotels in {searchParams.cityCode}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(searchParams.checkInDate)} - {formatDate(searchParams.checkOutDate)} · {searchParams.adults} {searchParams.adults === 1 ? 'guest' : 'guests'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              <select
                value={`${priceRange[0]}-${priceRange[1]}`}
                onChange={(e) => {
                  const [min, max] = e.target.value.split('-').map(Number);
                  setPriceRange([min, max]);
                }}
                className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              >
                <option value="0-1000">All Prices</option>
                <option value="0-100">Under $100</option>
                <option value="100-200">$100 - $200</option>
                <option value="200-300">$200 - $300</option>
                <option value="300-500">$300 - $500</option>
                <option value="500-1000">$500+</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {filteredHotels.map((hotel) => (
            <div key={hotel.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Hotel Image */}
              <div className="relative h-48">
                <img
                  src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => toggleFavorite(hotel.id)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                >
                  <Heart
                    className={`h-5 w-5 ${favorites[hotel.id] ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                  />
                </button>
              </div>

              {/* Hotel Info */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                      <p className="text-sm text-gray-600">{hotel.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-sm font-medium text-gray-900">{hotel.rating}</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {hotel.amenities?.map((amenity, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Price and Book Button */}
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(hotel.price)}</p>
                    <p className="text-sm text-gray-600">per night</p>
                  </div>
                  <button
                    onClick={() => navigate(`/hotel/${hotel.id}`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredHotels.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No hotels found matching your criteria</h3>
            <p className="mt-2 text-gray-600">Try adjusting your filters or search for a different location.</p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
} 