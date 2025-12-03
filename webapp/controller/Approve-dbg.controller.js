var oThat;
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/BusyDialog",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter"
], function(Controller, MessageBox, BusyDialog, JSONModel, Filter) {
	"use strict";

	return Controller.extend("ZGT_MM_INBOUND.controller.Approve", {
		onInit: function() {
			oThat = this;
			oThat.BusyDialog = new BusyDialog();
			oThat.oView = this.getView();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("Approve").attachMatched(this._onRouteMatched, this);
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
					"StatusUpdate": "",
					"Approval": "X",
					"GetReturnNav": [],
					"PoItemNav": [],
					"QualWbidNav": [],
					"WbItemNav": [],
					"WsItemNav": [],
					"WbHeaderNav": [],
					"StatusUpdateNav": [],
					"ApprovalNav": []
				}
			};
			oThat.onCallService(oThat.Service, oEntity);

		},
		//====================================================================================//
		//==================== Call Service =================================================//
		//===================================================================================//
		onCallService: function(service, Data) {
			oThat.BusyDialog.open();
			if (oThat.Service === 'GET') {
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
				oThat.oView.setModel(new JSONModel(oData), "oApproveModel");
				oThat.oView.getModel("oApproveModel").refresh(true);
			} else if (oThat.Service === 'SAVE') {
				oThat.Approve.destroy();
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
						"StatusUpdate": "",
						"Approval": "X",
						"GetReturnNav": [],
						"PoItemNav": [],
						"QualWbidNav": [],
						"WbItemNav": [],
						"WsItemNav": [],
						"WbHeaderNav": [],
						"StatusUpdateNav": [],
						"ApprovalNav": []
					}
				};
				oThat.onCallService(oThat.Service, oEntity);
			}
		},
		myErrorHandler: function(oResponse) {
			oThat.BusyDialog.close();
			var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("Title21");
			MessageBox.show(oResponse.responseText, MessageBox.Icon.ERROR, vError);
		},
		onPressListItem: function(oEvent) {
			var vPath = oEvent.getSource().getBindingContextPath();
			var oBject = oThat.oView.getModel("oApproveModel").getObject(vPath);
			oThat.oView.setModel(new JSONModel(oBject), "Approve");
			oThat.oView.getModel("Approve").refresh(true);
			oThat.Approve = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Approve", oThat);
			oThat.oView.addDependent(oThat.Approve);
			oThat.Approve.setEscapeHandler(oThat.onEscapeApprove);
			oThat.Approve.open();

		},
		fnApproveReject: function(oEvent) {
			oThat.vId = oEvent.getSource().getId();
			var vApprovReject = "";
			if (oThat.vId.indexOf("id_BtnApprove") != -1) {
				vApprovReject = "A";
			} else if (oThat.vId.indexOf("id_BtnReject") != -1) {
				vApprovReject = "R";
				if (oThat.oView.getModel("Approve").getData().Reason == "") {
					MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg9"));
					return;
				}
			}
			var oEntity = {
				"d": {
					"GateEntry": "",
					"VehAssign": "",
					"PreQual": "",
					"UnloadConf": "",
					"GateExit": "",
					"Inbound": "X",
					"Approval": "X",
					"IvAction": vApprovReject,
					"IvWboj": oThat.EvWtype,
					"IvWbid": oThat.oView.getModel("Approve").getData().Wbid,
					"Outbound": "",
					"PostReturnNav": [],
					"PostWbHeaderNav": [{
						"Reason": oThat.oView.getModel("Approve").getData().Reason
					}],
					"PostWbitemNav": [],
					"PostWsItemNav": [],
					"PostDmsNav": []
				}
			};
			oThat.Service = "SAVE";
			oThat.onCallService(oThat.Service, oEntity);

		},
		onClickBack: function() {
			oThat.Approve.destroy();
		},
		//================================== Escape Handler ===================================//
		onEscapeApprove: function() {
			oThat.Approve.destroy();
		},
		//=================================================================================//
		//====================== Nav back =================================================//
		//=================================================================================//
		onNavBack: function() {
			this.oRouter.navTo("Inbound");
		}

	});

});