// Game State
const gameState = {
  balance: 1000,
  bet: 50,
  isSpinning: false,
  reelSymbols: ['🍀', '🪙', '🌈', '🏆', '🎩', '💎', '⭐'],
  reelPositions: [0, 0, 0],
  winAmount: 0,
};

// Reward Configuration
const rewards = {
  twoMatch: 100,
  threeMatch: 500,
  threeEmerald: 5000,
  threeShamrock: 2500,
};

// DOM Elements
const spinBtn = document.getElementById('spin-btn');
const resetBtn = document.getElementById('reset-btn');
const decreaseBetBtn = document.getElementById('decrease-bet');
const increaseBetBtn = document.getElementById('increase-bet');
const betSlider = document.getElementById('bet-slider');
const balanceDisplay = document.getElementById('balance');
const betDisplay = document.getElementById('bet');
const betAmount = document.getElementById('bet-amount');
const winDisplay = document.getElementById('win');
const winMessage = document.getElementById('win-message');
const reels = document.querySelectorAll('.reel');
const particlesContainer = document.getElementById('particles');

// Initialize Game
function init() {
  updateDisplay();
  setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
  spinBtn.addEventListener('click', spin);
  resetBtn.addEventListener('click', resetGame);
  decreaseBetBtn.addEventListener('click', decreaseBet);
  increaseBetBtn.addEventListener('click', increaseBet);
  betSlider.addEventListener('input', updateBetFromSlider);
}

// Update Display Values
function updateDisplay() {
  balanceDisplay.textContent = gameState.balance;
  betDisplay.textContent = gameState.bet;
  betAmount.textContent = gameState.bet;
  betSlider.value = gameState.bet;
  winDisplay.textContent = gameState.winAmount;
}

// Decrease Bet
function decreaseBet() {
  if (gameState.bet > 10) {
    gameState.bet = Math.max(10, gameState.bet - 10);
    updateDisplay();
  }
}

// Increase Bet
function increaseBet() {
  if (gameState.bet < 100) {
    gameState.bet = Math.min(100, gameState.bet + 10);
    updateDisplay();
  }
}

// Update Bet from Slider
function updateBetFromSlider(e) {
  gameState.bet = parseInt(e.target.value);
  updateDisplay();
}

// Main Spin Function
function spin() {
  // Check if already spinning or insufficient balance
  if (gameState.isSpinning || gameState.balance < gameState.bet) {
    return;
  }

  // Deduct bet from balance
  gameState.balance -= gameState.bet;
  gameState.winAmount = 0;
  updateDisplay();

  // Disable spin button
  gameState.isSpinning = true;
  spinBtn.disabled = true;

  // Clear previous messages
  winMessage.classList.remove('show', 'jackpot');
  winMessage.textContent = '';

  // Spin each reel with staggered timing
  const spinDurations = [600, 700, 800]; // Each reel spins a bit longer
  const stopDelays = [600, 750, 900]; // Staggered stop times

  reels.forEach((reel, index) => {
    // Generate random stop position (0-6 for 7 symbols, repeated 3 times = 21 positions)
    const randomStop = Math.floor(Math.random() * 7);
    gameState.reelPositions[index] = randomStop;

    // Animate the spin
    spinReel(reel, index, spinDurations[index], stopDelays[index]);
  });

  // Check for winning combination after all reels stop
  setTimeout(() => {
    checkWin();
    gameState.isSpinning = false;
    spinBtn.disabled = false;
  }, 1000);
}

// Spin Individual Reel
function spinReel(reel, index, duration, stopDelay) {
  const symbols = reel.querySelectorAll('.reel-symbol');
  const symbolHeight = 60; // Height of each symbol
  const finalPosition = gameState.reelPositions[index];

  // Rapid spinning phase
  let position = 0;
  const spinInterval = setInterval(() => {
    position += symbolHeight;
    reel.scrollTop = position % (symbols.length * symbolHeight);
  }, 50);

  // Stop spinning after duration
  setTimeout(() => {
    clearInterval(spinInterval);

    // Smooth landing to final position
    const finalScroll = finalPosition * symbolHeight;
    reel.style.transition = 'scroll-top 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    reel.scrollTop = finalScroll;

    // Add bounce effect to winning reels (will be enhanced if it's a winner)
    reel.style.animation = 'none';
    setTimeout(() => {
      reel.style.transition = '';
    }, 400);
  }, duration);
}

