import assert from "node:assert";
import { after, afterEach, before, describe, test } from "node:test";
import type { HttpRequest } from "@azure/functions";
import { type DefaultBodyType, type ResponseComposition, type RestContext, type RestRequest, rest } from "msw";
import { type SetupServer, setupServer } from "msw/node";
import { completeDispatch } from "../../../functions/completedispatch.js";
import { editDispatches } from "../../../functions/editdispatches.js";
import { getBlob } from "../../../functions/getblob.js";
import { getDispatchById } from "../../../functions/getdispatchbyid.js";
import { getMatrikkel } from "../../../functions/getmatrikkel.js";
import { getTemplateById } from "../../../functions/gettemplatebyid.js";
import { getTemplates } from "../../../functions/gettemplates.js";
import { postDispatches } from "../../../functions/postdispatches.js";
import { postTemplate } from "../../../functions/posttemplate.js";
import { putTemplates } from "../../../functions/puttemplates.js";
import type { FunctionResponse, HTTPErrorResponse } from "../../../types/response.js";
import { setupDB } from "../test-setup.js";
import invalidDispatchIllegalCharacter from "../testCases/invalidCases/post_dispatch_illegal_character.js";
import invalidDispatchIllegalFileExtension from "../testCases/invalidCases/post_dispatch_illegal_extension.js";
import invalidDispatchArchiveNumber from "../testCases/invalidCases/post_dispatch_missing_archivenumber.js";
import invalidDispatchMissingFileExtension from "../testCases/invalidCases/post_dispatch_missing_extension.js";
import invalidDispatch from "../testCases/invalidCases/post_dispatch_missing_template_and_attachments.js";
import validDispatchEditApproved from "../testCases/validCases/edit_dispatch_approved.js";
import validDispatchAttachments from "../testCases/validCases/post_dispatch_attachments.js";
import validDispatchBoth from "../testCases/validCases/post_dispatch_both.js";
import validTemplate from "../testCases/validCases/post_template.js";

setupDB();

