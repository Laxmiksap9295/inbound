var oThat;
var plantFlag;
var scanPlantFlag;
jQuery.sap.require("sap.ndc.BarcodeScanner"); //Added by Avinash
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/BusyDialog",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/MessageToast",
	"ZGT_MM_INBOUND/Util/Formatter"
], function (Controller, MessageBox, BusyDialog, JSONModel, Filter, MessageToast, Formatter) {
	"use strict";
	var sApplicationFlag, selectedDeviceId, codeReader, selectedDeviceId, oComboBox, sStartBtn, sResetBtn; //Added by Avinash
	return Controller.extend("ZGT_MM_INBOUND.controller.Truck_Reporting", {
		Formatter: Formatter,
		onInit: function () {
// truck reporting is copy of gate entry by srinivas on 27/09/2025 
			oThat = this;
			oThat.Images = [];
			oThat.BusyDialog = new BusyDialog();
			oThat.oView = this.getView();
			oThat.VendorCFM = ""; //Added by Avinash
			oThat.oView.setModel(new JSONModel({}), "oDisplayModel"); //Added by Avinash
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oThat.oScannedAsnNubers = []; // to check if we scanned same asn mutliple times
			this.oRouter.getRoute("TruckReporting").attachMatched(this._onRouteMatched, this);
		},
		//======================================================================================//
		//========================= Router matched handler function ===========================//
		//====================================================================================//
		_onRouteMatched: function (oEvent) {
			oThat.BusyDialog = new BusyDialog();
			oThat = this;
			oThat.oView = oThat.getView();
			oThat.Core = sap.ui.getCore();
			oThat.oView.setModel(new JSONModel(), "oViewModel"); // Model added by kirubakaran for brazil plant on 15.07.2020 to set Nota-Fisical Number//
			oThat.oView.getModel("oViewModel").setProperty("/CMSProperty", false);
			oThat.oView.getModel("oViewModel").setProperty("/NotaProperty", false);
			oThat.oView.getModel("oViewModel").setProperty("/BagProperty", false);
			oThat.oView.getModel("oViewModel").setProperty("/TransferProperty", false);
			oThat.oView.getModel("oViewModel").setProperty("/VendorIEProperty", false);
			//Added by Avinash CFM Changes
			oThat.getView().setModel(new sap.ui.model.json.JSONModel([]), "JmRem");
			oThat.oView.byId("id_InRemarksLabel").setVisible(false);
			oThat.oView.byId("id_InRemarks").setVisible(false);
			oThat.oView.byId("id_InMatDocLabel").setVisible(false);
			oThat.oView.byId("id_InMatDoc").setVisible(false);
			oThat.oView.byId("id_InMatDoc").setTokens([]);
			oThat.oView.byId("id_InRemarks").setValue("");
			oThat.oView.byId("id_Rbref").setVisible(false);
			oThat.oView.byId("id_RefTb").setVisible(false);
			oThat.oView.byId("id_Rbref").setSelectedIndex(-1);
			oThat.oView.byId("id_Param7Key").setState(true);
			oThat.oView.byId("id_Vendor").setValue("");
			oThat.oView.byId("vTextId").setText("");
			oThat.oView.setModel(new JSONModel({}), "oDisplayModel"); //Added by Avinash
			//End of Added
			scanPlantFlag = "";
			oThat.VendorCFM = ""; //Added by Avinash
			//	oThat.EvVehGateEntry = oEvent.getParameters().arguments.EvVehGateEntry;
			// Added by Srinivas on 16/07/2025 for ASN
			oThat.oAsnHeaderData = "";
			oThat.oAsnItemData = "";
			oThat.Asnnumber = "";
			oThat.multiAsnHeader = "";
			oThat.oMultiPlant = "";
			oThat.oScannedAsnNubers = [];
			oThat.oView.byId("id_VehiNo").setEditable(true);
			oThat.oView.byId("id_VehicleTy").setEditable(true);
			oThat.oView.byId("id_InDriver").setEditable(true);
			oThat.oView.byId("id_InDriverMob").setEditable(true);
			oThat.oView.byId("id_InTransport").setEditable(true);

			oThat.oView.byId("id_VehicleTyCombo").setEditable(true);
			oThat.oView.byId("id_Vendor").setEditable(true);
			oThat.oView.byId("id_scanid").setEnabled(true);
			oThat.oView.byId("id_InPlant").setEditable(true);
			//oThat.oView.byId("id_InManual").setEditable(true);
			// Ended Srinivas on 16/07/2025
			// Ended Srinivas on 16/07/2025
			oThat.TruckReporting = "" //added by srinivas on truck reporting on 10/10/2025
			// added by dhaarma on 30-11-2020
			if (oEvent) {
				// oThat.EvVehGateEntry = oEvent.getParameters().arguments.EvVehGateEntry;
              oThat.EvVehGateEntry = "X";
			} else {
				oThat.EvVehGateEntry = "X";
			}
			// ended by dhaarma on 30-11-2020
			var oVisible = {
				"QRCode": true,
				"Manual": false
			};
			oThat.oView.setModel(new JSONModel(oVisible), "VISI");
			oThat.oView.getModel("VISI").refresh(true);
			oThat.oView.byId("id_POBtn").setVisible(false);
			oThat.oView.byId("id_ScanToolbar").setVisible(false);
			oThat.oView.byId("id_LblProcess").setVisible(false);
			oThat.oView.byId("id_ComboProcess").setVisible(false);
			oThat.oView.byId("id_scanid").setState(true);
			oThat.oView.byId("id_VendorBox").setVisible(false);
			if (oThat.EvVehGateEntry == 'X') {
				oThat.oView.byId("id_POBtn").setVisible(true);
				oThat.oView.byId("id_ScanToolbar").setVisible(true);
				oThat.oView.byId("id_POBtn").setVisible(true);
				oThat.oView.byId("id_ScanToolbar").setVisible(true);
				oThat.oView.byId("id_LblProcess").setVisible(true);
				oThat.oView.byId("id_ComboProcess").setVisible(true);
			}
			oThat.oModel = oThat.getOwnerComponent().getModel();
			if (sap.ui.Device.system.phone) {
				oThat.oDevice = "P";
			} else {
				oThat.oDevice = "D";
			}

			oThat.gVPlant = ""; // added by dharma on 15-10-2020
			oThat.onSetPostModel();
			oThat.aQRCodeArray = [];
			// oThat.Images = []; //Commented by Avinash
			oThat.gVPlant = "";
			oThat.gvPlantname = "";
			oThat.oView.setModel(new JSONModel(oThat.Images), "MASS");
			oThat.oView.getModel("MASS").refresh(true);
			oThat.oView.setModel(new JSONModel(oThat.aQRCodeArray), "POLIST");
			// oThat.vWb = "WB";
			// oThat.oView.byId("id_PrintBtn").setVisible(false);
			oThat.Service = 'F4Model';
			var filter = [
				new Filter("ProcessType", sap.ui.model.FilterOperator.EQ, 'X'),
				new Filter("Plant", sap.ui.model.FilterOperator.EQ, 'X'),
				//	new Filter("Transporter", sap.ui.model.FilterOperator.EQ, 'X'),
				new Filter("Vehtype", sap.ui.model.FilterOperator.EQ, 'X')
			];
			// oThat.createList();
			oThat.onCallService(oThat.Service, filter);
			//==================== Layout Personalization model =======================//
			oThat.oDataInitial = {
				// Static data
				"Items": [{
					columnKey: "Challan",
					text: oThat.oView.getModel("i18n").getResourceBundle().getText("Delivery")
				}],
				// Runtime data
				"ColumnsItems": [{
					columnKey: "Challan",
					visible: false,
					index: 0
				}]
			};
			oThat.oDataBeforeOpen = {};
			oThat.oPersonalModel = new JSONModel(jQuery.extend(true, {}, oThat.oDataInitial));
			oThat.oView.setModel(oThat.oPersonalModel);
		},
		onSetPostModel: function () {
			oThat.gVPlant = "";
			oThat.gvPlantname = "";
			var oEntity = {
				"Images": [],
				"PoItem": [],
				"Werks": oThat.gVPlant,
				"Lifnr": "",
				"Gate": "",
				"Vehno": "",
				"Vehtyp": "",
				"Dname": "",
				"DriverMob": "",
				"Remark ": "",
				"Wtype": "",
				"Wbid": "",
				"Erdat": null,
				"Ertim": "PT00H00M00S",
				"Challan": "",
				"Token": "",
				"Name1": oThat.gvPlantname,
				"Wbname": "",
				"VendorName": "",
				"MatnrDesc": "",
				"LifnrDesc": "",
				"IvWbid": "",
				"IvItem": "",
				"DONo": "",
				"ParkingYard" :""
			};
			oThat.oView.setModel(new JSONModel(oEntity), "POST");
			oThat.oView.byId("id_LblWbId").setVisible(false);
			oThat.oView.byId("id_InWbId").setVisible(false);
			oThat.oView.byId("id_LblWbItem").setVisible(false);
			oThat.oView.byId("id_InWbItem").setVisible(false);
			oThat.oView.byId("id_LblDoNo").setVisible(false);
			oThat.oView.byId("id_InDoNo").setVisible(false);
			oThat.oView.byId("id_Param7").setVisible(false);
			oThat.oView.byId("id_InManual").setValue("");
			oThat.oView.byId("id_InManualCFM").setTokens([]); //Added by Avinash

			oThat.oView.byId("id_InRefNo").setVisible(false);
			oThat.oView.byId("id_InRefNoValue").setValue("");
			oThat.oView.byId("id_Vendor").setEditable(true);
		},

		//HB Start
		onGetPlantFlag: function () {
			oThat.oModel.read("/F4ParametersSet", {
				filters: [
					new Filter("IvWerks", sap.ui.model.FilterOperator.EQ, oThat.oView.getModel("POST").getData().Werks)
				],
				urlParameters: {
					$expand: "F4DirectionNav"
				},
				success: function (oData, oResp) {
					if (oData.results[0].EvFlagBrazil === "X") {
						oThat.oView.byId("id_driverno").setVisible(true);
						plantFlag = "X";
					} else {
						oThat.oView.byId("id_driverno").setVisible(false);
						plantFlag = "";
					}
				}.bind(this),
				error: function (oError) {

				}
			});
		},
		//HB End
		//====================================================================================//
		//==================== Call Service =================================================//
		//===================================================================================//
		onCallService: function (service, Data) {
			oThat.BusyDialog.open();
			if (oThat.Service === 'GATE') {
				oThat.oModel.read("/F4GatesSet", {
					filters: Data,
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
				oThat.onGetPlantFlag();
			} else if (oThat.Service === 'SAVE') {
				oThat.oModel.create("/PostHeadersSet", Data, {
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service == 'VALIDATE' || oThat.Service == "PDF" || oThat.Service == "VEHICLE" || oThat.Service == "VALIDWBID" ||
				oThat.Service == "VALIDDELIVERY" || oThat.Service == "VEHICLEVALIDATE") {
				oThat.oModel.create("/GetHeadersSet", Data, {
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service === "F4Model") {
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
			} else if (oThat.Service == "REPRINT") {
				oThat.oModel.create("/GetHeadersSet", Data, {
					filters: Data,
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			}
			// Added by Srinivas on 29/06/2025
			else if (oThat.Service == "TruckTypeCombo") {
				oThat.oModel.read("/F4ParametersSet", {
					filters: Data,
					urlParameters: {
						$expand: "F4TruckTypeSetNav"
					},
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			}
			//  End of Added by Srinivas on 29/06/2025
		},
		mySuccessHandler: function (oData, oResponse) {
			oThat.BusyDialog.close();
			if (oThat.Service === 'GATE') {
				//code added by kirubakaran for brazil plant on 16.10.2020
				if (oData.results.length === 1) {
					oThat.getView().byId("id_InGate").setValue(oData.results[0].Gate + " - " + oData.results[0].Wbname);
					oThat.oView.getModel("POST").getData().Gate = oData.results[0].Gate;
					oThat.oView.getModel("POST").getData().Wbname = oData.results[0].Wbname;
					oThat.vWb = oData.results[0].Wbobj;
					//	var bGate = oThat.oView.byId("id_InGate").getValue();
					//	oThat.oView.getModel("POST").getData().Gate = this.bGate;
				}
				//code ended by kirubakaran for brazil plant on 16.10.2020
				oThat.oView.setModel(new JSONModel(oData), "GATE");
			} else if (oThat.Service === 'SAVE') {
				// if(oData.PostReturnNav != null){
				//added by srinivas on 06/08/2025 to clear images/docs after wb id creation for ASN
				// if (oThat.Asnnumber) {
				// 	oThat.Images = []
				// }
				//End by srinivas on 06/08/2025 for ASN
				oThat._onRouteMatched();
				if (oData.PostReturnNav.results.length != 0) {
					var aError = oData.PostReturnNav.results.filter(function (x) {
						if (x.Type == 'E') {
							return x;
						}
					});
					if (aError != 0) {
						MessageBox.error(aError[0].Message);
					}
					var aSuccess = oData.PostReturnNav.results.filter(function (x) {
						if (x.Type == 'S') {
							return x;
						}
					});
					if (aSuccess != 0) {
						oThat.oView.byId("id_Vendor").setValue("");
						oThat.oView.byId("id_VendorBox").setVisible(false);
						if (oData.PostWbHeaderNav.results[0].Challan != "") {
							oThat.oView.byId("id_InManual").setEnabled(true);
							// oThat.oView.byId("id_ToolbarManual").setVisible(true);
						}

						// added by dharma on 30-11-2020
						scanPlantFlag = "";
						oThat.aQRCodeArray = [];
						// oThat.Images = [];  //Commented by Avinash on 12/06/21
						oThat.oView.getModel("POLIST").setData(oThat.aQRCodeArray);
						oThat.oView.getModel("POLIST").refresh(true);
						oThat.oView.setModel(new JSONModel(oData), "RETURN");
						oThat.onSetPostModel();
						// ended by dharma on 30-11-2020

						MessageBox.show(aSuccess[0].Message, {
							icon: MessageBox.Icon.SUCCESS,
							title: oThat.oView.getModel("i18n").getResourceBundle().getText("Title19"),
							actions: [MessageBox.Action.OK],
							onClose: function (oAction) {
								oThat.onDmsPost(oData.PostWbHeaderNav.results[0].Wbid);
								if (oAction === 'OK') {
									// added by dharma on 15-10-2020 to clear WERKS once submitted
									oThat.oView.getModel("POST").getData().Werks = "";

									oThat.oView.getModel("POST").refresh();
									// ended by dharma on 15-10-2020
									MessageBox.show(oThat.oView.getModel("i18n").getResourceBundle().getText("Msg2"), {
										icon: MessageBox.Icon.INFORMATION,
										title: oThat.oView.getModel("i18n").getResourceBundle().getText("Title16"),
										actions: [MessageBox.Action.YES, MessageBox.Action.NO],
										onClose: function (oAction) {
											if (oAction === 'YES') {
												var vWbid = oData.PostWbHeaderNav.results[0].Wbid;
												var sServiceUrl = oThat.oModel.sServiceUrl;
												var vSelectedLots = "";
												 var sRead = "/DownloadSet(IvWbid='" + vWbid + "',IvPrint='X',GateEntry='X',IvBatch='" + vSelectedLots +  "')/$value";
												// var sRead = "/DownloadSet(IvWbid='" + vWbid + "',IvPrint='X',TruckReport='X',IvBatch='" + vSelectedLots +  "')/$value";
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
												scanPlantFlag = "";
												oThat.aQRCodeArray = [];
												// oThat.Images = []; //Commented by Avinash
												oThat.oView.getModel("POLIST").setData(oThat.aQRCodeArray);
												oThat.oView.getModel("POLIST").refresh(true);
												oThat.oView.setModel(new JSONModel(oData), "RETURN");
												oThat.onSetPostModel();
											} else {
												scanPlantFlag = "";
												oThat.aQRCodeArray = [];
												// oThat.Images = []; //Commented by Avinash
												oThat.oView.getModel("POLIST").setData(oThat.aQRCodeArray);
												oThat.oView.getModel("POLIST").refresh(true);
												oThat.oView.setModel(new JSONModel(oData), "RETURN");
												oThat.onSetPostModel();

											}
										}
									});
								}
							}

						});
					}
				}
				// }
				else {
					oThat.aQRCodeArray = [];
					// oThat.Images = []; //Commented by Avinash
					oThat.oView.getModel("POLIST").setData(oThat.aQRCodeArray);
					oThat.oView.getModel("POLIST").refresh(true);
					oThat.oView.byId("id_InManual").setEnabled(true);
					oThat.oView.setModel(new JSONModel(oData), "RETURN");
				}
			} else if (oThat.Service == 'VALIDATE') {
				if (oData.GetReturnNav.results.length != 0) {
					var aError = oData.GetReturnNav.results.filter(function (x) {
						if (x.Type == 'E') {
							return x;
						}
					});
					var msg = "";
					if (aError != 0) {
						for (var i = 0; i < aError.length; i++) {
							msg = msg + "\n" + aError[0].Message;

						}
						MessageBox.error(msg);
						//added by dharma on 16-02-2020
						if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin === "C") {
							oThat.oView.getModel("POST").getData().DONo = "";
							oThat.oView.getModel("POST").refresh(true);
							oThat.oView.getModel("POST").refresh();
						}
						//ended by dharma on 16-02-2021
					} else {
						// var Ebeln="" ;var Vbeln = "" ;var vMatnr = "";var Parnr = "";
						//========== Added for TRIP process ===============//
						var vWtype = "";
						var vProcess = oThat.oView.getModel("F4Model").getData().results[0].F4ProcessNav.results.filter(function (obj) {
							return obj.SeqNo == oThat.oView.getModel("POST").getData().Wtype;
						});
						if (vProcess.length != 0) {
							vWtype = vProcess[0].Process;
						}
						if (vWtype == "TRIP") {
							oThat.oView.byId("id_InManual").setValue("");
							oThat.oView.byId("id_WbIdItem").setValue("");
							oThat.oView.getModel("POST").getData().IvWbid = oData.IvWbid;
							oThat.oView.getModel("POST").getData().IvItem = oData.IvItem;
							oThat.oView.getModel("POST").getData().Vehtyp = oData.WbHeaderNav.results[0].Vehtyp;
							oThat.oView.getModel("POST").getData().Dname = oData.WbHeaderNav.results[0].Dname;
							oThat.oView.getModel("POST").getData().DriverMob = oData.WbHeaderNav.results[0].DriverMob;
							oThat.oView.getModel("POST").getData().Vehno = oData.WbHeaderNav.results[0].Vehno;
							oThat.oView.getModel("POST").getData().Lifnr = oData.WbHeaderNav.results[0].Lifnr;
							oThat.oView.getModel("POST").getData().Wbname = oData.WbHeaderNav.results[0].GateName;
							oThat.oView.getModel("POST").getData().LifnrDesc = oData.WbHeaderNav.results[0].LifnrName;
							oThat.oView.getModel("POST").getData().Challan = oData.WbHeaderNav.results[0].Challan;
							oThat.oView.getModel("POST").getData().Token = oData.WbHeaderNav.results[0].Token;
							oThat.oView.getModel("POST").getData().Wbid = oData.WbHeaderNav.results[0].Wbid;
							if (oData.WbHeaderNav.results[0].Gate != "") {
								oThat.vWb = "WB";
								oThat.oView.getModel("POST").getData().Gate = oData.WbHeaderNav.results[0].Gate;
							}
							if (oData.WbHeaderNav.results[0].Wsgate != "") {
								oThat.vWb = "WS";
								oThat.oView.getModel("POST").getData().Gate = oData.WbHeaderNav.results[0].Wsgate;
							}
							if (oData.WbHeaderNav.results[0].Dname !== "" && oData.WbHeaderNav.results[0].Dname !== undefined) {
								oThat.oView.byId("id_InDriver").setValueState('None');
							}
							if (oData.WbHeaderNav.results[0].DriverMob !== "" && oData.WbHeaderNav.results[0].DriverMob !== undefined) {
								oThat.oView.byId("id_InDriverMob").setValueState('None');
							}
							if (oData.WbHeaderNav.results[0].Vehtyp !== "" && oData.WbHeaderNav.results[0].Vehtyp !== undefined) {
								oThat.oView.byId("id_VehicleTy").setValueState('None');
							}
							if (oData.WbHeaderNav.results[0].Vehno !== "" && oData.WbHeaderNav.results[0].Vehno !== undefined) {
								oThat.oView.byId("id_VehiNo").setValueState('None');
							}
							oThat.oView.getModel("POLIST").setData(oData.WbItemNav.results);
							oThat.oView.getModel("POLIST").refresh();
							if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin === "C") {
								oThat.oView.getModel("POST").getData().DONo = oData.WbItemNav.results[0].Config10;
							}
							oThat.oView.getModel("POST").refresh(true);
						}
						//================= ended for TRIP process ===========
						else {
							oThat.oView.byId("id_InManual").setValue("");
							if (oThat.oView.byId("id_MatnrDesc").getText()) {
								oThat.oView.byId("id_MatnrDesc").setText("");
								oThat.oView.getModel("POST").getData().MatnrDesc = "";
								oThat.oView.getModel("POST").refresh();
							}

							//code added by kirubakaran for Brazil plant on 15.07.2020 to set Nota-Fisical Number//
							if (oData.PoItemNav.results.length > 0) {
								if (oData.PoItemNav.results[0].FLAG === "X") {
									//HB start
									oThat.oView.byId("id_driverno").setVisible(true);
									//HB end
									oThat.oView.getModel("oViewModel").setProperty("/NotaProperty", true);
									if (vWtype !== "RETURN") {
										oThat.oView.getModel("oViewModel").setProperty("/BagProperty", true);
									} else {
										oThat.oView.getModel("oViewModel").setProperty("/BagProperty", false);
									}
									oThat.oView.getModel("oViewModel").setProperty("/CMSProperty", true);
								} else {
									//HB start
									oThat.oView.byId("id_driverno").setVisible(false);
									//HB End
									oThat.oView.getModel("oViewModel").setProperty("/NotaProperty", false);
									oThat.oView.getModel("oViewModel").setProperty("/CMSProperty", false);
									oThat.oView.getModel("oViewModel").setProperty("/BagProperty", false);
								}
							}
							//code ended by kirubakaran for Brazil plant on 15.07.2020 to set Nota-Fisical Number//
							if (oThat.oView.byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text3")) {
								oThat.oView.setModel(new JSONModel(oData.PoItemNav), "oPoitemModel");
								//oThat.getView().getModel('oPoitemModel').setProperty("/AsnNo", oThat.aASNnumber);
								oThat.oView.getModel("oPoitemModel").refresh();
								oThat.oPoItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PoItemList", oThat);
								oThat.oView.addDependent(oThat.oPoItemFrag);
								oThat.oPoItemFrag.open();
								if (plantFlag === "X") {
									if (scanPlantFlag === "X") {
										oThat.onScanPost();
									}
								}

							} else if (oThat.oView.byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text21")) {
								// oThat.oView.getModel("POLIST").setData([]);
								oData.PoItemNav.results[0].Parnr = oThat.oView.byId("id_Vendor").getValue();
								oThat.oView.getModel("POLIST").getData().push(oData.PoItemNav.results[0]);
								oThat.oView.getModel("POLIST").refresh(true);
							} else if (oThat.oView.byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text4")) {
								if (oData.WbHeaderNav.results.length != 0) {
									oThat.oView.getModel("POST").getData().Vehno = oData.WbHeaderNav.results[0].Vehno;
									oThat.oView.getModel("POST").getData().Vehtyp = oData.WbHeaderNav.results[0].Vehtyp;
									oThat.oView.getModel("POST").getData().Dname = oData.WbHeaderNav.results[0].Dname;
									oThat.oView.getModel("POST").getData().Lifnr = oData.WbHeaderNav.results[0].Lifnr;
									oThat.oView.getModel("POST").getData().DriverMob = oData.WbHeaderNav.results[0].DriverMob;
									oThat.oView.getModel("POST").refresh();
								}
								oThat.oView.setModel(new JSONModel(oData.DelItemNav), "oPoitemModel");
								oThat.oView.getModel("oPoitemModel").refresh();
								oThat.oPoItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.DelItemList", oThat);
								oThat.oView.addDependent(oThat.oPoItemFrag);
								oThat.oPoItemFrag.open();
							}
						}
					}
				}
				// }
				else {
					// var Ebeln="" ;var Vbeln = "" ;var vMatnr = "";var Parnr = "";
					//======= Added for TRIP process =========//
					var vWtype = "";
					var vProcess = oThat.oView.getModel("F4Model").getData().results[0].F4ProcessNav.results.filter(function (obj) {
						return obj.SeqNo == oThat.oView.getModel("POST").getData().Wtype;
					});
					if (vProcess.length != 0) {
						vWtype = vProcess[0].Process;
					}
					if (vWtype == "TRIP") {
						oThat.oView.byId("id_InManual").setValue("");
						oThat.oView.byId("id_WbIdItem").setValue("");

						oThat.oView.getModel("POST").getData().IvWbid = oData.WbItemNav.results[0].Wbid;
						oThat.oView.getModel("POST").getData().IvItem = oData.WbItemNav.results[0].Item;
						oThat.oView.getModel("POST").getData().Vehtyp = oData.WbHeaderNav.results[0].Vehtyp;
						oThat.oView.getModel("POST").getData().Dname = oData.WbHeaderNav.results[0].Dname;
						oThat.oView.getModel("POST").getData().DriverMob = oData.WbHeaderNav.results[0].DriverMob;
						oThat.oView.getModel("POST").getData().Vehno = oData.WbHeaderNav.results[0].Vehno;
						oThat.oView.getModel("POST").getData().Lifnr = oData.WbHeaderNav.results[0].Lifnr;
						oThat.oView.getModel("POST").getData().Wbname = oData.WbHeaderNav.results[0].GateName;
						oThat.oView.getModel("POST").getData().LifnrDesc = oData.WbHeaderNav.results[0].LifnrName;
						oThat.oView.getModel("POST").getData().Challan = oData.WbHeaderNav.results[0].Challan;
						oThat.oView.getModel("POST").getData().Token = oData.WbHeaderNav.results[0].Token;
						oThat.oView.getModel("POST").getData().Wbid = oData.WbHeaderNav.results[0].Wbid;
						if (oData.WbHeaderNav.results[0].Gate != "") {
							oThat.vWb = "WB";
							oThat.oView.getModel("POST").getData().Gate = oData.WbHeaderNav.results[0].Gate;
						}
						if (oData.WbHeaderNav.results[0].Wsgate != "") {
							oThat.vWb = "WS";
							oThat.oView.getModel("POST").getData().Gate = oData.WbHeaderNav.results[0].Wsgate;
						}

						if (oData.WbHeaderNav.results[0].Dname !== "" && oData.WbHeaderNav.results[0].Dname !== undefined) {
							oThat.oView.byId("id_InDriver").setValueState('None');
						}
						if (oData.WbHeaderNav.results[0].DriverMob !== "" && oData.WbHeaderNav.results[0].DriverMob !== undefined) {
							oThat.oView.byId("id_InDriverMob").setValueState('None');
						}
						if (oData.WbHeaderNav.results[0].Vehtyp !== "" && oData.WbHeaderNav.results[0].Vehtyp !== undefined) {
							oThat.oView.byId("id_VehicleTy").setValueState('None');
						}
						if (oData.WbHeaderNav.results[0].Vehno !== "" && oData.WbHeaderNav.results[0].Vehno !== undefined) {
							oThat.oView.byId("id_VehiNo").setValueState('None');
						}
						oThat.oView.getModel("POLIST").setData(oData.WbItemNav.results);
						oThat.oView.getModel("POLIST").refresh();
						if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin === "C") {
							oThat.oView.getModel("POST").getData().DONo = oData.WbItemNav.results[0].Config10;
						}
						oThat.oView.getModel("POST").refresh(true);
					} else {
						oThat.oView.byId("id_InManual").setValue("");
						if (oThat.oView.byId("id_MatnrDesc").getText()) {
							oThat.oView.byId("id_MatnrDesc").setText("");
							oThat.oView.getModel("POST").getData().MatnrDesc = "";
							oThat.oView.getModel("POST").refresh();
						}
						//code added by kirubakaran for brazil plant on 15.07.2020 to set Nota-Fisical Number//
						if (oData.PoItemNav.results.length > 0) {
							if (oData.PoItemNav.results[0].FLAG === "X") {
								//Hb start
								oThat.oView.byId("id_driverno").setVisible(true);
								//HB End
								oThat.oView.getModel("oViewModel").setProperty("/NotaProperty", true);
								oThat.oView.getModel("oViewModel").setProperty("/CMSProperty", true);
								if (vWtype !== "RETURN") {
									oThat.oView.getModel("oViewModel").setProperty("/BagProperty", true);
								} else {
									oThat.oView.getModel("oViewModel").setProperty("/BagProperty", false);
								}
								plantFlag = "X";
							} else {
								//HB start
								oThat.oView.byId("id_driverno").setVisible(false);
								//HB End
								oThat.oView.getModel("oViewModel").setProperty("/NotaProperty", false);
								oThat.oView.getModel("oViewModel").setProperty("/CMSProperty", false);
								oThat.oView.getModel("oViewModel").setProperty("/BagProperty", false);
								plantFlag = "";
							}
						}
						if (oData.DelItemNav.results.length > 0) {
							if (oData.DelItemNav.results[0].Flag === "X") {
								//Hb start
								oThat.oView.byId("id_driverno").setVisible(true);
								//HB End
								oThat.oView.getModel("oViewModel").setProperty("/NotaProperty", true);
								oThat.oView.getModel("oViewModel").setProperty("/CMSProperty", true);
								if (vWtype !== "RETURN") {
									oThat.oView.getModel("oViewModel").setProperty("/BagProperty", true);
								} else {
									oThat.oView.getModel("oViewModel").setProperty("/BagProperty", false);
								}
								plantFlag = "X";
							} else {
								//HB start
								oThat.oView.byId("id_driverno").setVisible(false);
								//HB End
								oThat.oView.getModel("oViewModel").setProperty("/NotaProperty", false);
								oThat.oView.getModel("oViewModel").setProperty("/CMSProperty", false);
								oThat.oView.getModel("oViewModel").setProperty("/BagProperty", false);
								plantFlag = "";
							}
						}
						//code ended by kirubakarab for brazil plant on 15.07.2020 to set Nota-Fisical Number//
						if (oThat.oView.byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text3")) {
							oThat.oView.setModel(new JSONModel(oData.PoItemNav), "oPoitemModel");
							//oThat.getView().getModel('oPoitemModel').setProperty("/AsnNo", oThat.aASNnumber);

							if (plantFlag === "X") {
								if (scanPlantFlag === "X") {
									for (var z = 0; z < oData.PoItemNav.results.length; z++) {
										oThat.scanArry.results.push(oData.PoItemNav.results[z]);
									}
									//	oThat.scanArry.push(oData.PoItemNav);
									if (oThat.scanArry.results.length === oThat.aData.length) {
										oThat.oView.setModel(new JSONModel(oThat.scanArry), "oPoitemModel");
										oThat.onScanPost();
									}
									//	oThat.onScanPost();
								} else {
									oThat.oPoItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PoItemList", oThat);
									oThat.oView.addDependent(oThat.oPoItemFrag);
									oThat.oPoItemFrag.open();
								}
							}

							//Added by Srinivas on 15/07/2025 for ASN
							else if (oThat.Asnnumber) {
								var oPoItemModel = oThat.oView.getModel("oPoitemModel").getData().results;
								var aAsnItems = oThat.oAsnItemData; // your ASN input array
								// Utility to normalize Material Number (remove leading zeros)
								function normalizeMatnr(matnr) {
									return matnr.replace(/^0+/, '');
								}
								// Loop over ASN items
								aAsnItems.forEach(function (asnItem) {
									var poNumber = asnItem.Ponumber;
									var poitemId = asnItem.PoitemId;
									var oMaterial = asnItem.Material.match(/\d+/)[0]
									var oMaterial2 = normalizeMatnr(oMaterial); // clean material from ASN
									// Find matching items in oPoItemModel
									var matchedItems = oPoItemModel.filter(function (poItem) {
										return poItem.Ebeln === poNumber && normalizeMatnr(poItem.Matnr) === oMaterial2 && poItem.Ebelp === poitemId;
									});
									//push ASN number also
									//if (matchedItems) {
									if (Object.keys(matchedItems).length) {
										//Object.keys(matchedItems).length === 0
										matchedItems[0].AsnNumber = oThat.Asnnumber;
									}
									// ✅ Push all matched items individually into POLIST model
									if (matchedItems.length) {
										Array.prototype.push.apply(oThat.oView.getModel("POLIST").getData(), matchedItems);
									}
									// if(matchedItems[0]){
									// oThat.oView.getModel("POLIST").getData().push(matchedItems[0]);
									// }
								});
								oThat.oView.getModel("POLIST").refresh();
							}
							//end by Srinivas on 15/07/2025 for ASN					
							else {
								oThat.oPoItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PoItemList", oThat);
								oThat.oView.addDependent(oThat.oPoItemFrag);
								oThat.oPoItemFrag.open();
							}
							// commented on 21.01.2025 as it trying to open fragment again which opend in above line and causing issue while closing
							// oThat.oPoItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PoItemList", oThat);
							// oThat.oView.addDependent(oThat.oPoItemFrag);

						} else if (oThat.oView.byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text21")) {
							// oThat.oView.getModel("POLIST").setData([]);
							// if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin !== "H" && oData.Transfer === "X") { //Added by Avinash - CFM Changes
							if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin !== "H") { //Added by Avinash - CFM Changes
								if (oData.Transfer === "X") {
									oData.PoItemNav.results[0].Parnr = oThat.oView.byId("id_Vendor").getValue();
									oData.PoItemNav.results[0].Vendor = oThat.oView.byId("id_Vendor").getValue();
									oData.PoItemNav.results[0].Vname = oThat.oView.byId("vTextId").getText();
									oThat.oView.getModel("POLIST").refresh(true);
									oThat.oView.getModel("oViewModel").setProperty("/TransferProperty", true);
									oThat.oView.getModel("oViewModel").setProperty("/NotaProperty", true);
									oThat.oView.getModel("oViewModel").setProperty("/CMSProperty", false);
									oThat.oView.getModel("oViewModel").setProperty("/Spotproperty", false);
									oThat.oView.getModel("oViewModel").setProperty("/BagProperty", false);
									oThat.oView.byId("id_driverno").setVisible(true);
									oThat.oView.setModel(new JSONModel(oData.PoItemNav), "oPoitemModel");
									//oThat.getView().getModel('oPoitemModel').setProperty("/AsnNo", oThat.aASNnumber);
									oThat.oPoItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PoItemList", oThat);
									oThat.oView.addDependent(oThat.oPoItemFrag);
									oThat.oPoItemFrag.open();
								} else {
									if (oThat.oView.getModel("oViewModel").getData().CMSProperty !== true) {
										oData.PoItemNav.results[0].Parnr = oThat.oView.byId("id_Vendor").getValue();
										// oThat.oView.getModel("POLIST").getData().push(oData.PoItemNav.results[0]);
										for (var i = 0; i < oData.PoItemNav.results.length; i++) {
											oThat.oView.getModel("POLIST").getData().push(oData.PoItemNav.results[i]); //Changed by Avinash
										}
										oThat.oView.getModel("POLIST").refresh(true);
									}
								}
							}
							if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin === "H" && vWtype !== "TRANSFER") {
								if (oThat.oView.getModel("oViewModel").getData().CMSProperty !== true) {
									oData.PoItemNav.results[0].Parnr = oThat.oView.byId("id_Vendor").getValue();
									// oThat.oView.getModel("POLIST").getData().push(oData.PoItemNav.results[0]);
									for (var i = 0; i < oData.PoItemNav.results.length; i++) {
										oThat.oView.getModel("POLIST").getData().push(oData.PoItemNav.results[i]);
									}
									oThat.oView.getModel("POLIST").refresh(true);
								}
							} else if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin === "H" && vWtype == "TRANSFER") { //Added by Avinash - CFM Changes
								oThat.oView.byId("id_InManual").setValue("");
								oThat.oView.byId("id_WbIdItem").setValue("");
								oThat.oView.getModel("POST").getData().IvWbid = oData.IvWbid;
								oThat.oView.getModel("POST").getData().IvItem = oData.IvItem;
								oThat.oView.getModel("POST").getData().Vehtyp = oData.WbHeaderNav.results[0].Vehtyp;
								oThat.oView.getModel("POST").getData().Dname = oData.WbHeaderNav.results[0].Dname;
								oThat.oView.getModel("POST").getData().DriverMob = oData.WbHeaderNav.results[0].DriverMob;
								oThat.oView.getModel("POST").getData().Vehno = oData.WbHeaderNav.results[0].Vehno;
								oThat.oView.getModel("POST").getData().Lifnr = oData.WbHeaderNav.results[0].Lifnr;
								oThat.oView.getModel("POST").getData().Wbname = oData.WbHeaderNav.results[0].GateName;
								oThat.oView.getModel("POST").getData().LifnrDesc = oData.WbHeaderNav.results[0].LifnrName;
								oThat.oView.getModel("POST").getData().Challan = oData.WbHeaderNav.results[0].Challan;
								oThat.oView.getModel("POST").getData().Token = oData.WbHeaderNav.results[0].Token;
								oThat.oView.getModel("POST").getData().Wbid = oData.WbHeaderNav.results[0].Wbid;
								if (oData.WbHeaderNav.results[0].Gate != "") {
									oThat.vWb = "WB";
									oThat.oView.getModel("POST").getData().Gate = oData.WbHeaderNav.results[0].Gate;
								}
								if (oData.WbHeaderNav.results[0].Wsgate != "") {
									oThat.vWb = "WS";
									oThat.oView.getModel("POST").getData().Gate = oData.WbHeaderNav.results[0].Wsgate;
								}

								if (oData.WbHeaderNav.results[0].Dname !== "" && oData.WbHeaderNav.results[0].Dname !== undefined) {
									oThat.oView.byId("id_InDriver").setValueState('None');
								}
								if (oData.WbHeaderNav.results[0].DriverMob !== "" && oData.WbHeaderNav.results[0].DriverMob !== undefined) {
									oThat.oView.byId("id_InDriverMob").setValueState('None');
								}
								if (oData.WbHeaderNav.results[0].Vehtyp !== "" && oData.WbHeaderNav.results[0].Vehtyp !== undefined) {
									oThat.oView.byId("id_VehicleTy").setValueState('None');
								}
								if (oData.WbHeaderNav.results[0].Vehno !== "" && oData.WbHeaderNav.results[0].Vehno !== undefined) {
									oThat.oView.byId("id_VehiNo").setValueState('None');
								}
								oThat.oView.getModel("POLIST").setData(oData.WbItemNav.results);
								oThat.oView.getModel("POLIST").refresh();
								if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin === "C") {
									oThat.oView.getModel("POST").getData().DONo = oData.WbItemNav.results[0].Config10;
								}
								oThat.oView.getModel("POST").refresh(true);

							}
							//EOC by Avinash - CFM Changes
							//Rahul-Start on 16.10.2020 for brazil plant
							if (oData.PoItemNav.results.length > 0) {
								if (oData.PoItemNav.results[0].FLAG === "X") {
									oThat.oView.getModel("oViewModel").setProperty("/CMSProperty", false);
									oThat.oView.getModel("oViewModel").setProperty("/Spotproperty", false);
									oThat.oView.getModel("oViewModel").setProperty("/VendorIEProperty", true);
									//	oThat.oView.setModel(new JSONModel(oData), "oPoitemVendorIEModel");
									oThat.oView.setModel(new JSONModel(oData.PoItemNav), "oPoitemModel");
									//oThat.getView().getModel('oPoitemModel').setProperty("/AsnNo", oThat.aASNnumber);
									if (plantFlag === "X") {
										if (scanPlantFlag === "X") {
											for (var z = 0; z < oData.PoItemNav.results.length; z++) {
												oThat.scanArry.results.push(oData.PoItemNav.results[z]);
											}
											//	oThat.scanArry.push(oData.PoItemNav);
											if (oThat.scanArry.results.length === oThat.aData.length) {
												oThat.oView.setModel(new JSONModel(oThat.scanArry), "oPoitemModel");
												oThat.onScanPost();
											}
											//	oThat.onScanPost();
										} else {
											oThat.oPoItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PoItemList", oThat);
											oThat.oView.addDependent(oThat.oPoItemFrag);
											oThat.oPoItemFrag.open();
										}
									} else {
										oThat.oPoItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PoItemList", oThat);
										oThat.oView.addDependent(oThat.oPoItemFrag);
										oThat.oPoItemFrag.open();
									}
									oThat.oPoItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PoItemList", oThat);
									oThat.oView.addDependent(oThat.oPoItemFrag);
								}
							}
							//Rahul -End on 16.10.2020 for brazil plant

						} else if (oThat.oView.byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text4")) {
							if (oData.WbHeaderNav.results.length != 0) {
								oThat.oView.getModel("POST").getData().Vehno = oData.WbHeaderNav.results[0].Vehno;
								oThat.oView.getModel("POST").getData().Wbid = oData.WbHeaderNav.results[0].Wbid;
								oThat.oView.getModel("POST").getData().Vehtyp = oData.WbHeaderNav.results[0].Vehtyp;
								oThat.oView.getModel("POST").getData().Dname = oData.WbHeaderNav.results[0].Dname;
								oThat.oView.getModel("POST").getData().Lifnr = oData.WbHeaderNav.results[0].Lifnr;
								// added by dharma on 15-10-2020
								oThat.oView.getModel("POST").getData().LifnrDesc = oData.WbHeaderNav.results[0].LifnrName;
								// endded by dharma on 15-10-2020
								oThat.oView.getModel("POST").getData().DriverMob = oData.WbHeaderNav.results[0].DriverMob;
								oThat.oView.getModel("POST").refresh();
								oThat.oView.getModel("oDisplayModel").getData().EvOrigin = oData.EvOrigin;
								oThat.oView.getModel("oDisplayModel").refresh();
							}
							oThat.oView.setModel(new JSONModel(oData.DelItemNav), "oPoitemModel");
							oThat.oView.getModel("oPoitemModel").refresh();
							// Added for CFM Port Changes
							//oThat.oView.getModel("oDisplayModel").getData().EvOrigin !== 'H' &&	//Removed by Pavan on 22/03/2023 from the below If Condition
							if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin !==
								'L' && oThat.oView.getModel("oDisplayModel").getData().EvOrigin !== 'J') {
								oThat.oPoItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.DelItemList", oThat);
								oThat.oView.addDependent(oThat.oPoItemFrag);
								oThat.oPoItemFrag.open();
							} else {
								oThat.onClosePoIteList();
							}
						}
					}

				}
			} else if (oThat.Service == "VEHICLE") {
				if (oData.GetReturnNav.results.length != 0) {
					var aError = oData.GetReturnNav.results.filter(function (oItem) {
						if (oItem.Type == "E") {
							return oItem.Message;
						}
					});
					var msg = "";
					for (var i = 0; i < oData.GetReturnNav.results.length; i++) {
						msg = msg + "\n" + oData.GetReturnNav.results[i].Message;
					}
					if (aError.length != 0) {
						MessageBox.error(msg);
						oThat.oView.getModel("POST").getData().Vehno = "";
					}

					oThat.oView.getModel("POST").getData().Vehtyp = oData.WbHeaderNav.results[0].Vehtyp;
					oThat.oView.getModel("POST").getData().Dname = oData.WbHeaderNav.results[0].Dname;
					oThat.oView.getModel("POST").getData().DriverMob = oData.WbHeaderNav.results[0].DriverMob;
					oThat.oView.getModel("POST").refresh(true);
					if (oData.WbHeaderNav.results[0].Dname !== "" && oData.WbHeaderNav.results[0].Dname !== undefined) {
						oThat.oView.byId("id_InDriver").setValueState('None');
					}
					if (oData.WbHeaderNav.results[0].DriverMob !== "" && oData.WbHeaderNav.results[0].DriverMob !== undefined) {
						oThat.oView.byId("id_InDriverMob").setValueState('None');
					}
					if (oData.WbHeaderNav.results[0].Vehtyp !== "" && oData.WbHeaderNav.results[0].Vehtyp !== undefined) {
						oThat.oView.byId("id_VehicleTy").setValueState('None');
					}
				} else {
					oThat.oView.getModel("POST").getData().Vehtyp = oData.WbHeaderNav.results[0].Vehtyp;
					oThat.oView.getModel("POST").getData().Dname = oData.WbHeaderNav.results[0].Dname;
					oThat.oView.getModel("POST").getData().DriverMob = oData.WbHeaderNav.results[0].DriverMob;
					oThat.oView.getModel("POST").refresh(true);
					if (oData.WbHeaderNav.results[0].Dname !== "" && oData.WbHeaderNav.results[0].Dname !== undefined) {
						oThat.oView.byId("id_InDriver").setValueState('None');
					}
					if (oData.WbHeaderNav.results[0].DriverMob !== "" && oData.WbHeaderNav.results[0].DriverMob !== undefined) {
						oThat.oView.byId("id_InDriverMob").setValueState('None');
					}
					if (oData.WbHeaderNav.results[0].Vehtyp !== "" && oData.WbHeaderNav.results[0].Vehtyp !== undefined) {
						oThat.oView.byId("id_VehicleTy").setValueState('None');
					}
				}

			} else if (oThat.Service == "VEHICLEVALIDATE") {
				if (oData.GetReturnNav.results.length != 0) {
					var aError = [];
					aError = oData.GetReturnNav.results.filter(function (oItem) {
						if (oItem.Type == "E") {
							return oItem.Message;
						}
					});
					var msg = "";
					for (var i = 0; i < oData.GetReturnNav.results.length; i++) {
						msg = msg + "\n" + oData.GetReturnNav.results[i].Message;
					}
					if (aError.length != 0) {
						MessageBox.error(msg);
						oThat.oView.getModel("POST").getData().Vehno = "";
					}

					oThat.oView.getModel("POST").getData().Vehtyp = oData.WbHeaderNav.results[0].Vehtyp;
					oThat.oView.getModel("POST").getData().Dname = oData.WbHeaderNav.results[0].Dname;
					oThat.oView.getModel("POST").getData().DriverMob = oData.WbHeaderNav.results[0].DriverMob;
					oThat.oView.getModel("POST").refresh(true);
					if (oData.WbHeaderNav.results[0].Dname !== "" && oData.WbHeaderNav.results[0].Dname !== undefined) {
						oThat.oView.byId("id_InDriver").setValueState('None');
					}
					if (oData.WbHeaderNav.results[0].DriverMob !== "" && oData.WbHeaderNav.results[0].DriverMob !== undefined) {
						oThat.oView.byId("id_InDriverMob").setValueState('None');
					}
					if (oData.WbHeaderNav.results[0].Vehtyp !== "" && oData.WbHeaderNav.results[0].Vehtyp !== undefined) {
						oThat.oView.byId("id_VehicleTy").setValueState('None');
					}
					if (aError.length == 0) {
						oThat.onPressSave();
					}
				} else {
					oThat.oView.getModel("POST").getData().Vehtyp = oData.WbHeaderNav.results[0].Vehtyp;
					oThat.oView.getModel("POST").getData().Dname = oData.WbHeaderNav.results[0].Dname;
					oThat.oView.getModel("POST").getData().DriverMob = oData.WbHeaderNav.results[0].DriverMob;
					//	oThat.oView.getModel("POST").getData().Gate = oThat.oView.byId("id_InGate").getValue();
					oThat.oView.getModel("POST").refresh(true);
					if (oData.WbHeaderNav.results[0].Dname !== "" && oData.WbHeaderNav.results[0].Dname !== undefined) {
						oThat.oView.byId("id_InDriver").setValueState('None');
					}
					if (oData.WbHeaderNav.results[0].DriverMob !== "" && oData.WbHeaderNav.results[0].DriverMob !== undefined) {
						oThat.oView.byId("id_InDriverMob").setValueState('None');
					}
					if (oData.WbHeaderNav.results[0].Vehtyp !== "" && oData.WbHeaderNav.results[0].Vehtyp !== undefined) {
						oThat.oView.byId("id_VehicleTy").setValueState('None');
					}
					oThat.onPressSave();
				}
			} else if (oThat.Service === 'F4Model') {
				oThat.getOwnerComponent().getModel("F4Model").setData(oData);
				oThat.getOwnerComponent().getModel("F4Model").refresh(true);
				//HB
				oThat.oView.getModel("POST").getData().EvSixtyBag = oData.results[0].EvSixtyBag;
				if (oThat.getOwnerComponent().getModel("F4Model").getData().results[0].F4PlantNav.results.length == 1) {
					oThat.oView.getModel("POST").getData().Werks = oData.results[0].F4PlantNav.results[0].Werks;
					oThat.oView.getModel("POST").getData().Name1 = oData.results[0].F4PlantNav.results[0].Name1;
					oThat.SelectedPlant = oData.results[0].F4PlantNav.results[0];
					oThat.gVPlant = oData.results[0].F4PlantNav.results[0].Werks;
					oThat.gvPlantname = oData.results[0].F4PlantNav.results[0].Name1;

					oThat.oView.getModel("POST").refresh();
					//============ to get param 7 details =============//
					var oEntity = {
						"d": {
							// "GateEntry": "X",
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
							"IvWerks": oThat.oView.getModel("POST").getData().Werks,
							"IvMatnr": "",
							"TruckReport": "X",
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
					oThat.oModel.create("/GetHeadersSet", oEntity, {
						success: function (oData, oResponse) {
							oThat.oView.setModel(new JSONModel(oData), "oDisplayModel");
							if (oData.EvWithoutwb === "X") {
								oThat.oView.byId("id_Param7").setVisible(true);
							} else {
								oThat.oView.byId("id_Param7").setVisible(false);
							}
							oThat.oView.byId("id_LblWbId").setVisible(false);
							oThat.oView.byId("id_InWbId").setVisible(false);
							oThat.oView.byId("id_LblWbItem").setVisible(false);
							oThat.oView.byId("id_InWbItem").setVisible(false);
							oThat.oView.byId("id_LblDoNo").setVisible(false);
							oThat.oView.byId("id_InDoNo").setVisible(false);
							oThat.oView.byId("id_POBtn").setVisible(true);
							// Trip process for senegal/cameron/Ghana grains ====//
							if (oThat.oView.getModel("POST").getData().Wtype === "04") {
								if (oData.EvOrigin === "A" || oData.EvOrigin === "B" || oData.EvOrigin === "D" || oData.EvOrigin === "F" || oData.EvOrigin ===
									"G" || oData.EvOrigin === "I") { //F Origin for Ghana Rice - Added by Avinash on 14/7/21 //Added I Origin for CM Rice - 28/4/22
									oThat.oView.byId("id_LblWbId").setVisible(true);
									oThat.oView.byId("id_InWbId").setVisible(true);
									oThat.oView.byId("id_LblWbItem").setVisible(true);
									oThat.oView.byId("id_InWbItem").setVisible(true);
									oThat.oView.byId("id_POBtn").setVisible(false);
								} else if (oData.EvOrigin === "C") {
									oThat.oView.byId("id_LblDoNo").setVisible(true);
									oThat.oView.byId("id_InDoNo").setVisible(true);
								}
								// else if (oData.EvOrigin === "K") {
								// 	oThat.oView.byId("id_LblDoNo").setVisible(true);
								// 	oThat.oView.byId("id_InDoNo").setVisible(true);
								// }
							}
							if (plantFlag === "X") {
								oThat.Service = 'GATE';
								oThat.onCallService(oThat.Service);
							}
						},

						error: function (oResponse) {

						}
					});

				}
			} else if (oThat.Service === 'Transport') {
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

			} else if (oThat.Service === 'REPRINT') {
				oThat.oView.setModel(new JSONModel(oData), "oStatusModel");
				oThat.oView.getModel("oStatusModel").refresh(true);
				// if(oData.StatusUpdateNav != null){
				if (oData.StatusUpdateNav.results.length != 0) {
					oThat.VehicleNo = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.VehicleNo", oThat);
					oThat.oView.addDependent(oThat.VehicleNo);
					oThat.VehicleNo.open();
				} else {
					MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMSg16"));
				}
				// }
			}


			// Added by Srinivas on 29/06/2025
			else if (oThat.Service === 'TruckTypeCombo') {
				var oJsonModel = new JSONModel();
				var oDataTyResults = oData.results[0].F4TruckTypeSetNav.results;
				if (oDataTyResults.length > 0) {
					oJsonModel.setData(oDataTyResults);
					oThat.oView.setModel(oJsonModel, "TruckTypeComboModel");
					//oThat.oView.getModel("TruckTypeComboModel").refresh(true);
					oThat.oView.byId("id_VehicleTy").setVisible(false);
					oThat.oView.byId("id_VehicleTyCombo").setVisible(true);
				} else {
					oThat.oView.byId("id_VehicleTy").setVisible(true);
					oThat.oView.byId("id_VehicleTyCombo").setVisible(false);
				}

			}
			//  End of Added by Srinivas on 29/06/2025



			//============================= changes for orbit ==========================//		
			else if (oThat.Service === "VALIDWBID") {
				if (oData.GetReturnNav.results.length != 0) {
					var aError = oData.GetReturnNav.results.filter(function (obj) {
						return obj.Type === "E";
					});
					var msg = "";
					for (var i = 0; i < oData.GetReturnNav.results.length; i++) {
						msg = msg + "\n" + oData.GetReturnNav.results[i].Message;
					}
					if (aError.length != 0) {
						oThat.oView.getModel("POST").getData().Wbid = "";
						oThat.oView.getModel("POST").getData().Token = "";
						oThat.oView.getModel("POST").refresh();
						MessageBox.error(msg);
					}
				} else {
					oThat.oView.getModel("POST").setData(oData.WbHeaderNav.results[0]);
					oThat.oView.getModel("POST").getData().Token = oData.IvWbid;
					oThat.oView.getModel("POST").getData().Wtype = "05";
					oThat.oView.setModel(new JSONModel(oData), "ReferenceWbModel");
					if (oData.WbHeaderNav.results[0].Gate != "") {
						oThat.vWb = "WB";
						oThat.oView.getModel("POST").getData().Gate = oData.WbHeaderNav.results[0].Gate;
					} else {
						oThat.vWb = "WS";
						oThat.oView.getModel("POST").getData().Gate = oData.WbHeaderNav.results[0].Wsgate;
					}
					if (oData.WsItemNav.results.length != 0) {
						oThat.oView.getModel("POLIST").setData(oData.WsItemNav.results);
						oThat.oView.getModel("POLIST").refresh();
					} else if (oData.WbItemNav.results.length != 0) {
						oThat.oView.getModel("POLIST").setData(oData.WbItemNav.results);
						oThat.oView.getModel("POLIST").refresh();
					}

					var vPo = oThat.oView.getModel("F4Model").getData().results[0].F4ProcessNav.results.find(function (obj) {
						return obj.SeqNo == oThat.oView.getModel("POST").getData().Wtype;
					});
					if (vPo) {
						if (vPo.Po == 'X') {
							oThat.oView.byId("id_POBtn").setText(oThat.oView.getModel("i18n").getResourceBundle().getText("Text3"));
							oThat.oView.byId("id_VendorBox").setVisible(false);
							oThat.oView.byId("id_InManual").setMaxLength(11);
							oThat.oView.byId("id_InManual").setShowValueHelp(false);
							oThat.oView.byId("id_InManual").setValue("");
						} else if (vPo.Po == 'M') {
							oThat.oView.byId("id_POBtn").setText(oThat.oView.getModel("i18n").getResourceBundle().getText("Text21"));
							oThat.oView.byId("id_VendorBox").setVisible(true);
							oThat.oView.byId("id_InManual").setMaxLength(18);
							oThat.oView.byId("id_InManual").setShowValueHelp(true);
							oThat.oView.byId("id_InManual").setValue("");
						} else {
							oThat.oView.byId("id_POBtn").setText(oThat.oView.getModel("i18n").getResourceBundle().getText("Text4"));
							oThat.oView.byId("id_VendorBox").setVisible(false);
							oThat.oView.byId("id_InManual").setMaxLength(10);
							oThat.oView.byId("id_InManual").setShowValueHelp(false);
							oThat.oView.byId("id_InManual").setValue("");
						}
					}
					oThat.oView.getModel("POST").refresh();
				}
			} else if (oThat.Service === "VALIDDELIVERY") {
				if (oData.GetReturnNav.results.length != 0) {
					var aError = oData.GetReturnNav.results.filter(function (obj) {
						return obj.Type === "E";
					});
					var msg = "";
					for (var i = 0; i < oData.GetReturnNav.results.length; i++) {
						msg = msg + "\n" + oData.GetReturnNav.results[i].Message;
					}
					if (aError.length != 0) {
						oThat.oView.getModel("POST").getData().Challan = "";
						oThat.oView.getModel("POST").refresh();
						MessageBox.error(msg);
					} else {
						oThat.oView.getModel("POST").getData().Challan = oData.WbHeaderNav.results[0].Challan;
						oThat.oView.getModel("POST").getData().Vehno = oData.WbHeaderNav.results[0].Vehno;
						oThat.oView.getModel("POST").getData().Vehtyp = oData.WbHeaderNav.results[0].Vehtyp;
						oThat.oView.getModel("POST").getData().Dname = oData.WbHeaderNav.results[0].Dname;
						oThat.oView.getModel("POST").getData().Lifnr = oData.WbHeaderNav.results[0].Lifnr;
						oThat.oView.getModel("POST").getData().DriverMob = oData.WbHeaderNav.results[0].DriverMob;
						// oThat.oView.getModel("POST").getData().Wtype		= "05";
						oThat.oView.getModel("POST").refresh();
						oThat.oView.byId("id_InManual").setEnabled(false);
						oThat.oView.byId("id_ToolbarManual").setVisible(false);
						// oThat.oView.byId("id_Vendor").setEnabled(false);
						oThat.oView.setModel(new JSONModel(oData.DelItemNav), "oPoitemModel");
						oThat.oView.getModel("oPoitemModel").refresh();
						// if(!oThat.oPoItemFrag){
						oThat.oPoItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.DelItemList", oThat);
						oThat.oView.addDependent(oThat.oPoItemFrag);
						// }

						oThat.oPoItemFrag.setEscapeHandler(oThat.onEscapeHandler);
						oThat.oPoItemFrag.open();
					}
				} else {
					oThat.oView.getModel("POST").getData().Challan = oData.WbHeaderNav.results[0].Challan;
					oThat.oView.getModel("POST").getData().Vehno = oData.WbHeaderNav.results[0].Vehno;
					oThat.oView.getModel("POST").getData().Vehtyp = oData.WbHeaderNav.results[0].Vehtyp;
					oThat.oView.getModel("POST").getData().Dname = oData.WbHeaderNav.results[0].Dname;
					oThat.oView.getModel("POST").getData().Lifnr = oData.WbHeaderNav.results[0].Lifnr;
					oThat.oView.getModel("POST").getData().LifnrDesc = oData.WbHeaderNav.results[0].LifnrName;
					oThat.oView.getModel("POST").getData().DriverMob = oData.WbHeaderNav.results[0].DriverMob;
					oThat.oView.getModel("POST").refresh();
					oThat.oView.byId("id_InManual").setEnabled(false);
					oThat.oView.byId("id_ToolbarManual").setVisible(false);
					oThat.oView.setModel(new JSONModel(oData.DelItemNav), "oPoitemModel");
					oThat.oView.getModel("oPoitemModel").refresh();
					oThat.oPoItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.DelItemList", oThat);
					oThat.oView.addDependent(oThat.oPoItemFrag);
					oThat.oPoItemFrag.setEscapeHandler(oThat.onEscapeHandler);
					oThat.oPoItemFrag.open();

				}
			}
		},
		onEscapeHandler: function (oEvent) {
			oThat.oPoItemFrag.destroy();
		},

		onScanPost: function () {
			if (this.ahead[0] === "IN - Purchase") {

				oThat.getView().getModel("POST").getData().Wtype = "01";
				oThat.onNotaFiscalChangeQR();
				oThat.onClosePoIteList();
			} else {
				oThat.getView().getModel("POST").getData().Wtype = "05";
				oThat.onNotaFiscalChangeQR();
				oThat.onClosePoIteList();
				//	}
			}
		},

		//===================================== changes end for orbit =====================================//
		myErrorHandler: function (oResponse) {
			oThat.BusyDialog.close();
			var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("Title21");
			MessageBox.show(oResponse.responseText, MessageBox.Icon.ERROR, vError);
		},
		//====================================================================================//
		//====================== onValue Help ===============================================//
		//==================================================================================//
		onValueHelpPress: function (oEvent) {
			oThat.vId = oEvent.getSource().getId();
			oEvent.getSource().setValueState('None');
			if (oThat.vId.indexOf("id_InPlant") != -1) {
				oThat.ValueHelp = sap.ui.xmlfragment(oThat.vId, "ZGT_MM_INBOUND.Fragments.Plant", oThat);
				oThat.oView.addDependent(oThat.ValueHelp);
				oThat.ValueHelp.open();
			} else if (oThat.vId.indexOf("id_InGate") != -1) {
				if (oThat.oView.getModel("POST").getData().Werks != "") {
					oThat.ValueHelp = sap.ui.xmlfragment(oThat.vId, "ZGT_MM_INBOUND.Fragments.Gate", oThat);
					oThat.oView.addDependent(oThat.ValueHelp);
					oThat.ValueHelp.open();
					oThat.Service = 'GATE';
					var filter = [
						new Filter("Werks", sap.ui.model.FilterOperator.EQ, oThat.oView.getModel("POST").getData().Werks)
					];
					oThat.onCallService(oThat.Service, filter);
				} else {
					MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("Plant_Mandatory"));
				}

			} else if (oThat.vId.indexOf("id_InTransport") != -1) {
				oThat.ValueHelp = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Transporter", oThat);
				oThat.oView.addDependent(oThat.ValueHelp);
				oThat.ValueHelp.open();
				oThat.Service = 'Vendor';
				var filter = [
					new Filter("Werks", sap.ui.model.FilterOperator.EQ, oThat.oView.getModel("POST").getData().Werks)
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
					new Filter("Werks", sap.ui.model.FilterOperator.EQ, oThat.oView.getModel("POST").getData().Werks)
				];
				// oThat.createList();
				oThat.onCallService(oThat.Service, filter);
			} else if (oThat.vId.indexOf("id_InManual") != -1) {
				var vWtype = "";
				var vProcess = oThat.oView.getModel("F4Model").getData().results[0].F4ProcessNav.results.filter(function (obj) {
					return obj.SeqNo == oThat.oView.getModel("POST").getData().Wtype;
				});
				if (vProcess.length != 0) {
					vWtype = vProcess[0].Process;
				}
				oThat.ValueHelp = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.MaterialF4", oThat);
				oThat.oView.addDependent(oThat.ValueHelp);
				oThat.ValueHelp.setMultiSelect(false);
				oThat.ValueHelp.open();
				oThat.Service = 'MaterialF4';
				var filter = [
					new Filter("Werks", sap.ui.model.FilterOperator.EQ, oThat.oView.getModel("POST").getData().Werks)
				];
				oThat.onCallService(oThat.Service, filter);
			}
			// else if (oThat.vId.indexOf("id_InManualCFM") != -1 && oThat.oView.getModel("oDisplayModel").getData().EvOrigin === "H") { //Added only for CFM Transfers - Origin H
			// 	var vListData = oThat.oView.getModel("POLIST").getData();
			// 	if (vListData.length > 0) {
			// 		if (vListData[0].Pmblnr !== "" || vListData[0].Remarks !== "") {
			// 			var vWarnMsg = oThat.oView.getModel("i18n").getResourceBundle().getText("ListExitsed");
			// 			sap.m.MessageBox.show(vWarnMsg, {
			// 				icon: sap.m.MessageBox.Icon.WARNING,
			// 				title: oThat.oView.getModel("i18n").getResourceBundle().getText("Warning"),
			// 				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
			// 				// style: ["cl_BoxDialogHead"],
			// 				onClose: function(oAction) {
			// 					if (oAction == sap.m.MessageBox.Action.YES) {
			// 						oThat.ValueHelp = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.MaterialF4", oThat);
			// 						oThat.oView.addDependent(oThat.ValueHelp);
			// 						oThat.ValueHelp.setMultiSelect(true);
			// 						oThat.ValueHelp.open();
			// 						oThat.Service = 'MaterialF4';
			// 						var filter = [
			// 							new Filter("Werks", sap.ui.model.FilterOperator.EQ, oThat.oView.getModel("POST").getData().Werks)
			// 						];
			// 						oThat.onCallService(oThat.Service, filter);
			// 						oThat.oView.getModel("POLIST").setData([]);
			// 						oThat.oView.byId("id_InManualCFM").setTokens([]);
			// 						oThat.oView.byId("id_InManualCFM").setValue("");
			// 						// oThat.oView.byId("id_InManual").setValue("");
			// 						// oThat.oView.byId("id_InMatDoc").setTokens([]);
			// 					} else {
			// 						sap.m.MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ActCanc"));
			// 					}
			// 				}
			// 			});
			// 		} else {
			// 			oThat.ValueHelp = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.MaterialF4", oThat);
			// 			oThat.oView.addDependent(oThat.ValueHelp);
			// 			oThat.ValueHelp.setMultiSelect(true);
			// 			oThat.ValueHelp.open();
			// 			oThat.Service = 'MaterialF4';
			// 			var filter = [
			// 				new Filter("Werks", sap.ui.model.FilterOperator.EQ, oThat.oView.getModel("POST").getData().Werks)
			// 			];
			// 			oThat.onCallService(oThat.Service, filter);
			// 		}
			// 	} else {

			// 		oThat.ValueHelp = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.MaterialF4", oThat);
			// 		oThat.oView.addDependent(oThat.ValueHelp);
			// 		oThat.ValueHelp.setMultiSelect(true);
			// 		oThat.ValueHelp.open();
			// 		oThat.Service = 'MaterialF4';
			// 		var filter = [
			// 			new Filter("Werks", sap.ui.model.FilterOperator.EQ, oThat.oView.getModel("POST").getData().Werks)
			// 		];
			// 		oThat.onCallService(oThat.Service, filter);
			// 	}
			// }
		},

		//Added by Avinash -- CFM Material F4 Help
		fnCfmMatHelp: function () {
			//Added only for CFM Transfers - Origin H
			var vErr = false;
			if (!oThat.getView().byId("id_Param7").getVisible()) {
				if (oThat.getView().byId("id_Rbref").getVisible()) {
					if (oThat.getView().byId("id_Rbref").getSelectedIndex() == -1) {
						vErr = true;
					}
				}
			}
			if (!vErr) {
				var vListData = oThat.oView.getModel("POLIST").getData();
				if (vListData.length > 0) {
					if (vListData[0].Pmblnr !== "" || vListData[0].Remarks !== "") {
						var vWarnMsg = oThat.oView.getModel("i18n").getResourceBundle().getText("ListExitsed");
						sap.m.MessageBox.show(vWarnMsg, {
							icon: sap.m.MessageBox.Icon.WARNING,
							title: oThat.oView.getModel("i18n").getResourceBundle().getText("Warning"),
							actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
							// style: ["cl_BoxDialogHead"],
							onClose: function (oAction) {
								if (oAction == sap.m.MessageBox.Action.YES) {
									oThat.ValueHelp = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.MaterialF4CFM", oThat);
									oThat.oView.addDependent(oThat.ValueHelp);
									oThat.ValueHelp.setMultiSelect(true);
									oThat.ValueHelp.open();
									oThat.Service = 'MaterialF4';
									var filter = [
										new Filter("Werks", sap.ui.model.FilterOperator.EQ, oThat.oView.getModel("POST").getData().Werks)
									];
									oThat.onCallService(oThat.Service, filter);
									oThat.oView.getModel("POLIST").setData([]);
									oThat.oView.byId("id_InManualCFM").setTokens([]);
									oThat.oView.byId("id_InManualCFM").setValue("");
									// oThat.oView.byId("id_InManual").setValue("");
									// oThat.oView.byId("id_InMatDoc").setTokens([]);
								} else {
									sap.m.MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ActCanc"));
								}
							}
						});
					} else {
						oThat.ValueHelp = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.MaterialF4CFM", oThat);
						oThat.oView.addDependent(oThat.ValueHelp);
						oThat.ValueHelp.setMultiSelect(true);
						oThat.ValueHelp.open();
						oThat.Service = 'MaterialF4';
						var filter = [
							new Filter("Werks", sap.ui.model.FilterOperator.EQ, oThat.oView.getModel("POST").getData().Werks)
						];
						oThat.onCallService(oThat.Service, filter);
					}
				} else {

					oThat.ValueHelp = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.MaterialF4CFM", oThat);
					oThat.oView.addDependent(oThat.ValueHelp);
					oThat.ValueHelp.setMultiSelect(true);
					oThat.ValueHelp.open();
					oThat.Service = 'MaterialF4';
					var filter = [
						new Filter("Werks", sap.ui.model.FilterOperator.EQ, oThat.oView.getModel("POST").getData().Werks)
					];
					oThat.onCallService(oThat.Service, filter);
				}
			} else {
				sap.m.MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("PlsSelectRefType"));
			}

		},

		//BOI by Avinash -- only for CFM Transfers - Origin H
		onValueHelpConfirmCFM: function (oEvent) {
			var oSelectedItem = oEvent.getParameter('selectedItem');
			var oMultiInput1 = this.getView().byId("id_InManualCFM");
			var aTokens = oMultiInput1.getTokens();
			var Item = oEvent.getParameter("selectedItems");
			var vLength = Item.length;
			var oItems = [];
			var vItem = 1;
			for (var i = 0; i < vLength; i++) {
				var vTokenv = new sap.m.Token({
					text: Item[i].getTitle(),
					key: Item[i].getTitle()
				});
				aTokens.push(vTokenv);
			}
			var aDups = [];
			var aSelectedMatnr = [];
			aSelectedMatnr = aTokens.filter(function (el) {
				if (aDups.indexOf(el.getKey()) === -1) {
					aDups.push(el.getKey())
					return true;
				}
				return false;
			});
			oMultiInput1.removeAllTokens();
			oMultiInput1.setTokens(aSelectedMatnr);
			//End of Added

		},
		//EOI by Avinash

		onValueHelpConfirm: function (oEvent) {
			var oSelectedItem = oEvent.getParameter('selectedItem');
			if (oThat.vId.indexOf("id_InPlant") != -1) {
				oThat.oView.getModel("POST").getData().Werks = oSelectedItem.getDescription();
				oThat.oView.getModel("POST").getData().Name1 = oSelectedItem.getTitle();
				oThat.oView.getModel("POST").refresh(true);
			} else if (oThat.vId.indexOf("id_InGate") != -1) {
				oThat.oView.getModel("POST").getData().Gate = oSelectedItem.getTitle();
				oThat.oView.getModel("POST").getData().Wbname = oSelectedItem.getNumber(); // changed by dharma on 15-10-2020 -oSelectedItem.getNumberUnit()
				oThat.vWb = oSelectedItem.getNumberUnit(); // changed by dharma on 15-10-2020 - oSelectedItem.getNumber(); 
			} else if (oThat.vId.indexOf("id_InTransport") != -1) {
				oThat.oView.getModel("POST").getData().Lifnr = oSelectedItem.getDescription();
				oThat.oView.getModel("POST").getData().LifnrDesc = oSelectedItem.getTitle();
			} else if (oThat.vId.indexOf("id_Vendor") != -1) {
				oThat.oView.byId("id_Vendor").setValue(oSelectedItem.getDescription());
				oThat.oView.getModel("POST").getData().VendorName = oSelectedItem.getTitle();
				if (oThat.oView.getModel("POLIST")) {
					if (oThat.oView.byId("id_POBtn").getText() !== oThat.oView.getModel("i18n").getResourceBundle().getText("Text4")) {
						if (oThat.oView.getModel("POLIST").getData().length > 0) {
							oThat.oView.getModel("POLIST").getData().forEach(function (obj) {
								obj.Parnr = oSelectedItem.getDescription();
							});
							oThat.VendorCFM = oSelectedItem.getDescription();
						} else { //Logic Added by Avinash
							oThat.VendorCFM = oSelectedItem.getDescription();
						}
					}
				}
			} else if (oThat.vId.indexOf("id_InManual") != -1) {
				oThat.oView.byId("id_InManual").setValue(oSelectedItem.getTitle());
				oThat.oView.getModel("POST").getData().MatnrDesc = oSelectedItem.getDescription();
				// this.getView().byId("id_MatDocLabel").setVisible(false);
				// this.getView().byId("id_MaDoc").setVisible(false);
			} else if (oThat.vId.indexOf("id_InManualCFM") != -1 && oThat.oView.getModel("oDisplayModel").getData().EvOrigin === "H") { //Added by Avinash -- only for CFM Transfers - Origin H
				var oMultiInput1 = this.getView().byId("id_InManualCFM");
				var aTokens = oMultiInput1.getTokens();
				var Item = oEvent.getParameter("selectedItems");
				var vLength = Item.length;
				var oItems = [];
				var vItem = 1;
				for (var i = 0; i < vLength; i++) {
					var vTokenv = new sap.m.Token({
						text: Item[i].getTitle(),
						key: Item[i].getTitle()
					});
					aTokens.push(vTokenv);
				}
				var aDups = [];
				var aSelectedMatnr = [];
				aSelectedMatnr = aTokens.filter(function (el) {
					if (aDups.indexOf(el.getKey()) === -1) {
						aDups.push(el.getKey())
						return true;
					}
					return false;
				});
				oMultiInput1.removeAllTokens();
				oMultiInput1.setTokens(aSelectedMatnr);
				//End of Added
			} else if (oThat.vId.indexOf("id_InVehicleNo") != -1) {
				var oSelectedItem = oEvent.getParameter('selectedItem');
				sap.ui.getCore().byId("id_InVehicleNo").setValue(oSelectedItem.getTitle());
				sap.ui.getCore().byId("id_InWbid").setValue(oSelectedItem.getDescription());
			}
			oThat.oView.getModel("POST").refresh(true);
			oThat.ValueHelp.destroy();
		},

		onValueHelpSearch: function (oEvent) {
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
					new Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue),
					new Filter("Name1", sap.ui.model.FilterOperator.Contains, sValue)
				]);
			} else if (oThat.vId.indexOf("id_Vendor") != -1) {
				oFilter = new sap.ui.model.Filter([
					new Filter("Lifnr", sap.ui.model.FilterOperator.Contains, sValue),
					new Filter("Name1", sap.ui.model.FilterOperator.Contains, sValue),
					new Filter("Stcd3", sap.ui.model.FilterOperator.Contains, sValue)
				]);
			} else if (oThat.vId.indexOf("id_InManual") != -1) {
				oFilter = new sap.ui.model.Filter([
					new Filter("Matnr", sap.ui.model.FilterOperator.Contains, sValue),
					new Filter("Maktx", sap.ui.model.FilterOperator.Contains, sValue)
				]);
			} else if (oThat.vId.indexOf("id_InVehicleNo") != -1) {
				oFilter = new sap.ui.model.Filter([
					new Filter("Vehno", sap.ui.model.FilterOperator.Contains, sValue),
					new Filter("Wbid", sap.ui.model.FilterOperator.Contains, sValue)
				]);
			}
			var oFilter2 = new sap.ui.model.Filter(oFilter, false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter2]);
		},

		//Added by Avinash for CFM Changes - 02/06/22
		onValueHelpSearchMat: function (oEvent) {
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
		//End of Added

		onValueHelpCancel: function () {
			oThat.ValueHelp.destroy();
		},
		onValueHelpConfirmPlant: function (oEvent) {
			var oSelectedItem = oEvent.getParameter('selectedItem');
			oThat.oView.getModel("POST").getData().Werks = oSelectedItem.getDescription();
			oThat.oView.getModel("POST").getData().Name1 = oSelectedItem.getTitle().trim(); //Added by Avinash
			oThat.SelectedPlant = oEvent.getParameter('selectedItem').getBindingContext("F4Model").getObject();
			//oThat.onChangeProcess();
			oThat.gVPlant = oSelectedItem.getDescription();
			oThat.gvPlantname = oSelectedItem.getTitle();
			// Added for Inbound 
			// if (oThat.gVPlant) {
			// 	oThat.getView().byId("id_barcodescan").setVisible(true);
			// 	oThat.getView().byId("id_lablescan").setVisible(true);
			// }

			// oThat.getView().byId("id_InPlant").setValue(oThat.gVPlant + " - " + oThat.gvPlantname);
		        	oThat.oView.getModel("POST").refresh(true);
				//added by srinivas on 02/10/2025 for truck reporting
					oThat.TruckReporting = oThat.SelectedPlant.TruckReport;
					if (oThat.TruckReporting === "X") {
					 oThat.oView.byId("id_TruckSave").setEnabled(true);
					}
					else{
						//oThat.oView.getModel("POLIST").setData([]);
						var oPoListModel = oThat.oView.getModel("POLIST");
						if (oPoListModel) {
							oPoListModel.setData([]); 
						}
						oThat.oView.byId("id_TruckSave").setEnabled(false);
						oThat.BusyDialog.close();
						MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("TruckError"));
						return;
					}
					//ended by srinivas on 02/10/2025 for truck reporting

			oThat.Service = 'GATE';
			var filter = [
				new Filter("Werks", sap.ui.model.FilterOperator.EQ, oSelectedItem.getDescription())
			];
			oThat.onCallService(oThat.Service, filter);

			//Added by Srinivas to add trucktype dropdown  for Spot purchase only based on Plant and Param E for DSE on 01/07/2025
			var oSelPlantModelResults = oThat.getOwnerComponent().getModel("F4Model").getData().results[0].F4PlantNav.results.filter(item => item.Werks === oSelectedItem.getDescription());
			var oSelectedPlantParam = oSelPlantModelResults[0].Param;
			if (oThat.oView.getModel("POST").getData().Wtype == "05" && oSelectedPlantParam == "E") {
				oThat.oView.byId("id_VehicleTy").setValue("");
				oThat.oView.byId("id_VehicleTyCombo").setValue("");
				oThat.oView.getModel("POST").getData().Vehtyp = "";
				oThat.Service = "TruckTypeCombo";
				var oTruckFilter = [
					new Filter("TruckTypeGQ", sap.ui.model.FilterOperator.EQ, "X"),
					new Filter("IvWerks", sap.ui.model.FilterOperator.EQ, oSelectedItem.getDescription())
				];
				oThat.onCallService(oThat.Service, oTruckFilter);
				//oThat.oView.byId("id_VehicleTy").setVisible(false);
				//oThat.oView.byId("id_VehicleTyCombo").setVisible(true);
			} else {
				oThat.oView.byId("id_VehicleTy").setValue("");
				oThat.oView.byId("id_VehicleTyCombo").setValue("");
				oThat.oView.getModel("POST").getData().Vehtyp = "";
				oThat.oView.byId("id_VehicleTy").setVisible(true);
				oThat.oView.byId("id_VehicleTyCombo").setVisible(false);
			}
			// End  Added by Srinivas to add trucktype dropdown  for Spot purchase only based on Plant 01/07/2025

			//============ to get param 7 details =============//
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
					"IvWerks": oSelectedItem.getDescription(),
					"IvMatnr": "",
					"TruckReport": "X",
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
			oThat.oModel.create("/GetHeadersSet", oEntity, {
				success: function (oData, oResponse) {
					oThat.oView.setModel(new JSONModel(oData), "oDisplayModel");
					if (oData.EvWithoutwb === "X") {
						oThat.oView.byId("id_Param7").setVisible(true);
					} else {
						oThat.oView.byId("id_Param7").setVisible(false);

						//Begin of changes by Avinash for CFM Transfer Scenario
						var vWtype = "";
						var vProcess = oThat.oView.getModel("F4Model").getData().results[0].F4ProcessNav.results.filter(function (obj) {
							return obj.SeqNo == oThat.oView.getModel("POST").getData().Wtype;
						});
						if (vProcess.length != 0) {
							vWtype = vProcess[0].Process;
						}
						if (oData.EvOrigin === "H" && vWtype == "TRANSFER") {
							oThat.getView().byId("id_RefTb").setVisible(true);
							oThat.getView().byId("id_Rbref").setVisible(true);
						} else {
							oThat.getView().byId("id_RefTb").setVisible(false);
							oThat.getView().byId("id_Rbref").setVisible(false);
						}
						//End of Changes
					}
					//added by Nagaraj 18/7/24 start
					oThat.oView.byId("id_VehiNo").setEditable(true);
					oThat.oView.byId("id_VehiNo").setValue("");
					oThat.oView.byId("id_VehicleTy").setEditable(true);
					oThat.oView.byId("id_VehicleTy").setValue("");
					oThat.getView().byId("id_Param7Key").setState(true);
					oThat.getView().byId("id_Param7Key").setEnabled(true);
					if (oThat.SelectedPlant.Param === "H" && oThat.oView.getModel("POST").getData().Wtype === "08") {
						oThat.oView.byId("id_VehiNo").setEditable(false);
						oThat.oView.byId("id_VehiNo").setValue("");
						oThat.oView.byId("id_VehicleTy").setEditable(false);
						oThat.oView.byId("id_VehicleTy").setValue(oThat.oView.getModel("i18n").getResourceBundle().getText("recbyHand"));
						oThat.getView().byId("id_Param7Key").setState(!true);
						oThat.getView().byId("id_Param7Key").setEnabled(!true);
					} else if (oThat.oView.getModel("POST").getData().Wtype === "08") {
						oThat.getView().byId("id_ComboProcess").setSelectedKey();
						sap.m.MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("processvalid"));
					}
					//added by Nagaraj 18/7/24 END

					/*Code RGP/NRGP req added by Nagaraj Start 05/11/2024*/
					oThat.oView.byId("id_InRefNo").setVisible(false);
					oThat.oView.byId("id_InRefNoValue").setValue("");
					oThat.oView.byId("id_Vendor").setEditable(true);
					if (oThat.oView.getModel("POST").getData().Wtype === "09" || oThat.oView.getModel("POST").getData().Wtype === "10") {
						oThat.getView().byId("id_barcodescan").setEnabled(!true);
						oThat.oView.byId("id_scanid").setEnabled(!true);
						oThat.getView().byId("id_Param7Key").setState(!true);
						oThat.getView().byId("id_Param7Key").setEnabled(!true);
						oThat.oView.byId("id_VehicleTy").setValue("");
						oThat.oView.byId("id_Vendor").setEditable(false);

						if (oThat.SelectedPlant.Param === "H") {
							oThat.oView.byId("id_InRefNo").setVisible(true);
							oThat.oView.byId("id_InRefNoValue").setValue("");
							oThat.oView.byId("id_VehicleTy").setEditable(false);
							oThat.oView.byId("id_VehicleTy").setValue(oThat.getView().byId("id_ComboProcess").getValue());
						}
					}
					/*Code added by Nagaraj END*/

					oThat.oView.byId("id_LblWbId").setVisible(false);
					oThat.oView.byId("id_InWbId").setVisible(false);
					oThat.oView.byId("id_LblWbItem").setVisible(false);
					oThat.oView.byId("id_InWbItem").setVisible(false);
					oThat.oView.byId("id_LblDoNo").setVisible(false);
					oThat.oView.byId("id_InDoNo").setVisible(false);
					oThat.oView.byId("id_POBtn").setVisible(true);
					//	oThat.oView.byId("id_VendorBox").setVisible(true);
					// Trip process for senegal/cameron/Ghana grains ====//
					if (oThat.oView.getModel("POST").getData().Wtype === "04") {
						if (oData.EvOrigin === "A" || oData.EvOrigin === "B" || oData.EvOrigin === "D" || oData.EvOrigin === "F" || oData.EvOrigin ===
							"G" || oData.EvOrigin === "I") {
							oThat.oView.byId("id_LblWbId").setVisible(true);
							oThat.oView.byId("id_InWbId").setVisible(true);
							oThat.oView.byId("id_LblWbItem").setVisible(true);
							oThat.oView.byId("id_InWbItem").setVisible(true);
							oThat.oView.byId("id_POBtn").setVisible(false);
						} else if (oData.EvOrigin === "C") {
							oThat.oView.byId("id_LblDoNo").setVisible(true);
							oThat.oView.byId("id_InDoNo").setVisible(true);

						} else if (oData.EvOrigin === "H" || oData.EvOrigin === "L" || oData.EvOrigin === "J") {
							oThat.oView.byId("id_LblWbId").setVisible(true);
							oThat.oView.byId("id_InWbId").setVisible(true);
							oThat.oView.byId("id_LblWbItem").setVisible(true);
							oThat.oView.byId("id_InWbItem").setVisible(true);
						}
					}

					// oThat.SelectedPlant.ImgFlag = 'X'; // hardcode for testing

					if (oThat.SelectedPlant.OcrFlag === 'X' && oThat.SelectedPlant.Werks === '6236') {
						oThat.getView().byId("id_VehiNo").setEditable(false);
						oThat.getView().byId("vehNoCaptureID").setVisible(true);
					} else {
						oThat.getView().byId("id_VehiNo").setEditable(true);
						oThat.getView().byId("vehNoCaptureID").setVisible(false);
					}

					// added bu srinivas on 19/09/2025 to show reference field rgp/nrgp in and out
					if (oThat.oView.getModel("POST").getData().Wtype === "09" || oThat.oView.getModel("POST").getData().Wtype === "10" ){
						oThat.oView.byId("id_InRefNo").setVisible(true);
							oThat.oView.byId("id_InRefNoValue").setValue("");
							//oThat.oView.byId("id_scanid").setEnabled(true);
					}
					// end


				},

				error: function (oResponse) {

				}
			});
		},
		onLiveChange: function (oEvent) {
			oThat.vId = oEvent.getSource().getId();
			oEvent.getSource().setValueState('None');
		},
		onChangeVehicle: function (oEvent) {
			var letters = /^[0-9a-zA-Z]+$/;
			if (oEvent.getSource().getValue().match(letters)) {} else {
				oEvent.getParameter("value").replace(oEvent.getParameter("value"), '');
			}
			oEvent.getSource().setValueState('None');
			//added by dharma
			var vVehicle = oThat.getView().byId("id_VehiNo").getValue();
			if (vVehicle.length > 15) {
				//oThat.getView().byId("id_VehiNo").setValue();
				oThat.getView().byId("id_VehiNo").setValueStateText("Maximum 15 Charecters only");
				oThat.getView().byId("id_VehiNo").setValueState("Error");
			}
		},
		onSubmitVenodr: function (oEvent) {
			var vVendor = oEvent.getSource().getValue();
			var vFlag = false;
			if (oThat.oView.getModel("Vendor")) {
				var aResultts = oThat.oView.getModel("Vendor").getData().results;
				for (var i = 0; i < aResultts.length; i++) {
					var vValue = aResultts[i].Lifnr;
					vValue = +vValue;
					vVendor = +vVendor;
					if (vVendor == vValue) {
						vFlag = true;
						oThat.oView.getModel("POST").getData().VendorName = aResultts[i].Name1;
						break;
					}
				}
			}
			if (vFlag == false) {
				oThat.oView.getModel("POST").getData().VendorName = "";
			}
			oThat.oView.getModel("POST").refresh();
		},
		onVendorLiveChange: function (oEvent) {
			var vVendor = oEvent.getSource().getValue();
			var vFlag = false;
			if (oThat.oView.getModel("Vendor")) {
				var aResultts = oThat.oView.getModel("Vendor").getData().results;
				for (var i = 0; i < aResultts.length; i++) {
					var vValue = aResultts[i].Lifnr;
					vValue = +vValue;
					vVendor = +vVendor;
					if (vVendor == vValue) {
						vFlag = true;
						oThat.oView.getModel("POST").getData().VendorName = aResultts[i].Name1;
						break;
					}
				}
			}

			if (vFlag == false) {
				oThat.oView.getModel("POST").getData().VendorName = "";
			}
			oThat.oView.getModel("POST").refresh();
			if (oThat.oView.getModel("POLIST")) {
				if (oThat.oView.byId("id_POBtn").getText() !== oThat.oView.getModel("i18n").getResourceBundle().getText("Text4")) {
					oThat.oView.getModel("POLIST").getData().forEach(function (obj) {
						obj.Parnr = vVendor;
					});
				}
			}
		},

		spotPurchaseQR: function (oEvent) {
			for (var i = 0; i < this.aData.length; i++) {
				//	oThat.getView().getModel("POST").getData().Wtype = "05";id_VendorBox
				oThat.getView().byId("id_VendorBox").setVisible(true);
				oThat.getView().byId("id_Vendor").setValue(this.aData[i].VendorNumber);
				oThat.oView.byId("id_POBtn").setText("Material");
				oThat.onPressManualQROK(oEvent);
			}
		},
		//==================================================================================//
		//========================= Barcode Scan PO/Delivery/Material success ==================================//
		//=================================================================================//
		//Added by Avinash for Scanning Logic Changes -- Start
		onScanQRValue: function (oEvent) {
			this.ScanBtnPress = oEvent.getSource().getTooltip();
			var oThat = this;
			var oBundle = oThat.getView().getModel("i18n").getResourceBundle();
			var oVideoDeviceModel = new JSONModel();

			//Initialize the ZXing QR Code Scanner

			if (ZXing !== undefined && !sap.ui.Device.system.desktop) {
				this.loadZXingLibrary().then(() => {
					// if (!sap.ui.Device.system.desktop) { //Other than desktop
					codeReader = new ZXing.BrowserMultiFormatReader();
					codeReader.listVideoInputDevices().then((videoInputDevices) => {
						if (videoInputDevices.length > 1) {
							selectedDeviceId = videoInputDevices[1].deviceId; //Mobile Back Camera
						} else if (videoInputDevices.length === 1) {
							selectedDeviceId = videoInputDevices[0].deviceId; //Default Camera
						} else {
							sap.ndc.BarcodeScanner.scan( //Desktop Version
								function (mResult) {
									if (!mResult.cancelled) {
										oThat.onScanBarcode(mResult.text.trim());
									}
								},
								function (Error) {
									sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

								},
							);
						}
						if (videoInputDevices.length >= 1) {
							var aDevice = [];
							videoInputDevices.forEach((element) => {
								if (element.label.includes('0')) {
									selectedDeviceId = element.deviceId;
								}
								var sourceOption = {};
								sourceOption.text = element.label;
								sourceOption.value = element.deviceId;
								aDevice.push(sourceOption);
								oVideoDeviceModel.setData(aDevice);
								this.getView().setModel(oVideoDeviceModel, "oVideoDeviceModel");
								oComboBox = new sap.m.ComboBox({
									items: {
										path: "oVideoDeviceModel>/",
										template: new sap.ui.core.Item({
											key: "{oVideoDeviceModel>value}",
											text: "{oVideoDeviceModel>text}"
										})
									},
									selectedKey: selectedDeviceId,
									selectionChange: function (oEvt) {
										selectedDeviceId = oEvt.getSource().getSelectedKey();
										oThat._oScanQRDialog.close();
										codeReader.reset()

									}
								});

								sStartBtn = new sap.m.Button({
									text: oBundle.getText("Start"),
									type: oBundle.getText("Accept"),
									press: function () {
										oThat._oScanQRDialog.close();
										oThat.onScanQRValue();
									}
								})
								oThat.startScanning();
							})
						}
					});
				}).catch((error) => {
					console.error("Error loading ZXing library:", error);
				});

			} else {
				sap.ndc.BarcodeScanner.scan(
					function (mResult) {
						if (!mResult.cancelled) {

							oThat.onScanBarcode(mResult.text.trim());

						}
					},
					function (Error) {
						sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

					},
				);
			}
		},

		startScanning: function () {
			var oThat = this;
			var oView = oThat.getView();
			var oBundle = oView.getModel("i18n").getResourceBundle();
			try { //Checking barcodescanner plugin is available or not
				var s = cordova.plugins.barcodeScanner;
				if (s) {
					sApplicationFlag = true; // Barcode Scanner is avilable; Running in Fiori Client
				} else {
					sApplicationFlag = false; // Barcode Scanner is not-avilable
				}
			} catch (e) {
				sApplicationFlag = false; // Barcode Scanner is not avilable; Running in Browser
			}
			if (sApplicationFlag === false && sap.ui.Device.system.desktop === false) { //No Barcode Scanner Plugin and Mobile/Tablet Browser
				if (!this._oScanQRDialog) {
					this._oScanQRDialog = new sap.m.Dialog({
						title: oBundle.getText("ScanQRcode"),
						contentWidth: "640px",
						contentHeight: "480px",
						horizontalScrolling: false,
						verticalScrolling: false,
						stretchOnPhone: true,
						stretch: true,
						content: [
							new sap.ui.core.HTML({
								id: this.createId("scanContainer_QR"),
								content: "<video />"
							})
						],
						endButton: new sap.m.Button({
							text: oBundle.getText("Cancel"),
							press: function (oEvent) {
								this._oScanQRDialog.close();
								codeReader.reset();
								sap.ndc.BarcodeScanner.scan(
									function (mResult) {
										if (!mResult.cancelled) {
											oThat.onScanBarcode(mResult.text.trim());
										}
									},
									function (Error) {
										sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

									},
								);
							}.bind(this)
						}),
						afterOpen: function () {
							codeReader.decodeFromVideoDevice(selectedDeviceId, oView.byId("scanContainer_QR").getDomRef(), (result, err) => {
								if (result) {
									this._oScanQRDialog.close();
									codeReader.reset()
									oThat.onScanBarcode(result.text.trim());
								}
								if (err && !(err instanceof ZXing.NotFoundException)) {
									// oView.byId("idInOutBond").setValue("");
								}
							})
						}.bind(this),
						afterClose: function () {}
					});
					oView.addDependent(this._oScanQRDialog);
				}
				this._oScanQRDialog.open();
			} else { //QR Scanner is available and on Mobile Fiori Client
				sap.ndc.BarcodeScanner.scan(
					function (mResult) {
						if (!mResult.cancelled) {
							oThat.onScanBarcode(mResult.text.trim());

						}
					},
					function (Error) {
						sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

					},
				);
			}

		},
		//Scanning Logic Changes --- END

		// Added by shaik  -- start
		// onSacnnerBarcode: function (oBarData) {
		// 	var oScannedString = oBarData;
		// 	var scannedObject = JSON.parse(oScannedString);
		// 	var vehVal = scannedObject.VehicleNo;
		// 	var vehTyp = scannedObject.VehicleType;
		// 	var driverName = scannedObject.DriverName;
		// 	oThat.oPoNumber = scannedObject.PurchaseOrder;
		// 	if (scannedObject.ASNNumber == undefined) {
		// 		oThat.aASNnumber = '';
		// 	} else {
		// 		oThat.aASNnumber = scannedObject.ASNNumber;
		// 	}

		// 	//oThat.aASNnumber == undefined ? "" : oThat.aASNnumber;

		// 	// oThat.getView().byId("id_AsnNumber").setValue(oThat.aASNnumber);
		// 	oThat.getView().byId("id_VehiNo").setValue(vehVal);
		// 	oThat.getView().byId("id_VehicleTy").setValue(vehTyp);
		// 	oThat.getView().byId("id_InDriver").setValue(driverName);
		// },
		// Added by shaik  -- ended



		//	 Added on 01/07/2025 by Srinivas for Trucktype combo box
		handleChange: function (oEvent) {
			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

			if (!sSelectedKey && sValue) {
				oValidatedComboBox.setValueState("Error");
				var oErrorCombo = oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorCombo");
				oValidatedComboBox.setValueStateText(oErrorCombo);

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
		onScanBarcode: function (oBarData) {
			var oBundle = oThat.getView().getModel("i18n").getResourceBundle();
			// Start on 27/06/2025 Srinivas 
			// Add Dse logic for scan  and ASN
			// 1. DSE for spot purchase. Scan the barcode and display in respective fields, Pass plant and get truck type dropdown/combobox
			if (oBarData.indexOf('Source') != -1) {
				if (oThat.oView.getModel("POST").getData().Wtype == "05") {
					this._oParsedData = {}; // Store full parsed data in controller instance
					oBarData.split('\n').forEach(line => {
						let [key, value] = line.includes(':') ? line.split(':') : line.split('-');
						if (key && value) {
							this._oParsedData[key.trim()] = value.trim();
						}
					});
					var F4ScanPlantResults = oThat.getOwnerComponent().getModel("F4Model").getData().results[0].F4PlantNav.results.filter(item => item.Werks === this._oParsedData["Plant"]);
					oThat.SelectedPlant = F4ScanPlantResults[0];
					if (F4ScanPlantResults[0].Param == "E") {
						var oPlantInput = F4ScanPlantResults[0].Werks + " - " + F4ScanPlantResults[0].Name1;
						var oTruckFilter = [
							new Filter("TruckTypeGQ", sap.ui.model.FilterOperator.EQ, "X"),
							new Filter("IvWerks", sap.ui.model.FilterOperator.EQ, F4ScanPlantResults[0].Werks)
						];
						oThat.BusyDialog.open();
						oThat.oModel.read("/F4ParametersSet", {
							filters: oTruckFilter,
							urlParameters: {
								$expand: "F4TruckTypeSetNav"
							},
							success: function (oData, oResponse, ) {
								var aTruckTypes = oData.results[0].F4TruckTypeSetNav.results;
								//var oJsonModel = new JSONModel();
								// if (aTruckTypes.length > 0) {
								// 	oJsonModel.setData(aTruckTypes);
								// 	oThat.oView.setModel(oJsonModel, "TruckTypeComboModel");
								// }
								var parsedTruckType = oThat._oParsedData["Truck type"];

								// Check if parsed truck type exists in truckTypes array
								var match = aTruckTypes.find(function (item) {
									return item.Trucktyp === parsedTruckType;
								});
								oThat.BusyDialog.close();

								var vehiNo = this.byId("id_VehiNo");
								var vehicleTy = this.byId("id_VehicleTy");
								var vehicleTyCb = this.byId("id_VehicleTyCombo");
								var driver = this.byId("id_InDriver");
								var driverMob = this.byId("id_InDriverMob");
								var transport = this.byId("id_InTransport");
								var vendor = this.byId("id_Vendor");
								var scanId = this.byId("id_scanid");
								var plant = this.byId("id_InPlant");
								var manual = this.byId("id_InManual");


								if (match) {
									// Visibility
									vehicleTy.setVisible(true);
									vehicleTyCb.setVisible(false);
									//  vehicleTyCb.setSelectedKey(match.Trucktyp);
									// // vehicleTyCb.setEnabled(false);
									//  vehicleTyCb.setEditable(false);
									// Set values
									vehiNo.setValue(this._oParsedData["Truck number"] || "");
									vehicleTy.setValue(this._oParsedData["Truck type"] || "");
									driver.setValue(this._oParsedData["Driver name"] || "");
									driverMob.setValue(this._oParsedData["Driver mobile"] || "");
									plant.setValue(oPlantInput || "");
									manual.setValue(this._oParsedData["Material code"] || "");

									// Update POST model
									var postData = oThat.oView.getModel("POST").getData();
									postData.Werks = F4ScanPlantResults[0].Werks;
									postData.Name1 = F4ScanPlantResults[0].Name1;
									postData.DSEreference = this._oParsedData["DSE reference"];
									postData.DSESourceLotNo = this._oParsedData["Source Lot no"];
									// Disable / lock fields
									[vehiNo, vehicleTy, driver, driverMob, transport, vendor, plant].forEach(function (ctrl) {
										ctrl.setEditable(false);
									});
									scanId.setEnabled(false);

									// we are getting transporter based on transporter code get despricption by calling existing odata again or Transporter/Vendor  and call ok Button of material/po/ to automate 
									//debugger;
									// Step 1: Call Vendor
									oThat.Service = "Vendor";
									var oVenfilter = [
										new Filter("Werks", sap.ui.model.FilterOperator.EQ, F4ScanPlantResults[0].Werks)
									];
									oThat.onCallService(oThat.Service, oVenfilter);

									// Step 2: Wait for Vendor model to be set or timeout
									var vendorWaited = 0;
									var vendorMaxWait = 3000; // 3 seconds
									var vendorInterval = 200;

									var waitForVendorModel = function () {
										var oVendorModel = oThat.oView.getModel("Vendor");
										if (oVendorModel && oVendorModel.getData().results?.length > 0) {
											// Bind code and desc to fields
											var F4ScanTransporterCode = oThat._oParsedData["Transporter Code"];
											var oTranporterCodeInput = oVendorModel.getData().results.filter(item => item.Lifnr === F4ScanTransporterCode);
											oThat.oView.getModel("POST").getData().Lifnr = oTranporterCodeInput[0].Lifnr;
											oThat.oView.getModel("POST").getData().LifnrDesc = oTranporterCodeInput[0].Name1;
											oThat.getView().byId("id_Vendor").setValue(oTranporterCodeInput[0].Lifnr || "");
											oThat.oView.getModel("POST").getData().VendorName = oTranporterCodeInput[0].Name1;
											oThat.oView.getModel("POST").refresh(true);

											console.log("✅ Vendor model loaded.");
											// Proceed to the next step directly
											oThat.onPressManualQROK();
										} else if (vendorWaited >= vendorMaxWait) {
											console.warn("⚠️ Vendor model not loaded in time. Proceeding anyway.");
											// Proceed to the next step directly
											oThat.onPressManualQROK();
										} else {
											vendorWaited += vendorInterval;
											setTimeout(waitForVendorModel, vendorInterval);
										}
									};
									waitForVendorModel();
								} else {
									var oScanMsg7 = oBundle.getText("ErrorScan7");
									MessageBox.error(oScanMsg7);
									// Visibility
									vehicleTy.setVisible(true);
									vehicleTyCb.setVisible(false);
									vehiNo.setValue("");
									vehicleTy.setValue("");
									driver.setValue("");
									driverMob.setValue("");
									plant.setValue("");
									manual.setValue("");
									vendor.setValue("");
									oThat.getView().byId("id_Vendor").setValue("");
									oThat.oView.getModel("POST").getData().Lifnr = ""
									oThat.oView.getModel("POST").getData().LifnrDesc = ""
									oThat.oView.getModel("POST").getData().Werks = ""
									oThat.oView.getModel("POST").getData().Name1 = ""
									oThat.oView.getModel("POST").getData().Gate = ""
									oThat.oView.getModel("POST").getData().Wbname = ""
									oThat.oView.getModel("POST").getData().VendorName = ""
									oThat.oView.getModel("POST").getData().DSESourceLotNo = ""
									oThat.oView.getModel("POST").getData().DSEreference = ""
									oThat.oView.getModel("POST").refresh(true);
									oThat.oView.getModel("POLIST").setData([]); // clear materpopup model too 
									oThat.oView.getModel("POLIST").refresh(true);

									// Disable / lock fields
									[vehiNo, vehicleTy, driver, driverMob, transport, vendor, plant].forEach(function (ctrl) {
										ctrl.setEditable(true);
									});
									scanId.setEnabled(true);
									return;
								}
								//var oJsonModel = new JSONModel();
								oThat.BusyDialog.close();

							}.bind(this),
							error: function (error) {
								oThat.BusyDialog.close();
								MessageBox.error(error.responseText);
							}
						})




					} else {
						var oScanMsg2 = oBundle.getText("ErrorScan2");
						MessageToast.show(oScanMsg2);
					}
				} else {
					var oScanMsg1 = oBundle.getText("ErrorScan1");
					MessageToast.show(oScanMsg1);
				}
				//ASN single/multiple
			} else if (oBarData.includes("ASN")) {
				var asnId = oBarData;
				if (oThat.oView.getModel("POST").getData().Wtype == "01") {
					var oPlant = oThat.oView.getModel("POST").getProperty("/Werks");
					if (oPlant) {
						var oASNFilter = [
							new Filter("IvWerks", sap.ui.model.FilterOperator.EQ, oPlant),
							new Filter("IvASNNo", sap.ui.model.FilterOperator.EQ, asnId)
						];
						oThat.BusyDialog.open();
						oThat.oModel.read("/F4ParametersSet", {
							filters: oASNFilter,
							urlParameters: {
								$expand: "AsnHeadSetNav,AsnItemSetNav"
							},
							success: function (oData, oResponse, ) {
								var oDataResults = oData.results[0];
								//var oJsonModel = new JSONModel();
								oThat.oAsnHeaderData = oDataResults.AsnHeadSetNav.results;
								oThat.oAsnItemData = oDataResults.AsnItemSetNav.results;
								if (oThat.oAsnHeaderData[0].Asnnumber) {
									if (oThat.oAsnHeaderData[0].AsnExist !== "X") {
										//if(oThat.oAsnHeaderData[0].Asnnumber){
										if (oThat.oAsnHeaderData[0].Asnnumber && (oThat.multiAsnHeader == "" || oThat.multiAsnHeader == undefined)) {
											oThat.multiAsnHeader = oThat.oAsnHeaderData[0];
											oThat.oMultiPlant = oPlant;
											//oThat.multiAsnHeader.oMultiPlant =  oPlant;
											oThat.oView.byId("id_VehicleTy").setVisible(true);
											oThat.oView.byId("id_VehicleTyCombo").setVisible(false);
											oThat.Asnnumber = oThat.oAsnHeaderData[0].Asnnumber;
											oThat.oScannedAsnNubers.push(oThat.Asnnumber);
											oThat.oView.byId("id_VehiNo").setValue(oThat.oAsnHeaderData[0].VehicleNo || "");
											oThat.oView.byId("id_VehicleTy").setValue(oThat.oAsnHeaderData[0].VehicleType || "");
											oThat.oView.byId("id_InDriver").setValue(oThat.oAsnHeaderData[0].DriverName || "");
											oThat.oView.byId("id_InDriverMob").setValue(oThat.oAsnHeaderData[0].MobileNo || "");
											//oThat.oView.getModel("POST").getData().Lifnr = oAsnHeader[0].VendorName;
											oThat.oView.byId("id_InTransport").setValue(oThat.oAsnHeaderData[0].VendorName || "");
											oThat.oView.byId("id_VehiNo").setEditable(false);
											oThat.oView.byId("id_VehicleTy").setEditable(false);
											oThat.oView.byId("id_InDriver").setEditable(false);
											oThat.oView.byId("id_InDriverMob").setEditable(false);
											oThat.oView.byId("id_InTransport").setEditable(false);
											oThat.oView.byId("id_scanid").setEnabled(false); //added on 14/08/2025
											oThat.oView.getModel("POST").getData().Lifnr = oThat.oAsnHeaderData[0].VendorName.match(/\d+/)[0];
											oThat.oView.getModel("POST").getData().LifnrDesc = oThat.oAsnHeaderData[0].VendorName.split('-')[1].trim();
											oThat.oView.getModel("POST").refresh(true);
											//oThat.oView.byId("id_InManual").setValue(Number(oAsnItem[0].Ponumber));
										} else if (oThat.multiAsnHeader && (oThat.multiAsnHeader.VehicleNo === oThat.oAsnHeaderData[0].VehicleNo) &&
											(oThat.multiAsnHeader.VehicleType === oThat.oAsnHeaderData[0].VehicleType) &&
											(oThat.oMultiPlant === oPlant) && (oThat.multiAsnHeader.DriverName === oThat.oAsnHeaderData[0].DriverName) &&
											(oThat.multiAsnHeader.MobileNo === oThat.oAsnHeaderData[0].MobileNo) && (oThat.multiAsnHeader.VendorName === oThat.oAsnHeaderData[0].VendorName)) {
											oThat.Asnnumber = oThat.oAsnHeaderData[0].Asnnumber;
											if (oThat.oScannedAsnNubers.includes(oThat.Asnnumber)) {
												var oScanMsg6 = oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorScan6");
												MessageToast.show(oScanMsg6);
												oThat.BusyDialog.close();
												return; // check if same asn is scaneed multiple times and stop to move further
											} else {}
										} else {
											oThat.oAsnItemData.length = 0;
											var oScanMsg5 = oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorScan5");
											MessageToast.show(oScanMsg5);
											oThat.BusyDialog.close();
											return;
										}
										if (oThat.oAsnItemData.length > 0) {
											// Remove duplicate Ponumber entries
											const uniquePoItems = oThat.oAsnItemData.filter((item, index, self) =>
												index === self.findIndex((t) => t.Ponumber === item.Ponumber)
											);
											uniquePoItems.forEach(function (item) {
												var oPoNumber = item.Ponumber
												oThat.oView.byId("id_InManual").setValue(oPoNumber);
												oThat.onPressManualQROK();
											})
										}
										oThat.BusyDialog.close();
									} else {
										oThat.BusyDialog.close();
										MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorScan4", [oThat.oAsnHeaderData[0].Asnnumber]));
									}
								} else {
									oThat.BusyDialog.close();
									var oScanMsg3 = oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorScan3");
									MessageToast.show(oScanMsg3);
								}
							}.bind(this),
							error: function (error) {
								oThat.BusyDialog.close();
							},
						});
					} else {
						MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("Plant_Mandatory"));
					}
				} else {
					var oScanMsg1 = oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorScan1");
					MessageToast.show(oScanMsg1);
				}

			} else {
				// end by Srinivas

				if (this.ScanBtnPress === oBundle.getText("RefNo")) {
					this.setScanRefernceNo(oBarData);
				} else if (this.ScanBtnPress === oBundle.getText("Scanner")) {
					var valid = true,
						errMsg;
					if (oThat.oView.getModel("POLIST").getData()) {
						var polist = oThat.oView.getModel("POLIST").getData();
						for (var n in polist) {
							if (polist[n].Ebeln === oBarData) {
								valid = false;
								errMsg = oThat.oView.getModel("i18n").getResourceBundle().getText("ItemExist");
								break;
							}
						}
					}
					if (oThat.oView.getModel("POST").getData().Wtype !== "" && oThat.oView.getModel("POST").getData().Werks !== "") {
						if (oThat.SelectedPlant.Param === "H" && oThat.oView.getModel("POST").getData().Gate.trim().length === 0) {
							valid = false;
							errMsg = oThat.oView.getModel("i18n").getResourceBundle().getText("errorGate");
						}
					}
					/*	validation  END */

					//3B#BR072000001#Tn 09 3413#TRUCK#Test Driver#0989088098#634624143532423$600000000602#1000158#ANF1414#1000
					//3A#BR072000001#Tn 09 3413#TRUCK#Test Driver#0989088098#634624143532423$CPA000012#ANF1414#30000&CPA000258#ANF1314#2000
					//code added by kirubakaran for brazil plant in 27.10.2020
					if (valid) {
						if (plantFlag === "X") {
							scanPlantFlag = "X";
							this.scanArry = {
								"results": []
							};
							// var oVal = oEvent.getParameter("text");
							var oVal = oBarData; //Changed by Avinash
							//var oVal = oThat.oPoNumber; // shaik
							var sHeaderData = oVal.split("$")[0];
							var sItem = oVal.split("$")[1];
							this.ahead = sHeaderData.split("#");
							var aItem = sItem.split("&");
							this.aData = [];
							if (this.ahead[0] === "3A") {
								for (var i = 0; i < aItem.length; i++) {
									var splitData = aItem[i].split("#");
									var oData = {
										"CMSNumber": splitData[0],
										"NotaFiscalNo": splitData[1],
										"NotaFiscalQty": splitData[2]
									};
									this.aData.push(oData);
								}
							} else {
								for (var i = 0; i < aItem.length; i++) {
									var splitData = aItem[i].split("#");
									var oData = {
										"DeliveryNo": splitData[0],
										"VendorNumber": splitData[1],
										"NotaFiscalNo": splitData[2],
										"NotaFiscalQty": splitData[3]
									};
									this.aData.push(oData);
								}
							}

							//	this.sData = oVal.split("#", 11);
							//	this.sItem = this.sData[6].split("$", 2);
							//	this.sItemData = this.sData[8].split("&", 2);
							//	var count = 0;
							if (this.ahead[0] === "3A") {
								this.ahead[0] = oThat.getView().getModel("F4Model").getData().results[0].F4ProcessNav.results[0].Name1;
								oThat.getView().byId("id_ComboProcess").setValue(this.ahead[0]);
								oThat.getView().byId("id_VehiNo").setValue(this.ahead[2]);
								oThat.getView().byId("id_VehicleTy").setValue(this.ahead[3]);
								oThat.getView().byId("id_InDriver").setValue(this.ahead[4]);
								oThat.getView().byId("id_InDriverMob").setValue(this.ahead[5]);
								oThat.getView().byId("id_driverno").setValue(this.ahead[6]);
								for (var t = 0; t < this.aData.length; t++) {
									oThat.getView().byId("id_InManual").setValue(this.aData[t].CMSNumber);
									// oThat.onPressManualQROK(oEvent); //Need to check
									oThat.onPressManualQROK(); //Need to check
								}
							} else {
								this.ahead[0] = oThat.getView().getModel("F4Model").getData().results[0].F4ProcessNav.results[4].Name1;

								oThat.getView().byId("id_ComboProcess").setValue(this.ahead[0]);
								oThat.getView().byId("id_VehiNo").setValue(this.ahead[2]);
								oThat.getView().byId("id_VehicleTy").setValue(this.ahead[3]);
								oThat.getView().byId("id_InDriver").setValue(this.ahead[4]);
								oThat.getView().byId("id_InDriverMob").setValue(this.ahead[5]);
								oThat.getView().byId("id_driverno").setValue(this.ahead[6]);
								for (var t = 0; t < this.aData.length; t++) {
									//	oThat.getView().getModel("POST").getData().Wtype = "05";
									oThat.getView().byId("id_InManual").setValue(this.aData[t].DeliveryNo);
									// oThat.spotPurchaseQR(oEvent);
									oThat.spotPurchaseQR();
								}
							}
						}
						//code ended by kirubakaran for brazil plant in 27.10.2020
						if (oBarData) { //Changed by Avinash
							if (oThat.oView.getModel("POST").getData().Wtype !== "" && oThat.oView.getModel("POST").getData().Werks !== "") {
								var vWtype = "";
								var vProcess = oThat.oView.getModel("F4Model").getData().results[0].F4ProcessNav.results.filter(function (obj) {
									return obj.SeqNo == oThat.oView.getModel("POST").getData().Wtype;
								});
								if (vProcess.length != 0) {
									vWtype = vProcess[0].Process;
								}
								if (vWtype == "TRIP") {
									var vVlaue = oBarData; //Changed by Avinash
									if (vVlaue !== "") {
										if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "A" ||
											oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "B" ||
											oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "D") {
											var vValue1 = vVlaue.split("#", 2);
											var vWbId = vValue1[0];
											var vWbitem = vValue1[1];
											oThat.onQRValidate(vWbId, vWbitem);
										} else if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "C") {
											var DoNo = vVlaue;
											oThat.onQRValidate(DoNo, "");
										}
										//Added by Avinash for GH Requirement - 14.07.21
										else if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "F" || oThat.oView.getModel("oDisplayModel").getData().EvOrigin ===
											"G" || oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "I" || oThat.oView.getModel("oDisplayModel").getData().EvOrigin ==
											"M") { //Added for CFM POrt
											// oThat.oView.getModel("oDisplayModel").getData().EvOrigin ==
											// "H" || oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "L" || oThat.oView.getModel("oDisplayModel").getData().EvOrigin ==
											// "J" ||
											var vValue1 = vVlaue.split("#", 2);
											var vWbId = vValue1[0];
											var vWbitem = vValue1[1];
											oThat.onQRValidate(vWbId, vWbitem);
										}
										//End of added...
									}
								} else {
									if (vWtype == "TRANSFER" && oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "H") { //Added by Avinash for CFM Changes
										var vValue1 = oBarData.split("#", 2);
										var vWbId = vValue1[0];
										var vWbitem = "";
										// if (!vWbitem) {
										// 	vWbitem = "00001";
										// }
										// oThat.onQRValidate(vWbId, vWbitem);
										oThat.onQRValidateTransfer(vWbId, vWbitem);
									} //End of Added
									else {
										var vVlaue = oBarData; //Changed by Avinash
										// var vVlaue = oThat.oPoNumber;   //shaik
										var vPo = vVlaue.slice(0, 10);

										// Added for Ghana Tp and biscuits
										if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "K" && vWtype == "STO") {
											var vPo = vVlaue.split("#")[0];
										} else {
											var vPo = vVlaue;
										}

										if (vVlaue !== "") {
											oThat.onQRValidate(vPo, "");
										}
									}
								}
							} else {
								MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg17"));
							}
						}
					} else {
						MessageToast.show(errMsg);

					}
				}


			}

		},
		fnBarcodeFailed: function () {
			sap.m.MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg2"));
		},

		//=================================================================================//
		//======================= On Image Capture ========================================//
		//=================================================================================//
		// onImageSelect : function(){
		onCaptureCamera: function () {
			var oThat = this;
			//   oThat.Images= []
			oThat.oView.setModel(new JSONModel(oThat.Images), "MASS");
			oThat.oView.getModel("MASS").refresh(true);
			if (!oThat.oCapture) {
				oThat.oCapture = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.CaptureImage", oThat);
				oThat.oView.addDependent(oThat.oCapture);
			}

			oThat.oCapture.open();
		},
		fnAddBillClose: function () {
			oThat.Images = [];
			oThat.oCapture.close();
		},
		onBeforeUploadStarts: function () {
			oThat.BusyDialog.open();
		},



		// added by srinivas on with press event for attachments preview on 11/08/2025
		// onFilePreview: function (oEvent) {
		// 		var oItem = oEvent.getSource();
		// 		var sUrl = oItem.getUrl();
		// 		var sMime = oItem.getMimeType();
		// 		var sFileName = oItem.getFileName();
		// 		if (!sUrl) {
		// 			sap.m.MessageToast.show("Document preview not available");
		// 			return;
		// 		}
		// 		var lowerMime = sMime ? sMime.toLowerCase() : "";
		// 		var lowerName = sFileName ? sFileName.toLowerCase() : "";
		// 		// PDF preview inside app
		// 		if (lowerMime.includes("pdf") || lowerName.endsWith(".pdf")) {
		// 			var oPdfViewer = new sap.m.PDFViewer({
		// 				source: sUrl,
		// 				title: sFileName
		// 			});
		// 			this.getView().addDependent(oPdfViewer);
		// 			oPdfViewer.open();
		// 			return;
		// 		}
		// 		// Image preview in new tab
		// 		if (lowerMime.startsWith("image/")) {
		// 			window.open(sUrl, "_blank");
		// 			return;
		// 		}

		// 		// // Office files preview via Microsoft Office Online Viewer
		// 		// var officeExtensions = [".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"];
		// 		// if (officeExtensions.some(ext => lowerName.endsWith(ext))) {
		// 		//     // var officeViewerUrl = "https://view.officeapps.live.com/op/view.aspx?src=" + encodeURIComponent(sUrl);
		// 		//     // window.open(officeViewerUrl, "_blank");
		// 		// // 	var googleViewerUrl = "https://docs.google.com/viewer?url=" + encodeURIComponent(sUrl) + "&embedded=true";
		// 		// // window.open(googleViewerUrl, "_blank");
		// 		// var link = document.createElement("a");
		// 		// link.href = sUrl;
		// 		// link.download = sFileName; // This ensures it keeps the same name
		// 		// document.body.appendChild(link);
		// 		// link.click();
		// 		// document.body.removeChild(link);
		// 		// return;
		// 		// // window.open(sUrl, "_blank");
		// 		// //     return;
		// 		// }
		// 		// // Fallback: open file directly
		// 		// window.open(sUrl, "_blank");

		// 		// All other files → Download with same name
		// 		var link = document.createElement("a");
		// 		link.href = sUrl;
		// 		link.download = sFileName;
		// 		document.body.appendChild(link);
		// 		link.click();
		// 		document.body.removeChild(link);
		// 	},





		onFilePreview: function (oEvent) {
			var oBundle = oThat.getView().getModel("i18n").getResourceBundle();
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();

			var oSource = oEvent.getSource();
			// Climb up parents until we find a sap.m.Dialog instance or root
			var oParent = oSource;
			while (oParent) {
				if (oParent.getMetadata && oParent.getMetadata().getName() === "sap.m.Dialog") {
					break; // Found the Dialog control
				}
				oParent = oParent.getParent && oParent.getParent();
			}

			if (!oParent) {
				sap.m.MessageToast.show("Dialog container not found");
				return;
			}

			var oDialog = oParent;

			var oPreviewContainer = oDialog.findAggregatedObjects(true, function (oCtrl) {
				return oCtrl.getId().indexOf("previewContainer") !== -1;
			})[0];

			var oImagePreview = oDialog.findAggregatedObjects(true, function (oCtrl) {
				return oCtrl.getId().indexOf("imagePreview") !== -1;
			})[0];

			var oPreviewTitle = oDialog.findAggregatedObjects(true, function (oCtrl) {
				return oCtrl.getId().indexOf("previewTitle") !== -1;
			})[0];

			if (!oPreviewContainer || !oImagePreview || !oPreviewTitle) {
				sap.m.MessageToast.show("Preview controls not found");
				return;
			}

			var oContext = oSource.getBindingContext("MASS");
			var oData = oContext ? oContext.getObject() : null;

			if (!oData) {
				sap.m.MessageToast.show("File data not found");
				return;
			}

			var sUrl = oData.documentUrl || oData.url || "";
			var sFileName = oData.Fname || "";
			var fileExt = sFileName.split('.').pop().toLowerCase();

			if (!sUrl) {
				sap.m.MessageToast.show("Document preview not available");
				return;
			}

			if (["jpg", "jpeg", "png", "gif", "bmp", "svg"].includes(fileExt)) {
				oImagePreview.attachEventOnce("load", function () {
					oBusyDialog.close();
				});
				oImagePreview.attachEventOnce("error", function () {
					oBusyDialog.close();
					sap.m.MessageToast.show("Failed to load image preview");
				});

				oImagePreview.setSrc(sUrl);
				oPreviewTitle.setText("Preview: " + sFileName);
				oPreviewContainer.setVisible(true);
				//oBusyDialog.close();
			} else {
				//sap.m.MessageToast.show("Preview not available for this file type");
				//download other files
				oBusyDialog.close();
				var link = document.createElement("a");
				link.href = sUrl;
				link.download = sFileName;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		},

		onClosePreview: function (oEvent) {
			var oSource = oEvent.getSource();

			// Climb up parents to find sap.m.Dialog instance
			var oParent = oSource;
			while (oParent) {
				if (oParent.getMetadata && oParent.getMetadata().getName() === "sap.m.Dialog") {
					break; // found dialog
				}
				oParent = oParent.getParent && oParent.getParent();
			}

			if (!oParent) {
				// Dialog not found — just exit
				return;
			}

			var oDialog = oParent;

			var oPreviewContainer = oDialog.findAggregatedObjects(true, function (oCtrl) {
				return oCtrl.getId().indexOf("previewContainer") !== -1;
			})[0];

			var oImagePreview = oDialog.findAggregatedObjects(true, function (oCtrl) {
				return oCtrl.getId().indexOf("imagePreview") !== -1;
			})[0];

			var oPreviewTitle = oDialog.findAggregatedObjects(true, function (oCtrl) {
				return oCtrl.getId().indexOf("previewTitle") !== -1;
			})[0];

			if (oPreviewContainer) oPreviewContainer.setVisible(false);
			if (oImagePreview) oImagePreview.setSrc("");
			if (oPreviewTitle) oPreviewTitle.setText("");
		},
		// end by srinivas on with press event for attachments preview on 11/08/2025


		onCompleteUpload: function (oEvent) {
			var oThat = this;
			oThat.onClosePreview(oEvent);

			var vRadio = sap.ui.getCore().byId("id_RadioBtn").getSelectedButton().getId();
			var vRadioText = sap.ui.getCore().byId("id_RadioBtn").getSelectedButton().getText();
			if (oThat.Images.length != 0) {
				for (var i = 0; i < oThat.Images.length; i++) {
					if (oThat.Images[i].Doknr == vRadio) {
						oThat.Images.splice(i, 1);
						break;
					}
				}
			}
			var file = oEvent.getSource()._getFileUploader()._aXhr[0]['file'];
			var object = {};
			object.Documentid = jQuery.now().toString();
			// added by srinivas on 11/08/2025 for file name ext
			var fileExt = "";
			if (file && file.name) {
				var dotIndex = file.name.lastIndexOf(".");
				if (dotIndex !== -1) {
					fileExt = file.name.substring(dotIndex); // includes the dot
				}
			}
			// end by srinivas on 11/08/2025
			//object.Fname = vRadioText;// commented by srinivas on 11/08/2025
			object.Fname = vRadioText.trim() + (fileExt ? "" + fileExt.toLowerCase() : ""); //added by srinivas on 11/08/2025 for file name ext
			object.Ftype = file.type;
			object.Objky = "";
			object.Doknr = vRadio;

			oEvent.getSource()._getFileUploader()._aXhr.splice(0, 1);
			if (file) {
				var reader = new FileReader();
				var BASE64_MARKER = 'data:' + file.type + ';base64,';
				reader.onloadend = (function (theFile) {
					return function (evt) {
						var base64Index = evt.target.result.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
						var base64Data = evt.target.result.substring(base64Index);
						object.Filename = base64Data;
						// object.Url = BASE64_MARKER + base64Data;
						object.documentUrl = URL.createObjectURL(file); // Used for preview //added by srinivas on 11/08/2025 for file name ext
						oThat.Images.unshift(object);
						// oThat.Images = object; //Added by Avinash
						object = {}; //clear	
						oThat.getView().setModel(new JSONModel(oThat.Images), "MASS");
						oThat.getView().getModel("MASS").refresh(true);
						oThat.BusyDialog.close();
					};
					// that.getBusy().setBusy(false);
				})(file);
			}
			reader.readAsDataURL(file);
			// var vRadio = oThat.Core.byId("id_RadioBtn").getSelectedButton().getId();
			// var vRadioText = oThat.Core.byId("id_RadioBtn").getSelectedButton().getText();
			// if (oThat.Images.length != 0) {
			// 	for (var i = 0; i < oThat.Images.length; i++) {
			// 		if (oThat.Images[i].Doknr == vRadio) {
			// 			oThat.Images.splice(i, 1);
			// 			break;
			// 		}
			// 	}
			// }
			// var file = oEvent.getSource()._getFileUploader()._aXhr[0]['file'];
			// var object = {};
			// object.Documentid = jQuery.now().toString();
			// object.Fname = vRadioText;
			// object.Ftype = file.type;
			// object.Objky = "";
			// object.Doknr = vRadio;
			// oEvent.getSource()._getFileUploader()._aXhr.splice(0, 1);
			// if (file) {
			// 	var reader = new FileReader();
			// 	var BASE64_MARKER = 'data:' + file.type + ';base64,';
			// 	reader.onloadend = (function(theFile) {
			// 		return function(evt) {
			// 			var base64Index = evt.target.result.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
			// 			var base64Data = evt.target.result.substring(base64Index);
			// 			object.Filename = base64Data;
			// 			oThat.Images.unshift(object);
			// 			object = {}; //clear	
			// 			oThat.oView.setModel(new JSONModel(oThat.Images), "MASS");
			// 			oThat.oView.getModel("MASS").refresh(true);
			// 			oThat.BusyDialog.close();
			// 		};
			// 		// that.getBusy().setBusy(false);
			// 	})(file);
			// }
			// reader.readAsDataURL(file);

		},
		onFileDeleted: function (oEvent) {
			var vDocumentid = oEvent.getParameter("documentId");
			for (var i = 0; i < oThat.Images.length; i++) {
				if (oThat.Images[i].Documentid == vDocumentid) {
					oThat.Images.splice(oThat.Images[i], 1);
					break;
				}
			}
			oThat.oView.setModel(new JSONModel(oThat.Images), "MASS");
			oThat.oView.getModel("MASS").refresh(true);

			// Hide preview if deleted file was showing // added by srinivas on 14/08/2025 to clear preview
			var oPreviewImage = oThat.byId("imagePreview");
			var oPreviewContainer = oThat.byId("previewContainer");
			if (oPreviewImage && oPreviewImage.getSrc()) {
				// Check if previewed image was the one deleted
				var sPreviewSrc = oPreviewImage.getSrc();
				var wasDeleted = sPreviewSrc && sPreviewSrc.includes(vDocumentid);

				if (wasDeleted && oPreviewContainer) {
					oPreviewImage.setSrc(""); // Clear the image
					oPreviewContainer.setVisible(false); // Hide the preview box
				}
			}
			// ended by srinivas on 14/08/2025	
		},

		fnOKImages: function (oEvent) {

			var attachmentdoc = oThat.getView().getModel("MASS").getData();
			var validateFlag = oThat.SelectedPlant.ImgFlag;
			// var validateFlag = ["1","5"]

			var adrive = 0,
				aVehicle = 0;
			if (validateFlag.length > 0) {

				for (var x in validateFlag) {
					if (validateFlag[x] === "1") {
						var adrive = true,
							adrivecount = 0;
						for (var y in attachmentdoc) {
							var fileName = attachmentdoc[y].Fname; // added by srinivas on24/08/2025
							var nameOnly = fileName.substring(0, fileName.lastIndexOf("."));  // added by srinivas on24/08/2025
							if (nameOnly === "Driver") { // added by srinivas on24/08/2025
							//if (attachmentdoc[y].Fname === "Driver") { commented by srinivas
								adrivecount++;
								break;
							}
						}
					} else if (validateFlag[x] === "2") {
						var aVehicle = true,
							aVehiclecount = 0;
						for (var y in attachmentdoc) {
							var fileName = attachmentdoc[y].Fname; // added by srinivas on24/08/2025
							var nameOnly = fileName.substring(0, fileName.lastIndexOf("."));  // added by srinivas on24/08/2025
							// if (attachmentdoc[y].Fname === "Vehicle Name Plate") {
							if (nameOnly === "Vehicle Name Plate") {
								aVehiclecount++;
								break;
							}

						}

					} else if (validateFlag[x] === "3") {
						var aLicense = true,
							aLicensecount = 0;
						for (var y in attachmentdoc) {
							var fileName = attachmentdoc[y].Fname; // added by srinivas on24/08/2025
							var nameOnly = fileName.substring(0, fileName.lastIndexOf("."));  // added by srinivas on24/08/2025
							// if (attachmentdoc[y].Fname === "License") {
							if (nameOnly === "License") {
								aLicensecount++;
								break;
							}

						}

					} else if (validateFlag[x] === "4") {
						var aTruckImg = true,
							aTruckcount = 0;
						for (var y in attachmentdoc) {
							var fileName = attachmentdoc[y].Fname; // added by srinivas on24/08/2025
							var nameOnly = fileName.substring(0, fileName.lastIndexOf("."));  // added by srinivas on24/08/2025
							// if (attachmentdoc[y].Fname === "Truck Image") {
							if (nameOnly === "Truck Image") {
								aTruckcount++;
								break;
							}

						}

					} else if (validateFlag[x] === "5") {
						var aOthers = true,
							aOtherscount = 0;
						for (var y in attachmentdoc) {
							var fileName = attachmentdoc[y].Fname; // added by srinivas on24/08/2025
							var nameOnly = fileName.substring(0, fileName.lastIndexOf("."));  // added by srinivas on24/08/2025
							//if (attachmentdoc[y].Fname === "Others") {
								if (nameOnly === "Others") {
								aOtherscount++;
								break;
							}

						}

					}


				}

				var text = ""
				if (adrive && adrivecount <= 0) {
					//text += "please attach doc for driver ";
					text += oThat.oView.getModel("i18n").getResourceBundle().getText("errorDriver");
				}
				if (aVehicle && aVehiclecount <= 0) {
					//text += "please attach doc for Vehicle Name Plate ";
					text += oThat.oView.getModel("i18n").getResourceBundle().getText("errorVehiclenameplate");
				}
				if (aLicense && aLicensecount <= 0) {
					//	text += "please attach doc for License ";
					text += oThat.oView.getModel("i18n").getResourceBundle().getText("errorLicense");
				}
				if (aTruckImg && aTruckcount <= 0) {
					//text += "please attach doc for Truck Image ";
					text += oThat.oView.getModel("i18n").getResourceBundle().getText("errorTruckImg");
				}
				if (aOthers && aOtherscount <= 0) {
					//text += "please attach doc for Others ";
					text += oThat.oView.getModel("i18n").getResourceBundle().getText("errorOthers");
				}
				if (text.trim().length > 0) {
					var formatMsg = text.split('.').join('.\n');
					sap.m.MessageBox.error(formatMsg);
					oThat.Images = [];
				} else {
					oThat.oCapture.close();
				}

			} else {


				oThat.oCapture.close();
			}
		},
		// },
		onChangeProcess: function (oEvent) {
			var vId = oEvent.getSource().getId();
			oEvent.getSource().setValueState('None');
			var vProcess = oEvent.getSource().getSelectedKey();
			var vProcessText = oEvent.getSource()._getSelectedItemText();

			/*Code added by Nagaraj Start 18/07/2024*/
			oThat.oView.byId("id_VehiNo").setEditable(true);
			oThat.oView.byId("id_VehiNo").setValue("");
			oThat.oView.byId("id_VehicleTy").setEditable(true);
			oThat.oView.byId("id_VehicleTy").setValue("");
			oThat.getView().byId("id_Param7Key").setState(true);
			oThat.getView().byId("id_Param7Key").setEnabled(true);

			if (oThat.oView.getModel("POST").getData().Werks !== "" && vProcess === "08") {
				if (oThat.SelectedPlant.Param === "H") {
					oThat.oView.byId("id_VehiNo").setEditable(false);
					oThat.oView.byId("id_VehiNo").setValue("");
					oThat.oView.byId("id_VehicleTy").setEditable(false);
					oThat.oView.byId("id_VehicleTy").setValue(oThat.oView.getModel("i18n").getResourceBundle().getText("recbyHand"));
					oThat.getView().byId("id_Param7Key").setState(!true);
					oThat.getView().byId("id_Param7Key").setEnabled(!true);
				} else {
					sap.m.MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("processvalid"));
					oEvent.getSource().setSelectedKey();
					var vProcess = '';
					var vProcessText = '';
				}
			}
			/*Code added by Nagaraj END*/	

			/*Code RGP/NRGP req added by Nagaraj Start 05/11/2024*/
			oThat.oView.byId("id_InRefNo").setVisible(false);
			oThat.oView.byId("id_InRefNoValue").setValue("");
			oThat.oView.byId("id_Vendor").setEditable(true);
			if ((oThat.oView.getModel("POST").getData().Werks !== "") && (vProcess === "09" || vProcess === "10")) {
				oThat.getView().byId("id_barcodescan").setEnabled(!true);
				oThat.oView.byId("id_scanid").setEnabled(!true);
				oThat.getView().byId("id_Param7Key").setState(!true);
				oThat.getView().byId("id_Param7Key").setEnabled(!true);
				oThat.oView.byId("id_VehicleTy").setValue("");
				oThat.oView.byId("id_Vendor").setEditable(false);
				if (oThat.SelectedPlant.Param === "H") {
					oThat.oView.byId("id_InRefNo").setVisible(true);
					oThat.oView.byId("id_InRefNoValue").setValue("");
					oThat.oView.byId("id_VehicleTy").setEditable(false);
					oThat.oView.byId("id_VehicleTy").setValue(vProcessText);
				}
			}
			/*Code added by Nagaraj END*/

			// added by srinivas on 19/09/2025 to show reference field rgp/nrgp in and out
					if (vProcess === "09" || vProcess === "10" ){
						oThat.oView.byId("id_InRefNo").setVisible(true);
							oThat.oView.byId("id_InRefNoValue").setValue("");
							// oThat.oView.byId("id_Vendor").setEditable(true);
							//oThat.oView.byId("id_scanid").setEnabled(true);
					}
					// end by srinivas

			if (vId.indexOf("id_ComboProcess") != -1) {
				oThat.oView.byId("id_LblWbId").setVisible(false);
				oThat.oView.byId("id_InWbId").setVisible(false);
				oThat.oView.byId("id_LblWbItem").setVisible(false);
				oThat.oView.byId("id_InWbItem").setVisible(false);
				oThat.oView.byId("id_LblDoNo").setVisible(false);
				oThat.oView.byId("id_InDoNo").setVisible(false);
				oThat.oView.byId("id_POBtn").setVisible(true);
				oThat.oView.getModel("POST").getData().Wtype = vProcess;
				var vPo = oEvent.getSource().getModel("F4Model").getData().results[0].F4ProcessNav.results.filter(function (obj) {
					return obj.Name1 == vProcessText;
				});
				if (vPo.length != 0) {
					oThat.oView.byId("id_POBtn").setVisible(true);
					if (vPo[0].Po == 'X') {
						oThat.oView.byId("id_POBtn").setText(oThat.oView.getModel("i18n").getResourceBundle().getText("Text3"));
						oThat.oView.byId("id_VendorBox").setVisible(false);
						oThat.oView.byId("id_InManual").setMaxLength(10);
						oThat.oView.byId("id_InManual").setShowValueHelp(false);
						oThat.oView.byId("id_InManual").setValue("");

						if (!oThat.oPersonalModel.getData().ColumnsItems[0].visible) {
							oThat.oView.byId("id_InManual").setEnabled(true);
						}
						//=============== To enable trip process ===========//	
						if (vPo[0].Process == "TRIP") {
							if (oThat.oView.getModel("oDisplayModel")) {
								if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "A" ||
									oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "B" ||
									oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "D" ||
									oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "F" || //Line Added by Avinash on 14.07.21
									oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "G" || //Line Added by Avinash on 22.07.21
									oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "I") { //Line Added by Avinash on 28.04.22
									oThat.oView.byId("id_LblWbId").setVisible(true);
									oThat.oView.byId("id_InWbId").setVisible(true);
									oThat.oView.byId("id_LblWbItem").setVisible(true);
									oThat.oView.byId("id_InWbItem").setVisible(true);
									oThat.oView.byId("id_POBtn").setVisible(false);
									oThat.oView.byId("id_InManual").setMaxLength(12);
								} else if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin === "C") {
									oThat.oView.byId("id_LblDoNo").setVisible(true);
									oThat.oView.byId("id_InDoNo").setVisible(true);
									oThat.oView.byId("id_POBtn").setVisible(false);
								}
							}
						}

					} else if (vPo[0].Po == 'M') {
						oThat.oView.byId("id_POBtn").setText(oThat.oView.getModel("i18n").getResourceBundle().getText("Text21"));
						oThat.oView.byId("id_VendorBox").setVisible(true);
						if (!oThat.oPersonalModel.getData().ColumnsItems[0].visible) {
							oThat.oView.byId("id_InManual").setEnabled(true);
						}
						oThat.oView.byId("id_InManual").setValue("");
						oThat.oView.byId("id_InManual").setMaxLength(18);
						oThat.oView.byId("id_InManual").setShowValueHelp(true);

						//Added on 07/07/22
						// if (oThat.oView.getModel("oDisplayModel")) {
						// 	if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "H") {
						// 		oThat.getView().byId("id_RefTb").setVisible(true);
						// 	}
						// }
						//End of Added

					} else {
						oThat.oView.byId("id_POBtn").setText(oThat.oView.getModel("i18n").getResourceBundle().getText("Text4"));
						oThat.oView.byId("id_VendorBox").setVisible(false);
						if (!oThat.oPersonalModel.getData().ColumnsItems[0].visible) {
							oThat.oView.byId("id_InManual").setEnabled(true);
						}
						oThat.oView.byId("id_InManual").setValue("");
						oThat.oView.byId("id_InManual").setMaxLength(10);
						oThat.oView.byId("id_InManual").setShowValueHelp(false);

					}
					//Added on 07/07/22
					if (oThat.oView.getModel("oDisplayModel")) {
						if (vPo[0].SeqNo === '07' && oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "H") {
							oThat.getView().byId("id_RefTb").setVisible(true);
							oThat.getView().byId("id_Rbref").setVisible(true);
						} else if (vPo[0].SeqNo !== '07' && oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "H") {
							oThat.getView().byId("id_RefTb").setVisible(false);
							oThat.getView().byId("id_Rbref").setVisible(false);
						}
					}
					//End of Added
				}
			} else if (vId.indexOf("id_VehicleTy") != -1) {
				oThat.oView.getModel("POST").getData().Vehtyp = vProcess;
			}
			oThat.oView.getModel("POST").refresh(true);

		},

		//Added by Avinash for CFM Transfer
		fnRefChange: function (oEvent) {
			var vItemData = oThat.oView.getModel("POLIST").getData();
			// if (vItemData.length > 0) {
			// 	for (var i = 0; i < vItemData.length; i++) {
			// 		vItemData[i].Config9 = oEvent.getSource().getSelectedIndex() === 0 ? "WOWR" : "WOWO";
			// 	}
			// 	oThat.oView.getModel("POLIST").refresh(true);
			// }
			if (vItemData.length > 0) {
				var vGetIndex = oEvent.getSource().getSelectedIndex();
				var vWarnMsg = oThat.oView.getModel("i18n").getResourceBundle().getText("ListExitsedData");
				sap.m.MessageBox.show(vWarnMsg, {
					icon: sap.m.MessageBox.Icon.WARNING,
					title: oThat.oView.getModel("i18n").getResourceBundle().getText("Warning"),
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction == sap.m.MessageBox.Action.YES) {
							oThat.oView.getModel("POLIST").setData([]);
							oThat.oView.byId("id_InManualCFM").setTokens([]);
							// oThat.oView.byId("id_InManualCFM").setValue("");
							// oThat.oView.byId("id_InMatDoc").setTokens([]);
							if (vGetIndex == 0) {
								oThat.oView.byId("id_InRemarksLabel").setVisible(false);
								oThat.oView.byId("id_InRemarks").setVisible(false);
								// if (oThat.oView.byId("id_InMatDoc").getTokens().length > 0) {
								// }
								oThat.oView.byId("id_InMatDocLabel").setVisible(false);
								oThat.oView.byId("id_InMatDoc").setVisible(false);
								oThat.oView.byId("id_VendorBox").setVisible(true);
							} else {
								oThat.oView.byId("id_InRemarksLabel").setVisible(true);
								oThat.oView.byId("id_InRemarks").setVisible(true);
								oThat.oView.byId("id_InMatDoc").setVisible(false);
								oThat.oView.byId("id_InMatDoc").setVisible(false);
								oThat.oView.byId("id_Vendor").setValue("");
								oThat.getView().getModel("POST").getData().VendorName = "";
								oThat.getView().getModel("POST").refresh(true);
								oThat.oView.byId("id_VendorBox").setVisible(false);
							}
						} else {
							if (vGetIndex == 0) {
								oThat.oView.byId("id_Rbref").setSelectedIndex(1);
							} else {
								oThat.oView.byId("id_Rbref").setSelectedIndex(0);
							}
							if (oThat.oView.byId("id_Rbref").getSelectedIndex() == 0) {
								oThat.oView.byId("id_InRemarksLabel").setVisible(false);
								oThat.oView.byId("id_InRemarks").setVisible(false);
								oThat.oView.byId("id_InMatDocLabel").setVisible(false);
								oThat.oView.byId("id_InMatDoc").setVisible(false);
								oThat.oView.byId("id_VendorBox").setVisible(true);
							} else {
								oThat.oView.byId("id_InRemarksLabel").setVisible(true);
								oThat.oView.byId("id_InRemarks").setVisible(true);
								oThat.oView.byId("id_InMatDoc").setVisible(false);
								oThat.oView.byId("id_InMatDoc").setVisible(false);
								oThat.oView.byId("id_Vendor").setValue("");
								oThat.getView().getModel("POST").getData().VendorName = "";
								oThat.getView().getModel("POST").refresh(true);
								oThat.oView.byId("id_VendorBox").setVisible(false);
							}
							sap.m.MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ActCanc"));
						}
					}
				});
			} else {
				if (oEvent.getSource().getSelectedIndex() === 0) {
					oThat.oView.byId("id_InRemarksLabel").setVisible(false);
					oThat.oView.byId("id_InRemarks").setVisible(false);
					oThat.oView.byId("id_InMatDocLabel").setVisible(false);
					oThat.oView.byId("id_InMatDoc").setVisible(false);
					oThat.oView.byId("id_VendorBox").setVisible(true);
				} else {
					oThat.oView.byId("id_InRemarksLabel").setVisible(true);
					oThat.oView.byId("id_InRemarks").setVisible(true);
					oThat.oView.byId("id_InMatDoc").setVisible(false);
					oThat.oView.byId("id_InMatDoc").setVisible(false);
					oThat.oView.byId("id_Vendor").setValue("");
					oThat.getView().getModel("POST").getData().VendorName = "";
					oThat.getView().getModel("POST").refresh(true);
					oThat.oView.byId("id_VendorBox").setVisible(false);

				}
			}

		},

		onWBChange: function (oEvent) {
			if (oThat.oView.getModel("POST").getData().Wtype == "07" && oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "H") {
				var vListData = oThat.oView.getModel("POLIST").getData();
				if (vListData.length > 0) {
					var vGetState = oEvent.getSource().getState();
					var vWarnMsg = oThat.oView.getModel("i18n").getResourceBundle().getText("ListExitsedData");
					sap.m.MessageBox.show(vWarnMsg, {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: oThat.oView.getModel("i18n").getResourceBundle().getText("Warning"),
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function (oAction) {
							if (oAction == sap.m.MessageBox.Action.YES) {
								oThat.oView.getModel("POLIST").setData([]);
								oThat.oView.byId("id_InManualCFM").setTokens([]);
								// oThat.oView.byId("id_InManual").setValue("");
								if (vGetState == true) {
									oThat.getView().byId("id_Rbref").setVisible(false);
									oThat.getView().byId("id_RefTb").setVisible(false);
								} else {
									oThat.getView().byId("id_Rbref").setVisible(true);
									oThat.getView().byId("id_RefTb").setVisible(true);
								}
							} else {
								oThat.getView().byId("id_Param7Key").setState(!vGetState);
								// oEvent.getSource().setState(!oEvent.getSource().getState());
								sap.m.MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ActCanc"));
							}
						}
					});
				} else {
					if (oEvent.getSource().getState() == true) {
						oThat.getView().byId("id_Rbref").setVisible(false);
						oThat.getView().byId("id_RefTb").setVisible(false);
					} else {
						oThat.getView().byId("id_Rbref").setVisible(true);
						oThat.getView().byId("id_RefTb").setVisible(true);
					}
				}

			}
		},
		//End of Added

		//=================================================================================//
		//============================ Switch Change ======================================//
		//================================================================================//
		onSwitchChange: function (oEvent) {
			// oThat.oView.byId("id_InManual").setVisible(true);
			// oThat.oView.byId("id_InManualCFM").setVisible(false);

			/*New Code CFM VALIDATION  added by nagaraj*/
			var valid = true;
			if (oThat.oView.getModel("POST").getData().Wtype !== "" && oThat.oView.getModel("POST").getData().Werks !== "") {
				if (oThat.SelectedPlant.Param === "H" && oThat.oView.getModel("POST").getData().Gate.trim().length === 0) {
					valid = false;
					oEvent.getSource().setState(true);
					MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("errorGate"));
				}
			}
			/*New Code CFM VALIDATION  END by nagaraj*/
			if (valid) {
				if (oThat.oView.getModel("POST").getData().Wtype !== "" && oThat.oView.getModel("POST").getData().Werks !== "") {
					if (oEvent.getSource().getState() == true) {
						oThat.oView.getModel("VISI").getData().Manual = false;
						oThat.oView.getModel("VISI").getData().QRCode = true;
						oThat.oView.byId("id_WbIdItem").setVisible(false);

						if (oThat.oView.getModel("POST").getData().Wtype == "02" && plantFlag === "X") {
							//	Added by Hafiz to store the value while the swith is turn off
							var oModel = oThat.getView().getModel("POST");
							oModel.setProperty("/Vehno", oThat.oView.getModel("SwitchoffModel").getData().Vehno);
							oModel.setProperty("/Vehtyp", oThat.oView.getModel("SwitchoffModel").getData().Vehtyp);
							oModel.setProperty("/Dname", oThat.oView.getModel("SwitchoffModel").getData().Dname);
							oModel.setProperty("/DriverMob", oThat.oView.getModel("SwitchoffModel").getData().DriverMob);
							oModel.setProperty("/Lifnr", oThat.oView.getModel("SwitchoffModel").getData().Lifnr);
							oModel.setProperty("/LifnrDesc", oThat.oView.getModel("SwitchoffModel").getData().LifnrDesc);
						}

					} else {
						if (oThat.oView.getModel("POST").getData().Wtype == "02" && plantFlag === "X") { // Switch false 
							//	Added by Hafiz to store the value while the swith is turn off
							var ModelJson = {
								"Vehno": oThat.oView.getModel("POST").getData().Vehno,
								"Vehtyp": oThat.oView.getModel("POST").getData().Vehtyp,
								"Dname": oThat.oView.getModel("POST").getData().Dname,
								"DriverMob": oThat.oView.getModel("POST").getData().DriverMob,
								"Lifnr": oThat.oView.getModel("POST").getData().Lifnr,
								'LifnrDesc': oThat.oView.getModel("POST").getData().LifnrDesc
							};
							var oModel = new sap.ui.model.json.JSONModel(ModelJson);
							this.getView().setModel(oModel, "SwitchoffModel"); // end
						}

						if (oThat.oView.getModel("POST").getData().Wtype == "04") {
							if (oThat.oView.getModel("oDisplayModel")) {
								if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "A" ||
									oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "B" ||
									oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "D" ||
									oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "F" ||
									oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "G" ||
									oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "I") {
									oThat.oView.byId("id_WbIdItem").setVisible(true);
									oThat.oView.byId("id_InManual").setMaxLength(12);
								} else {
									oThat.oView.byId("id_WbIdItem").setVisible(false);
								}
							}
						}
						//Added by Avinash - CFM Changes
						else if (oThat.oView.getModel("POST").getData().Wtype == "07" && oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "H") {
							if (oThat.oView.getModel("POLIST").getData().length > 0) {
								oThat.oView.byId("id_InManual").setVisible(false);
								oThat.oView.byId("id_InManualCFM").setVisible(true);
								// if (oThat.oView.getModel("POLIST").getData()[0].Vbeln) {
								// 	oThat.oView.byId("id_InManual").setValue(oThat.oView.getModel("POLIST").getData()[0].Vbeln);
								// } else {
								// 	oThat.oView.byId("id_InManual").setValue(oThat.oView.getModel("POLIST").getData()[0].Pmblnr);
								// }
							}
							//End of Added
						} else {
							oThat.oView.byId("id_WbIdItem").setVisible(false);
							if (oThat.oView.byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text21")) {
								oThat.oView.byId("id_InManual").setMaxLength(18);
							} else {
								oThat.oView.byId("id_InManual").setMaxLength(10);
								oThat.oView.byId("id_InManual").setValue(oThat.oPoNumber); // added by shaik
							}

						}
						oThat.oView.getModel("VISI").getData().Manual = true;
						oThat.oView.getModel("VISI").getData().QRCode = false;
					}
					oThat.oView.getModel("VISI").refresh(true);
				} else {
					MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg17"));
				}
			}
		},
		onSwitchChange1: function (oEvent) {
			if (oEvent.getSource().getState() == true) {
				oThat.vWb = "WB";
			} else {
				oThat.vWb = "WS";
			}
		},
		//=================================================================================//
		//================================= On Save  ======================================//
		//=================================================================================//
		onPressSave: function (oEvent) {
			var aPayLoad = oThat.oView.getModel("POST").getData();
			var vWtype = "";
			var IvWbid = "";
			var IvItem = "";

			var vProcess = oThat.oView.getModel("F4Model").getData().results[0].F4ProcessNav.results.filter(function (obj) {
				return obj.SeqNo == oThat.oView.getModel("POST").getData().Wtype;
			});
			if (vProcess.length != 0) {
				vWtype = vProcess[0].Process;
			}
			try {
				var flag = false;
				if (aPayLoad.Werks == "" || aPayLoad.Werks == undefined) {
					flag = true;
					var err = "MN";
					oThat.oView.byId("id_InPlant").setValueState('Error');
				}
				if (aPayLoad.Gate == "" || aPayLoad.Gate == undefined) {
					flag = true;
					var err = "MN";
					oThat.oView.byId("id_InGate").setValueState('Error');
				}
				if (oThat.SelectedPlant.Param !== "H") {
					if (aPayLoad.Vehno == "" || aPayLoad.Vehno == undefined) {
						flag = true;
						var err = "MN";
						oThat.oView.byId("id_VehiNo").setValueState('Error');
					}
				}
				if (aPayLoad.Dname == "" || aPayLoad.Dname == undefined) {
					flag = true;
					var err = "MN";
					oThat.oView.byId("id_InDriver").setValueState('Error');
				}
				if (aPayLoad.DriverMob == "" || aPayLoad.DriverMob == undefined) {
					flag = true;
					var err = "MN";
					oThat.oView.byId("id_InDriverMob").setValueState('Error');
				}
				if (aPayLoad.Vehtyp == "" || aPayLoad.Vehtyp == undefined) {
					flag = true;
					var err = "MN";
					oThat.oView.byId("id_VehicleTy").setValueState('Error');
					// added by srinivas on 1/07/2025
					oThat.oView.byId("id_VehicleTyCombo").setValueState('Error');
					// ended by srinivas on 1/07/2025

				}

				/*new code added 13/11/24*/
				// if ((vProcess[0].SeqNo == "09" || vProcess[0].SeqNo == "10") && (oThat.oView.getModel("oDisplayModel").getData().EvOrigin =="H")) {
					if (vProcess[0].SeqNo == "09" || vProcess[0].SeqNo == "10")  { // commented above line and replaced to make ref filed global on rgp ngp by srinivas on 19/09/2025
					if (aPayLoad.Config16.trim() === "" || aPayLoad.Config16 == undefined) {
						flag = true;
						var err = "MN";
						oThat.oView.byId("id_InRefNoValue").setValueState('Error');
					} else {
						oThat.oView.byId("id_InRefNoValue").setValueState('None');
					}

				} /*new code added 13/11/24 end*/

				if (vWtype != "TRIP") {
					if (oThat.EvVehGateEntry == 'X') {
						/*commented H validation karthikeyan*/
						//oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "H" || 
						if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin ==
							"L" || oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "J") {

						} /*new code added 4/11/24*/
						// else if ((vProcess[0].SeqNo == "09" || vProcess[0].SeqNo == "10") && (oThat.oView.getModel("oDisplayModel").getData().EvOrigin =="H")) {
	                      else if (vProcess[0].SeqNo == "09" || vProcess[0].SeqNo == "10") { // commented above line and replaced to make ref filed global on rgp ngp by srinivas on 19/09/2025
						} /*new code added 4/11/24 end*/
						else {
							if (oThat.oView.getModel("POLIST").getData().length === 0) {
								var err = "PO";
								throw err;
							}
						}

					}
				}
				if (vWtype == "TRIP") {
					if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "A" ||
						oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "B" ||
						oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "D") {
						if (oThat.oView.getModel("POST").getData().IvWbid == "" ||
							oThat.oView.getModel("POST").getData().IvWbid == undefined ||
							oThat.oView.getModel("POST").getData().IvItem == "" ||
							oThat.oView.getModel("POST").getData().IvItem == undefined) {
							var err = "WB";
							throw err;
						}
					}
					//added by dharma on 16-02-2021
					else if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "C" &&
						oThat.oView.getModel("POST").getData().DONo === "") {
						var err = "DO";
						throw err;
					}

				}
				if (vWtype == "TRANSFER" && oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "H") {
					if (oThat.oView.getModel("POLIST").getData().length == 0) {
						flag = true;
						var err = "NI";
						throw err;
						// MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("NoItemsFound"));
					}
					if (oThat.oView.getModel("POLIST").getData().length > 0) {
						if (oThat.oView.getModel("POLIST").getData()[0].Matnr !== "" && oThat.oView.getModel("POLIST").getData()[0].Pmblnr == "") {
							if (aPayLoad.Lifnr == "" || aPayLoad.Lifnr == undefined) {
								flag = true;
								var err = "MN";
								oThat.oView.byId("id_InTransport").setValueState('Error');
							}
							if (aPayLoad.VendorName == "" || aPayLoad.VendorName == undefined) {
								flag = true;
								var err = "SV";
								oThat.oView.byId("id_Vendor").setValueState('Error');
								throw err;
							}
						}
						if (oThat.oView.byId("id_InRemarks").getVisible()) {
							if (oThat.oView.getModel("POLIST").getData()[0].Remarks == "") {
								flag = true;
								var err = "MN";
								oThat.oView.byId("id_InRemarks").setValueState('Error');
							}
						}
					}
				}
				if (flag == true) {
					var err = "MN";
					throw err;
				} else {
					var vGate = "";
					var vWsGate = "";
					if (oThat.vWb == "WB") {
						vGate = oThat.oView.getModel("POST").getData().Gate;
					} else {
						vWsGate = oThat.oView.getModel("POST").getData().Gate;
					}
					var vIvMatnr = "";
					if (oThat.oView.byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text21")) {
						vIvMatnr = "X";
					} else {
						vIvMatnr = "";
					}
					if (vWtype == "TRANSFER" && oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "H") {
						var oObject = {
							"Werks": oThat.oView.getModel("POST").getData().Werks,
							"Lifnr": oThat.oView.getModel("POST").getData().Lifnr,
							"Gate": vGate,
							"Wsgate": vWsGate,
							"Vehno": oThat.oView.getModel("POST").getData().Vehno,
							"Vehtyp": oThat.oView.getModel("POST").getData().Vehtyp,
							"Dname": oThat.oView.getModel("POST").getData().Dname,
							"DriverMob": oThat.oView.getModel("POST").getData().DriverMob,
							"DriverId": oThat.oView.getModel("POST").getData().DriverNo,
							//	"Remark"		: oThat.oView.getModel("POST").getData().Remarks,
							"Wtype": vWtype,
							"Wbid": "",
							"Erdat": oThat.oView.getModel("POST").getData().Erdat,
							"Ertim": oThat.oView.getModel("POST").getData().Ertim,
							// "Tmode"         : 'MOBILITY',
							"Direction": "IN",
							"Challan": oThat.oView.getModel("POST").getData().Challan, // delivery added for orbit change
							"Token": oThat.oView.getModel("POST").getData().Token, // Reference Wb Id for direct Gate Exit in orbit changes
							"RefWbid": oThat.oView.getModel("POST").getData().Wbid,
							"Config16": oThat.oView.getModel("POST").getData().Config16 || ""
						};
					} else if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "L") { //Added for CFM Port Evacuation Process

						var oObject = {
							"Werks": oThat.oView.getModel("POST").getData().Werks,
							"Lifnr": oThat.oView.getModel("POST").getData().Lifnr,
							"Gate": vGate,
							"Wsgate": vWsGate,
							"Vehno": oThat.oView.getModel("POST").getData().Vehno,
							"Vehtyp": oThat.oView.getModel("POST").getData().Vehtyp,
							"Dname": oThat.oView.getModel("POST").getData().Dname,
							"DriverMob": oThat.oView.getModel("POST").getData().DriverMob,
							"DriverId": oThat.oView.getModel("POST").getData().DriverNo,
							//	"Remark"		: oThat.oView.getModel("POST").getData().Remarks,
							"Wtype": vWtype,
							"Wbid": "",
							"Erdat": oThat.oView.getModel("POST").getData().Erdat,
							"Ertim": oThat.oView.getModel("POST").getData().Ertim,
							// "Tmode"         : 'MOBILITY',
							"Direction": "IN",
							"Challan": oThat.oView.getModel("POST").getData().Challan, // delivery added for orbit change
							"Token": oThat.oView.getModel("POST").getData().Token, // Reference Wb Id for direct Gate Exit in orbit changes
							"RefWbid": oThat.oView.getModel("POST").getData().Wbid,
							"Config16": oThat.oView.getModel("POST").getData().Config16 || ""
						};
					} else {
						var oObject = {
							"Werks": oThat.oView.getModel("POST").getData().Werks,
							"Lifnr": oThat.oView.getModel("POST").getData().Lifnr,
							"Gate": vGate,
							"Wsgate": vWsGate,
							"Vehno": oThat.oView.getModel("POST").getData().Vehno,
							"Vehtyp": oThat.oView.getModel("POST").getData().Vehtyp,
							"Dname": oThat.oView.getModel("POST").getData().Dname,
							"DriverMob": oThat.oView.getModel("POST").getData().DriverMob,
							"DriverId": oThat.oView.getModel("POST").getData().DriverNo,
							//	"Remark"		: oThat.oView.getModel("POST").getData().Remarks,
							"Wtype": vWtype,
							"Wbid": oThat.oView.getModel("POST").getData().Wbid,
							"Erdat": oThat.oView.getModel("POST").getData().Erdat,
							"Ertim": oThat.oView.getModel("POST").getData().Ertim,
							// "Tmode"         : 'MOBILITY',
							"Direction": "IN",
							"Challan": oThat.oView.getModel("POST").getData().Challan, // delivery added for orbit change
							"Token": oThat.oView.getModel("POST").getData().Token, // Reference Wb Id for direct Gate Exit in orbit changes
							"RefWbid": "",
							"Config16": oThat.oView.getModel("POST").getData().Config16 || "",
							//"config5" : oThat.oView.getModel("POST").getData().DSEreference || "" //DSE reference number for spot purchase added by srinivas on 01/07/2025
						};
					}
					//========== param 7 to pass with WB id or without WB id value ==========
					var IvWithoutwb = "";
					if (oThat.oView.byId("id_Param7").getVisible() === true) {
						if (oThat.oView.byId("id_Param7Key").getState() == false) {
							IvWithoutwb = "X";
						}
					}
					//============= added for TRIP process =========//
					if (vWtype == "TRIP") {
						if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "A" ||
							oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "B" ||
							oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "D") {
							IvWbid = oThat.oView.getModel("POST").getData().IvWbid;
							IvItem = oThat.oView.getModel("POST").getData().IvItem;
						}
					}
					//Added by Avinash - CFM Changes
					// if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin === "H") {
					// 	IvWbid = oThat.oView.getModel("POST").getData().IvWbid;
					// 	IvItem = oThat.oView.getModel("POST").getData().IvItem;
					// }
					//End of Added
					var oEntity = {
						"d": {
							"GateEntry": "",
							"VehAssign": "",
							"PreQual": "",
							"UnloadConf": "",
							"GateExit": "",
							"Inbound": "X",
							"Outbound": "",
							"IvWboj": oThat.vWb,
							"IvMatnr": vIvMatnr,
							"IvWithoutwb": IvWithoutwb,
							"IvWbid": IvWbid,
							"TruckReport": "X",
							 "Process" : oThat.getView().byId("id_ComboProcess").getSelectedItem().getText(), // srinivas
					         "ParkingYard" :  oThat.getView().byId("id_ParkingYard").getValue(), // srinivas
							// "IvItem"		: IvItem,
							"PostReturnNav": [],
							"PostWbHeaderNav": [],
							"PostWbitemNav": [],
							"PostWsItemNav": [],
							"PostDmsNav": []
						}
					};
					oEntity.d.PostWbHeaderNav.push(oObject);

					//Added by srinivas on 6.08.2025 for ASN for send attachments in odata call
					//current flow is once wb is generated and then based on wbid docs are posted. for ASN documents needs to send to procon so bypassing to send attchments in same odata call
					if (oThat.Asnnumber) {
						if (oThat.Images.length != 0) {
							//	var DmsPostNav = [];
							oThat.Images.forEach(function (x) {
								oEntity.d.PostDmsNav.push({
									"Dokar": "",
									"Doknr": x.Doknr,
									"Dokvr": "",
									"Doktl": "",
									"Dokob": "",
									"Object": "",
									"Objky": "",
									"Fname": x.Fname,
									"Ftype": x.Ftype,
									"Filename": x.Filename
								});
							});
							//oEntity.d.PostDmsNav.push(DmsPostNav);
						}
					}
					//Ended by srinivas on 6.08.2025 for ASN
					var vVendorFlag = false;
					if (oThat.oView.getModel("POLIST").getData().length != 0) {
						if (vWtype == "TRIP") {
							if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "A" ||
								oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "B" ||
								oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "D") { // senegal grains and Ghana grains
								oEntity.d.PostWbitemNav = oThat.oView.getModel("POLIST").getData();
							}
							if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "C" // cameron rise
							) {
								oEntity.d.PostWbitemNav = oThat.oView.getModel("POLIST").getData();
							}
							//Added for CFM POrt Evacuation Process
							if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "L") {
								oEntity.d.PostWbitemNav.push({
									"Ebeln": oThat.oView.getModel("POLIST").getData()[0].Ebeln,
									"Ebelp": oThat.oView.getModel("POLIST").getData()[0].Ebelp,
									"Matnr": oThat.oView.getModel("POLIST").getData()[0].Matnr,
									"Item": oThat.oView.getModel("POLIST").getData()[0].Item,
									// "Parnr": parnr,
									// "Batch": Batch,
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
									"Vbeln": oThat.oView.getModel("POLIST").getData()[0].Vbeln,
									"Posnr": oThat.oView.getModel("POLIST").getData()[0].posnr,
									"Zeile": "0000",
									// "Config6": oThat.aASNnumber == undefined ? "" : oThat.aASNnumber, // Added by shaik
									// "Config7": "TESTASNREFEFERENCE", // Added by shaik
								});
							}
						}
						//Added for CFM Changes
						else if (vWtype == "TRANSFER" && oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "H") {
							for (var i = 0; i < oThat.oView.getModel("POLIST").getData().length; i++) {
								oThat.oView.getModel("POLIST").getData()[i].Trwgt = "0";
								oThat.oView.getModel("POLIST").getData()[i].Brgew = "0";
								oThat.oView.getModel("POLIST").getData()[i].Ntgew = "0.000";
								oThat.oView.getModel("POLIST").getData()[i].Uom = "";
								oThat.oView.getModel("POLIST").getData()[i].Lgort = "";
								oThat.oView.getModel("POLIST").getData()[i].Config4 = "";
								oThat.oView.getModel("POLIST").getData()[i].Config1 = "";
							}
							oEntity.d.PostWbitemNav = oThat.oView.getModel("POLIST").getData();
						}
						// else if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "L") { //Added for CFM POrt Evacuation Process

						// }
						//End of Added
						else {
							// if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == ""){
							if (oEntity.d.PostWbHeaderNav[0].Token == "" && oThat.oView.getModel("POST").getData().Challan == "") { //==================== orbit changes ===========// 
								oThat.oView.getModel("POLIST").getData().forEach(function (obj) {
									var Ebelp = "00000";
									var posnr = "000000";
									var Ebeln = "";
									var Vbeln = "";
									var parnr = "";
									var Batch = "";
									if (oThat.oView.byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text4")) {
										Ebelp = "00000";
										posnr = obj.Posnr;
										Vbeln = obj.Vbeln;
										parnr = obj.Werks;
										Batch = obj.Charg;
									} else if (oThat.oView.byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text21")) {
										Ebelp = "00000";
										posnr = "000000";
										if (oThat.oView.getModel("POST").getData().Wtype == "05") {
											if (oThat.oView.byId("id_Vendor").getValue() !== "") {
												obj.Parnr = oThat.oView.byId("id_Vendor").getValue();
											} else {
												MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg15"));
												vVendorFlag = true;
												return;
											}
										}
										parnr = obj.Parnr;
									} else {
										posnr = "000000";
										Ebelp = obj.Ebelp;
										Ebeln = obj.Ebeln;
										parnr = obj.Parnr;
									}
									//code changed by kirubakaran for brazil plant on 15.07.2020 to set Nota-Fisical Number//
									if (oThat.oView.getModel("oViewModel").getData().NotaProperty !== true) {
										if (oThat.vWb == "WB") {
											oEntity.d.PostWbitemNav.push({
												"Ebeln": Ebeln,
												"Ebelp": Ebelp,
												"Matnr": obj.Matnr,
												"Item": obj.Item,
												"Parnr": parnr,
												"Batch": Batch,
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
												"Vbeln": Vbeln,
												"Posnr": posnr,
												"Zeile": "0000",
												"Config6": obj.AsnNumber, // Srinivas on 15/07/2025 ASN
												//"Config6": oThat.Asnnumber == undefined ? "" : oThat.Asnnumber, // Srinivas on 15/07/2025 ASN
												// "Config7": "TESTASNREFEFERENCE", // Added by shaik
												"Config5": oThat.oView.getModel("POST").getData().DSEreference || "" ,//DSE reference number for spot purchase added by srinivas on 01/07/2025
												"Config7": oThat.oView.getModel("POST").getData().DSESourceLotNo || "", //DSE source lot no for spot purchase added by srinivas on 19/08/2025
                                            
											});
										} else {
											oEntity.d.PostWsItemNav.push({
												"Vbeln": Vbeln,
												"Matnr": obj.Matnr,
												"Posnr": posnr,
												"Item": obj.Item,
												"Parnr": parnr,
												"Ebelp": Ebelp,
												"Ebeln": Ebeln,
												"Batch": Batch,
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
												"Zeile": "0000",
												// "Config6": oThat.aASNnumber == undefined ? "" : oThat.aASNnumber, // Added by shaik
												// "Config7": "TESTASNREFEFERENCE", // Added by shaik
											});
										}
									} else {
										if (oThat.vWb == "WB") {
											oEntity.d.PostWbitemNav.push({
												"Ebeln": Ebeln,
												"Ebelp": Ebelp,
												"Matnr": obj.Matnr,
												"Item": obj.Item,
												"Parnr": obj.Vendor,
												"Batch": Batch,
												"NF_NUMBER": obj.NF_NUMBER, //kk
												"NF_QUANTITY": obj.NF_QUANTITY,
												"Pmblnr": obj.Charg,
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
												"Vbeln": Vbeln,
												"Posnr": posnr,
												"Zeile": "0000",
												// "Config6": oThat.aASNnumber == undefined ? "" : oThat.aASNnumber, // Added by shaik
												// "Config7": "TESTASNREFEFERENCE", // Added by shaik
											});
										} else {
											oEntity.d.PostWsItemNav.push({
												"Vbeln": Vbeln,
												"Matnr": obj.Matnr,
												"Posnr": posnr,
												"Item": obj.Item,
												"Parnr": parnr,
												"Ebelp": Ebelp,
												"Ebeln": Ebeln,
												"Batch": Batch,
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
												"Zeile": "0000",
												// "Config6": oThat.aASNnumber == undefined ? "" : oThat.aASNnumber, // Added by shaik
												// "Config7": "TESTASNREFEFERENCE", // Added by shaik
											});
										}
									}
									//code ended by kirubakaran for brazil plant on 15.07.2020 to set Nota-Fisical Number//
								});
							}
							//========================== orbit Changes ====================//
							else if (oEntity.d.PostWbHeaderNav[0].Token == "" && oThat.oView.getModel("POST").getData().Challan != "") {

								oThat.oView.getModel("POLIST").getData().forEach(function (obj) {

									var Ebelp = "00000";
									var Ebeln = "";
									var parnr = "";
									var Vbeln = "";
									var Posnr = "000000";

									if (oThat.vWb == "WB") {
										if (oThat.oView.getModel("POST").getData().Wtype == "05") {
											if (oThat.oView.byId("id_Vendor").getValue() !== "") {
												obj.Parnr = oThat.oView.byId("id_Vendor").getValue();
											} else {
												MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg15"));
												vVendorFlag = true;
												return;
											}
										}
										// parnr = obj.Parnr;
										oEntity.d.PostWbitemNav.push({
											"Ebeln": Ebeln,
											"Ebelp": Ebelp,
											"Matnr": obj.Matnr,
											// "Item"		: obj.Item,
											"Parnr": obj.Parnr,
											"Vbeln": Vbeln,
											"Posnr": Posnr,
											"Batch": obj.Charg,
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
											"Zeile": "0000",
											// "Config6": oThat.aASNnumber == undefined ? "" : oThat.aASNnumber, // Added by shaik
											// "Config7": "TESTASNREFEFERENCE", // Added by shaik
										});
									} else {
										if (oThat.oView.getModel("POST").getData().Wtype == "05") {
											if (oThat.oView.byId("id_Vendor").getValue() !== "") {
												obj.Parnr = oThat.oView.byId("id_Vendor").getValue();
											} else {
												MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg15"));
												vVendorFlag = true;
												return;
											}
										}
										oEntity.d.PostWsItemNav.push({
											"Vbeln": Vbeln,
											"Matnr": obj.Matnr,
											"Posnr": Posnr,
											// "Item"		: obj.Item,
											"Parnr": obj.Parnr,
											"Ebelp": Ebelp,
											"Ebeln": Ebeln,
											"Batch": obj.Charg,
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
											"Zeile": "0000",
											// "Config6": oThat.aASNnumber == undefined ? "" : oThat.aASNnumber, // Added by shaik
											// "Config7": "TESTASNREFEFERENCE", // Added by shaik
										});
									}

								});
							} else if (oEntity.d.PostWbHeaderNav[0].Token != "" && oThat.oView.getModel("POST").getData().Challan == "") {
								oThat.oView.getModel("POLIST").getData().forEach(function (obj) {
									if (oThat.vWb == "WB") {
										if (oThat.oView.byId("id_Vendor").getValue() != "" && obj.Parnr == "") {
											obj.Parnr = oThat.oView.byId("id_Vendor").getValue();
										}
										oEntity.d.PostWbitemNav.push(obj);
									} else {
										if (oThat.oView.byId("id_Vendor").getValue() != "" && obj.Parnr == "") {
											obj.Parnr = oThat.oView.byId("id_Vendor").getValue();
										}
										oEntity.d.PostWsItemNav.push(obj);
									}
								});
							}
							// }
						}
						//========================== end of orbit changes =============//
					}
					if (!vVendorFlag) {
						oThat.Service = 'SAVE';
						oThat.onCallService(oThat.Service, oEntity);
					}
				}
			} catch (err) {
				if (err == 'MN') {
					MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg1"));
				} else if (err == 'IM') {
					MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg3"));
				} else if (err == 'PO') {
					MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg13"));
				} else if (err == "WB") {
					MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsgWbIdWbItem"));
				}
				// added by dharma on 16-02-2020
				else if (err == "DO") {
					MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("EnterDoNumber"));
				}
				//ended by dharma on 16-02-2020
				else if (err == "SV") { //Added by Avinash - CFM Changes
					MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("PlSelectVendor"));
				} else if (err == "NI") {
					MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("NoItemsFound"));
				} //End of Added - CFM Changes
			}
		},
		//===================================== Creat Manaul Input ========================//
		onPressClear: function (oEvent) {
			oThat.oView.byId("id_InManual").setValue("");
		},
		//==================================== Get manual data ============================//
		onPressManualQROK: function (oEvent) {
			// var vVlaue = oThat.oView.byId("id_InManual").getValue().toUpperCase(); //Commented by Avinash
			// var vVlaue = oThat.oView.byId("id_InManual").getTokens().length;
			var vErr = false;
			// if (oThat.oView.byId("id_InManual").getTokens().length == 0 && oThat.oView.byId("id_InManual").getValue().trim() == "") {
			// 	vErr = true;
			// }
			if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin === "H" && oThat.getView().getModel("POST").getData().Wtype === "07") {
				if (oThat.oView.byId("id_InManualCFM").getTokens().length == 0) {
					vErr = true;
				}
			} else {
				if (oThat.oView.byId("id_InManual").getValue() == "") {
					vErr = true;
				}
			}
			if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin !== "H") {
				if (oThat.oView.byId("id_InManual").getValue() == "") {
					vErr = true;
				}
			}
			var vVlaue;
			if (oThat.oView.byId("id_InManual").getValue()) {
				vVlaue = oThat.oView.byId("id_InManual").getValue().trim();
			}
			var IvItem = "";
			// if (vVlaue == "") {	//Commented by Avinash
			if (vErr) {
				MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg14"));
			} else {
				var vWtype = "";
				var vProcess = oThat.oView.getModel("F4Model").getData().results[0].F4ProcessNav.results.filter(function (obj) {
					return obj.SeqNo == oThat.oView.getModel("POST").getData().Wtype;
				});
				if (vProcess.length != 0) {
					vWtype = vProcess[0].Process;
				}
				if (vWtype == "TRIP") {
					if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "A" ||
						oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "B" ||
						oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "D" ||
						oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "F" ||
						oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "G" ||
						oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "I") {
						IvItem = oThat.oView.byId("id_WbIdItem").getValue();
					}
				}
				//Added by Avinash CFM Transfer..

				if (vWtype == "TRANSFER" && oThat.oView.getModel("oDisplayModel").getData().EvOrigin === "H") {
					var vMultiTokens = oThat.oView.byId("id_InManualCFM").getTokens();
					// var aDups = [];
					// var aSelectedMatnr = [];
					// aSelectedMatnr = vMultiTokens.filter(function(el) {
					// 	if (aDups.indexOf(el.getKey()) === -1) {
					// 		aDups.push(el.getKey())
					// 		return true;
					// 	}
					// 	return false;
					// });
					var vKey = "";
					if (oThat.oView.byId("id_Param7Key").getState() && oThat.getView().byId("id_Param7").getVisible()) {
						vKey = "WBWR";
					} else {
						if (oThat.getView().byId("id_Rbref").getSelectedIndex() == 0) {
							vKey = "WOWR";
						} else if (oThat.getView().byId("id_Rbref").getSelectedIndex() == 1) {
							vKey = "WOWO";
						}
					}

					oThat.oView.getModel("POLIST").setData([]);
					for (var i = 0; i < vMultiTokens.length; i++) {
						var vObj = {
							Wbid: "",
							Item: "",
							Config1: "",
							Config9: vKey,
							Config4: "",
							Werks: oThat.oView.getModel("POST").getData().Werks,
							Pmblnr: "",
							Parnr: oThat.VendorCFM !== "" ? oThat.VendorCFM : "",
							Matnr: oThat.oView.byId("id_InManualCFM").getTokens()[i].getKey(),
							Remarks: "",
							Gdate: null,
							Gtime: "PT00H00M00S",
							Sgdate: null,
							Sgtime: "PT00H00M00S",
							Tdate: null,
							Ttime: null,
							Stdate: null,
							Sttime: null,
							Ntgew: "0.000",
							Pkwgt: "0.000",
							Menge: "0.000",
							// Pmatno1: "0.000",
							Pmatqty1: "0.000",
							Trwgt1: "0.000",
							// Pmatno2: "0.000",
							Pmatqty2: "0.000",
							Trwgt2: "0.000",
							// Pmatno3: "0.000",
							Pmatqty3: "0.000",
							Trwgt3: "0.000",
							// Pmatno4: "0.000",
							Pmatqty4: "0.000",
							Trwgt4: "0.000",
							Actweight: "0.000",
							Config2: "0.00",
							Config8: "0.00",
						};
						oThat.oView.getModel("POLIST").getData().push(vObj);
					}
					oThat.oView.getModel("POLIST").refresh(true);
					oThat.oView.getModel("VISI").getData().QRCode = true;
					oThat.oView.getModel("VISI").getData().Manual = false;
					oThat.oView.getModel("VISI").refresh(true);
					oThat.oView.byId("id_scanid").setState(true);
				} else {
					// if (vVlaue == "" || vVlaue == undefined) {
					// 	vVlaue = oThat.oView.byId("id_InManual").getTokens()[0].getKey();
					// }
					oThat.onQRValidate(vVlaue, IvItem);
				}
			}
		},

		//Added by Avinash - CFM Transfer Scenario

		onVHremarks: function () {
			oThat.ValueHelpRem = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.RemarksItem", oThat);
			oThat.oView.addDependent(oThat.ValueHelpRem);
			oThat.ValueHelpRem.open();
		},

		fnEnterRemarks: function () {
			var vError = false,
				aArr = [],
				aObj = {},
				that = this;
			aArr = that.getView().getModel("JmRem").getData();
			var vGetRem = sap.ui.getCore().byId("id_RemarksEnt").getValue().trim();
			var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
			var vErrMsg = "";
			var vExist = false;
			for (var i = 0; i < aArr.length; i++) {
				if (aArr[i].Text === vGetRem.toUpperCase()) {
					vExist = true;
					vError = true;
					vErrMsg = oThat.oView.getModel("i18n").getResourceBundle().getText("DuplNotAllowed") + "\n";
					break;
				}
			}
			if (vGetRem == "") {
				vError = true;
				vErrMsg = vErrMsg + oThat.oView.getModel("i18n").getResourceBundle().getText("EntValRem") + "\n";
			}

			if (!vError) {
				// aArr = that.getView().getModel("JmRem").getData();
				aObj = {
					Text: vGetRem.toUpperCase()
				};
				aArr.push(aObj);
				var oJSONModelEm = new sap.ui.model.json.JSONModel();
				oJSONModelEm.setData(aArr);
				that.getView().setModel(oJSONModelEm, "JmRem");
				sap.ui.getCore().byId("id_RemarksEnt").setValue("");
				var vKey = "";
				if (oThat.oView.byId("id_Param7Key").getState() && oThat.getView().byId("id_Param7").getVisible()) {
					vKey = "WBWR";
				} else {
					if (oThat.getView().byId("id_Rbref").getSelectedIndex() == 0) {
						vKey = "WOWR";
					} else if (oThat.getView().byId("id_Rbref").getSelectedIndex() == 1) {
						vKey = "WOWO";
					}
				}
				oThat.oView.getModel("POLIST").setData([]);
				for (var i = 0; i < aArr.length; i++) {
					var vObj = {
						Wbid: "",
						Item: "",
						Config1: "",
						Config9: vKey,
						Config4: "",
						Werks: oThat.oView.getModel("POST").getData().Werks,
						Pmblnr: "",
						Parnr: oThat.VendorCFM !== "" ? oThat.VendorCFM : "",
						Matnr: "",
						Remarks: aArr[i].Text,
						Gdate: null,
						Gtime: "PT00H00M00S",
						Sgdate: null,
						Sgtime: "PT00H00M00S",
						Tdate: null,
						Ttime: null,
						Stdate: null,
						Sttime: null,
						Ntgew: "0.000",
						Pkwgt: "0.000",
						Menge: "0.000",
						// Pmatno1: "0.000",
						Pmatqty1: "0.000",
						Trwgt1: "0.000",
						// Pmatno2: "0.000",
						Pmatqty2: "0.000",
						Trwgt2: "0.000",
						// Pmatno3: "0.000",
						Pmatqty3: "0.000",
						Trwgt3: "0.000",
						// Pmatno4: "0.000",
						Pmatqty4: "0.000",
						Trwgt4: "0.000",
						Actweight: "0.000",
						Config2: "0.00",
						Config8: "0.00",
					};
					oThat.oView.getModel("POLIST").getData().push(vObj);
				}
				oThat.oView.getModel("POLIST").refresh(true);

			} else {
				sap.ui.getCore().byId("id_RemarksEnt").setValue("");
				sap.m.MessageBox.error(vErrMsg);
			}
		},

		handleDelete: function (oEvent) {
			var self, that = this;
			var oList = oEvent.getSource(),
				oItem = oEvent.getParameter("listItem"),
				sPath = oEvent.getParameter("listItem").getBindingContextPath().split("/")[1];
			// var vGetRem = oEvent.getParameter("listItem").getBindingContext("JmRem").getModel().getData()[0].Text;
			var oTabModel = that.getView().getModel("JmRem");
			var oTabData = oTabModel.getData();
			oTabData.splice(sPath, 1);
			oTabModel.refresh(true);
			// var vItemData = oThat.oView.getModel("POLIST").getData();
			var oITabModel = that.getView().getModel("POLIST");
			var oITabData = oITabModel.getData();
			oITabData.splice(sPath, 1);
			oITabModel.refresh(true);
		},

		fnAcceptRem: function () {
			var that = this;
			var aRemdata = this.getView().getModel("JmRem").getData();
			if (aRemdata.length > 0) {
				var vRemValue = "";
				if (aRemdata.length === 1) {
					vRemValue = aRemdata[0].Text;
				}
				if (aRemdata.length > 1) {
					vRemValue = aRemdata[0].Text + " " + " + " + " " + that.getView().getModel("i18n").getProperty("RemMore");
				}
				that.getView().byId("id_InRemarks").setValue(vRemValue);
			}
			this.ValueHelpRem.destroy();
			// else {
			// 	sap.m.MessageToast.show(that.getView().getModel("i18n").getProperty("PlEntRem"));
			// }
		},

		onQRValidateTransfer: function (vWbid, vWbitem) {
			var vProcess = oThat.oView.getModel("F4Model").getData().results[0].F4ProcessNav.results.filter(function (obj) {
				return obj.SeqNo == oThat.oView.getModel("POST").getData().Wtype;
			});
			if (vProcess.length != 0) {
				var vWtype = vProcess[0].Process;
			}
			var vListData = oThat.oView.getModel("POLIST").getData();
			var vSamedata = false;
			if (vListData.length > 0) {
				if (vListData[0].Pmblnr !== "") {
					vSamedata = true;
				}
			}
			if (vListData.length > 0 && !vSamedata) {
				var vWarnMsg = oThat.oView.getModel("i18n").getResourceBundle().getText("ListExitsedData");
				sap.m.MessageBox.show(vWarnMsg, {
					icon: sap.m.MessageBox.Icon.WARNING,
					title: oThat.oView.getModel("i18n").getResourceBundle().getText("Warning"),
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction == sap.m.MessageBox.Action.YES) {
							oThat.oView.getModel("POLIST").setData([]);
							oThat.oView.byId("id_InManualCFM").setTokens([]);
							// oThat.oView.byId("id_InManual").setValue("");
							if (vWtype == "TRANSFER" && oThat.oView.getModel("oDisplayModel").getData().EvOrigin === "H") {
								var afilter = [];
								if (vWbid.length === 10) {
									var oFilter1 = new sap.ui.model.Filter("Mblnr", sap.ui.model.FilterOperator.EQ, "X");
									var oFilter2 = new sap.ui.model.Filter("IvMblnr", sap.ui.model.FilterOperator.EQ, vWbid);
									afilter = [oFilter1, oFilter2];
								}
								if (vWbid.length === 12) {
									var oFilter3 = new sap.ui.model.Filter("WbItem", sap.ui.model.FilterOperator.EQ, "X");
									var oFilter4 = new sap.ui.model.Filter("IvWbId", sap.ui.model.FilterOperator.EQ, vWbid);
									afilter = [oFilter3, oFilter4];
								}
								oThat.BusyDialog.open();
								oThat.oModel.read("/F4ParametersSet", {
									filters: afilter,
									urlParameters: {
										$expand: "F4WbItemNav,ReturnNav,F4MaterialNav"
									},
									success: function (oData, oResp) {
										oThat.BusyDialog.close();
										if (vWbid.length === 12 || vWbid.length === 10) {
											oThat.vWeighBridgeId = vWbid;
											if (oData.results[0].F4WbItemNav.results.length > 0) {
												oThat.oView.setModel(new JSONModel(oData.results[0].F4WbItemNav.results), "oWbItemModel");
												oThat.oView.getModel("oWbItemModel").refresh();
												oThat.oWBItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.WBItemList", oThat);
												oThat.oView.addDependent(oThat.oWBItemFrag);
												oThat.oWBItemFrag.open();
											}
											if (oData.results[0].F4WbItemNav.results.length == 0) {
												var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("NoItems");
												MessageBox.error(vError);
											}
										}
										// if (vWbid.length === 10) {
										// 	if (oData.results[0].ReturnNav.results.length > 0) {
										// 		if (oData.results[0].ReturnNav.results[0].Type == "E") {
										// 			MessageBox.error(oData.results[0].ReturnNav.results[0].Message);
										// 		} else {
										// 			oThat.getView().byId("id_InMatDoc").setVisible(true);
										// 			oThat.getView().byId("id_InMatDocLabel").setVisible(true);
										// 			var oMultiInput1 = oThat.getView().byId("id_InMatDoc");
										// 			var aTokens = oMultiInput1.getTokens();
										// 			var oItems = [];
										// 			var vItem = 1;
										// 			var vTokenv = new sap.m.Token({
										// 				text: vWbid,
										// 				key: vWbid
										// 			});
										// 			aTokens.push(vTokenv);
										// 			var aDups = [];
										// 			var aScannedMatDocs = [];
										// 			aScannedMatDocs = aTokens.filter(function(el) {
										// 				if (aDups.indexOf(el.getKey()) === -1) {
										// 					aDups.push(el.getKey())
										// 					return true;
										// 				}
										// 				return false;
										// 			});
										// 			oMultiInput1.removeAllTokens();
										// 			oMultiInput1.setTokens(aScannedMatDocs);
										// 			var vMatnr = "";
										// 			if (oData.results[0].F4MaterialNav.results.length > 0) {
										// 				vMatnr = oData.results[0].F4MaterialNav.results[0].Matnr;
										// 			}
										// 			var vKey = "";
										// 			if (oThat.oView.byId("id_Param7Key").getState()) {
										// 				vKey = "WBWR";
										// 			} else {
										// 				if (oThat.getView().byId("id_Rbref").getSelectedIndex() == 0) {
										// 					vKey = "WOWR";
										// 				} else if (oThat.getView().byId("id_Rbref").getSelectedIndex() == 1) {
										// 					vKey = "WOWO";
										// 				}
										// 			}

										// 			oThat.oView.getModel("POLIST").setData([]);
										// 			for (var i = 0; i < aScannedMatDocs.length; i++) {
										// 				var vObj = {
										// 					Wbid: "",
										// 					Item: "",
										// 					Config1: "",
										// 					Config9: vKey,
										// 					Config4: "",
										// 					Werks: oThat.oView.getModel("POST").getData().Werks,
										// 					Pmblnr: aScannedMatDocs[i].getKey(),
										// 					Parnr: oThat.VendorCFM !== "" ? oThat.VendorCFM : "",
										// 					Matnr: vMatnr,
										// 					Remarks: "",
										// 					Gdate: null,
										// 					Gtime: "PT00H00M00S",
										// 					Sgdate: null,
										// 					Sgtime: "PT00H00M00S",
										// 					Tdate: null,
										// 					Ttime: null,
										// 					Stdate: null,
										// 					Sttime: null,
										// 					Ntgew: "0.000",
										// 					Pkwgt: "0.000",
										// 					Menge: "0.000",
										// 					// Pmatno1: "0.000",
										// 					Pmatqty1: "0.000",
										// 					Trwgt1: "0.000",
										// 					// Pmatno2: "0.000",
										// 					Pmatqty2: "0.000",
										// 					Trwgt2: "0.000",
										// 					// Pmatno3: "0.000",
										// 					Pmatqty3: "0.000",
										// 					Trwgt3: "0.000",
										// 					// Pmatno4: "0.000",
										// 					Pmatqty4: "0.000",
										// 					Trwgt4: "0.000",
										// 					Actweight: "0.000",
										// 					Config2: "0.00",
										// 					Config8: "0.00",
										// 				};
										// 				oThat.oView.getModel("POLIST").getData().push(vObj);
										// 			}
										// 			oThat.oView.getModel("POLIST").refresh(true);
										// 		}
										// 	}
										// }

									}.bind(this),
									error: function (oError) {
										oThat.BusyDialog.close();
										var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("Title21");
										MessageBox.show(oError.responseText, MessageBox.Icon.ERROR, vError);
									}
								});
							}
						} else {
							sap.m.MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ActCanc"));
						}
					}
				});
			} else {
				if (vWtype == "TRANSFER" && oThat.oView.getModel("oDisplayModel").getData().EvOrigin === "H") {
					var afilter = [];
					if (vWbid.length === 10) {
						var oFilter1 = new sap.ui.model.Filter("Mblnr", sap.ui.model.FilterOperator.EQ, "X");
						var oFilter2 = new sap.ui.model.Filter("IvMblnr", sap.ui.model.FilterOperator.EQ, vWbid);
						afilter = [oFilter1, oFilter2];
					}
					if (vWbid.length === 12) {
						var oFilter3 = new sap.ui.model.Filter("WbItem", sap.ui.model.FilterOperator.EQ, "X");
						var oFilter4 = new sap.ui.model.Filter("IvWbId", sap.ui.model.FilterOperator.EQ, vWbid);
						afilter = [oFilter3, oFilter4];
					}
					oThat.BusyDialog.open();
					oThat.oModel.read("/F4ParametersSet", {
						filters: afilter,
						urlParameters: {
							$expand: "F4WbItemNav,ReturnNav,F4MaterialNav"
						},
						success: function (oData, oResp) {
							oThat.BusyDialog.close();
							if (vWbid.length === 12 || vWbid.length === 10) {
								oThat.vWeighBridgeId = vWbid;
								if (oData.results[0].F4WbItemNav.results.length > 0) {
									oThat.oView.setModel(new JSONModel(oData.results[0].F4WbItemNav.results), "oWbItemModel");
									oThat.oView.getModel("oWbItemModel").refresh();
									oThat.oWBItemFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.WBItemList", oThat);
									oThat.oView.addDependent(oThat.oWBItemFrag);
									oThat.oWBItemFrag.open();
								}
								if (oData.results[0].F4WbItemNav.results.length == 0) {
									var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("NoItems");
									MessageBox.error(vError);
								}
							}
							// if (vWbid.length === 10) {
							// 	if (oData.results[0].ReturnNav.results.length > 0) {
							// 		if (oData.results[0].ReturnNav.results[0].Type == "E") {
							// 			MessageBox.error(oData.results[0].ReturnNav.results[0].Message);
							// 		} else {
							// 			oThat.getView().byId("id_InMatDoc").setVisible(true);
							// 			oThat.getView().byId("id_InMatDocLabel").setVisible(true);
							// 			var oMultiInput1 = oThat.getView().byId("id_InMatDoc");
							// 			var aTokens = oMultiInput1.getTokens();
							// 			var oItems = [];
							// 			var vItem = 1;
							// 			var vTokenv = new sap.m.Token({
							// 				text: vWbid,
							// 				key: vWbid
							// 			});
							// 			aTokens.push(vTokenv);
							// 			var aDups = [];
							// 			var aScannedMatDocs = [];
							// 			aScannedMatDocs = aTokens.filter(function(el) {
							// 				if (aDups.indexOf(el.getKey()) === -1) {
							// 					aDups.push(el.getKey())
							// 					return true;
							// 				}
							// 				return false;
							// 			});
							// 			oMultiInput1.removeAllTokens();
							// 			oMultiInput1.setTokens(aScannedMatDocs);
							// 			var vMatnr = "";
							// 			if (oData.results[0].F4MaterialNav.results.length > 0) {
							// 				vMatnr = oData.results[0].F4MaterialNav.results[0].Matnr;
							// 			}
							// 			var vKey = "";
							// 			if (oThat.oView.byId("id_Param7Key").getState()) {
							// 				vKey = "WBWR";
							// 			} else {
							// 				if (oThat.getView().byId("id_Rbref").getSelectedIndex() == 0) {
							// 					vKey = "WOWR";
							// 				} else if (oThat.getView().byId("id_Rbref").getSelectedIndex() == 1) {
							// 					vKey = "WOWO";
							// 				}
							// 			}

							// 			oThat.oView.getModel("POLIST").setData([]);
							// 			for (var i = 0; i < aScannedMatDocs.length; i++) {
							// 				var vObj = {
							// 					Wbid: "",
							// 					Item: "",
							// 					Config1: "",
							// 					Config9: vKey,
							// 					Config4: "",
							// 					Werks: oThat.oView.getModel("POST").getData().Werks,
							// 					Pmblnr: aScannedMatDocs[i].getKey(),
							// 					Parnr: oThat.VendorCFM !== "" ? oThat.VendorCFM : "",
							// 					Matnr: vMatnr,
							// 					Remarks: "",
							// 					Gdate: null,
							// 					Gtime: "PT00H00M00S",
							// 					Sgdate: null,
							// 					Sgtime: "PT00H00M00S",
							// 					Tdate: null,
							// 					Ttime: null,
							// 					Stdate: null,
							// 					Sttime: null,
							// 					Ntgew: "0.000",
							// 					Pkwgt: "0.000",
							// 					Menge: "0.000",
							// 					// Pmatno1: "0.000",
							// 					Pmatqty1: "0.000",
							// 					Trwgt1: "0.000",
							// 					// Pmatno2: "0.000",
							// 					Pmatqty2: "0.000",
							// 					Trwgt2: "0.000",
							// 					// Pmatno3: "0.000",
							// 					Pmatqty3: "0.000",
							// 					Trwgt3: "0.000",
							// 					// Pmatno4: "0.000",
							// 					Pmatqty4: "0.000",
							// 					Trwgt4: "0.000",
							// 					Actweight: "0.000",
							// 					Config2: "0.00",
							// 					Config8: "0.00",
							// 				};
							// 				oThat.oView.getModel("POLIST").getData().push(vObj);
							// 			}
							// 			oThat.oView.getModel("POLIST").refresh(true);
							// 		}
							// 	}
							// }

						}.bind(this),
						error: function (oError) {
							oThat.BusyDialog.close();
							var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("Title21");
							MessageBox.show(oError.responseText, MessageBox.Icon.ERROR, vError);
						}
					});
				}
			}

		},

		//Added by Avinash
		fnDeleteMatDoc: function (oEvent) {
			var vRemovedToken = oEvent.getParameters().removedTokens[0].getKey();
			var aData = oThat.oView.getModel("POLIST").getData();
			for (var i = 0; i < aData.length; i++) {
				if (aData[i].Pmblnr === vRemovedToken) {
					aData.splice(i, 1);
					break;
				}
			}
			oThat.oView.getModel("POLIST").refresh(true);
		},
		// End of Added
		onCloseWbItem: function (oEvent) {
			// var vSelectedItems =
			var vSelectItems = sap.ui.getCore().byId("id_WBItemsList").getSelectedItems();
			if (vSelectItems.length > 0) {

				if (oThat.vWeighBridgeId.length === 12) {
					var vWbItemdata = [];
					for (var i = 0; i < vSelectItems.length; i++) {
						var vObj = {
							"Item": vSelectItems[i].getBindingContext("oWbItemModel").getObject().Item,
							"Pmblnr": vSelectItems[i].getBindingContext("oWbItemModel").getObject().Pmblnr,
							"Matnr": vSelectItems[i].getBindingContext("oWbItemModel").getObject().Matnr,
							"Remarks": vSelectItems[i].getBindingContext("oWbItemModel").getObject().Remarks
						};
						vWbItemdata.push(vObj);
					}
					oThat.fnGetWbItemDetails(oThat.vWeighBridgeId, vWbItemdata);
				} else {
					var vWbItemdata = [];
					for (var i = 0; i < vSelectItems.length; i++) {
						var vObj = {
							"Zeile": vSelectItems[i].getBindingContext("oWbItemModel").getObject().Item,
							"Pmblnr": vSelectItems[i].getBindingContext("oWbItemModel").getObject().Pmblnr,
							"Matnr": vSelectItems[i].getBindingContext("oWbItemModel").getObject().Matnr,
							"Remarks": vSelectItems[i].getBindingContext("oWbItemModel").getObject().Remarks,
							"Item": ""
						};
						vWbItemdata.push(vObj);
					}
					var vListData = oThat.oView.getModel("POLIST").getData();
					if (vListData.length == 0) {
						var vZeile = 0;
						for (var i = 0; i < vWbItemdata.length; i++) {
							vZeile = Number(vZeile) + 1;
							vWbItemdata[i].Item = vZeile.toString().padStart("5", "0");
						}
					} else {
						vListData.sort(function (a, b) {
							return Number(b.Item) - Number(a.Item);
						});
						var vZeile = Number(vListData[0].Item);
						for (var i = 0; i < vWbItemdata.length; i++) {
							vZeile = Number(vZeile) + 1;
							vWbItemdata[i].Item = vZeile.toString().padStart("5", "0");
						}
					}
					var vKey = "";
					if (oThat.oView.byId("id_Param7Key").getState() && oThat.getView().byId("id_Param7").getVisible()) {
						vKey = "WBWR";
					} else {
						if (oThat.getView().byId("id_Rbref").getSelectedIndex() == 0) {
							vKey = "WOWR";
						} else if (oThat.getView().byId("id_Rbref").getSelectedIndex() == 1) {
							vKey = "WOWO";
						}
					}
					// oThat.oView.getModel("POLIST").setData([]);
					for (var i = 0; i < vWbItemdata.length; i++) {
						var vObj = {
							Wbid: "",
							Item: vWbItemdata[i].Item,
							Config1: "",
							Config9: vKey,
							Config4: "",
							Werks: oThat.oView.getModel("POST").getData().Werks,
							Pmblnr: vWbItemdata[i].Pmblnr,
							Zeile: (Number(vWbItemdata[i].Zeile)).toString().padStart("4", "0"),
							Parnr: oThat.VendorCFM !== "" ? oThat.VendorCFM : "",
							Matnr: vWbItemdata[i].Matnr,
							Remarks: "",
							Gdate: null,
							Gtime: "PT00H00M00S",
							Sgdate: null,
							Sgtime: "PT00H00M00S",
							Tdate: null,
							Ttime: null,
							Stdate: null,
							Sttime: null,
							Ntgew: "0.000",
							Pkwgt: "0.000",
							Menge: "0.000",
							// Pmatno1: "0.000",
							Pmatqty1: "0.000",
							Trwgt1: "0.000",
							// Pmatno2: "0.000",
							Pmatqty2: "0.000",
							Trwgt2: "0.000",
							// Pmatno3: "0.000",
							Pmatqty3: "0.000",
							Trwgt3: "0.000",
							// Pmatno4: "0.000",
							Pmatqty4: "0.000",
							Trwgt4: "0.000",
							Actweight: "0.000",
							Config2: "0.00",
							Config8: "0.00",
						};
						oThat.oView.getModel("POLIST").getData().push(vObj);
					}
					oThat.oView.getModel("POLIST").refresh(true);

				}
				oThat.oWBItemFrag.destroy();
			} else {
				var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("MiniOneItem");
				MessageBox.error(vError);
			}
		},

		fnGetWbItemDetails: function (vWbid, vWbItemdata) {
			// var vWbItemdata = oThat.oView.getModel("oWbItemModel").getData();
			var vWbItemNav = [];

			for (var i = 0; i < vWbItemdata.length; i++) {
				var vObj = {
					"Wbid": vWbid.length === 12 ? vWbid : "",
					"Item": vWbid.length === 12 ? vWbItemdata[i].Item : "", //WB Item Number(From OutBound Ticket reference)
					"Zeile": vWbid.length === 10 ? vWbItemdata[i].Item : "", //Mat. Doc Item
					"Pmblnr": vWbItemdata[i].Pmblnr,
					"Matnr": vWbItemdata[i].Matnr,
					"Remarks": vWbItemdata[i].Remarks
				};
				vWbItemNav.push(vObj);
			}
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
					"TruckReport": "X",
					"IvPo": "",
					"IvWbid": vWbid.length === 12 ? vWbid : "",
					"Pmblnr": vWbid.length === 10 ? vWbid : "",
					"IvItem": "",
					"IvWerks": oThat.oView.getModel("POST").getData().Werks,
					"IvMatnr": "",
					"Transfer": "",
					"IvCharg": "",
					"DelItemNav": [],
					"FifoWbidNav": [],
					"GetReturnNav": [],
					"PoItemNav": [],
					"QualWbidNav": [],
					"WbItemNav": vWbItemNav,
					"WsItemNav": [],
					"WbHeaderNav": []
				}
			};
			oThat.BusyDialog.open();
			oThat.oModel.create("/GetHeadersSet", oEntity, {
				success: function (oData, oResp) {
					oThat.BusyDialog.close();
					var aError = oData.GetReturnNav.results.filter(function (x) {
						if (x.Type == 'E') {
							return x;
						}
					});
					var msg = "";
					if (aError != 0) {
						for (var i = 0; i < aError.length; i++) {
							msg = msg + "\n" + aError[0].Message;

						}
						MessageBox.error(msg);
					} else {
						//Added by Avinash - CFM Changes
						oThat.oView.byId("id_InManual").setValue("");
						oThat.oView.byId("id_WbIdItem").setValue("");
						oThat.oView.getModel("POST").getData().IvWbid = oData.IvWbid;
						oThat.oView.getModel("POST").getData().IvItem = oData.IvItem;
						oThat.oView.getModel("POST").getData().Vehtyp = oData.WbHeaderNav.results[0].Vehtyp;
						oThat.oView.getModel("POST").getData().Dname = oData.WbHeaderNav.results[0].Dname;
						oThat.oView.getModel("POST").getData().DriverMob = oData.WbHeaderNav.results[0].DriverMob;
						oThat.oView.getModel("POST").getData().Vehno = oData.WbHeaderNav.results[0].Vehno;
						oThat.oView.getModel("POST").getData().Lifnr = oData.WbHeaderNav.results[0].Lifnr;
						oThat.oView.getModel("POST").getData().Wbname = oData.WbHeaderNav.results[0].GateName;
						oThat.oView.getModel("POST").getData().LifnrDesc = oData.WbHeaderNav.results[0].LifnrName;
						oThat.oView.getModel("POST").getData().Challan = oData.WbHeaderNav.results[0].Challan;
						oThat.oView.getModel("POST").getData().Token = oData.WbHeaderNav.results[0].Token;
						oThat.oView.getModel("POST").getData().Wbid = oData.WbHeaderNav.results[0].Wbid;
						// oThat.TransferRemark = oData.WbHeaderNav.results[0].Remark;
						if (oData.WbHeaderNav.results[0].Gate != "") {
							oThat.vWb = "WB";
							oThat.oView.getModel("POST").getData().Gate = oData.WbHeaderNav.results[0].Gate;
						}
						if (oData.WbHeaderNav.results[0].Wsgate != "") {
							oThat.vWb = "WS";
							oThat.oView.getModel("POST").getData().Gate = oData.WbHeaderNav.results[0].Wsgate;
						}
						if (oData.WbHeaderNav.results[0].Dname !== "" && oData.WbHeaderNav.results[0].Dname !== undefined) {
							oThat.oView.byId("id_InDriver").setValueState('None');
						}
						if (oData.WbHeaderNav.results[0].DriverMob !== "" && oData.WbHeaderNav.results[0].DriverMob !== undefined) {
							oThat.oView.byId("id_InDriverMob").setValueState('None');
						}
						if (oData.WbHeaderNav.results[0].Vehtyp !== "" && oData.WbHeaderNav.results[0].Vehtyp !== undefined) {
							oThat.oView.byId("id_VehicleTy").setValueState('None');
						}
						if (oData.WbHeaderNav.results[0].Vehno !== "" && oData.WbHeaderNav.results[0].Vehno !== undefined) {
							oThat.oView.byId("id_VehiNo").setValueState('None');
						}
						oThat.oView.getModel("POLIST").setData(oData.WbItemNav.results);
						oThat.oView.getModel("POLIST").refresh();
						oThat.oView.getModel("POST").refresh(true);
						if (oData.WbItemNav.results.length > 0) {
							if (oData.WbItemNav.results[0].Parnr) {
								oThat.oView.byId("id_Vendor").setValue(oData.WbItemNav.results[0].Parnr);
								oThat.oView.byId("vTextId").setText(oData.WbItemNav.results[0].Name1);
							}
							if (oData.WbItemNav.results[0].Config9 == "WBWR") {
								oThat.getView().byId("id_Param7Key").setState(true);
							} else {
								oThat.getView().byId("id_Param7Key").setState(false);
								oThat.getView().byId("id_Rbref").setVisible(true);
								oThat.getView().byId("id_RefTb").setVisible(true);
								if (oData.WbItemNav.results[0].Config9 == "WOWR") {
									oThat.getView().byId("id_Rbref").setSelectedIndex(0);
								} else {
									oThat.getView().byId("id_Rbref").setSelectedIndex(1);
								}
							}
							var aPmblnr = [];
							var aRemarks = [];
							for (var i = 0; i < oData.WbItemNav.results.length; i++) {
								if (oData.WbItemNav.results[0].Pmblnr !== "") {
									aPmblnr.push(oData.WbItemNav.results[i]);
								}
								if (oData.WbItemNav.results[0].Remarks !== "") {
									aRemarks.push(oData.WbItemNav.results[i]);
								}
							}
							if (oData.WbItemNav.results[0].Pmblnr !== "") {
								oThat.getView().byId("id_InMatDoc").setVisible(true);
								oThat.getView().byId("id_InMatDocLabel").setVisible(true);
								var aMultiToken = oThat.getView().byId("id_InMatDoc");
								var aTokens = aMultiToken.getTokens();
								for (var i = 0; i < aPmblnr.length; i++) {
									var vTokenv = new sap.m.Token({
										text: aPmblnr[i].Pmblnr,
										key: aPmblnr[i].Pmblnr
									});
									aTokens.push(vTokenv);
								}
								aMultiToken.removeAllTokens();
								aMultiToken.setTokens(aTokens);
							}
							if (oData.WbItemNav.results[0].Remarks !== "") {
								oThat.getView().byId("id_InRemarksLabel").setVisible(true);
								oThat.getView().byId("id_InRemarks").setVisible(true);
								var aArr = [];
								var aObj = {};
								for (var i = 0; i < aRemarks.length; i++) {
									aObj = {
										Text: aRemarks[i].Remarks
									};
									aArr.push(aObj);
								}
								var oJSONModelEm = new sap.ui.model.json.JSONModel();
								oJSONModelEm.setData(aArr);
								oThat.getView().setModel(oJSONModelEm, "JmRem");
								if (aArr.length === 1) {
									oThat.getView().byId("id_InRemarks").setValue(aArr[0].Text);
								} else {
									var vRemValue = aArr[0].Text + " " + " + " + " " + oThat.getView().getModel("i18n").getProperty("RemMore");
									oThat.getView().byId("id_InRemarks").setValue(vRemValue);
								}
							}

						}
					}
				}.bind(this),
				error: function (oError) {
					oThat.BusyDialog.close();
					var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("Title21");
					MessageBox.show(oError.responseText, MessageBox.Icon.ERROR, vError);
				}
			});

		},
		//End of Added
		//=================================== Validate on PO/Delivery/MAterial ======================================//
		onQRValidate: function (vVlaue, vWbitem) {

			var vIvMatnr = "";
			var vVbeln = "";
			var vEbeln = "";
			var vWtype = "";
			var IvWbid = "";
			var IvItem = "";
			var Config10 = "";
			var vProcess = oThat.oView.getModel("F4Model").getData().results[0].F4ProcessNav.results.filter(function (obj) {
				return obj.SeqNo == oThat.oView.getModel("POST").getData().Wtype;
			});
			if (vProcess.length != 0) {
				vWtype = vProcess[0].Process;
			}
			if (vWtype == "TRIP") {
				if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "A" ||
					oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "B" ||
					oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "D") {
					IvWbid = vVlaue;
					IvItem = vWbitem;
				} else if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "C") {
					Config10 = vVlaue;
				}
				//Added by Avinash for GH and MZ - 14/07/2021
				else if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "F" || oThat.oView.getModel("oDisplayModel").getData().EvOrigin ==
					"G" || oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "I" || oThat.oView.getModel("oDisplayModel").getData().EvOrigin ==
					"M") { //Added for CFM POrt Evacuation Process
					IvWbid = vVlaue;
					IvItem = vWbitem;
				} else if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "L" || oThat.oView.getModel("oDisplayModel").getData().EvOrigin ==
					"H" || oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "J") {
					IvWbid = '';
					IvItem = '';
					vVbeln = vVlaue;
				}
			} else {
				if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "H" && vWtype == "TRANSFER") { //By Avinash for CFM Transfer...
					IvWbid = vVlaue;
					IvItem = vWbitem;
				} else if (oThat.oView.byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text21")) {
					if (vWtype == "TRANSFER") {
						vIvMatnr = "";
					} else {
						vIvMatnr = "X";
					}
				} else {
					vIvMatnr = "";
				}

				if (oThat.oView.byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text4")) {

					vVbeln = vVlaue;
					// }
				}
				if (oThat.oView.byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text3")) {
					vEbeln = vVlaue;
				}
			}
			if (vWtype == "TRANSFER" && oThat.oView.getModel("oDisplayModel").getData().EvOrigin !== "H") {
				var oEntity = {
					"d": {
						"GateEntry": "",
						"VehAssign": "",
						"PreQual": "",
						"UnloadConf": "",
						"GateExit": "",
						"Inbound": "X",
						"Outbound": "",
						"TruckReport": "X",
						"IvDelivery": vVbeln,
						"IvPo": vEbeln,
						"IvWbid": IvWbid,
						"IvItem": IvItem,
						"IvWerks": oThat.oView.getModel("POST").getData().Werks,
						"IvMatnr": vIvMatnr,
						"Transfer": "X",
						"IvCharg": vVlaue,
						"DelItemNav": [],
						"FifoWbidNav": [],
						"GetReturnNav": [],
						"PoItemNav": [],
						"QualWbidNav": [],
						"WbItemNav": [],
						"WsItemNav": [],
						"WbHeaderNav": [],
						"IvGate": oThat.oView.getModel("POST").getData().Gate,
					}
				};
			} else if (vWtype == "RETURN") {
				var oEntity = {
					"d": {
						"GateEntry": "",
						"VehAssign": "",
						"PreQual": "",
						"UnloadConf": "",
						"GateExit": "",
						"Inbound": "X",
						"Outbound": "",
						"TruckReport": "X",
						"IvDelivery": vVbeln,
						"IvPo": vEbeln,
						"IvWbid": IvWbid,
						"IvItem": IvItem,
						"IvWerks": oThat.oView.getModel("POST").getData().Werks,
						"IvMatnr": vIvMatnr,
						"SalesRet": "X",
						"Transfer": "",
						"IvCharg": "",
						"DelItemNav": [],
						"FifoWbidNav": [],
						"GetReturnNav": [],
						"PoItemNav": [],
						"QualWbidNav": [],
						"WbItemNav": [],
						"WsItemNav": [],
						"WbHeaderNav": [],
						"IvGate": oThat.oView.getModel("POST").getData().Gate,
					}
				};
			} else if (vWtype == "TRANSFER" && oThat.oView.getModel("oDisplayModel").getData().EvOrigin === "H") { //Added by Avinash - CFM Changes
				var oEntity = {
					"d": {
						"GateEntry": "",
						"VehAssign": "",
						"PreQual": "",
						"UnloadConf": "",
						"GateExit": "",
						"Inbound": "X",
						"Outbound": "",
						"TruckReport": "X",
						"IvDelivery": vVbeln,
						"IvPo": vEbeln,
						"IvWbid": IvWbid,
						"IvItem": IvItem,
						"IvWerks": oThat.oView.getModel("POST").getData().Werks,
						"IvMatnr": vIvMatnr,
						"Transfer": "",
						"IvCharg": "",
						"DelItemNav": [],
						"FifoWbidNav": [],
						"GetReturnNav": [],
						"PoItemNav": [],
						"QualWbidNav": [],
						"WbItemNav": [],
						"WsItemNav": [],
						"WbHeaderNav": [],
						"IvGate": oThat.oView.getModel("POST").getData().Gate,
					}
				}; //End of Added
			} else {
				var oEntity = {
					"d": {
						"GateEntry": "",
						"VehAssign": "",
						"PreQual": "",
						"UnloadConf": "",
						"GateExit": "",
						"Inbound": "X",
						"Outbound": "",
						"TruckReport": "X",
						"IvDelivery": vVbeln,
						"IvPo": vEbeln,
						"IvWbid": IvWbid,
						"IvItem": IvItem,
						"IvWerks": oThat.oView.getModel("POST").getData().Werks,
						"IvMatnr": vIvMatnr,
						"Transfer": "",
						"IvCharg": "",
						"DelItemNav": [],
						"FifoWbidNav": [],
						"GetReturnNav": [],
						"PoItemNav": [],
						"QualWbidNav": [],
						"WbItemNav": [],
						"WsItemNav": [],
						"WbHeaderNav": [],
						"IvGate": oThat.oView.getModel("POST").getData().Gate,
					}
				};
				oEntity.d.WbHeaderNav.push({
					"Wtype": vWtype
				});
			}
			if (vWtype !== "TRANSFER") {
				if (vWtype !== "TRIP") {
					if (oThat.oView.byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text4")) {
						oEntity.d.DelItemNav.push({
							"Vbeln": vVlaue
						});
					} else if (oThat.oView.byId("id_POBtn").getText() === oThat.oView.getModel("i18n").getResourceBundle().getText("Text21")) {
						//Added by Avinash
						// var vMultiTokens = oThat.oView.byId("id_InManual").getTokens();
						// 	for (var i = 0; i < vMultiTokens.length; i++) {
						// 	oEntity.d.PoItemNav.push({
						// 		"Matnr": oThat.oView.byId("id_InManual").getTokens()[i].getKey(),
						// 		"Vendor": oThat.oView.byId("id_Vendor").getValue()
						// 	});
						// }
						//End of Added
						oEntity.d.PoItemNav.push({
							"Matnr": vVlaue,
							"Vendor": oThat.oView.byId("id_Vendor").getValue()
						});
					} else {
						oEntity.d.PoItemNav.push({
							"Ebeln": vVlaue
						});
					}
				} else if (vWtype == "TRIP") {
					if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin == "C") {
						oEntity.d.WbItemNav.push({
							"Config10": Config10
						});
					}
				}
			}
			oThat.Service = 'VALIDATE';
			oThat.onCallService(oThat.Service, oEntity);
		},
		//=================================================================================//
		onOpenPOList: function () {
			var vWtype = "";
			var vProcess = oThat.oView.getModel("F4Model").getData().results[0].F4ProcessNav.results.filter(function (obj) {
				return obj.SeqNo == oThat.oView.getModel("POST").getData().Wtype;
			});
			if (vProcess.length != 0) {
				vWtype = vProcess[0].Process;
			}
			if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin === "H" && vWtype === "TRANSFER") {
				oThat.MatDocList = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.MatDocList", oThat);
				oThat.oView.addDependent(oThat.MatDocList);
				oThat.MatDocList.open();
			} else {
				oThat.POList = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PoList", oThat);
				oThat.oView.addDependent(oThat.POList);
				oThat.POList.open();
			}
		},
		onClosePoList: function () {
			oThat.POList.destroy();
		},
		onCloseMatDoc: function () {
			oThat.MatDocList.destroy();
		},
		//==========================get  Vehicl no data  =================================//
		onSubmitVehicleNo: function (oEvent) {
			var vVehNo = "";
			vVehNo = oEvent.getSource().getValue();
			var vWtype = "";
			var vProcess = oEvent.getSource().getModel("F4Model").getData().results[0].F4ProcessNav.results.filter(function (obj) {
				return obj.SeqNo == oThat.oView.getModel("POST").getData().Wtype;
			});
			if (vProcess.length != 0) {
				vWtype = vProcess[0].Process;
			}
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
					"IvPrint": "",
					"EvXstring": "",
					"TruckReport": "X",
					"WbHeaderNav": [{
						"Vehno": vVehNo,
						"Wtype": vWtype,
						"Werks": oThat.oView.getModel("POST").getData().Werks,
						"Lifnr": oThat.oView.getModel("POST").getData().Lifnr,
						"Vehtyp": oThat.oView.getModel("POST").getData().Vehtyp,
						"Dname": oThat.oView.getModel("POST").getData().Dname,
						"DriverMob": oThat.oView.getModel("POST").getData().DriverMob,
						"Wbid": oThat.oView.getModel("POST").getData().Wbid,
						"Erdat": oThat.oView.getModel("POST").getData().Erdat,
						"Ertim": oThat.oView.getModel("POST").getData().Ertim,
						"Challan": oThat.oView.getModel("POST").getData().Challan, // delivery added for orbit change
						"Token": oThat.oView.getModel("POST").getData().Token // Reference Wb Id for direct Gate Exit in orbit changes

					}],
					"GetReturnNav": []

				}
			};
			if (oThat.oView.getModel("POST").getData().Werks != "") {
				oThat.Service = 'VEHICLE';
				oThat.onCallService(oThat.Service, oEntity);
			} else {
				oThat.oView.getModel("POST").getData().Vehno = "";
				oThat.oView.getModel("POST").refresh();
				MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("Plant_Mandatory"));
			}

		},
		onSave: function () {
			var vVehNo = "";
			vVehNo = oThat.oView.getModel("POST").getData().Vehno;

			//Added by srinivas on 01/07/2025
			if (oThat.getView().byId("id_VehicleTyCombo").getValue()) {
				oThat.oView.getModel("POST").getData().Vehtyp = oThat.getView().byId("id_VehicleTyCombo").getValue();
			}
			// end by Srinivas

			var vWtype = "";
			// Added by shaik hedayathullah -- start
			if (!oThat.getView().byId('id_ComboProcess').getProperty("visible")) {
				oThat.oView.getModel("POST").getData().Wtype = "04";
			}
			// Added by shaik hedayathullah -- end
			var vProcess = oThat.oView.getModel("F4Model").getData().results[0].F4ProcessNav.results.filter(function (obj) {
				return obj.SeqNo == oThat.oView.getModel("POST").getData().Wtype;
			});

			if (vProcess.length != 0) {
				vWtype = vProcess[0].Process;
			}
			if (oThat.SelectedPlant.ImgFlag != "") {
				if (!oThat.Asnnumber && !oThat.oAsnHeaderData) { // added only if contion for ASN to bypass attachments for ASN by srinivas on 16/07/2025
					if (oThat.getView().getModel("MASS").getData().length == 0) {
						MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorAttachment"));
						return;
					}
				}


			} else {

			}
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
					"IvPrint": "",
					"EvXstring": "",
					"TruckReport": "X",
					"WbHeaderNav": [{
						"Vehno": vVehNo,
						"Wtype": vWtype,
						"Werks": oThat.oView.getModel("POST").getData().Werks,
						"Lifnr": oThat.oView.getModel("POST").getData().Lifnr,
						"Vehtyp": oThat.oView.getModel("POST").getData().Vehtyp.substr(0, 15),
						"Dname": oThat.oView.getModel("POST").getData().Dname,
						"DriverMob": oThat.oView.getModel("POST").getData().DriverMob,
						"Wbid": oThat.oView.getModel("POST").getData().Wbid,
						"Erdat": oThat.oView.getModel("POST").getData().Erdat,
						"Ertim": oThat.oView.getModel("POST").getData().Ertim,
						"Challan": oThat.oView.getModel("POST").getData().Challan, // delivery added for orbit change
						"Token": oThat.oView.getModel("POST").getData().Token // Reference Wb Id for direct Gate Exit in orbit changes

					}],
					"GetReturnNav": []

				}
			};
			if (oThat.oView.getModel("POST").getData().Werks != "") {
				if (vWtype === "TRIP") {
					oThat.onPressSave();
				} else {
					oThat.Service = 'VEHICLEVALIDATE';
					oThat.onCallService(oThat.Service, oEntity);
				}
			} else {
				oThat.oView.getModel("POST").getData().Vehno = "";
				oThat.oView.getModel("POST").refresh();
				MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("Plant_Mandatory"));
			}


		},
		//============================ Print =====================//
		onPressPrint: function () {
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
					"IvPrint": "X",
					"EvXstring": "",
					"TruckReport": "X",
					"WbHeaderNav": oThat.oView.getModel("RETURN").getData().PostWbHeaderNav.results,
					"GetReturnNav": []
				}
			};
			oThat.Service = "PDF";
			oThat.onCallService(oThat.Service, oEntity);
		},
		initiatePdfDialog: function () {
			// var that = this;
			oThat.oImageDialog = new sap.m.Dialog({
				title: 'PDF',
				contentWidth: "100%",
				contentHeight: "",
				content: new sap.ui.core.HTML({}),
				beginButton: new sap.m.Button({
					text: 'Close',
					class: "sapUiSizeCompact",
					press: function () {
						oThat.oImageDialog.close();
					}
				})
			});
		},
		//=================================================================================//
		//====================== Nav back =================================================//
		//=================================================================================//
		onNavBack: function (oEvent) {
			if (oThat.oView.getModel("VISI").getData().Manual === true) {
				oThat.oView.getModel("VISI").getData().QRCode = true;
				oThat.oView.getModel("VISI").getData().Manual = false;
				oThat.oView.getModel("VISI").refresh(true);
				oThat.oView.byId("id_scanid").setState(true);
			} else {
				var aPayLoad = oThat.oView.getModel("POST").getData();
				try {
					var flag = false;
					if (aPayLoad.Werks !== "") {
						flag = true;
					}
					if (aPayLoad.Gate !== "") {
						flag = true;
					}
					if (aPayLoad.Vehno !== "") {
						flag = true;
					}
					if (aPayLoad.Dname !== "") {
						flag = true;
					}
					if (aPayLoad.DriverMob !== "") {
						flag = true;
					}
					if (aPayLoad.Vehtyp !== "") {
						flag = true;
					}
					if (flag == true) {
						throw flag;
					} else {
						oThat.oView.setModel(new JSONModel({}), "oDisplayModel"); //Added by Avinash
						oThat.oRouter.navTo("Inbound");
					}
				} catch (err) {
					MessageBox.show(oThat.oView.getModel("i18n").getResourceBundle().getText("Msg3"), {
						icon: MessageBox.Icon.INFORMATION,
						title: oThat.oView.getModel("i18n").getResourceBundle().getText("Title16"),
						actions: [MessageBox.Action.YES, MessageBox.Action.NO],
						onClose: function (oAction) {
							if (oAction === 'YES') {
								oThat.oView.setModel(new JSONModel({}), "oDisplayModel"); //Added by Avinash
								oThat.oRouter.navTo("Inbound");
							}
						}
					});

				}
			}

			/*Code Added by Hafiz 09-08-2021*/
			if (oThat.oView.getModel("POST").getData().Wtype == "02" && plantFlag === "X") {
				//	Added by Hafiz to store the value while the swith is turn off
				var oModel = oThat.getView().getModel("POST");
				oModel.setProperty("/Vehno", oThat.oView.getModel("SwitchoffModel").getData().Vehno);
				oModel.setProperty("/Vehtyp", oThat.oView.getModel("SwitchoffModel").getData().Vehtyp);
				oModel.setProperty("/Dname", oThat.oView.getModel("SwitchoffModel").getData().Dname);
				oModel.setProperty("/DriverMob", oThat.oView.getModel("SwitchoffModel").getData().DriverMob);
				oModel.setProperty("/Lifnr", oThat.oView.getModel("SwitchoffModel").getData().Lifnr);
				oModel.setProperty("/LifnrDesc", oThat.oView.getModel("SwitchoffModel").getData().LifnrDesc);
			}

		},

		onClosePoIteListCopy: function (oEvent) {
			//oThat.oView.getModel("oDisplayModel").getData().EvOrigin !== "H" &&	//Removed by Pavan on 22/03/2023 from the below If condition
			if (oThat.oView.getModel("oDisplayModel").getData().EvOrigin !== "L" && oThat.oView.getModel("oDisplayModel").getData().EvOrigin !==
				"J") {
				MessageBox.show(oThat.oView.getModel("i18n").getResourceBundle().getText("ConfirmMsg1"), {
					icon: MessageBox.Icon.INFORMATION,
					title: oThat.oView.getModel("i18n").getResourceBundle().getText("Title16"),
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction === 'YES') {
							var vSelectItems = sap.ui.getCore().byId("id_PoItemList").getSelectedItems();
							//code added by kirubakaran for brazil plant on 15.07.2020 to set Nota-Fisical Number//
							if (oThat.oView.getModel("oViewModel").getData().NotaProperty === true) {
								var QtyData = vSelectItems[0].getBindingContext("oPoitemModel").getObject().Menge;
								var notaNo = sap.ui.getCore().byId("notanoId").getValue();
								var notaQua = sap.ui.getCore().byId("notaQId").getValue();
								var bagQty = sap.ui.getCore().byId("bagQty").getValue();
								if (oThat.oView.getModel("oViewModel").getData().CMSProperty === true) {
									if (Number(notaQua) > Number(QtyData)) {
										MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorQuantity"));
										return;
									}
								}
								oThat.oView.byId("visibleListId").setVisible(true);
							}
							//code ended by kirubakaran for brazil plant on 15.07.2020 to set Nota-Fisical Number//
							if (vSelectItems.length != 0) {
								for (var i = 0; i < vSelectItems.length; i++) {
									var vPath = vSelectItems[i].getBindingContext("oPoitemModel").getPath();
									oThat.oView.getModel("oPoitemModel").setProperty(vPath + "/Parnr", oThat.oView.byId("id_Vendor").getValue());
									oThat.oView.getModel("oPoitemModel").setProperty(vPath + "/NF_NUMBER", notaNo); //code added by kirubakaran for brazil plant on 15.07.2020 to set Nota-Fisical Number//
									oThat.oView.getModel("oPoitemModel").setProperty(vPath + "/NF_QUANTITY", notaQua); //code added by kirubakaran for brazil plant on 15.07.2020 to set Nota-Fisical Number//
									oThat.oView.getModel("oPoitemModel").setProperty(vPath + "/NO_BAGS", bagQty); //code added by kirubakaran for brazil plant on 15.07.2020 to set Nota-Fisical Number//
									oThat.oView.getModel("oPoitemModel").refresh();
									oThat.oView.getModel("POLIST").getData().push(vSelectItems[i].getBindingContext("oPoitemModel").getObject());
								}
							}
							oThat.oView.getModel("POLIST").refresh();
							oThat.oPoItemFrag.destroy();
						}
					}
				});
			} else {
				oThat.oView.getModel("POLIST").getData().push(this.getView().getModel("oPoitemModel").getData().results[0]);
			}
		},

		onClosePoIteList: function (oEvent) {

			/*CFM change added by Nagaraj*/
			var valid = true;
			if (oThat.SelectedPlant.Param === "H") {
				var vSelectItems = sap.ui.getCore().byId("id_PoItemList").getSelectedItems();
				var Existpo = oThat.oView.getModel("POLIST").getData();
				var pItem = [];

				for (var r in vSelectItems) {
					pItem.push(vSelectItems[r].getBindingContext("oPoitemModel").getObject());
				}
				for (var s in Existpo) {
					pItem.push(Existpo[s]);
				}

				var fert = 0,
					NonFert = 0;
				for (var z in pItem) {
					if (pItem[z].FertFlag === "X") {
						fert += 1;
					} else {
						NonFert += 1;
					}
				}
				var totItem = pItem.length;
				if (totItem === fert) {
					valid = true;
					oThat.getView().byId("id_Param7Key").setState(true);
					oThat.getView().byId("id_Param7Key").setEnabled(false);
				} else if (totItem === NonFert) {
					valid = true;
				} else {
					valid = false;
				}

			}

			/*CFM change end by nagaraj*/

			if (valid) {
				// plnatFlag is for brazil plant
				if (plantFlag === "X") {
					if (scanPlantFlag === "X") {

						var vSelectItems = this.aData;

						if (vSelectItems.length != 0) {
							for (var i = 0; i < vSelectItems.length; i++) {
								//	var vPath = vSelectItems[i].getBindingContext("oPoitemModel").getPath();
								oThat.oView.getModel("oPoitemModel").getData().results[i].NF_NUMBER = vSelectItems[i].NotaFiscalNo;
								oThat.oView.getModel("oPoitemModel").getData().results[i].NF_QUANTITY = vSelectItems[i].NotaFiscalQty;
								oThat.oView.getModel("oPoitemModel").getData().results[i].NO_BAGS = vSelectItems[i].bagQty;
								oThat.oView.getModel("oPoitemModel").getData().results[i].Parnr = oThat.oView.byId("id_Vendor").getValue();
								oThat.oView.getModel("oPoitemModel").refresh();
								oThat.oView.getModel("POLIST").getData().push(this.scanArry.results[i]);
							}
						}
						oThat.oView.getModel("POLIST").refresh();
					} else {
						oThat.onClosePoIteListCopy(oEvent); // Existing code function
					}
				} else {
					oThat.onClosePoIteListCopy(oEvent);
				}
			} else {
				sap.m.MessageBox.information(oThat.oView.getModel("i18n").getResourceBundle().getText("mattypeDif"));
			}

		},

		onDmsPost: function (ivWbid) {
			if (oThat.Images.length != 0) {
				var DmsPostNav = [];
				oThat.Images.forEach(function (x) {
					DmsPostNav.push({
						"Dokar": "",
						"Doknr": x.Doknr,
						"Dokvr": "",
						"Doktl": "",
						"Dokob": "",
						"Object": "",
						"Objky": "",
						"Fname": x.Fname,
						"Ftype": x.Ftype,
						"Filename": x.Filename
					});
				});

				var payLoad = {
					"d": {
						"IvWbid": ivWbid,
						"DmsPostNav": DmsPostNav,
						"DmsReturnNav": []
					}
				};
				oThat.oModel.create("/DmsPostSet", payLoad, {
					success: function () {
						oThat.Images = []; //Added by Avinash
					},
					error: function (oResponse) {
						oThat.BusyDialog.close();
						var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("Title21");
						MessageBox.show(oResponse.responseText, MessageBox.Icon.ERROR, vError);
					}
				});
			}
		},
		//==========================================================================================//
		//============================== Re-Print =================================================//
		//========================================================================================//
		onClickReprint: function () {
			var oThat = this;
			oThat.Reprint = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.RePrint", oThat);
			oThat.oView.addDependent(oThat.Reprint);
			oThat.Reprint.open();
			//Added by Avinash -- Ghana Changes
			sap.ui.getCore().byId("id_InBatch").setVisible(false);
			sap.ui.getCore().byId("id_InBatchLabel").setVisible(false);
		},
		onClickReprintDecline: function () {
			oThat.Reprint.destroy();
		},

		fnClickonReprintOK: function () {
			var oThat = this;
			if (
				sap.ui.getCore().byId("id_InVehicleNo").getValue() === "" ||
				sap.ui.getCore().byId("id_InWbid").getValue() === "" ||
				sap.ui.getCore().byId("id_InDate").getValue() === "" ||
				sap.ui.getCore().byId("id_InDate").getValue() == null) {
				MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg7"));
			} else {
				var vWbid = sap.ui.getCore().byId("id_InWbid").getValue();
				var sServiceUrl = oThat.oModel.sServiceUrl;
				var vSelectedLots = "";
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
				oThat.Reprint.destroy();
			}
		},
		onClickVehicleF4: function (oEvent) {
			var oThat = this;
			oThat.vId = oEvent.getSource().getId();
			var vDate = sap.ui.getCore().byId("id_InDate").getValue();
			if (vDate !== null && vDate !== "") {
				var vDate = sap.ui.getCore().byId("id_InDate").getDateValue();
				var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddT00:00:00"
				});
				var vInDate = vDateFormat.format(vDate);
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
						"StatusUpdate": "X",
						"TruckReport": "X",
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
		//=============================== Added for Orbit changes ==========================================//
		//=============================================================================================//
		//========================================== Scan Weighbridge ID =============================//
		//===========================================================================================//
		// onScanWbId: function(oEvent) {
		// 	var vVlaue = oEvent.getParameter("text");
		// 	oThat.oView.byId("id_WbidNo").setValue(vVlaue);
		// 	oThat.fnValidateWbID(vVlaue);
		// },

		//==================================================================================//
		//========================= Barcode Scan PO/Delivery/Material success ==================================//
		//=================================================================================//
		//Added by Avinash for Scanning Logic Changes -- Start
		onScanWbId: function () {
			var oThat = this;
			var oBundle = oThat.getView().getModel("i18n").getResourceBundle();
			var oVideoDeviceModel = new JSONModel();

			if (ZXing !== undefined && !sap.ui.Device.system.desktop) {
				//Initialize the ZXing QR Code Scanner
				this.loadZXingLibrary().then(() => {
					// if (!sap.ui.Device.system.desktop) { //Other than desktop
					codeReader = new ZXing.BrowserMultiFormatReader();
					codeReader.listVideoInputDevices().then((videoInputDevices) => {
						if (videoInputDevices.length > 1) {
							selectedDeviceId = videoInputDevices[1].deviceId; //Mobile Back Camera
						} else if (videoInputDevices.length === 1) {
							selectedDeviceId = videoInputDevices[0].deviceId; //Default Camera
						} else {
							sap.ndc.BarcodeScanner.scan( //Desktop Version
								function (mResult) {
									if (!mResult.cancelled) {
										oThat.getView().byId("id_WbidNo").setValue(mResult.text.trim());
										oThat.fnValidateWbID(mResult.text.trim());
									}
								},
								function (Error) {
									sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

								},
							);
						}
						if (videoInputDevices.length >= 1) {
							var aDevice = [];
							videoInputDevices.forEach((element) => {
								if (element.label.includes('0')) {
									selectedDeviceId = element.deviceId;
								}
								var sourceOption = {};
								sourceOption.text = element.label;
								sourceOption.value = element.deviceId;
								aDevice.push(sourceOption);
								oVideoDeviceModel.setData(aDevice);
								this.getView().setModel(oVideoDeviceModel, "oVideoDeviceModel");
								oComboBox = new sap.m.ComboBox({
									items: {
										path: "oVideoDeviceModel>/",
										template: new sap.ui.core.Item({
											key: "{oVideoDeviceModel>value}",
											text: "{oVideoDeviceModel>text}"
										})
									},
									selectedKey: selectedDeviceId,
									selectionChange: function (oEvt) {
										selectedDeviceId = oEvt.getSource().getSelectedKey();
										oThat._oScanQRDialog.close();
										codeReader.reset()

									}
								});

								sStartBtn = new sap.m.Button({
									text: oBundle.getText("Start"),
									type: oBundle.getText("Accept"),
									press: function () {
										oThat._oScanQRDialog.close();
										oThat.onScanWbId();
									}

								})

								oThat.startScanningWbId();
							})
						}
					});
				}).catch((error) => {
					console.error("Error loading ZXing library:", error);
				});
			} else {
				sap.ndc.BarcodeScanner.scan(
					function (mResult) {
						if (!mResult.cancelled) {
							// oThat.onScanBarcode(mResult.text.trim());
							oThat.getView().byId("id_WbidNo").setValue(mResult.text.trim());
							oThat.fnValidateWbID(mResult.text.trim());
						}
					},
					function (Error) {
						sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

					},
				);
			}

		},

		startScanningWbId: function () {
			var oThat = this;
			var oView = oThat.getView();
			var oBundle = oView.getModel("i18n").getResourceBundle();
			try { //Checking barcodescanner plugin is available or not
				var s = cordova.plugins.barcodeScanner;
				if (s) {
					sApplicationFlag = true; // Barcode Scanner is avilable; Running in Fiori Client
				} else {
					sApplicationFlag = false; // Barcode Scanner is not-avilable
				}
			} catch (e) {
				sApplicationFlag = false; // Barcode Scanner is not avilable; Running in Browser
			}
			if (sApplicationFlag === false && sap.ui.Device.system.desktop === false) { //No Barcode Scanner Plugin and Mobile/Tablet Browser
				if (!this._oScanQRDialog) {
					this._oScanQRDialog = new sap.m.Dialog({
						title: oBundle.getText("ScanQRcode"),
						contentWidth: "640px",
						contentHeight: "480px",
						horizontalScrolling: false,
						verticalScrolling: false,
						stretchOnPhone: true,
						stretch: true,
						content: [
							new sap.ui.core.HTML({
								id: this.createId("scanContainer_QR"),
								content: "<video />"
							})
						],
						endButton: new sap.m.Button({
							text: oBundle.getText("Cancel"),
							press: function (oEvent) {
								this._oScanQRDialog.close();
								codeReader.reset();
								sap.ndc.BarcodeScanner.scan(
									function (mResult) {
										if (!mResult.cancelled) {
											// oThat.onScanBarcode(mResult.text.trim());
											oThat.getView().byId("id_WbidNo").setValue(mResult.text.trim());
											oThat.fnValidateWbID(mResult.text.trim());
										}
									},
									function (Error) {
										sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

									},
								);
							}.bind(this)
						}),
						afterOpen: function () {
							codeReader.decodeFromVideoDevice(selectedDeviceId, oView.byId("scanContainer_QR").getDomRef(), (result, err) => {
								if (result) {
									this._oScanQRDialog.close();
									codeReader.reset()
									// oThat.onScanBarcode(result.text.trim());
									oThat.getView().byId("id_WbidNo").setValue(result.text.trim());
									oThat.fnValidateWbID(result.text.trim());
								}
								if (err && !(err instanceof ZXing.NotFoundException)) {
									// oView.byId("idInOutBond").setValue("");
								}
							})
						}.bind(this),
						afterClose: function () {}
					});
					oView.addDependent(this._oScanQRDialog);
				}
				this._oScanQRDialog.open();
			} else { //QR Scanner is available and on Mobile Fiori Client
				sap.ndc.BarcodeScanner.scan(
					function (mResult) {
						if (!mResult.cancelled) {
							// oThat.onScanBarcode(mResult.text.trim());
							oThat.getView().byId("id_WbidNo").setValue(mResult.text.trim());
							oThat.fnValidateWbID(mResult.text.trim());
						}
					},
					function (Error) {
						sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);
					},
				);
			}
		},

		//End of Added

		fnValidateWbID: function (vVlaue) {
			var vWbId = oThat.oView.byId("id_WbidNo").getValue();
			var oEntity = {
				"d": {
					"GateEntry": "",
					"TruckReport": "X",
					"Inbound": "X",
					"IvWbid": vWbId,
					"IvItem": "00000",
					"GetReturnNav": [],
					"WbItemNav": [],
					"WsItemNav": [],
					"WbHeaderNav": [],
					"DelItemNav": [],
					"PoItemNav": []
				}
			};
			oEntity.d.WbHeaderNav.push({
				"Token": vWbId
			});
			oThat.Service = 'VALIDWBID';
			oThat.onCallService(oThat.Service, oEntity);

		},
		//==============================================================================================//
		//=========================== Scan Delivery in header for orbit ================================//
		//==============================================================================================//

		// onScanDelivery: function(oEvent) {
		// 	var vVlaue = oEvent.getParameter("text");
		// 	oThat.oView.byId("id_Delivery").setValue(vVlaue);
		// 	oThat.onSubmitDelivery(vVlaue);
		// },

		//Added by Avinash
		onScanDelivery: function () {
			var oThat = this;
			var oBundle = oThat.getView().getModel("i18n").getResourceBundle();
			var oVideoDeviceModel = new JSONModel();
			//Initialize the ZXing QR Code Scanner
			if (ZXing !== undefined && !sap.ui.Device.system.desktop) {
				this.loadZXingLibrary().then(() => {
					// if (!sap.ui.Device.system.desktop) { //Other than desktop
					codeReader = new ZXing.BrowserMultiFormatReader();
					codeReader.listVideoInputDevices().then((videoInputDevices) => {
						if (videoInputDevices.length > 1) {
							selectedDeviceId = videoInputDevices[1].deviceId; //Mobile Back Camera
						} else if (videoInputDevices.length === 1) {
							selectedDeviceId = videoInputDevices[0].deviceId; //Default Camera
						} else {
							sap.ndc.BarcodeScanner.scan( //Desktop Version
								function (mResult) {
									if (!mResult.cancelled) {
										oThat.getView().byId("id_Delivery").setValue(mResult.text.trim());
										oThat.onSubmitDelivery(mResult.text.trim());
									}
								},
								function (Error) {
									sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

								},
							);
						}
						if (videoInputDevices.length >= 1) {
							var aDevice = [];
							videoInputDevices.forEach((element) => {
								if (element.label.includes('0')) {
									selectedDeviceId = element.deviceId;
								}
								var sourceOption = {};
								sourceOption.text = element.label;
								sourceOption.value = element.deviceId;
								aDevice.push(sourceOption);
								oVideoDeviceModel.setData(aDevice);
								this.getView().setModel(oVideoDeviceModel, "oVideoDeviceModel");
								oComboBox = new sap.m.ComboBox({
									items: {
										path: "oVideoDeviceModel>/",
										template: new sap.ui.core.Item({
											key: "{oVideoDeviceModel>value}",
											text: "{oVideoDeviceModel>text}"
										})
									},
									selectedKey: selectedDeviceId,
									selectionChange: function (oEvt) {
										selectedDeviceId = oEvt.getSource().getSelectedKey();
										oThat._oScanQRDialog.close();
										codeReader.reset()

									}
								});

								sStartBtn = new sap.m.Button({
									text: oBundle.getText("Start"),
									type: oBundle.getText("Accept"),
									press: function () {
										oThat._oScanQRDialog.close();
										oThat.onScanDelivery();
									}

								})

								oThat.startScanningDelviery();
							})
						}
					});
				}).catch((error) => {
					console.error("Error loading ZXing library:", error);
				});
			} else {
				sap.ndc.BarcodeScanner.scan(
					function (mResult) {
						if (!mResult.cancelled) {
							// oThat.onScanBarcode(mResult.text.trim());
							oThat.getView().byId("id_Delivery").setValue(mResult.text.trim());
							oThat.onSubmitDelivery(mResult.text.trim());
						}
					},
					function (Error) {
						sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

					},
				);
			}
		},

		loadZXingLibrary: function () {
			return new Promise((resolve, reject) => {
				var script = document.createElement('script');
				//script.src = "https://unpkg.com/@zxing/library@latest";
				script.src = sap.ui.require.toUrl("ZGT_MM_INBOUND/ScannerAppLibrary/index.min.js");
				script.onload = resolve;
				script.onerror = reject;
				document.head.appendChild(script);
			});
		},

		startScanningDelviery: function () {
			var oThat = this;
			var oView = oThat.getView();
			var oBundle = oView.getModel("i18n").getResourceBundle();
			try { //Checking barcodescanner plugin is available or not
				var s = cordova.plugins.barcodeScanner;
				if (s) {
					sApplicationFlag = true; // Barcode Scanner is avilable; Running in Fiori Client
				} else {
					sApplicationFlag = false; // Barcode Scanner is not-avilable
				}
			} catch (e) {
				sApplicationFlag = false; // Barcode Scanner is not avilable; Running in Browser
			}
			if (sApplicationFlag === false && sap.ui.Device.system.desktop === false) { //No Barcode Scanner Plugin and Mobile/Tablet Browser
				if (!this._oScanQRDialog) {
					this._oScanQRDialog = new sap.m.Dialog({
						title: oBundle.getText("ScanQRcode"),
						contentWidth: "640px",
						contentHeight: "480px",
						horizontalScrolling: false,
						verticalScrolling: false,
						stretchOnPhone: true,
						stretch: true,
						content: [
							new sap.ui.core.HTML({
								id: this.createId("scanContainer_QR"),
								content: "<video />"
							})
						],
						endButton: new sap.m.Button({
							text: oBundle.getText("Cancel"),
							press: function (oEvent) {
								this._oScanQRDialog.close();
								codeReader.reset();
								sap.ndc.BarcodeScanner.scan(
									function (mResult) {
										if (!mResult.cancelled) {
											// oThat.onScanBarcode(mResult.text.trim());
											oThat.getView().byId("id_Delivery").setValue(mResult.text.trim());
											oThat.onSubmitDelivery(mResult.text.trim());
										}
									},
									function (Error) {
										sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

									},
								);
							}.bind(this)
						}),
						afterOpen: function () {
							codeReader.decodeFromVideoDevice(selectedDeviceId, oView.byId("scanContainer_QR").getDomRef(), (result, err) => {
								if (result) {
									this._oScanQRDialog.close();
									codeReader.reset()
									// oThat.onScanBarcode(result.text.trim());
									oThat.getView().byId("id_Delivery").setValue(result.text.trim());
									oThat.onSubmitDelivery(result.text.trim());
								}
								if (err && !(err instanceof ZXing.NotFoundException)) {
									// oView.byId("idInOutBond").setValue("");
								}
							})
						}.bind(this),
						afterClose: function () {}
					});
					oView.addDependent(this._oScanQRDialog);
				}
				this._oScanQRDialog.open();
			} else { //QR Scanner is available and on Mobile Fiori Client
				sap.ndc.BarcodeScanner.scan(
					function (mResult) {
						if (!mResult.cancelled) {
							// oThat.onScanBarcode(mResult.text.trim());
							oThat.getView().byId("id_Delivery").setValue(mResult.text.trim());
							oThat.onSubmitDelivery(mResult.text.trim());
						}
					},
					function (Error) {
						sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);
					},
				);
			}
		},

		//End of Added

		onSubmitDelivery: function () {
			var vValue = oThat.oView.byId("id_Delivery").getValue();
			// if(vValue != ""){
			if (oThat.oView.getModel("POLIST").getData().length == 0) {
				var oEntity = {
					"d": {
						"GateEntry": "",
						"Inbound": "X",
						"IvDelivery": vValue,
						"IvPo": "",
						"IvWbid": "",
						"IvWerks": "",
						"IvMatnr": "",
						"TruckReport": "X",
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
				oEntity.d.WbHeaderNav.push({
					"Challan": vValue
				});

				oThat.Service = 'VALIDDELIVERY';
				oThat.onCallService(oThat.Service, oEntity);
			} else {
				sap.m.MessageBox.confirm(oThat.oView.getModel("i18n").getResourceBundle().getText("Delivery_Not_Applicable"), {
					icon: MessageBox.Icon.INFORMATION,
					title: oThat.oView.getModel("i18n").getResourceBundle().getText("Confirm"),
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction == 'YES') {
							oThat.oView.getModel("POLIST").setData([]);
							oThat.oView.getModel("POLIST").refresh();
							oThat.oView.getModel("POST").getData().Challan = "";
							oThat.oView.getModel("POST").getData().Vehno = "";
							oThat.oView.getModel("POST").getData().Vehtyp = "";
							oThat.oView.getModel("POST").getData().Dname = "";
							oThat.oView.getModel("POST").getData().Lifnr = "";
							oThat.oView.getModel("POST").getData().DriverMob = "";
							oThat.oView.getModel("POST").refresh();
							if (vValue != "") {
								var oEntity = {
									"d": {
										"GateEntry": "",
										"Inbound": "X",
										"IvDelivery": vValue,
										"IvPo": "",
										"IvWbid": "",
										"IvWerks": "",
										"IvMatnr": "",
										"TruckReport": "X",
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
								oEntity.d.WbHeaderNav.push({
									"Challan": vValue
								});

								oThat.Service = 'VALIDDELIVERY';
								oThat.onCallService(oThat.Service, oEntity);
							}
						} else {
							oThat.oView.byId("id_Delivery").setValue(oThat.oView.getModel("POST").getData().Challan);
						}
					}
				});
			}
		},
		//======================================================================================//
		//==================================== Layout Settings ================================//
		//====================================================================================//
		onSettings: function () {
			oThat.PersonalizeFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Personalize", oThat);
			oThat.oView.addDependent(oThat.PersonalizeFrag);
			oThat.oDataBeforeOpen = jQuery.extend(true, {}, oThat.oPersonalModel.getData());
			oThat.PersonalizeFrag.open();
		},
		onCancel: function () {
			oThat.oPersonalModel.setProperty("/", jQuery.extend(true, [], oThat.oDataBeforeOpen));
			oThat.oDataBeforeOpen = {};
			oThat.PersonalizeFrag.close();
		},
		onOK: function (oevent) {
			var aArray = oThat.oPersonalModel.getData().ColumnsItems;
			for (var i = 0; i < aArray.length; i++) {
				if (aArray[i].columnKey == "Challan") {
					if (aArray[i].visible == true) {
						oThat.oView.byId("id_VendorBox").setVisible(true);
						oThat.oView.byId("id_Vendor").setValue("");
						oThat.oView.byId("id_POBtn").setText(oThat.oView.getModel("i18n").getResourceBundle().getText("Text21"));
						oThat.oView.byId("id_ScanToolbar").setVisible(false);
						oThat.oView.getModel("POST").getData().Wtype = "05";
					} else {
						oThat.oView.byId("id_VendorBox").setVisible(false);
						oThat.oView.byId("id_Vendor").setValue("");
						oThat.oView.byId("id_POBtn").setText(oThat.oView.getModel("i18n").getResourceBundle().getText("Text3"));
						oThat.oView.byId("id_ScanToolbar").setVisible(true);
						oThat.oView.getModel("POST").getData().Wtype = "";
					}
				}
			}
			oThat.oView.getModel("POST").refresh();
			oThat.PersonalizeFrag.close();
		},

		//HB Start
		onNotaFiscalChange: function (oEvent) {
			var noOfBags = parseFloat(sap.ui.getCore().byId("notaQId").getValue()) / parseFloat(oThat.oView.getModel("POST").getData().EvSixtyBag);
			if (Number.isInteger(noOfBags)) {
				noOfBags = noOfBags;
			} else {
				noOfBags = parseInt(noOfBags + 1);
			}
			sap.ui.getCore().byId("bagQty").setValue(noOfBags);
		},

		onNotaFiscalChangeQR: function (oEvent) {
			for (var a = 0; a < this.aData.length; a++) {
				var noOfBags = parseFloat(this.aData[a].NotaFiscalQty) / parseFloat(oThat.oView.getModel("POST").getData().EvSixtyBag);
				if (Number.isInteger(noOfBags)) {
					noOfBags = noOfBags;
				} else {
					noOfBags = parseInt(noOfBags + 1);
				}
				//	sap.ui.getCore().byId("bagQty").setValue(noOfBags);
				this.aData[a].bagQty = noOfBags;
			}
		},
		//HB End
		//added by dharma on 16-10-2020
		fnDriverMob: function (oEvent) {
			var vMax = 15;
			var vNumber = oThat.getView().byId("id_InDriverMob").getValue();
			var vLength = vNumber.length;
			if (vLength > vMax) {
				oThat.getView().byId("id_InDriverMob").setValue(oThat.vPrevious);
				oThat.getView().byId("id_InDriverMob").setValueStateText("Maximum 15 Digits only");
				oThat.getView().byId("id_InDriverMob").setValueState("Error");
			} else {
				oThat.getView().byId("id_InDriverMob").setValue(vNumber);
				oThat.vPrevious = vNumber;
				oThat.getView().byId("id_InDriverMob").setValueStateText("");
				oThat.getView().byId("id_InDriverMob").setValueState("None");
			}
		},
		fnDrivernameChange: function (oEvent) {
			var vMax = 20;
			var vName = oThat.getView().byId("id_InDriver").getValue();
			vName = vName.toUpperCase();
			var vTemp = vName.substr(vName.length - 1, 1);
			if ((vTemp.charCodeAt() >= 65 && vTemp.charCodeAt() <= 90) || (vTemp.charCodeAt() === 32)) {
				vName = vName;
			} else {
				vName = vName.substr(0, vName.length - 1);
			}
			var vLength = vName.length;
			if (vLength > vMax) {
				oThat.getView().byId("id_InDriver").setValue(oThat.vPrevious);
				oThat.getView().byId("id_InDriver").setValueStateText("Maximum 20 Charecters only");
				oThat.getView().byId("id_InDriver").setValueState("Error");
			} else {
				oThat.getView().byId("id_InDriver").setValue(vName);
				oThat.vPrevious = vName;
				oThat.getView().byId("id_InDriver").setValueStateText("");
				oThat.getView().byId("id_InDriver").setValueState("None");
			}
		},
		fnVehiceTypeChange: function (oEvent) {
			var vMax = 15;
			var vNumber = oThat.getView().byId("id_VehicleTy").getValue();
			var vLength = vNumber.length;
			if (vLength > vMax) {
				oThat.getView().byId("id_VehicleTy").setValue(oThat.vPrevious);
				oThat.getView().byId("id_VehicleTy").setValueStateText("Maximum 15 Charecters only");
				oThat.getView().byId("id_VehicleTy").setValueState("Error");
			} else {
				oThat.getView().byId("id_VehicleTy").setValue(vNumber);
				oThat.vPrevious = vNumber;
				oThat.getView().byId("id_VehicleTy").setValueStateText("");
				oThat.getView().byId("id_VehicleTy").setValueState("None");
			}
		},
		/*New Common function for RGP/NRGP scan and OCR capture*/
		setScanRefernceNo: function (scanData) {
			var oBundle = oThat.getView().getModel("i18n").getResourceBundle();
			if (scanData.length === 10) {
				oThat.BusyDialog.open();
				var awtype = oThat.oView.getModel("POST").getData().Wtype,
					afilter = [],
					oFilter3 = new sap.ui.model.Filter("RgpRef", sap.ui.model.FilterOperator.EQ, "X"),
					oFilter4 = new sap.ui.model.Filter("IvRef", sap.ui.model.FilterOperator.EQ, scanData),
					oFilter6 = new sap.ui.model.Filter("IvProc", sap.ui.model.FilterOperator.EQ, awtype),
					oFilter5 = new sap.ui.model.Filter("IvGate", sap.ui.model.FilterOperator.EQ, "G");

				afilter = [oFilter3, oFilter4, oFilter5, oFilter6];
				oThat.oModel.read("/F4ParametersSet", {
					filters: afilter,
					urlParameters: {
						$expand: "ReturnNav"
					},
					success: function (oData, oResp) {
						oThat.BusyDialog.close();
						if (oData.results[0].ReturnNav.results.length > 0) {
							if (oData.results[0].ReturnNav.results[0].Type === "E")
								MessageBox.show(oData.results[0].ReturnNav.results[0].Message);
						} else {
							var refNo = oThat.oView.byId("id_InRefNoValue").getValue().trim()
							if (refNo.length >= 32) {
								MessageToast.show(oBundle.getText("refscanValidation"));
							} else if (refNo.length === 0) {
								oThat.oView.byId("id_InRefNoValue").setValue(scanData);
							} else {
								oThat.oView.byId("id_InRefNoValue").setValue(refNo + "," + scanData);
							}
						}

					},
					error: function (oError) {
						oThat.BusyDialog.close();

						MessageToast.show(oBundle.getText("Title21"));
					}
				});
			} else {
				MessageToast.show(oBundle.getText("incorrect"));
			}
		},
		onresetRefNo: function () {
			this.oView.byId("id_InRefNoValue").setValue("");
		},
		/*New OCR functionality for vehicle number capture (sankar D Req)*/
		onCaptureVehicleImage: function () {
			var oThat = this;
			oThat.vehicleImage = [];
			oThat.getView().setModel(new JSONModel(oThat.vehicleImage), "vehicleImage");
			oThat.getView().getModel("vehicleImage").refresh(true);
			if (!oThat.oCaptureVeh) {
				oThat.oCaptureVeh = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.VehicleImage", oThat);
				oThat.getView().addDependent(oThat.oCaptureVeh);
			}
			oThat.oCaptureVeh.open();

		},
		fnclosevehicle: function () {
			this.oCaptureVeh.close();
		},
		fnokvehicle: function () {
			var that = this;
			that.BusyDialog.open();
			/*new code*/
			const MAX_WIDTH = 872;
			const MAX_HEIGHT = 782;
			const MIME_TYPE = that.vehicleImage[0].Ftype; //"image/jpeg";
			const QUALITY = 1;
			var blobURL = URL.createObjectURL(that.vehFile);
			const img = new Image();
			img.src = blobURL;
			img.onerror = function () {
				URL.revokeObjectURL(this.src);
				console.log("Cannot load image");
			};

			img.onload = function () {
				URL.revokeObjectURL(this.src);
				const [newWidth, newHeight] = that.calculateSize(img, MAX_WIDTH, MAX_HEIGHT);
				const canvas = document.createElement("canvas");
				canvas.width = newWidth;
				canvas.height = newHeight;
				const ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0, newWidth, newHeight);
				canvas.toBlob(
					(blob) => {
						var reader = new FileReader();
						reader.readAsDataURL(blob);
						reader.onloadend = function () {
							var base64String = reader.result;

							var Data_CFM = base64String;
							var settings = {
								"url": "https://OCR-NumberPlate-Dev-patient-hippopotamus-ti.cfapps.eu10.hana.ondemand.com/DPWCMGrains",
								"method": "POST",
								"headers": {
									"Content-Type": "text/plain",
								},
								"data": Data_CFM
							};

							jQuery.ajax(settings).done(function (response) {
								if (response.value) {
									that.oView.getModel("POST").getData().IV_VEH_NO = response.value[0];
									that.oView.byId("id_VehiNo").setValue(that.getView().getModel("POST").getData().IV_VEH_NO);
									//	that.oView.byId("id_VehiNo").setEditable(true);
									that.getView().byId("id_VehiNo").setEnabled(true);
								} else {

									MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("ErrorOcr"));

									that.oView.byId("id_VehiNo").setValue("");
									//that.getView().byId("id_VehiNo").setEnabled(false);
								}
								that.BusyDialog.close();
								that.oCaptureVeh.close();
							});
						}

					},
					MIME_TYPE,
					QUALITY
				);

			};
			/*end code*/



			/*	this.getView().byId("id_VehiNo").setValue(this.getView().getModel("POST").getData().IV_VEH_NO);
				this.getView().byId("id_VehiNo").setEnabled(true);*/

		},

		onFileDeletedvehicle: function (oEvent) {
			var vDocumentid = oEvent.getParameter("documentId");
			for (var i = 0; i < oThat.vehicleImage.length; i++) {
				if (oThat.vehicleImage[i].Documentid == vDocumentid) {
					oThat.vehicleImage.splice(oThat.vehicleImage[i], 1);
					break;
				}
			}
			oThat.getView().setModel(new JSONModel(oThat.vehicleImage), "vehicleImage");
			oThat.getView().getModel("vehicleImage").refresh(true);
		},

		onCompleteUploadVehicleNumber: function (oEvent) {
			var self = this;
			//	this.BusyDialog.open();
			var file = oEvent.getSource()._getFileUploader()._aXhr[0]['file'];
			var object = {};

			var ext = file.name.split(".");
			var vRadioText = "VEH_OCR." + ext[ext.length - 1];

			object.Documentid = jQuery.now().toString();
			object.Fname = vRadioText;
			object.Ftype = file.type;
			object.Objky = "";
			object.Doknr = "000";
			oEvent.getSource()._getFileUploader()._aXhr.splice(0, 1);
			if (file) {
				oThat.vehFile = file;
				var reader = new FileReader();
				var BASE64_MARKER = 'data:' + file.type + ';base64,';
				reader.onloadend = (function (theFile) {
					return function (evt) {
						var base64Index = evt.target.result.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
						var base64Data = evt.target.result.substring(base64Index);
						object.Filename = base64Data;
						oThat.vehicleImage.unshift(object);
						object = {}; //clear

						oThat.getView().setModel(new JSONModel(oThat.vehicleImage), "vehicleImage");
						oThat.getView().getModel("vehicleImage").refresh(true);
						oThat.BusyDialog.close();
					};

				})(file);
			}
			reader.readAsDataURL(file);

		},
		calculateSize: function (img, maxWidth, maxHeight) {
			let width = img.width;
			let height = img.height;

			// calculate the width and height, constraining the proportions
			if (width > height) {
				if (width > maxWidth) {
					height = Math.round((height * maxWidth) / width);
					width = maxWidth;
				}
			} else {
				if (height > maxHeight) {
					width = Math.round((width * maxHeight) / height);
					height = maxHeight;
				}
			}
			return [width, height];
		},

	});

});