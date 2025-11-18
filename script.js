class PeacefulTodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    bindEvents() {
        // Form submission
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Clear completed tasks
        document.getElementById('clear-completed').addEventListener('click', () => {
            this.clearCompleted();
        });

        // Export tasks
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportTasks();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('task-input').focus();
            }
        });
    }

    addTask() {
        const input = document.getElementById('task-input');
        const text = input.value.trim();

        if (text === '') {
            this.showMessage('Please enter a task description', 'warning');
            return;
        }

        const task = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.unshift(task);
        input.value = '';
        this.saveTasks();
        this.render();
        this.updateStats();
        
        this.showMessage('Task added successfully! 🌟', 'success');
    }

    deleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && confirm(`Are you sure you want to delete "${task.text}"?`)) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.render();
            this.updateStats();
            this.showMessage('Task removed', 'info');
        }
    }

    toggleComplete(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.render();
            this.updateStats();
            
            const message = task.completed ? 
                'Great job! Task completed! 🎉' : 
                'Task marked as pending';
            this.showMessage(message, 'success');
        }
    }

    clearCompleted() {
        const completedTasks = this.tasks.filter(task => task.completed);
        
        if (completedTasks.length === 0) {
            this.showMessage('No completed tasks to clear', 'info');
            return;
        }

        if (confirm(`Clear ${completedTasks.length} completed task${completedTasks.length > 1 ? 's' : ''}?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.render();
            this.updateStats();
            this.showMessage('Completed tasks cleared 🧹', 'success');
        }
    }

    exportTasks() {
        if (this.tasks.length === 0) {
            this.showMessage('No tasks to export', 'info');
            return;
        }

        const data = {
            exportedAt: new Date().toISOString(),
            totalTasks: this.tasks.length,
            completedTasks: this.tasks.filter(t => t.completed).length,
            tasks: this.tasks
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `my-peaceful-tasks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showMessage('Tasks exported successfully! 📥', 'success');
    }

    render() {
        const taskList = document.getElementById('task-list');
        const emptyState = document.getElementById('empty-state');

        if (this.tasks.length === 0) {
            taskList.innerHTML = '';
            emptyState.classList.add('show');
            return;
        }

        emptyState.classList.remove('show');
        
        taskList.innerHTML = this.tasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     onclick="peacefulApp.toggleComplete('${task.id}')"
                     title="${task.completed ? 'Mark as pending' : 'Mark as complete'}">
                </div>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="delete-btn" 
                            onclick="peacefulApp.deleteTask('${task.id}')"
                            title="Delete this task">
                        Remove
                    </button>
                </div>
            </li>
        `).join('');
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('completed-tasks').textContent = completedTasks;
        document.getElementById('pending-tasks').textContent = pendingTasks;
    }

    saveTasks() {
        try {
            localStorage.setItem('peacefulTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Failed to save tasks:', error);
            this.showMessage('Failed to save tasks to storage', 'error');
        }
    }

    loadTasks() {
        try {
            const saved = localStorage.getItem('peacefulTasks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load tasks:', error);
            return [];
        }
    }

    showMessage(message, type = 'info') {
        // Remove existing message
        const existing = document.querySelector('.message-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `message-toast message-${type}`;
        toast.textContent = message;
        
        // Style the toast
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getMessageColor(type)};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            font-weight: 500;
            max-width: 300px;
        `;

        document.body.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    getMessageColor(type) {
        const colors = {
            success: 'var(--success)',
            error: 'var(--error)',
            warning: 'var(--warning)',
            info: 'var(--primary)'
        };
        return colors[type] || colors.info;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Add CSS for toast animations
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(toastStyles);

// Initialize the app
const peacefulApp = new PeacefulTodoApp();
