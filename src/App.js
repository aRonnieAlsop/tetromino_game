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
  const rotatedTetro = matrix.map((_, index) =>
    matrix.map(col => col[index])
  );
  return rotatedTetro.reverse();
};

// Check for collisions between the tetromino and the stage boundaries or existing blocks
const checkCollision = (player, stage, { x: moveX, y: moveY }) => {
  for (let y = 0; y < player.tetromino.length; y += 1) {
    for (let x = 0; x < player.tetromino[y].length; x += 1) {
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

// Check if the game is over by looking at the top row where the new tetromino spawns
const checkGameOver = (newPlayer, stage) => {
  for (let y = 0; y < newPlayer.tetromino.length; y++) {
    for (let x = 0; x < newPlayer.tetromino[y].length; x++) {
      if (
        newPlayer.tetromino[y][x] !== 0 &&
        stage[y + newPlayer.pos.y][x + newPlayer.pos.x][1] !== 'clear'
      ) {
        return true; // Game over if the spawn position is blocked
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
  const [gameOver, setGameOver] = useState(false); //track game over state

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

      // Check for game over before spawning a new tetromino
      const newPlayer = {
        pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
        tetromino: randomTetromino().shape,
        collided: false,
      };

      if (checkGameOver(newPlayer, newStage)) {
        setGameOver(true); // Trigger game over if no space for the new tetromino
      } else {
        setPlayer(newPlayer);
        setStage(newStage);
      }
    }
  };

  // Handle key presses for movement and rotation
  const move = useCallback(
    ({ keyCode }) => {
      if (!gameOver) {
        if (keyCode === 37) {
          movePlayer(-1); // Move left
        } else if (keyCode === 39) {
          movePlayer(1); // Move right
        } else if (keyCode === 40) {
          dropPlayer(); // Move down
        } else if (keyCode === 38) {
          rotatePlayer(); // Rotate
        }
      }
    },
    [movePlayer, dropPlayer, rotatePlayer, gameOver]
  );

  // Game loop: drops the player every second
  useEffect(() => {
    if (!gameOver) {
      const gameLoop = setInterval(() => {
        drop();
      }, 1000);

      window.addEventListener('keydown', move);
      return () => {
        window.removeEventListener('keydown', move);
        clearInterval(gameLoop);
      };
    }
  }, [move, drop, gameOver]);

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
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', position: 'relative' }}>
      {gameOver ? (
        <div style={{ color: 'red', fontSize: '2rem' }}>Game Over</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STAGE_WIDTH}, 20px)`, justifyItems: 'center', position: 'relative', }}>
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
      )}
    </div>
  );
};

export default App;








