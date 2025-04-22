// Hotel data
export const hotels = [
  {
    id: 1,
    name: "Kashmir catch up",
    location: "Kashmir, India",
    price: 50,
    rating: 4.8,
    images: {
      main: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2070&auto=format&fit=crop"
      ]
    },
    amenities: ["Spa", "Pool", "WiFi", "Restaurant", "Room Service"]
  },
  {
    id: 2,
    name: "Maldives Resort",
    location: "Maldives",
    price: 22,
    rating: 4.9,
    images: {
      main: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2070&auto=format&fit=crop"
      ]
    },
    amenities: ["Ocean View", "WiFi", "Restaurant", "Breakfast", "Bar"]
  },
  {
    id: 3,
    name: "Stark House",
    location: "Dehiwala, Sri Lanka",
    price: 856,
    rating: 4.7,
    images: {
      main: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2070&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop"
      ]
    },
    amenities: ["Mountain View", "WiFi", "Restaurant", "Bar", "Parking"]
  },
  {
    id: 4,
    name: "Vinna Vill",
    location: "Beruwala, Sri Lanka",
    price: 62,
    rating: 4.8,
    images: {
      main: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop"
      ]
    },
    amenities: ["River View", "Fireplace", "WiFi", "Kitchen", "Private Garden"]
  },
  {
    id: 5,
    name: "Bobox",
    location: "Kandy, Sri Lanka",
    price: 72,
    rating: 4.6,
    images: {
      main: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
      gallery: [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop"
      ]
    },
    amenities: ["Mountain View", "Private Chef", "WiFi", "Terrace", "Room Service"]
  }
];

// Popular destinations data
export const popularDestinations = [
  {
    id: 1,
    name: "Shangri-La",
    location: "Colombo, Sri Lanka",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1780&auto=format&fit=crop",
    hotelCount: 70,
    popular: true
  },
  {
    id: 2,
    name: "Top View",
    location: "Hikkaduwe, Sri Lanka",
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop",
    hotelCount: 50,
    popular: false
  },
  {
    id: 3,
    name: "Green Villa",
    location: "Kandy, Sri Lanka",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
    hotelCount: 70,
    popular: false
  },
  {
    id: 4,
    name: "Wodden Pit",
    location: "Ambalangoda, Sri Lanka",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=2070&auto=format&fit=crop",
    hotelCount: 50,
    popular: false
  },
  {
    id: 5,
    name: "Boutique",
    location: "Kandy, Sri Lanka",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop",
    hotelCount: 50,
    popular: false
  },
  {
    id: 6,
    name: "Modern",
    location: "Nuwereliya, Sri Lanka",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070&auto=format&fit=crop",
    hotelCount: 30,
    popular: false
  },
  {
    id: 7,
    name: "Silver Rain",
    location: "Dehiwala, Sri Lanka",
    image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop",
    hotelCount: 40,
    popular: false
  },
  {
    id: 8,
    name: "Cashville",
    location: "Ampara, Sri Lanka",
    image: "https://images.unsplash.com/photo-1590073242678-70ee3fc28f8a?q=80&w=2121&auto=format&fit=crop",
    hotelCount: 30,
    popular: true
  }
];

// Sample hotel details for detail page
export const hotelDetails = {
  id: 1,
  name: "Grand Luxury Resort",
  location: "Jammu & Kashmir, India",
  price: 249,
  currency: "USD",
  description:
    "Nestled in the heart of Jammu & Kashmir, Grand Luxury Resort is your perfect retreat for an unforgettable stay in the breathtaking landscapes of the Himalayas. Whether you're here for a relaxing getaway, a romantic escape, or an adventure, our hotel offers world-class hospitality with a touch of Kashmiri charm.",
  longDescription:
    "At Grand Luxury Resort, we promise you a blend of comfort, elegance, and warm hospitality that makes your stay truly special. Come, experience the beauty of Kashmir!",
  address: "Near Dal Lake, Srinagar, Jammu & Kashmir",
  rating: 4.9,
  reviewCount: 156,
  amenities: [
    { name: "2 bedrooms", icon: "bed" },
    { name: "1 living room", icon: "layout" },
    { name: "2 bathrooms", icon: "bath" },
    { name: "1 dining room", icon: "utensils" },
    { name: "50 mbps/s", icon: "wifi" },
    { name: "10 unit ready", icon: "grid" },
    { name: "1 refrigerator", icon: "refrigerator" },
    { name: "2 television", icon: "tv" },
  ],
  images: {
    main: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2070&auto=format&fit=crop",
    ],
  }
};