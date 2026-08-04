// Draws and controls the site-wide thought-to-text constellation mode.

const ThinkingMode = Object.freeze({
    nodeCount: 30,
    connectionDistance: 175,
    storageKey: "naomi-thinking-mode",
    letters: "thought→text",
});

const thinkingButton = document.querySelector(".thinking-toggle");
const thinkingCanvas = document.querySelector(".thinking-background");
const thinkingContext = thinkingCanvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let thinkingNodes = [];
let thinkingFrame = null;

function resizeThinkingCanvas() {
    const scale = window.devicePixelRatio || 1;
    thinkingCanvas.width = window.innerWidth * scale;
    thinkingCanvas.height = window.innerHeight * scale;
    thinkingCanvas.style.width = window.innerWidth + "px";
    thinkingCanvas.style.height = window.innerHeight + "px";
    thinkingContext.setTransform(scale, 0, 0, scale, 0, 0);
    thinkingNodes = Array.from({ length: ThinkingMode.nodeCount }, (_, index) => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        phase: Math.random() * Math.PI * 2,
        radius: 1.2 + Math.random() * 1.8,
        letter: index % 4 === 0 ? ThinkingMode.letters[index % ThinkingMode.letters.length] : "",
    }));
}

function drawThinkingConstellation(time = 0) {
    thinkingContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const positions = thinkingNodes.map((node) => ({
        ...node,
        drawX: node.x + Math.sin(time / 3000 + node.phase) * 7,
        drawY: node.y + Math.cos(time / 3600 + node.phase) * 6,
    }));

    for (let first = 0; first < positions.length; first += 1) {
        for (let second = first + 1; second < positions.length; second += 1) {
            const xDistance = positions[first].drawX - positions[second].drawX;
            const yDistance = positions[first].drawY - positions[second].drawY;
            const distance = Math.hypot(xDistance, yDistance);
            if (distance < ThinkingMode.connectionDistance) {
                const opacity = (1 - distance / ThinkingMode.connectionDistance) * 0.14;
                thinkingContext.strokeStyle = "rgba(73, 65, 137, " + opacity + ")";
                thinkingContext.lineWidth = 0.8;
                thinkingContext.beginPath();
                thinkingContext.moveTo(positions[first].drawX, positions[first].drawY);
                thinkingContext.lineTo(positions[second].drawX, positions[second].drawY);
                thinkingContext.stroke();
            }
        }
    }

    positions.forEach((node, index) => {
        thinkingContext.fillStyle = index % 3 === 0 ? "rgba(190, 61, 178, 0.5)" : "rgba(74, 70, 151, 0.48)";
        thinkingContext.beginPath();
        thinkingContext.arc(node.drawX, node.drawY, node.radius, 0, Math.PI * 2);
        thinkingContext.fill();
        if (node.letter) {
            const pulse = 0.18 + (Math.sin(time / 1400 + node.phase) + 1) * 0.08;
            thinkingContext.fillStyle = "rgba(64, 54, 116, " + pulse + ")";
            thinkingContext.font = "12px Georgia";
            thinkingContext.fillText(node.letter, node.drawX + 7, node.drawY - 7);
        }
    });
}

function animateThinkingConstellation(time) {
    drawThinkingConstellation(time);
    thinkingFrame = window.requestAnimationFrame(animateThinkingConstellation);
}

function setThinkingMode(enabled) {
    document.body.classList.toggle("thinking-mode", enabled);
    thinkingButton.setAttribute("aria-pressed", String(enabled));
    thinkingButton.textContent = enabled ? "Thinking mode ✦ on" : "Thinking mode ✦";
    window.sessionStorage.setItem(ThinkingMode.storageKey, String(enabled));
    window.cancelAnimationFrame(thinkingFrame);
    thinkingFrame = null;
    if (enabled) {
        if (reduceMotion) {
            drawThinkingConstellation();
        } else {
            thinkingFrame = window.requestAnimationFrame(animateThinkingConstellation);
        }
    } else {
        thinkingContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
}

resizeThinkingCanvas();
window.addEventListener("resize", resizeThinkingCanvas);
thinkingButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setThinkingMode(!document.body.classList.contains("thinking-mode"));
});
setThinkingMode(window.sessionStorage.getItem(ThinkingMode.storageKey) === "true");
