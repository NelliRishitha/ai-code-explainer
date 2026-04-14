import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LANGUAGES = [
  "javascript", "typescript", "python", "java", "c", "cpp", "csharp",
  "go", "rust", "ruby", "php", "swift", "kotlin",
];

interface CodeInputProps {
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: string) => void;
}

const CodeInput = ({ code, language, onCodeChange, onLanguageChange }: CodeInputProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground">Language</label>
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Textarea
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        className="min-h-[250px] font-mono text-sm bg-secondary/50 border-border"
      />
    </div>
  );
};

export default CodeInput;
