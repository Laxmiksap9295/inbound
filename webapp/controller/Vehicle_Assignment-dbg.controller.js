var oThat;
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/BusyDialog",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"ZGT_MM_INBOUND/Util/Formatter",
	"sap/m/MessageToast"
], function(Controller, MessageBox, BusyDialog, JSONModel, Filter, Formatter, MessageToast) {
	"use strict";

	return Controller.extend("ZGT_MM_INBOUND.controller.Vehicle_Assignment", {
		onInit: function() {
			oThat = this;
			oThat.oView = this.getView();
			oThat.Core = sap.ui.getCore();
			oThat.BusyDialog = new BusyDialog();
			oThat.oView = this.getView();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("VehicleAssignment").attachMatched(this._onRouteMatched, this);
		},
		//======================================================================================//
		//========================= Router matched handler function ===========================//
		//====================================================================================//
		_onRouteMatched: function(oEvent) {
			oThat = this;
			oThat.oView = oThat.getView();
			oThat.Core = sap.ui.getCore();
			oThat.oModel = oThat.getOwnerComponent().getModel();
			if (sap.ui.Device.system.phone) {
				oThat.oDevice = "P";
			} else {
				oThat.oDevice = "D";
			}
			oThat.oDataInitial = {
				// Static data
				"Items": [{
					columnKey: "Wbid",
					text: oThat.oView.getModel("i18n").getResourceBundle().getText("Column1")
				}, {
					columnKey: "Vehno",
					text: oThat.oView.getModel("i18n").getResourceBundle().getText("Column4")
				}, {
					columnKey: "DriverMob",
					text: oThat.oView.getModel("i18n").getResourceBundle().getText("Column10")
				}, {
					columnKey: "Erdat",
					text: oThat.oView.getModel("i18n").getResourceBundle().getText("Column2")
				}, {
					columnKey: "Ertim",
					text: oThat.oView.getModel("i18n").getResourceBundle().getText("Column3")
				}],
				// Runtime data
				"ColumnsItems": [{
					columnKey: "Wbid",
					visible: true,
					index: 0
				}, {
					columnKey: "Vehno",
					visible: true,
					index: 1
				}, {
					columnKey: "DriverMob",
					visible: true,
					index: 2
				}, {
					columnKey: "Erdat",
					visible: false,
					index: 3
				}, {
					columnKey: "Ertim",
					visible: false,
					index: 4
				}]
			};
			oThat.oDataBeforeOpen = {};
			oThat.oPersonalModel = new JSONModel(jQuery.extend(true, {}, oThat.oDataInitial));
			oThat.oView.setModel(oThat.oPersonalModel);
			var oVisible = {
				"QRCode": true,
				"Manual": false
			};
			oThat.oView.setModel(new JSONModel(oVisible), "VISI");
			oThat.aQRCodeArray = [];
			oThat.oView.setModel(new JSONModel(oThat.aQRCodeArray), "POLIST");
			oThat.Service = 'HEAD';
			var oEntity = {
				"d": {
					"GateEntry": "",
					"VehAssign": "X",
					"PreQual": "",
					"UnloadConf": "",
					"GateExit": "",
					"Inbound": "X",
					"Outbound": "",
					"IvDelivery": "",
					"IvPo": "",
					"IvWbid": "",
					"IvWerks": "",
					"DelItemNav": [],
					"FifoWbidNav": [],
					"GetReturnNav": [],
					"PoItemNav": [],
					"QualWbidNav": [],
					"WbItemNav": [],
					"WsItemNav": [],
					"WbHeaderNav": []
				}
			};
			oThat.onCallService(oThat.Service, oEntity);

		},
		//====================================================================================//
		//==================== Call Service =================================================//
		//===================================================================================//
		onCallService: function(service, Data) {
			oThat.BusyDialog.open();
			if (oThat.Service === 'HEAD' || oThat.Service === 'ITEM') {
				oThat.oModel.create("/GetHeadersSet", Data, {
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service == 'VALIDATE') {
				oThat.oModel.create("/GetHeadersSet", Data, {
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service == 'SAVE') {

				oThat.oModel.create("/PostHeadersSet", Data, {
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service === 'F4MODEL' || oThat.Service === 'Plant' ||
				oThat.Service === 'Transport') {
				oThat.oModel.read("/F4ParametersSet", {
					filters: Data,
					urlParameters: {
						$expand: "F4DirectionNav,F4ProcessNav,F4PlantNav,F4TransporterNav,F4VehTypeNav"
					},
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service == 'MaterialF4') {
				oThat.oModel.read("/F4MaterialSet", {
					filters: Data,
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service == "Vendor") {
				oThat.oModel.read("/F4TransportersSet", {
					filters: Data,
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			}

		},
		mySuccessHandler: function(oData, oResponse) {
			oThat.BusyDialog.close();
			if (oThat.Service === 'HEAD') {
				oThat.oView.setModel(new JSONModel(oData), "HEADER");
				oThat.oView.getModel("HEADER").refresh(true);
				// if(oData.FifoWbidNav != null){
				if (oData.FifoWbidNav.length != 0) {
					var vIndex = oData.FifoWbidNav.results.length - 1;
					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "dd.MM.yyyy"
					});
					var vDate = dateFormat.format(oData.FifoWbidNav.results[vIndex].Erdat);
					oThat.oView.byId("id_Today").setText(vDate);
					oThat.Service = 'F4MODEL';
					var filter = [
						new Filter("ProcessType", sap.ui.model.FilterOperator.EQ, 'X'),
						new Filter("Plant", sap.ui.model.FilterOperator.EQ, 'X'),
						//	new Filter("Transporter", sap.ui.model.FilterOperator.EQ, 'X'),
						new Filter("Vehtype", sap.ui.model.FilterOperator.EQ, 'X')
					];
					// oThat.createList();
					oThat.onCallService(oThat.Service, filter);
				}
				// }
			} else if (oThat.Service == 'VALIDATE') {
				// if (oData.GetReturnNav != null) {
				if (oData.GetReturnNav.results.length != 0) {
					var aError = oData.GetReturnNav.results.filter(function(x) {
						if (x.Type == 'E') {
							return x;
						}
					});
					if (aError != 0) {
						MessageBox.error(aError[0].Message);
					} else {
						sap.ui.getCore().byId("id_InManual").setValue("");
						if (sap.ui.getCore().byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text3")) {
							oThat.oView.setModel(new JSONModel(oData.PoItemNav), "oPoitemModel");
							oThat.oView.getModel("oPoitemModel").refresh();
							oThat.oPoItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PoItemList", oThat);
							oThat.oView.addDependent(oThat.oPoItemFrag);
							oThat.oPoItemFrag.open();
						} else if (sap.ui.getCore().byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text21")) {
							// oThat.oView.getModel("POLIST").setData([]);
							oData.PoItemNav.results[0].Parnr = sap.ui.getCore().byId("id_Vendor").getValue();
							oThat.oView.getModel("POLIST").getData().push(oData.PoItemNav.results[0]);
							oThat.oView.getModel("POLIST").refresh(true);
						} else if (sap.ui.getCore().byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text4")) {
							oThat.oView.setModel(new JSONModel(oData.DelItemNav), "oPoitemModel");
							oThat.oView.getModel("oPoitemModel").refresh();
							oThat.oPoItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.DelItemList", oThat);
							oThat.oView.addDependent(oThat.oPoItemFrag);
							oThat.oPoItemFrag.open();
						}
					}

				}
				// }
				else {
					sap.ui.getCore().byId("id_InManual").setValue("");
					if (sap.ui.getCore().byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text3")) {
						oThat.oView.setModel(new JSONModel(oData.PoItemNav), "oPoitemModel");
						oThat.oView.getModel("oPoitemModel").refresh();
						oThat.oPoItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PoItemList", oThat);
						oThat.oView.addDependent(oThat.oPoItemFrag);
						oThat.oPoItemFrag.open();
					} else if (sap.ui.getCore().byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text21")) {
						// oThat.oView.getModel("POLIST").setData([]);
						oData.PoItemNav.results[0].Parnr = sap.ui.getCore().byId("id_Vendor").getValue();
						oThat.oView.getModel("POLIST").getData().push(oData.PoItemNav.results[0]);
						oThat.oView.getModel("POLIST").refresh(true);
					} else if (sap.ui.getCore().byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text4")) {
						oThat.oView.setModel(new JSONModel(oData.DelItemNav), "oPoitemModel");
						oThat.oView.getModel("oPoitemModel").refresh();
						oThat.oPoItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.DelItemList", oThat);
						oThat.oView.addDependent(oThat.oPoItemFrag);
						oThat.oPoItemFrag.open();
					}
				}

			} else if (oThat.Service == 'ITEM') {
				oThat.EvWtype = oData.EvWtype;
				oThat.oView.setModel(new JSONModel(oData), "ITEM");
				oThat.oView.getModel("ITEM").refresh(true);
				// if(oData.GetReturnNav  != null){
				if (oData.GetReturnNav.results.length != 0) {
					var aError = oData.GetReturnNav.results.filter(function(x) {
						if (x.Type == 'E') {
							return x;
						}
					});
					if (aError != 0) {
						var Message;
						for (var i = 0; i < aError.length; i++) {
							Message = aError[i].Message + "\n";
						}
						MessageBox.show(Message, {
							icon: MessageBox.Icon.ERROR,
							title: oThat.oView.getModel("i18n").getResourceBundle().getText("Title21"),
							actions: [MessageBox.Action.OK],
							onClose: function(oAction) {}
						});
					} else {
						var aWarning = oData.GetReturnNav.results.filter(function(x) {
							if (x.Type == 'W') {
								return x;
							}
						});
						if (aWarning != 0) {
							for (var i = 0; i < aWarning.length; i++) {
								Message = aWarning[i].Message + "\n";
							}
							MessageBox.show(Message, {
								icon: MessageBox.Icon.WARNING,
								title: oThat.oView.getModel("i18n").getResourceBundle().getText("Title22"),
								actions: [MessageBox.Action.OK],
								onClose: function(oAction) {
									oThat.VehicleAssign = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.VehicleAssignment", oThat);
									oThat.oView.addDependent(oThat.VehicleAssign);
									oThat.VehicleAssign.open();
									sap.ui.getCore().byId("id_scanid").setState(true);
								}
							});
						}

					}
				}
				// }
				else {
					oThat.VehicleAssign = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.VehicleAssignment", oThat);
					oThat.oView.addDependent(oThat.VehicleAssign);
					oThat.VehicleAssign.open();
				}
			} else if (oThat.Service == 'SAVE') {
				// if(oData.PostReturnNav != null){
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
						oData = [];
						oThat.oView.setModel(new JSONModel(oData), "ITEM");
						oThat.oView.getModel("ITEM").refresh(true);
						oThat.VehicleAssign.destroy();
						oThat.aQRCodeArray = [];
						oThat.oView.getModel("POLIST").setData(oThat.aQRCodeArray);
						oThat.oView.getModel("POLIST").refresh(true);
						oThat.Service = 'HEAD';
						var oEntity = {
							"d": {
								"GateEntry": "",
								"VehAssign": "X",
								"PreQual": "",
								"UnloadConf": "",
								"GateExit": "",
								"Inbound": "X",
								"Outbound": "",
								"IvDelivery": "",
								"IvPo": "",
								"IvWbid": "",
								"IvWerks": "",
								"DelItemNav": [],
								"FifoWbidNav": [],
								"GetReturnNav": [],
								"PoItemNav": [],
								"QualWbidNav": [],
								"WbItemNav": [],
								"WsItemNav": [],
								"WbHeaderNav": []
							}
						};
						oThat.onCallService(oThat.Service, oEntity);
					}
				}
				// }
			} else if (oThat.Service === 'F4MODEL') {
				oThat.getOwnerComponent().getModel("F4Model").setData(oData);
				oThat.getOwnerComponent().getModel("F4Model").refresh(true);
			}
			// else if (oThat.Service === 'Plant'){
			// 	oThat.oView.setModel(new JSONModel(oData), "oPlantModel");
			// 	oThat.oView.getModel("oPlantModel").refresh(true);
			// }
			else if (oThat.Service === 'Transport') {
				oThat.oView.setModel(new JSONModel(oData), "oTrnsportModel");
				//	oThat.getOwnerComponent().getModel("oVehTyModel").setData(oData);
				oThat.oView.getModel("oTrnsportModel").refresh(true);
			} else if (oThat.Service == 'MaterialF4') {
				var oJsonModel = new JSONModel(oData);
				oJsonModel.setSizeLimit(oData.length);
				oThat.oView.setModel(oJsonModel, "Material");
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
		//===================================================================================//
		//============================= Vehicle Assignment List presss ======================//
		//===================================================================================//
		onPressVAListItem: function(oEvent) {

			var oView = this.getView();
			var oThat = this;
			var oVisible = {
				"QRCode": true,
				"Manual": false
			};
			oThat.oView.getModel("VISI").setData(oVisible);
			oThat.oView.getModel("VISI").refresh(true);
			var vPath = oEvent.getSource().getBindingContextPath();
			var oBject = oView.getModel("HEADER").getObject(vPath);
			var oEntity = {
				"d": {
					"GateEntry": "",
					"VehAssign": "X",
					"PreQual": "",
					"UnloadConf": "",
					"GateExit": "",
					"Inbound": "",
					"Outbound": "",
					"IvDelivery": "",
					"IvPo": "",
					"IvWbid": oBject.Wbid,
					"IvWerks": "",
					"DelItemNav": [],
					"FifoWbidNav": [],
					"GetReturnNav": [],
					"PoItemNav": [],
					"QualWbidNav": [],
					"WbItemNav": [],
					"WsItemNav": [],
					"WbHeaderNav": []
				}
			};
			oThat.Service = 'ITEM';
			oThat.onCallService(oThat.Service, oEntity);
		},
		onClickBack: function() {
			oThat.VehicleAssign.destroy();
			oThat.aQRCodeArray = [];
			oThat.oView.getModel("POLIST").setData(oThat.aQRCodeArray);
			oThat.oView.getModel("POLIST").refresh(true);
		},
		//============================== F4 Help =========================================//
		onValueHelpPress: function(oEvent) {
			oThat.vId = oEvent.getSource().getId();
			oEvent.getSource().setValueState('None');
			if (oThat.vId.indexOf("id_InPlant") != -1) {
				oThat.ValueHelp = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Plant", oThat);
				oThat.oView.addDependent(oThat.ValueHelp);
				oThat.ValueHelp.open();
			} else if (oThat.vId.indexOf("id_InGate") != -1) {
				oThat.ValueHelp = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Gate", oThat);
				oThat.oView.addDependent(oThat.ValueHelp);
				oThat.ValueHelp.open();
				oThat.Service = 'GATE';
				var filter = [
					new Filter("Werks", sap.ui.model.FilterOperator.EQ, oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Werks),
					new Filter("Wbobj", sap.ui.model.FilterOperator.EQ, oThat.EvWtype)
				];
				oThat.onCallService(oThat.Service, filter);
			} else if (oThat.vId.indexOf("id_InTransport") != -1) {
				oThat.ValueHelp = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Transporter", oThat);
				oThat.oView.addDependent(oThat.ValueHelp);
				oThat.ValueHelp.open();
				if (oThat.vId.indexOf("id_InTransport") != -1) {
					sap.ui.getCore().byId("id_TranportFrag").setTitle(oThat.oView.getModel("i18n").getResourceBundle().getText("Title7"));
				}
				// else if (oThat.vId.indexOf("id_Vendor") != -1){
				// 	sap.ui.getCore().byId("id_TranportFrag").setTitle(oThat.oView.getModel("i18n").getResourceBundle().getText("Label25"));
				// }
				oThat.Service = 'Transport';
				var filter = [
					new Filter("Transporter", sap.ui.model.FilterOperator.EQ, 'X')
				];
				// oThat.createList();
				oThat.onCallService(oThat.Service, filter);
			} else if (oThat.vId.indexOf("id_Vendor") != -1) {
				// sap.ui.getCore().byId("id_TranportFrag").setTitle(oThat.oView.getModel("i18n").getResourceBundle().getText("Label25"));
				oThat.ValueHelp = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Vendor", oThat);
				oThat.oView.addDependent(oThat.ValueHelp);
				oThat.ValueHelp.open();
				oThat.Service = 'Vendor';
				var filter = [
					new Filter("Werks", sap.ui.model.FilterOperator.EQ, oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Werks)
				];
				// oThat.createList();
				oThat.onCallService(oThat.Service, filter);
			} else if (oThat.vId.indexOf("id_InManual") != -1) {
				oThat.ValueHelp = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.MaterialF4", oThat);
				oThat.oView.addDependent(oThat.ValueHelp);
				oThat.ValueHelp.open();
				oThat.Service = 'MaterialF4';
				var filter = [
					//	new Filter("ProcessType", sap.ui.model.FilterOperator.EQ, 'X'),
					new Filter("Werks", sap.ui.model.FilterOperator.EQ, oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Werks)
					// new Filter("Transporter", sap.ui.model.FilterOperator.EQ, 'X'),
					//	new Filter("Vehtype", sap.ui.model.FilterOperator.EQ, 'X')
				];
				// oThat.createList();
				oThat.onCallService(oThat.Service, filter);
			}

		},
		onValueHelpSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter;
			if (oThat.vId.indexOf("id_InPlant") != -1) {
				oFilter = new sap.ui.model.Filter([
					new Filter("Werks", sap.ui.model.FilterOperator.Contains, sValue),
					new Filter("Name1", sap.ui.model.FilterOperator.Contains, sValue)
				]);
			} else if (oThat.vId.indexOf("id_InGate") != -1) {
				oFilter = new sap.ui.model.Filter([
					new Filter("Gate", sap.ui.model.FilterOperator.Contains, sValue)
				]);
			} else if (oThat.vId.indexOf("id_InTransport") != -1) {
				oFilter = new sap.ui.model.Filter([
					new Filter("Parnr", sap.ui.model.FilterOperator.Contains, sValue),
					new Filter("Name1", sap.ui.model.FilterOperator.Contains, sValue)
				]);
			} else if (oThat.vId.indexOf("id_Vendor") != -1) {
				oFilter = new sap.ui.model.Filter([
					new Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue),
					new Filter("Name1", sap.ui.model.FilterOperator.Contains, sValue)
				]);
			} else if (oThat.vId.indexOf("id_InManual") != -1) {
				oFilter = new sap.ui.model.Filter([
					new Filter("Matnr", sap.ui.model.FilterOperator.Contains, sValue),
					new Filter("Maktx", sap.ui.model.FilterOperator.Contains, sValue)
				]);
			}
			var oFilter2 = new sap.ui.model.Filter(oFilter, false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter2]);
		},
		onValueHelpCancel: function() {
			oThat.ValueHelp.destroy();
		},
		onValueHelpConfirm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter('selectedItem');
			if (oThat.vId.indexOf("id_InPlant") != -1) {
				oThat.oView.getModel("POST").getData().WbHeaderNav.results[0].Werks = oSelectedItem.getDescription();
				oThat.oView.getModel("POST").refresh(true);
			} else if (oThat.vId.indexOf("id_InGate") != -1) {
				oThat.oView.getModel("POST").getData().WbHeaderNav.results[0].Gate = oSelectedItem.getTitle();
			} else if (oThat.vId.indexOf("id_InTransport") != -1) {
				oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Lifnr = oSelectedItem.getTitle();
			} else if (oThat.vId.indexOf("id_Vendor") != -1) {
				oThat.Core.byId("id_Vendor").setValue(oSelectedItem.getDescription());
			} else if (oThat.vId.indexOf("id_InManual") != -1) {
				oThat.Core.byId("id_InManual").setValue(oSelectedItem.getTitle());
			}
			oThat.oView.getModel("ITEM").refresh(true);
			oThat.ValueHelp.destroy();
		},
		onLiveChange: function(oEvent) {
			oThat.vId = oEvent.getSource().getId();
			oEvent.getSource().setValueState('None');
		},

		onChangeProcess: function(oEvent) {
			var vId = oEvent.getSource().getId();
			var vProcess = oEvent.getSource().getSelectedKey();
			var vProcessText = oEvent.getSource()._getSelectedItemText();
			if (vId.indexOf("id_ComboProcess") != -1) {

				var vPo = oEvent.getSource().getModel("F4Model").getData().results[0].F4ProcessNav.results.filter(function(obj) {
					return obj.Name1 == vProcessText;
				});
				oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Wtype = vProcess;
				if (vPo.length != 0) {
					if (vPo[0].Po == 'X') {
						oThat.Core.byId("id_POBtn").setText(oThat.oView.getModel("i18n").getResourceBundle().getText("Text3"));
						oThat.Core.byId("id_VendorBox").setVisible(false);
						oThat.Core.byId("id_InManual").setMaxLength(10);
						oThat.Core.byId("id_InManual").setShowValueHelp(false);
						oThat.Core.byId("id_InManual").setValue("");
					} else if (vPo[0].Po == 'M') {
						oThat.Core.byId("id_POBtn").setText(oThat.oView.getModel("i18n").getResourceBundle().getText("Text21"));
						oThat.Core.byId("id_VendorBox").setVisible(true);
						oThat.Core.byId("id_InManual").setMaxLength(18);
						oThat.Core.byId("id_InManual").setShowValueHelp(true);
						oThat.Core.byId("id_InManual").setValue("");
					} else {
						oThat.Core.byId("id_POBtn").setText(oThat.oView.getModel("i18n").getResourceBundle().getText("Text4"));
						oThat.Core.byId("id_VendorBox").setVisible(false);
						oThat.Core.byId("id_InManual").setMaxLength(10);
						oThat.Core.byId("id_InManual").setShowValueHelp(false);
						oThat.Core.byId("id_InManual").setValue("");
					}
				}
			} else if (vId.indexOf("id_VehicleTy") != -1) {
				oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Vehtyp = vProcess;
			}
			oThat.oView.getModel("ITEM").refresh(true);

		},
		//=================================================================================//
		//============================ Switch Change ======================================//
		//================================================================================//
		onSwitchChange: function(oEvent) {
			if (oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Wtype !== "") {
				if (oEvent.getSource().getState() == true) {
					oThat.oView.getModel("VISI").getData().Manual = false;
					oThat.oView.getModel("VISI").getData().QRCode = true;
				} else {
					oThat.oView.getModel("VISI").getData().Manual = true;
					oThat.oView.getModel("VISI").getData().QRCode = false;
				}
				oThat.oView.getModel("VISI").refresh(true);
			} else {
				MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg17"));
			}

		},
		//==================================================================================//
		//========================= Barcode Scan success ==================================//
		//=================================================================================//
		onScanBarcode: function(oEvent) {
			/*	cordova.plugins.barcodeScanner.scan(function(result) {
					 var vVlaue = oEvent.getParameter("text");
					 var vPo = vVlaue.slice(0,10);
					 oThat.onQRValidate(vPo);
				 }, function(error) {
				 sap.m.MessageBox.error("Unable to capture the Qr Code.");
				 });*/
			if (oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Wtype !== "") {
				var vVlaue = oEvent.getParameter("text");
				if (vVlaue != "") {
					var vPo = vVlaue.slice(0, 10);
					oThat.onQRValidate(vPo);
				}
			} else {
				MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg17"));
			}
		},
		fnBarcodeFailed: function() {
			sap.m.MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg1"));
		},
		//==================================== Get manual data ============================//
		onPressManualQROK: function(oEvent) {
			var vVlaue = sap.ui.getCore().byId("id_InManual").getValue();
			if (vVlaue == "") {
				MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg14"));
			}
			// else if(oThat.Core.byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text21")){
			// 	if(sap.ui.getCore().byId("id_Vendor").getValue() == ""){
			// 		MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg15"));
			// 	}
			// 	else {
			// 		oThat.onQRValidate(vVlaue);
			// 	}
			// }
			else {
				oThat.onQRValidate(vVlaue);
			}

		},
		//===================================== Creat Manaul Input ========================//
		onPressClear: function(oEvent) {
			sap.ui.getCore().byId("id_InManual").setValue("");
		},
		onQRValidate: function(vVlaue) {
			var vIvMatnr = "";
			var vVbeln = "";
			var vEbeln = "";
			if (sap.ui.getCore().byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text21")) {
				vIvMatnr = "X";
			} else {
				vIvMatnr = "";
			}
			if (sap.ui.getCore().byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text4")) {
				vVbeln = vVlaue;
			}
			if (sap.ui.getCore().byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text3")) {
				vEbeln = vVlaue;
			}
			var oEntity = {
				"d": {
					"GateEntry": "",
					"VehAssign": "X",
					"PreQual": "",
					"UnloadConf": "",
					"GateExit": "",
					"Inbound": "X",
					"Outbound": "",
					"IvDelivery": vVbeln,
					"IvPo": vEbeln,
					"IvWbid": "",
					"IvMatnr": vIvMatnr,
					"IvWerks": oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Werks,
					"DelItemNav": [

					],
					"FifoWbidNav": [

					],
					"GetReturnNav": [

					],
					"PoItemNav": [

					],
					"QualWbidNav": [

					],
					"WbItemNav": [

					],
					"WsItemNav": [

					],
					"WbHeaderNav": [

					]
				}
			};

			if (sap.ui.getCore().byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text4")) {
				oEntity.d.DelItemNav.push({
					"Vbeln": vVlaue
				});
			} else if (sap.ui.getCore().byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text21")) {
				oEntity.d.PoItemNav.push({
					"Matnr": vVlaue,
					"Vendor": sap.ui.getCore().byId("id_Vendor").getValue()
				});
			} else {
				oEntity.d.PoItemNav.push({
					"Ebeln": vVlaue
				});
			}
			oThat.Service = 'VALIDATE';
			oThat.onCallService(oThat.Service, oEntity);
		},
		//=================================================================================//
		//================================= On Save  ======================================//
		//=================================================================================//
		onPressSave: function(oEvent) {
			var aPayLoad = oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0];
			try {
				var flag = false;
				if (aPayLoad.Werks == "" || aPayLoad.Werks == undefined) {
					flag = true;
					oThat.Core.byId("id_InPlant").setValueState('Error');
				}
				if (aPayLoad.Wtype == "" || aPayLoad.Wtype == undefined) {
					flag = true;
					oThat.Core.byId("id_ComboProcess").setValueState('Error');
				}
				if (oThat.EvWtype == "WB") {
					if (aPayLoad.Gate == "" || aPayLoad.Gate == undefined) {
						flag = true;
						oThat.Core.byId("id_InGate").setValueState('Error');
					}
				}
				if (oThat.EvWtype == "WS") {
					if (aPayLoad.Wsgate == "" || aPayLoad.Wsgate == undefined) {
						flag = true;
						oThat.Core.byId("id_InGate").setValueState('Error');
					}
				}
				if (aPayLoad.Vehno == "" || aPayLoad.Vehno == undefined) {
					flag = true;
					oThat.Core.byId("id_VehiNo").setValueState('Error');
				}
				if (flag == true) {
					var err = "MN";
					throw err;
				} else if (oThat.oView.getModel("POLIST").getData().length === 0) {
					var err = "PO";
					throw err;
				} else {
					var vGate = "";
					var vWsGate = "";
					if (oThat.EvWtype == "WB") {
						vGate = oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Gate;
					} else {
						vWsGate = oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Wsgate;
					}
					var vIvMatnr = "";
					if (sap.ui.getCore().byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text21")) {
						vIvMatnr = "X";
					} else {
						vIvMatnr = "";
					}
					var vWtype = "";
					var vProcess = oEvent.getSource().getModel("F4Model").getData().results[0].F4ProcessNav.results.filter(function(obj) {
						return obj.SeqNo == oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Wtype;
					});
					if (vProcess.length != 0) {
						vWtype = vProcess[0].Process;
					}
					var oObject = {
						"Werks": oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Werks,
						"Lifnr": oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Lifnr,
						"Gate": vGate,
						"Wsgate": vWsGate,
						"Vehno": oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Vehno,
						"Vehtyp": oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Vehtyp,
						"Dname": oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Dname,
						"DriverMob": oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].DriverMob,
						//	"Remark"		: oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Remark,
						"Wtype": vWtype,
						"Wbid": oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Wbid
					};
					var oEntity = {
						"d": {
							"GateEntry": "",
							"VehAssign": "X",
							"PreQual": "",
							"UnloadConf": "",
							"GateExit": "",
							"Inbound": "X",
							"Outbound": "",
							"IvWboj": oThat.EvWtype,
							"IvMatnr": vIvMatnr,
							"PostReturnNav": [],
							"PostWbHeaderNav": [],
							"PostWbitemNav": [],
							"PostWsItemNav": []
						}
					};
					oEntity.d.PostWbHeaderNav.push(oObject);
					if (oThat.oView.getModel("POLIST").getData().length != 0) {
						oThat.oView.getModel("POLIST").getData().forEach(function(obj) {
							var Ebelp = "00000";
							var posnr = "000000";
							var Ebeln = "";
							var Vbeln = "";
							var parnr = "";
							if (sap.ui.getCore().byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text4")) {
								Ebelp = "00000";
								posnr = obj.Posnr;
								Vbeln = obj.Vbeln;
								parnr = obj.Werks;
							} else if (sap.ui.getCore().byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text21")) {
								Ebelp = "00000";
								posnr = "000000";
								parnr = obj.Parnr;
							} else {
								posnr = "000000";
								Ebelp = obj.Ebelp;
								Ebeln = obj.Ebeln;
								parnr = obj.Parnr;
							}
							if (oThat.EvWtype == "WB") {
								// oEntity.d.PostWbitemNav.push(obj);
								oEntity.d.PostWbitemNav.push({
									"Ebeln": Ebeln,
									"Ebelp": Ebelp,
									"Matnr": obj.Matnr,
									"Parnr": parnr,
									"Item": obj.Item,
									"Vbeln": Vbeln,
									"Posnr": posnr,
									"Brgew": "0",
									"Gdate": null,
									"Gtime": "PT00H00M00S",
									"Sgdate": null,
									"Sgtime": "PT00H00M00S",
									"Trwgt": "0",
									"Tdate": null,
									"Ttime": "PT00H00M00S",
									"Stdate": null,
									"Sttime": "PT00H00M00S",
									"Ntgew": "0.000",
									"Pkwgt": "0.000",
									"Menge": "0.000",
									"Pmatno1": "0.000",
									"Pmatqty1": "0.000",
									"Trwgt1": "0.000",
									"Pmatno2": "0.000",
									"Pmatqty2": "0.000",
									"Trwgt2": "0.000",
									"Pmatno3": "0.000",
									"Pmatqty3": "0.000",
									"Trwgt3": "0.000",
									"Pmatno4": "0.000",
									"Pmatqty4": "0.000",
									"Trwgt4": "0.000",
									"Actweight": "0.000",
									"Config2": "0.00",
									"Config8": "0.00",
									"Zeile": "0000"
								});
							} else {
								// oEntity.d.PostWsItemNav.push(obj);
								oEntity.d.PostWsItemNav.push({
									"Vbeln": Vbeln,
									"Matnr": obj.Matnr,
									"Posnr": posnr,
									"Item": obj.Item,
									"Parnr": parnr,
									"Ebelp": Ebelp,
									"Ebeln": Ebeln,
									"Pmatno1": "0",
									"Pmatqty1": "0.000",
									"Trwgt1": "0.000",
									"Pmatno2": "0.000",
									"Pmatqty2": "0.000",
									"Trwgt2": "0.000",
									"Pmatno3": "0.000",
									"Pmatqty3": "0.000",
									"Trwgt3": "0.000",
									"Pmatno4": "0.000",
									"Pmatqty4": "0.000",
									"Trwgt4": "0.000",
									"Bgtrwt": "0.000",
									"Brgew": "0.000",
									"Ntgew": "0.000",
									"Gdate": null,
									"Gtime": "PT00H00M00S",
									"Sgdate": null,
									"Sgtime": "PT00H00M00S",
									"Erdat": null,
									"Ertim": "PT00H00M00S",
									"Aedat": null,
									"Aetim": "PT00H00M00S",
									"Config8": "0.00",
									"Config2": "0.00",
									"Zeile": "0000"
								});
							}

						});
					}
					oThat.Service = 'SAVE';
					oThat.onCallService(oThat.Service, oEntity);
				}
			} catch (err) {
				if (err == 'MN') {
					MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg1"));
				} else if (err == 'PO') {
					MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg13"));
				}

			}
		},
		//=================================================================================//
		onClosePoIteList: function(oEvent) {
			MessageBox.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ConfirmMsg1"), {
				icon: MessageBox.Icon.INFORMATION,
				title: oThat.oView.getModel("i18n").getResourceBundle().getText("Title16"),
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function(oAction) {
					if (oAction === 'YES') {
						var vSelectItems = sap.ui.getCore().byId("id_PoItemList").getSelectedItems();
						if (vSelectItems.length != 0) {
							for (var i = 0; i < vSelectItems.length; i++) {
								var vPath = vSelectItems[i].getBindingContext("oPoitemModel").getPath();
								oThat.oView.getModel("oPoitemModel").setProperty(vPath + "/Parnr", sap.ui.getCore().byId("id_Vendor").getValue());
								oThat.oView.getModel("oPoitemModel").refresh();
								oThat.oView.getModel("POLIST").getData().push(vSelectItems[i].getBindingContext("oPoitemModel").getObject());
							}
						}
						oThat.oView.getModel("POLIST").refresh();
						oThat.oPoItemFrag.destroy();
					}
				}
			});
		},
		onOpenPOList: function() {
			oThat.POList = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PoList", oThat);
			oThat.oView.addDependent(oThat.POList);
			oThat.POList.open();
		},
		onClosePoList: function() {
			oThat.POList.destroy();
		},
		//===================================== column visibility settings =====================================//
		onSettings: function() {
			oThat.PersonalizeFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Personalize", oThat);
			oThat.oView.addDependent(oThat.PersonalizeFrag);
			oThat.oDataBeforeOpen = jQuery.extend(true, {}, oThat.oPersonalModel.getData());
			oThat.PersonalizeFrag.open();
		},
		onCancel: function() {
			oThat.oPersonalModel.setProperty("/", jQuery.extend(true, [], oThat.oDataBeforeOpen));
			oThat.oDataBeforeOpen = {};
			oThat.PersonalizeFrag.close();
		},
		onOK: function(oevent) {
			oThat.PersonalizeFrag.close();
		},
		//=================================================================================//
		//====================== Nav back =================================================//
		//=================================================================================//
		onNavBack: function() {
			this.oRouter.navTo("Inbound");
		}
	});

});