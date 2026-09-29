import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppAuth } from "@/context/auth-context";

export function SignUpPage() {
  const { isClerkEnabled, SignUpComponent } = useAppAuth();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-5xl overflow-hidden p-0">
        <div className="grid min-h-[700px] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-[linear-gradient(160deg,rgba(22,163,74,0.95),rgba(21,128,61,0.78))] p-8 text-white md:p-10">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Create account</p>
            <h1 className="mt-4 font-display text-5xl font-semibold">Build a climate-smart farm operation.</h1>
            <p className="mt-5 max-w-md text-white/80">
              Create your AgriSphere workspace to connect sensors, map fields, and turn data into practical action.
            </p>
          </div>
          <CardContent className="flex items-center justify-center p-8 md:p-10">
            {isClerkEnabled ? (
              <SignUpComponent />
            ) : (
              <div className="w-full max-w-md space-y-5 text-center">
                <h2 className="font-display text-3xl font-semibold">Demo Mode</h2>
                <p className="text-muted-foreground">
                  Add `VITE_CLERK_PUBLISHABLE_KEY` to enable real Clerk account creation.
                </p>
                <Link to="/app/dashboard">
                  <Button className="w-full">Open demo workspace</Button>
                </Link>
                <Link className="block text-sm text-primary" to="/">
                  Back to landing page
                </Link>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
