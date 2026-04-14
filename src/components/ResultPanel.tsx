import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ResultPanelProps {
  loading: boolean;
  data: {
    explanation?: string;
    summary?: string;
    suggestions?: string;
    output?: string;
  } | null;
  error: string | null;
  feature: string;
}

const FEATURE_LABELS: Record<string, string> = {
  explain: "Explanation",
  debug: "Debug Results",
  complexity: "Complexity Analysis",
  convert: "Converted Code",
  chat: "Chat Response",
  practice: "Practice Questions",
};

const ResultPanel = ({ loading, data, error, feature }: ResultPanelProps) => {
  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Analyzing your code...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="py-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-border">
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">Select a feature and click to analyze your code.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">{FEATURE_LABELS[feature] || "Result"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.summary && (
          <div>
            <h4 className="text-sm font-semibold text-primary mb-1">Summary</h4>
            <p className="text-sm text-foreground whitespace-pre-wrap">{data.summary}</p>
          </div>
        )}
        {data.explanation && (
          <div>
            <h4 className="text-sm font-semibold text-primary mb-1">Explanation</h4>
            <pre className="text-sm text-foreground whitespace-pre-wrap bg-secondary/50 p-4 rounded-lg overflow-auto max-h-[400px]">
              {data.explanation}
            </pre>
          </div>
        )}
        {data.output && (
          <div>
            <h4 className="text-sm font-semibold text-primary mb-1">Code Output</h4>
            <pre className="text-sm font-mono text-foreground whitespace-pre-wrap bg-secondary/50 p-4 rounded-lg overflow-auto max-h-[400px]">
              {data.output}
            </pre>
          </div>
        )}
        {data.suggestions && (
          <div>
            <h4 className="text-sm font-semibold text-primary mb-1">Suggestions</h4>
            <p className="text-sm text-foreground whitespace-pre-wrap">{data.suggestions}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultPanel;
