const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let currentLevel = 1, mapWidth = 8, mapHeight = 6, mapScale = 40;
let player = { x: 60, y: 60, angle: 0, fov: Math.PI / 3 };
let playerHealth = 100, isFiring = false, gameWon = false;
let monster = { x: 180, y: 140, alive: true }, depthBuffer = new Array(320);

function getMapCell(x, y) {
    if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) return 1;
    if (!window.gameLevelsData || !window.gameLevelsData[currentLevel]) return 0;
    return window.gameLevelsData[currentLevel].mapStr.charAt(y * mapWidth + x) === '1' ? 1 : 0;
}

function loadLevel(lvl) {
    if (!window.gameLevelsData) { setTimeout(() => loadLevel(lvl), 100); return; }
    let maxLvl = window.maxLevels || 5;
    if (lvl > maxLvl) { gameWon = true; return; }
    
    currentLevel = lvl;
    player.x = window.gameLevelsData[lvl].playerStart.x;
    player.y = window.gameLevelsData[lvl].playerStart.y;
    player.angle = window.gameLevelsData[lvl].playerStart.angle;
    
    let rx = 180, ry = 140, attempts = 0;
    while (attempts++ < 50) {
        rx = Math.floor(Math.random() * 240) + 40;
        ry = Math.floor(Math.random() * 160) + 40;
        if (getMapCell(Math.floor(rx/40), Math.floor(ry/40)) === 0) break;
    }
    monster.x = rx; monster.y = ry; monster.alive = true; playerHealth = 100;
}
loadLevel(1);

// HÀM CHUYỂN MÀN KHẨN CẤP TOÀN CỤC - BẮT BUỘC NHẢY SANG 2/5 KHI BẤM NEXT
window.forceNextLevel = function() {
    for (let k in intervals) { clearInterval(intervals[k]); }
    if (playerHealth <= 0) {
        loadLevel(currentLevel);
    } else if (gameWon) {
        gameWon = false;
        loadLevel(1);
    } else {
        monster.alive = false;
        loadLevel(currentLevel + 1);
    }
};

function drawScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1a1a1a"; ctx.fillRect(0, 0, 320, 100);
    ctx.fillStyle = "#333333"; ctx.fillRect(0, 100, 320, 100);

    let startAngle = player.angle - player.fov / 2;
    for (let i = 0; i < 320; i++) {
        let angle = startAngle + i * (player.fov / 320), dist = 0, hit = false;
        while (!hit && dist < 300) {
            dist += 1;
            if (getMapCell(Math.floor((player.x + Math.cos(angle) * dist) / mapScale), Math.floor((player.y + Math.sin(angle) * dist) / mapScale)) === 1) hit = true;
        }
        let corrDist = dist * Math.cos(angle - player.angle);
        depthBuffer[i] = corrDist;
        let h = Math.min(160, (3200 / (corrDist || 1)));
        ctx.fillStyle = `rgb(${Math.max(30, 160 - dist * 0.6)}, 0, 0)`;
        ctx.fillRect(i, 100 - h / 2, 1, h);
    }

    if (monster.alive && !gameWon) {
        let dx = monster.x - player.x, dy = monster.y - player.y, dist = Math.sqrt(dx*dx + dy*dy);
        let mAngle = Math.atan2(dy, dx) - player.angle;
        while (mAngle < -Math.PI) mAngle += Math.PI * 2; while (mAngle > Math.PI) mAngle -= Math.PI * 2;
        if (Math.abs(mAngle) < player.fov) {
            let size = Math.min(200, (3200 / dist)), sX = 160 + Math.tan(mAngle) * 160;
            if (sX >= 0 && sX < 320 && dist < depthBuffer[Math.floor(sX)]) {
                ctx.fillStyle = currentLevel === 1 ? "#009900" : currentLevel === 2 ? "#999900" : "#990099";
                ctx.fillRect(sX - size/4, 100 - size/2, size/2, size);
                ctx.fillStyle = "#f00"; ctx.fillRect(sX - 4, 100 - size/4, 2, 2); ctx.fillRect(sX + 2, 100 - size/4, 2, 2);
            }
        }
        if (dist < 16 && playerHealth > 0) playerHealth = Math.max(0, playerHealth - 0.8);
    }

    ctx.save();
    if (isFiring && !gameWon && playerHealth > 0) {
        ctx.fillStyle = "#f90"; ctx.beginPath(); ctx.moveTo(160, 110); ctx.lineTo(140, 80); ctx.lineTo(160, 60); ctx.lineTo(180, 80); ctx.fill();
    }
    ctx.fillStyle = "#555"; ctx.fillRect(152, 120, 7, 80); ctx.fillRect(161, 120, 7, 80);
    ctx.fillStyle = "#222"; ctx.fillRect(145, 150, 30, 50); ctx.restore();

    ctx.fillStyle = "#0f0"; ctx.fillRect(159, 99, 2, 2);
    ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(10, 10, 110, 18); ctx.fillRect(240, 10, 70, 18);
    ctx.fillStyle = "#f00"; ctx.fillRect(15, 14, playerHealth, 10);
    ctx.fillStyle = "#fff"; ctx.font = "10px Arial"; ctx.fillText("HP: " + Math.floor(playerHealth) + "%", 20, 23);
    ctx.fillText("MAP: " + currentLevel + "/" + (window.maxLevels || 5), 248, 23);

    if (playerHealth <= 0) {
        ctx.fillStyle = "rgba(130,0,0,0.8)"; ctx.fillRect(0,0,320,200); ctx.fillStyle = "#fff"; ctx.font = "20px Arial"; ctx.fillText("YOU DIED", 115, 95);
    } else if (gameWon) {
        ctx.fillStyle = "rgba(0,100,0,0.8)"; ctx.fillRect(0,0,320,200); ctx.fillStyle = "#fff"; ctx.font = "16px Arial"; ctx.fillText("VICTORY! ALL CLEARED", 55, 100);
    } else if (!monster.alive) {
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(40, 85, 240, 40); ctx.fillStyle = "#fff"; ctx.font = "12px Arial"; ctx.fillText("MAP CLEARED!", 115, 105);
    }
}

