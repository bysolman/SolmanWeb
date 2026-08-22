import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const DATA_FILE = path.join(process.cwd(), "data-store.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use("/uploads", express.static(UPLOADS_DIR));

// Default initial data
const initialData = {
  adminAuth: {
    email: "solmanchoudhury66@gmail.com",
    password: "SolmanSecurePassword2026!",
    resetOtp: null,
    resetOtpExpiry: null
  },
  profile: {
    name: "Solman Hussain Choudhury",
    title: "Entrepreneur, Global Exporter, Certified Consultant & Avid Traveler",
    tagline: "Championing Northeast India's heritage, travel expeditions & agro-commodities globally while empowering businesses through tax, vehicle insurance, and digital advisory.",
    location: "Vill Mohanpur Pt II, PO Katirail, PS Katigorah, District Cachar, Assam 788804",
    address: "Vill Mohanpur Pt II, PO Katirail, PS Katigorah, District Cachar, Assam, PIN 788804",
    fullAddress: "Vill Mohanpur Pt II, PO Katirail, PS Katigorah, District Cachar, Assam, PIN 788804",
    village: "Mohanpur Pt II",
    postOffice: "Katirail",
    policeStation: "Katigorah",
    district: "Cachar",
    state: "Assam",
    pinCode: "788804",
    education: "BA in History from Assam University (Nabin Chandra College)",
    email: "contact@solmanchoudhury.in",
    consultancyEmail: "contact@solmanchoudhury.in",
    exportEmail: "admin@chaikosh.in",
    exportSecondaryEmail: "chaikoshagrielectroindustries@gmail.com",
    personalPhone: "+91 6001565255",
    businessPhone: "+91 6003348068",
    facebook: "https://www.facebook.com/share/19NBsL65vz/",
    facebookName: "Solman Hussain Choudhury",
    linkedin: "https://www.linkedin.com/in/solman-hussain-choudhury-33749120b?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    twitterPersonal: "https://x.com/solysiux",
    twitterBusiness: "https://x.com/ChaikoshHQ",
    instagram: "https://instagram.com/solysiux",
    instagramHandle: "@solysiux",
    instagramBrand: "https://instagram.com/bysolman",
    company: "M/S. CHAIKOSH AGRIELECTRO INDUSTRIES",
    companyRole: "Managing Partner (Merchant Exporter)",
    avatarUrl: "/images/solman_choudhury.jpg",
    bio: `Solman Hussain Choudhury is an agile entrepreneur, certified business consultant, merchant exporter, and passionate traveler based out of Vill Mohanpur Pt II, PO Katirail, PS Katigorah, District Cachar, Assam. Grounded in a strong academic foundation with a Bachelor of Arts in History from Assam University (Nabin Chandra College), he draws upon the historic commercial trade routes, nature, and geographical richness of Northeast India to craft enduring ventures.

As an avid traveler and explorer, Solman regularly traverses the hills, riverine valleys, and cultural crossroads of Assam and Northeast India, documenting heritage traditions, scenic landscapes, and rural trade connections.

As Managing Partner at M/S. CHAIKOSH AGRIELECTRO INDUSTRIES, he oversees international trade initiatives bridging Northeast India's finest agricultural products and electronic/industrial commodities with global markets.

Beyond trade, Solman provides comprehensive consultancy in Income Tax filing, GST compliance, company registrations, loan advisory, complete Vehicle Insurance solutions (for both new and old/pre-owned 2-wheelers, 4-wheelers & commercial vehicles), life/health insurance, and digital web development.`
  },
  services: [
    {
      id: "global-trade",
      title: "Global Trade & Export",
      organization: "M/S. CHAIKOSH AGRIELECTRO INDUSTRIES",
      role: "Managing Partner (Merchant Exporter)",
      badge: "International Trade",
      shortDesc: "Merchant exporter specializing in agro-commodities, tea, spices, and electronic/industrial components bridging Northeast India to global markets.",
      fullDesc: "Through M/S. CHAIKOSH AGRIELECTRO INDUSTRIES, we facilitate seamless cross-border commerce, strict quality assurance, international supply chain management, export documentation (IEC, APEDA, FSSAI, RCMC), and strategic commodity sourcing from Northeast India's finest producers.",
      features: [
        "Merchant Export of Organic Tea & Agri-Commodities",
        "Electronic & Industrial Sourcing & Logistics",
        "Customs Clearance, Documentation & Regulatory Compliance",
        "B2B International Contract Negotiation"
      ],
      icon: "Ship"
    },
    {
      id: "tax-consultancy",
      title: "Tax & Business Consultancy",
      organization: "Professional Consultancy Practice",
      role: "Lead Consultant & Advisor",
      badge: "Finance & Compliance",
      shortDesc: "Comprehensive taxation, statutory compliance, business entity formation, and debt/loan advisory for MSMEs, startups, and individuals.",
      fullDesc: "End-to-end guidance for all corporate and personal regulatory requirements. We simplify complicated tax codes, optimize tax efficiency, and ensure complete legal standing for all forms of business entities.",
      features: [
        "Income Tax Return (ITR) Filing & Tax Planning",
        "GST Registration, Monthly/Quarterly Filings & Audits",
        "Professional Tax Assessment & Compliance",
        "Company, LLP, Partnership, Trust & NGO Registration",
        "MSME / Udyam Registration & Trade Licenses",
        "Project Reports, CMA Data & Bank Loan Advisory"
      ],
      icon: "FileCheck"
    },
    {
      id: "digital-solutions",
      title: "Digital Solutions & Web Development",
      organization: "Digital Ventures",
      role: "Digital Strategy Lead",
      badge: "Technology",
      shortDesc: "Helping modern entrepreneurs, brands, and businesses craft high-impact websites, digital branding, and online growth engines.",
      fullDesc: "In today's connected economy, credibility begins with a stellar digital presence. We partner with clients to conceptualize, design, develop, and launch high-performance business websites, landing pages, and search-optimized portals.",
      features: [
        "Custom Business & Portfolio Websites",
        "Mobile-First, Responsive & Modern UI/UX",
        "Domain, Hosting & Corporate Email Setup",
        "Search Engine Optimization (SEO) & Google Business Profile Setup"
      ],
      icon: "Code"
    },
    {
      id: "insurance-planning",
      title: "Certified Insurance Planning",
      organization: "Authorized Insurance Agency",
      role: "Certified Insurance Advisor",
      badge: "Financial Security",
      shortDesc: "Tailored life, health, vehicle, and commercial asset protection plans designed to safeguard personal wealth and enterprise continuity.",
      fullDesc: "Navigating policy options can be daunting. As a certified insurance advisor, I analyze individual risk profiles and family/business obligations to recommend the most protective and cost-efficient insurance packages.",
      features: [
        "Comprehensive Life & Term Insurance Planning",
        "Family Floater & Critical Illness Health Policies",
        "Commercial Property, Transit & Marine Insurance",
        "Fast-Track Claim Assistance & Annual Policy Audits"
      ],
      icon: "ShieldCheck"
    }
  ],
  gallery: [
    {
      id: "gal-1",
      title: "Majestic Tea Gardens of Assam",
      category: "Nature & Travels",
      mediaType: "image",
      url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      caption: "Exploring the verdant green tea estates of Upper Assam — the backbone of Northeast India's heritage export economy.",
      date: "2026-04-12"
    },
    {
      id: "gal-2",
      title: "M/S. CHAIKOSH AGRIELECTRO INDUSTRIES Trade & Logistics Review",
      category: "Global Trade & Agrielectro",
      mediaType: "image",
      url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
      caption: "Inspecting export cargo and logistics packaging protocols at regional distribution hub.",
      date: "2026-03-20"
    },
    {
      id: "gal-3",
      title: "Barak Valley Riverine Geography",
      category: "Northeast Expeditions",
      mediaType: "image",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      caption: "Field study along the Barak River basin near Badarpur, exploring local biodiversity and historic transit routes.",
      date: "2026-02-15"
    },
    {
      id: "gal-4",
      title: "Client Business Strategy & Tax Advisory",
      category: "Consultancy & Engagements",
      mediaType: "image",
      url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
      caption: "Reviewing financial statements and preparing project reports for a local manufacturing startup's loan expansion.",
      date: "2026-01-28"
    },
    {
      id: "gal-5",
      title: "Historical Architecture of Assam & Nabin Chandra College",
      category: "Northeast Expeditions",
      mediaType: "image",
      url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80",
      caption: "Reflecting on historical legacies, institutional memory, and regional architecture in Southern Assam.",
      date: "2025-11-19"
    },
    {
      id: "gal-6",
      title: "Documentary Walk: Northeast Landscapes & Biodiversity",
      category: "Nature & Travels",
      mediaType: "video",
      url: "https://assets.mixkit.co/videos/preview/mixkit-river-surrounded-by-forest-under-the-sunlight-41846-large.mp4",
      caption: "Cinematic footage of lush riverbanks and forested hills in the pristine Northeast terrain.",
      date: "2025-10-05"
    }
  ],
  articles: [
    {
      id: "art-1",
      title: "Unlocking Northeast India's Agri-Export Potential: A Merchant's Perspective",
      slug: "northeast-india-agri-export-potential",
      category: "Global Trade",
      tags: ["Export", "Agro-Economy", "Northeast India", "Chaikosh"],
      coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      excerpt: "How strategic sourcing, cold chain logistics, and organic certifications can propel Assam's specialty produce to international markets.",
      readTime: "5 min read",
      publishedDate: "2026-07-15",
      isPublished: true,
      content: `Northeast India is endowed with remarkable biodiversity, rich fertile soil, and ideal agro-climatic conditions. From the legendary Orthodox Assam teas and GI-tagged ginger to aromatic spices and organic turmeric, the region possesses distinct agricultural goldmines.

### The Role of M/S. CHAIKOSH AGRIELECTRO INDUSTRIES
As Managing Partner at M/S. CHAIKOSH AGRIELECTRO INDUSTRIES, our mission has been centered on bridging the gap between local growers and high-demand global supply chains. Merchant exporting requires more than just buying and selling:
1. **Quality Assurance at the Farmgate**: Enforcing stringent sorting, moisture control, and chemical-free processing.
2. **Export Compliance**: Navigating APEDA, FSSAI, Spices Board, and IEC regulations to ensure zero-friction customs clearance.
3. **Logistics Optimization**: Utilizing multimodal connectivity through regional ports and air cargo links to preserve freshness.

By investing in transparent supply chains and modern packaging, Northeast enterprises can command premium values in Middle Eastern, European, and Southeast Asian markets.`
    },
    {
      id: "art-2",
      title: "A Complete Guide to GST & Income Tax Compliance for New Businesses in Assam",
      slug: "gst-income-tax-compliance-assam-startups",
      category: "Tax & Business",
      tags: ["Taxation", "GST", "ITR", "MSME Compliance"],
      coverImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
      excerpt: "Key statutory requirements every budding entrepreneur in Assam must fulfill to avoid penalties and establish bankable credibility.",
      readTime: "6 min read",
      publishedDate: "2026-06-02",
      isPublished: true,
      content: `Starting a new business is an exhilarating journey, but overlooking compliance early on can stall your growth when seeking loans or securing institutional clients.

### 1. Choosing the Right Business Structure
Whether you operate as a Sole Proprietorship, Partnership Firm, Limited Liability Partnership (LLP), or Private Limited Company, each structure dictates your tax liability and regulatory burden:
- **Private Limited / LLP**: Ideal for scaling, equity funding, and limited liability protection.
- **Trusts & NGOs**: Requires 12A and 80G registration for tax exemption on charitable activities.

### 2. GST Registration & Periodic Filings
In Assam, the threshold limit for GST registration on goods is generally ₹40 Lakhs (and ₹20 Lakhs for services/special category considerations). Timely filing of GSTR-1, GSTR-3B, and annual returns prevents hefty late fees and preserves your Input Tax Credit (ITC) flow.

### 3. Income Tax & Advance Tax
Maintain structured books of accounts from day one. Filing your ITR-3, ITR-5, or ITR-6 with precise financial statements creates the verified paper trail required by banks for PMMY, PMEGP, or commercial credit facilities.`
    },
    {
      id: "art-3",
      title: "History, Geography, and Trade Corridors of the Barak Valley",
      slug: "history-geography-trade-barak-valley",
      category: "Heritage & Geography",
      tags: ["History", "Barak Valley", "Geography", "Assam University"],
      coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      excerpt: "Reflecting on the historical river routes, geopolitical significance, and economic evolution of Southern Assam from ancient times to modernity.",
      readTime: "7 min read",
      publishedDate: "2026-04-18",
      isPublished: true,
      content: `My academic journey studying History at Assam University (Nabin Chandra College) instilled in me a profound appreciation for how geography shapes civilizations, trade routes, and human enterprise.

### The Historic Barak River System
The Barak Valley, comprising Cachar, Karimganj, and Hailakandi districts, has historically served as a critical nexus connecting Bengal, the Surma Valley, Manipur, and the hill tracts of Mizoram and Tripura. Badarpur itself has long been a strategic junction:
- **Riverine Commerce**: Flotillas navigated the Barak-Surma waterway to transport timber, bamboo, tea, and handloom textiles.
- **Railway Heritage**: The construction of the meter-gauge hill railway through the Barail range stands as an engineering marvel of the late 19th century.

Understanding this rich regional history reminds us that today's commercial connectivity is built upon centuries of cultural interchange and resilient trade networks.`
    },
    {
      id: "art-4",
      title: "Why Modern MSMEs Must Build a High-Converting Digital Presence",
      slug: "why-msmes-must-build-digital-presence",
      category: "Digital Solutions",
      tags: ["Digital", "Web Development", "Branding", "Growth"],
      coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      excerpt: "Why a professional website is no longer optional for traditional businesses, and how a modern web footprint drives client trust and inquiries.",
      readTime: "4 min read",
      publishedDate: "2026-02-10",
      isPublished: true,
      content: `Many established local businesses in tier-2 and tier-3 cities rely solely on word-of-mouth. While personal relationships remain vital, the first action an institutional buyer, supplier, or corporate client takes today is searching for your business online.

### The 4 Pillars of a High-Impact Business Website:
1. **Immediate Credibility**: A custom domain and sleek responsive design immediately elevate your brand above unverified competitors.
2. **24/7 Digital Showcase**: Display your services, export certifications, completed projects, and customer testimonials around the clock.
3. **Direct Lead Capture**: Integrated contact forms and instant WhatsApp launchers reduce client friction to a single click.
4. **Local & Global Discoverability**: Structured SEO ensures you rank when potential clients search for your specialized services.`
    }
  ],
  inquiries: [
    {
      id: "inq-1",
      name: "Debashis Roy",
      email: "debashis.roy@example.com",
      phone: "+91 9876543210",
      service: "Tax & Business Consultancy",
      message: "Looking for assistance with Private Limited company registration and GST setup for our new agro-processing venture in Karimganj.",
      date: "2026-08-18T10:30:00Z",
      status: "new"
    },
    {
      id: "inq-2",
      name: "Tariqul Islam",
      email: "tariq.trade@example.com",
      phone: "+91 9435012345",
      service: "Global Trade & Export",
      message: "Interested in sourcing premium Orthodox Assam tea lots for bulk shipment. Please share product catalog and terms.",
      date: "2026-08-15T14:15:00Z",
      status: "replied"
    }
  ]
};

// Helper to get database
function getData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(fileData);
    }
  } catch (err) {
    console.error("Error reading data file:", err);
  }
  // Initialize with default
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  return initialData;
}

