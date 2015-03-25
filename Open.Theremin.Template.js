var template = [
"/*===========================================",
"Wavetable for Open.Theremin",
"Generated at {date} by wavyd",
"Parameters(partial weights/phases)",
"",
"{spec}",
"============================================*/",
"",
"#include <avr/pgmspace.h>",
"",
"const int16_t wave_table[{table}] PROGMEM = {\\",
"*{value}{-,}",
"}"
];

// 12-bit DAC in Open.Theremin accepts values -2048 ... 2047, hence the scale
module.exports = {
  opts: {
    dump:  true,
    table: 1024,
    round: true,
    scale: 2047
  },
  template: template
};

