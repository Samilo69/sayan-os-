// Open a window when clicking an icon
document.querySelectorAll('.icon').forEach((icon, index) => {
    icon.addEventListener('click', () => {
        createWindow("Module " + (index + 1));
    });
});

// Create a window
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
        <div class="content">Contenu du module</div>
    `;

    document.body.appendChild(win);

    // Close button
    win.querySelector('.close-btn').addEventListener('click', () => {
        win.remove();
    });

    makeWindowDraggable(win);
}

// Drag windows (mobile + PC)
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
