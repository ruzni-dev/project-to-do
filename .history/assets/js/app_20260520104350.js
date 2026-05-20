const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskDate = document.getElementById('task-date');
const addBtn = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const toggleTheme = document.getElementById('toggle-theme');
const filterButtons = document.querySelectorAll('.filter-btn');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editTaskText = document.getElementById('edit-task-text');
const editTaskDate = document.getElementById('edit-task-date');
const closeModalBtn = document.getElementById('close-modal');
const cancelEditBtn = document.getElementById('cancel-edit');

const soundAdd = document.getElementById('sound-add');
const soundDone = document.getElementById('sound-done');
const soundDelete = document.getElementById('sound-delete');

function loadTasks() {
  try {
    return (JSON.parse(localStorage.getItem('tasks')) || []).map((task) => ({
      id: task.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text: task.text,
      completed: Boolean(task.completed),
      date: task.date || '',
    }));
  } catch {
    return [];
  }
}

let tasks = loadTasks();
let currentFilter = 'all';
let draggedTaskId = null;
let editingTaskId = null;

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark');
  toggleTheme.textContent = 'Light Mode';
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTaskById(id) {
  return tasks.find((task) => task.id === id);
}

function openEditModal(task) {
  editingTaskId = task.id;
  editTaskText.value = task.text;
  editTaskDate.value = task.date;
  editModal.classList.add('open');
  editModal.setAttribute('aria-hidden', 'false');
  editTaskText.focus();
}

function closeEditModal() {
  editingTaskId = null;
  editForm.reset();
  editModal.classList.remove('open');
  editModal.setAttribute('aria-hidden', 'true');
}

function saveEditedTask() {
  if (!editingTaskId) return;

  const task = getTaskById(editingTaskId);
  if (!task) {
    closeEditModal();
    return;
  }

  const newText = editTaskText.value.trim();
  if (!newText) return;

  task.text = newText;
  task.date = editTaskDate.value;
  saveTasks();
  renderTasks();
  closeEditModal();
}

function renderTasks() {
  taskList.innerHTML = '';

  tasks.forEach((task) => {
    if (
      (currentFilter === 'completed' && !task.completed) ||
      (currentFilter === 'active' && task.completed)
    ) {
      return;
    }

    const li = document.createElement('li');
    li.draggable = true;
    li.dataset.id = task.id;

    li.addEventListener('dragstart', () => {
      draggedTaskId = task.id;
      li.classList.add('dragging');
    });

    li.addEventListener('dragend', () => {
      draggedTaskId = null;
      li.classList.remove('dragging');
    });

    li.addEventListener('dragover', (event) => {
      event.preventDefault();
    });

    li.addEventListener('drop', (event) => {
      event.preventDefault();

      if (!draggedTaskId || draggedTaskId === task.id) {
        return;
      }

      const fromIndex = tasks.findIndex((item) => item.id === draggedTaskId);
      const toIndex = tasks.findIndex((item) => item.id === task.id);

      if (fromIndex === -1 || toIndex === -1) {
        return;
      }

      const [draggedTask] = tasks.splice(fromIndex, 1);
      const targetIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
      tasks.splice(targetIndex, 0, draggedTask);
      saveTasks();
      renderTasks();
    });

    const span = document.createElement('span');
    span.className = 'task-text';
    if (task.completed) span.classList.add('completed');

    let displayText = task.text;
    if (task.date) {
      displayText += ` (Due: ${task.date})`;
      if (new Date(task.date) < new Date() && !task.completed) {
        span.style.color = 'red';
      }
    }

    span.textContent = displayText;
    li.appendChild(span);

    const buttons = document.createElement('div');

    const completeBtn = document.createElement('button');
    completeBtn.textContent = '✓';
    completeBtn.className = 'complete-btn';
    completeBtn.onclick = () => {
      const currentTask = getTaskById(task.id);
      if (!currentTask) return;

      currentTask.completed = !currentTask.completed;
      saveTasks();
      renderTasks();
    };

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-btn';
    editBtn.onclick = () => {
      const currentTask = getTaskById(task.id);
      if (!currentTask) return;

      openEditModal(currentTask);
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveTasks();
      renderTasks();
    };

    buttons.appendChild(completeBtn);
    buttons.appendChild(editBtn);
    buttons.appendChild(deleteBtn);
    li.appendChild(buttons);

    taskList.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  const date = taskDate.value;

  if (text !== '') {
    tasks.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text,
      completed: false,
      date,
    });
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskDate.value = '';
  }
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask();
});

editForm.addEventListener('submit', (event) => {
  event.preventDefault();
  saveEditedTask();
});

closeModalBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);

editModal.addEventListener('click', (event) => {
  if (event.target === editModal) {
    closeEditModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && editModal.classList.contains('open')) {
    closeEditModal();
  }
});

toggleTheme.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  toggleTheme.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((button) => button.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

renderTasks();