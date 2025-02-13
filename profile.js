import { getLeaderboard } from "./firebase.js";

// Telegram WebApp API
const tg = window.Telegram.WebApp;

// Получаем данные пользователя
const user = tg.initDataUnsafe.user;
if (!user) {
  alert("Ошибка: Не удалось получить данные пользователя.");
}

// Элементы DOM
const avatarElement = document.getElementById('avatar');
const usernameElement = document.getElementById('username');
const highscoreElement = document.getElementById('highscore');
const totalGamesElement = document.getElementById('total-games');
const totalScoreElement = document.getElementById('total-score');

// Заполняем данные профиля
if (user) {
  avatarElement.src = user.photo_url || 'https://via.placeholder.com/50';
  usernameElement.textContent = user.first_name || 'Аноним';

  // Загружаем статистику из Firebase
  loadProfileStats(user.id);
}

// Кнопка "Назад"
document.getElementById('back-btn').addEventListener('click', () => {
  window.location.href = 'index.html'; // Возвращаемся к игре
});

// Загрузка статистики пользователя
async function loadProfileStats(userId) {
  const leaderboard = await getLeaderboard();
  const userStats = leaderboard.find(entry => entry.userId === userId);

  if (userStats) {
    highscoreElement.textContent = `Рекорд: ${userStats.score}`;
    totalGamesElement.textContent = `Всего игр сыграно: ${Math.floor(Math.random() * 100)}`; // Пример
    totalScoreElement.textContent = `Общий счет: ${Math.floor(Math.random() * 1000)}`; // Пример
  } else {
    highscoreElement.textContent = 'Рекорд: 0';
    totalGamesElement.textContent = 'Всего игр сыграно: 0';
    totalScoreElement.textContent = 'Общий счет: 0';
  }
}