import { AIChatPanel } from "@/components/chat/ai-chat-panel";
import { useAppAuth } from "@/context/auth-context";

export function AIChatbotPage() {
  const { getToken } = useAppAuth();

  return (
    <div className="space-y-5">
      <div>
        <p className="card-label text-primary">KrushiMitra</p>
        <h2 className="page-title mt-2">Conversational agronomy assistant</h2>
      </div>
      <AIChatPanel getToken={getToken} />
    </div>
  );
}
