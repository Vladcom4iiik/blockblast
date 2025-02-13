import { saveScore, getLeaderboard } from "./firebase.js";

// Telegram WebApp API
const tg = window.Telegram.WebApp;

// Получаем данные пользователя
const usernameElement = document.getElementById('username');
const avatarElement = document.getElementById('avatar');
const highscoreElement = document.getElementById('highscore');

let user;
try {
  user = tg.initDataUnsafe.user;
  if (user) {
    usernameElement.textContent = user.first_name || 'Аноним';
    avatarElement.src = user.photo_url || 'https://via.placeholder.com/50';
  }
} catch (error) {
  console.error("Ошибка при получении данных пользователя:", error);
}

// Настройки игры
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const gridSize = 8; // Размер поля 8x8
const blockSize = canvas.width / gridSize;
let grid = [];
let score = 0;
let highScore = 0;

// Инициализация сетки
function initGrid() {
  for (let row = 0; row < gridSize; row++) {
    grid[row] = [];
    for (let col = 0; col < gridSize; col++) {
      grid[row][col] = -1; // -1 означает пустую клетку
    }
  }
}

// Отрисовка сетки
function drawGrid() {
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === -1) {
        ctx.fillStyle = '#ecf0f1'; // Пустая клетка
      } else {
        ctx.fillStyle = getColor(grid[row][col]);
      }
      ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
      ctx.strokeRect(col * blockSize, row * blockSize, blockSize, blockSize);
    }
  }
}

// Цвета блоков
function getColor(index) {
  const colors = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
  return colors[index % colors.length];
}

// Добавление фигуры
function addShape() {
  const shape = [
    [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)],
    [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)],
    [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)],
    [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)]
  ];

  // Размещаем фигуру в случайном месте
  const startRow = Math.floor(Math.random() * (gridSize - 2));
  const startCol = Math.floor(Math.random() * (gridSize - 2));

  for (let i = 0; i < shape.length; i++) {
    const [rowOffset, colOffset] = shape[i];
    const row = startRow + rowOffset;
    const col = startCol + colOffset;

    if (grid[row] && grid[row][col] === -1) {
      grid[row][col] = Math.floor(Math.random() * 5);
    }
  }
}

// Проверка заполненных строк и столбцов
function checkLines() {
  let linesCleared = 0;

  // Проверка строк
  for (let row = 0; row < gridSize; row++) {
    if (grid[row].every(cell => cell !== -1)) {
      grid[row] = Array(gridSize).fill(-1);
      linesCleared++;
    }
  }

  // Проверка столбцов
  for (let col = 0; col < gridSize; col++) {
    if (grid.every(row => row[col] !== -1)) {
      for (let row = 0; row < gridSize; row++) {
        grid[row][col] = -1;
      }
      linesCleared++;
    }
  }

  if (linesCleared > 0) {
    score += linesCleared * 100;
    updateScore();
  }
}

// Обновление счета
function updateScore() {
  scoreElement.textContent = `Счет: ${score}`;
  if (score > highScore) {
    highScore = score;
    highscoreElement.textContent = `Рекорд: ${highScore}`;
    saveScore(user.id, user.first_name, highScore);
  }
}

// Запуск игры
document.getElementById('play-btn').addEventListener('click', () => {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-container').style.display = 'block';

  score = 0;
  initGrid();
  setInterval(() => {
    addShape();
    drawGrid();
    checkLines();
  }, 1000);
});

// Лидерборд
document.getElementById('leaderboard-btn').addEventListener('click', async () => {
  const leaderboard = await getLeaderboard();
  alert(
    "Таблица лидеров:\n" +
    leaderboard
      .map((entry, index) => `${index + 1}. ${entry.name}: ${entry.score}`)
      .join("\n")
  );
});

// Переход на страницу профиля
document.getElementById('profile').addEventListener('click', () => {
  window.location.href = 'profile.html'; // Переход на страницу профиля
});