"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Calendar, MapPin, Users, CreditCard, Check } from "lucide-react"
import { hotels } from "./data/hotels"

export default function BookingPage() {
  // Get the id from URL query parameters
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const id = searchParams.get("id") || "hotel-1"

  // Find the hotel from our data
  const selectedHotel = hotels.find((h) => h.id === id) || hotels[0]

  const [days, setDays] = useState(4)
  const pricePerDay = selectedHotel.price
  const serviceFee = 50
  const totalPrice = days * pricePerDay + serviceFee

  const decreaseDays = () => {
    if (days > 1) {
      setDays(days - 1)
    }
  }

  const increaseDays = () => {
    setDays(days + 1)
  }

  return (
    <main className="min-h-screen bg-white font-poppins">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center text-sm">
          <Link to="/" className="text-gray-800 hover:text-blue-600 font-medium">
            Home
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to={`/hotel-details?id=${selectedHotel.id}`} className="text-gray-800 hover:text-blue-600 font-medium">
            Hotel Details
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800 font-medium">Book now</span>
        </div>
      </div>

      {/* Title Section */}
      <div className="container mx-auto px-4 text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[#006d77] tracking-tight">{selectedHotel.name}</h1>
        <div className="flex items-center justify-center mt-2">
          <MapPin className="h-4 w-4 text-gray-500 mr-1" />
          <p className="text-gray-600">{selectedHotel.location}</p>
        </div>
      </div>

      {/* Booking Information */}
      <div className="container mx-auto px-4 mb-16 max-w-6xl">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 tracking-tight">Booking Information</h2>
        <p className="text-center text-gray-600 mb-10 text-sm">Please fill up the blank fields below</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Hotel Image and Info */}
          <div>
            <div className="rounded-xl overflow-hidden mb-6 shadow-lg">
              <img
                src={selectedHotel.images.main || "/placeholder.svg"}
                alt={selectedHotel.name}
                className="w-full h-80 object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-[#006d77] tracking-tight">{selectedHotel.name}</h3>
            <div className="flex items-center mt-2 mb-4">
              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
              <p className="text-gray-600">{selectedHotel.location}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Hotel Policies</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Check-in time: 2:00 PM - 12:00 AM</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Check-out time: 12:00 PM</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Pets not allowed</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Free cancellation up to 48 hours before check-in</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <div className="space-y-6">
              <div>
                <h4 className="text-gray-900 mb-3 text-sm font-semibold">How long you will stay?</h4>
                <div className="flex items-center">
                  <button
                    onClick={decreaseDays}
                    className="w-12 h-12 bg-red-500 text-white flex items-center justify-center rounded-l-lg shadow-sm text-lg font-medium"
                  >
                    -
                  </button>
                  <div className="h-12 px-6 flex items-center justify-center bg-gray-50 text-gray-900 font-semibold text-lg">
                    {days} Days
                  </div>
                  <button
                    onClick={increaseDays}
                    className="w-12 h-12 bg-[#0061ff] text-white flex items-center justify-center rounded-r-lg shadow-sm text-lg font-medium"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-gray-900 mb-3 text-sm font-semibold">Pick a Date</h4>
                <div className="flex items-center border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <Calendar className="text-[#0061ff] mr-3" size={20} />
                  <span className="text-gray-900 font-medium">24 Jul - 28 Jul 2022</span>
                </div>
              </div>

              <div>
                <h4 className="text-gray-900 mb-3 text-sm font-semibold">Guests</h4>
                <div className="flex items-center border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <Users className="text-[#0061ff] mr-3" size={20} />
                  <span className="text-gray-900 font-medium">2 Adults, 1 Child</span>
                </div>
              </div>

              <div>
                <h4 className="text-gray-900 mb-3 text-sm font-semibold">Contact Information</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-gray-900 mb-3 text-sm font-semibold">Payment Summary</h4>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      ${pricePerDay} x {days} nights
                    </span>
                    <span className="font-medium">${pricePerDay * days}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service fee</span>
                    <span className="font-medium">${serviceFee}</span>
                  </div>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-[#0061ff]">${totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-4">
              <button className="w-full bg-[#0061ff] text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center">
                <CreditCard className="mr-2" size={18} />
                Complete Booking
              </button>
              <Link
                to={`/hotel-details?id=${selectedHotel.id}`}
                className="block w-full bg-gray-100 text-gray-800 py-4 rounded-xl font-medium text-center hover:bg-gray-200 transition"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}