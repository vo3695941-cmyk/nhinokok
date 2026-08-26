const mapWidth = 16;
const mapHeight = 16;

let map = [
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,1, // CỬA 1 (6,3)
    1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,
    1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,4,0,0,0,0,0,1, // CỬA 2 (9,8)
    1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1, // CỬA 3 (13,10)
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,1,1,1,4,1,1,1,1, // CỬA 4 (11,13)
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
];

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
    }
}
