sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/BusyDialog",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast"
], function(Controller, MessageBox, BusyDialog, JSONModel, Filter, Fragment, MessageToast) {
	"use strict";
	var lv_wbid;
	var indexUom;
	var oThat = this;
	var vDateFormat;
	var PackMatf4_index;
	var PackMatDetIndex;
	var PacMaterialLength = 0;
	return Controller.extend("ZGT_MM_INBOUND.controller.EwayDetail", {
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("EwayDetail").attachMatched(this._onRouteMatched, this);
			var that = this;
			vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "dd-MM-YYYY"
			});
			// var Erdat = vDateFormat.format(this.getView().byId("id_ewaydate").getDateValue());
			that.oDisplayIN = {
				"Ebeln": "214193000631"
					// "Ebeln": "214193000631"
					// "Ebeln": "123"
			};
			var oData2 = {

				"SearchCrit": [{

					"Name": "00001"
				}, {

					"Name": "00002"
				}, {

					"Name": "00003"
				}]

			};
			//Need to remove
			// set explored app's demo model on this sample
			var sModel2 = new sap.ui.model.json.JSONModel();
			sModel2.setData(oData2);
			this.getView().setModel(sModel2, "POPRItem");
			that.getView().setModel(new JSONModel({}), "JMQALableGen");
			var lvstats = {
				"CarteGrise": "",
				"Bmcnu": ""
			};
			var status3 = new sap.ui.model.json.JSONModel();
			status3.setData(lvstats);
			this.getView().setModel(status3, "JMQALableGenerateStatus");
			// that.getView().setModel(new JSONModel({}), "JMQALableGenerateStatus");
			// that.getView().setModel(new JSONModel(that.oDisplayIN), "POPRItem");
		},
		_onRouteMatched: function(oEvent) {
			// var Model_QAGen = this.getView().getModel("JMQALableGen").getData();
			lv_wbid = oEvent.getParameters().arguments.lvWbid;

			sap.ui.core.BusyIndicator.show();
			this.fngetWidData();
		},
		fngetWidData: function() {
			var that = this;

			var payLoad = {

				"d": {
					"IvProcess": "NEWWBID",
					"IvWbid": lv_wbid,
					// "QaListNav": [],
					"ReturnNav": [],
					"WbItemNav": [],
					"StatusLogNav": [],
					"WbHeaderNav": [],
					"WbPackMatNav": []
				}
			};
			this.getView().getModel().create("/QaLabelSet", payLoad, {
				success: function(oData, oResponse) {
					var EwayDetailJsonHeader = new sap.ui.model.json.JSONModel();
					EwayDetailJsonHeader.setData(oData.WbHeaderNav.results);
					that.getView().setModel(EwayDetailJsonHeader, "JMQALableGenerateHeader");
					var EwayDetailJsonItem = new sap.ui.model.json.JSONModel();
					EwayDetailJsonItem.setData(oData.WbItemNav.results);
					that.getView().setModel(EwayDetailJsonItem, "JMQALableGenerateItem");
					var EwayDetailJsonStatuslog = new sap.ui.model.json.JSONModel();
					EwayDetailJsonStatuslog.setData(oData.StatusLogNav.results);
					that.getView().setModel(EwayDetailJsonStatuslog, "JMQALableGenerateStatus");
					var EwayPackItemJson = new sap.ui.model.json.JSONModel();
					EwayPackItemJson.setData(oData.WbPackMatNav.results);
					// PacMaterialLength = oData.WbPackMatNav.results.length;
					that.getView().setModel(EwayPackItemJson, "JMPackMatItem");
					that.getView().byId("id_ewaydate").setDateValue((new Date()));
					sap.ui.core.BusyIndicator.hide();
				},
				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(oError.message);
					// oThat.BusyDialog.close();
				}
			});

		},
		fnSubmitQALabel: function() {
			var that = this;
			var oHeaderData = this.getView().getModel("JMQALableGenerateHeader").getData();
			var oItemData = this.getView().getModel("JMQALableGenerateItem").getData();
			var oStatusData = this.getView().getModel("JMQALableGenerateStatus").getData();
			var oPacMatdata = this.getView().getModel("JMPackMatItem").getData();
			var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddThh:mm:ss"
			});
			var Erdat = vDateFormat.format(this.getView().byId("id_ewaydate").getDateValue());
			var vError = false;
			var VErrMsg = '';

			if (this.getView().byId("id_EwayID").getValue() === '') {
				vError = true;
				VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrEway") + "\n";
			}

			if (Erdat === '') {
				vError = true;
				VErrMsg = this.getView().getModel("i18n").getResourceBundle().getText("ErrEwayDate") + "\n";
			}
			for (var t = 0; t < oItemData.length; t++) {
				for (var h = t + 1; h < oItemData.length; h++) {
					if (oItemData[t].Batch !== "" || oItemData[h].Batch !== '') {
						if (((oItemData[t].Batch).toUpperCase() === (oItemData[h].Batch).toUpperCase()) && (oItemData[t].NoBatchValidate === '')) { //Added oHeaderData[t].Wtype !== "RETURN" by Pavan on 18/04/2023
							vError = true;
							VErrMsg = this.getView().getModel("i18n").getResourceBundle().getText("ErrSameBatch") + "\n";
							break;
						}
					}
				}
			}
			var count;
			for (var t = 0; t < oItemData.length; t++) {
				count = oItemData[t].Item;
				if (oItemData[t].Batch === '') {

					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrBatch") + " " + count + "\n";
				}

				if (oItemData[t].Config1 === '' || oItemData[t].Config1 === "0.000") {

					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrEwayQty") + " " + count + "\n";
				}
				if (oItemData[t].Config4 === '') {

					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrEwayUom") + " " + count + "\n";
				}
				//Commented by Pavan on 26/03/2023 Start
				/*if (oItemData[t].Dwerk === '') {

					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrMatCount") + " " + count + "\n";
				}*/
				//Commented by Pavan on 26/03/2023 End
				// if (oItemData[t].Pmat2 === '') {
				// 	count++;
				// 	vError = true;
				// 	VErrMsg = VErrMsg + count + "." + this.getView().getModel("i18n").getResourceBundle().getText("ErrMatType") + "\n";
				// }

			}
			//Added by Pavan on 29/03/2023 Start
			for (var t = 0; t < oPacMatdata.length; t++) {
				count = oPacMatdata[t].Item;
				if (oPacMatdata[t].Pmat === '') {
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrPackMat") + " " + count + "\n";
				}
				if (oPacMatdata[t].PmatNo <= 0) {
					if (oPacMatdata[t].Pmat !== this.getView().getModel("i18n").getResourceBundle().getText("NA")) {
						vError = true;
						VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrPackQnty") + " " + count + "\n";
					}
				}
			}
			//Added by Pavan on 29/03/2023 End

			if (!vError) {
				var vStatusarr = [];
				for (var i = 0; i < oItemData.length; i++) {
					var vObj = {
						"Trnsid": oHeaderData[0].Wbid,
						"Item": oItemData[i].Item,
						"CarteGrise": oStatusData.CarteGrise,
						"Bmcnu": Erdat.toString(),
						"SendRef": oItemData[i].Dwerk,
						"RecRef": oItemData[i].Pmat2,
						"Werks": oItemData[i].Werks

					};
					vStatusarr.push(vObj);
					// oItemData[i].Pmat2 = '';
				}
				for (var y = 0; y < oItemData.length; y++) {
					if (oItemData[y].Ebeln === 'N/A') {
						oItemData[y].Ebeln = "";
					}
				}
				this.getView().getModel("JMQALableGenerateItem").refresh("true");
				var payLoad = {
					"d": {
						"IvProcess": "CREATEQA",
						"ReturnNav": [],
						"WbItemNav": oItemData,
						"StatusLogNav": vStatusarr,
						"WbHeaderNav": oHeaderData,
						"WbPackMatNav": oPacMatdata

					}
				};
				sap.ui.core.BusyIndicator.show();

				this.getView().getModel().create("/QaLabelSet", payLoad, {
					success: function(oData, oResponse) {

						if (oData.ReturnNav.results[0].Type === 'S') {
							var suceslen = oData.ReturnNav.results.length;
							var SuccMsg = "";
							for (var i = 0; i < suceslen; i++) {
								SuccMsg = SuccMsg + oData.ReturnNav.results[i].Message + "\n";
							}
							// MessageBox.error(SuccMsg);
							MessageBox.success(SuccMsg, {
								icon: MessageBox.Icon.SUCCESS,
								actions: [MessageBox.Action.OK],
								onClose: function(oAction) {
									if (oAction == 'OK') {
										MessageBox.show(that.getView().getModel("i18n").getResourceBundle().getText("Msg2"), {
											icon: MessageBox.Icon.INFORMATION,
											title: that.getView().getModel("i18n").getResourceBundle().getText("Title16"),
											escapeHandler: "onNavBackEwayDet",
											actions: [MessageBox.Action.YES, MessageBox.Action.NO],
											onClose: function(oAction) {
												if (oAction === 'YES') {
													var vWbid = oData.WbHeaderNav.results[0].Wbid;
													// var sServiceUrl = oThat.oModel.sServiceUrl;
													var sServiceUrl = "/sap/opu/odata/sap/ZGW_GT_MM_WB_MOBILITY_SRV";
													var lv_item = "0000";
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
						sap.ui.core.BusyIndicator.hide();
					},
					error: function(oError) {
						sap.ui.core.BusyIndicator.hide();
						MessageBox.error(oError.message);
						// oThat.BusyDialog.close();
					}
				});
			} else {
				MessageBox.error(VErrMsg);
			}
		},
		onNavBackEwayDet: function() {
			this.oRouter.navTo("EwayBill");
			// oThat.onOpenSettings();
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
							that.oRouter.navTo("EwayBill");
						}
					})
					// endButton: new sap.m.Button({
					// 	text: 'Close',
					// 	class: "sapUiSizeCompact",
					// 	press: function() {
					// 		that.oImageDialog.close();
					// 	}
					// })
			});
		},
		fncheck: function() {
			var that = this;
			var oHeaderData = this.getView().getModel("JMQALableGenerateHeader").getData();
			var oItemData = this.getView().getModel("JMQALableGenerateItem").getData();
			var oStatusData = this.getView().getModel("JMQALableGenerateStatus").getData();
			var oPacMatdata = this.getView().getModel("JMPackMatItem").getData();

			var vDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddThh:mm:ss"
			});
			var Erdat = vDateFormat.format(this.getView().byId("id_ewaydate").getDateValue());
			var vStatusarr = [];

			var vError = false;
			var VErrMsg = '';

			if (this.getView().byId("id_EwayID").getValue() === '') {
				vError = true;
				VErrMsg = this.getView().getModel("i18n").getResourceBundle().getText("ErrEway") + "\n";
			}

			if (Erdat === '') {
				vError = true;
				VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrEwayDate") + "\n";
			}
			for (var t = 0; t < oItemData.length; t++) {
				for (var h = t + 1; h < oItemData.length; h++) {
					if (oItemData[t].Batch !== "" || oItemData[h].Batch !== '') {
						if (((oItemData[t].Batch).toUpperCase() === (oItemData[h].Batch).toUpperCase()) && (oItemData[t].NoBatchValidate === '')) { //Added oHeaderData[t].Wtype !== "RETURN" by Pavan on 18/04/2023
							vError = true;
							VErrMsg = this.getView().getModel("i18n").getResourceBundle().getText("ErrSameBatch") + "\n";
							break;
						}
					}
				}
			}
			var count;
			for (var t = 0; t < oItemData.length; t++) {
				count = oItemData[t].Item;
				if (oItemData[t].Batch === '') {
					// count++;
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrBatch") + " " + count + "\n";
				}
				if (oItemData[t].Config1 === '' || oItemData[t].Config1 === "0.000") {
					// count++;
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrEwayQty") + " " + count + "\n";
				}
				if (oItemData[t].Config4 === '') {
					// count++;
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrEwayUom") + " " + count + "\n";
				}
				//Commented by Pavan on 26/03/2023 Start
				/*if (oItemData[t].Dwerk === '') {
					// count++;
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrMatCount") + " " + count + "\n";
				}*/
				//Commented by Pavan on 26/03/2023 End
				// if (oItemData[t].Pmat2 === '') {
				// 	count++;
				// 	vError = true;
				// 	VErrMsg = VErrMsg + count + "." + this.getView().getModel("i18n").getResourceBundle().getText("ErrMatType") + "\n";
				// }

			}
			//Added by Pavan on 29/03/2023 Start
			for (var t = 0; t < oPacMatdata.length; t++) {
				count = oPacMatdata[t].Item;
				if (oPacMatdata[t].Pmat === '') {
					vError = true;
					VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrPackMat") + " " + count + "\n";
				}
				if (oPacMatdata[t].PmatNo <= 0) {
					if (oPacMatdata[t].Pmat !== this.getView().getModel("i18n").getResourceBundle().getText("NA")) {
						vError = true;
						VErrMsg = VErrMsg + this.getView().getModel("i18n").getResourceBundle().getText("ErrPackQnty") + " " + count + "\n";
					}
				}
			}
			//Added by Pavan on 29/03/2023 End

			if (!vError) {
				for (var i = 0; i < oItemData.length; i++) {
					var vObj = {
						"Trnsid": oHeaderData[0].Wbid,
						"Item": oItemData[i].Item,
						"CarteGrise": oStatusData.CarteGrise,
						"Bmcnu": Erdat.toString(),
						"SendRef": oItemData[i].Dwerk,
						"RecRef": oItemData[i].Pmat2,
						"Werks": oItemData[i].Werks

					};
					vStatusarr.push(vObj);
					// oItemData[i].Pmat2 = '';
				}
				// for (var y = 0; y < oItemData.length; y++) {
				// 	oItemData[y].Ebeln = "";
				// }
				// this.getView().getModel("JMQALableGenerateItem").refresh("true");
				var payLoad = {

					"d": {
						"IvProcess": "CHECKCREAT",
						"ReturnNav": [],
						"WbItemNav": oItemData,
						"StatusLogNav": vStatusarr,
						"WbHeaderNav": oHeaderData,
						"WbPackMatNav": oPacMatdata

					}
				};
				sap.ui.core.BusyIndicator.show();

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
							var errorMsg = '';
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
				MessageBox.error(VErrMsg);
			}
		},
		onUOMf4: function(oEvent) {
			var oThat = this;
			if (!oThat.f4Uom) {
				oThat.f4Uom = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.Uom", oThat);
				oThat.getView().addDependent(oThat.f4Uom);
			}
			var Vindex = oEvent.getSource().getBindingContext("JMQALableGenerateItem").getPath().split("/");
			oThat.fnUomData(Vindex);
			oThat.f4Uom.open();
		},
		fnUomData: function(Vindex) {
			var that = this;
			var oItemData = this.getView().getModel("JMQALableGenerateItem").getData();
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
			this.getView().getModel("JMQALableGenerateItem").getData()[indexUom].Config4 = oSelectedItem.getTitle();
			this.getView().getModel("JMQALableGenerateItem").refresh(true);
		},
		fnlivechangeOnlyNumber: function(oEvent) {
			var _oInput = oEvent.getSource();
			var val = _oInput.getValue();
			val = val.replace(/[^\d]/g, '');
			_oInput.setValue(val);
		},
		handleChangeDate: function(oEvent) {
			var oView = this.getView();
			var todate = oView.byId("id_ewaydate").getDateValue();
			var oi18n = oView.getModel("i18n");
			if (todate > new Date()) {
				oView.byId("id_ewaydate").setValueState("Error").setValueStateText(oi18n.getProperty('FutureDate'));
				// oView.byId("id_DPFrom").setValueState("Error").setValueStateText(oi18n.getProperty('InvalidDate'));
			} else {
				oView.byId("id_ewaydate").setValueState("None");
			}
		},
		handleChangeDateReprint: function(oEvent) {
			var oView = this.getView();
			var todate = oView.byId("id_InEwayDate").getDateValue();
			var oi18n = oView.getModel("i18n");
			if ((vDateFormat.format(new Date(todate))) > vDateFormat.format(new Date())) {
				oView.byId("id_InEwayDate").setValueState("Error").setValueStateText(oi18n.getProperty('FutureDate'));
				// oView.byId("id_DPFrom").setValueState("Error").setValueStateText(oi18n.getProperty('InvalidDate'));
			} else {
				oView.byId("id_InEwayDate").setValueState("None");
			}
		},
		fnValidateEwayQty: function(oEvent) {
			var EwayData = this.getView().getModel("JMQALableGenerateItem").getData();
			var oPath = oEvent.getSource().getBindingContext("JMQALableGenerateItem").getPath();
			var vIndex = oPath.split("/");
			var EwayQtyIndex = vIndex[1];
			if (Number(oEvent.mParameters.value).toString().length <= 13) {
				EwayData[EwayQtyIndex].Config1 = Number(EwayData[EwayQtyIndex].Config1).toFixed(3);
			} else {
				EwayData[EwayQtyIndex].Config1 = "";
				this.getView().getModel("JMQALableGenerateItem").refresh("true");
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
			PackMatf4_index = vIndexPack[1];
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
					"IvWbid": this.getView().getModel("JMQALableGenerateHeader").getData()[0].Wbid, //Added by Pavan on 05/04/2023
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

		onValueHelpUomSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter;
			if (sValue == undefined) {
				sValue = "";
			}
			oFilter = new sap.ui.model.Filter([
				new Filter("Meinh", sap.ui.model.FilterOperator.Contains, sValue)
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
			this.getView().getModel("JMPackItem").refresh("true");
		},
		fnLiveChangeEwayValidate: function(oEvent) {

			var _oInput = oEvent.getSource();
			// var val = _oInput.getValue();
			// var value = /[^A-Za-z\d]/.test(_oInput);
			// if (value === false) {
			// 	_oInput.setValue("");
			// } else {
			// 	_oInput.setValue(val);
			// }
			var val = _oInput.getValue();
			val = val.replace(/[^a-zA-Z0-9 ]/g, '');
			_oInput.setValue(val.toUpperCase());
		},
		fnReprintDialog: function() {
			if (!this.EwayReprint) {
				this.EwayReprint = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.ReprintGen", this);
				this.getView().addDependent(oThat.EwayReprint);
			}
			this.EwayReprint.open();
			// sap.ui.getCore().byId("id_InEwayDate").setValue("");
			// sap.ui.getCore().byId("id_InWbidReprint").setValue("");
			// table_datawbid = "";
		},
		fnOpenPackingMaterialDetail: function(oEvent) {
			if (!this.Packingmat) {
				this.Packingmat = sap.ui.xmlfragment("ZGT_MM_INBOUND.Fragments.PackingDetail", this);
				this.getView().addDependent(this.Packingmat);
			}
			this.Packingmat.open();
			var oPackMatPath = oEvent.getSource().getBindingContext("JMQALableGenerateItem").getPath();
			var oPacMatHeader = this.getView().getModel("JMQALableGenerateItem").getData();
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
			PacMaterialLength = 0;
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
					packingTare[Packingtare_index].PmatNo = Number(lv_zero);

					packingTare[Packingtare_index].TotPmatWt = Number(packingTare[Packingtare_index].PmatWt * packingTare[Packingtare_index].PmatNo)
						.toFixed(3);
					packingTare[Packingtare_index].PmatNo = Number(lv_zero).toString();
					this.getView().getModel("JMTMPItem").refresh(true);

					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("EnterValid"));
				}
			}
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
	});

});