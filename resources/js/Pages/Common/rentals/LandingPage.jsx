import { Link } from "react-router-dom"
import Navbar from "../Navbar"
import Footer from "../Footer"
import { 
  Search, 
  Globe, 
  Users, 
  Calendar, 
  Star, 
  Mail, 
  Check, 
  Heart, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Coffee, 
  Wifi, 
  Tv, 
  Shield, 
  Clock, 
  MapPin,
  Award,
  Sparkles,
  X
} from "lucide-react"
import { hotels, popularDestinations } from "./hotel"
import { useState, useEffect, useRef } from "react"

export default function LandingPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [isFavorite, setIsFavorite] = useState({});
  const [isHovered, setIsHovered] = useState(null);
  const carouselRef = useRef(null);
  
  // Search states
  const [searchDestination, setSearchDestination] = useState("");
  const [searchPackageType, setSearchPackageType] = useState("All Inclusive");
  const [searchDates, setSearchDates] = useState("Select dates");
  const [searchTravelers, setSearchTravelers] = useState(2);
  const [filteredHotels, setFilteredHotels] = useState([]);
  
  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const datePickerRef = useRef(null);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Destination search suggestion states
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const destinationRef = useRef(null);

  // Extract unique destinations from hotels
  useEffect(() => {
    // Populate destination suggestions from hotels data
    const uniqueDestinations = [...new Set(hotels.map(hotel => hotel.location))];
    setDestinationSuggestions(uniqueDestinations);
  }, []);
  
  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDatePicker && datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
      
      if (showDestinationSuggestions && destinationRef.current && !destinationRef.current.contains(event.target)) {
        setShowDestinationSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker, showDestinationSuggestions]);
  
  // Generate calendar days for the date picker
  const generateCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    let days = Array(firstDayOfMonth).fill(null);
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };
  
  // Handle date selection
  const handleDateSelect = (day) => {
    if (!day) return;
    
    const selectedDate = new Date(currentYear, currentMonth, day);
    
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(selectedDate);
      setSelectedEndDate(null);
      setHoverDate(null);
    } else {
      if (selectedDate < selectedStartDate) {
        setSelectedStartDate(selectedDate);
        setSelectedEndDate(null);
      } else {
        setSelectedEndDate(selectedDate);
        
        // Format dates and update searchDates
        const startDateStr = `${selectedStartDate.getDate()} ${months[selectedStartDate.getMonth()].substring(0, 3)}`;
        const endDateStr = `${selectedDate.getDate()} ${months[selectedDate.getMonth()].substring(0, 3)}`;
        setSearchDates(`${startDateStr} - ${endDateStr} ${currentYear}`);
        setShowDatePicker(false);
      }
    }
  };
  
  // Handle date hover for range selection
  const handleDateHover = (day) => {
    if (!day || !selectedStartDate || selectedEndDate) return;
    setHoverDate(new Date(currentYear, currentMonth, day));
  };
  
  // Check if a date is in range
  const isInRange = (day) => {
    if (!day || !selectedStartDate) return false;
    
    const date = new Date(currentYear, currentMonth, day);
    const end = selectedEndDate || hoverDate;
    
    return end && date > selectedStartDate && date < end;
  };
  
  // Filter destination suggestions based on input
  const filterDestinations = (input) => {
    setSearchDestination(input);
    if (input.length > 0) {
      const filtered = destinationSuggestions.filter(dest => 
        dest.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowDestinationSuggestions(filtered.length > 0);
    } else {
      setShowDestinationSuggestions(false);
    }
  };
  
  // Reset date selection
  const resetDateSelection = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setHoverDate(null);
    setSearchDates("Select dates");
    setShowDatePicker(false);
  };

  // Handle scroll animations
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const sections = document.querySelectorAll('.animate-on-scroll');
      
      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionId = section.id;
        
        if (sectionTop < window.innerHeight * 0.75) {
          setIsVisible(prev => ({ ...prev, [sectionId]: true }));
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeIndex]);

  const nextSlide = () => {
    setActiveIndex((current) => (current === hotels.length - 1 ? 0 : current + 1));
  };

  const prevSlide = () => {
    setActiveIndex((current) => (current === 0 ? hotels.length - 1 : current - 1));
  };
  
  const toggleFavorite = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Features list for accommodations
  const features = [
    { icon: <Wifi size={20} />, text: "Free High-Speed WiFi" },
    { icon: <Coffee size={20} />, text: "Complimentary Breakfast" },
    { icon: <Tv size={20} />, text: "Smart TV & Entertainment" },
    { icon: <Shield size={20} />, text: "24/7 Security" },
    { icon: <Clock size={20} />, text: "Flexible Check-in" }
  ];
  
  // Amenities list with icons
  const amenities = [
    { icon: <Wifi size={18} />, text: "Free WiFi" },
    { icon: <Coffee size={18} />, text: "Breakfast" },
    { icon: <Shield size={18} />, text: "Security" }
  ];

  return (
    <main className="min-h-screen bg-white font-poppins overflow-x-hidden">
      {/* Navbar */}
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[650px] md:h-[750px] overflow-hidden">
        {/* Hero Background with Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-black/40 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1742943892619-501567da0c62?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Luxury Accommodation"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-slow-zoom"
        />

        {/* Animated Shapes */}
        <div className="absolute top-1/4 right-1/5 w-32 h-32 rounded-full bg-blue-500/10 animate-float-slow z-10"></div>
        <div className="absolute bottom-1/3 left-1/4 w-24 h-24 rounded-full bg-teal-500/10 animate-float-medium z-10"></div>

        {/* Special Offer Banner */}
        <div className="absolute top-[73px] w-full text-center bg-gradient-to-r from-blue-900/90 via-blue-800/90 to-blue-900/90 py-3 backdrop-blur-sm z-20 border-y border-blue-500/30">
          <div className="container mx-auto px-4 flex justify-center items-center">
            <Sparkles className="h-5 w-5 text-yellow-300 mr-2" />
            <p className="text-white text-base font-medium tracking-wide">
              <span className="text-yellow-300 font-bold">SUMMER SPECIAL:</span> 15% OFF on Premium Bookings! Call Now <span className="font-bold text-yellow-300">8121716969</span>
            </p>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute top-1/4 left-0 w-full px-8 md:px-12 z-20">
          <div className="max-w-7xl mx-auto">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight leading-tight">Experience Luxury <span className="text-yellow-300">&</span></h1>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">Exceptional Comfort</h1>
              <p className="text-xl text-white mb-8 tracking-wide max-w-2xl">— Your Perfect Getaway Awaits with Premium Amenities and World-Class Service</p>
            </div>

            {/* Search Form */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-5 max-w-5xl mx-auto animate-fade-in-up overflow-hidden" style={{ animationDelay: '0.4s' }}>
              <div className="relative">
                {/* Background Decorative Elements */}
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-blue-100/40 z-0"></div>
                <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-blue-50/30 z-0"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3 items-center px-3 py-2 relative z-10">
                  <div className="flex flex-col px-3 py-2 md:border-r border-gray-200/70">
                    <label className="text-sm text-gray-700 font-medium mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      Destination
                    </label>
                    <div className="relative group" ref={destinationRef}>
                      <input
                        type="text"
                        value={searchDestination}
                        onChange={(e) => filterDestinations(e.target.value)}
                        onFocus={() => {
                          if (searchDestination.length > 0) {
                            setShowDestinationSuggestions(true);
                          }
                        }}
                        placeholder="Where do you want"
                        className="w-full py-3 pl-4 pr-10 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-200 group-hover:shadow-sm"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <div className="p-1 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                          <Globe className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                      
                      {/* Destination Suggestions Dropdown */}
                      {showDestinationSuggestions && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
                          <ul className="py-1">
                            {filteredSuggestions.map((destination, index) => (
                              <li 
                                key={index}
                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center"
                                onClick={() => {
                                  setSearchDestination(destination);
                                  setShowDestinationSuggestions(false);
                                }}
                              >
                                <MapPin className="h-4 w-4 text-blue-500 mr-2" />
                                <span>{destination}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col px-3 py-2 md:border-r border-gray-200/70">
                    <label className="text-sm text-gray-700 font-medium mb-2 flex items-center gap-2">
                      <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                      </svg>
                      Package Type
                    </label>
                    <div className="relative group">
                      <select 
                        value={searchPackageType}
                        onChange={(e) => setSearchPackageType(e.target.value)}
                        className="w-full py-3 pl-4 pr-10 bg-gray-50/80 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-200 group-hover:shadow-sm"
                      >
                        <option>All Inclusive</option>
                        <option>Premium</option>
                        <option>Standard</option>
                        <option>Budget</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <div className="p-1 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col px-3 py-2 md:border-r border-gray-200/70">
                    <label className="text-sm text-gray-700 font-medium mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Travel Date
                    </label>
                    <div className="relative group" ref={datePickerRef}>
                      <div 
                        onClick={() => setShowDatePicker(!showDatePicker)} 
                        className="flex items-center w-full py-3 pl-4 pr-10 bg-gray-50/80 border border-gray-200 rounded-xl cursor-pointer transition-all duration-300 hover:border-blue-200 group-hover:shadow-sm"
                      >
                        <span className="text-gray-700">{searchDates}</span>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <div className="p-1 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                            <Calendar className="h-4 w-4 text-blue-500" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Date Picker Dropdown */}
                      {showDatePicker && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden w-72 md:w-80">
                          <div className="p-3 pb-0">
                            <div className="flex justify-between items-center mb-2">
                              <div className="text-sm font-medium text-gray-900">Select dates</div>
                              <button 
                                onClick={resetDateSelection}
                                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            
                            <div className="flex justify-between items-center mb-2">
                              <button 
                                onClick={() => {
                                  if (currentMonth === 0) {
                                    setCurrentMonth(11);
                                    setCurrentYear(currentYear - 1);
                                  } else {
                                    setCurrentMonth(currentMonth - 1);
                                  }
                                }}
                                className="p-1 rounded-full hover:bg-gray-100"
                              >
                                <ChevronLeft size={18} className="text-gray-600" />
                              </button>
                              
                              <span className="text-sm font-medium">
                                {months[currentMonth]} {currentYear}
                              </span>
                              
                              <button 
                                onClick={() => {
                                  if (currentMonth === 11) {
                                    setCurrentMonth(0);
                                    setCurrentYear(currentYear + 1);
                                  } else {
                                    setCurrentMonth(currentMonth + 1);
                                  }
                                }}
                                className="p-1 rounded-full hover:bg-gray-100"
                              >
                                <ChevronRight size={18} className="text-gray-600" />
                              </button>
                            </div>
                            
                            {/* Day names */}
                            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
                              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
                                <div key={i} className="py-1">{day}</div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Calendar grid */}
                          <div className="grid grid-cols-7 gap-0 p-2 pt-0">
                            {generateCalendarDays().map((day, index) => {
                              if (day === null) {
                                return <div key={index} className="h-8 w-8"></div>;
                              }
                              
                              const date = new Date(currentYear, currentMonth, day);
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              
                              const isToday = date.getTime() === today.getTime();
                              const isPast = date < today;
                              const isSelected = selectedStartDate && date.getTime() === selectedStartDate.getTime() || 
                                                selectedEndDate && date.getTime() === selectedEndDate.getTime();
                              const isRangeDate = isInRange(day);
                              
                              return (
                                <div 
                                  key={index}
                                  className="flex items-center justify-center"
                                  onMouseEnter={() => handleDateHover(day)}
                                >
                                  <button
                                    type="button"
                                    disabled={isPast}
                                    onClick={() => handleDateSelect(day)}
                                    className={`
                                      h-8 w-8 rounded-full text-xs flex items-center justify-center
                                      ${isPast ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50'}
                                      ${isToday ? 'border border-blue-400' : ''}
                                      ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                                      ${isRangeDate ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''}
                                    `}
                                  >
                                    {day}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Footer */}
                          <div className="border-t border-gray-200 p-2 text-right">
                            <button 
                              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                              onClick={() => {
                                if (selectedStartDate && !selectedEndDate) {
                                  // If only start date is selected, use current date as end date
                                  const endDate = new Date(selectedStartDate);
                                  endDate.setDate(endDate.getDate() + 5); // Default 5-day stay
                                  setSelectedEndDate(endDate);
                                  
                                  const startDateStr = `${selectedStartDate.getDate()} ${months[selectedStartDate.getMonth()].substring(0, 3)}`;
                                  const endDateStr = `${endDate.getDate()} ${months[endDate.getMonth()].substring(0, 3)}`;
                                  setSearchDates(`${startDateStr} - ${endDateStr} ${currentYear}`);
                                }
                                setShowDatePicker(false);
                              }}
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col px-3 py-2">
                    <label className="text-sm text-gray-700 font-medium mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      Travelers
                    </label>
                    <div className="relative group">
                      <div 
                        onClick={() => setSearchTravelers(searchTravelers === 2 ? 4 : 2)}
                        className="flex items-center w-full py-3 pl-4 pr-10 bg-gray-50/80 border border-gray-200 rounded-xl cursor-pointer transition-all duration-300 hover:border-blue-200 group-hover:shadow-sm"
                      >
                        <span className="text-gray-700">{searchTravelers} Travelers</span>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <div className="p-1 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                            <Users className="h-4 w-4 text-blue-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center md:justify-end px-3 mt-4 mb-1 relative z-10">
                  <Link 
                    to={`/hotel-details?destination=${encodeURIComponent(searchDestination)}&packageType=${encodeURIComponent(searchPackageType)}&dates=${encodeURIComponent(searchDates)}&travelers=${searchTravelers}`} 
                    className="w-full md:w-auto"
                    onClick={(e) => {
                      // If destination is empty and there's a first hotel, navigate directly to it
                      if (!searchDestination.trim() && hotels.length > 0) {
                        e.preventDefault();
                        window.location.href = `/hotel-details?id=${hotels[0].id}`;
                      }
                    }}
                  >
                    <button className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3.5 px-10 rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-3 shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5">
                      <Search size={20} />
                      <span>Search</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Trust Badges */}
        <div className="absolute bottom-8 left-0 w-full z-20 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-800">Secure Booking</span>
              </div>
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                <Check className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-800">Best Price Guarantee</span>
              </div>
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-800">24/7 Customer Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Most Popular Section - Enhanced with Interactive Carousel */}
      <div className="py-20 bg-gradient-to-b from-[#f0f7fa] to-white" id="popular-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-on-scroll" id="popular-heading">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold tracking-wider mb-3">TOP-RATED ACCOMMODATIONS</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Most Popular Stays</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-teal-400 mx-auto"></div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Discover our most booked accommodations with exceptional amenities and stunning views</p>
          </div>

          <div className="relative max-w-6xl mx-auto animate-on-scroll" id="carousel" ref={carouselRef}>
            <button 
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors -ml-5 md:-ml-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Previous slide"
            >
              <ChevronLeft className="text-blue-600" size={24} />
            </button>
            
            <div className="overflow-hidden rounded-2xl shadow-xl">
              <div 
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {hotels.map((hotel, index) => (
                  <div key={hotel.id} className="min-w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 bg-white overflow-hidden">
                      <div className="relative h-80 md:h-auto overflow-hidden">
                        <img
                          src={hotel.images.main || "/placeholder.svg"}
                          alt={hotel.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        
                        {/* Rating Badge */}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center shadow-md">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm font-semibold">5.0</span>
                          <span className="text-xs text-gray-500 ml-1">(128 reviews)</span>
                        </div>
                        
                        {/* Favorite Button */}
                        <button 
                          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500 transition-colors shadow-md focus:outline-none"
                          onClick={(e) => toggleFavorite(hotel.id, e)}
                          aria-label="Add to favorites"
                        >
                          <Heart size={20} className={isFavorite[hotel.id] ? "text-red-500 fill-red-500" : ""} />
                        </button>
                        
                        {/* Price Badge */}
                        <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                          ${hotel.price} <span className="text-xs font-normal">per night</span>
                        </div>
                      </div>
                      
                      <div className="p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-2xl font-bold text-gray-800">{hotel.name}</h3>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-4 text-gray-600">
                            <MapPin size={18} className="text-blue-500" />
                            <span className="text-sm">{hotel.location}</span>
                          </div>
                          
                          <p className="text-gray-600 mb-6 leading-relaxed">
                            Experience luxury in the heart of nature with stunning views and premium amenities. Perfect for both relaxation and adventure seekers.
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                            {features.slice(0, 4).map((feature, idx) => (
                              <div key={idx} className="flex items-center text-gray-700">
                                <div className="mr-2 text-blue-500">{feature.icon}</div>
                                <span className="text-sm">{feature.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-auto">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <Link
                              to={`/hotel-details?id=${hotel.id}`}
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium inline-flex items-center gap-2 shadow-md hover:shadow-blue-500/30 group"
                            >
                              View Details
                              <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-1" />
                            </Link>
                            
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-500">Available:</span>
                              <span className="text-sm font-semibold text-green-600">Today</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-blue-50 transition-colors -mr-5 md:-mr-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Next slide"
            >
              <ChevronRight className="text-blue-600" size={24} />
            </button>
            
            <div className="flex justify-center gap-2 mt-8">
              {hotels.slice(0, 5).map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveIndex(idx)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none ${idx === activeIndex ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16 animate-on-scroll" id="stats">
            <div className="bg-white rounded-xl shadow-md p-6 text-center transform transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">500+</h3>
              <p className="text-gray-600">Premium Properties</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center transform transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">10,000+</h3>
              <p className="text-gray-600">Happy Guests</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center transform transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">4.9/5</h3>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="py-20 bg-white" id="destinations-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-on-scroll" id="destinations-heading">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold tracking-wider mb-3">DREAM DESTINATIONS</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore Stays in Popular Destinations</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-teal-400 mx-auto"></div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Discover beautiful locations with premium accommodations for your perfect getaway</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto animate-on-scroll" id="destinations-grid">
            {popularDestinations.slice(0, 8).map((destination) => (
              <Link 
                to="/hotel-details" 
                key={destination.id} 
                className="group"
                onMouseEnter={() => setIsHovered(destination.id)}
                onMouseLeave={() => setIsHovered(null)}
              >
                <div className="relative rounded-xl overflow-hidden shadow-lg h-72 group transform transition-transform hover:-translate-y-2 hover:shadow-xl">
                  {destination.popular && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-full text-xs z-10 font-medium shadow-lg">
                      Popular Choice
                    </div>
                  )}
                  <img
                    src={destination.image || "/placeholder.svg"}
                    alt={destination.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                    <h3 className="text-xl font-bold mb-1 group-hover:text-blue-300 transition-colors">{destination.name}</h3>
                    <div className="flex items-center mb-3">
                      <MapPin size={16} className="mr-1 text-blue-300" />
                      <p className="text-sm text-gray-200">{destination.location}</p>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center">
                        <Star className="h-3 w-3 mr-1 text-yellow-400" />
                        <span className="text-xs">{destination.hotelCount} properties available</span>
                      </div>
                    </div>
                    
                    <div className="transform transition-all duration-300 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                      <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 w-full justify-center">
                        Explore Properties <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Featured Destination Highlight */}
          <div className="mt-16 max-w-6xl mx-auto animate-on-scroll" id="featured-destination">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold tracking-wider mb-3">FEATURED DESTINATION</span>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Discover Jammu & Kashmir</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Experience the breathtaking beauty of Jammu & Kashmir with its stunning landscapes, serene lakes, and majestic mountains. Our handpicked accommodations offer the perfect blend of luxury and authentic local experiences.
                  </p>
                  <ul className="mb-8 space-y-2">
                    <li className="flex items-center text-gray-700">
                      <Check size={18} className="text-green-500 mr-2" />
                      <span>Luxury accommodations with mountain views</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <Check size={18} className="text-green-500 mr-2" />
                      <span>Guided tours to scenic locations</span>
                    </li>
                    <li className="flex items-center text-gray-700">
                      <Check size={18} className="text-green-500 mr-2" />
                      <span>Authentic local cuisine experiences</span>
                    </li>
                  </ul>
                  <div>
                    <Link 
                      to="/destinations/kashmir" 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium inline-flex items-center gap-2 shadow-md hover:shadow-blue-500/30 group"
                    >
                      Explore Kashmir
                      <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
                <div className="relative h-64 md:h-auto">
                  <img 
                    src="https://images.unsplash.com/photo-1566837497312-7be7830ae9b1?q=80&w=2070&auto=format&fit=crop" 
                    alt="Jammu & Kashmir" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-blue-900/20"></div>
                  
                  {/* Price Badge */}
                  <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                    <p className="text-sm font-semibold text-gray-900">Starting from</p>
                    <p className="text-2xl font-bold text-blue-600">$199<span className="text-sm font-normal text-gray-600">/night</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Testimonials - Moved here */}
          <div className="mt-24 animate-on-scroll" id="testimonials-section">
            <div className="text-center mb-12" id="testimonials-heading">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold tracking-wider mb-3">WHAT OUR GUESTS SAY</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Guest Testimonials</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-teal-400 mx-auto"></div>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Read what our satisfied guests have to say about their experiences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto" id="testimonials-grid">
              <div className="bg-white p-8 rounded-xl shadow-lg relative transform transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                <div className="absolute -top-5 left-8">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl font-serif">"</span>
                  </div>
                </div>
                <p className="text-gray-600 italic mt-6 mb-6 leading-relaxed">
                  "The stay exceeded our expectations. The staff was incredibly attentive, and the room views were breathtaking. The attention to detail made our anniversary truly special. Definitely coming back!"
                </p>
                <div className="flex items-center">
                  <div className="mr-4">
                    <img 
                      src="https://randomuser.me/api/portraits/women/12.jpg" 
                      alt="Guest" 
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-100"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">New York, USA</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg relative transform transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                <div className="absolute -top-5 left-8">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl font-serif">"</span>
                  </div>
                </div>
                <p className="text-gray-600 italic mt-6 mb-6 leading-relaxed">
                  "Perfect for our family vacation! The kids loved the activities, and we enjoyed the spa. The amenities were top-notch and worth every penny. The staff went above and beyond to make our stay memorable."
                </p>
                <div className="flex items-center">
                  <div className="mr-4">
                    <img 
                      src="https://randomuser.me/api/portraits/men/32.jpg" 
                      alt="Guest" 
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-100"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Michael Torres</p>
                    <p className="text-sm text-gray-500">San Francisco, USA</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg relative transform transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                <div className="absolute -top-5 left-8">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl font-serif">"</span>
                  </div>
                </div>
                <p className="text-gray-600 italic mt-6 mb-6 leading-relaxed">
                  "The honeymoon suite was magical! From the champagne welcome to the private balcony, every detail was perfect. The concierge helped plan amazing excursions. We'll treasure these memories forever."
                </p>
                <div className="flex items-center">
                  <div className="mr-4">
                    <img 
                      src="https://randomuser.me/api/portraits/women/44.jpg" 
                      alt="Guest" 
                      className="w-14 h-14 rounded-full object-cover border-2 border-blue-100"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Emily Patel</p>
                    <p className="text-sm text-gray-500">London, UK</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Review Stats */}
            <div className="flex flex-wrap justify-center items-center gap-8 mt-16 max-w-4xl mx-auto" id="review-stats">
              <div className="bg-white px-6 py-4 rounded-xl shadow-md flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">4.9/5</p>
                  <p className="text-sm text-gray-500">Average Rating</p>
                </div>
              </div>
              
              <div className="bg-white px-6 py-4 rounded-xl shadow-md flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">15,000+</p>
                  <p className="text-sm text-gray-500">Happy Guests</p>
                </div>
              </div>
              
              <div className="bg-white px-6 py-4 rounded-xl shadow-md flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">98%</p>
                  <p className="text-sm text-gray-500">Satisfaction Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="py-12 bg-[#f0f7fa]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <Mail className="h-10 w-10 text-[#0061ff]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Subscribe to Our Newsletter</h3>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Be the first to know about special offers, new properties, and travel tips. Get exclusive deals directly to your inbox!
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-[#0061ff] text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 group">
                Subscribe
                <ArrowRight size={16} className="transform transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-lg font-bold text-gray-800">Trusted By Travelers Worldwide</h3>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 max-w-4xl mx-auto">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Tripadvisor_logo.svg/512px-Tripadvisor_logo.svg.png" alt="TripAdvisor" className="h-8 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Booking.com_logo.svg/512px-Booking.com_logo.svg.png" alt="Booking.com" className="h-8 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Expedia_logo.svg/512px-Expedia_logo.svg.png" alt="Expedia" className="h-8 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Airbnb_Logo_B%C3%A9lo.svg/512px-Airbnb_Logo_B%C3%A9lo.svg.png" alt="Airbnb" className="h-8 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Logo_of_Hotels.com.svg/512px-Logo_of_Hotels.com.svg.png" alt="Hotels.com" className="h-8 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
          </div>
          
          <div className="flex justify-center gap-8 mt-8 max-w-xl mx-auto">
            <div className="flex items-center">
              <Check className="text-green-500 mr-2" />
              <span className="text-sm text-gray-600">Secure Booking</span>
            </div>
            <div className="flex items-center">
              <Check className="text-green-500 mr-2" />
              <span className="text-sm text-gray-600">24/7 Support</span>
            </div>
            <div className="flex items-center">
              <Check className="text-green-500 mr-2" />
              <span className="text-sm text-gray-600">Best Price Guarantee</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}