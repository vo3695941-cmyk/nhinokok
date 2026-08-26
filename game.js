const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = {
    x: 2.5, y: 2.5, angle: 0, fov: Math.PI / 3,
    speed: 0.05, rotSpeed: 0.05,
    ammo: 99, score: 0, level: 1,
    shooting: false, shootFrame: 0
};

initLevel(1);

let depthBuffer = new Array(640).fill(16);
const mobileKeys = { up: false, down: false, left: false, right: false };

function bindTouch(id, keyProp) {
    const el = document.getElementById(id);
    el.addEventListener('touchstart', (e) => { e.preventDefault(); mobileKeys[keyProp] = true; });
    el.addEventListener('touchend', (e) => { e.preventDefault(); mobileKeys[keyProp] = false; });
}
bindTouch('btn-up', 'up'); bindTouch('btn-down', 'down');
bindTouch('btn-left', 'left'); bindTouch('btn-right', 'right');

document.getElementById('btn-shoot').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!player.shooting && player.ammo > 0) {
        player.shooting = true;
        player.shootFrame = 0;
        player.ammo--;
        document.getElementById('ammo').innerText = player.ammo;

        monsters.forEach(m => {
            if (!m.active) return;
            let dx = m.x - player.x;
            let dy = m.y - player.y;
            let angleToMonster = Math.atan2(dy, dx);
            let diffAngle = angleToMonster - player.angle;

            while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
            while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;

            let allowedOffset = m.type === 3 ? 0.25 : 0.12; 
            if (Math.abs(diffAngle) < allowedOffset) {
                let dist = Math.sqrt(dx*dx + dy*dy);
                let screenX = Math.floor((640 / 2) + (diffAngle * (640 / player.fov)));
                
                if (screenX >= 0 && screenX < 640 && dist < depthBuffer[screenX]) {
                    m.hp--;
                    if (m.hp <= 0) {
                        m.active = false;
                        player.score++;
                        checkLevelProgress();
                    } else {
                        m.x -= Math.cos(angleToMonster) * 0.2;
                        m.y -= Math.sin(angleToMonster) * 0.2;
                    }
                }
            }
        });
    }
});

// [FIXED] Sửa đúng tọa độ mở cửa cho màn 2
function checkLevelProgress() {
    if (player.level === 1) {
        document.getElementById('score').innerText = player.score + "/5";
        if (player.score >= 5) {
            map[3 * mapWidth + 6] = 0; // Mở cửa màn 1 (Tọa độ 6,3)
            document.getElementById('msg-box').innerText = "CỔNG ĐÃ MỞ! Hãy đi sang vùng bên phải để vào MÀN 2!";
        } else {
            setTimeout(() => {
                monsters.push({ x: 2 + Math.random()*3, y: 2 + Math.random()*3, type: 1, hp: 1, maxHp: 1, active: true, color: "#ff2222", size: 0.7 });
            }, 1000);
        }
    } else if (player.level === 2) {
        document.getElementById('score').innerText = player.score + "/3";
        if (player.score >= 3) {
            map[8 * mapWidth + 6] = 0; // [FIXED] Mở chuẩn xác cửa màn 2 tại tọa độ (6,8)
            document.getElementById('msg-box').innerText = "CỔNG MÀN 2 MỞ! Quay lại khe hở phía dưới bên trái để xuống phòng BOSS!";
        }
    } else if (player.level === 3) {
        document.getElementById('score').innerText = player.score + "/1";
        document.getElementById('msg-box').innerText = "BOSS ĐÃ BỊ TIÊU DIỆT! Đi tới góc dưới bên phải!";
        map[10 * mapWidth + 13] = 0; // Mở cửa màn 3 (Tọa độ 13,10)
    }
}

function movePlayer() {
    let moveX = 0; let moveY = 0;
    if (mobileKeys.up) { moveX += Math.cos(player.angle); moveY += Math.sin(player.angle); }
    if (mobileKeys.down) { moveX -= Math.cos(player.angle); moveY -= Math.sin(player.angle); }
    if (mobileKeys.left) player.angle -= player.rotSpeed;
    if (mobileKeys.right) player.angle += player.rotSpeed;

    let newX = player.x + moveX * player.speed;
    let newY = player.y + moveY * player.speed;

    let cellX = map[Math.floor(player.y) * mapWidth + Math.floor(newX)];
    let cellY = map[Math.floor(newY) * mapWidth + Math.floor(player.x)];

    // [FIXED] Không cho phép đi xuyên qua ô số 4 (Cửa đóng). Chỉ cho đi qua khi ô đó đã biến thành 0
    if (cellX === 0) player.x = newX;
    if (cellY === 0) player.y = newY;

    let currentGridX = Math.floor(player.x);
    let currentGridY = Math.floor(player.y);

    // Kích hoạt cơ chế phát hiện vùng để chuyển màn chơi
    if (player.level === 1 && currentGridX > 6) {
        initLevel(2);
    } else if (player.level === 2 && currentGridX < 6 && currentGridY > 5) {
        initLevel(3);
    } else if (player.level === 3 && currentGridY > 10) {
        player.level = 4;
        document.getElementById('level').innerText = "4";
        document.getElementById('msg-box').innerText = "Xin lỗi đang xây thêm 🛠️";
        alert("Xin lỗi đang xây thêm!");
    }

    monsters.forEach(m => {
        if (!m.active) return;
        let mdx = player.x - m.x; let mdy = player.y - m.y;
        let dist = Math.sqrt(mdx*mdx + mdy*mdy);
        let chaseSpeed = m.type === 3 ? 0.008 : 0.015;
        if (dist > 0.6) {
            m.x += (mdx / dist) * chaseSpeed;
            m.y += (mdy / dist) * chaseSpeed;
        }
    });
}

