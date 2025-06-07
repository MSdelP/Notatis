// Notitas_Web/src/components/CalendarView.tsx

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core'; // <-- CORRECCIÓN: Importar EventInput desde @fullcalendar/core
import { Database } from '../api/databases';

interface CalendarViewProps {
  db: Database;
}

const CalendarView: React.FC<CalendarViewProps> = ({ db }) => {
  // Convertimos las entries que tengan dueDate en eventos
  const events: EventInput[] = db.entries
    .filter((e) => e.data.dueDate)
    .map((e) => ({
      id: e._id,
      title: e.data.taskName,
      date: e.data.dueDate
    }));

  return (
    <div style={{ padding: '8px' }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        eventClick={(info) => {
          console.log('Click en tarea (evento):', info.event.id);
          // Aquí podrías abrir un modal con los detalles de la tarea, si lo deseas.
        }}
        dateClick={(info) => {
          console.log('Click en fecha (día vacío):', info.dateStr);
          // Si quieres permitir “Crear nueva tarea con esta fecha”, deberías comunicarlo al padre.
        }}
      />
    </div>
  );
};

export default CalendarView;

