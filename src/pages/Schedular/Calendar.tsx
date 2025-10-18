import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import SchedulerForm from "./SchedularForm";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import parser from "cron-parser";

interface CalendarEvent extends EventInput {
  extendedProps: {
    status: "Active" | "Pending";
    zoneId?: string;
    description?: string;
    request?: {
      url?: string;
      httpMethod?: string;
      httpHeaders?: { key: string; value: string }[];
      data?: string;
    };
    name?: string | null;
    cronExpression?: string | null;
    scheduleAt?: string | null;
    originalId?: number | null | string;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [formInitialData, setFormInitialData] = useState<any | undefined>(undefined);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
  fetch("/Order.json")
    .then((res) => res.json())
    .then((orders: any[]) => {
      const mappedEvents: CalendarEvent[] = [];

      orders.forEach((o, idx) => {
        try {
          const baseId = o.id != null ? String(o.id) : `order-${idx}`;

          // Prefer cronExpression if present and valid
          if (o.cronExpression) {
            try {
              const interval = parser.parse(o.cronExpression, {
                tz: o.zoneId ?? "Asia/Jakarta",
              });

              // generate up to 5 upcoming occurrences
              for (let i = 0; i < 5; i++) {
                const next = interval.next();
                if (!next) break;
                const nextDate = next.toDate();
                if (isNaN(nextDate.getTime())) {
                  console.warn("Invalid next cron date for order", baseId, o.cronExpression);
                  break;
                }
                mappedEvents.push({
                  id: `${baseId}-${i}`,
                  title: o.name ?? "Untitled",
                  start: nextDate.toISOString(),
                  extendedProps: {
                    status: "Active",
                    zoneId: o.zoneId ?? "Asia/Jakarta",
                    name: o.name ?? null,
                    description: o.description ?? "",
                    request: o.request ?? undefined,
                    cronExpression: o.cronExpression ?? null,
                    scheduleAt: o.scheduleAt ?? null,
                    originalId: o.id ?? null,
                  },
                });
              }
            } catch (cronErr) {
              console.warn("Failed to parse cronExpression for order", baseId, o.cronExpression, cronErr);
            }
          }

          // If scheduleAt exists and is a valid date, include it as a pending event
          if (o.scheduleAt) {
            const sched = new Date(o.scheduleAt);
            if (!isNaN(sched.getTime())) {
              mappedEvents.push({
                id: `${baseId}-schedule`,
                title: o.name ?? "Untitled",
                start: sched.toISOString(),
                extendedProps: {
                  status: "Pending",
                  zoneId: o.zoneId ?? "Asia/Jakarta",
                  name: o.name ?? null,
                  description: o.description ?? "",
                  request: o.request ?? undefined,
                  cronExpression: o.cronExpression ?? null,
                  scheduleAt: o.scheduleAt ?? null,
                  originalId: o.id ?? null,
                },
              });
            } else {
              console.warn("Invalid scheduleAt for order", baseId, o.scheduleAt);
            }
          }

          // If neither cronExpression nor valid scheduleAt provided, log and skip
          if (!o.cronExpression && !o.scheduleAt) {
            console.warn("Order has no cronExpression or scheduleAt, skipping", baseId);
          }
        } catch (err) {
          console.warn("Error processing order at index", idx, err);
        }
      });

      setEvents(mappedEvents);
    })
    .catch((err) => console.error("Failed to load Order.json:", err));
}, []);



  const handleDateSelect = (selectInfo: DateSelectArg) => {
    // create explicit initialData for the form
    const initial = {
      id: null,
      name: "",
      description: "",
      scheduleAt: selectInfo.startStr,
      zoneId: "Asia/Jakarta",
      cronExpression: null,
      request: undefined,
    };
    // set both selectedEvent and formInitialData
    setSelectedEvent({
      id: `new-${Date.now()}`,
      title: "",
      start: selectInfo.startStr,
      end: selectInfo.endStr || selectInfo.startStr,
      extendedProps: { status: "Pending" },
    } as CalendarEvent);
    setFormInitialData(initial);
    // debug
    // eslint-disable-next-line no-console
    console.log("Calendar.openForm initialData (select):", initial);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const ev = event as unknown as CalendarEvent;
    // build explicit initialData for the form
    const initial = {
      id: ev.extendedProps.originalId ?? ev.id,
      name: ev.title ?? ev.extendedProps.name ?? "",
      description: ev.extendedProps.description ?? "",
      scheduleAt: ev.extendedProps.scheduleAt ?? (typeof ev.start === "string" ? ev.start : ev.start instanceof Date ? ev.start.toISOString() : null) ?? null,
      zoneId: ev.extendedProps.zoneId ?? "Asia/Jakarta",
      cronExpression: ev.extendedProps.cronExpression ?? null,
      request: ev.extendedProps.request ?? undefined,
    };
    setSelectedEvent({ ...ev, extendedProps: { ...ev.extendedProps } });
    setFormInitialData(initial);
    // debug
    // eslint-disable-next-line no-console
    console.log("Calendar.openForm initialData (click):", initial);
    openModal();
  };

  // SchedulerForm onSubmit -> data shape: { name, description, scheduleAt, zoneId, cronExpression, request }
  const handleAddOrUpdateEvent = (data: any) => {
    const payload = {
      title: data.name ?? data.title ?? "",
      extendedProps: {
        status: "Pending",
        zoneId: data.zoneId ?? "Asia/Jakarta",
        description: data.description ?? "",
        request: data.request ?? undefined,
        cronExpression: data.cronExpression ?? null,
        scheduleAt: data.scheduleAt ?? null,
        originalId: data.id ?? null,
      },
    } as Partial<CalendarEvent>;

    // if editing an existing event that has an originalId, update all events with that originalId
    const origId = selectedEvent?.extendedProps?.originalId ?? selectedEvent?.id;

    if (origId != null) {
      setEvents((prev) =>
        prev.map((ev) => {
          // match by extendedProps.originalId or id starting with origId (cron-generated occurrences)
          const matches = ev.extendedProps?.originalId == origId || String(ev.id).startsWith(String(origId) + "-");
          if (matches) {
            return {
              ...ev,
              title: payload.title ?? ev.title,
              extendedProps: { ...(ev.extendedProps ?? {}), ...(payload.extendedProps as any) },
            } as CalendarEvent;
          }
          return ev;
        })
      );

      // also ensure scheduleAt occurrence exists or is updated
      if (payload.extendedProps?.scheduleAt) {
        const scheduleId = `${origId}-schedule`;
        setEvents((prev) => {
          const hasSched = prev.some((e) => e.id === scheduleId);
          const schedEvent: CalendarEvent = {
            id: scheduleId,
            title: payload.title ?? "",
            start: payload.extendedProps!.scheduleAt as any,
            extendedProps: payload.extendedProps as any,
          };
          if (hasSched) {
            return prev.map((e) => (e.id === scheduleId ? schedEvent : e));
          }
          return [...prev, schedEvent];
        });
      }
    } else {
      // new event: create a single occurrence (scheduleAt) or simple event from cron (if cronExpression present we add one occurrence)
      if (payload.extendedProps?.scheduleAt) {
        const idNew = `new-${Date.now()}`;
        const ev: CalendarEvent = {
          id: idNew,
          title: payload.title ?? "",
          start: payload.extendedProps.scheduleAt as any,
          extendedProps: payload.extendedProps as any,
        };
        setEvents((prev) => [...prev, ev]);
      } else if (payload.extendedProps?.cronExpression) {
        // try to parse and add next occurrence
        try {
          const interval = parser.parse(payload.extendedProps.cronExpression as string, { tz: payload.extendedProps.zoneId });
          const next = interval.next().toDate();
          const idNew = `new-${Date.now()}`;
          const ev: CalendarEvent = {
            id: idNew,
            title: payload.title ?? "",
            start: next.toISOString(),
            extendedProps: payload.extendedProps as any,
          };
          setEvents((prev) => [...prev, ev]);
        } catch (err) {
          console.warn("Failed to parse cron for new event", err);
        }
      }
    }

    setSelectedEvent(null);
    closeModal();
  };

  const resetModalFields = () => {
    setSelectedEvent(null);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete "${selectedEvent.title}"?`
      );
      if (!confirmDelete) return;
      const origId = selectedEvent.extendedProps?.originalId ?? selectedEvent.id;
      setEvents((prev) => prev.filter((event) => !(event.extendedProps?.originalId == origId || String(event.id) === String(selectedEvent.id) || String(event.id).startsWith(String(origId) + "-"))));
      closeModal();
      resetModalFields();
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next addEventButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          eventDidMount={(info) => {
            const props = info.event.extendedProps as CalendarEvent["extendedProps"];
            // show only requested fields on hover
            const tooltipContent = `
              <div class="text-sm">
                <div><b>ID:</b> ${info.event.id}</div>
                <div><b>Job Name:</b> ${info.event.title}</div>
                <div><b>Job Description:</b> ${props.description ?? "-"}</div>
                <div><b>Schedule:</b> ${props.cronExpression ?? props.scheduleAt ?? info.event.start?.toLocaleString() ?? "-"}</div>
                <div><b>Status:</b> ${props.status}</div>
              </div>
            `;
            tippy(info.el, {
              content: tooltipContent,
              allowHTML: true,
              placement: "top",
              theme: "light-border",
            });
          }}
          customButtons={{
            addEventButton: {
              text: "Add Scheduler +",
              click: openModal,
            },
          }}
        />
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-4 my-10">
        <div className="max-h-[70vh] overflow-y-auto">
          <SchedulerForm
            initialData={formInitialData ?? (selectedEvent
              ? {
                  id: selectedEvent.extendedProps.originalId ?? selectedEvent.id,
                  name: selectedEvent.title,
                  description: selectedEvent.extendedProps.description ?? "",
                  scheduleAt: selectedEvent.extendedProps.scheduleAt ?? (typeof selectedEvent.start === 'string' ? selectedEvent.start : (selectedEvent.start instanceof Date ? selectedEvent.start.toISOString() : null)) ?? null,
                  zoneId: selectedEvent.extendedProps.zoneId ?? "Asia/Jakarta",
                  cronExpression: selectedEvent.extendedProps.cronExpression ?? null,
                  request: selectedEvent.extendedProps.request ?? undefined,
                }
              : undefined)}
            onSubmit={handleAddOrUpdateEvent}
            onDelete={selectedEvent ? handleDeleteEvent : undefined}
            onCancel={closeModal}
          />
        </div>
      </Modal>
    </div>
  );
};

const renderEventContent = (eventInfo: any) => {
  const status: "Active" | "Pending" = eventInfo.event.extendedProps.status;
  const colorClass = status === "Active" ? "bg-green-500 text-white" : "bg-yellow-400 text-black";

  // Only display ID and name on the calendar tile
  const idLabel = eventInfo.event.id ?? "-";
  const title = eventInfo.event.title ?? "Untitled";

  return (
    <div className={`flex flex-col px-2 py-1 rounded ${colorClass}`}>
      <span className="text-xs">{idLabel}</span>
      <span className="font-medium text-sm">{title}</span>
    </div>
  );
};

export default Calendar;
