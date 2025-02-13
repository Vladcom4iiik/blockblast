import { saveScore, getLeaderboard } from "./firebase.js";

// Настройки игры
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');

const blockSize = 40;
const rows = canvas.height / blockSize;
const cols = canvas.width / blockSize;
let grid = [];
let score = 0;
let level = 1;
let timeLeft = 60;

let playerName = prompt("Введите ваше имя:") || "Anonymous"; // Если игрок не ввел имя, используем "Anonymous"

// Инициализация сетки
function initGrid() {
  for (let row = 0; row < rows; row++) {
    grid[row] = [];
    for (let col = 0; col < cols; col++) {
      grid[row][col] = Math.floor(Math.random() * 5); // Цвет блока (0-4)
    }
  }
}

// Отрисовка сетки
function drawGrid() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const colorIndex = grid[row][col];
      ctx.fillStyle = getColor(colorIndex);
      ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
      ctx.strokeRect(col * blockSize, row * blockSize, blockSize, blockSize);
    }
  }
}

// Получение цвета блока
function getColor(index) {
  const colors = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
  return colors[index];
}

// Обработка кликов
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const col = Math.floor(x / blockSize);
  const row = Math.floor(y / blockSize);

  if (grid[row][col] !== -1) {
    const cleared = clearBlocks(row, col, grid[row][col]);
    if (cleared > 0) {
      dropBlocks();
      addNewBlocks();
      score += cleared * 10;
      updateScore();

      // Переход на новый уровень
      if (score % 100 === 0) {
        level++;
        startLevel();
      }
    }
  }
});

// Удаление блоков
function clearBlocks(row, col, color) {
  if (row < 0 || row >= rows || col < 0 || col >= cols || grid[row][col] !== color) {
    return 0;
  }

  let count = 1;
  grid[row][col] = -1; // Помечаем как удаленный
  count += clearBlocks(row - 1, col, color);
  count += clearBlocks(row + 1, col, color);
  count += clearBlocks(row, col - 1, color);
  count += clearBlocks(row, col + 1, color);
  return count;
}

// Опустить блоки
function dropBlocks() {
  for (let col = 0; col < cols; col++) {
    let emptyRow = rows - 1;
    for (let row = rows - 1; row >= 0; row--) {
      if (grid[row][col] !== -1) {
        grid[emptyRow][col] = grid[row][col];
        emptyRow--;
      }
    }
    while (emptyRow >= 0) {
      grid[emptyRow][col] = Math.floor(Math.random() * 5);
      emptyRow--;
    }
  }
}

// Добавить новые блоки
function addNewBlocks() {
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      if (grid[row][col] === -1) {
        grid[row][col] = Math.floor(Math.random() * 5);
      }
    }
  }
}

// Обновление счета
function updateScore() {
  scoreElement.textContent = `Score: ${score}`;
}

// Таймер
function startLevel() {
  timeLeft = 60 - level * 5; // Уменьшаем время с каждым уровнем
  if (timeLeft < 10) timeLeft = 10; // Минимальное время
  updateTimer();
}

function updateTimer() {
  timerElement.textContent = `Time Left: ${timeLeft}`;
  if (timeLeft <= 0) {
    endGame();
  } else {
    timeLeft--;
    setTimeout(updateTimer, 1000);
  }
}

// Завершение игры
function endGame() {
  alert(`Игра окончена! Ваш счет: ${score}`);
  savePlayerScore(); // Сохраняем результат
  showLeaderboard(); // Показываем таблицу лидеров
  location.reload(); // Перезапускаем игру
}

// Сохранение результата
function savePlayerScore() {
  if (playerName) {
    saveScore(playerName, score);
  }
}

// Отображение таблицы лидеров
async function showLeaderboard() {
  const leaderboard = await getLeaderboard();
  alert(
    "Таблица лидеров:\n" +
    leaderboard
      .map((entry, index) => `${index + 1}. ${entry.name}: ${entry.score}`)
      .join("\n")
  );
}

// Запуск игры
initGrid();
drawGrid();
startLevel();
setInterval(() => {
  drawGrid();
}, 100);