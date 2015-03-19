
/**
 * Code adapted from:
 * http://blogs.msdn.com/b/dawate/archive/2009/06/24/intro-to-audio-programming-part-3-synthesizing-simple-wave-audio-using-c.aspx
 */

var Readable = require('stream').Readable;
var Speaker = require('speaker');

var freq = 441.0;
var duration = 2.0;
var MAX_AMPLITUDE = 32760;

var spec = process.argv[2];
if (!spec) {
  spec = "1:0,0.5:0";
}
var dumpTable = process.argv[3] || false;

var partialsAndPhases = spec
                  .split(',')
                  .map(function(pair) {
                    var elems = pair.split(':');
                    var weight = parseFloat(elems[0]);
                    var phase = elems[1] === 'PI' ? Math.PI : parseFloat(elems[1]);
                    if (elems[1].indexOf('PI') > 0) phase = phase * Math.PI;
                    return [weight, phase];
                  });

console.log('generating a %dhz wave for %d seconds', freq, duration);
console.log(partialsAndPhases);

main(freq, duration, partialsAndPhases);

function main(freq, duration, partialsAndPhases) {
  var sine = new Readable();
  sine.bitDepth = 16;
  sine.channels = 2;
  sine.freq = freq;
  sine.sampleRate = 44100;
  sine.samplesGenerated = 0;
  sine.totalSamplesToGenerate = sine.sampleRate * duration;
  sine.sampleSize = sine.bitDepth / 8;
  sine.blockAlign = sine.sampleSize * sine.channels;
  sine.cycleIncrementForSampleRate = (Math.PI * 2 * sine.freq) / sine.sampleRate;
  sine.partialsAndPhases = partialsAndPhases;

  sine._read = read;

  sine.pipe(new Speaker());

  if (dumpTable) {
    dump(partialsAndPhases);
  }
};

function dump(partialsAndPhases) {
  function f(t) {
     var val = partialsAndPhases
                .map(function(value, index) {
                  var w = value[0];
                  var p = (value[1] || 0);
                  return value[0] * Math.sin((index + 1) * t + p);
                })
                .reduce(function(accum, value) {return accum + value}, 0);
    return val;
  }

  var samples = [];
  var max = 0;
  var min = 0;
  for (var i = 0; i < 1024; i++) {
    var v = f(i * (2*Math.PI/1024));
    samples.push(v);
    max = Math.max(max, v);
    min = Math.min(min, v);
  }

  console.log(max, min);
  max = Math.max(max, -min);

  samples = samples.map(function(s) {
    return Math.round(2048 * (s/max));
  });

  var sep = line(126,'=').join('');
  console.log('/*' + sep);
  console.log('Generated wavetable');
  console.log('Harmonic, weight, phase');
  partialsAndPhases.forEach(function (pp,index) {
    console.log("%d %s %s", index, pp[0].toFixed(4), pp[1].toFixed(5));
  });
  console.log(sep + '==');
  plot(samples);
  console.log(sep + '*/\n\n');

  console.log('const int16_t wave_table_X[1024] PROGMEM = {\\');
  console.log(samples.join(',\\\n'));
  console.log('}');
}

function plot(samples) {
  var canvas = [];
  for (var i = 0; i < 33; i++) {
    canvas.push(line(128, i === 16 ? '-' : ' '));
  }
  for (var j = 0; j < 1024; j+=8) {
    var scaled = 16 + Math.round(samples[j]/128);
    canvas[32-scaled][j/8] = '*';
  }
  canvas.forEach(function(l) {
    console.log(l.join(''));
  });
}

function line(len, char) {
  var ret = [];
  while(len--) {
    ret.push(char);
  }
  return ret;
}

function envelope(t, totalSamplesToGenerate) {
  if ( t < totalSamplesToGenerate/2) {
    return 2 * t / totalSamplesToGenerate;
  } else {
    return 2 * (totalSamplesToGenerate - t) / totalSamplesToGenerate;
  }
}


function read (n) {
  var numSamples = n / this.blockAlign | 0;
  var buf = new Buffer(numSamples * this.blockAlign);
  var writeSampleToBuffer = buf['writeInt' + this.bitDepth + 'LE'].bind(buf);

  for (var i = 0; i < numSamples; i++) {

    var currentSampleIndex = this.samplesGenerated + i;
    var scaledAmplitude = envelope(currentSampleIndex, this.totalSamplesToGenerate) * MAX_AMPLITUDE;

    for (var channel = 0; channel < this.channels; channel++) {

      var offset = (i * this.sampleSize * this.channels) + (channel * this.sampleSize);
      var sample = this.partialsAndPhases
                  .map(function(partialWeightAndPhase, partialIndex) {
                    var w = partialWeightAndPhase[0];
                    var p = (partialWeightAndPhase[1] || 0);
                    var t = (partialIndex + 1) * currentSampleIndex * this.cycleIncrementForSampleRate;
                    return w * Math.sin(t + p);
                  }.bind(this))
                  .reduce(function(accum, val) {return accum + val}, 0);

      sample = Math.round(scaledAmplitude * (sample / this.partialsAndPhases.length));

      writeSampleToBuffer(sample, offset);
    }
  }

  this.push(buf);

  this.samplesGenerated += numSamples;
  if (this.samplesGenerated >= this.totalSamplesToGenerate) {
    this.push(null);
  }
}
