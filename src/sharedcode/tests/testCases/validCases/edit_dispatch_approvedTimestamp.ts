import type { MockRequest } from "../../../../types/tests.js";

const testCase: MockRequest = {
  headers: {
    "x-api-key": process.env.APIKEYS_TEST
  },
  body: {
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
    status: "approved",
    template: {
      version: 10,
      name: "Varsel ved oppstart av prosjekt",
      description: "Mal for varsling til naboer ved oppstart av nytt prosjekt",
      language: "nb",
      documentDefinitionId: "brevmal",
      data: {
        tittel: "Parallel test",
        "beskrivelse av prosjekte": "Parallel test",
        fremdrift: "Parallel test",
        Regelverk: "Parallel test"
      },
      template:
        "IyBbW2xhYmVsPSJUaXR0ZWwiOnR5cGU9InN0cmluZyI6cGF0aD0idGl0dGVsIjpkZXNjcmlwdGlvbj0iQW5naSBlbiB0aXR0ZWwgcMOlIGJyZXZldCI6cmVxdWlyZWQ9InRydWUiXV0KCiMjIyBCZXNrcml2ZWxzZSBhdiBwcm9zamVrdGV0CltbbGFiZWw9IkJlc2tyaXZlbHNlIGF2IHByb3NqZWt0ZXQiOnR5cGU9InN0cmluZyI6cGF0aD0iYmVza3JpdmVsc2UgYXYgcHJvc2pla3RlIjpkZXNjcmlwdGlvbj0iQW5naSBlbiBiZXNrcml2ZWxzZSBhdiBwcm9zamVrdGV0ICI6cmVxdWlyZWQ9InRydWUiOmxpbmVzPSIxMCJdXQoKe3sjaWYgYXR0YWNobWVudHN9fQojIyMgVmVkbGVnZwp7eyNlYWNoIGF0dGFjaG1lbnRzfX0KKiB7e3RoaXMubmFtZX19Cnt7L2VhY2h9fQp7ey9pZn19CgojIyMgRnJlbWRyaWZ0IG9nIGZyaXN0IGZvciBpbm5zcGlsbApbW2xhYmVsPSJGcmVtZHJpZnQiOnR5cGU9InN0cmluZyI6cGF0aD0iZnJlbWRyaWZ0IjpkZXNjcmlwdGlvbj0iUGxhbmxhZ3QgZnJlbWRyaWZ0IGF2IHByb3NqZWt0ZXQiOnJlcXVpcmVkPSJ0cnVlIjpsaW5lcz0iNSJdXQoKIyMjIEFrdHVlbHQgcmVnZWx2ZXJrCltbbGFiZWw9IlJlZ2VsdmVyayI6dHlwZT0ic3RyaW5nIjpwYXRoPSJSZWdlbHZlcmsiOmRlc2NyaXB0aW9uPSJSZWdlbHZlcmsiOnJlcXVpcmVkPSJ0cnVlIjpsaW5lcz0iNSJdXQoKCgpNZWQgaGlsc2VuXAp7e2luZm8ub3VyLWNhc2V3b3JrZXJ9fQoK",
      _id: "61d84dad786bdf965164c6fc"
    },
    attachments: [
      {
        name: "Edit stack.docx",
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        size: 15449,
        lastModified: 1633956197000,
        lastModifiedDate: "2021-10-11T12:43:17.000Z"
      },
      {
        name: "LinuxSoftware.xlsx",
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 7415,
        lastModified: 1638108864000,
        lastModifiedDate: "2021-11-28T14:14:24.000Z"
      }
    ],
    owners: [
      {
        _type: "FysiskPerson",
        _namespace: "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/person",
        id: "1337",
        oppdateringsdato: "2020-06-15T22:40:57.525000000+02:00",
        versjonId: "3",
        oppdatertAv: "Kluthue",
        versjon: "1592253657600",
        nummer: "13374201337",
        navn: "Apeloff Apeloffsen",
        postadresse: {
          adresselinje2: "Error Veien 1",
          adresselinje3: "1337 Skrottfoss",
          postnummeromradeId: "69696969",
          landKodeId: "5001"
        },
        uuid: {
          navnerom: "https://data.geonorge.no/matrikkel",
          uuid: "80081675-9ffd-545a-aa3f-a079457a5d69"
        },
        etternavn: "Apeloffsen",
        fornavn: "Apeloff",
        spesifisertRegTypeKodeId: "1",
        bostedsadresse: {
          kommunenummer: "1337",
          adressekode: "1337",
          husnummer: "69",
          gardsnummer: "0",
          bruksnummer: "0",
          festenummer: "0",
          undernummer: "0",
          postnummer: "1337"
        },
        personStatusKodeId: "1",
        dsf: {
          FODT: "691337",
          PERS: "691337",
          INR: "13374201337",
          FODTAR: "1337",
          "STAT-KD": "1",
          STAT: "BOSATT",
          "NAVN-S": "Apeloff",
          "NAVN-F": "Apeloffsen",
          NAVN: "Apeloff Apeloffsen",
          Statsborgerskap: {
            "STATB-KD": "000",
            STATB: "NORGE"
          },
          KJONN: "M",
          FODKNR: "1337",
          FODK: "SKIEN",
          FNR: "13374201337",
          bostedsAdresse: {
            ADR: "Error Veien 1",
            POSTN: "1337",
            POSTS: "Skrottfoss"
          },
          postAdresse: {
            ADR: "Error Veien 1",
            POSTN: "1337",
            POSTS: "Skrottfoss"
          },
          personNavn: "Apeloff Apeloffsen"
        }
      },
      {
        _type: "FysiskPerson",
        _namespace: "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/person",
        id: "1337",
        oppdateringsdato: "2020-06-15T22:40:57.525000000+02:00",
        versjonId: "3",
        oppdatertAv: "Kluthue",
        versjon: "1592253657600",
        nummer: "13374201337",
        navn: "Apeloff Apeloffsen",
        postadresse: {
          adresselinje2: "Error Veien 2",
          adresselinje3: "1337 Skrottfoss",
          postnummeromradeId: "69696969",
          landKodeId: "5001"
        },
        uuid: {
          navnerom: "https://data.geonorge.no/matrikkel",
          uuid: "80081675-9ffd-545a-aa3f-a079457a5d69"
        },
        etternavn: "Kluthue",
        fornavn: "Kluthue",
        spesifisertRegTypeKodeId: "1",
        bostedsadresse: {
          kommunenummer: "1337",
          adressekode: "1337",
          husnummer: "69",
          gardsnummer: "0",
          bruksnummer: "0",
          festenummer: "0",
          undernummer: "0",
          postnummer: "1337"
        },
        personStatusKodeId: "1",
        dsf: {
          FODT: "691337",
          PERS: "691337",
          INR: "13374201337",
          FODTAR: "1337",
          "STAT-KD": "1",
          STAT: "BOSATT",
          "NAVN-S": "Kluthue",
          "NAVN-F": "Kluthue",
          NAVN: "Kluthue Kluthue",
          Statsborgerskap: {
            "STATB-KD": "000",
            STATB: "NORGE"
          },
          KJONN: "M",
          FODKNR: "1337",
          FODK: "SKIEN",
          FNR: "13374201337",
          bostedsAdresse: {
            ADR: "Error Veien 2",
            POSTN: "1337",
            POSTS: "Skrottfoss"
          },
          postAdresse: {
            ADR: "Error Veien 2",
            POSTN: "1337",
            POSTS: "Skrottfoss"
          },
          personNavn: "Kluthue Kluthue"
        }
      },
      {
        _type: "JuridiskPerson",
        _namespace: "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/person",
        id: "1337",
        oppdateringsdato: "2020-06-15T22:40:57.525000000+02:00",
        versjonId: "3",
        oppdatertAv: "Kluthue",
        versjon: "1592253657600",
        nummer: "13374201337",
        navn: "Kluthue Apeloffsen",
        postadresse: {
          adresselinje2: "Error Veien 2",
          adresselinje3: "1337 Skrottfoss",
          postnummeromradeId: "69696969",
          landKodeId: "5001"
        },
        uuid: {
          navnerom: "https://data.geonorge.no/matrikkel",
          uuid: "80081675-9ffd-545a-aa3f-a079457a5d69"
        },
        etternavn: "Apeloffsen",
        fornavn: "Kluthue",
        spesifisertRegTypeKodeId: "1",
        bostedsadresse: {
          kommunenummer: "1337",
          adressekode: "1337",
          husnummer: "69",
          gardsnummer: "0",
          bruksnummer: "0",
          festenummer: "0",
          undernummer: "0",
          postnummer: "1337"
        },
        personStatusKodeId: "1",
        dsf: {
          FODT: "691337",
          PERS: "691337",
          INR: "13374201337",
          FODTAR: "1337",
          "STAT-KD": "1",
          STAT: "BOSATT",
          "NAVN-S": "Kluthue",
          "NAVN-F": "Apeloffsen",
          NAVN: "Apeloff Apeloffsen",
          Statsborgerskap: {
            "STATB-KD": "000",
            STATB: "NORGE"
          },
          KJONN: "M",
          FODKNR: "1337",
          FODK: "SKIEN",
          FNR: "13374201337",
          bostedsAdresse: {
            ADR: "Error Veien 2",
            POSTN: "1337",
            POSTS: "Skrottfoss"
          },
          postAdresse: {
            ADR: "Error Veien 2",
            POSTN: "1337",
            POSTS: "Skrottfoss"
          },
          personNavn: "Apeloff Apeloffsen"
        }
      }
    ],
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
  }
};

export default testCase;
