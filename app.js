/* ============================
   GLOBAL SYSTEM
============================ */
let topZ = 10;

let fileSystem = JSON.parse(localStorage.getItem("sayan_files") || "{}");

function saveFiles() {
    localStorage.setItem("sayan_files", JSON.stringify(fileSystem));
}

function bringToFront(win) {
    topZ++;
    win.style.zIndex = topZ;
}

/* ============================
   ICON HANDLER
============================ */
document.querySelectorAll('.icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const app = icon.dataset.app;

        if (app === "explorer") openExplorer();
        else if (app === "editor") openEditor();
        else if (app === "assistant") openAssistant();
        else createWindow("Module");
    });
});

/* ============================
   GENERIC WINDOW
============================ */
function createWindow(title) {
    const win = document.createElement('div');
    win.className = 'window';
    win.style.top = "120px";
    win.style.left = "120px";

    win.innerHTML = `
        <div class="titlebar">
            <span class="title">${title}</span>
            <span class="close-btn">✖</span>
        </div>
        <div class="content">Empty window</div>
    `;

    document.body.appendChild(win);

    win.addEventListener('mousedown', () => bringToFront(win));
    win.querySelector('.close-btn').addEventListener('click', () => win.remove());

    makeWindowDraggable(win);
}

/* ============================
   FILE EXPLORER
============================ */
function openExplorer() {
    const win = document.createElement('div');
    win.className = 'window';
    win.style.top = "100px";
    win.style.left = "120px";

    win.innerHTML = `
        <div class="titlebar">
            <span class="title">File Explorer</span>
            <span class="close-btn">✖</span>
        </div>

        <div class="content explorer" id="explorer-list"></div>
    `;

    document.body.appendChild(win);

    win.addEventListener('mousedown', () => bringToFront(win));
    win.querySelector('.close-btn').addEventListener('click', () => win.remove());

    const list = win.querySelector('#explorer-list');
    list.innerHTML = "";

    Object.keys(fileSystem).forEach(name => {
        const item = document.createElement('div');
        item.className = "file";
        item.dataset.file = name;
        item.textContent = "📄 " + name;
        item.addEventListener('click', () => openEditor(name));
        list.appendChild(item);
    });

    if (Object.keys(fileSystem).length === 0) {
        list.innerHTML = `
            <div class="file" data-file="notes">📄 Notes.txt</div>
            <div class="file" data-file="todo">📄 Todo.txt</div>
        `;
    }

    makeWindowDraggable(win);
}

/* ============================
   TEXT EDITOR
============================ */
function openEditor(filename = "New File") {
    const win = document.createElement('div');
    win.className = 'window';
    win.style.top = "140px";
    win.style.left = "140px";

    win.innerHTML = `
        <div class="titlebar">
            <span class="title">Editor - ${filename}</span>
            <span class="close-btn">✖</span>
        </div>

        <textarea class="content editor-area">${fileSystem[filename] || ""}</textarea>
    `;

    document.body.appendChild(win);

    win.addEventListener('mousedown', () => bringToFront(win));
    win.querySelector('.close-btn').addEventListener('click', () => win.remove());

    const textarea = win.querySelector('.editor-area');

    textarea.addEventListener('input', () => {
        fileSystem[filename] = textarea.value;
        saveFiles();
    });

    makeWindowDraggable(win);
}

/* ============================
   AI ASSISTANT
============================ */
function openAssistant() {
    const win = document.createElement('div');
    win.className = 'window';
    win.style.top = "160px";
    win.style.left = "160px";

    win.innerHTML = `
        <div class="titlebar">
            <span class="title">AI Assistant</span>
            <span class="close-btn">✖</span>
        </div>

        <div class="content assistant-box">
            <div class="assistant-output"></div>

            <div class="assistant-input">
                <input type="text" placeholder="Ask something...">
                <button>Send</button>
            </div>
        </div>
    `;

    document.body.appendChild(win);

    win.addEventListener('mousedown', () => bringToFront(win));
    win.querySelector('.close-btn').addEventListener('click', () => win.remove());

    const output = win.querySelector('.assistant-output');
    const input = win.querySelector('input');
    const btn = win.querySelector('button');

    btn.addEventListener('click', () => {
        const text = input.value.trim();
        if (!text) return;

        output.innerHTML += `<div>You: ${text}</div>`;
        output.innerHTML += `<div>AI: (response placeholder)</div>`;
        input.value = "";
        output.scrollTop = output.scrollHeight;
    });

    makeWindowDraggable(win);
}

/* ============================
   DRAGGING WINDOWS
============================ */
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
        y = Math.max(0, Math.min(y, window.innerHeight - win.offsetHeight));

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
