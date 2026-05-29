export type Role = 'SUPPLIER' | 'BUYER' | 'ADMIN' | 'GUEST';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  companyName?: string;
  companyDescription?: string;
  companyWebsite?: string;
  category?: string; // Sourced categories matching assessment framework names
  location?: string;
  avatarUrl?: string;
}

export type QuestionType = 'boolean' | 'multiple_choice' | 'numeric' | 'text' | 'file';

export interface Question {
  id: string; // e.g. "A1", "B1" etc.
  categoryId: string; // "A" | "B" | "C" | "D" | "E" | "F"
  text: string;
  type: QuestionType;
  options: string[]; // List of dropdown options (ordered from best to worst)
  weight: number; // 1, 2, or 3
  evidenceRequired?: string; // Optional indicator of required audit trail documents
}

export interface AssessmentCategory {
  id: string; // "A" | "B" | "C" | "D" | "E" | "F"
  name: string;
  description: string;
  icon: string; // lucide icon identifier
}

export interface ResponseValue {
  questionId: string;
  value: string; // stores selected options text
  fileName?: string;
}

export type AssessmentStatus = 'NOT_STARTED' | 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export type Badge = 'GOLD' | 'SILVER' | 'BRONZE';

export interface RiskScores {
  priceRisk: number;     // Pillar 1: Price & Financial Risk
  supplyRisk: number;    // Pillar 2: Supply Chain & Logistics Risk
  technicalRisk: number; // Pillar 3: MRO & Technical Capability Risk
  creativeRisk: number;  // Pillar 4: Marketing & Creative Services Risk
  qualityRisk: number;   // Pillar 5: Quality & Compliance Risk
}

export interface RiskSummaries {
  priceRiskSummary: string;
  supplyRiskSummary: string;
  technicalRiskSummary: string;
  creativeRiskSummary: string;
  qualityRiskSummary: string;
}

export interface SupplierAssessment {
  id: string;
  userId: string;
  companyName: string;
  status: AssessmentStatus;
  responses: ResponseValue[];
  progress: number; // percentage
  overallScore: number; // calculated dynamically (0-100 score rollup)
  riskScores: RiskScores;
  riskSummaries: RiskSummaries;
  badge: Badge | null;
  submittedAt?: string;
  approvedAt?: string;
  reviewedBy?: string;
  feedback?: string;
}

// Re-export Assessment Question definitions from Questions data file
import { ASSESSMENT_CATEGORIES as q_cats, QUESTION_BANK as q_bank } from "./questions";
export const ASSESSMENT_CATEGORIES = q_cats;
export const QUESTION_BANK = q_bank;

// Seeded Supplier details matching standard categories
export const MOCK_USERS: User[] = [
  {
    id: 'vendor_1',
    email: 'contact@vishwamitra-india.com',
    role: 'SUPPLIER',
    name: 'Vishwamitra Semiconductors Ltd',
    companyName: 'Vishwamitra Semiconductors Ltd',
    companyDescription: 'Pioneer in custom integrated circuit packaging and specialist cleanroom spares. Serving fabrication clients across India and globally.',
    companyWebsite: 'https://www.vishwamitra-india.com',
    category: 'MRO & Spare Parts Management',
    location: 'Bangalore, Karnataka, India',
    avatarUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'vendor_2',
    email: 'info@bharatalloys.com',
    role: 'SUPPLIER',
    name: 'Bharat Speciality Alloys',
    companyName: 'Bharat Speciality Alloys',
    companyDescription: 'Eco-certified smelters of specialized castings, mechanical shafts, and high-pressure structural steel products from Bharat.',
    companyWebsite: 'https://www.bharatalloys.com',
    category: 'Technical Capability',
    location: 'Mumbai, Maharashtra, India',
    avatarUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'vendor_3',
    email: 'sales@aarambhpolymers.com',
    role: 'SUPPLIER',
    name: 'Aarambh Polymers India',
    companyName: 'Aarambh Polymers India',
    companyDescription: 'Developer of sustainable packaging seals, organic substrates, and custom bio-degradable printed canvases for Indian markets.',
    companyWebsite: 'https://www.aarambhpolymers.com',
    category: 'Marketing & Creative Services',
    location: 'Hyderabad, Telangana, India',
    avatarUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'buyer_1',
    email: 'procurement@indianretail.com',
    role: 'BUYER',
    name: 'Priya Sharma',
    companyName: 'Bharat Enterprise Ltd (Global Sourcing)',
  },
  {
    id: 'admin_1',
    email: 'admin@niyaansource.com',
    role: 'ADMIN',
    name: 'Niyaan Admin Team'
  }
];

