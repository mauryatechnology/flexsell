export const categories = [
  {
    "_id": "60c72b2f9b1d8e001c8e1a10",
    "name": "Home & Kitchen",
    "slug": "home-and-kitchen",
    "image": "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80",
    "description": "Smart kitchen tools, organization, and home decor.",
    "isActive": true,
    "order": 1
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1a11",
    "name": "Electronics & Gadgets",
    "slug": "electronics",
    "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80",
    "description": "Smart watches, accessories, chargers, and lights.",
    "isActive": true,
    "order": 2
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1a12",
    "name": "Beauty & Personal Care",
    "slug": "beauty",
    "image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80",
    "description": "Skincare, makeup tools, massage devices, and health.",
    "isActive": true,
    "order": 3
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1a13",
    "name": "Fashion & Accessories",
    "slug": "fashion",
    "image": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80",
    "description": "Wholesale bags, watches, socks, and jewelry.",
    "isActive": true,
    "order": 4
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1a14",
    "name": "Hardware & Utility",
    "slug": "hardware",
    "image": "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=400&q=80",
    "description": "Handy tools, flashlights, tape, and utility items.",
    "isActive": true,
    "order": 5
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1a15",
    "name": "Toys & Baby Care",
    "slug": "toys",
    "image": "https://images.unsplash.com/photo-1537655780520-1e392edd816a?auto=format&fit=crop&w=400&q=80",
    "description": "Kids educational toys, baby care, and security items.",
    "isActive": true,
    "order": 6
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1a16",
    "name": "Kitchen Tools",
    "slug": "kitchen-tools",
    "parentId": "60c72b2f9b1d8e001c8e1a10",
    "image": "",
    "isActive": true,
    "order": 1
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1a17",
    "name": "Cleaning & Utility",
    "slug": "cleaning-and-utility",
    "parentId": "60c72b2f9b1d8e001c8e1a10",
    "image": "",
    "isActive": true,
    "order": 2
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1a18",
    "name": "Mobile Accessories",
    "slug": "mobile-accessories",
    "parentId": "60c72b2f9b1d8e001c8e1a11",
    "image": "",
    "isActive": true,
    "order": 1
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1a19",
    "name": "Smart Devices",
    "slug": "smart-devices",
    "parentId": "60c72b2f9b1d8e001c8e1a11",
    "image": "",
    "isActive": true,
    "order": 2
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1a1a",
    "name": "Skincare Tools",
    "slug": "skincare-tools",
    "parentId": "60c72b2f9b1d8e001c8e1a12",
    "image": "",
    "isActive": true,
    "order": 1
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1a1b",
    "name": "Bags & Luggage",
    "slug": "bags-luggage",
    "parentId": "60c72b2f9b1d8e001c8e1a13",
    "image": "",
    "isActive": true,
    "order": 1
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1a1c",
    "name": "Handy & Power Tools",
    "slug": "handy-power-tools",
    "parentId": "60c72b2f9b1d8e001c8e1a14",
    "image": "",
    "isActive": true,
    "order": 1
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1a1d",
    "name": "Flashlights & Torch",
    "slug": "flashlights-torch",
    "parentId": "60c72b2f9b1d8e001c8e1a14",
    "image": "",
    "isActive": true,
    "order": 2
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1a1e",
    "name": "Educational Toys",
    "slug": "educational-toys",
    "parentId": "60c72b2f9b1d8e001c8e1a15",
    "image": "",
    "isActive": true,
    "order": 1
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1a1f",
    "name": "Baby Care & Security",
    "slug": "baby-care-security",
    "parentId": "60c72b2f9b1d8e001c8e1a15",
    "image": "",
    "isActive": true,
    "order": 2
  }
];

