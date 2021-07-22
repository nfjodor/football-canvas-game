const canvas = document.getElementById("soccerField");
const context = canvas.getContext("2d");
const w = canvas.width;
const h = canvas.height;
const maxDistance = w * 0.2;
const fieldBorder = 6;
const linesNum = 26;
const linesWidth = w / linesNum;
const background = new Image();
const footballCrowd = new Audio("crowd.mp3");
const footballCheering = new Audio("cheering.wav");
const mousePos = { x: 0, y: 0 };

background.src = "bg.jpg";
footballCrowd.volume = 1;
footballCrowd.loop = true;
footballCrowd.play();
footballCheering.volume = 0;
footballCheering.loop = true;
footballCheering.play();

//Coordinates
const center = {
  x: w / 2,
  y: h / 2,
};
const sideAGoal = {
  x: fieldBorder * 2,
  y: h / 2,
};
const sideBGoal = {
  x: w - fieldBorder * 2,
  y: h / 2,
};

const getDistance = (x1, x2, y1, y2) => {
  return Math.sqrt(Math.pow(x1 - y1, 2) + Math.pow(x2 - y2, 2));
};

const setMousePos = (mousePos, canvas, e) => {
  const rect = canvas.getBoundingClientRect();
  mousePos.x = e.clientX - rect.left;
  mousePos.y = e.clientY - rect.top;
  return mousePos;
};

const gameLoop = () => {
  ball.move();
  footballField.setCrowdVolume(ball, sideAGoal, sideBGoal);
  requestAnimationFrame(() => {
    gameLoop();
  });
};

const renderLoop = () => {
  footballField.render(context, background);
  ball.render(context);
  requestAnimationFrame(() => {
    renderLoop();
  });
};

const ball = {
  x: 0,
  y: 0,
  size: 30,
  replaceAble: true,
  shootAble: false,
  lineLength: 0,
  linePos: 0,
  move: function () {
    const minPos = this.size + fieldBorder * 2;
    const maxPos = {
      x: w - this.size - fieldBorder * 2,
      y: h - this.size - fieldBorder * 2,
    };

    if (!this.replaceAble) {
      if (this.x >= maxPos.x || this.x <= minPos) {
        if (this.x >= maxPos.x) this.x = maxPos.x;
        if (this.x <= minPos) this.x = minPos;

        this.speedX *= -1;
      }
      if (this.y >= maxPos.y || this.y <= minPos) {
        if (this.y >= maxPos.y) this.y = maxPos.y;
        if (this.y <= minPos) this.y = minPos;
        this.speedY *= -1;
      }
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedX *= 0.975;
      this.speedY *= 0.975;
      if (Math.abs(this.speedX) <= 0.01 && Math.abs(this.speedY <= 0.01)) {
        this.speedX = 0;
        this.speedY = 0;
      }
    }
  },
  render: function (context) {
    if (this.shootAble) {
      this.linePos = {
        x: mousePos.x,
        y: mousePos.y,
      };
      this.lineLength = getDistance(
        this.linePos.x,
        this.linePos.y,
        this.x,
        this.y
      );
      const ratio = maxDistance / this.lineLength;

      if (this.lineLength >= maxDistance) {
        this.linePos.x = Math.abs(mousePos.x - this.x) * ratio + this.x;
        this.linePos.y = Math.abs(mousePos.y - this.y) * ratio + this.y;

        if (mousePos.x < this.x) {
          this.linePos.x = this.x - Math.abs(mousePos.x - this.x) * ratio;
        }
        if (mousePos.y < this.y) {
          this.linePos.y = this.y - Math.abs(mousePos.y - this.y) * ratio;
        }
      }

      context.beginPath();
      context.moveTo(this.x, this.y);

      context.lineTo(this.linePos.x, this.linePos.y);
      context.lineWidth = 20;
      context.strokeStyle = "#ffffff";
      context.lineCap = "round";
      context.stroke();
    }

    context.shadowBlur = 0;
    context.beginPath();
    context.arc(this.x, this.y, this.size, 0, 2 * Math.PI, false);
    context.fillStyle = "rgba(255,255,255,0.75)";
    context.fill();
    context.lineWidth = fieldBorder / 2;
    context.stroke();
  },
  speedX: 0,
  speedY: 0,
};

