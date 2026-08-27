const mapWidth = 16;
const mapHeight = 20; 

let map = [];

// Hàm khôi phục lại trạng thái bản đồ ban đầu khi mới vào game hoặc khi hồi sinh
function resetMapToDefault() {
    map = [
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, 
        1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1, // Màn 1
        1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1, 
        1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,1, // CỬA 1 (6,3)
        1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1, 
        1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1, // Hành lang đi xuống Màn 3
        1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1, // Màn 2
        1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1, 
        1,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1, // CỬA 2 (9,8)
        1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1, 
        1,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1, // CỬA 3 (13,10)
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1, // Màn 4
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1, 
        1,1,1,1,1,1,1,1,1,1,1,4,1,1,1,1, // CỬA 4 (11,13)
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1, // Màn 5
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1, 
        1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1, // CỬA 5 (7,16)
        1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1, // Màn 6
        1,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1, // CỬA 7 (9,18)
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1  
    ];
}

resetMapToDefault();

let monsters = [];

function initLevel(lvl) {
    player.level = lvl;
    player.score = 0;
    document.getElementById('level').innerText = lvl;
    
    if (lvl === 1) {
        document.getElementById('score').innerText = "0/5";
        document.getElementById('msg-box').innerText = "MÀN 1: Diệt đủ 5 quái thường để mở lối rẽ bên Phải!";
        monsters = [
            { x: 3.5, y: 2.5, type: 1, hp: 1, maxHp: 1, active: true, color: "#ff2222", size: 0.7 },
            { x: 2.5, y: 4.5, type: 1, hp: 1, maxHp: 1, active: true, color: "#ff2222", size: 0.7 },
            { x: 4.5, y: 1.5, type: 1, hp: 1, maxHp: 1, active: true, color: "#ff2222", size: 0.7 },
            { x: 1.5, y: 2.5, type: 1, hp: 1, maxHp: 1, active: true, color: "#ff2222", size: 0.7 },
            { x: 4.5, y: 4.5, type: 1, hp: 1, maxHp: 1, active: true, color: "#ff2222", size: 0.7 }
        ];
    } else if (lvl === 2) {
        document.getElementById('score').innerText = "0/3";
        document.getElementById('msg-box').innerText = "MÀN 2: Tiến về góc phải diệt 3 quái Vàng để mở lối xuống phòng BOSS!";
        monsters = [
            { x: 12.5, y: 2.5, type: 2, hp: 3, maxHp: 3, active: true, color: "#ffee00", size: 0.8 },
            { x: 9.5, y: 3.5, type: 2, hp: 3, maxHp: 3, active: true, color: "#ffee00", size: 0.8 },
            { x: 13.5, y: 4.5, type: 2, hp: 3, maxHp: 3, active: true, color: "#ffee00", size: 0.8 }
        ];
    } else if (lvl === 3) {
        document.getElementById('score').innerText = "0/1";
        document.getElementById('msg-box').innerText = "MÀN 3: Diệt BOSS Robot khổng lồ Tím để xuống MÀN 4!";
        monsters = [
            { x: 12.5, y: 7.5, type: 3, hp: 15, maxHp: 15, active: true, color: "#aa00ff", size: 1.4 }
        ];
    } else if (lvl === 4) {
        player.x = 13.5; player.y = 11.5; 
        document.getElementById('score').innerText = "0/1";
        document.getElementById('msg-box').innerText = "MÀN 4: SIÊU BOSS CƠ KHÍ XUẤT HIỆN! Trâu 25 HP!";
        monsters = [
            { x: 11.5, y: 11.5, type: 4, hp: 25, maxHp: 25, active: true, color: "#00ffff", size: 1.5 }
        ];
    } else if (lvl === 5) {
        player.x = 13.5; player.y = 14.5; 
        document.getElementById('score').innerText = "0/11";
        document.getElementById('msg-box').innerText = "MÀN 5: Săn lùng diệt 10 quái Xanh và 1 quái Tím!";
        
        monsters = [];
        for(let i = 0; i < 10; i++) {
            monsters.push({ x: 11 + Math.random() * 3, y: 14 + Math.random() * 1.5, type: 5, hp: 2, maxHp: 2, active: true, color: "#00ff55", size: 0.7 });
        }
        monsters.push({ x: 14.5, y: 14.5, type: 3, hp: 10, maxHp: 10, active: true, color: "#aa00ff", size: 1.1 });
    } else if (lvl === 6) {
        player.x = 4.5; player.y = 17.5; 
        document.getElementById('score').innerText = "0/1";
        document.getElementById('msg-box').innerText = "MÀN 6: ĐỐI ĐẦU QUÁI LÍNH ĐÁNH THUÊ (25 HP)! Cẩn thận mất máu!";
        
        monsters = [
            { x: 2.5, y: 17.5, type: 6, hp: 25, maxHp: 25, active: true, color: "soldier", size: 1.2 }
        ];
    }
}
