# azf-masseutsendelse-api

API used to by masseutsendelse-web to communicate with various systems and APIs.

# Usage

## Setup dependencies

1. Create an Azure App Registration
2. Add custom claim for **department** attribute for the app registration
   https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-claims-mapping#include-the-employeeid-and-tenantcountry-as-claims-in-tokens
3. Create an MongoDB database
## Setup project

1. Clone/Fork the project
2. run **npm i** to install project dependencies
3. Set up the environment variables in **local.settings.json**
4. run **npm test** to test the code
5. run **func start** to start dev environment locally
6. Deploy to Azure

## Environment variables

| Variable                      | Description                                                                                                   | Example                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| MONGODB_CONNECTIONSTRING      | The connecting string for a MongoDB database                                                                  | mongodb+srv://**[account]**:**[password]**@[clustername]/masseutsendelse?retryWrites=true&w=majority             |
| AZURE_BLOB_CONNECTIONSTRING   | The connectionstring for Azure Storage account blob                                                           | DefaultEndpointsProtocol=https;AccountName=[AccountName];AccountKey=[AccountKey];EndpointSuffix=core.windows.net |
| AZURE_BLOB_CONTAINERNAME      | The container name of the blob storage                                                                        | blobs                                                                                                            |
| AZUREAD_ALLOWEDGROUPS         | Comma separated list of app role ids (from the X-MS-CLIENT-PRINCIPAL roles claim)                             | bf9f0fb9-47c8-474d-be11-354a41a9f16f, b519ee09-6259-4459-8ead-a3e7afaaf018                                       |
| AZUREAD_SKIP_DEPARTMENT_CHECK | Comma separated list of user upn's to skip department check                                                   | bjarne.betjent@sesamstasjon.no,o.tidemann@sesamstasjon.no                                                        |
| AZUREAD_SKIP_DEPARTMENT_NAME  | The department name to use for users skipping department check                                                | Sesam stasjon                                                                                                    |
| AZURE_CLIENT_ID               | The Azure application id for service to service auth                                                          | guid                                                                                                             |
| AZURE_CLIENT_SECRET           | The Azure application secret for service to service auth                                                      | secret                                                                                                           |
| AZURE_TENANT_ID               | The Azure tenant id for service to service auth                                                               | guid                                                                                                             |
| APIKEYS                       | Any API key(s) you want to be valid                                                                           | APIKey                                                                                                           |
| MATRIKKEL_BASEURL             | The baseurl for the MatrikkelProxyAPI                                                                         | https://**[url]**/.**[domain]**/api                                                                              |
| MATRIKKEL_SCOPE               | Matrikkel scope                                                                                               | [scope]                                                                                                          |
| PDFGENERATOR_ENDPOINT         | The endpoint url for azf-pdfgenerator v2 endpoint                                                             |                                                                                                                  |
| PDFGENERATOR_X_FUNCTIONS_KEY  | Auth key                                                                                                      | [Key]                                                                                                            |
| STATISTICS_URL                | The endpoint url for statistics api                                                                           | https://**[url]**/.**[domain]**/api                                                                              |
| STATISTICS_KEY                | Auth key                                                                                                      | [Key]                                                                                                            |
| ARCHIVE_URL                   | azf-archive endpoint                                                                                          | https://**[url]**/.**[domain]**/api                                                                              |
| ARCHIVE_SCOPE                 | Archive scope                                                                                                 | [scope]                                                                                                          |
| ARCHIVE_SHOW_DISPATCH_URL     | URL to show the dispatch in archive system                                                                    | https://archive.endpoint.url/                                                                                    |
| TEAMS_ALERTS_WEBHOOK_URL      | Webhook for teams alerts                                                                                      | [webhook]                                                                                                        |
| GRAPH_SCOPE                   | Graph scope                                                                                                   | https://graph.microsoft.com/.default                                                                             |
| GRAPH_URL                     | Graph url                                                                                                     | https://graph.microsoft.com/v1.0                                                                                 |
| BYPASS_REGISTRATION_THRESHOLD | Set to true to allow dispatching same day as creation, set to false or omit to enforce registration threshold | true                                                                                                             |
| AUTH_DEVELOPMENT_NAME         | Used to mock a user when running in development (NODE_ENV)                                                    | Bjarne Betjent                                                                                                   |
| AUTH_DEVELOPMENT_ID           | Used to mock a user when running in development (NODE_ENV)                                                    | guid                                                                                                             |
| AUTH_DEVELOPMENT_DEPARTMENT   | Used to mock a user when running in development (NODE_ENV)                                                    | Sesam stasjon                                                                                                    |
| AUTH_DEVELOPMENT_EMAIL        | Used to mock a user when running in development (NODE_ENV)                                                    | bjarne.betjent@sesamstasjon.no                                                                                   |
| NODE_ENV                      | When set to "development", a mock user is used instead of the user from the actual token                      | `development` or `production`                                                                                    |


## Endpoints GET

**`GET /dispatches`**

Will return all the dispatch objects from the database, will return empty array if there's no dispatch objects found.

**`GET /dispatches/{id}`**

Will return the dispatch object with the id provided. It will only return one single object.

### Example dispatches & dispatches /{id}

