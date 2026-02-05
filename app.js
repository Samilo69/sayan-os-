// Handle icon clicks
document.querySelectorAll('.icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const app = icon.dataset.app;

        if (app === "explorer") openExplorer();
        else if (app === "editor") openEditor();
        else if (app === "assistant") openAssistant();
        else createWindow("Module");
    });
});

// Generic window
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

        <div class="content explorer">
            <div class="file" data-file="notes">📄 Notes.txt</div>
            <div class="file" data-file="todo">📄 Todo.txt</div>
            <div class="file" data-file="docs">📁 Documents</div>
            <div class="file" data-file="images">📁 Images</div>
        </div>
    `;

    document.body.appendChild(win);

    win.querySelector('.close-btn').addEventListener('click', () => win.remove());

    win.querySelectorAll('.file').forEach(f => {
        f.addEventListener('click', () => openEditor(f.dataset.file));
    });

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

        <textarea class="content editor-area">Write something...</textarea>
    `;

    document.body.appendChild(win);

    win.querySelector('.close-btn').addEventListener('click', () => win.remove());

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

    win.querySelector('.close-btn').addEventListener('click', () => win.remove());

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
        const rect = win.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;
    };

    const move = (e) => {
        if (!dragging) return;
        const touch = e.touches ? e.touches[0] : e;
        win.style.left = (touch.clientX - offsetX) + "px";
        win.style.top = (touch.clientY - offsetY) + "px";
    };

    const end = () => dragging = false;

    bar.addEventListener("mousedown", start);
    bar.addEventListener("mousemove", move);
    bar.addEventListener("mouseup", end);

    bar.addEventListener("touchstart", start);
    bar.addEventListener("touchmove", move);
    bar.addEventListener("touchend", end);
}
