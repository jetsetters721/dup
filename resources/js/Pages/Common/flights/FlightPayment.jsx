import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, Calendar, Lock, CheckCircle, ArrowLeft, ChevronDown, ChevronUp, X, Ticket, ShieldCheck, ArrowRight, ChevronsRight, MapPin, Check, Star, Clock, BadgeCheck } from "lucide-react";
import Navbar from "../Navbar";
import Footer from "../Footer";

export default function FlightPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePaymentMethod, setActivePaymentMethod] = useState("creditCard");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });
  const [upiId, setUpiId] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showEmiOptions, setShowEmiOptions] = useState(false);
  const [showPaymentResult, setShowPaymentResult] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(true);
  const [showFareDetails, setShowFareDetails] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [timerExpired, setTimerExpired] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Timer Effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setTimerExpired(true);
      return; // Stop the timer
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Cleanup interval on component unmount or when timer stops
    return () => clearInterval(timerId);
  }, [timeLeft]);

  useEffect(() => {
    if (location.state) {
      setPaymentData(location.state);
      setLoading(false);
    } else {
      navigate("/flights");
    }
  }, [location, navigate]);

  useEffect(() => {
    // Set page as loaded after a small delay for animations
    const timer = setTimeout(() => setPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handlePromoCodeChange = (e) => {
    setPromoCode(e.target.value.toUpperCase());
    setPromoApplied(false);
    setDiscountAmount(0);
  };

  const applyPromoCode = () => {
    if (promoCode === "FLYHIGH10") {
      const calculatedDiscount = Math.min(paymentData.calculatedFare.totalAmount * 0.1, 500);
      setDiscountAmount(calculatedDiscount);
      setPromoApplied(true);
    } else if (promoCode) {
      alert("Invalid promo code.");
      setPromoApplied(false);
      setDiscountAmount(0);
    }
  };
  
  const finalAmount = paymentData ? paymentData.calculatedFare.totalAmount - discountAmount : 0;

  const toggleFareDetails = () => {
    setShowFareDetails(!showFareDetails);
  };

  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "cardNumber") {
      const formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19);
      setCardDetails({ ...cardDetails, [name]: formattedValue });
      return;
    }
    
    if (name === "expiryDate") {
      const formattedValue = value
        .replace(/\//g, "")
        .replace(/(\d{2})(\d{0,2})/, "$1/$2")
        .slice(0, 5);
      setCardDetails({ ...cardDetails, [name]: formattedValue });
      return;
    }
    
    setCardDetails({ ...cardDetails, [name]: value });
  };

  const handlePaymentSubmit = () => {
    if (timerExpired) {
      alert("Session expired. Please restart the booking process.");
      navigate("/flights"); // Or redirect to a relevant page
      return;
    }
    if (activePaymentMethod === "creditCard") {
      if (!validateCardDetails()) {
        return;
      }
    } else if (activePaymentMethod === "upi") {
      if (!validateUpiId()) {
        return;
      }
    }
    
    setProcessingPayment(true);
    
    setTimeout(() => {
      const isSuccess = Math.random() > 0.2; 
      setPaymentSuccess(isSuccess);
      setShowPaymentResult(true);
      setProcessingPayment(false);
      
      if (isSuccess) {
        setTimeout(() => {
          navigate("/flight-booking-success", { 
            state: { 
              ...paymentData,
              paymentMethod: activePaymentMethod,
              calculatedFare: {
                ...paymentData.calculatedFare,
                discount: discountAmount,
                finalAmount: finalAmount
              },
              paymentDetails: activePaymentMethod === "creditCard" ? 
                { ...cardDetails, cardNumber: `**** **** **** ${cardDetails.cardNumber.slice(-4)}` } : 
                { upiId }
            } 
          });
        }, 2000);
      }
    }, 2000);
  };

  const closePaymentResult = () => {
    setShowPaymentResult(false);
  };

  const validateCardDetails = () => {
    if (cardDetails.cardNumber.replace(/\s/g, "").length < 16) {
      alert("Please enter a valid 16-digit card number");
      return false;
    }
    if (!/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(cardDetails.cardNumber)) {
       alert("Please enter the card number in the format XXXX XXXX XXXX XXXX");
       return false;
    }
    if (cardDetails.cardHolder.trim().length < 3) {
      alert("Please enter a valid cardholder name");
      return false;
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
       alert("Please enter a valid expiry date in MM/YY format");
      return false;
    }
    if (cardDetails.cvv.length < 3 || !/^\d{3,4}$/.test(cardDetails.cvv)) {
      alert("Please enter a valid 3 or 4 digit CVV");
      return false;
    }
    return true;
  };

  const validateUpiId = () => {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
    if (!upiRegex.test(upiId)) {
      alert("Please enter a valid UPI ID (e.g., username@bank)");
      return false;
    }
    return true;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short', day: '2-digit', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  };

  // Function to format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const PaymentResultPopup = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform scale-100 transition-transform duration-300">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h3 className={`text-xl font-bold ${paymentSuccess ? 'text-green-600' : 'text-red-600'}`}>
              {paymentSuccess ? "Payment Successful" : "Payment Failed"}
            </h3>
            <button 
              type="button"
              onClick={closePaymentResult}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-center py-4">
            {paymentSuccess ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-200">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Payment of ₹{finalAmount.toFixed(2)} Successful!</h4>
                <p className="text-gray-600 mb-4 text-sm">Your booking is confirmed. Redirecting you shortly...</p>
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-200">
                  <X className="w-10 h-10 text-red-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Payment Failed</h4>
                <p className="text-gray-600 mb-4 text-sm">We couldn't process your payment. Please check your details or try another method.</p>
                <button 
                  type="button"
                  onClick={closePaymentResult}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-center text-gray-600 font-medium text-lg">Loading Secure Payment Gateway...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Credit card flipper
  const flipCard = () => {
    if (activePaymentMethod === "creditCard" && cardDetails.cardNumber) {
      setIsCardFlipped(true);
      setTimeout(() => setIsCardFlipped(false), 3000);
    }
  };

  // Enhanced Payment Method Component with hover effect
  const PaymentMethodOption = ({ id, icon, title, description, children }) => (
    <div className={`border rounded-lg overflow-hidden transition-all duration-300 ease-in-out ${activePaymentMethod === id ? 'border-blue-600 shadow-lg scale-[1.02]' : 'border-gray-200 hover:shadow-md hover:border-gray-300'}`}>
      <div 
        className={`p-4 flex justify-between items-center cursor-pointer transition-colors duration-200 ${activePaymentMethod === id ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
        onClick={() => setActivePaymentMethod(id)}
      >
        <div className="flex items-center">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 transition-colors duration-300 ${
            id === 'creditCard' ? 'bg-red-100 text-red-600' : 
            id === 'upi' ? 'bg-green-100 text-green-600' : 
            id === 'wallet' ? 'bg-yellow-100 text-yellow-600' : 
            id === 'netBanking' ? 'bg-purple-100 text-purple-600' : 
            'bg-blue-100 text-blue-600'
          }`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            {description && <p className="text-sm text-gray-600">{description}</p>}
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${activePaymentMethod === id ? 'border-blue-600 bg-blue-600 scale-110' : 'border-gray-400'}`}>
          {activePaymentMethod === id && <CheckCircle className="w-3 h-3 text-white" />}
        </div>
      </div>
      {activePaymentMethod === id && (
        <div className="p-5 bg-gray-50 border-t border-gray-200 animate-fadeIn">
          {children}
          <div className="mt-6">
            <button 
              type="button"
              className={`w-full text-white py-3 rounded-lg font-semibold text-lg transition-all duration-300 ease-in-out flex items-center justify-center shadow-md hover:shadow-lg ${timerExpired ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.01]'} disabled:opacity-70`}
              onClick={handlePaymentSubmit}
              disabled={processingPayment || timerExpired}
            >
              {processingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing Payment...
                </>
              ) : timerExpired ? (
                 'Session Expired'
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" /> 
                  Pay Securely ₹{finalAmount.toFixed(2)}
                </>
              )}
            </button>
             <p className="text-xs text-gray-500 mt-3 text-center flex items-center justify-center">
               <ShieldCheck className="w-4 h-4 mr-1 text-green-600"/> Secure SSL Encrypted Payment
             </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-gray-100 min-h-screen">
      <Navbar />
      
      {/* Payment Header Banner with subtle flying planes */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 h-32 -mt-8 flex items-end">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 left-1/4 animate-pulse">✈️</div>
          <div className="absolute top-16 left-1/2 animate-pulse delay-300">✈️</div>
          <div className="absolute top-12 left-3/4 animate-pulse delay-700">✈️</div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <h1 className="text-white text-2xl font-bold">Secure Checkout</h1>
        </div>
      </div>
      
      {/* Booking Progress Bar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className={`transition-opacity duration-500 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center border-2 border-green-500">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-xs mt-1 text-gray-600">Flight Selection</span>
            </div>
            
            <div className="flex-1 h-1 bg-green-200 mx-2"></div>
            
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center border-2 border-green-500">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-xs mt-1 text-gray-600">Passenger Details</span>
            </div>
            
            <div className="flex-1 h-1 bg-green-200 mx-2"></div>
            
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-blue-600 animate-pulse">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="text-xs mt-1 font-medium text-blue-600">Payment</span>
            </div>
            
            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
            
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center border-2 border-gray-300">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-xs mt-1 text-gray-400">Confirmation</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div className="flex items-center mb-8">
          <button 
            type="button"
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-700 hover:text-blue-700 transition-colors font-medium p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span>Back</span>
          </button>
          
          {/* Timer Display */}
          <div className={`ml-auto flex items-center px-4 py-2 rounded-full shadow-sm text-sm font-semibold ${timerExpired ? 'bg-red-100 text-red-700' : timeLeft < 60 ? 'bg-yellow-100 text-yellow-700 animate-pulse' : 'bg-blue-100 text-blue-700'}`}>
             <Clock className="h-4 w-4 mr-1.5" />
            <span>
              {timerExpired ? 'Session Expired' : `Reservation holds for: ${formatTime(timeLeft)}`}
            </span>
          </div>
        </div>
        
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-500 ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Left Column - Order Summary & Promo */}
          <div className="lg:col-span-1 space-y-6">
             {/* Order Summary Card */}
             <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
              <div 
                className="p-5 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={toggleFareDetails}
              >
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                  {showFareDetails ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
              </div>
              
              {showFareDetails && (
                <div className="p-5 animate-fadeIn space-y-4">
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-700">Your Flight</h3>
                      <span className="text-xs text-gray-500 bg-blue-100 text-blue-700 px-2 py-0.5 rounded">One Way</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{formatDate(paymentData.bookingDetails.flight.departureDate)}</p>
                     <div className="flex items-center text-sm space-x-2 text-gray-800 font-medium">
                       <span>{paymentData.bookingDetails.flight.departureCity.substring(0, 3).toUpperCase()}</span>
                       <ArrowRight className="w-4 h-4 text-gray-400"/>
                       <span>{paymentData.bookingDetails.flight.arrivalCity.substring(0, 3).toUpperCase()}</span>
                       <span className="text-gray-500 font-normal">({paymentData.bookingDetails.flight.duration})</span>
                    </div>
                     <p className="text-xs text-gray-500 mt-1">{paymentData.bookingDetails.flight.airline}</p>
                      </div>
                      
                   <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                         <span className="text-gray-600">Base Fare ({paymentData.passengerData.length} Traveller{paymentData.passengerData.length > 1 ? 's' : ''})</span>
                         <span className="font-medium">₹{paymentData.calculatedFare.baseFare.toFixed(2)}</span>
                      </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Taxes & Fees</span>
                         <span className="font-medium">₹{paymentData.calculatedFare.tax.toFixed(2)}</span>
                      </div>
                      {paymentData.calculatedFare.addonsTotal > 0 && (
                         <div className="flex justify-between">
                            <span className="text-gray-600">Add-ons</span>
                            <span className="font-medium">₹{paymentData.calculatedFare.addonsTotal.toFixed(2)}</span>
                    </div>
                      )}
                      {paymentData.calculatedFare.vipServiceFee > 0 && (
                         <div className="flex justify-between">
                            <span className="text-gray-600">VIP Service</span>
                            <span className="font-medium">₹{paymentData.calculatedFare.vipServiceFee.toFixed(2)}</span>
                  </div>
                      )}
                       {discountAmount > 0 && (
                         <div className="flex justify-between text-green-600">
                           <span >Discount Applied</span>
                           <span className="font-medium">- ₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
          </div>
          
                   <div className="border-t border-gray-200 pt-4 mt-4">
                     <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total Payable</span>
                        <span className="text-xl font-bold text-blue-600">₹{finalAmount.toFixed(2)}</span>
                </div>
                     <p className="text-xs text-gray-500 mt-1 text-right">(Inclusive of all taxes)</p>
              </div>
              
                  {paymentData.calculatedFare.baseFare > finalAmount && (
                    <div className="bg-green-50 p-3 rounded-lg mt-4 flex items-center border border-green-100">
                      <span className="text-green-700 text-sm font-medium flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Yay! You saved ₹{(paymentData.calculatedFare.baseFare + paymentData.calculatedFare.tax - finalAmount).toFixed(2)} on this booking!
                      </span>
                    </div>
                  )}
                  
                   <div className="mt-4 pt-4 border-t border-gray-100">
                     <p className="text-center text-sm text-gray-600 mb-2 font-medium">100% Secure Payments</p>
                     <div className="flex justify-center items-center space-x-3 opacity-70">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1280px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/1280px-MasterCard_Logo.svg.png" alt="MasterCard" className="h-5" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Rupay-Logo.png/1200px-Rupay-Logo.png" alt="RuPay" className="h-4" />
                       <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1280px-UPI-Logo-vector.svg.png" alt="UPI" className="h-6" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
             {/* Promo Code Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 transform transition-all duration-300 hover:shadow-xl">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Apply Promo Code</h2>
                <form onSubmit={(e) => e.preventDefault()} className="flex space-x-2">
                  <input 
                    type="text"
                    value={promoCode}
                    onChange={handlePromoCodeChange}
                    placeholder="Enter Promo Code"
                    className={`flex-grow p-3 border rounded-lg focus:outline-none focus:ring-2 ${promoApplied ? 'border-green-500 ring-green-200' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} transition-colors`} 
                    disabled={promoApplied}
                  />
                  <button
                    type="button"
                    onClick={applyPromoCode}
                    className={`px-5 py-3 rounded-lg font-semibold transition-colors ${promoApplied ? 'bg-green-600 text-white cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                    disabled={promoApplied || !promoCode}
                  >
                    {promoApplied ? 'Applied' : 'Apply'}
                  </button>
                </form>
                 {promoApplied && (
                   <p className="text-green-600 text-sm mt-2 font-medium">Promo code applied! You saved ₹{discountAmount.toFixed(2)}.</p>
                 )}
              </div>
              
              {/* Trust Badges */}
              <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                  <BadgeCheck className="w-4 h-4 text-green-600 mr-2" />
                  Safe & Secure Booking
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <ShieldCheck className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-xs text-gray-600">256-bit SSL Encryption</span>
                    </div>
                  <div className="flex items-center">
                    <ShieldCheck className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-xs text-gray-600">PCI DSS Compliant</span>
                    </div>
                  <div className="flex items-center">
                    <ShieldCheck className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-xs text-gray-600">Verified Payment Gateways</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <Star className="w-3 h-3 text-yellow-500" />
                      <Star className="w-3 h-3 text-yellow-500" />
                      <Star className="w-3 h-3 text-yellow-500" />
                      <Star className="w-3 h-3 text-yellow-500" />
                    </div>
                    <span className="text-xs text-gray-600">9.5/10 based on 24k+ reviews</span>
                  </div>
                </div>
              </div>
          </div>
          
          {/* Right Column - Payment Options */}
          <div className="lg:col-span-2 space-y-6">
              {/* Payment Methods Container */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 transform transition-all duration-300 hover:shadow-xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  Choose Payment Method
                </h2>
                <div className="space-y-4">

                   {/* Credit/Debit Card Option */}
                   <PaymentMethodOption 
                      id="creditCard"
                      icon={<CreditCard className="w-5 h-5"/>}
                      title="Credit/Debit Card"
                      description="Visa, Mastercard, Amex, Rupay & More"
                   >
                      {/* Credit Card Visual */}
                      <div className={`mb-6 h-48 relative perspective-1000 w-full max-w-sm mx-auto ${cardDetails.cardNumber ? '' : 'opacity-60'}`}>
                        <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isCardFlipped ? 'rotate-y-180' : ''}`}>
                          {/* Front of card */}
                          <div className="absolute inset-0 backface-hidden rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-800 p-6 shadow-2xl flex flex-col justify-between text-white">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs uppercase tracking-wider opacity-80">Credit Card</p>
                                <div className="mt-1">
                                  <div className="flex space-x-2">
                                    <div className="w-8 h-6 bg-white/20 rounded"></div>
                                    <div className="w-8 h-6 bg-white/20 rounded"></div>
                                    <div className="w-8 h-6 bg-white/20 rounded"></div>
                                    <div className="w-8 h-6 bg-white/20 rounded"></div>
                      </div>
                      </div>
                      </div>
                              <div className="text-right">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-8 ml-auto" />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                              <p className="text-xl tracking-widest">
                                {cardDetails.cardNumber || '•••• •••• •••• ••••'}
                              </p>
                  </div>
                            
                            <div className="flex justify-between items-end mt-4">
                              <div>
                                <p className="text-xs uppercase tracking-wider opacity-80">Card Holder</p>
                                <p className="font-medium truncate max-w-[140px]">{cardDetails.cardHolder || 'YOUR NAME'}</p>
                    </div>
                              <div className="text-right">
                                <p className="text-xs uppercase tracking-wider opacity-80">Expires</p>
                                <p>{cardDetails.expiryDate || 'MM/YY'}</p>
                    </div>
                  </div>
                </div>
                
                          {/* Back of card */}
                          <div className={`absolute inset-0 backface-hidden rounded-xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 shadow-2xl rotate-y-180 ${isCardFlipped ? 'animate-back-card' : ''}`}>
                            <div className="h-10 bg-black mt-4"></div>
                            <div className="px-6 mt-4">
                              <div className="flex justify-end items-center mb-2">
                                <div className="bg-white/70 h-8 w-full max-w-[240px] rounded"></div>
                              </div>
                              <div className="flex justify-end">
                                <div className="bg-white/90 h-8 w-16 rounded flex items-center justify-center text-gray-800 font-mono">
                                  {cardDetails.cvv || 'CVV'}
                    </div>
                    </div>
                  </div>
                            <div className="absolute bottom-6 left-6 right-6">
                              <div className="text-xs text-white/70">
                                This card is property of the issuing bank. Use according to your card agreement.
                </div>
                    </div>
                    </div>
                  </div>
                </div>
                
                      {/* Card Input Form */}
                      <form onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 gap-4">
                      <div>
                             <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                             <div className="relative rounded-md shadow-sm">
                               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                 <CreditCard className="h-5 w-5 text-gray-400" aria-hidden="true" />
                               </div>
                          <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            value={cardDetails.cardNumber}
                            onChange={handleCardDetailsChange}
                                 onFocus={() => setIsCardFlipped(false)}
                                 placeholder="0000 0000 0000 0000"
                            maxLength="19"
                                 className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                          />
                        </div>
                      </div>
                      <div>
                               <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          id="cardHolder"
                          name="cardHolder"
                          value={cardDetails.cardHolder}
                          onChange={handleCardDetailsChange}
                                 onFocus={() => setIsCardFlipped(false)}
                                 placeholder="John Doe"
                                 className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                           <div className="grid grid-cols-2 gap-4">
                      <div>
                                 <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                        <div className="relative">
                                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                     <Calendar className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                   </div>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={cardDetails.expiryDate}
                            onChange={handleCardDetailsChange}
                                     onFocus={() => setIsCardFlipped(false)}
                            placeholder="MM/YY"
                            maxLength="5"
                                     className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                          />
                        </div>
                      </div>
                      <div>
                                 <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                       <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                          <input
                            type="password"
                            id="cvv"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardDetailsChange}
                                     onFocus={() => setIsCardFlipped(true)}
                                     onBlur={() => setIsCardFlipped(false)}
                                     placeholder="•••"
                            maxLength="4"
                                     className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                          />
                        </div>
                      </div>
                    </div>
                            <div className="mt-2">
                              <label className="flex items-center text-sm">
                                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2" />
                                <span className="text-gray-700">Save this card securely for future payments</span>
                      </label>
                    </div>
                    </div>
                      </form>
                   </PaymentMethodOption>

                   {/* UPI Option */}
                   <PaymentMethodOption 
                      id="upi"
                      icon={<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1280px-UPI-Logo-vector.svg.png" alt="UPI" className="h-6"/>}
                      title="UPI"
                      description="Google Pay, PhonePe, Paytm & More"
                   >
                      <div className="space-y-4">
                    <div>
                           <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">Enter UPI ID</label>
                           <form onSubmit={(e) => e.preventDefault()}>
                             <input
                               type="text"
                               id="upiId"
                               value={upiId}
                               onChange={(e) => setUpiId(e.target.value)}
                               placeholder="yourname@bank"
                               className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                             />
                           </form>
                            <p className="text-xs text-gray-500 mt-1">We'll send a payment request to this ID.</p>
                          </div>
                         <div>
                             <p className="text-sm font-medium text-gray-700 mb-2">Or pay using UPI app:</p>
                             <div className="flex flex-wrap gap-3">
                                <button type="button" className="flex items-center space-x-2 p-2 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                   <img src="https://cdn-icons-png.flaticon.com/512/6124/6124998.png" alt="Google Pay" className="w-6 h-6" />
                                   <span className="text-xs font-medium">Google Pay</span>
                                </button>
                                 <button type="button" className="flex items-center space-x-2 p-2 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                   <img src="https://cdn-icons-png.flaticon.com/512/6124/6124997.png" alt="PhonePe" className="w-6 h-6" />
                                   <span className="text-xs font-medium">PhonePe</span>
                                 </button>
                                  <button type="button" className="flex items-center space-x-2 p-2 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                   <img src="https://cdn-icons-png.flaticon.com/512/825/825454.png" alt="Paytm" className="w-6 h-6" />
                                   <span className="text-xs font-medium">Paytm</span>
                      </button>
                    </div>
                  </div>
                     </div>
                   </PaymentMethodOption>

                   {/* Net Banking Option */}
                   <PaymentMethodOption 
                      id="netBanking"
                      icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0c-1.11 0-2.08-.402-2.599-1M15 9.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 10a10 10 0 0110-8c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 15.523 2 10z" /></svg>}
                      title="Net Banking"
                      description="Select your bank"
                   >
                       <p className="text-sm text-gray-600 mb-3">Select your bank from the list below:</p>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                         <button type="button" className="border p-3 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
                           <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/HDFC_Bank_Logo.svg/1280px-HDFC_Bank_Logo.svg.png" alt="HDFC" className="h-6 mb-1" />
                           <span className="text-xs">HDFC Bank</span>
                         </button>
                         <button type="button" className="border p-3 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
                           <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/State_Bank_of_India_logo.svg/1280px-State_Bank_of_India_logo.svg.png" alt="SBI" className="h-6 mb-1" />
                           <span className="text-xs">SBI Bank</span>
                         </button>
                         <button type="button" className="border p-3 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
                           <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/AXIS_BANK_LOGO.svg/1280px-AXIS_BANK_LOGO.svg.png" alt="Axis" className="h-6 mb-1" />
                           <span className="text-xs">Axis Bank</span>
                         </button>
                         <button type="button" className="border p-3 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center">
                           <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/ICICI_Bank_Logo.svg/1280px-ICICI_Bank_Logo.svg.png" alt="ICICI" className="h-6 mb-1" />
                           <span className="text-xs">ICICI Bank</span>
                         </button>
                    </div>
                       <form onSubmit={(e) => e.preventDefault()}>
                         <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option>Select Other Bank...</option>
                            <option>Kotak Mahindra Bank</option>
                            <option>Yes Bank</option>
                            <option>IDFC First Bank</option>
                            <option>Bank of Baroda</option>
                         </select>
                       </form>
                   </PaymentMethodOption>
                   
                   {/* Wallet Option */}
                   <PaymentMethodOption 
                      id="wallet"
                      icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                      title="Wallets"
                      description="Paytm, PhonePe, Amazon Pay & More"
                   >
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        <button type="button" className="border p-3 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/1280px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" className="h-5 mr-2" />
                          <span className="text-sm">Paytm</span>
                        </button>
                        <button type="button" className="border p-3 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Amazon_Pay_logo.svg/1280px-Amazon_Pay_logo.svg.png" alt="Amazon Pay" className="h-5 mr-2" />
                          <span className="text-sm">Amazon Pay</span>
                        </button>
                        <button type="button" className="border p-3 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Mobikwik_logo.svg/1280px-Mobikwik_logo.svg.png" alt="MobiKwik" className="h-5 mr-2" />
                          <span className="text-sm">MobiKwik</span>
                        </button>
                    </div>
                      <p className="text-sm text-gray-500">
                        Link your wallet and pay instantly. Enjoy cashback and exclusive offers.
                      </p>
                   </PaymentMethodOption>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showPaymentResult && <PaymentResultPopup />}
      
      {/* Customer reviews section */}
      <div className="bg-blue-50 py-8 mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-lg font-semibold text-center text-gray-800 mb-6">What our customers are saying</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center text-blue-600 font-semibold mr-3">RS</div>
                <div>
                  <p className="font-medium">Rahul S.</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">"The payment process was smooth and secure. Got my tickets instantly after payment. Great experience!"</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <div className="bg-green-100 rounded-full w-10 h-10 flex items-center justify-center text-green-600 font-semibold mr-3">AP</div>
                <div>
                  <p className="font-medium">Anjali P.</p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">"I love the UPI payment option. It's so convenient and I got 5% cashback on my booking!"</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center text-purple-600 font-semibold mr-3">VK</div>
                <div>
                  <p className="font-medium">Vikram K.</p>
                  <div className="flex">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400" />
                    ))}
                    <Star className="w-3 h-3 text-gray-300" />
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">"Saved my card details for future bookings. Makes the checkout process so much faster now!"</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      {/* Add global style for card flip effect */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        @keyframes pulse-subtle {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2); }
          70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
        
        @keyframes highlight-cvv {
          0% { background: rgba(255, 255, 255, 0.9); }
          50% { background: rgba(255, 255, 255, 1); }
          100% { background: rgba(255, 255, 255, 0.9); }
        }

        .animate-back-card .bg-white\/90 {
          animation: highlight-cvv 1.5s infinite;
          box-shadow: 0 0 15px 2px rgba(255, 255, 255, 0.5);
        }

        .animate-back-card {
          animation: pulse-subtle 2s infinite;
        }
      `}</style>
    </div>
  );
} 