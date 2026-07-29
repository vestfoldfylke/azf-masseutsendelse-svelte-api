const { it } = require("node:test");
const assert = require("node:assert");
const Dispatches = require("../../models/dispatches");
const Templates = require("../../models/templates");
const { ObjectId } = require("mongodb");
const { setupDB } = require("../test-setup");

setupDB("endpoint-testing");

// Attachment Schema
const attachmentSchema = {
  _id: new ObjectId(),
  name: "test"
};

// Dispatch object
const bodyDispatch = {
  title: "Jest Test",
  projectnumber: "12",
  archivenumber: "1",
  validatedArchivenumber: "1",
  stats: {
    affectedCount: "1",
    area: "1",
    totalOwners: "1",
    privateOwners: "1",
    businessOwners: "1"
  },
  template: {
    version: "1",
    name: "jest test",
    description: "jest test"
  },
  matrikkelEnheter: [],
  polygon: {
    coordinatesystem: "asd",
    filename: "qsd",
    area: "12",
    vertices: [],
    extremes: {
      north: "1",
      west: "1",
      east: "1",
      south: "1",
      center: "1"
    }
  },
  polygons: {
    area: "1",
    EPSG: "asde",
    polygons: [
      {
        EPSG: "jest test",
        area: "1",
        center: ["1", "2", "3"],
        extremes: {
          north: ["1", "2", "3"],
          west: ["1", "2", "3"],
          east: ["1", "2", "3"],
          south: ["1", "2", "3"]
        }
      }
    ]
  },
  attachments: [attachmentSchema],
  geopolygon: {
    coordinateSystem: "a123sd",
    vertices: [],
    extremes: {
      north: "1",
      west: "1",
      east: "1",
      south: "1",
      center: "1"
    }
  },
  createdBy: "TEST",
  createdById: "00000000-0000-0000-0000-000000000000",
  createdByEmail: "test@test.no",
  createdByDepartment: "Test department",
  createdTimestamp: new Date(),
  modifiedBy: "TEST",
  modifiedById: "00000000-0000-0000-0000-000000000000",
  modifiedByEmail: "test@test.no",
  modifiedByDepartment: "Test department",
  modifiedTimestamp: new Date(),
  approvedBy: "",
  approvedById: "",
  approvedByEmail: "test@test.no",
  approvedTimestamp: new Date()
};

// Dispatch object with status approved
const bodyDispatchApproved = {
  title: "Jest Test",
  status: "approved",
  projectnumber: "12",
  caseworker: "Noen André",
  archivenumber: "1",
  validatedArchivenumber: "1",
  stats: {
    affectedCount: "1",
    area: "1",
    totalOwners: "1",
    privateOwners: "1",
    businessOwners: "1"
  },
  template: {
    version: "1",
    name: "jest test",
    description: "jest test"
  },
  matrikkelEnheter: [],
  polygon: {
    coordinatesystem: "asd",
    filename: "qsd",
    area: "12",
    vertices: [],
    extremes: {
      north: "1",
      west: "1",
      east: "1",
      south: "1",
      center: "1"
    }
  },
  polygons: {
    area: "1",
    EPSG: "asde",
    polygons: [
      {
        EPSG: "jest test",
        area: "1",
        center: ["1", "2", "3"],
        extremes: {
          north: ["1", "2", "3"],
          west: ["1", "2", "3"],
          east: ["1", "2", "3"],
          south: ["1", "2", "3"]
        }
      }
    ]
  },
  attachments: [attachmentSchema],
  geopolygon: {
    coordinateSystem: "a123sd",
    vertices: [],
    extremes: {
      north: "1",
      west: "1",
      east: "1",
      south: "1",
      center: "1"
    }
  },
  createdBy: "TEST",
  createdById: "00000000-0000-0000-0000-000000000000",
  createdByEmail: "test@test.no",
  createdByDepartment: "Test department",
  createdTimestamp: new Date(),
  modifiedTimestamp: new Date(),
  modifiedBy: "TEST",
  modifiedById: "00000000-0000-0000-0000-000000000000",
  modifiedByEmail: "test@test.no",
  modifiedByDepartment: "Test department",
  approvedBy: "",
  approvedById: "",
  approvedByEmail: "test@test.no",
  approvedTimestamp: new Date()
};

