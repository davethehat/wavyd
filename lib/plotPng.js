/*
 Copyright (c) 2015, David Harvey, Teams and Technology Limited.

 Permission to use, copy, modify, and/or distribute this software for any purpose with
 or without fee is hereby granted, provided that the above copyright notice and this
 permission notice appear in all copies.

 THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO
 THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO
 EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL
 DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER
 IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
 CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
'use strict';

var fs = require('fs');
var Canvas;

try {
  Canvas = require('canvas');
  module.exports = plotPng;
} catch (e) {
  module.exports = function() {
    console.log('Canvas support not installed - see https://github.com/Automattic/node-canvas');
  }
}

function plotPng(wavespec, opts) {
  var canvasWidth = opts.pw,
    canvasHeight = opts.ph,
    canvasMargin = opts.pm;

  var plotWidth = canvasWidth-2*canvasMargin;
  var plotHeight = canvasHeight-2*canvasMargin;
  var canvas = new Canvas(canvasWidth,canvasHeight);
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = '#fff';
  ctx.fillRect(0,0,canvasWidth,canvasHeight);

  ctx.strokeStyle = '#aaa';
  ctx.beginPath();
  ctx.moveTo(canvasMargin,canvasHeight/2);
  ctx.lineTo(canvasWidth-canvasMargin, canvasHeight/2);
  ctx.stroke();

  ctx.strokeStyle = '#020202';
  ctx.beginPath();
  ctx.moveTo(canvasMargin,canvasHeight/2);
  for (var j = 0; j < plotWidth; j++) {
    var sample = wavespec.sampleAtTime(j * 2 * Math.PI/plotWidth);
    var scaled = canvasHeight/2 - Math.round(sample * plotHeight/2);
    ctx.lineTo(j+canvasMargin,scaled);
  }
  ctx.stroke();

  var out = fs.createWriteStream(opts.pn)
    , stream = canvas.createPNGStream();

  stream.on('data', function(chunk){
    out.write(chunk);
  });

  stream.on('end', function(){
    console.log('saved png');
  });
}

module.exports.plotPng = plotPng;