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

	return Controller.extend("ZGT_MM_INBOUND.controller.BatchUpdate", {
		/*==============================================
				 *	Author		: Avinash R
				 *	Created on	: APR 2022
				 *	Description	: Batch Charac. Update (Ghana Region)
				 *	Changed on	: 
				 *	Changed	by	: 
		================================================*/
		onInit: function() {
			oThat = this;
			oThat.BusyDialog = new BusyDialog();
			oThat.oView = this.getView();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("BatchUpdate").attachMatched(this._onRouteMatched, this);
			oThat.ReprintOpen = "";
			// Added on 19/5/22
			oThat.ProcessType = "";
			oThat.SelectedWbPlant = "";
			oThat.SelectedOrigin = "";
			// End of Addded
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
			oThat.getView().byId("id_InDateBatch").setDateValue(new Date());
			oThat.oView.byId("id_InBatchValue").setValue("");
			oThat.oView.byId("id_InWbidBatch").setValue("");
			oThat.oView.byId("id_InVehicleNoBatch").setValue("");
			oThat.oView.byId("id_BtnSave").setEnabled(false);
			oThat.oView.byId("id_InVehicleNoBatch").setEnabled(true);
			oThat.getView().byId("id_InPO").setValue("");
			oThat.getView().byId("id_InPrLot").setValue("");
			oThat.getView().byId("id_InMaktx").setValue("");
			oThat.getView().byId("id_InMatnr").setValue("");
			oThat.getView().byId("id_InUnloc").setValue("");
			oThat.getView().byId("id_InWbidTrans").setValue("");
			oThat.getView().byId("id_HeaderText").setText();
			oThat.getView().byId("id_BtnSubmitText").setVisible(false);
			oThat.oView.setModel(new JSONModel({}), "JmOrigin");
			oThat.CurrentDateValue = oThat.getView().byId("id_InDateBatch").getValue();
			var oDialog = oThat.getView().byId("id_BatchPanel");
			oThat.oView.setModel(new JSONModel([]), "JmLoadBags");
			oDialog.destroyContent();
			oThat.getView().byId("SimpleFormDisplayBatch").setVisible(false);
			oThat.getView().byId("id_ListItemOut").setVisible(false);
			oThat.onOpenSettings();
		},

		onOpenSettings: function() {
			setTimeout(function() {
				oThat.ProcessSetting = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.ProcessType", oThat);
				oThat.oView.addDependent(oThat.ProcessSetting);
				oThat.ProcessSetting.open();
			}, 1000);
		},

		fnOpenSettings: function() {
			oThat.ProcessSetting = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.ProcessType", oThat);
			oThat.oView.addDependent(oThat.ProcessSetting);
			oThat.ProcessSetting.open();
		},

		onCloseProcess: function() {
			oThat.ProcessSetting.destroy();
		},

		onSelectProcessType: function() {
			var vSelectedProcess = sap.ui.getCore().byId("id_SelProcessType").getSelectedKey();
			if (vSelectedProcess) {
				oThat.ProcessType = vSelectedProcess;
				oThat.getView().byId("SimpleFormDisplayBatch").setVisible(true);
				if (vSelectedProcess === "01") {
					oThat.getView().byId("id_HeaderText").setText(oThat.oView.getModel("i18n").getResourceBundle().getText("PoUpd"));
					oThat.getView().byId("id_BtnSave").setVisible(false);
					oThat.getView().byId("id_BtnSavePort").setVisible(true);
					oThat.getView().byId("id_BtnSubmitText").setText(oThat.oView.getModel("i18n").getResourceBundle().getText("Label11"));
					oThat.getView().byId("id_BtnSubmitText").setVisible(false);
					oThat.getView().byId("id_InMaktxLabel").setVisible(true);
					oThat.getView().byId("id_InMaktx").setVisible(true);
					oThat.getView().byId("id_InMatnr").setVisible(true);
					oThat.getView().byId("id_InMatLabel").setVisible(true);
					oThat.getView().byId("id_InBatchValue").setVisible(true);
					oThat.getView().byId("id_InBatchLabel").setVisible(true);
					oThat.getView().byId("id_InUnloc").setVisible(true);
					oThat.getView().byId("id_InLocLabel").setVisible(true);
					oThat.getView().byId("id_InPrLot").setVisible(true);
					oThat.getView().byId("id_InLotLabel").setVisible(true);
					oThat.getView().byId("id_InPO").setVisible(true);
					oThat.getView().byId("id_InPoLabel").setVisible(true);
					oThat.getView().byId("id_InWbidBatch").setVisible(true);
					oThat.getView().byId("id_InWbidBatch").setEnabled(false);
					oThat.getView().byId("id_InWbidBatch").setShowValueHelp(false);
					oThat.getView().byId("id_InWbidBatch").setValueHelpOnly(false);
					oThat.getView().byId("id_InWbBatchLabel").setVisible(true);
					oThat.getView().byId("id_InVehicleLabel").setVisible(true);
					oThat.getView().byId("id_InVehicleNoBatch").setVisible(true);
					oThat.getView().byId("id_InVehicleNoBatch").setShowValueHelp(true);
					oThat.getView().byId("id_InDateLabel").setVisible(true);
					oThat.getView().byId("id_InDateBatch").setVisible(true);
					oThat.getView().byId("id_InWbidTrans").setVisible(false);
					oThat.getView().byId("id_InWbTransLabel").setVisible(false);
					oThat.getView().byId("id_ListItemOut").setVisible(true);
				} else if (vSelectedProcess === "02") {
					oThat.getView().byId("id_HeaderText").setText(oThat.oView.getModel("i18n").getResourceBundle().getText("CharUpdate"));
					oThat.getView().byId("id_BtnSave").setVisible(true);
					oThat.getView().byId("id_BtnSavePort").setVisible(false);
					oThat.getView().byId("id_BtnSubmitText").setText(oThat.oView.getModel("i18n").getResourceBundle().getText("Label11"));
					oThat.getView().byId("id_BtnSubmitText").setVisible(false);
					oThat.getView().byId("id_InMaktxLabel").setVisible(true);
					oThat.getView().byId("id_InMaktx").setVisible(true);
					oThat.getView().byId("id_InMatnr").setVisible(true);
					oThat.getView().byId("id_InMatLabel").setVisible(true);
					oThat.getView().byId("id_InBatchValue").setVisible(true);
					oThat.getView().byId("id_InBatchLabel").setVisible(true);
					oThat.getView().byId("id_InUnloc").setVisible(true);
					oThat.getView().byId("id_InLocLabel").setVisible(true);
					oThat.getView().byId("id_InPrLot").setVisible(true);
					oThat.getView().byId("id_InLotLabel").setVisible(true);
					oThat.getView().byId("id_InPO").setVisible(true);
					oThat.getView().byId("id_InPoLabel").setVisible(true);
					oThat.getView().byId("id_InWbidBatch").setVisible(true);
					oThat.getView().byId("id_InWbidBatch").setEnabled(false);
					oThat.getView().byId("id_InWbidBatch").setShowValueHelp(false);
					oThat.getView().byId("id_InWbidBatch").setValueHelpOnly(false);
					oThat.getView().byId("id_InWbBatchLabel").setVisible(true);
					oThat.getView().byId("id_InVehicleLabel").setVisible(true);
					oThat.getView().byId("id_InVehicleNoBatch").setVisible(true);
					oThat.getView().byId("id_InVehicleNoBatch").setShowValueHelp(true);
					oThat.getView().byId("id_InDateLabel").setVisible(true);
					oThat.getView().byId("id_InDateBatch").setVisible(true);
					oThat.getView().byId("id_InWbidTrans").setVisible(false);
					oThat.getView().byId("id_InWbTransLabel").setVisible(false);
					oThat.getView().byId("id_ListItemOut").setVisible(false);
				} else if (vSelectedProcess === "03") {
					oThat.getView().byId("id_BtnSavePort").setVisible(false);
					oThat.getView().byId("id_HeaderText").setText(oThat.oView.getModel("i18n").getResourceBundle().getText("BrUpdate"));
					oThat.getView().byId("id_BtnSubmitText").setText(oThat.oView.getModel("i18n").getResourceBundle().getText("SaveChng"));
					oThat.getView().byId("id_BtnSubmitText").setEnabled(false);
					oThat.getView().byId("id_BtnSubmitText").setVisible(false);
					oThat.getView().byId("id_BtnSave").setVisible(false);
					oThat.getView().byId("id_InMaktxLabel").setVisible(false);
					oThat.getView().byId("id_InMaktx").setVisible(false);
					oThat.getView().byId("id_InMatnr").setVisible(false);
					oThat.getView().byId("id_InMatLabel").setVisible(false);
					oThat.getView().byId("id_InBatchValue").setVisible(false);
					oThat.getView().byId("id_InBatchLabel").setVisible(false);
					oThat.getView().byId("id_InUnloc").setVisible(false);
					oThat.getView().byId("id_InLocLabel").setVisible(false);
					oThat.getView().byId("id_InPrLot").setVisible(false);
					oThat.getView().byId("id_InLotLabel").setVisible(false);
					oThat.getView().byId("id_InPO").setVisible(false);
					oThat.getView().byId("id_InPoLabel").setVisible(false);
					oThat.getView().byId("id_InWbidBatch").setVisible(true);
					oThat.getView().byId("id_InWbidBatch").setEditable(true);
					oThat.getView().byId("id_InWbidBatch").setEnabled(true);
					oThat.getView().byId("id_InWbidBatch").setShowValueHelp(true);
					oThat.getView().byId("id_InWbidBatch").setValueHelpOnly(true);
					oThat.getView().byId("id_InWbBatchLabel").setVisible(true);
					oThat.getView().byId("id_InVehicleLabel").setVisible(true);
					oThat.getView().byId("id_InVehicleNoBatch").setVisible(true);
					oThat.getView().byId("id_InVehicleNoBatch").setShowValueHelp(false);
					oThat.getView().byId("id_InDateLabel").setVisible(true);
					oThat.getView().byId("id_InDateBatch").setVisible(true);
					oThat.getView().byId("id_InWbidTrans").setVisible(true);
					oThat.getView().byId("id_InWbTransLabel").setVisible(true);
					oThat.getView().byId("id_ListItemOut").setVisible(false);
				}
				oThat.ProcessSetting.destroy();
				oThat.fnClearDatas();
			} else {
				MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("PlSelProcess"));
			}
		},

		fnChangeVehicle: function(oEvent) {
			var svalue = oEvent.getSource().getValue();
			svalue = svalue.replace(/[^a-zA-Z0-9/ /]/g, '');
			svalue = svalue.toUpperCase();
			oEvent.getSource().setValue(svalue);
			if (svalue) {
				oEvent.getSource().setValueState("None");
			}
			oThat.getView().byId("id_BtnSubmitText").setEnabled(true);
			oThat.getView().byId("id_BtnSubmitText").setVisible(true);
		},

		//====================================================================================//
		//==================== Call Service =================================================//
		//===================================================================================//
		onCallService: function(service, Data) {
			oThat.BusyDialog.open();
			if (oThat.Service === "REPRINT" || oThat.Service === 'GETBATCH') {
				oThat.oModel.create("/GetHeadersSet", Data, {
					filters: Data,
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service === 'GETCHAR') {
				oThat.BusyDialog.open();
				oThat.oModel.create("/BatchGetSet", Data, {
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service === 'SETCHAR') {
				oThat.BusyDialog.open();
				oThat.oModel.create("/PostBatchCharUpdSet", Data, {
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service == "Vendor") {
				oThat.oModel.read("/F4TransportersSet", {
					filters: Data,
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service == "GETBAGS" || oThat.Service === "GETWT" || oThat.Service === "POSTBAGS") {
				oThat.BusyDialog.open();
				oThat.oModel.create("/PostBatchCharUpdSet", Data, {
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
			} else if (oThat.Service === 'REPRINT') {
				oThat.oView.setModel(new JSONModel(oData), "oStatusModel");
				oThat.oView.getModel("oStatusModel").refresh(true);
				// if(oData.StatusUpdateNav != null){
				if (oData.StatusUpdateNav.results.length != 0) {
					oThat.VehicleNo = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.TruckNo", oThat);
					oThat.oView.addDependent(oThat.VehicleNo);
					oThat.VehicleNo.open();

				} else {
					MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMSg16"));
				}
			} else if (oThat.Service === 'GETBATCH') {
				oThat.oView.setModel(new JSONModel(oData.F4PrlotPrintNav.results), "LotF4Data");
				oThat.oView.getModel("LotF4Data").refresh(true);
				if (oData.F4PrlotPrintNav.results.length != 0) {
					oThat.LotF4 = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.LotF4", oThat);
					oThat.oView.addDependent(oThat.LotF4);
					oThat.LotF4.open();
					if (oThat.ReprintOpen === "X") {
						oThat.LotF4.setMultiSelect(true);
					} else {
						oThat.LotF4.setMultiSelect(false);
					}
				} else {
					MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("NoLotAvail"));
				}
			} else if (oThat.Service === 'GETCHAR') {
				var vErr = false;
				if (oData.GetReturnNav.results.length > 0) {
					if (oData.GetReturnNav.results[0].Type == "E") {
						vErr = true;
					}
				}
				if (!vErr) {
					oThat.oView.setModel(new JSONModel(oData.BatchCharsNav.results), "BATCH");
					oThat.oView.getModel("BATCH").refresh(true);
					oThat.onCreateChracteritis();
				} else {
					MessageBox.error(oData.GetReturnNav.results[0].Message);
				}
			} else if (oThat.Service === 'GETBAGS') {
				var vErr = false;
				if (oData.ReturnNav.results.length > 0) {
					if (oData.ReturnNav.results[0].Type == "E") {
						vErr = true;
					}
				}
				if (!vErr) {
					oThat.oView.setModel(new JSONModel(oData.LoadBagsNav.results), "JmLoadBags");
					oThat.oView.setModel(new JSONModel(oData.HatchNav.results), "JmHatch");
					oThat.oView.getModel("JmLoadBags").refresh(true);
					oThat.oView.getModel("JmHatch").refresh(true);
				} else {
					MessageBox.error(oData.ReturnNav.results[0].Message);
				}
			} else if (oThat.Service === 'GETWT') {
				var vErr = false;
				if (oData.ReturnNav.results.length > 0) {
					if (oData.ReturnNav.results[0].Type == "E") {
						vErr = true;
					}
				}
				if (!vErr) {
					// oThat.getView().getModel("JmLoadBags").getData()[vIndex].LoadWt = Idata.results[0].LoadWt;
					oThat.getView().getModel("JmLoadBags").refresh();
				} else {
					MessageBox.error(oData.ReturnNav.results[0].Message);
				}
			} else if (oThat.Service === 'POSTBAGS') {
				if (oData.ReturnNav.results.length != 0) {
					var aError = oData.ReturnNav.results.filter(function(x) {
						if (x.Type == 'E') {
							return x;
						}
					});
					if (aError != 0) {
						var vErrorRetMsg = "";
						if (oData.ReturnNav.results.length > 0) {
							for (var i = 0; i < oData.ReturnNav.results.length; i++) {
								var vCount = i + 1;
								vErrorRetMsg = vErrorRetMsg + " " + vCount + ". " + oData.ReturnNav.results[i].Message + "\n";
							}
						}
						MessageBox.error(vErrorRetMsg);
					}
					var aSuccess = oData.ReturnNav.results.filter(function(x) {
						if (x.Type == 'S') {
							return x;
						}
					});
					if (aSuccess != 0) {
						MessageBox.show(aSuccess[0].Message, {
							icon: MessageBox.Icon.SUCCESS,
							title: oThat.oView.getModel("i18n").getResourceBundle().getText("Title19"),
							actions: [MessageBox.Action.OK],
							onClose: function(oAction) {
								if (oAction === 'OK') {
									oThat.fnClearDatas();
									oThat.ProcessType = "";
									oThat.SelectedWbPlant = "";
									oThat.SelectedOrigin = "";
									oThat.oRouter.navTo("Inbound");
								} else {
									oThat.fnClearDatas();
									oThat.ProcessType = "";
									oThat.SelectedWbPlant = "";
									oThat.SelectedOrigin = "";
									oThat.oRouter.navTo("Inbound");
								}
							}
						});

					}
				}
			} else if (oThat.Service === 'SETCHAR') {
				if (oData.ReturnNav.results.length != 0) {
					var vRetMsg = "";
					var aMsg = oData.ReturnNav.results.filter(function(x) {
						vRetMsg = vRetMsg + x.Message + "\r\n";
					});
					var aError = oData.ReturnNav.results.filter(function(x) {
						if (x.Type == 'E') {
							return x;
						}
					});
					if (aError != 0) {
						MessageBox.error(vRetMsg);
					}
					var aSuccess = oData.ReturnNav.results.filter(function(x) {
						if (x.Type == 'S') {
							return x;
						}
					});
					if (aSuccess != 0) {
						// MessageBox.success(vRetMsg);
						MessageBox.show(aSuccess[0].Message, {
							icon: MessageBox.Icon.SUCCESS,
							title: oThat.oView.getModel("i18n").getResourceBundle().getText("Title19"),
							actions: [MessageBox.Action.OK],
							onClose: function(oAction) {
								if (oAction === 'OK') {
									if (oThat.ProcessType === "02") {
										//Trigger Print for Every Items
										MessageBox.show(oThat.oView.getModel("i18n").getResourceBundle().getText("Msg2"), {
											icon: MessageBox.Icon.INFORMATION,
											title: oThat.oView.getModel("i18n").getResourceBundle().getText("Title16"),
											actions: [MessageBox.Action.YES, MessageBox.Action.NO],
											onClose: function(oAction) {
												if (oAction === 'YES') {
													var sServiceUrl = oThat.oModel.sServiceUrl;
													var vWbid = oThat.oView.byId("id_InWbidBatch").getValue();
													var vSelectedLots = "";
													if (oThat.ProcessType === "02") {
														vSelectedLots = oThat.oView.byId("id_InBatchValue").getValue();
													}
													var sRead = "/DownloadSet(IvWbid='" + vWbid + "',IvPrint='X',GateEntry='X',IvBatch='" + vSelectedLots +
														"')/$value";
													var pdfURL = sServiceUrl + sRead;
													if (sap.ui.Device.system.desktop) {
														oThat.initiatePdfDialog();
														var oContent = "<div><iframe src=" + pdfURL + " width='100%' height='520'></iframe></div>";
														oThat.oImageDialog.getContent()[0].setContent(oContent);
														oThat.oImageDialog.addStyleClass("sapUiSizeCompact");
														oThat.oImageDialog.open();
													} else {
														window.open(pdfURL);
													}

												} else {
													oThat.fnClearDatas();
													oThat.ProcessType = "";
													oThat.SelectedWbPlant = "";
													oThat.SelectedOrigin = "";
													oThat.oRouter.navTo("Inbound");

												}
											}
										});
									} else {
										oThat.fnClearDatas();
										oThat.ProcessType = "";
										oThat.SelectedWbPlant = "";
										oThat.SelectedOrigin = "";
										oThat.oRouter.navTo("Inbound");
									}
								} else {
									oThat.fnClearDatas();
								}
							}
						});
					}
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
						oThat.oView.byId("id_InDateBatch").setValue("");
					}
				}
				// }
				else {
					oThat.oView.byId("id_BtnSave").setVisible(false);
					oThat.oView.byId("id_InReason").setValue("");
					oThat.oView.byId("id_InVehicleNo").setValue("");
					oThat.oView.byId("id_InWbid").setValue("");
					oThat.oView.byId("id_InDateBatch").setValue("");
				}
			} else if (oThat.Service == "Vendor") {
				var oJsonModel = new JSONModel(oData);
				oJsonModel.setSizeLimit(oData.length);
				oThat.oView.setModel(oJsonModel, "Vendor");
			}
		},
		myErrorHandler: function(oResponse) {
			oThat.BusyDialog.close();
			var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("Title21");
			MessageBox.show(oResponse.responseText, MessageBox.Icon.ERROR, vError);
		},

		onClickVehicleF4: function(oEvent) {
			var oThat = this;
			var vCharUpd = "",
				vReprint = "";
			if (oThat.ReprintOpen === "") {
				if (oThat.ProcessType === "02") { //Charac., Update
					vCharUpd = "C";
				}
				if (oThat.ProcessType === "03") { //BreakDown Update
					vCharUpd = "B";
				}
				if (oThat.ProcessType === "01") { //Port Out Update
					vCharUpd = "P";
				}
				vReprint = "";
				var vDateValue = oThat.getView().byId("id_InDateBatch").getDateValue();
				var vDate = oThat.getView().byId("id_InDateBatch").getValue();
			} else {
				// vCharUpd = "X";
				if (oThat.ProcessType === "02") {
					vCharUpd = "C";
				}
				if (oThat.ProcessType === "03") {
					vCharUpd = "B";
				}
				if (oThat.ProcessType === "01") {
					vCharUpd = "P";
				}
				vReprint = "";
				var vDateValue = sap.ui.getCore().byId("id_InDate").getDateValue();
				var vDate = sap.ui.getCore().byId("id_InDate").getValue();
			}
			oThat.vId = oEvent.getSource().getId();
			if (vDate !== null && vDate !== "") {
				var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				var vInDate = vDateFormat.format(vDateValue);
				oThat.Service = 'REPRINT';
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
						"ReprintF4": vReprint,
						"CharUpdF4": vCharUpd,
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
		//End of Added..

		onValueHelpSearch: function(oEvent) {
			var vValue = oEvent.getSource()._sSearchFieldValue;
			if (oThat.vId.indexOf("id_InWbidTrans") === -1) {
				if (vValue && vValue.length > 0) {
					var oFilter1 = new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.Contains, vValue);
					var oFilter2 = new sap.ui.model.Filter("Vehno", sap.ui.model.FilterOperator.Contains, vValue);
					var oFilter3 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, vValue);
					var oFilter4 = new sap.ui.model.Filter("Vehtyp", sap.ui.model.FilterOperator.Contains, vValue);
					var oFilter5 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, vValue);
					var aAllFilter = new sap.ui.model.Filter([oFilter1, oFilter2, oFilter3, oFilter4, oFilter5]);
				}
			} else {
				if (vValue && vValue.length > 0) {
					var oFilter3 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, vValue);
					var oFilter4 = new sap.ui.model.Filter("Name1", sap.ui.model.FilterOperator.Contains, vValue);
					var aAllFilter = new sap.ui.model.Filter([oFilter3, oFilter4]);
				}
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(aAllFilter);

		},

		onValueHelpConfirm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter('selectedItem');
			if (oThat.vId.indexOf("id_InWbidTrans") === -1) {
				if (oThat.ReprintOpen === "") {
					var oSelectedItem = oEvent.getParameter('selectedItem');
					var oSelectedItemObject = oEvent.getParameter('selectedItem').getBindingContext("oStatusModel").getObject();
					oThat.getView().byId("id_InVehicleNoBatch").setValue(oSelectedItemObject.Vehno);
					oThat.getView().byId("id_InWbidBatch").setValue(oSelectedItemObject.Wbid);
					if (oThat.ProcessType === "03") {
						oThat.getView().byId("id_InWbidTrans").setValue(oSelectedItemObject.Lifnr + " - " + oSelectedItemObject.Name1);
					}
					oThat.SelectedWbPlant = oSelectedItemObject.Werks;
					oThat.SelectedOrigin = oSelectedItemObject.Origin;
					var vObj = {
						"Origin": oSelectedItemObject.Origin
					};
					oThat.oView.setModel(new JSONModel(vObj), "JmOrigin");
					var oDialog = oThat.getView().byId("id_BatchPanel");
					oDialog.destroyContent();
					oThat.getView().byId("id_InBatchValue").setValue("");
					oThat.oView.byId("id_BtnSave").setEnabled(false);
				} else {
					var oSelectedItem = oEvent.getParameter('selectedItem');
					var oSelectedItemObject = oEvent.getParameter('selectedItem').getBindingContext("oStatusModel").getObject();
					sap.ui.getCore().byId("id_InVehicleNo").setValue(oSelectedItemObject.Vehno);
					sap.ui.getCore().byId("id_InWbid").setValue(oSelectedItemObject.Wbid);
				}
			} else {
				var oSelectedItemObject = oEvent.getParameter('selectedItem').getBindingContext("Vendor").getObject();
				oThat.getView().byId("id_InWbidTrans").setValue(oSelectedItemObject.Lifnr + " - " +
					oSelectedItemObject.Name1);
				oThat.getView().byId("id_BtnSubmitText").setEnabled(true);
				oThat.getView().byId("id_BtnSubmitText").setVisible(true);
			}
		},

		fnTransHelp: function(oEvent) {
			oThat.vId = oEvent.getSource().getId();
			var vWBid = oThat.getView().byId("id_InWbidBatch").getValue();
			if (oThat.SelectedWbPlant && vWBid) {
				oThat.ValueHelp = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Transporter", oThat);
				oThat.oView.addDependent(oThat.ValueHelp);
				oThat.ValueHelp.open();
				oThat.Service = 'Vendor';
				var filter = [
					new Filter("Werks", sap.ui.model.FilterOperator.EQ, oThat.SelectedWbPlant)
				];
				// oThat.createList();
				oThat.onCallService(oThat.Service, filter);
			} else {
				MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText('PlSelWbId'));
			}
		},

		// Added by Avinash for PR Lot Based PrintOut - Ghana Changes
		onPrLotF4: function(oEvent) {
			var oThat = this;
			oThat.vId = oEvent.getSource().getId();
			var vDate = oThat.getView().byId("id_InDateBatch").getValue();
			var vWbId = oThat.getView().byId("id_InWbidBatch").getValue();
			var vErr = false;
			var vErrMsg = "";
			if (oThat.ReprintOpen === "X") {
				var vDate = sap.ui.getCore().byId("id_InDate").getDateValue();
				var vWbId = sap.ui.getCore().byId("id_InWbid").getValue();
				if (sap.ui.getCore().byId("id_InVehicleNo").getValue() === "" ||
					sap.ui.getCore().byId("id_InWbid").getValue() === "" ||
					sap.ui.getCore().byId("id_InDate").getValue() === "" ||
					sap.ui.getCore().byId("id_InDate").getValue() == null) {
					vErr = true;
					vErrMsg = oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg7") + "\r\n";
				}
			} else {
				var vDate = oThat.getView().byId("id_InDateBatch").getValue();
				var vWbId = oThat.getView().byId("id_InWbidBatch").getValue();
				if (vDate == null && vDate == "") {
					vErr = true;
					vErrMsg = oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg6") + "\r\n";
				}
				if (!vWbId) {
					vErr = true;
					vErrMsg = vErrMsg + oThat.oView.getModel("i18n").getResourceBundle().getText("EnterVehNo");
				}
				var vDate = oThat.getView().byId("id_InDateBatch").getDateValue();
			}
			if (!vErr) {
				// var vDate = oThat.getView().byId("id_InDateBatch").getDateValue();
				var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				var vInDate = vDateFormat.format(vDate);
				oThat.Service = 'GETBATCH';
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
						"IvWbid": vWbId,
						"IvWerks": "",
						"StatusUpdate": "",
						"ReprintF4": "",
						"PrlotF4Print": "X", //Added by Avinash
						"Approval": "",
						"GetReturnNav": [],
						"PoItemNav": [],
						"QualWbidNav": [],
						"WbItemNav": [],
						"WsItemNav": [],
						"WbHeaderNav": [],
						"F4PrlotPrintNav": [],
						"StatusUpdateNav": [{
							"InDate": vInDate
						}]
					}
				};
				oThat.onCallService(oThat.Service, oEntity);

			} else {
				MessageBox.error(vErrMsg);
			}

		},

		onChargF4Search: function(oEvent) {
			var vValue = oEvent.getSource()._sSearchFieldValue;
			if (vValue && vValue.length > 0) {
				var oFilter1 = new sap.ui.model.Filter("Lotno", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter2 = new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter3 = new sap.ui.model.Filter("Bwtar", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter4 = new sap.ui.model.Filter("Maktx", sap.ui.model.FilterOperator.Contains, vValue);
				var aAllFilter = new sap.ui.model.Filter([oFilter1, oFilter2, oFilter3, oFilter4]);
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(aAllFilter);
		},

		// onChargF4Confirm: function(oEvent) {
		// 	// var oView = this.getView();
		// 	var aSelectedContexts = oEvent.getParameter("selectedContexts");
		// 	if (aSelectedContexts.length > 0) {
		// 		var oSelectedItem = oEvent.getParameter('selectedItem');
		// 		var aCharArr = [];
		// 		var vConcatBatch = "";
		// 		var vBatchSetValue = "";
		// 		oThat.BatchObject = aSelectedContexts[0].getObject();
		// 		for (var a = 0; a < aSelectedContexts.length; a++) {
		// 			var oObject = aSelectedContexts[a].getObject();
		// 			if (a === 0) {
		// 				vConcatBatch = oObject.Lotno;
		// 			} else {
		// 				vConcatBatch = vConcatBatch + "*" + oObject.Lotno;
		// 			}
		// 			if (aSelectedContexts.length > 1) {
		// 				vBatchSetValue = aSelectedContexts[0].getObject().Lotno + "+ " + oThat.oView.getModel("i18n").getResourceBundle().getText(
		// 					"RemMore");
		// 			} else {
		// 				vBatchSetValue = aSelectedContexts[0].getObject().Lotno;
		// 			}
		// 		}
		// 		oThat.SelectedLots = vConcatBatch;
		// 		oThat.getView().byId("id_InBatchValue").setValue(vBatchSetValue);

		// 		oThat.getView().byId("id_InPO").setValue(aSelectedContexts[0].getObject().Ebeln);
		// 		oThat.getView().byId("id_InPrLot").setValue(aSelectedContexts[0].getObject().Bwtar);
		// 		oThat.getView().byId("id_InMaktx").setValue(aSelectedContexts[0].getObject().Maktx);
		// 		oThat.getView().byId("id_InUnloc").setValue(aSelectedContexts[0].getObject().Lgort);
		// 	}
		// 	var oDialog = oThat.getView().byId("id_BatchPanel");
		// 	oDialog.destroyContent();
		// 	oThat.oView.byId("id_BtnSave").setEnabled(false);
		// },

		fnChangeInDate: function(oEvent) {
			if (oThat.CurrentDateValue !== oThat.getView().byId("id_InDateBatch").getValue()) {
				oThat.fnClearDatas();
			}
		},

		fnClearDatas: function() {
			oThat.BatchObject = "";
			oThat.oView.byId("id_InBatchValue").setValue("");
			oThat.oView.byId("id_InWbidBatch").setValue("");
			oThat.oView.byId("id_InVehicleNoBatch").setValue("");
			oThat.getView().byId("id_InPO").setValue("");
			oThat.getView().byId("id_InPrLot").setValue("");
			oThat.getView().byId("id_InMaktx").setValue("");
			oThat.getView().byId("id_InMatnr").setValue("");
			oThat.getView().byId("id_InUnloc").setValue("");
			oThat.getView().byId("id_InWbidTrans").setValue("");
			oThat.oView.byId("id_BtnSave").setEnabled(false);
			oThat.oView.byId("id_InVehicleNoBatch").setEnabled(true);
			oThat.getView().byId("id_BtnSavePort").setEnabled(false);
			oThat.oView.setModel(new JSONModel({}), "JmOrigin");
			oThat.getView().getModel("BATCH") === undefined ? "" : oThat.getView().getModel("BATCH").setData([]);
			// oThat.getView().byId("id_ListItemIN").setVisible(false);
			var oDialog = oThat.getView().byId("id_BatchPanel");
			oDialog.destroyContent();
			oThat.oView.setModel(new JSONModel([]), "JmLoadBags");
		},

		onPressCheck: function() {
			var vErr = false,
				vErrMsg = "";
			if (oThat.ProcessType === "02") {
				if (!oThat.getView().byId("id_InVehicleNoBatch").getValue()) {
					vErr = true;
					vErrMsg = oThat.oView.getModel("i18n").getResourceBundle().getText("PlSelTruck") + "\r\n";
				}
				if (!oThat.getView().byId("id_InBatchValue").getValue()) {
					vErr = true;
					vErrMsg = vErrMsg + oThat.oView.getModel("i18n").getResourceBundle().getText("SelBatch");
				}
				if (!vErr) {
					oThat.getView().byId("id_InVehicleNoBatch").setEnabled(false);
					var oEntity = {
						"MaterialNav": [],
						"BatchCharsNav": [],
						"BatchValuesNav": [],
						"GetReturnNav": []
							// "HatchNav": []	 //Commented
					};
					var oBject = {
						"Matnr": oThat.BatchObject.Matnr,
						"Werks": oThat.BatchObject.Werks,
						"Lgort": "",
						"Charg": oThat.BatchObject.Lotno.toUpperCase(),
						"Msgid": "",
						"Msgno": ""
					};
					oEntity.MaterialNav.push(oBject);
					oThat.Service = "GETCHAR";
					oThat.onCallService(oThat.Service, oEntity);
				} else {
					sap.m.MessageBox.error(vErrMsg);
				}
			}
			if (oThat.ProcessType === "03") {
				if (!oThat.getView().byId("id_InVehicleNoBatch").getValue()) {
					vErr = true;
					vErrMsg = oThat.oView.getModel("i18n").getResourceBundle().getText("PlEnterVehicle") + "\r\n";
				}
				if (!vErr) {
					oThat.Service = "SETCHAR";
					var oEntity = {
						"IFlag": "B",
						"ICharg": "",
						"IMatnr": "",
						"IWerks": oThat.SelectedWbPlant,
						"TruckNo": oThat.getView().byId("id_InVehicleNoBatch").getValue(),
						"Lifnr": oThat.getView().byId("id_InWbidTrans").getValue().split(" - ")[0],
						"WbId": oThat.getView().byId("id_InWbidBatch").getValue(),
						"PostBatchCharNav": [],
						"ReturnNav": []
					};
					oThat.Service = "SETCHAR";
					oThat.onCallService(oThat.Service, oEntity);
				} else {
					sap.m.MessageBox.error(vErrMsg);
				}
			}

			if (oThat.ProcessType === "01") { //Get Loaded Bags from Port Out...
				if (!oThat.getView().byId("id_InVehicleNoBatch").getValue()) {
					vErr = true;
					vErrMsg = oThat.oView.getModel("i18n").getResourceBundle().getText("PlSelTruck") + "\r\n";
				}
				if (!oThat.getView().byId("id_InBatchValue").getValue()) {
					vErr = true;
					vErrMsg = vErrMsg + oThat.oView.getModel("i18n").getResourceBundle().getText("SelBatch");
				}
				if (!vErr) {
					oThat.getView().byId("id_InVehicleNoBatch").setEnabled(false);
					var oEntity = {
						"IFlag": "G",
						"ICharg": oThat.BatchObject.Lotno.toUpperCase(),
						"IMatnr": oThat.BatchObject.Matnr,
						"IWerks": oThat.BatchObject.Werks,
						"TruckNo": oThat.getView().byId("id_InVehicleNoBatch").getValue(),
						"WbId": oThat.getView().byId("id_InWbidBatch").getValue(),
						"PostBatchCharNav": [],
						"ReturnNav": [],
						"LoadBagsNav": [],
						"HatchNav": []
					};
					oThat.Service = "GETBAGS";
					oThat.onCallService(oThat.Service, oEntity);
				} else {
					sap.m.MessageBox.error(vErrMsg);
				}
			}
		},

		onCreateChracteritis: function() {
			var oController = this;
			var oDialog = oThat.getView().byId("id_BatchPanel");
			oDialog.destroyContent();
			if (oThat.oView.getModel("BATCH").getData() != null) {
				// sap.ui.getCore().byId("id_BtnCharSave").setVisible(true);
				// sap.ui.getCore().byId("id_BtnCharSave").setText(oThat.oView.getModel("i18n").getResourceBundle().getText('Label14'));
				var aLocArr = oThat.oView.getModel("BATCH").getData();
				var k = 0;
				var vLabel = false,
					vCombo = false;
				var oGrid = new sap.ui.layout.Grid({
					width: '100%',
					defaultSpan: "L12 M12 S12"
				}).addStyleClass("sapUiSizeCompact Cl_Grid_Width sapUiSmallMarginTop");

				for (var i = 0; i < aLocArr.length; i++) {
					//        code to find multiple values
					var oCharMulValue = [];
					var vRdNm = '',
						oRdGrp = '',
						oRdPanel = '';
					var vAtbez = aLocArr[i].DescrChar;
					var vSelectFlag = false;
					if (aLocArr[i].SingleValue) { // input
						vCombo = false;
						vLabel = false;
						var oPanel = new sap.m.Panel({}).addStyleClass("Cl_Batch_Panel");
						// var oFormElement    = new sap.ui.layout.form.FormElement({});
						var oLabel = new sap.m.Label({
							text: vAtbez + " :",
							tooltip: aLocArr[i].DescrChar,
							width: "12rem",
							wrapping: true,
							design: "Bold"
						}).addStyleClass("lblAlignRes");
						oPanel.addContent(oLabel);
						var vType = "";
						var vMaxLength = "";
						if (aLocArr[i].DataType == "NUM") {
							vType = "Number";
						} else {
							vType = "Text";
						}
						vMaxLength = aLocArr[i].NumberDigits;
						var oInput = new sap.m.Input({
							width: 6 + "rem",
							type: vType,
							maxLength: vMaxLength,
							value: aLocArr[i].ValueChar,
							liveChange: function(oEvent) {
								oThat.getView().byId("id_BtnSave").setEnabled(true);
								//                      code to validate input
								if (oEvent.getSource().getParent().getContent().length == '3') { // range validation
									if (oEvent.getSource().getParent().getContent()[2].getText().split(' ').length == '4') {
										var vLower = Number(oEvent.getSource().getParent().getContent()[2].getText().split(' ')[1]);
										var vHigher = Number(oEvent.getSource().getParent().getContent()[2].getText().split(' ')[3]);
										var vType = oEvent.getSource().getType();
										// if(vType == "Number"){
										var vValue = Number(oEvent.getSource().getValue());
										if (vValue < vLower || vValue > vHigher) {
											if (vValue > vHigher) {
												oEvent.getSource().setValue('');
											}
											oEvent.getSource().setValueStateText(oEvent.getSource().getParent().getContent()[2].getText());
											oEvent.getSource().setValueState('Error');
										} else {
											oEvent.getSource().setValueState('None');
										}
										// }

									} else {
										oEvent.getSource().setValueState('None');
									}
								} else {
									var vType = oEvent.getSource().getType();
									var sNumber = "";
									var vValue = "";
									if (vType == "Number") {
										vValue = oEvent.getSource().getValue();
										var vLength = oEvent.getSource().getMaxLength();
										if (vValue.length > vLength) {
											var value = vValue.substring(0, vLength);
											oEvent.getSource().setValue("");
											oEvent.getSource().setValue(value);
										}
									}
									oEvent.getSource().setValueState('None');
								}
							}
						}).addStyleClass("");
						oPanel.addContent(oInput);
						if (oCharMulValue.length > 0) {
							var vText = oThat.oView.getModel("i18n").getResourceBundle().getText('RMFG_TextRange') + ' ' +
								Number(oCharMulValue[0].NumValFm) + ' - ' +
								Number(oCharMulValue[0].NumValTo);
							var oText = new sap.m.Text({
								text: vText
							}).addStyleClass("sapUiTinyMarginBegin");
							oPanel.addContent(oText);

						}
						oGrid.addContent(oPanel);

					} else if (!aLocArr[i].SingleValue && oCharMulValue.length > 0) { // combo box
						var vCombNm;
						vLabel = false;
						if (vCombNm == aLocArr[i].DescrChar) {
							vCombo = true;
						} else {
							vCombo = false;
						}
						if (vCombo == false) {
							var vKey = 0;
							var oComboPanel = new sap.m.Panel({}).addStyleClass("Cl_Batch_Panel");
							var oLabel = new sap.m.Label({
								text: vAtbez + " :",
								tooltip: aLocArr[i].DescrChar,
								width: "12rem",
								wrapping: true,
								design: "Bold"
							}).addStyleClass("lblAlignRes");
							oComboPanel.addContent(oLabel);
							var oCombo = new sap.m.MultiComboBox({
								width: "6rem"

							}).addStyleClass("sapUiTinyMarginBegin");

							vCombNm = (oLabel.getText().split(" :")[0]).toLocaleUpperCase();
							vCombo = true;
						}
						if (vCombNm == aLocArr[i].DescrChar) {
							var oItem = new sap.ui.core.Item({
								text: aLocArr[i].ValueChar,
								key: vKey
							});
							vKey = vKey + 1;
							oCombo.insertItem(oItem);
						} else {
							vCombo = false;
						}
						oComboPanel.addContent(oCombo);
						oGrid.addContent(oComboPanel);

					}
				}
				oDialog.addContent(oGrid);
				if (oThat.oView.getModel("BATCH").getData().length !== 0) {
					// sap.ui.getCore().byId("id_BtnChar").setEnabled(false);
					// sap.ui.getCore().byId("id_BtnCharSave").setVisible(true);
				}
			} else {
				MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText('ErrorMsg8'));
				// sap.ui.getCore().byId("id_BtnCharSave").setVisible(false);
				// sap.ui.getCore().byId("id_BtnRejChar").setVisible(false);
			}

		},

		//Post updated Loaded bag details.... 
		onPressSaveChanges: function() {
			var vErr = false;
			var vErrMsg = "";
			var aLoadData = oThat.getView().getModel("JmLoadBags").getData();
			for (var i = 0; i < aLoadData.length; i++) {
				// if (aLoadData[i].LoadSoundBag === "" || Number(aLoadData[i].LoadSoundBag) === 0) {	//Commented on 23/6/22
				// 	vErr = true;
				// 	vErrMsg = oThat.oView.getModel("i18n").getResourceBundle().getText('SoundBagMand');
				// }
				//Added on 23/06/22
				if (Number(aLoadData[i].LoadWt) == 0) {
					vErr = true;
					vErrMsg = oThat.oView.getModel("i18n").getResourceBundle().getText('plEntBags');
				}
				//End of Added
			}
			if (!vErr) {
				oThat.Service = "POSTBAGS";
				var oEntity = {
					"IFlag": "P",
					"ICharg": oThat.BatchObject.Lotno.toUpperCase(),
					"IMatnr": oThat.BatchObject.Matnr,
					"IWerks": oThat.BatchObject.Werks,
					"TruckNo": oThat.getView().byId("id_InVehicleNoBatch").getValue(),
					"Lifnr": "",
					"WbId": oThat.getView().byId("id_InWbidBatch").getValue(),
					"PostBatchCharNav": [],
					"LoadBagsNav": oThat.getView().getModel("JmLoadBags").getData(),
					"ReturnNav": []
				};
				oThat.Service = "POSTBAGS";
				oThat.onCallService(oThat.Service, oEntity);
			} else {
				MessageBox.error(vErrMsg);
			}
		},

		onPressSave: function(oEvent) {
			var oController = this;
			var vMsg = '',
				vControl = '';
			var n = 0;
			//	var oDialog = oController.dialog;
			var oDiContent = oThat.getView().byId("id_BatchPanel").getContent()[0].getContent();
			for (var i = 0; i < oDiContent.length; i++) {
				var oGdConetnt = oDiContent[i].getContent();
				var vId = oDiContent[i].getContent()[1].getId();
				vControl = oDiContent[i].getContent()[1];
				var vValue = '',
					vRadioIndex = '';
				if (oDiContent[i].getContent()[1].getId().search('input') != '-1') { // input
					vValue = oDiContent[i].getContent()[1].getValue();
					if (oDiContent[i].getContent().length == '3') {
						if (oDiContent[i].getContent()[2].getText().split(' ').length == '4') {
							var vLower = Number(oDiContent[i].getContent()[2].getText().split(' ')[1]);
							var vHigher = Number(oDiContent[i].getContent()[2].getText().split(' ')[3]);
							var Value = parseFloat(vValue);
							var flag = isNaN(Value);
							if (flag == false) {
								if (Value < vLower || Value > vHigher) {
									if (Value > vHigher) {
										oDiContent[i].getContent()[1].setValue('');
									}
									oDiContent[i].getContent()[1].setValueStateText(oDiContent[i].getContent()[2].getText());
									oDiContent[i].getContent()[1].setValueState('Error');
									vMsg = oDiContent[i].getContent()[2].getText();
									vControl.focus();
									break;
								} else {
									oDiContent[i].getContent()[1].setValueState('None');
								}
							}

						} else {
							oDiContent[i].getContent()[1].setValueState('None');
						}
					}
				} else if (oDiContent[i].getContent()[1].getId().search('box') != '-1') { // combo
					//            vValue = oDiContent[i].getContent()[1].getValue();
				} else if (oDiContent[i].getContent()[1].getId().search('group') != '-1') { // radio
					//          vValue = oDiContent[i].getContent()[1].getSelectedButton().getText();
					vRadioIndex = oDiContent[i].getContent()[1].getSelectedIndex();
					vValue = oDiContent[i].getContent()[1].getSelectedKey();
				} else if (oDiContent[i].getContent()[1].getId().search('select') != '-1') { // select
					if (oDiContent[i].getContent()[1].getSelectedIndex() == -1) {
						vRadioIndex = "";
						vValue = "";
					} else {
						vRadioIndex = oDiContent[i].getContent()[1].getSelectedIndex();
						vValue = oDiContent[i].getContent()[1].getSelectedKey();
					}

				}
				if (oThat.oView.getModel("BATCH").getData()[i].EntryObligatory && !vValue) {
					vMsg = oThat.oView.getModel("BATCH").getData()[i].DescrChar + ' ' + oThat.oView.getModel("i18n").getResourceBundle()
						.getText('RMFG_ErrorMandit');
					vControl.focus();
					break;
				}
				//Added by Avinash
				var vCValue = "";

				if (oDiContent[i].getContent()[1].getId().search('input') != '-1') { // input
					vCValue = oDiContent[i].getContent()[1].getValue();
					if (vCValue == "") {
						n = n + 1;
					}
				}
				//End of Added
			}

			if (n == oDiContent.length) {
				vMsg = oThat.oView.getModel("i18n").getResourceBundle().getText('PlEnterAnyOneCharac');
			}

			if (vMsg) {
				MessageBox.error(vMsg);

			} else {

				for (var i = 0; i < oDiContent.length; i++) {
					var oGdConetnt = oDiContent[i].getContent();
					var vId = oDiContent[i].getContent()[1].getId();
					vControl = oDiContent[i].getContent()[1];
					var vValue = '',
						vRadioIndex = '';
					if (oDiContent[i].getContent()[1].getId().search('input') != '-1') { // input
						vValue = oDiContent[i].getContent()[1].getValue();
						if (oDiContent[i].getContent().length == '3') {
							if (oDiContent[i].getContent()[2].getText().split(' ').length == '4') {
								var vLower = Number(oDiContent[i].getContent()[2].getText().split(' ')[1]);
								var vHigher = Number(oDiContent[i].getContent()[2].getText().split(' ')[3]);
								//              var vValue = Number(oEvent.getSource().getValue());
								var Value = parseFloat(vValue);
								var flag = isNaN(Value);
								if (flag == false) {
									oDiContent[i].getContent()[1].setValueState('None');
								}

							} else {
								oDiContent[i].getContent()[1].setValueState('None');
							}
						}
					} else if (oDiContent[i].getContent()[1].getId().search('box') != '-1') { // combo
						//            vValue = oDiContent[i].getContent()[1].getValue();
					} else if (oDiContent[i].getContent()[1].getId().search('group') != '-1') { // radio
						//          vValue = oDiContent[i].getContent()[1].getSelectedButton().getText();
						vRadioIndex = oDiContent[i].getContent()[1].getSelectedIndex();
						vValue = oDiContent[i].getContent()[1].getSelectedKey();
					} else if (oDiContent[i].getContent()[1].getId().search('select') != '-1') { // select
						if (oDiContent[i].getContent()[1].getSelectedIndex() == -1) {
							vRadioIndex = "";
							vValue = "";
						} else {
							vRadioIndex = oDiContent[i].getContent()[1].getSelectedIndex();
							vValue = oDiContent[i].getContent()[1].getSelectedKey();
						}
					}
					for (var j = 0; j < oThat.oView.getModel("BATCH").getData().length; j++) {
						if (oThat.oView.getModel("BATCH").getData()[j].Werks ==
							oThat.oView.getModel("BATCH").getData()[i].Werks &&
							oThat.oView.getModel("BATCH").getData()[j].Matnr ==
							oThat.oView.getModel("BATCH").getData()[i].Matnr &&
							oThat.oView.getModel("BATCH").getData()[j].NameChar ==
							oThat.oView.getModel("BATCH").getData()[i].NameChar) {
							oThat.oView.getModel("BATCH").getData()[j].ValueChar = vValue;
							oThat.oView.getModel("BATCH").refresh(true);
							break;
						}
					}
				}
				oThat.Service = "SETCHAR";
				var oEntity = {
					"IFlag": "C",
					"ICharg": oThat.BatchObject.Lotno.toUpperCase(),
					"IMatnr": oThat.BatchObject.Matnr,
					"IWerks": oThat.BatchObject.Werks,
					"PostBatchCharNav": [],
					"ReturnNav": []
				};
				if (oThat.oView.getModel("BATCH").getData().length != 0) {
					var aBatchData = [];
					for (var b = 0; b < oThat.oView.getModel("BATCH").getData().length; b++) {
						// if (oThat.oView.getModel("BATCH").getData()[b].Flag !== undefined && oThat.oView.getModel("BATCH").getData()[b].ValueChar !== "") {
						// if (oThat.oView.getModel("BATCH").getData()[b].ValueChar !== "") {
						aBatchData.push({
							CValue: oThat.oView.getModel("BATCH").getData()[b].DataType === "NUM" ? oThat.oView.getModel("BATCH").getData()[b].ValueChar ===
								"" ? "0" : oThat.oView.getModel(
									"BATCH").getData()[b].ValueChar : oThat.oView.getModel(
									"BATCH").getData()[b].ValueChar,
							// CValue: oThat.oView.getModel("BATCH").getData()[b].ValueChar === "" ? "0" : oThat.oView.getModel("BATCH").getData()[b].ValueChar,
							CDesc: oThat.oView.getModel("BATCH").getData()[b].DescrChar,
							Atnam: oThat.oView.getModel("BATCH").getData()[b].NameChar,
							Disp: ""
						});
						// }
					}
					oEntity.PostBatchCharNav = aBatchData;
				}
				oThat.Service = "SETCHAR";
				oThat.onCallService(oThat.Service, oEntity);
			}
		},

		fnReprintDialog: function() {
			var oThat = this;
			oThat.Reprint = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.RePrint", oThat);
			oThat.oView.addDependent(oThat.Reprint);
			oThat.Reprint.open();
			oThat.ReprintOpen = "X";
			sap.ui.getCore().byId("id_InBatch").setVisible(true);
			sap.ui.getCore().byId("id_InBatchLabel").setVisible(true);
		},

		onClickReprintDecline: function() {
			oThat.Reprint.destroy();
			oThat.ReprintOpen = "";
		},

		fnClickonReprintOK: function() {
			var oThat = this;
			if (
				sap.ui.getCore().byId("id_InVehicleNo").getValue() === "" ||
				sap.ui.getCore().byId("id_InWbid").getValue() === "" ||
				sap.ui.getCore().byId("id_InDate").getValue() === "" ||
				sap.ui.getCore().byId("id_InDate").getValue() == null) {
				MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg7"));
			} else {
				var vSelectedLots = oThat.SelectedLots ? oThat.SelectedLots : ""; //Added by Avi on 22/4 UnLoading Screen - Ghana Changes
				var vWbid = sap.ui.getCore().byId("id_InWbid").getValue();
				var sServiceUrl = oThat.oModel.sServiceUrl;
				var sRead = "/DownloadSet(IvWbid='" + vWbid + "',IvPrint='X',GateEntry='X',IvBatch='" + vSelectedLots + "')/$value";
				var pdfURL = sServiceUrl + sRead;
				if (sap.ui.Device.system.desktop) {
					oThat.initiatePdfDialog();
					var oContent = "<div><iframe src=" + pdfURL + " width='100%' height='520'></iframe></div>";
					oThat.oImageDialog.getContent()[0].setContent(oContent);
					oThat.oImageDialog.addStyleClass("sapUiSizeCompact");
					oThat.oImageDialog.open();
				} else {
					window.open(pdfURL);
				}
				oThat.Reprint.destroy();
				oThat.ReprintOpen = "";
			}
		},
		// onClickVehicleF4: function(oEvent) {
		// 	var oThat = this;
		// 	oThat.vId = oEvent.getSource().getId();
		// 	var vDate = sap.ui.getCore().byId("id_InDate").getValue();
		// 	if (vDate !== null && vDate !== "") {
		// 		var vDate = sap.ui.getCore().byId("id_InDate").getDateValue();
		// 		var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
		// 			pattern: "yyyy-MM-ddT00:00:00"
		// 		});
		// 		var vInDate = vDateFormat.format(vDate);
		// 		oThat.Service = 'REPRINT';
		// 		var oEntity = {
		// 			"d": {
		// 				"GateEntry": "",
		// 				"VehAssign": "",
		// 				"PreQual": "",
		// 				"UnloadConf": "",
		// 				"GateExit": "",
		// 				"Inbound": "X",
		// 				"Outbound": "",
		// 				"IvDelivery": "",
		// 				"IvPo": "",
		// 				"IvWbid": "",
		// 				"IvWerks": "",
		// 				"StatusUpdate": "", //Changed to null by Avinash
		// 				"ReprintF4": "X", //Added by Avinash
		// 				"Approval": "",
		// 				"GetReturnNav": [],
		// 				"PoItemNav": [],
		// 				"QualWbidNav": [],
		// 				"WbItemNav": [],
		// 				"WsItemNav": [],
		// 				"WbHeaderNav": [],
		// 				"StatusUpdateNav": [{
		// 					"InDate": vInDate
		// 				}]
		// 			}
		// 		};
		// 		oThat.onCallService(oThat.Service, oEntity);
		// 	} else {
		// 		MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg6"));
		// 	}
		// },
		//End of Added..

		// Added by Avinash for PR Lot Based PrintOut - Ghana Changes
		// onPrLotF4: function(oEvent) {
		// 	var oThat = this;
		// 	oThat.vId = oEvent.getSource().getId();
		// 	var vDate = sap.ui.getCore().byId("id_InDate").getValue();
		// 	var vWbId = sap.ui.getCore().byId("id_InWbid").getValue();
		// 	if (vDate !== null && vDate !== "") {
		// 		if (vWbId) {
		// 			var vDate = sap.ui.getCore().byId("id_InDate").getDateValue();
		// 			var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
		// 				pattern: "yyyy-MM-ddT00:00:00"
		// 			});
		// 			var vInDate = vDateFormat.format(vDate);
		// 			oThat.Service = 'GETBATCH';
		// 			var oEntity = {
		// 				"d": {
		// 					"GateEntry": "",
		// 					"VehAssign": "",
		// 					"PreQual": "",
		// 					"UnloadConf": "",
		// 					"GateExit": "",
		// 					"Inbound": "X",
		// 					"Outbound": "",
		// 					"IvDelivery": "",
		// 					"IvPo": "",
		// 					"IvWbid": vWbId,
		// 					"IvWerks": "",
		// 					"StatusUpdate": "",
		// 					"ReprintF4": "",
		// 					"PrlotF4Print": "X", //Added by Avinash
		// 					"Approval": "",
		// 					"GetReturnNav": [],
		// 					"PoItemNav": [],
		// 					"QualWbidNav": [],
		// 					"WbItemNav": [],
		// 					"WsItemNav": [],
		// 					"WbHeaderNav": [],
		// 					"F4PrlotPrintNav": [],
		// 					"StatusUpdateNav": [{
		// 						"InDate": vInDate
		// 					}]
		// 				}
		// 			};
		// 			oThat.onCallService(oThat.Service, oEntity);
		// 		} else {
		// 			MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("PlSelTruck"));
		// 		}
		// 	} else {
		// 		MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg6"));
		// 	}

		// },

		// onChargF4Search: function(oEvent) {
		// 	var vValue = oEvent.getSource()._sSearchFieldValue;
		// 	if (vValue && vValue.length > 0) {
		// 		var oFilter1 = new sap.ui.model.Filter("Lotno", sap.ui.model.FilterOperator.Contains, vValue);
		// 		var oFilter2 = new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.Contains, vValue);
		// 		var oFilter3 = new sap.ui.model.Filter("Bwtar", sap.ui.model.FilterOperator.Contains, vValue);
		// 		var oFilter4 = new sap.ui.model.Filter("Maktx", sap.ui.model.FilterOperator.Contains, vValue);
		// 		var aAllFilter = new sap.ui.model.Filter([oFilter1, oFilter2, oFilter3, oFilter4]);
		// 	}
		// 	var binding = oEvent.getSource().getBinding("items");
		// 	binding.filter(aAllFilter);
		// },

		onChargF4Confirm: function(oEvent) {
			// var oView = this.getView();
			var aSelectedContexts = oEvent.getParameter("selectedContexts");
			if (oThat.ReprintOpen === "") {
				if (aSelectedContexts.length > 0) {
					var oSelectedItem = oEvent.getParameter('selectedItem');
					var aCharArr = [];
					var vConcatBatch = "";
					var vBatchSetValue = "";
					oThat.BatchObject = aSelectedContexts[0].getObject();
					for (var a = 0; a < aSelectedContexts.length; a++) {
						var oObject = aSelectedContexts[a].getObject();
						if (a === 0) {
							vConcatBatch = oObject.Lotno;
						} else {
							vConcatBatch = vConcatBatch + "*" + oObject.Lotno;
						}
						if (aSelectedContexts.length > 1) {
							vBatchSetValue = aSelectedContexts[0].getObject().Lotno + "+ " + oThat.oView.getModel("i18n").getResourceBundle().getText(
								"RemMore");
						} else {
							vBatchSetValue = aSelectedContexts[0].getObject().Lotno;
						}
					}
					oThat.SelectedLots = vConcatBatch;
					oThat.getView().byId("id_InBatchValue").setValue(vBatchSetValue);
					oThat.getView().byId("id_InPO").setValue(aSelectedContexts[0].getObject().Ebeln);
					oThat.getView().byId("id_InPrLot").setValue(aSelectedContexts[0].getObject().Bwtar);
					oThat.getView().byId("id_InMaktx").setValue(aSelectedContexts[0].getObject().Maktx);
					oThat.getView().byId("id_InMatnr").setValue(aSelectedContexts[0].getObject().Matnr);
					oThat.getView().byId("id_InUnloc").setValue(aSelectedContexts[0].getObject().Lgort);
					oThat.onPressCheck();
				}
				var oDialog = oThat.getView().byId("id_BatchPanel");
				oDialog.destroyContent();
				oThat.oView.byId("id_BtnSave").setEnabled(false);
			} else {
				if (aSelectedContexts.length > 0) {
					var oSelectedItem = oEvent.getParameter('selectedItem');
					var aCharArr = [];
					var vConcatBatch = "";
					var vBatchSetValue = "";
					for (var a = 0; a < aSelectedContexts.length; a++) {
						var oObject = aSelectedContexts[a].getObject();
						if (a === 0) {
							vConcatBatch = oObject.Lotno;
						} else {
							vConcatBatch = vConcatBatch + "*" + oObject.Lotno;
						}
						if (aSelectedContexts.length > 1) {
							vBatchSetValue = aSelectedContexts[0].getObject().Lotno + "+ " + oThat.oView.getModel("i18n").getResourceBundle().getText(
								"RemMore");
						} else {
							vBatchSetValue = aSelectedContexts[0].getObject().Lotno;
						}
					}
					oThat.SelectedLots = vConcatBatch;
					sap.ui.getCore().byId("id_InBatch").setValue(vBatchSetValue);
				}
			}
			oThat.LotF4.destroy();
		},

		initiatePdfDialog: function() {
			// var that = this;
			oThat.oImageDialog = new sap.m.Dialog({
				title: 'PDF',
				contentWidth: "100%",
				contentHeight: "",
				content: new sap.ui.core.HTML({}),
				beginButton: new sap.m.Button({
					text: 'Close',
					class: "sapUiSizeCompact",
					press: function() {
						oThat.oImageDialog.close();
						oThat.SelectedLots = ""; //Added by Avinash
						oThat.fnClearDatas();
						oThat.ProcessType = "";
						oThat.SelectedWbPlant = "";
						oThat.SelectedOrigin = "";
						oThat.oRouter.navTo("Inbound");
					}
				})
			});
		},

		fnChangeHatch: function(oEvent) {
			var self = this;
			if (oEvent.getSource().getBindingContext("JmLoadBags").getObject().Ebeln !== "") {
				var vSelectedKey = oEvent.getSource().getSelectedKey();
				oEvent.getSource().getBindingContext("JmLoadBags").getObject().Hatch = vSelectedKey;
				self.getView().getModel("JmLoadBags").refresh(true);
				self.getView().byId("id_BtnSavePort").setEnabled(true);
			} else {
				oEvent.getSource().setSelectedKey();
				sap.m.MessageToast.show(self.getView().getModel('i18n').getProperty("SelPrLot"));
			}
		},

		fnCalcBags: function(oEvent) {
			var that = this;
			var self = this;
			if (oEvent.getSource().getBindingContext("JmLoadBags").getObject().Ebeln !== "") {
				var svalue = oEvent.getSource().getValue();
				svalue = svalue.replace(/[^\d.]/g, '');
				var vErr = false;
				var iChars = ".!`@#$%^&*()+=[]\\\';,/{}|\":<>?~_abcdefghijklmnopqrstuvwxyz";
				for (var j = 0; j < svalue.length; j++) {
					if (iChars.indexOf(svalue.charAt(j)) != -1) {
						vErr = true;
						svalue = "0";
						// break;
					}
				}
				var index = svalue.indexOf(".");
				oEvent.getSource().setValue(svalue);
				var vIndex = oEvent.getSource().getBindingContext("JmLoadBags").sPath.split("/")[1];
				var vLotModel = self.getView().getModel("JmLoadBags");
				var vLotModelData = self.getView().getModel("JmLoadBags").getData();
				var vModOne = Number(svalue) % 1;
				if (vModOne === 0) {
					// if (Number(svalue) !== 0) { //Added by Avinash on 24th Mar 2022
					// if (vLotModelData[vIndex].LoadSoundBag !== "") {
					var vTotal = 0;
					vTotal += Number(vLotModelData[vIndex].LoadSoundBag);
					vTotal += Number(vLotModelData[vIndex].LoadTornBag);
					vTotal += Number(vLotModelData[vIndex].LoadModBag);
					vTotal += Number(vLotModelData[vIndex].LoadTornEmpty);
					vTotal += Number(vLotModelData[vIndex].LoadSampleBag);
					vLotModelData[vIndex].LoadTotBag = vTotal.toString();
					vLotModel.refresh(true);
					self.fnCalcTotMt(vIndex);
					// } else {
					// 	vLotModelData[vIndex].LoadTotBag = "";
					// 	vLotModel.refresh(true);
					// }
					// } else { //Changed on 7th June 22
					// 	var vTotal = 0;
					// 	vTotal += Number(vLotModelData[vIndex].LoadSoundBag);
					// 	vTotal += Number(vLotModelData[vIndex].LoadTornBag);
					// 	vTotal += Number(vLotModelData[vIndex].LoadModBag);
					// 	vTotal += Number(vLotModelData[vIndex].LoadTornEmpty);
					// 	vTotal += Number(vLotModelData[vIndex].LoadSampleBag);
					// 	vLotModelData[vIndex].LoadTotBag = vTotal.toString();
					// 	vLotModel.refresh(true);
					// 	self.fnCalcTotMt(vIndex);
					// 	oEvent.getSource().setValue("");
					// 	sap.m.MessageToast.show(that.getView().getModel('i18n').getProperty("EnterValidBags"));
					// }
				} else {
					oEvent.getSource().setValue("0");
					sap.m.MessageToast.show(that.getView().getModel('i18n').getProperty("EnterValidBags"));
				}
				if (vErr) {
					oEvent.getSource().setValue("0");
					sap.m.MessageToast.show(that.getView().getModel('i18n').getProperty("EnterValidBags"));
				}
			} else {
				oEvent.getSource().setValue("");
				sap.m.MessageToast.show(that.getView().getModel('i18n').getProperty("SelPrLot"));
			}
		},

		fnCalcTotMt: function(vIndex) {
			var self = this;
			var vLotModelData = self.getView().getModel("JmLoadBags").getData();
			var vTotBags = vLotModelData[vIndex].LoadTotBag;
			var that = this;
			self.BusyDialog.open();
			var oEntity = {
				"IFlag": "W",
				"ICharg": "",
				"IMatnr": vLotModelData[vIndex].Matnr,
				"IWerks": oThat.BatchObject.Werks,
				"TruckNo": oThat.getView().byId("id_InVehicleNoBatch").getValue(),
				"Lifnr": "",
				"WbId": "",
				"LoadTotBag": vTotBags,
				"LoadWt": "0.000",
				"PostBatchCharNav": [],
				"ReturnNav": []
			};
			self.getView().getModel().create("/PostBatchCharUpdSet", oEntity, {
				success: function(Idata, Iresponse) {
					self.getView().getModel("JmLoadBags").getData()[vIndex].LoadWt = Idata.LoadWt;
					self.getView().getModel("JmLoadBags").refresh();
					self.getView().byId("id_BtnSavePort").setEnabled(true);
					self.BusyDialog.close();
				},
				error: function(Ierror) {
					that.BusyDialog.close();
				}
			});
		},

		//=================================================================================//
		//====================== Nav back =================================================//
		//=================================================================================//
		onNavBack: function() {
			this.oRouter.navTo("Inbound");
		}

	});

});