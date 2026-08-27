const player = {
    x: 2.5, y: 2.5, angle: 0, fov: Math.PI / 3,
    speed: 0.05, rotSpeed: 0.05,
    ammo: 999, score: 0, level: 1,
    hp: 1000, maxHp: 1000, 
    shooting: false, shootFrame: 0
};

// Khởi chạy level 1
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
                    m.hp--;
                    if (m.hp <= 0) {
                        m.active = false;
                        player.score++;
                        checkLevelProgress();
                    } else {
                        m.x -= Math.cos(angleToMonster) * 0.08;
                        m.y -= Math.sin(angleToMonster) * 0.08;
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
        } else {
            setTimeout(() => {
                if(player.level === 1) monsters.push({ x: 2 + Math.random()*3, y: 2 + Math.random()*3, type: 1, hp: 1, maxHp: 1, active: true, color: "#ff2222", size: 0.7 });
            }, 1000);
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
            map[14 * mapWidth + 9] = 0; 
            document.getElementById('msg-box').innerText = "CỬA MÀN 6 ĐÃ MỞ! Đi xuyên sang ngách bên trái để gặp QUÁI LÍNH!";
        }
    } else if (player.level === 6) {
        document.getElementById('score').innerText = player.score + "/1";
        document.getElementById('msg-box').innerText = "QUÁI LÍNH ĐÃ CHẾT! Tiến sâu về góc trái để tìm cửa qua màn!";
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

    // [FIXED] PHÂN CHIA VÙNG LOGIC CHUYỂN MÀN CHUẨN XÁC, CHỐNG NHẢY CÓC HIỂN THỊ
    if (player.level === 1 && currentGridX > 6) {
        initLevel(2);
    } else if (player.level === 2 && currentGridY >= 9) { 
        initLevel(3); 
    } else if (player.level === 3 && currentGridY >= 11 && currentGridX > 10) { 
        initLevel(4); 
    } else if (player.level === 4 && currentGridY > 13) {
        initLevel(5); // Đi qua cửa 4 rớt xuống hàng Y=14 ➔ Kích hoạt màn 5, nạp 11 quái
    } else if (player.level === 5 && currentGridX < 9 && map[14 * mapWidth + 9] === 0) {
        initLevel(6); // Chỉ khi diệt sạch 11 quái Màn 5 VÀ lọt qua vách X < 9 sang bên trái ➔ Kích hoạt Màn 6 gặp Quái lính
    } else if (player.level === 6 && currentGridX < 2) {
        // Chỉ khi dọn sạch Quái lính ở Màn 6, đi kịch khung vách bên trái ➔ Kích hoạt Màn 7 thông báo chặn
        player.level = 7;
        document.getElementById('level').innerText = "7";
        document.getElementById('msg-box').innerText = "Xin lỗi vẫn đang xây thêm 🛠️";
        alert("Xin lỗi vẫn đang xây thêm!");
    }

    monsters.forEach(m => {
        if (!m.active) return;
        let mdx = player.x - m.x; let mdy = player.y - m.y;
        let dist = Math.sqrt(mdx*mdx + mdy*mdy);
        
        let chaseSpeed = (m.type >= 3) ? 0.009 : 0.015;
        if (dist > 0.6) {
            m.x += (mdx / dist) * chaseSpeed;
            m.y += (mdy / dist) * chaseSpeed;
        } else {
            let damage = m.type === 6 ? 4 : m.type === 4 ? 3 : 1; 
            player.hp = Math.max(0, player.hp - damage);
            document.getElementById('player-hp').innerText = player.hp + "/1000";
            
            if (player.hp <= 0) {
                alert("BẠN ĐÃ BỊ QUÁI VẬT THỊT! Game tự động hồi sinh!");
                player.hp = 1000;
                player.x = 2.5; player.y = 2.5; player.angle = 0;
                initLevel(1);
            }
        }
    });
}

