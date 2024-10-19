import React, { useState, useEffect, useCallback } from 'react';
import { randomTetromino } from './Tetromino'; // Import the randomTetromino function

const STAGE_WIDTH = 10;
const STAGE_HEIGHT = 20;

// Create the game stage (2D grid)
const createStage = () =>
  Array.from(Array(STAGE_HEIGHT), () =>
    new Array(STAGE_WIDTH).fill([0, 'clear'])
  );

// Rotate a matrix (tetromino) 90 degrees
const rotateMatrix = (matrix) => {
  // Transpose the matrix (rows become columns)
  const rotatedTetro = matrix.map((_, index) =>
    matrix.map(col => col[index])
  );
  // Reverse the rows to achieve a 90-degree rotation
  return rotatedTetro.reverse();
};

// Check for collisions between the tetromino and the stage boundaries or existing blocks
const checkCollision = (player, stage, { x: moveX, y: moveY }) => {
  for (let y = 0; y < player.tetromino.length; y += 1) {
    for (let x = 0; x < player.tetromino[y].length; x += 1) {
      // Check that we're on a tetromino cell
      if (player.tetromino[y][x] !== 0) {
        if (
          !stage[y + player.pos.y + moveY] || // Check if within the stage height (y)
          !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] || // Check within the stage width (x)
          stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'clear' // Check if cell is already filled
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

const App = () => {
  const [stage, setStage] = useState(createStage());
  const [player, setPlayer] = useState({
    pos: { x: STAGE_WIDTH / 2 - 2, y: 0 }, // Start in the middle
    tetromino: randomTetromino().shape, // Generate a random tetromino
    collided: false, // Flag to track if the tetromino has collided
  });

  // Rotate the tetromino
  const rotateTetromino = (tetromino) => {
    const rotatedTetro = rotateMatrix(tetromino); // Rotate the tetromino
    return rotatedTetro;
  };

  const rotatePlayer = () => {
    const rotatedTetromino = rotateTetromino(player.tetromino);
    const originalPos = player.pos.x;
    let offset = 1;
    // Check for collisions before rotating
    while (checkCollision({ ...player, tetromino: rotatedTetromino }, stage, { x: 0, y: 0 })) {
      player.pos.x += offset; // Adjust position to avoid collision
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > player.tetromino[0].length) {
        player.pos.x = originalPos; // If no valid rotation is found, revert
        return;
      }
    }
    setPlayer((prev) => ({
      ...prev,
      tetromino: rotatedTetromino, // Apply the rotated tetromino
    }));
  };

  // Move the player horizontally (left/right)
  const movePlayer = (dir) => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      setPlayer((prev) => ({
        ...prev,
        pos: { x: prev.pos.x + dir, y: prev.pos.y },
      }));
    }
  };

  // Drop the player by 1 unit (move down)
  const dropPlayer = () => {
    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      setPlayer((prev) => ({
        ...prev,
        pos: { x: prev.pos.x, y: prev.pos.y + 1 },
      }));
    } else {
      // If there's a collision, place the tetromino on the stage
      setPlayer((prev) => ({
        ...prev,
        collided: true,
      }));
    }
  };

  // Handle player drop when they collide with bottom or another piece
  const drop = () => {
    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      dropPlayer();
    } else {
      const newStage = [...stage];
      // Place tetromino on the stage when it collides
      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            newStage[y + player.pos.y][x + player.pos.x] = [value, 'merged'];
          }
        });
      });

      // Reset the player with a new tetromino after collision
      setPlayer({
        pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
        tetromino: randomTetromino().shape,
        collided: false,
      });
      setStage(newStage);
    }
  };

  // Handle key presses for movement and rotation
  const move = useCallback(
    ({ keyCode }) => {
      if (keyCode === 37) {
        movePlayer(-1); // Move left
      } else if (keyCode === 39) {
        movePlayer(1); // Move right
      } else if (keyCode === 40) {
        dropPlayer(); // Move down
      } else if (keyCode === 38) {
        rotatePlayer(); // Rotate
      }
    },
    [movePlayer, dropPlayer, rotatePlayer] // Add these to dependency array
  );

  // Game loop: drops the player every second
  useEffect(() => {
    const gameLoop = setInterval(() => {
      drop();
    }, 1000);

    window.addEventListener('keydown', move);
    return () => {
      window.removeEventListener('keydown', move);
      clearInterval(gameLoop);
    };
  }, [move, drop]); // Add `move` and `drop` to dependency array

  // Render the player's tetromino on the grid
  const renderTetromino = () => {
    return player.tetromino.map((row, y) =>
      row.map((cell, x) => {
        if (cell !== 0) {
          return (
            <div
              key={`${x}-${y}`}
              style={{
                width: 20,
                height: 20,
                backgroundColor: 'grey',
                position: 'absolute',
                left: `${(player.pos.x + x) * 20}px`,
                top: `${(player.pos.y + y) * 20}px`,
              }}
            />
          );
        }
        return null;
      })
    );
  };

  return (
    <div style={{ display: 'flex', 
                  justifyContent: 'center', 
                  marginTop: '2rem',
                  position: 'relative' }}>
      <div style={{ display: 'grid', 
                    gridTemplateColumns: `repeat(${STAGE_WIDTH}, 20px)`, 
                    justifyItems: 'center', 
                    position: 'relative', }}>
        {stage.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={x}
              style={{
                width: 20,
                height: 20,
                border: '1px solid black',
                backgroundColor: cell[1] === 'clear' ? 'white' : 'grey',
              }}
            />
          ))
        )}
        {renderTetromino()} {/* Render the player's tetromino */}
      </div>
    </div>
  );
};

export default App;







