document.addEventListener('DOMContentLoaded', () => {
	const taskForm = document.getElementById('task-form');
	const taskInput = document.getElementById('task-input');
	const taskList = document.getElementById('task-list');
	const countEl = document.getElementById('count');
	const completedCountEl = document.getElementById('completed-count');
	const clearCompletedBtn = document.getElementById('clear-completed');
	const exportBtn = document.getElementById('export-btn');
	const emptyState = document.getElementById('empty-state');

	let tasks = [];
	const STORAGE_KEY = 'todoapp_tasks';

	/**
	 * Load tasks from localStorage
	 * Stores tasks as JSON array with structure: [{id, text, completed, createdAt}, ...]
	 */
	function loadTasks() {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			tasks = [];
			return;
		}
		try {
			tasks = JSON.parse(raw) || [];
		} catch (error) {
			console.error('Failed to parse tasks from localStorage:', error);
			tasks = [];
		}
	}

	/**
	 * Save tasks to localStorage as JSON
	 */
	function saveTasks() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
	}

	/**
	 * Update the DOM with current tasks
	 */
	function renderTasks() {
		taskList.innerHTML = '';

		if (tasks.length === 0) {
			emptyState.classList.add('show');
			taskList.style.display = 'none';
			return;
		}

		emptyState.classList.remove('show');
		taskList.style.display = 'block';

		tasks.forEach(task => {
			const li = document.createElement('li');
			li.className = 'task-item';
			if (task.completed) li.classList.add('completed');
			li.dataset.id = task.id;

			// Checkbox for marking complete
			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.className = 'task-checkbox';
			checkbox.checked = !!task.completed;
			checkbox.setAttribute('aria-label', `Mark "${task.text}" as complete`);
			checkbox.addEventListener('change', () => toggleComplete(task.id));

			// Task text
			const span = document.createElement('span');
			span.className = 'task-text';
			span.textContent = task.text;
			span.title = task.text;

			// Delete button
			const deleteBtn = document.createElement('button');
			deleteBtn.className = 'delete-btn';
			deleteBtn.type = 'button';
			deleteBtn.textContent = 'Delete';
			deleteBtn.setAttribute('aria-label', `Delete "${task.text}"`);
			deleteBtn.addEventListener('click', () => deleteTask(task.id));

			li.appendChild(checkbox);
			li.appendChild(span);
			li.appendChild(deleteBtn);
			taskList.appendChild(li);
		});

		updateCounts();
	}

	/**
	 * Update task counters
	 */
	function updateCounts() {
		const total = tasks.length;
		const completed = tasks.filter(t => t.completed).length;

		countEl.textContent = `${total} task${total !== 1 ? 's' : ''}`;
		completedCountEl.textContent = `${completed} completed`;
	}

	/**
	 * Add a new task
	 * @param {string} text - Task description
	 */
	function addTask(text) {
		const trimmed = text.trim();
		if (!trimmed) return;

		const task = {
			id: Date.now().toString(),
			text: trimmed,
			completed: false,
			createdAt: new Date().toISOString()
		};

		tasks.push(task);
		saveTasks();
		renderTasks();
	}

	/**
	 * Delete a task by ID
	 * @param {string} id - Task ID
	 */
	function deleteTask(id) {
		tasks = tasks.filter(t => t.id !== id);
		saveTasks();
		renderTasks();
	}

	/**
	 * Toggle task completion status
	 * @param {string} id - Task ID
	 */
	function toggleComplete(id) {
		tasks = tasks.map(t =>
			t.id === id ? { ...t, completed: !t.completed } : t
		);
		saveTasks();
		renderTasks();
	}

	/**
	 * Clear all completed tasks
	 */
	function clearCompleted() {
		const initialCount = tasks.length;
		tasks = tasks.filter(t => !t.completed);
		if (tasks.length < initialCount) {
			saveTasks();
			renderTasks();
		}
	}

	/**
	 * Export tasks as JSON file
	 */
	function exportTasksAsJSON() {
		if (tasks.length === 0) {
			alert('No tasks to export!');
			return;
		}

		const dataStr = JSON.stringify(tasks, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	// Event listeners
	taskForm.addEventListener('submit', (e) => {
		e.preventDefault();
		addTask(taskInput.value);
		taskInput.value = '';
		taskInput.focus();
	});

	clearCompletedBtn.addEventListener('click', clearCompleted);

	exportBtn.addEventListener('click', exportTasksAsJSON);

	// Keyboard shortcuts
	document.addEventListener('keydown', (e) => {
		// Ctrl+K or Cmd+K to focus input
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault();
			taskInput.focus();
		}
	});

	// Initial load and render
	loadTasks();
	renderTasks();

	// Optional: Export tasks data for debugging/backup
	window.exportTasks = () => {
		const dataStr = JSON.stringify(tasks, null, 2);
		console.log('Current tasks:', dataStr);
		return tasks;
	};
});
