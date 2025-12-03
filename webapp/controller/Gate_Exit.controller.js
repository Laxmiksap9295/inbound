var oThat;
jQuery.sap.require("sap.ndc.BarcodeScanner"); //Added by Avinash
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/BusyDialog",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	'sap/m/TablePersoController',
	// 'ZGT_MM_INBOUND/lib/DemoPersoService'
	'ZGT_MM_INBOUND/Util/DemoPersoExit'
], function (Controller, MessageBox, BusyDialog, JSONModel, Filter, TablePersoController, DemoPersoExit) {
	"use strict";
	var sApplicationFlag, selectedDeviceId, codeReader, selectedDeviceId, oComboBox, sStartBtn, sResetBtn; //Added by Avinash
	return Controller.extend("ZGT_MM_INBOUND.controller.Gate_Exit", {
		onInit: function () {
			oThat = this;
			oThat.Images = []; // added by srinivas on 21/08/2025
			oThat.BusyDialog = new BusyDialog();
			oThat.oView = this.getView();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("GateExit").attachMatched(this._onRouteMatched, this);

			this._oTPC1 = new TablePersoController({
				table: oThat.oView.byId("id_gateexit2"),
				//specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
				// componentName: "demoApp",
				persoService: DemoPersoExit
			}).activate();
		},

		//Added by Avinash
		onExit: function () {
			if (this._oTPC1 != undefined) {
				this._oTPC1.destroy();
				//Added by Avinash
				this.byId("id_gateexit2").destroy();
				//EOC by Avinash
			}
		},
		//End of Added	

		//======================================================================================//
		//========================= Router matched handler function ===========================//
		//====================================================================================//
		_onRouteMatched: function (oEvent) {
			oThat.BusyDialog = new BusyDialog();
			oThat = this;
			//BOC by Avinash
			oThat.getView().byId("id_SearchFieldGE").setValue("");
			//EOC by Avinash
			oThat.oView = oThat.getView();
			oThat.oView.setModel(new JSONModel(), "oViewModel"); // Model added by kirubakaran for brazil plant on 15.07.2020 to set Nota-Fisical Number//
			oThat.oView.getModel("oViewModel").setProperty("/cmsContract", false);
			oThat.oView.getModel("oViewModel").setProperty("/refNumber", false);
			oThat.oModel = oThat.getOwnerComponent().getModel();
			if (sap.ui.Device.system.phone) {
				oThat.oDevice = "P";
			} else {
				oThat.oDevice = "D";
			}
			oThat.Service = 'GET';
			var oEntity = {
				"d": {
					"GateEntry": "",
					"VehAssign": "",
					"PreQual": "",
					"UnloadConf": "",
					"GateExit": "X",
					"Inbound": "X",
					"Outbound": "",
					"IvDelivery": "",
					"IvPo": "",
					"IvWbid": "",
					"IvWerks": "",
					"GateExitNav": []
				}
			};
			oThat.onCallService(oThat.Service, oEntity);
		},
		//===============================================================================================//
		//================================= Service call ===============================================//
		//=============================================================================================//
		onCallService: function (service, Data) {
			oThat.BusyDialog.open();
			if (oThat.Service === 'GET' || oThat.Service === 'ITEM') {
				oThat.oModel.create("/GetHeadersSet", Data, {
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service === 'GATE') {
				oThat.oModel.read("/F4GatesSet", {
					filters: Data,
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service === 'EXIT') {
				oThat.oModel.create("/PostHeadersSet", Data, {
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			}
		},

		mySuccessHandler: function (oData) {
			oThat.BusyDialog.close();
			if (oThat.Service === 'GET') {
				oThat.oExitData = JSON.parse(JSON.stringify(oData));
				var oQualityModel = new JSONModel(oData);
				oThat.oView.setModel(oQualityModel, "oExitModel");
				//Added by Avinash
				var oUnloadModelDel = new JSONModel(oData);
				oThat.oView.setModel(oUnloadModelDel, "oExitModelDel");
				//End of added
			} else if (oThat.Service == 'ITEM') {
				oThat.EvWtype = oData.EvWtype;
				var oQualityModel = new JSONModel(oData);
				oThat.oView.setModel(oQualityModel, "ITEM");
				// added by dharma on 15-10-2020

				var vWerks = oThat.getView().getModel("ITEM").getData().WbHeaderNav.results[0].Werks;
				oThat.Service = 'GATE';
				var filter = [
					new Filter("Werks", sap.ui.model.FilterOperator.EQ, vWerks),
					new Filter("Wbobj", sap.ui.model.FilterOperator.EQ, oThat.EvWtype)
				];
				oThat.onCallService(oThat.Service, filter);
				oThat.getView().getModel("ITEM").getData().WbHeaderNav.results[0].Gate = "";
				oThat.getView().getModel("ITEM").getData().WbHeaderNav.results[0].GateName = "";
				oThat.getView().getModel("ITEM").refresh();
				if (oData.WbHeaderNav.results.length === 1) {
					if (oData.WbHeaderNav.results[0].Config3 !== "") {
						oData.WbHeaderNav.results[0].Gate = oData.WbHeaderNav.results[0].Config3;
						oData.WbHeaderNav.results[0].GateName = oData.WbHeaderNav.results[0].GateName;
					}
				} else {
					oData.WbHeaderNav.results[0].Gate = "";
				}
				// ended by dharma on 15-10-2020

				//added by srinivas on 12/08/2025 GRN validation
				if (oData.WbHeaderNav.results.length === 1) {
					var config15Value = oData.WbHeaderNav.results[0].Config15;
					var oModel = oThat.getView().getModel("ITEM");
					var oDataModel = oModel.getData();
					if (config15Value && config15Value.trim() !== "") {
						var messageText = config15Value.substring(config15Value.indexOf("-") + 1).trim();
						var messageType = config15Value.split("-")[0].trim();
						oDataModel.WbHeaderNav.results[0].Config15 = messageText;
						if (messageType === "W") {
							oDataModel.WbHeaderNav.results[0].Config15UIType = "Warning";
						} else {
							oDataModel.WbHeaderNav.results[0].Config15UIType = "Information";
						}
						oDataModel.WbHeaderNav.results[0].Config15UIMsgStrip = true;
					} else {
						oDataModel.WbHeaderNav.results[0].Config15UIMsgStrip = false;
					}
					oModel.refresh(true);
				}

				//Ended by srinivas on 12/08/2025 GRN validation

				//code added by kirubakaran on 17.09.2020 for brazil plant
				if (oData.WbHeaderNav.results.length > 0) {
					if (oData.WbHeaderNav.results[0].Status === "X") {
						oThat.oView.getModel("oViewModel").setProperty("/cmsContract", true);
					} else if (oData.WbHeaderNav.results[0].Status === "A") {
						MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsgCMS"));
						oThat.GateExitFrag.destroy();
					}
					/*for only RGP and NRGP functionality start*/
					if (oData.WbHeaderNav.results[0].Config16.trim().length > 0 && oData.WbHeaderNav.results[0].Wtype === "MISC") {
						oThat.oView.getModel("oViewModel").setProperty("/refNumber", true);
					}
					/*for only RGP and NRGP functionality end*/
				}
				//code ended by kirubakaran on 17.09.2020 for brzil plant
			} else if (oThat.Service === 'GATE') {
				oThat.oView.setModel(new JSONModel(oData), "GATE");
				if (oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Config3 === "") {
					if (oData.results.length === 1) {
						oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Gate = oData.results[0].Gate;
						oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].GateName = oData.results[0].GateName;
						oThat.oView.getModel("ITEM").refresh();
					}
				}

			} else if (oThat.Service === 'EXIT') {
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
							Message = aError[i].Message + "\n" + Message;
						}
						MessageBox.error(Message);
					}
					var aSuccess = oData.PostReturnNav.results.filter(function (x) {
						if (x.Type == 'S') {
							return x;
						}
					});
					if (aSuccess != 0) {
						var Message = "";
						for (var i = 0; i < aSuccess.length; i++) {
							Message = aSuccess[i].Message + "\n" + Message;
						}
						MessageBox.success(Message);
						//added by Avinash
						// if (oThat.oTableSelctedItem) {
						// 	oThat.oView.getModel("oExitModel").getData().GateExitNav.results.splice(oThat.oTableSelctedItem.split('/')[3], 1); // added by dharma for deleting once saved
						// 	oThat.oView.getModel("oExitModel").refresh();

						// }
						if (oThat.TableSelectedObject) {
							var vDataArr = oThat.oView.getModel("oExitModelDel").getData();
							for (var i = 0; i < vDataArr.GateExitNav.results.length; i++) {
								if (vDataArr.GateExitNav.results[i].Wbid == oThat.TableSelectedObject.Wbid) {
									vDataArr.GateExitNav.results.splice(i, 1);
									break;
								}
							}
							oThat.oView.getModel("oExitModelDel").refresh();
						}

						var oQualityModel = new JSONModel(vDataArr);
						oThat.oView.setModel(oQualityModel, "oExitModel");
						oThat.oView.getModel("oExitModel").refresh();
						//End of added
						//ended by dharma
						//BOC by Avinash
						oThat.getView().byId("id_SearchFieldGE").setValue("");
						//EOC by Avinash

					}
				}
				// }
				else {
					oThat.Service = 'GET';
					var oEntity = {
						"d": {
							"GateEntry": "",
							"VehAssign": "",
							"PreQual": "",
							"UnloadConf": "",
							"GateExit": "X",
							"Inbound": "X",
							"Outbound": "",
							"IvDelivery": "",
							"IvPo": "",
							"IvWbid": "",
							"IvWerks": "",
							"GateExitNav": []
						}
					};
					oThat.onCallService(oThat.Service, oEntity);
				}
			}
		},

		myErrorHandler: function () {
			oThat.BusyDialog.close();
		},

		//============================ Press list item =====================================//
		onGateItemPress: function (oEvent) {
			oThat.oTableSelctedItem = oEvent.getSource().getBindingContextPath(); // storing the path for deleting
			oThat.TableSelectedObject = oEvent.getSource().getBindingContext("oExitModel").getObject(); //Added by Avinash
			oThat.oBjectItem = oThat.oView.getModel("oExitModel").getObject(oEvent.getSource().getBindingContextPath());
			oThat.GateExitFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.GateExit", this);
			oThat.oView.addDependent(oThat.GateExitFrag);
			oThat.GateExitFrag.setEscapeHandler(oThat.onEscapeGateExit);
			oThat.GateExitFrag.open();

			var oEntity = {
				"d": {
					"GateEntry": "",
					"VehAssign": "",
					"PreQual": "",
					"UnloadConf": "",
					"GateExit": "X",
					"Inbound": "X",
					"Outbound": "",
					"IvDelivery": "",
					"IvPo": "",
					"IvWbid": oThat.oBjectItem.Wbid,
					"IvWerks": "",
					"WbHeaderNav": [],
					"GateExitNav": []
				}
			};
			oThat.Service = "ITEM";
			oThat.onCallService(oThat.Service, oEntity);

		},
		onClickBack: function () {
			oThat.GateExitFrag.destroy();
		},
		onGateItemSubmit: function (oExit) {
			oThat.oView.getModel("oExitModel").refresh();
			var valid = true;
			if (oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Config16.length > 0 && oThat.oView.getModel("ITEM").getData().WbHeaderNav
				.results[0].Wtype === "MISC") {
				if (oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Config17.length < 9) {
					valid = false;
					MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("errmsgRef"));
					return;
				}
			}

			if (oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Gate !== "" || oThat.oView.getModel("ITEM").getData().WbHeaderNav
				.results[0].Wsgate) {
				var vGate = "";
				if (oThat.EvWtype == "WB") {
					vGate = oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Gate;
				} else {
					vGate = oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Wsgate;
				}
				var oObject = {
					"Gate": oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Gate,
					"Wsgate": oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Wsgate,
					"Vehno": oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Vehno,
					"Vehtyp": oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Vehtyp,
					"Dname": oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Dname,
					"DriverMob": oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].DriverMob,
					"Remark": oThat.oBjectItem.Item,
					"Wbid": oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Wbid,
					"Erdat": null,
					"Ertim": "PT00H00M00S",
					"Config3": vGate,
					"Config17": oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Config17,
				};

				// // Added Ended by srinivas on 12/08/2025 GRN validation
				// if (oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Config15 != "") {
				// 	// var messageText = oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Config15;
				// 	// var messageType = oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Config15UIType;
				// 	var oItemData = oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0];
				// 	if (oItemData.Config15UIType == "Warning") {
				// 		oItemData.Config15 = "W" + "-" + oItemData.Config15;
				// 	}
				// 	// Update the model so changes reflect in the UI
				// 	oThat.oView.getModel("ITEM").refresh(true);
				// 	oObject.Config15 = oItemData.Config15;
				// }
				// done in Abap end not required to send
				// Ended by srinivas on 12/08/2025 GRN validation
				
				var oEntity = {
					"d": {
						"GateEntry": "",
						"VehAssign": "",
						"PreQual": "",
						"UnloadConf": "",
						"GateExit": "X",
						"Inbound": "X",
						"Outbound": "",
						"PostReturnNav": [

						],
						"PostWbHeaderNav": [],
						"PostWbitemNav": [],
						"PostWsItemNav": [],
						"PostDmsNav": []
					}
				};
				oEntity.d.PostWbHeaderNav.push(oObject);
				oThat.Service = 'EXIT';
				oThat.GateExitFrag.destroy();
				oThat.onCallService(oThat.Service, oEntity);
			} else {
				MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg5"));
			}

		},
		//==================================Capture Image====================================================
		// added by srinivas
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

			onCompleteUpload: function (oEvent) {
			var oThat = this;
			
             
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

		},
			onBeforeUploadStarts: function () {
			oThat.BusyDialog.open();
		},

		// end of caputure image

		// preview image 
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
		

		
		//=========================== Exit gate F4 =======================================//
		onValueHelpPress: function (oEvent) {

			var vWerks = oEvent.getSource().getModel("ITEM").getData().WbHeaderNav.results[0].Werks;
			oThat.Service = 'GATE';
			var filter = [
				new Filter("Werks", sap.ui.model.FilterOperator.EQ, vWerks),
				new Filter("Wbobj", sap.ui.model.FilterOperator.EQ, oThat.EvWtype)
			];
			oThat.onCallService(oThat.Service, filter);

			oThat.ValueHelp = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Gate", oThat);
			oThat.oView.addDependent(oThat.ValueHelp);
			oThat.ValueHelp.open();
		},
		onValueHelpSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter;
			oFilter = new sap.ui.model.Filter([
				new Filter("Gate", sap.ui.model.FilterOperator.Contains, sValue)
			]);
			var oFilter2 = new sap.ui.model.Filter(oFilter, false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter2]);
		},
		onValueHelpConfirm: function (oEvent) {
			var oSelectedItem = oEvent.getParameter('selectedItem');
			var vGate = oSelectedItem.getTitle();
			if (oThat.EvWtype == "WB") {
				oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Gate = vGate;
				oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].GateName = oEvent.getParameter('selectedItem').getNumber(); // added by dharma 15.10.2020
			} else {
				oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Wsgate = vGate;

			}
			oThat.oView.getModel("ITEM").refresh(true);
			oThat.ValueHelp.destroy();
		},
		onValueHelpCancel: function (oEvent) {
			oThat.ValueHelp.destroy();
		},
		//================================== on Escape Handler ============================//
		onEscapeGateExit: function () {
			oThat.GateExitFrag.destroy();
		},
		//=================================================================================//
		//====================== Nav back =================================================//
		//=================================================================================//
		onNavBack: function () {
			// this._oTPC1.destroyPersoService(); //Added by Avinash
			this.oRouter.navTo("Inbound");

		},
		//added by dharma on 15-10-2020
		onGateExitFilter: function (oEvent) {
			var self = this;
			if (self.getView().getModel("oGateFilterExit") == undefined) {
				var aGate = self.getView().getModel("oExitModel").getData().GateExitNav.results;
				var aArray = [];
				var uniqueMake = [new Set(aGate.map(function (obj) {
					return obj.Gate;
				}))];
				var data = uniqueMake[0].values();
				for (var i = 0; i < uniqueMake[0].size; i++) {
					var vGate = data.next().value;
					// added by dharma
					var vGateDesc = "";
					for (var j = 0; j < aGate.length; j++) {
						if (vGate == aGate[j].Gate) {
							vGateDesc = aGate[j].GateName;
							break;
						}
					}
					// ended by dharma 
					var Object = {
						"Gate": vGate,
						"GateName": vGateDesc
					};
					aArray.push(Object);
				}

				aArray.push({
					"Gate": "All",
					"GateName": ""
				});
				self.getView().setModel(new JSONModel(aArray), "oGateFilterExit");
			}

			if (!oThat.GateFilterEssxit) {
				oThat.GateFilterExit = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.GateFilter_GateExit", oThat);
				oThat.getView().addDependent(oThat.GateFilterExit);
			}
			oThat.GateFilterExit.fireSearch();
			oThat.GateFilterExit.open();
		},

		//Added by Avinash on 16.06.2021
		onSearchGate: function (oEvent) {
			var vValue = oEvent.getSource()._sSearchFieldValue;
			if (vValue && vValue.length > 0) {
				var oFilter1 = new sap.ui.model.Filter("Gate", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter2 = new sap.ui.model.Filter("GateName", sap.ui.model.FilterOperator.Contains, vValue);
				var aAllFilter = new sap.ui.model.Filter([oFilter1, oFilter2]);
			}
			var binding = oEvent.getSource().getBinding("items");
			binding.filter(aAllFilter);
		},
		//End of Added

		onConfirmGate: function (oEvent) {
			var self = this;
			var oSelectedItem = oEvent.getParameter('selectedItem');
			//var oData = self.getView().getModel("oExitModel").getData().GateExitNav.results;
			var oData = oThat.oExitData.GateExitNav.results;
			if (oSelectedItem.getTitle().split(" ")[0] != "All") {
				var aData = oData.filter(function (obj) {
					return obj.Gate == oSelectedItem.getTitle().split(" ")[0];
				});
				self.getView().getModel("oExitModel").getData().GateExitNav.results = aData;
				self.getView().getModel("oExitModel").refresh(true);
			} else {
				oThat.Service = 'GET';
				var oEntity = {
					"d": {
						"GateEntry": "",
						"VehAssign": "",
						"PreQual": "",
						"UnloadConf": "",
						"GateExit": "X",
						"Inbound": "X",
						"Outbound": "",
						"IvDelivery": "",
						"IvPo": "",
						"IvWbid": "",
						"IvWerks": "",
						"GateExitNav": []
					}
				};
				oThat.onCallService(oThat.Service, oEntity);
			}
		},
		//ended by dharma on 15-10-2020
		//===================================== column visibility settings =====================================//
		onSettings: function (oEvent) {
			var self = this;

			self._oTPC1.openDialog();
		},

		onTablePersoRefresh: function () {
			// DemoPersoService.resetPersData();
			DemoPersoExit.resetPersData();
			this._oTPC1.refresh();
		},

		// Added by Avinash for RT Suggestion
		fnSearchRefId: function (oEvent) {
			var vValue = oEvent.getSource().getValue();
			var list = this.getView().byId("id_gateexit2");
			if (vValue && vValue.length > 0) {
				var oFilter = new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter2 = new sap.ui.model.Filter("Vehno", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter7 = new sap.ui.model.Filter("DriverMob", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter8 = new sap.ui.model.Filter("Batch", sap.ui.model.FilterOperator.Contains, vValue);
				var aFilters = new sap.ui.model.Filter([oFilter, oFilter2, oFilter7, oFilter8]);
			}
			var binding = list.getBinding("items");
			binding.filter(aFilters);
		},

		//Added by Avinash for Scanning Ref Id's..
		fnScanWB: function () {

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
						} else { //Desktop Version
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
										oThat.fnScanWB();
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

		onScanBarcode: function (oBarcodeData) {
			var self = this;
			self.Scan = true;
			var vValue = oBarcodeData.split("#")[0];
			var list = this.getView().byId("id_gateexit2");
			if (vValue && vValue.length > 0) {
				var oFilter = new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.Contains, vValue);
				var aFilters = new sap.ui.model.Filter([oFilter]);
			}
			var binding = list.getBinding("items");
			binding.filter(aFilters);
		},

		fnClearFilter: function (oEvent) {
			var self = this;
			if (self.Scan) {
				var vData = "";
				self.onScanBarcode(vData);
				self.getView().byId("id_SearchFieldNew").setValue("");
				self.Scan = false;
			}
			// self._onRouteMatched();
		},
		/*new code for RGP implementation for gate exit */
		onScanQRValue: function (oEvent) {
			this.ScanBtnPress = oEvent.getSource().getTooltip();
			var oThat = this;
			var oBundle = oThat.getView().getModel("i18n").getResourceBundle();
			var oVideoDeviceModel = new JSONModel();

			//Initialize the ZXing QR Code Scanner
			if (ZXing !== undefined && !sap.ui.Device.system.desktop) {
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

		onScanBarcode: function (scanData) {
			/*	cordova.plugins.barcodeScanner.scan(function(result) {
					 var vVlaue = oEvent.getParameter("text");
					 var vPo = vVlaue.slice(0,10);
					 oThat.onQRValidate(vPo);
				 }, function(error) {
				 sap.m.MessageBox.error("Unable to capture the Qr Code.");
				 });*/

			/*	validation  added by nagaraj 20/11/2023 for global plants */
			var oBundle = oThat.getView().getModel("i18n").getResourceBundle();
			if (this.ScanBtnPress === oBundle.getText("RefNo")) {

				if (scanData.length === 13 || scanData.length === 10) {
					oThat.BusyDialog.open();
					var afilter = [],
						oFilter3 = new sap.ui.model.Filter("RgpRef", sap.ui.model.FilterOperator.EQ, "X"),
						oFilter4 = new sap.ui.model.Filter("IvRef", sap.ui.model.FilterOperator.EQ, scanData),
						oFilter5 = new sap.ui.model.Filter("IvGate", sap.ui.model.FilterOperator.EQ, "E"),
						oFilter6 = new sap.ui.model.Filter("IvProc", sap.ui.model.FilterOperator.EQ, " ");
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
								var refNo = oThat.getView().getModel("ITEM").getData().WbHeaderNav.results[0].Config17.trim();
								if (refNo.length >= 32) {
									sap.m.MessageToast.show(oBundle.getText("refscanValidation"));
								} else if (refNo.length === 0) {
									oThat.getView().getModel("ITEM").getData().WbHeaderNav.results[0].Config17 = scanData;
								} else {
									oThat.getView().getModel("ITEM").getData().WbHeaderNav.results[0].Config17 += "," + scanData;
									//	oThat.oView.byId("id_InRefNoValue").setValue(refNo + "," + scanData);
								}
								oThat.getView().getModel("ITEM").refresh();
							}

						},
						error: function (oError) {
							oThat.BusyDialog.close();

							sap.m.MessageToast.show(oBundle.getText("Title21"));
						}
					});
				} else {
					sap.m.MessageToast.show(oBundle.getText("incorrect"));
				}

			}
		},
		fnBarcodeFailed: function () {
			sap.m.MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg2"));
		},
		onresetRefNo: function () {
			oThat.getView().getModel("ITEM").getData().WbHeaderNav.results[0].Config17 = "";
			oThat.getView().getModel("ITEM").refresh();
		}

		//End of Added...

	});

});