// Helper to pre-populate mock questionnaire answers
function makePrepopulatedAnswers(level: 'EXCELLENT' | 'GOOD' | 'CONDITIONAL'): ResponseValue[] {
  const result: ResponseValue[] = [];
  for (const q of QUESTION_BANK) {
    let optIndex = 0;
    if (level === 'GOOD') {
      optIndex = Math.min(q.options.length - 1, q.id.charCodeAt(0) % 2); // alternates between index 0 and 1
    } else if (level === 'CONDITIONAL') {
      optIndex = Math.min(q.options.length - 1, q.id.charCodeAt(0) % 3); // alternates 0, 1, 2
    }
    result.push({
      questionId: q.id,
      value: q.options[optIndex]
    });
  }
  return result;
}

export const MOCK_ASSESSMENTS: SupplierAssessment[] = [
  {
    id: 'as_1',
    userId: 'vendor_1',
    companyName: 'Vishwamitra Semiconductors Ltd',
    status: 'APPROVED',
    progress: 100,
    overallScore: 94,
    riskScores: {
      priceRisk: 8,
      supplyRisk: 12,
      technicalRisk: 6,
      creativeRisk: 14,
      qualityRisk: 5
    },
    riskSummaries: {
      priceRiskSummary: 'Excellent. Complete tax compliance, multi-factor trade credit registers, and transparent audit reports secure their low financial price threat status.',
      supplyRiskSummary: 'Favorable logistics continuity. Standardizes sub-24hr spare distributions and on-time-in-full delivery (OTIF) margins greater than 98%.',
      technicalRiskSummary: 'Premier technical capability. Verified CE compliance, ASME pressure pipeline certificates and extensive in-house engineering support desks are fully active.',
      creativeRiskSummary: 'Competent. Keeps solid backup graphics rendering portals and robust ISO certifications.',
      qualityRiskSummary: 'Flawless quality systems. Maintains complete material lot traceability, comprehensive pre-receipt raw checks and 100% RoHS audit satisfaction.'
    },
    badge: 'GOLD',
    submittedAt: '2026-04-12T08:30:00Z',
    approvedAt: '2026-04-15T14:45:00Z',
    reviewedBy: 'Niyaan Admin Team',
    responses: makePrepopulatedAnswers('EXCELLENT')
  },
  {
    id: 'as_2',
    userId: 'vendor_2',
    companyName: 'Bharat Speciality Alloys',
    status: 'APPROVED',
    progress: 100,
    overallScore: 82,
    riskScores: {
      priceRisk: 25,
      supplyRisk: 18,
      technicalRisk: 22,
      creativeRisk: 30,
      qualityRisk: 24
    },
    riskSummaries: {
      priceRiskSummary: 'Moderate price variance risk. Offers standard payment modes but energy input grids introduce variable indexing pressures.',
      supplyRiskSummary: 'Highly secure routing with multiple warehouse assets. Standard lead time stands comfortable at 1-3 days.',
      technicalRiskSummary: 'Substantial competence. Backed by extensive physical metallurgical and structural testing labs.',
      creativeRiskSummary: 'Sufficient capability. Covers simple localized signage and outdoor display arrangements.',
      qualityRiskSummary: 'Consistent. Active ISO 9001 certified with standard defect checks, suitable for bulk secondary castings.'
    },
    badge: 'SILVER',
    submittedAt: '2026-05-10T10:15:00Z',
    approvedAt: '2026-05-14T09:00:00Z',
    reviewedBy: 'Niyaan Admin Team',
    responses: makePrepopulatedAnswers('GOOD')
  },
  {
    id: 'as_3',
    userId: 'vendor_3',
    companyName: 'Aarambh Polymers India',
    status: 'SUBMITTED',
    progress: 100,
    overallScore: 61,
    riskScores: {
      priceRisk: 40,
      supplyRisk: 38,
      technicalRisk: 42,
      creativeRisk: 35,
      qualityRisk: 38
    },
    riskSummaries: {
      priceRiskSummary: 'Higher financial threat. Restricted liquidity buffers with rigid prepayment demands for customized chemical polymers.',
      supplyRiskSummary: 'Increased single-point dispatch risks. Standard lead time is 5-7 days due to agricultural bio-starch feedstock supply dependencies.',
      technicalRiskSummary: 'Basic engineering capability. Restricted tooling assets, custom mold orders require significant external subcontractor coordination.',
      creativeRiskSummary: 'Capable. Solid variable digital printing and brand compliance pipelines for bio-degradable marketing packages.',
      qualityRiskSummary: 'Minor compliance gaps. RoHS cert is standard but batch-traceability registers are not fully integrated to the primary catalog ERP.'
    },
    badge: 'BRONZE',
    submittedAt: '2026-05-24T11:45:00Z',
    responses: makePrepopulatedAnswers('CONDITIONAL')
  }
];
