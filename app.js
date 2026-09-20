// Select DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskCategory = document.getElementById('task-category');
const taskPriority = document.getElementById('task-priority');
const taskDate = document.getElementById('task-date');
const taskList = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalCountEl = document.getElementById('total-count');
const completedCountEl = document.getElementById('completed-count');
const emptyState = document.getElementById('empty-state');

// State Management: Load from LocalStorage or start with an empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let searchQuery = '';

// Helper: Save tasks to LocalStorage and re-render
function saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

// 1. Add Task Event
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newTask = {
        id: Date.now().toString(),
        text: taskInput.value.trim(),
        category: taskCategory.value,
        priority: taskPriority.value,
        date: taskDate.value || 'No due date',
        completed: false
    };

    tasks.unshift(newTask); // Add to the beginning of the array
    taskForm.reset();
    saveAndRender();
});

// 2. Toggle Task Completion
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveAndRender();
}

// 3. Delete Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveAndRender();
}

// 4. Search and Filter Listeners
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderTasks();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Update active class on buttons
        filterBtns.forEach(b => {
            b.classList.remove('bg-indigo-600', 'text-white');
            b.classList.add('text-slate-400');
        });
        e.target.classList.add('bg-indigo-600', 'text-white');
        e.target.classList.remove('text-slate-400');

        currentFilter = e.target.getAttribute('data-filter');
        renderTasks();
    });
});

// 5. Render Tasks to DOM
function renderTasks() {
    // Filter tasks based on status and search query
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.text.toLowerCase().includes(searchQuery);
        
        if (currentFilter === 'active') return matchesSearch && !task.completed;
        if (currentFilter === 'completed') return matchesSearch && task.completed;
        return matchesSearch; // 'all'
    });

    // Update Counter Stats
    totalCountEl.textContent = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    completedCountEl.textContent = completedCount;

    // Handle Empty State
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    // Generate HTML for each task
    taskList.innerHTML = filteredTasks.map(task => {
        // Priority color mapping
        let priorityColor = 'text-slate-400 bg-slate-800 border-slate-700';
        if (task.priority === 'High') priorityColor = 'text-rose-400 bg-rose-950/40 border-rose-900/50';
        if (task.priority === 'Medium') priorityColor = 'text-amber-400 bg-amber-950/40 border-amber-900/50';
        if (task.priority === 'Low') priorityColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50';

        return `
            <div class="group flex items-center justify-between bg-slate-950 border border-slate-800/80 hover:border-slate-700 p-4 rounded-xl transition">
                <div class="flex items-center space-x-3.5 flex-1 min-w-0">
                    <!-- Checkbox -->
                    <input 
                        type="checkbox" 
                        onclick="toggleTask('${task.id}')"
                        ${task.completed ? 'checked' : ''}
                        class="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                    >
                    <!-- Task Details -->
                    <div class="min-w-0 flex-1">
                        <p class="text-sm font-medium text-slate-200 truncate ${task.completed ? 'line-through text-slate-500' : ''}">
                            ${escapeHTML(task.text)}
                        </p>
                        <div class="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
                            <span class="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md text-slate-300">
                                ${task.category}
                            </span>
                            <span class="border px-2 py-0.5 rounded-md ${priorityColor}">
                                ${task.priority}
                            </span>
                            ${task.date !== 'No due date' ? `<span class="text-slate-500"><i class="fa-regular fa-calendar mr-1"></i>${task.date}</span>` : ''}
                        </div>
                    </div>
                </div>
                <!-- Delete Button -->
                <button 
                    onclick="deleteTask('${task.id}')" 
                    class="text-slate-500 hover:text-rose-400 p-2 opacity-0 group-hover:opacity-100 transition focus:opacity-100"
                    title="Delete Task"
                >
                    <i class="fa-solid fa-trash-can text-sm"></i>
                </button>
            </div>
        `;
    }).join('');
}

// Security Helper: Prevent XSS injection attacks
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Initial render when the page loads
renderTasks();

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('Service Worker Registered!'))
      .catch((err) => console.log('Service Worker Failed:', err));
  });
}