// Notitas_Web/src/api/databases.ts
import axios from 'axios';

export interface Field {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
}

export interface Entry {
  _id: string;
  data: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  _id: string;
  owner: { id: string; email: string } | string;
  name: string;
  description: string;  // <-- NUEVO CAMPO
  schema: Field[];
  entries: Entry[];
  createdAt: string;
  updatedAt: string;
}

const BASE = '/api/databases';

// Obtener todas las databases del usuario
export const getDatabases = () =>
  axios.get<Database[]>(BASE).then((r) => r.data);

// Obtener detalle de una database (incluye schema + entries + description)
export const getDatabase = (id: string) =>
  axios.get<Database>(`${BASE}/${id}`).then((r) => r.data);

// Crear nueva database. Ahora acepta name + description + schema
export const createDatabase = (
  name: string,
  schema: Field[],
  description: string = ''
) =>
  axios
    .post<Database>(BASE, { name, description, schema })
    .then((r) => r.data);

// Borrar una database
export const deleteDatabase = (id: string) => axios.delete(`${BASE}/${id}`);

// Crear nueva entry
export const createEntry = (dbId: string, data: { [key: string]: any }) =>
  axios.post<Entry>(`${BASE}/${dbId}/entries`, { data }).then((r) => r.data);

// Actualizar una entry
export const updateEntry = (
  dbId: string,
  entryId: string,
  data: { [key: string]: any }
) =>
  axios
    .patch<Entry>(`${BASE}/${dbId}/entries/${entryId}`, { data })
    .then((r) => r.data);

// Borrar una entry
export const deleteEntry = (dbId: string, entryId: string) =>
  axios.delete(`${BASE}/${dbId}/entries/${entryId}`);