export const customers = [
  {
    "_id": "FSW-0001",
    "name": "John Doe",
    "email": "john@doeent.com",
    "password": "password123",
    "role": "customer",
    "company": "Doe Ent.",
    "address": "45 Textile Market, Ring Road",
    "city": "Surat",
    "state": "Gujarat",
    "pinCode": "395002",
    "phone": "+91 98765 43210",
    "initials": "JD",
    "gstin": "24AAACD4521D1Z1"
  },
  {
    "_id": "FSW-0002",
    "name": "Jane Smith",
    "email": "jane@smithretail.in",
    "password": "password123",
    "role": "customer",
    "company": "Smith Retail Group",
    "address": "GIDC Electronic Zone, Sector 26",
    "city": "Gandhinagar",
    "state": "Gujarat",
    "pinCode": "382010",
    "phone": "+91 88877 66655",
    "initials": "JS",
    "gstin": "24AAACS9823S2Z5"
  },
  {
    "_id": "FSW-0003",
    "name": "Amit Patel",
    "email": "amit@pateldistributors.com",
    "password": "password123",
    "role": "customer",
    "company": "Patel Distributors",
    "address": "Industrial Area Phase 2",
    "city": "Ahmedabad",
    "state": "Gujarat",
    "pinCode": "380001",
    "phone": "+91 99988 77766",
    "initials": "AP",
    "gstin": "24AAACP4512P1ZA"
  }
];

