const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let currentLevel = 1;
const mapWidth = 8, mapHeight = 6, mapScale = 40;

let player = { x: 60, y: 60, angle: 0, fov: Math.PI / 3 };
let playerHealth = 100;
let isFiring = false;
let monster = { x: 180, y: 140, alive: true };
let depthBuffer = new Array(320);
let gameWon = false;

function getMapCell(x, y) {
    if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) return 1;
    if (!window.gameLevelsData || !window.gameLevelsData[currentLevel]) return 0;
    let index = y * mapWidth + x;
    let currentMapStr = window.gameLevelsData[currentLevel].mapStr;
    return currentMapStr.charAt(index) === '1' ? 1 : 0;
}

function isSafeSpawn(x, y) {
    if (x < 20 || x > 300 || y < 20 || y > 220) return false;
    const checkRadius = 15;
    const pointsToCheck = [
        {x: x, y: y}, {x: x + checkRadius, y: y}, {x: x - checkRadius, y: y},
        {x: x, y: y + checkRadius}, {x: x, y: y - checkRadius}
    ];
    for (let p of pointsToCheck) {
        if (getMapCell(Math.floor(p.x / mapScale), Math.floor(p.y / mapScale)) === 1) return false;
    }
    if (Math.sqrt(Math.pow(x - player.x, 2) + Math.pow(y - player.y, 2)) < 60) return false;
    return true;
}

function spawnMonsterRandomly() {
    let validSpawn = false, attempts = 0, randomX = 180, randomY = 140;
    while (!validSpawn && attempts < 100) {
        randomX = Math.floor(Math.random() * 280) + 20;
        randomY = Math.floor(Math.random() * 200) + 20;
        if (isSafeSpawn(randomX, randomY)) validSpawn = true;
        attempts++;
    }
    monster.x = randomX; monster.y = randomY; monster.alive = true;
}

function loadLevel(lvl) {
    if (!window.gameLevelsData) {
        setTimeout(() => { loadLevel(lvl); }, 100);
        return;
    }
    
    let maxLvl = window.maxLevels || 5;
    if (lvl > maxLvl) { gameWon = true; return; }
    currentLevel = lvl;
    player.x = window.gameLevelsData[lvl].playerStart.x;
    player.y = window.gameLevelsData[lvl].playerStart.y;
    player.angle = window.gameLevelsData[lvl].playerStart.angle;
    spawnMonsterRandomly(); 
    playerHealth = 100;
}

loadLevel(1);

function drawScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1a1a1a"; ctx.fillRect(0, 0, 320, 100);
    ctx.fillStyle = "#333333"; ctx.fillRect(0, 100, 320, 100);

    const numRays = 320, rayStep = player.fov / numRays;
    let startAngle = player.angle - player.fov / 2;

    for (let i = 0; i < numRays; i++) {
        let currentAngle = startAngle + i * rayStep;
        let distance = 0, hitWall = false;
        while (!hitWall && distance < 300) {
            distance += 1;
            if (getMapCell(Math.floor((player.x + Math.cos(currentAngle) * distance) / mapScale), Math.floor((player.y + Math.sin(currentAngle) * distance) / mapScale)) === 1) hitWall = true;
        }
        let correctedDist = distance * Math.cos(currentAngle - player.angle);
        depthBuffer[i] = correctedDist;
        let wallHeight = Math.min(160, (3200 / (correctedDist || 1)));
        ctx.fillStyle = `rgb(${Math.max(30, 160 - distance * 0.6)}, 0, 0)`;
        ctx.fillRect(i, 100 - wallHeight / 2, 1, wallHeight);
    }

    if (monster.alive && !gameWon) {
        let dx = monster.x - player.x, dy = monster.y - player.y;
        let distToMonster = Math.sqrt(dx * dx + dy * dy);
        let monsterAngle = Math.atan2(dy, dx) - player.angle;
        while (monsterAngle < -Math.PI) monsterAngle += Math.PI * 2;
        while (monsterAngle > Math.PI) monsterAngle -= Math.PI * 2;

        if (Math.abs(monsterAngle) < player.fov) {
            let mSize = Math.min(200, (3200 / distToMonster));
            let sX = (320 / 2) + Math.tan(monsterAngle) * (320 / 2);
            let sXInt = Math.floor(sX);
            if (sXInt >= 0 && sXInt < 320 && distToMonster < depthBuffer[sXInt]) {
                let g = Math.max(40, 180 - distToMonster * 0.5);
                ctx.fillStyle = currentLevel === 1 ? `rgb(0,${g},0)` : currentLevel === 2 ? `rgb(${g},${g},0)` : `rgb(${g},0,${g})`;
                ctx.fillRect(sX - mSize/4, 100 - mSize/2, mSize/2, mSize);
                ctx.fillStyle = "#ff0000"; ctx.fillRect(sX - 4, 100 - mSize/4, 2, 2); ctx.fillRect(sX + 2, 100 - mSize/4, 2, 2);
            }
        }
        if (distToMonster < 16 && playerHealth > 0) {
            playerHealth -= (0.4 + currentLevel * 0.2);
            if (playerHealth < 0) playerHealth = 0;
        }
    }

    ctx.save();
    if (isFiring && !gameWon && playerHealth > 0) {
        ctx.fillStyle = "#ffcc00"; ctx.beginPath(); ctx.moveTo(160, 110); ctx.lineTo(140, 80); ctx.lineTo(160, 60); ctx.lineTo(180, 80); ctx.fill();
        ctx.fillStyle = "#ff3300"; ctx.beginPath(); ctx.moveTo(160, 110); ctx.lineTo(150, 90); ctx.lineTo(160, 75); ctx.lineTo(170, 90); ctx.fill();
    }
    ctx.fillStyle = "#555555"; ctx.fillRect(152, 120, 7, 80); ctx.fillRect(161, 120, 7, 80);
    ctx.fillStyle = "#222222"; ctx.fillRect(145, 150, 30, 50);
    ctx.restore();

    ctx.fillStyle = "#00ff00"; ctx.fillRect(159, 99, 2, 2);
    ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(10, 10, 110, 18);
    ctx.fillStyle = "#ff0000"; ctx.fillRect(15, 14, playerHealth, 10);
    ctx.fillStyle = "#fff"; ctx.font = "10px Arial"; ctx.fillText("HP: " + Math.floor(playerHealth) + "%", 20, 23);
    
    let maxLvl = window.maxLevels || 5;
    ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(240, 10, 70, 18);
    ctx.fillStyle = "#fff"; ctx.font = "10px Arial"; ctx.fillText("MAP: " + currentLevel + "/" + maxLvl, 248, 23);

    if (playerHealth <= 0) {
        ctx.fillStyle = "rgba(130,0,0,0.8)"; ctx.fillRect(0,0,320,200); ctx.fillStyle = "#fff"; ctx.font = "20px Arial"; ctx.fillText("YOU DIED", 115, 95);
    } else if (gameWon) {
        ctx.fillStyle = "rgba(0,100,0,0.8)"; ctx.fillRect(0,0,320,200); ctx.fillStyle = "#fff"; ctx.font = "18px Arial"; ctx.fillText("VICTORY! ALL CLEARED", 55, 100);
    } else if (!monster.alive) {
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(40, 85, 240, 40); ctx.fillStyle = "#fff"; ctx.font = "12px Arial"; ctx.fillText("MAP CLEARED!", 115, 95);
        ctx.font = "9px Arial"; ctx.fillText("Tap FIRE to advance", 118, 115);
    }
}

