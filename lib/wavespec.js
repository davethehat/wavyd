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


function Wavespec(partialWeightsAndPhases) {
  this.partialWeightsAndPhases = partialWeightsAndPhases;
}

Wavespec.prototype = {
  sampleAtTime: function(sampleTime) {
    var sample = this.partialWeightsAndPhases
      .map(function (partialWeightAndPhase, partialIndex) {
        var weight = partialWeightAndPhase[0];
        var phase = (partialWeightAndPhase[1] || 0) / (partialIndex + 1);
        var t = (partialIndex + 1) * sampleTime + phase;
        return weight * Math.sin(t);
      })
      .reduce(function (accum, val) {
        return accum + val
      }, 0);
    return sample / this.partialWeightsAndPhases.length;
  }
};

Wavespec.fromString = function (specString) {
  var partialWeightsAndPhases = specString
    .split(/[, ]+/)
    .map(function (pair) {
      var elems = pair.split(':');
      var weight = parseFloat(elems[0]);
      var phase = elems[1] === 'PI' ? Math.PI : parseFloat(elems[1]);
      if (elems[1].indexOf('PI') > 0) phase = phase * Math.PI;
      return [weight, phase];
    });
  return new Wavespec(partialWeightsAndPhases);
};

module.exports = Wavespec;