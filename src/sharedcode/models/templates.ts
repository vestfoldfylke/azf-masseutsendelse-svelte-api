import mongoose from "mongoose";
import type { TemplateDocument } from "../../types/templates.js";

const templateSchema = new mongoose.Schema({
  _Id: {
    type: mongoose.Schema.Types.ObjectId
  },
  name: {
    type: String,
    unique: true,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    default: 1,
    min: 1
  },
  enabled: {
    type: Boolean,
    default: true
  },
  documentDefinitionId: {
    type: String,
    required: true
  },
  documentData: {
    type: Object
  },
  template: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: "nb"
  },
  createdTimestamp: {
    type: Date,
    required: true
  },
  createdBy: {
    type: String,
    default: "unknown",
    required: true
  },
  createdById: {
    type: String,
    default: "00000000-0000-0000-0000-000000000000",
    required: true
  },
  createdByDepartment: {
    type: String
  },
  modifiedTimestamp: {
    type: Date,
    required: true
  },
  modifiedBy: {
    type: String,
    default: "unknown",
    required: true
  },
  modifiedById: {
    type: String,
    default: "00000000-0000-0000-0000-000000000000",
    required: true
  },
  modifiedByDepartment: {
    type: String
  }
});

const Templates = mongoose.model<TemplateDocument>("Templates", templateSchema);

export default Templates;
