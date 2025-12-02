// IMPORT FIREBASE MODULE
import {
  auth,
  db,
  userBudgetDocRef,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "./firebase.js";

// -------------------- STATE --------------------
let items = [];
let monthlyBudget = 0;
let currentEditIndex = null;
let chart = null;
let currentUser = null;
let docUnsubscribe = null;

// -------------------- UI Elements --------------------
const monthlyBudgetInput = document.getElementById("monthlyBudget");
const totalAmountEl = document.getElementById("totalAmount");
const remainingAmountEl = document.getElementById("remainingAmount");
const listEl = document.getElementById("list");

const addModalBg = document.getElementById("addModalBg");
const addLabel = document.getElementById("addLabel");
const addAmount = document.getElementById("addAmount");
const addCategory = document.getElementById("addCategory");
const modalTitle = document.getElementById("modalTitle");
const modalPrimaryBtn = document.getElementById("modalPrimaryBtn");
const modalCloseBtn = document.getElementById("modalCloseBtn");

const btnAdd = document.getElementById("btnAdd");
const saveBudgetBtn = document.getElementById("saveBudgetBtn");

const authModalBg = document.getElementById("authModalBg");
const btnOpenAuth = document.getElementById("btnOpenAuth");
const btnLogout = document.getElementById("btnLogout");
const userEmailDiv = document.getElementById("userEmail");

const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");
const anonSignIn = document.getElementById("anonSignIn");

// -------------------- AUTH EVENTS --------------------

btnOpenAuth.addEventListener("click", () => {
  authModalBg.style.display = "flex";
});

signInBtn.addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(auth, authEmail.value, authPassword.value);
    authModalBg.style.display = "none";
  } catch (e) {
    alert(e.message);
  }
});

signUpBtn.addEventListener("click", async () => {
  try {
    await createUserWithEmailAndPassword(
      auth,
      authEmail.value,
      authPassword.value
    );
    authModalBg.style.display = "none";
  } catch (e) {
    alert(e.message);
  }
});

anonSignIn.addEventListener("click", async () => {
  try {
    await signInAnonymously(auth);
    authModalBg.style.display = "none";
  } catch (e) {
    alert(e.message);
  }
});

btnLogout.addEventListener("click", async () => {
  await signOut(auth);
});

// -------------------- AUTH STATE LISTENER --------------------
onAuthStateChanged(auth, (user) => {
  currentUser = user;

  if (user) {
    userEmailDiv.textContent = user.isAnonymous ? "Anonymous" : user.email;
    btnOpenAuth.style.display = "none";
    btnLogout.style.display = "inline-block";

    subscribeToBudgetDoc(user.uid);
  } else {
    userEmailDiv.textContent = "";
    btnOpenAuth.style.display = "inline-block";
    btnLogout.style.display = "none";

    items = [];
    monthlyBudget = 0;
    monthlyBudgetInput.value = "";
    renderList();
    updateChart();
    calculateRemaining();

    if (docUnsubscribe) docUnsubscribe();
  }
});

// -------------------- FIRESTORE REALTIME --------------------
function subscribeToBudgetDoc(uid) {
  const ref = userBudgetDocRef(uid);

  if (docUnsubscribe) docUnsubscribe();

  docUnsubscribe = onSnapshot(ref, async (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      monthlyBudget = Number(data.monthlyBudget || 0);
      items = data.items || [];

      monthlyBudgetInput.value = monthlyBudget;

      renderList();
      updateChart();
      calculateRemaining();
    } else {
      await setDoc(ref, {
        monthlyBudget: 0,
        items: [],
        createdAt: serverTimestamp(),
      });
    }
  });
}

// -------------------- SAVE TO FIRESTORE --------------------
async function saveToFirestore() {
  if (!currentUser) return alert("Please sign in first.");

  const ref = userBudgetDocRef(currentUser.uid);

  await setDoc(
    ref,
    {
      monthlyBudget,
      items,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// -------------------- UI: Add / Update Item --------------------
btnAdd.addEventListener("click", () => {
  currentEditIndex = null;
  modalTitle.textContent = "Add Expense";
  modalPrimaryBtn.textContent = "Add";
  addLabel.value = "";
  addAmount.value = "";
  addCategory.value = "Food";
  addModalBg.style.display = "flex";
});

modalPrimaryBtn.addEventListener("click", async () => {
  const label = addLabel.value.trim();
  const amount = Number(addAmount.value);
  const category = addCategory.value;

  if (!label || !amount) return alert("Enter label & amount.");

  if (currentEditIndex === null) items.push({ label, amount, category });
  else items[currentEditIndex] = { label, amount, category };

  addModalBg.style.display = "none";
  await saveToFirestore();
});

// -------------------- SAVE BUDGET --------------------
saveBudgetBtn.addEventListener("click", async () => {
  monthlyBudget = Number(monthlyBudgetInput.value) || 0;
  await saveToFirestore();
});

// -------------------- RENDER LIST --------------------
function renderList() {
  listEl.innerHTML = "";
  let total = 0;

  items.forEach((item, index) => {
    total += item.amount;

    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <div class="left-info">
        <strong>${escapeHtml(item.label)}</strong>
        <div style="font-size:13px;color:#6b7280;">Rs ${item.amount}</div>
        <div class="item-category">${item.category}</div>
      </div>
      <div class="actions">
        <button class="edit-btn" data-index="${index}">Edit</button>
        <button class="delete-btn" data-index="${index}">Delete</button>
      </div>
    `;

    listEl.appendChild(div);
  });

  totalAmountEl.textContent = total;

  document
    .querySelectorAll(".edit-btn")
    .forEach((btn) =>
      btn.addEventListener("click", () => openEditModal(btn.dataset.index))
    );

  document.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this item?")) return;
      items.splice(btn.dataset.index, 1);
      await saveToFirestore();
    })
  );
}

function openEditModal(index) {
  currentEditIndex = index;
  const item = items[index];
  addLabel.value = item.label;
  addAmount.value = item.amount;
  addCategory.value = item.category;

  modalTitle.textContent = "Edit Expense";
  modalPrimaryBtn.textContent = "Update";
  addModalBg.style.display = "flex";
}

// -------------------- CALCULATE REMAINING --------------------
function calculateRemaining() {
  const total = items.reduce((a, b) => a + b.amount, 0);
  remainingAmountEl.textContent = monthlyBudget - total;
}

// -------------------- CHART --------------------
function updateChart() {
  const totals = {};
  items.forEach((it) => {
    totals[it.category] = (totals[it.category] || 0) + it.amount;
  });

  const labels = Object.keys(totals);
  const values = Object.values(totals);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "#4a6cf7",
            "#ff6b6b",
            "#ffd95a",
            "#6bcf6b",
            "#9b59b6",
            "#3498db",
            "#f78fb3",
          ],
        },
      ],
    },
    options: { responsive: false },
  });
}

// -------------------- UTILS --------------------
function escapeHtml(str) {
  return str.replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[m])
  );
}

// Close modals when clicking background
window.addEventListener("click", (e) => {
  if (e.target === addModalBg) addModalBg.style.display = "none";
  if (e.target === authModalBg) authModalBg.style.display = "none";
});
