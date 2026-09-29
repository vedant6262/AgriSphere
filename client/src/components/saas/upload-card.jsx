import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadCard({ file, helper, className, onChange }) {
  return (
    <label
      className={cn(
        "flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/35 bg-primary/5 p-6 text-center transition hover:bg-primary/10",
        className
      )}
    >
      <UploadCloud className="h-9 w-9 text-primary" />
      <div>
        <p className="font-medium">{file ? file.name : "Choose crop image"}</p>
        <p className="text-sm text-muted-foreground">{helper}</p>
      </div>
      <input className="hidden" type="file" accept="image/*" onChange={onChange} />
    </label>
  );
}
