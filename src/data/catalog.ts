export const restaurants = [
  {
    id: 1,
    name: "Rose Garden Restaurant",
    categories: "Burger - Chicken - Riche - Wings",
    rating: "4.7",
    delivery: "Free",
    time: "20 min",
    offers: ["Delivery", "Pick Up", "Offer", "Online payment available"],
    image: require("../../assets/images/home/restaurant-1.png"),
  },
  {
    id: 2,
    name: "Healthy Food Restaurant",
    categories: "Salad - Healthy - Vegetables",
    rating: "4.5",
    delivery: "Free",
    time: "25 min",
    offers: ["Delivery", "Online payment available"],
    image: require("../../assets/images/home/restaurant-2.png"),
  },
];

export const foodCategories = ['All', 'Burger', 'Hot Dog', 'Pizza', 'Sandwich', 'Salad', 'Desserts'];
export const dishes = [
  { id: 'burger', name: 'Burger Bistro', restaurantId: 1, restaurantName: 'Rose Garden', category: 'Burger', price: 40, keywords: 'burger beef sandwich fast food', image: require('../../assets/images/home/burger.png'), description: 'A juicy grilled beef burger with fresh lettuce, tomato, and our signature sauce.', ingredients: ['Beef', 'Lettuce', 'Tomato', 'Onion', 'Bread'] },
  { id: 'smokin-burger', name: "Smokin? Burger", restaurantId: 1, restaurantName: 'Cafenio Restaurant', category: 'Burger', price: 60, keywords: 'burger smoked beef fast food', image: require('../../assets/images/home/burger.png'), description: 'Smoky grilled beef, crisp vegetables, and a rich barbecue sauce in a toasted bun.', ingredients: ['Beef', 'Lettuce', 'Tomato', 'Onion', 'Bread'] },
  { id: 'buffalo-burger', name: 'Buffalo Burgers', restaurantId: 1, restaurantName: 'Kaji Kitchen', category: 'Burger', price: 75, keywords: 'burger buffalo spicy fast food', image: require('../../assets/images/home/burger.png'), description: 'A bold burger with buffalo sauce, fresh greens, and a soft toasted bun.', ingredients: ['Beef', 'Lettuce', 'Tomato', 'Onion', 'Bread'] },
  { id: 'bullseye-burger', name: 'Bullseye Burgers', restaurantId: 1, restaurantName: 'Kabob Restaurant', category: 'Burger', price: 94, keywords: 'burger beef cheese fast food', image: require('../../assets/images/home/burger.png'), description: 'Grilled beef topped with melted cheese and crisp vegetables.', ingredients: ['Beef', 'Cheese', 'Tomato', 'Onion', 'Bread'] },
  { id: 'hot-dog', name: 'Hot Dog', restaurantId: 1, restaurantName: 'Rose Garden', category: 'Hot Dog', price: 24, keywords: 'hot dog sausage sandwich fast food', image: require('../../assets/images/home/hot-dog.png'), description: 'A grilled sausage in a soft bun with mustard and fresh toppings.', ingredients: ['Sausage', 'Bread', 'Onion', 'Mustard'] },
  { id: 'european-pizza', name: 'European Pizza', restaurantId: 1, restaurantName: 'Uttora Coffe House', category: 'Pizza', price: 32, keywords: 'pizza calzone european cheese fast food', image: null, description: 'Prosciutto e funghi is a pizza variety that is topped with tomato sauce, cheese, mushrooms, and prosciutto.', ingredients: ['Cheese', 'Chicken', 'Onion', 'Garlic', 'Wheat'] },
  { id: 'buffalo-pizza', name: 'Buffalo Pizza', restaurantId: 1, restaurantName: 'Cafenio Coffee Club', category: 'Pizza', price: 36, keywords: 'pizza buffalo chicken cheese fast food', image: null, description: 'A crisp pizza with buffalo chicken, melted cheese, and tangy tomato sauce.', ingredients: ['Cheese', 'Chicken', 'Onion', 'Garlic', 'Wheat'] },
];
export type Dish = (typeof dishes)[number];
