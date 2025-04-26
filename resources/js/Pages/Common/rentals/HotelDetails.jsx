import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Star, MapPin, Check, ChevronLeft, Heart, Share, Calendar, 
  Users, X, ChevronRight, ChevronDown, ThumbsUp, MessageCircle, 
  Award, Camera, Coffee, ArrowRight, Bookmark, Phone, Mail, Facebook, Twitter, Instagram,
  Clock, Wifi, Tv, Shield, Utensils, Car, Sunset, Sparkles, Info, Plus, Minus, Search
} from "lucide-react";
import axios from 'axios';
import Navbar from "../Navbar";
import Footer from "../Footer";
import "./styles.css";
import rentalsCallbackService from "../../../services/rentalsCallbackService";
import { FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaStar, FaArrowRight, FaChevronRight, FaAngleDown, FaUsers } from 'react-icons/fa';


// API base URL
const API_BASE_URL = 'http://localhost:5001/api';

export default function HotelDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get hotel data from navigation state
  const hotelId = location.state?.hotelId;
  const searchParams = location.state?.searchParams;
  
  // State management
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(0);
  const [guestCount, setGuestCount] = useState({ adults: 2, children: 1 });
  const [showReviews, setShowReviews] = useState(false);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [activeDateInput, setActiveDateInput] = useState(null);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [showCallbackRequest, setShowCallbackRequest] = useState(false);
  const [callbackForm, setCallbackForm] = useState({
    name: "",
    phone: "",
    preferredTime: "morning",
    message: ""
  });
  const [callbackSubmitted, setCallbackSubmitted] = useState(false);
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAmenityDetails, setShowAmenityDetails] = useState(null);
  const [isPromoActive, setIsPromoActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [searchValues, setSearchValues] = useState({
    location: '',
    date: '',
    guests: '',
    price: ''
  });
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [priceRange, setPriceRange] = useState('Any Price');
  const [displayedMonth, setDisplayedMonth] = useState(new Date().getMonth()); 
  const [displayedYear, setDisplayedYear] = useState(new Date().getFullYear());
  const [roomTypes, setRoomTypes] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Refs
  const datepickerRef = useRef(null);
  const overviewRef = useRef(null);
  const roomsRef = useRef(null);
  const amenitiesRef = useRef(null);
  const locationRef = useRef(null);
  const reviewsRef = useRef(null);
  const searchRef = useRef(null);

  // Fetch hotel details when component mounts
  useEffect(() => {


    const hotels = location.state.hotelData;
    
    console.error(hotels,'kkkkkkkkkkkkkkkkkkkkk')
    const fetchHotelDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!hotelId) {
          throw new Error('Hotel ID not provided');
        }
        
        const [hotelResponse, roomsResponse, reviewsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/hotels/${hotelId}`),
          axios.get(`${API_BASE_URL}/hotels/${hotelId}/rooms`),
          axios.get(`${API_BASE_URL}/hotels/${hotelId}/reviews`)
        ]);

        if (hotelResponse.data.success) {
          setHotel(hotelResponse.data.data);
        } else {
          throw new Error(hotelResponse.data.message || 'Failed to fetch hotel details');
        }

        if (roomsResponse.data.success) {
          setRoomTypes(roomsResponse.data.data);
        }

        if (reviewsResponse.data.success) {
          setReviews(reviewsResponse.data.data);
        }

        // Check initial availability
        await checkAvailability();
      } catch (err) {
        setError(err.message || 'Failed to load hotel details');
        console.error('Error fetching hotel details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetails();
  }, [hotelId]);

  // Check hotel availability when dates or guests change
  const checkAvailability = async () => {
    if (!hotelId || !checkInDate || !checkOutDate) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/hotels/${hotelId}/availability`, {
        params: {
          checkInDate: checkInDate.toISOString().split('T')[0],
          checkOutDate: checkOutDate.toISOString().split('T')[0],
          adults: guestCount.adults,
          children: guestCount.children
        }
      });

      if (response.data.success) {
        setAvailability(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to check availability');
      }
    } catch (err) {
      console.error('Error checking availability:', err);
      setError(err.message || 'Failed to check availability');
    } finally {
      setLoading(false);
    }
  };

  // Handle booking submission
  const handleBookNow = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/hotels/${hotelId}/book`, {
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
        guests: guestCount,
        roomType: roomTypes[selectedRoom]?.name,
        payment: {
          method: 'creditCard',
          cardNumber: '4111111111111111',
          expiryDate: '12/25',
          cvv: '123'
        }
      });

      if (response.data.success) {
        setBookingStatus(response.data.data);
        setShowBookingConfirmation(true);
      } else {
        throw new Error(response.data.message || 'Booking failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to complete booking');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle callback request submission
  const handleCallbackSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_BASE_URL}/hotels/${hotelId}/callback`, {
        ...callbackForm,
        hotelId,
        checkInDate: checkInDate.toISOString().split('T')[0],
        checkOutDate: checkOutDate.toISOString().split('T')[0],
        guests: guestCount
      });

      if (response.data.success) {
        setCallbackSubmitted(true);
        setTimeout(() => {
          setShowCallbackRequest(false);
          setShowBookingConfirmation(true);
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Callback request failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit callback request');
      console.error('Callback error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle date changes
  const handleDateChange = (date, type) => {
    if (type === 'checkin') {
      setCheckInDate(date);
      // Ensure check-out date is after check-in date
      if (checkOutDate <= date) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOutDate(nextDay);
      }
    } else {
      setCheckOutDate(date);
    }
    setShowDatePicker(false);
    checkAvailability();
  };

  // Handle guest count changes
  const handleGuestChange = (type, action) => {
    setGuestCount(prev => {
      const newCount = { ...prev };
      if (action === 'increment') {
        newCount[type] = type === 'adults' ? Math.min(prev[type] + 1, 10) : Math.min(prev[type] + 1, 5);
      } else {
        newCount[type] = type === 'adults' ? Math.max(prev[type] - 1, 1) : Math.max(prev[type] - 1, 0);
      }
      return newCount;
    });
    checkAvailability();
  };

  // Handle room selection
  const handleRoomSelect = (roomId) => {
    setSelectedRoom(roomId);
  };

  // Handle favorite toggle
  const toggleFavorite = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/hotels/${hotelId}/favorite`, {
        isFavorite: !isFavorite
      });

      if (response.data.success) {
        setIsFavorite(!isFavorite);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/hotels/${hotelId}/share`);
      if (response.data.success) {
        // Handle share success (e.g., show success message)
        alert('Share link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Handle virtual tour
  const toggleVirtualTour = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/hotels/${hotelId}/virtual-tour`);
      if (response.data.success) {
        setShowVirtualTour(!showVirtualTour);
      }
    } catch (err) {
      console.error('Error loading virtual tour:', err);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (searchParams) {
      navigate("/rentals/search", { state: { searchParams } });
    } else {
      navigate("/rentals");
    }
  };

  // Loading state
  if (loading && !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error && !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Hotel</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors"
          >
            Back to Rentals
          </button>
        </div>
      </div>
    );
  }

  // Calculate total price
  const totalNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  const roomPrice = roomTypes[selectedRoom]?.price || 0;
  const totalPrice = (roomPrice * totalNights) + 50 + 30; // Room price + cleaning fee + service fee

  // ... rest of your existing JSX code ...

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pb-16 pt-16">
        {/* Back to Rental Section */}
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FaArrowRight className="transform rotate-180 mr-2" />
            Back to Rental
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Location Search */}
              <div className="relative">
                <div className="flex items-center border rounded-lg p-2">
                  <MapPin className="text-gray-400 mr-2" size={20} />
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    className="w-full outline-none"
                    value={searchValues.location}
                    onChange={(e) => setSearchValues(prev => ({ ...prev, location: e.target.value }))}
                    onFocus={() => handleFocus('location')}
                    onBlur={handleBlur}
                  />
                </div>
                {activeField === 'location' && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search destinations..."
                        className="w-full p-2 border rounded"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredDestinations.map((destination, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleQuickSelect(destination, 'location')}
                        >
                          {destination}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Date Picker */}
              <div className="relative">
                <div className="flex items-center border rounded-lg p-2">
                  <Calendar className="text-gray-400 mr-2" size={20} />
                  <input
                    type="text"
                    placeholder="Check-in - Check-out"
                    className="w-full outline-none"
                    value={searchValues.date}
                    onChange={(e) => setSearchValues(prev => ({ ...prev, date: e.target.value }))}
                    onFocus={() => handleFocus('date')}
                    onBlur={handleBlur}
                  />
                </div>
                {activeField === 'date' && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-4">
                    <div className="flex justify-between mb-4">
                      <button onClick={() => setDisplayedMonth(prev => prev - 1)}>Previous</button>
                      <span>{availableMonths[displayedMonth]} {displayedYear}</span>
                      <button onClick={() => setDisplayedMonth(prev => prev + 1)}>Next</button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {/* Calendar days will be generated here */}
                    </div>
                  </div>
                )}
              </div>

              {/* Guests */}
              <div className="relative">
                <div className="flex items-center border rounded-lg p-2">
                  <FaUsers className="text-gray-400 mr-2" size={20} />
                  <input
                    type="text"
                    placeholder="Guests"
                    className="w-full outline-none"
                    value={searchValues.guests}
                    onChange={(e) => setSearchValues(prev => ({ ...prev, guests: e.target.value }))}
                    onFocus={() => handleFocus('guests')}
                    onBlur={handleBlur}
                  />
                </div>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="bg-blue-600 text-white rounded-lg p-2 flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <FaSearch className="mr-2" />
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-6xl mx-auto px-4 mt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
              <div className="flex items-center text-gray-600 mb-1">
                <MapPin size={16} className="mr-1" />
                <span>{hotel.location}</span>
              </div>
              <div className="flex items-center">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1 text-gray-700 font-medium">{hotel.rating}</span>
                  <span className="ml-1 text-gray-500">({hotel.reviewCount} reviews)</span>
                  <button 
                    onClick={toggleReviews}
                    className="ml-2 text-blue-600 text-sm hover:underline"
                  >
                    See reviews
                  </button>
                </div>
              </div>
              {/* Add Book Now Button */}
              <button
                onClick={handleReserveNow}
                className="mt-4 bg-[#0061ff] hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors flex items-center gap-2"
              >
                Book Now
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={toggleFavorite}
                className="p-2 rounded-full border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-red-500 transition-colors"
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart size={20} className={isFavorite ? "text-red-500 fill-red-500" : ""} />
              </button>
              <button 
                onClick={handleShare}
                className="p-2 rounded-full border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Share size={20} />
              </button>
            </div>
          </div>

          {/* Photo gallery - clickable */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className="rounded-lg overflow-hidden h-[300px] md:h-[400px] cursor-pointer relative group"
                onClick={() => {setShowGalleryModal(true); setActiveImage(0);}}
              >
                <img 
                  src={hotel.images.main} 
                  alt={hotel.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/80 backdrop-blur-sm rounded-full p-2">
                    <Camera className="h-6 w-6 text-gray-800" />
                  </div>
                </div>
                
                {/* Featured badge */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-full text-xs z-10 font-medium shadow-lg flex items-center">
                  <Sparkles className="h-3 w-3 mr-1 text-yellow-300" />
                  <span>Featured</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {hotel.images.gallery.map((image, index) => (
                  <div 
                    key={index} 
                    className="rounded-lg overflow-hidden h-[140px] md:h-[192px] cursor-pointer relative group"
                    onClick={() => {setShowGalleryModal(true); setActiveImage(index + 1);}}
                  >
                    <img 
                      src={image} 
                      alt={`${hotel.name} ${index + 1}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <button 
                className="text-blue-600 flex items-center hover:underline"
                onClick={() => setShowGalleryModal(true)}
              >
                <Camera className="h-5 w-5 mr-1" />
                View all photos ({1 + hotel.images.gallery.length})
              </button>
              
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
                onClick={toggleVirtualTour}
              >
                <Sunset className="h-5 w-5 mr-2" />
                Virtual Tour
              </button>
            </div>
          </div>

          {/* Main details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="mb-8" ref={overviewRef}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Award className="mr-2 text-blue-600 h-6 w-6" />
                  About this hotel
                </h2>
                <p className="text-gray-600 mb-4">{hotel.description}</p>
                <p className="text-gray-600">{hotel.longDescription}</p>
              </div>

              {/* Room selection section */}
              <div className="mb-8" ref={roomsRef}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="mr-2 text-blue-600 h-6 w-6" />
                  Select your room
                </h2>
                <div className="space-y-4">
                  {roomTypes.map((room) => (
                    <div 
                      key={room.id}
                      className={`border ${selectedRoom === room.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} rounded-lg p-4 hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:shadow-lg`}
                      onClick={() => handleRoomSelect(room.id)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{room.name}</h3>
                          <p className="text-sm text-gray-600">Up to {room.capacity} guests</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${room.price}</p>
                          <p className="text-sm text-gray-600">per night</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="grid grid-cols-2 gap-2">
                          {room.features.map((feature, i) => (
                            <div key={i} className="flex items-center text-gray-700">
                              <Check size={16} className="text-green-500 mr-1 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8" ref={amenitiesRef}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Coffee className="mr-2 text-blue-600 h-6 w-6" />
                  What this place offers
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {enhancedAmenities.map((amenity, index) => (
                    <div 
                      key={index} 
                      className="flex items-center text-gray-700 p-2 hover:bg-blue-50 rounded-md transition-colors amenity-details"
                      onClick={() => handleAmenityClick(index)}
                    >
                      <div className="mr-2">{amenity.icon}</div>
                      <div>
                        <p className="font-medium">{amenity.name}</p>
                        <p className="text-sm text-gray-600">{amenity.description}</p>
                      </div>
                      {showAmenityDetails === index && (
                        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                          <p className="font-medium">{amenity.name}</p>
                          <p className="text-sm text-gray-600">{amenity.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8" ref={locationRef}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="mr-2 text-blue-600 h-6 w-6" />
                  Location
                </h2>
                <p className="text-gray-600 mb-4">{hotel.address || hotel.location}</p>
                <div className="bg-gray-200 rounded-lg h-[300px] flex items-center justify-center relative overflow-hidden group">
                  <img 
                    src="https://maps.googleapis.com/maps/api/staticmap?center=Jammu+Kashmir&zoom=12&size=800x300&maptype=roadmap&markers=color:red%7C33.7782,76.5762&key=YOUR_API_KEY" 
                    alt="Map location" 
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg transform transition-transform group-hover:scale-105">
                      <p className="text-gray-800 font-medium">Interactive map will be displayed here</p>
                      <p className="text-gray-600 text-sm">Exact location provided after booking</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews section */}
              <div className="mb-8" ref={reviewsRef}>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Guest Reviews</h2>
                  <button 
                    onClick={toggleReviews} 
                    className="text-blue-600 flex items-center text-sm hover:underline"
                  >
                    {showReviews ? "Hide reviews" : "Show all reviews"}
                    <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${showReviews ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                <div className="flex items-center mb-6">
                  <div className="bg-blue-600 text-white rounded-lg px-3 py-2 flex items-center mr-4">
                    <span className="text-xl font-bold mr-1">{hotel.rating}</span>
                    <Star className="h-5 w-5 fill-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Excellent</p>
                    <p className="text-sm text-gray-600">Based on {hotel.reviewCount} reviews</p>
                  </div>
                </div>
                
                {showReviews && (
                  <div className="space-y-6">
                    {reviews.map(review => (
                      <div key={review.id} className="border-b border-gray-200 pb-6">
                        <div className="flex items-center mb-3">
                          <img 
                            src={review.avatar} 
                            alt={review.user} 
                            className="w-10 h-10 rounded-full mr-3" 
                          />
                          <div>
                            <p className="font-medium">{review.user}</p>
                            <div className="flex items-center">
                              <div className="flex mr-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                        <div className="flex items-center mt-3 text-sm text-gray-600">
                          <button className="flex items-center mr-4 hover:text-blue-600">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Helpful
                          </button>
                          <button className="flex items-center hover:text-blue-600">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Reply
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors">
                      Show more reviews
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Booking card */}
            <div>
              <div id="booking-card" className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">${roomPrice}</span>
                    <span className="text-gray-600 ml-1">per night</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-gray-700">{hotel.rating}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="border border-gray-200 rounded-t-lg overflow-hidden">
                    <div className="grid grid-cols-2 divide-x divide-gray-200">
                      <div 
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setActiveDateInput('checkin');
                          setShowDatePicker(true);
                          setShowGuestDropdown(false);
                        }}
                      >
                        <p className="text-xs text-gray-500 mb-1">CHECK-IN</p>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{formatDate(checkInDate)}</span>
                        </div>
                      </div>
                      <div 
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setActiveDateInput('checkout');
                          setShowDatePicker(true);
                          setShowGuestDropdown(false);
                        }}
                      >
                        <p className="text-xs text-gray-500 mb-1">CHECK-OUT</p>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{formatDate(checkOutDate)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Date Picker Popup */}
                    {showDatePicker && (
                      <div 
                        ref={datepickerRef}
                        className="absolute left-0 right-0 top-[100px] bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-4 mt-2"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <button 
                            onClick={previousMonth}
                            className="p-1 rounded-full hover:bg-gray-100"
                            type="button"
                          >
                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                          </button>
                          <h3 className="font-medium">{months[displayedMonth]} {displayedYear}</h3>
                          <button 
                            onClick={nextMonth}
                            className="p-1 rounded-full hover:bg-gray-100"
                            type="button"
                          >
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500 mb-2">
                          <div>Su</div>
                          <div>Mo</div>
                          <div>Tu</div>
                          <div>We</div>
                          <div>Th</div>
                          <div>Fr</div>
                          <div>Sa</div>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-1">
                          {generateCalendarDays().map((day, index) => {
                            const date = day !== null ? new Date(displayedYear, displayedMonth, day) : null;
                            const isToday = date && new Date().toDateString() === date.toDateString();
                            const isSelected = 
                              date && 
                              ((activeDateInput === 'checkin' && checkInDate.toDateString() === date.toDateString()) ||
                               (activeDateInput === 'checkout' && checkOutDate.toDateString() === date.toDateString()));
                            const isDisabled = date && (
                              date < new Date().setHours(0, 0, 0, 0) || 
                              (activeDateInput === 'checkout' && date <= checkInDate)
                            );
                            
                            return (
                              <div 
                                key={index}
                                onClick={() => {
                                  if (day !== null && !isDisabled) {
                                    const newDate = new Date(displayedYear, displayedMonth, day);
                                    if (activeDateInput === 'checkin') {
                                      setCheckInDate(newDate);
                                      if (newDate >= checkOutDate) {
                                        // If new check-in date is after current check-out date,
                                        // set check-out to the next day
                                        setCheckOutDate(new Date(newDate.getTime() + 86400000)); 
                                      }
                                      setActiveDateInput('checkout');
                                    } else {
                                      setCheckOutDate(newDate);
                                      setShowDatePicker(false);
                                    }
                                  }
                                }}
                                className={`
                                  h-10 w-full flex items-center justify-center rounded-full text-sm
                                  ${day === null ? 'cursor-default' : isDisabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}
                                  ${isToday ? 'border border-gray-300' : ''}
                                  ${isSelected ? 'bg-[#0061ff] text-white hover:bg-blue-700' : ''}
                                `}
                              >
                                {day}
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-4 flex justify-between">
                          <button 
                            onClick={() => setShowDatePicker(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                            type="button"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => setShowDatePicker(false)}
                            className="px-4 py-2 bg-[#0061ff] text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                            type="button"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div 
                      className="p-4 border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors guest-dropdown relative"
                      onClick={() => setShowGuestDropdown(!showGuestDropdown)}
                    >
                      <label className="block text-xs text-gray-500 mb-1">GUESTS</label>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Users size={16} className="text-gray-400 mr-2" />
                          <span className="text-gray-800">{guestCount.adults} adults, {guestCount.children} child</span>
                        </div>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${showGuestDropdown ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {/* Guest dropdown */}
                      {showGuestDropdown && (
                        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Adults</span>
                              <div className="flex items-center">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGuestChange('adults', 'decrement');
                                  }}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                  disabled={guestCount.adults <= 1}
                                >
                                  -
                                </button>
                                <span className="mx-3 w-4 text-center">{guestCount.adults}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGuestChange('adults', 'increment');
                                  }}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Children</span>
                              <div className="flex items-center">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGuestChange('children', 'decrement');
                                  }}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                  disabled={guestCount.children <= 0}
                                >
                                  -
                                </button>
                                <span className="mx-3 w-4 text-center">{guestCount.children}</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGuestChange('children', 'increment');
                                  }}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowGuestDropdown(false);
                            }}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-700">${roomPrice} x {Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))} nights</span>
                    <span className="text-gray-700">${roomPrice * Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Cleaning fee</span>
                    <span className="text-gray-700">$50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Service fee</span>
                    <span className="text-gray-700">$30</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>

                <button 
                  onClick={handleBookNow}
                  className="w-full bg-[#0061ff] hover:bg-blue-700 text-white py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 group"
                >
                  <span>Reserve Now</span>
                  <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-1" />
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  You won't be charged yet
                </p>
              </div>

              {/* Contact host section */}
              <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3">Contact Host</h4>
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src="https://randomuser.me/api/portraits/men/85.jpg" 
                    alt="Host" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">Rajesh Kumar</p>
                    <p className="text-sm text-gray-600">Response rate: 98%</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <button className="w-full border border-gray-300 rounded-lg py-2 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <Phone size={16} />
                    <span>Call Host</span>
                  </button>
                  <button className="w-full border border-gray-300 rounded-lg py-2 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <Mail size={16} />
                    <span>Message Host</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-screen gallery modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button 
            onClick={() => setShowGalleryModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
          
          <button
            onClick={prevImage}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft size={32} />
          </button>
          
          <div className="max-w-4xl max-h-screen p-4">
            <img 
              src={activeImage === 0 ? hotel.images.main : hotel.images.gallery[activeImage - 1]} 
              alt={`${hotel.name} image ${activeImage + 1}`}
              className="max-h-[80vh] mx-auto"
            />
            <p className="text-white text-center mt-4">
              {activeImage + 1} / {1 + hotel.images.gallery.length}
            </p>
          </div>
          
          <button
            onClick={nextImage}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}

      {/* Virtual tour modal */}
      {showVirtualTour && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button 
            onClick={toggleVirtualTour}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
          <div className="max-w-4xl max-h-screen p-4">
            <iframe 
              src="https://www.youtube.com/embed/VIDEO_ID" 
              title="Virtual Tour" 
              frameBorder="0" 
              allowFullScreen 
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Callback Request Modal */}
      {showCallbackRequest && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scaleIn relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-blue-100 rounded-full opacity-50"></div>
            <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-blue-100 rounded-full opacity-50"></div>
            
            {!callbackSubmitted ? (
              <>
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Phone className="text-blue-600 mr-2 h-5 w-5" />
                    Request a Callback
                  </h3>
                  <button 
                    onClick={() => setShowCallbackRequest(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <p className="text-gray-600 mb-4 relative z-10">
                  Leave your contact details and our representative will call you back to confirm your booking at {hotel.name}.
                </p>
                
                <form onSubmit={handleCallbackSubmit} className="relative z-10">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={callbackForm.name}
                        onChange={handleCallbackFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <div className="relative">
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          value={callbackForm.phone}
                          onChange={handleCallbackFormChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Enter your phone number"
                        />
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-1">Preferred Time for Callback</label>
                      <div className="relative">
                        <select
                          id="preferredTime"
                          name="preferredTime"
                          value={callbackForm.preferredTime}
                          onChange={handleCallbackFormChange}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all"
                        >
                          <option value="morning">Morning (9 AM - 12 PM)</option>
                          <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                          <option value="evening">Evening (5 PM - 8 PM)</option>
                        </select>
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Additional Message (optional)</label>
                      <textarea
                        id="message"
                        name="message"
                        rows="3"
                        value={callbackForm.message}
                        onChange={handleCallbackFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Any special requests or questions"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 shadow-md"
                    >
                      <Phone size={16} />
                      <span>Request Callback</span>
                    </button>
                  </div>
                </form>
                
                <div className="flex items-center justify-center mt-4 space-x-4">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6 opacity-60" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-60" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="American Express" className="h-6 opacity-60" />
                </div>
                
                <p className="text-xs text-gray-500 mt-4 text-center relative z-10">
                  By submitting this form, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                </p>
              </>
            ) : (
              <div className="text-center py-8 relative z-10">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Callback Request Received!</h3>
                <p className="text-gray-600 mb-6">
                  Thank you for your request. Our representative will call you back shortly at the preferred time.
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
                  <Clock size={18} />
                  <span>Processing your booking...</span>
                </div>
                
                <div className="flex justify-center mt-4">
                  <button 
                    onClick={() => {
                      setCallbackSubmitted(false);
                      setShowCallbackRequest(false);
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking confirmation modal */}
      {showBookingConfirmation && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-scaleIn">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600">Your reservation at {hotel.name} has been successfully confirmed.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">CHECK-IN</p>
                  <p className="font-medium">{formatDate(checkInDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">CHECK-OUT</p>
                  <p className="font-medium">{formatDate(checkOutDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">GUESTS</p>
                  <p className="font-medium">{guestCount.adults} adults, {guestCount.children} child</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">ROOM TYPE</p>
                  <p className="font-medium">{roomTypes[selectedRoom]?.name}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowBookingConfirmation(false)}
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowBookingConfirmation(false);
                  navigate("/my-trips");
                }}
                className="flex-1 bg-[#0061ff] text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View My Trips
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">A confirmation email has been sent to your email address.</p>
              <div className="flex justify-center mt-4 space-x-4">
                <button className="text-gray-500 hover:text-blue-600">
                  <Facebook size={20} />
                </button>
                <button className="text-gray-500 hover:text-blue-400">
                  <Twitter size={20} />
                </button>
                <button className="text-gray-500 hover:text-pink-600">
                  <Instagram size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}