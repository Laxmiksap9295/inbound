sap.ui.define(
    ['sap/ui/core/Control'],
    function(Control) {
    return Control.extend("ZGT_MM_INBOUND.lib.whsign",{
         metadata: {
              properties: {
                  "width":{type:"sap.ui.core.CSSSize",defaultValue:"335px"},
                  "height":{type:"sap.ui.core.CSSSize",defaultValue:"335px"},
                  "thickness":{type:"int",defaultValue:2},
                  "bgcolor":{type:"sap.ui.core.CSSSize",defaultValue:"#fff1d3"},
                  "signcolor":{type:"sap.ui.core.CSSSize",defaultValue:"red"}
              },
              aggregations: {},
         },
         renderer: function(oRm,oControl){
              //to do: render the control
              oRm.write("<div");
              oRm.writeControlData(oControl);
              oRm.addStyle("width",oControl.getProperty('width'));
              oRm.addStyle("height",oControl.getProperty('height'));
              oRm.addStyle("background-color",oControl.getProperty('bgcolor'));
              oRm.writeStyles();
              oRm.writeClasses();
              oRm.write(">");
              oRm.write("<canvas width='"+oControl.getProperty('width')+"' "+
              "height='"+oControl.getProperty('height')+"'");
              oRm.writeControlData(oControl);
              oRm.addStyle("width",oControl.getProperty('width'));
              oRm.addStyle("height",oControl.getProperty('height'));
              oRm.writeStyles();
              oRm.write("> </canvas>");
              oRm.write("</div>");
         },
         onAfterRendering: function() {
              //if I need to do any post render actions, it will happen here
              if(sap.ui.core.Control.prototype.onAfterRendering) {
                   sap.ui.core.Control.prototype.onAfterRendering.apply(this,arguments); //run the super class's method first
              }
         },
    });
    }
  );