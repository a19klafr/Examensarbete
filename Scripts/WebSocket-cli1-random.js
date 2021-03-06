// ==UserScript==
// @name         TOAST: WebSockets - client 1 - random shape
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Userscript for client 1 in Graduation project
// @author       Klara Frommelin
// @match        http://localhost/examensarbete/WebSocket/index.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=undefined.
// @grant        none
// ==/UserScript==

const canvas = document.getElementById("canvasBox");
const ctx = canvas.getContext(`2d`);
var connectBtn = document.getElementById("conecctbtn");
var min = 0;
var xMax = canvas.width;
var yMax = canvas.height;
var startCoordinates, endCoordinates, date;

function enterName(){
    var nameInput = document.getElementById("namebox");
    nameInput.value = "User1";
    return Promise.resolve(nameInput.dispatchEvent(new KeyboardEvent('keyup', {'key': 'a'})));
}
function clickButton(){
    connectBtn.dispatchEvent(new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
    }));
}
function applySettings(fill, stroke, line){
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = line;
}
function drawRect(x1, y1, x2, y2, fill, stroke, line){
    applySettings(fill, stroke, line);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2,y1);
    ctx.lineTo(x2,y2);
    ctx.lineTo(x1,y2);
    ctx.lineTo(x1,y1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}
function drawLine(x1, y1, x2, y2, fill, stroke, line){
    applySettings(fill, stroke, line);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2,y2);
    ctx.closePath();
    ctx.stroke();
}
function drawCircle(x1, y1, x2, y2, fill, stroke, line){
    applySettings(fill, stroke, line);

    var x;
    var y;
    if (x1 > x2){
        x = x1 - x2;
    } else if (x1 < x2) {
        x = x2 - x1;
    } else {
        x = 10;
    }
    if (y1 > y2){
        y = y1 - y2;
    } else if (y1 < y2) {
        y = y2 - y1;
    } else {
        y = 10;
    }

    var radius = Math.hypot(x, y);
    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}
function drawShapes(shape, start, end, fill, stroke, size){
    if (shape == 1) {
        drawLine(start.x, start.y, end.x, end.y, fill, stroke, size);
    }
    if (shape == 2) {
        drawRect(start.x, start.y, end.x, end.y, fill, stroke, size);
    }
    if (shape == 3) {
        drawCircle(start.x, start.y, end.x, end.y, fill, stroke, size);
    }
}
function mouseUpSimulation(drawShape, startCoordinates, position, fillColor, strokeColor, lineSize, id){
    drawShapes(drawShape, startCoordinates, position, fillColor, strokeColor, lineSize);

    if (id == 1){
        date = new Date(); //saves time from moment shape is drawn (simulation of mouse being released)
    }

    var sendShape = {
        type: `new_shape`,
        shape: drawShape,
        start: startCoordinates,
        end: position,
        fill: fillColor,
        stroke: strokeColor,
        size: lineSize,
        time: date,
        id: id
    };
    ws.send(JSON.stringify(sendShape)); //ws is found from @match
}
function runTest(){
    for (var a = 1; a < 1001; a++){
        //Put coordinates into object
        var x1 = Math.floor(Math.random() * xMax) + min;
        var x2 = Math.floor(Math.random() * xMax) + min;
        var y1 = Math.floor(Math.random() * yMax) + min;
        var y2 = Math.floor(Math.random() * yMax) + min;
        startCoordinates = {x: x1, y: y1};
        endCoordinates = {x: x2, y: y2};

        //Randomize fill- and stroke color and line width
        var hexCodeFill = "#xxxxxx".replace(/x/g, y=>(Math.random()*16|0).toString(16));
        var hexCodeStroke = "#xxxxxx".replace(/x/g, y=>(Math.random()*16|0).toString(16));
        var lineWidth = Math.floor(Math.random() * 10) + 1;

        //Randomize shape to be drawn
        var shapeNr = Math.floor(Math.random() * 3) + 1; //Number between 1 and 3
        var shapeBtn = document.getElementById("opt" + shapeNr).dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        }));

        //Draw shape with generated randomized data
        mouseUpSimulation(shapeNr, startCoordinates, endCoordinates, hexCodeFill, hexCodeStroke, lineWidth, a);
    };
}

(function() {
    'use strict';
    localStorage.setItem("counter","");
    ws.addEventListener(`open`, () => {
        enterName().then(clickButton);
    });
    ws.addEventListener("message", data => {
        var message = JSON.parse(data.data);
        switch(message.type) {
            case `new_user`:
                var counter = 0;

                counter = parseInt(localStorage.getItem("counter"));
                if(isNaN(counter))
                {
                    counter = 0;
                }

                var loop = setInterval(function(){
                    //Keep track of rounds
                    counter++;
                    localStorage.setItem("counter", counter);

                    runTest();

                    if(counter == 2000) //Stops the drawing loop
                    {
                        clearInterval(loop);
                        return;
                    }
                }, 500);
                break;
            default:
                break;
        };
    });
})();