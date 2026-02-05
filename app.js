/* ========== CORE STATE ========== */
let topZ = 10;
let fileSystem = JSON.parse(localStorage.getItem("sayan_files") || "{}");
let aiMemory = JSON.parse(localStorage.getItem("sayan_ai_memory") || "[]"); // simple long-term log

function saveFiles() {
    localStorage.setItem("sayan_files", JSON.stringify(fileSystem));
}

function saveAIMemory() {
    localStorage.setItem("sayan_ai_memory", JSON.stringify(aiMemory));
}

/* ========== AI MANAGER ========== */

const AIManager = {
    status: "idle",
    errorHandler: null,
    logs: [],

    async call(prompt) {
        this.status = "thinking";
        const start = Date.now();

        try {
            const res = await fetch("https://chat-interface-server.onrender.com/api/ai", {
, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    memory: aiMemory.slice(-20) // on envoie un peu de contexte
                })
            });

            if (!res.ok) {
                throw new Error("AI API error " + res.status);
            }

            const data = await res.json();
            const reply = data.reply || "(no response)";
            const elapsed = Date.now() - start;

            const logEntry = {
                time: new Date().toISOString(),
                prompt,
                reply,
                ms: elapsed
            };

            this.logs.push(logEntry);
            aiMemory.push({ role: "user", content: prompt });
            aiMemory.push({ role: "assistant", content: reply });
            saveAIMemory();

            this.status = "idle";
            return reply;
        } catch (err) {
            this.status = "error";
            console.error(err);

            if (this.errorHandler) {
                this.errorHandler(err);
            }

            return "I encountered an error while thinking.";
        }
    },

    onError(handler) {
        this.errorHandler = handler;
    },

    init() {
        console.log("AIManager ready.");
    }
};

/* ========== WINDOW MANAGER ========== */
const WindowManager = {
    createWindow({ title, icon = "", width = 360, height = 260, x = 120, y = 120, contentBuilder }) {
        const win = document.createElement('div');
        win.className = 'window';
        win.style.width = width + "px";
        win.style.height = height + "px";
        win.style.left = x + "px";
        win.style.top = y + "px";

        win.innerHTML = `
            <div class="titlebar">
                <div class="title">${icon ? `<span>${icon}</span>` : ""}<span>${title}</span></div>
                <span class="close-btn">✖</span>
            </div>
            <div class="content"></div>
            <div class="resize-handle"></div>
        `;

        document.body.appendChild(win);
        bringToFront(win);

        const content = win.querySelector('.content');
        if (contentBuilder) contentBuilder(content, win);

        win.querySelector('.close-btn').addEventListener('click', () => win.remove());
        win.addEventListener('mousedown', () => bringToFront(win));

        makeWindowDraggable(win);
        makeWindowResizable(win);

        return win;
    }
};

function bringToFront(win) {
    topZ++;
    win.style.zIndex = topZ;
    document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
    win.classList.add('active');
}

/* ========== DRAGGING ========== */
function makeWindowDraggable(win) {
    const bar = win.querySelector('.titlebar');
    let offsetX = 0, offsetY = 0, dragging = false;

    const start = (e) => {
        dragging = true;
        bringToFront(win);
        const rect = win.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;
        bar.style.cursor = "grabbing";
    };

    const move = (e) => {
        if (!dragging) return;
        const touch = e.touches ? e.touches[0] : e;

        let x = touch.clientX - offsetX;
        let y = touch.clientY - offsetY;

        x = Math.max(0, Math.min(x, window.innerWidth - win.offsetWidth));
        y = Math.max(32, Math.min(y, window.innerHeight - 50 - win.offsetHeight));

        win.style.left = x + "px";
        win.style.top = y + "px";
    };

    const end = () => {
        dragging = false;
        bar.style.cursor = "grab";
    };

    bar.addEventListener("mousedown", start);
    bar.addEventListener("mousemove", move);
    bar.addEventListener("mouseup", end);

    bar.addEventListener("touchstart", start, { passive: true });
    bar.addEventListener("touchmove", move, { passive: true });
    bar.addEventListener("touchend", end);
}

