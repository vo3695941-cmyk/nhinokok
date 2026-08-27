const mapWidth = 16;
const mapHeight = 20; // [NÂNG CẤP] Tăng chiều cao lên 20 hàng để đủ chỗ cho Màn 6 và Màn 7

let map = [];

// Hàm khôi phục lại trạng thái bản đồ ban đầu (Chuẩn ma trận 16x20)
function resetMapToDefault() {
    map = [
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, // Hàng 0
        1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1, // Hàng 1 (Màn 1 - Góc trên bên trái)
        1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1, // Hàng 2
        1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,1, // Hàng 3 (CỬA 1 - X:6, Y:3)
        1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1, // Hàng 4
        1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1, // Hàng 5 (Hành lang nối Màn 1 -> Màn 2)
        1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1, // Hàng 6 (Màn 2 - Góc trên bên phải)
        1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1, // Hàng 7
        1,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1, // Hàng 8 (CỬA 2 - X:9, Y:8)
        1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1, // Hàng 9
        1,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1, // Hàng 10 (CỬA 3 - X:13, Y:10)
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1, // Hàng 11 (Màn 4 - Giữa bên phải)
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1, // Hàng 12
        1,1,1,1,1,1,1,1,1,1,1,4,1,1,1,1, // Hàng 13 (CỬA 4 - X:11, Y:13)
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1, // Hàng 14 (Màn 5 rộng rãi - Dưới bên phải)
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1, // Hàng 15
        1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1, // Hàng 16 (CỬA 5 MỚI - X:7, Y:16)
        1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1, // Hàng 17 (Màn 6 mới tinh - Dưới bên trái)
        1,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1, // Hàng 18 (CỬA CHẶN MÀN 7 - X:9, Y:18)
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1  // Hàng 19
    ];
}

// Chạy khởi tạo bản đồ lần đầu tiên
resetMapToDefault();

let monsters = [];

function initLevel(lvl) {
    player.level = lvl;
    player.score = 0;
    document.getElementById('level').innerText = lvl;
    
    if (lvl === 1) {
        document.getElementById('score').innerText = "0/5";
        document.getElementById('msg-box').innerText = "MÀN 1: Diệt 5 quái thường để mở lối rẽ bên Phải!";
        monsters = [
            { x: 3.5, y: 2.5, type: 1, hp: 1, maxHp: 1, active: true, color: "#ff2222", size: 0.7 },
            { x: 2.5, y: 4.5, type: 1, hp: 1, maxHp: 1, active: true, color: "#ff2222", size: 0.7 }
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
        player.x = 4.5; player.y = 17.5; // [FIXED] Spawn người chơi an toàn trong căn phòng Màn 6 mới tinh
        document.getElementById('score').innerText = "0/1";
        document.getElementById('msg-box').innerText = "MÀN 6: ĐỐI ĐẦU QUÁI LÍNH ĐÁNH THUÊ (25 HP)! Cẩn thận mất máu!";
        
        monsters = [
            { x: 2.5, y: 17.5, type: 6, hp: 25, maxHp: 25, active: true, color: "soldier", size: 1.2 }
        ];
    }
}