const footballField = {
  render: (context, background) => {
    const pattern = context.createPattern(background, "repeat");
    context.rect(0, 0, w, h);
    context.fillStyle = pattern;
    context.fill();

    context.shadowBlur = 0;

    //The center of the football field is lighter

    const grd = context.createRadialGradient(
      w * 0.5,
      h * 0.5,
      w * 0.2,
      w * 0.5,
      h * 0.5,
      w * 0.5
    );
    grd.addColorStop(0, "rgba(20, 255, 0, 0.4)");
    grd.addColorStop(1, "rgba(0,0,0,0)");

    context.fillStyle = grd;
    context.fill();

    //Draw lines to the football field

    for (i = 0; i < linesNum; i++) {
      context.beginPath();
      context.lineWidth = linesWidth;
      context.moveTo(i * linesWidth + linesWidth / 2, 0);
      context.lineTo(i * linesWidth + linesWidth / 2, canvas.height);

      if (i % 2 === 0) {
        context.strokeStyle = "rgba(10, 100, 0, 0.3)";
      } else {
        context.strokeStyle = "rgba(10, 200, 0, 0.3)";
      }

      context.stroke();
    }

    //Draw football field lines

    //goals outer line
    context.beginPath();
    context.rect(
      fieldBorder * 2,
      fieldBorder * 2,
      w - fieldBorder * 4,
      h - fieldBorder * 4
    );
    context.rect(fieldBorder * 2, h * 0.3, w * 0.17, h * 0.4);
    context.rect(w - fieldBorder * 2 - w * 0.17, h * 0.3, w * 0.17, h * 0.4);
    context.lineWidth = fieldBorder;
    context.moveTo(w / 2 - fieldBorder / 2, fieldBorder * 2);
    context.lineTo(w / 2 - fieldBorder / 2, h - fieldBorder * 2);
    context.strokeStyle = "#ffffff";
    context.stroke();

    //goal inner lines
    context.rect(fieldBorder * 2, h * 0.4125, w * 0.06, h * 0.175);
    context.rect(
      w - fieldBorder * 2 - w * 0.06,
      h * 0.4125,
      w * 0.06,
      h * 0.175
    );
    context.lineWidth = fieldBorder * 0.6;
    context.stroke();

    //center of field
    context.beginPath();
    context.arc(
      w / 2 - fieldBorder / 2,
      h / 2 - fieldBorder / 2,
      w * 0.085,
      0,
      2 * Math.PI,
      false
    );
    context.stroke();

    //point at the center of the field
    context.beginPath();
    context.arc(
      w / 2 - fieldBorder / 2,
      h / 2 - fieldBorder / 2,
      fieldBorder,
      0,
      2 * Math.PI,
      false
    );
    context.lineWidth = fieldBorder;
    context.fillStyle = "#ffffff";
    context.shadowColor = "#ffffff";
    context.shadowBlur = 10;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.fill();
    context.stroke();

    //points 11
    context.beginPath();
    context.arc(
      (w * 0.06 + w * 0.17) / 2 + fieldBorder * 2,
      h / 2 - fieldBorder / 2,
      fieldBorder * 0.6,
      0,
      2 * Math.PI,
      false
    );
    context.lineWidth = fieldBorder * 0.6;
    context.strokeStyle = "#ffffff";
    context.fill();
    context.stroke();
    context.beginPath();
    context.arc(
      (w * 0.94 + w * 0.83) / 2 - fieldBorder * 2,
      h / 2 - fieldBorder / 2,
      fieldBorder * 0.6,
      0,
      2 * Math.PI,
      false
    );
    context.fill();
    context.stroke();
  },
  setCrowdVolume: (ball, sideAGoal, sideBGoal) => {
    if (!ball.replaceAble) {
      const distance = {
        fromA: getDistance(sideAGoal.x, sideAGoal.y, ball.x, ball.y),
        fromB: getDistance(sideBGoal.x, sideBGoal.y, ball.x, ball.y),
        maxDist:
          getDistance(sideAGoal.x, sideAGoal.y, sideBGoal.x, sideBGoal.y) / 2,
      };

      let volume =
        1 - Math.min(distance.fromA, distance.fromB) / distance.maxDist;
      if (volume < 0) volume = 0;

      footballCheering.volume = volume;
    }
  },
};

canvas.addEventListener("mousemove", (e) => {
  setMousePos(mousePos, canvas, e);
  if (!ball.replaceAble) return;
  ball.x = mousePos.x;
  ball.y = mousePos.y;
});

canvas.addEventListener("mousedown", () => {
  if (
    Math.abs(mousePos.x - ball.x) < ball.size &&
    Math.abs(mousePos.y - ball.y) < ball.size
  )
    ball.shootAble = true;

  if (ball.replaceAble) ball.shootAble = false;

  ball.replaceAble = false;
});

canvas.addEventListener("mouseup", () => {
  if (ball.shootAble) {
    ball.speedX = (ball.x - mousePos.x) / 5;
    ball.speedY = (ball.y - mousePos.y) / 5;
    if (ball.lineLength >= maxDistance) {
      ball.speedX = (ball.x - ball.linePos.x) / 5;
      ball.speedY = (ball.y - ball.linePos.y) / 5;
    }
  }
  ball.shootAble = false;
});

gameLoop();
renderLoop();
