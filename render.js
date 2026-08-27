const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let depthBuffer = new Array(640).fill(16);

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

        let color = "";
        if (wallType === 4) {
            color = `rgb(220, 100, 0)`; 
        } else {
            if (player.level === 1) color = `rgb(${colorTone}, ${colorTone}, ${colorTone})`; 
            else if (player.level === 2) color = `rgb(20, ${colorTone}, 20)`;               
            else if (player.level === 3) color = `rgb(20, 20, ${colorTone})`;               
            else if (player.level >= 4) color = `rgb(${colorTone}, 15, ${colorTone})`;       
            else color = "#000";
        }
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
                    
                    // [ĐÃ NÂNG CẤP THÀNH CÔNG] DỰNG TEXTURE HÌNH ẢNH GÃ LÍNH CHI TIẾT
                    if (m.color === "soldier") {
                        let topY = (height - spriteHeight) / 2;
                        let isStripe = (Math.floor(colX / 5) % 2 === 0);
                        
                        // 1. Tầng Đầu & Mặt & Tóc (15% trên cùng)
                        if (xOffset > -spriteWidth/6 && xOffset < spriteWidth/6) {
                            ctx.fillStyle = `rgb(230, 160, 120)`; // Da mặt lính
                            ctx.fillRect(colX, topY, 1, spriteHeight * 0.15);
                            ctx.fillStyle = `rgb(90, 50, 20)`; // Tóc nâu quân đội
                            ctx.fillRect(colX, topY, 1, spriteHeight * 0.04);
                        } else {
                            ctx.fillStyle = `rgb(45, 85, 45)`; // Cầu vai giáp
                            ctx.fillRect(colX, topY + spriteHeight * 0.1, 1, spriteHeight * 0.05);
                        }
                        
                        // 2. Tầng Áo giáp lính Camo rằn ri (45% tiếp theo)
                        ctx.fillStyle = isStripe ? `rgb(35, 75, 35)` : `rgb(95, 65, 45)`;
                        ctx.fillRect(colX, topY + spriteHeight * 0.15, 1, spriteHeight * 0.45);
                        
                        // Khẩu súng trường lính đang bồng trước ngực
                        if (xOffset > -spriteWidth/4 && xOffset < spriteWidth/3) {
                            ctx.fillStyle = `rgb(40, 40, 40)`; 
                            ctx.fillRect(colX, topY + spriteHeight * 0.35, 1, spriteHeight * 0.08);
                        }

                        // 3. Tầng Quần Kaki dã chiến (25% tiếp theo)
                        ctx.fillStyle = isStripe ? `rgb(85, 95, 65)` : `rgb(55, 65, 45)`;
                        ctx.fillRect(colX, topY + spriteHeight * 0.6, 1, spriteHeight * 0.25);

                        // 4. Đôi bốt chiến đấu cổ cao dưới đáy (15% dưới cùng)
                        if (xOffset < -spriteWidth/8 || xOffset > spriteWidth/8) {
                            ctx.fillStyle = `rgb(20, 20, 20)`; 
                            ctx.fillRect(colX, topY + spriteHeight * 0.85, 1, spriteHeight * 0.15);
                        }
                        
                    } else {
                        ctx.fillStyle = m.color;
                        ctx.fillRect(colX, (height - spriteHeight) / 2, 1, spriteHeight);
                    }
                    
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
    if (player.level <= 6) { 
        movePlayer(); 
        renderRaycaster(); 
        drawWeapon(); 
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();
