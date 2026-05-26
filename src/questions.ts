import { Question, AssessmentCategory } from "./types";

export const ASSESSMENT_CATEGORIES: AssessmentCategory[] = [
  { id: "A", name: "Corporate & Commercial", description: "MRO, Spare Parts, Electrical, Mechanical, Civil & Marketing Suppliers", icon: "Building2" },
  { id: "B", name: "Supply Chain & Logistics", description: "Delivery reliability, MOQ, lead times, warehouses and shipment tracking", icon: "Factory" },
  { id: "C", name: "MRO & Spare Parts Management", description: "MRO Catalog, technical support, bundling, spare parts, and warranty rules", icon: "Briefcase" },
  { id: "D", name: "Technical Capability", description: "Electrical, mechanical, civil testing certifications and instrumentation", icon: "Wrench" }, // Fallback to wrench or standard icon
  { id: "E", name: "Marketing & Creative Services", description: "In-house design, printing capabilities, color management, and campaign management", icon: "Lightbulb" },
  { id: "F", name: "Quality & Compliance", description: "ISO 9001 certifications, material inspections, traceability, and ethical sourcing", icon: "CheckSquare" }
];

export const QUESTION_BANK: Question[] = [
  // --- Category A: Corporate & Commercial (6 questions) ---
  {
    id: "A1",
    categoryId: "A",
    text: "Is the entity legally registered with valid operating licenses?",
    type: "multiple_choice",
    options: ["Yes", "Partial", "No"],
    weight: 3,
    evidenceRequired: "Business License"
  },
  {
    id: "A2",
    categoryId: "A",
    text: "Years in operation for current legal entity?",
    type: "multiple_choice",
    options: [">10Y", "5-10Y", "2-5Y", "<2Y"],
    weight: 2
  },
  {
    id: "A3",
    categoryId: "A",
    text: "Any material litigation or insolvency proceedings in past 3 years?",
    type: "multiple_choice",
    options: ["No", "Under Appeal", "Yes"],
    weight: 3,
    evidenceRequired: "Explanation"
  },
  {
    id: "A4",
    categoryId: "A",
    text: "Can provide trade references from 3 similar-scale customers?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 2,
    evidenceRequired: "References"
  },
  {
    id: "A5",
    categoryId: "A",
    text: "Financial statements audited by recognized firm?",
    type: "multiple_choice",
    options: ["Yes", "Internal Only", "No"],
    weight: 3,
    evidenceRequired: "Audit Report"
  },
  {
    id: "A6",
    categoryId: "A",
    text: "Credit rating or bank reference available?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 2,
    evidenceRequired: "Bank Letter"
  },

  // --- Category B: Supply Chain & Logistics (15 questions) ---
  {
    id: "B1",
    categoryId: "B",
    text: "Minimum Order Quantity (MOQ) flexibility for indirect materials?",
    type: "multiple_choice",
    options: ["No MOQ", "<1K", "<5K", "<10K", ">10K"],
    weight: 2,
    evidenceRequired: "Terms Sheet"
  },
  {
    id: "B2",
    categoryId: "B",
    text: "Standard lead time for stocked MRO items?",
    type: "multiple_choice",
    options: ["<24hrs", "1-3days", "3-7days", ">7days"],
    weight: 3,
    evidenceRequired: "Lead Time Chart"
  },
  {
    id: "B3",
    categoryId: "B",
    text: "Emergency delivery capability for critical spares?",
    type: "multiple_choice",
    options: ["24hrs", "48hrs", "72hrs", ">72hrs"],
    weight: 3,
    evidenceRequired: "Emergency Policy"
  },
  {
    id: "B4",
    categoryId: "B",
    text: "On-Time-In-Full (OTIF) performance over last 12 months?",
    type: "multiple_choice",
    options: [">98%", "95-98%", "90-95%", "<90%"],
    weight: 3,
    evidenceRequired: "OTIF Report"
  },
  {
    id: "B5",
    categoryId: "B",
    text: "Real-time inventory visibility via portal/EDI/API?",
    type: "multiple_choice",
    options: ["Yes", "Partial", "No"],
    weight: 3,
    evidenceRequired: "System Demo"
  },
  {
    id: "B6",
    categoryId: "B",
    text: "Can manage Vendor Managed Inventory (VMI) for MRO items?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 2,
    evidenceRequired: "VMI Proposal"
  },
  {
    id: "B7",
    categoryId: "B",
    text: "Multiple warehouse locations for faster delivery?",
    type: "multiple_choice",
    options: [">5", "3-5", "1-2", "None"],
    weight: 2,
    evidenceRequired: "Location List"
  },
  {
    id: "B8",
    categoryId: "B",
    text: "Return policy for incorrect/defective items?",
    type: "multiple_choice",
    options: ["Full", "Partial", "Store Credit", "No"],
    weight: 2,
    evidenceRequired: "Return Policy"
  },
  {
    id: "B9",
    categoryId: "B",
    text: "Packing and labeling comply with industry standards?",
    type: "multiple_choice",
    options: ["Yes", "Partial", "No"],
    weight: 2,
    evidenceRequired: "Sample Photos"
  },
  {
    id: "B10",
    categoryId: "B",
    text: "Hazardous materials handling certification?",
    type: "multiple_choice",
    options: ["Yes", "No", "NA"],
    weight: 2,
    evidenceRequired: "Certification"
  },
  {
    id: "B11",
    categoryId: "B",
    text: "Cold chain capabilities if required?",
    type: "multiple_choice",
    options: ["Yes", "No", "NA"],
    weight: 2,
    evidenceRequired: "Cold Chain Cert"
  },
  {
    id: "B12",
    categoryId: "B",
    text: "Export/import documentation support?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Sample Docs"
  },
  {
    id: "B13",
    categoryId: "B",
    text: "Order tracking and shipment notifications?",
    type: "multiple_choice",
    options: ["Real-time", "Daily", "Weekly", "None"],
    weight: 2,
    evidenceRequired: "System Demo"
  },
  {
    id: "B14",
    categoryId: "B",
    text: "Payment terms offered?",
    type: "multiple_choice",
    options: ["60days", "45days", "30days", "Advance"],
    weight: 2,
    evidenceRequired: "Payment Terms"
  },
  {
    id: "B15",
    categoryId: "B",
    text: "Dedicated account manager assigned?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 1,
    evidenceRequired: "Contact Details"
  },

  // --- Category C: MRO & Spare Parts Management (20 questions) ---
  {
    id: "C1",
    categoryId: "C",
    text: "Comprehensive MRO catalog with technical specifications?",
    type: "multiple_choice",
    options: ["Full", "Partial", "Limited", "None"],
    weight: 3,
    evidenceRequired: "Catalog Sample"
  },
  {
    id: "C2",
    categoryId: "C",
    text: "Cross-reference capability for OEM part numbers?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 3,
    evidenceRequired: "Cross-Ref Demo"
  },
  {
    id: "C3",
    categoryId: "C",
    text: "Technical support for part selection and compatibility?",
    type: "multiple_choice",
    options: ["24/7", "Business Hours", "Email Only", "None"],
    weight: 3,
    evidenceRequired: "Support Policy"
  },
  {
    id: "C4",
    categoryId: "C",
    text: "Ability to source obsolete or hard-to-find parts?",
    type: "multiple_choice",
    options: ["Yes", "Partial", "No"],
    weight: 3,
    evidenceRequired: "Sourcing Examples"
  },
  {
    id: "C5",
    categoryId: "C",
    text: "Kitting and bundling services for maintenance jobs?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Kitting Sample"
  },
  {
    id: "C6",
    categoryId: "C",
    text: "Preventive maintenance schedule recommendations?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "PM Program"
  },
  {
    id: "C7",
    categoryId: "C",
    text: "Consumables and wear parts identification service?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 2,
    evidenceRequired: "Service Description"
  },
  {
    id: "C8",
    categoryId: "C",
    text: "Stocking agreement for critical spare parts?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 3,
    evidenceRequired: "Agreement Template"
  },
  {
    id: "C9",
    categoryId: "C",
    text: "Parts warranty period?",
    type: "multiple_choice",
    options: [">2years", "1-2years", "6-12months", "<6months"],
    weight: 3,
    evidenceRequired: "Warranty Terms"
  },
  {
    id: "C10",
    categoryId: "C",
    text: "Repair and refurbishment services available?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Service List"
  },
  {
    id: "C11",
    categoryId: "C",
    text: "Equipment calibration services?",
    type: "multiple_choice",
    options: ["Yes", "No", "NA"],
    weight: 2,
    evidenceRequired: "Calibration Cert"
  },
  {
    id: "C12",
    categoryId: "C",
    text: "Safety equipment and PPE compliance certification?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 3,
    evidenceRequired: "Safety Certs"
  },
  {
    id: "C13",
    categoryId: "C",
    text: "Lubricants and chemicals MSDS documentation?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "MSDS Sample"
  },
  {
    id: "C14",
    categoryId: "C",
    text: "Tool and equipment rental services?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 1,
    evidenceRequired: "Rental Catalog"
  },
  {
    id: "C15",
    categoryId: "C",
    text: "Asset tagging and inventory management support?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 2,
    evidenceRequired: "Asset Mgmt Demo"
  },
  {
    id: "C16",
    categoryId: "C",
    text: "Spend analysis and optimization recommendations?",
    type: "multiple_choice",
    options: ["Quarterly", "Annual", "Ad-hoc", "None"],
    weight: 2,
    evidenceRequired: "Sample Report"
  },
  {
    id: "C17",
    categoryId: "C",
    text: "E-procurement catalog integration capability?",
    type: "multiple_choice",
    options: ["Punchout", "API", "Excel", "None"],
    weight: 2,
    evidenceRequired: "Integration Spec"
  },
  {
    id: "C18",
    categoryId: "C",
    text: "Substitute/alternative product recommendations?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Alt Product List"
  },
  {
    id: "C19",
    categoryId: "C",
    text: "Bulk discount structure for volume purchases?",
    type: "multiple_choice",
    options: [">15%", "10-15%", "5-10%", "<5%"],
    weight: 2,
    evidenceRequired: "Price List"
  },
  {
    id: "C20",
    categoryId: "C",
    text: "Consignment stock arrangement available?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 2,
    evidenceRequired: "Consignment Terms"
  },

  // --- Category D: Technical Capability (22 questions) ---
  {
    id: "D1",
    categoryId: "D",
    text: "Electrical components certification (CE/UL/IEC)?",
    type: "multiple_choice",
    options: ["All", "Major", "Partial", "None"],
    weight: 3,
    evidenceRequired: "Certifications"
  },
  {
    id: "D2",
    categoryId: "D",
    text: "Mechanical parts material traceability certificates?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 3,
    evidenceRequired: "Mill Certs"
  },
  {
    id: "D3",
    categoryId: "D",
    text: "Pressure vessel and piping compliance (ASME/API)?",
    type: "multiple_choice",
    options: ["Yes", "No", "NA"],
    weight: 3,
    evidenceRequired: "Compliance Docs"
  },
  {
    id: "D4",
    categoryId: "D",
    text: "In-house engineering support for technical queries?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 3,
    evidenceRequired: "Engineering Profile"
  },
  {
    id: "D5",
    categoryId: "D",
    text: "Custom fabrication capability for special parts?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 3,
    evidenceRequired: "Fabrication Photos"
  },
  {
    id: "D6",
    categoryId: "D",
    text: "3D CAD drawings available for mechanical parts?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "CAD Sample"
  },
  {
    id: "D7",
    categoryId: "D",
    text: "Electrical panel design and assembly services?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 3,
    evidenceRequired: "Panel Photos"
  },
  {
    id: "D8",
    categoryId: "D",
    text: "Civil works material testing certificates?",
    type: "multiple_choice",
    options: ["Full", "Partial", "NA"],
    weight: 2,
    evidenceRequired: "Test Reports"
  },
  {
    id: "D9",
    categoryId: "D",
    text: "HVAC and refrigeration parts availability?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "HVAC Catalog"
  },
  {
    id: "D10",
    categoryId: "D",
    text: "Instrumentation and control components?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 3,
    evidenceRequired: "Instruments List"
  },
  {
    id: "D11",
    categoryId: "D",
    text: "Bearings, seals, and rotating equipment parts?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Bearing Catalog"
  },
  {
    id: "D12",
    categoryId: "D",
    text: "Power transmission components (belts, chains, gears)?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "PT Catalog"
  },
  {
    id: "D13",
    categoryId: "D",
    text: "Pumps, valves, and fluid handling equipment?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 3,
    evidenceRequired: "P&V Catalog"
  },
  {
    id: "D14",
    categoryId: "D",
    text: "Structural steel and civil construction materials?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Steel Catalog"
  },
  {
    id: "D15",
    categoryId: "D",
    text: "Cable, wire, and electrical installation materials?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Cable Catalog"
  },
  {
    id: "D16",
    categoryId: "D",
    text: "Lighting and energy-efficient solutions?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Lighting Catalog"
  },
  {
    id: "D17",
    categoryId: "D",
    text: "Plumbing and sanitary ware products?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Plumbing Catalog"
  },
  {
    id: "D18",
    categoryId: "D",
    text: "Fire protection and safety systems components?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 3,
    evidenceRequired: "Fire Safety Cert"
  },
  {
    id: "D19",
    categoryId: "D",
    text: "Automation and PLC components?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Automation List"
  },
  {
    id: "D20",
    categoryId: "D",
    text: "Testing and measurement equipment?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Test Equipment"
  },
  {
    id: "D21",
    categoryId: "D",
    text: "Welding and cutting supplies?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Welding Catalog"
  },
  {
    id: "D22",
    categoryId: "D",
    text: "Paints, coatings, and surface treatment materials?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Coatings Catalog"
  },

  // --- Category E: Marketing & Creative Services (18 questions) ---
  {
    id: "E1",
    categoryId: "E",
    text: "In-house design capability for marketing materials?",
    type: "multiple_choice",
    options: ["Full", "Partial", "Outsourced", "None"],
    weight: 3,
    evidenceRequired: "Design Portfolio"
  },
  {
    id: "E2",
    categoryId: "E",
    text: "Print production quality certifications (ISO 12647)?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 2,
    evidenceRequired: "Print Cert"
  },
  {
    id: "E3",
    categoryId: "E",
    text: "Digital printing capability for short runs?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 2,
    evidenceRequired: "Digital Print Spec"
  },
  {
    id: "E4",
    categoryId: "E",
    text: "Large format printing (banners, hoardings)?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 3,
    evidenceRequired: "Large Format Sample"
  },
  {
    id: "E5",
    categoryId: "E",
    text: "Variety of substrates available (vinyl, fabric, paper)?",
    type: "multiple_choice",
    options: [">10", "5-10", "2-5", "1"],
    weight: 2,
    evidenceRequired: "Substrate List"
  },
  {
    id: "E6",
    categoryId: "E",
    text: "Color management and proofing services?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 3,
    evidenceRequired: "Color Profile"
  },
  {
    id: "E7",
    categoryId: "E",
    text: "Installation services for outdoor displays?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Installation Photos"
  },
  {
    id: "E8",
    categoryId: "E",
    text: "Pan-India delivery and installation network?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 3,
    evidenceRequired: "Network Map"
  },
  {
    id: "E9",
    categoryId: "E",
    text: "Promotional merchandise and corporate gifting?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Merchandise Catalog"
  },
  {
    id: "E10",
    categoryId: "E",
    text: "Event branding and exhibition stall setup?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Event Portfolio"
  },
  {
    id: "E11",
    categoryId: "E",
    text: "Turnaround time for standard print jobs?",
    type: "multiple_choice",
    options: ["<3days", "3-5days", "5-7days", ">7days"],
    weight: 3,
    evidenceRequired: "TAT Commitment"
  },
  {
    id: "E12",
    categoryId: "E",
    text: "Sustainable/eco-friendly material options?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Eco Options"
  },
  {
    id: "E13",
    categoryId: "E",
    text: "Storage and inventory management for marketing assets?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 2,
    evidenceRequired: "Warehouse Photos"
  },
  {
    id: "E14",
    categoryId: "E",
    text: "Version control and artwork archival system?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 2,
    evidenceRequired: "System Demo"
  },
  {
    id: "E15",
    categoryId: "E",
    text: "Brand guideline compliance verification?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 3,
    evidenceRequired: "Brand Compliance"
  },
  {
    id: "E16",
    categoryId: "E",
    text: "Variable data printing for personalized materials?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 2,
    evidenceRequired: "VDP Sample"
  },
  {
    id: "E17",
    categoryId: "E",
    text: "Online ordering portal for marketing materials?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 2,
    evidenceRequired: "Portal Demo"
  },
  {
    id: "E18",
    categoryId: "E",
    text: "Campaign execution and project management?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "PM Process"
  },

  // --- Category F: Quality & Compliance (14 questions) ---
  {
    id: "F1",
    categoryId: "F",
    text: "ISO 9001 Quality Management System certified?",
    type: "multiple_choice",
    options: ["Yes", "No", "In Progress"],
    weight: 3,
    evidenceRequired: "Certificate"
  },
  {
    id: "F2",
    categoryId: "F",
    text: "Incoming material inspection and testing?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 3,
    evidenceRequired: "Inspection Report"
  },
  {
    id: "F3",
    categoryId: "F",
    text: "Certificate of Conformance (CoC) provided with shipments?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 3,
    evidenceRequired: "CoC Sample"
  },
  {
    id: "F4",
    categoryId: "F",
    text: "Material batch traceability and lot numbers?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 3,
    evidenceRequired: "Traceability Demo"
  },
  {
    id: "F5",
    categoryId: "F",
    text: "Defective material return and replacement policy?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Return Policy"
  },
  {
    id: "F6",
    categoryId: "F",
    text: "Product recall procedure documented?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 2,
    evidenceRequired: "Recall Procedure"
  },
  {
    id: "F7",
    categoryId: "F",
    text: "Supplier quality scorecard and performance metrics?",
    type: "multiple_choice",
    options: ["Monthly", "Quarterly", "Annual", "None"],
    weight: 2,
    evidenceRequired: "Scorecard Sample"
  },
  {
    id: "F8",
    categoryId: "F",
    text: "Anti-counterfeiting measures for branded products?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 3,
    evidenceRequired: "Anti-Counterfeit"
  },
  {
    id: "F9",
    categoryId: "F",
    text: "Conflict minerals compliance statement?",
    type: "multiple_choice",
    options: ["Yes", "No", "NA"],
    weight: 2,
    evidenceRequired: "Conflict Minerals"
  },
  {
    id: "F10",
    categoryId: "F",
    text: "RoHS/REACH compliance for electrical/electronic items?",
    type: "multiple_choice",
    options: ["Full", "Partial", "NA"],
    weight: 2,
    evidenceRequired: "RoHS Cert"
  },
  {
    id: "F11",
    categoryId: "F",
    text: "Supplier code of conduct and ethical sourcing?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 2,
    evidenceRequired: "Code of Conduct"
  },
  {
    id: "F12",
    categoryId: "F",
    text: "Environmental and sustainability certifications?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "Sustainability Certs"
  },
  {
    id: "F13",
    categoryId: "F",
    text: "Data protection and confidentiality agreements?",
    type: "multiple_choice",
    options: ["Yes", "No"],
    weight: 2,
    evidenceRequired: "NDA Template"
  },
  {
    id: "F14",
    categoryId: "F",
    text: "Corrective action process for quality issues?",
    type: "multiple_choice",
    options: ["Full", "Partial", "None"],
    weight: 2,
    evidenceRequired: "CAPA Process"
  }
];
