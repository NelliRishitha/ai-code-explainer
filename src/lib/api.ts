import { supabase } from "@/integrations/supabase/client";

export type Feature = "explain" | "debug" | "complexity" | "convert" | "chat" | "practice";

export interface AnalyzeRequest {
  code: string;
  language: string;
  feature: Feature;
  userPrompt?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  feature: string;
  data: {
    explanation?: string;
    summary?: string;
    suggestions?: string;
    output?: string;
  };
  error?: string;
}

export async function analyzeCode(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  const { data, error } = await supabase.functions.invoke("analyze", {
    body: request,
  });

  if (error) {
    throw new Error(error.message || "Failed to analyze code");
  }

  if (!data.success) {
    throw new Error(data.error || "Analysis failed");
  }

  return data as AnalyzeResponse;
}
