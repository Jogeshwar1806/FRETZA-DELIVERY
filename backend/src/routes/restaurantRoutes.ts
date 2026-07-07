import { Router } from 'express';
import { getRestaurants, getRestaurantById, getRestaurantMenu } from '../controllers/restaurantController.js';

const router = Router();

router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);
router.get('/:id/menu', getRestaurantMenu);

export default router;
