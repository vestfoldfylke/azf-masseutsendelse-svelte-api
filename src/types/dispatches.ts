import type { Document, Types } from "mongoose";

export type Diff = Record<string, { from: unknown; to: unknown }>;

export type DispatchStatus = "notapproved" | "approved" | "inprogress" | "completed";

export type DispatchTemplate = {
  version: number;
  name: string;
  description: string;
  language?: string;
  documentDefinitionId?: string;
  documentData?: Record<string, unknown>;
  data?: Record<string, unknown>;
  template?: string;
};

export type PolygonExtremes = {
  north: number[];
  west: number[];
  east: number[];
  south: number[];
};

export type Polygon = {
  EPSG: string;
  area: number;
  center: number[];
  extremes: PolygonExtremes;
  vertices?: unknown[];
};

export type PolygonsField = {
  EPSG: string;
  area: number;
  center: number[];
  extremes: PolygonExtremes;
  polygons: Polygon[];
};

export type DispatchAttachment = {
  name: string;
  type?: string;
  size?: number;
  lastModified?: number;
  lastModifiedDate?: string;
  data?: string;
  _id?: string;
};

export type DispatchStats = {
  affectedCount: number;
  area?: number | null;
  totalOwners: number;
  privateOwners: number;
  businessOwners: number;
};

export type DispatchOwner = {
  _type: string;
  nummer: string;
  navn?: string;
};

export type Dispatch = {
  _id: Types.ObjectId;
  title: string;
  projectnumber: string;
  archivenumber: string;
  validatedArchivenumber: string;
  archiveUrl?: string;
  status: DispatchStatus;
  template?: DispatchTemplate;
  templateData?: Record<string, unknown>;
  attachments?: DispatchAttachment[];
  stats: DispatchStats;
  owners: DispatchOwner[];
  excludedOwners?: DispatchOwner[];
  matrikkelUnitsWithoutOwners?: unknown[];
  polygons: PolygonsField;
  e18Id?: string;
  createdTimestamp: Date;
  createdBy: string;
  createdByEmail: string;
  createdById: string;
  createdByDepartment: string;
  modifiedTimestamp: Date;
  modifiedBy: string;
  modifiedByEmail: string;
  modifiedByDepartment: string;
  modifiedById: string;
  approvedTimestamp?: Date;
  approvedBy?: string;
  approvedById?: string;
  approvedByEmail?: string;
  approvedByDepartment?: string;
  inProgressTimestamp?: Date;
  completedTimestamp?: Date;
};

export type DispatchDocument = Dispatch & Document;
