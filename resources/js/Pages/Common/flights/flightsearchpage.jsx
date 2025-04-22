import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ArrowUpDown, Filter, X, Calendar, ArrowRight, ChevronLeft, ChevronRight, Plane } from "lucide-react";
import FlightSearchForm from "./flight-search-form";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { 
  defaultSearchData, 
  cheapFlights, 
  destinations,
  sourceCities,
  specialFares
} from "./data.js";

export default function FlightSearchPage() {
  
  const location = useLocation();
  const searchData = location.state?.searchData;

  console.log('searchData:', searchData);
  
  // const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState(searchData || {
    from: 'DEL',
    to: 'HYD',
    departDate: new Date().toISOString().split('T')[0],
    returnDate: '',
    travelers: 1,
    tripType: 'one-way'
  });
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("price");
  const [dateRange, setDateRange] = useState([]);
  const [filters, setFilters] = useState({
    price: [0, 20000],
    stops: "any",
    airlines: []
  });
  const [error, setError] = useState(null);
  const [expandedFlights, setExpandedFlights] = useState({});

  // Generate date range based on current date
  useEffect(() => {
    const generateDateRange = (centerDate) => {
      const dates = [];
      const baseDate = new Date(centerDate);
      
      // Generate 3 days before and after the selected date
      for (let i = -3; i <= 3; i++) {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() + i);
        
        const formattedDate = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const isoDate = date.toISOString().split('T')[0];
        
        dates.push({
          date: formattedDate,
          day: dayName,
          isoDate: isoDate,
          price: null,
          selected: i === 0,
          isWeekend: [0, 6].includes(date.getDay()),
          isPast: date < new Date().setHours(0, 0, 0, 0)
        });
      }
      
      return dates;
    };

    const initializeDates = () => {
      const searchDate = location.state?.searchData?.departDate;
      const centerDate = searchDate ? new Date(searchDate) : new Date();
      const dates = generateDateRange(centerDate);
      setDateRange(dates);
    };
    
    // Initialize dates
    initializeDates();
    
    // Fetch flight data if search parameters are available
    const fetchInitialFlights = async () => {
      if (location.state?.searchData) {
        setLoading(true);
        try {
          // Ensure all required fields are present
          const searchData = {
            from: location.state.searchData.from,
            to: location.state.searchData.to,
            departDate: location.state.searchData.departDate,
            returnDate: location.state.searchData.returnDate,
            travelers: parseInt(location.state.searchData.travelers) || 1,
            max: 10
          };

          // Validate required fields
          if (!searchData.from || !searchData.to || !searchData.departDate) {
            throw new Error('Missing required fields: from, to, and departDate are required');
          }

          // Remove returnDate if it's empty
          if (!searchData.returnDate) {
            delete searchData.returnDate;
          }

          const response = await fetch('http://localhost:5001/api/flights/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.error || 'Failed to fetch flights');
          }

          // Transform flight data
          const flightData = transformFlightData(data.data);
          setFlights(flightData);
          
          // Update prices in the date range
          if (data.data.dateWisePrices) {
            setDateRange(prev => 
              prev.map(d => ({
                ...d,
                price: data.data.dateWisePrices[d.isoDate] ? `$${data.data.dateWisePrices[d.isoDate]}` : null,
                isLowestPrice: data.data.dateWisePrices[d.isoDate] === data.data.lowestPrice
              }))
            );
          }
        } catch (error) {
          console.error('Error fetching initial flights:', error);
          setError(error.message);
          setFlights([]); // Clear flights on error
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchInitialFlights();
  }, [location.state]);
  
  // Update search params when location state changes
  useEffect(() => {
    if (location.state?.searchData) {
      setSearchParams(location.state.searchData);
    }
  }, [location.state]);
  
  // Airline code to name mapping
  const airlineMap = {
    // Full-service carriers
    'AI': 'Air India',
    'IX': 'Air India Express',
    'UK': 'Vistara',
    // Low-cost carriers
    '6E': 'IndiGo',
    'SG': 'SpiceJet',
    'G8': 'Go First',
    'I5': 'AirAsia India',
    'QP': 'Akasa Air',
    // International airlines
    'EK': 'Emirates',
    'EY': 'Etihad Airways',
    'QR': 'Qatar Airways',
    'SQ': 'Singapore Airlines',
    'TG': 'Thai Airways',
    'MH': 'Malaysia Airlines',
    'BA': 'British Airways',
    'LH': 'Lufthansa',
    'AF': 'Air France',
    'KL': 'KLM Royal Dutch',
    'DL': 'Delta Air Lines',
    'AA': 'American Airlines',
    'UA': 'United Airlines',
    'CX': 'Cathay Pacific',
    'QF': 'Qantas',
    'JL': 'Japan Airlines',
    'NH': 'ANA',
    'KE': 'Korean Air',
    'OZ': 'Asiana Airlines'
  };

  // City code to name mapping
  const cityMap = {
    // Metro cities
    'DEL': 'New Delhi',
    'BOM': 'Mumbai',
    'MAA': 'Chennai',
    'BLR': 'Bengaluru',
    'HYD': 'Hyderabad',
    'CCU': 'Kolkata',
    // Other major cities
    'PNQ': 'Pune',
    'AMD': 'Ahmedabad',
    'COK': 'Kochi',
    'GOI': 'Goa',
    'JAI': 'Jaipur',
    'IXC': 'Chandigarh',
    'PAT': 'Patna',
    'LKO': 'Lucknow',
    'BBI': 'Bhubaneswar',
    'VTZ': 'Visakhapatnam',
    'IXM': 'Madurai',
    'TRV': 'Thiruvananthapuram',
    // International hubs
    'DXB': 'Dubai',
    'SIN': 'Singapore',
    'BKK': 'Bangkok',
    'LHR': 'London Heathrow',
    'JFK': 'New York',
    'SFO': 'San Francisco',
    'LAX': 'Los Angeles',
    'CDG': 'Paris',
    'FRA': 'Frankfurt',
    'AMS': 'Amsterdam',
    'HKG': 'Hong Kong',
    'NRT': 'Tokyo',
    'ICN': 'Seoul',
    'SYD': 'Sydney',
    'MEL': 'Melbourne',
    'YYZ': 'Toronto',
    'YVR': 'Vancouver'
  };

  // Aircraft code to name mapping
  const aircraftMap = {
    // Narrow-body aircraft
    '320': 'Airbus A320',
    '321': 'Airbus A321',
    '32N': 'Airbus A320neo',
    '32Q': 'Airbus A321neo',
    '738': 'Boeing 737-800',
    '739': 'Boeing 737-900',
    '7M8': 'Boeing 737 MAX 8',
    // Wide-body aircraft
    '788': 'Boeing 787-8 Dreamliner',
    '789': 'Boeing 787-9 Dreamliner',
    '77W': 'Boeing 777-300ER',
    '359': 'Airbus A350-900',
    '351': 'Airbus A350-1000',
    // Regional aircraft
    'AT7': 'ATR 72',
    'AT4': 'ATR 42',
    'E90': 'Embraer E190',
    'E95': 'Embraer E195'
  };

  // Transform Amadeus API flight data to our format
  const transformFlightData = (data) => {
    if (!data || !Array.isArray(data)) return [];

    return data.map(offer => {
      const itinerary = offer.itineraries[0];
      const segments = itinerary.segments;
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];
      const price = offer.price;

      return {
        id: offer.id,
        airline: {
          code: firstSegment.carrierCode,
          name: airlineMap[firstSegment.carrierCode] || firstSegment.carrierCode,
          logo: `/images/airlines/${firstSegment.carrierCode.toLowerCase()}.png`
        },
        departure: {
          time: new Date(firstSegment.departure.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          date: new Date(firstSegment.departure.at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          airport: firstSegment.departure.iataCode,
          terminal: firstSegment.departure.terminal || 'T1'
        },
        arrival: {
          time: new Date(lastSegment.arrival.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          date: new Date(lastSegment.arrival.at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          airport: lastSegment.arrival.iataCode,
          terminal: lastSegment.arrival.terminal || 'T1'
        },
        duration: itinerary.duration,
        stops: segments.length - 1,
        price: {
          total: price.total,
          currency: price.currency,
          base: price.base,
          fees: price.fees
        },
        amenities: offer.travelerPricings[0].fareDetailsBySegment[0].amenities || [],
        baggage: {
          checked: offer.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags || { weight: 0, weightUnit: 'KG' },
          cabin: offer.travelerPricings[0].fareDetailsBySegment[0].includedCabinBags || { weight: 0, weightUnit: 'KG' }
        },
        cabin: offer.travelerPricings[0].fareDetailsBySegment[0].cabin,
        class: offer.travelerPricings[0].fareDetailsBySegment[0].class,
        segments: segments.map(segment => ({
          departure: {
            time: new Date(segment.departure.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            airport: segment.departure.iataCode,
            terminal: segment.departure.terminal || 'T1'
          },
          arrival: {
            time: new Date(segment.arrival.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            airport: segment.arrival.iataCode,
            terminal: segment.arrival.terminal || 'T1'
          },
          duration: segment.duration,
          flightNumber: `${segment.carrierCode} ${segment.number}`,
          aircraft: segment.aircraft?.code || 'Unknown'
        }))
      };
    });
  };

  // Get flights from API
  const getFlights = async (searchData) => {
    try {
      // Check if we have the required data
      if (!searchData || !searchData.data || !searchData.data.flights) {
        throw new Error('Missing flight data');
      }

      // Update date range prices
      if (searchData.data.dateWisePrices) {
        setDateRange(Object.entries(searchData.data.dateWisePrices).map(([date, price]) => ({
          date,
          price: price || null
        })));
      }

      // Return the transformed flight data
      return transformFlightData(searchData.data.flights);
    } catch (error) {
      console.error('Error processing flights:', error);
      setError(error.message);
      return [];
    }
  };

  // Handle search form submission
  const handleSearch = async (formData) => {
    setLoading(true);
    setSearchParams(formData);
    setError(null);
    
    // Ensure all required fields are present
    if (!formData.from || !formData.to || !formData.departDate) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    try {
      const searchData = {
        from: formData.from,
        to: formData.to,
        departDate: formData.departDate,
        returnDate: formData.returnDate,
        travelers: parseInt(formData.travelers) || 1,
        max: 10
      };

      // Remove returnDate if it's empty
      if (!searchData.returnDate) {
        delete searchData.returnDate;
      }

      const response = await fetch('http://localhost:5001/api/flights/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch flights');
      }

      const flightData = transformFlightData(data.data);
      setFlights(flightData);

      // Update prices in the date range if available
      if (data.data.dateWisePrices) {
        setDateRange(prev => 
          prev.map(d => ({
            ...d,
            price: data.data.dateWisePrices[d.isoDate] ? `$${data.data.dateWisePrices[d.isoDate]}` : d.price,
            isLowestPrice: data.data.dateWisePrices[d.isoDate] === data.data.lowestPrice
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };
  
  // Apply filters to flights
  const getFilteredFlights = () => {
    return flights.filter(flight => {
      // Filter by price
      const flightPrice = flight.price.amount;
      if (flightPrice < filters.price[0] || flightPrice > filters.price[1]) {
        return false;
      }
      
      // Filter by stops
      if (filters.stops !== "any" && flight.segments[0].stops !== filters.stops) {
        return false;
      }
      
      // Filter by airlines
      if (filters.airlines.length > 0) {
        const airlineName = flight.segments[0].airline.name;
        if (!filters.airlines.includes(airlineName)) {
          return false;
        }
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by selected order
      const aPrice = a.price.amount;
      const bPrice = b.price.amount;
      
      if (sortOrder === "price") {
        return aPrice - bPrice;
      } else if (sortOrder === "-price") {
        return bPrice - aPrice;
      } else if (sortOrder === "duration") {
        const aDuration = a.duration.split("PT")[1].split("H")[0] * 60 + parseInt(a.duration.split("PT")[1].split("H")[1]);
        const bDuration = b.duration.split("PT")[1].split("H")[0] * 60 + parseInt(b.duration.split("PT")[1].split("H")[1]);
        return aDuration - bDuration;
      } else if (sortOrder === "departure") {
        return a.segments[0].departure.at.localeCompare(b.segments[0].departure.at);
      } else if (sortOrder === "arrival") {
        return a.segments[0].arrival.at.localeCompare(b.segments[0].arrival.at);
      }
      
      return 0;
    });
  };

  // Handle date navigation in the date bar
  const handleDateNavigate = async (direction) => {
    const currentSelectedDate = dateRange.find(d => d.selected)?.isoDate;
    if (!currentSelectedDate) return;
    
    const newCenterDate = new Date(currentSelectedDate);
    newCenterDate.setDate(newCenterDate.getDate() + (direction * 7));
    
    // Generate new date range
    const newDates = dateRange.map(d => {
      const date = new Date(d.isoDate);
      date.setDate(date.getDate() + (direction * 7));
      
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const isoDate = date.toISOString().split('T')[0];
      
      return {
        ...d,
        date: formattedDate,
        day: dayName,
        isoDate: isoDate,
        isWeekend: [0, 6].includes(date.getDay()),
        isPast: date < new Date().setHours(0, 0, 0, 0)
      };
    });
    
    setDateRange(newDates);
  };

  // Handle date selection in the date bar
  const handleDateSelect = async (selectedDate) => {
    if (!selectedDate || selectedDate.isPast) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Update search params with new date
      const newSearchParams = {
        ...searchParams,
        from: searchParams.from || 'DEL',
        to: searchParams.to || 'HYD',
        departDate: selectedDate.isoDate
      };
      setSearchParams(newSearchParams);
      
      // Update date range to show selection
      setDateRange(prev => 
        prev.map(d => ({
          ...d,
          selected: d.isoDate === selectedDate.isoDate
        }))
      );
      
      // Fetch flights for the new date
      const response = await fetch('http://localhost:5001/api/flights/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSearchParams)
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch flights');
      }

      // Transform flight data
      const flightData = transformFlightData(data.data.flights);
      setFlights(flightData);
      
      // Update prices in the date range
      const { dateWisePrices, lowestPrice } = data.data;
      setDateRange(prev => 
        prev.map(d => ({
          ...d,
          price: dateWisePrices[d.isoDate] ? `$${dateWisePrices[d.isoDate]}` : d.price,
          isLowestPrice: dateWisePrices[d.isoDate] === lowestPrice
        }))
      );

      // Update URL with new search params
      navigate(`/flights/search?from=${newSearchParams.from}&to=${newSearchParams.to}&date=${selectedDate.isoDate}`, {
        replace: true,
        state: { searchData: newSearchParams }
      });
    } catch (error) {
      console.error('Error fetching flights for date:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle an airline in the filter
  const toggleAirlineFilter = (airline) => {
    const updatedAirlines = filters.airlines.includes(airline)
      ? filters.airlines.filter(a => a !== airline)
      : [...filters.airlines, airline];
    
    handleFilterChange('airlines', updatedAirlines);
  };

  // Get unique airlines from available flights
  const getUniqueAirlines = () => {
    if (!flights || !Array.isArray(flights)) return [];
    
    return [...new Set(flights
      .filter(flight => flight?.segments?.[0]?.airline?.name)
      .map(flight => flight.segments[0].airline.name)
    )];
  };

  // Handle booking a flight
  const handleBookFlight = (flight) => {
    // Create a booking reference to pass to the confirmation page
    const bookingReference = {
      flight: {
        ...flight,
        airline: flight.segments[0]?.airline?.name || 'Unknown Airline',
        flightNumber: flight.segments[0]?.flightNumber || 'N/A',
        departureCity: flight.segments[0]?.departure?.city || 'Unknown',
        arrivalCity: flight.segments[0]?.arrival?.city || 'Unknown',
        departureTime: flight.segments[0]?.departure?.at || 'N/A',
        arrivalTime: flight.segments[0]?.arrival?.at || 'N/A',
        duration: flight.duration || 'N/A',
        cabin: flight.segments[0]?.cabin || 'Economy',
        fareType: 'Standard',
        basePrice: flight.price?.base || 0,
        tax: flight.price?.total - flight.price?.base || 0,
        totalPrice: flight.price?.total || 0,
        departureAirport: {
          name: flight.segments[0]?.departure?.iataCode || 'N/A',
          city: flight.segments[0]?.departure?.city || 'Unknown'
        },
        arrivalAirport: {
          name: flight.segments[0]?.arrival?.iataCode || 'N/A',
          city: flight.segments[0]?.arrival?.city || 'Unknown'
        },
        stops: flight.segments.length - 1
      },
      passengers: parseInt(searchParams.travelers) || 1,
      tripType: searchParams.tripType,
      departDate: searchParams.departDate,
      returnDate: searchParams.returnDate,
      bookingId: `JET${Math.floor(Math.random() * 100000)}`,
      isInternational: flight.segments[0]?.departure?.iataCode !== flight.segments[0]?.arrival?.iataCode,
      baggage: {
        cabin: flight.segments[0]?.baggage?.cabin || "1 piece, 7 kg",
        checkIn: flight.segments[0]?.baggage?.checked || "1 piece, 23 kg"
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
      visaRequirements: flight.segments[0]?.departure?.iataCode !== flight.segments[0]?.arrival?.iataCode ? {
        destination: flight.segments[0]?.arrival?.city || 'Unknown',
        visaType: "Tourist/Business",
        processingTime: "3-5 business days",
        requirements: [
          "Valid passport with at least 6 months validity",
          "Completed visa application form",
          "Recent passport-sized photographs",
          "Proof of accommodation"
        ],
        officialWebsite: "https://visa.gov.example"
      } : null
    };
    
    // Navigate to the booking confirmation page with flight details
    navigate('/flights/booking-confirmation', { 
      state: { bookingDetails: bookingReference } 
    });
  };

  const filteredFlights = getFilteredFlights();

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      
      {/* Enhanced Header Section with Background Image */}
      <div className="relative px-4 py-12 bg-gradient-to-r from-blue-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=2070&auto=format&fit=crop" 
            alt="Clouds from airplane window" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center mb-3">
              <div className="h-0.5 w-10 bg-blue-400 mr-3"></div>
              <span className="text-blue-300 uppercase tracking-wider text-sm font-medium">Flight Search</span>
              <div className="h-0.5 w-10 bg-blue-400 ml-3"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-center">Find Your Perfect Flight</h1>
            <p className="text-blue-200 text-center max-w-2xl mb-6">Compare prices, schedules, and amenities from top airlines to book the best deal for your trip</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/20 transform hover:scale-[1.01] transition-transform duration-300">
            <FlightSearchForm 
              initialData={searchParams}
              onSearch={handleSearch}
            />
          </div>
        </div>
      </div>
      
      {/* Enhanced Date Navigation Bar */}
      <div className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto max-w-6xl px-4 py-3">
          {/* Date selector */}
          <div className="flex items-center justify-between bg-white rounded-lg relative">
            <button
              onClick={() => handleDateNavigate(-1)}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-all"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div className="flex space-x-2 overflow-x-auto hide-scrollbar mx-4 flex-grow">
              {dateRange.map((date, index) => (
                <button
                  key={index}
                  onClick={() => !date.isPast && handleDateSelect(date)}
                  disabled={date.isPast}
                  className={`
                    date-button flex flex-col items-center p-2 rounded-lg min-w-[80px]
                    ${date.selected ? 'selected' : ''}
                    ${date.isWeekend ? 'weekend' : ''}
                    ${date.isLowestPrice ? 'lowest-price' : ''}
                    ${date.isPast ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <span className={`text-sm font-medium ${date.selected ? 'text-blue-100' : ''}`}>
                    {date.day}
                  </span>
                  <span className={`text-lg font-bold ${date.selected ? 'text-white' : ''}`}>
                    {date.date}
                  </span>
                  {date.price && (
                    <span className="price text-sm font-medium">
                      {date.price}
                      {date.isLowestPrice && !date.selected && (
                        <span className="ml-1 text-xs">↓</span>
                      )}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleDateNavigate(1)}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-all"
              aria-label="Next week"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {loading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div className="loading-spinner rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 min-h-screen pb-12 pt-8">
        <div className="container mx-auto max-w-6xl px-4">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-md p-8">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-500" />
              </div>
              <p className="mt-6 text-gray-600 font-medium">Searching for the best flights...</p>
              <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Enhanced Filter Sidebar */}
              <div className="w-full md:w-1/4">
                <div className="bg-white rounded-xl shadow-md border border-gray-200 sticky top-24 overflow-hidden">
                  {/* Filter Header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-4 text-white relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10"></div>
                    <div className="absolute -right-1 top-8 h-8 w-8 rounded-full bg-white/10"></div>
                    <h3 className="text-lg font-bold flex items-center relative z-10">
                      <Filter className="h-5 w-5 mr-2" />
                      Filters
                    </h3>
                  </div>
                  
                  {/* Price Range */}
                  <div className="p-5 border-b border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-4">Price Range</h4>
                    <div className="px-2">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-blue-600">₹{filters.price[0]}</span>
                        <span className="text-sm font-medium text-blue-600">₹{filters.price[1]}</span>
                      </div>
                      
                      <input
                        type="range"
                        min="0"
                        max="50000"
                        step="1000"
                        value={filters.price[1]}
                        onChange={(e) => handleFilterChange('price', [filters.price[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>

                  {/* Stops */}
                  <div className="p-5 border-b border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-4">Stops</h4>
                    <div className="space-y-2">
                      <label className="flex items-center p-2 hover:bg-blue-50 rounded-md transition-colors cursor-pointer">
                        <input 
                          type="radio" 
                          name="stops"
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                          checked={filters.stops === "any"}
                          onChange={() => handleFilterChange('stops', "any")}
                        />
                        <span className="ml-2 text-gray-700">Any number of stops</span>
                      </label>
                      
                      <label className="flex items-center p-2 hover:bg-blue-50 rounded-md transition-colors cursor-pointer">
                        <input 
                          type="radio" 
                          name="stops"
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                          checked={filters.stops === "0"}
                          onChange={() => handleFilterChange('stops', "0")}
                        />
                        <span className="ml-2 text-gray-700">Non-stop only</span>
                      </label>
                      
                      <label className="flex items-center p-2 hover:bg-blue-50 rounded-md transition-colors cursor-pointer">
                        <input 
                          type="radio" 
                          name="stops"
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" 
                          checked={filters.stops === "1"}
                          onChange={() => handleFilterChange('stops', "1")}
                        />
                        <span className="ml-2 text-gray-700">1 stop max</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Airlines */}
                  <div className="p-5">
                    <h4 className="font-medium text-gray-800 mb-4">Airlines</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {getUniqueAirlines().map(airline => (
                        <label key={airline} className="flex items-center p-2 hover:bg-blue-50 rounded-md transition-colors cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                            checked={filters.airlines.includes(airline)}
                            onChange={() => toggleAirlineFilter(airline)}
                          />
                          <span className="ml-2 text-gray-700">{airline}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Reset Filters */}
                  <div className="p-5 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={() => {
                        setFilters({
                          price: [0, 20000],
                          stops: "any",
                          airlines: []
                        });
                      }}
                      className="w-full py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Results */}
              <div className="w-full md:w-3/4">
                {/* Sort Controls */}
                <div className="bg-white rounded-xl shadow-md p-5 mb-6 border border-gray-200">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <p className="text-gray-600">
                        <span className="font-bold text-blue-600 text-lg">{filteredFlights.length}</span> 
                        <span className="text-gray-700"> flights found</span>
                        {searchParams.from && searchParams.to && (
                          <span className="inline-flex items-center ml-2">
                            <span className="font-medium text-gray-800">{searchParams.from}</span>
                            <ArrowRight className="h-4 w-4 mx-1 text-gray-500" />
                            <span className="font-medium text-gray-800">{searchParams.to}</span>
                          </span>
                        )}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-700 font-medium">Sort by:</span>
                      <div className="relative">
                        <select
                          value={sortOrder}
                          onChange={(e) => setSortOrder(e.target.value)}
                          className="appearance-none pl-3 pr-10 py-2 bg-blue-50 border border-blue-200 rounded-lg text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="price">Price - Low to High</option>
                          <option value="-price">Price - High to Low</option>
                          <option value="duration">Duration - Shortest</option>
                          <option value="departure">Departure - Earliest</option>
                          <option value="arrival">Arrival - Earliest</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Flight Cards */}
                {filteredFlights.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-10 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
                      <Plane className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No flights found</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">We couldn't find any flights matching your criteria. Try adjusting your search filters or dates.</p>
                    <button 
                      onClick={() => {
                        setFilters({
                          price: [0, 20000],
                          stops: "any",
                          airlines: []
                        });
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md inline-flex items-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredFlights.map((flight, index) => (
                      <div 
                        key={index} 
                        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                      >
                        {/* Top section with airline and price */}
                        <div className="p-5">
                          <div className="flex flex-col md:flex-row items-center justify-between">
                            {/* Airline and Flight Info */}
                            <div className="flex items-center mb-4 md:mb-0">
                              <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded-lg mr-4 overflow-hidden shadow-sm">
                                <img 
                                  src={flight.segments[0]?.airline?.logo} 
                                  alt={flight.segments[0]?.airline?.name || 'Airline'}
                                  className="w-10 h-10 object-contain"
                                />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-lg">{flight.segments[0]?.airline?.name || 'Unknown Airline'}</h3>
                                <div className="text-sm text-gray-500 flex items-center">
                                  <span className="font-medium text-blue-600">{flight.segments[0]?.flightNumber || 'N/A'}</span>
                                  <span className="mx-2">•</span>
                                  <span>{flight.segments[0]?.aircraft || 'Unknown Aircraft'}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Price and Book Button */}
                            <div className="flex flex-col items-end">
                              <div className="text-right mb-3">
                                <div className="text-3xl font-bold text-blue-600 flex items-center">
                                  ${flight.price?.total || 'N/A'}
                                  {Math.random() > 0.7 && (
                                    <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-green-100 text-green-700 rounded-full">DEAL</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">per passenger</div>
                              </div>
                              <button
                                onClick={() => handleBookFlight(flight)}
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md font-medium"
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                          
                          {/* Flight Details */}
                          <div className="mt-6 grid grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <div className="font-medium">Departure</div>
                              <div>{flight.segments[0]?.departure?.date || 'N/A'}</div>
                              <div className="text-xs">
                                {flight.segments[0]?.departure?.airport || 'N/A'}
                                {flight.segments[0]?.departure?.terminal && (
                                  <span className="ml-1 text-blue-600">Terminal {flight.segments[0]?.departure?.terminal}</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">Arrival</div>
                              <div>{flight.segments[0]?.arrival?.date || 'N/A'}</div>
                              <div className="text-xs">
                                {flight.segments[0]?.arrival?.airport || 'N/A'}
                                {flight.segments[0]?.arrival?.terminal && (
                                  <span className="ml-1 text-blue-600">Terminal {flight.segments[0]?.arrival?.terminal}</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">Duration</div>
                              <div>{flight.duration || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="font-medium">Class</div>
                              <div>{flight.segments[0]?.cabin || 'Economy'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Enhanced Pagination */}
                {filteredFlights.length > 0 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="inline-flex items-center gap-1 bg-white rounded-lg shadow-md p-1.5">
                      <button className="p-2 rounded-md text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-50">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      <button className="w-9 h-9 rounded-md bg-blue-600 text-white font-medium flex items-center justify-center shadow-sm">
                        1
                      </button>
                      
                      <button className="w-9 h-9 rounded-md text-gray-700 hover:bg-blue-50 font-medium flex items-center justify-center">
                        2
                      </button>
                      
                      <button className="w-9 h-9 rounded-md text-gray-700 hover:bg-blue-50 font-medium flex items-center justify-center">
                        3
                      </button>
                      
                      <button className="p-2 rounded-md text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
