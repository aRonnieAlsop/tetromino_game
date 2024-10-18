export const TETROMINOS = {
    0: { shape: [[0]], color: '0, 0, 0' },
    I: {
      shape: [
        [0, 'I', 0, 0],
        [0, 'I', 0, 0],
        [0, 'I', 0, 0],
        [0, 'I', 0, 0],
      ],
      color: '80, 227, 230',
    },
    O: {
      shape: [
        ['O', 'O'],
        ['O', 'O'],
      ],
      color: '223, 173, 36',
    },
    L: {
      shape: [
        [0, 0, 0],
        ['L', 'L', 'L'],
        [0, 0, 'L'],
      ],
      color: '223, 173, 36',
    },
    S: {
      shape: [
        [0, 'S', 'S'],
        ['S', 'S', 0],
        [0, 0, 0],
      ],
      color: '48, 211, 56',
    },
    T: {
      shape: [
        [0, 0, 0],
        ['T', 'T', 'T'],
        [0, 'T', 0],
      ],
      color: '132, 61, 198',
    },
  };
  
  export const randomTetromino = () => {
    const tetrominos = 'ILOST';
    const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
    return TETROMINOS[randTetromino];
  };
  