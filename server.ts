// ssh -i niyaan-source-app_key.pem azureuser@20.198.10.204
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { 
  MOCK_USERS, 
  MOCK_ASSESSMENTS, 
  QUESTION_BANK, 
  SupplierAssessment, 
  User, 
  Role, 
  Badge, 
  ASSESSMENT_CATEGORIES,
  ResponseValue
} from "./src/types";

// Initialize express app
const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side in-memory store initialized from mock data
let users: User[] = [...MOCK_USERS];
let assessments: SupplierAssessment[] = [...MOCK_ASSESSMENTS];
let currentUser: User | null = null; // Simulated state

// Helper code to initialize Gemini safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI:", err);
    return null;
  }
};

// Compute compliance score and risk scores mathematically based on the question weights and response values
function computeAssessmentScores(responses: ResponseValue[]): {
  progress: number;
  overallScore: number;
  priceRisk: number;
  supplyRisk: number;
  technicalRisk: number;
  creativeRisk: number;
  qualityRisk: number;
} {
  const answeredIds = new Set(responses.map(r => r.questionId));
  const totalQuestionsList = QUESTION_BANK;
  
  // Calculate raw progress percentage
  const progress = Math.round((answeredIds.size / totalQuestionsList.length) * 100);

  // Categories Accumulators
  const categories = {
    A: { score: 0, max: 0, weight: 5 },
    B: { score: 0, max: 0, weight: 15 },
    C: { score: 0, max: 0, weight: 25 },
    D: { score: 0, max: 0, weight: 25 },
    E: { score: 0, max: 0, weight: 15 },
    F: { score: 0, max: 0, weight: 15 }
  };

  for (const q of totalQuestionsList) {
    const userResp = responses.find(r => r.questionId === q.id);
    let pts = 0; // 0 to 3 points
    
    if (userResp !== undefined) {
      const selectedVal = userResp.value;
      const optIdx = q.options.indexOf(selectedVal);
      if (optIdx !== -1) {
        const numOptions = q.options.length;
        if (numOptions === 2) {
          pts = optIdx === 0 ? 3 : 0;
        } else if (numOptions === 3) {
          pts = optIdx === 0 ? 3 : (optIdx === 1 ? 1 : 0);
        } else {
          pts = 3 - Math.round((3 * optIdx) / (numOptions - 1));
        }
      }
    } else {
      pts = 0; // Unanswered questions score 0
    }

    const catId = q.categoryId as keyof typeof categories;
    if (categories[catId]) {
      categories[catId].score += pts * q.weight;
      categories[catId].max += 3 * q.weight;
    }
  }

  // Normalize category scores to percentage
  const getCatPct = (catId: keyof typeof categories) => {
    const cat = categories[catId];
    return cat.max > 0 ? (cat.score / cat.max) * 100 : 0;
  };

  const pctA = getCatPct('A');
  const pctB = getCatPct('B');
  const pctC = getCatPct('C');
  const pctD = getCatPct('D');
  const pctE = getCatPct('E');
  const pctF = getCatPct('F');

  // Overall Score % corresponds to the weighted category score distribution
  const overallScore = Math.round(
    (pctA * 0.05) +
    (pctB * 0.15) +
    (pctC * 0.25) +
    (pctD * 0.25) +
    (pctE * 0.15) +
    (pctF * 0.15)
  );

  // Convert compliance percentage into Threat Risk levels where higher is higher threat (100 - compliance)
  const priceRisk = Math.max(0, Math.round(100 - pctA));
  const supplyRisk = Math.max(0, Math.round(100 - pctB));
  const technicalRisk = Math.max(0, Math.round(100 - (pctC + pctD) / 2));
  const creativeRisk = Math.max(0, Math.round(100 - pctE));
  const qualityRisk = Math.max(0, Math.round(100 - pctF));

  return {
    progress,
    overallScore,
    priceRisk,
    supplyRisk,
    technicalRisk,
    creativeRisk,
    qualityRisk
  };
}

