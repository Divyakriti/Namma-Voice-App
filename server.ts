import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Role, 
  Citizen, 
  DepartmentType, 
  CategoryType, 
  StatusType, 
  Officer, 
  ComplaintHistory, 
  Complaint, 
  LeaderboardMetric 
} from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

// Setup Database File
const DB_FILE = path.join(process.cwd(), "db.json");

interface DatabaseSchema {
  citizens: Citizen[];
  complaints: Complaint[];
  officers: Officer[];
  history: ComplaintHistory[];
}

const DEFAULT_OFFICERS: Officer[] = [
  { id: "MUNI-CHE-01", name: "Thiru. S. Ramanujam", department: "Municipal Corporation", district: "Chennai" },
  { id: "MUNI-CBE-01", name: "Selvi. Priya Dharshini", department: "Municipal Corporation", district: "Coimbatore" },
  { id: "WAT-CHE-01", name: "Thiru. M. Kathirvel", department: "Water Board", district: "Chennai" },
  { id: "WAT-MDU-01", name: "Selvan. R. Vetrivel", department: "Water Board", district: "Madurai" },
  { id: "ELEC-CBE-01", name: "Thiru. A. Rajesh", department: "Electricity Board", district: "Coimbatore" },
  { id: "HIGH-TRY-01", name: "Thiru. N. Loganathan", department: "Highways Department", district: "Trichy" },
  { id: "POL-CHE-01", name: "Inspector G. Selvamani", department: "Police Department", district: "Chennai" },
  { id: "POL-MDU-01", name: "Inspector K. Pandian", department: "Police Department", district: "Madurai" }
];

const DEFAULT_CITIZENS: Citizen[] = [
  { id: "citizen-1", name: "Divyakriti Pur", email: "9e.divyakriti.pu.103@gmail.com", phone: "+91 94445 12345", city: "Chennai", district: "Chennai", reputationPoints: 120 },
  { id: "citizen-2", name: "Anand Krishnan", email: "anand.k@gmail.com", phone: "+91 98401 56789", city: "Coimbatore", district: "Coimbatore", reputationPoints: 350 },
  { id: "citizen-3", name: "Janani Sundar", email: "janani.s@gmail.com", phone: "+91 97722 33445", city: "Madurai", district: "Madurai", reputationPoints: 80 }
];

