import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  CreditCard, Calendar, Lock, CheckCircle, ArrowLeft, 
  ChevronDown, ChevronUp, X, Ticket, ShieldCheck, 
  ArrowRight, ChevronsRight, MapPin, Check, Star, 
  Clock, BadgeCheck, AlertCircle, Info
} from "lucide-react";
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
  const [formErrors, setFormErrors] = useState({});
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

  // Timer Effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setTimerExpired(true);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

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
    const timer = setTimeout(() => setPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handlePromoCodeChange = (e) => {
    setPromoCode(e.target.value.toUpperCase());
    setPromoApplied(false);
    setDiscountAmount(0);
    setFormErrors({ ...formErrors, promoCode: "" });
  };

  const applyPromoCode = () => {
    if (!promoCode) {
      setFormErrors({ ...formErrors, promoCode: "Please enter a promo code" });
      return;
    }

    if (promoCode === "FLYHIGH10") {
      const calculatedDiscount = Math.min(paymentData?.calculatedFare?.totalAmount * 0.1 || 0, 500);
      setDiscountAmount(calculatedDiscount);
      setPromoApplied(true);
      setFormErrors({ ...formErrors, promoCode: "" });
    } else {
      setFormErrors({ ...formErrors, promoCode: "Invalid promo code" });
      setPromoApplied(false);
      setDiscountAmount(0);
    }
  };

  const finalAmount = paymentData ? (paymentData.calculatedFare?.totalAmount || 0) - discountAmount : 0;

  const toggleFareDetails = () => {
    setShowFareDetails(!showFareDetails);
  };

  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormErrors({ ...formErrors, [name]: "" });
    
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

  const validateForm = () => {
    const errors = {};
    
    if (activePaymentMethod === "creditCard") {
      if (!cardDetails.cardNumber.replace(/\s/g, "").match(/^\d{16}$/)) {
        errors.cardNumber = "Please enter a valid 16-digit card number";
      }
      if (!cardDetails.cardHolder.trim()) {
        errors.cardHolder = "Please enter the cardholder name";
      }
      if (!cardDetails.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
        errors.expiryDate = "Please enter a valid expiry date (MM/YY)";
      }
      if (!cardDetails.cvv.match(/^\d{3,4}$/)) {
        errors.cvv = "Please enter a valid CVV";
      }
    } else if (activePaymentMethod === "upi") {
      if (!upiId.match(/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/)) {
        errors.upiId = "Please enter a valid UPI ID";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentSubmit = async () => {
    if (timerExpired) {
      alert("Session expired. Please restart the booking process.");
      navigate("/flights");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setProcessingPayment(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isSuccess = Math.random() > 0.2;
      setPaymentSuccess(isSuccess);
      setShowPaymentResult(true);
      
      if (isSuccess) {
        setTimeout(() => {
          navigate("/flight-booking-success", { 
            state: { 
              ...paymentData,
              paymentMethod: activePaymentMethod,
              calculatedFare: {
                ...paymentData?.calculatedFare,
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
    } catch (error) {
      console.error("Payment processing error:", error);
      setPaymentSuccess(false);
      setShowPaymentResult(true);
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short', day: '2-digit', month: 'short' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
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

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-gray-100 min-h-screen">
      <Navbar />
      
      {/* Payment Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 h-32 -mt-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 left-1/4 animate-pulse">✈️</div>
          <div className="absolute top-16 left-1/2 animate-pulse delay-300">✈️</div>
          <div className="absolute top-12 left-3/4 animate-pulse delay-700">✈️</div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-4 relative">
          <h1 className="text-white text-2xl font-bold">Secure Checkout</h1>
          <p className="text-blue-100 mt-1">Complete your booking in just a few steps</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className={`transition-opacity duration-500 ${pageLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[
              { icon: <Check />, label: "Flight Selection", completed: true },
              { icon: <Check />, label: "Passenger Details", completed: true },
              { icon: <CreditCard />, label: "Payment", completed: false, active: true },
              { icon: <CheckCircle />, label: "Confirmation", completed: false }
            ].map((step, index) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                    ${step.completed ? 'bg-green-100 text-green-600 border-green-500' : 
                      step.active ? 'bg-blue-600 text-white border-blue-600 animate-pulse' : 
                      'bg-gray-100 text-gray-400 border-gray-300'}`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs mt-1 ${step.active ? 'font-medium text-blue-600' : 'text-gray-600'}`}>
                    {step.label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`flex-1 h-1 ${step.completed ? 'bg-green-200' : 'bg-gray-200'} mx-2`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Back Button and Timer */}
        <div className="flex items-center mb-8">
          <button 
            type="button"
            onClick={() => navigate(-1)} 
            className="flex items-center text-gray-700 hover:text-blue-700 transition-colors font-medium p-2 rounded-md hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span>Back</span>
          </button>
          
          <div className={`ml-auto flex items-center px-4 py-2 rounded-full shadow-sm text-sm font-semibold 
            ${timerExpired ? 'bg-red-100 text-red-700' : 
              timeLeft < 60 ? 'bg-yellow-100 text-yellow-700 animate-pulse' : 
              'bg-blue-100 text-blue-700'}`}>
            <Clock className="h-4 w-4 mr-1.5" />
            <span>
              {timerExpired ? 'Session Expired' : `Reservation holds for: ${formatTime(timeLeft)}`}
            </span>
          </div>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-500 
          ${pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          
          {/* Left Column - Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div 
                className="p-5 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={toggleFareDetails}
              >
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                {showFareDetails ? 
                  <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                }
              </div>
              
              {showFareDetails && (
                <div className="p-5 animate-fadeIn space-y-4">
                  {/* Flight Details */}
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-700">Your Flight</h3>
                      <span className="text-xs text-gray-500 bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        One Way
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatDate(paymentData?.bookingDetails?.flight?.departureDate)}
                    </p>
                    <div className="flex items-center text-sm space-x-2 text-gray-800 font-medium">
                      <span>{paymentData?.bookingDetails?.flight?.departureCity?.substring(0, 3).toUpperCase()}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400"/>
                      <span>{paymentData?.bookingDetails?.flight?.arrivalCity?.substring(0, 3).toUpperCase()}</span>
                      <span className="text-gray-500 font-normal">
                        ({paymentData?.bookingDetails?.flight?.duration})
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {paymentData?.bookingDetails?.flight?.airline}
                    </p>
                  </div>
                  
                  {/* Fare Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Base Fare ({paymentData?.passengerData?.length || 0} Traveller{paymentData?.passengerData?.length > 1 ? 's' : ''})
                      </span>
                      <span className="font-medium">
                        ₹{paymentData?.calculatedFare?.baseFare?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes & Fees</span>
                      <span className="font-medium">
                        ₹{paymentData?.calculatedFare?.tax?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    {paymentData?.calculatedFare?.addonsTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Add-ons</span>
                        <span className="font-medium">
                          ₹{paymentData?.calculatedFare?.addonsTotal?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    )}
                    {paymentData?.calculatedFare?.vipServiceFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">VIP Service</span>
                        <span className="font-medium">
                          ₹{paymentData?.calculatedFare?.vipServiceFee?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount Applied</span>
                        <span className="font-medium">- ₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Total Amount */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total Payable</span>
                      <span className="text-xl font-bold text-blue-600">₹{finalAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">(Inclusive of all taxes)</p>
                  </div>
                  
                  {/* Savings Message */}
                  {paymentData?.calculatedFare?.baseFare > finalAmount && (
                    <div className="bg-green-50 p-3 rounded-lg mt-4 flex items-center border border-green-100">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-700 text-sm font-medium">
                        You saved ₹{(paymentData.calculatedFare.baseFare + paymentData.calculatedFare.tax - finalAmount).toFixed(2)} on this booking!
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Promo Code Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Apply Promo Code</h2>
              <form onSubmit={(e) => { e.preventDefault(); applyPromoCode(); }} className="space-y-3">
                <div>
                  <input 
                    type="text"
                    value={promoCode}
                    onChange={handlePromoCodeChange}
                    placeholder="Enter Promo Code"
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 
                      ${formErrors.promoCode ? 'border-red-500 ring-red-200' : 
                        promoApplied ? 'border-green-500 ring-green-200' : 
                        'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                    disabled={promoApplied}
                  />
                  {formErrors.promoCode && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.promoCode}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className={`w-full py-3 rounded-lg font-semibold transition-colors
                    ${promoApplied ? 'bg-green-600 text-white cursor-not-allowed' : 
                      'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                  disabled={promoApplied || !promoCode}
                >
                  {promoApplied ? 'Applied' : 'Apply'}
                </button>
              </form>
              {promoApplied && (
                <p className="text-green-600 text-sm mt-2 font-medium">
                  Promo code applied! You saved ₹{discountAmount.toFixed(2)}.
                </p>
              )}
            </div>

            {/* Security Badges */}
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
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-500" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">9.5/10 based on 24k+ reviews</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center">
                <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                Choose Payment Method
              </h2>

              {/* Payment Methods */}
              <div className="space-y-4">
                {/* Credit Card Option */}
                <div className={`border rounded-lg overflow-hidden transition-all duration-300
                  ${activePaymentMethod === "creditCard" ? 'border-blue-600 shadow-lg scale-[1.02]' : 
                    'border-gray-200 hover:shadow-md hover:border-gray-300'}`}>
                  <div 
                    className={`p-4 flex justify-between items-center cursor-pointer transition-colors
                      ${activePaymentMethod === "creditCard" ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                    onClick={() => setActivePaymentMethod("creditCard")}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-4">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Credit/Debit Card</h3>
                        <p className="text-sm text-gray-600">Visa, Mastercard, Amex, Rupay & More</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${activePaymentMethod === "creditCard" ? 'border-blue-600 bg-blue-600 scale-110' : 'border-gray-400'}`}>
                      {activePaymentMethod === "creditCard" && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>

                  {activePaymentMethod === "creditCard" && (
                    <div className="p-5 bg-gray-50 border-t border-gray-200 animate-fadeIn">
                      {/* Credit Card Form */}
                      <form onSubmit={(e) => { e.preventDefault(); handlePaymentSubmit(); }} className="space-y-4">
                        <div>
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CreditCard className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              id="cardNumber"
                              name="cardNumber"
                              value={cardDetails.cardNumber}
                              onChange={handleCardDetailsChange}
                              placeholder="0000 0000 0000 0000"
                              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 pl-10
                                ${formErrors.cardNumber ? 'border-red-500 ring-red-200' : 
                                  'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                            />
                          </div>
                          {formErrors.cardNumber && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.cardNumber}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
                            Cardholder Name
                          </label>
                          <input
                            type="text"
                            id="cardHolder"
                            name="cardHolder"
                            value={cardDetails.cardHolder}
                            onChange={handleCardDetailsChange}
                            placeholder="John Doe"
                            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2
                              ${formErrors.cardHolder ? 'border-red-500 ring-red-200' : 
                                'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                          />
                          {formErrors.cardHolder && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.cardHolder}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                              Expiry Date
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                id="expiryDate"
                                name="expiryDate"
                                value={cardDetails.expiryDate}
                                onChange={handleCardDetailsChange}
                                placeholder="MM/YY"
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 pl-10
                                  ${formErrors.expiryDate ? 'border-red-500 ring-red-200' : 
                                    'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                              />
                            </div>
                            {formErrors.expiryDate && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.expiryDate}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                              CVV
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="password"
                                id="cvv"
                                name="cvv"
                                value={cardDetails.cvv}
                                onChange={handleCardDetailsChange}
                                placeholder="•••"
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 pl-10
                                  ${formErrors.cvv ? 'border-red-500 ring-red-200' : 
                                    'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                              />
                            </div>
                            {formErrors.cvv && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.cvv}</p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="flex items-center text-sm">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2" 
                            />
                            <span className="text-gray-700">Save this card securely for future payments</span>
                          </label>
                        </div>

                        <button
                          type="submit"
                          className={`w-full py-3 rounded-lg font-semibold text-lg transition-all duration-300
                            flex items-center justify-center shadow-md hover:shadow-lg
                            ${timerExpired ? 'bg-gray-400 cursor-not-allowed' : 
                              'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.01]'} 
                            disabled:opacity-70`}
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
                          <ShieldCheck className="w-4 h-4 mr-1 text-green-600"/>
                          Secure SSL Encrypted Payment
                        </p>
                      </form>
                    </div>
                  )}
                </div>

                {/* UPI Option */}
                <div className={`border rounded-lg overflow-hidden transition-all duration-300
                  ${activePaymentMethod === "upi" ? 'border-blue-600 shadow-lg scale-[1.02]' : 
                    'border-gray-200 hover:shadow-md hover:border-gray-300'}`}>
                  <div 
                    className={`p-4 flex justify-between items-center cursor-pointer transition-colors
                      ${activePaymentMethod === "upi" ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                    onClick={() => setActivePaymentMethod("upi")}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4">
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1280px-UPI-Logo-vector.svg.png" 
                          alt="UPI" 
                          className="h-6"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">UPI</h3>
                        <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm & More</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${activePaymentMethod === "upi" ? 'border-blue-600 bg-blue-600 scale-110' : 'border-gray-400'}`}>
                      {activePaymentMethod === "upi" && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>

                  {activePaymentMethod === "upi" && (
                    <div className="p-5 bg-gray-50 border-t border-gray-200 animate-fadeIn">
                      <form onSubmit={(e) => { e.preventDefault(); handlePaymentSubmit(); }} className="space-y-4">
                        <div>
                          <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
                            Enter UPI ID
                          </label>
                          <input
                            type="text"
                            id="upiId"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="yourname@bank"
                            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2
                              ${formErrors.upiId ? 'border-red-500 ring-red-200' : 
                                'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                          />
                          {formErrors.upiId && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.upiId}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">We'll send a payment request to this ID.</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Or pay using UPI app:</p>
                          <div className="flex flex-wrap gap-3">
                            {[
                              { name: 'Google Pay', icon: 'https://cdn-icons-png.flaticon.com/512/6124/6124998.png' },
                              { name: 'PhonePe', icon: 'https://cdn-icons-png.flaticon.com/512/6124/6124997.png' },
                              { name: 'Paytm', icon: 'https://cdn-icons-png.flaticon.com/512/825/825454.png' }
                            ].map(app => (
                              <button
                                key={app.name}
                                type="button"
                                className="flex items-center space-x-2 p-2 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                              >
                                <img src={app.icon} alt={app.name} className="w-6 h-6" />
                                <span className="text-xs font-medium">{app.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          type="submit"
                          className={`w-full py-3 rounded-lg font-semibold text-lg transition-all duration-300
                            flex items-center justify-center shadow-md hover:shadow-lg
                            ${timerExpired ? 'bg-gray-400 cursor-not-allowed' : 
                              'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.01]'} 
                            disabled:opacity-70`}
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
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Result Modal */}
      {showPaymentResult && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform scale-100 transition-transform duration-300">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className={`text-xl font-bold ${paymentSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {paymentSuccess ? "Payment Successful" : "Payment Failed"}
              </h3>
              <button 
                type="button"
                onClick={() => setShowPaymentResult(false)}
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
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Payment of ₹{finalAmount.toFixed(2)} Successful!
                  </h4>
                  <p className="text-gray-600 mb-4 text-sm">
                    Your booking is confirmed. Redirecting you shortly...
                  </p>
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-200">
                    <X className="w-10 h-10 text-red-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Payment Failed</h4>
                  <p className="text-gray-600 mb-4 text-sm">
                    We couldn't process your payment. Please check your details or try another method.
                  </p>
                  <button 
                    type="button"
                    onClick={() => setShowPaymentResult(false)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
} 