export const products = [
  {
    "_id": "60c72b2f9b1d8e001c8e1001",
    "title": "Multi-Functional 12-in-1 Vegetable Chopper & Slicer",
    "slug": "multi-functional-12-in-1-vegetable-chopper-slicer",
    "description": "Effortlessly chop, slice, grate, and dice vegetables with our ultimate kitchen utility helper. Comes with 8 interchangeable stainless steel blades, a safety hand guard, and a large catch container. Perfect for busy kitchens, saving up to 70% of food preparation time.",
    "categoryId": "60c72b2f9b1d8e001c8e1a16",
    "rating": 4.5,
    "reviewCount": 120,
    "tags": ["bestseller", "wholesale", "kitchen-tools"],
    "isActive": true,
    "totalStock": 500,
    "hsnCode": "3924",
    "gstRate": 18,
    "priceIncludesGst": true,
    "moq": 10,
    "seoTitle": "Wholesale 12-in-1 Vegetable Chopper & Slicer | FlexSell",
    "seoDescription": "Buy bulk multi-functional vegetable choppers and slicers. High quality, food-grade plastic and stainless steel blades. Direct wholesale factory pricing.",
    "seoKeywords": "vegetable chopper, food slicer, kitchen cutter, wholesale kitchen tools",
    "colorVariants": [
      {
        "color": "Forest Green",
        "dimensions": "15x12x8 cm",
        "images": [
          "https://images.unsplash.com/photo-1540339832862-474514151633?auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80"
        ],
        "subVariants": [
          {
            "id": "60c72b2f9b1d8e001c8e1001-green-std-250",
            "size": "Standard 1.2L",
            "weight": "250g",
            "price": 249,
            "mrp": 499,
            "discount": 50,
            "stock": 100,
            "sku": "CHOP12-GRN-STD-250",
            "barcode": "FX10011"
          },
          {
            "id": "60c72b2f9b1d8e001c8e1001-green-pro-500",
            "size": "Pro 2.0L",
            "weight": "500g",
            "price": 349,
            "mrp": 699,
            "discount": 50,
            "stock": 150,
            "sku": "CHOP12-GRN-PRO-500",
            "barcode": "FX10012"
          }
        ]
      },
      {
        "color": "Slate Gray",
        "dimensions": "15x12x8 cm",
        "images": [
          "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80"
        ],
        "subVariants": [
          {
            "id": "60c72b2f9b1d8e001c8e1001-gray-std-250",
            "size": "Standard 1.2L",
            "weight": "250g",
            "price": 249,
            "mrp": 499,
            "discount": 50,
            "stock": 120,
            "sku": "CHOP12-GRY-STD-250",
            "barcode": "FX10013"
          },
          {
            "id": "60c72b2f9b1d8e001c8e1001-gray-pro-500",
            "size": "Pro 2.0L",
            "weight": "500g",
            "price": 349,
            "mrp": 699,
            "discount": 50,
            "stock": 130,
            "sku": "CHOP12-GRY-PRO-500",
            "barcode": "FX10014"
          }
        ]
      }
    ],
    "aPlusContent": [
      {
        "id": "ap-chop-1",
        "type": "text",
        "title": "Save Cooking Time",
        "content": "Our food chopper cuts meal prep time significantly, allowing you to prepare healthy dishes for your customers fast and efficiently."
      },
      {
        "id": "ap-chop-2",
        "type": "features",
        "title": "Key Features",
        "features": [
          "8 Premium Interchangeable Stainless Steel Blades",
          "Thickened Catch Tray with Anti-Slip Base",
          "Safety Hand Guard for Protection",
          "Easy Assembly & Disassembly for Cleaning"
        ]
      }
    ],
    "fieldVisibility": {
      "showDescription": true,
      "showSizes": true,
      "showWeights": true,
      "showDimensions": true,
      "showImages": true
    }
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1002",
    "title": "USB Rechargeable Electric Garlic Masher & Chopper",
    "slug": "usb-rechargeable-electric-garlic-masher",
    "description": "Mini electric garlic chopper and vegetable masher with premium food-grade PC material, sharp stainless steel blades, and a powerful rechargeable motor. Compact, portable, and runs up to 35 times on a single USB charge.",
    "categoryId": "60c72b2f9b1d8e001c8e1a19",
    "rating": 4.3,
    "reviewCount": 85,
    "tags": ["smart-gadget", "electronics", "new-arrival"],
    "isActive": true,
    "totalStock": 300,
    "hsnCode": "8509",
    "gstRate": 18,
    "priceIncludesGst": true,
    "moq": 5,
    "seoTitle": "Bulk Electric Garlic Masher & Chopper | B2B Marketplace",
    "seoDescription": "Premium USB rechargeable electric food chopper. Compact design, sharp dual-blades, easy wireless usage. Ideal for wholesale import.",
    "seoKeywords": "garlic chopper, electric food masher, mini chopper, wireless grinder",
    "colorVariants": [
      {
        "color": "Glossy White",
        "dimensions": "9x9x12 cm",
        "images": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
        ],
        "subVariants": [
          {
            "id": "60c72b2f9b1d8e001c8e1002-white-250",
            "size": "250ml",
            "weight": "150g",
            "price": 189,
            "mrp": 399,
            "discount": 52,
            "stock": 80,
            "sku": "GR-MASH-WHT-250",
            "barcode": "FX20021"
          },
          {
            "id": "60c72b2f9b1d8e001c8e1002-white-350",
            "size": "350ml",
            "weight": "200g",
            "price": 229,
            "mrp": 499,
            "discount": 54,
            "stock": 70,
            "sku": "GR-MASH-WHT-350",
            "barcode": "FX20022"
          }
        ]
      },
      {
        "color": "Pastel Pink",
        "dimensions": "9x9x12 cm",
        "images": [
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80"
        ],
        "subVariants": [
          {
            "id": "60c72b2f9b1d8e001c8e1002-pink-250",
            "size": "250ml",
            "weight": "150g",
            "price": 189,
            "mrp": 399,
            "discount": 52,
            "stock": 90,
            "sku": "GR-MASH-PNK-250",
            "barcode": "FX20023"
          },
          {
            "id": "60c72b2f9b1d8e001c8e1002-pink-350",
            "size": "350ml",
            "weight": "200g",
            "price": 229,
            "mrp": 499,
            "discount": 54,
            "stock": 60,
            "sku": "GR-MASH-PNK-350",
            "barcode": "FX20024"
          }
        ]
      }
    ],
    "fieldVisibility": {
      "showDescription": true,
      "showSizes": true,
      "showWeights": true,
      "showDimensions": true,
      "showImages": true
    }
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1003",
    "title": "Premium Stainless Steel Cutlery & Spoon Set",
    "slug": "premium-stainless-steel-cutlery-set",
    "description": "Exquisite 18/10 stainless steel tableware set with sleek polished finish. Rust-resistant, luxury design suitable for family dining, banquets, and hotels. Includes dinner spoons, dinner forks, knives, and tea spoons.",
    "categoryId": "60c72b2f9b1d8e001c8e1a16",
    "rating": 4.7,
    "reviewCount": 94,
    "tags": ["premium", "bestseller", "hotelware"],
    "isActive": true,
    "totalStock": 200,
    "hsnCode": "8215",
    "gstRate": 18,
    "priceIncludesGst": true,
    "moq": 12,
    "seoTitle": "High-End Stainless Steel Cutlery Set Wholesale | FlexSell",
    "seoDescription": "Source luxurious 18/10 stainless steel spoons, forks, and knives. Premium packaging, direct wholesale supplier prices.",
    "seoKeywords": "cutlery set, stainless steel spoons, flatware wholesale, hotel cutlery",
    "colorVariants": [
      {
        "color": "Rose Gold",
        "dimensions": "25x15x5 cm",
        "images": [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
        ],
        "subVariants": [
          {
            "id": "60c72b2f9b1d8e001c8e1003-rose-12",
            "size": "12-Piece Set",
            "weight": "800g",
            "price": 599,
            "mrp": 1299,
            "discount": 53,
            "stock": 35,
            "sku": "CUT-RGD-12PC",
            "barcode": "FX30031"
          },
          {
            "id": "60c72b2f9b1d8e001c8e1003-rose-24",
            "size": "24-Piece Set",
            "weight": "1.6kg",
            "price": 1099,
            "mrp": 2499,
            "discount": 56,
            "stock": 30,
            "sku": "CUT-RGD-24PC",
            "barcode": "FX30032"
          }
        ]
      },
      {
        "color": "Matte Black",
        "dimensions": "25x15x5 cm",
        "images": [
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"
        ],
        "subVariants": [
          {
            "id": "60c72b2f9b1d8e001c8e1003-blk-12",
            "size": "12-Piece Set",
            "weight": "800g",
            "price": 549,
            "mrp": 1199,
            "discount": 54,
            "stock": 45,
            "sku": "CUT-BLK-12PC",
            "barcode": "FX30033"
          },
          {
            "id": "60c72b2f9b1d8e001c8e1003-blk-24",
            "size": "24-Piece Set",
            "weight": "1.6kg",
            "price": 999,
            "mrp": 2299,
            "discount": 56,
            "stock": 40,
            "sku": "CUT-BLK-24PC",
            "barcode": "FX30034"
          }
        ]
      },
      {
        "color": "Mirror Gold",
        "dimensions": "25x15x5 cm",
        "images": [
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
        ],
        "subVariants": [
          {
            "id": "60c72b2f9b1d8e001c8e1003-gld-12",
            "size": "12-Piece Set",
            "weight": "800g",
            "price": 649,
            "mrp": 1399,
            "discount": 53,
            "stock": 25,
            "sku": "CUT-GLD-12PC",
            "barcode": "FX30035"
          },
          {
            "id": "60c72b2f9b1d8e001c8e1003-gld-24",
            "size": "24-Piece Set",
            "weight": "1.6kg",
            "price": 1199,
            "mrp": 2699,
            "discount": 55,
            "stock": 25,
            "sku": "CUT-GLD-24PC",
            "barcode": "FX30036"
          }
        ]
      }
    ],
    "fieldVisibility": {
      "showDescription": true,
      "showSizes": true,
      "showWeights": true,
      "showDimensions": true,
      "showImages": true
    }
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1004",
    "title": "Soft Cotton Double Bedsheet with Pillow Covers",
    "slug": "cotton-double-bedsheet-pillow-covers",
    "description": "Luxurious 100% pure cotton double bedsheet with 300 thread count. Exceptionally soft, durable, skin-friendly, and fade-resistant. The pack includes 1 double-size bedsheet and 2 matching pillow covers.",
    "categoryId": "60c72b2f9b1d8e001c8e1a17",
    "rating": 4.2,
    "reviewCount": 78,
    "tags": ["home-decor", "textile", "soft-cotton"],
    "isActive": true,
    "totalStock": 150,
    "hsnCode": "6304",
    "gstRate": 5,
    "priceIncludesGst": true,
    "moq": 8,
    "seoTitle": "Wholesale Pure Cotton Double Bedsheet Sets | FlexSell",
    "seoDescription": "High quality 100% cotton double bedsheets with pillow covers. Direct distribution prices, 300 TC fabric.",
    "seoKeywords": "double bedsheet, cotton bedsheets, bedsheets wholesale, home linen",
    "colorVariants": [
      {
        "color": "Floral Blue",
        "dimensions": "274x274 cm",
        "images": [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"
        ],
        "subVariants": [
          {
            "id": "60c72b2f9b1d8e001c8e1004-blue-queen",
            "size": "Queen Size",
            "weight": "1.1kg",
            "price": 449,
            "mrp": 899,
            "discount": 50,
            "stock": 40,
            "sku": "BDS-BLU-QUN",
            "barcode": "FX40041"
          },
          {
            "id": "60c72b2f9b1d8e001c8e1004-blue-king",
            "size": "King Size",
            "weight": "1.3kg",
            "price": 549,
            "mrp": 1099,
            "discount": 50,
            "stock": 35,
            "sku": "BDS-BLU-KNG",
            "barcode": "FX40042"
          }
        ]
      },
      {
        "color": "Geometric Gray",
        "dimensions": "274x274 cm",
        "images": [
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80"
        ],
        "subVariants": [
          {
            "id": "60c72b2f9b1d8e001c8e1004-gray-queen",
            "size": "Queen Size",
            "weight": "1.1kg",
            "price": 449,
            "mrp": 899,
            "discount": 50,
            "stock": 45,
            "sku": "BDS-GRY-QUN",
            "barcode": "FX40043"
          },
          {
            "id": "60c72b2f9b1d8e001c8e1004-gray-king",
            "size": "King Size",
            "weight": "1.3kg",
            "price": 549,
            "mrp": 1099,
            "discount": 50,
            "stock": 30,
            "sku": "BDS-GRY-KNG",
            "barcode": "FX40044"
          }
        ]
      }
    ],
    "fieldVisibility": {
      "showDescription": true,
      "showSizes": true,
      "showWeights": true,
      "showDimensions": true,
      "showImages": true
    }
  },
  {
    "_id": "60c72b2f9b1d8e001c8e1005",
    "title": "Pro Handheld Fruit Juicer & Squeezer",
    "slug": "pro-handheld-fruit-juicer-squeezer",
    "description": "Ergonomic heavy-duty hand press juicer made of premium food-safe aluminum and zinc alloy. Ideal for lemons, oranges, limes, and grapefruits. Efficient juice extraction with minimal effort, easy to wash by hand.",
    "categoryId": "60c72b2f9b1d8e001c8e1a16",
    "rating": 4.6,
    "reviewCount": 110,
    "tags": ["bestseller", "kitchen-utensils", "manual-juicer"],
    "isActive": true,
    "totalStock": 250,
    "hsnCode": "7323",
    "gstRate": 12,
    "priceIncludesGst": true,
    "moq": 15,
    "seoTitle": "Manual Fruit Juicer Wholesale | B2B Kitchenware",
    "seoDescription": "Buy bulk handheld manual fruit juicers and citrus squeezers. Rust-proof alloy material, durable grip.",
    "seoKeywords": "hand juicer, fruit squeezer, manual press juicer, kitchen gadgets",
    "colorVariants": [
      {
        "color": "Premium Yellow",
        "dimensions": "22x10x8 cm",
        "images": [
          "https://images.unsplash.com/photo-1610970881699-44a5587caa9a?auto=format&fit=crop&w=600&q=80"
        ],
        "subVariants": [
          {
            "id": "60c72b2f9b1d8e001c8e1005-yel-std",
            "size": "Standard",
            "weight": "450g",
            "price": 299,
            "mrp": 599,
            "discount": 50,
            "stock": 70,
            "sku": "JUC-YEL-STD",
            "barcode": "FX50051"
          },
          {
            "id": "60c72b2f9b1d8e001c8e1005-yel-heavy",
            "size": "Heavy Duty",
            "weight": "600g",
            "price": 399,
            "mrp": 799,
            "discount": 50,
            "stock": 60,
            "sku": "JUC-YEL-HDY",
            "barcode": "FX50052"
          }
        ]
      },
      {
        "color": "Metallic Silver",
        "dimensions": "22x10x8 cm",
        "images": [
          "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&w=600&q=80"
        ],
        "subVariants": [
          {
            "id": "60c72b2f9b1d8e001c8e1005-slv-std",
            "size": "Standard",
            "weight": "450g",
            "price": 299,
            "mrp": 599,
            "discount": 50,
            "stock": 65,
            "sku": "JUC-SLV-STD",
            "barcode": "FX50053"
          },
          {
            "id": "60c72b2f9b1d8e001c8e1005-slv-heavy",
            "size": "Heavy Duty",
            "weight": "600g",
            "price": 399,
            "mrp": 799,
            "discount": 50,
            "stock": 55,
            "sku": "JUC-SLV-HDY",
            "barcode": "FX50054"
          }
        ]
      }
    ],
    "fieldVisibility": {
      "showDescription": true,
      "showSizes": true,
      "showWeights": true,
      "showDimensions": true,
      "showImages": true
    }
  }
];