function saveData(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error("Error saving data file:", err);
    return false;
  }
}

// API Routes
app.get("/api/data", (req, res) => {
  const data = getData();
  // Strip out sensitive admin authentication credentials from public data endpoint
  const { adminAuth, ...publicData } = data;
  res.json(publicData);
});

// Dedicated Image Upload API Endpoint
app.post("/api/upload", (req, res) => {
  try {
    const { imageBase64, filename, folder, updateProfileAvatar } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: "No image data provided" });
    }

    // Direct URL check
    if (typeof imageBase64 === "string" && (imageBase64.startsWith("http://") || imageBase64.startsWith("https://") || (imageBase64.startsWith("/") && !imageBase64.startsWith("/uploads")))) {
      if (updateProfileAvatar || folder === "avatar") {
        const data = getData();
        data.profile.avatarUrl = imageBase64;
        saveData(data);
      }
      return res.json({ success: true, url: imageBase64 });
    }

    // Extract mime type and base64 data
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ success: false, error: "Invalid image encoding payload" });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    let ext = "jpg";
    if (mimeType.includes("png")) ext = "png";
    else if (mimeType.includes("webp")) ext = "webp";
    else if (mimeType.includes("gif")) ext = "gif";
    else if (mimeType.includes("svg")) ext = "svg";

    const cleanBaseName = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, "_") : `upload_${Date.now()}`;
    const safeFilename = `${cleanBaseName}.${ext}`;
    const targetFolder = folder ? path.join(UPLOADS_DIR, folder) : UPLOADS_DIR;
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const filePath = path.join(targetFolder, safeFilename);
    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
    
    const publicUrl = folder ? `/uploads/${folder}/${safeFilename}` : `/uploads/${safeFilename}`;

    // Automatically synchronize profile if requested
    if (updateProfileAvatar || folder === "avatar") {
      const data = getData();
      data.profile.avatarUrl = publicUrl;
      saveData(data);
    }

    return res.json({
      success: true,
      url: publicUrl,
      filename: safeFilename
    });
  } catch (err: any) {
    console.error("Server upload failure:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to save uploaded image" });
  }
});