```json5
[
    {
        "stats": {
            "affectedCount": 58,
            "area": null,
            "totalOwners": 61,
            "privateOwners": 51,
            "businessOwners": 10
        },
        "polygons": {
            "extremes": {
                "north": [
                    512590.93,
                    6572724.996
                ],
                "west": [
                    511851.99,
                    6572411.712
                ],
                "east": [
                    515118.2359720102,
                    6572049.915187314
                ],
                "south": [
                    514641.8071519889,
                    6571805.49782388
                ]
            },
            "EPSG": "5972",
            "area": 1633928024411775.2,
            "center": [
                513485.1129860051,
                6572265.24691194
            ],
            "polygons": [ //Array with all the polygons in the uploaded file. 
                {
                    "extremes": {
                        "north": [
                            512590.93,
                            6572724.996
                        ],
                        "west": [
                            511851.99,
                            6572411.712
                        ],
                        "east": [
                            514608.599,
                            6572177.313999999
                        ],
                        "south": [
                            514508.099,
                            6572073.137999999
                        ]
                    },
                    "EPSG": "5972",
                    "area": 1037662459883201,
                    "center": [
                        513230.29449999996,
                        6572399.067
                    ],
                    "vertices": [ //Polygon points
                        [
                            512039.7249999999,
                            6572426.734
                        ],
                        [
                            512038.389,
                            6572459.488
                        ],
                        [
                            512072.92,
                            6572477.272000001
                        ],
                        [
                            512039.7249999999,
                            6572426.734
                        ]
                    ],
                    "_id": "620f63a03ce6a6a47546527d"
                }
            ]
        },
        "_id": "620f639ad96d2f1ef80e6fd6",
        "title": "Møte demo",
        "projectnumber": "Møte demo",
        "archivenumber": "22/00009", //Valid archive number from P360
        "validatedArchivenumber": "22/00009",
        "archiveUrl": "https://360test.vtfk.no",
        "status": "approved",
        "template": {
            "version": 10,
            "name": "Varsel ved oppstart av prosjekt",
            "description": "Mal for varsling til naboer ved oppstart av nytt prosjekt",
            "language": "nb",
            "documentDefinitionId": "brevmal",
            "data": { //Content of the template
                "tittel": "Demo",
                "beskrivelse av prosjektet": "Demo",
                "fremdrift": "Demo",
                "Regelverk": "Demo"
            },
            "template": "Base64",
            "_id": "61d84dad786bdf965164c6fc"
        },
        "attachments": [
            {
                "name": "Excel regneark.xlsx",
                "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "size": 8716,
                "lastModified": 1643815296076,
                "lastModifiedDate": "2022-02-02T15:21:36.076Z"
            }
        ],
        "createdTimestamp": "2022-02-18T09:08:28.705Z",
        "createdBy": "Demo Demosen",
        "createdByEmail": "demo.demosen@vtfk.no",
        "createdById": "ea35b300-ee14-5fch-b4a0-a03e7dc91337",
        "createdByDepartment": "Teknologi og digitalisering",
        "modifiedTimestamp": "2022-02-18T09:17:30.910Z",
        "modifiedBy": "Demo Demosen",
        "modifiedByEmail": "demo.demosen@vtfk.no",
        "modifiedByDepartment": "Teknologi og digitalisering",
        "modifiedById": "ea35b300-ee14-5fch-b4a0-a03e7dc91337",
        "__v": 0,
        "approvedBy": "Demo Demosen",
        "approvedByEmail": "demo.demosen@vtfk.no",
        "approvedById": "ea35b300-ee14-5fch-b4a0-a03e7dc91337",
        "approvedTimestamp": "2022-02-18T09:17:31.004Z",
        "inProgressTimestamp": "2022-02-19T12:00:01.004Z",
        "completedTimestamp": "2022-02-19T12:40:01.004Z"
    }
]
```

**`GET /readyDisptaches`**

Will return all the dispatches with status='approved' and if the dispatch has passed the registration threshold.
It will also create the E18 Job, which will include any attachments and templates used and the receivers of the documents. The E18 job will consist of an array of tasks needed to be performed by E18.

For documentation on E18:
- https://github.com/vtfk/E18-api

### Example readyDisptaches

