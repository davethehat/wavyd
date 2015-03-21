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

var Readable = require('stream').Readable;
var util = require('util');
var _ = require('lodash');

var MAX_AMPLITUDE = 32760;
var BIT_DEPTH = 16;
var CHANNELS = 2;
var SAMPLE_RATE = 44100;

var defaultWaveGeneratorOpts = {
  bitDepth: BIT_DEPTH,
  channels: CHANNELS,
  sampleRate: SAMPLE_RATE
};

function WaveGenerator(frequency, wavespec, duration, envelope, opts) {
  Readable.call(this);
  this.frequency = frequency;
  this.wavespec = wavespec;
  this.duration = duration;
  this.envelope = typeof envelope === 'number' ? function() { return envelope; } : envelope;
  this.opts = _.defaults({}, defaultWaveGeneratorOpts, opts);

  this.samplesGenerated = 0;
  this.totalSamplesToGenerate = this.opts.sampleRate * this.duration;
  this.sampleSize = this.opts.bitDepth/8;
  this.blockAlign = this.sampleSize * this.opts.channels;
  this.cycleIncrementForSampleRate = (Math.PI * 2 * this.frequency) / this.opts.sampleRate;
}

util.inherits(WaveGenerator, Readable);

//noinspection JSUnusedGlobalSymbols
WaveGenerator.prototype._read = function (n) {
  var numSamples = n / this.blockAlign | 0;
  var buf = new Buffer(numSamples * this.blockAlign);
  var writeSampleToBuffer = buf['writeInt' + this.opts.bitDepth + 'LE'].bind(buf);

  var currentSampleIndex = this.samplesGenerated;

  for (var i = 0; i < numSamples && currentSampleIndex < this.totalSamplesToGenerate; i++) {
    var sampleTime = currentSampleIndex * this.cycleIncrementForSampleRate;
    var scaledAmplitude = this.envelope(currentSampleIndex, this.totalSamplesToGenerate) * MAX_AMPLITUDE;

    var sample = Math.round(this.wavespec.sampleAtTime(sampleTime) * scaledAmplitude);

    for (var channel = 0; channel < this.opts.channels; channel++) {
      var offset = (i * this.sampleSize * this.opts.channels) + (channel * this.sampleSize);
      writeSampleToBuffer(sample, offset);
    }

    currentSampleIndex++;
  }

  this.push(buf.slice(0, i*this.opts.channels * this.sampleSize));

  this.samplesGenerated += numSamples;
  if (this.samplesGenerated >= this.totalSamplesToGenerate) {
    this.samplesGenerated = this.totalSamplesToGenerate;
    this.push(null);
  }
};

module.exports = WaveGenerator;
