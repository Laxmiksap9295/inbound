sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/BusyDialog",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"ZGT_MM_INBOUND/Util/Formatter",
	"sap/ui/model/FilterOperator"
], function(Controller, MessageBox, BusyDialog, JSONModel, Filter, MessageToast, Formatter, FilterOperator) {
	"use strict";

	return Controller.extend("ZGT_MM_INBOUND.controller.WBQTY_Update", {
		Formatter: Formatter,
		onInit: function() {
			var that = this;
			that.BusyDialog = new BusyDialog();
			that.oView = this.getView();
			that.oView.setModel(new JSONModel({
				cdate: new Date(),
				weighBridge: "",
				uGrossWeight: "",
				uTareweight: "",
				uNetWeight: "",
				wbfDate: new Date(new Date() - (2 * 86400000)),
				wbtDate: new Date()

			}), "oWBModel"); //Added by Avinash
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("WBQTYUpdate").attachMatched(this._onRouteMatched, this);
		},
		//======================================================================================//
		//========================= Router matched handler function ===========================//
		//====================================================================================//
		_onRouteMatched: function(oEvent) {
			this.resourceText = this.getView().getModel("i18n").getResourceBundle();
		},

		onvalidateNumber: function(oEvent) {
			if (oEvent) {
				var val = oEvent.getSource().getValue();
				val.match(/^\d+(\.\d+)?$/);
				oEvent.getSource().setValue(val);
			}
			this.CalculateNetweight();
		},
		CalculateNetweight: function() {
			var nWeight, oViewModel = this.getView().getModel("oWBModel"),
				gweihght = oViewModel.getProperty("/uGrossWeight"),
				tweight = oViewModel.getProperty("/uTareweight");

			nWeight = parseFloat(gweihght) - parseFloat(tweight);
			oViewModel.setProperty("/uNetWeight", nWeight.toFixed(3));

		},
		onResetPage: function() {
			var oViewModel = this.getView().getModel("oWBModel");
			oViewModel.setProperty("/weighBridge", "");
			oViewModel.setProperty("/uGrossWeight", "");
			oViewModel.setProperty("/uTareweight", "");
			oViewModel.setProperty("/uNetWeight", "");
			oViewModel.setProperty("/aWB_Data", "");
			oViewModel.setProperty("/wbfDate", new Date(new Date() - (2 * 86400000)));
			oViewModel.setProperty("/wbtDate", new Date());

		},
		onNavBack: function() {
			this.onResetPage();
			this.oRouter.navTo("Inbound");
		},

		_GetBatchCalls: function(Entity, FilterParms, ExpandParms, aRefType) {
			var that = this,
				oModel1 = this.getOwnerComponent().getModel();
			var oViewModel = this.getView().getModel("oWBModel");
			sap.ui.core.BusyIndicator.show();
			oModel1.read(Entity, {
				filters: FilterParms,
				urlParameters: {
					$expand: ExpandParms
				},
				async: true,
				success: function(oData, Iresponse) {
					var responseData = oData.results[0];
					if (aRefType === "GETWeigh") {
						if (that.first) {
							try {
								that.fragment = undefined;
								if (!that.fragment) {
									that.fragment = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.OCR_WBList", that);
									that.oView.addDependent(that.fragment);
								}
								that.fragment.open();
							} catch (e) {
								console.log(e);
							}
						}
						oViewModel.setProperty("/f4weighBridge", responseData.WbidF4Nav.results);
					} else if (aRefType === "Head_Detail") {
						if (responseData.ReturnNav.results.length > 0 && responseData.ReturnNav.results[0].Type === "W") {
							sap.m.MessageBox.warning(responseData.ReturnNav.results[0].Message, {
								actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
								emphasizedAction: sap.m.MessageBox.Action.OK,
								onClose: function(sAction) {
									if (sAction === "YES") {
										oViewModel.setProperty("/aWB_Data", responseData.HeaderNav.results[0]);
										oViewModel.setProperty("/aItemNavData", responseData.ItemNav.results[0]);
										oViewModel.setProperty("/uGrossWeight", responseData.HeaderNav.results[0].Brgew);
										oViewModel.setProperty("/uTareweight", responseData.HeaderNav.results[0].Trwgt);
										oViewModel.setProperty("/uNetWeight", responseData.HeaderNav.results[0].Ntgew);
									} else {
										that.onResetPage();
									}
								}
							});
						} else {
							oViewModel.setProperty("/aWB_Data", responseData.HeaderNav.results[0]);
							oViewModel.setProperty("/aItemNavData", responseData.ItemNav.results[0]);
							oViewModel.setProperty("/uGrossWeight", responseData.HeaderNav.results[0].Brgew);
							oViewModel.setProperty("/uTareweight", responseData.HeaderNav.results[0].Trwgt);
							oViewModel.setProperty("/uNetWeight", responseData.HeaderNav.results[0].Ntgew);
						}
					}

					sap.ui.core.BusyIndicator.hide();
				},
				error: function(Ierror) {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},

		onValueHelpPress: function(oEvent) {
			var oViewModel = this.getView().getModel("oWBModel");
			if (oEvent.sId === "valueHelpRequest") {
				this.first = true;
				oViewModel.setProperty("/wbfDate", new Date(new Date() - (2 * 86400000)));
				oViewModel.setProperty("/wbtDate", new Date());
			} else {
				this.first = false;
			}

			var fDate = oViewModel.getProperty("/wbfDate");
			var tDate = oViewModel.getProperty("/wbtDate");
			var aDateFrom = new Date(fDate.toString().split("GMT ")[0] + " UTC ").toISOString().split(".")[0];
			var aDateTo = new Date(tDate.toString().split("GMT ")[0] + " UTC ").toISOString().split(".")[0];
			var entity = "/InputSet",
				filterParm = [new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, "WBIDF4"),
					new sap.ui.model.Filter("FromDate", sap.ui.model.FilterOperator.EQ, aDateFrom),
					new sap.ui.model.Filter("ToDate", sap.ui.model.FilterOperator.EQ, aDateTo)
				],
				ExpandParm = "WbidF4Nav";
			this._GetBatchCalls(entity, filterParm, ExpandParm, "GETWeigh");

		},
		fnSearchWb: function(oEvent) {
			var vValue = oEvent.getParameter("value");
			if (vValue && vValue.length > 0) {
				var oFilter1 = new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter2 = new sap.ui.model.Filter("Delivery", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter3 = new sap.ui.model.Filter("Vehno", sap.ui.model.FilterOperator.Contains, vValue);
				var aFilters = new Filter([oFilter1, oFilter2, oFilter3]);
			}
			var List = this.fragment.getContent()[2];
			var binding = List.getBinding("items");

			binding.filter(aFilters);

		},
		onValueHelpConfirm: function(oEvent) {
			var that = this,
				oViewModel = this.getView().getModel("oWBModel");
			var oSelectedItem = oEvent.oSource.getBindingContext("oWBModel").getObject();
			var entity = "/InputSet",
				filterParm = [new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, "GET"),
					new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.EQ, oSelectedItem.Wbid || "")
				],
				ExpandParm = "HeaderNav,ItemNav,ReturnNav";
			this._GetBatchCalls(entity, filterParm, ExpandParm, "Head_Detail");

			oViewModel.setProperty("/weighBridge", oSelectedItem.Wbid);
			that.fragment.close();
		},
		onClosefragment: function() {
			this.fragment.close();
		},

		fnWBGetData: function(oEvent) {
			var aData = oEvent.oSource.getValue().trim();
			if (aData.length === 12) {
				var entity = "/InputSet",
					filterParm = [new sap.ui.model.Filter("Flag", sap.ui.model.FilterOperator.EQ, "GET"),
						new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.EQ, aData || "")
					],
					ExpandParm = "HeaderNav,ItemNav,ReturnNav";
				this._GetBatchCalls(entity, filterParm, ExpandParm, "Head_Detail");
			}
		},

		fnGetAttachDetails: function() {
			var oViewModel = this.getView().getModel("oWBModel");
			if (oViewModel.getProperty("/aWB_Data/Wbid")) {
				var pdfURL = "/sap/opu/odata/sap/ZGW_GT_MM_WB_MOBILITY_SRV/OcrImageSet(Flag='OCR',Wbid='" + oViewModel.getProperty(
					"/aWB_Data/Wbid") + "')/$value";
				var encodeUrl = encodeURI(pdfURL);
				var oHtml = new sap.ui.core.HTML({});
				sap.m.URLHelper.redirect(encodeUrl, true);
			} else {
				sap.m.MessageBox.warning(this.resourceText.getText("Mandatory"));
			}
		},

		onSaveData: function() {
			var that = this,
				valid = true,
				oViewModel = this.getView().getModel("oWBModel"),
				aWB_Data = oViewModel.getProperty("/aWB_Data"),
				Brgew = oViewModel.getProperty("/uGrossWeight"),
				Trwgt = oViewModel.getProperty("/uTareweight"),
				Ntgew = oViewModel.getProperty("/uNetWeight");

			if (oViewModel.getProperty("/weighBridge").trim().length <= 0) {
				sap.m.MessageBox.warning(this.resourceText.getText("Mandatory"));
				valid = false;
			} else if ((aWB_Data.Brgew === Brgew) && (aWB_Data.Trwgt === Trwgt) && (aWB_Data.Ntgew === Ntgew)) {
				sap.m.MessageBox.warning(this.resourceText.getText("noChangeMade"));
				valid = false;
			} else if (parseFloat(Ntgew) < 0) {
				sap.m.MessageBox.warning(this.resourceText.getText("NetweightcannotbeNeg"));
				valid = false;
			}

			if (valid) {
				MessageBox.show(
					that.resourceText.getText("ConfirmMsgTxt"), {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: that.resourceText.getText("Confirm"),
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function(oAction) {
							if (oAction === sap.m.MessageBox.Action.YES) {
								that.generatepayloadPost();
							}

						}
					}
				);
			}
		},
		generatepayloadPost: function() {
			var that = this,
				sModel = this.getOwnerComponent().getModel(),
				oViewModel = this.getView().getModel("oWBModel");
			/*	oViewModel.setProperty("/aWB_Data/Brgew", oViewModel.getProperty("/uGrossWeight"));
				oViewModel.setProperty("/aWB_Data/Trwgt", oViewModel.getProperty("/uTareweight"));
				oViewModel.setProperty("/aWB_Data/Ntgew", oViewModel.getProperty("/uNetWeight"));*/
			var aWB_Data = oViewModel.getProperty("/aWB_Data"),
				ItemNavData = oViewModel.getProperty("/aItemNavData");
			var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddT00:00:00"
			});
			var HeaderNavData = [{
				Wbid: aWB_Data.Wbid || "",
				Werks: aWB_Data.Werks || "",
				Brgew: oViewModel.getProperty("/uGrossWeight") || "",
				Trwgt: oViewModel.getProperty("/uTareweight") || "",
				Ntgew: oViewModel.getProperty("/uNetWeight").toString() || "",
				Uom: aWB_Data.Uom || ""
			}];

			that.BusyDialog = new BusyDialog();
			that.BusyDialog.open();
			var payload = {
				"d": {
					Flag: 'SAVE',
					Wbid: oViewModel.getProperty("/weighBridge") || "",
					HeaderNav: HeaderNavData || "",
					ReturnNav: []
				}
			};
			sModel.create("/InputSet", payload, {
				success: function(oData, oResponse) {
					var responseData = oData;
					if (responseData.ReturnNav.results.length > 0 && responseData.ReturnNav.results[0].Type === "E") {
						sap.m.MessageBox.error(responseData.ReturnNav.results[0].Message);
					} else {
						that.onResetPage();
						console.log(responseData);
						var vMesg = "";
						for (var i in oData.ReturnNav.results) {
							if (i === "0")
								vMesg = oData.ReturnNav.results[i].Message;
							else
								vMesg += "\n" + oData.ReturnNav.results[i].Message;
						}
						sap.m.MessageBox.information(vMesg);
					}
					that.BusyDialog.close();
				},
				error: function(oError) {
					that.BusyDialog.close();
					sap.m.MessageBox.error(oError.message);
				}
			});
		},

	});

});