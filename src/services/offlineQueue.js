import { openDB } from 'idb';

export async function saveToQueue(item) {
  const db = await openDB("warden-db", 1, {
    upgrade(db) {
      db.createObjectStore("queue", { keyPath: "id", autoIncrement: true });
    },
  });

  await db.add("queue", {
    ...item,
    timestamp: Date.now(),
  });
}

export async function getQueuedItems() {
  const db = await openDB("warden-db", 1);
  return await db.getAll("queue");
}

export async function clearQueue() {
  const db = await openDB("warden-db", 1);
  await db.clear("queue");
}
