var arr = new Uint8ClampedArray(18*3);
var pos = 0;

function getPattern() {
  pos++;
  for (var i=0;i<arr.length;i+=3)
    arr.set(E.HSBtoRGB((i+pos)*0.01,1,1,1),i);
}

function onTimer() {
  getPattern();
  require("neopixel").write(B15, arr);
}

setInterval(onTimer, 50);
