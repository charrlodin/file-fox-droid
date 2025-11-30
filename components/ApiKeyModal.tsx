"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const MODELS = [
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini (Recommended)", provider: "OpenAI" },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic" },
  { id: "google/gemini-pro-1.5", name: "Gemini Pro 1.5", provider: "Google" },
  { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B", provider: "Meta" },
];

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: () => void;
  canClose?: boolean;
}

export function ApiKeyModal({ isOpen, onClose, onSuccess, canClose = false }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("openai/gpt-4o-mini");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveApiKey = useMutation(api.users.saveApiKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await saveApiKey({ apiKey, model });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save API key");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={canClose ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-background border border-border rounded-xl p-6 shadow-2xl"
          >
            <div className="mb-6">
              <h2 className="font-[var(--font-heading)] text-xl font-bold mb-2">
                Add Your OpenRouter API Key
              </h2>
              <p className="text-sm text-muted">
                FoxFile uses AI to organize your files. You need to provide your own OpenRouter API key to use this service.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-sm font-mono focus:outline-none focus:border-accent"
                  required
                />
                <p className="text-xs text-muted mt-2">
                  Get your key at{" "}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    openrouter.ai/keys
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider})
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <motion.button
                  type="submit"
                  disabled={isLoading || !apiKey}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="flex-1 px-6 py-3 bg-accent text-background font-semibold rounded-lg disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save & Continue"}
                </motion.button>
                {canClose && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 border border-border rounded-lg text-muted hover:text-foreground"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted">
                Your API key is stored securely and only used to process your files. 
                We never share or log your key.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
