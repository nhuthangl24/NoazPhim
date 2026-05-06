import { getDb } from "@/lib/mongodb";

const SITE_SETTINGS_KEY = "site-config";
const SITE_SETTINGS_CONTENT_VERSION = 2;

export const DEFAULT_SITE_SETTINGS = Object.freeze({
  siteLocked: false,
  lockBadge: "Thông báo ",
  lockTitle: "Dừng Hoạt Động",
  lockMessage:
    "Trang web chính thức ngừng hoạt động kể từ ngày 06/05/2026. Quyết định này nhằm mục đích tuân thủ nghiêm túc các quy định của pháp luật Việt Nam. Website sẽ chỉ được mở lại tạm thời vào ngày báo cáo đồ án phục vụ mục đích học tập và trình bày.",
});

function sanitizeSiteSettings(doc = {}) {
  return {
    siteLocked: Boolean(doc.siteLocked),
    lockBadge: doc.lockBadge || DEFAULT_SITE_SETTINGS.lockBadge,
    lockTitle: doc.lockTitle || DEFAULT_SITE_SETTINGS.lockTitle,
    lockMessage: doc.lockMessage || DEFAULT_SITE_SETTINGS.lockMessage,
  };
}

export async function getSiteSettings() {
  const db = await getDb();
  const collection = db.collection("settings");
  const existing = await collection.findOne({ key: SITE_SETTINGS_KEY });

  if (existing) {
    if ((existing.contentVersion || 0) < SITE_SETTINGS_CONTENT_VERSION) {
      const migratedSettings = {
        ...DEFAULT_SITE_SETTINGS,
        siteLocked: Boolean(existing.siteLocked),
      };

      await collection.updateOne(
        { key: SITE_SETTINGS_KEY },
        {
          $set: {
            ...migratedSettings,
            contentVersion: SITE_SETTINGS_CONTENT_VERSION,
            updatedAt: new Date(),
          },
        },
      );

      return sanitizeSiteSettings(migratedSettings);
    }

    return sanitizeSiteSettings(existing);
  }

  const now = new Date();
  const initialSettings = {
    key: SITE_SETTINGS_KEY,
    ...DEFAULT_SITE_SETTINGS,
    contentVersion: SITE_SETTINGS_CONTENT_VERSION,
    createdAt: now,
    updatedAt: now,
  };

  await collection.updateOne(
    { key: SITE_SETTINGS_KEY },
    { $setOnInsert: initialSettings },
    { upsert: true },
  );

  return sanitizeSiteSettings(initialSettings);
}

export async function updateSiteSettings(patch = {}) {
  const db = await getDb();
  const collection = db.collection("settings");
  const currentSettings = await getSiteSettings();
  const nextSettings = {
    ...currentSettings,
    ...patch,
  };

  await collection.updateOne(
    { key: SITE_SETTINGS_KEY },
    {
      $set: {
        ...nextSettings,
        contentVersion: SITE_SETTINGS_CONTENT_VERSION,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        key: SITE_SETTINGS_KEY,
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );

  return sanitizeSiteSettings(nextSettings);
}
