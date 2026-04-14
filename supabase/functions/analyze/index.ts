import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildPrompt(feature: string, code: string, language: string, userPrompt?: string): string {
  switch (feature) {
    case "explain":
      return `You are a code teaching assistant. Explain this ${language} code line by line, then provide a simple summary.

Respond in this exact JSON format:
{
  "explanation": "Line-by-line explanation here",
  "summary": "Simple summary here"
}

Code:
\`\`\`${language}
${code}
\`\`\``;

    case "debug":
      return `You are a debugging expert. Analyze this ${language} code for errors, bugs, and issues. Provide the fixed code and explain what was wrong.

Respond in this exact JSON format:
{
  "explanation": "What errors/issues were found",
  "output": "The corrected code here",
  "suggestions": "Additional improvement suggestions"
}

Code:
\`\`\`${language}
${code}
\`\`\``;

    case "complexity":
      return `You are a computer science professor. Analyze the time and space complexity of this ${language} code.

Respond in this exact JSON format:
{
  "explanation": "Detailed complexity analysis",
  "summary": "Simple explanation: Time: O(...), Space: O(...)"
}

Code:
\`\`\`${language}
${code}
\`\`\``;

    case "convert":
      return `You are a polyglot programmer. Convert this code from ${language} to ${userPrompt || "Python"}. Preserve logic and add comments.

Respond in this exact JSON format:
{
  "output": "The converted code here",
  "explanation": "Notes about the conversion"
}

Code:
\`\`\`${language}
${code}
\`\`\``;

    case "chat":
      return `You are a helpful coding assistant. The user has this ${language} code and asks: "${userPrompt || "Explain this code"}"

Respond in this exact JSON format:
{
  "explanation": "Your detailed answer here"
}

Code:
\`\`\`${language}
${code}
\`\`\``;

    case "practice":
      return `You are a coding instructor. Based on this ${language} code, generate 3 practice questions of varying difficulty (easy, medium, hard) with solutions.

Respond in this exact JSON format:
{
  "explanation": "Practice questions with solutions in markdown format"
}

Code:
\`\`\`${language}
${code}
\`\`\``;

    default:
      return `Explain this code:\n${code}`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language, feature, userPrompt } = await req.json();

    if (!code || !code.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "Code input is empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!feature) {
      return new Response(
        JSON.stringify({ success: false, error: "Feature type is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "AI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = buildPrompt(feature, code, language || "javascript", userPrompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a helpful coding assistant. Always respond with valid JSON only, no markdown fences." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    // Try to parse as JSON, fallback to raw text
    let data: Record<string, string>;
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      data = JSON.parse(cleaned);
    } catch {
      data = { explanation: content };
    }

    return new Response(
      JSON.stringify({ success: true, feature, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