// REST endpoints API
app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/auth/register", (req, res) => {
  const { email, role, name, companyName, companyDescription, companyWebsite, category, location } = req.body;
  if (!email || !role || !name) {
    return res.status(400).json({ error: "Missing required registration parameters." });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "User with this email already registered." });
  }

  const newUser: User = {
    id: `vendor_${Date.now()}`,
    email: email.toLowerCase(),
    role: role as Role,
    name,
    companyName: companyName || name,
    companyDescription: companyDescription || "Supplier registered on Niyaan Source.",
    companyWebsite: companyWebsite || "",
    category: category || "MRO & Spare Parts Management",
    location: location || "Global",
    avatarUrl: `https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80`
  };

  users.push(newUser);
  currentUser = newUser;

  // Initialize companion assessment if Supplier
  if (role === 'SUPPLIER') {
    const newAssessment: SupplierAssessment = {
      id: `as_${Date.now()}`,
      userId: newUser.id,
      companyName: newUser.companyName || newUser.name,
      status: 'NOT_STARTED',
      responses: [],
      progress: 0,
      overallScore: 0,
      riskScores: { priceRisk: 50, supplyRisk: 50, technicalRisk: 50, creativeRisk: 50, qualityRisk: 50 },
      riskSummaries: {
        priceRiskSummary: "Self-assessment pending. Take questionnaire to unlock.",
        supplyRiskSummary: "Self-assessment pending. Take questionnaire to unlock.",
        technicalRiskSummary: "Self-assessment pending. Take questionnaire to unlock.",
        creativeRiskSummary: "Self-assessment pending. Take questionnaire to unlock.",
        qualityRiskSummary: "Self-assessment pending. Take questionnaire to unlock."
      },
      badge: null
    };
    assessments.push(newAssessment);
  }

  res.json({ success: true, user: newUser });
});

app.post("/api/auth/login", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Please enter your registered email address." });
  }

  const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!matched) {
    return res.status(404).json({ error: "Email target not registered. Create an account to begin." });
  }

  currentUser = matched;
  res.json({ success: true, user: matched });
});

app.get("/api/auth/me", (req, res) => {
  res.json({ user: currentUser });
});

app.post("/api/auth/logout", (req, res) => {
  currentUser = null;
  res.json({ success: true });
});

// Impersonate endpoint to instantly switch views/roles in UI
app.post("/api/auth/impersonate", (req, res) => {
  const { userId } = req.body;
  const matched = users.find(u => u.id === userId);
  if (matched) {
    currentUser = matched;
    res.json({ success: true, user: matched });
  } else {
    res.status(404).json({ error: "User identity fallback not found." });
  }
});

// Get all assessments (buyers/admin view)
app.get("/api/assessments", (req, res) => {
  res.json(assessments);
});

// Save or submit supplier assessment response
app.post("/api/assessments/save", (req, res) => {
  const { userId, responses, submit } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "No userId identified for saving responses." });
  }

  let assessment = assessments.find(a => a.userId === userId);
  
  // Find associated supplier details
  const assocUser = users.find(u => u.id === userId);
  const companyName = assocUser ? (assocUser.companyName || assocUser.name) : "Unknown Supplier";

  if (!assessment) {
    assessment = {
      id: `as_${Date.now()}`,
      userId,
      companyName,
      status: 'NOT_STARTED',
      responses: [],
      progress: 0,
      overallScore: 0,
      riskScores: { priceRisk: 50, supplyRisk: 50, technicalRisk: 50, creativeRisk: 50, qualityRisk: 50 },
      riskSummaries: {
        priceRiskSummary: "Awaiting calculation of price metrics.",
        supplyRiskSummary: "Awaiting calculation of logistics metrics.",
        technicalRiskSummary: "Awaiting calculation of technical metrics.",
        creativeRiskSummary: "Awaiting calculation of creative metrics.",
        qualityRiskSummary: "Awaiting calculation of quality metrics."
      },
      badge: null
    };
    assessments.push(assessment);
  }

  // Update responses list
  assessment.responses = responses;
  
  // Calculate scores
  const scoreResults = computeAssessmentScores(responses);
  assessment.progress = scoreResults.progress;
  assessment.overallScore = scoreResults.overallScore;
  assessment.riskScores = {
    priceRisk: scoreResults.priceRisk,
    supplyRisk: scoreResults.supplyRisk,
    technicalRisk: scoreResults.technicalRisk,
    creativeRisk: scoreResults.creativeRisk,
    qualityRisk: scoreResults.qualityRisk
  };

  // State statuses
  if (submit) {
    assessment.status = 'SUBMITTED';
    assessment.submittedAt = new Date().toISOString();
  } else {
    assessment.status = 'DRAFT';
  }

  res.json({ success: true, assessment });
});

