/* global google */
sap.ui.define([
	"sap/ui/core/Control"
], function(Control) {
	"use strict";
    
    /**
     * Control which displays a circle on a map.
     * @class
     */
	return Control.extend("msg.maps.Circle", {
	    metadata: {
	        properties: {
	            fillOpacity:    {type: "float", defaultValue: 1},
	            fillColor:      {type: "string", defaultValue: "white"},
	            strokeOpacity:  {type: "float", defaultValue: 1},
	            strokeColor:    {type: "string", defaultValue: "white"},
	            strokeWeight:   {type: "int", defaultValue: 1},
	            latitude:       {type: "any", defaultValue: 0},
	            longitude:      {type: "any", defaultValue: 0},
	            radius:         {type: "int", defaultValue: 1},
	            visible:        {type: "boolean", defaultValue: true}
	        },
	        events: {
	            click: {}
	        }
	    },
	    
	    init: function() {
	        this._circle = new google.maps.Circle();
	        this._updateOptions();
	        this._circle.addListener("click", function() {
                this.fireEvent("click");
            }.bind(this));
	    },
	    
	    setParent: function(oParent) {
	        var oCircle = this._circle;
	        Control.prototype.setParent.apply(this, arguments);
	        if (oParent && oParent.getMap) {
	            oParent.getMap().then(function(oMap){
	                oCircle.setMap(oMap);
	            });
	        }
	        else {
	            this._circle.setMap(null);
	        }
	    },
	    
	    exit: function() {
	        this._circle.setMap(null);
	    },
	    
	    setClickable: function(bValue) {
	        this.setProperty("clickable", bValue);
	        this._updateOptions();
	    },
	    
	    setDraggable: function(bValue) {
	        this.setProperty("draggable", bValue);
	        this._updateOptions();
	    },
	   
	    setFillColor: function(fValue) {
	        this.setProperty("fillColor", fValue);
	        this._updateOptions();
	    },
	    
	    setStrokeOpacity: function(fValue) {
	        this.setProperty("strokeOpacity", fValue);
	        this._updateOptions();
	    },
	   
	    setStrokeColor: function(fValue) {
	        this.setProperty("strokeColor", fValue);
	        this._updateOptions();
	    },
	   
	    setStrokeWeight: function(fValue) {
	        this.setProperty("strokeWeight", fValue);
	        this._updateOptions();
	    },
	   
	    setVisible: function(bValue) {
	        this.setProperty("visible", bValue);
	        this._updateOptions();
	    },
	    
	    setZIndex: function(iValue) {
	        this.setProperty("zIndex", iValue);
	        this._updateOptions();
	    },
	    
	    setRadius: function(iValue) {
	        this.setProperty("radius", iValue);
	        this._updateOptions();
	    },
	    
	    setLatitude: function(fLatitude) {
	        fLatitude = parseFloat(fLatitude);
	        this.setProperty("latitude", fLatitude);
	        this._updateOptions();
	    },
	    
	    setLongitude: function(fLongitude) {
	        fLongitude = parseFloat(fLongitude);
	        this.setProperty("longitude", fLongitude);
	        this._updateOptions();
	    },
	    
	    _updateOptions: function() {
	        var oMap;
	        if (this.getParent() && this.getParent.getMap && this.getParent().getMap()) {
	            oMap = this.getParent().getMap();
	        }
	        else {
	            oMap = null;
	        }
	        this._circle.setOptions({
	            center: new google.maps.LatLng({
    	            lat:    this.getLatitude() || 0,
    	            lng:    this.getLongitude() || 0
    	        }),
    	        clickable: true,
    	        fillColor: this.getFillColor(),
    	        fillOpacity: this.getFillOpacity(),
    	        strokeColor: this.getStrokeColor(),
    	        strokeOpacity: this.getStrokeOpacity(),
    	        strokeWeight: this.getStrokeWeight(),
    	        radius: this.getRadius(),
    	        visible: this.getVisible(),
    	        map: oMap
	        });
	    },
	    
	    renderer: {}
	});
});