const mapWidth = 16;
const mapHeight = 16;

// MAP THẲNG HÀNG: Đi thẳng một mạch từ trên xuống dưới, không sợ bị bít đường hay đi lạc!
let map = [
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1, // CỬA 1 (Tọa độ X:7, Y:3) - Diệt 5 quái thường để mở
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1, // CỬA 2 (Tọa độ X:7, Y:6) - Diệt 3 quái máy để mở
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1, // CỬA 3 (Tọa độ X:7, Y:9) - Diệt BOSS Robot để mở
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, // Vùng chặn của Màn 4 (Không thể qua)
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
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
        document.getElementById('msg-box').innerText = "MÀN 1: Diệt 5 quái thường để mở Cửa 1 ngay phía trước!";
        monsters = [
            { x: 5.5, y: 2.5, type: 1, hp: 1, maxHp: 1, active: true, color: "#ff2222", size: 0.7 },
            { x: 9.5, y: 2.5, type: 1, hp: 1, maxHp: 1, active: true, color: "#ff2222", size: 0.7 }
        ];
    } else if (lvl === 2) {
        document.getElementById('score').innerText = "0/3";
        document.getElementById('msg-box').innerText = "MÀN 2: Diệt 3 quái cơ máy (Vàng) để mở Cửa 2 đi tiếp!";
        monsters = [
            { x: 4.5, y: 5.5, type: 2, hp: 3, maxHp: 3, active: true, color: "#ffee00", size: 0.8 },
            { x: 7.5, y: 5.5, type: 2, hp: 3, maxHp: 3, active: true, color: "#ffee00", size: 0.8 },
            { x: 11.5, y: 5.5, type: 2, hp: 3, maxHp: 3, active: true, color: "#ffee00", size: 0.8 }
        ];
    } else if (lvl === 3) {
        document.getElementById('score').innerText = "0/1";
        document.getElementById('msg-box').innerText = "MÀN 3: Diệt BOSS Robot khổng lồ (Tím) để mở Cửa 3!";
        monsters = [
            { x: 7.5, y: 8.5, type: 3, hp: 15, maxHp: 15, active: true, color: "#aa00ff", size: 1.4 }
        ];
    }
}