```json5
[
    {
        "_id": "620f639ad96d2f1ef80e6fd6",
        "e18Job": {
            "system": "masseutsendelse", //System for E18 to recognize
            "projectId": 30,
            "type": "masseutsendelse",
            "parallel": true,
            "delayUntil": "2022-02-19T11:00:00.000Z",
            "tasks": [
                {
                    "system": "p360",
                    "method": "SyncPrivatePerson",
                    "dependencyTag": "sync",
                    "data": {
                        "ssn": "01010101010"
                    }
                },
                {
                    "system": "p360",
                    "method": "SyncEnterprise",
                    "dependencyTag": "sync",
                    "data": {
                        "orgnr": "101010101"
                    }
                },
                {
                    "system": "p360",
                    "method": "archive",
                    "dependencyTag": "createCaseDocument",
                    "dependencies": [
                        "sync"
                    ],
                    "data": {
                        "system": "masseutsendelse",
                        "template": "utsendelsesdokument",
                        "parameter": {
                            "title": "Demo",
                            "caseNumber": "22/00009",
                            "date": "2022-02-18T11:51:46.223Z",
                            "contacts": [
                                {
                                    "ssn": "01010101010",
                                    "role": "Mottaker"
                                },
                                {
                                    "ssn": "101010101",
                                    "role": "Mottaker"
                                }
                            ],
                            "attachments": [
                                {
                                    "title": "Demo",
                                    "format": "pdf",
                                    "versionFormat": "A",
                                    "base64": "base64"
                                }
                            ],
                            "accessCode": "U",
                            "accessGroup": "Alle",
                            "paragraph": "",
                            "responsiblePersonEmail": "demo.demosen@vtfk.no"
                        }
                    }
                },
                {
                    "system": "p360",
                    "method": "archive",
                    "dependencyTag": "uploadAttachment-1",
                    "dependencies": [
                        "createCaseDocument"
                    ],
                    "dataMapping": "parameter.documentNumber=DocumentNumber",
                    "data": {
                        "system": "archive",
                        "template": "add-attachment",
                        "parameter": {
                            "secure": false,
                            "title": "test",
                            "format": ".txt",
                            "base64": "base64",
                            "versionFormat": "P"
                        }
                    }
                },
                {
                    "system": "p360",
                    "method": "archive",
                    "dependencies": [
                        "uploadAttachment-1"
                    ],
                    "dataMapping": "{\"parameter\": { \"Documents\": [ { \"DocumentNumber\": \"{{DocumentNumber}}\" }]}}",
                    "data": {
                        "method": "DispatchDocuments",
                        "service": "DocumentService"
                    }
                }
            ]
        }
    }
]
```

**`GET /blobs/{id}/{name}`**

Will return the requested file from the requested dispatch object.

For documentation on the azure-blob-client:
- https://github.com/vtfk/azure-blob-client

### Example /blobs/{id}/{name}

```json5
{
  "name": "Mail.msg",
  "path": "620fa95b909f461cacf5adf2/Mail.msg", //Path used to locate the requested file, /{id}/{name}
  "extension": "msg",
  "type": "application/octet-stream",
  "encoding": "base64",
  "data": "some string value"
}
```

**`GET /matrikkel/{endpoint}`**

This endpoint will return an array of owners with additional information from Brønnøysundregisteret or Det sentrale folkeregister. The endpoint will contact either of these two to get additional information about the owner. If the type is 'JuridiskPerson' it will contact Brønnøysundregisteret and if the type is 'FysiskPerson' it will contact Det sentrale folkeregister.

For Documentation on the matrikkel-proxy:
- https://github.com/vtfk/kartverket-matrikkel-api

### Example /matrikkel/{endpoint}

```json
[
  {
    "_type": "FysiskPerson",
    "_namespace": "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/person",
    "id": {
      "_type": "FysiskPersonId",
      "_namespace": "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/person",
      "value": "1"
    },
    "oppdateringsdato": "2021-02-28T03:08:55.344000000+01:00",
    "versjonId": "1",
    "oppdatertAv": "eksternregister1",
    "versjon": "1",
    "nummer": "01010101010",
    "navn": "DEMO DEMOSEN",
    "postadresse": {
      "adresselinje2": "Demo vegen 3",
      "adresselinje3": "1337 Demo",
      "postnummeromradeId": "101010101",
      "landKodeId": "0000"
    },
    "uuid": {
      "navnerom": "https://data.geonorge.no/matrikkel",
      "uuid": "8f6420fd-3a70-5da4-aa11-b925s8bbec6b"
    },
    "etternavn": "DEMOSEN",
    "fornavn": "DEMO",
    "spesifisertRegTypeKodeId": "10",
    "bostedsadresse": {
      "kommunenummer": "1337",
      "adressekode": "0000",
      "husnummer": "1",
      "gardsnummer": "0",
      "bruksnummer": "0",
      "festenummer": "0",
      "undernummer": "0",
      "postnummer": "1337"
    },
    "personStatusKodeId": "1",
    "dsf": ["Object"],
    "Statsborgerskap": ["Object"],
    "KJONN": "K",
    "FODKNR": "0101",
    "FODK": "Demo",
    "FODS": "Demo",
    "FNR": "01010101010",
    "bostedsAdresse": ["Object"],
    "postAdresse": ["Object"],
    "personNavn": "Demo Demosen"
  }
]
```

**`GET /templates`**

Will return all the templates found in the database.

**`GET /templates/{id}`**

Will return the template with the id provided. It will only return one single object.

### Example templates & templates/{id}

```json
[
  {
    "_id": "61d84dad786bdf965164c6fc",
    "name": "Varsel ved oppstart av prosjekt",
    "description": "Mal for varsling til naboer ved oppstart av nytt prosjekt",
    "version": 1,
    "enabled": true,
    "documentDefinitionId": "brevmal",
    "template": "base64",
    "language": "nb",
    "createdTimestamp": "2022-01-07T14:25:08.981Z",
    "createdBy": "Demo",
    "createdById": "00000000-0000-0000-0000-000000000000",
    "modifiedTimestamp": "2022-01-27T08:46:01.524Z",
    "modifiedBy": "Demo Demosen",
    "modifiedById": "00000000-0000-0000-0000-000000000000",
    "__v": 0,
    "modifiedByDepartment": "Teknologi og digitalisering"
  }
]
```

