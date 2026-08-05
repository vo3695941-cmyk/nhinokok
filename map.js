
// Khai báo số màn chơi tối đa
const maxLevels = 5;

// Gắn dữ liệu trực tiếp vào đối tượng window để file script.js chắc chắn đọc được trên GitHub
window.gameLevelsData = {
    1: {
        mapStr: "11111111" + "10000001" + "10000001" + "10000001" + "10000001" + "11111111",
        playerStart: { x: 60, y: 60, angle: 0 }
    },
    2: {
        mapStr: "11111111" + "10000001" + "10111101" + "10000101" + "10000001" + "11111111",
        playerStart: { x: 60, y: 60, angle: 0 }
    },
    3: {
        mapStr: "11111111" + "10001001" + "10101011" + "10100001" + "10111101" + "11111111",
        playerStart: { x: 60, y: 60, angle: 0 }
    },
    4: {
        mapStr: "11111111" + "10100101" + "10000001" + "10000001" + "10100101" + "11111111",
        playerStart: { x: 60, y: 120, angle: 0 }
    },
    5: {
        mapStr: "11111111" + "10000011" + "11110001" + "10000111" + "11000001" + "11111111",
        playerStart: { x: 60, y: 60, angle: 0 }
    }
};

window.maxLevels = maxLevels;