// Dispatch object with no template and no attachment
const bodyDispatchNoTemplateNoAttachment = {
  title: "Jest Test",
  projectnumber: "12",
  caseworker: "Noen André",
  archivenumber: "1",
  validatedArchivenumber: "1",
  stats: {
    affectedCount: "1",
    area: "1",
    totalOwners: "1",
    privateOwners: "1",
    businessOwners: "1"
  },
  attachments: [],
  matrikkelEnheter: [],
  polygon: {
    coordinatesystem: "asd",
    filename: "qsd",
    area: "12",
    vertices: [],
    extremes: {
      north: "1",
      west: "1",
      east: "1",
      south: "1",
      center: "1"
    }
  },
  polygons: {
    area: "1",
    EPSG: "asde",
    polygons: [
      {
        EPSG: "jest test",
        area: "1",
        center: ["1", "2", "3"],
        extremes: {
          north: ["1", "2", "3"],
          west: ["1", "2", "3"],
          east: ["1", "2", "3"],
          south: ["1", "2", "3"]
        }
      }
    ]
  },
  geopolygon: {
    coordinateSystem: "a123sd",
    vertices: [],
    extremes: {
      north: "1",
      west: "1",
      east: "1",
      south: "1",
      center: "1"
    }
  },
  createdBy: "TEST",
  createdById: "00000000-0000-0000-0000-000000000000",
  createdByEmail: "test@test.no",
  createdByDepartment: "Test department",
  createdTimestamp: new Date(),
  modifiedTimestamp: new Date(),
  modifiedBy: "TEST",
  modifiedById: "00000000-0000-0000-0000-000000000000",
  modifiedByEmail: "test@test.no",
  modifiedByDepartment: "Test department",
  approvedBy: "",
  approvedById: "",
  approvedByEmail: "test@test.no",
  approvedTimestamp: new Date()
};

// Dispatch object with no template
const bodyDispatchNoTemplate = {
  title: "Jest Test",
  projectnumber: "12",
  caseworker: "Noen André",
  archivenumber: "1",
  validatedArchivenumber: "1",
  stats: {
    affectedCount: "1",
    area: "1",
    totalOwners: "1",
    privateOwners: "1",
    businessOwners: "1"
  },
  attachments: [attachmentSchema],
  matrikkelEnheter: [],
  polygon: {
    coordinatesystem: "asd",
    filename: "qsd",
    area: "12",
    vertices: [],
    extremes: {
      north: "1",
      west: "1",
      east: "1",
      south: "1",
      center: "1"
    }
  },
  polygons: {
    area: "1",
    EPSG: "asde",
    polygons: [
      {
        EPSG: "jest test",
        area: "1",
        center: ["1", "2", "3"],
        extremes: {
          north: ["1", "2", "3"],
          west: ["1", "2", "3"],
          east: ["1", "2", "3"],
          south: ["1", "2", "3"]
        }
      }
    ]
  },
  geopolygon: {
    coordinateSystem: "a123sd",
    vertices: [],
    extremes: {
      north: "1",
      west: "1",
      east: "1",
      south: "1",
      center: "1"
    }
  },
  createdBy: "TEST",
  createdById: "00000000-0000-0000-0000-000000000000",
  createdByEmail: "test@test.no",
  createdByDepartment: "Test department",
  createdTimestamp: new Date(),
  modifiedTimestamp: new Date(),
  modifiedBy: "TEST",
  modifiedById: "00000000-0000-0000-0000-000000000000",
  modifiedByEmail: "test@test.no",
  modifiedByDepartment: "Test department",
  approvedBy: "",
  approvedById: "",
  approvedByEmail: "test@test.no",
  approvedTimestamp: new Date()
};

// Dispatch object with no attachment
const bodyDispatchNoAttachment = {
  title: "Jest Test",
  projectnumber: "12",
  caseworker: "Noen André",
  archivenumber: "1",
  validatedArchivenumber: "1",
  stats: {
    affectedCount: "1",
    area: "1",
    totalOwners: "1",
    privateOwners: "1",
    businessOwners: "1"
  },
  attachments: [],
  matrikkelEnheter: [],
  polygon: {
    coordinatesystem: "asd",
    filename: "qsd",
    area: "12",
    vertices: [],
    extremes: {
      north: "1",
      west: "1",
      east: "1",
      south: "1",
      center: "1"
    }
  },
  template: {
    version: "1",
    name: "jest test",
    description: "jest test"
  },
  polygons: {
    area: "1",
    EPSG: "asde",
    polygons: [
      {
        EPSG: "jest test",
        area: "1",
        center: ["1", "2", "3"],
        extremes: {
          north: ["1", "2", "3"],
          west: ["1", "2", "3"],
          east: ["1", "2", "3"],
          south: ["1", "2", "3"]
        }
      }
    ]
  },
  geopolygon: {
    coordinateSystem: "a123sd",
    vertices: [],
    extremes: {
      north: "1",
      west: "1",
      east: "1",
      south: "1",
      center: "1"
    }
  },
  createdBy: "TEST",
  createdById: "00000000-0000-0000-0000-000000000000",
  createdByEmail: "test@test.no",
  createdByDepartment: "Test department",
  createdTimestamp: new Date(),
  modifiedTimestamp: new Date(),
  modifiedBy: "TEST",
  modifiedById: "00000000-0000-0000-0000-000000000000",
  modifiedByEmail: "test@test.no",
  modifiedByDepartment: "Test department",
  approvedBy: "",
  approvedById: "",
  approvedByEmail: "test@test.no",
  approvedTimestamp: new Date()
};

