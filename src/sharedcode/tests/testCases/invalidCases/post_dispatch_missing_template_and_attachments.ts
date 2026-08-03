import type { MockRequest } from "../../../../types/tests.js";

const testCase: MockRequest = {
  headers: {
    get: (_) => undefined,
    "x-api-key": process.env.APIKEYS_TEST
  },
  json: async () => {
    return {
      stats: {
        affectedCount: 8,
        area: null,
        totalOwners: 7,
        privateOwners: 2,
        businessOwners: 5
      },
      polygons: {
        extremes: {
          north: [10.300108, 59.497025],
          west: [10.300108, 59.497025],
          east: [10.300112, 59.497025],
          south: [10.300112, 59.49702]
        },
        EPSG: "4326",
        area: 0.12579970036309565,
        center: [10.30011, 59.4970225],
        polygons: [
          {
            extremes: {
              north: [10.300108, 59.497025],
              west: [10.300108, 59.497025],
              east: [10.300112, 59.497025],
              south: [10.300112, 59.49702]
            },
            EPSG: "4326",
            area: 0.12579970036309565,
            center: [10.30011, 59.4970225],
            vertices: [
              [10.300108, 59.497025],
              [10.300112, 59.497025],
              [10.300112, 59.49702],
              [10.300108, 59.49702],
              [10.300108, 59.497025],
              [10.300108, 59.497025]
            ],
            _id: "61fcf74807a4cea42f24942c"
          }
        ]
      },
      _id: "61fcf747033a6c44ebabdc7b",
      title: "Parallel test",
      projectnumber: "22/00009",
      archivenumber: "22/00009",
      validatedArchivenumber: "22/00009",
      archiveUrl: "https://360test.vtfk.no//locator.aspx?name=DMS.Case.Details.Simplified.2&recno=234483&module=Case&subtype=2",
      status: "completed",
      createdTimestamp: "2022-02-04T09:48:18.923Z",
      createdBy: "Jest Test",
      createdByEmail: "jest.test@vtfk.no",
      createdById: "ae34b275-ee14-4ece-b4a0-a03e7dc96313",
      createdByDepartment: "Test og Jest",
      modifiedTimestamp: "2022-02-04T10:40:17.075Z",
      modifiedBy: "apikey",
      modifiedByEmail: "apikey@vtfk.no",
      modifiedByDepartment: "apikey",
      modifiedById: "apikey",
      __v: 0,
      approvedBy: "Jest Test",
      approvedByEmail: "jest.test@vtfk.no",
      approvedById: "ae34b275-ee14-4ece-b4a0-a03e7dc96313",
      approvedTimestamp: "2022-02-03T09:52:23.218Z",
      e18Id: "61fd02901c5261b6db1c42c2"
    };
  }
};

export default testCase;
