const taskInput = document.getElementById('task-input');
const taskDate = document.getElementById('task-date');
const addBtn = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const toggleTheme = document.getElementById('toggle-theme');
const filterButtons = document.querySelectorAll('.filter-btn');

const soundAdd = document.getElementById('sound-add');
const soundDone = document.getElementById('sound-done');
const soundDelete = document.getElementById('sound-delete');

let tasks = (JSON.parse(localStorage.getItem('tasks')) || []).map((task) => ({
  id: task.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  text: task.text,
  completed: Boolean(task.completed),
  date: task.date || '',
}));
let currentFilter = 'all';
let draggedTaskId = null;

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTaskById(id) {
  return tasks.find((task) => task.id === id);
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

      const newText = prompt('Edit task:', currentTask.text);
      if (newText) {
        currentTask.text = newText;
        saveTasks();
        renderTasks();
      }
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

addBtn.addEventListener('click', () => {
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
});

toggleTheme.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  toggleTheme.textContent = document.body.classList.contains('dark')
    ? 'Light Mode'
    : 'Dark Mode';
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