## Endpoints POST

**`POST /dispatches`**

This endpoint is used to post a new dispatch object to the mongoDB.

### Example /dispatches

```json5

{
   "title": "Demo",
   "projectnumber": "Demo ",
   "archivenumber": "22/00009",
   //Valid archive number in p360
   "template": {
      //Selected template
      "_id": "61d84dad786bdf965164c6fc",
      "name": "Demo",
      "description": "Mal for varsling til av demo",
      "version": 10,
      "enabled": true,
      "documentDefinitionId": "brevmal",
      "template": "base64",
      "language": "nb",
      "createdTimestamp": "2022-01-07T14:25:08.981Z",
      "createdBy": "Demo",
      "createdById": "00000000-0000-0000-0000-000000000000",
      "modifiedTimestamp": "2022-01-27T08:46:01.524Z",
      "modifiedBy": "Demo Demosen",
      "modifiedById": "e134g211-ee11-7ece-b4a0-a13j7dc96313",
      "__v": 0,
      "modifiedByDepartment": "Teknologi og digitalisering",
      "data": {
         //Data from the template
         "tittel": "Demo",
         "beskrivelse av prosjektet": "Demo",
         "fremdrift": "Demo",
         "Regelverk": " § Demo"
      }
   },
   "attachments": [
      {
         "name": "demo.png",
         "type": "demo/png",
         "size": 153617,
         "lastModified": 1644922741231,
         "lastModifiedDate": "[native Date Tue Feb 15 2022 11:59:01 GMT+0100 (sentraleuropeisk normaltid)]",
         "data": "data:demo/png;base64"
      }
   ],
   "owners": [
      //List of owners
      {
         "_type": "FysiskPerson",
         "_namespace": "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/person",
         "id": "1010101",
         "oppdateringsdato": "2020-06-15T22:40:57.525000000+02:00",
         "versjonId": "3",
         "oppdatertAv": "smatmynd",
         "versjon": "1010101010101",
         "nummer": "01010101010",
         "navn": "DEMO DEMOSEN",
         "postadresse": {
            "adresselinje2": "Demo vegen 3",
            "adresselinje3": "1337 Demo",
            "postnummeromradeId": "101010101",
            "landKodeId": "0000"
         },
         "uuid": {
            "navnerom": "https://data.geonorge.no/matrikkel",
            "uuid": "8f6420fd-3a70-5da4-aa11-b925s8bbec6b"
         },
         "etternavn": "DEMOSEN",
         "fornavn": "DEMO",
         "spesifisertRegTypeKodeId": "10",
         "bostedsadresse": {
            "kommunenummer": "1337",
            "adressekode": "0000",
            "husnummer": "1",
            "gardsnummer": "0",
            "bruksnummer": "0",
            "festenummer": "0",
            "undernummer": "0",
            "postnummer": "1337"
         },
         "personStatusKodeId": "1",
         "dsf": [
            "Object"
         ],
         "ownerships": [
            //What the given owner owns inside the polygon. 
            {
               "_type": "PersonTinglystEierforhold",
               "_namespace": "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/matrikkelenhet",
               "oppdateringsdato": "2020-06-17T22:16:57.579000000+02:00",
               "versjonId": "3",
               "oppdatertAv": "smatmynd",
               "id": "10101010",
               "kommuneId": "1337",
               "eierforholdKodeId": "0",
               "uuid": {
                  "navnerom": "https://data.geonorge.no/matrikkel",
                  "uuid": "8a5ddad5-9666-5d96-8323-9c0db83f3168"
               },
               "andel": {
                  "teller": "1",
                  "nevner": "1"
               },
               "datoFra": "1337-01-01",
               "eierId": "1010101",
               "andelsnummer": "1",
               "unit": {
                  "_type": "Grunneiendom",
                  "_namespace": "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/matrikkelenhet",
                  "id": {
                     "_type": "GrunneiendomId",
                     "_namespace": "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/matrikkelenhet",
                     "value": "10101010"
                  },
                  "oppdateringsdato": "2020-06-15T20:24:05.913000000+02:00",
                  "versjonId": "4",
                  "oppdatertAv": "smatmynd",
                  "versjon": "1010101010101",
                  "matrikkelnummer": {
                     "kommuneId": "1337",
                     "gardsnummer": "1",
                     "bruksnummer": "1",
                     "festenummer": "1",
                     "seksjonsnummer": "0"
                  },
                  "etableringsdato": "1337-01-01",
                  "historiskOppgittAreal": "0.0",
                  "historiskArealkildeId": "0",
                  "tinglyst": "true",
                  "skyld": "10.10",
                  "bruksnavn": "DEMO",
                  "teigerForMatrikkelenhet": [
                     {
                        "oppdateringsdato": "2020-06-18T02:23:21.797000000+02:00",
                        "versjonId": "2",
                        "oppdatertAv": "smatmynd",
                        "id": "101010101",
                        "hovedteig": "false",
                        "teigId": "01010101",
                        "uuid": {
                           "navnerom": "https://data.geonorge.no/matrikkel",
                           "uuid": "1f1d116r-5e41-5613-a327-d01c01110bf0"
                        }
                     },
                     {
                        "oppdateringsdato": "2020-06-18T02:23:21.797000000+02:00",
                        "versjonId": "2",
                        "oppdatertAv": "smatmynd",
                        "id": "101010101",
                        "hovedteig": "true",
                        "teigId": "01010101",
                        "uuid": {
                           "navnerom": "https://data.geonorge.no/matrikkel",
                           "uuid": "1f1d116r-5e41-5613-a327-d01c01110bf0"
                        }
                     }
                  ],
                  "erSeksjonert": "false",
                  "harAktiveFestegrunner": "false",
                  "harAnmerketKlage": "false",
                  "harRegistrertGrunnerverv": "false",
                  "harRegistrertJordskifteKrevd": "false",
                  "inngarISamlaFastEiendom": "false",
                  "harGrunnforurensing": "false",
                  "harKulturminne": "true",
                  "harAvtaleGrensePunktfeste": "false",
                  "harAvtaleStedbundenRettighet": "false",
                  "utgatt": "false",
                  "underSammenslaingBestar": "false",
                  "underSammenslaingUtgar": "false",
                  "oppmalingIkkeFullfort": "false",
                  "grensepunktmerkingMangler": "false",
                  "mangelMatrikkelforingskrav": "false",
                  "nymatrikulert": "false",
                  "etterML9BTilH": "false",
                  "kommunalTilleggsdel": {
                     "kartblader": "",
                     "brukAvGrunnKodeId": "0",
                     "kommentarer": "",
                     "matrikkelenhetReferanser": "",
                     "undereiendommerIds": ""
                  },
                  "uuid": {
                     "navnerom": "https://data.geonorge.no/matrikkel",
                     "uuid": "1f1d116r-5e41-5613-a327-d01c01110bf0"
                  }
               }
            }
         ]
      },
      {
         "_type": "JuridiskPerson",
         "_namespace": "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/person",
         "id": "1010101",
         "oppdateringsdato": "2020-06-15T22:40:57.525000000+02:00",
         "versjonId": "3",
         "oppdatertAv": "smatmynd",
         "versjon": "1010101010101",
         "nummer": "0101010101",
         "navn": "DEMO DEMOSEN",
         "postadresse": {
            "adresselinje2": "Demo vegen 3",
            "postnummeromradeId": "101010101",
            "landKodeId": "0000"
         },
         "uuid": {
            "navnerom": "https://data.geonorge.no/matrikkel",
            "uuid": "8f6420fd-3a70-5da4-aa11-b925s8bbec6b"
         },
         "forretningsadresse": {
            "adresselinje1": "Demo vegen 3",
            "postnummeromradeId": "101010101",
            "landKodeId": "0000"
         },
         "organisasjonsformKode": {
            "orgformNavn": "Demo",
            "orgformKode": "DEMO"
         },
         "brreg": {
            "organisasjonsnummer": "0101010101",
            "navn": "DEMO DEMOSEN",
            "organisasjonsform": {
               "kode": "DEMO",
               "beskrivelse": "Demo",
               "_links": "https://data.brreg.no/enhetsregisteret/api/organisasjonsformer/KOMM"
            },
            "hjemmeside": "www.demo.demosen.no/",
            "registreringsdatoEnhetsregisteret": "1337-01-01",
            "registrertIMvaregisteret": true,
            "frivilligMvaRegistrertBeskrivelser": "Utleier av bygg eller anlegg",
            "naeringskode1": {
               "beskrivelse": "Generell offentlig demo",
               "kode": "10.110"
            },
            "antallAnsatte": "0101",
            "forretningsadresse": {
               "land": "Norge",
               "landkode": "NO",
               "postnummer": "1337",
               "poststed": "DEMO",
               "adresse": "Demo vegen 3",
               "kommune": "DEMO",
               "kommunenummer": "1377"
            },
            "institusjonellSektorkode": {
               "kode": "1377",
               "beskrivelse": "Demoforvaltningen"
            },
            "registrertIForetaksregisteret": false,
            "registrertIStiftelsesregisteret": false,
            "registrertIFrivillighetsregisteret": false,
            "konkurs": false,
            "underAvvikling": false,
            "underTvangsavviklingEllerTvangsopplosning": false,
            "maalform": "Bokmål",
            "_links": "https://data.brreg.no/enhetsregisteret/api/enheter/101010101"
         },
         "ownerships": [
            {
               "_type": "JuridiskPersonTinglystEierforhold",
               "_namespace": "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/matrikkelenhet",
               "oppdateringsdato": "2020-06-17T22:16:57.579000000+02:00",
               "versjonId": "3",
               "oppdatertAv": "smatmynd",
               "id": "10101010",
               "kommuneId": "1337",
               "eierforholdKodeId": "0",
               "uuid": {
                  "navnerom": "https://data.geonorge.no/matrikkel",
                  "uuid": "f18381cc-234f-559a-a0cc-16bba7402c4b"
               },
               "andel": {
                  "teller": "1",
                  "nevner": "1"
               },
               "datoFra": "1337-01-01",
               "eierId": "10101010",
               "andelsnummer": "2",
               "unit": {
                  "_type": "Grunneiendom",
                  "_namespace": "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/matrikkelenhet",
                  "id": {
                     "_type": "GrunneiendomId",
                     "_namespace": "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/matrikkelenhet",
                     "value": "10101010"
                  },
                  "oppdateringsdato": "2020-06-15T20:24:05.913000000+02:00",
                  "versjonId": "3",
                  "oppdatertAv": "smatmynd",
                  "versjon": "1010101010101",
                  "matrikkelnummer": {
                     "kommuneId": "1337",
                     "gardsnummer": "1",
                     "bruksnummer": "1",
                     "festenummer": "0",
                     "seksjonsnummer": "0"
                  },
                  "historiskOppgittAreal": "0.0",
                  "historiskArealkildeId": "0",
                  "tinglyst": "true",
                  "skyld": "1.01",
                  "bruksnavn": "DEMO OG DEMO",
                  "teigerForMatrikkelenhet": {
                     "oppdateringsdato": "2020-06-18T02:02:28.528000000+02:00",
                     "versjonId": "2",
                     "oppdatertAv": "smatmynd",
                     "id": "101010101",
                     "hovedteig": "true",
                     "teigId": "10101010",
                     "uuid": {
                        "navnerom": "https://data.geonorge.no/matrikkel",
                        "uuid": "1118b04e-1111-5ee9-1111-a096d36111af"
                     }
                  },
                  "erSeksjonert": "false",
                  "harAktiveFestegrunner": "true",
                  "harAnmerketKlage": "false",
                  "harRegistrertGrunnerverv": "false",
                  "harRegistrertJordskifteKrevd": "false",
                  "inngarISamlaFastEiendom": "false",
                  "harGrunnforurensing": "false",
                  "harKulturminne": "false",
                  "harAvtaleGrensePunktfeste": "false",
                  "harAvtaleStedbundenRettighet": "false",
                  "utgatt": "false",
                  "underSammenslaingBestar": "false",
                  "underSammenslaingUtgar": "false",
                  "oppmalingIkkeFullfort": "false",
                  "grensepunktmerkingMangler": "false",
                  "mangelMatrikkelforingskrav": "false",
                  "nymatrikulert": "false",
                  "etterML9BTilH": "false",
                  "kommunalTilleggsdel": {
                     "kartblader": "",
                     "brukAvGrunnKodeId": "0",
                     "kommentarer": "",
                     "matrikkelenhetReferanser": "",
                     "undereiendommerIds": ""
                  },
                  "uuid": {
                     "navnerom": "https://data.geonorge.no/matrikkel",
                     "uuid": "1118b04e-1111-5ee9-1111-a096d36111af"
                  }
               }
            },
            {
               "_type": "JuridiskPersonTinglystEierforhold",
               "_namespace": "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/matrikkelenhet",
               "oppdateringsdato": "2020-06-17T22:16:57.579000000+02:00",
               "versjonId": "5",
               "oppdatertAv": "smatmynd",
               "id": "10101010",
               "kommuneId": "1337",
               "eierforholdKodeId": "0",
               "uuid": {
                  "navnerom": "https://data.geonorge.no/matrikkel",
                  "uuid": "1118b04e-1111-5ee9-1111-a096d36111af"
               },
               "andel": {
                  "teller": "1",
                  "nevner": "1"
               },
               "datoFra": "1337-01-01",
               "eierId": "101010101",
               "andelsnummer": "1",
               "unit": {
                  "_type": "Grunneiendom",
                  "_namespace": "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/matrikkelenhet",
                  "id": {
                     "_type": "GrunneiendomId",
                     "_namespace": "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/matrikkelenhet",
                     "value": "10101010"
                  },
                  "oppdateringsdato": "2020-06-15T20:24:05.913000000+02:00",
                  "versjonId": "1",
                  "oppdatertAv": "smatmynd",
                  "versjon": "1010101010101",
                  "matrikkelnummer": {
                     "kommuneId": "1337",
                     "gardsnummer": "1",
                     "bruksnummer": "1",
                     "festenummer": "0",
                     "seksjonsnummer": "0"
                  },
                  "etableringsdato": "1337-01-01",
                  "historiskOppgittAreal": "0.0",
                  "historiskArealkildeId": "0",
                  "tinglyst": "true",
                  "skyld": "0.1",
                  "bruksnavn": "DEMO",
                  "teigerForMatrikkelenhet": {
                     "oppdateringsdato": "2020-06-18T01:50:36.204000000+02:00",
                     "versjonId": "1",
                     "oppdatertAv": "smatmynd",
                     "id": "1010101010",
                     "hovedteig": "true",
                     "teigId": "101010101",
                     "uuid": {
                        "navnerom": "https://data.geonorge.no/matrikkel",
                        "uuid": "1118b04e-1111-5ee9-1111-a096d36111af"
                     }
                  },
                  "erSeksjonert": "false",
                  "harAktiveFestegrunner": "false",
                  "harAnmerketKlage": "false",
                  "harRegistrertGrunnerverv": "false",
                  "harRegistrertJordskifteKrevd": "false",
                  "inngarISamlaFastEiendom": "false",
                  "harGrunnforurensing": "false",
                  "harKulturminne": "false",
                  "harAvtaleGrensePunktfeste": "false",
                  "harAvtaleStedbundenRettighet": "false",
                  "utgatt": "false",
                  "underSammenslaingBestar": "false",
                  "underSammenslaingUtgar": "false",
                  "oppmalingIkkeFullfort": "false",
                  "grensepunktmerkingMangler": "false",
                  "mangelMatrikkelforingskrav": "false",
                  "nymatrikulert": "false",
                  "etterML9BTilH": "false",
                  "kommunalTilleggsdel": {
                     "kartblader": "",
                     "brukAvGrunnKodeId": "0",
                     "kommentarer": "",
                     "matrikkelenhetReferanser": "",
                     "undereiendommerIds": ""
                  },
                  "uuid": {
                     "navnerom": "https://data.geonorge.no/matrikkel",
                     "uuid": "1118b04e-1111-5ee9-1111-a096d36111af"
                  }
               }
            }
         ]
      }
   ],
   "excludedOwners": [
      //List of excluded owners. 
      {
         "_type": "JuridiskPerson",
         "_namespace": "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/person",
         "id": "1010101",
         "oppdateringsdato": "2020-06-15T22:40:57.525000000+02:00",
         "versjonId": "3",
         "oppdatertAv": "smatmynd",
         "versjon": "1010101010101",
         "nummer": "0101010101",
         "navn": "DEMO DEMOSEN",
         "postadresse": {
            "adresselinje2": "Demo vegen 3",
            "postnummeromradeId": "101010101",
            "landKodeId": "0000"
         },
         "uuid": {
            "navnerom": "https://data.geonorge.no/matrikkel",
            "uuid": "8f6420fd-3a70-5da4-aa11-b925s8bbec6b"
         },
         "forretningsadresse": {
            "adresselinje1": "Demo vegen 3",
            "postnummeromradeId": "101010101",
            "landKodeId": "0000"
         },
         "organisasjonsformKode": {
            "orgformNavn": "Demo",
            "orgformKode": "DEMO"
         },
         "brreg": {
            "organisasjonsnummer": "0101010101",
            "navn": "DEMO DEMOSEN",
            "organisasjonsform": {
               "kode": "DEMO",
               "beskrivelse": "Demo",
               "_links": "https://data.brreg.no/enhetsregisteret/api/organisasjonsformer/KOMM"
            },
            "hjemmeside": "www.demo.demosen.no/",
            "registreringsdatoEnhetsregisteret": "1337-01-01",
            "registrertIMvaregisteret": true,
            "frivilligMvaRegistrertBeskrivelser": "Utleier av bygg eller anlegg",
            "naeringskode1": {
               "beskrivelse": "Generell offentlig demo",
               "kode": "10.110"
            },
            "antallAnsatte": "0101",
            "forretningsadresse": {
               "land": "Norge",
               "landkode": "NO",
               "postnummer": "1337",
               "poststed": "DEMO",
               "adresse": "Demo vegen 3",
               "kommune": "DEMO",
               "kommunenummer": "1377"
            },
            "institusjonellSektorkode": {
               "kode": "1377",
               "beskrivelse": "Demoforvaltningen"
            },
            "registrertIForetaksregisteret": false,
            "registrertIStiftelsesregisteret": false,
            "registrertIFrivillighetsregisteret": false,
            "konkurs": false,
            "underAvvikling": false,
            "underTvangsavviklingEllerTvangsopplosning": false,
            "maalform": "Bokmål",
            "_links": "https://data.brreg.no/enhetsregisteret/api/enheter/101010101"
         },
         "ownerships": [
            {
               "_type": "JuridiskPersonTinglystEierforhold",
               "_namespace": "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/matrikkelenhet",
               "oppdateringsdato": "2020-06-17T22:16:57.579000000+02:00",
               "versjonId": "3",
               "oppdatertAv": "smatmynd",
               "id": "10101010",
               "kommuneId": "1337",
               "eierforholdKodeId": "0",
               "uuid": {
                  "navnerom": "https://data.geonorge.no/matrikkel",
                  "uuid": "f18381cc-234f-559a-a0cc-16bba7402c4b"
               },
               "andel": {
                  "teller": "1",
                  "nevner": "1"
               },
               "datoFra": "1337-01-01",
               "eierId": "10101010",
               "andelsnummer": "2",
               "unit": {
                  "_type": "Grunneiendom",
                  "_namespace": "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/matrikkelenhet",
                  "id": {
                     "_type": "GrunneiendomId",
                     "_namespace": "https://matrikkel.statkart.no/matrikkelapi/wsapi/v1/domain/matrikkelenhet",
                     "value": "10101010"
                  },
                  "oppdateringsdato": "2020-06-15T20:24:05.913000000+02:00",
                  "versjonId": "3",
                  "oppdatertAv": "smatmynd",
                  "versjon": "1010101010101",
                  "matrikkelnummer": {
                     "kommuneId": "1337",
                     "gardsnummer": "1",
                     "bruksnummer": "1",
                     "festenummer": "0",
                     "seksjonsnummer": "0"
                  },
                  "historiskOppgittAreal": "0.0",
                  "historiskArealkildeId": "0",
                  "tinglyst": "true",
                  "skyld": "1.01",
                  "bruksnavn": "DEMO OG DEMO",
                  "teigerForMatrikkelenhet": {
                     "oppdateringsdato": "2020-06-18T02:02:28.528000000+02:00",
                     "versjonId": "2",
                     "oppdatertAv": "smatmynd",
                     "id": "101010101",
                     "hovedteig": "true",
                     "teigId": "10101010",
                     "uuid": {
                        "navnerom": "https://data.geonorge.no/matrikkel",
                        "uuid": "1118b04e-1111-5ee9-1111-a096d36111af"
                     }
                  },
                  "erSeksjonert": "false",
                  "harAktiveFestegrunner": "true",
                  "harAnmerketKlage": "false",
                  "harRegistrertGrunnerverv": "false",
                  "harRegistrertJordskifteKrevd": "false",
                  "inngarISamlaFastEiendom": "false",
                  "harGrunnforurensing": "false",
                  "harKulturminne": "false",
                  "harAvtaleGrensePunktfeste": "false",
                  "harAvtaleStedbundenRettighet": "false",
                  "utgatt": "false",
                  "underSammenslaingBestar": "false",
                  "underSammenslaingUtgar": "false",
                  "oppmalingIkkeFullfort": "false",
                  "grensepunktmerkingMangler": "false",
                  "mangelMatrikkelforingskrav": "false",
                  "nymatrikulert": "false",
                  "etterML9BTilH": "false",
                  "kommunalTilleggsdel": {
                     "kartblader": "",
                     "brukAvGrunnKodeId": "0",
                     "kommentarer": "",
                     "matrikkelenhetReferanser": "",
                     "undereiendommerIds": ""
                  },
                  "uuid": {
                     "navnerom": "https://data.geonorge.no/matrikkel",
                     "uuid": "1118b04e-1111-5ee9-1111-a096d36111af"
                  }
               }
            }
         ],
         "exclusionReason": "Forhåndsekskludert"
         //Why the owner was excluded. 
      }
   ],
   "matrikkelUnitsWithoutOwners": [
      //List of properties without owners in the matrikkel. 
      "Array"
   ],
   "stats": {
      //Basic stat from the polygon(s).
      "affectedCount": 1,
      "area": null,
      "totalOwners": 1,
      "privateOwners": 1,
      "businessOwners": 1,
      "units": [
      ]
   },
   "polygons": {
      "extremes": {
         "north": [
            512590.93,
            6572724.996
         ],
         "west": [
            511851.99,
            6572411.712
         ],
         "east": [
            514608.599,
            6572177.314
         ],
         "south": [
            514508.099,
            6572073.138
         ]
      },
      "area": 1037662459880256.2,
      "polygons": [
         {
            "EPSG": "5972",
            "metadata": {
               "type": "LWPOLYLINE",
               "handle": "F40",
               "ownerHandle": "1F",
               "layer": "0",
               "shape": true,
               "hasContinuousLinetypePattern": true,
               "extendedData": {
                  "applicationName": "DEMO",
                  "customStrings": [
                     "Array"
                  ]
               }
            },
            "extremes": {
               "north": [
                  512590.93,
                  6572724.996
               ],
               "west": [
                  511851.99,
                  6572411.712
               ],
               "east": [
                  514608.599,
                  6572177.314
               ],
               "south": [
                  514508.099,
                  6572073.138
               ]
            },
            "center": [
               513230.29449999996,
               6572399.067
            ],
            "area": 1037662459880256.2,
            "vertices": [
               [
                  512039.725,
                  6572426.734
               ],
               [
                  512038.389,
                  6572459.488
               ],
               [
                  512039.725,
                  6572426.734
               ]
            ]
         }
      ],
      "EPSG": "5972",
      "center": [
         513230.29449999996,
         6572399.067
      ]
   },
   "matrikkelEnheter": [
   ]
}

```


