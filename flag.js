// Code for flag (MDBT42)
var s = require("servo").connect(D14);
s.move(1,3000); // move to position 0 over 3 seconds

var timeout;
function flag() {
  if (timeout) clearTimeout();
  s.move(0.2,2000);
  timeout = setTimeout(function() {
    timeout = undefined;
    s.move(1,2000);
  },2000);
}

setWatch(flag, BTN, {repeat:true});

NRF.setServices({
  "3e440001-f5bb-357d-719d-179272e4d4d9": {
    "3e440002-f5bb-357d-719d-179272e4d4d9": {
      value : [0],
      maxLen : 1,
      writable : true,
      onWrite : function(evt) {
        flag();
      }
    }
  }
}, { uart : false });
NRF.setAdvertising({}, {name:"Flag"});


 // Code for button (Puck.js)
 var busy = false;

var lastTry = getTime();

function flag() {
  if (busy && lastTry+5<getTime()) busy=false;
   lastTry = getTime();

  if (busy) {
    digitalPulse(LED1,1,[10,200,10,200,10]);
    return;
  }
  busy = true;
  var gatt;
  NRF.requestDevice({ filters: [{ name: 'Flag' }] })
  .then(function(device) {
    console.log("Found");
    digitalPulse(LED2,1,10);
    return device.gatt.connect();
  }).then(function(g) {
    console.log("Connected");
    digitalPulse(LED3,1,10);
    gatt = g;
    return gatt.getPrimaryService(
        "3e440001-f5bb-357d-719d-179272e4d4d9");
  }).then(function(service) {
    return service.getCharacteristic(
        "3e440002-f5bb-357d-719d-179272e4d4d9");
  }).then(function(characteristic) {
    return characteristic.writeValue(1);
  }).then(function() {
    digitalPulse(LED2,1,[10,200,10,200,10]);
    gatt.disconnect();
    console.log("Done!");
    busy=false;
  }).catch(function(e) {
    digitalPulse(LED1,1,10);
    console.log("ERROR",e);
    busy=false;
    gatt.disconnect();
  });
}

setWatch(flag, BTN, {repeat:true});

NRF.setServices({}, { uart : false });
NRF.setAdvertising({}, {showName:false, connectable:false, discoverable:false});

// or using a module:

function flag() {
  NRF.requestDevice({ filters: [{ namePrefix: 'MDBT42Q' }]
                    }).then(function(device) {
    require("ble_simple_uart").write(
          device,
          "flag()\n",
          function() {
            print('Done!');
          });
  });
}

setWatch(flag, BTN, {repeat:true});
