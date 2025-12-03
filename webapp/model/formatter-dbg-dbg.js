jQuery.sap.require("sap.ui.core.format.DateFormat");
jQuery.sap.require("sap.ui.core.format.NumberFormat");
jQuery.sap.declare("ZGT_MM_INBOUND.model.formatter");

ZGT_MM_INBOUND.model.formatter = {
	fnVbelnVisible: function(value) {
		if (value === "N/A") {
			return true;
		} else if (value === "" || value === '000000' || value === '00000') {
			return false;
		} else {
			return true;
		}
	},
	fnPosnrVisible: function(value, value1) {
		if (value === "N/A" && value1 === '00000') {
			return true;
		} else {
			return false;
		}
	},
	referenceNoDisplay:function(sValue){
		var res = false;
		if(sValue === "IN - RGP/NRGP" || sValue === "OUT  - RGP/NRGP"){
			res = true;
		}
		return res;
	}
	
};