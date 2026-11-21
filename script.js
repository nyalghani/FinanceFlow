const storageKey = "financeflow-transactions";

const cad = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD"
});

const dateFormat = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

const categorySymbols = {
  Food: "◒",
  Shopping: "◇",
  Transportation: "↔",
  Entertainment: "✦",
  Salary: "$",
  Other: "▦"
};

const form = document.getElementById("transaction-form");
const nameInput = document.getElementById("transaction-name");
const amountInput = document.getElementById("transaction-amount");
const categoryInput = document.getElementById("transaction-category");
const formError = document.getElementById("form-error");
const filter = document.getElementById("transaction-filter");
const transactionList = document.getElementById("transaction-list");
const transactionTemplate = document.getElementById("transaction-template");
const spendingList = document.getElementById("spending-list");
const spendingTemplate = document.getElementById("spending-template");
const storageNote = document.getElementById("storage-note");
const actionStatus = document.getElementById("action-status");

let transactions = loadTransactions();

function createSampleTransactions() {
  const samples = [
    { name: "Monthly salary", amountCents: 485000, type: "income", category: "Salary", daysAgo: 0 },
    { name: "Weekly groceries", amountCents: 12650, type: "expense", category: "Food", daysAgo: 1 },
    { name: "Monthly transit pass", amountCents: 11200, type: "expense", category: "Transportation", daysAgo: 3 },
    { name: "Laptop accessories", amountCents: 18425, type: "expense", category: "Shopping", daysAgo: 5 },
    { name: "Movie night", amountCents: 3800, type: "expense", category: "Entertainment", daysAgo: 8 },
    { name: "Rent contribution", amountCents: 80000, type: "expense", category: "Other", daysAgo: 10 }
  ];

  samples.forEach(function (sample, index) {
    const date = new Date();
    date.setDate(date.getDate() - sample.daysAgo);
    sample.date = date.toISOString();
    sample.id = "sample-" + index;
    sample.isSample = true;
  });

  return samples;
}

function loadTransactions() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === null) {
      return createSampleTransactions();
    }

    const savedTransactions = JSON.parse(saved);
    if (Array.isArray(savedTransactions)) {
      return savedTransactions;
    }
  } catch (error) {
    storageNote.textContent = "Saved data could not be loaded";
    return [];
  }

  return [];
}

function saveTransactions() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(transactions));
    storageNote.textContent = "Saved in this browser";
  } catch (error) {
    storageNote.textContent = "Changes could not be saved";
    actionStatus.textContent += " Browser storage is unavailable.";
  }
}

function addTransaction(event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const amountCents = Math.round(amountInput.valueAsNumber * 100);
  const type = form.querySelector('input[name="type"]:checked').value;
  const category = categoryInput.value;

  formError.textContent = "";
  if (name === "") {
    formError.textContent = "Enter a transaction name.";
    nameInput.focus();
    return;
  }
  if (!Number.isSafeInteger(amountCents) || amountCents < 1 || amountInput.validity.stepMismatch) {
    formError.textContent = "Enter a positive amount with up to two decimal places.";
    amountInput.focus();
    return;
  }
  if (category === "") {
    formError.textContent = "Select a category.";
    categoryInput.focus();
    return;
  }

  const transaction = {
    id: Date.now() + "-" + Math.random().toString(36).slice(2),
    name: name,
    amountCents: amountCents,
    type: type,
    category: category,
    date: new Date().toISOString()
  };

  // Put the newest entry first and replace any examples with real entries.
  transactions = transactions.filter(function (entry) {
    return !entry.isSample;
  });
  transactions.unshift(transaction);

  if (filter.value !== "all" && filter.value !== type) {
    filter.value = "all";
  }
  actionStatus.textContent = name + " added.";
  saveTransactions();
  renderDashboard();
  form.reset();
  nameInput.focus();
}

function deleteTransaction(id) {
  transactions = transactions.filter(function (transaction) {
    return transaction.id !== id;
  });
  actionStatus.textContent = "Transaction deleted.";
  saveTransactions();
  renderDashboard();
}

function filterTransactions(type) {
  if (type === "all") {
    return transactions;
  }

  return transactions.filter(function (transaction) {
    return transaction.type === type;
  });
}

