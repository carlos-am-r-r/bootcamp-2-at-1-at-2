// --- ESTADO E CONFIGURAÇÕES ---
let tasks = JSON.parse(localStorage.getItem('vitality_tasks')) || [
    { id: 1, text: "Beber 1 copo de água ao acordar", completed: false },
    { id: 2, text: "Alongar o corpo por 5 minutos", completed: false },
    { id: 3, text: "Fazer uma refeição saudável", completed: false }
];
let notificationsEnabled = JSON.parse(localStorage.getItem('vitality_notif_enabled')) || false;
let notificationTimes = JSON.parse(localStorage.getItem('vitality_notif_times')) || ["09:00", "13:00", "18:00"];

// --- SÍNTESE DE ÁUDIO (Estilo Retrô) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(frequency, type, duration, vol = 0.1) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = type; // 'square' ou 'sawtooth' para sons retrô
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

function playTaskSound() {
    // Som de "moeda/sucesso"
    playTone(880, 'square', 0.1, 0.05); // Nota A5
    setTimeout(() => playTone(1318.51, 'square', 0.2, 0.05), 100); // Nota E6
}

function playVictorySound() {
    // Arpejo de "Level Up"
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 'sawtooth', 0.2, 0.1), i * 150);
    });
}

// --- LÓGICA DE RESET ÀS 3:00 AM ---
function checkAndResetDaily() {
    const lastReset = localStorage.getItem('vitality_last_reset');
    const now = new Date();
    // Cria um objeto Date para as 03:00 da manhã de hoje
    const today3AM = new Date();
    today3AM.setHours(3, 0, 0, 0);

    // Se agora passou das 3AM e o último reset foi ANTES das 3AM de hoje
    if (now >= today3AM && (!lastReset || new Date(Number(lastReset)) < today3AM)) {
        tasks.forEach(task => task.completed = false);
        saveTasks();
        localStorage.setItem('vitality_last_reset', Date.now());
    } else if (now < today3AM && lastReset) {
        // Trata o caso onde ainda não são 3 da manhã, o reset do dia anterior é a referência
        const yesterday3AM = new Date(today3AM);
        yesterday3AM.setDate(yesterday3AM.getDate() - 1);
        if (new Date(Number(lastReset)) < yesterday3AM) {
            tasks.forEach(task => task.completed = false);
            saveTasks();
            localStorage.setItem('vitality_last_reset', Date.now());
        }
    }
}

// --- RENDERIZAÇÃO E DOM ---
function saveTasks() {
    localStorage.setItem('vitality_tasks', JSON.stringify(tasks));
}

function updateProgress() {
    if (tasks.length === 0) return;
    const completedTasks = tasks.filter(t => t.completed).length;
    const percentage = Math.round((completedTasks / tasks.length) * 100);
    
    document.getElementById('progressBar').style.width = `${percentage}%`;
    document.getElementById('progressText').innerText = `${percentage}% Concluído`;

    if (percentage === 100 && completedTasks > 0) {
        triggerCelebration();
    }
}

function triggerCelebration() {
    playVictorySound();
    const overlay = document.getElementById('celebrationOverlay');
    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 4000); // Esconde após 4 segundos
}

function renderTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        // Ícone de Check/Uncheck
        const checkBtn = document.createElement('button');
        checkBtn.className = 'icon-btn';
        checkBtn.innerHTML = task.completed ? '<i class="ph ph-check-circle"></i>' : '<i class="ph ph-circle"></i>';
        checkBtn.onclick = () => toggleTask(task.id, li);

        // Texto do hábito
        const span = document.createElement('span');
        span.className = 'task-text';
        span.innerText = task.text;
        span.onclick = () => editTask(task.id);

        // Ícone de Excluir
        const delBtn = document.createElement('button');
        delBtn.className = 'icon-btn';
        delBtn.innerHTML = '<i class="ph ph-trash"></i>';
        delBtn.onclick = () => deleteTask(task.id);

        li.appendChild(checkBtn);
        li.appendChild(span);
        li.appendChild(delBtn);
        list.appendChild(li);
    });
    updateProgress();
}

