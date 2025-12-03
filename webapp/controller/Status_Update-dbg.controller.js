var oThat;
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/BusyDialog",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageToast"
], function(Controller, MessageBox, BusyDialog, JSONModel, Filter, MessageToast) {
	"use strict";

	return Controller.extend("ZGT_MM_INBOUND.controller.Status_Update", {
		onInit: function() {
			oThat = this;
			oThat.BusyDialog = new BusyDialog();
			oThat.oView = this.getView();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("Status").attachMatched(this._onRouteMatched, this);
		},
		//======================================================================================//
		//========================= Router matched handler function ===========================//
		//====================================================================================//
		_onRouteMatched: function(oEvent) {
			oThat.BusyDialog = new BusyDialog();
			oThat = this;
			oThat.oView = oThat.getView();
			oThat.Core = sap.ui.getCore();
			oThat.oModel = oThat.getOwnerComponent().getModel();
			oThat.oView.byId("id_InReason").setValue("");
			oThat.oView.byId("id_InVehicleNo").setValue("");
			oThat.oView.byId("id_InWbid").setValue("");
			oThat.oView.byId("id_InDate").setValue("");
			oThat.oView.byId("id_BtnSave").setVisible(false);
		},
		//====================================================================================//
		//==================== Call Service =================================================//
		//===================================================================================//
		onCallService: function(service, Data) {
			oThat.BusyDialog.open();
			if (oThat.Service === 'GET' || oThat.Service === 'CHECK') {
				oThat.oModel.create("/GetHeadersSet", Data, {
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service === 'SAVE') {
				oThat.oModel.create("/PostHeadersSet", Data, {
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			}
		},
		mySuccessHandler: function(oData, oResponse) {
			oThat.BusyDialog.close();
			if (oThat.Service === 'GET') {
				oThat.oView.setModel(new JSONModel(oData), "oStatusModel");
				oThat.oView.getModel("oStatusModel").refresh(true);
				// if(oData.StatusUpdateNav != null){
				if (oData.StatusUpdateNav.results.length != 0) {
					oThat.VehicleNo = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.VehicleNo", oThat);
					oThat.oView.addDependent(oThat.VehicleNo);
					oThat.VehicleNo.open();
				} else {
					oThat.oView.byId("id_InReason").setValue("");
					oThat.oView.byId("id_InVehicleNo").setValue("");
					oThat.oView.byId("id_InWbid").setValue("");
					MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMSg16"));
				}
				// }
			} else if (oThat.Service === 'CHECK') {
				// if(oData.GetReturnNav != null){
				if (oData.GetReturnNav.results.length != 0) {
					var aError = oData.GetReturnNav.results.filter(function(x) {
						if (x.Type == 'E') {
							return x;
						}
					});
					var msg = "";
					if (aError != 0) {
						for (var i = 0; i < aError.length; i++) {
							msg = msg + "\n" + aError[i].Message;
						}
						MessageBox.error(msg);
					}

				}
				// }
				else {
					oThat.oView.byId("id_BtnSave").setVisible(true);
				}
			} else if (oThat.Service === 'SAVE') {
				// if(oData.GetReturnNav != null){
				if (oData.PostReturnNav.results.length != 0) {
					var aError = oData.PostReturnNav.results.filter(function(x) {
						if (x.Type == 'E') {
							return x;
						}
					});
					if (aError != 0) {
						MessageBox.error(aError[0].Message);
					}
					var aSuccess = oData.PostReturnNav.results.filter(function(x) {
						if (x.Type == 'S') {
							return x;
						}
					});
					if (aSuccess != 0) {
						MessageBox.success(aSuccess[0].Message);
						oThat.oView.byId("id_BtnSave").setVisible(false);
						oThat.oView.byId("id_InReason").setValue("");
						oThat.oView.byId("id_InVehicleNo").setValue("");
						oThat.oView.byId("id_InWbid").setValue("");
						oThat.oView.byId("id_InDate").setValue("");
					}
				}
				// }
				else {
					oThat.oView.byId("id_BtnSave").setVisible(false);
					oThat.oView.byId("id_InReason").setValue("");
					oThat.oView.byId("id_InVehicleNo").setValue("");
					oThat.oView.byId("id_InWbid").setValue("");
					oThat.oView.byId("id_InDate").setValue("");
				}
			}
		},
		myErrorHandler: function(oResponse) {
			oThat.BusyDialog.close();
			var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("Title21");
			MessageBox.show(oResponse.responseText, MessageBox.Icon.ERROR, vError);
		},
		onDateChange: function() {
			oThat.onValueHelpPress();
		},
		onValueHelpPress: function(oEvent) {
			var vDate = oThat.oView.byId("id_InDate").getValue();
			if (vDate !== null && vDate !== "") {
				var vDate = oThat.oView.byId("id_InDate").getDateValue();
				var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				var vInDate = vDateFormat.format(vDate);
				oThat.Service = 'GET';
				var oEntity = {
					"d": {
						"GateEntry": "",
						"VehAssign": "",
						"PreQual": "",
						"UnloadConf": "",
						"GateExit": "",
						"Inbound": "X",
						"Outbound": "",
						"IvDelivery": "",
						"IvPo": "",
						"IvWbid": "",
						"IvWerks": "",
						"StatusUpdate": "X",
						"Approval": "",
						"GetReturnNav": [],
						"PoItemNav": [],
						"QualWbidNav": [],
						"WbItemNav": [],
						"WsItemNav": [],
						"WbHeaderNav": [],
						"StatusUpdateNav": [{
							"InDate": vInDate
						}]
					}
				};
				oThat.onCallService(oThat.Service, oEntity);
			} else {
				MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg6"));
			}
		},
		onValueHelpSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter;
			oFilter = new sap.ui.model.Filter([
				new Filter("Vehno", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("Wbid", sap.ui.model.FilterOperator.Contains, sValue)
			]);
			var oFilter2 = new sap.ui.model.Filter(oFilter, false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter2]);
		},
		onValueHelpConfirm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter('selectedItem');
			oThat.oView.byId("id_InVehicleNo").setValue(oSelectedItem.getTitle());
			oThat.oView.byId("id_InWbid").setValue(oSelectedItem.getDescription());
		},
		//============================= Check =============================================//
		onPressCheck: function(oEvent) {
			if (
				oThat.oView.byId("id_InVehicleNo").getValue() === "" ||
				oThat.oView.byId("id_InWbid").getValue() === "" ||
				oThat.oView.byId("id_InDate").getValue() === "" ||
				oThat.oView.byId("id_InDate").getValue() == null) {
				MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg7"));
			} else {
				var vDate = oThat.oView.byId("id_InDate").getDateValue();
				var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				var vInDate = vDateFormat.format(vDate);
				oThat.Service = 'CHECK';
				var oEntity = {
					"d": {
						"GateEntry": "",
						"VehAssign": "",
						"PreQual": "",
						"UnloadConf": "",
						"GateExit": "",
						"Inbound": "X",
						"Outbound": "",
						"IvDelivery": "",
						"IvPo": "",
						"IvWbid": oThat.oView.byId("id_InWbid").getValue(),
						"IvWerks": "",
						"StatusUpdate": "X",
						"Approval": "",
						"GetReturnNav": [],
						"PoItemNav": [],
						"QualWbidNav": [],
						"WbItemNav": [],
						"WsItemNav": [],
						"WbHeaderNav": [],
						"StatusUpdateNav": [{
							"InDate": vInDate,
							"Vehno": oThat.oView.byId("id_InVehicleNo").getValue(),
							"Wbid": oThat.oView.byId("id_InWbid").getValue(),
							"Reason": oThat.oView.byId("id_InReason").getValue()
						}]
					}
				};
				oThat.onCallService(oThat.Service, oEntity);
			}
		},
		//====================================== on click Save ============================//
		onStatusSubmit: function(oEvent) {
			if (oThat.oView.byId("id_InReason").getValue() === "" ||
				oThat.oView.byId("id_InVehicleNo").getValue() === "" ||
				oThat.oView.byId("id_InWbid").getValue() === "" ||
				oThat.oView.byId("id_InDate").getValue() === "" ||
				oThat.oView.byId("id_InDate").getValue() == null) {
				MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg11"));
			} else {
				var vDate = oThat.oView.byId("id_InDate").getDateValue();
				var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				var vInDate = vDateFormat.format(vDate);
				oThat.Service = 'SAVE';
				var oEntity = {
					"d": {
						"GateEntry": "",
						"VehAssign": "",
						"PreQual": "",
						"UnloadConf": "",
						"GateExit": "",
						"Inbound": "X",
						"StatusUpdate": "X",
						"IvWboj": oThat.EvWtype,
						"Outbound": "",
						"PostReturnNav": [],
						"PostWbHeaderNav": [],
						"PostWbitemNav": [],
						"PostWsItemNav": [],
						"PostDmsNav": []
					}
				};
				var oObject = {
					"Vehno": oThat.oView.byId("id_InVehicleNo").getValue(),
					"Wbid": oThat.oView.byId("id_InWbid").getValue(),
					"Erdat": vInDate,
					"Ertim": "PT00H00M00S",
					"Tmode": 'MOBILITY',
					"Direction": "IN",
					"Del": "X",
					"Reason": oThat.oView.byId("id_InReason").getValue()
				};
				oEntity.d.PostWbHeaderNav.push(oObject);
				oThat.onCallService(oThat.Service, oEntity);
			}
		},
		//=================================================================================//
		//====================== Nav back =================================================//
		//=================================================================================//
		onNavBack: function() {
			this.oRouter.navTo("Inbound");
		}

	});

});