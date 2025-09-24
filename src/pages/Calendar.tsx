import { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Modal } from "../components/ui/modal";
import { useModal } from "../hooks/useModal";
import PageMeta from "../components/common/PageMeta";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
  };
}

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [repeatType, setRepeatType] = useState<"none" | "daily" | "weekly" | "monthly" | "3monthly" | "6monthly" | "yearly">("none");

  const calendarsEvents = {
    Danger: "danger",
    Success: "success",
    Primary: "primary",
    Warning: "warning",
  };

  useEffect(() => {
    // Initialize with some events
    setEvents([
      {
        id: "1",
        title: "Event Conf.",
        start: new Date().toISOString(), // keep full datetime
        extendedProps: { calendar: "Danger" },
      },
      {
        id: "2",
        title: "Meeting",
        start: new Date(Date.now() + 86400000).toISOString(), // +1 day
        extendedProps: { calendar: "Success" },
      },
      {
        id: "3",
        title: "Workshop",
        start: new Date(Date.now() + 172800000).toISOString(), // +2 days
        end: new Date(Date.now() + 259200000).toISOString(),   // +3 days
        extendedProps: { calendar: "Primary" },
      },
    ]);

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
    setEventLevel(event.extendedProps.calendar);
    openModal();
  };

  const handleAddOrUpdateEvent = () => {
    const start = new Date(eventStartDate);
    const end = new Date(eventEndDate);

    // fungsi helper untuk hitung interval repeat
    const getNextDate = (date: Date, type: typeof repeatType) => {
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

    if (repeatType === "none") {
      newEvents.push({
        id: Date.now().toString(),
        title: eventTitle,
        start: start.toISOString(),
        end: end.toISOString(),
        allDay: false,
        extendedProps: { calendar: eventLevel },
      });
    } else {
      // generate sampai batas endDate
      let currentStart = new Date(start);
      let currentEnd = new Date(end);

      while (currentStart <= end) {
        newEvents.push({
          id: `${Date.now()}-${currentStart.toISOString()}`,
          title: eventTitle,
          start: currentStart.toISOString(),
          end: currentEnd.toISOString(),
          allDay: false,
          extendedProps: { calendar: eventLevel },
        });

        currentStart = getNextDate(currentStart, repeatType);
        currentEnd = getNextDate(currentEnd, repeatType);
      }
    }

    if (selectedEvent) {
      // update
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === selectedEvent.id ? { ...newEvents[0] } : ev
        )
      );
    } else {
      // tambah
      setEvents((prev) => [...prev, ...newEvents]);
    }

    closeModal();
    resetModalFields();
  };


  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("");
    setSelectedEvent(null);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete "${selectedEvent.title}"?`
      );
      if (!confirmDelete) return;

      setEvents((prev) =>
        prev.filter((event) => event.id !== selectedEvent.id)
      );
      closeModal();
      resetModalFields();
    }
  };

  return (
    <>
      <div className="rounded-2xl border  border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
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
            customButtons={{
              addEventButton: {
                text: "Add Schedular +",
                click: openModal,
              },
            }}
          />
        </div>
        {/* Modal */}
        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-6 lg:p-10">
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <h5 className="mb-2 font-semibold text-gray-800 text-theme-xl dark:text-white/90 lg:text-2xl">
              {selectedEvent ? "Edit Schedular" : "Add Schedular"}
            </h5>

            {/* Title */}
            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Event Title
              </label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
              />
            </div>

            {/* Color */}
            <div className="mt-6">
              <label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
                Event Color
              </label>
              <div className="flex gap-4">
                {Object.entries(calendarsEvents).map(([key]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="event-level"
                      value={key}
                      checked={eventLevel === key}
                      onChange={() => setEventLevel(key)}
                    />
                    {key}
                  </label>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={eventStartDate ? eventStartDate.split("T")[0] : ""}
                  onChange={(e) => {
                    const date = e.target.value;
                    const time = eventStartDate && eventStartDate.includes("T")
                      ? eventStartDate.split("T")[1]
                      : "09:00"; // default jam mulai
                    setEventStartDate(`${date}T${time}`);
                  }}
                  className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  value={eventStartDate && eventStartDate.includes("T")
                    ? eventStartDate.split("T")[1]
                    : "09:00"}
                  onChange={(e) => {
                    const time = e.target.value;
                    const date = eventStartDate && eventStartDate.includes("T")
                      ? eventStartDate.split("T")[0]
                      : new Date().toISOString().split("T")[0];
                    setEventStartDate(`${date}T${time}`);
                  }}
                  className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={eventEndDate ? eventEndDate.split("T")[0] : ""}
                  onChange={(e) => {
                    const date = e.target.value;
                    const time = eventEndDate && eventEndDate.includes("T")
                      ? eventEndDate.split("T")[1]
                      : "17:00"; // default jam selesai
                    setEventEndDate(`${date}T${time}`);
                  }}
                  className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  value={eventEndDate && eventEndDate.includes("T")
                    ? eventEndDate.split("T")[1]
                    : "17:00"}
                  onChange={(e) => {
                    const time = e.target.value;
                    const date = eventEndDate && eventEndDate.includes("T")
                      ? eventEndDate.split("T")[0]
                      : new Date().toISOString().split("T")[0];
                    setEventEndDate(`${date}T${time}`);
                  }}
                  className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
                />
              </div>


              <div className="mt-6">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Repeat Event
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="none"
                      checked={repeatType === "none"}
                      onChange={() => setRepeatType("none")}
                    />
                    None
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="daily"
                      checked={repeatType === "daily"}
                      onChange={() => setRepeatType("daily")}
                    />
                    Daily
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="weekly"
                      checked={repeatType === "weekly"}
                      onChange={() => setRepeatType("weekly")}
                    />
                    Weekly
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="monthly"
                      checked={repeatType === "monthly"}
                      onChange={() => setRepeatType("monthly")}
                    />
                    Monthly
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="3monthly"
                      checked={repeatType === "3monthly"}
                      onChange={() => setRepeatType("3monthly")}
                    />
                    3 Monthly
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="6monthly"
                      checked={repeatType === "6monthly"}
                      onChange={() => setRepeatType("6monthly")}
                    />
                    6 Monthly
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="yearly"
                      checked={repeatType === "yearly"}
                      onChange={() => setRepeatType("yearly")}
                    />
                    Yearly
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              {selectedEvent && (
                <button
                  onClick={handleDeleteEvent}
                  className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600"
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleAddOrUpdateEvent}
                className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
              >
                {selectedEvent ? "Update Changes" : "Add Schedular"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

const renderEventContent = (eventInfo: any) => {
  const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar.toLowerCase()}`;
  return (
    <div
      className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}
    >
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