const DEFAULT_COMPLAINTS: Complaint[] = [
  {
    id: "COMP-2026-001",
    title: "Unauthorized plastic garbage dumping behind T Nagar Bus Terminus",
    description: "A huge pile of commercial plastic waste has accumulated here, blocking part of the pedestrian path. It emits a terrible odor and is attracting stray animals.",
    category: "Garbage",
    department: "Municipal Corporation",
    location: {
      district: "Chennai",
      city: "Chennai",
      manualAddress: "T Nagar Bus Terminus back gate, Usman Road, Chennai - 600017",
      latitude: 13.0401,
      longitude: 80.2337
    },
    reporter: {
      id: "citizen-1",
      name: "Divyakriti Pur",
      phone: "+91 94445 12345"
    },
    beforePhotoUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=60",
    assignedOfficerId: "MUNI-CHE-01",
    assignedOfficerName: "Thiru. S. Ramanujam",
    dateCreated: "2026-06-10T10:30:00Z",
    status: "In Progress",
    remarks: "Inspection completed. Conservancy trucks scheduled to clear this on 18th morning."
  },
  {
    id: "COMP-2026-002",
    title: "Major underground sewage pipeline leakage on Avanashi Road",
    description: "Sewage water is overflowing from a broken underground pipe on Avanashi Road near Peelamedu. The water is flooding the service lane, causing traffic hazards.",
    category: "Water",
    department: "Water Board",
    location: {
      district: "Coimbatore",
      city: "Coimbatore",
      manualAddress: "Near PSG Tech Main Gate, Avanashi Road, Peelamedu, Coimbatore - 641004",
      latitude: 11.0248,
      longitude: 77.0011
    },
    reporter: {
      id: "citizen-2",
      name: "Anand Krishnan",
      phone: "+91 98401 56789"
    },
    beforePhotoUrl: "https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=600&auto=format&fit=crop&q=60",
    assignedOfficerId: "WAT-CBE-01",
    assignedOfficerName: "Selvi. Priya Dharshini", // Replaced with existing or added manually
    dateCreated: "2026-06-12T08:15:00Z",
    status: "Verification Pending",
    remarks: "Leakage sealed with high-grade collars. Service lane washed clean. Ready for verification.",
    verificationPin: "8541",
    afterPhotoUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&auto=format&fit=crop&q=60"
  },
  {
    id: "COMP-2026-003",
    title: "Three non-functioning streetlights near Mattuthavani",
    description: "The streetlights on the inner crossroad near Mattuthavani bus stand haven't been working for the past week, making it extremely unsafe for women at night.",
    category: "Streetlights",
    department: "Electricity Board",
    location: {
      district: "Madurai",
      city: "Madurai",
      manualAddress: "Mattuthavani High School cross street, Madurai - 625007",
      latitude: 9.9392,
      longitude: 78.1560
    },
    reporter: {
      id: "citizen-3",
      name: "Janani Sundar",
      phone: "+91 97722 33445"
    },
    beforePhotoUrl: "https://images.unsplash.com/photo-1509024644558-2f060d43f60b?w=600&auto=format&fit=crop&q=60",
    assignedOfficerId: "ELEC-CBE-01",
    assignedOfficerName: "Thiru. A. Rajesh",
    dateCreated: "2026-06-14T21:40:00Z",
    status: "Assigned",
    remarks: "Work order created. Lineman scheduled to replace bulb and inspect circuit tomorrow."
  },
  {
    id: "COMP-2026-004",
    title: "Dangerous deep potholes near Gandhipuram Junction",
    description: "A series of critical potholes have developed right on the curve of Gandhipuram flyover slip road. Multiple two-wheelers have skidded here during rains.",
    category: "Roads",
    department: "Highways Department",
    location: {
      district: "Coimbatore",
      city: "Coimbatore",
      manualAddress: "Gandhipuram Flyover approach road, 5th Cross Corner, Coimbatore - 641012",
      latitude: 11.0168,
      longitude: 76.9689
    },
    reporter: {
      id: "citizen-2",
      name: "Anand Krishnan",
      phone: "+91 98401 56789"
    },
    beforePhotoUrl: "https://images.unsplash.com/photo-1515162305285-0293fe4767cc?w=600&auto=format&fit=crop&q=60",
    assignedOfficerId: "HIGH-TRY-01",
    assignedOfficerName: "Thiru. N. Loganathan",
    dateCreated: "2026-06-05T09:00:00Z",
    status: "Resolved",
    remarks: "Filled with bituminous aggregate cold-mix and rolled level. Traffic restored safe.",
    afterPhotoUrl: "https://images.unsplash.com/photo-1599740831666-dec68233ed89?w=600&auto=format&fit=crop&q=60"
  },
  {
    id: "COMP-2026-005",
    title: "Double-parking and illegal auto stand at Trichy Junction road",
    description: "Auto-rickshaws and delivery vehicles are parking three-deep near the station entrance, causing absolute deadlock traffic every single evening between 5 PM and 8 PM.",
    category: "Police",
    department: "Police Department",
    location: {
      district: "Trichy",
      city: "Trichy",
      manualAddress: "Trichy Junction Main Gate, Cantonment, Trichy - 620001",
      latitude: 10.7845,
      longitude: 78.6834
    },
    reporter: {
      id: "citizen-1",
      name: "Divyakriti Pur",
      phone: "+91 94445 12345"
    },
    beforePhotoUrl: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=600&auto=format&fit=crop&q=60",
    assignedOfficerId: "POL-MDU-01",
    assignedOfficerName: "Inspector K. Pandian",
    dateCreated: "2026-06-08T17:30:00Z",
    status: "Resolved",
    remarks: "Enforcement drive conducted. Fine receipts issued to 14 vehicles. Placed permanent barricading zone.",
    afterPhotoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=60"
  },
  {
    id: "COMP-2026-006",
    title: "Encroached street vendors completely blocking sidewalk in Velachery",
    description: "Commercial shops have extended their display racks completely onto the pedestrian walkway, forcing children and elders to walk on the busy high-speed vehicular traffic lane.",
    category: "Encroachment",
    department: "Municipal Corporation",
    location: {
      district: "Chennai",
      city: "Chennai",
      manualAddress: "Velachery Main Road, opposite Phoenix Marketcity, Chennai - 600042",
      latitude: 12.9915,
      longitude: 80.2170
    },
    reporter: {
      id: "citizen-1",
      name: "Divyakriti Pur",
      phone: "+91 94445 12345"
    },
    beforePhotoUrl: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=600&auto=format&fit=crop&q=60",
    assignedOfficerId: "MUNI-CHE-01",
    assignedOfficerName: "Thiru. S. Ramanujam",
    dateCreated: "2026-06-15T11:00:00Z",
    status: "Pending"
  }
];