describe("Endpoint testing", () => {
  const server: SetupServer = setupServer(
    rest.post("https://api.vtfk.no/pdf/v1/jestTest", (_req: RestRequest, res: ResponseComposition<DefaultBodyType>, ctx: RestContext) => {
      return res(
        ctx.status(201),
        ctx.json({
          body: {
            data: {
              tittel: "Parallel test",
              "beskrivelse av prosjektet": "Parallel test",
              fremdrift: "Parallel test",
              Regelverk: "Parallel test"
            },
            base64: { pdfBase64: "En pdfbase64" }
          }
        })
      );
    }),
    rest.post("https://api.vtfk.no/matrikkel/v1/jestTestjestTest", (_req: RestRequest, res: ResponseComposition<DefaultBodyType>, ctx: RestContext) => {
      return res(
        ctx.status(200),
        ctx.json({
          msg: "Matrikkel api successfully connected"
        })
      );
    }),
    rest.post("https://api.vtfk.dev/archive/v1/jestTestarchive", (_req: RestRequest, res: ResponseComposition<DefaultBodyType>, ctx: RestContext) => {
      return res(
        ctx.status(200),
        ctx.json({
          msg: "Archive api successfully connected"
        })
      );
    })
  );

  const OLD_ENV_VAR = process.env;

  before(() => {
    process.env = { ...OLD_ENV_VAR };
    server.listen();
  });

  after(() => {
    process.env = OLD_ENV_VAR;
    server.close();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  const apiHeader = {
    headers: {
      get: () => undefined,
      "x-api-key": process.env["APIKEYS_TEST"]
    }
  } as unknown as HttpRequest;

  let idTemplate: string = "";
  const idDispatchOnlyTemplate: string = "";

  describe("Testing valid cases", () => {
    test("Should post a template to the db", async () => {
      const post = (await postTemplate(validTemplate as unknown as HttpRequest)) as { status: number; jsonBody: { _id: string; name: string; createdBy: string; template: string } };

      idTemplate = post.jsonBody._id;

      assert.ok(post);
      assert.ok(post.jsonBody);
      assert.strictEqual(post.status, 200);
      assert.strictEqual(post.jsonBody.name, "Jest Test Template");
      assert.strictEqual(post.jsonBody.createdBy, "timetrigger");
      assert.strictEqual(post.jsonBody.template, "Et eller annet");
    });

    test("Should get a template with a given id from the db", async () => {
      const request = {
        ...apiHeader,
        params: {
          id: idTemplate
        },
        json: async () => ({})
      } as unknown as HttpRequest;
      const get = (await getTemplateById(request)) as { status: number; jsonBody: { name: string; createdBy: string; template: string } };

      assert.ok(get);
      assert.strictEqual(get.status, 200);
      assert.strictEqual(get.jsonBody.name, "Jest Test Template");
      assert.strictEqual(get.jsonBody.createdBy, "timetrigger");
      assert.strictEqual(get.jsonBody.template, "Et eller annet");
    });

    test("Should get all the templates from the db", async () => {
      const get = (await getTemplates(apiHeader)) as { status: number; jsonBody: Array<{ name: string; createdBy: string; template: string }> };

      assert.ok(get);
      assert.strictEqual(get.status, 200);
      assert.strictEqual(get.jsonBody[0]?.name, "Jest Test Template");
      assert.strictEqual(get.jsonBody[0]?.createdBy, "timetrigger");
      assert.strictEqual(get.jsonBody[0]?.template, "Et eller annet");
    });

    test("Should edit a given template", async () => {
      const request = {
        headers: {
          get: () => undefined,
          "x-api-key": process.env["APIKEYS_TEST"]
        },
        params: {
          id: idTemplate
        },
        json: async () => ({
          name: "Jeg er redigert",
          template: "Ja, det er jeg også."
        })
      } as unknown as HttpRequest;

      const edit = (await putTemplates(request)) as { status: number; jsonBody: { name: string; template: string } };

      assert.ok(edit);
      assert.strictEqual(edit.status, 200);
      assert.notStrictEqual(edit.jsonBody.name, "Jest Test Template");
      assert.notStrictEqual(edit.jsonBody.template, "Et eller annet");
      assert.strictEqual(edit.jsonBody.name, "Jeg er redigert");
      assert.strictEqual(edit.jsonBody.template, "Ja, det er jeg også.");
    });

    test("Should call the getBlob endpoint correctly", async () => {
      const request = {
        ...apiHeader,
        params: {
          id: 1,
          name: "test",
          file: "filename.docx"
        },
        json: async () => ({})
      } as unknown as HttpRequest;

      const get = (await getBlob(request)) as { status: number; body: string };

      assert.ok(get);
      assert.strictEqual(get.status, 200);
      assert.strictEqual(get.body, "filename.docx");
    });
  });

  describe("Testing invalid cases", () => {
    test("Should reject posting a dispatch without template and attachments", async () => {
      const post: FunctionResponse | HTTPErrorResponse = await postDispatches(invalidDispatch as unknown as HttpRequest);
      assert.ok(post);
      assert.notStrictEqual((post as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(post.status, 400);
    });

    test("Should reject posting a dispatch because the jsonBody is empty", async () => {
      const post: FunctionResponse | HTTPErrorResponse = await postDispatches(apiHeader);
      assert.ok(post);
      assert.notStrictEqual((post as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(post.status, 400);
    });

    test("Should reject posting a dispatch because the dispatch object is missing the archivenumber", async () => {
      const post: FunctionResponse | HTTPErrorResponse = await postDispatches(invalidDispatchArchiveNumber as unknown as HttpRequest);
      assert.ok(post);
      assert.notStrictEqual((post as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(post.status, 400);
    });

    test('Should reject posting a dispatch with only attachments because the "AZURE_BLOB_CONNECTIONSTRING_TEST" is missing', async () => {
      process.env["AZURE_BLOB_CONNECTIONSTRING_TEST"] = "";

      const post: FunctionResponse | HTTPErrorResponse = await postDispatches(validDispatchAttachments as unknown as HttpRequest);
      assert.ok(post);
      assert.notStrictEqual((post as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(post.status, 500);
    });

    test('Should reject posting a dispatch with only attachments because the "AZURE_BLOB_CONTAINERNAME_TEST" is missing', async () => {
      process.env["AZURE_BLOB_CONTAINERNAME_TEST"] = "";

      const post: FunctionResponse | HTTPErrorResponse = await postDispatches(validDispatchAttachments as unknown as HttpRequest);
      assert.ok(post);
      assert.notStrictEqual((post as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(post.status, 500);
    });

    test("Should reject posting a dispatch with attachments because a file is missing file extension", async () => {
      const post: FunctionResponse | HTTPErrorResponse = await postDispatches(invalidDispatchMissingFileExtension as unknown as HttpRequest);
      assert.ok(post);
      assert.notStrictEqual((post as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(post.status, 500);
    });

    test("Should reject posting a dispatch with attachments because a file got an illegal file extension", async () => {
      const post: FunctionResponse | HTTPErrorResponse = await postDispatches(invalidDispatchIllegalFileExtension as unknown as HttpRequest);
      assert.ok(post);
      assert.notStrictEqual((post as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(post.status, 500);
    });

    test("Should reject posting a dispatch with attachments because a file got an illegal character in the filename", async () => {
      const post: FunctionResponse | HTTPErrorResponse = await postDispatches(invalidDispatchIllegalCharacter as unknown as HttpRequest);
      assert.ok(post);
      assert.notStrictEqual((post as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(post.status, 500);
    });

    test("Should not get a dispatch object from the db since there's no id provided", async () => {
      process.env["ID_DISPATCH_TEST"] = "";
      const request = {
        ...apiHeader,
        params: {
          id: ""
        },
        json: async () => ({})
      } as unknown as HttpRequest;

      const get: FunctionResponse | HTTPErrorResponse = await getDispatchById(request);
      assert.ok(get);
      assert.notStrictEqual((get as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(get.status, 400);
    });

    test("Should not get a dispatch object from the db since the id provided dose not exist", async () => {
      const request = {
        ...apiHeader,
        params: {
          id: "61f9502c1a6e890eec90d2b1"
        },
        json: async () => ({})
      } as unknown as HttpRequest;

      const get: FunctionResponse | HTTPErrorResponse = await getDispatchById(request);
      assert.ok(get);
      assert.notStrictEqual((get as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(get.status, 404);
    });

    test("Should not edit a dispatch object since the id provided dose not exist", async () => {
      const request = {
        headers: {
          get: () => undefined,
          "x-api-key": process.env["APIKEYS_TEST"]
        },
        params: {
          id: "61f9502c1a6e890eec90d2b1"
        },
        json: async () => ({
          status: "Ja, det er jeg også."
        })
      } as unknown as HttpRequest;

      const edit: FunctionResponse | HTTPErrorResponse = await editDispatches(request);
      assert.ok(edit);
      assert.notStrictEqual((edit as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(edit.status, 404);
    });

    test("Should reject completing a dispatch since there is no id provided", async () => {
      const request = {
        ...validDispatchEditApproved,
        params: {
          id: ""
        },
        json: async () => ({})
      } as unknown as HttpRequest;

      const complete: FunctionResponse | HTTPErrorResponse = await completeDispatch(request);
      assert.ok(complete);
      assert.notStrictEqual((complete as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(complete.status, 400);
    });

    test("Should reject completing a dispatch since the id provided is not valid", async () => {
      process.env["ID_DISPATCH_TEST"] = "61f9502c1a6e890eec90d2b1";
      const request = {
        ...validDispatchEditApproved,
        params: {
          id: "61f9502c1a6e890eec90d2b1"
        },
        json: async () => ({})
      } as unknown as HttpRequest;

      const complete: FunctionResponse | HTTPErrorResponse = await completeDispatch(request);
      assert.ok(complete);
      assert.notStrictEqual((complete as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(complete.status, 404);
    });

    test("Should reject completing a dispatch since the dispatch status is not set to approved", async () => {
      const request = {
        ...validDispatchEditApproved,
        params: {
          id: idDispatchOnlyTemplate
        },
        json: async () => ({})
      } as unknown as HttpRequest;

      const complete: FunctionResponse | HTTPErrorResponse = await completeDispatch(request);
      assert.ok(complete);
      assert.notStrictEqual((complete as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(complete.status, 400);
    });

    test("Should not call the matrikkel api since the url is missing", async () => {
      process.env["VTFK_MATRIKKELPROXY_BASEURL"] = "";
      const get: FunctionResponse | HTTPErrorResponse = await getMatrikkel(apiHeader);
      assert.ok(get);
      assert.notStrictEqual((get as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(get.status, 400);
    });

    test("Should not call the matrikkel api since the apikey is missing", async () => {
      process.env["VTFK_MATRIKKELPROXY_APIKEY"] = "";
      const get: FunctionResponse | HTTPErrorResponse = await getMatrikkel(apiHeader);
      assert.ok(get);
      assert.notStrictEqual((get as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(get.status, 400);
    });

    test("Should reject the get blob endpoint request since the id is missing", async () => {
      const request = {
        ...apiHeader,
        params: {
          id: "",
          name: "test",
          file: "filename.docx"
        },
        json: async () => ({})
      } as unknown as HttpRequest;

      const get: FunctionResponse | HTTPErrorResponse = await getBlob(request);
      assert.ok(get);
      assert.notStrictEqual((get as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(get.status, 400);
    });

    test("Should reject the get blob endpoint request since the name is missing", async () => {
      const request = {
        ...apiHeader,
        params: {
          id: 1,
          name: "",
          file: "filename.docx"
        },
        json: async () => ({})
      } as unknown as HttpRequest;

      const get: FunctionResponse | HTTPErrorResponse = await getBlob(request);
      assert.ok(get);
      assert.notStrictEqual((get as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(get.status, 400);
    });

    test("Should reject the get blob endpoint request since the file is missing", async () => {
      const request = {
        ...apiHeader,
        params: {
          id: 1,
          name: "test",
          file: ""
        },
        json: async () => ({})
      } as unknown as HttpRequest;

      const get: FunctionResponse | HTTPErrorResponse = await getBlob(request);
      assert.ok(get);
      assert.notStrictEqual((get as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(get.status, 400);
    });

    test("Should reject the archive endpoint request since the endpoint url is missing", async () => {
      process.env["VTFK_P360_ARCHIVE_ENDPOINT"] = "";
      const post: FunctionResponse | HTTPErrorResponse = await postDispatches(validDispatchBoth as unknown as HttpRequest);
      assert.ok(post);
      assert.notStrictEqual((post as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(post.status, 500);
    });

    test("Should reject the archive endpoint request since the endpoint key is missing", async () => {
      process.env["VTFK_P360_ARCHIVE_SUBSCRIPTION_KEY"] = "";
      const post: FunctionResponse | HTTPErrorResponse = await postDispatches(validDispatchBoth as unknown as HttpRequest);
      assert.ok(post);
      assert.notStrictEqual((post as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(post.status, 500);
    });

    test("Should not get a template from the db since there's no id provided", async () => {
      const request = {
        ...apiHeader,
        params: {
          id: ""
        },
        json: async () => ({})
      } as unknown as HttpRequest;

      const get: FunctionResponse | HTTPErrorResponse = await getTemplateById(request);
      assert.ok(get);
      assert.notStrictEqual((get as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(get.status, 400);
    });

    test("Should not get a template from the db since the id provided dose not exist", async () => {
      const request = {
        ...apiHeader,
        params: {
          id: "61f9502c1a6e890eec90d2b1"
        },
        json: async () => ({})
      } as unknown as HttpRequest;

      const get: FunctionResponse | HTTPErrorResponse = await getTemplateById(request);
      assert.ok(get);
      assert.notStrictEqual((get as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(get.status, 400);
    });

    test("Should not put a template from the db since there's no id provided", async () => {
      const request = {
        headers: {
          "x-api-key": process.env["APIKEYS_TEST"]
        },
        params: {
          id: ""
        },
        json: async () => ({
          name: "Jeg er redigert",
          template: "Ja, det er jeg også."
        })
      } as unknown as HttpRequest;

      const edit: FunctionResponse | HTTPErrorResponse = await putTemplates(request);
      assert.ok(edit);
      assert.notStrictEqual((edit as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(edit.status, 400);
    });

    test("Should not edit a template from the db since the id provided does not exist", async () => {
      const request = {
        headers: {
          "x-api-key": process.env["APIKEYS_TEST"]
        },
        params: {
          id: "61f9502c1a6e890eec90d2b1"
        },
        json: async () => ({
          name: "Jeg er redigert",
          template: "Ja, det er jeg også."
        })
      } as unknown as HttpRequest;

      const edit: FunctionResponse | HTTPErrorResponse = await putTemplates(request);
      assert.ok(edit);
      assert.notStrictEqual((edit as { jsonBody?: unknown }).jsonBody, undefined);
      assert.strictEqual(edit.status, 400);
    });
  });
});
