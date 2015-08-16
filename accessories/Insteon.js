var types = require("HAP-NodeJS/accessories/types.js");
var request = require("request");

function delay(ms) {
   // ms += new Date().getTime();
   // while (new Date() < ms){}
}

function Insteon(log, config) {
  this.log = log;
  this.host = config["host"];
  this.port = config["port"];
  this.user = config["username"];
  this.pass = config["password"];
  this.name = config["name"];
  this.deviceID = config["device_id"];
  this.canDim = config["can_dim"];
  this.deviceType = config["deviceType"]
}

Insteon.prototype = {

  setPowerState: function(powerOn) {

    var binaryState = powerOn ? "on" : "off";
    var that = this;
    var onOffState = powerOn ? "ff" : "00";
    var command = "0F11"

    if (this.deviceType == "garage") {
      onOffState = "ff"
      command = "0F12"
    }
    
    var myURL = "http://"+this.user + ":" + this.pass + "@" + this.host + ":" + this.port + "/" +"3?0262" + this.deviceID + command + onOffState+ "=I=3";
    this.log(myURL);

    this.log("Setting power state of " + this.deviceID + " to " + powerOn);
    delay(500);
    request.get({
      url: "http://"+this.user + ":" + this.pass + "@" + this.host + ":" + this.port + "/" +"3?0262" + this.deviceID + command + onOffState+ "=I=3",
    }, function(err, response, body) {

      if (!err && response.statusCode == 200) {
        that.log("State change complete.");
      }
      else {
        that.log("Error '"+err+"' setting power state: " + body);
      }
    });
  },

  setBrightnessLevel: function(value) {

    var that = this;

    levelInt = parseInt(value)*255/100;
    var intvalue = Math.ceil( levelInt ); 
    var hexString2 = ("0" + intvalue.toString(16)).substr(-2); 

   var myURL = "http://"+this.user + ":" + this.pass + "@" + this.host + ":" + this.port + "/" +"3?0262" + this.deviceID + "0F11" + hexString2+ "=I=3";
    this.log(myURL);
    this.log("Setting brightness level of " + this.deviceID + " to " + hexString2);
    delay(500);
    request.get({
      url: "http://"+this.user + ":" + this.pass + "@" + this.host + ":" + this.port + "/" +"3?0262" + this.deviceID + "0F11" + hexString2+ "=I=3",
    }, function(err, response, body) {

      if (!err && response.statusCode == 200) {
        that.log("State change complete.");
      }
      else {
        that.log("Error '"+err+"' setting brightness level: " + body);
      }
    });
  },

  getServices: function() {
    var that = this;
    var myType = types.LIGHTBULB_STYPE;

    if (this.deviceType == "lightBulb") {
      myType = types.LIGHTBULB_STYPE;
    }
    if (this.deviceType == "fan") {
      myType = types.FAN_STYPE;
    }
    if (this.deviceType == "switch") {
      myType = types.SWITCH_STYPE;
    }
    if (this.deviceType == "garage") {
      myType = types.SWITCH_STYPE;
    }

    var services = [{
      sType: types.ACCESSORY_INFORMATION_STYPE,
      characteristics: [{
        cType: types.NAME_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: this.name,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Name of the accessory",
        designedMaxLength: 255
      },{
        cType: types.MANUFACTURER_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "Insteon",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Manufacturer",
        designedMaxLength: 255
      },{
        cType: types.MODEL_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "Rev-1",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Model",
        designedMaxLength: 255
      },{
        cType: types.SERIAL_NUMBER_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "A1S2NASF88EW",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "SN",
        designedMaxLength: 255
      },{
        cType: types.IDENTIFY_CTYPE,
        onUpdate: null,
        perms: ["pw"],
        format: "bool",
        initialValue: false,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Identify Accessory",
        designedMaxLength: 1
      }]
    },{
      sType: myType,
      characteristics: [{
        cType: types.NAME_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: this.name,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Name of service",
        designedMaxLength: 255
      },{
        cType: types.POWER_STATE_CTYPE,
        onUpdate: function(value) { that.setPowerState(value); },
        perms: ["pw","pr","ev"],
        format: "bool",
        initialValue: false,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Change the power state of a Variable",
        designedMaxLength: 1
      }]
    }];
    if (that.canDim) {
      services[1].characteristics.push({
        cType: types.BRIGHTNESS_CTYPE,
        onUpdate: function(value) { that.setBrightnessLevel(value); },
        perms: ["pw","pr","ev"],
        format: "int",
        initialValue: 0,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Adjust Brightness of Light",
        designedMinValue: 0,
        designedMaxValue: 100,
        designedMinStep: 1,
        unit: "%"
      });
    }
    if (that.deviceType == "garage") {
      services[1].characteristics.push({
        cType: types.TARGET_DOORSTATE_CTYPE,
        onUpdate: function(value) { that.setPowerState(value); },
        perms: ["pr","pw","ev"],
        format: "int",
        initialValue: 0,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "BlaBla",
        designedMinValue: 0,
        designedMaxValue: 1,
        designedMinStep: 1,
        designedMaxLength: 1
      });
    }
    return services;
  }
};

module.exports.accessory = Insteon;
