const mapWidth = 16;
const mapHeight = 16;

// Số 1 = Tường vững chãi, Số 4 = Cửa chặn cơ chế màn, Số 0 = Đường đi thoáng đạt
let map = [
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,1, // Cửa màn 1
    1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,
    1,1,1,4,1,1,1,1,1,1,1,4,1,1,1,1, 
    1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,1, // Cửa màn 2
    1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1, // Cửa màn 3
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1, // Khu vực màn 4 (Đang xây dựng)
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1
];

// Mảng toàn cục lưu danh sách quái vật hiện tại trong phòng
let monsters = [];

function initLevel(lvl) {
    player.level = lvl;
    player.score = 0;
    document.getElementById('level').innerText = lvl;
    
    if (lvl === 1) {
        document.getElementById('score').innerText = "0/5";
        document.getElementById('msg-box').innerText = "Nhiệm vụ: Tiêu diệt 5 quái vật để mở cổng!";
        monsters = [
            { x: 4.5, y: 2.5, type: 1, hp: 1, maxHp: 1, active: true, color: "#ff2222", size: 0.7 },
            { x: 2.5, y: 4.5, type: 1, hp: 1, maxHp: 1, active: true, color: "#ff2222", size: 0.7 }
        ];
    } else if (lvl === 2) {
        player.x = 9.5; player.y = 2.5; 
        document.getElementById('score').innerText = "0/3";
        document.getElementById('msg-box').innerText = "MÀN 2: Quái cơ máy xuất hiện! Bắn 3 phát mới chết!";
        monsters = [
            { x: 12.5, y: 2.5, type: 2, hp: 3, maxHp: 3, active: true, color: "#ffee00", size: 0.8 },
            { x: 9.5, y: 4.5, type: 2, hp: 3, maxHp: 3, active: true, color: "#ffee00", size: 0.8 },
            { x: 13.5, y: 4.5, type: 2, hp: 3, maxHp: 3, active: true, color: "#ffee00", size: 0.8 }
        ];
    } else if (lvl === 3) {
        player.x = 9.5; player.y = 8.5; 
        document.getElementById('score').innerText = "0/1";
        document.getElementById('msg-box').innerText = "MÀN 3: BOSS Robot khổng lồ xuất hiện! Tiêu diệt nó!";
        monsters = [
            { x: 12.5, y: 8.5, type: 3, hp: 15, maxHp: 15, active: true, color: "#aa00ff", size: 1.4 }
        ];
    }
}

