import { User, SupplierAssessment, ResponseValue } from "./types";

export async function fetchUsers(): Promise<User[]> {
  try {
    const res = await fetch("/api/users");
    if (!res.ok) throw new Error("Failed to load users");
    return await res.json();
  } catch (err) {
    console.warn("API offline, falling back directly");
    return [];
  }
}

export async function registerUser(payload: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || "Failed to register" };
    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, error: "Network communication error" };
  }
}

export async function loginUser(email: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || "Failed to login" };
    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, error: "Network communication error" };
  }
}

export async function logoutUser(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/me");
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

export async function impersonateUser(userId: string): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

export async function fetchAssessments(): Promise<SupplierAssessment[]> {
  try {
    const res = await fetch("/api/assessments");
    if (!res.ok) throw new Error("Failed to load assessments");
    return await res.json();
  } catch (err) {
    console.warn("API offline, falling back directly");
    return [];
  }
}

export async function saveAssessment(
  userId: string, 
  responses: ResponseValue[], 
  submit: boolean = false
): Promise<{ success: boolean; assessment?: SupplierAssessment; error?: string }> {
  try {
    const res = await fetch("/api/assessments/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, responses, submit })
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || "Failed to save assessment" };
    return { success: true, assessment: data.assessment };
  } catch (err) {
    return { success: false, error: "Network connection error" };
  }
}

export async function submitReview(payload: {
  assessmentId: string;
  status: 'APPROVED' | 'REJECTED';
  feedback?: string;
  reviewedBy?: string;
}): Promise<{ success: boolean; assessment?: SupplierAssessment; error?: string }> {
  try {
    const res = await fetch("/api/assessments/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || "Failed to submit review" };
    return { success: true, assessment: data.assessment };
  } catch (err) {
    return { success: false, error: "Network connection error" };
  }
}

export async function generateAiSummaries(assessmentId: string): Promise<{
  success: boolean;
  summaries?: { 
    priceRiskSummary: string; 
    supplyRiskSummary: string; 
    technicalRiskSummary: string;
    creativeRiskSummary: string;
    qualityRiskSummary: string;
  };
  aiGenerated?: boolean;
  error?: string;
}> {
  try {
    const res = await fetch("/api/assessments/generate-ai-summaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessmentId })
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || "Failed to generate risk reports" };
    return { 
      success: true, 
      summaries: data.summaries, 
      aiGenerated: data.aiGenerated 
    };
  } catch (err) {
    return { success: false, error: "Network connection error" };
  }
}
