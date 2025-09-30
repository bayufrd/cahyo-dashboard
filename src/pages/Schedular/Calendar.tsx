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
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventStatus, setEventStatus] = useState<"Active" | "Pending">("Pending");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [repeatType, setRepeatType] = useState<
    "none" | "daily" | "weekly" | "monthly" | "3monthly" | "6monthly" | "yearly"
  >("none");

  useEffect(() => {
  fetch("/Order.json")
    .then((res) => res.json())
    .then((orders: any[]) => {
      const mappedEvents: CalendarEvent[] = [];

      orders.forEach((o) => {
        try {
          if (o.cronExpression) {
            const interval = parser.parse(o.cronExpression, {
              tz: o.zoneId ?? "Asia/Jakarta",
            });

            for (let i = 0; i < 5; i++) {
              const nextDate = interval.next().toDate().toISOString();
              mappedEvents.push({
                id: `${o.id}-${i}`,
                title: o.name ?? "Untitled",
                start: nextDate,
                extendedProps: {
                  status: "Active",
                  zoneId: o.zoneId ?? "Asia/Jakarta",
                  description: o.description ?? "",
                  request: o.request ?? undefined,
                },
              });
            }
          } else if (o.scheduleAt) {
            mappedEvents.push({
              id: o.id?.toString(),
              title: o.name ?? "Untitled",
              start: o.scheduleAt,
              extendedProps: {
                status: "Pending",
                zoneId: o.zoneId ?? "Asia/Jakarta",
                description: o.description ?? "",
                request: o.request ?? undefined,
              },
            });
          }
        } catch (err) {
          console.warn("Invalid cronExpression:", o.cronExpression, err);
        }
      });

      setEvents(mappedEvents);
    })
    .catch((err) => console.error("Failed to load Order.json:", err));
}, []);



  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString() || "");
    setEventEndDate(event.end?.toISOString() || "");
    setEventStatus(event.extendedProps.status);
    openModal();
  };

  const handleAddOrUpdateEvent = (data: any) => {
    const { title, startDate, endDate, status, repeatType: rpt } = data;
    setRepeatType(rpt);

    const start = new Date(startDate);
    const end = new Date(endDate);

    const getNextDate = (date: Date, type: typeof rpt) => {
      const d = new Date(date);
      switch (type) {
        case "daily":
          d.setDate(d.getDate() + 1);
          break;
        case "weekly":
          d.setDate(d.getDate() + 7);
          break;
        case "monthly":
          d.setMonth(d.getMonth() + 1);
          break;
        case "3monthly":
          d.setMonth(d.getMonth() + 3);
          break;
        case "6monthly":
          d.setMonth(d.getMonth() + 6);
          break;
        case "yearly":
          d.setFullYear(d.getFullYear() + 1);
          break;
      }
      return d;
    };

    let newEvents: CalendarEvent[] = [];

    if (rpt === "none") {
      newEvents.push({
        id: Date.now().toString(),
        title,
        start: start.toISOString(),
        end: end.toISOString(),
        allDay: false,
        extendedProps: { status },
      });
    } else {
      let currentStart = new Date(start);
      let currentEnd = new Date(end);

      while (currentStart <= end) {
        newEvents.push({
          id: `${Date.now()}-${currentStart.toISOString()}`,
          title,
          start: currentStart.toISOString(),
          end: currentEnd.toISOString(),
          allDay: false,
          extendedProps: { status },
        });
        currentStart = getNextDate(currentStart, rpt);
        currentEnd = getNextDate(currentEnd, rpt);
      }
    }

    if (selectedEvent) {
      setEvents((prev) =>
        prev.map((ev) => (ev.id === selectedEvent.id ? { ...newEvents[0] } : ev))
      );
    } else {
      setEvents((prev) => [...prev, ...newEvents]);
    }

    closeModal();
    resetModalFields();
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventStatus("Pending");
    setSelectedEvent(null);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete "${selectedEvent.title}"?`
      );
      if (!confirmDelete) return;
      setEvents((prev) => prev.filter((event) => event.id !== selectedEvent.id));
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
            const tooltipContent = `
              <div class="text-sm">
                <div><b>ID:</b> ${info.event.id}</div>
                <div><b>Title:</b> ${info.event.title}</div>
                <div><b>Start:</b> ${info.event.start?.toLocaleString()}</div>
                <div><b>End:</b> ${info.event.end?.toLocaleString() ?? "-"}</div>
                <div><b>Status:</b> ${props.status}</div>
                <div><b>Zone:</b> ${props.zoneId ?? "-"}</div>
                <div><b>Description:</b> ${props.description ?? "-"}</div>
                ${props.request
                ? `<div><b>Request:</b><br/>
                        URL: ${props.request.url ?? "-"}<br/>
                        Method: ${props.request.httpMethod ?? "-"}<br/>
                        Headers: ${JSON.stringify(props.request.httpHeaders) ?? "-"}<br/>
                        Payload: ${props.request.data ?? "-"}
                      </div>`
                : ""
              }
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
            initialData={
              selectedEvent
                ? {
                  title: eventTitle,
                  startDate: eventStartDate,
                  endDate: eventEndDate,
                  status: eventStatus,
                  repeatType,
                }
                : undefined
            }
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
  const colorClass =
    status === "Active" ? "bg-green-500 text-white" : "bg-yellow-400 text-black";

  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded ${colorClass}`}>
      <span>{eventInfo.timeText}</span>
      <span className="font-medium">{eventInfo.event.title}</span>
    </div>
  );
};

export default Calendar;
