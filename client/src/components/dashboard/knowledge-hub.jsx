import { ExternalLink, PlayCircle } from "lucide-react";
import { DashboardCard } from "@/components/saas/dashboard-card";

export function KnowledgeHub({ videos = [] }) {
  return (
    <DashboardCard id="knowledge-hub" title="Knowledge Hub" description="YouTube learning feed for practical farming tutorials.">
      <div className="grid gap-4 md:grid-cols-3">
        {videos.map((video) => (
          <a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-2xl border border-border bg-background/70 transition hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="relative h-40 overflow-hidden">
              <img
                alt={video.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                src={video.thumbnail}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/45 to-transparent">
                <PlayCircle className="h-12 w-12 text-white" />
              </div>
            </div>
            <div className="space-y-2 p-4">
              <p className="font-medium">{video.title}</p>
              <p className="text-sm text-muted-foreground">{video.channelTitle}</p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Watch now
                <ExternalLink className="h-4 w-4" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </DashboardCard>
  );
}