// Update Profile
app.post("/api/profile", (req, res) => {
  const data = getData();
  data.profile = { ...data.profile, ...req.body };
  saveData(data);
  res.json({ success: true, profile: data.profile });
});

// Articles CRUD
app.post("/api/articles", (req, res) => {
  const data = getData();
  const newArticle = {
    id: req.body.id || `art-${Date.now()}`,
    title: req.body.title || "Untitled Article",
    slug: (req.body.title || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    category: req.body.category || "General",
    tags: req.body.tags || ["Business"],
    coverImage: req.body.coverImage || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    excerpt: req.body.excerpt || "",
    readTime: req.body.readTime || "4 min read",
    publishedDate: req.body.publishedDate || new Date().toISOString().split("T")[0],
    isPublished: req.body.isPublished !== false,
    content: req.body.content || ""
  };
  
  const existingIdx = data.articles.findIndex((a: any) => a.id === newArticle.id);
  if (existingIdx >= 0) {
    data.articles[existingIdx] = newArticle;
  } else {
    data.articles.unshift(newArticle);
  }
  
  saveData(data);
  res.json({ success: true, article: newArticle, articles: data.articles });
});

app.delete("/api/articles/:id", (req, res) => {
  const data = getData();
  data.articles = data.articles.filter((a: any) => a.id !== req.params.id);
  saveData(data);
  res.json({ success: true, articles: data.articles });
});

// Gallery CRUD
app.post("/api/gallery", (req, res) => {
  const data = getData();
  const newItem = {
    id: req.body.id || `gal-${Date.now()}`,
    title: req.body.title || "Gallery Item",
    category: req.body.category || "General",
    mediaType: req.body.mediaType || "image",
    url: req.body.url || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
    caption: req.body.caption || "",
    date: req.body.date || new Date().toISOString().split("T")[0]
  };

  const existingIdx = data.gallery.findIndex((g: any) => g.id === newItem.id);
  if (existingIdx >= 0) {
    data.gallery[existingIdx] = newItem;
  } else {
    data.gallery.unshift(newItem);
  }

  saveData(data);
  res.json({ success: true, item: newItem, gallery: data.gallery });
});

app.delete("/api/gallery/:id", (req, res) => {
  const data = getData();
  data.gallery = data.gallery.filter((g: any) => g.id !== req.params.id);
  saveData(data);
  res.json({ success: true, gallery: data.gallery });
});

// Inquiries Contact
app.post("/api/inquiries", (req, res) => {
  const data = getData();
  const newInquiry = {
    id: `inq-${Date.now()}`,
    name: req.body.name || "Anonymous",
    email: req.body.email || "",
    phone: req.body.phone || "",
    service: req.body.service || "General Inquiry",
    message: req.body.message || "",
    date: new Date().toISOString(),
    status: "new"
  };

  data.inquiries.unshift(newInquiry);
  saveData(data);
  res.json({ success: true, inquiry: newInquiry });
});

app.patch("/api/inquiries/:id", (req, res) => {
  const data = getData();
  const inquiry = data.inquiries.find((i: any) => i.id === req.params.id);
  if (inquiry) {
    if (req.body.status) inquiry.status = req.body.status;
    saveData(data);
    res.json({ success: true, inquiry });
  } else {
    res.status(404).json({ error: "Inquiry not found" });
  }
});

app.delete("/api/inquiries/:id", (req, res) => {
  const data = getData();
  data.inquiries = data.inquiries.filter((i: any) => i.id !== req.params.id);
  saveData(data);
  res.json({ success: true, inquiries: data.inquiries });
});

// Strict Admin Auth endpoints (Exclusively for solmanchoudhury66@gmail.com)
const AUTHORIZED_ADMIN_EMAIL = "solmanchoudhury66@gmail.com";

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();
  
  const data = getData();
  if (!data.adminAuth) {
    data.adminAuth = { email: AUTHORIZED_ADMIN_EMAIL, password: "SolmanSecurePassword2026!", failedAttempts: 0, lockedUntil: 0 };
  }

  // Check if locked out for 24 hours
  const now = Date.now();
  if (data.adminAuth.lockedUntil && data.adminAuth.lockedUntil > now) {
    const hoursLeft = Math.ceil((data.adminAuth.lockedUntil - now) / (1000 * 60 * 60));
    return res.status(429).json({
      success: false,
      error: `Too many failed login attempts. Your login access is restricted for 24 hours.`
    });
  }

  const isEmailValid = cleanEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
  const currentPassword = data.adminAuth.password || "SolmanSecurePassword2026!";
  const isPasswordValid = password && password.trim() === currentPassword;

  if (isEmailValid && isPasswordValid) {
    // Reset failed attempts on success
    data.adminAuth.failedAttempts = 0;
    data.adminAuth.lockedUntil = 0;
    saveData(data);

    res.json({ 
      success: true, 
      token: `auth_token_solman_${Date.now()}`,
      email: AUTHORIZED_ADMIN_EMAIL,
      name: data.profile?.name || "Solman Hussain Choudhury"
    });
  } else {
    // Increment failed attempts
    data.adminAuth.failedAttempts = (data.adminAuth.failedAttempts || 0) + 1;
    if (data.adminAuth.failedAttempts >= 5) {
      data.adminAuth.lockedUntil = now + 24 * 60 * 60 * 1000; // 24 hours
      saveData(data);
      return res.status(429).json({
        success: false,
        error: "Too many failed login attempts (maximum 5 allowed). Your login access is restricted for 24 hours."
      });
    }
    saveData(data);

    const attemptsLeft = 5 - data.adminAuth.failedAttempts;
    res.status(401).json({ 
      success: false, 
      error: `Wrong user ID and password. Access denied. (${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining before 24h lockout)` 
    });
  }
});