/* ========== RESIZING ========== */
function makeWindowResizable(win) {
    const handle = win.querySelector('.resize-handle');
    let resizing = false;
    let startX, startY, startW, startH;

    const start = (e) => {
        e.preventDefault();
        resizing = true;
        win.classList.add('resizing');
        const rect = win.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        startX = touch.clientX;
        startY = touch.clientY;
        startW = rect.width;
        startH = rect.height;
    };

    const move = (e) => {
        if (!resizing) return;
        const touch = e.touches ? e.touches[0] : e;
        const newW = Math.max(260, startW + (touch.clientX - startX));
        const newH = Math.max(180, startH + (touch.clientY - startY));
        win.style.width = newW + "px";
        win.style.height = newH + "px";
    };

    const end = () => {
        resizing = false;
        win.classList.remove('resizing');
    };

    handle.addEventListener("mousedown", start);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);

    handle.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", end);
}

/* ========== NOTIFICATIONS ========== */
const Notifications = {
    show(message, timeout = 3000) {
        const container = document.getElementById('notifications');
        const n = document.createElement('div');
        n.className = 'notification';
        n.textContent = message;
        container.appendChild(n);
        setTimeout(() => n.remove(), timeout);
    }
};

/* ========== THEMES ========== */
const ThemeManager = {
    setTheme(name) {
        document.body.setAttribute('data-theme', name);
        localStorage.setItem('sayan_theme', name);
        Notifications.show(`Theme: ${name}`);
    },
    init() {
        const saved = localStorage.getItem('sayan_theme') || 'dark';
        this.setTheme(saved);
    }
};

/* ========== APPS ========== */
const Apps = {
    explorer() {
        WindowManager.createWindow({
            title: "File Explorer",
            icon: "📁",
            x: 80,
            y: 80,
            contentBuilder: (content) => {
                content.classList.add('explorer');
                const list = document.createElement('div');
                content.appendChild(list);

                const refresh = () => {
                    list.innerHTML = "";
                    const names = Object.keys(fileSystem);
                    if (names.length === 0) {
                        const empty = document.createElement('div');
                        empty.textContent = "No files yet. Open Editor to create one.";
                        empty.style.opacity = "0.7";
                        empty.style.fontSize = "12px";
                        list.appendChild(empty);
                        return;
                    }
                    names.forEach(name => {
                        const item = document.createElement('div');
                        item.className = "file";
                        item.textContent = "📄 " + name;
                        item.addEventListener('click', () => Apps.editor(name));
                        list.appendChild(item);
                    });
                };

                refresh();
            }
        });
    },

    editor(filename = "New File") {
        WindowManager.createWindow({
            title: `Editor - ${filename}`,
            icon: "📝",
            x: 120,
            y: 110,
            width: 380,
            height: 260,
            contentBuilder: (content) => {
                const textarea = document.createElement('textarea');
                textarea.className = "editor-area";
                textarea.value = fileSystem[filename] || "";
                content.appendChild(textarea);

                textarea.addEventListener('input', () => {
                    fileSystem[filename] = textarea.value;
                    saveFiles();
                });
            }
        });
    },

    assistant() {
        WindowManager.createWindow({
            title: "AI Assistant",
            icon: "🤖",
            x: 160,
            y: 130,
            width: 380,
            height: 260,
            contentBuilder: (content) => {
                content.classList.add('assistant-box');

                const out = document.createElement('div');
                out.className = 'assistant-output';

                const inputRow = document.createElement('div');
                inputRow.className = 'assistant-input';

                const input = document.createElement('input');
                input.placeholder = "Ask something...";

                const btn = document.createElement('button');
                btn.textContent = "Send";

                inputRow.appendChild(input);
                inputRow.appendChild(btn);
                content.appendChild(out);
                content.appendChild(inputRow);

                const send = async () => {
                    const text = input.value.trim();
                    if (!text) return;

                    out.innerHTML += `<div><strong>You:</strong> ${text}</div>`;
                    input.value = "";
                    out.scrollTop = out.scrollHeight;

                    btn.disabled = true;
                    btn.textContent = "…";

                    const reply = await AIManager.call(text);

                    out.innerHTML += `<div><strong>AI:</strong> ${reply}</div>`;
                    out.scrollTop = out.scrollHeight;

                    btn.disabled = false;
                    btn.textContent = "Send";
                };

                btn.addEventListener('click', send);
                input.addEventListener('keydown', e => {
                    if (e.key === "Enter") send();
                });
            }
        });
    },

    notes() {
        this.editor("QuickNotes");
    },

    settings() {
        WindowManager.createWindow({
            title: "Settings",
            icon: "⚙️",
            x: 200,
            y: 140,
            width: 320,
            height: 220,
            contentBuilder: (content) => {
                content.innerHTML = `
                    <div style="font-size:13px; line-height:1.5;">
                        <div><strong>Sayan OS</strong></div>
                        <div>Minimal modular web OS.</div>
                        <div style="margin-top:8px; opacity:0.8;">Everything is just apps and windows.</div>
                    </div>
                `;
            }
        });
    },

    themes() {
        WindowManager.createWindow({
            title: "Themes",
            icon: "🎨",
            x: 220,
            y: 150,
            width: 260,
            height: 200,
            contentBuilder: (content) => {
                const btnDark = document.createElement('button');
                const btnLight = document.createElement('button');
                const btnNeon = document.createElement('button');

                [btnDark, btnLight, btnNeon].forEach(b => {
                    b.style.display = "block";
                    b.style.width = "100%";
                    b.style.marginBottom = "6px";
                    b.style.padding = "6px";
                    b.style.borderRadius = "6px";
                    b.style.border = "1px solid var(--border)";
                    b.style.background = "rgba(255,255,255,0.03)";
                    b.style.color = "var(--fg)";
                    b.style.cursor = "pointer";
                    b.style.fontSize = "13px";
                });

                btnDark.textContent = "Dark";
                btnLight.textContent = "Light";
                btnNeon.textContent = "Neon";

                btnDark.onclick = () => ThemeManager.setTheme("dark");
                btnLight.onclick = () => ThemeManager.setTheme("light");
                btnNeon.onclick = () => ThemeManager.setTheme("neon");

                content.appendChild(btnDark);
                content.appendChild(btnLight);
                content.appendChild(btnNeon);
            }
        });
    },

    "ai-console"() {
        WindowManager.createWindow({
            title: "AI Console",
            icon: "🧠",
            x: 260,
            y: 160,
            width: 420,
            height: 260,
            contentBuilder: (content) => {
                const log = document.createElement('div');
                log.className = "ai-console-log";
                content.appendChild(log);

                const render = () => {
                    log.innerHTML = AIManager.logs.map(entry => {
                        return `[${entry.time}] (${entry.ms}ms)
> ${entry.prompt}
< ${entry.reply}
`;
                    }).join("\n-----------------------------\n\n");
                    log.scrollTop = log.scrollHeight;
                };

                render();

                const interval = setInterval(render, 1500);
                content.addEventListener('DOMNodeRemoved', () => clearInterval(interval));
            }
        });
    }
};

