const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const mapWidth = 16;
const mapHeight = 16;
const map = [
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,
    1,0,1,1,0,0,1,0,2,2,2,2,0,1,0,1,
    1,0,1,0,0,0,0,0,0,0,0,2,0,1,0,1,
    1,0,1,0,3,3,3,3,3,0,0,2,0,1,0,1,
    1,0,0,0,3,0,0,0,3,0,0,0,0,1,0,1,
    1,1,0,0,3,0,0,0,3,0,1,1,1,1,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,1,1,1,1,0,0,1,1,1,1,1,1,0,1,
    1,0,1,0,0,1,0,0,1,0,0,0,0,1,0,1,
    1,0,1,0,0,1,0,0,1,0,3,3,0,1,0,1,
    1,0,0,0,0,0,0,0,0,0,3,0,0,0,0,1,
    1,0,2,2,2,2,2,0,2,0,3,3,3,3,0,1,
    1,0,2,0,0,0,2,0,2,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
];

const player = {
    x: 3.5,
    y: 3.5,
    angle: 0,
    fov: Math.PI / 3,
    speed: 0.05,
    rotSpeed: 0.04,
    ammo: 50,
    score: 0,
    shooting: false,
    shootFrame: 0
};

const monsters = [
    { x: 8.5, y: 8.5, active: true },
    { x: 12.5, y: 4.5, active: true },
    { x: 5.5, y: 12.5, active: true }
];

let depthBuffer = new Array(640).fill(16);
const mobileKeys = { up: false, down: false, left: false, right: false };

function bindTouch(id, keyProp) {
    const el = document.getElementById(id);
    el.addEventListener('touchstart', (e) => { e.preventDefault(); mobileKeys[keyProp] = true; });
    el.addEventListener('touchend', (e) => { e.preventDefault(); mobileKeys[keyProp] = false; });
}

bindTouch('btn-up', 'up');
bindTouch('btn-down', 'down');
bindTouch('btn-left', 'left');
bindTouch('btn-right', 'right');

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

            if (Math.abs(diffAngle) < 0.12) {
                let dist = Math.sqrt(dx*dx + dy*dy);
                let screenX = Math.floor((640 / 2) + (diffAngle * (640 / player.fov)));
                if (screenX >= 0 && screenX < 640 && dist < depthBuffer[screenX]) {
                    m.active = false;
                    player.score++;
                    document.getElementById('score').innerText = player.score;
                    
                    setTimeout(() => {
                        m.x = 2 + Math.random() * 12;
                        m.y = 2 + Math.random() * 12;
                        m.active = true;
                    }, 2000);
                }
            }
        });
    }
});

function movePlayer() {
    let moveX = 0;
    let moveY = 0;

    if (mobileKeys.up) {
        moveX += Math.cos(player.angle);
        moveY += Math.sin(player.angle);
    }
    if (mobileKeys.down) {
        moveX -= Math.cos(player.angle);
        moveY -= Math.sin(player.angle);
    }
    if (mobileKeys.left) player.angle -= player.rotSpeed;
    if (mobileKeys.right) player.angle += player.rotSpeed;

    let newX = player.x + moveX * player.speed;
    let newY = player.y + moveY * player.speed;

    if (map[Math.floor(player.y) * mapWidth + Math.floor(newX)] === 0) player.x = newX;
    if (map[Math.floor(newY) * mapWidth + Math.floor(player.x)] === 0) player.y = newY;

    monsters.forEach(m => {
        if (!m.active) return;
        let mdx = player.x - m.x;
        let mdy = player.y - m.y;
        let dist = Math.sqrt(mdx*mdx + mdy*mdy);
        if (dist > 0.5) {
            m.x += (mdx / dist) * 0.015;
            m.y += (mdy / dist) * 0.015;
        }
    });
}

