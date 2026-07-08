import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/userModel.js';
import { Category } from '../models/categoryModel.js';
import { Restaurant } from '../models/restaurantModel.js';
import { FoodItem } from '../models/foodItemModel.js';
import { Coupon } from '../models/couponModel.js';

// Load Env
dotenv.config();

const categoriesData = [
  { name: 'Biryani', icon: 'rice_bowl' },
  { name: 'Meals', icon: 'restaurant' },
  { name: 'Breakfast', icon: 'breakfast_dining' },
  { name: 'Lunch', icon: 'lunch_dining' },
  { name: 'Dinner', icon: 'dinner_dining' },
  { name: 'Snacks', icon: 'cookie' },
  { name: 'Fast Food', icon: 'fastfood' },
  { name: 'Pizza', icon: 'local_pizza' },
  { name: 'Burger', icon: 'lunch_dining' },
  { name: 'Sandwich', icon: 'layers' },
  { name: 'Rolls', icon: 'wrap_text' },
  { name: 'Chinese', icon: 'ramen_dining' },
  { name: 'South Indian', icon: 'rice_bowl' },
  { name: 'North Indian', icon: 'flatware' },
  { name: 'Bakery', icon: 'bakery_dining' },
  { name: 'Ice Cream', icon: 'icecream' },
  { name: 'Desserts', icon: 'cake' },
  { name: 'Tea', icon: 'emoji_food_beverage' },
  { name: 'Coffee', icon: 'coffee' },
  { name: 'Cold Drinks', icon: 'local_drink' },
  { name: 'Juice', icon: 'liquor' },
  { name: 'Water', icon: 'water_drop' },
  { name: 'Grocery', icon: 'local_grocery_store' },
  { name: 'Fruits', icon: 'nutrition' },
  { name: 'Vegetables', icon: 'eco' },
  { name: 'Dairy', icon: 'egg' },
  { name: 'Household', icon: 'home' },
  { name: 'Electrical Equipment', icon: 'electrical_services' },
  { name: 'Electronics', icon: 'devices' },
  { name: 'Stationery', icon: 'edit' },
  { name: 'Pharmacy', icon: 'medical_services' },
  { name: 'Pet Food', icon: 'pets' },
  { name: 'Miscellaneous', icon: 'more_horiz' },
];

const seedDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/fretza';
    await mongoose.connect(connStr);
    console.log('Connected to MongoDB for seeding Phase 4...');

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Restaurant.deleteMany();
    await FoodItem.deleteMany();
    await Coupon.deleteMany();
    console.log('Existing collections cleared.');

    // 1. Create Default Users
    const hashedUserPassword = await bcryptjs.hash('password123', 10);
    
    // Customer
    const user = await User.create({
      name: 'Jogesh Dwivedi',
      phone: '9876543210',
      email: 'jogesh.dwivedi@fretza.com',
      password: hashedUserPassword,
      role: 'customer',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCQNEcS9UrzH3O090fWr5hpqlNyVksZ6JQ8WXY-_bkWQmWKx3ow0-krjdyL64WAEM30crkxpqq9-kx6NWrT5ZXidiZd03gIXp-8P8dNcPP0dwGD209vtpjar-C_f7-AeTk1a0ba2_5J4JH2iJKUDwn7_De7noc9Nn5H9wjMokSzFA6_4hifTqT-hcXrAWr6f18kYMVRn2rLHPFTFD2HhfwezXG2_sSuW_LHN1sPPNP5okF9QlD4Y283LR-uY2NoNjcubFNqfx0AQ',
      addresses: [
        {
          label: 'Home',
          houseNumber: 'Plot 42',
          street: 'Green Valley Apartments',
          village: 'Khunta Main Road',
          landmark: 'Ward 12',
          pincode: '757019',
          district: 'Mayurbhanj',
          state: 'Odisha',
          lat: 21.8214,
          lng: 86.4251,
          isDefault: true,
        },
      ],
    });

    // Restaurant Owner 1 (Saffron Grill & Royal Biryani)
    const merchant = await User.create({
      name: 'Rajesh Owner',
      phone: '9999999999',
      email: 'rajesh.owner@fretza.com',
      password: hashedUserPassword,
      role: 'restaurant_owner',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCQNEcS9UrzH3O090fWr5hpqlNyVksZ6JQ8WXY-_bkWQmWKx3ow0-krjdyL64WAEM30crkxpqq9-kx6NWrT5ZXidiZd03gIXp-8P8dNcPP0dwGD209vtpjar-C_f7-AeTk1a0ba2_5J4JH2iJKUDwn7_De7noc9Nn5H9wjMokSzFA6_4hifTqT-hcXrAWr6f18kYMVRn2rLHPFTFD2HhfwezXG2_sSuW_LHN1sPPNP5okF9QlD4Y283LR-uY2NoNjcubFNqfx0AQ',
      merchantProfile: {
        verificationStatus: 'Approved',
        restaurantName: 'The Saffron Grill',
      },
    });

    // Restaurant Owner 2 (Pizza Express & Healthy Cafe)
    const merchant2 = await User.create({
      name: 'Ramesh Owner',
      phone: '9999999998',
      email: 'ramesh.owner@fretza.com',
      password: hashedUserPassword,
      role: 'restaurant_owner',
      merchantProfile: {
        verificationStatus: 'Approved',
        restaurantName: 'Pizza Express & Burger Bar',
      },
    });

    // Delivery Partner
    await User.create({
      name: 'Bikram Rider',
      phone: '8888888888',
      email: 'bikram.rider@fretza.com',
      password: hashedUserPassword,
      role: 'driver',
      deliveryProfile: {
        vehicleType: 'Motorcycle',
        vehicleNumber: 'OD-11-A-1234',
        isVerified: true,
        isOnline: true,
      },
    });

    // Admin
    const hashedAdminPassword = await bcryptjs.hash('Jogeswastik@1', 10);
    await User.create({
      name: 'Fretza Admin',
      phone: '7978253881',
      email: 'admin@fretza.com',
      password: hashedAdminPassword,
      role: 'admin',
    });

    console.log('Mock users seeded.');

    // 2. Create Categories
    await Category.insertMany(categoriesData);
    console.log('Categories seeded.');

    // 3. Create Restaurants
    const saffronGrill = await Restaurant.create({
      ownerId: merchant._id,
      name: 'The Saffron Grill',
      cuisine: 'North Indian • Mughlai • Tandoor',
      rating: 4.8,
      deliveryTime: '25-30 min',
      distance: '2.4 km',
      costForTwo: 350,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxAmuvEhKKtcjPvpmPHAmNtjnUgNxZZkzsYfYg2T0d16BSeX1v2GVSM7TO7ofBPTGxaWAt3ReBlQHeV7UF87NSHmD-bqrezXMrWA8Vos2a5QthTMw7NZorGOqR5600-ScSe4AGyPZBH31vQkUeUlEpkxnKVXOgxb0e1795o1W514F1ewI2fN6jHt_2IeSUTzJ-5t2iN0Frp9_pwRg2Bz3VxAp54GjX0Sx9EMjH3M2NtEho-kG-imRbr301y-mlkpOBCGjSNx_dIQ',
      coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxAmuvEhKKtcjPvpmPHAmNtjnUgNxZZkzsYfYg2T0d16BSeX1v2GVSM7TO7ofBPTGxaWAt3ReBlQHeV7UF87NSHmD-bqrezXMrWA8Vos2a5QthTMw7NZorGOqR5600-ScSe4AGyPZBH31vQkUeUlEpkxnKVXOgxb0e1795o1W514F1ewI2fN6jHt_2IeSUTzJ-5t2iN0Frp9_pwRg2Bz3VxAp54GjX0Sx9EMjH3M2NtEho-kG-imRbr301y-mlkpOBCGjSNx_dIQ',
      tags: ['biryani', 'thali', 'north-indian'],
      address: 'Khunta Main Road, Ward 12, Mayurbhanj, Odisha',
      featured: true,
      description: 'The Saffron Grill is Khunta’s premier destination for fine Mughlai, rich North Indian curries, and smokey charcoal-grilled tandoor items.',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxAmuvEhKKtcjPvpmPHAmNtjnUgNxZZkzsYfYg2T0d16BSeX1v2GVSM7TO7ofBPTGxaWAt3ReBlQHeV7UF87NSHmD-bqrezXMrWA8Vos2a5QthTMw7NZorGOqR5600-ScSe4AGyPZBH31vQkUeUlEpkxnKVXOgxb0e1795o1W514F1ewI2fN6jHt_2IeSUTzJ-5t2iN0Frp9_pwRg2Bz3VxAp54GjX0Sx9EMjH3M2NtEho-kG-imRbr301y-mlkpOBCGjSNx_dIQ',
      openingTime: '11:00 AM',
      closingTime: '10:30 PM',
      deliveryRadius: 6,
      contactNumber: '9988776655',
      status: 'Open',
      coordinates: { lat: 21.8214, lng: 86.4251 },
      offers: [
        { code: 'SAFFRON50', text: '50% OFF up to ₹100' },
        { code: 'FREEBY', text: 'Free Sweet Lassi on orders above ₹400' },
      ],
    });

    const royalBiryani = await Restaurant.create({
      ownerId: merchant._id,
      name: 'Royal Biryani Junction',
      cuisine: 'Biryani • Hyderabadi • Mughlai',
      rating: 4.6,
      deliveryTime: '15-20 min',
      distance: '1.2 km',
      costForTwo: 250,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU-8aQY6MZTJF14D7OgMVHJmtm2PfjkCu9U9ojjM8lwK4XDfjjh0K_nRgtKRvxh-E8Rc30hsHQ7JSs4jhaZaqT2NdZxDiy9nA2XfQ5aHYDLIIwi1BXZ3fw3A1oIYG9akLNHKwNUFRdnyxiuCIp21xvOp4XjHSMUK3rJ10amxstvFGyKCuAcrjwC8ZkdiiNdtVx8_obsu2W6fCUhICqXmHP3KIenyVvdIAPf_-NedlFr9wcWKtKtp6dSrl7WsF2glIH56Y0D0iD_A',
      coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU-8aQY6MZTJF14D7OgMVHJmtm2PfjkCu9U9ojjM8lwK4XDfjjh0K_nRgtKRvxh-E8Rc30hsHQ7JSs4jhaZaqT2NdZxDiy9nA2XfQ5aHYDLIIwi1BXZ3fw3A1oIYG9akLNHKwNUFRdnyxiuCIp21xvOp4XjHSMUK3rJ10amxstvFGyKCuAcrjwC8ZkdiiNdtVx8_obsu2W6fCUhICqXmHP3KIenyVvdIAPf_-NedlFr9wcWKtKtp6dSrl7WsF2glIH56Y0D0iD_A',
      tags: ['biryani', 'north-indian'],
      address: 'Near Bus Stand, Khunta, Odisha',
      featured: false,
      description: 'The authentic flavor of Hyderabadi Handi Dum Biryani slow cooked to perfection.',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU-8aQY6MZTJF14D7OgMVHJmtm2PfjkCu9U9ojjM8lwK4XDfjjh0K_nRgtKRvxh-E8Rc30hsHQ7JSs4jhaZaqT2NdZxDiy9nA2XfQ5aHYDLIIwi1BXZ3fw3A1oIYG9akLNHKwNUFRdnyxiuCIp21xvOp4XjHSMUK3rJ10amxstvFGyKCuAcrjwC8ZkdiiNdtVx8_obsu2W6fCUhICqXmHP3KIenyVvdIAPf_-NedlFr9wcWKtKtp6dSrl7WsF2glIH56Y0D0iD_A',
      openingTime: '12:00 PM',
      closingTime: '10:00 PM',
      deliveryRadius: 4,
      contactNumber: '9988776644',
      status: 'Open',
      coordinates: { lat: 21.8228, lng: 86.4272 },
      offers: [
        { code: 'ROYAL100', text: 'Flat ₹100 off above ₹399' },
      ],
    });

    const pizzaExpress = await Restaurant.create({
      ownerId: merchant2._id,
      name: 'Pizza Express & Burger Bar',
      cuisine: 'Pizza • Fast Food • Burgers',
      rating: 4.5,
      deliveryTime: '18-22 min',
      distance: '3.1 km',
      costForTwo: 300,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPWT-waWRecQTq2KTGIgFv1spM-RjnQoa3yYSfAFFfZmj6g-OoEvWgIGdefOK81StIgnTneOpt8ewhRYRtK0JGy5asUh5mZnYAVdqamWkgtgU1jqDOJ7Pk7PiMiYiLJnokWg38hDgg00N2PZ_KjDumajStsZN5r21Q3_WAxPNaOv0Z4WpSCFUiXTzRaUBCHtNC42qK1v55rhvj2UIg5Oeo7sOh5x4nhEN2v7bJ23GwyR_hhFY1Mh3fNGePQ2opLlcY9dmXk9eGGA',
      coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPWT-waWRecQTq2KTGIgFv1spM-RjnQoa3yYSfAFFfZmj6g-OoEvWgIGdefOK81StIgnTneOpt8ewhRYRtK0JGy5asUh5mZnYAVdqamWkgtgU1jqDOJ7Pk7PiMiYiLJnokWg38hDgg00N2PZ_KjDumajStsZN5r21Q3_WAxPNaOv0Z4WpSCFUiXTzRaUBCHtNC42qK1v55rhvj2UIg5Oeo7sOh5x4nhEN2v7bJ23GwyR_hhFY1Mh3fNGePQ2opLlcY9dmXk9eGGA',
      tags: ['pizza', 'burgers'],
      address: 'College Square, Khunta, Odisha',
      featured: true,
      description: 'Hot sizzling hand-tossed pizzas and custom double-cheese flame grilled burgers.',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPWT-waWRecQTq2KTGIgFv1spM-RjnQoa3yYSfAFFfZmj6g-OoEvWgIGdefOK81StIgnTneOpt8ewhRYRtK0JGy5asUh5mZnYAVdqamWkgtgU1jqDOJ7Pk7PiMiYiLJnokWg38hDgg00N2PZ_KjDumajStsZN5r21Q3_WAxPNaOv0Z4WpSCFUiXTzRaUBCHtNC42qK1v55rhvj2UIg5Oeo7sOh5x4nhEN2v7bJ23GwyR_hhFY1Mh3fNGePQ2opLlcY9dmXk9eGGA',
      openingTime: '11:00 AM',
      closingTime: '11:00 PM',
      deliveryRadius: 8,
      contactNumber: '9988776633',
      status: 'Open',
      coordinates: { lat: 21.8201, lng: 86.4239 },
      offers: [
        { code: 'PIZZA20', text: '20% OFF on all Pizzas' },
      ],
    });

    const healthyCafe = await Restaurant.create({
      ownerId: merchant2._id,
      name: 'Green Garden Healthy Cafe',
      cuisine: 'Salads • Cafe • Organic',
      rating: 4.7,
      deliveryTime: '20-25 min',
      distance: '1.8 km',
      costForTwo: 400,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw8Tadnnt0MKfCkzGzyszb76HX7CfGw8xA5OCYBve7nzXrWsKDm_0JBLm9YD4Cr-ZNUz1CRmSNoq-kzrA-TX-8JwDajNYIYf2T6l1S7XztpMtzGUxyGVqvbCggsVs9nLYUokb8H5V8u-uaHCsoyxmuKaFQ4jHkJEKbx8f2pLgYI65-y3nDZ2Orx3uDwi3G7PUc77P2zbCl1QyY5JmtwWbafXciC-5pO2G44o4vyTshU6y1pDkF328n0CbKDUWSk4hXXg_n5KHDlQ',
      coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw8Tadnnt0MKfCkzGzyszb76HX7CfGw8xA5OCYBve7nzXrWsKDm_0JBLm9YD4Cr-ZNUz1CRmSNoq-kzrA-TX-8JwDajNYIYf2T6l1S7XztpMtzGUxyGVqvbCggsVs9nLYUokb8H5V8u-uaHCsoyxmuKaFQ4jHkJEKbx8f2pLgYI65-y3nDZ2Orx3uDwi3G7PUc77P2zbCl1QyY5JmtwWbafXciC-5pO2G44o4vyTshU6y1pDkF328n0CbKDUWSk4hXXg_n5KHDlQ',
      tags: ['cafe'],
      address: 'Near Medical College, Khunta, Odisha',
      featured: false,
      description: 'Guilt-free dining featuring locally sourced organic salads, hot brews, and nutritious bowls.',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw8Tadnnt0MKfCkzGzyszb76HX7CfGw8xA5OCYBve7nzXrWsKDm_0JBLm9YD4Cr-ZNUz1CRmSNoq-kzrA-TX-8JwDajNYIYf2T6l1S7XztpMtzGUxyGVqvbCggsVs9nLYUokb8H5V8u-uaHCsoyxmuKaFQ4jHkJEKbx8f2pLgYI65-y3nDZ2Orx3uDwi3G7PUc77P2zbCl1QyY5JmtwWbafXciC-5pO2G44o4vyTshU6y1pDkF328n0CbKDUWSk4hXXg_n5KHDlQ',
      openingTime: '08:00 AM',
      closingTime: '09:00 PM',
      deliveryRadius: 5,
      contactNumber: '9988776622',
      status: 'Open',
      coordinates: { lat: 21.8242, lng: 86.4285 },
      offers: [
        { code: 'HEALTHY15', text: '15% OFF on salads' },
      ],
    });

    console.log('Restaurants seeded.');

    // 4. Create FoodItems
    const foodItems = [
      // Saffron Grill items
      {
        name: 'Paneer Tikka Butter Masala',
        description: 'Cubes of paneer cooked in a rich, creamy tomato-based gravy with butter and aromatic spices.',
        price: 280,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyNYD1_EP8cYeyyAnIgb04gE_wCkaMSQ81DoBDSZoVQiuQHZVF0WhwbRU1IpDZC9ttnsn0P46lEVjs4KX5xRBTHkf2c-WppzHqcC6E0Mbe8q38SeNLbfLk5KtiLJhGe7-TGkwRkLGJwMFnHMI3vvggAKE11DY6cfMGo5TEOU_hZTcqa8la0jrZZwiRQUoHbBMFUfHM1vn143zb_41o0u3wk3Ak2pWKsgKleEcjPrX5rPnKhigZkrd4VcktbeqEyA-oXKYf03A5ug',
        rating: 4.9,
        isVeg: true,
        category: 'North Indian',
        popular: true,
        restaurantId: saffronGrill._id,
        restaurantName: saffronGrill.name,
        ownerId: merchant._id,
        merchantId: merchant._id,
        merchantName: merchant.name,
        createdBy: merchant._id,
        updatedBy: merchant._id,
        discountPrice: 249,
        preparationTime: '20 min',
        availableQuantity: 45,
        availability: true,
        isNonVeg: false,
        bestSeller: true,
        recommended: true,
        todaySpecial: true,
      },
      {
        name: 'Murg Dum Biryani',
        description: 'Fragrant basmati rice layered with succulent chicken pieces and spices, slow-cooked in a sealed clay pot.',
        price: 350,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArx-O7o0i5J3gkwn5pKInmX34WSDa3cj810iAJGGNYSZdX7qsrrHvw37jEIXpSw1gs9enoev45bEdallUdsx09TIqbWxedluOkn7jw0AH_D5I6p14KTzmrmvayPOnitdB3gRO1gr_Uk9_HDugQXlytC9IWXg8Kkprj7FChNE5oenY34j82DRJdUXBtJs_BzZDidrApDrikr_8ksbeCa364Thg5-fVePbtEVVerKekAEunJHHJOkkAOmC1H8zeudePBTx6vTTrFvg',
        rating: 4.8,
        isVeg: false,
        category: 'Biryani',
        popular: true,
        restaurantId: saffronGrill._id,
        restaurantName: saffronGrill.name,
        ownerId: merchant._id,
        merchantId: merchant._id,
        merchantName: merchant.name,
        createdBy: merchant._id,
        updatedBy: merchant._id,
        discountPrice: 320,
        preparationTime: '25 min',
        availableQuantity: 30,
        availability: true,
        isNonVeg: true,
        bestSeller: true,
        recommended: true,
        todaySpecial: false,
      },
      {
        name: 'Dal Makhani Special',
        description: 'Overnight slow-cooked black lentils with cream and dollops of butter.',
        price: 220,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCv0kmSpfugcAv-KXjZmr-J_KFbICHVSM-9XHqwZn1taXrzR01rC7Sq0ohjtZCOhSBhd2Wao5XK5xRFipyh5kRgyjVzgw1mYGCGYWM8PK3I8TwjEz6A_Y4rCCJ_jPRyxZjz-snXiiYaB6_N6FICNgUfCP-FE6XDvPtb4mTQKywiqGnSG5aPTPoK8HJ7_bK6eKZT9PPPb0btjWBesZQNYT8FnLC0TL4vjfBTr_RB7fG1OO6kS-1Hpx2RBcGBl0aXK4JjwhU4yZnjfA',
        rating: 4.7,
        isVeg: true,
        category: 'Meals',
        restaurantId: saffronGrill._id,
        restaurantName: saffronGrill.name,
        ownerId: merchant._id,
        merchantId: merchant._id,
        merchantName: merchant.name,
        createdBy: merchant._id,
        updatedBy: merchant._id,
        preparationTime: '15 min',
        availableQuantity: 60,
        availability: true,
        isNonVeg: false,
        bestSeller: false,
        recommended: false,
        todaySpecial: false,
      },
      {
        name: 'Kadai Murg',
        description: 'Chicken pieces tossed with bell peppers and onion in a spicy masala.',
        price: 320,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjV30BzP-9o9UjLCOoDTzFRsxwF3kLpBgVWhoXJ61GxsCs3gCRpJ5_RkfDsLa0waPU_egtw8tag3gbC4gLKviMV4oJgKHEba1u31_-s3Qqt65O-SHh4EvwUng-EdcIR4jJc59tus-IQ8req5N3DxvG0udamx5a9b7QscO_IQ77QHyFW7WxdFU5YUHGbc_qRqFRKr9Vixz3A0LAZwUqTFAnihh6vYR4lGwY_bulBpbJ9EJanhkbw8TjhlU0L73jd6USVojBGr3ZGA',
        rating: 4.6,
        isVeg: false,
        category: 'North Indian',
        restaurantId: saffronGrill._id,
        restaurantName: saffronGrill.name,
        ownerId: merchant._id,
        merchantId: merchant._id,
        merchantName: merchant.name,
        createdBy: merchant._id,
        updatedBy: merchant._id,
        preparationTime: '20 min',
        availableQuantity: 25,
        availability: true,
        isNonVeg: true,
        bestSeller: false,
        recommended: true,
        todaySpecial: false,
      },
      {
        name: 'Shahi Tukda',
        description: 'Deep-fried bread slices soaked in sugar syrup and topped with rich rabri and nuts.',
        price: 120,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAU-8aQY6MZTJF14D7OgMVHJmtm2PfjkCu9U9ojjM8lwK4XDfjjh0K_nRgtKRvxh-E8Rc30hsHQ7JSs4jhaZaqT2NdZxDiy9nA2XfQ5aHYDLIIwi1BXZ3fw3A1oIYG9akLNHKwNUFRdnyxiuCIp21xvOp4XjHSMUK3rJ10amxstvFGyKCuAcrjwC8ZkdiiNdtVx8_obsu2W6fCUhICqXmHP3KIenyVvdIAPf_-NedlFr9wcWKtKtp6dSrl7WsF2glIH56Y0D0iD_A',
        rating: 4.8,
        isVeg: true,
        category: 'Desserts',
        restaurantId: saffronGrill._id,
        restaurantName: saffronGrill.name,
        ownerId: merchant._id,
        merchantId: merchant._id,
        merchantName: merchant.name,
        createdBy: merchant._id,
        updatedBy: merchant._id,
        preparationTime: '10 min',
        availableQuantity: 40,
        availability: true,
        isNonVeg: false,
        bestSeller: false,
        recommended: false,
        todaySpecial: true,
      },
      {
        name: 'Sweet Saffron Lassi',
        description: 'A tall glass of frothy sweet lassi garnished with saffron strands and pistachios.',
        price: 80,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJxQzg9I1VjsjXr7OQfVKA7x558S_67KzLNGihMOG8nC75yBf4QIF7YqM-99dyrKl5c5KhhP-DbA8n3Z6Bdsl1k4lHvGEGvu5nlb9Kv-dKpXfd2sMgKIpunuACOjDWVrZSJM4uwC2eztiDiU5KxEW6Mel7ScpmSPuxP7ag-eJRLwN45cIFscNG428g9XQ9TWRZC4njHDO1O6z8q6d2AV3XCa4k8ujU_Xk0VnWNrK1VRSHsicvYtVaki8yagJVYklXmp77DUktVlg',
        rating: 4.9,
        isVeg: true,
        category: 'Cold Drinks',
        restaurantId: saffronGrill._id,
        restaurantName: saffronGrill.name,
        ownerId: merchant._id,
        merchantId: merchant._id,
        merchantName: merchant.name,
        createdBy: merchant._id,
        updatedBy: merchant._id,
        preparationTime: '5 min',
        availableQuantity: 100,
        availability: true,
        isNonVeg: false,
        bestSeller: true,
        recommended: false,
        todaySpecial: false,
      },
      // Royal Biryani items
      {
        name: 'Chicken Dum Biryani (Full)',
        description: 'Aromatic basmati rice cooked with spice-infused chicken and standard herbs.',
        price: 240,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArx-O7o0i5J3gkwn5pKInmX34WSDa3cj810iAJGGNYSZdX7qsrrHvw37jEIXpSw1gs9enoev45bEdallUdsx09TIqbWxedluOkn7jw0AH_D5I6p14KTzmrmvayPOnitdB3gRO1gr_Uk9_HDugQXlytC9IWXg8Kkprj7FChNE5oenY34j82DRJdUXBtJs_BzZDidrApDrikr_8ksbeCa364Thg5-fVePbtEVVerKekAEunJHHJOkkAOmC1H8zeudePBTx6vTTrFvg',
        rating: 4.7,
        isVeg: false,
        category: 'Biryani',
        popular: true,
        restaurantId: royalBiryani._id,
        restaurantName: royalBiryani.name,
        ownerId: merchant._id,
        merchantId: merchant._id,
        merchantName: merchant.name,
        createdBy: merchant._id,
        updatedBy: merchant._id,
        preparationTime: '20 min',
        availableQuantity: 50,
        availability: true,
        isNonVeg: true,
        bestSeller: true,
        recommended: true,
        todaySpecial: false,
      },
      // Pizza Express items
      {
        name: 'Double Truffle Burger',
        description: 'Premium artisan burger with double truffled cheese patty, fresh heirloom tomatoes, and crisp lettuce.',
        price: 549,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKuz63icQv1veP9wJJpQaYbn0127nxvam4JLpMIlwxi_YnbXjlBXpJBfONPLimMIrQRkqYuDeE7EyQcbHCBsmu5Xl89s5IjMSQs_zZY8tx2hmAiLmAM2Yrzq-gvmzDNpnmTfvQ2PqwbpIZQX7zrFLAcBheVcrRuuWFdR31ltaNQeWSYBdSWMBWD6aZBX9IMLJo0A_NeHMcQDeWh65rtE8bhFnRYxMBtLxbGiw1GNJ9r2IMzW6QNLHcf_ib2RK6qXbRgxp-_kU0WQ',
        rating: 4.8,
        isVeg: false,
        category: 'Burger',
        popular: true,
        restaurantId: pizzaExpress._id,
        restaurantName: pizzaExpress.name,
        ownerId: merchant2._id,
        merchantId: merchant2._id,
        merchantName: merchant2.name,
        createdBy: merchant2._id,
        updatedBy: merchant2._id,
        preparationTime: '15 min',
        availableQuantity: 20,
        availability: true,
        isNonVeg: true,
        bestSeller: true,
        recommended: false,
        todaySpecial: false,
      },
      // Healthy Cafe items
      {
        name: 'Mediterranean Salad Bowl',
        description: 'Kalamata olives, premium feta cheese, cherry tomatoes, and cucumber drizzled with light olive oil.',
        price: 320,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw8Tadnnt0MKfCkzGzyszb76HX7CfGw8xA5OCYBve7nzXrWsKDm_0JBLm9YD4Cr-ZNUz1CRmSNoq-kzrA-TX-8JwDajNYIYf2T6l1S7XztpMtzGUxyGVqvbCggsVs9nLYUokb8H5V8u-uaHCsoyxmuKaFQ4jHkJEKbx8f2pLgYI65-y3nDZ2Orx3uDwi3G7PUc77P2zbCl1QyY5JmtwWbafXciC-5pO2G44o4vyTshU6y1pDkF328n0CbKDUWSk4hXXg_n5KHDlQ',
        rating: 4.8,
        isVeg: true,
        category: 'Meals',
        popular: true,
        restaurantId: healthyCafe._id,
        restaurantName: healthyCafe.name,
        ownerId: merchant2._id,
        merchantId: merchant2._id,
        merchantName: merchant2.name,
        createdBy: merchant2._id,
        updatedBy: merchant2._id,
        preparationTime: '12 min',
        availableQuantity: 30,
        availability: true,
        isNonVeg: false,
        bestSeller: true,
        recommended: true,
        todaySpecial: false,
      },
    ];

    await FoodItem.insertMany(foodItems);
    console.log('Food items seeded.');

    // 5. Create Coupons
    await Coupon.create([
      {
        code: 'FRETZABIRYANI',
        discount: 100,
        isPercentage: false,
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        minOrder: 300,
        maxDiscount: 100,
        status: 'Active',
      },
      {
        code: 'ROYAL50',
        discount: 0.5, // 50%
        isPercentage: true,
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        minOrder: 150,
        maxDiscount: 100,
        status: 'Active',
      },
      {
        code: 'WELCOME20',
        discount: 0.2, // 20%
        isPercentage: true,
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        minOrder: 100,
        maxDiscount: 150,
        status: 'Active',
      },
    ]);
    console.log('Coupons seeded.');

    console.log('Database seeded successfully for Phase 4!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding database failed:', error);
    mongoose.connection.close();
  }
};

seedDB();