/* ========== APP LAUNCHER ========== */
function launchApp(name) {
    if (name === "explorer") Apps.explorer();
    else if (name === "editor") Apps.editor();
    else if (name === "assistant") Apps.assistant();
    else if (name === "notes") Apps.notes();
    else if (name === "settings") Apps.settings();
    else if (name === "themes") Apps.themes();
    else if (name === "ai-console") Apps["ai-console"]();
}

/* ========== UI WIRING ========== */
document.querySelectorAll('.dock-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        launchApp(icon.dataset.app);
    });
});

document.querySelectorAll('.start-app').forEach(btn => {
    btn.addEventListener('click', () => {
        launchApp(btn.dataset.app);
        toggleStartMenu(false);
    });
});

const startButton = document.getElementById('start-button');
const startMenu = document.getElementById('start-menu');

function toggleStartMenu(force) {
    if (force === false) {
        startMenu.classList.add('hidden');
        return;
    }
    startMenu.classList.toggle('hidden');
}

startButton.addEventListener('click', () => toggleStartMenu());

document.addEventListener('click', (e) => {
    if (!startMenu.contains(e.target) && e.target !== startButton) {
        toggleStartMenu(false);
    }
});

/* CLOCK */
function updateClock() {
    const el = document.getElementById('clock');
    const d = new Date();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    el.textContent = `${h}:${m}`;
}
setInterval(updateClock, 1000);
updateClock();

/* INIT */
ThemeManager.init();
AIManager.init();
Notifications.show("Sayan OS loaded.");
