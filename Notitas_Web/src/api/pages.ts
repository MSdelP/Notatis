// Notitas_Web/src/api/pages.ts

import axios from 'axios';

export interface Block {
  _id: string;
  type: 'text' | 'heading' | 'databaseEmbed' | 'mediaEmbed'; // <-- Se añade 'mediaEmbed'
  data: any; 
  order: number;
}

export interface Page {
  _id: string;
  owner: { id: string; email: string } | string;
  title: string;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}

const BASE = '/api/pages';

// CRUD de páginas:
export const getPages = () => axios.get<Page[]>(BASE).then((r) => r.data);
export const getPage = (pageId: string) =>
  axios.get<Page>(`${BASE}/${pageId}`).then((r) => r.data);
export const createPage = (title: string, blocks: Block[] = []) =>
  axios.post<Page>(BASE, { title, blocks }).then((r) => r.data);
export const updatePage = (
  pageId: string,
  data: { title?: string; blocks?: Block[] }
) => axios.patch<Page>(`${BASE}/${pageId}`, data).then((r) => r.data);
export const deletePage = (pageId: string) => axios.delete(`${BASE}/${pageId}`);

// ——————————————————————————————————————————————————————————
// FUNCIONALIDADES DE VERSIONES (5.1):
export interface PageVersion {
  _id: string;
  page: string;
  title: string;
  blocks: Block[];
  createdAt: string;
}

export const getPageVersions = (pageId: string) =>
  axios
    .get<PageVersion[]>(`${BASE}/${pageId}/versions`)
    .then((r) => r.data);

export const getPageVersion = (pageId: string, versionId: string) =>
  axios
    .get<PageVersion>(`${BASE}/${pageId}/versions/${versionId}`)
    .then((r) => r.data);

export const revertPageVersion = (pageId: string, versionId: string) =>
  axios
    .post<Page>(`${BASE}/${pageId}/versions/${versionId}/revert`)
    .then((r) => r.data);
