/* global google */
sap.ui.define([
	"sap/ui/core/Control"
], function(Control) {
	"use strict";
	
    /** Svg content for a circle-based marker. */
	var SVG_CONTENT = 
		'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">'
			+ '<circle cx="8" cy="8" stroke="{1}" r="7" fill="{0}" stroke-width="1"/>'
		+ '</svg>';
	
	/**
	 * Control which displays a marker on the map.
	 * @class
	 */
	return Control.extend("msg.maps.Marker", {
	    metadata: {
	        properties: {
	            color:      {type: "sap.ui.core.CSSColor", defaultValue: "#1f77b4"},
	            label:      {type: "string"},
	            latitude:   {type: "any", defaultValue: 0},
	            longitude:  {type: "any", defaultValue: 0},
	            title:      {type: "string"},
	            visible:    {type: "boolean", defaultValue: true}
	        },
	        events: {
	            press: {}
	        }
	    },
	    
	    init: function() {
	        this._marker = new google.maps.Marker({
	            clickable: true
	        });
	        this._marker.addListener("click", function() {
                this.fireEvent("press");
            }.bind(this));
            this.updateIcon();
	    },
	    
	    setParent: function(oParent) {
	        var oMarker = this._marker;
	        Control.prototype.setParent.apply(this, arguments);
	        if (oParent && oParent.getMap) {
	            oParent.getMap().then(function(oMap){
	                oMarker.setMap(oMap);
	            });
	        }
	        else {
	            this._marker.setMap(null);
	        }
	    },
	    
	    exit: function() {
	        this._marker.setMap(null);
	    },
	    
	    setColor: function(sValue) {
	        this.setProperty("color", sValue);
	        this.updateIcon();
	    },
	    
	    setLabel: function(sValue) {
	        this.setProperty("label", sValue);
	        this._marker.setLabel(sValue);
	    },
	    
	    setTitle: function(sValue) {
	        this.setProperty("title", sValue);
	        this._marker.setTitle(sValue);
	    },
	    
	    setVisible: function(bValue) {
	        this.setProperty("visible", bValue);
	        this._marker.setVisible(bValue);
	    },
	    
	    setLatitude: function(fLatitude) {
	        fLatitude = parseFloat(fLatitude);
	        this.setProperty("latitude", fLatitude);
	        this._marker.setPosition(new google.maps.LatLng({
	            lat:    fLatitude,
	            lng:    this.getLongitude()
	        }));
	    },
	    
	    setLongitude: function(fLongitude) {
	        fLongitude = parseFloat(fLongitude);
	        this.setProperty("longitude", fLongitude);
	        this._marker.setPosition(new google.maps.LatLng({
	            lat:    this.getLatitude(),
	            lng:    fLongitude
	        }));
	    },
	    
	    /**
		 * Updates the icon data url.
		 * @returns {Marker} this for chaining.
		 */
		updateIcon: function() {
			var sColor = this.getColor(),
				sStroke = "white",
				sSvg = jQuery.sap.formatMessage(SVG_CONTENT, [sColor, sStroke]);
			this._marker.setIcon({
				url: "data:image/svg+xml;utf8," + encodeURIComponent(sSvg),
				anchor: new google.maps.Point(8,8)
			});
			return this;
		},
		
	    renderer: {}
	});
});