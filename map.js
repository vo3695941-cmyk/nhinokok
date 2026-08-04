// Khai báo số màn chơi tối đa
const maxLevels = 3;

// Định nghĩa ma trận sơ đồ tường đỏ của từng màn chơi đơn lẻ
const gameLevelsData = {
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
    }
};
