const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- HỆ THỐNG MÀN CHƠI (LEVELS) ---
let currentLevel = 1;
const maxLevels = 3;

const levels = {
    1: {
        mapStr: "11111111" + "10000001" + "10000001" + "10000001" + "10000001" + "11111111",
        playerStart: { x: 60, y: 60, angle: 0 },
        monsterStart: { x: 180, y: 140 }
    },
    2: {
        mapStr: "11111111" + "10000001" + "10111101" + "10000101" + "10000001" + "11111111",
        playerStart: { x: 60, y: 60, angle: 0 },
        monsterStart: { x: 240, y: 180 }
    },
    3: {
        mapStr: "11111111" + "10001001" + "10101011" + "10100001" + "10111101" + "11111111",
        playerStart: { x: 60, y: 60, angle: 0 },
        monsterStart: { x: 260, y: 100 }
    }
};

const mapWidth = 8, mapHeight = 6, mapScale = 40;

let player = { x: 60, y: 60, angle: 0, fov: Math.PI / 3 };
let playerHealth = 100;
let isFiring = false;
let monster = { x: 180, y: 140, alive: true };
let depthBuffer = new Array(320);
let gameWon = false;

function loadLevel(lvl) {
    if (lvl > maxLevels) {
        gameWon = true;
        return;
    }
    currentLevel = lvl;
    player.x = levels[lvl].playerStart.x;
    player.y = levels[lvl].playerStart.y;
    player.angle = levels[lvl].playerStart.angle;
    monster.x = levels[lvl].monsterStart.x;
    monster.y = levels[lvl].monsterStart.y;
    monster.alive = true;
    playerHealth = 100;
}

loadLevel(1);

function getMapCell(x, y) {
    if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) return 1;
    let index = y * mapWidth + x;
    let currentMapStr = levels[currentLevel].mapStr;
    return currentMapStr.charAt(index) === '1' ? 1 : 0;
}

function drawScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Vẽ bầu trời và mặt đất
    ctx.fillStyle = "#1a1a1a"; ctx.fillRect(0, 0, 320, 100);
    ctx.fillStyle = "#333333"; ctx.fillRect(0, 100, 320, 100);

    const numRays = 320;
    const rayStep = player.fov / numRays;
    let startAngle = player.angle - player.fov / 2;

    // 1. Quét tia dựng tường 3D
    for (let i = 0; i < numRays; i++) {
        let currentAngle = startAngle + i * rayStep;
        let distance = 0;
        let hitWall = false;

        while (!hitWall && distance < 300) {
            distance += 1;
            let checkX = Math.floor((player.x + Math.cos(currentAngle) * distance) / mapScale);
            let checkY = Math.floor((player.y + Math.sin(currentAngle) * distance) / mapScale);

            if (getMapCell(checkX, checkY) === 1) { hitWall = true; }
        }

        let correctedDist = distance * Math.cos(currentAngle - player.angle);
        depthBuffer[i] = correctedDist;

        let wallHeight = Math.min(160, (3200 / (correctedDist || 1)));
        let colorVal = Math.max(30, 160 - distance * 0.6);
        ctx.fillStyle = `rgb(${colorVal}, 0, 0)`;
        ctx.fillRect(i, 100 - wallHeight / 2, 1, wallHeight);
    }

    // 2. Dựng hình Quái vật 2.5D
    if (monster.alive && !gameWon) {
        let dx = monster.x - player.x;
        let dy = monster.y - player.y;
        let distToMonster = Math.sqrt(dx * dx + dy * dy);

        let monsterAngle = Math.atan2(dy, dx) - player.angle;
        while (monsterAngle < -Math.PI) monsterAngle += Math.PI * 2;
        while (monsterAngle > Math.PI) monsterAngle -= Math.PI * 2;

        if (Math.abs(monsterAngle) < player.fov) {
            let monsterSubHeight = Math.min(200, (3200 / distToMonster));
            let monsterScreenX = (320 / 2) + Math.tan(monsterAngle) * (320 / 2);

            let screenXInt = Math.floor(monsterScreenX);
            if (screenXInt >= 0 && screenXInt < 320 && distToMonster < depthBuffer[screenXInt]) {
                let colorGreen = Math.max(40, 180 - distToMonster * 0.5);
                if (currentLevel === 1) ctx.fillStyle = `rgb(0, ${colorGreen}, 0)`;
                else if (currentLevel === 2) ctx.fillStyle = `rgb(${colorGreen}, ${colorGreen}, 0)`;
                else ctx.fillStyle = `rgb(${colorGreen}, 0, ${colorGreen})`;
                
                ctx.fillRect(monsterScreenX - monsterSubHeight/4, 100 - monsterSubHeight/2, monsterSubHeight/2, monsterSubHeight);
                
                ctx.fillStyle = "#ff0000";
                ctx.fillRect(monsterScreenX - 5, 100 - monsterSubHeight/4, 3, 3);
                ctx.fillRect(monsterScreenX + 2, 100 - monsterSubHeight/4, 3, 3);
            }
        }

        if (distToMonster < 16 && playerHealth > 0) {
            playerHealth -= (0.4 + currentLevel * 0.2);
            if (playerHealth < 0) playerHealth = 0;
        }
    }

    // 3. Súng Shotgun và hiệu ứng bắn
    ctx.save();
    if (isFiring && !gameWon && playerHealth > 0) {
        ctx.fillStyle = "#ffcc00";
        ctx.beginPath();
        ctx.moveTo(160, 110); ctx.lineTo(140, 80); ctx.lineTo(160, 60); ctx.lineTo(180, 80);
        ctx.fill();
        ctx.fillStyle = "#ff3300";
        ctx.beginPath();
        ctx.moveTo(160, 110); ctx.lineTo(150, 90); ctx.lineTo(160, 75); ctx.lineTo(170, 90);
        ctx.fill();
    }
    ctx.fillStyle = "#555555"; ctx.fillRect(152, 120, 7, 80); ctx.fillRect(161, 120, 7, 80);
    ctx.fillStyle = "#222222"; ctx.fillRect(145, 150, 30, 50);
    ctx.restore();

    // 4. HUD giao diện
    ctx.fillStyle = "#00ff00"; ctx.fillRect(159, 99, 2, 2);
    
    ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(10, 10, 110, 18);
    ctx.fillStyle = "#ff0000"; ctx.fillRect(15, 14, playerHealth, 10);
    ctx.fillStyle = "#fff"; ctx.font = "10px Arial"; ctx.fillText("HP: " + Math.floor(playerHealth) + "%", 20, 23);

    ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(240, 10, 70, 18);
    ctx.fillStyle = "#fff"; ctx.font = "10px Arial"; ctx.fillText("MAP: " + currentLevel + "/" + maxLevels, 248, 23);

    if (playerHealth <= 0) {
        ctx.fillStyle = "rgba(130,0,0,0.8)"; ctx.fillRect(0,0,320,200);
        ctx.fillStyle = "#fff"; ctx.font = "20px Arial"; ctx.fillText("YOU DIED", 115, 95);
        ctx.font = "10px Arial"; ctx.fillText("Click FIRE to restart Level", 105, 125);
    } else if (gameWon) {
        ctx.fillStyle = "rgba(0,100,0,0.8)"; ctx.fillRect(0,0,320,200);
        ctx.fillStyle = "#fff"; ctx.font = "18px Arial"; ctx.fillText("VICTORY! ALL MAPS CLEARED", 35, 100);
        ctx.font = "10px Arial"; ctx.fillText("Click FIRE to play again", 105, 130);
    } else if (!monster.alive) {
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(40, 85, 240, 40);
        ctx.fillStyle = "#fff"; ctx.font = "12px Arial"; ctx.fillText("MAP CLEARED!", 115, 100);
        ctx.font = "10px Arial"; ctx.fillText("Click FIRE to advance to next Map", 85, 118);
    }
}