// Admin Review / Verification Actions
app.post("/api/assessments/review", async (req, res) => {
  const { assessmentId, status, feedback, reviewedBy } = req.body;
  if (!assessmentId || !status) {
    return res.status(400).json({ error: "Missing assessmentId or review status target." });
  }

  const assess = assessments.find(a => a.id === assessmentId);
  if (!assess) {
    return res.status(404).json({ error: "Assessment sheet not found." });
  }

  assess.status = status; // APPROVED or REJECTED
  assess.feedback = feedback || "";
  assess.reviewedBy = reviewedBy || "Admin Team";
  assess.approvedAt = new Date().toISOString();

  // If approved, attach proper badges
  if (status === 'APPROVED') {
    if (assess.overallScore >= 90) {
      assess.badge = 'GOLD';
    } else if (assess.overallScore >= 75) {
      assess.badge = 'SILVER';
    } else {
      assess.badge = 'BRONZE';
    }
  } else {
    assess.badge = null;
  }

  res.json({ success: true, assessment: assess });
});

// Dynamic AI Risk summaries generation utilizing process.env.GEMINI_API_KEY
app.post("/api/assessments/generate-ai-summaries", async (req, res) => {
  const { assessmentId } = req.body;
  if (!assessmentId) {
    return res.status(400).json({ error: "Missing Target Assessment ID for AI Synthesis" });
  }

  const assess = assessments.find(a => a.id === assessmentId);
  if (!assess) {
    return res.status(404).json({ error: "Assessment not found" });
  }

  // Collate supplier context and response text
  const userResponsesText = assess.responses.map(resp => {
    const q = QUESTION_BANK.find(qb => qb.id === resp.questionId);
    if (!q) return "";
    return `[Category: ${q.categoryId}] Question: ${q.text} -> Supplier Answer: "${resp.value}"`;
  }).filter(Boolean).join("\n");

  const supplier = users.find(u => u.id === assess.userId);
  const companyProfileText = supplier ? `
Company Name: ${supplier.companyName}
Description: ${supplier.companyDescription}
Primary Industry Category: ${supplier.category}
Location: ${supplier.location}
` : assess.companyName;

  const prompt = `You are a professional industrial supply-chain senior risk analyst. 
Analyze the following self-assessment questionnaire replies from the supplier "${assess.companyName}" (scored ${assess.overallScore}/100 total safety/compliance).
Generate five distinct textual assessments. Each textual assessment MUST be exactly 3 to 4 lines of professional, insights-oriented review:

1. **PRICE RISK ANALYSIS**: (Evaluating pricing safeguards, insolvency hazards, and auditing availability. Risk calculated mathematically at: ${assess.riskScores.priceRisk}/100).
2. **SUPPLY RISK ANALYSIS**: (Evaluating logistics, lead times, warehouses, and OTIF records. Risk calculated mathematically at: ${assess.riskScores.supplyRisk}/100).
3. **TECHNICAL RISK ANALYSIS**: (Evaluating electrical, mechanical certs, and design tooling. Risk calculated mathematically at: ${assess.riskScores.technicalRisk}/100).
4. **CREATIVE RISK ANALYSIS**: (Evaluating design capacities, prints, and brand compliance. Risk calculated mathematically at: ${assess.riskScores.creativeRisk}/100).
5. **QUALITY RISK ANALYSIS**: (Evaluating ISO compliance, lot-traceability, and ethical code alignment. Risk calculated mathematically at: ${assess.riskScores.qualityRisk}/100).

Return your output EXACTLY as a JSON object of this TypeScript interface format:
{
  "priceRiskSummary": "exactly 3-4 lines of strategic advisory on pricing risk parameters...",
  "supplyRiskSummary": "exactly 3-4 lines of strategic logistics and geopolitics continuity review...",
  "technicalRiskSummary": "exactly 3-4 lines explaining electrical/mech compliance and CAD tooling capabilities...",
  "creativeRiskSummary": "exactly 3-4 lines on design, print parameters and brand compliance...",
  "qualityRiskSummary": "exactly 3-4 lines explaining ISO metrics, defects and quality frameworks..."
}

Here is the Supplier profile to analyze:
${companyProfileText}

Their Questionnaire Answers:
${userResponsesText || "No responses provided yet."}

Return only raw parseable JSON. Do not wrap in markdown \`\`\`json blocks. Do not add header decorations.`;

  const client = getGeminiClient();
  if (client) {
    try {
      console.log(`Analyzing risk via Gemini-3.5-flash for: ${assess.companyName}`);
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });

      const rawText = response.text || "";
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(rawText.trim());
      } catch (e) {
        // Strip out code backticks if it ignored our format instruction
        const cleanJsonStr = rawText
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        jsonResponse = JSON.parse(cleanJsonStr);
      }

      if (
        jsonResponse.priceRiskSummary && 
        jsonResponse.supplyRiskSummary && 
        jsonResponse.technicalRiskSummary &&
        jsonResponse.creativeRiskSummary &&
        jsonResponse.qualityRiskSummary
      ) {
        assess.riskSummaries = {
          priceRiskSummary: jsonResponse.priceRiskSummary,
          supplyRiskSummary: jsonResponse.supplyRiskSummary,
          technicalRiskSummary: jsonResponse.technicalRiskSummary,
          creativeRiskSummary: jsonResponse.creativeRiskSummary,
          qualityRiskSummary: jsonResponse.qualityRiskSummary
        };
        return res.json({ success: true, summaries: assess.riskSummaries, aiGenerated: true });
      }
    } catch (err) {
      console.error("Gemini Generation failed, backing off to calculation rules matrix:", err);
    }
  }

  // Robust default fallback generation based on math scores if keys are missing
  console.log("Using rule-based algorithm for risk review headers...");
  
  const pRisk = assess.riskScores.priceRisk;
  const sRisk = assess.riskScores.supplyRisk;
  const tRisk = assess.riskScores.technicalRisk;
  const cRisk = assess.riskScores.creativeRisk;
  const qRisk = assess.riskScores.qualityRisk;

  assess.riskSummaries = {
    priceRiskSummary: `Financial Price Risk stands at ${pRisk}%. ${
      pRisk > 60 
        ? "The supplier exhibits higher corporate risk due to audited statements or legal litigation history."
        : pRisk > 30
          ? "Moderate contract pricing exposure. Standard fiscal buffers are active with minor reference disclosures."
          : "Superb commercial buffers. Complete audited accounts, low litigation records, and strong references."
    }`,
    supplyRiskSummary: `Logistics Supply Risk stands at ${sRisk}%. ${
      sRisk > 60
        ? "Narrow inventory visibilities and single-point warehouse operations introduce severe lead time risks under high traffic."
        : sRisk > 30
          ? "Acceptable supply chains. Standard lead times average 3-7 days with standard delivery controls."
          : "Exceptional distribution safety. Backed by multi-warehouse nodes, rapid <24hr stock dispatches, and high OTIF scores."
    }`,
    technicalRiskSummary: `MRO & Technical Risk stands at ${tRisk}%. ${
      tRisk > 60
        ? "Limited custom engineering certifications, lacking material certifications or 3D prototyping models."
        : tRisk > 30
          ? "Standard technical compliance. Equipped with common machinery and mechanical reference tools."
          : "High-grade technical capability. Certified CE/ASME compliance, material lot traces, and custom fabrication desks."
    }`,
    creativeRiskSummary: `Marketing Creative Risk stands at ${cRisk}%. ${
      cRisk > 60
        ? "Externalized graphic works, slow turnaround cycles with no structured asset management portal."
        : cRisk > 30
          ? "Equipped print shops with standard brand review pathways."
          : "Premium creatives, in-house high-volume offset nodes, brand certification protocols, and digital order systems."
    }`,
    qualityRiskSummary: `Quality Compliance Risk stands at ${qRisk}%. ${
      qRisk > 60
        ? "Lacks certified ISO 9001 registration, leading to high potential defect PPM metrics and inspection burdens."
        : qRisk > 30
          ? "Adequate compliance controls. Standard conformance certs are issued alongside major freight cycles."
          : "Gold Standard quality. 100% ISO certified, meticulous batch tracking, and zero corrective CAPA deviations."
    }`
  };

  res.json({ success: true, summaries: assess.riskSummaries, aiGenerated: false });
});


// Integrate Vite as Middleware for standard client hot reloading or production asset bundles
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Niyaan Source server running on port ${PORT}`);
  });
}

startServer();
