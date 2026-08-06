const canvas = document.getElementById('canvas');
const brushBtns = document.querySelectorAll('.btn');
const colorBtns = document.querySelectorAll('.color');
const ctx = canvas.getContext('2d');

// ----------------------CONSTANTS ------------------
canvas.width = window.innerWidth
canvas.height = window.innerHeight

// ----------------------STATE ------------------   
let drawings = [];
let translate = {};
let currentShape = {
    drawing: [],
}

// let color = 'black'
let brushType = 'pen'
let isDrawing = false;

let scale = 1


// handle brush type btn clicks
brushBtns.forEach(btn => btn.addEventListener('click', (e) => {
    brushBtns.forEach(button => button.classList.remove('selected'));
    brushType = btn.dataset.type // line, circle, square
    btn.classList.add('selected')
}))

// on mouse down (start drawing)
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;

    translate.startingX = e.clientX / scale
    translate.startingY = e.clientY /scale 

    if (brushType === 'hand')
        canvas.style.cursor = 'move'
    else {
        currentShape.shape = brushType;
        currentShape.drawing.push({
            x: e.clientX / scale,
            y: e.clientY /scale 
        });
    }
})

//on mouse move
canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;

    if (brushType === 'hand') {
        translate.finalX = e.clientX / scale
        translate.finalY = e.clientY /scale 
    }
    else if (currentShape.shape !== 'pen') {
        currentShape.drawing = [
            currentShape.drawing[0],
            {
                x: e.clientX / scale,
                y: e.clientY /scale 
            }
        ]
    } else
        currentShape.drawing.push({
            x: e.clientX / scale,
            y: e.clientY /scale 
        });
})

//on mouse up (stop and save)
canvas.addEventListener('mouseup', (e) => {
    isDrawing = false;
    canvas.style.cursor = 'default'

    if (brushType === 'hand') {
        drawings.forEach(drawing => drawing.drawing.forEach(point => {
            // console.log(point)
            point.x += translate.finalX - translate.startingX
            point.y += translate.finalY - translate.startingY
        }));

        translate = {};
    }

    // push drawing
    if (brushType !== 'hand') {
        drawings.push({ ...currentShape })
        currentShape.drawing = [];
    }
})

//color change
colorBtns.forEach(btn => btn.addEventListener('click', (e) => {
    currentShape.color = btn.dataset.color;
}));

//zoom
document.addEventListener('wheel', (e) => {
    console.log(e)
    //positive out/ negative in
    if (e.deltaY > 0) {
        scale -= 0.05
    } else {
        scale += 0.05
    }

    scale = Math.max(0.2, Math.min(scale, 5));
}, { passive: false });


// key stuff
document.addEventListener('keydown', (e) => {
    if (e.altKey) {
        e.preventDefault();
        currentShape.alt = true
    }
    if (e.shiftKey) {
        e.preventDefault();
        currentShape.shift = true
    }
})
document.addEventListener('keyup', (e) => {
    if (e.key === 'Alt')
        currentShape.alt = false
    if (e.key === 'Shift')
        currentShape.shift = false
})


function update() {

}

function drawFree(drawing) {
    ctx.lineWidth = 5
    ctx.strokeStyle = drawing.color ?? 'black';
    ctx.beginPath();
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.moveTo(drawing.drawing.x, drawing.drawing.y);
    for (let j = 0; j < drawing.drawing.length; j++) {
        ctx.lineTo(drawing.drawing[j].x, drawing.drawing[j].y)
        ctx.stroke();
    }
}

