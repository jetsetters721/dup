"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function TravelDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("Upcoming")
  const [activeSidebarItem, setActiveSidebarItem] = useState("All Bookings")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const authStatus = localStorage.getItem('isAuthenticated')
    if (authStatus !== 'true') {
      // Redirect to login if not authenticated
      navigate('/login')
    } else {
      setIsAuthenticated(true)
    }
  }, [navigate])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleSidebarItemChange = (item) => {
    setActiveSidebarItem(item)
  }

  if (!isAuthenticated) {
    return null // Don't render anything while checking authentication
  }

  return (
    <div className="min-h-screen bg-[#f0f7fc]">
      {/* Header with back button */}
      <header className="container mx-auto px-4 sm:px-6 py-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center text-[#006d92] hover:text-[#005a7a] transition mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span className="ml-2 font-medium">Back to Home</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Trips</h1>
      </header>

      {/* Filter tabs */}
      <div className="flex justify-end px-4 sm:px-6 py-4 gap-2">
        {["Upcoming", "Cancelled", "Past", "Failed"].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-1.5 rounded-full text-sm ${
              activeTab === tab ? "bg-[#0ea5e9] text-white" : "bg-white border border-gray-300 text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row px-4 sm:px-6 gap-4 md:gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pl-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-lg font-semibold">My Trips</span>
          </div>

          <nav className="space-y-1">
            {["All Bookings", "Flights", "Cruise", "Packages"].map((item) => (
              <button
                key={item}
                onClick={() => handleSidebarItemChange(item)}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  activeSidebarItem === item ? "bg-[#d9e9f1]" : ""
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-64 h-64 flex items-center justify-center">
              <img
                src="/images/empty-trips.svg" 
                alt="No bookings illustration"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "https://via.placeholder.com/300?text=No+Bookings"
                }}
              />
            </div>
            <h2 className="text-xl font-semibold mt-4">No {activeTab} Bookings</h2>
            <p className="text-gray-500 mt-2 text-center">
              You don't have any {activeTab.toLowerCase()} trips. 
              <br/>
              When you book a trip, it will appear here.
            </p>
            <button 
              onClick={() => navigate('/')} 
              className="mt-6 px-6 py-2 bg-[#0ea5e9] text-white rounded-md hover:bg-[#0284c7] transition"
            >
              Book a Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