function displayTransactions() {
  const visibleTransactions = filterTransactions(filter.value);
  const hasMatches = visibleTransactions.length > 0;

  transactionList.textContent = "";
  document.getElementById("history-columns").hidden = !hasMatches;
  document.getElementById("history-empty").hidden = hasMatches;
  document.getElementById("history-empty-title").textContent =
    transactions.length === 0 ? "No transactions yet" : "No matching transactions";
  document.getElementById("history-empty-detail").textContent =
    transactions.length === 0 ? "Add a transaction to get started." : "Choose a different filter to see more.";
  document.getElementById("history-count").textContent =
    visibleTransactions.length + (visibleTransactions.length === 1 ? " transaction" : " transactions");

  visibleTransactions.forEach(function (transaction, index) {
    const row = transactionTemplate.content.cloneNode(true);
    const icon = row.querySelector(".category-icon");
    const date = row.querySelector(".transaction-date");
    const amount = row.querySelector(".transaction-amount");
    const deleteButton = row.querySelector(".delete-button");

    // Use textContent so names and categories are displayed as plain text.
    row.querySelector(".transaction-name").textContent = transaction.name;
    row.querySelector(".transaction-category").textContent = transaction.category;
    icon.textContent = categorySymbols[transaction.category];
    icon.classList.add(transaction.category.toLowerCase());
    date.dateTime = transaction.date;
    date.textContent = dateFormat.format(new Date(transaction.date));

    const isIncome = transaction.type === "income";
    row.querySelector(".transaction-value").classList.add(transaction.type);
    row.querySelector(".transaction-type").textContent = isIncome ? "Income" : "Expense";
    amount.textContent = isIncome ? "+" + cad.format(transaction.amountCents / 100)
      : cad.format(-transaction.amountCents / 100);

    deleteButton.setAttribute("aria-label", "Delete " + transaction.name);
    deleteButton.addEventListener("click", function () {
      deleteTransaction(transaction.id);
      const remainingButtons = transactionList.querySelectorAll(".delete-button");
      const nextButton = remainingButtons[index] || remainingButtons[index - 1] || filter;
      nextButton.focus();
    });
    transactionList.appendChild(row);
  });
}

function updateSummary() {
  // Add whole cents to avoid rounding each time money is added.
  let incomeCents = 0;
  let expenseCents = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  transactions.forEach(function (transaction) {
    if (transaction.type === "income") {
      incomeCents += transaction.amountCents;
      incomeCount++;
    } else {
      expenseCents += transaction.amountCents;
      expenseCount++;
    }
  });

  document.getElementById("total-balance").textContent = cad.format((incomeCents - expenseCents) / 100);
  document.getElementById("total-income").textContent = cad.format(incomeCents / 100);
  document.getElementById("total-expenses").textContent = cad.format(expenseCents / 100);
  document.getElementById("income-count").textContent =
    incomeCount + (incomeCount === 1 ? " income transaction" : " income transactions");
  document.getElementById("expense-count").textContent =
    expenseCount + (expenseCount === 1 ? " expense transaction" : " expense transactions");

  return expenseCents;
}

function updateSpendingBreakdown(totalExpenseCents) {
  const categoryTotals = {};

  transactions.forEach(function (transaction) {
    if (transaction.type === "expense") {
      const category = transaction.category;
      categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amountCents;
    }
  });

  spendingList.textContent = "";
  document.getElementById("spending-empty").hidden = totalExpenseCents > 0;

  const categories = Object.keys(categoryTotals);
  categories.sort(function (first, second) {
    return categoryTotals[second] - categoryTotals[first];
  });

  categories.forEach(function (category) {
    const amountCents = categoryTotals[category];
    const item = spendingTemplate.content.cloneNode(true);
    const progress = item.querySelector("progress");

    item.querySelector(".spending-category").textContent = category;
    item.querySelector(".spending-amount").textContent = cad.format(amountCents / 100);
    progress.classList.add(category.toLowerCase());
    progress.value = (amountCents / totalExpenseCents) * 100;
    progress.setAttribute("aria-label", category + " share of total expenses");
    spendingList.appendChild(item);
  });
}

function renderDashboard() {
  const totalExpenseCents = updateSummary();
  displayTransactions();
  updateSpendingBreakdown(totalExpenseCents);

  const hasSamples = transactions.some(function (transaction) {
    return transaction.isSample;
  });
  document.getElementById("sample-notice").hidden = !hasSamples;
}

function updateNavigation() {
  const section = window.location.hash || "#overview";
  document.querySelectorAll(".navigation a").forEach(function (link) {
    if (link.getAttribute("href") === section) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

form.addEventListener("submit", addTransaction);
filter.addEventListener("change", displayTransactions);
window.addEventListener("hashchange", updateNavigation);
document.getElementById("clear-sample").addEventListener("click", function () {
  transactions = transactions.filter(function (transaction) {
    return !transaction.isSample;
  });
  actionStatus.textContent = "Sample transactions cleared.";
  saveTransactions();
  renderDashboard();
  nameInput.focus();
});

updateNavigation();
renderDashboard();
