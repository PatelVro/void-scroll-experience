const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
const mouse = {
    x: null,
    y: null,
    radius: 120
}

window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Avoid mouse taking effects after leaving the window
window.addEventListener('mouseout', function() {
    mouse.x = undefined;
    mouse.y = undefined;
});

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
});

class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update() {
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
        }

        // Check mouse presence
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
            this.x -= directionX;
            this.y -= directionY;
        } else {
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 10;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 10;
            }
        }
        
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
    }
}

function init() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 8000;
    const colors = ['#ff007f', '#7000ff', '#00ffd5', '#ffffff'];
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 1) - 0.5;
        let directionY = (Math.random() * 1) - 0.5;
        let color = colors[Math.floor(Math.random() * colors.length)];
        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) + 
                           ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                opacityValue = 1 - (distance / 15000);
                ctx.strokeStyle = 'rgba(255,255,255,' + opacityValue * 0.2 + ')';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connect();
}

init();
animate();

// Roasts logic based on the user's past interesting requests
const roasts = [
    "Tari coding style joi ne toh compiler pan radva mande! (Even the compiler cries looking at your coding style!)",
    "Tari portfolio site toh mast chhe, pan tari shakal nu shu? (Your portfolio site is great, but what about your face?)",
    "Tailwind CSS toh aavde chhe, pan jeevan ma styling kyare lavish? (You know Tailwind CSS, but when will you bring style to your life?)",
    "Next.js ma hydration error madi, pan tara dimag ma toh hamesha drought j hoy chhe! (Next.js gets hydration errors, but your brain is always in a drought!)",
    "Shader animations mast banavi sako, pan tari real life animation toh ekdum laggy chhe! (You can make great shader animations, but your real life animation is extremely laggy!)",
    "Gujarati roast refine karva aavyo hato? Pela potano code toh refine kar! (Came to refine Gujarati roasts? Refine your code first!)",
    "Are boss, GitHub profile toh green chhe, pan bank account nu shu? (Hey boss, GitHub profile is green, but what about the bank account?)"
];

const surpriseCard = document.getElementById('surpriseCard');
const roastText = document.getElementById('roastText');
const nextBtn = document.getElementById('nextBtn');

let isFlipped = false;

surpriseCard.addEventListener('click', function(e) {
    if (e.target === nextBtn) return;
    if (!isFlipped) {
        surpriseCard.classList.add('flipped');
        isFlipped = true;
        setRandomRoast();
        createExplosion(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
    }
});

nextBtn.addEventListener('click', function(e) {
    e.stopPropagation(); // prevent flipping back
    setRandomRoast();
    createExplosion(e.clientX, e.clientY);
});

function setRandomRoast() {
    roastText.style.opacity = 0;
    setTimeout(() => {
        const random = Math.floor(Math.random() * roasts.length);
        roastText.textContent = `"${roasts[random]}"`;
        roastText.style.opacity = 1;
        roastText.style.transition = "opacity 0.5s ease";
    }, 300);
}

function createExplosion(x, y) {
    for (let i = 0; i < 40; i++) {
        const size = (Math.random() * 6) + 2;
        const color = ['#ff007f', '#7000ff', '#00ffd5'][Math.floor(Math.random() * 3)];
        particlesArray.push(new Particle(x, y, (Math.random() * 15) - 7.5, (Math.random() * 15) - 7.5, size, color));
    }
}
