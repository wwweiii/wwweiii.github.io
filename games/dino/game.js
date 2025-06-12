// 游戏常量
const GRAVITY = 0.6;
const JUMP_FORCE = -10;
const GROUND_HEIGHT = 50;
const DINO_WIDTH = 50;
const DINO_HEIGHT = 50;
const CACTUS_WIDTH = 20;
const CACTUS_HEIGHT = 40;
const CACTUS_SPEED = 5;
const MIN_CACTUS_INTERVAL = 60;  // 最小间隔
const MAX_CACTUS_INTERVAL = 120; // 最大间隔

// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// 游戏状态
let gameOver = false;
let score = 0;
let animationId;
let cactusTimer = 0;
let nextCactusInterval = getRandomInterval();

// 恐龙对象
const dino = {
    x: 50,
    y: canvas.height - GROUND_HEIGHT - DINO_HEIGHT,
    width: DINO_WIDTH,
    height: DINO_HEIGHT,
    velocityY: 0,
    jumping: false
};

// 障碍物类
class Cactus {
    constructor() {
        this.x = canvas.width;
        this.y = canvas.height - GROUND_HEIGHT - CACTUS_HEIGHT;
        this.width = CACTUS_WIDTH;
        this.height = CACTUS_HEIGHT;
    }

    update() {
        this.x -= CACTUS_SPEED;
    }

    draw() {
        ctx.drawImage(cactusImg, this.x, this.y, this.width, this.height);
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    isCollidingWith(dino) {
        return checkCollision(dino, this);
    }
}

let cacti = [];

// 加载图片
const dinoImg = new Image();
dinoImg.src = '/games/dino/dino.png';

const cactusImg = new Image();
cactusImg.src = '/games/dino/cactus.png';

// 图片加载完成后开始游戏
let assetsLoaded = 0;
dinoImg.onload = cactusImg.onload = () => {
    assetsLoaded++;
    if (assetsLoaded === 2) {
        gameLoop();
    }
};

// 获取随机间隔时间
function getRandomInterval() {
    return Math.floor(Math.random() * (MAX_CACTUS_INTERVAL - MIN_CACTUS_INTERVAL + 1)) + MIN_CACTUS_INTERVAL;
}

// 游戏主循环
function gameLoop() {
    if (gameOver) {
        // 显示游戏结束信息
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束！', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px Arial';
        ctx.fillText('得分：' + score, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('按空格键重新开始', canvas.width / 2, canvas.height / 2 + 50);
        return;
    }

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制地面
    ctx.fillStyle = '#333';
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);

    // 更新恐龙
    dino.velocityY += GRAVITY;
    dino.y += dino.velocityY;

    if (dino.y > canvas.height - GROUND_HEIGHT - DINO_HEIGHT) {
        dino.y = canvas.height - GROUND_HEIGHT - DINO_HEIGHT;
        dino.velocityY = 0;
        dino.jumping = false;
    }

    // 绘制恐龙
    ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);

    // 障碍生成逻辑
    cactusTimer++;
    if (cactusTimer >= nextCactusInterval) {
        cacti.push(new Cactus());
        cactusTimer = 0;
        nextCactusInterval = getRandomInterval(); // 生成新的随机间隔
    }

    // 更新和绘制障碍物
    for (let i = cacti.length - 1; i >= 0; i--) {
        const cactus = cacti[i];
        cactus.update();
        cactus.draw();

        if (cactus.isCollidingWith(dino)) {
            gameOver = true;
            return;
        }

        if (cactus.isOffScreen()) {
            cacti.splice(i, 1);
            score++;
            scoreElement.textContent = score;
        }
    }

    animationId = requestAnimationFrame(gameLoop);
}

// 碰撞检测函数
function checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// 键盘控制
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        if (gameOver) {
            resetGame();
        } else if (!dino.jumping) {
            dino.velocityY = JUMP_FORCE;
            dino.jumping = true;
        }
    }
});

// 重置游戏
function resetGame() {
    gameOver = false;
    score = 0;
    cactusTimer = 0;
    cacti = [];
    dino.y = canvas.height - GROUND_HEIGHT - DINO_HEIGHT;
    dino.velocityY = 0;
    dino.jumping = false;
    scoreElement.textContent = score;
    gameLoop();
}