const DEFAULT_HISTORY: ComplaintHistory[] = [
  {
    id: "HIST-001",
    complaintId: "COMP-2026-001",
    status: "Pending",
    updatedBy: "System",
    updatedByRole: "System",
    remarks: "Complaint raised successfully & AI classified to Municipal Corporation.",
    timestamp: "2026-06-10T10:30:00Z"
  },
  {
    id: "HIST-002",
    complaintId: "COMP-2026-001",
    status: "Assigned",
    updatedBy: "Super Admin",
    updatedByRole: "admin",
    remarks: "Assigned task to local division officer Thiru. S. Ramanujam.",
    timestamp: "2026-06-10T11:15:00Z"
  },
  {
    id: "HIST-003",
    complaintId: "COMP-2026-001",
    status: "In Progress",
    updatedBy: "Thiru. S. Ramanujam",
    updatedByRole: "officer",
    remarks: "Inspection completed. Conservancy trucks scheduled to clear this on 18th morning.",
    timestamp: "2026-06-11T09:00:00Z"
  },
  // Complaint 2
  {
    id: "HIST-004",
    complaintId: "COMP-2026-002",
    status: "Pending",
    updatedBy: "System",
    updatedByRole: "System",
    remarks: "Complaint filed & classified to Water Board.",
    timestamp: "2026-06-12T08:15:00Z"
  },
  {
    id: "HIST-005",
    complaintId: "COMP-2026-002",
    status: "In Progress",
    updatedBy: "Selvi. Priya Dharshini",
    updatedByRole: "officer",
    remarks: "Excavated broken segment and isolated water feed. Repair in action.",
    timestamp: "2026-06-12T14:30:00Z"
  },
  {
    id: "HIST-006",
    complaintId: "COMP-2026-002",
    status: "Verification Pending",
    updatedBy: "Selvi. Priya Dharshini",
    updatedByRole: "officer",
    remarks: "Leakage sealed with high-grade collars. Service lane washed clean. Ready for verification.",
    timestamp: "2026-06-13T16:00:00Z",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&auto=format&fit=crop&q=60"
  },
  // Complaint 4
  {
    id: "HIST-010",
    complaintId: "COMP-2026-004",
    status: "Pending",
    updatedBy: "System",
    updatedByRole: "System",
    remarks: "Reported dynamic roads safety issue on Gandhipuram Junction.",
    timestamp: "2026-06-05T09:00:00Z"
  },
  {
    id: "HIST-011",
    complaintId: "COMP-2026-004",
    status: "Resolved",
    updatedBy: "Anand Krishnan",
    updatedByRole: "citizen",
    remarks: "Verified resolved by entering PIN. Thank you for fixing this so quickly!",
    timestamp: "2026-06-07T12:00:00Z"
  }
];

// Helper to calculate due dates based on department SLAs (Electricity: 1d, Police: 1d, Water: 2d, Municipal: 3d, Highways: 5d)
function calculateDueDate(department: DepartmentType, dateCreatedStr: string): string {
  const date = new Date(dateCreatedStr);
  let days = 3; // Default 3 days
  if (department === "Electricity Board") days = 1;
  else if (department === "Police Department") days = 1;
  else if (department === "Water Board") days = 2;
  else if (department === "Highways Department") days = 5;
  else if (department === "Municipal Corporation") days = 3;
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

// Read/Write Functions for JSON db
function loadDb(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const initialDb: DatabaseSchema = {
      citizens: DEFAULT_CITIZENS,
      complaints: DEFAULT_COMPLAINTS.map(c => ({
        ...c,
        dueDate: calculateDueDate(c.department, c.dateCreated)
      })),
      officers: DEFAULT_OFFICERS,
      history: DEFAULT_HISTORY
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf8");
    return initialDb;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    const db: DatabaseSchema = JSON.parse(raw);
    let updated = false;
    db.complaints = db.complaints.map(c => {
      if (!c.dueDate) {
        c.dueDate = calculateDueDate(c.department, c.dateCreated);
        updated = true;
      }
      return c;
    });
    if (updated) {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
    }
    return db;
  } catch (error) {
    console.error("Error reading database file, re-creating defaults:", error);
    const initialDb: DatabaseSchema = {
      citizens: DEFAULT_CITIZENS,
      complaints: DEFAULT_COMPLAINTS.map(c => ({
        ...c,
        dueDate: calculateDueDate(c.department, c.dateCreated)
      })),
      officers: DEFAULT_OFFICERS,
      history: DEFAULT_HISTORY
    };
    return initialDb;
  }
}

function saveDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// Ensure the db starts initialized
loadDb();

// Express Server
app.use(express.json({ limit: "50mb" }));

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  console.log("Gemini Client initialized successfully on Server.");
} else {
  console.log("Warning: GEMINI_API_KEY is not defined. Local rule-based classifier will support categorization.");
}