// Request Password Reset Code
app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();

  if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({ 
      success: false, 
      error: "Password reset is restricted to authorized accounts only." 
    });
  }

  const data = getData();
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = Date.now() + 15 * 60 * 1000; // 15 mins

  if (!data.adminAuth) {
    data.adminAuth = { email: AUTHORIZED_ADMIN_EMAIL, password: "SolmanSecurePassword2026!" };
  }
  data.adminAuth.resetOtp = otpCode;
  data.adminAuth.resetOtpExpiry = expiry;
  saveData(data);

  console.log(`[SECURITY] Password Reset OTP for ${AUTHORIZED_ADMIN_EMAIL}: ${otpCode}`);

  res.json({ 
    success: true, 
    message: `A 6-digit security verification code has been dispatched to ${AUTHORIZED_ADMIN_EMAIL}.`
  });
});

// Confirm Password Reset with OTP
app.post("/api/auth/reset-password", (req, res) => {
  const { email, otp, newPassword } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();

  if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({ success: false, error: "Unauthorized email address." });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, error: "New password must be at least 6 characters." });
  }

  const data = getData();
  if (!data.adminAuth || !data.adminAuth.resetOtp) {
    return res.status(400).json({ success: false, error: "No active password reset request found." });
  }

  if (Date.now() > (data.adminAuth.resetOtpExpiry || 0)) {
    return res.status(400).json({ success: false, error: "Verification code has expired. Please request a new code." });
  }

  if (data.adminAuth.resetOtp !== (otp || "").trim()) {
    return res.status(400).json({ success: false, error: "Invalid verification code. Please check and try again." });
  }

  data.adminAuth.password = newPassword.trim();
  data.adminAuth.resetOtp = null;
  data.adminAuth.resetOtpExpiry = null;
  saveData(data);

  res.json({ success: true, message: "Password has been successfully updated for solmanchoudhury66@gmail.com." });
});

