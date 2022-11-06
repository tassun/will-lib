import { Canvas } from 'canvas';
import { Random } from 'random-js';
const fs = require('fs');
const path = require('path');
const randomColor = require('randomcolor');
const r = new Random();

export interface CaptcharInfo {
    src: string;
    code: string;
    text: string;
    id?: string;
}

function generateText(canvas: Canvas, textLength: number, pool: string, math: string) {
    let ctx = canvas.getContext('2d');
    let text = r.string(textLength, pool);
    let mathcode = undefined;
    if(math==="+" || math=="add") {
        let f1 = r.integer(1,100);
        let f2 = r.integer(1,100);
        mathcode = f1 + f2;
        text = f1+" + "+f2;
    } else if(math=="-" || math=="subtract") {
        let f1 = r.integer(1,100);
        let f2 = r.integer(1,100);
        mathcode = f1 - f2;
        text = f1+" - "+f2;
    } else if(math=="x" || math=="*" || math=="multiply") {
        let f1 = r.integer(1,100);
        let f2 = r.integer(1,100);
        mathcode = f1 * f2;
        text = f1+" x "+f2;
    }
    let tmp = '';
    let textFullWidth = ctx.measureText(text).width;
    let startPosX = (canvas.width - textFullWidth) / 2;
    let startPosY = canvas.height / 2;
    let code = '';
    for (var i = 0, len = text.length; i < len; i++) {
        let textMetrics = ctx.measureText(tmp) || {};
        let character = text.charAt(i);
        tmp += character;
        ctx.fillStyle = randomColor({ luminosity: 'dark', hue: 'random' });
        code += character;
        let y = r.integer(-10,20);
        ctx.fillText(character, Math.abs(startPosX + textMetrics.width + 2), startPosY + y);
    }
    if(mathcode) return { code: ""+mathcode, text: text };
    return { code: code, text: text };
}

function generateNoise(canvas: Canvas) {
    let ctx = canvas.getContext('2d');
    let i = 25;
  
    while (i--) {
        let loop = 25;
        let x = r.real(0, canvas.width);
        let y = r.real(0, canvas.height);
  
        ctx.beginPath();
        ctx.moveTo(x, y);
  
        while (loop--) {
            ctx.lineTo(x + r.real(-20, 20), y + r.real(-20, 20));
        }
        ctx.strokeStyle = randomColor({ luminosity: 'light', format: 'rgb' }).replace(/rgb\((.*)\)/, 'rgba($1,' + r.real(0.25, 0.75) + ')');
        ctx.stroke();
    }
}
  
function generate(options?: any) {
    if(!options) options = {};
    let base = {
        width: 250,
        height: 100,
        fontSize: 32,
        fontFamily: 'Times New Roman',
        textLength: 8,
        backgroundColor: '#fff',
        pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        math: ''
    };
    options = {...base, ...options};
    //console.log("options",JSON.stringify(options));
      
    let canvas = new Canvas(options.width, options.height);
    let ctx = canvas.getContext('2d');
      
  
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, options.width, options.height);
  
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = options.fontSize + 'px ' + options.fontFamily;
  
    generateNoise(canvas);
  
    let res = generateText(canvas, options.textLength, options.pool, options.math);
  
    return {
      code: res.code,
      text: res.text,
      canvas: canvas
    };
}

async function captchar(options?: any) : Promise<CaptcharInfo> {
    var outputDir = (options?.outputDir || process.cwd());
    return new Promise(function(resolve, reject) {
        let img = generate(options);
        if (options?.format === 'fs') {
            let filepath = path.join(outputDir, (options?.imageName || Date.now().toString()) + '.png');
            //let filepath = path.join(outputDir, (options.imageName || img.code) + '.png');
            img.canvas.toBuffer(function (err, data) {
                if (err) {
                    return reject(err);
                }    
                fs.writeFile(filepath, data, function (err: any) {
                    err ? reject(err) : resolve({
                        src: filepath,
                        code: img.code,
                        text: img.text
                    });
                });
            });        
        } else {
            img.canvas.toDataURL(function (err, str) {
                err ? reject(err) : resolve({
                    src: str,
                    code: img.code,
                    text: img.text
                });
            });
        }
    });
};

export {
    captchar
}
