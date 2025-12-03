jQuery.sap.require("sap.ndc.BarcodeScanner"); //Added by Avinash
var oThat;
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/BusyDialog",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"ZGT_MM_INBOUND/lib/signature",
	"sap/m/MessageToast",
	'sap/m/TablePersoController',
	'ZGT_MM_INBOUND/Util/DemoPersoService'
], function (Controller, MessageBox, BusyDialog, JSONModel, Filter, signature, MessageToast, TablePersoController, DemoPersoService) {
	"use strict";
	var sApplicationFlag, selectedDeviceId, codeReader, selectedDeviceId, oComboBox, sStartBtn, sResetBtn; //Added by Avinash
	var localUom;
	var flagUom;
	var CanvasToBMP = {
		/**
		 * Convert a canvas element to ArrayBuffer containing a BMP file
		 * with support for 32-bit (alpha).
		 *
		 * Note that CORS requirement must be fulfilled.
		 *
		 * @param {HTMLCanvasElement} canvas - the canvas element to convert
		 * @return {ArrayBuffer}
		 */
		toArrayBuffer: function (canvas) {

			var w = canvas.width,
				h = canvas.height,
				w4 = w * 4,
				idata = canvas.getContext("2d").getImageData(0, 0, w, h),
				data32 = new Uint32Array(idata.data.buffer), // 32-bit representation of canvas

				stride = Math.floor((32 * w + 31) / 32) * 4, // row length incl. padding
				pixelArraySize = stride * h, // total bitmap size
				fileLength = 122 + pixelArraySize, // header size is known + bitmap

				file = new ArrayBuffer(fileLength), // raw byte buffer (returned)
				view = new DataView(file), // handle endian, reg. width etc.
				pos = 0,
				x, y = 0,
				p, s = 0,
				a, v;

			// write file header
			setU16(0x4d42); // BM
			setU32(fileLength); // total length
			pos += 4; // skip unused fields
			setU32(0x7a); // offset to pixels

			// DIB header
			setU32(108); // header size
			setU32(w);
			setU32(-h >>> 0); // negative = top-to-bottom
			setU16(1); // 1 plane
			setU16(32); // 32-bits (RGBA) // Converting to 8 Bit to upload to SAP DMS @Sai
			setU32(3); // no compression (BI_BITFIELDS, 3)
			setU32(pixelArraySize); // bitmap size incl. padding (stride x height)
			setU32(2835); // pixels/meter h (~72 DPI x 39.3701 inch/m)
			setU32(2835); // pixels/meter v
			pos += 8; // skip color/important colors
			setU32(0xff0000); // red channel mask
			setU32(0xff00); // green channel mask
			setU32(0xff); // blue channel mask
			setU32(0xff000000); // alpha channel mask
			setU32(0x57696e20); // " win" color space

			// bitmap data, change order of ABGR to BGRA
			while (y < h) {
				p = 0x7a + y * stride; // offset + stride x height
				x = 0;
				while (x < w4) {
					v = data32[s++]; // get ABGR
					a = v >>> 24; // alpha channel
					view.setUint32(p + x, (v << 8) | a); // set BGRA
					x += 4;
				}
				y++;
			}

			return file;

			// helper method to move current buffer position
			function setU16(data) {
				view.setUint16(pos, data, true);
				pos += 2;
			}

			function setU32(data) {
				view.setUint32(pos, data, true);
				pos += 4;
			}
		},

		/**
		 * Converts a canvas to BMP file, returns a Blob representing the
		 * file. This can be used with URL.createObjectURL().
		 * Note that CORS requirement must be fulfilled.
		 *
		 * @param {HTMLCanvasElement} canvas - the canvas element to convert
		 * @return {Blob}
		 */
		toBlob: function (canvas) {
			return new Blob([this.toArrayBuffer(canvas)], {
				type: "image/bmp"
			});
		},

		/**
		 * Converts the canvas to a data-URI representing a BMP file.
		 * Note that CORS requirement must be fulfilled.
		 *
		 * @param canvas
		 * @return {string}
		 */
		toDataURL: function (canvas) {
			var buffer = new Uint8Array(this.toArrayBuffer(canvas)),
				bs = "",
				i = 0,
				l = buffer.length;
			while (i < l) bs += String.fromCharCode(buffer[i++]);
			return "data:image/bmp;base64," + btoa(bs);
		}
	};
	return Controller.extend("ZGT_MM_INBOUND.controller.Unloading_Confirm", {
		onInit: function () {
			oThat = this;
			oThat.oView = this.getView();
			oThat.Core = sap.ui.getCore();
			oThat.BusyDialog = new BusyDialog();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("Unloading").attachMatched(this._onRouteMatched, this);

			this._oTPC = new TablePersoController({
				table: oThat.oView.byId("id_unload"),
				//specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
				// componentName: "demoApp",
				persoService: DemoPersoService
			}).activate();
		},

		_onRouteMatched: function (oEvent) {
			oThat = this;
			oThat.oView = oThat.getView();
			//BOC by Avinash
			oThat.getView().byId("id_SearchField").setValue("");
			//EOC by Avinash
			oThat.oView.setModel(new JSONModel(), "oViewModel"); //Model added by kirubakaran for brazil plant on 15.07.2020 to set Nota-Fisical Number//
			oThat.oView.getModel("oViewModel").setProperty("/CMSProperty", false);
			oThat.oView.getModel("oViewModel").setProperty("/REMARKS", false);
			//added by srinivas for NCP changes on 03/09/2025 Param H replica with Packaging Detatils
			oThat.oView.getModel("oViewModel").setProperty("/fPackingWtColumn", false);
			oThat.oView.getModel("oViewModel").setProperty("/nPackingWtColumn", false);
			oThat.oView.getModel("oViewModel").setProperty("/vPackingWtColumn", false);
			//end by srinivas for NCP changes on 03/09/2025
			//	oThat.oView.getModel("oViewModel").setProperty("/ShowProperty", false);
			oThat.BusyDialog = new BusyDialog();
			//Code added by kirubakaran on 16.09.2020 for brazil plant for capture image
			oThat.Images = [];
			oThat.oView.setModel(new JSONModel(oThat.Images), "MASS");
			oThat.oView.getModel("MASS").refresh(true);
			//Code ended by kirubakaran on 16.09.2020 for brazil plant for capture image
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
					"UnloadConf": "X",
					"GateExit": "",
					"Inbound": "X",
					"Outbound": "",
					"IvDelivery": "",
					"IvPo": "",
					"IvWbid": "",
					"IvWerks": "",
					"QualWbidNav": [],
					"GetReturnNav": []

				}
			};
			oThat.onCallService(oThat.Service, oEntity);

			var vData = [
				new Filter("Inremarks", sap.ui.model.FilterOperator.EQ, 'X')
			];

			oThat.oModel.read("/F4ParametersSet", {
				filters: vData,
				urlParameters: {
					$expand: "F4RemarksNav"
				},
				success: function (oData, oResponse) {
					var oReasonModel = new JSONModel(oData.results[0].F4RemarksNav);
					oThat.oView.setModel(oReasonModel, "REASON");
				},
				error: function (oError) {

				}
			});
		},
		//======================================================================================//
		//=============================== Service call =========================================//
		//======================================================================================//

		onCallService: function (service, Data) {
			oThat.BusyDialog.open();
			if (oThat.Service === 'GET' || oThat.Service == 'ITEM' || oThat.Service === 'BATCH' || oThat.Service === 'GETBATCH' || oThat.Service ===
				'POITEMS') {
				oThat.oModel.create("/GetHeadersSet", Data, {
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			} else if (oThat.Service === 'SLOC') {
				oThat.oModel.read("/F4SlocsSet", {
					filters: Data,
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			}
			// Added for CFM Port Evacuation Process
			else if (oThat.Service === 'UOM') {
				oThat.oModel.read("/F4ParametersSet", {
					filters: Data,
					urlParameters: {
						$expand: "F4UomNav"
					},
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			}
			// end of added
			else if (oThat.Service === 'SUBMIT' || oThat.Service === 'UpdatePODETAILS') {
				oThat.oModel.create("/PostHeadersSet", Data, {
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
			} else if (oThat.Service === "REPRINT") {
				oThat.oModel.create("/GetHeadersSet", Data, {
					filters: Data,
					success: oThat.mySuccessHandler,
					error: oThat.myErrorHandler
				});
			}
		},
		mySuccessHandler: function (oData) {
			oThat.BusyDialog.close();
			if (oThat.Service === 'GET') {
				oThat.oUnloadData = JSON.parse(JSON.stringify(oData)); // added by dharma on 16-10-2020
				var oUnloadModel = new JSONModel(oData);
				oThat.oView.setModel(oUnloadModel, "oUnloadModel");
				//Added by Avinash
				var oUnloadModelDel = new JSONModel(oData);
				oThat.oView.setModel(oUnloadModelDel, "oUnloadModDel");
				//End of added
				if (oData.EvDispFlag === "X") {
					//	oThat.oView.getModel("oViewModel").setProperty("/ShowProperty", true);
					oThat.oView.byId("vendorBrzNo").setVisible(true);
					oThat.oView.byId("CmsBrzno").setVisible(true);
					oThat.oView.byId("Dname").setVisible(true);
					oThat.oView.byId("DriverMob").setVisible(true);
				} else {
					//	oThat.oView.getModel("oViewModel").setProperty("/ShowProperty", false);
					oThat.oView.byId("vendorBrzNo").setVisible(false);
					oThat.oView.byId("CmsBrzno").setVisible(false);
					oThat.oView.byId("Dname").setVisible(false);
					oThat.oView.byId("DriverMob").setVisible(false);
				}
				//Added by Avinash for Reprint
				if (oData.ExReprintFlag === "X") {
					oThat.oView.byId("id_ReprintBtn").setVisible(true);
				} else {
					oThat.oView.byId("id_ReprintBtn").setVisible(false);
				}
				if (oData.ExPrlotLayout === "X") {
					oThat.oView.byId("id_Maktx").setVisible(true);
					oThat.oView.byId("Matnr").setVisible(false);
					oThat.oView.byId("id_PRLot").setVisible(true);
					//Added on 22/4/22 
					oThat.oView.byId("id_PoutQty").setVisible(true);
					oThat.oView.byId("id_PoutQtyBags").setVisible(true);
				} else {
					oThat.oView.byId("id_Maktx").setVisible(false);
					oThat.oView.byId("Matnr").setVisible(true);
					oThat.oView.byId("id_PRLot").setVisible(false);
					//Added on 22/4/22 
					oThat.oView.byId("id_PoutQty").setVisible(false);
					oThat.oView.byId("id_PoutQtyBags").setVisible(false);
				}
				//End of Added
				oThat.oView.getModel("oUnloadModel").refresh(true);
				oThat.oView.getModel("oUnloadModDel").refresh(true);
			}
			//Added by Avinash - Get Lot F4 Help
			else if (oThat.Service === 'GETBATCH') {
				oThat.oView.setModel(new JSONModel(oData.F4PrlotPrintNav.results), "LotF4Data");
				oThat.oView.getModel("LotF4Data").refresh(true);
				if (oData.F4PrlotPrintNav.results.length != 0) {
					oThat.LotF4 = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.LotF4", oThat);
					oThat.oView.addDependent(oThat.LotF4);
					oThat.LotF4.open();
				} else {
					MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("NoLotAvail"));
				}
			}
			//End of Added
			else if (oThat.Service === 'ITEM') {
				if (oData.GetReturnNav.results.length > 0) {
					if (oData.GetReturnNav.results[0].Type !== 'E') {
						oThat.EvWtype = oData.EvWtype;

						oThat.oView.setModel(new JSONModel(oData), "ITEM");
						oThat.oView.setModel(new JSONModel(oData.WbHeaderNav), "ITEMDet"); //Added by Avinash
						//code added by kirubakaran on 15.07.2020 to set Nota-Fisical Number//
						if (oData.UnloadConfNav.results.length > 0) {
							if (oData.UnloadConfNav.results[0].FLAG === "X") {
								oThat.oView.getModel("oViewModel").setProperty("/NotaProperty", true);
								oThat.oView.getModel("oViewModel").setProperty("/CMSProperty", false);
							} else {
								oThat.oView.getModel("oViewModel").setProperty("/NotaProperty", false);
								oThat.oView.getModel("oViewModel").setProperty("/CMSProperty", true);
							}
							// added by dharma on 14-03-2021
							if (oData.EvOrigin === "B" && oData.WbHeaderNav.results[0].Wtype === "TRIP") {
								oThat.oView.getModel("oViewModel").setProperty("/REMARKS", true);
							}
							//added by Avinash on 10.06.2021.
							else {
								oThat.oView.getModel("oViewModel").setProperty("/REMARKS", false);
							}
							//end of added.
							//Added by Avinash -- CFM Changes
							if (oThat.oView.getModel("ITEM").getData().EvOrigin === "E") {
								oThat.oView.getModel("oViewModel").setProperty("/Origin", true);
								oThat.oView.getModel("oViewModel").setProperty("/Box", true);

							} else {
								oThat.oView.getModel("oViewModel").setProperty("/Origin", false);
								oThat.oView.getModel("oViewModel").setProperty("/Box", false);

							}
							//End of Added
							// added by dhrma on 05-02-2020

							//Added by Suvethaa for Ghana TP/Buscuits
							if (oThat.oView.getModel("ITEM").getData().EvOrigin === "K" || oThat.oView.getModel("ITEM").getData().EvOrigin === "M") { //Added for CFM (2701)
								oThat.oView.getModel("oViewModel").setProperty("/Quantity", true);
								oThat.oView.getModel("oViewModel").setProperty("/Uom", true);
								oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Uom = oData.WbItemNav.results[0].Uom;
								localUom = oData.WbItemNav.results[0].Uom;
								// oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Quantity = oData.WbItemNav.results[0].Menge;
								var Quan = "";
								oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Quantity = Quan;
								oThat.oView.getModel("ITEM").refresh();
							} else {
								oThat.oView.getModel("oViewModel").setProperty("/Quantity", false);
								oThat.oView.getModel("oViewModel").setProperty("/Uom", false);
							}
							//End of Added
							oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Check = false;
							oThat.oView.getModel("ITEM").refresh();
							//

							//Added by Avinash
							// if (oData.EvOrigin === "G" && oData.EvOrigin === "F"){
							// 	oThat.onPressCharacteristics();
							// }
							//End of Added...

						}

						//code ended by kirubakaran on 15.07.2020 to set Nota-Fisical Number//
						oThat.oView.getModel("ITEM").refresh(true);
					} else {
						MessageBox.error(oData.GetReturnNav.results[0].Message)
						oThat.UnloadFrag2901.close();
					}
				} else {
					oThat.EvWtype = oData.EvWtype;
					oData.QaMsgType = oThat.TableSelectedObject.QaMsgType;
					/*new code added by Nagaraj for validating material type fert and origin specfici*/
					oThat.fertType = true;
					for (var x in oData.PoItemNav.results) {
						if (oData.PoItemNav.results[x].FertFlag === "X") {
							oThat.fertType = false;
							break;
						}

					}
					for (var x in oData.DelItemNav.results) {
						if (oData.DelItemNav.results[x].FertFlag === "X") {
							oThat.fertType = false;
							break;
						}
					}
					// Laxmikanth Added
					// need to remove below 2 line because of hardcoded values passing for checking the logic
					// if same data available then remove below 2 lines and for this functionality new Table created that id is "id_ItemTable3A"
					// created new else if for this oData.EvOrigin and QaMsgType params
					 oThat.TableSelectedObject.QaMsgType = 'C';
					// oData.EvOrigin = '' ;

					if (oThat.TableSelectedObject.QaMsgType === "H") {
						oThat.oView.getModel("oViewModel").setProperty("/vFertType", true);
						oThat.oView.getModel("oViewModel").setProperty("/zFertType", false);

						// added by srinivas 0n 29/08/2025
						oThat.oView.getModel("oViewModel").setProperty("/nFertType", false);
						//sap.ui.getCore().byId("WBIdLabel1").setVisible(true);
						//sap.ui.getCore().byId("WBIdLabel2").setVisible(false);
						var oLabel1 = sap.ui.getCore().byId("WBIdLabel1");
						var oLabel2 = sap.ui.getCore().byId("WBIdLabel2");
						if (oLabel1 && oLabel2) {
							oLabel1.setVisible(true);
							oLabel2.setVisible(false);
						}
						//ended by srinivas
						if (oThat.fertType) {
							oThat.oView.getModel("oViewModel").setProperty("/vChallan", true);
							oThat.oView.getModel("oViewModel").setProperty("/vUnloadqty", true);
							oThat.oView.getModel("oViewModel").setProperty("/vRejectedqty", true);
							oThat.oView.getModel("oViewModel").setProperty("/vAcceptqty", true);
							oThat.oView.getModel("oViewModel").setProperty("/vUOM", true);
							oThat.oView.getModel("oViewModel").setProperty("/vRemarks", true);
							oThat.oView.getModel("oViewModel").setProperty("/vDel", true);
							oThat.oView.getModel("oViewModel").setProperty("/vADD", true);

						} else {
							oThat.oView.getModel("oViewModel").setProperty("/vChallan", false);
							oThat.oView.getModel("oViewModel").setProperty("/vUnloadqty", false);
							oThat.oView.getModel("oViewModel").setProperty("/vRejectedqty", false);
							oThat.oView.getModel("oViewModel").setProperty("/vAcceptqty", false);
							oThat.oView.getModel("oViewModel").setProperty("/vUOM", false);
							oThat.oView.getModel("oViewModel").setProperty("/vRemarks", false);
							oThat.oView.getModel("oViewModel").setProperty("/vDel", false);
							oThat.oView.getModel("oViewModel").setProperty("/vADD", false);
						}
						oData.UnloadConfNav.results = [];
						for (var r in oData.WbItemNav.results) {
							oData.UnloadConfNav.results.push(oData.WbItemNav.results[r])
						}
						// added by srinivas 03/09/2025 for package details
						if (oData.WbItemNav.results.some(function (item) {
								return item.PackingFlag === "X";
							})) {
							// If at least one item has PackingFlag = "X"
							oThat.oView.getModel("oViewModel").setProperty("/vPackingWtColumn", true);
						} else {
							oThat.oView.getModel("oViewModel").setProperty("/vPackingWtColumn", false);
						}
						//ended by srinivas

						oThat.oView.setModel(new JSONModel(oData), "ITEM");
						oThat.oView.setModel(new JSONModel(oData.WbHeaderNav), "ITEMDet");

						/*code end at else  alidating material type fert and origin by nagaraj*/
					}

					// added by srinivas on 28/08/2025 for project Amanah to add new parameter to show all po in one popup to replicate exixting parameter H functionality but not to collide with H ncp changes
					else if (oThat.TableSelectedObject.QaMsgType === "1") {
						oThat.oView.getModel("oViewModel").setProperty("/zFertType", false);
						// Step 1: Split data directly from WbItemNav
						oData.WbItemNav.results.forEach(function (wbItem) {
							// Normalize Matnr (remove leading zeros)
							//wbItem.Matnr = wbItem.Matnr.replace(/^0+/, "");
							if (wbItem.FertFlag === "X") {
								// Fert item
								//wbItem.ShowPacking = wbItem.PackingFlag === "X"; // boolean for UI binding
								oThat.aFertWbData.push(wbItem);
							} else {
								// Non-Fert item
								//wbItem.ShowPacking = wbItem.PackingFlag === "X"; // boolean for UI binding
								oThat.aNonFertWbData.push(wbItem);
							}
						});
						// check if all lines of package weight if empty , if empty hide column
						var fShowPacking = false;
						var nShowPacking = false;
						// Check Fert items
						if (oThat.aFertWbData.some(function (item) {
								return item.PackingFlag === "X";
							})) {
							fShowPacking = true;
						}
						oThat.oView.getModel("oViewModel").setProperty("/fPackingWtColumn", fShowPacking);

						// Check Non-Fert items
						if (oThat.aNonFertWbData.some(function (item) {
								return item.PackingFlag === "X";
							})) {
							nShowPacking = true;
						}
						oThat.oView.getModel("oViewModel").setProperty("/nPackingWtColumn", nShowPacking);


						if (oThat.aFertWbData.length > 0 && oThat.aNonFertWbData.length > 0) {
							oData.FertWbData = oThat.aFertWbData;
							oData.NonFertWbData = oThat.aNonFertWbData;
							oThat.oView.setModel(new JSONModel(oData), "ITEM");
							oThat.oView.setModel(new JSONModel(oData.WbHeaderNav), "ITEMDet");
							//sap.ui.getCore().byId("WBIdLabel1").setVisible(false);
							//sap.ui.getCore().byId("WBIdLabel2").setVisible(true);
							var oLabel1 = sap.ui.getCore().byId("WBIdLabel1");
							var oLabel2 = sap.ui.getCore().byId("WBIdLabel2");
							if (oLabel1 && oLabel2) {
								oLabel1.setVisible(false);
								oLabel2.setVisible(true);
							}
							//sap.ui.getCore().byId("id_ItemTableVBox").setVisible(false);
							var oItemTableVbox = sap.ui.getCore().byId("id_ItemTableVBox");
							if (oItemTableVbox) {
							oItemTableVbox.setVisible(false);
						}
							oThat.oView.getModel("oViewModel").setProperty("/vFertType", false);
							oThat.oView.getModel("oViewModel").setProperty("/nFertType", true);

							oThat.oView.getModel("oViewModel").setProperty("/vChallan", true);
							oThat.oView.getModel("oViewModel").setProperty("/vUnloadqty", true);
							oThat.oView.getModel("oViewModel").setProperty("/vRejectedqty", true);
							oThat.oView.getModel("oViewModel").setProperty("/vAcceptqty", true);
							oThat.oView.getModel("oViewModel").setProperty("/vUOM", true);
							oThat.oView.getModel("oViewModel").setProperty("/vRemarks", true);
							oThat.oView.getModel("oViewModel").setProperty("/vDel", true);
							oThat.oView.getModel("oViewModel").setProperty("/vADD", true);
						} else {
							if (oThat.aFertWbData.length > 0) {
								oThat.fertType = false;
							} else if (oThat.aNonFertWbData.length > 0) {
								oThat.fertType = true;
							}
							oThat.oView.getModel("oViewModel").setProperty("/vFertType", true);
							oThat.oView.getModel("oViewModel").setProperty("/nFertType", false);
							//sap.ui.getCore().byId("WBIdLabel1").setVisible(true);
							//sap.ui.getCore().byId("WBIdLabel2").setVisible(false);
							var oLabel1 = sap.ui.getCore().byId("WBIdLabel1");
							var oLabel2 = sap.ui.getCore().byId("WBIdLabel2");
							if (oLabel1 && oLabel2) {
								oLabel1.setVisible(true);
								oLabel2.setVisible(false);
							}
							if (oThat.fertType) {
								oThat.oView.getModel("oViewModel").setProperty("/vChallan", true);
								oThat.oView.getModel("oViewModel").setProperty("/vUnloadqty", true);
								oThat.oView.getModel("oViewModel").setProperty("/vRejectedqty", true);
								oThat.oView.getModel("oViewModel").setProperty("/vAcceptqty", true);
								oThat.oView.getModel("oViewModel").setProperty("/vUOM", true);
								oThat.oView.getModel("oViewModel").setProperty("/vRemarks", true);
								oThat.oView.getModel("oViewModel").setProperty("/vDel", true);
								oThat.oView.getModel("oViewModel").setProperty("/vADD", true);


							} else {
								oThat.oView.getModel("oViewModel").setProperty("/vChallan", false);
								oThat.oView.getModel("oViewModel").setProperty("/vUnloadqty", false);
								oThat.oView.getModel("oViewModel").setProperty("/vRejectedqty", false);
								oThat.oView.getModel("oViewModel").setProperty("/vAcceptqty", false);
								oThat.oView.getModel("oViewModel").setProperty("/vUOM", false);
								oThat.oView.getModel("oViewModel").setProperty("/vRemarks", false);
								oThat.oView.getModel("oViewModel").setProperty("/vDel", false);
								oThat.oView.getModel("oViewModel").setProperty("/vADD", false);
							}
							oData.UnloadConfNav.results = [];
							for (var r in oData.WbItemNav.results) {
								oData.UnloadConfNav.results.push(oData.WbItemNav.results[r])
							}
							if (oData.WbItemNav.results.some(function (item) {
									return item.PackingFlag === "X";
								})) {
								// If at least one item has PackingFlag = "X"
								oThat.oView.getModel("oViewModel").setProperty("/vPackingWtColumn", true);
							} else {
								oThat.oView.getModel("oViewModel").setProperty("/vPackingWtColumn", false);
							}
							oThat.oView.setModel(new JSONModel(oData), "ITEM");
							oThat.oView.setModel(new JSONModel(oData.WbHeaderNav), "ITEMDet");
						}
						// end by srinivas on 28/08/2025 for project Amanah ncp changes	

					}
					// added by Laxmikanth for new inbound continuous scanner functionality
					else if(oThat.TableSelectedObject.QaMsgType === "C"){
						var oLabel1 = sap.ui.getCore().byId("WBIdLabel1");
						var oLabel2 = sap.ui.getCore().byId("WBIdLabel2");
						if (oLabel1 && oLabel2) {
							oLabel1.setVisible(true);
							oLabel2.setVisible(false);
						}
						sap.ui.getCore().byId("id_ItemTableVBox").setVisible(false);
						oThat.oView.getModel("oViewModel").setProperty("/nFertType", false);
						oThat.oView.getModel("oViewModel").setProperty("/vFertType", false);
						oThat.oView.getModel("oViewModel").setProperty("/zFertType", true);
						oThat.oView.getModel("oViewModel").setProperty("/NotaProperty", false);
						oThat.oView.getModel("oViewModel").setProperty("/vChallan", false);
						oThat.oView.getModel("oViewModel").setProperty("/CMSProperty", true);
						oThat.oView.getModel("oViewModel").setProperty("/Origin", false);
						oThat.oView.getModel("oViewModel").setProperty("/Box", false);
						oThat.oView.getModel("oViewModel").setProperty("/Uom", false);
						oThat.oView.getModel("oViewModel").setProperty("/QuantityEnabled", false);
						oThat.oView.getModel("oViewModel").setProperty("/OriginCombo", false);
						oThat.oView.getModel("oViewModel").setProperty("/Quantity", true);
						oThat.oView.getModel("oViewModel").setProperty("/Batch", true);
						oThat.oView.getModel("oViewModel").setProperty("/ContinuousScanner", true);
						oThat.oView.getModel("oViewModel").setProperty("/BatchStatus", true);
						
						//Assigning test data for batch because as of now batch is coming empty so here adding test batch, once data will come we have to remove below test data assignment
						oData.UnloadConfNav.results = [];
							for (var r in oData.WbItemNav.results) {
								oData.WbItemNav.results[r].Batch = "TEST1" + r; // Assigning unique batch value for testing purpose
								//oData.WbItemNav.results[r].BatchStatus = "Not Updated"; // Assigning unique batch value for testing purpose
								oData.WbItemNav.results[r].BatchStatus = "sap-icon://decline"; // Assigning unique batch value for testing purpose
								oData.WbItemNav.results[r].Lgort = "1006";
								oData.UnloadConfNav.results.push(oData.WbItemNav.results[r])
							}
						oThat.oView.setModel(new JSONModel(oData), "ITEM");
						oThat.oView.setModel(new JSONModel(oData.WbHeaderNav), "ITEMDet");
					} 
					else {
						// added by srinivas on 28/08/2025 for project Amanah  ncp changes	
						//sap.ui.getCore().byId("WBIdLabel1").setVisible(true);
						//sap.ui.getCore().byId("WBIdLabel2").setVisible(false);
						var oLabel1 = sap.ui.getCore().byId("WBIdLabel1");
						var oLabel2 = sap.ui.getCore().byId("WBIdLabel2");
						if (oLabel1 && oLabel2) {
							oLabel1.setVisible(true);
							oLabel2.setVisible(false);
						}
						oThat.oView.getModel("oViewModel").setProperty("/zFertType", false);
						oThat.oView.getModel("oViewModel").setProperty("/vFertType", false);
						//sap.ui.getCore().byId("id_ItemTableVBox").setVisible(true)
						var oItemTableVbox = sap.ui.getCore().byId("id_ItemTableVBox");
							if (oItemTableVbox) {
							oItemTableVbox.setVisible(true);
						}
						oThat.oView.getModel("oViewModel").setProperty("/nFertType", false);
						// end by srinivas  ncp changes	
						oThat.oView.setModel(new JSONModel(oData), "ITEM");
						oThat.oView.setModel(new JSONModel(oData.WbHeaderNav), "ITEMDet"); //Added by Avinash
						//code added by kirubakaran on 15.07.2020 to set Nota-Fisical Number//
						if (oData.UnloadConfNav.results.length > 0) {
							if (oData.UnloadConfNav.results[0].FLAG === "X") {
								oThat.oView.getModel("oViewModel").setProperty("/NotaProperty", true);
								oThat.oView.getModel("oViewModel").setProperty("/CMSProperty", false);
							} else {
								oThat.oView.getModel("oViewModel").setProperty("/NotaProperty", false);
								oThat.oView.getModel("oViewModel").setProperty("/CMSProperty", true);
							}
							// added by dharma on 14-03-2021
							if (oData.EvOrigin === "B" && oData.WbHeaderNav.results[0].Wtype === "TRIP") {
								oThat.oView.getModel("oViewModel").setProperty("/REMARKS", true);
							}
							//added by Avinash on 10.06.2021.
							else {
								oThat.oView.getModel("oViewModel").setProperty("/REMARKS", false);
							}
							//end of added.
							// added by srinivas 03/09/2025 for package details for  ncp changes
							if (oData.UnloadConfNav.results.some(function (item) {
									return item.PackingFlag === "X";
								})) {
								// If at least one item has PackingFlag = "X"
								oThat.oView.getModel("oViewModel").setProperty("/vPackingWtColumn", true);
							} else {
								oThat.oView.getModel("oViewModel").setProperty("/vPackingWtColumn", false);
							}
							//ended by srinivas  ncp changes	
							// added by srinivas on 22.07/2025 for DSE  origin dropdown
							if (oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Wtype == "PROCURE" && oThat.oView.getModel("ITEM").getData().EvOrigin === "X" && oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Ebeln == "") {
								oThat.oView.getModel("oViewModel").setProperty("/Origin", false);
								oThat.oView.getModel("oViewModel").setProperty("/Box", true);
								oThat.oView.getModel("oViewModel").setProperty("/OriginCombo", true);
							}
							// added by srinivas on 22.07/2025
							//Added by Avinash -- CFM Changes
							else if (oThat.oView.getModel("ITEM").getData().EvOrigin === "E") { // Changed to else if by srinivas on 1/07/2025
								//if (oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Wtype !== "PROCURE" && oThat.oView.getModel("ITEM").getData().EvOrigin === "E" && oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Ebeln == "") { // added by srinivas on 1/07/2025
								oThat.oView.getModel("oViewModel").setProperty("/Origin", true);
								oThat.oView.getModel("oViewModel").setProperty("/Box", true);
								oThat.oView.getModel("oViewModel").setProperty("/OriginCombo", false);

							} else {
								oThat.oView.getModel("oViewModel").setProperty("/Origin", false);
								oThat.oView.getModel("oViewModel").setProperty("/Box", false);
								oThat.oView.getModel("oViewModel").setProperty("/OriginCombo", false);

								oThat.oView.getModel("oViewModel").setProperty("/vUOM", true);
								oThat.oView.getModel("oViewModel").setProperty("/vRemarks", true);

							}
							//End of Added
							// added by dhrma on 05-02-2020


							for (var x in oData.UnloadConfNav.results) {
								oData.UnloadConfNav.results[x].QaMsgType = oThat.TableSelectedObject.QaMsgType;
							}
							//Added by Suvethaa for Ghana TP/Buscuits
							if (oThat.oView.getModel("ITEM").getData().EvOrigin === "K" || oThat.oView.getModel("ITEM").getData().EvOrigin === "M") { //Added for CFM (2701)
								oThat.oView.getModel("oViewModel").setProperty("/Quantity", true);
								oThat.oView.getModel("oViewModel").setProperty("/Uom", true);
								oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Uom = oData.WbItemNav.results[0].Uom;
								localUom = oData.WbItemNav.results[0].Uom;
								// oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Quantity = oData.WbItemNav.results[0].Menge;
								var Quan = "";
								oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Quantity = Quan;
								oThat.oView.getModel("ITEM").refresh();
							} else {
								oThat.oView.getModel("oViewModel").setProperty("/Quantity", false);
								oThat.oView.getModel("oViewModel").setProperty("/Uom", false);
							}
							//End of Added
							oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Check = false;
							oThat.oView.getModel("ITEM").refresh();
							//

							//Added by Avinash
							// if (oData.EvOrigin === "G" && oData.EvOrigin === "F"){
							// 	oThat.onPressCharacteristics();
							// }
							//End of Added...

							//Added Srinivas on 01/07/2025 DSE
							if (oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Wtype === "PROCURE" && oThat.oView.getModel("ITEM").getData().EvOrigin === "X" && oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Ebeln == "") {
								var oOriginFilter = [
									new Filter("OriginGQ", sap.ui.model.FilterOperator.EQ, "X"),
									new Filter("IvWerks", sap.ui.model.FilterOperator.EQ, oData.IvWerks)
								];
								oThat.BusyDialog.open();
								// oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Token1 = "";
								oThat.oModel.read("/F4ParametersSet", {
									filters: oOriginFilter,
									urlParameters: {
										$expand: "F4OriginSetNav"
									},
									success: function (oData, oResponse, ) {
										var oJsonModel = new JSONModel();
										var oDataTyResults = oData.results[0].F4OriginSetNav.results;
										if (oDataTyResults.length > 0) {
											oJsonModel.setData(oDataTyResults);
											oThat.oView.setModel(oJsonModel, "OriginComboModel");
											//oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Token = "ORIGIN 1";
											//sap.ui.getCore().byId("id_TokenFieldCombo").setSelectedKey("ORIGIN 1");
											//oThat.oView.getModel("ITEM").refresh();	
											oThat.BusyDialog.close();
										}
									}.bind(this),
									error: function (error) {
										oThat.BusyDialog.close();
										MessageBox.error(error.responseText);
									},
								});

								//oThat.BusyDialog.close();
								oThat.oView.getModel("oViewModel").setProperty("/Origin", false);
								oThat.oView.getModel("oViewModel").setProperty("/OriginCombo", true);
								oThat.oView.getModel("oViewModel").setProperty("/Box", true);
							} else if (oThat.oView.getModel("ITEM").getData().EvOrigin === "E") {
								oThat.oView.getModel("oViewModel").setProperty("/Origin", true);
								oThat.oView.getModel("oViewModel").setProperty("/Box", true);
								oThat.oView.getModel("oViewModel").setProperty("/OriginCombo", false);
							} else {
								oThat.oView.getModel("oViewModel").setProperty("/Origin", false);
								oThat.oView.getModel("oViewModel").setProperty("/Box", false);
								oThat.oView.getModel("oViewModel").setProperty("/OriginCombo", false);
								// oThat.oView.getModel("oViewModel").setProperty("/Quantity", true);
								// oThat.oView.getModel("oViewModel").setProperty("/Batch", true);
								// oThat.oView.getModel("oViewModel").setProperty("/ContinuousScanner", true);
								// oThat.oView.getModel("oViewModel").setProperty("/BatchStatus", true);

							}
							//End of Added Srinivas on 01/07/2025 DSE

						}

						//code ended by kirubakaran on 15.07.2020 to set Nota-Fisical Number//
						oThat.oView.getModel("ITEM").refresh(true);

					}

				}

			}
			//Added by Avinash for Reprint for the Origin G & F
			else if (oThat.Service === 'REPRINT') {
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
				// }
			}
			//End of Added
			else if (oThat.Service === 'SLOC') {
				oThat.oView.setModel(new JSONModel(oData), "SLOC");
				oThat.oView.getModel("SLOC").refresh(true);
			}
			// Added for CFM Port Evacuation Process
			else if (oThat.Service === 'UOM') {
				oThat.oView.setModel(new JSONModel(oData.results[0].F4UomNav.results), "UOM");
				oThat.oView.getModel("UOM").refresh(true);
			}
			// end of added
			else if (oThat.Service === 'SUBMIT') {
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
						// MessageBox.success(aSuccess[0].Message);
						//code added by kirubakaran on 18.09.2020 for brazil plant for capture image
						if (oThat.oView.getModel("oViewModel").getData().NotaProperty === true) {
							oThat.onDmsPost(oData.PostWbHeaderNav.results[0].Wbid);
						}
						//code ended by kirubakaran on 18.09.2020 for brazil plant for capture image
						if (oThat.oView.getModel("ITEM").getData().EvWhSign == "X") {
							var canvas1 = document.querySelector("#__custom0 canvas");
							var canvas2 = document.querySelector("#__custom1 canvas");
							var ctx1 = canvas1.getContext("2d");
							var ctx2 = canvas2.getContext("2d");
							var image = new Image();
							oThat.signaturepad0 = new SignaturePad(canvas1);
							oThat.signaturepad2 = new SignaturePad(canvas2);
							// condition added by dharma on 30-11-2020
							if (oThat.signaturepad0 !== undefined || oThat.signaturepad2 !== undefined) {
								image.onload = function () {
									ctx1.drawImage(this.datas, 0, 0);
									ctx2.drawImage(this.datas, 0, 0);
								};
							}
							//added by dharma on 01-12-2020
							oThat._SignatureDialog.close();
						}

						//=================================== commented by chaithra ==========================//
						oThat.UnloadFrag.close();
						MessageBox.show(aSuccess[0].Message, {
							icon: MessageBox.Icon.SUCCESS,
							title: oThat.oView.getModel("i18n").getResourceBundle().getText("Title19"),
							actions: [MessageBox.Action.OK],
							onClose: function (oAction) {
								// added by Avinash
								// if (oThat.oTableSelctedItem) {
								// 	oThat.oView.getModel("oUnloadModel").getData().QualWbidNav.results.splice(oThat.oTableSelctedItem.split('/')[3], 1); // added by dharma for deleting once saved	
								// 	oThat.oView.getModel("oUnloadModel").refresh();
								// }

								if (oThat.TableSelectedObject) {
									var vDataArr = oThat.oView.getModel("oUnloadModDel").getData();
									for (var i = 0; i < vDataArr.QualWbidNav.results.length; i++) {
										if (vDataArr.QualWbidNav.results[i].Wbid == oThat.TableSelectedObject.Wbid && vDataArr.QualWbidNav.results[i].Batch ==
											oThat.TableSelectedObject.Batch && vDataArr.QualWbidNav.results[i].Maktx == oThat.TableSelectedObject.Maktx) {
											vDataArr.QualWbidNav.results.splice(i, 1);
											break;
										}
									}
									oThat.oView.getModel("oUnloadModDel").refresh();
								}

								var oUnloadModel = new JSONModel(vDataArr);
								oThat.oView.setModel(oUnloadModel, "oUnloadModel");
								oThat.oView.getModel("oUnloadModel").refresh();
								// ended by Avinash
								//BOC by Avinash
								oThat.getView().byId("id_SearchField").setValue("");
								//EOC by Avinash
								//	oThat.onDmsPost(oData.PostWbHeaderNav.results[0].Wbid);
								if (oAction === 'OK') {
									//BOC by Avinash for triggering PrintOut
									if (oThat.oView.getModel("ITEM").getData().EvOrigin == "F") { //Trigger Print for Every Items
										MessageBox.show(oThat.oView.getModel("i18n").getResourceBundle().getText("Msg2"), {
											icon: MessageBox.Icon.INFORMATION,
											title: oThat.oView.getModel("i18n").getResourceBundle().getText("Title16"),
											actions: [MessageBox.Action.YES, MessageBox.Action.NO],
											onClose: function (oAction) {
												if (oAction === 'YES') {
													var vWbid = oData.PostWbitemNav.results[0].Wbid;
													var sServiceUrl = oThat.oModel.sServiceUrl;
													var vSelectedLots = oThat.TableSelectedObject.Batch;
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
												}
											}
										});
									}
									if (oThat.oView.getModel("ITEM").getData().EvOrigin == "G" ||
										oThat.oView.getModel("ITEM").getData().EvOrigin == "I" //Line Added by Avinash 28/4/22
										||
										oThat.oView.getModel("ITEM").getData().EvOrigin == "K" //Added for Ghana TP/Biscuits
										||
										oThat.oView.getModel("ITEM").getData().EvOrigin == "M") { //Added for CFM (2701)
										var vUnloadData = oThat.oView.getModel("oUnloadModel").getData().QualWbidNav.results,
											vRefExist = false;
										for (var i = 0; i < vUnloadData.length; i++) {
											if (oData.PostWbitemNav.results[0].Wbid == vUnloadData[i].Wbid) {
												vRefExist = true;
												break;
											}
										}
										if (!vRefExist) { //Trigger Print Option for Last Reference ID
											MessageBox.show(oThat.oView.getModel("i18n").getResourceBundle().getText("Msg2"), {
												icon: MessageBox.Icon.INFORMATION,
												title: oThat.oView.getModel("i18n").getResourceBundle().getText("Title16"),
												actions: [MessageBox.Action.YES, MessageBox.Action.NO],
												onClose: function (oAction) {
													if (oAction === 'YES') {
														var vWbid = oData.PostWbitemNav.results[0].Wbid;
														var sServiceUrl = oThat.oModel.sServiceUrl;
														//Added on 27/4/22
														var vSelectedLots = "";
														var sRead = "/DownloadSet(IvWbid='" + vWbid + "',IvPrint='X',GateEntry='X',IvBatch='" + vSelectedLots +
															"')/$value";
														//End of Added	
														// var sRead = "/DownloadSet(IvWbid='" + vWbid + "',IvPrint='X',GateEntry='X')/$value";
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
													}
												}
											});
										}
									}
									//EOC by Avinash
									//	MessageBox.success(aSuccess[0].Message);
									//code added by kirubakaran for brazil plant on 18.12.2020
									if (oThat.oView.getModel("oViewModel").getData().NotaProperty === true) {
										var vWbid = oData.PostWbitemNav.results[0].Wbid;
										var vItem = oData.PostWbitemNav.results[0].Item;
										// if (!oThat.PDFDialog) {
										// 	oThat.PDFDialog = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PDFBR", oThat);
										// 	oThat.getView().addDependent(oThat.PDFDialog);
										// }
										// oThat.PDFDialog.open();
										// var readUrl = "/sap/opu/odata/SAP/ZGW_GT_MM_WB_MOBILITY_SRV/PrintSet(IvWbid='" + vWbid + "',IvItem='" + vItem +
										// 	"')/$value";
										// var oHTML = sap.ui.getCore().byId("idframe");
										// oHTML.setContent("<iframe src=" + readUrl + " height='100%' width='100%'></iframe>");
										// oHTML.attachBrowserEvent("load", function() {});
										// sap.ui.getCore().byId("PDFLabelID").setText("Unloading " + vWbid);
										oThat.getOwnerComponent().getModel().read("/UnloadTxtSet", {
											filters: [
												new Filter("IvItem", sap.ui.model.FilterOperator.EQ, vItem),
												new Filter("IvWbid", sap.ui.model.FilterOperator.EQ, vWbid)
											],
											urlParameters: {
												$expand: "UnloadTxtNav"
											},
											success: function (oData, oResponse) {
												sap.ui.core.BusyIndicator.hide();
												var ItemNo = oData.results[0].IvItem.split("0")[4];
												var textData = oData.results[0].UnloadTxtNav.results[0].ExText.replace("$$", ItemNo);
												var fileName = oData.results[0].UnloadTxtNav.results[0].ExName;
												var file = new Blob([textData], {
													type: "application/text"
												});
												var a = document.createElement("a"),
													url = URL.createObjectURL(file);
												a.href = url;
												a.download = fileName;
												document.body.appendChild(a);
												a.click();
												setTimeout(function () {
													document.body.removeChild(a);
													window.URL.revokeObjectURL(url);
												}, 0);
											},
											error: function () {
												sap.ui.core.BusyIndicator.hide();
												var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("Title21");
												MessageBox.error(vError);
											}
										});
									}
									//code ended by kirubakaran for brazil plant on 18.12.2020
								}
							}
						});
					}
				}
				// }
			} else if (oThat.Service === 'GETCHAR') {
				//Added by Avinash
				var vErr = false;
				if (oData.GetReturnNav.results.length > 0) {
					if (oData.GetReturnNav.results[0].Type == "E") {
						vErr = true;
					}
				}
				//End of added
				if (!vErr) {
					oThat.oView.getModel("BATCH").getData().BatchCharsNav = oData.BatchCharsNav;
					oThat.oView.getModel("BATCH").getData().BatchValuesNav = oData.BatchValuesNav;
					oData.CMS_NO = this.cmsData;
					oThat.oView.getModel("BATCH").refresh(true);
					oThat.onCreateChracteritis();
				} else {
					MessageBox.error(oData.GetReturnNav.results[0].Message);
				}
			} else if (oThat.Service == 'SETCHAR') {
				if (oData.PostReturnNav.results.length != 0) {
					var aError = oData.PostReturnNav.results.filter(function (x) {
						if (x.Type == 'E') {
							return x;
						}
					});

					if (aError != 0) {
						var Message;
						for (var i = 0; i < aError.length; i++) {
							Message = aError[i].Message + "\n";
						}
						MessageBox.error(Message);
					}

					//	} else {

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
								oThat.Batch.destroy();
								// ==================== Signature Pad open =====================//
								if ((oThat.oView.getModel("ITEM").getData().EvWhSign == "X" && oThat.oView.getModel("ITEM").getData().EvBatchUpd == "X") ||
									(oThat.oView.getModel("ITEM").getData().EvWhSign == "X")) {
									if (!oThat._SignatureDialog) {
										oThat._SignatureDialog = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Signature", oThat);
										oThat.oView.addDependent(oThat._SignatureDialog);
									}

									oThat._SignatureDialog.open();
									var canvas0 = document.querySelector("#__custom0 canvas");
									var canvas1 = document.querySelector("#__custom1 canvas");
									oThat.signaturepad0 = new SignaturePad(canvas0);
									// condition added by dharma on 30-11-2020
									if (document.querySelector("#__custom1")) {
										document.querySelector("#__custom1").style.display = "none";
									}
								} else if ((oThat.oView.getModel("ITEM").getData().EvWhSign != "X")) {
									oThat.SubmitItem();
								}

							}
						});
					}
					//	}
				} else {
					oThat.Batch.destroy();
					//=================== to make sequence Sloc/Batch/WH==========================//		

					//============================ commented by chaithra =========================//
					if ((oThat.oView.getModel("ITEM").getData().EvWhSign == "X" && oThat.oView.getModel("ITEM").getData().EvBatchUpd == "X") ||
						(oThat.oView.getModel("ITEM").getData().EvWhSign == "X")) {
						if (!oThat._SignatureDialog) {
							oThat._SignatureDialog = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Signature", oThat);
							oThat.oView.addDependent(oThat._SignatureDialog);
						}

						oThat._SignatureDialog.open();
						var canvas0 = document.querySelector("#__custom0 canvas");
						var canvas1 = document.querySelector("#__custom1 canvas");
						oThat.signaturepad0 = new SignaturePad(canvas0);
						// condition added by dharma on 30-11-2020
						if (document.querySelector("#__custom1")) {
							document.querySelector("#__custom1").style.display = "none";
						}
					} else if ((oThat.oView.getModel("ITEM").getData().EvWhSign != "X")) {
						oThat.SubmitItem();
					}
				}
				// }	
			} else if (oThat.Service === "POITEMS") {

				var unique = [];
				var tableData = oData.PoItemNav.results;
				var aModelData = oThat.oView.getModel("ITEM").getData().UnloadConfNav.results;

				for (var j in tableData) {
					var found = true;
					for (var i in aModelData) {

						if (tableData[j].Ebeln === aModelData[i].Ebeln && tableData[j].Matnr.replace(/^0+/, '') === aModelData[i].Matnr.replace(/^0+/,
								'')) {
							found = false;
						}
					}
					if (found) {
						unique.push(tableData[j]);
					}
				}
				oData.PoItemNav.results = unique;
				oThat.oView.setModel(new JSONModel(oData), "POITEMS");
				oThat.oView.getModel("POITEMS").updateBindings(true);

			} else if (oThat.Service === 'BATCH') {
				var oData1 = {
					"BatchCharsNav": [],
					"BatchValuesNav": [],
					"CMS_NO": ""
				};
				oThat.oView.setModel(new JSONModel(oData), "BATCH");
				oThat.oView.getModel("BATCH").refresh(true);
				if (oData.QualCharNav.results[0].Charg != "") {
					oThat.oView.getModel("Head").getData().Charg = oData.QualCharNav.results[0].Charg;
					// sap.ui.getCore().byId("id_BatchNumber").setEnabled(false);
					// oThat.oView.getModel("Head").getData().Matxt = oData.QualCharNav.results[0].Matxt;
					oThat.oView.getModel("Head").refresh();
					//Commented by Avinash
					oThat.Batch = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Batch", oThat);
					oThat.oView.addDependent(oThat.Batch);
					oThat.Batch.setEscapeHandler(oThat.onEscapeBatch);
					oThat.Batch.open();
					//End of commented..
					//BOC by Avinash
					// if (!oThat.Batch) {
					// 	oThat.Batch = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Batch", oThat);
					// 	oThat.getView().addDependent(oThat.Batch);
					// }
					oThat.Batch.open();
					//EOC by Avinash
					if (oThat.oView.getModel("Head").getData().Charg !== "" && oThat.oView.getModel("Head").getData().Charg !== undefined) {
						// sap.ui.getCore().byId("id_BatchNumber").setEnabled(false);
						sap.ui.getCore().byId("id_BatchNumber").setEnabled(false);
					}
					// sap.ui.getCore().byId("id_BatchCancle").setVisible(false); //Commented by Avinash
					sap.ui.getCore().byId("id_BtnRejChar").setVisible(false);
				} else {
					//Commented by Avinash
					oThat.Batch = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Batch", oThat);
					oThat.oView.addDependent(oThat.Batch);
					oThat.Batch.setEscapeHandler(oThat.onEscapeBatch);
					oThat.Batch.open();
					//End of commented..
					//BOC by Avinash
					// if (!oThat.Batch) {
					// 	oThat.Batch = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Batch", oThat);
					// 	oThat.getView().addDependent(oThat.Batch);
					// }
					// oThat.Batch.open();
					//EOC by Avinash
					if (oThat.oView.getModel("Head").getData().Charg !== "" && oThat.oView.getModel("Head").getData().Charg !== undefined) {
						// sap.ui.getCore().byId("id_BatchNumber").setEnabled(false);
						sap.ui.getCore().byId("id_BatchNumber").setEnabled(false);
					}
					// sap.ui.getCore().byId("id_BatchCancle").setVisible(false); //Commented by Avinash
					sap.ui.getCore().byId("id_BtnRejChar").setVisible(false);
					// sap.ui.getCore().byId("id_BatchNumber").setEnabled(true);
					sap.ui.getCore().byId("id_BatchNumber").setEnabled(true);
				}
			} else if (oThat.Service === "UpdatePODETAILS") {
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

						MessageBox.show(aSuccess[0].Message, {
							icon: MessageBox.Icon.SUCCESS,
							title: oThat.oView.getModel("i18n").getResourceBundle().getText("Title19"),
							actions: [MessageBox.Action.OK],
							onClose: function (oAction) {
								if (!oThat.delItem) {
									oThat.oView.getModel("ITEM").getData().UnloadConfNav.results = [];
									oThat.oView.getModel("ITEM").getData().NonFertWbData = []; //added by srinivas on 29/08/2025 project Amanah based on fert  ncp changes	
									for (var x in oData.PostWbitemNav.results) {
										//added by srinivas on 29/08/2025 Project Amanah based on fert  ncp changes	
										if (oThat.aNonFertWbData.length > 0) {
											oThat.oView.getModel("ITEM").getData().NonFertWbData.push(oData.PostWbitemNav.results[x]);
										} else {
											//ended by srinivas Project Amanah ncp changes	
											oThat.oView.getModel("ITEM").getData().UnloadConfNav.results.push(oData.PostWbitemNav.results[x]);
										}
									}
									oThat.oView.getModel("ITEM").updateBindings(true);
									oThat.onClosePOItem();
								} else {
									//added by srinivas Project Amanah param H replica to new param - ncp changes
									if (oThat.aNonFertWbData.length > 0) {
										var ItemsDetails = oThat.oView.getModel("ITEM").getData().NonFertWbData;
									} else {
										//ended by srinivas Project Amanah param H replica to new param - ncp changes	
										var ItemsDetails = oThat.oView.getModel("ITEM").getData().UnloadConfNav.results;
									}

									for (var i in ItemsDetails) {
										if (oThat.Obj.Ebeln === ItemsDetails[i].Ebeln && oThat.Obj.Matnr === ItemsDetails[i].Matnr &&
											oThat.Obj.Matnr === ItemsDetails[i].Matnr) {
											ItemsDetails.splice(i, 1);

										}
									}
									oThat.oView.getModel("ITEM").refresh(true);

								}
							}
						});
					}
				}
			}

		},
		//Added by Avinash
		onClose: function () {
			var oThat = this;
			// oThat.Batch.close();
			oThat.Batch.destroy();
		},


		//	 Added on 01/07/2025 by Srinivas for origin combo box
		onHandleChangeCombo: function (oEvent) {
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
						oThat.SelectedLots = ""; //Added by Avinash
					}
				})
			});
		},

		//End of added	

		myErrorHandler: function (oResponse) {
			oThat.BusyDialog.close();
			var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("Title21");
			MessageBox.show(oResponse.responseText, MessageBox.Icon.ERROR, vError);
		},
		fnTimer: function (oEvent) {
			setInterval(function () {
				var vTemp = "Date ";
				vTemp = vTemp + ((new Date().getDate().toString().length > 1) ? new Date().getDate().toString() : "0" + new Date().getDate().toString()) +
					"/";
				vTemp = vTemp + (((new Date().getMonth() + 1).toString().length > 1) ? (new Date().getMonth() + 1) : "0" + (new Date().getMonth() +
					1).toString()) + "/";
				vTemp = vTemp + (new Date().getFullYear()) + "   ";
				vTemp = vTemp + "Time  ";
				vTemp = vTemp + ((new Date().getHours().toString().length > 1) ? new Date().getHours().toString() : "0" + new Date().getHours()
						.toString()) +
					":";
				vTemp = vTemp + (((new Date().getMinutes()).toString().length > 1) ? (new Date().getMinutes()) : "0" + (new Date().getMinutes())
					.toString()) + ":";
				vTemp = vTemp + ((new Date().getSeconds().toString().length > 1) ? (new Date().getSeconds()) : "0" + (new Date().getSeconds().toString()));
				sap.ui.getCore().byId("id_time").setText(vTemp);
			}, 1000);
		},
		onPressStartUnload2901: function () {
			if (oThat.getView().getModel("ITEM").getData().UnloadConfNav.results[0].Check === true) {
				var oEntity = {
					"d": {
						"GateEntry": "",
						"VehAssign": "",
						"PreQual": "",
						"UnloadConf": "",
						"Unload_Start": "X",
						"GateExit": "",
						"Inbound": "X",
						"Outbound": "",
						"IvWboj": oThat.EvWtype,
						"PostReturnNav": [],
						"PostWbHeaderNav": [{
							"Wbid": oThat.Wbid
						}],
						"PostWbitemNav": [],
						"PostWsItemNav": [],
						"PostDmsNav": []
						//	"PrintitemNav": []
					}
				};
				oEntity.d.PostWbitemNav = oThat.getView().getModel("ITEM").getData().WbItemNav.results;

				oThat.oModel.create("/PostHeadersSet", oEntity, {
					success: function (oData, oResponse) {
						oThat.UnloadFrag2901.close();
						oThat.BusyDialog.close();
						if (oData.PostReturnNav.results.length > 0) {
							MessageBox.success(oData.PostReturnNav.results[0].Message);
						}
						oThat._onRouteMatched();
					},
					error: function (oResponse) {
						oThat.BusyDialog.close();
						oThat.UnloadFrag2901.close();
						var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("Title21");
						MessageBox.show(oResponse.responseText, MessageBox.Icon.ERROR, vError);
					}
				});
			} else {
				MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg20"));
			}
		},
		//====================================================================================//
		//================================ on Press List item ================================//
		//====================================================================================//
		onPressLoadItem: function (oEvent) {
			if (oThat.oView.getModel("ITEM")) {
				oThat.oView.getModel("ITEM").setData([]);
				oThat.oView.getModel("ITEM").refresh();
			}
			oThat.aFertWbData = []; // added by srinivas 0n 29/08/2025  ncp changes	
			oThat.aNonFertWbData = []; // added by srinivas 0n 29/08/2025	 ncp changes	
			oThat.PoDeleteItems = [];
			oThat.oTableSelctedItem = oEvent.getSource().getBindingContextPath(); // storing the path for deleting
			oThat.TableSelectedObject = oEvent.getSource().getBindingContext("oUnloadModel").getObject(); //Added by Avinash
			var oBject = oThat.oView.getModel("oUnloadModel").getObject(oEvent.getSource().getBindingContextPath());
			oThat.oView.getModel("oViewModel").setProperty("/vFertType", false);

			//added by srinivas on 29/08/2025 for Project Amanah to add new parameter to show all po in one popup to replicate exixting parameter H functionality to new param -  ncp changes
			// below in if condition Laxmikanth added the logic oThat.TableSelectedObject.QaMsgType == 'C'	
			var oIvItem;
			if (oThat.TableSelectedObject.QaMsgType == 'H' || oThat.TableSelectedObject.QaMsgType == '1' || oThat.TableSelectedObject.QaMsgType == 'C') {
				oIvItem = "00000";
			} else {
				oIvItem = oBject.Item;
			}
			// end by srinivas  ncp changes	
			// added on 18-01-2020
			var oEntity = {
				"d": {
					"GateEntry": "",
					"VehAssign": "",
					"PreQual": "",
					"UnloadConf": "X",
					"GateExit": "",
					"Inbound": "X",
					"Outbound": "",
					"IvDelivery": oBject.Vbeln,
					"IvPo": oBject.Ebeln,
					"IvWbid": oBject.Wbid,
					// "IvItem": oThat.TableSelectedObject.QaMsgType !== 'H' ? oBject.Item : "00000",
					"IvItem": oIvItem, // added by srinivas on 20/08/2025 by commenting above line  ncp changes	
					// "IvMatnr"	: oBject.Matnr,
					"IvWerks": oBject.Werks,
					"UnloadConfNav": [],
					"WbItemNav": [],
					"WbHeaderNav": [],
					"WsItemNav": [],
					"GetReturnNav": []
				}
			};
			oThat.oModel.create("/GetHeadersSet", oEntity, {
				success: function (oData, oResponse) {
					var vTemp = "";
					if (oBject) {
						vTemp = oBject.Unload_Start;
					}
					// EvWtype
					if (((oData.EvOrigin === "B" && oData.WbHeaderNav.results[0].Wtype === "TRIP") && vTemp !== "X")) {
						if (!oThat.UnloadFrag2901) {
							oThat.UnloadFrag2901 = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Unload_Item2901", oThat);
							oThat.oView.addDependent(oThat.UnloadFrag2901);
						}
						oThat.UnloadFrag2901.open();
						oThat.Wbid = oBject.Wbid;
						var oEntity1 = {
							"d": {
								"GateEntry": "",
								"VehAssign": "",
								"PreQual": "",
								"UnloadConf": "X",
								"GateExit": "",
								"Inbound": "X",
								"Outbound": "",
								"IvDelivery": oBject.Vbeln,
								"IvPo": oBject.Ebeln,
								"IvWbid": oBject.Wbid,
								//"IvItem": oThat.TableSelectedObject.QaMsgType !== 'H' ? oBject.Item : "00000",
								"IvItem": oIvItem, // added by srinivas on 20/08/2025 by commenting above line  ncp changes	
								// "IvMatnr"		: oBject.Matnr,
								"IvWerks": oBject.Werks,
								"UnloadConfNav": [],
								"WbHeaderNav": [],
								"WbItemNav": [],
								"WsItemNav": [],
								"GetReturnNav": [],
								"DelItemNav": []
							}
						};
						oThat.Service = "ITEM";
						oThat.onCallService(oThat.Service, oEntity1);
						oThat.fnTimer();
					} else {

						if (!oThat.UnloadFrag) {
							oThat.UnloadFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Unload_Item", oThat);
							oThat.oView.addDependent(oThat.UnloadFrag);
						}
						oThat.UnloadFrag.open();

						oThat.Wbid = oBject.Wbid;
						var oEntity = {
							"d": {
								"GateEntry": "",
								"VehAssign": "",
								"PreQual": "",
								"UnloadConf": "X",
								"GateExit": "",
								"Inbound": "X",
								"Outbound": "",
								"IvDelivery": oBject.Vbeln,
								"IvPo": oBject.Ebeln,
								"IvWbid": oBject.Wbid,
								//"IvItem": oThat.TableSelectedObject.QaMsgType !== 'H' ? oBject.Item : "00000",
								"IvItem": oIvItem, // added by srinivas on 20/08/2025 by commenting above line  ncp changes	
								// "IvMatnr"		: oBject.Matnr,
								"IvWerks": oBject.Werks,
								"UnloadConfNav": [],
								"WbHeaderNav": [],
								"WbItemNav": [],
								"WsItemNav": [],
								"GetReturnNav": [],
								"PoItemNav": [],
								"DelItemNav": []
							}
						};
						oThat.Service = "ITEM";
						oThat.onCallService(oThat.Service, oEntity);

					}
				},
				error: function (oError) {

				}
			});

			// ended on 18-01-2020
			/*	if (oBject.Werks === "2901") {
					//added by dharma on 12-01-2020
					if (!oThat.UnloadFrag2901) {
						oThat.UnloadFrag2901 = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Unload_Item2901", this);
						oThat.oView.addDependent(oThat.UnloadFrag2901);
					}
					oThat.UnloadFrag2901.open();
					oThat.fnTimer();
					oThat.Wbid = oBject.Wbid;
					var oEntity = {
						"d": {
							"GateEntry": "",
							"VehAssign": "",
							"PreQual": "",
							"UnloadConf": "X",
							"GateExit": "",
							"Inbound": "X",
							"Outbound": "",
							"IvDelivery": oBject.Vbeln,
							"IvPo": oBject.Ebeln,
							"IvWbid": oBject.Wbid,
							"IvItem": oBject.Item,
							// "IvMatnr"		: oBject.Matnr,
							"IvWerks": oBject.Werks,
							"UnloadConfNav": [],
							"WbItemNav": [],
							"WsItemNav": []
						}
					};
					oThat.Service = "ITEM";
					oThat.onCallService(oThat.Service, oEntity);

				} else {
					if (!oThat.UnloadFrag) {
						oThat.UnloadFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Unload_Item", this);
						oThat.oView.addDependent(oThat.UnloadFrag);
					}
					oThat.UnloadFrag.open();

					oThat.Wbid = oBject.Wbid;
					var oEntity = {
						"d": {
							"GateEntry": "",
							"VehAssign": "",
							"PreQual": "",
							"UnloadConf": "X",
							"GateExit": "",
							"Inbound": "X",
							"Outbound": "",
							"IvDelivery": oBject.Vbeln,
							"IvPo": oBject.Ebeln,
							"IvWbid": oBject.Wbid,
							"IvItem": oBject.Item,
							// "IvMatnr"		: oBject.Matnr,
							"IvWerks": oBject.Werks,
							"UnloadConfNav": [],
							"WbItemNav": [],
							"WsItemNav": []
						}
					};
					oThat.Service = "ITEM";
					oThat.onCallService(oThat.Service, oEntity);
				}*/
		},
		onValueHelpPress: function (oEvent) {
			oThat.vPath = oEvent.getSource().getParent().getBindingContextPath();
			var oBject = oThat.oView.getModel("ITEM").getObject(oEvent.getSource().getParent().getBindingContextPath());
			oThat.StorageFrag = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.StorageLoc", this);
			oThat.oView.addDependent(oThat.StorageFrag);
			oThat.StorageFrag.open();
			var filter = [
				new Filter("Matnr", sap.ui.model.FilterOperator.EQ, oBject.Matnr),
				new Filter("Werks", sap.ui.model.FilterOperator.EQ, oBject.Werks)
			];
			oThat.Service = 'SLOC';
			oThat.onCallService(oThat.Service, filter);
		},
		onValueHelpConfirmPlant: function (oEvent) {
			var vStLoc = oEvent.getParameter('selectedItem').getTitle();
			var oBject = oThat.oView.getModel("ITEM").getObject(oThat.vPath);
			oBject.Lgort = vStLoc;
			oThat.oView.getModel("ITEM").refresh(true);
			oThat.StorageFrag.destroy();
		},
		onValueHelpSearch: function (oEvent) {
			if (oThat.vId.indexOf("id_InVehicleNo") != -1) {
				var vValue = oEvent.getSource()._sSearchFieldValue;
				if (vValue && vValue.length > 0) {
					var oFilter1 = new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.Contains, vValue);
					var oFilter2 = new sap.ui.model.Filter("Vehno", sap.ui.model.FilterOperator.Contains, vValue);
					var oFilter3 = new sap.ui.model.Filter("Lifnr", sap.ui.model.FilterOperator.Contains, vValue);
					var oFilter4 = new sap.ui.model.Filter("Vehtyp", sap.ui.model.FilterOperator.Contains, vValue);
					var aAllFilter = new sap.ui.model.Filter([oFilter1, oFilter2, oFilter3, oFilter4]);
				}
				var binding = oEvent.getSource().getBinding("items");
				binding.filter(aAllFilter);
			} else {
				var sValue = oEvent.getParameter("value");
				var oFilter;
				oFilter = new sap.ui.model.Filter([
					new Filter("Lgort", sap.ui.model.FilterOperator.Contains, sValue),
					new Filter("Lgobe", sap.ui.model.FilterOperator.Contains, sValue)
				]);
				var oFilter2 = new sap.ui.model.Filter(oFilter, false);
				var oBinding = oEvent.getSource().getBinding("items");
				oBinding.filter([oFilter2]);
			}
		},

		//Added by Avinash

		onValueHelpSearchLoc: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter;
			oFilter = new sap.ui.model.Filter([
				new Filter("Lgort", sap.ui.model.FilterOperator.Contains, sValue),
				new Filter("Lgobe", sap.ui.model.FilterOperator.Contains, sValue)
			]);
			var oFilter2 = new sap.ui.model.Filter(oFilter, false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter2]);
		},

		onValueHelpConfirm: function (oEvent) {
			var oSelectedItem = oEvent.getParameter('selectedItem');
			var oSelectedItemObject = oEvent.getParameter('selectedItem').getBindingContext("oStatusModel").getObject();
			sap.ui.getCore().byId("id_InVehicleNo").setValue(oSelectedItemObject.Vehno);
			sap.ui.getCore().byId("id_InWbid").setValue(oSelectedItemObject.Wbid);
		},
		//End of Added
		//=======================================================================================================//
		//=============================== on Signature Pad =====================================================//
		//=====================================================================================================//
		onSignaturePress: function (oEvent) {
			if (sap.ui.getCore().byId("id_ItemTable").getSelectedItems().length != 0) {
				var flag = false;
				flagUom = false;
				for (var i = 0; i < sap.ui.getCore().byId("id_ItemTable").getSelectedContextPaths().length; i++) {
					// var vPath = sap.ui.getCore().byId("id_ItemTable").getSelectedItems()[i].oBindingContexts.ITEM.getPath();
					var vPath = sap.ui.getCore().byId("id_ItemTable").getSelectedContextPaths()[i];
					var oBject = oThat.oView.getModel("ITEM").getObject(vPath);
					//Added by Avinash on 10.06.21
					if (oThat.oView.getModel("ITEM").getData().EvOrigin == "B" && oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Wtype ==
						'TRIP') {
						flag = false;

					} else {
						var vErrMsg = "";
						if (oBject.Lgort === "") {
							flag = true;
							vErrMsg = oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg12") + "\n";
						}
						if (oThat.oView.getModel("ITEM").getData().EvOrigin === "E") {
							if (oBject.Token === "") {
								flag = true;
								vErrMsg = vErrMsg + oThat.oView.getModel("i18n").getResourceBundle().getText("EnterOrigin") + "\n";
							}
							if (oBject.DriverId === "") {
								flag = true;
								vErrMsg = vErrMsg + oThat.oView.getModel("i18n").getResourceBundle().getText("EnterBox");
							}
						}
						// Added by Suvethaa for Ghana TP/Biscuits
						if (oThat.oView.getModel("ITEM").getData().EvOrigin === "K") { //Added for CFM (2701)

							oThat.fnvalidatePoQuan(oBject, vErrMsg);

						}
						// End of added
					}
					//end of added..
					//Commented by Avinash
					// added by dharma on 01-02-2020
					// if (oThat.oView.getModel("ITEM").getData().EvOrigin !== "B" && oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Wtype !==
					// 	'TRIP') {
					// 	if (oBject.Lgort === "") {
					// 		flag = true;

					// 	}
					// }
					//End of Commented...

					if (oThat.oView.getModel("ITEM").getData().EvOrigin !== "K") {
						if (flag === true) {
							MessageBox.error(vErrMsg); //Changed by Avinash
						} else {
							//=================To enable Batch first later WH =======================//
							if ((oThat.oView.getModel("ITEM").getData().EvWhSign == "X" && oThat.oView.getModel("ITEM").getData().EvBatchUpd == "X") ||
								(oThat.oView.getModel("ITEM").getData().EvBatchUpd == "X")) {
								oThat.onBatchUpdate();
							}
							///===================== without batch and WH ====================//	
							else if ((oThat.oView.getModel("ITEM").getData().EvWhSign != "X" && oThat.oView.getModel("ITEM").getData().EvBatchUpd != "X")) {
								oThat.SubmitItem();
							} else if ((oThat.oView.getModel("ITEM").getData().EvWhSign == "X" && oThat.oView.getModel("ITEM").getData().EvBatchUpd !=
									"X")) {
								if (!oThat._SignatureDialog) {
									oThat._SignatureDialog = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Signature", oThat);
									oThat.oView.addDependent(oThat._SignatureDialog);
								}
								oThat._SignatureDialog.open();
								var canvas0 = document.querySelector("#__custom0 canvas");
								var canvas1 = document.querySelector("#__custom1 canvas");
								oThat.signaturepad0 = new SignaturePad(canvas0);
								// condition added by dharma on 30-11-2020
								if (document.querySelector("#__custom1")) {
									document.querySelector("#__custom1").style.display = "none";
								}
							}

						}
					}
				}
			} else {
				MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg10"));
			}

		},
		_SignatureCancel: function () {

			var canvas1 = document.querySelector("#__custom0 canvas");
			var canvas2 = document.querySelector("#__custom1 canvas");
			if (canvas1) {
				var ctx1 = canvas1.getContext("2d");
			}
			if (canvas1) {
				var ctx2 = canvas1.getContext("2d");
			}
			if (ctx1) {
				var image = new Image();
				oThat.signaturepad1 = new SignaturePad(canvas1);
				// condition added by dharma on 30-11-2020
				if (oThat.signaturepad1) {
					image.onload = function () {
						ctx1.drawImage(this.datas, 0, 0);
						ctx2.drawImage(this.datas, 0, 0);
					};
				}
			}
		},
		_SignatureSave: function () {
			if (oThat.signaturepad0.isEmpty()) {
				var WHSignError = oThat.oView.getModel("i18n").getResourceBundle().getText("WHSignError");
				MessageBox.information(WHSignError);
				// return;
			} else {
				oThat.oView.getModel("oUnloadModel").refresh();
				if (sap.ui.getCore().byId("id_ItemTable").getSelectedItems().length != 0) {
					var oEntity = {
						"d": {
							"GateEntry": "",
							"VehAssign": "",
							"PreQual": "",
							"UnloadConf": "X",
							"GateExit": "",
							"Inbound": "X",
							"Outbound": "",
							"IvWboj": oThat.EvWtype,
							"PostReturnNav": [],
							"PostWbHeaderNav": [{
								"Wbid": oThat.Wbid
							}],
							"PostWbitemNav": [],
							"PostWsItemNav": [],
							"PostDmsNav": []
							//	"PrintitemNav": []
						}
					};
					var oTable = sap.ui.getCore().byId("id_ItemTable");
					$.each(sap.ui.getCore().byId("id_ItemTable").getSelectedItems(), function (index, value, array) {
						// var oPath = oTable.getSelectedItems()[index].oBindingContexts.ITEM.getPath();
						var oPath = oTable.getSelectedContextPaths()[index];
						var oBject = oThat.oView.getModel("ITEM").getObject(oPath);

						if (oThat.EvWtype === "WB") {
							for (var i = 0; i < oThat.oView.getModel("ITEM").getData().WbItemNav.results.length; i++) {
								delete oThat.oView.getModel("ITEM").getData().WbItemNav.results[i].__metadata;
								if (oBject.Wbid == oThat.oView.getModel("ITEM").getData().WbItemNav.results[i].Wbid &&
									oBject.Item == oThat.oView.getModel("ITEM").getData().WbItemNav.results[i].Item) {
									oThat.oView.getModel("ITEM").getData().WbItemNav.results[i].Ntgew = oBject.Quantity; //Added for Ghana TP/Biscuits
									oThat.oView.getModel("ITEM").getData().WbItemNav.results[i].Uom = oBject.Uom; //Added for Ghana TP/Biscuits
									oThat.oView.getModel("ITEM").getData().WbItemNav.results[i].Lgort = oBject.Lgort;
									if (oThat.oView.getModel("ITEM").getData().EvBatchUpd == "X" && oThat.oView.getModel("Head")) {
										oThat.oView.getModel("ITEM").getData().WbItemNav.results[i].Batch = oThat.oView.getModel("Head").getData().Charg;
									}
									oThat.oView.getModel("ITEM").refresh();
									break;
								}
							}
							oEntity.d.PostWbitemNav = oThat.oView.getModel("ITEM").getData().WbItemNav.results;
						} else {
							for (var i = 0; i < oThat.oView.getModel("ITEM").getData().WsItemNav.results.length; i++) {
								delete oThat.oView.getModel("ITEM").getData().WsItemNav.results[i].__metadata;
								if (oBject.Wbid == oThat.oView.getModel("ITEM").getData().WsItemNav.results[i].Wbid &&
									Number(oBject.Item) == Number(oThat.oView.getModel("ITEM").getData().WsItemNav.results[i].Item)) {
									// oThat.oView.getModel("ITEM").getData().WsItemNav.results[i].Config10 = oBject.Lgort;
									oThat.oView.getModel("ITEM").getData().WsItemNav.results[i].Lgort = oBject.Lgort;
									if (oThat.oView.getModel("ITEM").getData().EvBatchUpd == "X" && oThat.oView.getModel("Head")) {
										oThat.oView.getModel("ITEM").getData().WsItemNav.results[i].Batch = oThat.oView.getModel("Head").getData().Charg;
									}
									oThat.oView.getModel("ITEM").refresh();
									break;
								}
							}
							oEntity.d.PostWsItemNav = oThat.oView.getModel("ITEM").getData().WsItemNav.results;
						}

					});
					// added by dharma on 01/12/2020
					if (oThat.signaturepad0.toDataURL("image/png")) {
						oEntity.d.PostDmsNav.push({
							"Filename": oThat.signaturepad0.toDataURL("image/png").split(",")[1],
							"Fname": oThat.oView.getModel("i18n").getResourceBundle().getText("Text12"),
							"Ftype": "image/png"
						});
					} else { // added by dharma on 01-12-2020
						oEntity.d.PostDmsNav.push({
							"Filename": "No File",
							"Fname": oThat.oView.getModel("i18n").getResourceBundle().getText("Text12"),
							"Ftype": "image/png"
						});
					}
					//IvRemarks
					oEntity.d.IvRemarks = this.REASON;
					oThat.Service = 'SUBMIT';
					oThat.onCallService(oThat.Service, oEntity);
				}
			}
		},

		onClickBack: function () {
			oThat.UnloadFrag.close();
		},
		onClickBack2901: function () {
			this.UnloadFrag2901.close();
		},

		fnPDFViewClose: function () {
			oThat.PDFDialog.close();
		},

		SubmitItem: function () {
			if (sap.ui.getCore().byId("id_ItemTable").getSelectedItems().length != 0) {
				var oEntity = {
					"d": {
						"GateEntry": "",
						"VehAssign": "",
						"PreQual": "",
						"UnloadConf": "X",
						"GateExit": "",
						"Inbound": "X",
						"Outbound": "",
						"IvWboj": oThat.EvWtype,
						"PostReturnNav": [],
						"PostWbHeaderNav": [{
							"Wbid": oThat.Wbid
						}],
						"PostWbitemNav": [],
						"PostWsItemNav": [],
						"PostDmsNav": []
						//	"PrintitemNav": []
					}
				};
				var oTable = sap.ui.getCore().byId("id_ItemTable");
				$.each(sap.ui.getCore().byId("id_ItemTable").getSelectedItems(), function (index, value, array) {
					// var oPath = oTable.getSelectedItems()[index].oBindingContexts.ITEM.getPath();
					var oPath = oTable.getSelectedContextPaths()[index];
					var oBject = oThat.oView.getModel("ITEM").getObject(oPath);
					if (oThat.EvWtype === "WB") {
						for (var i = 0; i < oThat.oView.getModel("ITEM").getData().WbItemNav.results.length; i++) {
							delete oThat.oView.getModel("ITEM").getData().WbItemNav.results[i].__metadata;
							if (oBject.Wbid == oThat.oView.getModel("ITEM").getData().WbItemNav.results[i].Wbid &&
								oBject.Item == oThat.oView.getModel("ITEM").getData().WbItemNav.results[i].Item) {
								// oThat.oView.getModel("ITEM").getData().WbItemNav.results[i].Config10 = oBject.Lgort;
								oThat.oView.getModel("ITEM").getData().WbItemNav.results[i].Lgort = oBject.Lgort;
								// added by srinivas on 03/09/2025 for packaging details  ncp changes	
								if (oThat.oView.getModel("ITEM").getData().UnloadConfNav?.results?.[i]?.PackagingDetails) {
									var unloadItem = oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[i];
									var wbItem = oThat.oView.getModel("ITEM").getData().WbItemNav.results[i];
									// check PackagingDetails
									if (unloadItem?.PackagingDetails?.length > 0) {
										wbItem.Pkwgt = unloadItem.Weight || "0.000";
										wbItem.Pmat1 = unloadItem.PackagingDetails[0]?.Type || "";
										wbItem.Pmatuom1 = unloadItem.PackagingDetails[0]?.Uom || "";
										wbItem.Pmatno1 = unloadItem.PackagingDetails[0]?.Bags || "0.000";
										wbItem.Pmatqty1 = unloadItem.PackagingDetails[0]?.Gross || "0.000";
										wbItem.Trwgt1 = unloadItem.PackagingDetails[0]?.Tare || "0.000";
									}
									// check second packaging
									if (unloadItem?.PackagingDetails?.length > 1) {
										wbItem.Pmat2 = unloadItem.PackagingDetails[1]?.Type || "";
										wbItem.Pmatuom2 = unloadItem.PackagingDetails[1]?.Uom || "";
										wbItem.Pmatno2 = unloadItem.PackagingDetails[1]?.Bags || "0.000";
										wbItem.Pmatqty2 = unloadItem.PackagingDetails[1]?.Gross || "0.000";
										wbItem.Trwgt2 = unloadItem.PackagingDetails[1]?.Tare || "0.000";
									}
								}
								//ended by srinivas  ncp changes	
								if (oThat.oView.getModel("ITEM").getData().EvBatchUpd == "X" && oThat.oView.getModel("Head")) {
									oThat.oView.getModel("ITEM").getData().WbItemNav.results[i].Batch = oThat.oView.getModel("Head").getData().Charg;
								}
								oThat.oView.getModel("ITEM").refresh();
								break;
							}
						}
						oEntity.d.PostWbitemNav = oThat.oView.getModel("ITEM").getData().WbItemNav.results;
					} else {
						for (var i = 0; i < oThat.oView.getModel("ITEM").getData().WsItemNav.results.length; i++) {
							delete oThat.oView.getModel("ITEM").getData().WsItemNav.results[i].__metadata;
							if (oBject.Wbid == oThat.oView.getModel("ITEM").getData().WsItemNav.results[i].Wbid &&
								Number(oBject.Item) == Number(oThat.oView.getModel("ITEM").getData().WsItemNav.results[i].Item)) {
								// oThat.oView.getModel("ITEM").getData().WsItemNav.results[i].Config10 = oBject.Lgort;
								oThat.oView.getModel("ITEM").getData().WsItemNav.results[i].Lgort = oBject.Lgort;
								if (oThat.oView.getModel("ITEM").getData().EvBatchUpd == "X" && oThat.oView.getModel("Head")) {
									oThat.oView.getModel("ITEM").getData().WsItemNav.results[i].Batch = oThat.oView.getModel("Head").getData().Charg;
								}
								oThat.oView.getModel("ITEM").refresh();
								break;
							}
						}
						oEntity.d.PostWsItemNav = oThat.oView.getModel("ITEM").getData().WsItemNav.results;
					}

				});
				oThat.Service = 'SUBMIT';
				oThat.onCallService(oThat.Service, oEntity);
			}
		},
		onBatchUpdate: function () {
			if (oThat.oView.getModel("ITEM").getData().EvBatchUpd == "X" && oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Charg !=
				"") {
				oThat.oView.setModel(new JSONModel(oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0]), "Head");
				oThat.oView.getModel("Head").refresh();
				var oData1 = {
					"BatchCharsNav": [],
					"BatchValuesNav": [],
					"CMS_NO": ""
				};
				oThat.oView.setModel(new JSONModel(oData1), "BATCH");
				oThat.oView.getModel("BATCH").refresh(true);
				oThat.Batch = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Batch", oThat);
				oThat.oView.addDependent(oThat.Batch);
				oThat.Batch.setEscapeHandler(oThat.onEscapeBatch);
				oThat.Batch.open();
				//BOC Avinash - Business Requirement ( Need not to click Charac., button, to directly load Charac., details)
				if (oThat.oView.getModel("ITEM").getData().EvOrigin === "G" || oThat.oView.getModel("ITEM").getData().EvOrigin === "F" || oThat.oView
					.getModel("ITEM").getData().EvOrigin === "I") {
					oThat.onPressCharacteristics();
					sap.ui.getCore().byId("id_BtnChar").setVisible(false);
				} else {
					sap.ui.getCore().byId("id_BtnChar").setVisible(true);
				}
				//EOC Avinash
				// if (!oThat.Batch) {
				// 	oThat.Batch = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Batch", oThat);
				// 	oThat.getView().addDependent(oThat.Batch);
				// }

				// oThat.Batch.open();
				//EOC by Avi
				if (oThat.oView.getModel("Head").getData().Charg !== "" && oThat.oView.getModel("Head").getData().Charg !== undefined) {
					// sap.ui.getCore().byId("id_BatchNumber").setEnabled(false);
					sap.ui.getCore().byId("id_BatchNumber").setEnabled(false);
				}
				// sap.ui.getCore().byId("id_BatchCancle").setVisible(false); //commented by avinash
				sap.ui.getCore().byId("id_BtnRejChar").setVisible(false);
			}
			//================= Added for orbit change ===============//
			else if (oThat.oView.getModel("ITEM").getData().EvBatchUpd == "X" && oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[
					0]
				.Charg == "") {
				oThat.oView.setModel(new JSONModel(oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0]), "Head");
				oThat.oView.getModel("Head").refresh();
				var oEntity = {
					"d": {
						"GateEntry": "",
						"VehAssign": "",
						"PreQual": "X",
						"UnloadConf": "X",
						"GateExit": "",
						"Inbound": "X",
						"Outbound": "",
						"IvDelivery": "",
						"IvPo": "",
						"IvWbid": oThat.Wbid,
						"IvWerks": "",
						"QualWbidNav": [],
						"PreQualNav": [],
						"QualCharNav": [],
						"GetReturnNav": []
					}
				};
				oEntity.d.QualCharNav.push({
					"Wbid": oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Wbid,
					"Item": oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Item,
					"Matnr": oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Matnr,
					"Werks": oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Werks,
					"Ebeln": oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Ebeln,
					"Vbeln": oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Vbeln,
					"Ebelp": oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Ebelp,
					"Posnr": oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Posnr,
					"Matxt": oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Matxt
					//	"CMS_NO": oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].UNSEZ
				});
				oThat.Service = 'BATCH';
				oThat.onCallService(oThat.Service, oEntity);
			}

			//=================== ended for orbit ===================//
		},
		//===========================================================================================//
		//================================== on Press characteristics ==============================//
		//=========================================================================================//
		onPressCharacteristics: function (oEvent) {
			//	this.cmsData = oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].UNSEZ;
			if (oThat.oView.getModel("Head").getData().Charg === "") {
				MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg4"));
			} else {
				// sap.ui.getCore().byId("id_BatchNumber").setEnabled(false);
				sap.ui.getCore().byId("id_BatchNumber").setEnabled(false);
				var oEntity = {
					"MaterialNav": [],
					"BatchCharsNav": [],
					"BatchValuesNav": [],
					"GetReturnNav": [], //Added by Avinash to Populate Error Msg
					"CMS_NO": oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].UNSEZ
				};
				var oBject = {
					"Matnr": oThat.oView.getModel("Head").getData().Matnr,
					"Werks": oThat.oView.getModel("Head").getData().Werks,
					"Lgort": "",
					"Charg": oThat.oView.getModel("Head").getData().Charg.toUpperCase(),
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
			var oDialog = sap.ui.getCore().byId("id_PanelChar");
			oDialog.destroyContent();
			if (oThat.oView.getModel("BATCH").getData().BatchCharsNav != null &&
				oThat.oView.getModel("BATCH").getData().BatchValuesNav != null) {
				sap.ui.getCore().byId("id_BtnCharSave").setVisible(true);
				sap.ui.getCore().byId("id_BtnCharSave").setText(oThat.oView.getModel("i18n").getResourceBundle().getText('Label14'));
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
					if (aLocArr[i].SingleValue && oCharMulValue.length > 0 && vSelectFlag) { // select box
						vCombo = false;
						var oLabel = new sap.m.Label({
							text: vAtbez + " :",
							tooltip: aLocArr[i].DescrChar,
							width: "12rem",
							wrapping: true,
							design: "Bold"
						}).addStyleClass("lblAlignRes");
						oRdPanel = new sap.m.Panel({}).addStyleClass("Cl_Batch_Panel");
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
						// added by Harshini 16-03-2020
						if (aLocArr[i].ValueChar !== "") { // to set value in the comboBox
							for (var ind = 0; ind < oJsonDetails.Select.length; ind++) {
								if (aLocArr[i].ValueChar === oJsonDetails.Select[ind].DescrCval) {
									oRdGrp.setSelectedKey(oJsonDetails.Select[ind].CharValue);
								}
							}
						}
						// ended by Harshini
						// Code added by kirubakaran for brazil plant on 11.10.2020
						if (oJsonDetails.Select.length < 3) {
							if (aLocArr[i].NameChar === "CFCERTIFICATE") { // to set value in the comboBox
								for (var indi = 0; indi < oJsonDetails.Select.length; indi++) {
									if (aLocArr[i].NameChar === oJsonDetails.Select[indi].NameChar) {
										oRdGrp.setSelectedKey(oJsonDetails.Select[indi].CharValue);
									}
								}
							}
							if (aLocArr[i].NameChar === "GRUPO") { // to set value in the comboBox
								for (var indiV = 0; indiV < oJsonDetails.Select.length; indiV++) {
									if (aLocArr[i].NameChar === oJsonDetails.Select[indiV].NameChar) {
										oRdGrp.setSelectedKey(oJsonDetails.Select[indiV].CharValue);
									}
								}
							}
						}
						// code ended by kirubakaran for brazil plant on 11.10.2020
						oRdPanel.addContent(oLabel);
						oRdPanel.addContent(oRdGrp);
						oGrid.addContent(oRdPanel);
						vRdNm = (oLabel.getText().split(" :")[0]).toLocaleUpperCase();
					} else if (aLocArr[i].SingleValue) { // input
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
							liveChange: function (oEvent) {
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
				if (oThat.oView.getModel("BATCH").getData().BatchCharsNav.results.length !== 0) {
					sap.ui.getCore().byId("id_BtnChar").setEnabled(false);
					sap.ui.getCore().byId("id_BtnCharSave").setVisible(true);
				}
			} else {
				MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText('ErrorMsg8'));
				sap.ui.getCore().byId("id_BtnCharSave").setVisible(false);
				sap.ui.getCore().byId("id_BtnRejChar").setVisible(false);
			}
		},
		fnSaveBatchChar: function (oEvent) {
			var vId = oEvent.getSource().getId();
			var IvApprove;
			if (vId.indexOf("id_BtnCharSave") != -1) {
				oThat.IApprove = "A";
			} else if (vId.indexOf("id_BtnRejChar") != -1) {
				oThat.IApprove = "R";
			}
			var oController = this;
			var vMsg = '',
				vControl = '';
			var n = 0; //Added by Avinash
			//	var oDialog = oController.dialog;
			// if (oThat.oView.getModel("ITEM").getData().EvOrigin !== 'N') {
			var oDiContent = sap.ui.getCore().byId("id_PanelChar").getContent()[0].getContent();
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
				if (oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[i].EntryObligatory && !vValue) {
					vMsg = oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[i].DescrChar + ' ' + oThat.oView.getModel("i18n").getResourceBundle()
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
					//	oController.dialog.close();
					for (var j = 0; j < oThat.oView.getModel("BATCH").getData().BatchCharsNav.results.length; j++) {
						if (oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[j].Werks ==
							oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[i].Werks &&
							oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[j].Matnr ==
							oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[i].Matnr &&
							oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[j].NameChar ==
							oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[i].NameChar) {
							oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[j].ValueChar = vValue;
							var index = "/" + "BatchCharsNav/results/" + j + "/Flag";
							oThat.oView.getModel("BATCH").setProperty(index, true);
							oThat.oView.getModel("BATCH").refresh(true);
							break;
						}
					}
				}
				// }//For turkey project
				oThat.Service = "SETCHAR";
				// added by srinivas on 22/07/2025 for DSE dropdown
				if (oThat.oView.getModel("ITEM").getData().WbHeaderNav.results[0].Wtype == "PROCURE" && oThat.oView.getModel("ITEM").getData().EvOrigin === "X" && oThat.oView.getModel("ITEM").getData().UnloadConfNav.results[0].Ebeln == "") {
					var oToken = oThat.oView.getModel("Head").getData().Token;
				} else if (oThat.oView.getModel("ITEM").getData().EvOrigin === "E") {
					var oToken = oThat.oView.getModel("Head").getData().Token;
				}
				// ended by srinivas on 22/07/2025 for DSE dropdown
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
					//"IToken": oThat.oView.getModel("ITEM").getData().EvOrigin === "E" ? oThat.oView.getModel("Head").getData().Token : "", //Need to modify -- Avinash
					"IToken": oToken, // added by srinivas on 22/07/2025
					"IdriverId": oThat.oView.getModel("ITEM").getData().EvOrigin === "E" ? oThat.oView.getModel("Head").getData().DriverId : "", //Need to modify -- Avinash
					"IApprove": oThat.IApprove,
					"IBatchCharUpd": "X",
					"PostBatchCharNav": [],
					"PostReturnNav": []
				};
				if (oThat.oView.getModel("BATCH").getData().BatchCharsNav.results.length != 0) {
					var aBatchData = [];
					for (var b = 0; b < oThat.oView.getModel("BATCH").getData().BatchCharsNav.results.length; b++) {
						//Commented by Avinash - To Pass 0 values when empty batch charac.,
						// if (oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[b].Flag !== undefined && oThat.oView.getModel("BATCH").getData()
						// 	.BatchCharsNav.results[b].ValueChar !== "") {
						if (oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[b].Flag !== undefined) {
							aBatchData.push({
								//Changed by Avinash
								CValue: oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[b].DataType === "NUM" ? oThat.oView.getModel("BATCH")
									.getData()
									.BatchCharsNav.results[b].ValueChar === "" ? "0" : oThat.oView.getModel(
										"BATCH").getData().BatchCharsNav.results[b].ValueChar : oThat.oView.getModel(
										"BATCH").getData().BatchCharsNav.results[b].ValueChar,
								//Changed by Avinash		
								// CValue: oThat.oView.getModel("BATCH").getData().BatchCharsNav.results[b].ValueChar === "" ? "0" : oThat.oView.getModel( //Changed by Avinash
								// 	"BATCH").getData().BatchCharsNav.results[b].ValueChar,
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
			// } 
			// else {//Added for Turkey Project
			// 	oThat.Service = "SETCHAR";
			// 	var oEntity = {
			// 		"IAppname": "QC",
			// 		"ICharg": oThat.oView.getModel("Head").getData().Charg,
			// 		"IFinalApproval": "",
			// 		"IItem": oThat.oView.getModel("Head").getData().Item,
			// 		"ILifnr": "",
			// 		"IMatnr": oThat.oView.getModel("Head").getData().Matnr,
			// 		"IQchar": "",
			// 		"ITmode": "",
			// 		//"IvWboj"		: oThat.EvWtype,
			// 		"IWbid": oThat.oView.getModel("Head").getData().Wbid,
			// 		"IWerks": oThat.oView.getModel("Head").getData().Werks,
			// 		"EMessage": "",
			// 		"IEbeln": oThat.oView.getModel("Head").getData().Ebeln,
			// 		"IEbelp": oThat.oView.getModel("Head").getData().Ebelp,
			// 		"IVbeln": oThat.oView.getModel("Head").getData().Vbeln,
			// 		"IPosnr": oThat.oView.getModel("Head").getData().Posnr,
			// 		"IToken": oThat.oView.getModel("ITEM").getData().EvOrigin === "E" ? oThat.oView.getModel("Head").getData().Token : "", //Need to modify -- Avinash
			// 		"IdriverId": oThat.oView.getModel("ITEM").getData().EvOrigin === "E" ? oThat.oView.getModel("Head").getData().DriverId : "", //Need to modify -- Avinash
			// 		"IApprove": oThat.IApprove,
			// 		"IBatchCharUpd": "X",
			// 		"PostBatchCharNav": [],
			// 		"PostReturnNav": []

			// 	};
			// 	oThat.onCallService(oThat.Service, oEntity);
			// }

		},
		// =========================================Packaging Weight added by srinivas on 25/08/2025 ncp changes===================

		onOpenPackagingDetails: function (oEvent) {
			var oView = this.getView();
			var oThat = this;

			if (!oThat._PackingWeightoDialog) {
				oThat._PackingWeightoDialog = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Packing_Weight", oThat);
				oView.addDependent(oThat._PackingWeightoDialog);
			}
			oThat._PackingWeightoDialog.addStyleClass("customPackingDialog");

			// Save parent row context
			oThat._oRowContext = oEvent.getSource().getBindingContext("ITEM");
			var oParentModel = oThat._oRowContext.getModel("ITEM");
			var sPath = oThat._oRowContext.getPath();

			var sWbid = oParentModel.getProperty(sPath + "/Wbid");
			var sItem = oParentModel.getProperty(sPath + "/Item");
			var sEbeln = oParentModel.getProperty(sPath + "/Ebeln");
			var sEbelp = oParentModel.getProperty(sPath + "/Ebelp");
			var sMatnr = oParentModel.getProperty(sPath + "/Matnr");
			var aFilters = [
				// new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.EQ, "236236000426"),
				// new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, "100000024051"),
				new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.EQ, sWbid),
				new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, sMatnr),
				
			];
			oThat.oModel.read("/PackingWeightSet", {
				filters: aFilters,
				success: function (oData) {
					var aDropDownValues = oData.results || [];
					  // ✅ Check if parent already has PackagingDetails saved
                    var aSavedRows = oParentModel.getProperty(sPath + "/PackagingDetailsUI") || [];
					   var aRows;
            if (aSavedRows.length > 0) {
                aRows = aSavedRows;   // Use previously saved data
				}
				else
					// no backend rows, so set to defaults
					 aRows = [{
							Serial: 1,
							Type: "",
							Bags: 0,
							Gross: 0,
							Tare: 0,
							//Ownership: ""
							Uom : ""
						},
						{
							Serial: 2,
							Type: "",
							Bags: 0,
							Gross: 0,
							Tare: 0,
						//	Ownership: ""
						    Uom : ""
						}
					];


					// bind to fragment
					var oPackModel = new sap.ui.model.json.JSONModel({
						Packaging: aRows
					});
					oThat._PackingWeightoDialog.setModel(oPackModel, "PackingWeightModel");
					var oDropModel = new sap.ui.model.json.JSONModel(aDropDownValues);
					oThat._PackingWeightoDialog.setModel(oDropModel, "MaterialTypeModel");

					oThat._PackingWeightoDialog.open();
				},
				error: function (oError) {
					MessageBox.error(oError.responseText);
					  var aSavedRows = oParentModel.getProperty(sPath + "/PackagingDetailsUI") || [];
					// still open with default rows
					// var aDefault = [{
					// 		Serial: 1,
					// 		Type: "",
					// 		Bags: 0,
					// 		Gross: 0.000,
					// 		Tare: 0.000,
					// 		Uom: ""
					// 	},
					// 	{
					// 		Serial: 2,
					// 		Type: "",
					// 		Bags: 0,
					// 		Gross: 0.000,
					// 		Tare: 0.000,
					// 		Uom: ""
					// 	}
					// ];
					
            var aDefault = (aSavedRows.length > 0) ? aSavedRows : [
                { Serial: 1, Type: "", Bags: 0, Gross: 0.000, Tare: 0.000, Uom: "" },
                { Serial: 2, Type: "", Bags: 0, Gross: 0.000, Tare: 0.000, Uom: "" }
            ];
					var oPackModel = new sap.ui.model.json.JSONModel({
						Packaging: aDefault
					});
					oThat._PackingWeightoDialog.setModel(oPackModel, "PackingWeight");
					oThat._PackingWeightoDialog.open();
				}
			});
		},



		onSavePackagingDetails: function () {
			var oThat = this;
			var oPackModel = oThat._PackingWeightoDialog.getModel("PackingWeightModel");
			var aPack = oPackModel.getProperty("/Packaging");
			// ✅ Convert everything into strings
			var aPackAsStrings = aPack.map(function (oRow) {
				var oConverted = {};
				Object.keys(oRow).forEach(function (key) {
					oConverted[key] = (oRow[key] !== null && oRow[key] !== undefined) ?
						String(oRow[key]) :
						"";
				});
				return oConverted;
			});
			// ✅ Filter only rows where Packing Material Type & Bags are NOT empty
			var aValidPack = aPackAsStrings.filter(function (oRow) {
				return (oRow.Type && oRow.Type.trim() !== "") && (oRow.Bags && oRow.Bags !== "0" && oRow.Bags.trim() !== "");
			});
			if (aValidPack.length === 0) {
				MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("noDataPackageWeight"));
				return; // stop further execution
			}

			var fTotalGross = 0;
			aValidPack.forEach(function (oRow) {
				fTotalGross += parseFloat(oRow.Gross) || 0.000;
			});
			// Convert to string
			var sTotalGross = fTotalGross.toFixed(3).toString();
			if (oThat._oRowContext) {
				var sPath = oThat._oRowContext.getPath();
				var oParentModel = oThat._oRowContext.getModel("ITEM");
				oParentModel.setProperty(sPath + "/Weight", sTotalGross); // ✅ Save total weight		
				oParentModel.setProperty(sPath + "/PackagingDetails", aValidPack); // ✅ Save full PackagingDetails for parent 
				oParentModel.setProperty(sPath + "/PackagingDetailsUI", aPack); // ✅ Save full PackagingDetails for parent  just to show on UI
			}
			oThat._PackingWeightoDialog.close();
		},

		onClosePackagingDetails: function () {
			this._PackingWeightoDialog.close();
		},

		onPackingMaterialChange: function (oEvent) {
			var oSelect = oEvent.getSource();
			var sSelectedKey = oSelect.getSelectedKey(); // Material chosen
			var oContext = oSelect.getBindingContext("PackingWeightModel");

			// Get the models
			var oPackingModel = oContext.getModel(); // PackingWeightModel
			var oMaterialModel = oThat._PackingWeightoDialog.getModel("MaterialTypeModel"); // OData dropdown values

			// Find selected material in dropdown data
			var aMaterialTypes = oMaterialModel.getData();
			var oSelected = aMaterialTypes.find(function (item) {
				return item.PackingMaterialType === sSelectedKey;
			});

			if (oSelected) {
				// Update the row in PackingWeightModel
				oPackingModel.setProperty(oContext.getPath() + "/Tare", oSelected.TareWeight);
				oPackingModel.setProperty(oContext.getPath() + "/Uom", oSelected.Uom);
				// ✅ Reset Bags and Gross on change
				oPackingModel.setProperty(oContext.getPath() + "/Bags", "0");
				oPackingModel.setProperty(oContext.getPath() + "/Gross", "0.000");
			}
		},
		onBagsValueChange: function (oEvent) {
			var oInput = oEvent.getSource();
			var sValue = oInput.getValue();
			var iBags = parseFloat(sValue) || 0;
			// Get row context
			var oContext = oInput.getBindingContext("PackingWeightModel");
			var oModel = oContext.getModel();
			// Get Tare weight for this row
			var fTare = parseFloat(oModel.getProperty(oContext.getPath() + "/Tare")) || 0.000;
			// Calculate Gross = Bags × Tare
			var fGross = iBags * fTare;
			// Update Gross field in model
			oModel.setProperty(oContext.getPath() + "/Gross", fGross.toFixed(3));
		},

		//=========================================Packaging Weight End by srinivas on 25/08/2025 ncp changes===================


		//===================================== column visibility settings =====================================//
		onSettings: function (oEvent) {
			// if (!this._oTPC) {

			// }
			this._oTPC.openDialog();
		},

		onTablePersoRefresh: function () {
			DemoPersoService.resetPersData();
			this._oTPC.refresh();
		},

		onNavBack: function () {
			// if (this._oTPC != undefined) {
			// 	this._oTPC.destroy();
			// }
			// this._oTPC.destroyPersoService(); //Added by Avinash
			this.oRouter.navTo("Inbound");
		},
		onCloseSignature: function () {
			var canvas1 = document.querySelector("#__custom0 canvas");
			var canvas2 = document.querySelector("#__custom1 canvas");
			if (canvas1) {
				var ctx1 = canvas1.getContext("2d");
				var ctx2 = canvas1.getContext("2d");
				var image = new Image();
				oThat.signaturepad0 = new SignaturePad(canvas1);
				oThat.signaturepad2 = new SignaturePad(canvas2);
				// condition added by dharma on 30-11-2020
				if (ctx1 != undefined || ctx2 != undefined) {
					image.onload = function () {
						ctx1.drawImage(this.datas, 0, 0);
						ctx2.drawImage(this.datas, 0, 0);
					};
				}
				//added by dharma on 01-12-2020
				oThat._SignatureDialog.close();
			} else {
				//added by dharma on 01-12-2020
				oThat._SignatureDialog.close();
			}

		},
		oCanvas: function () {
			CanvasToBMP = {
				/**
				 * Convert a canvas element to ArrayBuffer containing a BMP file
				 * with support for 32-bit (alpha).
				 *
				 * Note that CORS requirement must be fulfilled.
				 *
				 * @param {HTMLCanvasElement} canvas - the canvas element to convert
				 * @return {ArrayBuffer}
				 */
				toArrayBuffer: function (canvas) {

					var w = canvas.width,
						h = canvas.height,
						w4 = w * 4,
						idata = canvas.getContext("2d").getImageData(0, 0, w, h),
						data32 = new Uint32Array(idata.data.buffer), // 32-bit representation of canvas

						stride = Math.floor((32 * w + 31) / 32) * 4, // row length incl. padding
						pixelArraySize = stride * h, // total bitmap size
						fileLength = 122 + pixelArraySize, // header size is known + bitmap

						file = new ArrayBuffer(fileLength), // raw byte buffer (returned)
						view = new DataView(file), // handle endian, reg. width etc.
						pos = 0,
						x, y = 0,
						p, s = 0,
						a, v;

					// write file header
					setU16(0x4d42); // BM
					setU32(fileLength); // total length
					pos += 4; // skip unused fields
					setU32(0x7a); // offset to pixels

					// DIB header
					setU32(108); // header size
					setU32(w);
					setU32(-h >>> 0); // negative = top-to-bottom
					setU16(1); // 1 plane
					setU16(32); // 32-bits (RGBA) // Converting to 8 Bit to upload to SAP DMS @Sai
					setU32(3); // no compression (BI_BITFIELDS, 3)
					setU32(pixelArraySize); // bitmap size incl. padding (stride x height)
					setU32(2835); // pixels/meter h (~72 DPI x 39.3701 inch/m)
					setU32(2835); // pixels/meter v
					pos += 8; // skip color/important colors
					setU32(0xff0000); // red channel mask
					setU32(0xff00); // green channel mask
					setU32(0xff); // blue channel mask
					setU32(0xff000000); // alpha channel mask
					setU32(0x57696e20); // " win" color space

					// bitmap data, change order of ABGR to BGRA
					while (y < h) {
						p = 0x7a + y * stride; // offset + stride x height
						x = 0;
						while (x < w4) {
							v = data32[s++]; // get ABGR
							a = v >>> 24; // alpha channel
							view.setUint32(p + x, (v << 8) | a); // set BGRA
							x += 4;
						}
						y++;
					}

					return file;

					// helper method to move current buffer position
					function setU16(data) {
						view.setUint16(pos, data, true);
						pos += 2;
					}

					function setU32(data) {
						view.setUint32(pos, data, true);
						pos += 4;
					}
				},

				/**
				 * Converts a canvas to BMP file, returns a Blob representing the
				 * file. This can be used with URL.createObjectURL().
				 * Note that CORS requirement must be fulfilled.
				 *
				 * @param {HTMLCanvasElement} canvas - the canvas element to convert
				 * @return {Blob}
				 */
				toBlob: function (canvas) {
					return new Blob([this.toArrayBuffer(canvas)], {
						type: "image/bmp"
					});
				},

				/**
				 * Converts the canvas to a data-URI representing a BMP file.
				 * Note that CORS requirement must be fulfilled.
				 *
				 * @param canvas
				 * @return {string}
				 */
				toDataURL: function (canvas) {
					var buffer = new Uint8Array(this.toArrayBuffer(canvas)),
						bs = "",
						i = 0,
						l = buffer.length;
					while (i < l) bs += String.fromCharCode(buffer[i++]);
					return "data:image/bmp;base64," + btoa(bs);
				}
			};
		},
		onBatchLiveChange: function (oEvent) {
			var inputtxt = oEvent.getSource().getValue();
			var letters = /^[0-9a-zA-Z]+$/;
			var vId = oEvent.getId();
			var vFlag = true;
			if (inputtxt.match(letters)) {
				vFlag = true;
			} else {
				vFlag = false;
			}
			if (!vFlag) {
				var vSlice = inputtxt.slice(inputtxt.length - 1, inputtxt.length);
				var vReplace = inputtxt.replace(vSlice, "");
				oEvent.getSource().setValue(vReplace.toUpperCase());
			} else {
				oEvent.getSource().setValue(inputtxt.toUpperCase());
			}
		},
		//==================================== Escape Handler =============================//
		onEscapeBatch: function () {
			oThat.Batch.destroy();
		},
		onExit: function () {
			if (this._oTPC != undefined) {
				this._oTPC.destroy();
				// this._oTPC.destroyPersoService(); 
				//Added by Avinash
				this.byId("id_unload").destroy();
				//EOC by Avinash
			}
		},

		//Code added by kirubakaran on 16.09.2020 for brazil plant for capture image

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

		onCompleteUpload: function (oEvent) {
			var vRadio = oThat.Core.byId("id_RadioBtn").getSelectedButton().getId();
			var vRadioText = oThat.Core.byId("id_RadioBtn").getSelectedButton().getText();
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
			object.Fname = vRadioText;
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
						oThat.Images.unshift(object);
						object = {}; //clear	
						oThat.oView.setModel(new JSONModel(oThat.Images), "MASS");
						oThat.oView.getModel("MASS").refresh(true);
						oThat.BusyDialog.close();
					};
					// that.getBusy().setBusy(false);
				})(file);
			}
			reader.readAsDataURL(file);

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
		},

		fnOKImages: function (oEvent) {
			oThat.oCapture.close();
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
						"DmsReturnNav": [],
						"PrintitemNav": []
					}
				};
				oThat.oModel.create("/DmsPostSet", payLoad, {
					success: function () {},
					error: function (oResponse) {
						oThat.BusyDialog.close();
						var vError = oThat.oView.getModel("i18n").getResourceBundle().getText("Title21");
						MessageBox.show(oResponse.responseText, MessageBox.Icon.ERROR, vError);
					}
				});
			}
		},
		onPressFilter: function () {
			var self = this;
			if (self.getView().getModel("oGateFilter") == undefined) {
				var aGate = self.getView().getModel("oUnloadModel").getData().QualWbidNav.results;
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
				self.getView().setModel(new JSONModel(aArray), "oGateFilter");
			}
			if (!self.GateFilter) {
				self.GateFilter = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.GateFilter", self);
				self.getView().addDependent(self.GateFilter);
			}
			self.GateFilter.fireSearch();
			self.GateFilter.open();
		},
		onConfirmGate: function (oEvent) {
			var self = this;
			if (oEvent) {
				var oSelectedItem = oEvent.getParameter('selectedItem');
				oThat.vFilterItem = oSelectedItem.getTitle().split(" ")[0]; // added by dharma on 20-10-2020
				var oData = oThat.oUnloadData.QualWbidNav.results; // added by  dharma on 16-10-2020
				if (oSelectedItem.getTitle().split(" ")[0] != "All") {
					var aData = oData.filter(function (obj) {
						oThat.vFilter = oSelectedItem.getTitle().split(" ")[0]; // added by  dharma on 16-10-2020
						return obj.Gate == oSelectedItem.getTitle().split(" ")[0];
					});
					self.getView().getModel("oUnloadModel").getData().QualWbidNav.results = aData;
					self.getView().getModel("oUnloadModel").refresh(true);
				} else {
					oThat.Service = 'GET';
					var oEntity = {
						"d": {
							"GateEntry": "",
							"VehAssign": "",
							"PreQual": "",
							"UnloadConf": "X",
							"GateExit": "",
							"Inbound": "X",
							"Outbound": "",
							"IvDelivery": "",
							"IvPo": "",
							"IvWbid": "",
							"IvWerks": "",
							"QualWbidNav": []

						}
					};
					oThat.onCallService(oThat.Service, oEntity);
				}
			}
			// self.GateFilter.close();
		},
		onSearchGate: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter;
			if (sValue == undefined) {
				sValue = "";
			}
			oFilter = new sap.ui.model.Filter([
				new Filter("Gate", sap.ui.model.FilterOperator.Contains, sValue)
			]);
			var oFilter2 = new sap.ui.model.Filter(oFilter, false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter2]);

		},
		//Code ended by kirubakaran on 16.09.2020 for brazil plant for capture image
		fnTableUpdate: function (oEvent) {

		},
		fnSelectedChange: function (oEvent) {
			this.REASON = oEvent.getSource().getSelectedItem().getText();
		},

		//Added by Avinash for Reprint Ref Id for Origin F & G.
		fnReprintDialog: function () {
			var oThat = this;
			oThat.Reprint = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.RePrint", oThat);
			oThat.oView.addDependent(oThat.Reprint);
			oThat.Reprint.open();
			sap.ui.getCore().byId("id_InBatch").setVisible(true);
			sap.ui.getCore().byId("id_InBatchLabel").setVisible(true);
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
						"StatusUpdate": "", //Changed to null by Avinash
						"ReprintF4": "X", //Added by Avinash
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

		// Added by Avinash for PR Lot Based PrintOut - Ghana Changes
		onPrLotF4: function (oEvent) {
			var oThat = this;
			oThat.vId = oEvent.getSource().getId();
			var vDate = sap.ui.getCore().byId("id_InDate").getValue();
			var vWbId = sap.ui.getCore().byId("id_InWbid").getValue();
			if (vDate !== null && vDate !== "") {
				if (vWbId) {
					var vDate = sap.ui.getCore().byId("id_InDate").getDateValue();
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
					MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("PlSelTruck"));
				}
			} else {
				MessageBox.error(oThat.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg6"));
			}

		},

		onChargF4Search: function (oEvent) {
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

		onChargF4Confirm: function (oEvent) {
			// var oView = this.getView();
			var aSelectedContexts = oEvent.getParameter("selectedContexts");
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
		},
		//End of Added

		// Added by Avinash for RT Suggestion
		fnSearchRefId: function (oEvent) {
			var vValue = oEvent.getSource().getValue();
			var list = this.getView().byId("id_unload");
			if (vValue && vValue.length > 0) {
				var oFilter = new sap.ui.model.Filter("Wbid", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter2 = new sap.ui.model.Filter("Vehno", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter3 = new sap.ui.model.Filter("VEND_NAME", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter3 = new sap.ui.model.Filter("UNSEZ", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter4 = new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter5 = new sap.ui.model.Filter("Item", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter6 = new sap.ui.model.Filter("Dname", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter7 = new sap.ui.model.Filter("DriverMob", sap.ui.model.FilterOperator.Contains, vValue);
				var oFilter8 = new sap.ui.model.Filter("Batch", sap.ui.model.FilterOperator.Contains, vValue);
				var aFilters = new sap.ui.model.Filter([oFilter, oFilter2, oFilter3, oFilter4, oFilter5, oFilter6, oFilter7, oFilter8]);
			}
			var binding = list.getBinding("items");
			binding.filter(aFilters);
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



		//Added by Avinash for Scanning Ref Id's..
		fnScanWB: function () {

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
			var list = this.getView().byId("id_unload");
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
				self.getView().byId("id_SearchField").setValue("");
				self.Scan = false;
			}
			// self._onRouteMatched();
		},

		//End of Added...
		onValueHelpPressUom: function (oEvent) {
			// if (!this.OpenFragUom) {
			// 	this.OpenFragUom = sap.ui.xmlfragment("ZGT_MM_PORTIO.Fragments.Uom", this);
			// 	this.getView().addDependent(this.OpenFragUom);
			// 		this.OpenFragUom.open();
			// }

			var oThat = this;
			oThat.vPath = oEvent.getSource().getParent().getBindingContextPath();
			var oBject = oThat.oView.getModel("ITEM").getObject(oEvent.getSource().getParent().getBindingContextPath());
			oThat.OpenFragUom = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Uom", this);
			oThat.oView.addDependent(oThat.OpenFragUom);
			oThat.OpenFragUom.open();
			var filter = [
				new Filter("ImMatnr", sap.ui.model.FilterOperator.EQ, oBject.Matnr),
				new Filter("Uom", sap.ui.model.FilterOperator.EQ, 'X')
			];
			oThat.Service = 'UOM';
			oThat.onCallService(oThat.Service, filter);

		},
		onValueHelpConfirmUom: function (oEvent) {
			var vUom = oEvent.getParameter('selectedItem').getTitle();
			var oBject = oThat.oView.getModel("ITEM").getObject(oThat.vPath);
			oBject.Uom = vUom;
			oThat.oView.getModel("ITEM").refresh(true);
			oThat.OpenFragUom.destroy();
		},
		// Added for Ghana Tp and Busicuits
		fnvalidatePoQuan: function (oBject, oEvent, vErrMsg) {
			var flag = false;

			var vErrMsg = '';
			if (oBject.Quantity === "") {
				flag = true;
				vErrMsg = vErrMsg + oThat.oView.getModel("i18n").getResourceBundle().getText("EnterQuantity") + "\n";
			}
			if (oBject.Uom === "") {
				flag = true;
				vErrMsg = vErrMsg + oThat.oView.getModel("i18n").getResourceBundle().getText("EnterUom");
			}
			if (flag === false) {
				oThat.oModel.read("/ValidationSet", {
					filters: [
						new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, oBject.Matnr),
						new sap.ui.model.Filter("UnloadMenge", sap.ui.model.FilterOperator.EQ, oBject.Quantity),
						new sap.ui.model.Filter("UnloadMeins", sap.ui.model.FilterOperator.EQ, oBject.Uom),
						new sap.ui.model.Filter("PoMenge", sap.ui.model.FilterOperator.EQ, oThat.oView.getModel("ITEM").getData().WbItemNav.results[
								0]
							.Ntgew),
						new sap.ui.model.Filter("PoMeins", sap.ui.model.FilterOperator.EQ, localUom),
						new sap.ui.model.Filter("QtyVal", sap.ui.model.FilterOperator.EQ, "X")
					],
					urlParameters: {
						$expand: "ReturnNav"
					},
					async: true,
					success: function (Idata, Iresponse) {

						if (Idata.results[0].ReturnNav.results[0].Message === 'E' && oThat.oView.getModel("ITEM").getData().EvOrigin !== "M") {
							flag = true;
							vErrMsg = vErrMsg + oThat.oView.getModel("i18n").getResourceBundle().getText("ErrGrtrQuan");
						}
						if (flag === true) {
							MessageBox.error(vErrMsg); //Changed by Avinash
						} else {
							//=================To enable Batch first later WH =======================//
							if ((oThat.oView.getModel("ITEM").getData().EvWhSign == "X" && oThat.oView.getModel("ITEM").getData().EvBatchUpd == "X") ||
								(oThat.oView.getModel("ITEM").getData().EvBatchUpd == "X")) {
								oThat.onBatchUpdate();
							}
							///===================== without batch and WH ====================//	
							else if ((oThat.oView.getModel("ITEM").getData().EvWhSign != "X" && oThat.oView.getModel("ITEM").getData().EvBatchUpd !=
									"X")) {
								oThat.SubmitItem();
							} else if ((oThat.oView.getModel("ITEM").getData().EvWhSign == "X" && oThat.oView.getModel("ITEM").getData().EvBatchUpd !=
									"X")) {
								if (!oThat._SignatureDialog) {
									oThat._SignatureDialog = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Signature", oThat);
									oThat.oView.addDependent(oThat._SignatureDialog);
								}
								oThat._SignatureDialog.open();
								var canvas0 = document.querySelector("#__custom0 canvas");
								var canvas1 = document.querySelector("#__custom1 canvas");
								oThat.signaturepad0 = new SignaturePad(canvas0);
								// condition added by dharma on 30-11-2020
								if (document.querySelector("#__custom1")) {
									document.querySelector("#__custom1").style.display = "none";
								}
							}

						}

						// }

					},
					error: function (Ierror) {
						oThat.BusyDialog.close();
						MessageBox.error(Ierror)
					}
				});
			} else {
				MessageBox.error(vErrMsg);
			}
		},
		// End of added

		/*GMS changes add functionality for PO items start Nagaraj*/

		onUpdateItemDeliveryno: function () {
			var CDeliverNo = this.oView.getModel("ITEM").getData().EvChallan;
			var existItem = this.oView.getModel("ITEM").getData().UnloadConfNav.results;
			if (existItem.length == 0) {
				var existItem = this.oView.getModel("ITEM").getData().NonFertWbData;
			}
			for (var x in existItem) {
				existItem[x].Config18 = CDeliverNo;
			}
			this.oView.getBindings(true);
		},

		onAddPoItemFrag: function () {
			oThat.oView.setModel(new JSONModel([]), "POITEMS");
			oThat.OpenFragSearchPo = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.SearchPOItem", this);
			oThat.oView.addDependent(oThat.OpenFragSearchPo);
			oThat.OpenFragSearchPo.open();
		},
		onClosePOItem: function () {
			this.OpenFragSearchPo.close();
		},
		onGetPoItemF4: function (oEvent) {
			var that = this;
			that.oView.setModel(new JSONModel([]), "POITEMS");
			var oEntity = {
				"d": {
					"GateEntry": "X",
					"VehAssign": "",
					"PreQual": "",
					"UnloadConf": "",
					"GateExit": "",
					"Inbound": "X",
					"Outbound": "",
					"IvDelivery": "",
					"IvPo": oEvent.oSource.getValue(),
					"IvWbid": "",
					"IvItem": "",
					"IvWerks": oThat.TableSelectedObject.Werks,
					"IvMatnr": "",
					"Transfer": "",
					"IvCharg": "",
					"DelItemNav": [],
					"FifoWbidNav": [],
					"GetReturnNav": [],
					"PoItemNav": [{
						"Ebeln": oEvent.oSource.getValue(),
					}],
					"QualWbidNav": [],
					"WbItemNav": [],
					"WsItemNav": [],
					"WbHeaderNav": [{
						"Wtype": oThat.TableSelectedObject.Wtype,
					}]
				}
			}
			that.Service = "POITEMS";
			that.onCallService(that.Service, oEntity);
		},
		onCalculateAcceptQty: function (oEvent) {
			var Selecteditem = oEvent.oSource.getBindingContext("ITEM").getObject();
			var accqty = Selecteditem.Config16 === "" ? "0.000" : Selecteditem.Config16;
			var rejqty = Selecteditem.Config14 === "" ? "0.000" : Selecteditem.Config14;
			var calValue = parseFloat(accqty) - parseFloat(rejqty);
			oEvent.oSource.getBindingContext("ITEM").getObject().Config17 = calValue.toFixed(3);
			oEvent.oSource.getBindingContext("ITEM").getObject().Config16 = parseFloat(accqty).toFixed(3)
			this.oView.getModel("ITEM").updateBindings(true);

		},

		OnAddPOItemWBID: function (oEvent) {
			var that = this;
			that.delItem = false;
			var oList = oEvent.oSource.getParent().getContent()[1].getItems()[0].getSelectedContextPaths();
			var aPoItemsArr = [],
				poType;
			var existItem = oThat.oView.getModel("ITEM").getData().UnloadConfNav.results;
			// added by srinivas for project Amanah 29/08/2025 fert based ncp changes
			if (existItem.length == 0) {
				//existItem = oThat.aNonFertWbData;
				existItem = oThat.oView.getModel("ITEM").getData().NonFertWbData;
			} else {}
			//ended by srinivas  ncp changes
			for (var x in existItem) {
				aPoItemsArr.push(existItem[x]);
				poType = existItem[x].FertFlag || "";
			}

			var valid = true;
			for (var i in oList) {
				var oSelectedRow = oThat.oView.getModel("POITEMS").getObject(oList[i]);
				//	if (poType === oSelectedRow.FertFlag) {
				aPoItemsArr.push(oSelectedRow);
				//	} else {
				//		valid = false;
				//		break;
				//	}
			}
			if (valid) {
				that.payload = that.generatePayload(aPoItemsArr);
				sap.m.MessageBox.show(
					that.oView.getModel("i18n").getResourceBundle().getText("Addpop"), {
						icon: sap.m.MessageBox.Icon.confirm,
						title: that.oView.getModel("i18n").getResourceBundle().getText("Title16"),
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.YES) {
								that.Service = "UpdatePODETAILS";
								that.onCallService(that.Service, that.payload);
							}
						}
					}
				);
			} else {
				sap.m.MessageBox.information(oThat.oView.getModel("i18n").getResourceBundle().getText("mattypeDif"));
			}
		},

		OnDeleteWBID: function (oEvent) {
			var that = this;
			that.delItem = true;
			var aPoItemsArr = [];
			that.Obj = oEvent.oSource.getBindingContext("ITEM").getObject();
			aPoItemsArr.push(that.Obj);
			that.payload = that.generatePayload(aPoItemsArr);
			that.payload.d.PostWbDelItemNav.forEach(function (obj) {
				delete obj.Config14;
			});
			sap.m.MessageBox.show(
				that.oView.getModel("i18n").getResourceBundle().getText("Deletepop"), {
					icon: sap.m.MessageBox.Icon.confirm,
					title: that.oView.getModel("i18n").getResourceBundle().getText("Title16"),
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.YES) {
							that.Service = "UpdatePODETAILS";
							that.onCallService(that.Service, that.payload);

						}
					}
				}
			);

		},

		OnsubmitPoItem: function () {
			var that = this,
				valid = true;
			that.delItem = false;
			var aItemsArr = [];
			var aModelData = that.oView.getModel("ITEM").getData();
			var SelectedPoItems = sap.ui.getCore().byId("id_ItemTable2").getSelectedContextPaths();
			if (sap.ui.getCore().byId("id_ItemTable2").getSelectedItems().length <= 0) {
				valid = false;
				sap.m.MessageToast.show(that.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg10"));
			}
			if (that.fertType) {
				if (that.oView.getModel("ITEM").getData().EvChallan.trim().length <= 0) {
					valid = false;
					sap.m.MessageToast.show(that.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg1"));
				}
				for (var z in SelectedPoItems) {
					var item = oThat.oView.getModel("ITEM").getObject(SelectedPoItems[z]);
					aItemsArr.push(item);
					if (item.Lgort.trim().length === 0 || item.Config16.trim().length === 0 || item.Config18.trim().length === 0) {
						valid = false;
						sap.m.MessageToast.show(that.oView.getModel("i18n").getResourceBundle().getText("itemValid"));
						break;
					}
					if (item.Config16.trim() <= 0) {
						valid = false;
						sap.m.MessageToast.show(that.oView.getModel("i18n").getResourceBundle().getText("unloadqty"));
						break;
					}
				}
			} else {
				for (var z in SelectedPoItems) {
					var item = oThat.oView.getModel("ITEM").getObject(SelectedPoItems[z]);
					aItemsArr.push(item);

				}
			}
			if (valid) {
				that.payload = that.generatePayload(aItemsArr);
				that.payload.d.GateEntry = "";
				that.payload.d.UnloadConf = "X";
				that.payload.d.IvMatnr = "";
				that.payload.d.IvWithoutwb = "";
				that.payload.d.IvChallan = that.oView.getModel("ITEM").getData().EvChallan || "";
				that.payload.d.PostWbHeaderNav[0] = {
					"Wbid": that.payload.d.PostWbHeaderNav[0].Wbid
				};

				for (var q in that.payload.d.PostWbitemNav) {
					if (that.payload.d.PostWbitemNav[q].Config17 === "0.000") {
						that.payload.d.PostWbitemNav[q].Config15 = "1";
					} else {
						that.payload.d.PostWbitemNav[q].Config15 = "0.000";
					}

				}

				sap.m.MessageBox.show(
					that.oView.getModel("i18n").getResourceBundle().getText("Submitpop"), {
						icon: sap.m.MessageBox.Icon.confirm,
						title: that.oView.getModel("i18n").getResourceBundle().getText("Title16"),
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.YES) {
								that.Service = "SUBMIT";
								that.onCallService(that.Service, that.payload);
							}
						}
					}
				);
			}
		},

		//added by srinivas on 29/08/2025 for project Amanah for H param replica based on fert in  same data set -  ncp changes	
		OnsubmitPoItem2AB: function () {
			var that = this,
				valid = true;
			that.delItem = false;
			var aItemsArr = [];

			var oNonFertTable = sap.ui.getCore().byId("id_ItemTable2A"),
				oFertTable = sap.ui.getCore().byId("id_ItemTable2B");

			var aNonFertSelectedPaths = oNonFertTable.getSelectedContextPaths(),
				aFertSelectedPaths = oFertTable.getSelectedContextPaths();

			if (oThat.oView.getModel("oViewModel").getProperty("/nFertType") === true && aNonFertSelectedPaths.length > 0) {
				if (that.oView.getModel("ITEM").getData().EvChallan.trim().length <= 0) {
					valid = false;
					sap.m.MessageToast.show(that.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg1"));
				}
			}

			// ---- Step 1: At least one selected overall
			if (aNonFertSelectedPaths.length <= 0 && aFertSelectedPaths.length <= 0) {
				valid = false;
				sap.m.MessageToast.show(that.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg10"));
				return;
			}

			// ---- Step 2: Process Fert table selections
			aNonFertSelectedPaths.forEach(function (sPath) {
				var item = that.oView.getModel("ITEM").getObject(sPath);
				aItemsArr.push(item);

				// Fert table has stricter validations
				if (!item.Lgort || item.Lgort.trim().length === 0 ||
					!item.Config16 || item.Config16.trim().length === 0 ||
					!item.Config18 || item.Config18.trim().length === 0) {
					valid = false;
					sap.m.MessageToast.show(that.oView.getModel("i18n").getResourceBundle().getText("itemValid"));
					return;
				}

				if (item.Config16 && parseFloat(item.Config16) <= 0) {
					valid = false;
					sap.m.MessageToast.show(that.oView.getModel("i18n").getResourceBundle().getText("unloadqty"));
					return;
				}
			});

			// ---- Step 3: Process Fert table selections
			aFertSelectedPaths.forEach(function (sPath) {
				var item = that.oView.getModel("ITEM").getObject(sPath);
				aItemsArr.push(item);
				// Fert table has simpler validation
				// (if you want extra checks, add them here)
				if (item.Lgort && item.Lgort.trim() <= 0) {
					valid = false;
					sap.m.MessageToast.show(that.oView.getModel("i18n").getResourceBundle().getText("itemValid"));
					return;
				}
			});

			// ---- Step 4: If valid, build payload
			if (valid) {
				that.payload = that.generatePayload(aItemsArr);
				that.payload.d.GateEntry = "";
				that.payload.d.UnloadConf = "X";
				that.payload.d.IvMatnr = "";
				that.payload.d.IvWithoutwb = "";
				that.payload.d.IvChallan = that.oView.getModel("ITEM").getData().EvChallan || "";
				that.payload.d.PostWbHeaderNav[0] = {
					"Wbid": that.payload.d.PostWbHeaderNav[0].Wbid
				};

				// Your Config15 logic
				that.payload.d.PostWbitemNav.forEach(function (wbItem) {
					if (wbItem.Config17 === "0.000") {
						wbItem.Config15 = "1";
					} else {
						wbItem.Config15 = "0.000";
					}
				});

				// Confirmation popup
				sap.m.MessageBox.show(
					that.oView.getModel("i18n").getResourceBundle().getText("Submitpop"), {
						icon: sap.m.MessageBox.Icon.CONFIRM,
						title: that.oView.getModel("i18n").getResourceBundle().getText("Title16"),
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function (oAction) {
							if (oAction === sap.m.MessageBox.Action.YES) {
								that.Service = "SUBMIT";
								that.onCallService(that.Service, that.payload);
							}
						}
					}
				);
			}
		},

		// ended by srinivas  ncp changes	

		generatePayload: function (Items) {
			var that = this,
				itemsData = [];
			var aModelData = that.oView.getModel("ITEM").getData();
			var existItem = oThat.oView.getModel("ITEM").getData().UnloadConfNav.results.length;
			// added by srinivas for project Amanah 29/08/2025 fert based  ncp changes	
			if (existItem == 0) {
				//existItem = oThat.aNonFertWbData;
				existItem = oThat.oView.getModel("ITEM").getData().NonFertWbData.length;
			} else {}
			//return;
			//ended by srinivas  ncp changes	
			for (var i in Items) {
				var ItemsDetails = Items[i];
				if (ItemsDetails.Item === undefined) {
					existItem += 1;
				}

				itemsData.push({
					"Wbid": aModelData.WbHeaderNav.results[0].Wbid,
					"Ebeln": ItemsDetails.Ebeln || "",
					"Item": ItemsDetails.Item || "0000" + (existItem),
					"Ebelp": ItemsDetails.Ebelp || "",
					"Matnr": ItemsDetails.Matnr || "",
					"Lgort": ItemsDetails.Lgort || "",
					"Parnr": ItemsDetails.Lgort || oThat.TableSelectedObject.Parnr,
					"Batch": ItemsDetails.Charg || "",
					"Brgew": ItemsDetails.Brgew || "0",
					"Gdate": null,
					"Gtime": "PT00H00M00S",
					"Sgdate": null,
					"Sgtime": "PT00H00M00S",
					"Trwgt": "0",
					"Tdate": null,
					"Ttime": "PT00H00M00S",
					"Stdate": null,
					"Sttime": "PT00H00M00S",
					"Ntgew": ItemsDetails.Ntgew || "0",
					"Menge": ItemsDetails.Menge || "0.000",
					// commented by srinivas on 1/9/2025 for project Amanh and used it with differet conditions below  ncp changes	
					//"Pkwgt": ItemsDetails.Pkwgt || "0",
					// "Pmatno1": ItemsDetails.Pmatno1 || "0",
					// "Pmatqty1": ItemsDetails.Pmatqty1 || "0.000",
					// "Trwgt1": ItemsDetails.Trwgt1 || "0.000",
					// "Pmatno2": ItemsDetails.Pmatno2 || "0",
					// "Pmatqty2": ItemsDetails.Pmatqty2 || "0.000",
					// "Trwgt2": ItemsDetails.Trwgt2 || "0.000",
					"Pmatno3": ItemsDetails.Pmatno3 || "0",
					"Pmatqty3": ItemsDetails.Pmatqty3 || "0.000",
					"Trwgt3": ItemsDetails.Trwgt3 || "0.000",
					"Pmatno4": ItemsDetails.Pmatno4 || "0",
					"Pmatqty4": ItemsDetails.Pmatqty4 || "0.000",
					"Trwgt4": ItemsDetails.Trwgt4 || "0.000",
					"Actweight": ItemsDetails.Actweight || "0.000",
					"Config2": ItemsDetails.Config2 || "0.00",
					"Config8": ItemsDetails.Config8 || "0.00",
					"Vbeln": ItemsDetails.Vbeln || "",
					"Posnr": ItemsDetails.Posnr || "000000",
					"Zeile": ItemsDetails.Zeile || "0000",
					"Config14": ItemsDetails.Config14 || "0.000",
					"Config16": ItemsDetails.Config16 || "",
					"Config17": ItemsDetails.Config17 || "",
					"Config18": ItemsDetails.Config18 || aModelData.EvChallan,
					"Config19": ItemsDetails.Uom || "",
					"Config20": ItemsDetails.Config20 || "",
					"Config6": ItemsDetails.Config6 || "", //added by srinivas for ASN on 07/08/2025
					//added by srinivas for project amanah on 1/09/2025 for package weight integration  ncp changes	
					"Pkwgt": ItemsDetails.Pkwgt && ItemsDetails.Pkwgt !== "" && ItemsDetails.Pkwgt !== "0.000" ? ItemsDetails.Pkwgt : (ItemsDetails.Weight || "0.000"),
					// Packing 1
					"Pmat1": ItemsDetails.PackagingDetails?.[0]?.Type || "",
					"Pmatuom1": ItemsDetails.PackagingDetails?.[0]?.Uom || "",
					"Pmatno1": ItemsDetails.Pmatno1 && ItemsDetails.Pmatno1 !== "" && ItemsDetails.Pmatno1 !== "0" ? ItemsDetails.Pmatno1 : (ItemsDetails.PackagingDetails?.[0]?.Bags || "0"),
					"Pmatqty1": ItemsDetails.Pmatqty1 && ItemsDetails.Pmatqty1 !== "" && ItemsDetails.Pmatqty1 !== "0.000" ? ItemsDetails.Pmatqty1 : (ItemsDetails.PackagingDetails?.[0]?.Gross || "0.000"),
					"Trwgt1": ItemsDetails.Trwgt1 && ItemsDetails.Trwgt1 !== "" && ItemsDetails.Trwgt1 !== "0.000" ? ItemsDetails.Trwgt1 : (ItemsDetails.PackagingDetails?.[0]?.Tare || "0.000"),

					// Packing 2
					"Pmat2": ItemsDetails.PackagingDetails?.[1]?.Type || "",
					"Pmatuom2": ItemsDetails.PackagingDetails?.[1]?.Uom || "",
					"Pmatno2": ItemsDetails.Pmatno2 && ItemsDetails.Pmatno2 !== "" && ItemsDetails.Pmatno2 !== "0" ? ItemsDetails.Pmatno2 : (ItemsDetails.PackagingDetails?.[1]?.Bags || "0"),
					"Pmatqty2": ItemsDetails.Pmatqty2 && ItemsDetails.Pmatqty2 !== "" && ItemsDetails.Pmatqty2 !== "0.000" ? ItemsDetails.Pmatqty2 : (ItemsDetails.PackagingDetails?.[1]?.Gross || "0.000"),
					"Trwgt2": ItemsDetails.Trwgt2 && ItemsDetails.Trwgt2 !== "" && ItemsDetails.Trwgt2 !== "0.000" ? ItemsDetails.Trwgt2 : (ItemsDetails.PackagingDetails?.[1]?.Tare || "0.000"),

					//end by srinivas  ncp changes	
				});

			}
			var aJson = {
				"d": {
					"GateEntry": "X",
					"VehAssign": "",
					"PreQual": "",
					"UnloadConf": "",
					"GateExit": "",
					"Inbound": "X",
					"Outbound": "",
					"IvWboj": "WB",
					"IvMatnr": "X",
					"IvWithoutwb": aModelData.EvWithoutwb,
					"IvWbid": aModelData.WbHeaderNav.results[0].Wbid,
					"PostReturnNav": [],
					"PostWbHeaderNav": [{
						"Werks": aModelData.WbHeaderNav.results[0].Werks,
						"Lifnr": aModelData.WbHeaderNav.results[0].Lifnr,
						"Gate": aModelData.WbHeaderNav.results[0].Gate,
						"Wsgate": aModelData.WbHeaderNav.results[0].Wsgate,
						"Vehno": aModelData.WbHeaderNav.results[0].Vehno,
						"Vehtyp": aModelData.WbHeaderNav.results[0].Vehtyp,
						"Dname": aModelData.WbHeaderNav.results[0].Dname,
						"DriverMob": aModelData.WbHeaderNav.results[0].DriverMob,
						"Wtype": aModelData.WbHeaderNav.results[0].Wtype,
						"Wbid": aModelData.WbHeaderNav.results[0].Wbid,
						"Erdat": aModelData.WbHeaderNav.results[0].Erdat,
						"Ertim": "PT00H00M00S",
						"Direction": "IN",
						"Challan": aModelData.WbHeaderNav.results[0].Challan,
						"Token": aModelData.WbHeaderNav.results[0].Token,
						"RefWbid": aModelData.WbHeaderNav.results[0].RefWbid,
					}],
					"PostWbitemNav": that.delItem ? [] : itemsData,
					"PostWsItemNav": [],
					"PostWbDelItemNav": that.delItem ? itemsData : [],
					"PostDmsNav": []
				}
			}
			return aJson;

		},

		/*End of POItems functionality*/
	
		//Statred new Inbound contineous scanner functionality Laxmikanth.B Below the code for new developments
		// And added some code at the time of open Unload_Item fragment if EvOrigin = '' and QaMsgType = 'C'
		// Start NDC Barcode Scanner (continuous)
		onContinuosScannerBtnPress: function () {
			var that = this;
			sap.ndc.BarcodeScanner.scan(
				function (mResult) {
					if (!mResult.cancelled) {
						var sBatch = mResult.text.trim();

						var oExisting = that.getView().getModel("ITEM").getData().UnloadConfNav.results.find(function (item){
							return item.Batch === sBatch && item.BatchStatus === "sap-icon://accept";
						});
						if (oExisting) {
									oExisting.qty += 1;
									sap.m.MessageToast.show("Already Batch scanned:" + oExisting.Batch, {
										duration: 3000,                  // default
										width: "15em",                   // default
										my: "CenterCenter",             // default
										at: "CenterCenter",             // default
										of: window,                      // default
										offset: "0 0",                   // default
										collision: "fit fit",            // default
										onClose: null,                   // default
										autoClose: true,                 // default
										animationTimingFunction: "ease", // default
										animationDuration: 5000,         // default
										closeOnBrowserNavigation: true   // default
									});
									return;
									
								};
						that._validateScannedBatch(sBatch);

						 // 🔁 Continue scanning again, regardless of result
						setTimeout(function () {
							that.onContinuosScannerBtnPress();
						}, 500); // small delay for readability (optional)
					} else {
						that.BusyDialog.close();
						sap.m.MessageToast.show("Scanning stopped.");
					}
				},
				function (Error) {
					sap.m.MessageBox.error("Scanning failed: " + Error);
				},
				function (mParams) {
					//alert("Value entered: " + mParams.newValue);
				},
				"Enter Inbound Batch Barcode",
				true,
				30,
				1,
				false,
				false
			);

		},

		// Validate scanned batch
		_validateScannedBatch: function (scannedBatch) {
			let oTable = sap.ui.getCore().byId("id_ItemTable3A");
			let oModel = oTable.getModel("ITEM");
			let aData = oModel.getData().WbItemNav.results;
			let bFound = false;

			aData.forEach(function (item) {
				if (item.Batch.toLowerCase() === scannedBatch.toLowerCase()) {
					//item.BatchStatus = "sap-icon://accept";
					item.BatchStatus = "sap-icon://accept";
					bFound = true;
				}
			});

			if (bFound) {
				sap.m.MessageToast.show("✅ " + scannedBatch + " found. Batch marked as available.");
			} else {
				//sap.m.MessageBox.warning("⚠️ " + scannedBatch + " not found in the list.");
				alert("⚠️ " + scannedBatch + " This batch is not available in the delivery");

			}

			oModel.refresh(true);
		},

		OnsubmitPoItem3AB: function () {
			var that = this,
				valid = true;
			that.delItem = false;
			var aItemsArr = [];

			var oNonFertTable = sap.ui.getCore().byId("id_ItemTable3A");
			var aNonFertSelectedPaths = oNonFertTable.getSelectedContextPaths();
			var aSelectedItems = oNonFertTable.getSelectedItems();
			if (sap.ui.getCore().byId("id_ItemTable3A").getSelectedItems().length <= 0) {
				valid = false;
				sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("ErrorMsg10"));
				return;
			}
			var selectedDataTable = that.getView().getModel("ITEM").getData().UnloadConfNav.results;

			var notScannedEven = selectedDataTable.find(function (params) {
				return params.BatchStatus === "sap-icon://accept"
			});
			if (!notScannedEven) {
				sap.m.MessageBox.warning("Scan atleast one batch...");
				valid = false;
				return;
			}
			var aStatuses = [];
			var declinedBatchStatus = '';
			aSelectedItems.forEach(function (oItem) {
				// Get context safely
				var oCtx = oItem.getBindingContext("ITEM"); // or getBindingContext("myModel") if named
				if (oCtx) {
					var oData = oCtx.getObject();
					if (oData && oData.BatchStatus !== undefined && oData.BatchStatus === "sap-icon://accept") {
						aStatuses.push(oData.BatchStatus);
					} else {
						declinedBatchStatus = declinedBatchStatus + "\nItem" + " " + `${parseFloat(oCtx.sPath.split("/")[3]) + 1}` + " " + "is Selected But Batch" + " " + oData.Batch + " " + "is not scanned, Please check once.. \n";
						//valid = false;
					}
				}
			});
			if (declinedBatchStatus) {
				sap.m.MessageBox.warning(declinedBatchStatus);
				valid = false;
				return;
			}

			var aBatchStatusCount = selectedDataTable.filter(function (items) {
				return items.BatchStatus === "sap-icon://accept";
			});
			if (aSelectedItems.length === aBatchStatusCount.length) {
				valid = true;
			} else {

				sap.m.MessageBox.warning("Selected Items are" + " " + aSelectedItems.length + " " + "and Scanned Batches are" + " " + aBatchStatusCount.length + "\n\nPlease check once.");
				valid = false;
				return;
			}
			if (aStatuses.length === 0) {
				sap.m.MessageBox.error("Unable to read status values from the selected items.");
				valid = false;
				return;
			}

			// Check if all statuses are same
			var bAllSame = aStatuses.every(function (val) {
				return val === aStatuses[0];
			});

			if (!bAllSame) {
				sap.m.MessageBox.error("Selected items must have the same Status (either all 'Yes' or all 'No').");
				return;
			}


			if (oThat.oView.getModel("oViewModel").getProperty("/zFertType") === true && aNonFertSelectedPaths.length > 0) {
				if (that.oView.getModel("ITEM").getData().EvChallan.trim().length <= 0) {
					valid = false;
					sap.m.MessageToast.show(that.oView.getModel("i18n").getResourceBundle().getText("ErrorMsg1"));
				}
			}

			// ---- Step 2: Process Fert table selections
			aNonFertSelectedPaths.forEach(function (sPath) {
				var item = that.oView.getModel("ITEM").getObject(sPath);
				aItemsArr.push(item);

				// Fert table has stricter validations
				if (!item.Lgort || item.Lgort.trim().length === 0 || !item.Menge || item.Batch) {
					valid = false;
					sap.m.MessageToast.show(that.oView.getModel("i18n").getResourceBundle().getText("itemValid"));
					return;
				}
			});

			// ---- Step 4: If valid, build payload
			if (valid) {
				that.payload = that.generatePayload(aItemsArr);
				that.payload.d.GateEntry = "";
				that.payload.d.UnloadConf = "X";
				that.payload.d.IvMatnr = "";
				that.payload.d.IvWithoutwb = "";
				that.payload.d.IvChallan = that.oView.getModel("ITEM").getData().EvChallan || "";
				that.payload.d.PostWbHeaderNav[0] = {
					"Wbid": that.payload.d.PostWbHeaderNav[0].Wbid
				};

				// Your Config15 logic
				that.payload.d.PostWbitemNav.forEach(function (wbItem) {
					if (wbItem.Config17 === "0.000") {
						wbItem.Config15 = "1";
					} else {
						wbItem.Config15 = "0.000";
					}
				});

				// Confirmation popup
				sap.m.MessageBox.show(
					that.oView.getModel("i18n").getResourceBundle().getText("Submitpop"), {
					icon: sap.m.MessageBox.Icon.CONFIRM,
					title: that.oView.getModel("i18n").getResourceBundle().getText("Title16"),
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.YES) {
							that.Service = "SUBMIT";
							that.onCallService(that.Service, that.payload);
						}
					}
				}
				);
			}
		}
	});

});