// Update Credentials from Settings Tab
app.post("/api/auth/change-credentials", (req, res) => {
  const { currentPassword, newPassword, bypassCurrent } = req.body;
  const data = getData();
  const activePass = data.adminAuth?.password || "SolmanSecurePassword2026!";

  if (!bypassCurrent && currentPassword && currentPassword.trim() !== activePass) {
    return res.status(401).json({ success: false, error: "Current password does not match." });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, error: "New password must be at least 6 characters." });
  }

  if (!data.adminAuth) {
    data.adminAuth = { email: AUTHORIZED_ADMIN_EMAIL, password: newPassword.trim() };
  } else {
    data.adminAuth.password = newPassword.trim();
    data.adminAuth.email = AUTHORIZED_ADMIN_EMAIL;
  }

  saveData(data);
  res.json({ success: true, message: "Admin password updated successfully!" });
});

// Sync password after verified Firebase Auth reset
app.post("/api/auth/sync-password", (req, res) => {
  const { email, newPassword } = req.body;
  const cleanEmail = (email || "").trim().toLowerCase();

  if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({ success: false, error: "Unauthorized email." });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, error: "Password must be at least 6 characters." });
  }

  const data = getData();
  if (!data.adminAuth) {
    data.adminAuth = { email: AUTHORIZED_ADMIN_EMAIL, password: newPassword.trim() };
  } else {
    data.adminAuth.password = newPassword.trim();
    data.adminAuth.email = AUTHORIZED_ADMIN_EMAIL;
  }
  saveData(data);

  res.json({ success: true, message: "Password synchronized across authentication stores." });
});

