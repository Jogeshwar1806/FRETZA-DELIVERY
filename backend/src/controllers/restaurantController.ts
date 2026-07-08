import { Request, Response, NextFunction } from 'express';
import { Restaurant } from '../models/restaurantModel.js';
import { FoodItem } from '../models/foodItemModel.js';
import { User } from '../models/userModel.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const getRestaurants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tag, search } = req.query;

    // Find all approved merchant users
    const approvedMerchants = await User.find({
      role: { $in: ['restaurant_owner', 'Restaurant Owner'] },
      'merchantProfile.verificationStatus': 'Approved'
    }).select('_id');
    const approvedMerchantIds = approvedMerchants.map(m => m._id);

    const filterQuery: any = {
      ownerId: { $in: approvedMerchantIds }
    };

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

    // Fetch all available food items for these restaurants
    const restaurantIds = restaurants.map(r => r._id);
    const foodItems = await FoodItem.find({ restaurantId: { $in: restaurantIds }, availability: true });

    // Group food items by restaurantId
    const foodMap: { [key: string]: any[] } = {};
    foodItems.forEach(item => {
      const rId = item.restaurantId?.toString();
      if (rId) {
        if (!foodMap[rId]) foodMap[rId] = [];
        foodMap[rId].push(item);
      }
    });

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants: restaurants.map((r) => {
        const items = foodMap[r._id.toString()] || [];
        const menu = {
          bestsellers: items.filter(f => f.category === 'bestsellers' || f.bestSeller || f.popular || f.category.toLowerCase() === 'biryani' || f.category.toLowerCase() === 'burger').map(f => ({
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
          mains: items.filter(f => f.category === 'mains' || (!['bestsellers', 'desserts', 'beverages', 'cold drinks', 'tea', 'coffee'].includes(f.category.toLowerCase()))).map(f => ({
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
          desserts: items.filter(f => f.category === 'desserts' || f.category.toLowerCase() === 'desserts' || f.category.toLowerCase() === 'ice cream').map(f => ({
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
          beverages: items.filter(f => f.category === 'beverages' || ['beverages', 'cold drinks', 'tea', 'coffee', 'juice', 'water'].includes(f.category.toLowerCase())).map(f => ({
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

        return {
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
          menu,
        };
      }),
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

    const merchant = await User.findById(restaurant.ownerId);
    if (!merchant || merchant.merchantProfile?.verificationStatus !== 'Approved') {
      return next(new AppError('Restaurant is not currently approved by administration', 403));
    }

    // Fetch food items for this restaurant
    const foodItems = await FoodItem.find({ restaurantId: id });

    // Group items by category to match the layout models
    const menu = {
      bestsellers: foodItems.filter((f) => f.category === 'bestsellers' || f.bestSeller || f.popular || f.category.toLowerCase() === 'biryani' || f.category.toLowerCase() === 'burger').map(f => ({
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
      mains: foodItems.filter((f) => f.category === 'mains' || (!['bestsellers', 'desserts', 'beverages', 'cold drinks', 'tea', 'coffee'].includes(f.category.toLowerCase()))).map(f => ({
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
      desserts: foodItems.filter((f) => f.category === 'desserts' || f.category.toLowerCase() === 'desserts' || f.category.toLowerCase() === 'ice cream').map(f => ({
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
      beverages: foodItems.filter((f) => f.category === 'beverages' || ['beverages', 'cold drinks', 'tea', 'coffee', 'juice', 'water'].includes(f.category.toLowerCase())).map(f => ({
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
        tags: restaurant.tags || [],
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
      bestsellers: foodItems.filter((f) => f.category === 'bestsellers' || f.bestSeller || f.popular || f.category.toLowerCase() === 'biryani' || f.category.toLowerCase() === 'burger').map(f => ({
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
      mains: foodItems.filter((f) => f.category === 'mains' || (!['bestsellers', 'desserts', 'beverages', 'cold drinks', 'tea', 'coffee'].includes(f.category.toLowerCase()))).map(f => ({
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
      desserts: foodItems.filter((f) => f.category === 'desserts' || f.category.toLowerCase() === 'desserts' || f.category.toLowerCase() === 'ice cream').map(f => ({
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
      beverages: foodItems.filter((f) => f.category === 'beverages' || ['beverages', 'cold drinks', 'tea', 'coffee', 'juice', 'water'].includes(f.category.toLowerCase())).map(f => ({
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