// --- AUTHENTICATION ROUTES ---

// Citizen Register
app.post("/api/auth/citizen/register", (req, res) => {
  const { name, email, phone, city, district } = req.body;
  
  if (!name || !email || !phone || !city || !district) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const db = loadDb();
  let citizen = db.citizens.find(c => c.email.toLowerCase() === email.toLowerCase());
  
  if (citizen) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const newId = "citizen-" + Date.now();
  const newCitizen: Citizen = {
    id: newId,
    name,
    email,
    phone,
    city,
    district,
    reputationPoints: 50 // starting benefit points
  };

  db.citizens.push(newCitizen);
  saveDb(db);

  return res.json({ success: true, user: newCitizen, role: "citizen" });
});

// Citizen Login / Single sign-on bypass
app.post("/api/auth/citizen/login", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const db = loadDb();
  const citizen = db.citizens.find(c => c.email.toLowerCase() === email.toLowerCase());

  if (!citizen) {
    // Standard sandbox behavior: create a user instantly to make experience friendly!
    const newId = "citizen-" + Date.now();
    const splitName = email.split('@')[0];
    const generatedName = splitName.charAt(0).toUpperCase() + splitName.slice(1);
    const newCitizen: Citizen = {
      id: newId,
      name: generatedName,
      email: email,
      phone: "+91 94445 " + Math.floor(10000 + Math.random() * 90000),
      city: "Chennai",
      district: "Chennai",
      reputationPoints: 50
    };
    db.citizens.push(newCitizen);
    saveDb(db);
    return res.json({ success: true, user: newCitizen, role: "citizen", isNew: true });
  }

  return res.json({ success: true, user: citizen, role: "citizen" });
});

// Officer Login
app.post("/api/auth/officer/login", (req, res) => {
  const { officerId, password } = req.body;
  if (!officerId) {
    return res.status(400).json({ error: "Officer ID is required" });
  }

  const db = loadDb();
  const officer = db.officers.find(o => o.id.toUpperCase() === officerId.toUpperCase());

  if (!officer) {
    return res.status(404).json({ error: "Officer not found. Try prefilled: MUNI-CHE-01, WAT-CHE-01, ELEC-CBE-01" });
  }

  // Any password is accepted for testing convenience, as long as officerId is valid
  return res.json({ success: true, user: officer, role: "officer" });
});

// Super Admin Login
app.post("/api/auth/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    return res.json({
      success: true,
      user: { id: "admin-1", name: "Super Admin", role: "admin" },
      role: "admin"
    });
  }
  return res.status(401).json({ error: "Invalid Admin Credentials (Use admin / admin123)" });
});

// --- COMPLAINTS API ---