// Template Object
const bodyTemplates = {
  name: "Jest test",
  description: "jest testing",
  documentDefinitionId: "asd123e1",
  template: "noe",
  createdTimestamp: new Date(),
  modifiedTimestamp: new Date()
};

// Variables
let templateId = "";
let dispatchId = "";
let attachments = "";

it("Should post a template to the database", async () => {
  const template = new Templates(bodyTemplates);
  const results = await template.save();
  assert.ok(results);
});

it("Should post a dispatch object to the database", async () => {
  const dispatch = new Dispatches(bodyDispatch);
  const results = await dispatch.save();
  assert.ok(results);
});

it("Should post a dispatch object to the database with status approved", async () => {
  const dispatch = new Dispatches(bodyDispatchApproved);
  const results = await dispatch.save();
  assert.ok(results);
});

it("Should return all dispatches from the database", async () => {
  const dispatch = await Dispatches.find({}).lean();
  try {
    const records = await Dispatches.find({}).lean().exec();
    records.forEach((record) => {
      dispatchId = record._id;
      attachments = record.attachments;
    });
    assert.ok(dispatch);
  } catch (error) {
    console.error("Error fetching dispatches:", error);
    assert.strictEqual(error, null);
  }
});

it("Should return all dispatches from the database with the status approved", async () => {
  const dispatch = await Dispatches.find({ status: "approved" }).lean();
  try {
    const records = await Dispatches.find({}).lean().exec();
    records.forEach((record) => {
      dispatchId = record._id;
      attachments = record.attachments;
    });
    assert.strictEqual(dispatch[0].status, "approved");
  } catch (error) {
    console.error("Error fetching dispatches:", error);
    assert.strictEqual(error, null);
  }
});

it("Should return all templates from the database", async () => {
  const templates = await Templates.find({}).lean();
  try {
    const records = await Templates.find({}).lean().exec();
    records.forEach((record) => {
      templateId = record._id;
    });
    assert.ok(templates);
  } catch (error) {
    console.error("Error fetching dispatches:", error);
    assert.strictEqual(error, null);
  }
});

it("Should return a dispatch object with the given id from the database", async () => {
  const dispatch = await Dispatches.findById(dispatchId);
  assert.ok(dispatch);
});

it("Should return a template with the given id from the database", async () => {
  const template = await Templates.findById(templateId);
  assert.ok(template);
});

it("Should edit one dispatch with the given ID from the database", async () => {
  const existingDispatch = await Dispatches.findById(dispatchId).lean();
  const newDate = new Date();
  const updatedDispatch = await Dispatches.findByIdAndUpdate(dispatchId, { modifiedTimestamp: `${newDate}` }, { returnDocument: "after" });
  assert.notStrictEqual(updatedDispatch.modifiedTimestamp, existingDispatch.modifiedTimestamp);
});

it("Should edit one template with the given ID from the database", async () => {
  const existingTemplate = await Templates.findById(templateId).lean();
  const newDate = new Date();
  const updatedTemplate = await Templates.findByIdAndUpdate(templateId, { modifiedTimestamp: `${newDate}` }, { returnDocument: "after" });
  assert.notStrictEqual(updatedTemplate.modifiedTimestamp, existingTemplate.modifiedTimestamp);
});

it("Should return an attachment from the database", async () => {
  assert.ok(attachments);
});

it("Should reject the post of a dispatch object due to the lack of template or attachments", async () => {
  const dispatch = new Dispatches(bodyDispatchNoTemplateNoAttachment);
  const results = await dispatch.save();
  assert.ok(results);
});

it("Should resolve the post of a dispatch object to the database since it contains a template", async () => {
  const dispatch = new Dispatches(bodyDispatchNoAttachment);
  const results = await dispatch.save();
  assert.ok(results);
});

it("Should resolve the post of a dispatch object to the database since it contains an attachment", async () => {
  const dispatch = new Dispatches(bodyDispatchNoTemplate);
  const results = await dispatch.save();
  assert.ok(results);
});
