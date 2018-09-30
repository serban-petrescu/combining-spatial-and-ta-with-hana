/* global google */
sap.ui.define([
	"sap/ui/core/Control"
], function(Control) {
	"use strict";
	
	/**
	 * Popover-like window which can be displayed on a map.
	 */
	return Control.extend("msg.maps.InfoWindow", {
	    metadata: {
	        properties: {
	            content: {
	                type: "string"
	            }
	        },
	        defaultAggregation: "items"
	    },
	    
	    _infoWindow: null,
	    
	    init: function() {
	        this._infoWindow = new google.maps.InfoWindow({
                content: ""
            });
	    },
	    
	    openByMarker: function(oMarker) {
	        this._infoWindow.setContent(this.getContent());
	        this._infoWindow.open(oMarker.getParent()._map, oMarker._marker);
	    },
	    
	    renderer: function() {}
	    
	});
});