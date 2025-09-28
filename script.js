const form = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const searchInput = document.getElementById("search");
const dashboard = document.getElementById("dashboard");
const themeToggle = document.getElementById("toggle-theme");
const calendarBtn = document.getElementById("calendar-btn");
const exportBtn = document.getElementById("export-btn");
const calendarModal = document.getElementById("calendar-modal");
const closeCalendar = document.getElementById("close-calendar");
const calendarDate = document.getElementById("calendar-date");
const calendarTasks = document.getElementById("calendar-tasks");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

form.addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("task-name").value;
  const deadline = document.getElementById("task-deadline").value;
  const priority = document.getElementById("task-priority").value;
  const subject = document.getElementById("task-subject").value;

  const task = { name, deadline, priority, subject, id: Date.now(), completed: false };
  tasks.push(task);
  saveTasks();
  renderTasks(searchInput.value);
  form.reset();
});

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks(filter = "") {
  taskList.innerHTML = "";
  const filtered = tasks
    .filter(task => task.subject.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  filtered.forEach(task => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.style.borderLeft = `5px solid ${getPriorityColor(task.priority)}`;
    if (isUrgent(task.deadline)) li.style.backgroundColor = "#ffe0e0";

    li.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleComplete(${task.id})" />
      <span><strong>${task.name}</strong> (${task.subject})</span>
      <span>Deadline: ${task.deadline} (${getDaysLeft(task.deadline)})</span>
      <span>Priority: ${task.priority}</span>
      <button onclick="editTask(${task.id})">Edit</button>
      <button onclick="deleteTask(${task.id})">Delete</button>
    `;
    taskList.appendChild(li);
  });

  renderDashboard();
}

function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  task.completed = !task.completed;
  saveTasks();
  renderTasks(searchInput.value);
}

function getPriorityColor(priority) {
  switch (priority) {
    case "High": return "crimson";
    case "Medium": return "orange";
    case "Low": return "green";
    default: return "gray";
  }
}

function getDaysLeft(deadline) {
  const now = new Date();
  const due = new Date(deadline);
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? `${diff} day(s) left` : "Past due";
}

function isUrgent(deadline) {
  const days = getDaysLeft(deadline);
  return days.includes("1 day") || days.includes("2 day");
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks(searchInput.value);
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  document.getElementById("task-name").value = task.name;
  document.getElementById("task-deadline").value = task.deadline;
  document.getElementById("task-priority").value = task.priority;
  document.getElementById("task-subject").value = task.subject;
  deleteTask(id);
}

searchInput.addEventListener("input", () => {
  renderTasks(searchInput.value);
});

function renderDashboard() {
  const subjectCount = {};
  let completed = 0;

  tasks.forEach(task => {
    subjectCount[task.subject] = (subjectCount[task.subject] || 0) + 1;
    if (task.completed) completed++;
  });

  const total = tasks.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  dashboard.innerHTML = `
    <h3>📊 Subject Breakdown</h3>
    ${Object.entries(subjectCount).map(([subject, count]) => `<p>${subject}: ${count} task(s)</p>`).join("")}
    <h3>✅ Progress</h3>
    <p>${completed} of ${total} tasks completed</p>
    <div class="progress-bar">
      <div class="progress-fill" style="width: ${percent}%"></div>
    </div>
  `;
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// 🔔 Deadline Alerts
function showDeadlineAlerts() {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const alerts = tasks.filter(t => t.deadline === today || t.deadline === tomorrow);
  if (alerts.length) {
    alert(`⏰ You have ${alerts.length} task(s) due today or tomorrow!`);
  }
}

// 📅 Calendar Modal
calendarBtn.addEventListener("click", () => {
  calendarModal.classList.remove("hidden");
  calendarDate.value = new Date().toISOString().split("T")[0];
  renderCalendarTasks(calendarDate.value);
});

closeCalendar.addEventListener("click", () => {
  calendarModal.classList.add("hidden");
});

calendarDate.addEventListener("change", () => {
  renderCalendarTasks(calendarDate.value);
});

function renderCalendarTasks(date) {
  calendarTasks.innerHTML = "";
  const matches = tasks.filter(t => t.deadline === date);
  if (matches.length === 0) {
    calendarTasks.innerHTML = "<li>No tasks for this date.</li>";
  } else {
    matches.forEach(task => {
      const li = document.createElement("li");
      li.textContent = `${task.name} (${task.subject}) - ${task.priority}`;
      calendarTasks.appendChild(li);
    });
  }
}

// 📤 Export to JSON
exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "study-tasks.json";
  a.click();
});

// ⏰ Run alerts on load
showDeadlineAlerts();
renderTasks();