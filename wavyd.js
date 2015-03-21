#!/usr/bin/env node
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

var Speaker = require('speaker');
var parseArgs = require('minimist');

var WaveGenerator = require('./lib/waveGenerator');
var Wavespec = require('./lib/wavespec');

var plotPng = require('./lib/plotPng');


var minimistOpts = {
  default: {
    'freq'   : 440,
    'spec'   : '1:0, 0.5:0',
    'dur'    : 3,

    'dump'   : false,
    'table'  : 1024,
    'round'  : true,
    'scale'  : 2048,

    'plot'   : false,
    'pn'     : 'plot.png',
    'pw'     : 160*4,
    'ph'     : 90*4,
    'pm'     : 4,
    'help'   : false
  },
  boolean: ['dump', 'round', 'help']
};

var help = {
  'freq'   : 'Audio frequency to play',
  'spec'   : 'Spec for wave generation - partials weight and phase',
  'dur'    : 'Audio duration in seconds',

  'dump'   : 'If given, write wavetable data to stdout',
  'table'  : 'Size (#samples) of wavetable to generate',
  'round'  : 'If true, round samples in wavetable to integer values',
  'scale'  : 'Scale samples in wavetable by this value',

  'plot'   : 'If given, generate a graphic representation of waveform: ascii|png',
  'pn'     : 'For png plot, output filename',
  'pw'     : 'For png plot, pixel width of image',
  'ph'     : 'For png plot, pixel height of image',
  'pm'     : 'For png plot, inner margin of image',

  'help'   : 'Show this help message'
};

var description = 'A little playground for additive harmonic synthesis';
var specHelp =
  'Spec argument should be a quoted list of weight:phase pairs w:p\n' +
  'separated by spaces and/or commas, e.g.\n\n' +
  '\t"1.0, 0.5:0, 0.25:0.2PI"\n\n' +
  '(Note that phases are in radians relative to the current partial, and\n' +
  'that you can use "PI" as a constant in these expressions)';

var args = parseArgs(process.argv.slice(2), minimistOpts);

var plotters = {
  ascii    : plotAscii,
  png      : plotPng,
  nullFunc : function() {}
};

function main(opts) {

  if (opts.help) {
    showHelp();
    process.exit(0);
  }

  opts.round = opts.round !== 'false';

  var frequency = opts.freq;
  var duration = opts.dur;
  var plot = opts.plot ? plotters[opts.plot] : plotters.nullFunc;

  var wavespec = Wavespec.fromString(opts.spec);
  var wg = new WaveGenerator(frequency, wavespec, duration, envelope);

  wg.pipe(new Speaker());

  var roundFunc = opts.round? Math.round : function(n) {return n;};

  if (opts.dump) {
    for (var i = 0; i < opts.table; i++) {
      var t = i * 2 * Math.PI/opts.table;
      console.log(roundFunc(wavespec.sampleAtTime(t) * opts.scale));
    }
  }

  plot(wavespec, opts);
}

function showHelp() {
  console.log('wavyd');
  console.log(description);
  Object.keys(help).forEach(showHelpItem);
  console.log(specHelp);

  function showHelpItem(k) {
    console.log('%s\t%s (%s)', k, help[k], minimistOpts.default[k]);
  }
}

function plotAscii(wavespec) {
  var canvas = [];
  for (var i = 0; i < 33; i++) {
    canvas.push(line(128, i === 16 ? '-' : ' '));
  }
  for (var j = 0; j < 128; j++) {
    var sample = wavespec.sampleAtTime(j * 2 * Math.PI/128);
    var scaled = 16 + Math.round(sample * 16);
    canvas[32-scaled][j] = '*';
  }
  canvas.forEach(function(l) {
    console.log(l.join(''));
  });

  function line(len, char) {
    var ret = [];
    while(len--) {
      ret.push(char);
    }
    return ret;
  }
}

function envelope(t, totalSamplesToGenerate) {
  if ( t <= totalSamplesToGenerate/2) {
    return 2 * t / totalSamplesToGenerate;
  } else {
    return 2 * (totalSamplesToGenerate - t) / totalSamplesToGenerate;
  }
}

main(args);