function renderRaycaster() {
    const width = canvas.width; const height = canvas.height;
    ctx.fillStyle = "#110505"; ctx.fillRect(0, 0, width, height / 2);
    ctx.fillStyle = "#151515"; ctx.fillRect(0, height / 2, width, height / 2);

    for (let i = 0; i < width; i++) {
        const rayAngle = (player.angle - player.fov / 2) + (i / width) * player.fov;
        let distance = 0; let hitWall = false; let wallType = 0;
        const cos = Math.cos(rayAngle); const sin = Math.sin(rayAngle);

        while (!hitWall && distance < 16) {
            distance += 0.05;
            let checkX = Math.floor(player.x + cos * distance);
            let checkY = Math.floor(player.y + sin * distance);
            if (checkX < 0 || checkX >= mapWidth || checkY < 0 || checkY >= mapHeight) {
                hitWall = true; distance = 16;
            } else {
                let cell = map[checkY * mapWidth + checkX];
                if (cell > 0) { hitWall = true; wallType = cell; }
            }
        }

        const correctedDistance = distance * Math.cos(rayAngle - player.angle);
        depthBuffer[i] = correctedDistance;
        const wallHeight = Math.min(height, (height / correctedDistance));
        let colorTone = Math.max(10, 200 - (correctedDistance * 13)); 

        let color = (wallType === 4) ? `rgb(150, 60, 0)` : `rgb(${colorTone}, ${colorTone}, ${colorTone})`;
        ctx.fillStyle = color; ctx.fillRect(i, (height - wallHeight) / 2, 1, wallHeight);
    }

    monsters.forEach(m => {
        if (!m.active) return;
        let dx = m.x - player.x; let dy = m.y - player.y;
        let angleToMonster = Math.atan2(dy, dx);
        let diffAngle = angleToMonster - player.angle;

        while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
        while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;

        if (Math.abs(diffAngle) < player.fov) {
            let dist = Math.sqrt(dx*dx + dy*dy);
            let spriteHeight = Math.min(height, (height / dist) * m.size);
            let spriteWidth = spriteHeight;
            let monsterScreenX = Math.floor((width / 2) + (diffAngle * (width / player.fov)));

            ctx.save();
            for (let xOffset = -spriteWidth/2; xOffset < spriteWidth/2; xOffset++) {
                let colX = Math.floor(monsterScreenX + xOffset);
                if (colX >= 0 && colX < width && dist < depthBuffer[colX]) {
                    ctx.fillStyle = m.color;
                    ctx.fillRect(colX, (height - spriteHeight) / 2, 1, spriteHeight);
                    if (m.maxHp > 1) {
                        ctx.fillStyle = "#ff0000"; ctx.fillRect(monsterScreenX - 15, (height - spriteHeight)/2 - 10, 30, 4);
                        ctx.fillStyle = "#00ff00"; ctx.fillRect(monsterScreenX - 15, (height - spriteHeight)/2 - 10, 30 * (m.hp / m.maxHp), 4);
                    }
                }
            }
            ctx.restore();
        }
    });
}

function drawWeapon() {
    const width = canvas.width; const height = canvas.height;
    ctx.save();
    if (player.shooting) {
        player.shootFrame++;
        ctx.fillStyle = "#ffaa00"; ctx.beginPath(); ctx.arc(width / 2, height - 140, 42, 0, Math.PI * 2); ctx.fill();
        ctx.translate(Math.random() * 4 - 2, 10);
        if (player.shootFrame > 4) player.shooting = false;
    }
    ctx.fillStyle = "#444"; ctx.fillRect(width / 2 - 15, height - 90, 30, 90);
    ctx.fillStyle = "#222"; ctx.fillRect(width / 2 - 8, height - 110, 16, 30); 
    ctx.fillStyle = "rgba(255, 0, 0, 0.6)"; ctx.fillRect(width / 2 - 2, height / 2 - 2, 4, 4);
    ctx.restore();
}

function gameLoop() {
    if (player.level <= 3) { movePlayer(); renderRaycaster(); drawWeapon(); }
    requestAnimationFrame(gameLoop);
}

gameLoop();