// Create Complaint + AI Classification
app.post("/api/complaints", async (req, res) => {
  const { 
    title, 
    description, 
    reporterId, 
    reporterName, 
    reporterPhone, 
    manualAddress, 
    latitude, 
    longitude, 
    district, 
    city,
    voiceUrl,
    videoUrl,
    beforePhotoUrl
  } = req.body;

  if (!title || !description || !reporterId) {
    return res.status(400).json({ error: "Title, Description, and Reporter ID are required" });
  }

  // AI & Local rule fallback Category Mapping
  let assignedCategory: CategoryType = "General";
  let assignedDepartment: DepartmentType = "Municipal Corporation";
  let aiExplanation = "Determined via platform rules routing.";

  // 1. Try Gemini API for professional smart classification
  if (aiClient) {
    try {
      const prompt = `You are the core routing classifier for the "Namma Voice" (நம்ம குரல்) civic platform of Tamil Nadu, India.
Analyze this civic issue and assign the best Category and Department.

Title: "${title}"
Description: "${description}"

Categories: [Garbage, Roads, Water, Streetlights, Police, Encroachment, Public Safety, General]
Departments: [Municipal Corporation, Water Board, Electricity Board, Highways Department, Police Department]

Rules:
- Sewage overflowing, pipe leak, drainage block or water contamination -> Water (Water Board)
- Potholes, highway repairs, bridge work, collapsed roads -> Roads (Highways Department)
- Streetlight bulb repairs, high tension lines spark, power loss -> Streetlights (Electricity Board)
- Illegal garbage dumping, empty plot dumps, organic/plastic debris -> Garbage (Municipal Corporation)
- Eviction of pavement markets, illegal building expansion on streets -> Encroachment (Municipal Corporation)
- Unlawful activities, harassment, noise nuisance, dangerous traffic blockage -> Police (Police Department)
- Open live wires, weak walls, gas leak etc. -> Public Safety (Police Department or Municipal Corporation)
- Anything else -> General (Municipal Corporation)

Return JSON ONLY with this structure:
{
  "category": "Garbage" | "Roads" | "Water" | "Streetlights" | "Police" | "Encroachment" | "Public Safety" | "General",
  "department": "Municipal Corporation" | "Water Board" | "Electricity Board" | "Highways Department" | "Police Department",
  "explanation": "Why this department was selected in one sentence"
}`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      if (response && response.text) {
        const result = JSON.parse(response.text.trim());
        if (result.category && result.department) {
          assignedCategory = result.category;
          assignedDepartment = result.department;
          aiExplanation = result.explanation || "Classified using Gemini GenAI model.";
          console.log("Gemini AI classified Successfully:", result);
        }
      }
    } catch (apiErr) {
      console.error("Gemini classification failed, falling back to keywords:", apiErr);
    }
  }

  // 2. Local rule-based fallback if Gemini is missing or failed
  if (assignedCategory === "General" && assignedDepartment === "Municipal Corporation") {
    const textToAnalyze = (title + " " + description).toLowerCase();
    
    if (textToAnalyze.includes("garbage") || textToAnalyze.includes("trash") || textToAnalyze.includes("waste") || textToAnalyze.includes("kuppai") || textToAnalyze.includes("clean")) {
      assignedCategory = "Garbage";
      assignedDepartment = "Municipal Corporation";
    } else if (textToAnalyze.includes("water") || textToAnalyze.includes("sewage") || textToAnalyze.includes("drain") || textToAnalyze.includes("leak") || textToAnalyze.includes("pipe") || textToAnalyze.includes("flooding")) {
      assignedCategory = "Water";
      assignedDepartment = "Water Board";
    } else if (textToAnalyze.includes("road") || textToAnalyze.includes("pothole") || textToAnalyze.includes("bridge") || textToAnalyze.includes("nh ") || textToAnalyze.includes("flyover")) {
      assignedCategory = "Roads";
      assignedDepartment = "Highways Department";
    } else if (textToAnalyze.includes("light") || textToAnalyze.includes("street-light") || textToAnalyze.includes("electric") || textToAnalyze.includes("power") || textToAnalyze.includes("wire") || textToAnalyze.includes("transformer")) {
      assignedCategory = "Streetlights";
      assignedDepartment = "Electricity Board";
    } else if (textToAnalyze.includes("police") || textToAnalyze.includes("theft") || textToAnalyze.includes("harass") || textToAnalyze.includes("safety") || textToAnalyze.includes("crime") || textToAnalyze.includes("parking")) {
      assignedCategory = "Police";
      assignedDepartment = "Police Department";
    } else if (textToAnalyze.includes("encroach") || textToAnalyze.includes("vendor") || textToAnalyze.includes("sidewalk") || textToAnalyze.includes("shop extension")) {
      assignedCategory = "Encroachment";
      assignedDepartment = "Municipal Corporation";
    } else if (textToAnalyze.includes("safety") || textToAnalyze.includes("danger") || textToAnalyze.includes("hazard")) {
      assignedCategory = "Public Safety";
      assignedDepartment = "Police Department";
    }
  }

  const db = loadDb();
  
  // Assign a matching officer from the department & district if available
  const matchingOfficer = db.officers.find(
    o => o.department === assignedDepartment && o.district.toLowerCase() === (district || "").toLowerCase()
  ) || db.officers.find(o => o.department === assignedDepartment) || db.officers[0];

  const complaintId = "COMP-2026-" + Math.floor(100 + Math.random() * 900);
  
  const newComplaint: Complaint = {
    id: complaintId,
    title,
    description,
    category: assignedCategory,
    department: assignedDepartment,
    location: {
      district: district || "Chennai",
      city: city || "Chennai",
      manualAddress: manualAddress || "Automatic GPS Captured Location",
      latitude: Number(latitude) || 13.0827,
      longitude: Number(longitude) || 80.2707
    },
    reporter: {
      id: reporterId,
      name: reporterName || "Anonymous Citizen",
      phone: reporterPhone || ""
    },
    voiceUrl,
    videoUrl,
    beforePhotoUrl: beforePhotoUrl || "https://images.unsplash.com/photo-1621451537084-482c730737ee?w=600&auto=format&fit=crop&q=60",
    assignedOfficerId: matchingOfficer?.id,
    assignedOfficerName: matchingOfficer?.name,
    dateCreated: new Date().toISOString(),
    dueDate: calculateDueDate(assignedDepartment, new Date().toISOString()),
    status: "Assigned" // directly assign to officer
  };

  // Log to history
  const historyLog: ComplaintHistory = {
    id: "HIST-" + Date.now(),
    complaintId: complaintId,
    status: "Assigned",
    updatedBy: "Namma Voice Automated AI Router",
    updatedByRole: "System",
    remarks: `Complaint filed. Auto-categorized as "${assignedCategory}" by AI & assigned to ${assignedDepartment}. Officer in charge: ${matchingOfficer?.name}. Route Explanation: ${aiExplanation}`,
    timestamp: new Date().toISOString()
  };

  db.complaints.unshift(newComplaint);
  db.history.push(historyLog);
  saveDb(db);

  return res.json({ success: true, complaint: newComplaint, history: historyLog });
});

