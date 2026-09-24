// NovaSpace Interactive Application Script

document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------------------------------
    // 1. Initial State & Data
    // ------------------------------------------------------------------
    let tasks = [
        { id: 1, text: 'Initialize local Git repository with git init', category: 'git', completed: true },
        { id: 2, text: 'Create standard .gitignore and README.md', category: 'git', completed: true },
        { id: 3, text: 'Configure Git username & user email', category: 'git', completed: false },
        { id: 4, text: 'Push local code to GitHub repository', category: 'git', completed: false },
        { id: 5, text: 'Build feature branch workflow example', category: 'feature', completed: false }
    ];

    const tips = [
        "Atomic commits make debugging 10x easier. Small, focused changes are easier to understand and push to GitHub!",
        "Always check 'git status' before running 'git commit' to make sure you know exactly what changes are staged.",
        "A great README file is your project's front door. Explain what your app does and how to run it locally.",
        "AntiGravity IDE tools allow you to pair program with AI to quickly scaffold modern UI elements & refactor code!",
        "Never commit secret API keys or sensitive passwords to GitHub. Use a .gitignore file to protect them!"
    ];

    let currentTipIndex = 0;

    // Timer Variables
    let timerDuration = 1500; // 25 minutes in seconds
    let timerRemaining = 1500;
    let timerInterval = null;
    let isTimerRunning = false;

    // ------------------------------------------------------------------
    // Toast Notification Helper
    // ------------------------------------------------------------------
    function showToast(message, icon = '🎉', duration = 4000) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-hide');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        }, duration);
    }

    // ------------------------------------------------------------------
    // 2. Tab Navigation System
    // ------------------------------------------------------------------
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');

    const tabHeadings = {
        'dashboard-tab': { title: 'Developer Studio Dashboard', subtitle: 'Welcome to your high-performance focus environment' },
        'tasks-tab': { title: 'Focus Task Manager', subtitle: 'Organize features, bugs, and Git tasks effortlessly' },
        'timer-tab': { title: 'Flow & Productivity Timer', subtitle: 'Stay in the zone with structured focus intervals' },
        'git-guide-tab': { title: 'Git & GitHub Professional Guide', subtitle: 'Master key commands and team development workflows' }
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');
            
            navItems.forEach(i => i.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            item.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            if (tabHeadings[targetTab]) {
                pageTitle.textContent = tabHeadings[targetTab].title;
                pageSubtitle.textContent = tabHeadings[targetTab].subtitle;
            }
        });
    });

    // ------------------------------------------------------------------
    // 3. Task Management Logic
    // ------------------------------------------------------------------
    const quickTaskList = document.getElementById('quick-task-list');
    const fullTaskList = document.getElementById('full-task-list');
    const completedTaskCount = document.getElementById('completed-task-count');
    const taskProgressFill = document.getElementById('task-progress-fill');
    const addTaskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const taskCategory = document.getElementById('task-category');

    function renderTasks(filter = 'all') {
        const completedCount = tasks.filter(t => t.completed).length;
        completedTaskCount.textContent = `${completedCount} / ${tasks.length}`;
        const percentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
        taskProgressFill.style.width = `${percentage}%`;

        // Render Quick Tasks (Dashboard)
        quickTaskList.innerHTML = '';
        tasks.slice(0, 4).forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <div class="task-left">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                    <span class="task-text ${task.completed ? 'completed' : ''}">${escapeHTML(task.text)}</span>
                </div>
                <span class="badge ${getCategoryBadge(task.category)}">${task.category}</span>
            `;
            quickTaskList.appendChild(li);
        });

        // Render Full Tasks (Tasks Tab)
        fullTaskList.innerHTML = '';
        const filteredTasks = tasks.filter(t => {
            if (filter === 'pending') return !t.completed;
            if (filter === 'completed') return t.completed;
            return true;
        });

        filteredTasks.forEach(task => {
            const div = document.createElement('div');
            div.className = 'task-item';
            div.innerHTML = `
                <div class="task-left">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                    <span class="task-text ${task.completed ? 'completed' : ''}">${escapeHTML(task.text)}</span>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <span class="badge ${getCategoryBadge(task.category)}">${task.category}</span>
                    <button class="btn btn-secondary delete-btn" data-id="${task.id}" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;">🗑️</button>
                </div>
            `;
            fullTaskList.appendChild(div);
        });

        attachTaskListeners();
    }

    function getCategoryBadge(cat) {
        if (cat === 'git') return 'badge-purple';
        if (cat === 'bug') return 'badge-rose';
        return 'badge-cyan';
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    function attachTaskListeners() {
        document.querySelectorAll('.task-checkbox').forEach(box => {
            box.addEventListener('change', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                const task = tasks.find(t => t.id === id);
                if (task) {
                    task.completed = e.target.checked;
                    renderTasks();
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Use currentTarget (the button itself) — not e.target, which
                // can be the emoji text node inside the button when clicked directly.
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                tasks = tasks.filter(t => t.id !== id);
                renderTasks();
            });
        });
    }

    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (text) {
            tasks.push({
                id: Date.now(),
                text: text,
                category: taskCategory.value,
                completed: false
            });
            taskInput.value = '';
            renderTasks();
        }
    });

    // Task Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks(btn.getAttribute('data-filter'));
        });
    });

    // ------------------------------------------------------------------
    // 4. Pomodoro Timer Logic
    // ------------------------------------------------------------------
    const timerDisplay = document.getElementById('timer-display');
    const dashTimerVal = document.getElementById('dash-timer-val');
    const timerStartBtn = document.getElementById('timer-start-btn');
    const timerResetBtn = document.getElementById('timer-reset-btn');
    const timerModeLabel = document.getElementById('timer-mode-label');

    function updateTimerDisplay() {
        const mins = Math.floor(timerRemaining / 60);
        const secs = timerRemaining % 60;
        const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        timerDisplay.textContent = formatted;
        dashTimerVal.textContent = formatted;
    }

    function updateModeLabel(duration) {
        if (duration === 1500) timerModeLabel.textContent = 'Deep Work Session';
        else if (duration === 300) timerModeLabel.textContent = 'Short Break';
        else if (duration === 900) timerModeLabel.textContent = 'Long Break';
        else timerModeLabel.textContent = 'Focus Session';
    }

    timerStartBtn.addEventListener('click', () => {
        if (isTimerRunning) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            timerStartBtn.textContent = 'Resume Session ▶';
            timerStartBtn.classList.remove('btn-secondary');
            timerStartBtn.classList.add('btn-primary');
        } else {
            isTimerRunning = true;
            timerStartBtn.textContent = 'Pause Session ⏸';
            timerStartBtn.classList.remove('btn-primary');
            timerStartBtn.classList.add('btn-secondary');

            timerInterval = setInterval(() => {
                if (timerRemaining > 0) {
                    timerRemaining--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    isTimerRunning = false;
                    showToast('Focus session complete! Time for a short break.', '🎉');
                    timerStartBtn.textContent = 'Start Session ▶';
                    timerStartBtn.classList.remove('btn-secondary');
                    timerStartBtn.classList.add('btn-primary');
                }
            }, 1000);
        }
    });

    timerResetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timerRemaining = timerDuration;
        timerStartBtn.textContent = 'Start Session ▶';
        timerStartBtn.classList.remove('btn-secondary');
        timerStartBtn.classList.add('btn-primary');
        updateModeLabel(timerDuration);
        updateTimerDisplay();
    });

    document.querySelectorAll('.timer-presets button').forEach(btn => {
        btn.addEventListener('click', () => {
            clearInterval(timerInterval);
            isTimerRunning = false;
            timerDuration = parseInt(btn.getAttribute('data-time'));
            timerRemaining = timerDuration;
            timerStartBtn.textContent = 'Start Session ▶';
            timerStartBtn.classList.remove('btn-secondary');
            timerStartBtn.classList.add('btn-primary');
            updateModeLabel(timerDuration);
            updateTimerDisplay();
        });
    });

    // ------------------------------------------------------------------
    // 5. Pro Developer Tip Rotator
    // ------------------------------------------------------------------
    const dailyTipText = document.getElementById('daily-tip-text');
    const btnNextTip = document.getElementById('btn-next-tip');

    btnNextTip.addEventListener('click', () => {
        currentTipIndex = (currentTipIndex + 1) % tips.length;
        dailyTipText.textContent = tips[currentTipIndex];
    });

    // ------------------------------------------------------------------
    // 6. Quick Task Modal
    // ------------------------------------------------------------------
    const taskModal = document.getElementById('task-modal');
    const btnQuickTask = document.getElementById('btn-quick-task');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalSaveBtn = document.getElementById('modal-save-btn');
    const modalTaskInput = document.getElementById('modal-task-input');
    const modalTaskCategory = document.getElementById('modal-task-category');

    // Allow pressing Enter in the modal input to save the task
    modalTaskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') modalSaveBtn.click();
    });

    function closeModal() {
        taskModal.classList.remove('active');
        modalTaskInput.value = '';
        modalTaskCategory.value = 'feature';
    }

    btnQuickTask.addEventListener('click', () => {
        taskModal.classList.add('active');
        modalTaskInput.focus();
    });

    modalCancelBtn.addEventListener('click', closeModal);

    // Also close if the user clicks the backdrop itself
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) closeModal();
    });

    modalSaveBtn.addEventListener('click', () => {
        const text = modalTaskInput.value.trim();
        if (text) {
            tasks.push({
                id: Date.now(),
                text: text,
                category: modalTaskCategory.value,
                completed: false
            });
            closeModal();
            renderTasks();
            showToast('Task added successfully!', '✅', 2500);
        }
    });

    // Initialize View
    renderTasks();
    updateTimerDisplay();
});
