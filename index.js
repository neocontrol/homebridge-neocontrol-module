// NeocontrolModule Platform plugin for HomeBridge
//
// Remember to add platform to config.json. Example:
// "platforms": [
//             {
//             "platform": "NeocontrolModule",
//             "name": "NeocontrolModule",
//             "makerkey": "PUT KEY OF YOUR MAKER CHANNEL HERE",
//             "accessories": [{
//                     "name": "Accessory 1",
//                     "buttons": [
//                     	{
//                     		"caption": "A1-1",
//                     		"triggerOn": "T1-1On",
//                     		"triggerOff": "T1-1Off"
//                     	},{
//                     		"caption": "A1-2",
//                     		"triggerOn": "T1-2On",
//                     		"triggerOff": "T1-2Off"
//                     	},{
//                     		"caption": "A1-3",
//                     		"trigger": "T1-3"
//                     	},{
//                     		"caption": "A1-4",
//                     		"trigger": "T1-4"
//                     	}
//                     ]
//             	}, {
//                     "name": "Accessory 2",
//                     "buttons": [
//                     	{
//                     		"caption": "A2-1",
//                     		"trigger": "T2-1"
//                     	},{
//                     		"caption": "A2-2",
//                     		"trigger": "T2-2"
//                     	},{
//                     		"caption": "A2-3",
//                     		"trigger": "T2-3"
//                     	},{
//                     		"caption": "A2-4",
//                     		"trigger": "T2-4"
//                     	}
//                     ]
//             	}
//             ]
//         }
// ],
//
// If you specify both "triggerOn" and "triggerOff" values to a button it will generate
// different triggers for the two different status of the switch.
// If you only specify the "trigger" value to a button it behaves like a push button
// generating the trigger after the selection of the button and automatically returning
// to the off status.
//
// When you attempt to add a device, it will ask for a "PIN code".
// The default code for all HomeBridge accessories is 031-45-154.

'use strict';

var Service, Characteristic;
var request = require("request");
var dgram = require('dgram');
var sleep = require('sleep');


function sendIndividual(nome, funcao, subfuncao) {

		var PORT = 8760;
		var HOST = '255.255.255.255';


		var buffer = new Buffer(13);
			buffer[0] = 20;
			buffer[1] = 0;
			buffer[2] = nome[0];
			buffer[3] = nome[1];
			buffer[4] = nome[2];
			buffer[5] = nome[3];
			buffer[6] = nome[4];
			buffer[7] = nome[5];
			buffer[8] = nome[6];
			buffer[9] = nome[7];
			buffer[10] = funcao;
			buffer[11] = subfuncao;
			buffer[12] = 255;

			var message = new Buffer(buffer);



			var client = dgram.createSocket('udp4');

			client.bind( function() { client.setBroadcast(true) } );

			client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
				if (err) throw err;
				console.log('UDP message sent to ' + HOST +':'+ PORT + ' ' + nome + ' ' + funcao + ' ' + subfuncao );
				client.close();
				sleep.usleep(100000);
			});

	}


	function sendCena(nome, funcao) {

			var PORT = 8760;
			var HOST = '255.255.255.255';


			var buffer = new Buffer(4);
				buffer[0] = 2;
				buffer[1] = parseInt((funcao)/240);
				buffer[2] = parseInt((funcao)%240);
				buffer[3] = 255;


				var message = new Buffer(buffer);



				var client = dgram.createSocket('udp4');

				client.bind( function() { client.setBroadcast(true) } );

				client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
					if (err) throw err;
					console.log('UDP message sent to ' + HOST +':'+ PORT + ' ' + nome + ' ' + funcao + ' ' + subfuncao );
					client.close();
					sleep.usleep(100000);
				});

		}


function NeocontrolModulePlatform(log, config){
  	this.log          = log;
  	this.makerkey     = config["makerkey"];
  	this.NeocontrolModuleaccessories = config["accessories"];
}

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerPlatform("homebridge-neocontrol-module", "NeocontrolModule", NeocontrolModulePlatform);
}

