import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Category from "@/models/Category";
import Product from "@/models/Product";
import CmsContent from "@/models/CmsContent";

export async function POST() {
  try {
    await dbConnect();

    // 1. Seed Categories if empty
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const initialCategories = [
        {
          _id: "6699a0010000000000000001",
          name: "Home & Kitchen",
          slug: "home-kitchen",
          description: "Kitchen utility gadgets, slicers, containers, and household organizers.",
          image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
          isActive: true,
          order: 1
        },
        {
          _id: "6699a0010000000000000002",
          name: "Electronics & Gadgets",
          slug: "electronics-gadgets",
          description: "Smart accessories, rechargeable LED lights, mini fans, and USB tools.",
          image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
          isActive: true,
          order: 2
        },
        {
          _id: "6699a0010000000000000003",
          name: "Beauty & Personal Care",
          slug: "beauty-personal-care",
          description: "Skincare appliances, grooming trimmers, hair stylers, and facial tools.",
          image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80",
          isActive: true,
          order: 3
        },
        {
          _id: "6699a0010000000000000004",
          name: "Fashion & Accessories",
          slug: "fashion-accessories",
          description: "Travel bags, organizers, umbrellas, belts, and utility apparel.",
          image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
          isActive: true,
          order: 4
        },
        {
          _id: "6699a0010000000000000005",
          name: "Hardware & Utility",
          slug: "hardware-utility",
          description: "Home repair tools, adhesives, silicone sealants, and tape.",
          image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
          isActive: true,
          order: 5
        },
        {
          _id: "6699a0010000000000000006",
          name: "Toys & Baby Care",
          slug: "toys-baby-care",
          description: "Educational toys, writing tablets, night lamps, and child safety gear.",
          image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=600&q=80",
          isActive: true,
          order: 6
        }
      ];
      await Category.insertMany(initialCategories);
    }

    // 2. Seed Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const initialProducts = [
        {
          _id: "6699b0010000000000000001",
          name: "Pro Handheld Fruit Juicer Squeezer",
          slug: "pro-handheld-fruit-juicer-squeezer",
          sku: "KIT-JUC-001",
          hsnCode: "82100000",
          category: "6699a0010000000000000001",
          description: "Heavy-duty aluminum alloy manual citrus squeezer for oranges, lemons, and fruits. Ideal for commercial juice centers and household kitchens.",
          images: [
            "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80"
          ],
          pricing: {
            retailPrice: 599,
            wholesalePrice: 249,
            tierPricing: [
              { minQty: 10, price: 249 },
              { minQty: 50, price: 219 },
              { minQty: 100, price: 189 }
            ]
          },
          stock: 450,
          moq: 10,
          isActive: true,
          isFeatured: true
        },
        {
          _id: "6699b0010000000000000002",
          name: "USB Rechargeable Electric Garlic Masher",
          slug: "usb-rechargeable-electric-garlic-masher",
          sku: "ELE-GAR-002",
          hsnCode: "85094000",
          category: "6699a0010000000000000001",
          description: "250ml mini food processor with stainless steel 3-leaf blade. One-touch operation for chopping garlic, ginger, chili, and herbs.",
          images: [
            "https://images.unsplash.com/photo-1590794056226-77ef3a6c4743?auto=format&fit=crop&w=800&q=80"
          ],
          pricing: {
            retailPrice: 499,
            wholesalePrice: 199,
            tierPricing: [
              { minQty: 12, price: 199 },
              { minQty: 48, price: 169 },
              { minQty: 120, price: 139 }
            ]
          },
          stock: 600,
          moq: 12,
          isActive: true,
          isFeatured: true
        },
        {
          _id: "6699b0010000000000000003",
          name: "Wholesale Pure Cotton Double Bedsheet Sets",
          slug: "cotton-double-bedsheet-pillow-covers",
          sku: "FAS-BED-003",
          hsnCode: "63023100",
          category: "6699a0010000000000000004",
          description: "100% Cotton 210 TC floral pattern double bedsheets with 2 matching pillow covers. Color-fast reactive printing.",
          images: [
            "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=800&q=80"
          ],
          pricing: {
            retailPrice: 899,
            wholesalePrice: 380,
            tierPricing: [
              { minQty: 10, price: 380 },
              { minQty: 30, price: 340 },
              { minQty: 100, price: 299 }
            ]
          },
          stock: 300,
          moq: 10,
          isActive: true,
          isFeatured: true
        }
      ];
      await Product.insertMany(initialProducts);
    }

    // 3. Seed CMS Content collections
    const cmsSeeds = [
      {
        key: "hero_banners",
        value: [
          {
            imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80",
            mobileImageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
            redirectUrl: "/products",
            altText: "Direct Factory Container Sourcing"
          },
          {
            imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1920&q=80",
            mobileImageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80",
            redirectUrl: "/dropshipping",
            altText: "Automated White-Label Dropship Program"
          }
        ]
      },
      {
        key: "announcements",
        value: [
          "🎉 Mega B2B Monsoon Sale! Flat 12% OFF on Bulk orders above ₹20,000. Use Code: MEGAMONSOON",
          "⚡ Express Freight Dispatch: All Surat Warehouse orders dispatched within 24 Hours!"
        ]
      },
      {
        key: "trust_stats",
        value: [
          { icon: "package", count: "5,000+", label: "Products Listed" },
          { icon: "truck", count: "10,000+", label: "Orders Shipped" },
          { icon: "map-pin", count: "500+", label: "Cities Covered" },
          { icon: "users", count: "2,000+", label: "Active Buyers" }
        ]
      },
      {
        key: "wholesale_business_details",
        value: {
          heading: "Factory Direct B2B Wholesale Sourcing",
          subheading: "Direct importer container cargo prices for Indian shop owners, resellers, and commercial bulk buyers.",
          ctaText: "Explore Wholesale Catalog & Get Quotes",
          ctaLink: "/products",
          cards: [
            { icon: "price", title: "Direct Factory Prices", desc: "No middle-man wholesalers. Container-loads imported directly from global manufacturers to give you up to 40% higher retail margins.", badge: "Lowest Price Guaranteed" },
            { icon: "quality", title: "Rigorous Quality Line", desc: "Dedicated sorting and packaging line checking electricals, plastic grades, and silicon seals before dispatch.", badge: "Tested & Approved" },
            { icon: "shipping", title: "Express Freight Cargo", desc: "Partnership with Delhivery, Gati, and V-Trans for safe, fast ground heavy shipment delivery.", badge: "Surat Logistics Hub" },
            { icon: "invoice", title: "Instant GST ITC Invoicing", desc: "Automated GST invoices generated during checkout to claim your full Input Tax Credit.", badge: "100% Tax Compliant" }
          ]
        }
      },
      {
        key: "dropshipping_business_details",
        value: {
          heading: "Automated Dropshipping Partner Program",
          subheading: "Sell retail online without stocking inventory. We store, quality check, and white-label dispatch directly to your end buyers.",
          ctaText: "Apply for Dropshipper Access & API",
          ctaLink: "/dropshipping",
          cards: [
            { icon: "package", title: "Zero Inventory Investment", desc: "No upfront capital needed. We manage warehousing and stock holding for over 5,000+ utility SKUs.", badge: "Risk-Free Business" },
            { icon: "trending-up", title: "30-50% Profit Margins", desc: "Access specialized dropshipping tier pricing to keep high retail markups on every Shopify/WooCommerce order.", badge: "High Retail Profits" },
            { icon: "zap", title: "24-48 hr White-Label Dispatch", desc: "Boxes shipped directly to your customer with your store brand label. No FlexSell branding inside.", badge: "White-Label Box" },
            { icon: "shield", title: "Automated Wallet & API Sync", desc: "Auto-sync products, top-up account wallet balance, and retrieve courier tracking IDs in bulk.", badge: "Instant Tracking Sync" }
          ]
        }
      },
      {
        key: "dropshipping_page_content",
        value: {
          badge: "Independent Dropshipping Channel",
          heroHeading: "Automated Dropshipping Program With Zero Inventory Risk",
          heroSubheading: "Sell thousands of trending consumer gadgets directly to your retail buyers. We store, quality check, and white-label dispatch directly from our Surat hub.",
          ctaText: "Apply as Dropshipper Partner",
          formBadge: "Partner Onboarding",
          formHeading: "Apply for Dropshipper Access",
          formSubheading: "Fill in your business details below to request white-label dropship pricing privileges & API keys.",
          orderVolumeOptions: [
            "1 - 10 orders/day",
            "10 - 50 orders/day",
            "50 - 200 orders/day",
            "200+ orders/day"
          ]
        }
      },
      {
        key: "dropshipping_promo",
        value: {
          heading: "Start Your B2B Dropshipping Business",
          subheading: "Zero inventory risk. Ship directly to your retail buyers straight from our 40,000 sq ft Surat logistics hub.",
          ctaText: "Explore Dropshipping Program & Register",
          ctaLink: "/dropshipping",
          features: [
            { icon: "package", title: "Zero Inventory Risk", desc: "No upfront stock investment. We manage warehousing and quality checks." },
            { icon: "trending-up", title: "30-50% Profit Margins", desc: "Access direct manufacturer pricing for maximum retail markup profits." },
            { icon: "zap", title: "24-48 hr Dispatch", desc: "White-label dispatch with your brand label directly to your buyer's door." }
          ]
        }
      },
      {
        key: "testimonials_wholesale",
        value: [
          {
            name: "Rajesh Sharma",
            business: "Sharma Traders",
            location: "Indore, MP",
            rating: 5,
            text: "FlexSell changed my kitchen gadget retail business. Direct Surat warehouse cargo pricing gave me a 35% margin boost!",
            contentType: "text",
            isActive: true
          },
          {
            name: "Suresh Gupta",
            business: "Gupta Utilities",
            location: "Delhi NCR",
            rating: 5,
            text: "Instant GST invoices with tax credit. Ordering bulk inventory directly from Surat saved us thousands every month.",
            contentType: "text",
            isActive: true
          }
        ]
      },
      {
        key: "testimonials_dropshipper",
        value: [
          {
            name: "Ananya Patel",
            business: "SmartDrop Online Store",
            location: "Ahmedabad, Gujarat",
            rating: 5,
            text: "The dropshipping fulfillment speed is unmatched. My Shopify orders get dispatched within 24 hours with custom packaging.",
            contentType: "text",
            isActive: true
          }
        ]
      },
      {
        key: "testimonials_client",
        value: [
          {
            name: "Vikram Malhotra",
            business: "Malhotra Gifts",
            location: "Jaipur, Rajasthan",
            rating: 5,
            text: "Zero damaged goods in transit. Their packaging line quality screening makes buying container cargo safe and easy.",
            contentType: "text",
            isActive: true
          }
        ]
      },
      {
        key: "brand_partners",
        value: [
          { name: "Delhivery Logistics", logoUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=200&q=80" },
          { name: "V-Trans Heavy Freight", logoUrl: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=200&q=80" }
        ]
      },
      {
        key: "faqs",
        value: [
          {
            question: "What is the Minimum Order Value (MOV) or MOQ?",
            answer: "To ensure wholesale rates, our minimum order value is ₹3,000 across cart items. Individual product MOQs range from 5 units to 20 units depending on size.",
            category: "General Sourcing"
          },
          {
            question: "Can I receive a GST Input Tax Credit (ITC) invoice?",
            answer: "Yes, absolutely! Provide your verified GSTIN during checkout, and a valid B2B tax invoice (CGST/SGST or IGST) will be generated automatically.",
            category: "GST & Tax"
          },
          {
            question: "How are heavy freight shipping costs calculated?",
            answer: "Cargo freight costs are calculated based on volumetric size or actual weight. Standard ground transport or express freight rates are computed instantly during checkout.",
            category: "Shipping & Logistics"
          },
          {
            question: "What happens if a wholesale shipment arrives damaged?",
            answer: "We provide full replacements for items damaged in transit. You must upload an unboxing video to our support dashboard within 48 hours of cargo receipt.",
            category: "Claims & Returns"
          },
          {
            question: "How does the Dropshipping Program work?",
            answer: "Registered dropshippers list our products on their online store. When a customer orders, submit the order to FlexSell, and we ship white-label directly to your customer.",
            category: "Dropshipping"
          }
        ]
      },
      {
        key: "policies",
        value: {
          privacy: {
            title: "Corporate Privacy Policy",
            lastUpdated: "June 12, 2024",
            sections: [
              {
                heading: "1. Scope of Data Gathering",
                text: "We gather business credentials, shipping addresses, GST certificates, and contact details to verify authenticity and streamline wholesale invoicing."
              },
              {
                heading: "2. Data Protection Standards",
                text: "All sensitive payment credentials are encrypted using industry-standard AES-256 protocols. Your trade secrets and supplier details remain confidential."
              }
            ]
          },
          terms: {
            title: "B2B Terms of Service",
            lastUpdated: "June 12, 2024",
            sections: [
              {
                heading: "1. Retail Reselling Authorizations",
                text: "Buyers warrant that they are registered businesses purchasing goods for commercial resale or manufacturing purposes, not personal consumption."
              },
              {
                heading: "2. Account Suspension Thresholds",
                text: "We reserve the right to cancel accounts and restrict wholesale pricing for buyers providing fraudulent business IDs or repeatedly returning bulk orders."
              }
            ]
          },
          shipping: {
            title: "Freight & Shipping Policies",
            lastUpdated: "June 12, 2024",
            sections: [
              {
                heading: "1. Dispatch Timelines",
                text: "Bulk wholesale orders are packed and dispatched from our Surat warehouse within 24-48 working hours. Heavy cargo shipping times range from 3-7 days."
              },
              {
                heading: "2. Remote Region Cargo Surcharges",
                text: "Special transport charges may apply for heavy freight going to Northeast states, J&K, and deep rural regions. Surcharges will be quoted by phone if needed."
              }
            ]
          },
          return: {
            title: "Bulk Return & Refund Policies",
            lastUpdated: "June 12, 2024",
            sections: [
              {
                heading: "1. Zero Unsold Returns",
                text: "Because we run at minimal margins, we do not accept returns for unsold goods or change-of-mind situations. All wholesale sales are final."
              },
              {
                heading: "2. Transit Defect Claims",
                text: "A continuous, uncut video showing the opening of the cargo box is mandatory to process shipping transit damage claims. Approved claims receive wallet top-up credits."
              }
            ]
          }
        }
      },
      {
        key: "footer",
        value: {
          description: "FlexSell Wholesale is India's leading B2B sourcing and white-label dropshipping platform. We import directly from manufacturers to deliver factory prices to retailers, shop owners, and e-commerce sellers.",
          officeAddress: "Plot 42, B2B Industrial Cargo Hub, Ring Road, Surat, Gujarat 395002",
          contactEmail: "support@flexsell.in",
          contactPhone: "+91 98765 43210",
          socialLinks: {
            facebook: "https://facebook.com/flexsell",
            instagram: "https://instagram.com/flexsell",
            linkedin: "https://linkedin.com/company/flexsell",
            youtube: "https://youtube.com/c/flexsell"
          }
        }
      }
    ];

    for (const seed of cmsSeeds) {
      await CmsContent.findOneAndUpdate(
        { key: seed.key },
        { key: seed.key, value: seed.value },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Database successfully seeded with categories, products, FAQs, policies, and CMS settings!",
      categoriesCount: await Category.countDocuments(),
      productsCount: await Product.countDocuments(),
      cmsCount: await CmsContent.countDocuments()
    });
  } catch (error: unknown) {
    console.error("Seed API Error:", error);
    return NextResponse.json(
      { success: false, message: (error as any).message || "Database seed failed" },
      { status: 500 }
    );
  }
}