// Check for Winning Combination
function checkWin() {
  const symbol1 = gameState.reelSymbols[gameState.reelPositions[0]];
  const symbol2 = gameState.reelSymbols[gameState.reelPositions[1]];
  const symbol3 = gameState.reelSymbols[gameState.reelPositions[2]];

  let isWinner = false;
  let isJackpot = false;
  let winType = '';

  // Check for three matching symbols (jackpot)
  if (symbol1 === symbol2 && symbol2 === symbol3) {
    isWinner = true;
    isJackpot = true;

    // Special jackpots for premium symbols
    if (symbol1 === '💎') {
      gameState.winAmount = rewards.threeEmerald;
      winType = 'EMERALD JACKPOT!';
    } else if (symbol1 === '🍀') {
      gameState.winAmount = rewards.threeShamrock;
      winType = 'LUCKY SHAMROCK!';
    } else {
      gameState.winAmount = rewards.threeMatch;
      winType = 'THREE IN A ROW!';
    }

    // Add jackpot celebration
    createJackpotParticles();
    playJackpotAnimation();
  }
  // Check for two matching symbols
  else if (symbol1 === symbol2 || symbol2 === symbol3 || symbol1 === symbol3) {
    isWinner = true;
    gameState.winAmount = rewards.twoMatch;
    winType = 'YOU WIN!';

    // Animate winning reels
    if (symbol1 === symbol2 || symbol1 === symbol3) {
      reels[0].classList.add('winner');
    }
    if (symbol1 === symbol2 || symbol2 === symbol3) {
      reels[1].classList.add('winner');
    }
    if (symbol2 === symbol3 || symbol1 === symbol3) {
      reels[2].classList.add('winner');
    }

    // Create win particles
    createWinParticles();
  }

  // Update balance and display
  gameState.balance += gameState.winAmount;
  updateDisplay();

  // Show win message
  if (isWinner) {
    showWinMessage(winType, isJackpot);
  }

  // Remove winner class after animation
  setTimeout(() => {
    reels.forEach(reel => {
      reel.classList.remove('winner');
    });
  }, 600);
}

// Show Win Message
function showWinMessage(message, isJackpot = false) {
  winMessage.textContent = message;
  winMessage.classList.add('show');

  if (isJackpot) {
    winMessage.classList.add('jackpot');
  }

  // Auto-hide after 3 seconds
  setTimeout(() => {
    winMessage.classList.remove('show', 'jackpot');
  }, 3000);
}

// Create Win Particles
function createWinParticles() {
  const particleEmojis = ['🍀', '💚', '✨', '🪙'];
  const particleCount = 20;

  for (let i = 0; i < particleCount; i++) {
    createParticle(
      particleEmojis[Math.floor(Math.random() * particleEmojis.length)],
      'normal'
    );
  }
}

// Create Jackpot Particles
function createJackpotParticles() {
  const particleEmojis = ['💎', '🍀', '✨', '🌟', '🎉'];
  const particleCount = 40;

  for (let i = 0; i < particleCount; i++) {
    createParticle(
      particleEmojis[Math.floor(Math.random() * particleEmojis.length)],
      'jackpot'
    );
  }
}

// Create Individual Particle
function createParticle(emoji, type = 'normal') {
  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.textContent = emoji;

  // Random starting position
  const startX = Math.random() * window.innerWidth;
  const startY = Math.random() * window.innerHeight;

  particle.style.left = startX + 'px';
  particle.style.top = startY + 'px';

  // Random trajectory
  const endX = (Math.random() - 0.5) * 600;
  const endY = type === 'jackpot'
    ? -(Math.random() * 400 + 200)
    : Math.random() * 400 + 200;

  particle.style.setProperty('--tx', endX + 'px');
  particle.style.setProperty('--ty', endY + 'px');

  const duration = type === 'jackpot' ? '2s' : '1.5s';
  const animationName = type === 'jackpot' ? 'particleFloat' : 'particleFall';

  particle.style.animation = `${animationName} ${duration} ease-out forwards`;

  particlesContainer.appendChild(particle);

  // Remove particle after animation
  setTimeout(() => {
    particle.remove();
  }, parseInt(duration) * 1000);
}

// Play Jackpot Animation
function playJackpotAnimation() {
  // Add screen shake effect
  document.body.style.animation = 'none';
  setTimeout(() => {
    document.body.style.animation = 'shake 0.5s ease-in-out';
  }, 10);
}

// Shake animation for jackpot
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);

// Reset Game
function resetGame() {
  gameState.balance = 1000;
  gameState.bet = 50;
  gameState.winAmount = 0;
  gameState.isSpinning = false;
  spinBtn.disabled = false;

  // Reset all reels to top position
  reels.forEach((reel, index) => {
    reel.style.transition = 'scroll-top 0.3s ease';
    reel.scrollTop = 0;
    reel.classList.remove('winner');
    gameState.reelPositions[index] = 0;
  });

  // Reset display
  updateDisplay();
  winMessage.classList.remove('show', 'jackpot');
  winMessage.textContent = '';

  // Clear particles
  document.querySelectorAll('.particle').forEach(p => p.remove());
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);