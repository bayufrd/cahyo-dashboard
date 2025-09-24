import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

export default function Scheduler() {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      editable={true}
      selectable={true}
      events={[
        { title: 'Meeting', start: '2025-09-24T10:00:00', end: '2025-09-24T12:00:00' }
      ]}
    />
  )
}