**`POST /templates`**

This endpoint is used to post a new template to the mongoDB

### Example /templates

```json5
{
    "name": "Demo",
    "description": "Brukes om det skal utføres en demo",
    "documentDefinitionId": "brevmal", //Baseline for the template. 
    "template": "base64",
    "language": "nb" //Standard nb (bokmål), other allowed values nn (nynorsk) and en (english)
}
```

## Endpoints PUT

**`PUT /dispatches/{id}`**

This endpoint is used to edit a given dispatch.

If status='approved' you're not allowed to edit anything except the status of the dispatch object.
If status='completed' || 'inprogress' you're not allowed to edit the dispatch object at all.

Fields that cannot be edited.
- 'validatedArchivenumber'
- 'createdTimestamp'
- 'createdBy'
- 'createdById'
- 'createdByDepartment'
- 'modifiedTimestamp'
- 'modifiedBy'
- 'modifiedById'
- 'modifiedByDepartment'
- 'inProgressTimestamp'
- 'completedTimestamp'

**`PUT /dispatches/{id}/complete`**

This endpoint is used to complete a dispatch when the job is posted to E18. The endpoint will set status='completed' and remove all the owners from the object.
This endpoint is used by test-la-masseutsendelse and prod-la-masseutsendelse.

**`PUT /templates/{id}`**

This endpoint is used to edit a given template.

Fields that cannot be edited.
- 'createdTimestamp'
- 'createdBy'
- 'createdById'
- 'modifiedTimestamp'
- 'modifiedBy'
- 'modifiedById'
