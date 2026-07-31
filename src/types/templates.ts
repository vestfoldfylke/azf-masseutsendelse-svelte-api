import type { Document, Types } from "mongoose";

export type Template = {
  _Id?: Types.ObjectId;
  name: string;
  description: string;
  version: number;
  enabled: boolean;
  documentDefinitionId: string;
  documentData?: Record<string, unknown>;
  template: string;
  language: string;
  createdTimestamp: Date;
  createdBy: string;
  createdById: string;
  createdByDepartment?: string;
  modifiedTimestamp: Date;
  modifiedBy: string;
  modifiedById: string;
  modifiedByDepartment?: string;
};

export type TemplateDocument = Template & Document;