// Get All Complaints (highly dynamic filters & public search)
app.get("/api/complaints", (req, res) => {
  const { district, department, status, search, reporterId, officerId } = req.query;
  const db = loadDb();
  let list = [...db.complaints];

  if (district) {
    list = list.filter(c => c.location.district.toLowerCase() === (district as string).toLowerCase());
  }
  if (department) {
    list = list.filter(c => c.department.toLowerCase() === (department as string).toLowerCase());
  }
  if (status) {
    list = list.filter(c => c.status.toLowerCase() === (status as string).toLowerCase());
  }
  if (reporterId) {
    list = list.filter(c => c.reporter.id === reporterId);
  }
  if (officerId) {
    list = list.filter(c => c.assignedOfficerId === officerId);
  }
  if (search) {
    const s = (search as string).toLowerCase();
    list = list.filter(c => 
      c.id.toLowerCase().includes(s) ||
      c.title.toLowerCase().includes(s) ||
      c.description.toLowerCase().includes(s) ||
      c.location.manualAddress.toLowerCase().includes(s)
    );
  }

  // Sort by date created decending
  list.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());

  return res.json(list);
});

// Get Individual Complaint Details
app.get("/api/complaints/:id", (req, res) => {
  const db = loadDb();
  const complaint = db.complaints.find(c => c.id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  const timeline = db.history.filter(h => h.complaintId === req.params.id);
  timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return res.json({ complaint, timeline });
});

// Officer Action (Update Status / Marks as Verification Pending)
app.post("/api/complaints/:id/action", (req, res) => {
  const { status, remarks, officerName, officerId, afterPhotoUrl } = req.body;
  if (!status || !officerId) {
    return res.status(400).json({ error: "Status and Officer ID are required" });
  }

  const db = loadDb();
  const index = db.complaints.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  const complaint = db.complaints[index];
  
  // Set Verification PIN if moving to Verification Pending
  let pin = complaint.verificationPin;
  if (status === "Verification Pending" && !pin) {
    pin = Math.floor(1000 + Math.random() * 9000).toString(); // generate random 4 digit PIN
  }

  // Apply changes
  complaint.status = status;
  complaint.remarks = remarks || `Updated status to ${status} by field officer.`;
  if (status === "Verification Pending") {
    complaint.verificationPin = pin;
  }
  if (afterPhotoUrl) {
    complaint.afterPhotoUrl = afterPhotoUrl;
  }

  // Add history list log
  const hist: ComplaintHistory = {
    id: "HIST-" + Date.now(),
    complaintId: complaint.id,
    status: status,
    updatedBy: officerName || "Officer",
    updatedByRole: "officer",
    remarks: remarks || `Status changed to ${status}`,
    timestamp: new Date().toISOString(),
    photoUrl: afterPhotoUrl
  };

  db.history.push(hist);
  saveDb(db);

  return res.json({ 
    success: true, 
    complaint, 
    pin: status === "Verification Pending" ? pin : undefined,
    smsSimulated: status === "Verification Pending" ? `[SMS SIMULATOR to ${complaint.reporter.phone}]: Vanakkam! Your issue "${complaint.title}" has been completed by ${complaint.assignedOfficerName}. Please enter verification PIN: ${pin} to resolve your complaint.` : null
  });
});

// Citizen Verification PIN check
app.post("/api/complaints/:id/verify", (req, res) => {
  const { pin, action, remarks, citizenId } = req.body; // action: 'approve' or 'reject'
  if (!action) {
    return res.status(400).json({ error: "Action is required ('approve' or 'reject')" });
  }

  const db = loadDb();
  const index = db.complaints.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  const complaint = db.complaints[index];

  if (complaint.status !== "Verification Pending") {
    return res.status(400).json({ error: "Complaint is not in Verification Pending state" });
  }

  if (action === "approve") {
    if (complaint.verificationPin !== pin) {
      complaint.verificationAttempts = (complaint.verificationAttempts || 0) + 1;
      saveDb(db);
      return res.status(400).json({ error: "Invalid Verification PIN. Please check SMS simulation bar." });
    }

    complaint.status = "Resolved";
    complaint.remarks = remarks || "Resolution verified by citizen. Case closed.";

    const citizenIndex = db.citizens.findIndex(c => c.id === complaint.reporter.id);
    if (citizenIndex !== -1) {
      db.citizens[citizenIndex].reputationPoints += 100; // Reward citizen benefit points
    }

    const hist: ComplaintHistory = {
      id: "HIST-" + Date.now(),
      complaintId: complaint.id,
      status: "Resolved",
      updatedBy: complaint.reporter.name,
      updatedByRole: "citizen",
      remarks: remarks || "Resolution verified and accepted. Complaint marked Resolved. Excellent work!",
      timestamp: new Date().toISOString()
    };
    db.history.push(hist);
    saveDb(db);

    return res.json({ success: true, complaint, rewardMessage: "Awesome! You have earned +100 reputation points for civil collaboration." });
  } else {
    // Rejected, goes back to 'In Progress'
    complaint.status = "In Progress";
    complaint.remarks = remarks || "Citizen rejected completion. Re-dispatching to officer.";
    
    // Clear the incorrect pins
    complaint.verificationPin = undefined;

    const hist: ComplaintHistory = {
      id: "HIST-" + Date.now(),
      complaintId: complaint.id,
      status: "In Progress",
      updatedBy: complaint.reporter.name,
      updatedByRole: "citizen",
      remarks: remarks || "Citizen rejected resolution. Feedback returned to department.",
      timestamp: new Date().toISOString()
    };
    db.history.push(hist);
    saveDb(db);

    return res.json({ success: true, complaint });
  }
});

// Admin-level complaint action override (reroute department, reassign officer)
app.post("/api/complaints/:id/admin-edit", (req, res) => {
  const { id } = req.params;
  const { department, assignedOfficerId, assignedOfficerName, remarks, status } = req.body;

  const db = loadDb();
  const complaint = db.complaints.find(c => c.id === id);
  if (!complaint) {
    return res.status(404).json({ error: "Civic record not found" });
  }

  // Preserve history of fields changed
  const oldDept = complaint.department;
  const oldOff = complaint.assignedOfficerName;
  const oldStatus = complaint.status;

  if (department) {
    complaint.department = department;
    // Calculate new SLA due date if department changed
    complaint.dueDate = calculateDueDate(department, complaint.dateCreated);
  }
  if (remarks !== undefined) complaint.remarks = remarks;
  if (status) complaint.status = status;
  
  if (assignedOfficerId !== undefined) {
    complaint.assignedOfficerId = assignedOfficerId || undefined;
    complaint.assignedOfficerName = assignedOfficerName || undefined;
  }

  // Log overwrite to history list
  const auditHist: ComplaintHistory = {
    id: "HIST-" + Date.now(),
    complaintId: id,
    status: complaint.status,
    updatedBy: "Super Master Admin",
    updatedByRole: "admin",
    remarks: `Manual administrative override applied. Rerouted department: "${oldDept}" -> "${complaint.department}". Assigned: "${oldOff || "None"}" -> "${complaint.assignedOfficerName || "Unassigned"}". Status: "${oldStatus}" -> "${complaint.status}". Remarks override: ${remarks || "None"}`,
    timestamp: new Date().toISOString()
  };

  db.history.push(auditHist);
  saveDb(db);

  return res.json({ success: true, complaint });
});

// Admin-level delete complaint
app.post("/api/complaints/:id/admin-delete", (req, res) => {
  const { id } = req.params;
  const db = loadDb();
  const initialIndex = db.complaints.findIndex(c => c.id === id);
  if (initialIndex === -1) {
    return res.status(404).json({ error: "Record not found" });
  }

  db.complaints.splice(initialIndex, 1);
  // clean history
  db.history = db.history.filter(h => h.complaintId !== id);
  saveDb(db);

  return res.json({ success: true });
});

// --- LEADERBOARD & METRICS API ---

app.get("/api/departments/leaderboard", (req, res) => {
  const db = loadDb();
  const complaints = db.complaints;
  
  const DEPARTMENTS_LIST: DepartmentType[] = [
    "Municipal Corporation",
    "Water Board",
    "Electricity Board",
    "Highways Department",
    "Police Department"
  ];

  const metrics: LeaderboardMetric[] = DEPARTMENTS_LIST.map((dept, index) => {
    const deptComplaints = complaints.filter(c => c.department === dept);
    const total = deptComplaints.length;
    const resolved = deptComplaints.filter(c => c.status === "Resolved").length;
    const pending = deptComplaints.filter(c => c.status === "Assigned" || c.status === "Pending" || c.status === "In Progress" || c.status === "Verification Pending").length;
    
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 100;
    
    // Auto resolution average time mapping
    let defaultAvgTime = 48; // Base default in hours
    if (dept === "Electricity Board") defaultAvgTime = 12;
    if (dept === "Police Department") defaultAvgTime = 24;
    if (dept === "Municipal Corporation") defaultAvgTime = 36;
    if (dept === "Water Board") defaultAvgTime = 40;

    return {
      departmentName: dept,
      totalComplaints: total,
      resolvedComplaints: resolved,
      pendingComplaints: pending,
      avgResolutionTimeHours: defaultAvgTime,
      resolutionRate: rate,
      rank: 1
    };
  });

  // Rank based on: Highest Resolution Rate, lowest pending, then fastest resolution time
  metrics.sort((a, b) => {
    if (b.resolutionRate !== a.resolutionRate) {
      return b.resolutionRate - a.resolutionRate;
    }
    if (a.pendingComplaints !== b.pendingComplaints) {
      return a.pendingComplaints - b.pendingComplaints; // lower is better
    }
    return a.avgResolutionTimeHours - b.avgResolutionTimeHours; // faster is better
  });

  // Assign numeric rank
  metrics.forEach((m, idx) => {
    m.rank = idx + 1;
  });

  return res.json(metrics);
});

// Aggregate Analytics Route
app.get("/api/analytics", (req, res) => {
  const db = loadDb();
  const complaints = db.complaints;

  // Complaints by Department
  const byDept: Record<string, number> = {};
  // Complaints by District
  const byDistrict: Record<string, number> = {};
  
  complaints.forEach(c => {
    byDept[c.department] = (byDept[c.department] || 0) + 1;
    byDistrict[c.location.district] = (byDistrict[c.location.district] || 0) + 1;
  });

  const resolved = complaints.filter(c => c.status === "Resolved").length;
  const rating = complaints.length > 0 ? Math.round((resolved / complaints.length) * 100) : 0;
  const overdueCount = complaints.filter(c => c.status !== "Resolved" && c.dueDate && new Date() > new Date(c.dueDate)).length;

  // Monthly trends simulation
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const trends = months.map((m, idx) => ({
    month: m,
    reported: 40 + idx * 15 + Math.floor(Math.random() * 10),
    resolved: 30 + idx * 16 + Math.floor(Math.random() * 8)
  }));

  return res.json({
    byDepartment: Object.entries(byDept).map(([name, count]) => ({ name, value: count })),
    byDistrict: Object.entries(byDistrict).map(([name, count]) => ({ name, value: count })),
    resolutionRate: rating,
    monthlyTrends: trends,
    summary: {
      total: complaints.length,
      pending: complaints.filter(c => c.status !== "Resolved").length,
      resolved: resolved,
      overdue: overdueCount,
      citizensCount: db.citizens.length
    }
  });
});

// Heatmap Coordinate points
app.get("/api/extra/heatmap", (req, res) => {
  const db = loadDb();
  const points = db.complaints.map(c => ({
    id: c.id,
    title: c.title,
    category: c.category,
    status: c.status,
    lat: c.location.latitude,
    lng: c.location.longitude,
    manualAddress: c.location.manualAddress,
    intensity: c.status === "Resolved" ? 1 : 3 // unresolved counts as hotter
  }));
  return res.json(points);
});

const startServer = async () => {
  // Vite Integration
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
    console.log(`Server running in ${process.env.NODE_ENV === "production" ? "PROD" : "DEV"} on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