let intervals = {};
function bindBtn(id, action) {
    const el = document.getElementById(id); if (!el) return;
    const start = (e) => { e.preventDefault(); clearInterval(intervals[id]); intervals[id] = setInterval(action, 30); };
    const stop = () => clearInterval(intervals[id]);
    el.addEventListener("touchstart", start); el.addEventListener("touchend", stop);
    el.addEventListener("mousedown", start); el.addEventListener("mouseup", stop); el.addEventListener("mouseleave", stop);
}
const move = (dx, dy) => {
    if (playerHealth <= 0 || gameWon) return;
    let nx = player.x + dx, ny = player.y + dy;
    if (getMapCell(Math.floor(nx / 40), Math.floor(ny / 40)) === 0) { player.x = nx; player.y = ny; }
};
bindBtn("btnUp", () => move(Math.cos(player.angle)*3, Math.sin(player.angle)*3));
bindBtn("btnDown", () => move(-Math.cos(player.angle)*3, -Math.sin(player.angle)*3));
bindBtn("btnLeft", () => move(Math.cos(player.angle-Math.PI/2)*3, Math.sin(player.angle-Math.PI/2)*3));
bindBtn("btnRight", () => move(Math.cos(player.angle+Math.PI/2)*3, Math.sin(player.angle+Math.PI/2)*3));
bindBtn("btnLookLeft", () => { if(playerHealth > 0 && !gameWon) player.angle -= 0.05; });
bindBtn("btnLookRight", () => { if(playerHealth > 0 && !gameWon) player.angle += 0.05; });

document.getElementById("btnFire").addEventListener("touchstart", (e) => {
    e.preventDefault(); if (playerHealth <= 0 || gameWon || !monster.alive || isFiring) return;
    isFiring = true;
    let ang = Math.atan2(monster.y - player.y, monster.x - player.x) - player.angle;
    while (ang < -Math.PI) ang += Math.PI * 2; while (ang > Math.PI) ang -= Math.PI * 2;
    if (Math.abs(ang) < 0.15) { monster.alive = false; }
    setTimeout(() => isFiring = false, 150);
});

function gameLoop() { drawScreen(); requestAnimationFrame(gameLoop); }
gameLoop();
