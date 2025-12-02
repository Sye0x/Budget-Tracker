let items = JSON.parse(localStorage.getItem("items")) || [];
let monthlyBudget = Number(localStorage.getItem("monthlyBudget")) || 0;
let currentEditIndex = null;
let chart = null;

document.getElementById("monthlyBudget").value = monthlyBudget;

function updateBudget() {
  monthlyBudget = Number(document.getElementById("monthlyBudget").value);
  localStorage.setItem("monthlyBudget", monthlyBudget);
  calculateRemaining();
}

function openAddModal() {
  addModalBg.style.display = "flex";
}
function closeAddModal() {
  addModalBg.style.display = "none";
}

function openEditModal(index) {
  currentEditIndex = index;
  editLabel.value = items[index].label;
  editAmount.value = items[index].amount;
  editCategory.value = items[index].category;
  editModalBg.style.display = "flex";
}
function closeEditModal() {
  editModalBg.style.display = "none";
}

window.onclick = function (e) {
  if (e.target == addModalBg) closeAddModal();
  if (e.target == editModalBg) closeEditModal();
};

function addItem() {
  const label = addLabel.value.trim();
  const amount = addAmount.value.trim();
  const category = addCategory.value;

  if (!label || !amount) return alert("Fill all fields!");

  items.push({ label, amount, category });

  saveAndRender();
  closeAddModal();

  addLabel.value = "";
  addAmount.value = "";
}

function updateItem() {
  items[currentEditIndex].label = editLabel.value;
  items[currentEditIndex].amount = editAmount.value;
  items[currentEditIndex].category = editCategory.value;

  saveAndRender();
  closeEditModal();
}

function deleteItem(index) {
  items.splice(index, 1);
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem("items", JSON.stringify(items));
  renderList();
  updateChart();
  calculateRemaining();
}

function renderList() {
  list.innerHTML = "";
  let total = 0;

  items.forEach((item, index) => {
    total += Number(item.amount);

    list.innerHTML += `
      <div class="item">
        <div>
          <strong>${item.label}</strong> — Rs ${item.amount}
          <span class="item-category">${item.category}</span>
        </div>
        <div class="actions">
          <button class="edit-btn" onclick="openEditModal(${index})">Edit</button>
          <button class="delete-btn" onclick="deleteItem(${index})">Delete</button>
        </div>
      </div>
    `;
  });

  totalAmount.innerText = total;
}

function calculateRemaining() {
  let totalSpent = items.reduce((sum, item) => sum + Number(item.amount), 0);
  let remaining = monthlyBudget - totalSpent;
  remainingAmount.innerText = remaining;
}

function updateChart() {
  const categoryTotals = {};

  items.forEach((item) => {
    categoryTotals[item.category] =
      (categoryTotals[item.category] || 0) + Number(item.amount);
  });

  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);

  if (chart) chart.destroy();

  const ctx = document.getElementById("chart");

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
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
          ],
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
    },
  });
}

renderList();
updateChart();
calculateRemaining();
