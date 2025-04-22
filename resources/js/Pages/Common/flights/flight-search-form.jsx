"use client"

import React, { useState, useEffect } from "react"
import { Calendar, Users, MapPin, Search, ChevronDown } from "lucide-react"
import { defaultSearchData, specialFares } from "./data.js"

// Get this from a config or parent component
const USE_AMADEUS_API = true;

export default function FlightSearchForm({ initialData, onSearch }) {
  const [formData, setFormData] = useState(initialData || defaultSearchData)
  const [formErrors, setFormErrors] = useState({})

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleTripTypeChange = (type) => {
    setFormData({ ...formData, tripType: type })
  }

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value })
    
    // Clear validation error when field is changed
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: null
      });
    }
  }

  const validateForm = () => {
    const errors = {};
    
    if (!formData.from) {
      errors.from = "Please enter departure city";
    }
    
    if (!formData.to) {
      errors.to = "Please enter destination city";
    }
    
    if (!formData.departDate) {
      errors.departDate = "Please select departure date";
    }
    
    if (formData.tripType === "roundTrip" && !formData.returnDate) {
      errors.returnDate = "Please select return date";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleSearch = () => {
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }
    
    if (onSearch) {
      onSearch(formData);
    } else {
      console.log("Search data:", formData)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Trip Type Selector */}
      <div className="w-72 rounded-full overflow-hidden bg-white">
        <div className="flex">
          <button
            onClick={() => handleTripTypeChange("oneWay")}
            className={`w-1/2 py-3 text-center font-medium transition-colors ${
              formData.tripType === "oneWay" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            One Way
          </button>
          <button
            onClick={() => handleTripTypeChange("roundTrip")}
            className={`w-1/2 py-3 text-center font-medium transition-colors ${
              formData.tripType === "roundTrip" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Round Trip
          </button>
        </div>
      </div>

      {/* Main Search Form */}
      <div className="w-full mx-auto bg-white rounded-xl shadow-md p-6" style={{ width: "1200px" }}>
        <div className="flex flex-row items-end justify-between gap-4">
          {/* From */}
          <div className="flex-1">
            <label className="text-gray-600 text-sm font-medium mb-2 block">From</label>
            <div className="relative">
              <input
                type="text"
                value={formData.from || ""}
                onChange={(e) => handleInputChange("from", e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Departure city"
              />
              <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            {formErrors.from && (
              <p className="text-red-500 text-xs mt-1">{formErrors.from}</p>
            )}
          </div>
          
          {/* To */}
          <div className="flex-1">
            <label className="text-gray-600 text-sm font-medium mb-2 block">To</label>
            <div className="relative">
              <input
                type="text"
                value={formData.to || ""}
                onChange={(e) => handleInputChange("to", e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Destination city"
              />
              <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            {formErrors.to && (
              <p className="text-red-500 text-xs mt-1">{formErrors.to}</p>
            )}
          </div>
          
          {/* Depart Date */}
          <div className="flex-1">
            <label className="text-gray-600 text-sm font-medium mb-2 block">Depart Date</label>
            <div className="relative">
              <input
                type="date"
                value={formData.departDate || ""}
                onChange={(e) => handleInputChange("departDate", e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Select date"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            </div>
            {formErrors.departDate && (
              <p className="text-red-500 text-xs mt-1">{formErrors.departDate}</p>
            )}
          </div>
          
          {/* Return Date - Only visible for Round Trip */}
          {formData.tripType === "roundTrip" && (
            <div className="flex-1">
              <label className="text-gray-600 text-sm font-medium mb-2 block">Return Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.returnDate || ""}
                  onChange={(e) => handleInputChange("returnDate", e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Select date"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              </div>
              {formErrors.returnDate && (
                <p className="text-red-500 text-xs mt-1">{formErrors.returnDate}</p>
              )}
            </div>
          )}
          
          {/* Travelers */}
          <div className="flex-1">
            <label className="text-gray-600 text-sm font-medium mb-2 block">Travelers</label>
            <div className="relative">
              <select
                value={formData.travelers || "2"}
                onChange={(e) => handleInputChange("travelers", e.target.value)}
                className="w-full p-3 appearance-none border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 Traveler</option>
                <option value="2">2 Travelers</option>
                <option value="3">3 Travelers</option>
                <option value="4">4+ Travelers</option>
              </select>
              <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>
          
          {/* Search Button */}
          <div className="ml-2">
            <button
              onClick={handleSearch}
              className="h-12 bg-[#1a56db] hover:bg-blue-700 text-white px-8 rounded-md flex items-center justify-center transition-colors"
            >
              <Search className="h-5 w-5 mr-2" />
              <span className="font-medium">Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Special Fares */}
      <div className="flex items-center gap-3">
        <span className="text-white font-medium">Special Fares:</span>
        <div className="flex gap-3">
          <button className="px-6 py-2 bg-gray-100 bg-opacity-30 hover:bg-opacity-40 text-white rounded-full border border-white">
            Student
          </button>
          <button className="px-6 py-2 bg-gray-100 bg-opacity-30 hover:bg-opacity-40 text-white rounded-full border border-white">
            Senior Citizen
          </button>
          <button className="px-6 py-2 bg-gray-100 bg-opacity-30 hover:bg-opacity-40 text-white rounded-full border border-white">
            Armed Forces
          </button>
        </div>
      </div>
    </div>
  )
}
