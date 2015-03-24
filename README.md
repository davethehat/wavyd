# wavyd
Little harmonic synthesis toy and wavetable generator. Originally written to generate wavetable data for
the awesome [Open.Theremin](http://www.gaudi.ch/OpenTheremin/) project, but then things got a little out of hand...

## installation
```
npm install wavyd
```

## dependencies
All in package.json, except for node-canvas (for png support), which requires an installation of Cairo. Check
[here](https://www.npmjs.com/package/canvas) for more information.

## usage

Arguments (with defaults):

```
--freq    Audio frequency to play (440)
--spec    Spec for wave generation - partials weight and phase (1:0, 0.5:0)
--dur     Audio duration in seconds (3)
--silent  Suppress audio preview of wave
--dump    If given, write wavetable data to stdout (false)
--table   Size (#samples) of wavetable to generate (1024)
--round   If true, round samples in wavetable to integer values (true)
--scale   Scale samples in wavetable by this value (2048)
--plot    If given, generate a graphic representation of waveform: ascii|png (false)
--pn      For png plot, output filename (plot.png)
--pw      For png plot, pixel width of image (640)
--ph      For png plot, pixel height of image (360)
--pm      For png plot, inner margin of image (4)
--preset  If given, a path to a preset/template file
--help    Show this help message (false)
```

Spec argument should be a quoted list of weight:phase pairs w:p
separated by spaces and/or commas, e.g.

```
"1.0, 0.5:0, 0.25:0.2PI"
```

(Note that phases are in radians relative to the current partial, and
that you can use "PI" as a constant in these expressions)

## Preset/template file
A preset/template file has the following form, which should be relatively self-explanatory:

```javascript
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

module.exports = {
  opts: {
    dump:  true,
    table: 1024,
    round: true,
    scale: 2048
  },
  template: template
};
```

Note:

1. The file is a javascript source file, exporting via module.exports a template and a set of options
2. The options overwrite any additional or default options passed to wavyd
3. The template is an array of strings, that will be written to the output with values substituted
4. Any string in the template surrounded by curly braces {} will be substituted (with the braces) by the options field
with that name (e.g. the number of samples in the generated wavetable will be {table})
5. The special value {date} gives an ISO date string with the date and time of generation
6. Any line starting with '*' will be repeated once for every sample generated in the wavetable
7. In these lines, the only template values are {value} and {index}, the sample value and its index
in the wavetable respectively
8. Braces which include a dash followed by a literal value: the literal value will be emitted for all but
the last repetition of the line (to allow for commas between array values, for example, as above)

## etc
The name of the project is a gentle tip-of-the-hat to my old friends Nick and Colin, who
greet me (amongst the many other names by which I'm known) as wavy Davy...
