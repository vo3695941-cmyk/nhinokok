// Khai báo số màn chơi tối đa đã nâng cấp lên 5 màn
const maxLevels = 5;

// Gắn dữ liệu trực tiếp vào đối tượng window toàn cục để file script.js chắc chắn đọc được trên GitHub
window.gameLevelsData = {
    1: {
        // Màn 1: Phòng trống vuông vắn cơ bản
        mapStr: "11111111" + 
                "10000001" + 
                "10000001" + 
                "10000001" + 
                "10000001" + 
                "11111111",
        playerStart: { x: 60, y: 60, angle: 0 }
    },
    2: {
        // Màn 2: Bức tường dài chia đôi phòng ở giữa
        mapStr: "11111111" + 
                "10000001" + 
                "10111101" + 
                "10000101" + 
                "10000001" + 
                "11111111",
        playerStart: { x: 60, y: 60, angle: 0 }
    },
    3: {
        // Màn 3: Mê cung nhỏ lắt léo
        mapStr: "11111111" + 
                "10001001" + 
                "10101011" + 
                "10100001" + 
                "10111101" + 
                "11111111",
        playerStart: { x: 60, y: 60, angle: 0 }
    },
    4: {
        // Màn 4: Thiết kế phòng có 4 cột trụ lớn chắn ở các góc
        mapStr: "11111111" + 
                "10100101" + 
                "10000001" + 
                "10000001" + 
                "10100101" + 
                "11111111",
        playerStart: { x: 60, y: 120, angle: 0 }
    },
    5: {
        // Màn 5: Mê cung hầm hẹp hình chữ Z (Màn khó nhất)
        mapStr: "11111111" + 
                "10000011" + 
                "11110001" + 
                "10000111" + 
                "11000001" + 
                "11111111",
        playerStart: { x: 60, y: 60, angle: 0 }
    }
};

window.maxLevels = maxLevels;

// TỰ ĐỘNG KÍCH HOẠT LẠI GAME NẾU SCRIPT.JS ĐÃ CHỜ SẴN
if (typeof window.loadLevel === 'function') {
    window.loadLevel(1);
}
