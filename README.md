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
--freq  Audio frequency to play (440)
--spec  Spec for wave generation - partials weight and phase (1:0, 0.5:0)
--dur   Audio duration in seconds (3)
--dump  If given, write wavetable data to stdout (false)
--table Size (#samples) of wavetable to generate (1024)
--round If true, round samples in wavetable to integer values (true)
--scale Scale samples in wavetable by this value (2048)
--plot  If given, generate a graphic representation of waveform: ascii|png (false)
--pn    For png plot, output filename (plot.png)
--pw    For png plot, pixel width of image (640)
--ph    For png plot, pixel height of image (360)
--pm    For png plot, inner margin of image (4)
--help  Show this help message (false)
```

Spec argument should be a quoted list of weight:phase pairs w:p
separated by spaces and/or commas, e.g.

```
"1.0, 0.5:0, 0.25:0.2PI"
```

(Note that phases are in radians relative to the current partial, and
that you can use "PI" as a constant in these expressions)

## etc
The name of the project is a gentle tip-of-the-hat to my old friends Nick and Colin, who
greet me (amongst the many other names by which I'm known) as wavy Davy...