// Gemini AI Assistant Chat Endpoint
app.post("/api/gemini-chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: "Message is required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: true,
        reply: "Hello! I am Solman Hussain Choudhury's AI Assistant. For direct assistance with M/S. Chaikosh Agrielectro Industries exports, tax consultancy, or vehicle insurance, please contact Solman directly at +91 6001565255 or contact@solmanchoudhury.in."
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Format conversation history for prompt context if any
    let conversationContext = "";
    if (Array.isArray(history) && history.length > 0) {
      conversationContext = history.map((h: any) => `${h.role === 'user' ? 'Visitor' : 'Assistant'}: ${h.text}`).join("\n");
    }

    const prompt = `${conversationContext}\nVisitor: ${message}\nAssistant:`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction: `You are "Hamza", the official AI trade and consultancy assistant for Solman Hussain Choudhury, Managing Partner of M/S. CHAIKOSH AGRIELECTRO INDUSTRIES (Merchant Exporter & Global Trade Specialist) and Certified Business/Tax Consultant based in Cachar, Assam, India.
Your core goal is to converse with visitors, understand why they came to the chat, what help they require, and resolve their questions using your knowledge base and website data regarding:
1. Global Trade & Export: Organic tea, ginger, turmeric, spices, and electronic/industrial commodities exported through M/S. CHAIKOSH AGRIELECTRO INDUSTRIES.
2. Tax & Consultancy: Income Tax Return (ITR) filing, GST compliance, MSME registration, CMA data, and loan advisory.
3. Insurance: Vehicle insurance (2-wheelers, 4-wheelers, commercial vehicles) and life/health insurance.
4. Professional background: BA in History from Assam University (Nabin Chandra College).

Guidelines:
- DO NOT give out phone numbers or email addresses immediately in the first greeting.
- First, warmly greet the user, ask why they came today, and what specific help or information they require.
- Actively converse and try your best to solve their inquiry using website data and your knowledge.
- DEPARTMENT CONTACT REQUESTS:
  1. For Tax Consultancy, Insurance, Company Registration, NGO Registration, or related professional services: Once the customer confirms their requirement and department, provide phone number **+91 6001565255** and email address **contact@solmanchoudhury.in**.
  2. For Import-Export related queries or International Trade requests: Once confirmed, provide phone number **+91 6003348068** (or +91 6001565255) and email addresses **admin@chaikosh.in**, **chaikoshagrielectroindustries@gmail.com**, and **contact@solmanchoudhury.in**.
- If the visitor's query cannot be fully resolved by you, or if they explicitly ask to speak with a human, kindly confirm their requirement and offer to transfer to a human agent with this professional response: "I want to make sure your requirement is fully addressed. Would you like to talk with a human agent? Please wait sometime agent will connect and he or she will give you answers shortly."`,
        }
      });
    } catch (modelErr: any) {
      console.warn("Primary model failed, trying fallback model gemini-2.5-flash:", modelErr?.message);
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: `You are "Hamza", the official AI trade and consultancy assistant for Solman Hussain Choudhury, Managing Partner of M/S. CHAIKOSH AGRIELECTRO INDUSTRIES (Merchant Exporter & Global Trade Specialist) and Certified Business/Tax Consultant based in Cachar, Assam, India.
Your core goal is to converse with visitors, understand why they came to the chat, what help they require, and resolve their questions using your knowledge base and website data regarding:
1. Global Trade & Export: Organic tea, ginger, turmeric, spices, and electronic/industrial commodities exported through M/S. CHAIKOSH AGRIELECTRO INDUSTRIES.
2. Tax & Consultancy: Income Tax Return (ITR) filing, GST compliance, MSME registration, CMA data, and loan advisory.
3. Insurance: Vehicle insurance (2-wheelers, 4-wheelers, commercial vehicles) and life/health insurance.
4. Professional background: BA in History from Assam University (Nabin Chandra College).

Guidelines:
- DO NOT give out phone numbers or email addresses immediately in the first greeting.
- First, warmly greet the user, ask why they came today, and what specific help or information they require.
- Actively converse and try your best to solve their inquiry using website data and your knowledge.
- DEPARTMENT CONTACT REQUESTS:
  1. For Tax Consultancy, Insurance, Company Registration, NGO Registration, or related professional services: Once the customer confirms their requirement and department, provide phone number **+91 6001565255** and email address **contact@solmanchoudhury.in**.
  2. For Import-Export related queries or International Trade requests: Once confirmed, provide phone number **+91 6003348068** (or +91 6001565255) and email addresses **admin@chaikosh.in**, **chaikoshagrielectroindustries@gmail.com**, and **contact@solmanchoudhury.in**.
- If the visitor's query cannot be fully resolved by you, or if they explicitly ask to speak with a human, kindly confirm their requirement and offer to transfer to a human agent with this professional response: "I want to make sure your requirement is fully addressed. Would you like to talk with a human agent? Please wait sometime agent will connect and he or she will give you answers shortly."`,
        }
      });
    }

    const reply = response.text || "Thank you for your message. Solman Hussain Choudhury or our team will review your inquiry shortly.";

    // Automatically record chat inquiry in the database so the admin can see it in CMS
    const data = getData();
    data.inquiries.unshift({
      id: `chat-${Date.now()}`,
      name: "Chat Visitor",
      email: "chat-visitor@port.in",
      phone: "+91 6001565255",
      service: "Gemini AI Chat Assistant",
      message: `Q: ${message}\nA: ${reply}`,
      date: new Date().toISOString(),
      status: "new"
    });
    saveData(data);

    res.json({ success: true, reply });
  } catch (err: any) {
    console.error("Gemini chat error:", err);
    res.json({
      success: true,
      reply: "Thank you for reaching out. Please wait sometime agent will connect and he or she will give you answers shortly, or contact Solman directly at +91 6001565255."
    });
  }
});

// Reset to default seed
app.post("/api/reset-data", (req, res) => {
  saveData(initialData);
  res.json({ success: true, data: initialData });
});

async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Portfolio & CMS Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
