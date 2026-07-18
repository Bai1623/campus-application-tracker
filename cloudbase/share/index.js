const cloudbase = require("@cloudbase/node-sdk");
const crypto = require("crypto");

const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV,
});

const db = app.database();
const collection = db.collection("bai");
const MAX_SYNC_BACKUPS = 30;

function headers() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  };
}

function response(data, statusCode = 200) {
  return {
    statusCode,
    headers: headers(),
    body: JSON.stringify(data),
  };
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "object") return body;
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function shareId() {
  return crypto.randomBytes(5).toString("base64url");
}

function syncDocId(syncKey) {
  return `sync_${syncKey}`;
}

async function getDoc(id) {
  const result = await collection.where({ lookupKey: id }).limit(1).get();
  return result?.data?.[0] || null;
}

async function saveDoc(id, data) {
  const oldDoc = await getDoc(id).catch(() => null);
  const payload = {
    lookupKey: id,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  if (oldDoc?._id) {
    const { _id, ...updatablePayload } = payload;
    await collection.doc(oldDoc._id).update(updatablePayload);
    return;
  }
  await collection.add(payload);
}

exports.main = async (event = {}) => {
  const method = event.httpMethod || event.method || event.requestContext?.http?.method || "GET";
  const query = event.queryStringParameters || event.query || {};
  const body = parseBody(event.body);

  if (method === "OPTIONS") return response({ ok: true });

  try {
    if (method === "GET" && query.id) {
      const doc = await getDoc(query.id);
      if (!doc?.payload) return response({ error: "not_found" }, 404);
      return response({ id: query.id, payload: doc.payload, createdAt: doc.createdAt || "" });
    }

    const action = body.action || query.action || "";

    if (method === "POST" && action === "sync-put") {
      const { syncKey, latestShareId, accountName = "", recordCount = 0, backupCreatedAt = "" } = body;
      if (!/^[A-Za-z0-9+/=_-]{32,160}$/.test(syncKey || "")) return response({ error: "invalid_sync_key" }, 400);
      if (!/^[A-Za-z0-9_-]{6,32}$/.test(latestShareId || "")) return response({ error: "invalid_share_id" }, 400);

      const id = syncDocId(syncKey);
      const oldDoc = await getDoc(id).catch(() => null);
      const backup = {
        latestShareId,
        accountName,
        recordCount,
        backupCreatedAt,
        syncedAt: new Date().toISOString(),
      };
      const backups = [backup, ...((oldDoc?.backups || []).filter((item) => item.latestShareId !== latestShareId))].slice(
        0,
        MAX_SYNC_BACKUPS,
      );
      const latest = { ...backup, backupsCount: backups.length };
      await saveDoc(id, {
        type: "sync-index",
        latest,
        latestShareId,
        accountName,
        recordCount,
        backupCreatedAt,
        backups,
      });
      return response({ ok: true, latest });
    }

    if (method === "POST" && action === "sync-get") {
      const { syncKey } = body;
      if (!/^[A-Za-z0-9+/=_-]{32,160}$/.test(syncKey || "")) return response({ error: "invalid_sync_key" }, 400);
      const doc = await getDoc(syncDocId(syncKey)).catch(() => null);
      if (!doc?.latestShareId && !doc?.latest?.latestShareId) {
        return response({ ok: true, latest: null, backups: [] });
      }
      return response({
        ok: true,
        latest: doc.latest || {
          latestShareId: doc.latestShareId,
          accountName: doc.accountName || "",
          recordCount: doc.recordCount || 0,
          backupCreatedAt: doc.backupCreatedAt || "",
        },
        backups: doc.backups || [],
      });
    }

    if (method === "POST") {
      const payload = body.payload || body.data || body;
      const id = shareId();
      await saveDoc(id, {
        type: "share",
        payload,
        createdAt: new Date().toISOString(),
      });
      return response({ id, key: id, status: "ok" });
    }

    return response({ name: "autumn-share-api", status: "ok" });
  } catch (error) {
    return response({ error: "server_error", message: error.message }, 500);
  }
};