// --- AÇÕES CRUD ---
function addTask(e) {
    e.preventDefault();
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (text) {
        tasks.push({ id: Date.now(), text, completed: false });
        input.value = '';
        saveTasks();
        renderTasks();
    }
}

function toggleTask(id, element) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        if (task.completed) {
            playTaskSound();
            element.classList.add('flash'); // Feedback visual
        }
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        const newText = prompt("Editar hábito:", task.text);
        if (newText !== null && newText.trim() !== "") {
            task.text = newText.trim();
            saveTasks();
            renderTasks();
        }
    }
}

// --- NOTIFICAÇÕES DE HIDRATAÇÃO ---
function setupNotifications() {
    const btn = document.getElementById('toggleNotifications');
    const inputs = [document.getElementById('time1'), document.getElementById('time2'), document.getElementById('time3')];

    // Carrega os valores
    inputs.forEach((input, index) => input.value = notificationTimes[index]);
    updateNotificationUI(btn);

    // Salva mudanças de horário
    inputs.forEach((input, index) => {
        input.addEventListener('change', (e) => {
            notificationTimes[index] = e.target.value;
            localStorage.setItem('vitality_notif_times', JSON.stringify(notificationTimes));
        });
    });

    btn.addEventListener('click', async () => {
        if (!notificationsEnabled) {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                notificationsEnabled = true;
            } else {
                alert("Permissão para notificações negada pelo navegador.");
                return;
            }
        } else {
            notificationsEnabled = false;
        }
        localStorage.setItem('vitality_notif_enabled', JSON.stringify(notificationsEnabled));
        updateNotificationUI(btn);
    });

    // Checa notificações a cada 1 minuto
    setInterval(checkNotificationTimes, 60000);
}

function updateNotificationUI(btn) {
    if (notificationsEnabled) {
        btn.innerText = "Notificações Ativadas";
        btn.style.backgroundColor = "var(--success)";
    } else {
        btn.innerText = "Ativar Notificações";
        btn.style.backgroundColor = "var(--primary)";
    }
}

function checkNotificationTimes() {
    if (!notificationsEnabled || Notification.permission !== "granted") return;
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (notificationTimes.includes(currentTime)) {
        new Notification("Vitality: Hora de se hidratar!", {
            body: "Beba um bom copo d'água agora para manter seu cérebro focado e saudável! 💧",
            icon: "https://unpkg.com/@phosphor-icons/core@2.0.0/assets/regular/drop-regular.svg"
        });
    }
}

// --- TEMA CLARO/ESCURO ---
function setupTheme() {
    const toggleBtn = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('vitality_theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    toggleBtn.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('vitality_theme', theme);
    });
}

// --- INICIALIZAÇÃO ---
document.getElementById('taskForm').addEventListener('submit', addTask);
window.addEventListener('DOMContentLoaded', () => {
    checkAndResetDaily();
    setupTheme();
    renderTasks();
    setupNotifications();
});

// Função reutilizável para buscar o clima das cidades
function buscarClima(lat, lon, idClima, idVento) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const temperatura = data.current_weather.temperature;
            const vento = data.current_weather.windspeed;
    
            // Atualizações específicas conforme as cidades
            document.getElementById(idClima).innerText = `${temperatura}°C`;
            document.getElementById(idVento).innerText = vento;
        })
        .catch(error => {
            console.error("Erro ao buscar o clima:", error);
            document.getElementById(idClima).innerText = "Erro ao carregar";
        });
}

// Aplicação da função de acordo com as cidades
buscarClima(-23.55, -46.63, "clima-sp", "vento-sp");   // São Paulo
buscarClima(-15.79, -47.88, "clima-bsb", "vento-bsb"); // Brasília
buscarClima(-22.90, -43.17, "clima-rj", "vento-rj");   // Rio de Janeiro
