const taskInput = document.getElementById('task-input');
const taskDate = document.getElementById('task-date');
const addBtn = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const toggleTheme = document.getElementById('toggle-theme');
const filterButtons = document.querySelectorAll('.filter-btn');

const soundAdd = document.getElementById('sound-add');
const soundDone = document.getElementById('sound-done');
const soundDelete = document.getElementById('sound-delete');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';

  tasks.forEach((task, index) => {
    if (
      (currentFilter === 'completed' && !task.completed) ||
      (currentFilter === 'active' && task.completed)
    ) {
      return;
    }

    const li = document.createElement('li');

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
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
    };

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-btn';
    editBtn.onclick = () => {
      const newText = prompt('Edit task:', task.text);
      if (newText) {
        tasks[index].text = newText;
        saveTasks();
        renderTasks();
      }
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = () => {
      tasks.splice(index, 1);
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
    tasks.push({ text, completed: false, date });
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

new Sortable(taskList, {
  animation: 150,
  onEnd: () => {
    const newTasks = [];
    taskList.querySelectorAll('li').forEach((li) => {
      const taskText = li.querySelector('.task-text').textContent.split(' (Due:')[0];
      const task = tasks.find((item) => item.text === taskText);
      if (task) newTasks.push(task);
    });
    tasks = newTasks;
    saveTasks();
  },
});

renderTasks();