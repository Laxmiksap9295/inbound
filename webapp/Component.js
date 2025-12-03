jQuery.sap.require("ZGT_MM_INBOUND.Util.Formatter");
jQuery.sap.require("ZGT_MM_INBOUND.lib.custom");
jQuery.sap.require("ZGT_MM_INBOUND.lib.signature");
jQuery.sap.require("ZGT_MM_INBOUND.model.formatter");

sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/Device", "ZGT_MM_INBOUND/model/models", "ZGT_MM_INBOUND/Util/Formatter", "ZGT_MM_INBOUND/model/formatter" ], function (e, t, i, r, o) {
    "use strict";
    return e.extend("ZGT_MM_INBOUND.Component", {
        metadata: {
            manifest: "json"
        },
        init: function () {
            e.prototype.init.apply(this, arguments);
            this.setModel(i.createDeviceModel(), "device");
            this.getRouter().initialize()

        },
       
    })
});
//# sourceMappingURL=Component.js.map