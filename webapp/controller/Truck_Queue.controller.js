var oThat;
var sCurrentDirection = "IN"; // Default direction
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

    return Controller.extend("ZGT_MM_INBOUND.controller.Truck_Queue", {
        onInit: function () {
            // truck queue was new dev by srinivas on 27/09/2025 

            oThat = this;
            // oThat.BusyDialog = new BusyDialog();
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.getRoute("TruckQueue").attachMatched(this._onRouteMatched, this);

        },


        _onRouteMatched: function (oEvent) {
            oThat = this;
            //oThat.BusyDialog = new BusyDialog();
            oThat._loadTruckData();
            // autorefresh for every 15 seconds 
               // 🔄 Auto-refresh every 15 seconds (alternate IN/OUT)
            if (oThat._refreshInterval) {
                clearInterval(oThat._refreshInterval);
            }

            oThat._refreshInterval = setInterval(function () {
                sCurrentDirection = sCurrentDirection === "IN" ? "OUT" : "IN";
                console.log("Refreshing Truck Data for Direction:", sCurrentDirection);
                 MessageToast.show("Refreshing Truck Data for Direction : "  + sCurrentDirection);
                oThat._loadTruckData();
            }, 15000); // 15 seconds
        },

        

        onNavBack: function () {
            oThat.oRouter.navTo("Inbound");
        },

        _loadTruckData: function () {
            var oModel = this.getOwnerComponent().getModel();

            var aFilters = [
                new Filter("Check", FilterOperator.EQ, "X"),
                new Filter("Direction", FilterOperator.EQ, sCurrentDirection)
            ];
            oThat.BusyDialog = new BusyDialog();
            oThat.BusyDialog.open();
            oModel.read("/GetTruckSet", {
                filters: aFilters,
                urlParameters: {
                    "$expand": "PurchaseCommNav,TransferNav,PurchaseNcpNav,ReturnNav"
                },
                success: function (oData) {
                    // console.log("OData Success:", oData);
                    oThat.BusyDialog.close();
                    if (oData.results && oData.results.length > 0) {
                        var oResult = oData.results[0]; // take first entry

                        var oJsonModel = new JSONModel({
                            PurchaseCommodity: oResult.PurchaseCommNav.results || [], // IN
                            Transfers: oResult.TransferNav.results || [],  // IN
                            PurchaseNCP: oResult.PurchaseNcpNav.results || [],  // IN
                            Returns: oResult.ReturnNav.results || [],
                            Sales: oResult.SalesNav.results || [],  // OUT
                            Sto :  oResult.StoNav.results || [], // OUT
                            Scrap :  oResult.ScrapNav.results || [], // OUT
                            Direction: sCurrentDirection,
                            Flags: {
                                View: oResult.View,
                                Edit: oResult.Edit
                            }
                        });

                        this.getView().setModel(oJsonModel, "TruckModel");
                    }
                }.bind(this),

                error: function (oError) {
                    oThat.BusyDialog.close();
                    // console.error("OData Error:", oError.responseText);
                    MessageBox.error(oError.responseText);
                }
            });
        },




        onPrioritize: function () {
            //  sap.m.MessageToast.show("Prioritize button clicked");
            oThat.BusyDialog = new BusyDialog();
            //oThat.BusyDialog.open();
            // Get references to all 3 tables
            var oPurchaseTable = this.byId("idPurchaseCommodityTable");
            var oTransfersTable = this.byId("idTransfersTable");
            var oNcpTable = this.byId("idPurchaseNCPTable");

            // Check which table has a selected row
            var oSelectedItem =
                oPurchaseTable.getSelectedItem() ||
                oTransfersTable.getSelectedItem() ||
                oNcpTable.getSelectedItem();

            if (!oSelectedItem) {
                sap.m.MessageToast.show(oThat.getView().getModel("i18n").getResourceBundle().getText("Pleaseselectrow"));
                // oThat.BusyDialog.close();
                return;
            }

            // Get the binding context object of the selected row
            //   var oSelectedObject = oSelectedItem.getBindingContext("TruckModel").getObject();
            var oCtx = oSelectedItem.getBindingContext("TruckModel");
            var oSelectedObject = oCtx.getObject();
            var sPath = oCtx.getPath(); // e.g., "/results/1"
            var iIndex = parseInt(sPath.split("/").pop(), 10);

            // Only allow prioritize if index > 1
            if (iIndex <= 1) {
                MessageToast.show(oThat.oView.getModel("i18n").getResourceBundle().getText("CannotPrioritize"));
                return;
            }




            // 🔹 Create a dialog to capture the reason
            var oDialog = new sap.m.Dialog({
                title: "Enter Reason for Prioritization",
                type: "Message",
                content: [
                    new sap.m.Label({
                        text: "Please enter reason:",
                        labelFor: "reasonInput"
                    }),
                    new sap.m.Input("reasonInput", {
                        width: "100%",
                        placeholder: "Type your reason here..."
                    })
                ],
                beginButton: new sap.m.Button({
                    text: "Submit",
                    type: "Emphasized",
                    press: function () {
                        var sReason = sap.ui.getCore().byId("reasonInput").getValue().trim();
                        if (!sReason) {
                            sap.ui.getCore().byId("reasonInput").setValueState("Error");
                            sap.ui.getCore().byId("reasonInput").setValueStateText("Reason is mandatory");
                            return;
                        }

                        oDialog.close(); // close dialog
                        oThat.BusyDialog.open();

                        var aFilters = [
                            new Filter("Check", FilterOperator.EQ, "X"),
                            new Filter("WbId", FilterOperator.EQ, oSelectedObject.WbId),
                            new Filter("Reason", FilterOperator.EQ, sReason)
                        ];
                        var oModel = oThat.getOwnerComponent().getModel(); // ODataModel
                        oModel.read("/GetTruckSet", {
                            filters: aFilters,
                            urlParameters: {
                                "$expand": "PurchaseCommNav,TransferNav,PurchaseNcpNav,ReturnNav"
                            },
                            success: function (oData) {
                                oThat.BusyDialog.close();
                                if (oData.results && oData.results.length > 0 && oData.results[0].ReturnNav) {
                                    var aReturn = oData.results[0].ReturnNav.results;
                                    if (aReturn && aReturn.length > 0) {
                                        // Separate error and success messages
                                        var aErrorMsgs = aReturn.filter(function (msg) {
                                            return msg.Type === "E";
                                        });
                                        var aSuccessMsgs = aReturn.filter(function (msg) {
                                            return msg.Type === "S";
                                        });

                                        // Show error messages first if any
                                        if (aErrorMsgs.length > 0) {
                                            var sErrorMsg = aErrorMsgs.map(function (msg) {
                                                return msg.Message;
                                            }).join("\n");
                                            sap.m.MessageBox.error(sErrorMsg)
                                        }
                                        // If no errors, show success messages
                                        else if (aSuccessMsgs.length > 0) {
                                            var sSuccessMsg = aSuccessMsgs.map(function (msg) {
                                                return msg.Message;
                                            }).join("\n");
                                            sap.m.MessageBox.success(sSuccessMsg, {
                                                onClose: function (oAction) {
                                                    oThat._loadTruckData();
                                                }.bind(this)
                                            });
                                        }
                                    }
                                }

                            }.bind(this),

                            error: function (oError) {
                                oThat.BusyDialog.close();
                                MessageBox.error("OData Error: " + oError.responseText);
                            }
                        });

                    }
                }),
                endButton: new sap.m.Button({
                    text: "Cancel",
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function () {
                    oDialog.destroy();
                }
            });

            oThat.getView().addDependent(oDialog);
            oDialog.open();
        },

        onTableSelectionChange: function (oEvent) {
                var oSelectedTable = oEvent.getSource(); // Table that triggered the event
                var oView = this.getView();

                // Get references to all 3 tables
                var oPurchaseTable = oView.byId("idPurchaseCommodityTable");
                var oTransfersTable = oView.byId("idTransfersTable");
                var oNcpTable = oView.byId("idPurchaseNCPTable");

                // Clear selections in other tables except the one clicked
                if (oSelectedTable !== oPurchaseTable) {
                    oPurchaseTable.removeSelections(true);
                }
                if (oSelectedTable !== oTransfersTable) {
                    oTransfersTable.removeSelections(true);
                }
                if (oSelectedTable !== oNcpTable) {
                    oNcpTable.removeSelections(true);
                }
}



    });
});