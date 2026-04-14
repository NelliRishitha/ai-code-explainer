import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code2, Bug, BarChart3, ArrowRightLeft, MessageSquare, GraduationCap } from "lucide-react";
import CodeInput from "@/components/CodeInput";
import ResultPanel from "@/components/ResultPanel";
import { useAnalyze } from "@/hooks/useAnalyze";
import type { Feature } from "@/lib/api";

const FEATURES: { key: Feature; label: string; icon: React.ReactNode; description: string }[] = [
  { key: "explain", label: "Explain", icon: <Code2 className="h-4 w-4" />, description: "Line-by-line explanation" },
  { key: "debug", label: "Debug", icon: <Bug className="h-4 w-4" />, description: "Find & fix errors" },
  { key: "complexity", label: "Complexity", icon: <BarChart3 className="h-4 w-4" />, description: "Time & space analysis" },
  { key: "convert", label: "Convert", icon: <ArrowRightLeft className="h-4 w-4" />, description: "Translate to another language" },
  { key: "chat", label: "Chat", icon: <MessageSquare className="h-4 w-4" />, description: "Ask about your code" },
  { key: "practice", label: "Practice", icon: <GraduationCap className="h-4 w-4" />, description: "Generate exercises" },
];

const TARGET_LANGUAGES = ["python", "javascript", "typescript", "java", "go", "rust", "cpp", "csharp", "ruby", "php"];

const Index = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [selectedFeature, setSelectedFeature] = useState<Feature>("explain");
  const [userPrompt, setUserPrompt] = useState("");
  const [targetLang, setTargetLang] = useState("python");
  const { loading, result, error, activeFeature, analyze } = useAnalyze();

  const handleAnalyze = () => {
    let prompt = userPrompt;
    if (selectedFeature === "convert") {
      prompt = targetLang;
    }
    analyze(code, language, selectedFeature, prompt);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Code2 className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold text-foreground">AI Code Explainer & Learning Assistant</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input */}
          <div className="space-y-4">
            <CodeInput code={code} language={language} onCodeChange={setCode} onLanguageChange={setLanguage} />

            {/* Feature buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {FEATURES.map((f) => (
                <Button
                  key={f.key}
                  variant={selectedFeature === f.key ? "default" : "outline"}
                  size="sm"
                  className="flex flex-col items-center gap-1 h-auto py-2"
                  onClick={() => setSelectedFeature(f.key)}
                >
                  {f.icon}
                  <span className="text-xs">{f.label}</span>
                </Button>
              ))}
            </div>

            {/* Extra inputs for certain features */}
            {selectedFeature === "convert" && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-foreground whitespace-nowrap">Convert to:</label>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedFeature === "chat" && (
              <Input
                placeholder="Ask a question about the code..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
              />
            )}

            <Button onClick={handleAnalyze} disabled={loading} className="w-full">
              {loading ? "Analyzing..." : `Run ${FEATURES.find((f) => f.key === selectedFeature)?.label}`}
            </Button>
          </div>

          {/* Right: Results */}
          <div>
            <ResultPanel loading={loading} data={result} error={error} feature={activeFeature} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