function renderRaycaster() {
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = "#140a0a"; 
    ctx.fillRect(0, 0, width, height / 2);
    ctx.fillStyle = "#1a1a1a"; 
    ctx.fillRect(0, height / 2, width, height / 2);

    for (let i = 0; i < width; i++) {
        const rayAngle = (player.angle - player.fov / 2) + (i / width) * player.fov;
        let distance = 0;
        let hitWall = false;
        let wallType = 0;

        const cos = Math.cos(rayAngle);
        const sin = Math.sin(rayAngle);

        while (!hitWall && distance < 16) {
            distance += 0.05;
            let checkX = Math.floor(player.x + cos * distance);
            let checkY = Math.floor(player.y + sin * distance);

            if (checkX < 0 || checkX >= mapWidth || checkY < 0 || checkY >= mapHeight) {
                hitWall = true;
                distance = 16;
            } else {
                let cell = map[checkY * mapWidth + checkX];
                if (cell > 0) {
                    hitWall = true;
                    wallType = cell;
                }
            }
        }

        const correctedDistance = distance * Math.cos(rayAngle - player.angle);
        depthBuffer[i] = correctedDistance;
        
        const wallHeight = Math.min(height, (height / correctedDistance));
        let colorTone = Math.max(10, 220 - (correctedDistance * 14)); 

        let color = wallType === 1 ? `rgb(${colorTone}, 20, 20)` : 
                    wallType === 2 ? `rgb(20, ${colorTone}, 20)` : `rgb(20, 20, ${colorTone})`;

        ctx.fillStyle = color;
        ctx.fillRect(i, (height - wallHeight) / 2, 1, wallHeight);
    }

    monsters.forEach(m => {
        if (!m.active) return;

        let dx = m.x - player.x;
        let dy = m.y - player.y;
        let angleToMonster = Math.atan2(dy, dx);
        let diffAngle = angleToMonster - player.angle;

        while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
        while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;

        if (Math.abs(diffAngle) < player.fov / 1.5) {
            let dist = Math.sqrt(dx*dx + dy*dy);
            let spriteHeight = Math.min(height, (height / dist) * 0.7);
            let spriteWidth = spriteHeight;
            let monsterScreenX = Math.floor((width / 2) + (diffAngle * (width / player.fov)));

            ctx.save();
            ctx.globalAlpha = Math.min(1, 3 / dist);

            for (let xOffset = -spriteWidth/2; xOffset < spriteWidth/2; xOffset++) {
                let colX = Math.floor(monsterScreenX + xOffset);
                if (colX >= 0 && colX < width && dist < depthBuffer[colX]) {
                    ctx.fillStyle = "#ff2222";
                    ctx.fillRect(colX, (height - spriteHeight) / 2, 1, spriteHeight);

                    ctx.fillStyle = "#000";
                    ctx.fillRect(monsterScreenX - spriteWidth/5, height/2 - spriteHeight/10, spriteWidth/8, spriteHeight/8);
                    ctx.fillRect(monsterScreenX + spriteWidth/10, height/2 - spriteHeight/10, spriteWidth/8, spriteHeight/8);
                }
            }
            ctx.restore();
        }
    });
}

function drawWeapon() {
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.save();
    if (player.shooting) {
        player.shootFrame++;
        ctx.fillStyle = "#ffaa00";
        ctx.beginPath();
        ctx.arc(width / 2, height - 140, 40 + Math.random()*15, 0, Math.PI * 2);
        ctx.fill();

        ctx.translate(Math.random() * 4 - 2, 10);
        if (player.shootFrame > 4) player.shooting = false;
    }

    ctx.fillStyle = "#444";
    ctx.fillRect(width / 2 - 15, height - 90, 30, 90);
    ctx.fillStyle = "#222";
    ctx.fillRect(width / 2 - 8, height - 110, 16, 30); 
    
    ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
    ctx.fillRect(width / 2 - 2, height / 2 - 2, 4, 4);

    ctx.restore();
}

function gameLoop() {
    movePlayer();
    renderRaycaster();
    drawWeapon();
    requestAnimationFrame(gameLoop);
}

gameLoop();

