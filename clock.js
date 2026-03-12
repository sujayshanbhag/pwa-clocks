class StationClock {
    constructor(canvasId, cityName) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.cityName = cityName;
    }

    draw(time) {
        const ctx = this.ctx;
        const r = (this.canvas.height / 2) * 0.88;
        ctx.save();
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

        // Clock Face
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, 2 * Math.PI);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        // Markers
        ctx.fillStyle = "#1e272e";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 18px sans-serif";
        for (let i = 1; i <= 60; i++) {
            ctx.save();
            ctx.rotate(i * Math.PI / 30);
            if (i % 5 === 0) {
                ctx.fillRect(-2, -r, 4, 18);
                ctx.save();
                ctx.translate(0, -r + 35);
                ctx.rotate(-i * Math.PI / 30);
                ctx.fillText(i / 5, 0, 0);
                ctx.restore();
            } else {
                ctx.globalAlpha = 0.2;
                ctx.fillRect(-1, -r, 2, 8);
            }
            ctx.restore();
        }

        // Label
        ctx.fillStyle = "#2f3640";
        ctx.font = "bold 14px sans-serif";
        ctx.globalAlpha = 0.6;
        ctx.fillText(this.cityName, 0, r * 0.45);
        ctx.globalAlpha = 1;

        const h = time.getHours();
        const m = time.getMinutes();
        const s = time.getSeconds();
        const ms = time.getMilliseconds();

        // Hands with Shadows
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;

        this.drawHand(ctx, (h % 12 + m/60) * Math.PI/6, r * 0.5, 9, "#1e272e");
        this.drawHand(ctx, (m + s/60) * Math.PI/30, r * 0.8, 5, "#1e272e");

        // Needle Second Hand
        const sPos = (s + ms/1000) * Math.PI/30;
        ctx.save();
        ctx.rotate(sPos);
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#ff3f34";
        ctx.moveTo(0, 25);
        ctx.lineTo(0, -r * 0.85);
        ctx.stroke();
        ctx.restore();

        // Center Nut
        ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "#ff3f34";
        ctx.fill();

        ctx.restore();
    }

    drawHand(ctx, pos, length, width, color) {
        ctx.save();
        ctx.rotate(pos);
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.strokeStyle = color;
        ctx.moveTo(0, 15);
        ctx.lineTo(0, -length);
        ctx.stroke();
        ctx.restore();
    }
}