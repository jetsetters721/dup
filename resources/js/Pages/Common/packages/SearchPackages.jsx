import { Search, MapPin, Star, ArrowRight, Clock, DollarSign, Heart, Plane, X, ChevronDown } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import packagesData from '../../../data/packages.json'
import Navbar from '../Navbar'
import Footer from '../Footer'

const SearchPackages = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "")
  const [selectedPackageType, setSelectedPackageType] = useState(searchParams.get('type') || "All Inclusive")
  const [likedPackages, setLikedPackages] = useState([])
  const [sortBy, setSortBy] = useState("recommended")
  const [isSearching, setIsSearching] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)

  // Combine all packages into one array for search
  const allPackages = useMemo(() => [
    ...(packagesData.dubai?.packages || []),
    ...(packagesData.europe?.packages || []),
    ...(packagesData.kashmir?.packages || []),
    ...(packagesData.northEast?.packages || [])
  ], [])

  const packageTypes = ["All Inclusive", "Flight + Hotel", "Activities Only", "Cruise Package"]
  const sortOptions = [
    { value: "recommended", label: "Recommended" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
    { value: "duration", label: "Duration" }
  ]

  // Update URL and trigger search
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedPackageType) params.set('type', selectedPackageType)
    navigate({ search: params.toString() }, { replace: true })
    
    // Show searching state briefly
    setIsSearching(true)
    const timer = setTimeout(() => setIsSearching(false), 300)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedPackageType])

  const toggleLike = (packageId) => {
    setLikedPackages(prev => 
      prev.includes(packageId) 
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    )
  }

  // Enhanced search and filter logic
  const filteredPackages = useMemo(() => {
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(Boolean)
    
    return allPackages
      .filter(pkg => {
        if (!pkg) return false

        // Match all search terms (AND logic)
        const matchesSearch = !searchQuery || searchTerms.every(term => {
          const searchableText = [
            pkg.title,
            pkg.location,
            pkg.description,
            ...(pkg.features || []),
            ...(pkg.highlights || [])
          ].join(' ').toLowerCase()
          
          return searchableText.includes(term)
        })

        const matchesType = selectedPackageType === "All Inclusive" || 
          pkg.features?.includes(selectedPackageType)

        return matchesSearch && matchesType
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "price_low":
            return parseFloat(a.price) - parseFloat(b.price)
          case "price_high":
            return parseFloat(b.price) - parseFloat(a.price)
          case "rating":
            return parseFloat(b.rating) - parseFloat(a.rating)
          case "duration":
            return a.duration.localeCompare(b.duration)
          default:
            // For recommended, prioritize rating and review count
            const aScore = (parseFloat(a.rating) * parseFloat(a.reviews))
            const bScore = (parseFloat(b.rating) * parseFloat(b.reviews))
            return bScore - aScore
        }
      })
  }, [searchQuery, selectedPackageType, sortBy, allPackages])

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setIsSearching(true)
    setTimeout(() => setIsSearching(false), 300)
  }

  // Handle search input with debounce
  const handleSearchInput = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    setIsTyping(true)

    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Set new timeout
    const newTimeout = setTimeout(() => {
      setIsTyping(false)
    }, 1000) // Hide back button for 1 second after last keystroke

    setTypingTimeout(newTimeout)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    }
  }, [typingTimeout])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Search Header with Back Button */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col space-y-4">
            {/* Back Button Row */}
            <div className={`flex items-center transition-all duration-300 ${
              isTyping ? 'opacity-0 h-0 invisible' : 'opacity-100 h-auto visible'
            }`}>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-300"
              >
                <ArrowRight className="rotate-180" size={20} />
                <span className="font-medium">Back to Home</span>
              </button>
            </div>

            {/* Search Form Row */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Enhanced Search Input */}
              <div className="relative flex-1 w-full group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search 
                    className={`transition-all duration-300 ${
                      isSearching 
                        ? 'text-blue-500 animate-spin' 
                        : 'text-gray-400 group-hover:text-blue-500 group-focus-within:text-blue-500'
                    }`}
                    size={20} 
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search destinations, packages, or activities..."
                  value={searchQuery}
                  onChange={handleSearchInput}
                  className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-200 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    hover:border-blue-300 transition-all duration-300
                    placeholder-gray-400 text-gray-700"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("")
                      setIsTyping(false)
                      if (typingTimeout) {
                        clearTimeout(typingTimeout)
                      }
                    }}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 
                      hover:text-blue-500 transition-colors duration-300"
                  >
                    <X size={16} />
                  </button>
                )}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-blue-500 
                  group-hover:w-[calc(100%-2rem)] group-focus-within:w-[calc(100%-2rem)] 
                  transition-all duration-300 rounded-full"
                ></div>
              </div>

              {/* Filters */}
              <div className="flex gap-4 items-center">
                {/* Package Type Filter */}
                <div className="relative min-w-[180px] group">
                  <select
                    value={selectedPackageType}
                    onChange={(e) => setSelectedPackageType(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white pr-10 
                      cursor-pointer hover:border-blue-500 focus:ring-2 focus:ring-blue-500 
                      focus:border-blue-500 transition-all appearance-none"
                  >
                    {packageTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                      pointer-events-none group-hover:text-blue-500 transition-colors duration-300" 
                    size={20} 
                  />
                </div>

                {/* Sort Filter */}
                <div className="relative min-w-[180px] group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white pr-10 
                      cursor-pointer hover:border-blue-500 focus:ring-2 focus:ring-blue-500 
                      focus:border-blue-500 transition-all appearance-none"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                      pointer-events-none group-hover:text-blue-500 transition-colors duration-300" 
                    size={20} 
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Count & Clear Filters */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {isSearching ? (
              <span className="inline-flex items-center gap-2">
                <Plane className="animate-bounce" size={24} />
                Searching...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                {filteredPackages.length} packages found
                {searchQuery && (
                  <span className="text-gray-500 text-base font-normal">
                    for "{searchQuery}"
                  </span>
                )}
              </span>
            )}
          </h2>
          {(searchQuery || selectedPackageType !== "All Inclusive") && (
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedPackageType("All Inclusive")
              }}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              <X size={16} />
              Clear filters
            </button>
          )}
        </div>

        {/* Package Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 
          transition-opacity duration-300 ${isSearching ? 'opacity-50' : 'opacity-100'}`}
        >
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl 
                transition-all duration-500 transform hover:-translate-y-1"
            >
              {/* Package Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                
                {/* Like Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    toggleLike(pkg.id)
                  }}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-all duration-300 transform hover:scale-110"
                >
                  <Heart
                    size={20}
                    className={`${likedPackages.includes(pkg.id) ? 'fill-red-500 text-red-500' : 'text-white'} transition-colors duration-300`}
                  />
                </button>

                {/* Discount Tag */}
                {pkg.discount && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium transform -rotate-2 animate-pulse">
                    {pkg.discount}% OFF
                  </div>
                )}

                {/* Package Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg mb-1">{pkg.title}</h3>
                  {pkg.location && (
                    <div className="flex items-center gap-1 text-white/90">
                      <MapPin size={16} />
                      <span className="text-sm">{pkg.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Package Details */}
              <div className="p-4">
                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {pkg.features?.slice(0, 3).map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Rating & Duration */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400 fill-yellow-400" size={16} />
                    <span className="text-sm font-medium">{pkg.rating}</span>
                    <span className="text-gray-500 text-sm">({pkg.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock size={16} />
                    <span className="text-sm">{pkg.duration}</span>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-end justify-between border-t pt-3">
                  <div>
                    <p className="text-gray-500 text-sm">Starting from</p>
                    <div className="flex items-center gap-1">
                      <DollarSign size={18} className="text-blue-600" />
                      <span className="text-2xl font-bold text-blue-600">{pkg.price}</span>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 text-sm font-medium group">
                    View Details
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {!isSearching && filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <Plane className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No packages found</h3>
            <p className="text-gray-600">
              {searchQuery ? (
                <>
                  No results found for "{searchQuery}". Try different keywords or 
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="text-blue-600 ml-1"
                  >
                    clear your search
                  </button>
                </>
              ) : (
                'Try adjusting your filters'
              )}
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default SearchPackages 