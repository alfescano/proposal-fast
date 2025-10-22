import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useClientMemory } from "@/hooks/useClientMemory";

interface MemorySuggestionProps {
  clientName: string;
}

export function MemorySuggestion({ clientName }: MemorySuggestionProps) {
  const { user: userProfile } = useAuthContext();
  const { preference, loading } = useClientMemory(clientName, userProfile?.id);

  if (!clientName || !preference) {
    return null;
  }

  const getToneColor = (tone?: string) => {
    switch (tone) {
      case "formal":
        return "bg-blue-900/50 border-blue-400";
      case "casual":
        return "bg-green-900/50 border-green-400";
      case "balanced":
        return "bg-purple-900/50 border-purple-400";
      default:
        return "bg-slate-700/50 border-slate-400";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/50 p-4">
      <div className="flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-white flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            AI Memory Detected
          </h3>
          <p className="text-xs text-slate-300 mb-3">
            I've learned preferences from {preference.contract_count} previous contract
            {preference.contract_count !== 1 ? "s" : ""} with this client.
          </p>
          <div className="flex flex-wrap gap-2">
            {preference.tone && (
              <Badge
                variant="outline"
                className={`${getToneColor(preference.tone)} text-white text-xs capitalize`}
              >
                {preference.tone} Tone
              </Badge>
            )}
            {preference.industry && (
              <Badge variant="outline" className="bg-amber-900/50 border-amber-400 text-white text-xs">
                {preference.industry}
              </Badge>
            )}
            {preference.preferred_style && (
              <Badge variant="outline" className="bg-slate-700/50 border-slate-400 text-white text-xs">
                {preference.preferred_style}
              </Badge>
            )}
          </div>
          {preference.key_terms && preference.key_terms.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-slate-400 mb-1">Key terms used:</p>
              <div className="flex flex-wrap gap-1">
                {preference.key_terms.slice(0, 3).map((term, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-slate-600/50 text-slate-200 text-xs">
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}