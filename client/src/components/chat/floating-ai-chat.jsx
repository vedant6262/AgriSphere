import { useState } from "react";
import { Bot, MessageCircle, SendHorizonal, X } from "lucide-react";
import { dashboardApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const seedMessages = [
  {
    role: "assistant",
    content: "Hello! I am your Gemini farm assistant. Ask me about irrigation, crop care, weather planning, or disease prevention."
  }
];

export function FloatingAIChat({ getToken }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(seedMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (event) => {
    event.preventDefault();

    if (!input.trim() || isLoading) {
      return;
    }

    const nextMessages = [...messages, { role: "user", content: input.trim() }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await dashboardApi.sendChat(nextMessages, getToken);
      setMessages([...nextMessages, { role: "assistant", content: response.answer }]);
    } catch {
      setMessages([
        ...nextMessages,
        { role: "assistant", content: "I am temporarily unavailable. Please try again in a moment." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="mb-3 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">KrushiMitra</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background/70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="h-[360px] space-y-3 overflow-auto bg-background/40 p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "border border-border bg-card"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading ? <p className="text-xs text-muted-foreground">Gemini is preparing a response...</p> : null}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 border-t border-border p-3">
            <Input
              className="h-10"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask farming question..."
            />
            <Button type="submit" disabled={isLoading} className="h-10 px-3">
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </form>
        </div>
      ) : null}

      <Button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="h-12 rounded-full px-4 shadow-xl"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        KrushiMitra
      </Button>
    </div>
  );
}
