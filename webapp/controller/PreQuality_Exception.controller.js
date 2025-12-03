var oThat;
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/BusyDialog",
    "sap/m/MessageToast",
], function (Controller, JSONModel, MessageBox, Filter, FilterOperator, BusyDialog, MessageToast) {
    "use strict";

    return Controller.extend("ZGT_MM_INBOUND.controller.PreQuality_Exception", {
        onInit: function () {
            // truck queue was new dev by srinivas on 27/09/2025 

            oThat = this;
            // oThat.BusyDialog = new BusyDialog();
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.getRoute("PreQualityException").attachMatched(this._onRouteMatched, this);

        },


        _onRouteMatched: function (oEvent) {
            oThat = this;
            //oThat.BusyDialog = new BusyDialog();
            oThat._loadExceptionData();

        },

        onNavBack: function () {
            oThat.oRouter.navTo("Inbound");
        },

        _loadExceptionData: function () {
            var oModel = this.getOwnerComponent().getModel();

            // var aFilters = [
            //     new Filter("Check", FilterOperator.EQ, "X")
            // ];
            oThat.BusyDialog = new BusyDialog();
            oThat.BusyDialog.open();
            oModel.read("/GetPreQualExpSet", {
                // filters: aFilters,
                // urlParameters: {
                //     "$expand": "PurchaseCommNav,TransferNav,PurchaseNcpNav,ReturnNav"
                // },
                success: function (oData) {
                    // console.log("OData Success:", oData);
                    oThat.BusyDialog.close();
                  //  if (oData.results && oData.results.length > 0) {
                      //  var oResult = oData.results[0]; // take first entry
                        var oJsonModel = new JSONModel(oData.results);
                        this.getView().setModel(oJsonModel, "ExceptionModel");
                   // }
                }.bind(this),

                error: function (oError) {
                    oThat.BusyDialog.close();
                    // console.error("OData Error:", oError.responseText);
                    MessageBox.error(oError.responseText);
                }
            });
        },



        onReviewExceptionPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("ExceptionModel");
            oThat.oObject = oContext.getObject();

            //    oThat._selectedWBID = oObject.WbId;  // keep WBID for update later
            //    oThat._selectedWBItem = oObject.Item;  // keep WBID for update later
            //    oThat._selectedWerks = oObject.Werks; 

            // set dialog fields
            oThat.byId("idGradeChange").setValue( oThat.oObject.Grade);
            oThat.byId("idSurcharge").setValue( oThat.oObject.Surcharge);
            oThat.byId("idReason").setValue( oThat.oObject.Reason);
            oThat.byId("idExceptionDialog").open();
        },

        onApprove: function () {
            oThat._updateWBIDStatus("A"); // QA Approved
        },

        onReject: function () {
            oThat._updateWBIDStatus("R"); // QA Rejected
        },

        _updateWBIDStatus: function (sAction) {
            var oModel = this.getOwnerComponent().getModel();
            var oObj = oThat.oObject;
            oThat.BusyDialog = new BusyDialog();
            oThat.BusyDialog.open();
            //  var that = this;

            //var sWBID = oThat._selectedWBID;
            var oEntry = {
                "IAppname": "QC",
                "ICharg": oObj.Batch,
                "IWbid": oObj.WbId,
                "IItem": oObj.Item,
                "IWerks": oObj.Werks,
                "IMatnr": oObj.Material,
                "IEbeln": oObj.Ebeln,
                "IEbelp": oObj.Ebelp,
                "Grade": oThat.byId("idGradeChange").getValue(),
                "Surcharge": oThat.byId("idSurcharge").getValue(),
                "Reason": oThat.byId("idReason").getValue(),
                "IApprove": sAction,
                "PostBatchCharNav": [],
                "PostReturnNav": []
            };

            oModel.create("/PostBatchSet", oEntry, {
                success: function (oData) {
                    oThat.byId("idExceptionDialog").close();
                    oThat.BusyDialog.close();
                    if (oData.PostReturnNav.results[0].Type === 'S') {
						MessageBox.success(oData.PostReturnNav.results[0].Message, {
							icon: MessageBox.Icon.SUCCESS,
							actions: [MessageBox.Action.OK],
							onClose: function (oAction) {
								if (oAction == 'OK') {
									oThat._onRouteMatched();
									
									// that.oRouter.navTo("EwayBill");
								}
							}
						});
					} else {

						MessageBox.error(oData.PostReturnNav.results[0].Message);
					}
					// oThat.BusyDialog.close();
				
                },
                error: function (oError) {
                     oThat.BusyDialog.close();
                    MessageBox.error(oError.responseText);
                }
            })
        },

        onREclose: function () {
            oThat.byId("idExceptionDialog").close();
        }


    });
});