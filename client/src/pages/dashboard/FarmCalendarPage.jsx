import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, Trash2 } from "lucide-react";
import { CalendarCard } from "@/components/saas/calendar-card";
import { DashboardCard } from "@/components/saas/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppAuth } from "@/context/auth-context";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { farmCalendarApi } from "@/services/api";

export function FarmCalendarPage() {
  const { getToken } = useAppAuth();
  const { data, isLoading, error } = useDashboardData(getToken);
  const [tasks, setTasks] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduledAt: ""
  });

  const loadTasks = async () => {
    try {
      const response = await farmCalendarApi.listTasks(getToken);
      setTasks((prev) => {
        if (response.tasks && response.tasks.length) {
          return response.tasks;
        }
        return prev || [];
      });
    } catch (loadError) {
      console.warn("Farm calendar tasks unavailable, using local list", loadError);
      setTasks((prev) => prev || []);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const taskEvents = useMemo(
    () =>
      tasks.map((task) => {
        const start = new Date(task.scheduledAt);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        return {
          id: task.id,
          title: `Task · ${task.title}`,
          start,
          end
        };
      }),
    [tasks]
  );

  const events = useMemo(() => taskEvents, [taskEvents]);

  if (isLoading) return <div className="saas-card animate-pulse">Loading farm calendar...</div>;
  if (error || !data) return <DashboardCard title="Farm calendar unavailable" description={`Unable to load data: ${error}`} />;

  const handleAddTask = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    const scheduledAtIso = new Date(form.scheduledAt).toISOString();
    const optimisticKey = `${form.title}|${scheduledAtIso}`;
    const optimisticTask = {
      id: `local-task-${Date.now()}`,
      title: form.title,
      description: form.description || null,
      scheduledAt: scheduledAtIso,
      _optimisticKey: optimisticKey
    };
    setTasks((prev) => {
      const next = [...(prev || []), optimisticTask];
      return next.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    });
    try {
      const response = await farmCalendarApi.createTask(
        {
          title: form.title,
          description: form.description || undefined,
          scheduledAt: scheduledAtIso
        },
        getToken
      );
      if (response?.task) {
        setTasks((prev) => {
          const next = (prev || []).filter((task) => task._optimisticKey !== optimisticKey);
          next.push(response.task);
          return next.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
        });
      }
      setForm({ title: "", description: "", scheduledAt: "" });
      await loadTasks();
    } catch (createError) {
      console.warn("Unable to save task right now", createError);
      setForm({ title: "", description: "", scheduledAt: "" });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTask = async (id) => {
    try {
      await farmCalendarApi.deleteTask(id, getToken);
      setTasks((prev) => (prev || []).filter((task) => task.id !== id));
      await loadTasks();
    } catch (deleteError) {
      console.warn("Unable to delete task right now", deleteError);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="card-label text-primary">Farm Calendar</p>
        <h2 className="page-title mt-2">Modern task scheduler with real-time alert timing</h2>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.16fr_0.84fr]">
        <CalendarCard title="Farm Calendar" description="Only your scheduled tasks are shown here." events={events} />

        <DashboardCard title="Add Task" description="Add a task and receive an alert at the scheduled time.">
          <form className="space-y-3" onSubmit={handleAddTask}>
            <Input
              value={form.title}
              placeholder="Task title (e.g. Drip irrigation - East block)"
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
            />
            <Textarea
              value={form.description}
              placeholder="Task notes"
              className="min-h-[90px]"
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <Input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(event) => setForm({ ...form, scheduledAt: event.target.value })}
              required
            />
            <Button type="submit" disabled={isSaving}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Add to calendar"}
            </Button>
          </form>
        </DashboardCard>
      </div>

      <DashboardCard title="Scheduled Tasks" description="You can delete tasks anytime.">
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks yet. Add your first schedule item.</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-border bg-background/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{task.title}</p>
                  <Button size="sm" variant="outline" onClick={() => deleteTask(task.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{new Date(task.scheduledAt).toLocaleString()}</p>
                {task.description && <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>}
              </div>
            ))
          )}
        </div>
      </DashboardCard>
    </div>
  );
}
