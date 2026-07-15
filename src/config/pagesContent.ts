export interface FooterLink {
  label: string;
  href: string;
}

export interface WhyChooseUsItem {
  title: string;
  desc: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface PolicySection {
  heading: string;
  text: string;
}

export const pagesContent = {
  "announcement": {
    "text": "🎉 Mega B2B Monsoon Sale! Flat 12% OFF on Bulk orders above ₹20,000. Use Code: MEGAMONSOON"
  },
  "footer": {
    "description": "FlexSell is India's leading wholesale B2B distributor. Directly importing trending kitchen gadgets, household tools, utility items, and home appliances to provide you the lowest manufacturing prices.",
    "officeAddress": "Block D-104, B2B Textile Market, Near Ring Road, Surat, Gujarat - 395002",
    "contactEmail": "support@flexsellwholesale.in",
    "contactPhone": "+91 88877 66655",
    "timings": "9:30 AM to 6:30 PM (Sunday Closed)",
    "quickLinks": [
      {
        "label": "About Us",
        "href": "/about"
      },
      {
        "label": "Contact Us",
        "href": "/contact"
      },
      {
        "label": "All Products",
        "href": "/products"
      },
      {
        "label": "B2B Categories",
        "href": "/categories"
      },
      {
        "label": "Official Blog",
        "href": "/blogs"
      }
    ],
    "customerCare": [
      {
        "label": "Track Your Cargo",
        "href": "/order-tracking"
      },
      {
        "label": "B2B Help Center",
        "href": "/client/support"
      },
      {
        "label": "Frequently Asked Questions",
        "href": "/faq"
      },
      {
        "label": "Shipping Policies",
        "href": "/policies/shipping"
      },
      {
        "label": "Bulk Returns",
        "href": "/policies/return"
      }
    ]
  },
  "about": {
    "title": "About FlexSell Wholesale B2B",
    "subtitle": "Connecting global manufacturers directly to Indian local retailers & dropshippers.",
    "warehouseImage": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    "missionTitle": "Our B2B Sourcing Mission",
    "missionText": "We cut down traditional multi-layer distributor margins in India. By establishing direct logistics with manufacturers, we supply high-utility, trending items straight to small shop owners, e-commerce stores, and Resellers, improving retail profit margins by up to 40%.",
    "whyChooseUsTitle": "Why B2B Partners Prefer FlexSell?",
    "whyChooseUsItems": [
      {
        "title": "Direct Factory Prices",
        "desc": "No middle-man wholesalers. We buy container-loads directly from manufacturers globally and distribute."
      },
      {
        "title": "Rigorous Quality Screening",
        "desc": "We operate a dedicated sorting and packaging line to check electricals, plastic grades, and silicon seals."
      },
      {
        "title": "Express Cargo Shipping",
        "desc": "Partnership with safe transport networks like Delhivery, Gati, and V-Trans to carry heavy B2B shipments."
      }
    ],
    "storyTitle": "The Surat Startup Journey",
    "storyText": "Founded in 2023 at the heart of Surat’s logistics hub, FlexSell revolutionized utility items distribution. Today, we handle over 5,000 orders daily, housing a 40,000 sq ft centralized warehouse fully stocked with ready-to-dispatch consumer goods."
  },
  "contact": {
    "title": "Contact FlexSell B2B Support",
    "subtitle": "Got bulk inquiries, custom shipping concerns, or looking to schedule a warehouse visit? Reach out directly.",
    "addressTitle": "Central Warehouse",
    "addressText": "D-104, B2B Logistic Zone, Kadodara Road, Surat, Gujarat - 394327",
    "phoneTitle": "B2B Support Line",
    "phoneText": "+91 88877 66655",
    "phoneTiming": "Mon-Sat, 9:30 AM to 6:30 PM",
    "emailTitle": "Official Corporate Email",
    "emailText": "support@flexsellwholesale.in",
    "emailTiming": "Estimated response time: 4-6 business hours",
    "formHeading": "Submit a Sourcing Inquiry",
    "subjectOptions": [
      "Bulk Sourcing Quote",
      "Dropshipping Partnership",
      "Franchise Application",
      "Damaged Cargo Claim",
      "Logistics/Customs Delay"
    ]
  },
  "dropshipping": {
    "title": "B2B Dropshipping & Franchise Network",
    "subtitle": "Launch your internet retail store or physical outlet with our verified ready inventory.",
    "badge": "FlexSell Partner Ecosystem",
    "dropshipTitle": "Automated Dropshipping Program",
    "dropshipBullets": [
      "Access full dynamic sync of our 5,000+ SKU inventory directly with your Shopify store.",
      "Custom branded white-label shipping boxes. Your customers will never know we did the fulfillment.",
      "Dedicated B2B dashboard to top-up wallet balance, auto-place orders, and track tracking IDs in bulk."
    ],
    "franchiseTitle": "FlexSell Offline Franchise",
    "franchiseBullets": [
      "Open a standard retail outlet selling trending products in your local tier-2 or tier-3 city.",
      "Receive complete store layouts, retail POS softwares, and localized digital advertisements.",
      "Get bottom-tier wholesale pricing guaranteed with buy-back options on initial stocks."
    ],
    "ctaDropship": "Register as Dropshipper",
    "ctaFranchise": "Get Franchise Proposal PDF"
  },
  "faq": {
    "title": "B2B Sourcing Help & FAQ",
    "subtitle": "Clear answers regarding MOQs, GST invoices, and logistics operations.",
    "items": [
      {
        "question": "What is the Minimum Order Value (MOV) or MOQ?",
        "answer": "To ensure wholesale rates, our minimum order value is ₹3,000. Individual product MOQs range from 5 units to 20 units depending on size."
      },
      {
        "question": "Can I receive a GST Input Tax Credit (ITC) invoice?",
        "answer": "Yes, absolutely. Provide your verified GSTIN during checkout, and a valid B2B tax invoice will be generated and sent automatically."
      },
      {
        "question": "How are heavy freight shipping costs calculated?",
        "answer": "We calculate cargo costs based on volumetric size or actual weight. Standard ground transport or express freight rates are computed instantly during checkout."
      },
      {
        "question": "What happens if a wholesale shipment arrives broken?",
        "answer": "We provide full replacements for items damaged in transit. You must upload an unboxing video to the support dashboard within 48 hours of receipt."
      }
    ]
  },
  "policies": {
    "privacy": {
      "title": "Corporate Privacy Policy",
      "lastUpdated": "June 12, 2024",
      "sections": [
        {
          "heading": "1. Scope of Data Gathering",
          "text": "We gather business credentials, shipping addresses, GST certificates, and contact details to verify authenticity and streamline wholesale invoicing."
        },
        {
          "heading": "2. Data Protection Standards",
          "text": "All sensitive payment and credentials are encrypted using industry-standard AES-256 protocols. Your trade secrets and supplier details remain confidential."
        }
      ]
    },
    "terms": {
      "title": "B2B Terms of Service",
      "lastUpdated": "June 12, 2024",
      "sections": [
        {
          "heading": "1. Retail Reselling Authorizations",
          "text": "Buyers warrant that they are registered businesses purchasing goods for commercial resale or manufacturing purposes, not personal consumption."
        },
        {
          "heading": "2. Account Suspension Thresholds",
          "text": "We reserve the right to cancel accounts and restrict wholesale pricing for buyers providing fraudulent business IDs or repeatedly returning bulk orders."
        }
      ]
    },
    "shipping": {
      "title": "Freight & Shipping Policies",
      "lastUpdated": "June 12, 2024",
      "sections": [
        {
          "heading": "1. Dispatch Timelines",
          "text": "Bulk wholesale orders are packed and dispatched from our Surat warehouse within 24-48 working hours. Heavy cargo shipping times range from 3-7 days."
        },
        {
          "heading": "2. Remote Region Cargo Surcharges",
          "text": "Special transport charges may apply for heavy freight going to Northeast states, J&K, and deep rural regions. Surcharges will be quoted by phone if needed."
        }
      ]
    },
    "return": {
      "title": "Bulk Return & Refund policies",
      "lastUpdated": "June 12, 2024",
      "sections": [
        {
          "heading": "1. Zero Unsold Returns",
          "text": "Because we run at minimal margins, we do not accept returns for unsold goods or change-of-mind situations. All wholesale sales are final."
        },
        {
          "heading": "2. Transit Defect Claims",
          "text": "A continuous, uncut video showing the opening of the cargo box is mandatory to process shipping transit damage claims. Approved claims receive wallet top-up credits."
        }
      ]
    }
  },
  "homepage": {
    "heroTitlePrefix": "Wholesale Sourcing Made",
    "heroTitleHighlight": "Simple",
    "heroSubtitle": "Direct from manufacturers. Unbeatable B2B prices. Fast shipping.",
    "heroButtonText": "Explore Catalog",
    "categoriesHeading": "Shop by Category",
    "trendingHeading": "Trending Products",
    "viewAllText": "View All"
  }
};
