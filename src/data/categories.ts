import { Category } from "@/types";

export const categories: Category[] = [
  {
    "_id": "cat_home",
    "name": "Home & Kitchen",
    "slug": "home-and-kitchen",
    "image": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80",
    "description": "Smart kitchen tools, organization, and home decor.",
    "isActive": true,
    "order": 1
  },
  {
    "_id": "cat_electronics",
    "name": "Electronics & Gadgets",
    "slug": "electronics",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    "description": "Smart watches, accessories, chargers, and lights.",
    "isActive": true,
    "order": 2
  },
  {
    "_id": "cat_beauty",
    "name": "Beauty & Personal Care",
    "slug": "beauty",
    "image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80",
    "description": "Skincare, makeup tools, massage devices, and health.",
    "isActive": true,
    "order": 3
  },
  {
    "_id": "cat_fashion",
    "name": "Fashion & Accessories",
    "slug": "fashion",
    "image": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80",
    "description": "Wholesale bags, watches, socks, and jewelry.",
    "isActive": true,
    "order": 4
  },
  {
    "_id": "cat_hardware",
    "name": "Hardware & Utility",
    "slug": "hardware",
    "image": "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=400&q=80",
    "description": "Handy tools, flashlights, tape, and utility items.",
    "isActive": true,
    "order": 5
  },
  {
    "_id": "cat_toys",
    "name": "Toys & Baby Care",
    "slug": "toys",
    "image": "https://images.unsplash.com/photo-1537655780520-1e392edd816a?auto=format&fit=crop&w=400&q=80",
    "description": "Kids educational toys, baby care, and security items.",
    "isActive": true,
    "order": 6
  },
  {
    "_id": "cat_kitchen_tools",
    "name": "Kitchen Tools",
    "slug": "kitchen-tools",
    "parentId": "cat_home",
    "image": "",
    "isActive": true,
    "order": 1
  },
  {
    "_id": "cat_home_cleaning",
    "name": "Cleaning & Utility",
    "slug": "cleaning-and-utility",
    "parentId": "cat_home",
    "image": "",
    "isActive": true,
    "order": 2
  },
  {
    "_id": "cat_mob_acc",
    "name": "Mobile Accessories",
    "slug": "mobile-accessories",
    "parentId": "cat_electronics",
    "image": "",
    "isActive": true,
    "order": 1
  },
  {
    "_id": "cat_smart_devices",
    "name": "Smart Devices",
    "slug": "smart-devices",
    "parentId": "cat_electronics",
    "image": "",
    "isActive": true,
    "order": 2
  },
  {
    "_id": "cat_skincare",
    "name": "Skincare Tools",
    "slug": "skincare-tools",
    "parentId": "cat_beauty",
    "image": "",
    "isActive": true,
    "order": 1
  },
  {
    "_id": "cat_bags",
    "name": "Bags & Luggage",
    "slug": "bags-luggage",
    "parentId": "cat_fashion",
    "image": "",
    "isActive": true,
    "order": 1
  },
  {
    "_id": "cat_hand_tools",
    "name": "Handy & Power Tools",
    "slug": "handy-power-tools",
    "parentId": "cat_hardware",
    "image": "",
    "isActive": true,
    "order": 1
  },
  {
    "_id": "cat_flashlights",
    "name": "Flashlights & Torch",
    "slug": "flashlights-torch",
    "parentId": "cat_hardware",
    "image": "",
    "isActive": true,
    "order": 2
  },
  {
    "_id": "cat_edu_toys",
    "name": "Educational Toys",
    "slug": "educational-toys",
    "parentId": "cat_toys",
    "image": "",
    "isActive": true,
    "order": 1
  },
  {
    "_id": "cat_baby_utility",
    "name": "Baby Care & Security",
    "slug": "baby-care-security",
    "parentId": "cat_toys",
    "image": "",
    "isActive": true,
    "order": 2
  }
];
