document.querySelectorAll('.icon').forEach((icon, index) => {
    icon.addEventListener('click', () => {
        createWindow("Module " + (index + 1));
    });
});

function createWindow(title) {
    const win = document.createElement('div');
    win.className = 'window';
    win.innerHTML = `
        <div class="titlebar">${title}</div>
        <div class="content">Contenu du module</div>
    `;
    document.body.appendChild(win);
}
