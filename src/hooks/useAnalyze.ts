import { useState, useCallback } from "react";
import { toast } from "sonner";
import { analyzeCode, type Feature, type AnalyzeResponse } from "@/lib/api";

export function useAnalyze() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<Feature>("explain");

  const analyze = useCallback(
    async (code: string, language: string, feature: Feature, userPrompt?: string) => {
      if (!code.trim()) {
        toast.error("Please enter some code first.");
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);
      setActiveFeature(feature);

      try {
        const response = await analyzeCode({ code, language, feature, userPrompt });
        setResult(response.data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Something went wrong";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, result, error, activeFeature, analyze };
}
