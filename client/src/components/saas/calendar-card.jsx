import "react-big-calendar/lib/css/react-big-calendar.css";
import { useMemo } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import { DashboardCard } from "@/components/saas/dashboard-card";

const localizer = dayjsLocalizer(dayjs);

export function CalendarCard({ id, title, description, events = [] }) {
  const normalizedEvents = useMemo(
    () =>
      events.map((event, index) => ({
        id: event.id ?? index,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end)
      })),
    [events]
  );

  return (
    <DashboardCard id={id} title={title} description={description}>
      <div className="rbc-calendar h-[430px]">
        <Calendar
          localizer={localizer}
          events={normalizedEvents}
          startAccessor="start"
          endAccessor="end"
          views={["month", "agenda"]}
          popup
        />
      </div>
    </DashboardCard>
  );
}
