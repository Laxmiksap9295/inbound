jQuery.sap.declare("ZGT_MM_INBOUND.Util.Formatter");
sap.ui.define([], function() {
	"use strict";
	return {
// ZGT_MM_INBOUND.Util.Formatter = {
		Date: function(value) {
			if (value != undefined) {
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd.MM.yyyy"
				});
				return dateFormat.format(value);
			} else {
				return value;
			}
		},
		Time: function(value) {
			if (value != undefined) {
				var ms = value % 1000;
				value = (value - ms) / 1000;
				var secs = value % 60;
				value = (value - secs) / 60;
				var mins = value % 60;
				var hrs = (value - mins) / 60;
				if (hrs < 10) {
					hrs = "0" + hrs;
				}
				if (mins < 10) {
					mins = "0" + mins;
				}
				if (secs < 10) {
					secs = "0" + secs;
				}
				return hrs + ":" + mins + ":" + secs;
			} else {
				return value;
			}
		},
		PO: function(value1, value2) {
			if (value1 !== "") {
				return value1;
			} else if (value2 !== "") {
				return value2;
			} else {
				return "";
			}
		},
		PODelivery: function(value1, value2) {
			if (value1 != undefined && value1 != null && value1 != "") {
				return value1;
			} else if (value2 != undefined && value2 != null && value2 != "") {
				return value2;
			}
		},
		PoItem: function(value1, value2, value3, value4) {
			if (value1 !== "") {
				return value3;
			} else if (value2 !== "") {
				return value4;
			}
		},
		LeadingZero: function(value) {
			// if (value) {
			// 	return +value;
			// } else {
			// 	return value;
			// }

			if (!isNaN(value)) {
				value = +value;
				if (value == 0) {
					return '';
				} else {
					return value;
				}
			} else {
				return value;
			}

		},
		BatchEnable: function(value) {
			if (value == "" || value == undefined) {
				return true;
			} else {
				return false;
			}
		},
		Icon: function(value) {
			return jQuery.sap.getModulePath("ZGT_MM_INBOUND", "/images/camera.png");
		},
		ListDisplay: function(value1, value2, value3) {
			if (value1 !== undefined && value1 !== "" && value1 !== null) {
				return value1;
			} else if (value2 !== undefined && value2 !== "" && value2 !== null) {
				return value2;
			} else if (value3 !== undefined && value3 !== "" && value3 !== null) {
				return +value3;
			}
		},
		GateEnable: function(value1, value2) {
			if ((value1 !== "" && value1 !== undefined) || (value2 !== "" && value2 !== undefined)) {
				return false;
			} else {
				return true;
			}
		},

		onGetBagQty: function(oVal1, oVal2) {
			var noOfBags = parseFloat(oVal1) / parseFloat(oVal2);
			if (Number.isInteger(noOfBags)) {
				noOfBags = noOfBags;
			} else {
				noOfBags = parseInt(noOfBags + 1);
			}
			return noOfBags;
		},

		fnTokenVisibility: function(vValue) {
			if (this.OriginIvc === "E") {
				return true;
			} else {
				return false;
			}
		},

		fnNonCFM: function(oVal1) {
			if (oVal1) {
				if (this.getView().getModel("oDisplayModel") && this.getView().getModel("POST")) {
					if (this.getView().getModel("oDisplayModel").getData().EvOrigin === "H" && this.getView().getModel("POST").getData().Wtype === "07") {
						return false;
					} else {
						return true;
					}
				} else {
					return true;
				}
			}
			return false;
		},

		fnCFM: function(oVal1) {
			if (oVal1) {
				if (this.getView().getModel("oDisplayModel")) {
					if (this.getView().getModel("oDisplayModel").getData().EvOrigin === "H") {
						if (this.getView().getModel("POST").getData().Wtype === "07") {
							return true;
						} else {
							return false;
						}
					} else {
						return false;
					}
				} else {
					return false;
				}
			}
			return false;
		},

		fnPrVisible: function(val) {
			// if (val === "F" || val === "I") {
			if (val === "F") {
				return true;
			}
			return false;
		},

		fnPrVisibleTorn: function(val) {
			if (val === "F" || val === "I") {
				return true;
			}
			return false;
		},

		fnHatchVisible: function(val) {
			if (val === "I") {
				return true;
			}
			return false;
		},
		fnLeadZero:function(value){
			return parseInt(value);
		},
	wbdateFormat: function(value) {
		if (value != undefined) {
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd",
				UTC: true
			});
			//	var value = dateFormat.format(value);
			return value + "T00:00:00";
		} else {
			return value;
		}
	}
		
	};
});