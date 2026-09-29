import { useState } from "react";
import { Bot, LoaderCircle, SendHorizonal, User } from "lucide-react";
import { dashboardApi } from "@/services/api";
import { ChatPanel } from "@/components/saas/chat-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const seedMessages = [
  {
    role: "assistant",
    content: "Ask about irrigation timing, crop diseases, weather-driven spray planning, or crop recommendations."
  }
];

const quickSuggestions = [
  "Best irrigation plan for tomatoes this week?",
  "How can I reduce fungal disease risk after rain?",
  "Which crop has better market potential this month?"
];

export function AIChatPanel({ getToken }) {
  const [messages, setMessages] = useState(seedMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    const nextMessages = [...messages, { role: "user", content: input.trim() }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await dashboardApi.sendChat(nextMessages, getToken);
      setMessages([...nextMessages, { role: "assistant", content: response.answer }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatPanel id="ai-chatbot" title="KrushiMitra" description="Gemini-powered agronomy support for farm operations.">
      <div className="flex h-[440px] flex-col">
        <div className="mb-3 flex flex-wrap gap-2">
          {quickSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setInput(suggestion)}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="mb-4 flex-1 space-y-3 overflow-auto rounded-2xl border border-border bg-background/60 p-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex gap-3 ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
            >
              {message.role === "assistant" && (
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "assistant" ? "border border-border bg-card text-foreground" : "bg-primary text-primary-foreground"
                }`}
              >
                {message.content}
              </div>
              {message.role === "user" && (
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
              <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
              AI is analyzing weather, soil, and crop conditions...
            </div>
          )}
        </div>

        <form className="flex gap-3" onSubmit={handleSubmit}>
          <Input
            className="h-11 rounded-xl"
            placeholder="How should I irrigate tomatoes before tomorrow's rain?"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <Button type="submit" disabled={isLoading} className="h-11 rounded-xl px-4">
            <SendHorizonal className="mr-2 h-4 w-4" />
            Send
          </Button>
        </form>
      </div>
    </ChatPanel>
  );
}
