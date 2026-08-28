const player = {
    x: 2.5, y: 2.5, angle: 0, fov: Math.PI / 3,
    speed: 0.05, rotSpeed: 0.05,
    ammo: 999, score: 0, level: 1,
    shooting: false, shootFrame: 0
};

initLevel(1);

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

            let allowedOffset = (m.type >= 3) ? 0.25 : 0.12; 
            if (Math.abs(diffAngle) < allowedOffset) {
                let dist = Math.sqrt(dx*dx + dy*dy);
                let screenX = Math.floor((640 / 2) + (diffAngle * (640 / player.fov)));
                
                if (screenX >= 0 && screenX < 640 && dist < depthBuffer[screenX]) {
                    
                    // [CƠ CHẾ MỚI MÀN 7] Nếu bắn trúng Boss lúc đang bật khiên -> Đạn nảy, không mất máu!
                    if (m.type === 7 && m.shield) {
                        return; // Thoát ra luôn, không trừ HP của Boss
                    }

                    m.hp--;
                    if (m.hp <= 0) {
                        m.active = false;
                        if (m.type === 7 || m.type === 6 || m.type === 4 || m.type === 3 || m.type === 2) {
                            player.score++; // Chỉ tính điểm diệt địch cốt lõi qua màn cho các mục tiêu chính
                            checkLevelProgress();
                        } else if (player.level === 5 || player.level === 1) {
                            player.score++; // Tính điểm cho quái thường ở màn gom số lượng
                            checkLevelProgress();
                        }
                    } else {
                        // Boss Màn 7 đứng im một chỗ, các quái khác mới bị giật lùi khi trúng đạn
                        if (m.type !== 7) {
                            m.x -= Math.cos(angleToMonster) * 0.08;
                            m.y -= Math.sin(angleToMonster) * 0.08;
                        }
                    }
                }
            }
        });
    }
});

function checkLevelProgress() {
    if (player.level === 1) {
        document.getElementById('score').innerText = player.score + "/5";
        if (player.score >= 5) {
            map[3 * mapWidth + 6] = 0; 
            document.getElementById('msg-box').innerText = "CỬA 1 MỞ! Rẽ phải sang hành lang bên cạnh để vào MÀN 2!";
        }
    } else if (player.level === 2) {
        document.getElementById('score').innerText = player.score + "/3";
        if (player.score >= 3) {
            map[8 * mapWidth + 9] = 0; 
            document.getElementById('msg-box').innerText = "CỬA 2 MỞ! Đi xuống phía dưới hành lang dọc để gặp BOSS MÀN 3!";
        }
    } else if (player.level === 3) {
        document.getElementById('score').innerText = player.score + "/1";
        map[10 * mapWidth + 13] = 0; 
        document.getElementById('msg-box').innerText = "BOSS MÀN 3 CHẾT! CỬA 3 MỞ! Hãy đi xuống phòng dưới cùng!";
    } else if (player.level === 4) {
        document.getElementById('score').innerText = player.score + "/1";
        map[13 * mapWidth + 11] = 0; 
        document.getElementById('msg-box').innerText = "SIÊU BOSS BỊ TIÊU DIỆT! CỬA MÀN 5 ĐÃ MỞ! Tiến thẳng xuống dưới!";
    } else if (player.level === 5) {
        document.getElementById('score').innerText = player.score + "/11";
        if (player.score >= 11) {
            map[16 * mapWidth + 7] = 0; 
            document.getElementById('msg-box').innerText = "CỬA MÀN 6 ĐÃ MỞ! Đi xuyên sâu xuống ngách bên trái!";
        }
    } else if (player.level === 6) {
        document.getElementById('score').innerText = player.score + "/1";
        map[18 * mapWidth + 9] = 0; 
        document.getElementById('msg-box').innerText = "QUÁI LÍNH ĐÃ CHẾT! CỬA MÀN 7 ĐÃ MỞ! Đi xuống hành lang cầu thang bên phải!";
    } else if (player.level === 7) {
        document.getElementById('score').innerText = player.score + "/1";
        map[22 * mapWidth + 11] = 0; // Diệt xong Boss sân thượng, mở Cửa số 7 thông xuống Màn 8
        if (bossShieldTimer) clearInterval(bossShieldTimer);
        if (bossSummonTimer) clearInterval(bossSummonTimer);
        document.getElementById('msg-box').innerText = "🔥 ĐÃ TIÊU DIỆT TRÙM SÂN THƯỢNG! Cửa dẫn xuống MÀN 8 đã mở toang!";
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

    if (cellX === 0) player.x = newX;
    if (cellY === 0) player.y = newY;

    let currentGridX = Math.floor(player.x);
    let currentGridY = Math.floor(player.y);

    // Kích hoạt nạp màn uốn lượn uốn khúc theo chiều cao 24 hàng
    if (player.level === 1 && currentGridX > 6) {
        initLevel(2);
    } else if (player.level === 2 && currentGridY >= 9) { 
        initLevel(3); 
    } else if (player.level === 3 && currentGridY >= 11 && currentGridX > 10) { 
        initLevel(4); 
    } else if (player.level === 4 && currentGridY > 13) {
        initLevel(5); 
    } else if (player.level === 5 && currentGridY >= 17) {
        initLevel(6); 
    } else if (player.level === 6 && currentGridY >= 20) {
        initLevel(7); // Bước chân qua khỏi lối cầu thang xuống hàng Y=20 ➔ Lên Sân thượng Màn 7
    } else if (player.level === 7 && currentGridY > 22) {
        // Vượt qua cửa số 7 lọt xuống hàng Y=23 ➔ Chạm rìa Màn 8 và dội bảng cảnh báo chặn đứng
        player.level = 8;
        document.getElementById('level').innerText = "8";
        document.getElementById('msg-box').innerText = "Xin lỗi vẫn đang xây thêm 🛠️";
        alert("Xin lỗi vẫn đang xây thêm!");
    }

    // AI Quái vật dịch chuyển đuổi theo. Riêng Boss Màn 7 (type: 7) đứng im một chỗ!
    monsters.forEach(m => {
        if (!m.active || m.type === 7) return; 
        let mdx = player.x - m.x; let mdy = player.y - m.y;
        let dist = Math.sqrt(mdx*mdx + mdy*mdy);
        
        if (dist > 0.5) {
            let chaseSpeed = (m.type >= 3) ? 0.009 : 0.015;
            m.x += (mdx / dist) * chaseSpeed;
            m.y += (mdy / dist) * chaseSpeed;
        }
    });
}

