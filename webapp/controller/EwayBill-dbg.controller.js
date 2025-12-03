var oThat = this;
jQuery.sap.require("sap.ndc.BarcodeScanner");
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/BusyDialog",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/core/Fragment"
], function(Controller, MessageBox, BusyDialog, JSONModel, Filter, Fragment) {
	"use strict";
	var sApplicationFlag, selectedDeviceId, codeReader, selectedDeviceId, oComboBox, sStartBtn, sResetBtn; //Added by Avinash
	var EwayTypeflag;
	var table_datawbid;
	var PackMatf4_index;
	var ItemFlag;
	var scanFlag;
	var PackMatDetIndex;
	var indexUom;
	var PacMaterialLength = 0;
	return Controller.extend("ZGT_MM_INBOUND.controller.EwayBill", {
		onInit: function() {
			oThat = this;
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("EwayBill").attachMatched(this._onRouteMatched, this);

			// // oThat.onOpenSettings();
		},
		_onRouteMatched: function() {
			oThat = this;
			// oThat.onOpenSettings();

			oThat.onPressNewEway();
		},

		onOpenSettings: function() {
			this.OpenSelection();

		},
		OpenSelection: function() {
			var self = this;
			setTimeout(function() {
				// if (!self.Eway) {
				self.Eway = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.EwayType", self);
				self.getView().addDependent(self.Eway);
				// }
				self.Eway.open();
			}, 1000);
		},
		onCloseQueue: function() {
			oThat.Eway.close();
		},
		onNavBackEway: function() {

			this.oRouter.navTo("Inbound");
		},
		onPressNewEway: function() {
			// this.onCloseQueue();
			EwayTypeflag = "X";
			this.getView().byId("id_segmentbtn").setSelectedKey("GEN");
			// this.getView().byId("id_NewEway").setVisible(true);
			// this.getView().byId("id_UpdateEway").setVisible(false);
			// this.getView().byId("id_SearchFieldNew").setVisible(true);
			// this.getView().byId("id_SearchFieldUpdate").setVisible(false);

			var oThat = this;
			sap.ui.core.BusyIndicator.show();

			var payLoad = {

				"d": {
					"IvProcess": "NEWLIST",
					"QaListNav": []
				}
			};
			this.getView().getModel().create("/QaLabelSet", payLoad, {
				success: function(oData, oResponse) {
					var EwayListJson = new sap.ui.model.json.JSONModel();
					EwayListJson.setData(oData.QaListNav.results);
					oThat.getView().setModel(EwayListJson, "JMEwayList");
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(oError.message);
				}
			});
		},
		onPressEwayBillNewItem: function(oEvent) {
			oThat.oTableSelctedItem = oEvent.getSource().getBindingContextPath();
			oThat.TableSelectedObject = oEvent.getSource().getBindingContext("JMEwayList").getObject();
			oThat.oBjectItem = oThat.oView.getModel("JMEwayList").getObject(oEvent.getSource().getBindingContextPath());
			var EwayListJsonBind = new sap.ui.model.json.JSONModel();
			EwayListJsonBind.setData(oThat.oBjectItem);
			oThat.getView().setModel(EwayListJsonBind, "JMEwayListBinding");
			oThat.getView().byId("id_SearchFieldWbid").setValue("");
			// this.oRouter.navTo("EwayDetail");
			oThat.oRouter.navTo("EwayDetail", {
				lvWbid: oThat.oBjectItem.Wbid
			});

			// if (!oThat.EwayNew) {
			// 	oThat.EwayNew = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.EwayGenerate", oThat);
			// 	oThat.getView().addDependent(oThat.EwayNew);
			// }
			// oThat.EwayNew.open();
		},
		onCloseEwayGenerate: function() {
			oThat.EwayNew.close();
		},
		fnReprintDialog: function() {
			if (!oThat.EwayReprint) {
				oThat.EwayReprint = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.ReprintEway", oThat);
				oThat.getView().addDependent(oThat.EwayReprint);
			}
			oThat.EwayReprint.open();
			sap.ui.getCore().byId("id_InEwayDate").setValue("");
			sap.ui.getCore().byId("id_InWbidReprint").setValue("");
			table_datawbid = "";
		},
		onClickReprintDecline: function() {
			oThat.EwayReprint.close();
		},
		fnclickReprinttoprint: function() {
			if (sap.ui.getCore().byId("id_InEwayDate").getValue() !== "") {

				// var vWbid = oData.PostWbitemNav.results[0].Wbid;
				// // var sServiceUrl = self.getOwnerComponent().getModel("oDataModel2").sServiceUrl;
				var sServiceUrl = "/sap/opu/odata/sap/ZGW_GT_MM_WB_MOBILITY_SRV"
					// var vLvprocess = 'PRINT';
				var sRead = "/QaLabelPrintSet(IvProcess='PRINT',IvWbid='" + table_datawbid.Wbid + "',IvItem='" + table_datawbid.Item + "')/$value";
				// var sRead = "/QaLabelPrintSet('" +vLvprocess+ "')/$value";
				// var sRead = "/QaLabelSet(IvWbid='" + vWbid + '")/$value";
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
				MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("ErrReprintDate"));
			}

			// var payLoad = {

			// 	"d": {
			// 		"IvProcess": "PRINT",
			// 		"IvItem": table_datawbid.Item,
			// 		"IvWbid": table_datawbid.Wbid,
			// 	}
			// };
			// sap.ui.core.BusyIndicator.show();
			// this.getView().getModel().create("/QaLabelSet", payLoad, {
			// 	success: function(oData, oResponse) {

			// 		sap.ui.core.BusyIndicator.hide();
			// 	},
			// 	error: function(oError) {
			// 		sap.ui.core.BusyIndicator.hide();
			// 		MessageBox.error(oError.message);

			// 	}
			// });
		},
		initiatePdfDialog: function() {
			var that = this;
			that.oImageDialog = new sap.m.Dialog({
				title: 'PDF',
				contentWidth: "100%",
				contentHeight: "",
				content: new sap.ui.core.HTML({}),
				beginButton: new sap.m.Button({
					text: 'Close',
					class: "sapUiSizeCompact",
					press: function() {
						that.oImageDialog.close();
						if (oThat.EwayReprint) {
							// oThat.EwayReprint.destroyContent();
							oThat.EwayReprint.close();
						}
					}
				}),

			});
		},
		onPressUpdateEway: function() {
			this.onCloseQueue();
			EwayTypeflag = "Y";
			if (!oThat.EwayDetail) {
				oThat.EwayDetail = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.GetEwayDet", oThat);
				oThat.getView().addDependent(oThat.EwayDetail);
			}
			oThat.EwayDetail.open();
			// this.getView().byId("id_NewEway").setVisible(false);
			// this.getView().byId("id_UpdateEway").setVisible(true);
			// this.getView().byId("id_SearchFieldNew").setVisible(false);
			// this.getView().byId("id_SearchFieldUpdate").setVisible(true);
		},
		onClickCloseGetDet: function() {
			oThat.EwayDetail.close();
		},
		onPressEwayBillUpdateItem: function() {

			if (!oThat.EwayUpdate) {
				oThat.EwayUpdate = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.EwayUpdate", oThat);
				oThat.getView().addDependent(oThat.EwayUpdate);
			}
			oThat.EwayUpdate.open();
		},
		onCloseEwayUpdate: function() {
			oThat.EwayUpdate.close();
		},
		fnFilterEway: function(oEvent) {
			var vValue = oEvent.getParameters("value").newValue;
			if (vValue) {
				var filter1 = new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.Contains, vValue);
				var filter2 = new sap.ui.model.Filter("Batch", sap.ui.model.FilterOperator.Contains, vValue);
				var filter3 = new sap.ui.model.Filter("Item", sap.ui.model.FilterOperator.Contains, vValue);
				var filter4 = new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.Contains, vValue);
				var filter5 = new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.Contains, vValue);
				var allfilter = new sap.ui.model.Filter([filter1, filter2, filter3, filter4, filter5]);
				var oBinding = sap.ui.getCore().byId("id_tablefiltereway").getBinding("items");
				oBinding.filter([allfilter], false);
			} else {
				// this.PressList();
				var oBinding = sap.ui.getCore().byId("id_tablefiltereway").getBinding("items");
				oBinding.filter([]);
			}
		},
		fnFilterEwayReprint: function(oEvent) {
			var vValue = oEvent.getParameters("value").newValue;
			if (vValue) {
				var filter1 = new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.Contains, vValue);
				var filter2 = new sap.ui.model.Filter("Batch", sap.ui.model.FilterOperator.Contains, vValue);
				var filter3 = new sap.ui.model.Filter("Item", sap.ui.model.FilterOperator.Contains, vValue);
				var filter4 = new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.Contains, vValue);
				var filter5 = new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.Contains, vValue);
				var allfilter = new sap.ui.model.Filter([filter1, filter2, filter3, filter4, filter5]);
				var oBinding = sap.ui.getCore().byId("id_tablefilterReprint").getBinding("items");
				oBinding.filter([allfilter], false);
			} else {
				// this.PressList();
				var oBinding = sap.ui.getCore().byId("id_tablefilterReprint").getBinding("items");
				oBinding.filter([]);
			}
		},
		_handleConfirmWbid: function(oEvent) {
			// var index = sap.ui.getCore().byId("id_tablefiltereway").getSelectedItem().sId.split('-')[2];
			// var selected_index = sap.ui.getCore().byId("id_tablefiltereway").getSelectedItems();
			// var selitem_len = sap.ui.getCore().byId("id_tablefiltereway").getSelectedItems().length;
			// var temItemarr = [];
			// var tempItemFinalArr = []
			// for (var i = 0; i < selitem_len; i++) {
			// 	var index = selected_index[i].sId.split('-')[2];
			// 	temItemarr.push(this.getView().getModel("JMUpdateWbid").getData()[index]);
			// }
			// var itemDataarr = this.getView().getModel("JMQALableUpdateItem").getData();
			// for (var t = 0; t < selitem_len; t++) {
			// 	for (var k = 0; k < itemDataarr.length; k++) {
			// 		if (temItemarr[t].Wbid === itemDataarr[k].Wbid) {
			// 			tempItemFinalArr.push(itemDataarr[k]);
			// 		}
			// 	}
			// }
			// var JsonItemFilter = new sap.ui.model.json.JSONModel();
			// JsonItemFilter.setData(tempItemFinalArr);
			// this.getView().setModel(JsonItemFilter, "JMFilteredItem");
			// if (this.getView().getModel("JMUpdateWbid").getData().length > 0) {
			table_datawbid = oEvent.getParameter("listItem").getBindingContext("JMUpdateWbid").getObject();
			this.SelectedWbid = oEvent.getParameter("listItem").getBindingContext("JMUpdateWbid").getObject();
			MessageBox.confirm(this.getView().getModel("i18n").getResourceBundle().getText("MsgConfItem"), {
				icon: MessageBox.Icon.SUCCESS,
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function(oAction) {
					if (oAction == 'YES') {
						ItemFlag = "I";

					} else if (oAction == 'NO') {
						ItemFlag = "A";
					}
				}
			});
			sap.ui.getCore().byId("id_InWbid").setValue(this.SelectedWbid.Wbid);
			// sap.ui.getCore().byId("id_InWbid").setValue(this.getView().getModel("JMUpdateWbid").getData()[0].Wbid);
			oThat.f4Wbid1.close();
			// }
			// else {
			// 	sap.ui.getCore().byId("id_InWbid").setValue(this.SelectedWbid.Wbid);
			// 	ItemFlag = "A";
			// 	oThat.f4Wbid1.close();
			// }
		},
		_handleConfirmWbidReprint: function(oEvent) {
			table_datawbid = oEvent.getParameter("listItem").getBindingContext("JMUpdateWbid").getObject();
			this.SelectedWbid = oEvent.getParameter("listItem").getBindingContext("JMUpdateWbid").getObject();
			sap.ui.getCore().byId("id_InWbidReprint").setValue(this.SelectedWbid.Wbid);
			oThat.f4WbidReprint.close();
		},
		onCloseWbidf4: function() {
			oThat.f4Wbid1.close();
		},
		onCloseWbidf4Reprint: function() {
			oThat.f4WbidReprint.close();
		},


		loadZXingLibrary: function() {
			return new Promise((resolve, reject) => {
				var script = document.createElement('script');
				//script.src = "https://unpkg.com/@zxing/library@latest";
				script. src = sap.ui.require.toUrl("ZGT_MM_INBOUND/ScannerAppLibrary/index.min.js");
				script.onload = resolve;
				script.onerror = reject;
				document.head.appendChild(script);
			});
		},


		fnScanWbid: function() {
			ItemFlag = "";
			var oThat = this;
			var oBundle = oThat.getView().getModel("i18n").getResourceBundle();
			var oVideoDeviceModel = new JSONModel();
			//Initialize the ZXing QR Code Scanner
			if (ZXing !== undefined) {
				// if (!sap.ui.Device.system.desktop) { //Other than desktop
				this.loadZXingLibrary().then(() => {

				codeReader = new ZXing.BrowserMultiFormatReader();
				codeReader.listVideoInputDevices().then((videoInputDevices) => {
					if (videoInputDevices.length > 1) {
						selectedDeviceId = videoInputDevices[1].deviceId; //Mobile Back Camera
					} else if (videoInputDevices.length === 1) {
						selectedDeviceId = videoInputDevices[0].deviceId; //Default Camera
					} else { //Desktop Version
						sap.ndc.BarcodeScanner.scan(
							function(mResult) {
								if (!mResult.cancelled) {
									if (scanFlag !== 'Y') {
										oThat.onScanBarcode(mResult.text.trim());
									} else {
										oThat.onScanWbidFilter(mResult.text.trim());
									}
								}
							},
							function(Error) {
								sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

							},
						);
					}
					if (videoInputDevices.length >= 1) {
						var aDevice = [];
						videoInputDevices.forEach((element) => {
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
								selectionChange: function(oEvt) {
									selectedDeviceId = oEvt.getSource().getSelectedKey();
									oThat._oScanQRDialog.close();
									codeReader.reset()

								}
							});

							sStartBtn = new sap.m.Button({
								text: oBundle.getText("Start"),
								type: oBundle.getText("Accept"),
								press: function() {
									oThat._oScanQRDialog.close();
									if (scanFlag !== 'Y') {
										oThat.onScanBarcode(mResult.text.trim());
									} else {
										oThat.onScanWbidFilter(mResult.text.trim());
									}
									// oThat.onScanBarcode(mResult.text.trim());
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
					function(mResult) {
						if (!mResult.cancelled) {
							if (scanFlag !== 'Y') {
								oThat.onScanBarcode(mResult.text.trim());
							} else {
								oThat.onScanWbidFilter(mResult.text.trim());
							}
							// oThat.onScanBarcode(mResult.text.trim());
						}
					},
					function(Error) {
						sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);
					},
				);
			}
		},
		startScanning: function() {
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
							press: function(oEvent) {
								this._oScanQRDialog.close();
								codeReader.reset();
								sap.ndc.BarcodeScanner.scan(
									function(mResult) {
										if (!mResult.cancelled) {
											if (scanFlag !== 'Y') {
												oThat.onScanBarcode(mResult.text.trim());
											} else {
												oThat.onScanWbidFilter(mResult.text.trim());
											}
											// oThat.onScanBarcode(mResult.text.trim());
										}
									},
									function(Error) {
										sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

									},
								);
							}.bind(this)
						}),
						afterOpen: function() {
							codeReader.decodeFromVideoDevice(selectedDeviceId, oView.byId("scanContainer_QR").getDomRef(), (result, err) => {
								if (result) {
									this._oScanQRDialog.close();
									codeReader.reset()
									if (scanFlag !== 'Y') {
										oThat.onScanBarcode(mResult.text.trim());
									} else {
										oThat.onScanWbidFilter(mResult.text.trim());
									}
									// oThat.onScanBarcode(result.text.trim());
								}
								if (err && !(err instanceof ZXing.NotFoundException)) {
									// oView.byId("idInOutBond").setValue("");
								}
							})
						}.bind(this),
						afterClose: function() {}
					});
					oView.addDependent(this._oScanQRDialog);
				}
				this._oScanQRDialog.open();
			} else { //QR Scanner is available and on Mobile Fiori Client
				sap.ndc.BarcodeScanner.scan(
					function(mResult) {
						if (!mResult.cancelled) {
							if (scanFlag !== 'Y') {
								oThat.onScanBarcode(mResult.text.trim());
							} else {
								oThat.onScanWbidFilter(mResult.text.trim());
							}
							// oThat.onScanBarcode(mResult.text.trim());
						}
					},
					function(Error) {
						sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

					},
				);
			}

		},

		// onScanBarcode: function(oBarcodeData) {
		// 	// var self = this;
		// 	// self.Scan = true;
		// 	// var vValue = oBarcodeData.split("#")[0];
		// 	// var list = this.getView().byId("id_NewEwayTab");
		// 	// if (vValue && vValue.length > 0) {
		// 	// 	var oFilter = new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.Contains, vValue);
		// 	// 	var aFilters = new sap.ui.model.Filter([oFilter]);
		// 	// }
		// 	// var binding = list.getBinding("items");
		// 	// binding.filter(aFilters);

		// },

		fnClearFilter: function(oEvent) {
			var self = this;
			if (self.Scan) {
				var vData = "";
				self.onScanBarcode(vData);
				// self.getView().byId("id_SearchField").setValue("");
				self.Scan = false;
			}
			// self._onRouteMatched();
		},
		fnSearchWbid: function(oEvent) {
			var vValue = oEvent.getSource().getValue();
			if (EwayTypeflag === 'X') {
				var list = this.getView().byId("id_NewEwayTab");
			} else {
				var list = this.getView().byId("id_TabEwayUpdate");
			}
			if (vValue && vValue.length > 0) {
				var oFilter = new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.Contains, vValue);
				var aFilters = new sap.ui.model.Filter([oFilter]);
			}
			var binding = list.getBinding("items");
			binding.filter(aFilters);
		},
		fnSearchWbid1: function(oEvent) {
			var vValue = oEvent.getSource().getValue();
			var list = this.getView().byId("id_TabEwayUpdate");
			if (vValue && vValue.length > 0) {
				var oFilter = new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.Contains, vValue);
				var aFilters = new sap.ui.model.Filter([oFilter]);
			}
			var binding = list.getBinding("items");
			binding.filter(aFilters);
		},
		onValueHelpBatch: function() {

			if (!oThat.EwayBatch) {
				oThat.EwayBatch = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.EwayBatch", oThat);
				oThat.getView().addDependent(oThat.EwayBatch);
			}
			oThat.EwayBatch.open();
		},
		onf4Wbid: function() {

			if (!oThat.f4Wbid) {
				oThat.f4Wbid = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.QAUpdate", oThat);
				oThat.getView().addDependent(oThat.f4Wbid);
			}

			oThat.f4Wbid.open();
			sap.ui.getCore().byId("id_InEwayDate1").setValue("");
			sap.ui.getCore().byId("id_InWbid").setValue("");
		},

		getWbidDetails: function() {
			if (sap.ui.getCore().byId("id_InEwayDate1").getDateValue() <= new Date()) {
				sap.ui.getCore().byId("id_InEwayDate1").setValueState("None");
				var that = this;
				// var EwayDate = this.getView().byId("id_InEwayDate").getValue();
				var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddThh:mm:ss"
				});
				var EwayDate = vDateFormat.format(new Date(sap.ui.getCore().byId("id_InEwayDate1").getDateValue()));
				var payLoad = {

					"d": {
						"IvProcess": "F4WBID",
						"IvDate": EwayDate,
						"F4QaWbidNav": [],

					}
				};
				sap.ui.core.BusyIndicator.show();
				this.getView().getModel().create("/QaLabelSet", payLoad, {
					success: function(oData, oResponse) {
						var WbidBatchJson = new sap.ui.model.json.JSONModel();
						WbidBatchJson.setData(oData.F4QaWbidNav.results);
						that.getView().setModel(WbidBatchJson, "JMUpdateWbid");
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(oError) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(oError.message);
						// oThat.BusyDialog.close();
					}
				});
			} else {
				sap.ui.getCore().byId("id_InEwayDate1").setValueState("Error").setValueStateText(this.getView().getModel("i18n").getResourceBundle()
					.getText("FutureDate"));
			}
		},
		getWbidDetailsforPrint: function() {
			if (sap.ui.getCore().byId("id_InEwayDate").getDateValue() <= new Date()) {
				sap.ui.getCore().byId("id_InEwayDate").setValueState("None");
				var that = this;
				// var EwayDate = this.getView().byId("id_InEwayDate").getValue();
				var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-ddThh:mm:ss"
				});
				var EwayDate = vDateFormat.format(new Date(sap.ui.getCore().byId("id_InEwayDate").getDateValue()));
				var payLoad = {

					"d": {
						"IvProcess": "F4WBID",
						"IvDate": EwayDate,
						"F4QaWbidNav": [],

					}
				};
				sap.ui.core.BusyIndicator.show();
				this.getView().getModel().create("/QaLabelSet", payLoad, {
					success: function(oData, oResponse) {
						var WbidBatchJson = new sap.ui.model.json.JSONModel();
						WbidBatchJson.setData(oData.F4QaWbidNav.results);
						that.getView().setModel(WbidBatchJson, "JMUpdateWbid");
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(oError) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(oError.message);
						// oThat.BusyDialog.close();
					}
				});
			} else {
				sap.ui.getCore().byId("id_InEwayDate").setValueState("Error").setValueStateText(this.getView().getModel("i18n").getResourceBundle()
					.getText("FutureDate"));
			}
		},
		onWbidf4: function() {
			if (!oThat.f4Wbid1) {
				oThat.f4Wbid1 = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.WbidF4", oThat);
				oThat.getView().addDependent(oThat.f4Wbid1);
			}

			oThat.f4Wbid1.open();
		},
		onWbidf4Reprint: function() {
			if (sap.ui.getCore().byId("id_InEwayDate").getValue() !== "") {
				if (!oThat.f4WbidReprint) {
					oThat.f4WbidReprint = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.WbidReprint", oThat);
					oThat.getView().addDependent(oThat.f4WbidReprint);
				}

				oThat.f4WbidReprint.open();
			} else {
				MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("ErrReprintDate"));
			}
		},
		onValueHelpConfirmBatch: function() {
			var oSelectedItem = oEvent.getParameter('selectedItem');
			this.getView().byId("id_InBatchUdateLabel").setValue(oSelectedItem.getTitle());
		},
		// fnClickGetWbid: function() {
		// 	oThat.getWbidDetails();
		// },
		onValueHelpConfirmWbid: function() {
			var oSelectedItem = oEvent.getParameter('selectedItem');
			lvwbid = oSelectedItem.getTitle();
			this.getView().byId("id_InWbid").setValue(oSelectedItem.getTitle());
		},
		onClickUpdateDecline: function() {
			sap.ui.getCore().byId("id_InEwayDate1").setValue("");
			sap.ui.getCore().byId("id_InWbid").setValue("");
			oThat.f4Wbid.close();

			// oThat.fnClear();
			// oThat.f4Wbid.destroy();
		},
		_handleConfirmBatch: function(oEvent) {
			this.SelectedRefObj = oEvent.getParameter("listItem").getBindingContext("JMEwayList").getObject();
			this.getView().getModel("JMEwayListBinding").getData().Matnr = this.SelectedRefObj.Matnr;
			// oView.getModel("HOME").getData().BillYear = this.SelectedRefObj.BillYear;
			this.getView().getModel("JMEwayListBinding").refresh();
			oThat.EwayBatch.close();
			// this.getView().getModel("JMEwayListBinding").Batch = 
		},
		fnBatchSearch: function(oEvent) {

			var vValue = oEvent.getSource().getValue();
			if (vValue) {
				var filter1 = new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.Contains, vValue);
				// var filter2 = new sap.ui.model.Filter("Bukrs", sap.ui.model.FilterOperator.Contains, vValue);
				// var filter3 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, vValue);
				// var filter4 = new sap.ui.model.Filter("BillYear", sap.ui.model.FilterOperator.Contains, vValue);
				var allfilter = new sap.ui.model.Filter([filter1]);
				var oBinding = sap.ui.getCore().byId("id_BatchSelectTab").getBinding("items");
				oBinding.filter([allfilter], false);
			} else {
				// this.PressList();
				var oBinding = sap.ui.getCore().byId("id_BatchSelectTab").getBinding("items");
				oBinding.filter([]);
			}
			// var binding = oEvent.getSource().getBinding("items");
			// binding.filter(allfilter);

			// oBinding.filter([allfilter]);
		},
		fnCloseBatch: function() {
			oThat.EwayBatch.close();
		},
		onF4BatchQA: function() {
			if (!oThat.f4QAbatch) {
				oThat.f4QAbatch = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.BatchQA", oThat);
				oThat.getView().addDependent(oThat.f4QAbatch);
			}
			oThat.f4QAbatch.open();
		},
		onScanBarcode: function(lvwbid) {

			// table_datawbid = [];
			if (lvwbid !== '' && lvwbid.sId !== 'press') {

			} else {
				lvwbid = sap.ui.getCore().byId("id_InWbid").getValue();
			}
			if (lvwbid !== "") {
				var that = this;
				var payLoad = {

					"d": {
						"IvProcess": "GETQAID",
						"IvWbid": lvwbid,
						"WbItemNav": [],
						"StatusLogNav": [],
						"WbHeaderNav": [],
						"WbPackMatNav": [],
						"ReturnNav": [],
					}
				};
				sap.ui.core.BusyIndicator.show();
				this.getView().getModel().create("/QaLabelSet", payLoad, {
					success: function(oData, oResponse) {
						// if()
						if (oData.ReturnNav.results[0].Type === 'S') {
							var EwayDetailJsonHeader = new sap.ui.model.json.JSONModel();
							EwayDetailJsonHeader.setData(oData.WbHeaderNav.results);
							that.getView().setModel(EwayDetailJsonHeader, "JMQALableUpdateHeader");
							var EwayPackItemJson = new sap.ui.model.json.JSONModel();
							EwayPackItemJson.setData(oData.WbPackMatNav.results);
							that.getView().setModel(EwayPackItemJson, "JMPackMatItem");
							// var EwayDetailJsonItem = new sap.ui.model.json.JSONModel();
							// EwayDetailJsonItem.setData(oData.WbItemNav.results);
							// that.getView().setModel(EwayDetailJsonItem, "JMQALableUpdateItem");
							if (ItemFlag === 'I') {
								var QALAbelUpdateItemData = [];
								for (var i = 0; i < oData.WbItemNav.results.length; i++) {
									// for (var j = 0; j < 1; j++) {
									if (oData.WbItemNav.results[i].Wbid === table_datawbid.Wbid && oData.WbItemNav.results[i].Item === table_datawbid.Item) {
										QALAbelUpdateItemData.push((oData.WbItemNav.results[i]));
									}
									// }
								}
								var EwayDetailJsonItem = new sap.ui.model.json.JSONModel();
								EwayDetailJsonItem.setData(QALAbelUpdateItemData);
								that.getView().setModel(EwayDetailJsonItem, "JMQALableUpdateItem");
							} else {
								var EwayDetailJsonItem = new sap.ui.model.json.JSONModel();
								EwayDetailJsonItem.setData(oData.WbItemNav.results);
								that.getView().setModel(EwayDetailJsonItem, "JMQALableUpdateItem");
							}
							var EwayDetailJsonStatuslog = new sap.ui.model.json.JSONModel();
							EwayDetailJsonStatuslog.setData(oData.StatusLogNav.results);
							that.getView().setModel(EwayDetailJsonStatuslog, "JMQALableUpdateStatus");
							var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
								pattern: "dd.MM.yyyy"
							});
							that.getView().byId("id_ewaydate").setValue(vDateFormat.format(new Date(oData.StatusLogNav.results[0].Bmcnu)));
							var JMItemModel = that.getView().getModel("JMQALableUpdateItem").getData();
							for (var i = 0; i < JMItemModel.length; i++) {
								for (var j = 0; j < oData.StatusLogNav.results.length; j++) {
									if (oData.StatusLogNav.results[j].Trnsid === oData.WbItemNav.results[i].Wbid && oData.WbItemNav.results[i].Item ===
										oData.StatusLogNav.results[j].Helperid) {
										JMItemModel[i].Dwerk = oData.StatusLogNav.results[j].SendRef;
										JMItemModel[i].Pmat2 = oData.StatusLogNav.results[j].RecRef;
										that.getView().getModel("JMQALableUpdateItem").refresh();
									}
								}
							}
							if (oThat.f4Wbid) {
								oThat.f4Wbid.close();
							}
							sap.ui.core.BusyIndicator.hide();
						} else {
							MessageBox.error(oData.ReturnNav.results[0].Message);
							sap.ui.core.BusyIndicator.hide();
						}

					},
					error: function(oError) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(oError.message);
						// oThat.BusyDialog.close();
					}
				});
			} else {
				MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("WbIdErr"));
			}
		},
		fnSegmentedChange: function() {
			if (this.getView().byId("id_segmentbtn").getSelectedKey() == "UPD") {
				this.getView().byId("id_updBtn").setVisible(true);
				this.getView().byId("id_updCheck").setVisible(true);
				this.getView().setModel(new JSONModel({}), "JMQALableUpdateHeader");
				this.getView().setModel(new JSONModel({}), "JMQALableUpdateItem");
				this.getView().setModel(new JSONModel({}), "JMQALableUpdateStatus");
				scanFlag = "";

			} else {
				this.getView().byId("id_updBtn").setVisible(false);
				this.getView().byId("id_updCheck").setVisible(false);
			}
		},
		fnUpdateQALable: function() {
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var oHeaderData = this.getView().getModel("JMQALableUpdateHeader").getData();
			var oItemData = this.getView().getModel("JMQALableUpdateItem").getData();
			var oStatusData = this.getView().getModel("JMQALableUpdateStatus").getData();
			var oPacMatdata = this.getView().getModel("JMPackMatItem").getData();
			var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddThh:mm:ss"
			});
			var Erdat = vDateFormat.format(new Date(this.getView().byId("id_ewaydate").getDateValue()));

			var vError = false;
			var VErrMsg = '';

			for (var t = 0; t < oItemData.length; t++) {
				for (var h = t + 1; h < oItemData.length; h++) {
					if ((oItemData[t].Batch).toUpperCase() === (oItemData[h].Batch).toUpperCase()) {
						vError = true;
						VErrMsg = this.getView().getModel("i18n").getResourceBundle().getText("ErrSameBatch") + "\n";
						break;
					}
				}
			}

			if (this.getView().byId("id_ewaydate").getValue() === '') {
				vError = true;
				VErrMsg = this.getView().getModel("i18n").getResourceBundle().getText("ErrEway") + "\n";
			}

			if (Erdat === '') {
				vError = true;
				VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrEwayDate") + "\n";
			}
			var lv_ItemCount;
			for (var t = 0; t < oItemData.length; t++) {
				lv_ItemCount = oItemData[t].Item;
				if (oItemData[t].Batch === '') {
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrBatch") + lv_ItemCount + "\n";
				}
				if (oItemData[t].Config1 === '' || oItemData[t].Config1 === "0.000") {
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrEwayQty") + lv_ItemCount + "\n";
				}
				if (oItemData[t].Config4 === '') {
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrEwayUom") + lv_ItemCount + "\n";
				}
				//Commented by Pavan on 26/03/2023 Start
				/*if (oItemData[t].Dwerk === '') {
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrMatCount") + lv_ItemCount + "\n";
				}*/
				//Commented by Pavan on 26/03/2023 End
				// if (oItemData[t].Pmat2 === '') {
				// 	vError = true;
				// 	VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrMatType") + "\n";
				// }

			}
			//Added by Pavan on 29/03/2023 Start
			for (var t = 0; t < oPacMatdata.length; t++) {
				lv_ItemCount = oPacMatdata[t].Item;
				if (oPacMatdata[t].Pmat === '') {
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrPackMat") + " " + lv_ItemCount + "\n";
				}
				if (oPacMatdata[t].PmatNo <= 0 ) {
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrPackQnty") + " " + lv_ItemCount + "\n";
				}
			}
			//Added by Pavan on 29/03/2023 End
			if (!vError) {
				if (oStatusData.length > 0) {
					var ewaybillno = oStatusData[0].CarteGrise
				} else {
					var ewaybillno = oStatusData.CarteGrise
				}
				var vStatusarr = [];
				for (var i = 0; i < oItemData.length; i++) {
					var vObj = {
						"Trnsid": oHeaderData[0].Wbid,
						"Item": oItemData[i].Item,
						"CarteGrise": ewaybillno,
						"Bmcnu": Erdat.toString(),
						"SendRef": oItemData[i].Dwerk,
						"RecRef": oItemData[i].Pmat2,
						"Werks": oItemData[i].Werks

					};
					vStatusarr.push(vObj);
					// oItemData[i].Pmat2 = '';
					// oItemData[i].Menge = '';
				}
				for (var y = 0; y < oItemData.length; y++) {
					if (oItemData[y].Ebeln === 'N/A') {
						oItemData[y].Ebeln = "";
					}
				}
				this.getView().getModel("JMQALableUpdateItem").refresh("true");
				var payLoad = {

					"d": {
						"IvProcess": "UPDATEQA",
						"ReturnNav": [],
						"WbItemNav": oItemData,
						"StatusLogNav": vStatusarr,
						"WbHeaderNav": oHeaderData,
						"WbPackMatNav": oPacMatdata

					}
				};

				this.getView().getModel().create("/QaLabelSet", payLoad, {
					success: function(oData, oResponse) {
						if (oData.ReturnNav.results[0].Type === 'S') {
							that.getView().byId("id_ewaydate").setValue("");
							sap.ui.core.BusyIndicator.hide();
							MessageBox.success(oData.ReturnNav.results[0].Message, {
								icon: MessageBox.Icon.SUCCESS,
								actions: [MessageBox.Action.OK],
								onClose: function(oAction) {
									if (oAction == 'OK') {
										that.fnClear();
										MessageBox.show(that.getView().getModel("i18n").getResourceBundle().getText("Msg2"), {
											icon: MessageBox.Icon.INFORMATION,
											title: that.getView().getModel("i18n").getResourceBundle().getText("Title16"),
											actions: [MessageBox.Action.YES, MessageBox.Action.NO],
											onClose: function(oAction) {
												if (oAction === 'YES') {
													var vWbid = oData.WbHeaderNav.results[0].Wbid;
													var lv_item = "0000"
														// var sServiceUrl = oThat.oModel.sServiceUrl;
													var sServiceUrl = "/sap/opu/odata/sap/ZGW_GT_MM_WB_MOBILITY_SRV";
													// var sRead = "/QaLabelPrintSet(IvProcess='PRINT',IvWbid='" + oData.WbHeaderNav.results[0].Wbid + "')/$value";
													var sRead = "/QaLabelPrintSet(IvProcess='PRINT',IvWbid='" + oData.WbHeaderNav.results[0].Wbid + "',IvItem='" +
														lv_item + "')/$value";
													var pdfURL = sServiceUrl + sRead;

													if (sap.ui.Device.system.desktop) {
														that.initiatePdfDialog();
														var oContent = "<div><iframe src=" + pdfURL + " width='100%' height='520'></iframe></div>";
														that.oImageDialog.getContent()[0].setContent(oContent);
														that.oImageDialog.addStyleClass("sapUiSizeCompact");
														that.oImageDialog.open();
													} else {
														window.open(pdfURL);
													}
												} else if (oAction === 'NO') {
													that.oRouter.navTo("EwayBill");
												}
											}
										});

									}
								}
							});

						} else {
							var Errlen = oData.ReturnNav.results.length;
							var errorMsg = "";
							for (var i = 0; i < Errlen; i++) {
								errorMsg = errorMsg + oData.ReturnNav.results[i].Message + "\n";
							}
							MessageBox.error(errorMsg);

						}
					},
					error: function(oError) {
						that.fnClear();
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(oError.message);
						// oThat.BusyDialog.close();
					}
				});
			} else {
				MessageBox.error(VErrMsg);
			}
		},
		fnClear: function() {
			this.getView().getModel("JMQALableUpdateHeader").setData('');
			this.getView().getModel("JMQALableUpdateItem").setData('');
			this.getView().getModel("JMQALableUpdateStatus").setData('');
		},
		fnCheckUpdate: function() {
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var oHeaderData = this.getView().getModel("JMQALableUpdateHeader").getData();
			var oItemData = this.getView().getModel("JMQALableUpdateItem").getData();
			var oStatusData = this.getView().getModel("JMQALableUpdateStatus").getData();
			var oPacMatdata = this.getView().getModel("JMPackMatItem").getData();

			var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddThh:mm:ss"
			});
			var Erdat = vDateFormat.format(new Date(this.getView().byId("id_ewaydate").getDateValue()));
			var vStatusarr = [];

			var vError = false;
			var VErrMsg = '';
			for (var t = 0; t < oItemData.length; t++) {
				for (var h = t + 1; h < oItemData.length; h++) {
					if ((oItemData[t].Batch).toUpperCase() === (oItemData[h].Batch).toUpperCase()) {
						vError = true;
						VErrMsg = this.getView().getModel("i18n").getResourceBundle().getText("ErrSameBatch") + "\n";
						break;
					}
				}
			}
			if (this.getView().byId("id_ewaydate").getDateValue() === '') {
				vError = true;
				VErrMsg = this.getView().getModel("i18n").getResourceBundle().getText("ErrEway") + "\n";
			}

			if (Erdat === '') {
				vError = true;
				VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrEwayDate") + "\n";
			}
			var lv_ItemCount;
			for (var t = 0; t < oItemData.length; t++) {
				lv_ItemCount = oItemData[t].Item;
				if (oItemData[t].Batch === '') {
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrBatch") + " " + lv_ItemCount + "\n";
				}
				if (oItemData[t].Config1 === '' || oItemData[t].Config1 === "0.000") {
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrEwayQty") + " " + lv_ItemCount + "\n";
				}
				if (oItemData[t].Config4 === '') {
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrEwayUom") + " " + lv_ItemCount + "\n";
				}
				//Commented by Pavan on 26/03/2023 Start
				/*if (oItemData[t].Dwerk === '') {
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrMatCount") + " " + lv_ItemCount + "\n";
				}*/
				//Commented by Pavan on 26/03/2023 End
				// if (oItemData[t].Pmat2 === '') {
				// 	vError = true;
				// 	VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrMatType") + "\n";
				// }

			}
			//Added by Pavan on 29/03/2023 Start
			for (var t = 0; t < oPacMatdata.length; t++) {
				lv_ItemCount = oPacMatdata[t].Item;
				if (oPacMatdata[t].Pmat === '') {
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrPackMat") + " " + lv_ItemCount + "\n";
				}
				if (oPacMatdata[t].PmatNo <= 0 ) {
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrPackQnty") + " " + lv_ItemCount + "\n";
				}
			}
			//Added by Pavan on 29/03/2023 End
			
			// sap.ui.core.BusyIndicator.show();
			if (!vError) {
				if (oStatusData.length > 0) {
					var ewaybillno = oStatusData[0].CarteGrise
				} else {
					var ewaybillno = oStatusData.CarteGrise
				}
				for (var i = 0; i < oItemData.length; i++) {
					var vObj = {
						"Trnsid": oHeaderData[0].Wbid,
						"Item": oItemData[i].Item,
						"CarteGrise": ewaybillno,
						"Bmcnu": Erdat.toString(),
						"SendRef": oItemData[i].Dwerk,
						"RecRef": oItemData[i].Pmat2,
						"Werks": oItemData[i].Werks
					};
					vStatusarr.push(vObj);
					// oItemData[i].Pmat2 = '';
				}
				var payLoad = {

					"d": {
						"IvProcess": "CHECKUPDAT",
						"ReturnNav": [],
						"WbItemNav": oItemData,
						"StatusLogNav": vStatusarr,
						"WbHeaderNav": oHeaderData,
						"WbPackMatNav": oPacMatdata

					}
				};

				this.getView().getModel().create("/QaLabelSet", payLoad, {
					success: function(oData, oResponse) {

						if (oData.ReturnNav.results[0].Type === 'S') {

							MessageBox.success(oData.ReturnNav.results[0].Message, {
								icon: MessageBox.Icon.SUCCESS,
								actions: [MessageBox.Action.OK],
								onClose: function(oAction) {
									if (oAction == 'OK') {
										// that.oRouter.navTo("EwayBill");
									}
								}
							});
							sap.ui.core.BusyIndicator.hide();

						} else {
							var Errlen = oData.ReturnNav.results.length;
							var errorMsg = "";
							for (var i = 0; i < Errlen; i++) {
								errorMsg = errorMsg + oData.ReturnNav.results[i].Message + "\n";
							}
							MessageBox.error(errorMsg);
							// MessageBox.error(oData.ReturnNav.results[0].Message);
						}
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(oError) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(oError.message);

					}
				});
			} else {
				sap.ui.core.BusyIndicator.hide();
				MessageBox.error(VErrMsg);
			}
		},
		fnlivechangeOnlyNumber: function(oEvent) {
			var _oInput = oEvent.getSource();
			var val = _oInput.getValue();
			val = val.replace(/[^\d]/g, '');
			_oInput.setValue(val);
		},
		fnFilterWbid: function(oEvent) {
			var vValue = oEvent.getParameters("value").newValue;
			if (vValue) {
				var filter1 = new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.Contains, vValue);
				var filter2 = new sap.ui.model.Filter("Vehno", sap.ui.model.FilterOperator.Contains, vValue);
				// var filter3 = new sap.ui.model.Filter("VendorName", sap.ui.model.FilterOperator.Contains, vValue);
				// var filter4 = new sap.ui.model.Filter("Vehno", sap.ui.model.FilterOperator.Contains, vValue);
				// var filter5 = new sap.ui.model.Filter("Vehtype", sap.ui.model.FilterOperator.Contains, vValue);
				var allfilter = new sap.ui.model.Filter([filter1, filter2]);
				var oBinding = this.getView().byId("id_NewEwayTab").getBinding("items");
				oBinding.filter([allfilter], false);
			} else {
				// this.PressList();
				var oBinding = this.getView().byId("id_NewEwayTab").getBinding("items");
				oBinding.filter([]);
			}
		},

		fnSearchScanWbid: function() {

			scanFlag = 'Y';
			this.fnScanWbid();
		},

		// 	var oThat = this;
		// 	var oBundle = oThat.getView().getModel("i18n").getResourceBundle();
		// 	var oVideoDeviceModel = new JSONModel();
		// 	//Initialize the ZXing QR Code Scanner
		// 	if (ZXing !== undefined) {
		// 		// if (!sap.ui.Device.system.desktop) { //Other than desktop
		// 		codeReader = new ZXing.BrowserMultiFormatReader();
		// 		codeReader.listVideoInputDevices().then((videoInputDevices) => {
		// 			if (videoInputDevices.length > 1) {
		// 				selectedDeviceId = videoInputDevices[1].deviceId; //Mobile Back Camera
		// 			} else if (videoInputDevices.length === 1) {
		// 				selectedDeviceId = videoInputDevices[0].deviceId; //Default Camera
		// 			} else { //Desktop Version
		// 				sap.ndc.BarcodeScanner.scan(
		// 					function(mResult) {
		// 						if (!mResult.cancelled) {
		// 							oThat.onScanWbidFilter(mResult.text.trim());
		// 						}
		// 					},
		// 					function(Error) {
		// 						sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

		// 					},
		// 				);
		// 			}
		// 			if (videoInputDevices.length >= 1) {
		// 				var aDevice = [];
		// 				videoInputDevices.forEach((element) => {
		// 					var sourceOption = {};
		// 					sourceOption.text = element.label;
		// 					sourceOption.value = element.deviceId;
		// 					aDevice.push(sourceOption);
		// 					oVideoDeviceModel.setData(aDevice);
		// 					this.getView().setModel(oVideoDeviceModel, "oVideoDeviceModel");
		// 					oComboBox = new sap.m.ComboBox({
		// 						items: {
		// 							path: "oVideoDeviceModel>/",
		// 							template: new sap.ui.core.Item({
		// 								key: "{oVideoDeviceModel>value}",
		// 								text: "{oVideoDeviceModel>text}"
		// 							})
		// 						},
		// 						selectedKey: selectedDeviceId,
		// 						selectionChange: function(oEvt) {
		// 							selectedDeviceId = oEvt.getSource().getSelectedKey();
		// 							oThat._oScanQRDialog.close();
		// 							codeReader.reset()

		// 						}
		// 					});

		// 					sStartBtn = new sap.m.Button({
		// 						text: oBundle.getText("Start"),
		// 						type: oBundle.getText("Accept"),
		// 						press: function() {
		// 							oThat._oScanQRDialog.close();
		// 							oThat.fnScanWB();
		// 						}

		// 					})

		// 					oThat.startScanning();
		// 				})
		// 			}
		// 		});
		// 	} else {
		// 		sap.ndc.BarcodeScanner.scan(
		// 			function(mResult) {
		// 				if (!mResult.cancelled) {
		// 					oThat.onScanWbidFilter(mResult.text.trim());
		// 				}
		// 			},
		// 			function(Error) {
		// 				sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);
		// 			},
		// 		);
		// 	}
		// },

		// startScanning: function() {
		// 	var oThat = this;
		// 	var oView = oThat.getView();
		// 	var oBundle = oView.getModel("i18n").getResourceBundle();
		// 	try { //Checking barcodescanner plugin is available or not
		// 		var s = cordova.plugins.barcodeScanner;
		// 		if (s) {
		// 			sApplicationFlag = true; // Barcode Scanner is avilable; Running in Fiori Client
		// 		} else {
		// 			sApplicationFlag = false; // Barcode Scanner is not-avilable
		// 		}
		// 	} catch (e) {
		// 		sApplicationFlag = false; // Barcode Scanner is not avilable; Running in Browser
		// 	}
		// 	if (sApplicationFlag === false && sap.ui.Device.system.desktop === false) { //No Barcode Scanner Plugin and Mobile/Tablet Browser
		// 		if (!this._oScanQRDialog) {
		// 			this._oScanQRDialog = new sap.m.Dialog({
		// 				title: oBundle.getText("ScanQRcode"),
		// 				contentWidth: "640px",
		// 				contentHeight: "480px",
		// 				horizontalScrolling: false,
		// 				verticalScrolling: false,
		// 				stretchOnPhone: true,
		// 				content: [
		// 					new sap.ui.core.HTML({
		// 						id: this.createId("scanContainer_QR"),
		// 						content: "<video />"
		// 					})
		// 				],
		// 				endButton: new sap.m.Button({
		// 					text: oBundle.getText("Cancel"),
		// 					press: function(oEvent) {
		// 						this._oScanQRDialog.close();
		// 						codeReader.reset();
		// 						sap.ndc.BarcodeScanner.scan(
		// 							function(mResult) {
		// 								if (!mResult.cancelled) {
		// 									oThat.onScanWbidFilter(mResult.text.trim());
		// 								}
		// 							},
		// 							function(Error) {
		// 								sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

		// 							},
		// 						);
		// 					}.bind(this)
		// 				}),
		// 				afterOpen: function() {
		// 					codeReader.decodeFromVideoDevice(selectedDeviceId, oView.byId("scanContainer_QR").getDomRef(), (result, err) => {
		// 						if (result) {
		// 							this._oScanQRDialog.close();
		// 							codeReader.reset()
		// 							oThat.onScanWbidFilter(result.text.trim());
		// 						}
		// 						if (err && !(err instanceof ZXing.NotFoundException)) {
		// 							// oView.byId("idInOutBond").setValue("");
		// 						}
		// 					})
		// 				}.bind(this),
		// 				afterClose: function() {}
		// 			});
		// 			oView.addDependent(this._oScanQRDialog);
		// 		}
		// 		this._oScanQRDialog.open();
		// 	} else { //QR Scanner is available and on Mobile Fiori Client
		// 		sap.ndc.BarcodeScanner.scan(
		// 			function(mResult) {
		// 				if (!mResult.cancelled) {
		// 					oThat.onScanWbidFilter(mResult.text.trim());
		// 				}
		// 			},
		// 			function(Error) {
		// 				sap.m.MessageToast(oBundle.getText("ScanningFailed") + " " + Error);

		// 			},
		// 		);
		// 	}

		// },

		onScanWbidFilter: function(oBarcodeData) {
			var self = this;
			self.Scan = true;
			var vValue = oBarcodeData;
			var list = this.getView().byId("id_NewEwayTab");
			if (vValue && vValue.length > 0) {
				var oFilter = new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.Contains, vValue);
				var aFilters = new sap.ui.model.Filter([oFilter]);
			}
			var binding = list.getBinding("items");
			binding.filter(aFilters);
		},

		fnClearFilter: function(oEvent) {
			var self = this;
			if (self.Scan) {
				var vData = "";
				self.onScanWbidFilter(vData);
				self.getView().byId("id_SearchFieldWbid").setValue("");
				self.Scan = false;
			}
			// self._onRouteMatched();
		},
		fnValidateEwayQty: function(oEvent) {
			var EwayData = this.getView().getModel("JMQALableUpdateItem").getData();
			var oPath = oEvent.getSource().getBindingContext("JMQALableUpdateItem").getPath();
			var vIndex = oPath.split("/");
			var EwayQtyIndex = vIndex[1];
			if (Number(oEvent.mParameters.value).toString().length <= 13) {
				EwayData[EwayQtyIndex].Config1 = Number(EwayData[EwayQtyIndex].Config1).toFixed(3);
			} else {
				EwayData[EwayQtyIndex].Config1 = "";
				this.getView().getModel("JMQALableUpdateItem").refresh("true");
				MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("EnterValid"));
			}
		},
		onF4PackMatType: function(oEvent) {
			if (!this.fragPackmat) {
				this.fragPackmat = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PackingMat", this);
				this.getView().addDependent(this.fragPackmat);
			}

			var oPathPack = oEvent.getSource().getBindingContext("JMPackItem").getPath();
			var vIndexPack = oPathPack.split("/");
			PackMatf4_index = vIndexPack[1]
			this.fngetPackMat();
			this.fragPackmat.open();
		},
		fngetPackMat: function() {
			sap.ui.core.BusyIndicator.show();
			var that = this;

			var payLoad = {

				"d": {
					"IvProcess": "PACKMATF4",
					"PackMatNav": [],
					"ReturnNav": [],
					"IvWbid": that.getView().getModel("JMQALableUpdateItem").getData()[0].Wbid,	//Added by Pavan on 05/04/2023
					"IvItem": this.getView().getModel("JMPackItem").getData()[0].Item //Added by Pavan on 18/04/2023
				}
			};
			this.getView().getModel().create("/QaLabelSet", payLoad, {
				success: function(oData, oResponse) {
					var PackJson = new sap.ui.model.json.JSONModel();
					PackJson.setData(oData.PackMatNav.results);
					that.getView().setModel(PackJson, "JMPackMat");
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(oError.message);
				}
			});
		},
		onValueHelpSearchPack: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter;
			if (sValue == undefined) {
				sValue = "";
			}
			oFilter = new sap.ui.model.Filter([
				new Filter("Bagtyp", sap.ui.model.FilterOperator.Contains, sValue)
			]);
			var oFilter2 = new sap.ui.model.Filter(oFilter, false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter2]);
		},

		onValueHelpConfirmPackMat: function(oEvent) {
			var oSelectedItem = oEvent.getParameter('selectedItem');
			var packingTare = this.getView().getModel("JMPackItem").getData();
			var oSelectedItem = oEvent.getParameter('selectedItem');
			packingTare[PackMatf4_index].Pmat = oSelectedItem.getTitle();
			// packingTare[PackMatf4_index].Pmat2 = oSelectedItem.getTitle();
			this.getView().getModel("JMPackItem").refresh("true");
		},
		fnOpenPackingMaterialDetail: function(oEvent) {
			if (!this.Packingmat) {
				this.Packingmat = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PackingDetail", this);
				this.getView().addDependent(this.Packingmat);
			}
			this.Packingmat.open();
			var oPackMatPath = oEvent.getSource().getBindingContext("JMQALableUpdateItem").getPath();
			var oPacMatHeader = this.getView().getModel("JMQALableUpdateItem").getData();
			var oPacMatItem = this.getView().getModel("JMPackMatItem").getData();
			var vIndexPack = oPackMatPath.split("/");
			PackMatDetIndex = vIndexPack[1];
			var TempItemarr = [];
			for (var i = 0; i < oPacMatItem.length; i++) {
				if (oPacMatHeader[PackMatDetIndex].Item === oPacMatItem[i].Item) {
					TempItemarr.push(oPacMatItem[i]);
				}
			}
			PacMaterialLength = TempItemarr.length;
			var JMPackItems = new sap.ui.model.json.JSONModel();
			JMPackItems.setData(TempItemarr);
			this.getView().setModel(JMPackItems, "JMPackItem");
		},
		closePackMatDetailshDialog: function() {
			this.Packingmat.close();
		},
		onSavePackMAtDetails: function() {

			this.Packingmat.close();
		},
		fnLivechangePackingTare: function(oEvent) {
			if (oEvent.mParameters.value !== '') {
				var packingTare = this.getView().getModel("JMPackItem").getData();
				var oPath = oEvent.getSource().getBindingContext("JMPackItem").getPath();
				var vIndex = oPath.split("/");
				var Packingtare_index = vIndex[1];
				if (Number(oEvent.mParameters.value).toString().length <= 7) {

					packingTare[Packingtare_index].PmatWt = Number(oEvent.mParameters.value).toFixed(3);

					packingTare[Packingtare_index].TotPmatWt = Number(packingTare[Packingtare_index].PmatWt * packingTare[Packingtare_index].PmatNo)
						.toFixed(3);

					this.getView().getModel("JMPackItem").refresh(true);

				} else {
					var lv_zero = "0";
					packingTare[PackMatDetIndex].PmatWt = Number(lv_zero).toFixed(3);
					// packingTare[PackMatDetIndex].TotPackMatWt = Number(packingTare[Packingtare_index].PmatWt * packingTare[PackMatDetIndex].PmatNo)
					// 	.toFixed(3);
					packingTare[Packingtare_index].TotPmatWt = Number(packingTare[Packingtare_index].PmatWt * packingTare[Packingtare_index].PmatNo)
						.toFixed(3);
					// this.getView().getModel("JMPackItem").refresh(true);
					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("EnterValid"));
				}
			}
		},
		fnLivechangePackingQty: function(oEvent) {

			if (oEvent.mParameters.value !== '') {
				var packingTare = this.getView().getModel("JMPackItem").getData();
				var oPath = oEvent.getSource().getBindingContext("JMPackItem").getPath();
				var vIndex = oPath.split("/");
				var Packingtare_index = vIndex[1];

				if (packingTare[Packingtare_index].Brgew === "") {
					packingTare[Packingtare_index].Brgew = 0;
				}
				if (packingTare[Packingtare_index].Ntgew === "") {
					packingTare[Packingtare_index].Ntgew = 0;
				}
				if (Number(oEvent.mParameters.value).toString().length <= 7) {
					packingTare[Packingtare_index].PmatNo = Number(oEvent.mParameters.value);
					packingTare[Packingtare_index].TotPmatWt = Number(packingTare[Packingtare_index].PmatWt * packingTare[Packingtare_index].PmatNo)
						.toFixed(3);
					packingTare[Packingtare_index].PmatNo = Number(oEvent.mParameters.value).toString();
					this.getView().getModel("JMPackItem").refresh(true);
				} else {
					var lv_zero = "0";
					packingTare[Packingtare_index].PmatNo = Number(lv_zero).toFixed(3);
					packingTare[Packingtare_index].TotPmatWt = Number(packingTare[Packingtare_index].PmatWt * packingTare[Packingtare_index].PmatNo)
						.toFixed(3);
					this.getView().getModel("JMTMPItem").refresh(true);
					packingTare[Packingtare_index].PmatNo = Number(lv_zero).toString();
					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("EnterValid"));
				}
			}
		},
		fnAddItem: function(oEvent) {
			var copiedObj = oEvent.getSource().getBindingContext("JMWsHeader").getObject();
			var copyData = this.getView().getModel("JMWsHeader").getData();
			var copyObj = {
				GrossPackMatWt: copiedObj.GrossPackMatWt,
				Brgew: copiedObj.Brgew,
				Ntgew: copiedObj.Ntgew,
				MatUom: copiedObj.MatUom,
				Matnr: copiedObj.Matnr,
				Batch: copiedObj.Batch,
				Item: lv_temItem,

			};
			copyData.push(copyObj);
			this.getView().getModel("JMWsHeader").setData(copyData);
			this.getView().getModel("JMWsHeader").refresh(true);
			// var lv_itemMap = Number(copyData[copyData.length - 1].Item.substr(4, 1)) + 1;
			// var Item_len = this.getView().getModel("JMWsItem").getData().length;
			for (var t = 0; t < MatItem_len; t++) {
				var copyObjItem = {
					Item: lv_temItem,
					Pmat: copyDataItem[t].Pmat,
					PmatNo: copyDataItem[t].PmatNo,
					PmatWt: copyDataItem[t].PmatWt,
					TotPmatWt: copyDataItem[t].TotPmatWt,
					PackMatUom: copyDataItem[t].PackMatUom,
				};
				copyDataItem.push(copyObjItem);
			}
			this.getView().getModel("JMWsItem").setData(copyDataItem);
			this.getView().getModel("JMWsItem").refresh(true);
			for (var i = 0; i < copyData.length; i++) {
				lv_netWeight = Number(lv_netWeight) + Number(copyData[i].Ntgew);
				lv_grossWt = Number(lv_grossWt) + Number(copyData[i].Brgew);
				tot_pacwtg = Number(tot_pacwtg) + Number(copyData[i].GrossPackMatWt);
			}
			this.getView().byId("id_pacmatQty").setText(Number(tot_pacwtg).toFixed(3));
			this.getView().byId("id_Grossweight").setText(Number(lv_grossWt).toFixed(3));
			this.getView().byId("id_Netweight").setText(Number(lv_netWeight).toFixed(3));

		},
		onItemDelete: function(oEvent) {
			var lv_netWeight = 0;
			var lv_grossWt = 0;
			var tot_pacwtg = 0;
			var oModel = this.getView().getModel("JMWsHeader");
			var packingTareData = this.getView().getModel("JMWsHeader").getData();
			var TempPackinTare = [];
			var packingtaredaataItem = this.getView().getModel("JMWsItem").getData();
			var packingMatItem = this.getView().getModel("JMTMPItem").getData();
			var data = oModel.getData();
			var vDeleteObj = oEvent.getSource().getBindingContext("JMWsHeader").getObject();
			// var JMModelHeader = 
			var that = this,
				oThat = this;
			//	var oTable = this.getView().byId("processItemTableId");
			if (data.length > 1) {
				var oPath = oEvent.getSource().getBindingContext("JMWsHeader").getPath();
				var vIndex = oPath.split("/");
				var index = vIndex[1];

				var lv_netweight = 0;
				// for (var t = 0; t < packingMatItem.length; t++) {
				// 	if (packingTareData[index].Item === packingMatItem[t].Item) {
				// 		packingMatItem.splice(t, 1);
				// 	}
				// }

				for (var t = 0; t < packingtaredaataItem.length; t++) {
					if (packingTareData[index].Item === packingtaredaataItem[t].Item) {
						// packingtaredaataItem.splice(t, 1);
						TempPackinTare.push(packingtaredaataItem[t]);
					}
				}

				for (var k = 0; k < packingtaredaataItem.length; k++) {
					for (var g = 0; g < TempPackinTare.length; g++) {
						if (packingtaredaataItem[k].Item === TempPackinTare[g].Item) {
							packingtaredaataItem.splice(k, 1);
						}
					}
				}
				data.splice(vIndex[1], 1);
				oModel.setData(data);
				oModel.refresh(true);
				var count = 0;
				for (var h = 0; h < packingTareData.length; h++) {
					count++;
					for (var l = 0; l < packingtaredaataItem.length; l++) {
						// count++;
						if (packingTareData[h].Item === packingtaredaataItem[l].Item) {
							if (count < 9) {

								packingtaredaataItem[l].Item = "0000" + count;
							} else if (count >= 99 && count < 999) {
								packingtaredaataItem[l].Item = "00" + count;
							} else if (count >= 999) {
								packingtaredaataItem[l].Item = "0" + count;
							} else {
								packingtaredaataItem[l].Item = "000" + count;
							}

							// 					if (count < 9) {
							// 	var lv_temItem = "0000" + (lv_item + 1);
							// } else if (lv_item >= 99) {
							// 	var lv_temItem = "00" + (lv_item + 1);
							// } else {
							// 	var lv_temItem = "000" + (lv_item + 1);
							// }

						}
					}
					if (count < 9) {
						packingTareData[h].Item = "0000" + count;
					} else if (count >= 99 && count < 999) {
						packingTareData[h].Item = "00" + count;
					} else if (count >= 999) {
						packingTareData[h].Item = "0" + count;
					} else {
						packingTareData[h].Item = "000" + count;
					}
				}
				this.getView().getModel("JMWsHeader").refresh("true");
				this.getView().getModel("JMWsItem").refresh("true");

				// to get total net weight
				// for (var t = 0; t < packingTareData.length; t++) {
				// 	(lv_netweight) = parseInt(lv_netweight) + parseInt(packingTareData[t].Ntgew);
				// }

				for (var i = 0; i < packingTareData.length; i++) {

					lv_netWeight = Number(lv_netWeight) + Number(packingTareData[i].Ntgew);
					lv_grossWt = Number(lv_grossWt) + Number(packingTareData[i].Brgew);
					tot_pacwtg = Number(tot_pacwtg) + Number(packingTareData[i].GrossPackMatWt);
					// lv_netWeight = packingTare[i].Ntgew;
					// lv_grossWt = packingTare[i].Brgew;
					// tot_pacwtg = packingTare[i].TotPackMatWt;
				}
				this.getView().byId("id_pacmatQty").setText(Number(tot_pacwtg).toFixed(3));
				this.getView().byId("id_Grossweight").setText(Number(lv_grossWt).toFixed(3));
				this.getView().byId("id_Netweight").setText(Number(lv_netWeight).toFixed(3));
				// this.getView().byId("id_Netweight").setText(Number(lv_netweight).toFixed(3));
			} else {
				MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("Singledel"));
			}

		},
		onUOMf4: function(oEvent) {
			var oThat = this;
			if (!oThat.f4Uom) {
				oThat.f4Uom = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Uom", oThat);
				oThat.getView().addDependent(oThat.f4Uom);
			}
			var Vindex = oEvent.getSource().getBindingContext("JMQALableUpdateItem").getPath().split("/");
			oThat.fnUomData(Vindex);
			oThat.f4Uom.open();
		},
		fnUomData: function(Vindex) {
			var that = this;
			var oItemData = this.getView().getModel("JMQALableUpdateItem").getData();
			indexUom = Vindex[1];
			sap.ui.core.BusyIndicator.show();
			var Data = [
				new Filter("ImMatnr", sap.ui.model.FilterOperator.EQ, oItemData[indexUom].Matnr),
				new Filter("Uom", sap.ui.model.FilterOperator.EQ, 'X')
			];
			this.getView().getModel().read("/F4ParametersSet", {
				filters: Data,
				urlParameters: {
					$expand: "F4UomNav"
				},
				success: function(oData, oResponse) {
					var JMUom = new sap.ui.model.json.JSONModel();
					JMUom.setData(oData.results[0].F4UomNav.results);
					that.getView().setModel(JMUom, "UOM");
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(oError) {
					MessageBox.error(oError);
					sap.ui.core.BusyIndicator.hide();

				}
			});
		},
		onValueHelpConfirmUom: function(oEvent) {
			var oSelectedItem = oEvent.getParameter('selectedItem');
			this.getView().getModel("JMQALableUpdateItem").getData()[indexUom].Config4 = oSelectedItem.getTitle();
			this.getView().getModel("JMQALableUpdateItem").refresh("true");
		},
		fnAddItem: function(oEvent) {
			// PacMaterialLength = 0;
			if (PacMaterialLength < 3) {

				var copiedObj = oEvent.getSource().getBindingContext("JMPackItem").getObject();
				var copyData = this.getView().getModel("JMPackItem").getData();
				var ItemData = this.getView().getModel("JMPackMatItem").getData();
				var copyObj = {
					Pmat: copiedObj.Pmat,
					PmatWt: copiedObj.PmatWt,
					PmatNo: copiedObj.PmatNo,
					TotPmatWt: copiedObj.TotPmatWt,
					PackMatUom: copiedObj.PackMatUom,
					Item: copiedObj.Item

				};
				copyData.push(copyObj);
				ItemData.push(copyObj);
				// this.getView().getModel("JMWsHeader").setData(copyData);
				this.getView().getModel("JMPackItem").refresh(true);
				this.getView().getModel("JMPackMatItem").refresh(true);
				PacMaterialLength++;
			} else {
				MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("AddItemErr"));
			}

		},
		onItemDelete: function(oEvent) {
			var oModel = this.getView().getModel("JMPackItem");
			var data = oModel.getData();
			var ItemData = this.getView().getModel("JMPackMatItem").getData();
			var Deleteobj = oEvent.getSource().getBindingContext("JMPackItem").getObject();
			var that = this;
			if (data.length > 1) {
				var oPath = oEvent.getSource().getBindingContext("JMPackItem").getPath();
				var vIndex = oPath.split("/");
				var index = vIndex[1];

				for (var t = 0; t < ItemData.length; t++) {
					if (Deleteobj.Item === ItemData[t].Item && Deleteobj.TotPmatWt === ItemData[t].TotPmatWt && Deleteobj.Pmat === ItemData[t].Pmat &&
						Deleteobj.PmatWt === ItemData[t].PmatWt && Deleteobj.PmatNo === ItemData[t].PmatNo) {
						ItemData.splice(t, 1);
						break;
					}
				}
				data.splice(vIndex[1], 1);
				oModel.setData(data);
				oModel.refresh(true);
				this.getView().getModel("JMPackMatItem").refresh("true");

				PacMaterialLength = this.getView().getModel("JMPackMatItem").getData().length;

			} else {
				MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("Singledel"));
			}

		}

		// onReprintQALable: function() {
		// 	var vWbid = sap.ui.getCore().byId("id_InWbid").getValue();
		// 	var sServiceUrl = oThat.oModel.sServiceUrl;
		// 	var vSelectedLots = "";
		// 	var sRead = "/DownloadSet(IvWbid='" + vWbid + "',IvPrint='X',GateEntry='X',IvBatch='" + vSelectedLots +
		// 		"')/$value";
		// 	var pdfURL = sServiceUrl + sRead;
		// 	if (sap.ui.Device.system.desktop) {
		// 		oThat.initiatePdfDialog();
		// 		var oContent = "<div><iframe src=" + pdfURL + " width='100%' height='520'></iframe></div>";
		// 		oThat.oImageDialog.getContent()[0].setContent(oContent);
		// 		oThat.oImageDialog.addStyleClass("sapUiSizeCompact");
		// 		oThat.oImageDialog.open();
		// 	} else {
		// 		window.open(pdfURL);
		// 	}
		// }
	});

});