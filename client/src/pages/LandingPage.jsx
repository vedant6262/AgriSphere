import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BrainCircuit, CloudSun, Map, ShieldCheck, Sprout, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { title: "Farm Monitoring", description: "Stream live sensor data from soil moisture, humidity, and temperature devices.", icon: Waves },
  { title: "Weather Intelligence", description: "Forecast rainfall, wind, and climate risk with proactive field recommendations.", icon: CloudSun },
  { title: "AI Crop Guidance", description: "Ask questions, detect disease, and get season-aware crop suggestions.", icon: BrainCircuit },
  { title: "Farm Mapping", description: "Visualize farm boundaries, location, and microclimate conditions on interactive maps.", icon: Map }
];

const benefits = [
  "Reduce water waste with smarter irrigation timing",
  "Respond earlier to weather shocks and pest pressure",
  "Track costs and market opportunities in one dashboard",
  "Give farmers a practical AI assistant for daily decisions"
];

export function LandingPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative px-4 pb-20 pt-6 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="glass-card rounded-[2.5rem] bg-hero p-6 md:p-10">
            <nav className="mb-12 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Sprout className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display text-xl font-semibold">AgriSphere</p>
                  <p className="text-sm text-muted-foreground">AI Powered Climate Smart Farming Platform</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/sign-in">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/app/dashboard">
                  <Button>Launch Dashboard</Button>
                </Link>
              </div>
            </nav>

            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <p className="mb-4 inline-flex rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary shadow-sm">
                  Startup-grade agri intelligence
                </p>
                <h1 className="max-w-3xl font-display text-5xl font-semibold tracking-tight text-foreground md:text-6xl">
                  Turn farm sensors, forecasts, and AI into daily field decisions.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                  AgriSphere brings IoT monitoring, weather forecasting, smart irrigation, crop disease analysis, market insights, and a farmer community into one modern dashboard.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/app/dashboard">
                    <Button size="lg">Explore Platform</Button>
                  </Link>
                  <Link to="/sign-up">
                    <Button size="lg" variant="outline">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="rounded-[2rem] border-white/40 bg-white/70">
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">Smart irrigation</p>
                      <p className="font-display text-3xl font-semibold text-primary">32%</p>
                      <p className="text-sm text-muted-foreground">Water savings from moisture-aware scheduling</p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-[2rem] border-white/40 bg-white/70">
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">Disease detection</p>
                      <p className="font-display text-3xl font-semibold text-primary">AI scan</p>
                      <p className="text-sm text-muted-foreground">Image-first crop health screening and treatment</p>
                    </CardContent>
                  </Card>
                  <div className="rounded-[2rem] border border-white/40 bg-[linear-gradient(135deg,rgba(22,163,74,0.92),rgba(21,128,61,0.86))] p-6 text-white shadow-glass md:col-span-2">
                    <p className="text-sm uppercase tracking-[0.26em] text-white/70">Farmer benefit</p>
                    <p className="mt-4 font-display text-3xl font-semibold">Monitor farms, cut guesswork, and respond faster to climate risk.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.26em] text-primary">Features</p>
              <h2 className="mt-3 font-display text-4xl font-semibold">Built for modern farm operations</h2>
            </div>
            <p className="max-w-xl text-muted-foreground">
              A single full-stack platform for monitoring, forecasting, AI analysis, and operational visibility.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
                  <Card className="h-full">
                    <CardContent className="space-y-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-display text-2xl font-semibold">{feature.title}</h3>
                      <p className="text-sm leading-7 text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="overflow-hidden">
            <CardContent className="h-full bg-[linear-gradient(160deg,rgba(22,163,74,0.95),rgba(21,128,61,0.78))] text-white">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">Benefits for farmers</p>
              <h3 className="mt-4 font-display text-4xl font-semibold">Field-ready decisions, not abstract analytics.</h3>
              <div className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <ShieldCheck className="mt-1 h-5 w-5 shrink-0" />
                    <p className="text-sm leading-7">{benefit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-5 md:grid-cols-2">
            <Card>
              <CardContent className="space-y-3">
                <p className="text-sm uppercase tracking-[0.24em] text-primary">Community</p>
                <p className="font-display text-3xl font-semibold">Farmer forum and knowledge sharing</p>
                <p className="text-sm text-muted-foreground">Farmers can post questions, learn from peers, and access curated videos.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3">
                <p className="text-sm uppercase tracking-[0.24em] text-primary">Intelligence</p>
                <p className="font-display text-3xl font-semibold">Live alerts, weather warnings, and crop pricing</p>
                <p className="text-sm text-muted-foreground">Stay ahead of sudden weather, pest pressure, and market shifts.</p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardContent className="space-y-4">
                <p className="text-sm uppercase tracking-[0.24em] text-primary">Call to action</p>
                <p className="font-display text-3xl font-semibold">Launch the platform and configure your farm in minutes.</p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/app/dashboard">
                    <Button>Open Dashboard</Button>
                  </Link>
                  <Link to="/sign-up">
                    <Button variant="outline">Start with Clerk auth</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
