import React, { useState, useEffect, useCallback } from 'react';
import { randomTetromino } from './Tetromino'; // Import the randomTetromino function

const STAGE_WIDTH = 10;
const STAGE_HEIGHT = 20;

// Create the game stage (2D grid)
const createStage = () =>
  Array.from(Array(STAGE_HEIGHT), () =>
    new Array(STAGE_WIDTH).fill([0, 'clear'])
  );

// Check for collisions between the tetromino and the stage boundaries or existing blocks
const checkCollision = (player, stage, { x: moveX, y: moveY }) => {
  for (let y = 0; y < player.tetromino.length; y += 1) {
    for (let x = 0; x < player.tetromino[y].length; x += 1) {
      if (player.tetromino[y][x] !== 0) {
        if (
          !stage[y + player.pos.y + moveY] || 
          !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] || 
          stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'clear'
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
    pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
    tetromino: randomTetromino().shape,
    collided: false,
  });
  const [dropTime, setDropTime] = useState(1000); // Set initial drop speed to 1 second
  const [gameOver, setGameOver] = useState(false); // Handle game-over state

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
        pos: { x: prev.pos.x, y: prev.pos.y + 1 }, // Moves the tetromino down
      }));
    } else {
      // If there's a collision, place the tetromino on the stage
      setPlayer((prev) => ({
        ...prev,
        collided: true,
      }));
    }
  };

  // Handle player drop when they collide with the bottom or another piece
  const drop = () => {
    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      dropPlayer(); // Drop tetromino down
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
      resetPlayer(newStage);
    }
  };

  // Reset the player position and check for game over only if the tetromino cannot move
  const resetPlayer = (newStage) => {
    const newTetromino = randomTetromino().shape;
    const initialPosition = { x: STAGE_WIDTH / 2 - 2, y: 0 };

    // Only check for game over if there's already a block in the starting position
    if (checkCollision({ pos: initialPosition, tetromino: newTetromino }, newStage, { x: 0, y: 0 })) {
      setGameOver(true); // Game over when tetromino cannot spawn at the top
      setDropTime(null); // Stop the game loop
    } else {
      setPlayer({
        pos: initialPosition,
        tetromino: newTetromino,
        collided: false,
      });
      setStage(newStage);
    }
  };

  // Rotate the tetromino (this can be improved later)
  const rotatePlayer = () => {
    // Implement rotation logic here (optional)
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

  // Game loop: drops the player every second (or faster depending on dropTime)
  useEffect(() => {
    if (!gameOver) {
      const gameLoop = setInterval(() => {
        drop(); // This should move the tetromino down every second
      }, dropTime);

      window.addEventListener('keydown', move);

      return () => {
        window.removeEventListener('keydown', move);
        clearInterval(gameLoop);
      };
    }
  }, [move, drop, dropTime, gameOver]);

  const renderStage = () => {
    const stageCopy = [...stage];
    // Add tetromino to the stage before rendering
    player.tetromino.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          stageCopy[y + player.pos.y][x + player.pos.x] = [value, 'tetromino'];
        }
      });
    });

    return stageCopy.map((row, y) =>
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
    );
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
      {gameOver ? (
        <div style={{ color: 'red' }}>Game Over</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${STAGE_WIDTH}, 20px)`,
            justifyContent: 'center',
          }}
        >
          {renderStage()}
        </div>
      )}
    </div>
  );
};

export default App;




