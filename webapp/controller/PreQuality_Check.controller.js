var oThat;
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/BusyDialog",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	'sap/m/TablePersoController',
	'ZGT_MM_INBOUND/Util/DemoPersoService',
	"ZGT_MM_INBOUND/Util/Formatter"
], function (Controller, MessageBox, BusyDialog, JSONModel, Filter, MessageToast, TablePersoController, DemoPersoService, Formatter) {
	"use strict";

	return Controller.extend("ZGT_MM_INBOUND.controller.PreQuality_Check", {
		Formatter: Formatter,
		onInit: function () {
			oThat = this;
			oThat.oView = this.getView();
			oThat.BusyDialog = new BusyDialog();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("PreQuality").attachMatched(this._onRouteMatched, this);

			this._oTPC = new TablePersoController({
				table: oThat.oView.byId("pre_qual"),
				//specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
				// componentName: "demoApp",
				persoService: DemoPersoService
			}).activate();

		},

		_onRouteMatched: function (oEvent) {
			oThat = this;
			oThat.oView = oThat.getView();
			oThat.BusyDialog = new BusyDialog();
			oThat.oModel = oThat.getOwnerComponent().getModel();

			oThat.Service = 'GET';
			var oEntity = {
				"d": {
					"GateEntry": "",
					"VehAssign": "",
					"PreQual": "X",
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
		//======================================================================================//
		//=============================== Service call =========================================//
		//======================================================================================//

		onCallService: function (service, Data) {
			oThat.BusyDialog.open();
			if (oThat.Service === 'GET' || oThat.Service === 'ITEM' || oThat.Service === 'BATCH' || oThat.Service == "CONTINUE") {
				oThat.oModel.create("/GetHeadersSet", Data, {
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
				oThat.oModel.create("/PostBatchSet", Data, {
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service === 'SAVE') {
				oThat.oModel.create("/PostHeadersSet", Data, {
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			}
			// Added by Srinivas on 01/07/2025
			else if (oThat.Service == "OriginCombo") {
				oThat.oModel.read("/F4ParametersSet", {
					filters: Data,
					urlParameters: {
						$expand: "F4OriginSetNav"
					},
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			}
			//  End of Added by Srinivas on 01/07/2025
		},
		mySuccessHandler: function (oData) {
			oThat.BusyDialog.close();
			if (oThat.Service === 'GET') {
				oThat.EvQueuing = oData.EvQueuing;
				var oQualityModel = new JSONModel(oData);
				oThat.oView.setModel(oQualityModel, "oQualityModel");
				//		oQualityModel.setSizeLimit(oData.QualWbidNav.results.length); 
				// Added for Turkey Project need to change
				if (oData.ExPrlotLayout === 'N') {
					oThat.getView().byId("id_wbitem").setVisible(true);
					oThat.getView().byId("id_PONo").setVisible(true);
					oThat.getView().byId("id_Poitem").setVisible(true);
					oThat.getView().byId("id_EwayNo").setVisible(true);
					oThat.getView().byId("id_batch").setVisible(true);
					oThat.getView().byId("id_DlNo").setVisible(true); //Added by Pavan on 04/04/2023
					oThat.getView().byId("id_DLitem").setVisible(true); //Added by Pavan on 04/04/2023
				} else {
					oThat.getView().byId("id_wbitem").setVisible(false);
					oThat.getView().byId("id_PONo").setVisible(false);
					oThat.getView().byId("id_Poitem").setVisible(false);
					oThat.getView().byId("id_EwayNo").setVisible(false);
					oThat.getView().byId("id_batch").setVisible(false);
					oThat.getView().byId("id_DlNo").setVisible(false); //Added by Pavan on 04/04/2023
					oThat.getView().byId("id_DLitem").setVisible(false); //Added by Pavan on 04/04/2023
				}
			} else if (oThat.Service === 'ITEM') {
				oThat.EvWtype = oData.EvWtype;
				var oData1 = {
					"PreQualNav": oData.PreQualNav,
					"BatchCharsNav": [],
					"BatchValuesNav": []
				};
				oThat.oView.setModel(new JSONModel(oData), "BATCH");
				oThat.oView.getModel("BATCH").refresh(true);
				// if(oData.GetReturnNav  != null){
				if (oData.GetReturnNav.results.length != 0) {
					var aError = oData.GetReturnNav.results.filter(function (x) {
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
							onClose: function (oAction) {}
						});
					} else {
						var aWarning = oData.GetReturnNav.results.filter(function (x) {
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
								onClose: function (oAction) {
									oThat.oQueueFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Queue", oThat);
									oThat.oView.addDependent(oThat.oQueueFrag);
									oThat.oQueueFrag.setEscapeHandler(oThat.onEscapeQueue);
									oThat.oQueueFrag.open();
								}
							});
						}

					}
				}
				// }
				else {
					oThat.oQueueFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Queue", oThat);
					oThat.oView.addDependent(oThat.oQueueFrag);
					oThat.oQueueFrag.setEscapeHandler(oThat.onEscapeQueue);
					oThat.oQueueFrag.open();
				}

			} else if (oThat.Service === 'BATCH') {

				// if(oData.EvOrigin === 'K'){ //Added for Turkey Project
				// 	var t;
				// }else{
				var oData1 = {
					"BatchCharsNav": [],
					"BatchValuesNav": []
				};
				oThat.oView.setModel(new JSONModel(oData), "BATCH");
				oThat.oView.getModel("BATCH").refresh(true);
				oThat.oView.getModel("Head").getData().Charg = oData.QualCharNav.results[0].Charg;
				oThat.oView.getModel("Head").getData().Matxt = oData.QualCharNav.results[0].Matxt;
				oThat.oView.getModel("Head").refresh();
				// if(oData.GetReturnNav  != null){
				if (oData.GetReturnNav.results.length != 0) {
					var aError = oData.GetReturnNav.results.filter(function (x) {
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
							onClose: function (oAction) {}
						});
					} else {
						var aWarning = oData.GetReturnNav.results.filter(function (x) {
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
								onClose: function (oAction) {
									if (oThat.EvQueuing == "X" && oData.EvOrigin !== 'N') { //Added oData.EvOrigin !== 'N' by Pavan on 18/04/2023
										oThat.oQueueFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Queue", oThat);
										oThat.oView.addDependent(oThat.oQueueFrag);
										oThat.oQueueFrag.setEscapeHandler(oThat.onEscapeQueue);
										oThat.oQueueFrag.open();
									} else if (oData.EvOrigin === 'N') { // Added by Pavan on 18/04/2023 Start
										oThat.oPreQAEway = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PreQAEway", oThat);
										oThat.oView.addDependent(oThat.oPreQAEway);
										oThat.oPreQAEway.open(); // Added by Pavan on 18/04/2023 End
									} else {
										oThat.Batch = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.BatchChar", oThat);
										oThat.oView.addDependent(oThat.Batch);
										oThat.Batch.setEscapeHandler(oThat.onEscapeBatch);
										oThat.Batch.open();
										//BOC by Avinash
										// if (!oThat.Batch) {
										// 	oThat.Batch = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.BatchChar", oThat);
										// 	oThat.getView().addDependent(oThat.Batch);
										// }

										// oThat.Batch.open();
										//EOC by Avinash
										if (oThat.oView.getModel("Head").getData().Charg !== "" && oThat.oView.getModel("Head").getData().Charg !== undefined) {
											sap.ui.getCore().byId("id_BatchNumberChk").setEnabled(false);
										}
									}
								}
							});
						}

					}
				}


				// }
				else {
					if (oThat.EvQueuing == "X" && oData.EvOrigin !== 'N') { //&& condition added for Turkey Project
						//added by Srinivas  for Dropdown of origin for DSE on 1/07/2025 based on Plant and origin E to show dropdown(new field)
						if (oThat.oView.getModel("Head").getData().Wtype ==="PROCURE" && oData.EvOrigin === 'X' && oThat.oView.getModel("Head").getData().Ebeln == "") {
							oThat.OriginIvc = oData.EvOrigin;
							oThat.Wtype = oThat.oView.getModel("Head").getData().Wtype;
							oThat.Service = "OriginCombo";
							var oOriginFilter = [
								new Filter("OriginGQ", sap.ui.model.FilterOperator.EQ, "X"),
								new Filter("IvWerks", sap.ui.model.FilterOperator.EQ, oData.IvWerks)
							];
							oThat.onCallService(oThat.Service, oOriginFilter);
						} else {
							//End by Srinivas  for Dropdown of origin for DSE on 1/07/2025

							oThat.oQueueFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Queue", oThat);
							oThat.oView.addDependent(oThat.oQueueFrag);
							oThat.oQueueFrag.setEscapeHandler(oThat.onEscapeQueue);
							oThat.oQueueFrag.open();
							//Added by Avinash on 05/01/2022
							oThat.OriginIvc = oData.EvOrigin;
							//End of Added
						}
						// Added for Turkey Project
					} else if (oData.EvOrigin === 'N') {
						oThat.oPreQAEway = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PreQAEway", oThat);
						oThat.oView.addDependent(oThat.oPreQAEway);
						// oThat.oQueueFrag.setEscapeHandler(oThat.onEscapeQueue);
						oThat.oPreQAEway.open();
					} else {

						// oThat.Batch = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.BatchChar", oThat);
						// oThat.oView.addDependent(oThat.Batch);
						// oThat.Batch.open();
						//BOC by Avinash
						if (!oThat.Batch) {
							oThat.Batch = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.BatchChar", oThat);
							oThat.getView().addDependent(oThat.Batch);
						}
						oThat.Batch.open();
						//EOC 
						if (oThat.oView.getModel("Head").getData().Charg !== "" && oThat.oView.getModel("Head").getData().Charg !== undefined) {
							sap.ui.getCore().byId("id_BatchNumberChk").setEnabled(false);
						}
					}

				}
				// }

			} else if (oThat.Service === 'GETCHAR') {
				oThat.oView.getModel("BATCH").getData().BatchCharsNav = oData.BatchCharsNav;
				oThat.oView.getModel("BATCH").getData().BatchValuesNav = oData.BatchValuesNav;
				oThat.oView.getModel("BATCH").refresh(true);
				oThat.onCreateChracteritis();
			} else if (oThat.Service == 'SETCHAR') {
				// if(oData.PostReturnNav != null){
				if (oData.PostReturnNav.results.length != 0) {
					var aError = oData.PostReturnNav.results.filter(function (x) {
						if (x.Type == 'E') {
							return x;
						}
					});
					if (aError != 0) {
						var Message = "";
						for (var i = 0; i < aError.length; i++) {
							Message = Message + aError[i].Message + "\n"; //Added by Avinash on 16/09/21
						}
						MessageBox.error(Message);
					}
					var aSuccess = oData.PostReturnNav.results.filter(function (x) {
						if (x.Type == 'S') {
							return x;
						}
					});
					if (aSuccess != 0) {
						var Message;
						for (var i = 0; i < aSuccess.length; i++) {
							Message = aSuccess[i].Message + "\n";
						}
						MessageBox.show(Message, {
							icon: MessageBox.Icon.SUCCESS,
							title: oThat.oView.getModel("i18n").getResourceBundle().getText("Title19"),
							actions: [MessageBox.Action.OK],
							onClose: function () {
								// oThat.onPressQualItem();
								oThat.Batch.destroy();
								if (oThat.oQueueFrag) {
									oThat.oQueueFrag.destroy();
								}
								//added by srinivas on 04/10/2025
								if (oThat.getView().getModel("ExceptionModel")) {
									oThat.getView().getModel("ExceptionModel").setData([]);
									
								}
						    	//ended by srinivas on 04/10/2025
								oThat.Service = 'GET';
								var oEntity = {
									"d": {
										"GateEntry": "",
										"VehAssign": "",
										"PreQual": "X",
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
						});
					}
				} else {
					// oThat.onPressQualItem();
					oThat.Service = 'GET';
					oThat.Batch.destroy();
					if (oThat.oQueueFrag) {
						oThat.oQueueFrag.destroy();
					}
					// added by srinivas on 04/10/2025
						// if (oThat._oExceptionQADialog) {
						// oThat._oExceptionQADialog.destroy();
						// }
					// ended by srinivas on 04/10/2025
					var oEntity = {
						"d": {
							"GateEntry": "",
							"VehAssign": "",
							"PreQual": "X",
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
				// }	
			} else if (oThat.Service === 'SAVE') {

				if (oData.PostReturnNav.results[0].Type === 'E') {
					sap.m.MessageBox.error(oData.PostReturnNav.results[0].Message);
				} else {
					oThat.onCloseQueuing();
					oThat.onCloseQueue();
					oThat.Service = 'GET';
					var oEntity = {
						"d": {
							"GateEntry": "",
							"VehAssign": "",
							"PreQual": "X",
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
			} else if (oThat.Service === "CONTINUE") {
				if (oData.PreQualNav != null) {
					if (oData.PreQualNav.results.length == 0) {
						var oDialog = sap.ui.getCore().byId("id_PanelCharChk");
						oDialog.destroyContent();
						oThat.Batch.destroy();
						oThat.oQueueFrag.destroy();
						// added by srinivas on 04/10/2025
						// if (oThat._oExceptionQADialog) {
						// 	oThat._oExceptionQADialog.destroy();
						//  }
				 	// ended by srinivas on 04/10/2025
						oThat.Service = 'GET';
						var oEntity = {
							"d": {
								"GateEntry": "",
								"VehAssign": "",
								"PreQual": "X",
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
					} else {
						MessageBox.show(oThat.oView.getModel("i18n").getResourceBundle().getText("Msg1"), {
							icon: MessageBox.Icon.INFORMATION,
							title: oThat.oView.getModel("i18n").getResourceBundle().getText("Title16"),
							actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							onClose: function (oAction) {
								if (oAction === 'YES') {
									oThat.oView.getModel("BATCH").getData().BatchCharsNav = [];
									oThat.oView.getModel("BATCH").getData().BatchValuesNav = [];
									oThat.oView.getModel("BATCH").getData().PreQualNav = oData.PreQualNav;
									oThat.oView.getModel("BATCH").refresh(true);
									var oDialog = sap.ui.getCore().byId("id_PanelCharChk");
									oDialog.destroyContent();
									oThat.oView.getModel("Head").getData().Charg = "";
									oThat.oView.getModel("Head").getData().Matnr = "";
								} else {
									var oDialog = sap.ui.getCore().byId("id_PanelCharChk");
									oDialog.destroyContent();
									oThat.Batch.destroy();
									// added by srinivas on 04/10/2025
								// if (oThat._oExceptionQADialog) {
								// 	oThat._oExceptionQADialog.destroy();
								// }
						    	// ended by srinivas on 04/10/2025
									oThat.oQueueFrag.destroy();
									oThat.Service = 'GET';
									var oEntity = {
										"d": {
											"GateEntry": "",
											"VehAssign": "",
											"PreQual": "X",
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
						});
					}
				} else {
					var oDialog = sap.ui.getCore().byId("id_PanelCharChk");
					oDialog.destroyContent();
					oThat.Batch.destroy();
					// added by srinivas on 04/10/2025
						// if (oThat._oExceptionQADialog) {
						// oThat._oExceptionQADialog.destroy();
						// 	}
					// ended by srinivas on 04/10/2025
					oThat.oQueueFrag.destroy();
					oThat.Service = 'GET';
					var oEntity = {
						"d": {
							"GateEntry": "",
							"VehAssign": "",
							"PreQual": "X",
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
			// oThat.oView.getModel("oQualityModel").refresh(true);

			// Added by Srinivas on 01/07/2025
			else if (oThat.Service === 'OriginCombo') {
				var oJsonModel = new JSONModel();
				var oDataTyResults = oData.results[0].F4OriginSetNav.results;
				if (oDataTyResults.length > 0) {
					oJsonModel.setData(oDataTyResults);
					oThat.oView.setModel(oJsonModel, "OriginComboModel");
					//oThat.oView.getModel("TruckTypeComboModel").refresh(true);
					// oThat.oView.byId("id_VehicleTy").setVisible(false);
					// oThat.oView.byId("id_VehicleTyCombo").setVisible(true);
					// oThat.oQueueFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Queue", oThat);
					// oThat.oView.addDependent(oThat.oQueueFrag);
					// oThat.oQueueFrag.setEscapeHandler(oThat.onEscapeQueue);
					// oThat.oQueueFrag.open();
					
                  // if (!oThat.oQueueFrag) {
                    oThat.oQueueFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Queue", oThat);
					oThat.oView.addDependent(oThat.oQueueFrag);
					//oThat.oQueueFrag.setEscapeHandler(oThat.onEscapeQueue);
					//oThat.oQueueFrag.open();
                   // }
                  oThat.oQueueFrag.open();

				} else {
					// oThat.oView.byId("id_VehicleTy").setVisible(true);
					// oThat.oView.byId("id_VehicleTyCombo1").setVisible(false);
					oThat.oQueueFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Queue", oThat);
					oThat.oView.addDependent(oThat.oQueueFrag);
					//oThat.oQueueFrag.setEscapeHandler(oThat.onEscapeQueue);
					oThat.oQueueFrag.open();
				}

			}
			//  End of Added by Srinivas on 01/07/2025

		},

		myErrorHandler: function (oResponse) {
			oThat.BusyDialog.close();
			var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("Title21");
			MessageBox.show(oResponse.responseText, MessageBox.Icon.ERROR, vError);
		},

		//=========================================================================================//
		//================================= on press row =========================================//
		//========================================================================================//
		onPressQualItem: function (oEvent) {
			if (oEvent != undefined && oEvent != null) {
				oThat.oBject = oEvent.getSource().getBindingContext("oQualityModel").getObject();
				oThat.Service = "ITEM";
			} else {
				oThat.Service = "CONTINUE";
			}
			var oData = {
				Charg: "",
				Ebeln: oThat.oBject.Ebeln,
				Ebelp: oThat.oBject.Ebelp,
				Matnr: oThat.oBject.Matnr,
				Matxt: oThat.oBject.Maktx,
				Posnr: oThat.oBject.Posnr,
				Vbeln: oThat.oBject.Vbeln,
				Wbid: oThat.oBject.Wbid,
				Werks: oThat.oBject.Werks,
				IvHours: 0,
				Vehno: oThat.oBject.Vehno,
				Aedat: oThat.oBject.Aedat,
				Aetim: oThat.oBject.Aetim,
				Item: oThat.oBject.Item,
				Batch: oThat.oBject.Batch, //Added for Turkey Pjct
				Wtype : oThat.oBject.Wtype // Added by Srinivas on 01/07/2025 DSE
			};
			oThat.oView.setModel(new JSONModel(oData), "Head");
			oThat.oView.getModel("Head").refresh("true");
			var oEntity = {
				"d": {
					"GateEntry": "",
					"VehAssign": "",
					"PreQual": "X",
					"UnloadConf": "",
					"GateExit": "",
					"Inbound": "X",
					"Outbound": "",
					"IvDelivery": "",
					"IvPo": "",
					"IvWbid": oThat.oBject.Wbid,
					"IvWerks": oThat.oBject.Werks, //Added by Avinash
					"IvItem": oThat.oBject.Item, //Added by Avinash
					"QualWbidNav": [],
					"PreQualNav": [],
					"QualCharNav": [],
					"GetReturnNav": []
				}
			};
			oEntity.d.QualCharNav.push({
				"Wbid": oThat.oBject.Wbid,
				"Item": oThat.oBject.Item,
				"Matnr": oThat.oBject.Matnr,
				"Werks": oThat.oBject.Werks,
				"Ebeln": oThat.oBject.Ebeln,
				"Vbeln": oThat.oBject.VbelBATCHn,
				"Ebelp": oThat.oBject.Ebelp,
				"Posnr": oThat.oBject.Posnr
			});
			oThat.Service = 'BATCH';
			oThat.onCallService(oThat.Service, oEntity);
		},
		onPressQueuing: function (oEvent) {
			var vId = oEvent.getSource().getId();
			if (vId.indexOf("id_Queue1") !== -1) {
				if (!oThat.Queuing) {
					oThat.Queuing = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Queuing", oThat);
					oThat.oView.addDependent(oThat.Queuing);
				}

				oThat.Queuing.open();
				// sap.ui.getCore().byId("id_QueueForm").setVisible(true);
				// oThat.onCloseQueue();
			} else if (vId.indexOf("id_QA") !== -1) {
				// oThat.IApprove = "A";
				oThat.Batch = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.BatchChar", oThat);
				oThat.oView.addDependent(oThat.Batch);
				oThat.Batch.open();
				if (oThat.oView.getModel("Head").getData().Charg !== "" && oThat.oView.getModel("Head").getData().Charg !== undefined) {
					sap.ui.getCore().byId("id_BatchNumberChk").setEnabled(false);
				}
				
			
				// Added by Srinivas on 01/07/2025 Added for origin as dropdown else if condition for DSE
			   if (oThat.oView.getModel("Head").getData().Wtype ==="PROCURE" && oThat.OriginIvc === "X" && oThat.oView.getModel("Head").getData().Ebeln == "") {
					// sap.ui.getCore().byId("id_TokenField").setValue("");
					sap.ui.getCore().byId("id_TokenField").setVisible(false);
					sap.ui.getCore().byId("id_TokenLabel").setVisible(false);  
				    sap.ui.getCore().byId("id_TokenFieldCombo").setValue("");
					sap.ui.getCore().byId("id_TokenFieldCombo").setVisible(true);
					sap.ui.getCore().byId("id_TokenLabelCombo").setVisible(true);		
				}	
				// End by Srinivas on 01/07/2025 Added for origin as dropdown	
				
				//Added by Avinash for IVC Rubber Changes
				else if (oThat.OriginIvc === "E") {
					sap.ui.getCore().byId("id_TokenField").setValue("");
					sap.ui.getCore().byId("id_TokenField").setVisible(true);
					sap.ui.getCore().byId("id_TokenLabel").setVisible(true);
				// Added by Srinivas on 01/07/2025 Added for origin as dropdown commented above 3 lines for DSE
				//	sap.ui.getCore().byId("id_TokenFieldCombo").setValue("");
					sap.ui.getCore().byId("id_TokenFieldCombo").setVisible(false);
					sap.ui.getCore().byId("id_TokenLabelCombo").setVisible(false);
				// End by Srinivas on 01/07/2025 Added for origin as dropdown
				} 			
				else {
					sap.ui.getCore().byId("id_TokenField").setVisible(false);
					sap.ui.getCore().byId("id_TokenLabel").setVisible(false);
					// Added by Srinivas on 01/07/2025 Added for origin as dropdown for DSE
					sap.ui.getCore().byId("id_TokenFieldCombo").setVisible(false);
					sap.ui.getCore().byId("id_TokenLabelCombo").setVisible(false);
					// End by Srinivas on 01/07/2025 Added for origin as dropdown
				}
				//End of added
				// oThat.onCloseQueue();
			} else if (vId.indexOf("id_RejQA") !== -1) {
				// oThat.IApprove = "R";
				oThat.Batch = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.BatchChar", oThat);
				oThat.oView.addDependent(oThat.Batch);
				oThat.Batch.open();
				//BOC by Avinash
				// if (!oThat.Batch) {
				// 	oThat.Batch = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.BatchChar", oThat);
				// 	oThat.getView().addDependent(oThat.Batch);
				// }
				// oThat.Batch.open();
				//EOC
				if (oThat.oView.getModel("Head").getData().Charg !== "" && oThat.oView.getModel("Head").getData().Charg !== undefined) {
					sap.ui.getCore().byId("id_BatchNumberChk").setEnabled(false);
				}
			}
		},
		onCloseQueuing: function () {
			oThat.Queuing.close();
		},
		onCloseQueue: function () {
			oThat.oQueueFrag.destroy();
		},
		onSaveQueue: function (oEvent) {

			var oEntity = {
				"d": {
					"GateEntry": "",
					"VehAssign": "",
					"PreQual": "X",
					"UnloadConf": "",
					"GateExit": "",
					"Inbound": "X",
					"Outbound": "",
					"Queuein": "X",
					"IvHours": oThat.oView.getModel("Head").getData().IvHours.toString(),
					"IvWbid": oThat.oView.getModel("Head").getData().Wbid,
					"IvWboj": oThat.EvWtype,
					"PostReturnNav": [],
					"PostWbHeaderNav": [],
					"PostWbitemNav": [],
					"PostWsItemNav": [],
					"PostDmsNav": []
				}
			};
			oThat.Service = 'SAVE';
			oThat.onCallService(oThat.Service, oEntity);
		},

		//	 Added on 01/07/2025 by Srinivas for origin combo box
		handleChange: function (oEvent) {
			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

			if (!sSelectedKey && sValue) {
				oValidatedComboBox.setValueState("Error");
				// var oErrorCombo = oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorCombo");
				// oValidatedComboBox.setValueStateText(oErrorCombo);

				var bMatch = oValidatedComboBox.getItems().some(function (oItem) {
					return oItem.getText().toLowerCase() === sValue.toLowerCase();
				});

				if (!bMatch) {
					// Reset value if not in dropdown
					oValidatedComboBox.setValue("");
				}
			} else {
				oValidatedComboBox.setValueState("None");
			}
		},

		// ended by srinivas
		//=============================== MAterial F4 ==================================//
		onValueHelpPress: function (oEvent) {
			oThat.ValueHelp = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Material", oThat);
			oThat.oView.addDependent(oThat.ValueHelp);
			oThat.ValueHelp.open();
		},
		onValueHelpSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter;
			oFilter = new sap.ui.model.Filter([
				new Filter("Matnr", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("Maktx", sap.ui.model.FilterOperator.Contains, sValue)
			]);
			var oFilter2 = new sap.ui.model.Filter(oFilter, false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter2]);
		},
		onValueHelpConfirm: function (oEvent) {
			var oBject = oThat.oView.getModel("BATCH").getObject(oEvent.getParameter("selectedItem").getBindingContextPath());
			oThat.oView.getModel("Head").setData(oBject);
			oThat.oView.getModel("Head").refresh();
			sap.ui.getCore().byId("id_PanelCharChk").addContent("");
			sap.ui.getCore().byId("id_BtnCharChk").setEnabled(true);
			sap.ui.getCore().byId("id_BtnCharSaveChk").setVisible(false);
			sap.ui.getCore().byId("id_BtnRejCharChek").setVisible(false);
			sap.ui.getCore().byId("id_BtnExceptionQA").setVisible(false); // added by srinivas on 03/10/2025
			var oEntity = {
				"d": {
					"GateEntry": "",
					"VehAssign": "",
					"PreQual": "X",
					"UnloadConf": "",
					"GateExit": "",
					"Inbound": "X",
					"Outbound": "",
					"IvDelivery": "",
					"IvPo": "",
					"IvWbid": "",
					"IvWerks": "",
					"QualWbidNav": [],
					"PreQualNav": [],
					"QualCharNav": []
				}
			};
			oEntity.d.QualCharNav.push(oBject);
			oThat.Service = 'BATCH';
			oThat.onCallService(oThat.Service, oEntity);

		},
		onClose: function () {
			oThat.Batch.destroy();
			//oThat._oExceptionQADialog.destroy(); // added by srinivas on 04/10/2025
			//added by srinivas on 04/10/2025
			if (oThat.getView().getModel("ExceptionModel")) {
				oThat.getView().getModel("ExceptionModel").setData([]);
			}
	    	//ended by srinivas on 04/10/2025
			oThat.Service = 'GET';
			var oEntity = {
				"d": {
					"GateEntry": "",
					"VehAssign": "",
					"PreQual": "X",
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
		//===========================================================================================//
		//================================== on Press characteristics ==============================//
		//=========================================================================================//
		onPressCharacteristics: function (oEvent) {
			if (oThat.oView.getModel("Head").getData().Charg === "") {
				MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg4"));
			} else {
				var oEntity = {
					"MaterialNav": [],
					"BatchCharsNav": [],
					"BatchValuesNav": []
				};
				var oBject = {
					"Matnr": oThat.oView.getModel("Head").getData().Matnr,
					"Werks": oThat.oView.getModel("Head").getData().Werks,
					"Lgort": "",
					"Charg": oThat.oView.getModel("Head").getData().Charg,
					"Msgid": "",
					"Msgno": ""
				};
				oEntity.MaterialNav.push(oBject);
				oThat.Service = "GETCHAR";
				oThat.onCallService(oThat.Service, oEntity);
			}
		},
		//==================================================================================================//
		//================================ on Create Characteristics ======================================//
		//================================================================================================//
		onCreateChracteritis: function () {
			var oController = this;
			var oDialog = sap.ui.getCore().byId("id_PanelCharChk");
			oDialog.destroyContent();

			if (oThat.oView.getModel("BATCH").getData().BatchCharsNav != null &&
				oThat.oView.getModel("BATCH").getData().BatchValuesNav != null) {
				sap.ui.getCore().byId("id_BtnCharSaveChk").setVisible(true);
				sap.ui.getCore().byId("id_BtnRejCharChek").setVisible(true);
				// added by srinivas on 03/10/2025 for QA Exception
				if(oThat.oView.getModel("BATCH").getData().PreQualExp === "X"){
				sap.ui.getCore().byId("id_BtnExceptionQA").setVisible(true); 
				}
				else{
				sap.ui.getCore().byId("id_BtnExceptionQA").setVisible(false);	
				}
				// ended by srinivas on 03/10/2025 for QA Exception
				var aLocArr = oThat.oView.getModel("BATCH").getData().BatchCharsNav.results;
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
					for (var j = 0; j < oThat.oView.getModel("BATCH").getData().BatchValuesNav.results.length; j++) {
						if (aLocArr[i].NameChar == oThat.oView.getModel("BATCH").getData().BatchValuesNav.results[j].NameChar &&
							aLocArr[i].Werks == oThat.oView.getModel("BATCH").getData().BatchValuesNav.results[j].Werks &&
							aLocArr[i].Matnr == oThat.oView.getModel("BATCH").getData().BatchValuesNav.results[j].Matnr) {
							oCharMulValue.push(oThat.oView.getModel("BATCH").getData().BatchValuesNav.results[j]);

						}
					}
					var vRdNm = '',
						oRdGrp = '',
						oRdPanel = '';
					var vAtbez = aLocArr[i].DescrChar;
					var vSelectFlag = false;
					if (oCharMulValue.length > 0) {
						if (oCharMulValue[0].ValRelatn == '1') {
							vSelectFlag = true;
							var oBject = {
								CharValue: "",
								DescrCval: "",
								Lgort: "",
								Matnr: "",
								NameChar: "",
								NumValFm: "",
								NumValTo: "",
								ValRelatn: "1",
								Werks: ""
							};
							oCharMulValue.splice(0, 0, oBject);
						}
					}
					//added surya(07/08/2023)
					if (aLocArr[i].SingleValue && aLocArr[i].NameChar === "TRUCKTYPE") {
						var oLabel = new sap.m.Label({
							text: vAtbez + " :",
							tooltip: aLocArr[i].DescrChar,
							width: "12rem",
							wrapping: true,
							design: "Bold"
						}).addStyleClass("lblAlignRes");
						oRdPanel = new sap.m.Panel({}).addStyleClass("Cl_Batch_Panel");
						// var oFormElement    = new sap.ui.layout.form.FormElement({});
						if (!aLocArr[i].Batchindex) {
							aLocArr[i].Batchindex = 0;
						}

						aLocArr[i].Batchindex = parseInt(aLocArr[i].Batchindex);

						oRdGrp = new sap.m.Select({
							forceSelection: false,
							width: '10rem',
							items: [
								new sap.ui.core.Item({
									key: "A",
									text: "A"
								}), new sap.ui.core.Item({
									key: "M",
									text: "M"
								})
							]
						}).addStyleClass("sapUiTinyMarginTop");

						oRdPanel.addContent(oLabel);
						oRdPanel.addContent(oRdGrp);
						oGrid.addContent(oRdPanel);
						vRdNm = (oLabel.getText().split(" :")[0]).toLocaleUpperCase();

					}

										// added by srinivas to check if truck type is already filled or not at gate entry if filled populate it else keep old logic

					// if (aLocArr[i].SingleValue && aLocArr[i].NameChar === "TRUCKTYPE") {
					// 	var oLabel = new sap.m.Label({
					// 		text: vAtbez + " :",
					// 		tooltip: aLocArr[i].DescrChar,
					// 		width: "12rem",
					// 		wrapping: true,
					// 		design: "Bold"
					// 	}).addStyleClass("lblAlignRes");

					// 	oRdPanel = new sap.m.Panel({}).addStyleClass("Cl_Batch_Panel");

					// 	if (!aLocArr[i].Batchindex) {
					// 		aLocArr[i].Batchindex = 0;
					// 	}

					// 	aLocArr[i].Batchindex = parseInt(aLocArr[i].Batchindex);

					// 	// Check if value exists
					// 	if (oCharMulValue && oCharMulValue.length > 1 && oCharMulValue[1].DescrCval !== '') {

					// 		// create model with SerumData
					// 		var oModel = new sap.ui.model.json.JSONModel({
					// 			TruckTypeData: oCharMulValue[1]
					// 		});

					// 		// non-editable, greyed-out Input
					// 		oRdGrp = new sap.m.Input({
					// 			value: "{/TruckTypeData/DescrCval}", // bind absolute path
					// 			editable: false,
					// 			enabled: false,
					// 			width: "10rem"
					// 		}).addStyleClass("sapUiTinyMarginTop");

					// 		// 🔑 set model on the Input
					// 		oRdGrp.setModel(oModel);

					// 	} else {
					// 		// Show Select with A/M options
					// 		oRdGrp = new sap.m.Select({
					// 			forceSelection: false,
					// 			width: '10rem',
					// 			items: [
					// 				new sap.ui.core.Item({
					// 					key: "A",
					// 					text: "A"
					// 				}),
					// 				new sap.ui.core.Item({
					// 					key: "M",
					// 					text: "M"
					// 				})
					// 			]
					// 		}).addStyleClass("sapUiTinyMarginTop");
					// 	}

					// 	oRdPanel.addContent(oLabel);
					// 	oRdPanel.addContent(oRdGrp);
					// 	oGrid.addContent(oRdPanel);

					// 	vRdNm = (oLabel.getText().split(" :")[0]).toLocaleUpperCase();
					// }

				// end by srinivas

					//end surya
					else if (aLocArr[i].SingleValue && oCharMulValue.length > 0 && vSelectFlag) { // select box
						vCombo = false;
						var oLabel = new sap.m.Label({
							text: vAtbez + " :",
							tooltip: aLocArr[i].DescrChar,
							width: "12rem",
							wrapping: true,
							design: "Bold"
						}).addStyleClass("lblAlignRes");
						oRdPanel = new sap.m.Panel({}).addStyleClass("Cl_Batch_Panel");
						// var oFormElement    = new sap.ui.layout.form.FormElement({});
						if (!aLocArr[i].Batchindex) {
							aLocArr[i].Batchindex = 0;
						}

						aLocArr[i].Batchindex = parseInt(aLocArr[i].Batchindex);

						oRdGrp = new sap.m.Select({
							forceSelection: false,
							width: '10rem'
						}).addStyleClass("sapUiTinyMarginTop");
						if (oCharMulValue[1].DescrCval != '') {
							var oItemSelectTemplate = new sap.ui.core.Item({
								key: "{Data>CharValue}",
								text: "{Data>DescrCval}"
							});

						} else {
							var oItemSelectTemplate = new sap.ui.core.Item({
								key: "{Data>NumValFm}",
								text: "{Data>NumValFm}"
							});
						}
						var oModel = new sap.ui.model.json.JSONModel();
						var oJsonDetails = {
							"Select": oCharMulValue
						};
						oModel.setData(oJsonDetails);
						oModel.setSizeLimit(oJsonDetails.Select.length);
						//          oRdGrp.setModel(oModel,'Select');
						oRdGrp.bindAggregation('items', "Data>/Select", oItemSelectTemplate);
						oRdGrp.setModel(oModel, "Data");
						if (oCharMulValue[1].DescrCval !== '') {
							oRdGrp.setSelectedKey(oJsonDetails.Select[aLocArr[i].Batchindex].CharValue);
						} else {
							oRdGrp.setSelectedKey(oJsonDetails.Select[aLocArr[i].Batchindex].NumValFm);
						}
						oRdPanel.addContent(oLabel);
						oRdPanel.addContent(oRdGrp);
						oGrid.addContent(oRdPanel);
						vRdNm = (oLabel.getText().split(" :")[0]).toLocaleUpperCase();
					} 
					else if (aLocArr[i].SingleValue) { // input
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
							width: 12 + "rem",
							type: vType,
							maxLength: vMaxLength,
							value: aLocArr[i].ValueChar,
							liveChange: function (oEvent) {
								//                      code to validate input
								if (oEvent.getSource().getParent().getContent().length == '3') { // range validation
									if (oEvent.getSource().getParent().getContent()[2].getText().split(' ').length == '4') {
										var vLower = Number(oEvent.getSource().getParent().getContent()[2].getText().split(' ')[1]);
										var vHigher = Number(oEvent.getSource().getParent().getContent()[2].getText().split(' ')[3]);
										var vValue = Number(oEvent.getSource().getValue());
										// if(vType == "Number"){
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
								//                oController.getResourceBundle().getText('RMFG_TextRange') + ' ' +
								Number(oCharMulValue[0].NumValTo);
							var oText = new sap.m.Text({
								text: vText
							}).addStyleClass("sapUiTinyMarginBegin");
							oPanel.addContent(oText);

						}
						oGrid.addContent(oPanel);

					}
					 else if (!aLocArr[i].SingleValue && oCharMulValue.length > 0) { // combo box
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
							//	var oFormElement    = new sap.ui.layout.form.FormElement({});
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
				if (oThat.oView.getModel("BATCH").getData().BatchCharsNav.results.length !== 0) {
					sap.ui.getCore().byId("id_BtnCharChk").setEnabled(false);
					sap.ui.getCore().byId("id_BtnCharSaveChk").setVisible(true);
					sap.ui.getCore().byId("id_BtnRejCharChek").setVisible(true);
					//sap.ui.getCore().byId("id_BtnExceptionQA").setVisible(true); // added by srinivas on 03/10/2025
				}
			} else {
				MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText('ErrorMsg8'));
				sap.ui.getCore().byId("id_BatchNumberChk").setVisible(false);
				sap.ui.getCore().byId("id_BtnRejCharChek").setVisible(false);
				//sap.ui.getCore().byId("id_BtnExceptionQA").setVisible(false); // added by srinivas on 03/10/2025
			}
		},
		//added by srinivas for pre Quality Exception fragment
		onExceptionQA: function () {
				var oView = oThat.getView();
				// create dialog lazily
				if (!oThat._oExceptionQADialog) {
					oThat._oExceptionQADialog = sap.ui.xmlfragment(oView.getId(),
						"ZGT_MM_INBOUND.Fragments.PreQuality_Check_Expection", oThat);
					oView.addDependent(oThat._oExceptionQADialog);
					// init empty model for inputs
					var oModel = new sap.ui.model.json.JSONModel({
						Grade: "",
						Surcharge: "",
						Reason: ""
					});
					oView.setModel(oModel, "ExceptionModel");
				}
				oThat._oExceptionQADialog.open();
			},

			// onQAApprove: function () {
			//     var oData = oThat.getView().getModel("ExceptionModel").getData();
			//     sap.m.MessageToast.show("Approved with data: " + JSON.stringify(oData));

			//     // TODO: OData call to update WBID with status 28
			//     oThat._oExceptionQADialog.close();
			// },

			onQclose: function () {
				//var oData = oThat.getView().getModel("ExceptionModel").getData();
				//sap.m.MessageToast.show("Rejected with data: " + JSON.stringify(oData));
				oThat._oExceptionQADialog.close();
				//oThat._oExceptionQADialog.destroy();
			}, 

		// ended by srinivas
		fnSaveBatchChar: function (oEvent) {
			//oView.getModel("ROUT").getData()[gvFGHURaw.Row].BatchVal = 'X';
			var vId = oEvent.getSource().getId();
			var IvApprove;
			if (vId.indexOf("id_BtnCharSaveChk") != -1) {
				oThat.IApprove = "A";
			} else if (vId.indexOf("id_BtnRejCharChek") != -1) {
				oThat.IApprove = "R";
			}
			//added by srinivas on 03/10/2025 exception QA
			else if (vId.indexOf("id_BtnExceptionQA2") != -1) { 
				var oExpFragData = oThat.getView().getModel("ExceptionModel").getData();
				if(!oExpFragData.Grade && !oExpFragData.Reason && !oExpFragData.Surcharge){	
				  MessageToast.show("Please fill Grade, Surcharge and Reason before saving.");
				}
				else{
				oThat._oExceptionQADialog.close();
				oThat.IApprove = "E";
				}
			}
				//ended by srinivas on 03/10/2025 exception QA
			if (oThat.oBject.Werks !== '6534') {
				var oController = this;
				var vMsg = '',
					vControl = '';
				var oDiContent = sap.ui.getCore().byId("id_PanelCharChk").getContent()[0].getContent();
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
					if (oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[i].EntryObligatory && !vValue) {
						vMsg = oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[i].DescrChar + ' ' + oThat.oView.getModel("i18n").getResourceBundle()
							.getText('RMFG_ErrorMandit');
						vControl.focus();
						break;
					}
			
					// Start by Srinivas on 01/07/2025 Added for origin as dropdown DSE replace E with X
				 if (oThat.oView.getModel("Head").getData().Wtype ==="PROCURE" && oThat.OriginIvc === "X" && oThat.oView.getModel("Head").getData().Ebeln == "") {
					if (sap.ui.getCore().byId("id_TokenFieldCombo").getValue() == "") {
							vMsg = oThat.oView.getModel("i18n").getResourceBundle().getText('OriginMandat');
							sap.ui.getCore().byId("id_TokenFieldCombo").focus();
						}
					}
					// End by Srinivas on 01/07/2025 Added for origin as dropdown 

					//Added by Avinash -- IVC Changes
					else if (oThat.OriginIvc === "E") {
						if (sap.ui.getCore().byId("id_TokenField").getValue() == "") {
							vMsg = oThat.oView.getModel("i18n").getResourceBundle().getText('OriginMandat');
							sap.ui.getCore().byId("id_TokenField").focus();
						}
					}
					//End of Added
					
					
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

						//	oController.dialog.close();
						for (var j = 0; j < oThat.oView.getModel("BATCH").getData().BatchCharsNav.results.length; j++) {
							if (oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[j].Werks ==
								oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[i].Werks &&
								//            goFGBatchData[j].Lgort == aLocArr[i].Lgort &&
								oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[j].Matnr ==
								oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[i].Matnr &&
								oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[j].NameChar ==
								oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[i].NameChar) {
								oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[j].ValueChar = vValue;
								//	oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[j].Batchindex = vRadioIndex;
								var index = "/" + "BatchCharsNav/results/" + j + "/Flag";
								oThat.oView.getModel("BATCH").setProperty(index, true);
								oThat.oView.getModel("BATCH").refresh(true);
								break;
							}
						}
					}
					//	oThat.Batch.destroy();
					oThat.Service = "SETCHAR";
					// Start by Srinivas on 01/07/2025 Added for origin as dropdown DSE
					if (oThat.oView.getModel("Head").getData().Wtype ==="PROCURE" && oThat.OriginIvc === "X" && oThat.oView.getModel("Head").getData().Ebeln == "") {
				   var IToken = sap.ui.getCore().byId("id_TokenFieldCombo").getValue();
					}
					// else if(oThat.oView.getModel("Head").getData().Wtype !=="PROCURE" && oThat.OriginIvc === "E"){
					//  var IToken = sap.ui.getCore().byId("id_TokenField").getValue();
					// }
					else{
						 var IToken = sap.ui.getCore().byId("id_TokenField").getValue();
					}
					// End by Srinivas on 01/07/2025 Added for origin as dropdown 
					var oEntity = {
						"IAppname": "QC",
						"ICharg": oThat.oView.getModel("Head").getData().Charg,
						"IFinalApproval": "",
						"IItem": oThat.oView.getModel("Head").getData().Item,
						"ILifnr": "",
						"IMatnr": oThat.oView.getModel("Head").getData().Matnr,
						"IQchar": "",
						"ITmode": "",
						//"IvWboj"		: oThat.EvWtype,
						"IWbid": oThat.oView.getModel("Head").getData().Wbid,
						"IWerks": oThat.oView.getModel("Head").getData().Werks,
						"EMessage": "",
						"IEbeln": oThat.oView.getModel("Head").getData().Ebeln,
						"IEbelp": oThat.oView.getModel("Head").getData().Ebelp,
						"IVbeln": oThat.oView.getModel("Head").getData().Vbeln,
						"IPosnr": oThat.oView.getModel("Head").getData().Posnr,
						// "IToken": oThat.OriginIvc === "E" ? sap.ui.getCore().byId("id_TokenField").getValue() : "", //Added by Avinash -- IVC Changes
						"IToken": IToken, // added for DSE dropdown by commenting above line on 01/07/2025 Srinivas
						"IApprove": oThat.IApprove,
						//"IBatchCharUpd"	: "X",
						//added by srinivas on 03/10/2025 for QA exception 
						"Grade" : oExpFragData.Grade,
                        "Surcharge" : oExpFragData.Surcharge,
                         "Reason" : oExpFragData.Reason,
						//ended by srinivas on 03/10/2025 for QA exception 
						"PostBatchCharNav": [],
						"PostReturnNav": []
					};
					if (oThat.oView.getModel("BATCH").getData().BatchCharsNav.results.length != 0) {
						var aBatchData = [];
						for (var b = 0; b < oThat.oView.getModel("BATCH").getData().BatchCharsNav.results.length; b++) {
							if (oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[b].Flag !== undefined && oThat.oView.getModel("BATCH").getData()
								.BatchCharsNav.results[b].ValueChar !== "") {
								aBatchData.push({
									CValue: oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[b].ValueChar,
									CDesc: oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[b].DescrChar,
									Atnam: oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[b].NameChar,
									Disp: ""
								});
							}

						}
						oEntity.PostBatchCharNav = aBatchData;
					}
					oThat.onCallService(oThat.Service, oEntity);
				}
			} else { //Added for Turkey Project
				oThat.Service = "SETCHAR";
				var oEntity = {
					"IAppname": "QC",
					"ICharg": oThat.oView.getModel("Head").getData().Charg,
					"IFinalApproval": "",
					"IItem": oThat.oView.getModel("Head").getData().Item,
					"ILifnr": "",
					"IMatnr": oThat.oView.getModel("Head").getData().Matnr,
					"IQchar": "",
					"ITmode": "",
					//"IvWboj"		: oThat.EvWtype,
					"IWbid": oThat.oView.getModel("Head").getData().Wbid,
					"IWerks": oThat.oView.getModel("Head").getData().Werks,
					"EMessage": "",
					"IEbeln": oThat.oView.getModel("Head").getData().Ebeln,
					"IEbelp": oThat.oView.getModel("Head").getData().Ebelp,
					"IVbeln": oThat.oView.getModel("Head").getData().Vbeln,
					"IPosnr": oThat.oView.getModel("Head").getData().Posnr,
					// "IToken": oThat.OriginIvc === "E" ? sap.ui.getCore().byId("id_TokenField").getValue() : "", //Added by Avinash -- IVC Changes
					"IApprove": oThat.IApprove,
					//"IBatchCharUpd"	: "X",
					//added by srinivas on 03/10/2025 for QA exception 
					"Grade": oExpFragData.Grade,
					"Surcharge": oExpFragData.Surcharge,
					"Reason": oExpFragData.Reason,
					//ended by srinivas on 03/10/2025 for QA exception 
					"PostBatchCharNav": [],
					"PostReturnNav": []
				};
				oThat.onCallService(oThat.Service, oEntity);
			}
		},
		onChangeHour: function (oEvent) {
			var vValue = oEvent.getSource().getValue();
			oEvent.getSource().setValueState('None');
			if (vValue < 0 || vValue > 12) {
				oEvent.getSource().setValueState('Error');
				oEvent.getSource().setValueStateText(oThat.oView.getModel("i18n").getResourceBundle().getText('Enter_Hour'));
			}
		},
		//===================================== column visibility settings =====================================//
		onSettings: function (oEvent) {
			if (!this._oTPC) {
				this._oTPC = new TablePersoController({
					table: oThat.oView.byId("pre_qual"),
					persoService: DemoPersoService
				}).activate();
			}

			this._oTPC.openDialog();
		},

		onTablePersoRefresh: function () {
			DemoPersoService.resetPersData();
			this._oTPC.refresh();
		},

		onNavBack: function () {
			// this._oTPC.destroy();
			if (this._oTP != undefined) {
				this._oTPC.destroy();
			}
			this.oRouter.navTo("Inbound");
		},
		//============================= Escape Handler ===========================//
		onEscapeBatch: function () {
			oThat.Batch.destroy();
		},
		onEscapeQueue: function () {
			oThat.oQueueFrag.destroy();
		},
		onExit: function () {
			if (this._oTP != undefined) {
				this._oTPC.destroy();
			}
		},
		onClosePreEway: function () {
			oThat.oPreQAEway.destroyContent();
			oThat.oPreQAEway.close();
		},
		fnSaveApproveQA: function (oEvent) {
			var vId = oEvent.getSource().getId();
			var IvApprove;
			if (vId.indexOf("id_BtnCharSaveChk") != -1) {
				oThat.IApprove = "A";
			} else if (vId.indexOf("id_BtnRejCharChek") != -1) {
				oThat.IApprove = "R";
			}
			var that = this;
			// oThat.Service = "SETCHAR";
			var oEntity = {
				"IAppname": "QC",
				"ICharg": oThat.oView.getModel("Head").getData().Charg,
				"IFinalApproval": "",
				"IItem": oThat.oView.getModel("Head").getData().Item,
				"ILifnr": "",
				"IMatnr": oThat.oView.getModel("Head").getData().Matnr,
				"IQchar": "",
				"ITmode": "",
				//"IvWboj"		: oThat.EvWtype,
				"IWbid": oThat.oView.getModel("Head").getData().Wbid,
				"IWerks": oThat.oView.getModel("Head").getData().Werks,
				"EMessage": "",
				"IEbeln": oThat.oView.getModel("Head").getData().Ebeln,
				"IEbelp": oThat.oView.getModel("Head").getData().Ebelp,
				"IVbeln": oThat.oView.getModel("Head").getData().Vbeln,
				"IPosnr": oThat.oView.getModel("Head").getData().Posnr,
				// "IToken": oThat.OriginIvc === "E" ? sap.ui.getCore().byId("id_TokenField").getValue() : "", //Added by Avinash -- IVC Changes
				"IApprove": oThat.IApprove,
				//"IBatchCharUpd"	: "X",
				"PostBatchCharNav": [],
				"PostReturnNav": []

			};
			oThat.oModel.create("/PostBatchSet", oEntity, {
				success: function (oData, oResponse) {
					if (oData.PostReturnNav.results[0].Type === 'S') {

						MessageBox.success(oData.PostReturnNav.results[0].Message, {
							icon: MessageBox.Icon.SUCCESS,
							actions: [MessageBox.Action.OK],
							onClose: function (oAction) {
								if (oAction == 'OK') {
									that._onRouteMatched();
									oThat.oPreQAEway.destroyContent();
									oThat.oPreQAEway.close();
									// that.oRouter.navTo("EwayBill");
								}
							}
						});
					} else {

						MessageBox.error(oData.PostReturnNav.results[0].Message);
					}
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(oError.message);
				}
			});
		},
		fnSaveRejectQA: function (oEvent) {
			var vId = oEvent.getSource().getId();
			var IvApprove;
			if (vId.indexOf("id_BtnCharSaveChk") != -1) {
				oThat.IApprove = "A";
			} else if (vId.indexOf("id_BtnRejCharChek") != -1) {
				oThat.IApprove = "R";
			}
			// oThat.Service = "SETCHAR";
			var oEntity = {
				"IAppname": "QC",
				"ICharg": oThat.oView.getModel("Head").getData().Charg,
				"IFinalApproval": "",
				"IItem": oThat.oView.getModel("Head").getData().Item,
				"ILifnr": "",
				"IMatnr": oThat.oView.getModel("Head").getData().Matnr,
				"IQchar": "",
				"ITmode": "",
				//"IvWboj"		: oThat.EvWtype,
				"IWbid": oThat.oView.getModel("Head").getData().Wbid,
				"IWerks": oThat.oView.getModel("Head").getData().Werks,
				"EMessage": "",
				"IEbeln": oThat.oView.getModel("Head").getData().Ebeln,
				"IEbelp": oThat.oView.getModel("Head").getData().Ebelp,
				"IVbeln": oThat.oView.getModel("Head").getData().Vbeln,
				"IPosnr": oThat.oView.getModel("Head").getData().Posnr,
				// "IToken": oThat.OriginIvc === "E" ? sap.ui.getCore().byId("id_TokenField").getValue() : "", //Added by Avinash -- IVC Changes
				"IApprove": oThat.IApprove,
				//"IBatchCharUpd"	: "X",
				"PostBatchCharNav": [],
				"PostReturnNav": []
			};
			oThat.oModel.create("/PostBatchSet", oEntity, {
				success: function (oData, oResponse) {
					if (oData.PostReturnNav.results[0].Type === 'S') {
						MessageBox.success(oData.PostReturnNav.results[0].Message, {
							icon: MessageBox.Icon.SUCCESS,
							actions: [MessageBox.Action.OK],
							onClose: function (oAction) {
								if (oAction == 'OK') {
									oThat.oPreQAEway.destroyContent();
									oThat._onRouteMatched();
									oThat.oPreQAEway.close();
									// that.oRouter.navTo("EwayBill");
								}
							}
						});
					} else {

						MessageBox.error(oData.PostReturnNav.results[0].Message);
					}
					sap.ui.core.BusyIndicator.hide();
					// sap.ui.core.BusyIndicator.hide();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(oError.message);
				}
			});
		}

	});

});