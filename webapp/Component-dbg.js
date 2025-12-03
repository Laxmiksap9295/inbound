jQuery.sap.require("ZGT_MM_INBOUND.Util.Formatter");
jQuery.sap.require("ZGT_MM_INBOUND.lib.custom");
jQuery.sap.require("ZGT_MM_INBOUND.lib.signature");
jQuery.sap.require("ZGT_MM_INBOUND.model.formatter");
sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"ZGT_MM_INBOUND/model/models",
	"ZGT_MM_INBOUND/Util/Formatter",
	"ZGT_MM_INBOUND/model/formatter",

], function(UIComponent, Device, models, Formatter,formatter) {
	"use strict";

	return UIComponent.extend("ZGT_MM_INBOUND.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.getRouter().initialize();


		 
        },
      
	});
});