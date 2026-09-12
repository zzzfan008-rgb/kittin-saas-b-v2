import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import express from "express";
import OpenAI from "openai";
import sharp from "sharp";
import type { AddressInfo } from "node:net";
import { resetPostgresTestDatabase } from "./postgresTestDatabase";
import { callNativeMaskEdit } from "../server/lib/openaiMaskTest";
import { createDocumentSnapshot, documentSnapshotToPersistedWorkflow } from "../src/lib/documentSnapshot";
import { validateAndMigrateFlow } from "../server/lib/workflowSchema";

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "gc-native-mask-test-"));
process.env.DATA_DIR = temp;
process.env.SQLITE_IMPORT_FILE = "missing.db";
process.env.INITIAL_ADMIN_ACCOUNT_ID = "native-test-admin";
process.env.INITIAL_ADMIN_PASSWORD = "Initial1234";
await resetPostgresTestDatabase();
const { initializeDatabase, query, closeDatabaseForTests } = await import("../server/lib/database");
const { createSession, requireAuth, requirePasswordChanged } = await import("../server/lib/auth");
const { createOpenAiMaskTestRouter } = await import("../server/routes/openaiMaskTest");
await initializeDatabase();
for (const id of ["native-owner", "native-other"]) await query(`INSERT INTO users (id,account_id,display_name,role,password_hash,active,must_change_password,created_at,updated_at)
  VALUES ($1,$1,$1,'user','not-a-real-password-hash',1,0,$2,$2)`, [id, new Date().toISOString()]);
const owner = (await createSession("native-owner")).token;
const other = (await createSession("native-other")).token;
const source = await sharp({ create: { width: 64, height: 48, channels: 3, background: "white" } }).png().toBuffer();
const mask = await sharp({ create: { width: 64, height: 48, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toBuffer();
const returned = await sharp({ create: { width: 96, height: 64, channels: 3, background: "red" } }).png().toBuffer();
const prompt = "  改为酒红色\n不要修改桌面。  ";
let calls = 0;
let rejectCall = false;
let release: (() => void) | undefined;
const client = new OpenAI({ apiKey: "offline-test-key", baseURL: "https://apiyi.example.invalid/v1", maxRetries: 0, fetch: async (url, init) => {
  if (url === "data:,") return new Response(""); // SDK's local FormData capability probe.
  calls++;
  const request = new Request(url as RequestInfo, init as RequestInit);
  assert.equal(request.url, "https://apiyi.example.invalid/v1/images/edits");
  const form = await request.formData();
  assert.deepEqual([...form.keys()].sort(), ["image", "mask", "model", "prompt"]);
  assert.equal(form.get("model"), "gpt-image-2");
  // Native FormData serializes line endings as CRLF; no application text is added.
  assert.equal(form.get("prompt"), prompt.replace(/\r?\n/g, "\r\n"));
  assert.deepEqual(Buffer.from(await (form.get("image") as File).arrayBuffer()), source);
  assert.deepEqual(Buffer.from(await (form.get("mask") as File).arrayBuffer()), mask);
  if (release) await new Promise<void>((resolve) => { release = resolve; });
  if (rejectCall) return Response.json({ error: { message: "offline failure" } }, { status: 500 });
  return Response.json({ data: [{ b64_json: returned.toString("base64") }] });
} });

assert.deepEqual(await callNativeMaskEdit(client, { image: source, mask, prompt }), returned);
assert.equal(calls, 1);
await assert.rejects(callNativeMaskEdit(client, { image: source, mask: source, prompt }), /Alpha/);
await assert.rejects(callNativeMaskEdit(client, { image: returned, mask, prompt }), /尺寸/);
assert.equal(calls, 1, "invalid input never reaches SDK");
console.log("PASS exact official multipart, verbatim prompt, unchanged input/output bytes, mask validation");

const app = express();
app.use(express.json());
app.use(requireAuth, requirePasswordChanged);
app.use("/test", createOpenAiMaskTestRouter({ createClient: () => client }));
const server = app.listen(0, "127.0.0.1");
await new Promise<void>((resolve) => server.once("listening", resolve));
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/test`;
const headers = (token = owner) => ({ Cookie: `gc_session=${token}` });
const upload = async (bytes: Buffer) => {
  const res = await fetch(base + "/files", { method: "POST", headers: { ...headers(), "Content-Type": "image/png" }, body: new Uint8Array(bytes) });
  assert.equal(res.status, 200); return await res.json() as { url: string };
};
const send = (body: object, token = owner) => fetch(base + "/runs", { method: "POST", headers: { ...headers(token), "Content-Type": "application/json" }, body: JSON.stringify(body) });
const read = async (id: string) => (await fetch(base + `/runs/${id}`, { headers: headers() })).json();
const terminal = async (id: string) => {
  for (let i=0;i<100;i++) { const value = await read(id); if(value.status !== "running") return value; await new Promise((r)=>setTimeout(r,20)); }
  throw new Error("test did not finish");
};
try {
  assert.equal((await fetch(base + "/config")).status, 401);
  const input = await upload(source), selection = await upload(mask);
  assert.deepEqual(fs.readFileSync(path.join(temp,"uploads",path.basename(input.url))), source);
  const body = { id:"native-once", source:input.url, mask:selection.url, prompt };
  assert.equal((await send(body,other)).status,404);
  const bad = await upload(returned);
  assert.equal((await send({...body,id:"wrong-size",source:bad.url})).status,400);
  assert.equal(calls,1);
  release = () => {};
  assert.equal((await send(body)).status,202);
  for(let i=0; i<50 && calls<2;i++) await new Promise((r)=>setTimeout(r,10));
  assert.equal((await send(body)).status,200);
  assert.equal((await send({...body,id:"parallel"})).status,409);
  assert.equal((await send({...body,prompt:"changed"})).status,409);
  assert.equal(calls,2);
  release(); release=undefined;
  const result = await terminal(body.id);
  assert.equal(result.status,"succeeded");
  assert.deepEqual(fs.readFileSync(path.join(temp,"uploads",path.basename(result.image))), returned);
  assert.equal((await fetch(base+`/runs/${body.id}`,{headers:headers(other)})).status,404);
  assert.equal((await send(body)).status,200); assert.equal(calls,2);
  rejectCall=true;
  assert.equal((await send({...body,id:"failure-once"})).status,202);
  const failed=await terminal("failure-once"); assert.equal(failed.status,"outcome_unknown"); assert.equal(calls,3);
  assert.equal((await send({...body,id:"failure-once"})).status,200); assert.equal(calls,3);
  console.log("PASS owner isolation, persisted raw output, duplicate/conflicting IDs, one call on server error");
  const testData = { prompt, source:input.url,mask:selection.url,requestId:body.id };
  const snapshot=createDocumentSnapshot({projectName:"Native",nodes:[{id:"native",type:"image-input",position:{x:0,y:0},data:{kind:"image-input",label:"Native",status:"idle",imageRole:"generic",roleNeedsConfirmation:false,openaiMaskTest:testData}}],edges:[]});
  const flow=validateAndMigrateFlow(documentSnapshotToPersistedWorkflow(snapshot));
  assert.deepEqual(flow.nodes[0].data.openaiMaskTest,testData);
  console.log("PASS project snapshot and schema round trip");
} finally {
  release?.();
  await new Promise<void>((resolve,reject)=>server.close((error)=>error?reject(error):resolve()));
  await closeDatabaseForTests(); fs.rmSync(temp,{recursive:true,force:true});
}