function checkCollisionAndMove(nX, nY) {
    if (playerHealth <= 0 || gameWon || !monster.alive) return;
    if (getMapCell(Math.floor(nX / mapScale), Math.floor(nY / mapScale)) === 0) { player.x = nX; player.y = nY; }
}

let intervals = {};
function bindBtn(id, action) {
    const el = document.getElementById(id); if (!el) return;
    const start = (e) => { e.preventDefault(); if(!monster.alive) return; clearInterval(intervals[id]); intervals[id] = setInterval(action, 30); };
    const stop = () => clearInterval(intervals[id]);
    el.addEventListener("touchstart", start); el.addEventListener("touchend", stop);
    el.addEventListener("mousedown", start); el.addEventListener("mouseup", stop); el.addEventListener("mouseleave", stop);
}

bindBtn("btnUp", () => checkCollisionAndMove(player.x + Math.cos(player.angle) * 3, player.y + Math.sin(player.angle) * 3));
bindBtn("btnDown", () => checkCollisionAndMove(player.x - Math.cos(player.angle) * 3, player.y - Math.sin(player.angle) * 3));
bindBtn("btnLeft", () => checkCollisionAndMove(player.x + Math.cos(player.angle - Math.PI/2) * 3, player.y + Math.sin(player.angle - Math.PI/2) * 3));
bindBtn("btnRight", () => checkCollisionAndMove(player.x + Math.cos(player.angle + Math.PI/2) * 3, player.y + Math.sin(player.angle + Math.PI/2) * 3));
bindBtn("btnLookLeft", () => { if(playerHealth > 0 && !gameWon && monster.alive) player.angle -= 0.05; });
bindBtn("btnLookRight", () => { if(playerHealth > 0 && !gameWon && monster.alive) player.angle += 0.05; });

// DESIGN LẠI CƠ CHẾ NÚT FIRE ĐỔI MÀN CHẮC CHẮN 100%
const fireBtn = document.getElementById("btnFire");
if (fireBtn) {
    const doFire = (e) => {
        e.preventDefault();
        
        // Trạng thái 1: Đã chết -> Hồi sinh tại màn cũ
        if (playerHealth <= 0) {
            loadLevel(currentLevel);
            return;
        }
        
        // Trạng thái 2: Đã phá đảo 5 màn -> Chơi lại từ đầu
        if (gameWon) {
            gameWon = false;
            loadLevel(1);
            return;
        }
        
        // Trạng thái 3: THIẾT KẾ LẠI CHÍNH - Nếu quái đã bị hạ gục, dứt khoát tăng cấp màn chơi và tải màn mới
        if (!monster.alive) {
            let nextLvl = currentLevel + 1;
            loadLevel(nextLvl);
            return; // Thoát hàm dứt khoát để không chạy code bắn súng ở dưới
        }

        // Trạng thái 4: Quái đang sống -> Xử lý bắn súng tính điểm sát thương
        if (!isFiring) {
            isFiring = true;
            let mAngle = Math.atan2(monster.y - player.y, monster.x - player.x) - player.angle;
            while (mAngle < -Math.PI) mAngle += Math.PI * 2; 
            while (mAngle > Math.PI) mAngle -= Math.PI * 2;
            
            if (monster.alive && Math.abs(mAngle) < 0.15) {
                // Xóa sạch tất cả các lệnh nhấn giữ di chuyển đang chạy ngầm để giải phóng tài nguyên hệ thống
                for (let key in intervals) { clearInterval(intervals[key]); }
                monster.alive = false; 
            }
            setTimeout(() => { isFiring = false; }, 150);
        }
    };

    fireBtn.addEventListener("touchstart", doFire, { passive: false });
    fireBtn.addEventListener("mousedown", doFire);
}

function gameLoop() { drawScreen(); requestAnimationFrame(gameLoop); }
gameLoop();
