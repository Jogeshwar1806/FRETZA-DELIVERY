import { Request, Response, NextFunction } from 'express';
import { Restaurant } from '../models/restaurantModel.js';
import { FoodItem } from '../models/foodItemModel.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const getRestaurants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tag, search } = req.query;
    const filterQuery: any = {};

    if (tag && tag !== 'all') {
      filterQuery.tags = tag;
    }

    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisine: { $regex: search, $options: 'i' } },
      ];
    }

    const restaurants = await Restaurant.find(filterQuery);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants: restaurants.map((r) => ({
        id: r.id,
        name: r.name,
        cuisine: r.cuisine,
        rating: r.rating,
        deliveryTime: r.deliveryTime,
        distance: r.distance,
        costForTwo: r.costForTwo,
        image: r.image,
        coverImage: r.coverImage,
        tags: r.tags,
        address: r.address,
        featured: r.featured,
        offers: r.offers,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return next(new AppError('Restaurant not found', 404));
    }

    // Fetch food items for this restaurant
    const foodItems = await FoodItem.find({ restaurantId: id });

    // Group items by category to match the layout models
    const menu = {
      bestsellers: foodItems.filter((f) => f.category === 'bestsellers').map(f => ({
        id: f.id,
        name: f.name,
        description: f.description,
        price: f.price,
        image: f.image,
        rating: f.rating,
        isVeg: f.isVeg,
        category: f.category,
        popular: f.popular
      })),
      mains: foodItems.filter((f) => f.category === 'mains').map(f => ({
        id: f.id,
        name: f.name,
        description: f.description,
        price: f.price,
        image: f.image,
        rating: f.rating,
        isVeg: f.isVeg,
        category: f.category,
        popular: f.popular
      })),
      desserts: foodItems.filter((f) => f.category === 'desserts').map(f => ({
        id: f.id,
        name: f.name,
        description: f.description,
        price: f.price,
        image: f.image,
        rating: f.rating,
        isVeg: f.isVeg,
        category: f.category,
        popular: f.popular
      })),
      beverages: foodItems.filter((f) => f.category === 'beverages').map(f => ({
        id: f.id,
        name: f.name,
        description: f.description,
        price: f.price,
        image: f.image,
        rating: f.rating,
        isVeg: f.isVeg,
        category: f.category,
        popular: f.popular
      })),
    };

    res.status(200).json({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        rating: restaurant.rating,
        deliveryTime: restaurant.deliveryTime,
        distance: restaurant.distance,
        costForTwo: restaurant.costForTwo,
        image: restaurant.image,
        coverImage: restaurant.coverImage,
        tags: restaurant.tags,
        address: restaurant.address,
        featured: restaurant.featured,
        offers: restaurant.offers,
        menu,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return next(new AppError('Restaurant not found', 404));
    }

    const foodItems = await FoodItem.find({ restaurantId: id });

    const menu = {
      bestsellers: foodItems.filter((f) => f.category === 'bestsellers').map(f => ({
        id: f.id,
        name: f.name,
        description: f.description,
        price: f.price,
        image: f.image,
        rating: f.rating,
        isVeg: f.isVeg,
        category: f.category,
        popular: f.popular
      })),
      mains: foodItems.filter((f) => f.category === 'mains').map(f => ({
        id: f.id,
        name: f.name,
        description: f.description,
        price: f.price,
        image: f.image,
        rating: f.rating,
        isVeg: f.isVeg,
        category: f.category,
        popular: f.popular
      })),
      desserts: foodItems.filter((f) => f.category === 'desserts').map(f => ({
        id: f.id,
        name: f.name,
        description: f.description,
        price: f.price,
        image: f.image,
        rating: f.rating,
        isVeg: f.isVeg,
        category: f.category,
        popular: f.popular
      })),
      beverages: foodItems.filter((f) => f.category === 'beverages').map(f => ({
        id: f.id,
        name: f.name,
        description: f.description,
        price: f.price,
        image: f.image,
        rating: f.rating,
        isVeg: f.isVeg,
        category: f.category,
        popular: f.popular
      })),
    };

    res.status(200).json({
      success: true,
      menu,
    });
  } catch (error) {
    next(error);
  }
};
