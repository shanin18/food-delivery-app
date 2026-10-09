export type FoodFilters = { offers: string[]; minutes: number | null; price: number | null; rating: number };
export const emptyFoodFilters: FoodFilters = { offers: [], minutes: null, price: null, rating: 0 };

export function matchesFoodFilters(price: number, restaurant: { offers: string[]; time: string; rating: string }, filters: FoodFilters) {
  return filters.offers.every(offer => restaurant.offers.includes(offer))
    && (filters.minutes === null || parseInt(restaurant.time, 10) <= filters.minutes)
    && (filters.rating === 0 || Number(restaurant.rating) >= filters.rating)
    && (filters.price === null || (price < 40 ? 1 : price <= 70 ? 2 : 3) === filters.price);
}