NeocontrolModulePlatform.prototype = {
  accessories: function(callback) {
      this.log("Loading accessories...");

      var that = this;
      var foundAccessories = [];
      if (this.NeocontrolModuleaccessories == null || this.NeocontrolModuleaccessories.length == 0) {
      	callback(foundAccessories);
      	return;
      }

	  this.NeocontrolModuleaccessories.map(function(s) {

		that.log("Found: " + s.name);
			var accessory = null;

			if (s.cenas.length != 0) {
				var services = [];

					for (var b = 0; b < s.cenas.length; b++) {
						var service = {
							controlService: new Service.Switch(s.cenas[b].cena_nome),
							characteristics: [Characteristic.On]
						};

          //  sendCena(s.cenas[b].cena_nome, s.cenas[b].cena_numero);

						if (s.cenas[b].cena_nome != null)
							service.controlService.subtype = "Cena " + s.cenas[b].cena_numero;

						service.controlService.trigger = s.cenas[b].cena_numero;
		     		that.log("Cena: " + service.controlService.displayName + ", subtype: " + service.controlService.subtype);
						services.push(service);
					}

				accessory = new NeocontrolModuleAccessory(services);
			}


			if (accessory != null) {

				accessory.getServices = function() {
						return that.getServices(accessory);
				};
				accessory.platform 			= that;
				accessory.remoteAccessory	= s;
				accessory.name				= s.name;
				accessory.model				= "NeocontrolModule";
				accessory.manufacturer		= "Neocontrol";
				accessory.serialNumber		= "<unknown>";
				foundAccessories.push(accessory);

			}


		}
	  )
      callback(foundAccessories);
  },
  command: function(c, value, that) {

		//sendCena(value, c);
  },
  getInformationService: function(homebridgeAccessory) {
    var informationService = new Service.AccessoryInformation();
    informationService
                .setCharacteristic(Characteristic.Name, homebridgeAccessory.name)
				.setCharacteristic(Characteristic.Manufacturer, homebridgeAccessory.manufacturer)
			    .setCharacteristic(Characteristic.Model, homebridgeAccessory.model)
			    .setCharacteristic(Characteristic.SerialNumber, homebridgeAccessory.serialNumber);
  	return informationService;
  },
  bindCharacteristicEvents: function(characteristic, service, homebridgeAccessory) {
  	var onOff = characteristic.props.format == "bool" ? true : false;
    	characteristic
		.on('set', function(value, callback, context) {
						if(context !== 'fromSetValue') {
							var trigger = null;
							if (service.controlService.trigger != null)
								trigger = service.controlService.trigger;

							homebridgeAccessory.platform.command(trigger, service.controlService.displayName, homebridgeAccessory);

							if (service.controlService.trigger != null) {
								// In order to behave like a push button reset the status to off
								setTimeout( function(){
									characteristic.setValue(false, undefined, 'fromSetValue');
								}, 100 );
							}
						}
						callback();
				   }.bind(this) );
    characteristic
        .on('get', function(callback) {
						// a push button is normally off
						callback(undefined, false);
                   }.bind(this) );
  },
  getServices: function(homebridgeAccessory) {
  	var services = [];
  	var informationService = homebridgeAccessory.platform.getInformationService(homebridgeAccessory);
  	services.push(informationService);
  	for (var s = 0; s < homebridgeAccessory.services.length; s++) {
		var service = homebridgeAccessory.services[s];
		for (var i=0; i < service.characteristics.length; i++) {
			var characteristic = service.controlService.getCharacteristic(service.characteristics[i]);
			if (characteristic == undefined)
				characteristic = service.controlService.addCharacteristic(service.characteristics[i]);
			homebridgeAccessory.platform.bindCharacteristicEvents(characteristic, service, homebridgeAccessory);
		}
		services.push(service.controlService);
    }
    return services;
  }
}

function NeocontrolModuleAccessory(services) {
    this.services = services;
}
