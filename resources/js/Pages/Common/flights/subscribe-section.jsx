"use client"

import React, { useState } from "react"
import { subscriptionAirplane } from "./data.js"

export default function SubscribeSection() {
  const [email, setEmail] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = () => {
    if (email && agreed) {
      // In a real app, this would submit to an API
      console.log("Subscribing email:", email)
      setSubscribed(true)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-[url('https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center rounded-xl overflow-hidden shadow-2xl relative">
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-900/70 backdrop-blur-sm"></div>
        
        {/* Content container */}
        <div className="relative z-10 p-10 md:p-16">
          {/* Cloud elements */}
          <div className="absolute top-0 left-0 w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="text-white/10">
              <path fill="currentColor" d="M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,197.3C672,213,768,203,864,186.7C960,171,1056,149,1152,149.3C1248,149,1344,171,1392,181.3L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
            </svg>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Left side - promotional content */}
            <div className="md:w-1/2 text-white">
              <div className="inline-block mb-6 bg-yellow-500 text-blue-900 px-4 py-1 rounded-full font-bold text-sm shadow-lg transform -rotate-2">
                EXCLUSIVE OFFER
              </div>
              
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-md">
                GET <span className="text-yellow-400">50% OFF</span> ON YOUR NEXT FLIGHT BOOKING!
              </h2>
              
              <div className="flex gap-6 mb-8 flex-wrap">
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Limited time offer</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span>Secure booking</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <span>Free cancellation</span>
                </div>
              </div>
              
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 bg-yellow-500/20 h-24 w-24 rounded-full blur-xl"></div>
                
                <p className="text-lg mb-6">
                  Join over <span className="font-bold text-yellow-400">2.5 million travelers</span> and get the best flight deals directly to your inbox. Be the first to know about:
                </p>
                
                <ul className="mb-8 space-y-2">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Flash sales and special seasonal offers</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Exclusive member-only discounts</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Personalized destination recommendations</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Right side - form */}
            <div className="md:w-1/2">
              {subscribed ? (
                <div className="bg-white rounded-xl shadow-2xl p-8 relative overflow-hidden">
                  <div className="absolute -left-12 -top-12 bg-green-500/10 h-40 w-40 rounded-full blur-xl"></div>
                  <div className="absolute -right-12 -bottom-12 bg-blue-500/10 h-40 w-40 rounded-full blur-xl"></div>
                  
                  <div className="flex items-center justify-center flex-col text-center">
                    <div className="bg-green-100 p-4 rounded-full mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Subscription Confirmed!</h3>
                    <p className="text-gray-600 mb-6">Thank you for subscribing to our newsletter!</p>
                    <p className="text-gray-600">Check your email inbox for your welcome gift - a special discount code for your next flight booking.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-2xl p-8 relative overflow-hidden">
                  <div className="absolute -left-12 -top-12 bg-blue-500/10 h-40 w-40 rounded-full blur-xl"></div>
                  <div className="absolute -right-12 -bottom-12 bg-yellow-500/10 h-40 w-40 rounded-full blur-xl"></div>
                  
                  <div className="flex items-center mb-8">
                    <img
                      src={subscriptionAirplane || "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?q=80&w=320&auto=format&fit=crop"}
                      alt="Airplane"
                      className="w-16 h-16 object-contain mr-4"
                    />
                    <h3 className="text-2xl font-bold text-gray-800">Subscribe & Save</h3>
                  </div>
                  
                  <div className="mb-6">
                    <div className="relative mb-2">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <div className="relative flex items-start pt-1">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                        />
                        <div className="w-5 h-5 bg-white border border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                        <svg
                          className="absolute w-3 h-3 text-white top-[0.4rem] left-1 hidden peer-checked:block pointer-events-none"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">
                        I agree to receive promotional emails. I understand that I can unsubscribe at any time. View our <span className="text-blue-600 underline cursor-pointer">Terms</span> and <span className="text-blue-600 underline cursor-pointer">Privacy Policy</span>.
                      </span>
                    </label>
                  </div>
                  
                  <button
                    className={`w-full py-4 rounded-xl font-bold text-lg relative overflow-hidden transition-all ${
                      email && agreed 
                        ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02]" 
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={handleSubscribe}
                    disabled={!email || !agreed}
                  >
                    <span className="relative z-10">GET 50% OFF MY NEXT FLIGHT</span>
                    {email && agreed && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-700 absolute"></div>
                        <div className="w-32 h-32 bg-white/20 rounded-full absolute blur-xl"></div>
                      </div>
                    )}
                  </button>
                  
                  <div className="flex items-center justify-center mt-6">
                    <div className="flex -space-x-2 mr-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                          <img 
                            src={`https://randomuser.me/api/portraits/men/${20 + i}.jpg`}
                            alt="Customer" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-bold text-gray-700">2,500+</span> travelers joined today
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Airplane path decoration */}
          <div className="absolute left-0 bottom-5 w-full overflow-hidden opacity-20">
            <svg viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M985.66 92.83C906.67 72 823.78 31 743.84 14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84 11.73-114 31.07-172 41.86A600.21 600.21 0 0 1 0 27.35V120h1200V95.8c-67.81 23.12-144.29 15.51-214.34-2.97Z" fill="currentColor"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