function drawLine(drawing) {
    ctx.lineWidth = 5
    ctx.beginPath();
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.moveTo(drawing.drawing[0].x, drawing.drawing[0].y);
    let x = drawing.drawing[drawing.drawing.length - 1].x
    let y = drawing.drawing[drawing.drawing.length - 1].y
    if (drawing.shift) {
        const dx = x - drawing.drawing[0].x
        const dy = y - drawing.drawing[0].y
        let hypot = Math.hypot(dy, dx)
        let theta = (Math.atan2(dy, dx) * 180) / Math.PI
        // find the nearsest rounded angle
        let closestAngle = 0;
        let closestDiff = 180;
        const angles = [0, 45, 90, 135, 180];
        angles.forEach(angle => {
            let diff = Math.abs(theta) - angle;

            if (Math.abs(diff) < closestDiff) {
                closestAngle = angle * Math.sign(theta);
                closestDiff = diff;
            }
        })
        // rotate this vector to there
        // a. v = v2 - v1 is your vector
        // b. v.normalize() gives you the unit vector
        // c. rotate the unit vector and multiply by the v.length()
        // d. add this vector to v1 to get the point for lineTo
        x = Math.cos(Math.PI * closestAngle / 180) * hypot;
        y = Math.sin(Math.PI * closestAngle / 180) * hypot;
        //
        x += drawing.drawing[0].x
        y += drawing.drawing[0].y
        // simple maths bro
    }
    ctx.lineTo(x, y)
    ctx.strokeStyle = drawing.color ?? 'black';
    ctx.stroke()
}

function drawCircle(drawing) {
    ctx.lineWidth = 5
    ctx.strokeStyle = drawing.color ?? 'black';
    ctx.beginPath();
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    ctx.moveTo(drawing.drawing.x, drawing.drawing.y);
    let width = drawing.drawing[drawing.drawing.length - 1].x - drawing.drawing[0].x
    let height = drawing.drawing[drawing.drawing.length - 1].y - drawing.drawing[0].y
    let x = drawing.drawing[0].x;
    let y = drawing.drawing[0].y;
    if (drawing.shift) {
        const size = width > height ? width : height;
        height = Math.abs(size) * Math.sign(height);
        width = Math.abs(size) * Math.sign(width);
    }
    if (!drawing.alt) {
        x += (width / 2)
        y += (height / 2)
        height = height / 2
        width = width / 2
    }
    ctx.ellipse(x, y, Math.abs(width), Math.abs(height), 0, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawRectangle(drawing) {
    ctx.lineWidth = 5
    ctx.strokeStyle = drawing.color ?? 'black';
    ctx.beginPath();
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.moveTo(drawing.drawing.x, drawing.drawing.y);
    let width = drawing.drawing[drawing.drawing.length - 1].x - drawing.drawing[0].x
    let height = drawing.drawing[drawing.drawing.length - 1].y - drawing.drawing[0].y
    let x = drawing.drawing[0].x;
    let y = drawing.drawing[0].y;

    if (drawing.shift) {
        const size = width > height ? width : height;
        width = Math.abs(size) * Math.sign(width);
        height = Math.abs(size) * Math.sign(height);
    }
    if (drawing.alt) {
        x -= width;
        y -= height;
        width *= 2;
        height *= 2;
    }

    ctx.rect(x, y, width, height);
    ctx.stroke();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // ctx.fillStyle = 'white'
    // ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.save();
    if (brushType === 'hand')
        ctx.translate(translate.finalX - translate.startingX, translate.finalY - translate.startingY)


    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.scale(scale, scale)
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // draw the saved drawings
    if (drawings.length) {
        for (let i = 0; i < drawings.length; i++) {
            drawShape(drawings[i])
        }
    }

    // draw the current drawing
    if (currentShape.drawing.length) {
        drawShape(currentShape);
    }
    ctx.restore();
}

const drawShape = (drawing) => {
    switch (drawing.shape) {
        case 'pen':
            drawFree(drawing);
            break;
        case 'rectangle':
            drawRectangle(drawing);
            break;
        case 'circle':
            drawCircle(drawing);
            break;
        case 'line':
            drawLine(drawing);
            break;

    }
}

function loop() {
    update()
    draw()
    requestAnimationFrame(loop)
}

loop();