var oThat;
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/BusyDialog",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter"
], function(Controller, MessageBox, BusyDialog, JSONModel, Filter) {
	"use strict";

	return Controller.extend("ZGT_MM_INBOUND.controller.Inbound", {

		onInit: function() {
			oThat = this;
			oThat.oView = this.getView();
			oThat.BusyDialog = new BusyDialog();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("Inbound").attachMatched(this._onRouteMatched, this);
			// oThat.oModel	= oThat.getOwnerComponent().getModel();

		},
		//======================================================================================//
		//========================= Router matched handler function ===========================//
		//====================================================================================//
		_onRouteMatched: function(oEvent) {
			oThat = this;
			oThat.oView = oThat.getView();
			oThat.oModel = oThat.getOwnerComponent().getModel();
			var filter = [
				new Filter("Direction", sap.ui.model.FilterOperator.EQ, "X")
			];
			oThat.Service = 'DIRECTION';
			oThat.onCallService(oThat.Service, filter);
		},
		//====================================================================================//
		//==================== Call Service =================================================//
		//===================================================================================//
		onCallService: function(service, Data) {
			if (oThat.Service === 'DIRECTION') {
				oThat.BusyDialog.open();
				oThat.oModel.read("/F4ParametersSet", {
					filters: Data,
					urlParameters: {
						$expand: "F4DirectionNav,F4ProcessNav,F4PlantNav,F4TransporterNav,F4VehTypeNav"
					},
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service === 'ACTIVITY') {
				oThat.BusyDialog.open();
				oThat.oModel.read("/F4ActivitysSet", {
					filters: Data,
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			}

		},
		//===================================================================================//
		//============================= Success =============================================//
		//==================================================================================//
		mySuccessHandler: function(oData, oResponse) {
			oThat.BusyDialog.close();
			if (oThat.Service === 'DIRECTION') {
				oThat.EvVehGateEntry = oData.results[0].EvVehGateEntry;
				oThat.oView.setModel(new JSONModel(oData), "DIRECT");
				// if(oData.results[0].F4DirectionNav != null){
				if (oData.results[0].F4DirectionNav.results.length != 0) {
					oThat.Service = 'ACTIVITY';
					var filter = [
						new Filter("Direction", sap.ui.model.FilterOperator.EQ, oData.results[0].F4DirectionNav.results[0].DomvalueL),
						new Filter("Langu", sap.ui.model.FilterOperator.EQ, "EN")
						// new Filter("Langu", sap.ui.model.FilterOperator.EQ, sap.ushell.Container.getUser().getLanguage())
					];
					oThat.onCallService(oThat.Service, filter);
				}
				// }

			} else if (oThat.Service === 'ACTIVITY') {
				oThat.oView.setModel(new JSONModel(oData), 'ACT');
				oThat.oView.getModel("ACT").refresh(true);
				// if(oData.results.length != 0)
			}
		},
		//===================================================================================//
		//=========================== Error ================================================//
		//=================================================================================//
		myErrorHandler: function(response) {
			oThat.BusyDialog.close();
			var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("Title21");
			MessageBox.show(response.responseText, MessageBox.Icon.ERROR, vError);
		},

		//======================= Select tab bar =========================================//
		onSelectTabBar: function(oEvent) {
			if (oEvent.getSource().getSelectedKey() == "IN") {
				if (!(oThat.oView.getModel('ACT'))) {
					var filter = [
						new Filter("Direction", sap.ui.model.FilterOperator.EQ, "IN")
					];
					oThat.onCallService('ACTIVITY', filter);
				}

			} else if (oEvent.getSource().getSelectedKey() == "OUT") {
				try {
					var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
					var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
						target: {
							semanticObject: "zgtca_load_cnfm_SO",
							action: "approve"
						}
					})) || "";
					var url = window.location.href.split('#')[0] + hash;
					sap.m.URLHelper.redirect(url, false);
				} catch (oError) {
					MessageBox.error(oError.message);
				}
			}
		},
		//======================== Create List ===========================================//

		//===================================================================================//
		//========================= on click on Master list item Inbound ====================//
		//==================================================================================//
		fnProcessPress: function(oEvent) {
			var oThat = this;

			if (oEvent.getSource().getBindingContext("ACT").getObject().Descn === "ENTRY") {
				oThat.oRouter.navTo("GateEntry", {
					EvVehGateEntry: oThat.EvVehGateEntry
				});
			} else if (oEvent.getSource().getBindingContext("ACT").getObject().Descn === "PROAS") {
				oThat.oRouter.navTo("VehicleAssignment");
			} else if (oEvent.getSource().getBindingContext("ACT").getObject().Descn === "PRECK") {
				oThat.oRouter.navTo("PreQuality");
			} else if (oEvent.getSource().getBindingContext("ACT").getObject().Descn === "UNCON") {
				oThat.oRouter.navTo("Unloading");
			} else if (oEvent.getSource().getBindingContext("ACT").getObject().Descn === "EXIT") {
				oThat.oRouter.navTo("GateExit");
			} else if (oEvent.getSource().getBindingContext("ACT").getObject().Descn === "STAUP") {
				oThat.oRouter.navTo("Status");
			} else if (oEvent.getSource().getBindingContext("ACT").getObject().Descn === "APPRO") {
				oThat.oRouter.navTo("Approve");

			}
			//Added by Avinash
			else if (oEvent.getSource().getBindingContext("ACT").getObject().Descn === "CHARU") {
				oThat.oRouter.navTo("BatchUpdate");
			}
			//End of Added
			// added by srinivas on 24/09/2025  for truck related tiles
			else if (oEvent.getSource().getBindingContext("ACT").getObject().Descn === "TRUCK") {
				oThat.oRouter.navTo("TruckReporting");
			}
			else if (oEvent.getSource().getBindingContext("ACT").getObject().Descn === "QUEUE") {
				oThat.oRouter.navTo("TruckQueue");
			}
			else if (oEvent.getSource().getBindingContext("ACT").getObject().Descn === "PRE_R") {
				oThat.oRouter.navTo("PreQualityException");
			}
			// ended by srinivas
			else if (oEvent.getSource().getBindingContext("ACT").getObject().Descn === "PROCA") {
				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
					target: {
						semanticObject: "ZGT_MM_PROPOR_SO",
						action: "manage"
					}
				})) || "";
				var url = window.location.href.split('#')[0] + hash;
				sap.m.URLHelper.redirect(url, false);
			} else if (oEvent.getSource().getBindingContext("ACT").getObject().Descn === "GRGI") {
				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
					target: {
						semanticObject: "ZGT_GLOBAL_GRN_SO",
						action: "display"
					}
				})) || "";
				var url = window.location.href.split('#')[0] + hash;
				sap.m.URLHelper.redirect(url, false);
			} else if (oEvent.getSource().getBindingContext("ACT").getObject().Descn === "QALAB") {
				oThat.oRouter.navTo("EwayBill");
			}	else if (oEvent.getSource().getBindingContext("ACT").getObject().Descn === "OCRUP") {
				oThat.oRouter.navTo("WBQTYUpdate");
			}
		},

		//===================================================================================//
		//============================ Vehicle Assignment Save =============================//
		//=================================================================================//
		fnPressVASubmit: function(oEvent) {
			var oThat = this;
			oThat.ValueHelp.destroy();
		},
		//===================================================================================//
		//==================================== on Exit =====================================//
		//=================================================================================//
	
		onExit: function() {
			var oThat = this;
			// oThat.LoginFrag.destroy();
			// oThat.ValueHelp.destroy();
		}
	});

});