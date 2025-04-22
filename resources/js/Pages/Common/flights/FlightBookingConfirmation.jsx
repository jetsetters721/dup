import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Check, Printer, Download, Share2, ChevronDown, ChevronUp, CheckCircle, UserCircle, Plus, Edit, Save } from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { flightBookingData } from "./data";

// CONFIGURATION: Set this to true when Amadeus API is available
const USE_AMADEUS_API = false;

// Amadeus API configuration
const AMADEUS_API_CONFIG = {
  baseUrl: "https://test.api.amadeus.com/v2",
  apiKey: "YOUR_AMADEUS_API_KEY", // Replace with your actual API key
  apiSecret: "YOUR_AMADEUS_API_SECRET" // Replace with your actual API secret
};

export default function FlightBookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passengerData, setPassengerData] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [vipService, setVipService] = useState(false);
  const [calculatedFare, setCalculatedFare] = useState({
    baseFare: 0,
    tax: 0,
    addonsTotal: 0,
    vipServiceFee: 0,
    totalAmount: 0
  });
  const [expandedSections, setExpandedSections] = useState({
    flightDetails: true,
    passengerDetails: true,
    paymentDetails: true,
    contactDetails: true,
    refundDetails: true,
    visaRequirements: true
  });
  const [apiToken, setApiToken] = useState(null);

  // Authenticate with Amadeus API (if enabled)
  const authenticateAmadeus = async () => {
    try {
      // In a real implementation, you would make a POST request to Amadeus auth endpoint
      // Example:
      // const response = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/x-www-form-urlencoded',
      //   },
      //   body: `grant_type=client_credentials&client_id=${AMADEUS_API_CONFIG.apiKey}&client_secret=${AMADEUS_API_CONFIG.apiSecret}`
      // });
      // const data = await response.json();
      // setApiToken(data.access_token);
      
      // For now, we'll just set a mock token
      console.log("Authenticated with Amadeus API (mock)");
      setApiToken("mock_amadeus_token");
      return "mock_amadeus_token";
    } catch (error) {
      console.error("Failed to authenticate with Amadeus API:", error);
      return null;
    }
  };

  // Fetch booking details from Amadeus API
  const fetchBookingFromApi = async (id) => {
    try {
      // Get token if not available
      const token = apiToken || await authenticateAmadeus();
      if (!token) {
        throw new Error("Authentication failed");
      }

      // In a real implementation, you would make a GET request to Amadeus booking API
      // Example:
      // const response = await fetch(`${AMADEUS_API_CONFIG.baseUrl}/booking/flight-orders/${id}`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // const data = await response.json();
      // return transformBookingData(data);
      
      // For now, simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock booking data
      const mockBooking = flightBookingData.bookings.find(b => b.bookingId === id) || 
                         flightBookingData.internationalBookings.find(b => b.bookingId === id) ||
                         flightBookingData.bookings[0];
      
      return mockBooking;
    } catch (error) {
      console.error("Error fetching booking from API:", error);
      return null;
    }
  };

  // Transform Amadeus API booking data to our format
  const transformBookingData = (apiData) => {
    // In a real implementation, you would transform the API response data
    // to match the structure expected by the UI
    // For now, just return mock data
    return flightBookingData.bookings[0];
  };

  // Fetch booking details from data source (API or mock)
  useEffect(() => {
    setLoading(true);
    
    const getBookingDetails = async () => {
      try {
        let bookingData;
        
        // First check if booking data was passed from search results page
        if (location.state?.bookingData) {
          console.log("Using booking data from search page", location.state.bookingData);
          bookingData = location.state.bookingData;
        } 
        // Otherwise try to fetch from API or use mock data
        else {
          if (USE_AMADEUS_API && bookingId) {
            console.log("Fetching booking data from Amadeus API");
            bookingData = await fetchBookingFromApi(bookingId);
          } else {
            console.log("Using mock booking data");
            // Find booking by ID or use the first one by default
            bookingData = flightBookingData.bookings.find(b => b.bookingId === bookingId) || 
                         flightBookingData.internationalBookings.find(b => b.bookingId === bookingId);
                        
            // If no booking found by ID, use the first booking as default
            if (!bookingData) {
              bookingData = flightBookingData.bookings[0];
            }
          }
        }
        
        setBookingDetails(bookingData);
        setPassengerData([...bookingData.passengers]);
        updateFareSummary(bookingData.passengers.length, bookingData);
      } catch (error) {
        console.error("Error getting booking details:", error);
        // Fallback to mock data
        const fallbackData = flightBookingData.bookings[0];
        setBookingDetails(fallbackData);
        setPassengerData([...fallbackData.passengers]);
        updateFareSummary(fallbackData.passengers.length, fallbackData);
      } finally {
        setLoading(false);
      }
    };
    
    getBookingDetails();
  }, [bookingId, location.state]);

  useEffect(() => {
    // If booking details were passed via navigation state
    if (location.state && location.state.bookingDetails) {
      console.log("Received booking details:", location.state.bookingDetails);
      
      // Create a more complete booking details object
      const flightData = location.state.bookingDetails.flight || {};
      const numPassengers = location.state.bookingDetails.passengers || 1;
      
      // Extract fare details
      const baseFare = flightData.basePrice || 450;
      const taxAmount = flightData.tax || Math.round(baseFare * 0.18);
      const totalPerPassenger = baseFare + taxAmount;
      const totalAmount = totalPerPassenger * numPassengers;
      
      // Create a complete booking details object with proper defaults
      const enhancedBookingDetails = {
        ...location.state.bookingDetails,
        flight: {
          ...flightData,
          airline: flightData.airline || 'Qatar Airways',
          flightNumber: flightData.flightNumber || 'QR 4771',
          departureCity: flightData.departureCity || 'Dubai',
          arrivalCity: flightData.arrivalCity || 'Doha',
          departureTime: flightData.departureTime || '10:00',
          arrivalTime: flightData.arrivalTime || '12:00',
          duration: flightData.duration || 'PT20H20M',
          departureDate: flightData.departureDate || new Date().toISOString(),
          arrivalDate: flightData.arrivalDate || new Date().toISOString(),
          cabin: flightData.cabin || 'Economy',
          fareType: flightData.fareType || 'Standard',
          stops: flightData.stops || '1',
          basePrice: baseFare,
          tax: taxAmount,
          totalPrice: totalAmount,
          departureAirport: flightData.departureAirport || 'Dubai International Airport (DXB)',
          arrivalAirport: flightData.arrivalAirport || 'Hamad International Airport (DOH)'
        },
        baggage: {
          cabin: { weight: 0, weightUnit: 'KG' },
          checkIn: { weight: 23, weightUnit: 'KG' }
        },
        contact: {
          email: "guest@jetsetter.com",
          phone: "+1 123-456-7890"
        },
        addOns: [
          {
            id: 1,
            name: "Travel Insurance",
            title: "Travel Insurance",
            description: "Comprehensive coverage for your journey",
            price: 25,
            popular: true,
            selected: false,
            benefits: [
              "Trip cancellation coverage",
              "Medical emergency coverage",
              "Lost baggage protection"
            ]
          },
          {
            id: 2,
            name: "Airport Transfer",
            title: "Airport Transfer",
            description: "Comfortable ride to/from your accommodation",
            price: 35,
            popular: false,
            selected: false,
            benefits: [
              "24/7 service availability",
              "Professional drivers",
              "Free waiting time"
            ]
          }
        ],
        vipServiceFee: 30,
        isInternational: flightData.departureCity !== flightData.arrivalCity,
        visaRequirements: {
          destination: flightData.arrivalCity,
          visaType: "Tourist/Business",
          processingTime: "3-5 business days",
          requirements: [
            "Valid passport with at least 6 months validity",
            "Completed visa application form",
            "Recent passport-sized photographs",
            "Proof of accommodation"
          ],
          officialWebsite: "https://visa.gov.example"
        }
      };
      
      setBookingDetails(enhancedBookingDetails);
      
      // Generate passenger data based on number of passengers
      const newPassengerData = Array.from({ length: numPassengers }, (_, i) => ({
        id: i,
        title: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        passport: "",
        passportExpiry: "",
        nationality: "",
        meal: "Regular",
        seat: "",
        isComplete: false
      }));
      setPassengerData(newPassengerData);
      
      // Set fare details
      setCalculatedFare({
        baseFare,
        tax: taxAmount,
        addonsTotal: 0,
        vipServiceFee: 0,
        totalAmount: totalAmount
      });
      
      setLoading(false);
    } else if (bookingId) {
      // If booking ID was provided via URL params
      fetchBookingDetails(bookingId);
    } else {
      // Generate demo booking data if no actual data available
      generateDemoBookingData();
    }
  }, [location, bookingId]);

  // Calculate and update fare summary based on selections
  const updateFareSummary = (passengerCount, bookingData = bookingDetails) => {
    if (!bookingData) return;
    
    // Calculate base fare and tax
    const baseFare = bookingData.flight.basePrice * passengerCount;
    const tax = bookingData.flight.tax * passengerCount;
    
    // Calculate add-ons cost
    let addonsTotal = 0;
    if (selectedAddons.length > 0) {
      bookingData.addOns.forEach(addon => {
        if (selectedAddons.includes(addon.id)) {
          if (addon.perTraveller) {
            addonsTotal += addon.price * passengerCount;
          } else {
            addonsTotal += addon.price;
          }
        }
      });
    }
    
    // Add VIP service fee if selected (convert from USD to INR for display)
    const vipServiceFee = vipService ? bookingData.vipServiceFee * 84 : 0; // Approximate USD to INR conversion
    
    // Calculate total amount
    const totalAmount = baseFare + tax + addonsTotal + vipServiceFee;
    
    setCalculatedFare({
      baseFare,
      tax,
      addonsTotal,
      vipServiceFee,
      totalAmount
    });
  };

  // Effect to recalculate fare when changes are made
  useEffect(() => {
    if (bookingDetails) {
      updateFareSummary(passengerData.length);
    }
  }, [selectedAddons, vipService, passengerData.length]);

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  // Update the formatDate function to handle invalid dates
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Add a function to format duration
  const formatDuration = (duration) => {
    if (!duration) return 'Unknown Duration';
    // Handle PT20H20M format
    if (duration.startsWith('PT')) {
      const hours = duration.match(/(\d+)H/)?.[1] || '0';
      const minutes = duration.match(/(\d+)M/)?.[1] || '0';
      return `${hours}h ${minutes}m`;
    }
    return duration;
  };

  // Format just month and day
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleLogin = () => {
    // In a real app, this would trigger a login flow
    setIsLoggedIn(true);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handlePassengerChange = (id, field, value) => {
    const updatedPassengers = passengerData.map(passenger => {
      if (passenger.id === id) {
        return { ...passenger, [field]: value };
      }
      return passenger;
    });
    setPassengerData(updatedPassengers);
  };

  const handleAddPassenger = () => {
    const newPassenger = {
      id: passengerData.length + 1,
      type: "Adult",
      title: "Mr",
      firstName: "",
      lastName: "",
      seatNumber: "",
      meal: "Regular",
      baggage: "15 Kg",
      mobile: "",
      email: "",
      gender: "male",
      requiresWheelchair: false
    };
    const updatedPassengers = [...passengerData, newPassenger];
    setPassengerData(updatedPassengers);
    updateFareSummary(updatedPassengers.length);
  };
  
  const handleRemovePassenger = (id) => {
    if (passengerData.length <= 1) {
      alert("Cannot remove the last passenger");
      return;
    }
    
    const updatedPassengers = passengerData.filter(passenger => passenger.id !== id);
    setPassengerData(updatedPassengers);
    updateFareSummary(updatedPassengers.length);
  };

  const savePassengerDetails = () => {
    // In a real app, this would send the updated data to the server
    setEditMode(false);
    // Update the bookingDetails with the new passenger data
    setBookingDetails({
      ...bookingDetails,
      passengers: passengerData
    });
  };

  // Handle addon selection
  const toggleAddon = (addonId) => {
    let newSelectedAddons;
    if (selectedAddons.includes(addonId)) {
      newSelectedAddons = selectedAddons.filter(id => id !== addonId);
    } else {
      // If selecting an addon, remove any other addons (assuming they're mutually exclusive)
      newSelectedAddons = [addonId];
    }
    setSelectedAddons(newSelectedAddons);
  };
  
  // Toggle VIP service
  const toggleVipService = () => {
    setVipService(!vipService);
  };

  // Handle proceeding to payment page
  const handleProceedToPayment = () => {
    // Validate passenger data
    const isPassengerDataValid = passengerData.every(p => 
      p.firstName && p.lastName && p.mobile
    );
    
    if (!isPassengerDataValid) {
      alert("Please fill in all required passenger details before proceeding.");
      return;
    }
    
    if (USE_AMADEUS_API) {
      // In a real app, you would make an API call to prepare the booking for payment
      console.log("Preparing booking for payment with Amadeus API");
    }
    
    // Navigate to payment page with all the booking details
    navigate('/flight-payment', { 
      state: { 
        bookingDetails,
        passengerData,
        selectedAddons,
        vipService,
        calculatedFare
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-center text-gray-500">Loading your booking details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Fare Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Fare Summary</h2>
                <div className="text-sm text-gray-500">{passengerData.length} Traveller</div>
              </div>
              
              <div className="p-8 border-t border-gray-300">
                <h3 className="font-bold text-xl mb-4">Fare Summary</h3>
                
                <div className="space-y-3">
                  {/* Base Fare */}
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      Base Fare
                      <span className="text-xs text-gray-500 ml-1">
                        ({bookingDetails?.passengers || passengerData.length} {(bookingDetails?.passengers || passengerData.length) > 1 ? 'Travelers' : 'Traveler'})
                      </span>
                    </div>
                    <div className="font-medium">
                      ${calculatedFare.baseFare * (bookingDetails?.passengers || passengerData.length)}
                    </div>
                  </div>
                  
                  {/* Taxes & Fees */}
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      Taxes & Fees
                      <span className="text-xs text-gray-500 ml-1">
                        ({bookingDetails?.passengers || passengerData.length} {(bookingDetails?.passengers || passengerData.length) > 1 ? 'Travelers' : 'Traveler'})
                      </span>
                    </div>
                    <div className="font-medium">
                      ${calculatedFare.tax * (bookingDetails?.passengers || passengerData.length)}
                    </div>
                  </div>
                  
                  {/* Add-ons if any */}
                  {calculatedFare.addonsTotal > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <div>Add-Ons</div>
                      <div className="font-medium">${calculatedFare.addonsTotal}</div>
                    </div>
                  )}
                  
                  {/* VIP Service if selected */}
                  {calculatedFare.vipServiceFee > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <div>VIP Service</div>
                      <div className="font-medium">${calculatedFare.vipServiceFee}</div>
                    </div>
                  )}
                  
                  {/* Total */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-bold text-lg">
                    <div>Total</div>
                    <div>${calculatedFare.totalAmount}</div>
                  </div>
                  
                  {/* Price Guarantee */}
                  <div className="flex items-center justify-center mt-4 text-xs text-green-700 bg-green-50 rounded-full py-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Price Guaranteed • Won't Find It Lower
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Flight & Traveler Details */}
          <div className="lg:col-span-2">
            {/* Flight Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-6">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-lg font-semibold">
                    {bookingDetails?.flight?.departureCity || 'Unknown'} → {bookingDetails?.flight?.arrivalCity || 'Unknown'}
                  </div>
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    CANCELLATION FEES APPLY
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {formatDate(bookingDetails?.flight?.departureDate)}
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <span className="mr-2">
                    {bookingDetails?.flight?.stops === "0" ? "Non Stop" : `${bookingDetails?.flight?.stops || 1} stop`} · 
                    {formatDuration(bookingDetails?.flight?.duration)}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white font-medium text-xs">
                      {(bookingDetails?.flight?.airline || 'Unknown Airline').split(' ').map(word => word[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <div className="font-medium">
                        {bookingDetails?.flight?.airline || 'Unknown Airline'}
                      </div>
                      <div className="text-sm text-gray-600 ml-2">{bookingDetails?.flight?.flightNumber || 'QR 4771'}</div>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="text-gray-600">{bookingDetails?.flight?.cabin || 'Economy'}</div>
                      <div className="text-green-600 ml-2">→ {bookingDetails?.flight?.fareType || 'Standard'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-4 mb-4">
                  {/* Departure */}
                  <div className="col-span-5">
                    <div className="text-2xl font-bold">{bookingDetails?.flight?.departureTime || 'Departure Time'}</div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-600 rounded-full mr-2"></div>
                      <div className="text-gray-700">{bookingDetails?.flight?.departureCity || 'Departure City'}</div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {bookingDetails?.flight?.departureAirport?.name || 
                       (typeof bookingDetails?.flight?.departureAirport === 'string' ? 
                         bookingDetails.flight.departureAirport.split('(')[0] : 
                         'Departure Airport')}
                    </div>
                  </div>
                  
                  {/* Flight Duration */}
                  <div className="col-span-2 flex flex-col items-center justify-center">
                    <div className="text-sm text-gray-600">{bookingDetails?.flight?.duration || 'Duration'}</div>
                    <div className="h-px w-full bg-gray-300 relative my-2">
                      <div className="absolute h-2 w-2 rounded-full bg-gray-400 -top-1 left-0"></div>
                      <div className="absolute h-2 w-2 rounded-full bg-gray-400 -top-1 right-0"></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {bookingDetails?.flight?.stops === "0" ? "Nonstop" : 
                       `${bookingDetails?.flight?.stops || "0"} ${parseInt(bookingDetails?.flight?.stops || "0") === 1 ? "stop" : "stops"}`}
                    </div>
                  </div>
                  
                  {/* Arrival */}
                  <div className="col-span-5">
                    <div className="text-2xl font-bold">{bookingDetails?.flight?.arrivalTime || 'Arrival Time'}</div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-gray-600 rounded-full mr-2"></div>
                      <div className="text-gray-700">{bookingDetails?.flight?.arrivalCity || 'Arrival City'}</div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {bookingDetails?.flight?.arrivalAirport?.name || 
                       (typeof bookingDetails?.flight?.arrivalAirport === 'string' ? 
                         bookingDetails.flight.arrivalAirport.split('(')[0] : 
                         'Arrival Airport')}
                    </div>
                  </div>
                </div>
                
                {/* Baggage Information */}
                <div className="mt-4">
                  <div className="text-sm">
                    <span className="font-medium">Cabin Baggage:</span>{" "}
                    {typeof bookingDetails?.baggage?.cabin === 'object' 
                      ? `${bookingDetails.baggage.cabin.weight} ${bookingDetails.baggage.cabin.weightUnit}`
                      : `${bookingDetails?.baggage?.cabin || "0 KG"}`}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-medium">Check-In Baggage:</span>{" "}
                    {typeof bookingDetails?.baggage?.checkIn === 'object'
                      ? `${bookingDetails.baggage.checkIn.weight} ${bookingDetails.baggage.checkIn.weightUnit}`
                      : `${bookingDetails?.baggage?.checkIn || "1 piece, 23 kg"}`}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Traveller Details Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-6">
              <div className="p-4 bg-white border-b border-gray-200">
                <h2 className="text-xl font-semibold">Traveller Details</h2>
              </div>
              
              <div className="p-4">
                <div className="bg-blue-50 p-4 mb-4 flex justify-between items-center rounded-md">
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="w-5 h-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Log in to view your saved traveller list, unlock amazing deals & much more!
                  </div>
                  <button 
                    onClick={handleLogin}
                    className="text-blue-600 font-medium flex items-center mt-2 hover:underline"
                  >
                    LOGIN NOW
                  </button>
                </div>
                
                {passengerData.map((passenger, index) => (
                  <div key={passenger.id} className="mb-6 pb-4 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <div>
                          <div className="font-medium">ADULT (12 yrs+) {index + 1}/{passengerData.length}</div>
                          <div className="text-xs text-gray-500">added</div>
                        </div>
                      </div>
                      {editMode && passengerData.length > 1 && (
                        <button
                          onClick={() => handleRemovePassenger(passenger.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          REMOVE
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded" 
                        checked 
                        readOnly 
                      />
                      <div className="font-medium">{passenger.firstName} {passenger.lastName}</div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          placeholder="First Name"
                          value={passenger.firstName}
                          onChange={(e) => handlePassengerChange(passenger.id, 'firstName', e.target.value)}
                          readOnly={!editMode}
                        />
                      </div>
                      <div>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          placeholder="Last Name"
                          value={passenger.lastName}
                          onChange={(e) => handlePassengerChange(passenger.id, 'lastName', e.target.value)}
                          readOnly={!editMode}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handlePassengerChange(passenger.id, 'gender', 'male')}
                          className={`flex-1 p-2 border ${passenger.gender === 'male' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white'} rounded text-center transition-colors`}
                        >
                          MALE
                        </button>
                        <button 
                          onClick={() => handlePassengerChange(passenger.id, 'gender', 'female')}
                          className={`flex-1 p-2 border ${passenger.gender === 'female' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white'} rounded text-center transition-colors`}
                        >
                          FEMALE
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Country Code</div>
                        <div className="relative">
                          <select 
                            className="w-full p-2 border border-gray-300 rounded appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!editMode}
                          >
                            <option>India(91)</option>
                          </select>
                          <div className="absolute right-3 top-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Mobile No</div>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          value={passenger.mobile}
                          onChange={(e) => handlePassengerChange(passenger.id, 'mobile', e.target.value)}
                          readOnly={!editMode}
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Email</div>
                        <input 
                          type="email" 
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                          placeholder="Email(Optional)"
                          value={passenger.email}
                          onChange={(e) => handlePassengerChange(passenger.id, 'email', e.target.value)}
                          readOnly={!editMode}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded" 
                          checked={passenger.requiresWheelchair}
                          onChange={(e) => handlePassengerChange(passenger.id, 'requiresWheelchair', e.target.checked)}
                          disabled={!editMode}
                        />
                        <span className="text-sm text-gray-700">I require wheelchair (Optional)</span>
                      </label>
                    </div>
                  </div>
                ))}
                
                {editMode && (
                  <button 
                    onClick={handleAddPassenger}
                    className="text-blue-600 font-medium flex items-center mt-2 hover:underline"
                  >
                    <Plus className="h-4 w-4 mr-1" /> ADD NEW ADULT
                  </button>
                )}
              </div>
            </div>
            
            {/* Booking details */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-6">
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Booking details will be sent to</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Country Code</div>
                      <div className="relative">
                        <select className="w-full p-2 border border-gray-300 rounded appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>India(91)</option>
                        </select>
                        <div className="absolute right-3 top-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Mobile No</div>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        value={bookingDetails?.contact?.phone}
                        readOnly
                      />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Email</div>
                      <input 
                        type="email" 
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        value={bookingDetails?.contact?.email}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-blue-600 mb-4">
                  Booking details & alerts will also be sent to {passengerData[0].firstName} {passengerData[0].lastName}
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded" />
                    <span className="text-sm text-gray-700">Confirm and save billing details to your profile</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Add-on Selection */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-6">
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">Not sure of your travel?</h2>
                <p className="text-sm text-gray-600 mb-4">Get full flexibility with add-ons</p>
                
                {/* Add-on Options */}
                {bookingDetails?.addOns && bookingDetails.addOns.length > 0 ? (
                  bookingDetails.addOns.map((addon) => (
                    <div 
                      key={addon.id} 
                      className={`p-4 rounded-lg mb-3 ${addon.popular ? 'bg-blue-50 border border-blue-200' : 'bg-purple-50 border border-purple-200'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start">
                          <svg 
                            className="w-5 h-5 text-green-500 mr-2 mt-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium">{addon.title}</h3>
                              {addon.popular && (
                                <span className="ml-2 text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                                  Most Popular
                                </span>
                              )}
                            </div>
                            <ul className="mt-1">
                              {addon.benefits && addon.benefits.map((benefit, i) => (
                                <li key={i} className="text-sm text-gray-600 flex items-center">
                                  <svg className="w-3 h-3 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                  </svg>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                            <button className="text-sm text-blue-600 hover:text-blue-800 mt-1">
                              Know More
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-600 text-sm">
                            @₹{addon.price}{addon.perTraveller ? '/traveller' : ''}
                          </div>
                          <button 
                            onClick={() => toggleAddon(addon.id)}
                            className={`mt-2 ${selectedAddons.includes(addon.id) ? 'bg-green-600' : 'bg-blue-600'} text-white px-4 py-1 rounded hover:opacity-90 transition-colors text-sm`}
                          >
                            {selectedAddons.includes(addon.id) ? 'Added' : 'Add'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-lg mb-3 bg-gray-50 border border-gray-200">
                    <p className="text-gray-500 text-center">No add-ons available for this flight</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Fly Like a VIP */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-6">
              <div className="p-4">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-medium text-xs">
                        {typeof bookingDetails?.flight?.airline === 'string'
                          ? bookingDetails?.flight?.airline?.split(' ').map(word => word[0]).join('')
                          : bookingDetails?.flight?.airline?.name?.split(' ').map(word => word[0]).join('') || 'JS'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">Fly Like a VIP @ Just ${bookingDetails?.vipServiceFee || '25'}</h3>
                      <p className="text-sm text-gray-600">Be amongst the first to check-in and get your bags tagged with priority status with {typeof bookingDetails?.flight?.airline === 'string'
                        ? bookingDetails?.flight?.airline
                        : bookingDetails?.flight?.airline?.name || 'JetSetters Airlines'} Priority Check-in & Bag Services.</p>
                    </div>
                  </div>
                  <button 
                    onClick={toggleVipService}
                    className={`text-blue-600 font-medium px-3 py-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors ${vipService ? 'bg-blue-50' : ''}`}
                  >
                    {vipService ? 'ADDED' : '+ADD'}
                  </button>
                </div>
                
                <div className="flex items-center justify-center mt-3 space-x-2 text-sm">
                  <div className="flex items-center">
                    <span className="inline-block w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-1 text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </span>
                    Priority Check-in
                  </div>
                  <span>+</span>
                  <div className="flex items-center">
                    <span className="inline-block w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-1 text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </span>
                    Priority Bag Service
                  </div>
                  <span>=</span>
                  <span className="font-medium">${bookingDetails?.vipServiceFee}</span>
                </div>
              </div>
            </div>
            
            {/* Visa Requirements Section - Only shown for international flights */}
            {bookingDetails?.isInternational && bookingDetails?.visaRequirements && (
              <div className="bg-white rounded-lg shadow-md mb-6">
                <div 
                  className="p-4 border-b flex justify-between items-center cursor-pointer" 
                  onClick={() => toggleSection('visaRequirements')}
                >
                  <h2 className="text-xl font-semibold text-gray-800">Visa & Travel Documents</h2>
                  <div>
                    {expandedSections.visaRequirements ? (
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                </div>
                {expandedSections.visaRequirements && (
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              This is an international flight to {bookingDetails?.visaRequirements?.destination}. Please ensure you have all required travel documents before your journey.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-3">Visa Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-gray-600">Destination</p>
                        <p className="font-semibold">{bookingDetails?.visaRequirements?.destination}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Visa Type</p>
                        <p className="font-semibold">{bookingDetails?.visaRequirements?.visaType}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Typical Processing Time</p>
                        <p className="font-semibold">{bookingDetails?.visaRequirements?.processingTime}</p>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-3">Required Documents</h3>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                      {bookingDetails?.visaRequirements?.requirements && bookingDetails.visaRequirements.requirements.map((req, index) => (
                        <li key={index} className="text-gray-700">{req}</li>
                      ))}
                    </ul>
                    
                    <div className="mt-4">
                      <a 
                        href={bookingDetails?.visaRequirements?.officialWebsite} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark font-semibold flex items-center"
                      >
                        Visit Official Website
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Continue Button */}
            <div className="text-center">
              <button 
                onClick={handleProceedToPayment}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-md font-medium text-lg transition-colors shadow-md"
              >
                CONTINUE
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 