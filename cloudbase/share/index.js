const crypto = require("crypto");

const MAX_SYNC_BACKUPS = 30;
let cachedCollection = null;

function getCollection() {
  if (cachedCollection) return cachedCollection;
  const cloudbase = require("@cloudbase/node-sdk");
  const app = cloudbase.init({
    env: cloudbase.SYMBOL_CURRENT_ENV,
  });
  cachedCollection = app.database().collection("bai");
  return cachedCollection;
}

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
  return crypto
    .randomBytes(5)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function syncDocId(syncKey) {
  return `sync_${syncKey}`;
}

function accountDocId(accountNameKey) {
  return `account_${accountNameKey}`;
}

function validCloudKey(value) {
  return /^[A-Za-z0-9+/=_-]{32,160}$/.test(value || "");
}

function latestFromDoc(doc) {
  if (!doc?.latestShareId && !doc?.latest?.latestShareId) return null;
  return (
    doc.latest || {
      latestShareId: doc.latestShareId,
      accountName: doc.accountName || "",
      recordCount: doc.recordCount || 0,
      backupCreatedAt: doc.backupCreatedAt || "",
    }
  );
}

async function getLegacySyncDoc(syncKey) {
  if (!validCloudKey(syncKey)) return null;
  return getDoc(syncDocId(syncKey)).catch(() => null);
}

async function getDoc(id) {
  const collection = getCollection();
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
    const collection = getCollection();
    const { _id, ...updatablePayload } = payload;
    await collection.doc(oldDoc._id).update(updatablePayload);
    return;
  }
  const collection = getCollection();
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

    if (method === "POST" && action === "account-login") {
      const { accountNameKey, passwordVerifier, syncKey = "", accountName = "" } = body;
      if (!validCloudKey(accountNameKey)) return response({ error: "invalid_account_name_key" }, 400);
      if (!validCloudKey(passwordVerifier)) return response({ error: "invalid_password_verifier" }, 400);

      const doc = await getDoc(accountDocId(accountNameKey)).catch(() => null);
      if (doc) {
        if (doc.passwordVerifier !== passwordVerifier) {
          return response({ ok: false, status: "password_mismatch" });
        }
        return response({ ok: true, status: "matched", latest: latestFromDoc(doc), backups: doc.backups || [] });
      }

      const legacyDoc = await getLegacySyncDoc(syncKey);
      if (legacyDoc?.latestShareId || legacyDoc?.latest?.latestShareId) {
        const backups = legacyDoc.backups || [];
        const latest = latestFromDoc(legacyDoc);
        await saveDoc(accountDocId(accountNameKey), {
          type: "account-sync",
          accountName,
          accountNameKey,
          passwordVerifier,
          latest,
          latestShareId: latest.latestShareId,
          recordCount: latest.recordCount || 0,
          backupCreatedAt: latest.backupCreatedAt || "",
          backups,
          migratedFrom: syncDocId(syncKey),
        });
        return response({ ok: true, status: "migrated", latest, backups });
      }

      return response({ ok: true, status: "account_not_found", latest: null, backups: [] });
    }

    if (method === "POST" && action === "account-create") {
      const { accountNameKey, passwordVerifier, accountName = "" } = body;
      if (!validCloudKey(accountNameKey)) return response({ error: "invalid_account_name_key" }, 400);
      if (!validCloudKey(passwordVerifier)) return response({ error: "invalid_password_verifier" }, 400);

      const id = accountDocId(accountNameKey);
      const doc = await getDoc(id).catch(() => null);
      if (doc) {
        if (doc.passwordVerifier !== passwordVerifier) {
          return response({ ok: false, status: "password_mismatch" });
        }
        return response({ ok: true, status: "exists", latest: latestFromDoc(doc), backups: doc.backups || [] });
      }

      await saveDoc(id, {
        type: "account-sync",
        accountName,
        accountNameKey,
        passwordVerifier,
        latest: null,
        latestShareId: "",
        recordCount: 0,
        backupCreatedAt: "",
        backups: [],
      });
      return response({ ok: true, status: "created", latest: null, backups: [] });
    }

    if (method === "POST" && action === "account-sync-put") {
      const {
        accountNameKey,
        passwordVerifier,
        latestShareId,
        accountName = "",
        recordCount = 0,
        backupCreatedAt = "",
      } = body;
      if (!validCloudKey(accountNameKey)) return response({ error: "invalid_account_name_key" }, 400);
      if (!validCloudKey(passwordVerifier)) return response({ error: "invalid_password_verifier" }, 400);
      if (!/^[A-Za-z0-9_-]{6,32}$/.test(latestShareId || "")) return response({ error: "invalid_share_id" }, 400);

      const id = accountDocId(accountNameKey);
      const oldDoc = await getDoc(id).catch(() => null);
      if (oldDoc && oldDoc.passwordVerifier !== passwordVerifier) {
        return response({ ok: false, status: "password_mismatch" });
      }

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
        type: "account-sync",
        accountName,
        accountNameKey,
        passwordVerifier,
        latest,
        latestShareId,
        recordCount,
        backupCreatedAt,
        backups,
      });
      return response({ ok: true, status: oldDoc ? "updated" : "created", latest });
    }

    if (method === "POST" && action === "account-sync-get") {
      const { accountNameKey, passwordVerifier } = body;
      if (!validCloudKey(accountNameKey)) return response({ error: "invalid_account_name_key" }, 400);
      if (!validCloudKey(passwordVerifier)) return response({ error: "invalid_password_verifier" }, 400);

      const doc = await getDoc(accountDocId(accountNameKey)).catch(() => null);
      if (!doc) return response({ ok: true, status: "account_not_found", latest: null, backups: [] });
      if (doc.passwordVerifier !== passwordVerifier) {
        return response({ ok: false, status: "password_mismatch" });
      }
      return response({ ok: true, status: "matched", latest: latestFromDoc(doc), backups: doc.backups || [] });
    }

    if (method === "POST" && action === "sync-put") {
      const { syncKey, latestShareId, accountName = "", recordCount = 0, backupCreatedAt = "" } = body;
      if (!validCloudKey(syncKey)) return response({ error: "invalid_sync_key" }, 400);
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
      if (!validCloudKey(syncKey)) return response({ error: "invalid_sync_key" }, 400);
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
