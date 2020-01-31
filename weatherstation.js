// from https://github.com/gfwilliams/workshop-thingy52/blob/f63b3e5874e4029cc858edebdb80ad92e1ce2017/step2.md

// Receiver (Pixl.js)
function scan() {
  NRF.requestDevice({filters:[{name:"ENV"}]}).then(device => {
    // Sanity checks
    if (!device.serviceData ||
        !device.serviceData["2a6e"] ||
        !device.serviceData["2a6f"]) {
      console.log("Corrupt advertising data");
      console.log(device);
      return;
    }
    // decode into an object
    var hum = {
      temperature : (new Uint16Array(device.serviceData["2a6e"]))[0]/100,
      humidity : (new Uint16Array(device.serviceData["2a6f"]))[0]/100
    };
    // display what we got
    g.clear();
    g.setFontVector(20);
    g.drawString(hum.temperature, 20,8);
    g.drawString(hum.humidity, 20,40);
    g.setFontBitmap();
    g.drawString("Temperature ('C)", 0,0);
    g.drawString("Humidity (%)", 0,32);
    g.flip();
  }).catch(err => {
    // There was a problem - we don't care as we expect it sometimes...
  });
}

setInterval(scan, 10000);
scan();

// Sender (Thingy:52)
// Get humidity/temp readings from the Thingy
Thingy.onHumidity(function(hum) {
  // Bluetooth spec says data is 16 bits, 0.01/unit - so x100
  var t = Math.round(hum.temperature*100);
  var h = Math.round(hum.humidity*100);
  // Set advertising data and name
  NRF.setAdvertising({
    0x2A6E : [t&255,t>>8],
    0x2A6F : [h&255,h>>8],
  },{
    name:"ENV",       // change the name
    connectable:false // don't allow anyone to connect
  });
});

function onInit() {
  NRF.setTxPower(4); // Highest transmit power
}
