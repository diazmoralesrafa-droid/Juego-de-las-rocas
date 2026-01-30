const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const victorySound = document.getElementById("victorySound");

const gravity = 0.6;
const groundY = 430;

let stars = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height
}));

function createPlayer(x, color) {
    return {
        x,
        y: groundY,
        w: 30,
        h: 40,
        color,
        velY: 0,
        jumping: false,
        deaths: 0,
        alive: true
    };
}

let p1 = createPlayer(180, "cyan");
let p2 = createPlayer(360, "pink");

let rocks = [];

function spawnRock() {
    rocks.push({
        x: Math.random() * (canvas.width - 30),
        y: -40,
        w: 30,
        h: 30,
        speed: 3 + Math.random() * 3
    });
}

setInterval(spawnRock, 700);

let score = 0;
let gameOver = false;

document.addEventListener("keydown", e => {
    if (gameOver) return;

    if (e.key === "a") p1.x -= 6;
    if (e.key === "d") p1.x += 6;
    if (e.key === "w" && !p1.jumping && p1.alive) {
        p1.velY = -12;
        p1.jumping = true;
    }

    if (e.key === "ArrowLeft") p2.x -= 6;
    if (e.key === "ArrowRight") p2.x += 6;
    if (e.key === "ArrowUp" && !p2.jumping && p2.alive) {
        p2.velY = -12;
        p2.jumping = true;
    }
});

function drawStars() {
    ctx.fillStyle = "white";
    stars.forEach(s => ctx.fillRect(s.x, s.y, 2, 2));
}

function drawGround() {
    ctx.fillStyle = "green";
    ctx.fillRect(0, groundY + 40, canvas.width, 60);
}

function drawPlayer(p) {
    if (!p.alive) return;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.w, p.h);
}

function drawRocks() {
    ctx.fillStyle = "gray";
    rocks.forEach(r => {
        ctx.beginPath();
        ctx.arc(r.x + 15, r.y + 15, 15, 0, Math.PI * 2);
        ctx.fill();
    });
}

function collision(p, r) {
    return (
        p.x < r.x + r.w &&
        p.x + p.w > r.x &&
        p.y < r.y + r.h &&
        p.y + p.h > r.y
    );
}

function updatePlayer(p) {
    if (!p.alive) return;

    p.velY += gravity;
    p.y += p.velY;

    if (p.y >= groundY) {
        p.y = groundY;
        p.velY = 0;
        p.jumping = false;
    }

    p.x = Math.max(0, Math.min(canvas.width - p.w, p.x));
}

function endGame() {
    gameOver = true;
    victorySound.play();
    setTimeout(() => {
        alert("🏆 Juego terminado\nPuntos finales: " + score);
    }, 300);
}

function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();
    drawGround();

    updatePlayer(p1);
    updatePlayer(p2);

    rocks.forEach(r => r.y += r.speed);
    rocks = rocks.filter(r => r.y < canvas.height + 50);

    rocks.forEach(r => {
        if (p1.alive && collision(p1, r)) {
            p1.deaths++;
            document.getElementById("dead1").innerText = p1.deaths;
            if (p1.deaths >= 2) p1.alive = false;
            r.y = canvas.height + 100;
        }

        if (p2.alive && collision(p2, r)) {
            p2.deaths++;
            document.getElementById("dead2").innerText = p2.deaths;
            if (p2.deaths >= 2) p2.alive = false;
            r.y = canvas.height + 100;
        }
    });

    drawPlayer(p1);
    drawPlayer(p2);
    drawRocks();

    score++;
    document.getElementById("score").innerText = score;

    if (!p1.alive && !p2.alive) endGame();

    requestAnimationFrame(gameLoop);
}

gameLoop();