const moveSpeed = 3;
const rotateSpeed = 0.05;

function checkCollisionAndMove(nextX, nextY) {
    if (playerHealth <= 0 || gameWon) return;
    let cellX = Math.floor(nextX / mapScale);
    let cellY = Math.floor(nextY / mapScale);
    if (getMapCell(cellX, cellY) === 0) { player.x = nextX; player.y = nextY; }
}

function moveForward() { checkCollisionAndMove(player.x + Math.cos(player.angle) * moveSpeed, player.y + Math.sin(player.angle) * moveSpeed); }
function moveBackward() { checkCollisionAndMove(player.x - Math.cos(player.angle) * moveSpeed, player.y - Math.sin(player.angle) * moveSpeed); }
function strafeLeft() { checkCollisionAndMove(player.x + Math.cos(player.angle - Math.PI/2) * moveSpeed, player.y + Math.sin(player.angle - Math.PI/2) * moveSpeed); }
function strafeRight() { checkCollisionAndMove(player.x + Math.cos(player.angle + Math.PI/2) * moveSpeed, player.y + Math.sin(player.angle + Math.PI/2) * moveSpeed); }

let intervals = {};
function bindBtn(id, action) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = (e) => { e.preventDefault(); clearInterval(intervals[id]); intervals[id] = setInterval(action, 30); };
    const stop = () => clearInterval(intervals[id]);
    el.addEventListener("touchstart", start); el.addEventListener("touchend", stop);
    el.addEventListener("mousedown", start); el.addEventListener("mouseup", stop); el.addEventListener("mouseleave", stop);
}

bindBtn("btnUp", moveForward);
bindBtn("btnDown", moveBackward);
bindBtn("btnLeft", strafeLeft);
bindBtn("btnRight", strafeRight);
bindBtn("btnLookLeft", () => { if(playerHealth > 0 && !gameWon) player.angle -= rotateSpeed; });
bindBtn("btnLookRight", () => { if(playerHealth > 0 && !gameWon) player.angle += rotateSpeed; });

const fireBtn = document.getElementById("btnFire");
if (fireBtn) {
    const doFire = (e) => {
        e.preventDefault();
        if (playerHealth <= 0) { loadLevel(currentLevel); return; }
        if (gameWon) { gameWon = false; loadLevel(1); return; }
        if (!monster.alive) { loadLevel(currentLevel + 1); return; }

        if (!isFiring) {
            isFiring = true;
            let dx = monster.x - player.x;
            let dy = monster.y - player.y;
            let monsterAngle = Math.atan2(dy, dx) - player.angle;
            while (monsterAngle < -Math.PI) monsterAngle += Math.PI * 2;
            while (monsterAngle > Math.PI) monsterAngle -= Math.PI * 2;

            if (monster.alive && Math.abs(monsterAngle) < 0.15) {
                monster.alive = false;
            }
            setTimeout(() => { isFiring = false; }, 150);
        }
    };
    fireBtn.addEventListener("touchstart", doFire);
    fireBtn.addEventListener("mousedown", doFire);
}

function gameLoop() {
    drawScreen();
    requestAnimationFrame(gameLoop);
}
gameLoop();
