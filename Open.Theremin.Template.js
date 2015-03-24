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
"*{value},",
"}"
];

module.exports = {
  opts: {
    dump:  true,
    table: 1024,
    round: true,
    scale: 2048
  },
  template: template
};

