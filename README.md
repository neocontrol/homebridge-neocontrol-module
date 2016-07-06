# homebridge-neocontrol-module
Homebridge plugin for Neocontrol Module

# Installation
Follow the instruction in [homebridge](https://www.npmjs.com/package/homebridge) for the
homebridge server installation.
The plugin is published through [NPM](https://www.npmjs.com/package/homebridge-neocontrol-module) and
should be installed "globally" by typing:

    npm install -g homebridge-neocontrol-module

# Configuration
Remember to configure the plugin in config.json in your home directory inside the
.homebridge directory.

Look for a sample config in 
[config.json example](https://github.com/neocontrol/homebridge-neocontrol-module/blob/master/config.json).


Every button, once pressed with an Homekit app or via Siri, will generate an escene trigger
on the Neocontrol Module System.


