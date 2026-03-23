const fs = require("fs");

const path = require("path");

const OLD_FILE = path.join("Subscription", "ChurchCBEDB", "ChurchCBEDB.subscriptions.json");
const NEW_FILE = path.join("Subscription", "TodayAddedSubs", "ReceiptsPaymentCBEDB.subscriptions.json");
const OUTPUT_FILE = path.join("Subscription", "Merge.json");

const oldData = JSON.parse(fs.readFileSync(OLD_FILE));
const newData = JSON.parse(fs.readFileSync(NEW_FILE));

const oldArr = Array.isArray(oldData) ? oldData : [oldData];
const newArr = Array.isArray(newData) ? newData : [newData];

const months = [
  "april","may","june","july","august","september",
  "october","november","december","january","february","march"
];

// ✅ Merge receipts (no duplicates)
function mergeReceipts(oldR = [], newR = []) {
  const map = new Map();

  [...oldR, ...newR].forEach(r => {
    const key =
      new Date(r.date.$date || r.date).getTime() + "_" + r.amount;

    if (!map.has(key)) map.set(key, r);
  });

  return Array.from(map.values());
}

// ✅ Merge allocations
function mergeMonth(oldM = {}, newM = {}) {
  const oldA = oldM.allocations || [];
  const newA = newM.allocations || [];

  const map = new Map();

  [...oldA, ...newA].forEach(a => {
    const key =
      new Date(a.date.$date || a.date).getTime() + "_" + a.total;

    if (!map.has(key)) map.set(key, a);
  });

  const allocations = Array.from(map.values());

  const total = allocations.reduce((s, a) => s + (a.total || 0), 0);

  return { allocations, total };
}

// ✅ Calculate allocated total
function calculateAllocated(rec) {
  let total = 0;

  months.forEach(m => {
    total += rec[m]?.total || 0;
  });

  return total;
}

// ✅ Merge record
function mergeRecord(oldRec, newRec) {
  const merged = { ...oldRec };

  // 1️⃣ receipts
  merged.receipts = mergeReceipts(oldRec.receipts, newRec.receipts);

  // 2️⃣ months
  months.forEach(m => {
    if (oldRec[m] || newRec[m]) {
      merged[m] = mergeMonth(oldRec[m], newRec[m]);
    }
  });

  // 3️⃣ total_received
  merged.total_received = merged.receipts.reduce(
    (s, r) => s + (r.amount || 0),
    0
  );

  // 4️⃣ remaining_amount (🔥 CORRECT)
  const allocated = calculateAllocated(merged);
  merged.remaining_amount = Number(
    (merged.total_received - allocated).toFixed(2)
  );

  // 5️⃣ updatedAt
  merged.updatedAt = new Date();

  return merged;
}

// ===== MAIN =====
const map = new Map();

oldArr.forEach(r => map.set(r._id.$oid, r));

newArr.forEach(r => {
  const id = r._id.$oid;

  if (map.has(id)) {
    map.set(id, mergeRecord(map.get(id), r));
  } else {
    map.set(id, r);
  }
});

const result = Array.from(map.values());

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));

console.log("✅ PERFECT MERGE DONE");