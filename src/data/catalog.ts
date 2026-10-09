export const restaurants = [
  {
    id: 1,
    name: "Rose Garden Restaurant",
    categories: "Burger - Chicken - Riche - Wings",
    rating: "4.7",
    delivery: "Free",
    time: "20 min",
    image: require("../../assets/images/home/restaurant-1.png"),
  },
  {
    id: 2,
    name: "Healthy Food Restaurant",
    categories: "Salad - Healthy - Vegetables",
    rating: "4.5",
    delivery: "Free",
    time: "25 min",
    image: require("../../assets/images/home/restaurant-2.png"),
  },
];

export const dishes = [
  { id: 'burger', name: 'Classic Burger', restaurantId: 1, keywords: 'burger beef sandwich fast food', image: require('../../assets/images/home/burger.png') },
  { id: 'hot-dog', name: 'Hot Dog', restaurantId: 1, keywords: 'hot dog sausage sandwich fast food', image: require('../../assets/images/home/hot-dog.png') },
];
