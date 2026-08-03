import mongoose from "mongoose";
import type { JobDocument } from "../../types/jobs.js";

const jobsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  approvedTimeStamp: {
    type: Date,
    required: true
  },
  jobCreatedTimeStamp: {
    type: Date,
    required: true
  },
  status: {
    syncRecipients: {
      type: String,
      default: "waiting",
      enum: ["waiting", "inprogress", "completed", "failed"],
      required: true
    },
    createCaseDocument: {
      type: String,
      default: "waiting",
      enum: ["waiting", "inprogress", "completed", "failed"],
      required: true
    },
    uploadAttachments: {
      type: String,
      default: "waiting",
      enum: ["waiting", "inprogress", "completed", "failed"],
      required: true
    },
    issueDispatch: {
      type: String,
      default: "waiting",
      enum: ["waiting", "inprogress", "completed", "failed"],
      required: true
    },
    createStatistics: {
      type: String,
      default: "waiting",
      enum: ["waiting", "inprogress", "completed", "failed"],
      required: true
    }
  },
  tasks: {
    type: Object,
    required: true,
    syncRecipients: {
      type: Array
    },
    createCaseDocument: {
      type: Array
    },
    uploadAttachments: {
      type: Array
    },
    issueDispatch: {
      type: Array
    },
    createStatistics: {
      type: Array
    }
  },
  failedTasks: []
});

const Jobs = mongoose.model<JobDocument>("Jobs", jobsSchema);

export default Jobs;
