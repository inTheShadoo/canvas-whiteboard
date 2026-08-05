const canvas = document.getElementById('canvas');
const brushBtns = document.querySelectorAll('.btn');
const ctx = canvas.getContext('2d');

// ----------------------CONSTANTS ------------------
canvas.width = window.innerWidth
canvas.height = window.innerHeight

// ----------------------STATE ------------------   
let drawings = [];
let currentShape = {
    drawing: [],
}

let color = 'black'
let brushType = 'pen'
let isDrawing = false;


// handle brush type btn clicks
brushBtns.forEach(btn => btn.addEventListener('click', (e) => {
    brushType = btn.dataset.type // line, circle, square
}))

// on mouse down (start drawing)
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    currentShape.shape = brushType;
    currentShape.drawing.push({
        x: e.clientX,
        y: e.clientY
    });
})

//on mouse move
canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;

    if (currentShape.shape === 'rectangle') {
        currentShape.drawing = [
            currentShape.drawing[0],
            {
                x: e.clientX,
                y: e.clientY
            }
        ]
    } else
        currentShape.drawing.push({
            x: e.clientX,
            y: e.clientY
        });
})

//on mouse up (stop and save)
canvas.addEventListener('mouseup', (e) => {
    isDrawing = false;

    // push drawing
    drawings.push({ ...currentShape })
    currentShape.drawing = [];
})


function moveCanvas() {

}

function update() {

}


function drawFree(drawing) {
    ctx.lineWidth = 5
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.moveTo(drawing.drawing.x, drawing.drawing.y);
    for (let j = 0; j < drawing.drawing.length; j++) {
        ctx.lineTo(drawing.drawing[j].x, drawing.drawing[j].y)
        ctx.stroke();
    }
}

// function drawCircle(drawing) {
//     ctx.lineWidth = 5
//     ctx.strokeStyle = 'black';
//     ctx.beginPath();
//     ctx.lineJoin = 'round'
//     ctx.lineCap = 'round'
//     ctx.moveTo(drawing.x, drawing.y);
//     for (let j = 0; j < drawing.length; j++) {
//         ctx.arcTo(drawing[j].x, drawing[j].y)
//         ctx.stroke();
//     }
// }

function drawRectangle(drawing) {
    ctx.lineWidth = 5
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.moveTo(drawing.drawing.x, drawing.drawing.y);
    let width = drawing.drawing[drawing.drawing.length - 1].x - drawing.drawing[0].x
    let height = drawing.drawing[drawing.drawing.length - 1].y - drawing.drawing[0].y
    ctx.rect(drawing.drawing[0].x, drawing.drawing[0].y, width, height)
    ctx.stroke();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // ctx.fillRect(0, 0, canvas.width, canvas.height)

    // draw the saved drawings
    if (drawings.length) {
        for (let i = 0; i < drawings.length; i++) {
            drawShape(drawings[i])
        }
    }

    // draw the current drawing
    if (currentShape.drawing.length) {
        drawShape(currentShape)
    }
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
    }
}

function loop() {
    update()
    draw()
    requestAnimationFrame(loop)
}

loop();