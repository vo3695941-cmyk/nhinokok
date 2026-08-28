const mapWidth = 16;
const mapHeight = 24; // Nới rộng lên 24 hàng để có khu sân thượng

let map = [];

function resetMapToDefault() {
    map = [
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, 
        1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1, // Màn 1
        1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1, 
        1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,1, // CỬA 1
        1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1, 
        1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1, // Hành lang
        1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1, // Màn 2
        1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1, 
        1,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1, // CỬA 2
        1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1, 
        1,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1, // CỬA 3
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1, // Màn 4
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1, 
        1,1,1,1,1,1,1,1,1,1,1,4,1,1,1,1, // CỬA 4
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1, // Màn 5
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1, 
        1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1, // CỬA 5
        1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1, // Màn 6
        1,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1, // CỬA 6
        1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1, // Cầu thang dẫn lên sân thượng Màn 7
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1, // Màn 7 (Sân thượng rộng rãi)
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
        1,1,1,1,1,1,1,1,1,1,1,4,1,1,1,1, // CỬA 7 -> Qua Màn 8 chặn thông báo
        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1  // Khu vực Màn 8
    ];
}

resetMapToDefault();

let monsters = [];
let bossShieldTimer = null;
let bossSummonTimer = null;

function initLevel(lvl) {
    player.level = lvl;
    player.score = 0;
    document.getElementById('level').innerText = lvl;
    
    // Xóa bỏ các vòng lặp timer cũ của Boss nếu có
    if (bossShieldTimer) clearInterval(bossShieldTimer);
    if (bossSummonTimer) clearInterval(bossSummonTimer);

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
        document.getElementById('msg-box').innerText = "MÀN 6: ĐỐI ĐẦU QUÁI LÍNH ĐÁNH THUÊ (25 HP)! Bắn nó!";
        monsters = [
            { x: 2.5, y: 17.5, type: 6, hp: 25, maxHp: 25, active: true, color: "soldier", size: 1.2 }
        ];
    } else if (lvl === 7) {
        player.x = 13.5; player.y = 20.5; // Đưa người chơi lên khu vực Sân thượng Màn 7
        document.getElementById('score').innerText = "0/1";
        document.getElementById('msg-box').innerText = "MÀN 7: BOSS SÂN THƯỢNG XUẤT HIỆN (55 HP)! Cẩn thận KHIÊN phòng thủ!";
        
        // Thêm Siêu Boss Sân Thượng: Đứng yên một chỗ (type: 7), 55 HP, nhận diện hình dạng mặt lính màu Tím "purple-soldier"
        // Thêm thuộc tính shield: false (trạng thái khiên)
        monsters = [
            { x: 5.5, y: 21.5, type: 7, hp: 55, maxHp: 55, active: true, color: "purple-soldier", size: 1.6, shield: false }
        ];

        // Cơ chế bốc xúc xắc Bật Khiên liên tục (Thay đổi ngẫu nhiên mỗi 3 giây để tạo nhịp chiến đấu)
        bossShieldTimer = setInterval(() => {
            let boss = monsters.find(m => m.type === 7 && m.active);
            if (boss) {
                // Tỷ lệ 50/40 (Tương đương xác suất khoảng 55% bật khiên)
                if (Math.random() < 0.55) {
                    boss.shield = true;
                    document.getElementById('msg-box').innerText = "⚠️ BOSS ĐANG BẬT KHIÊN! Đạn bắn vô hiệu!";
                } else {
                    boss.shield = false;
                    document.getElementById('msg-box').innerText = "💥 BOSS ĐÃ HẠ KHIÊN! TẤN CÔNG MAU!";
                }
            }
        }, 3000);

        // Cơ chế Gọi Đệ: Mỗi 10 giây có tỷ lệ 50/50 xuất hiện thêm quái vật thường quấy rối
        bossSummonTimer = setInterval(() => {
            let boss = monsters.find(m => m.type === 7 && m.active);
            if (boss) {
                if (Math.random() < 0.50) { // Tỷ lệ 50/50
                    // Sinh ra quái thường màu đỏ tại vị trí ngẫu nhiên trên sân thượng chạy đến bro
                    monsters.push({ x: 2 + Math.random()*6, y: 20 + Math.random()*2, type: 1, hp: 1, maxHp: 1, active: true, color: "#ff2222", size: 0.7 });
                    document.getElementById('msg-box').innerText = "👾 BOSS VỪA TRIỆU HỒI THÊM ĐỆ QUẤY RỐI!";
                }
            }
        }, 10000);
    }
}
