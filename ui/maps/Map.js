/* global google */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/core/HTML",
	"./MarkerClusterer"
], function(Control, HTML, MarkerClusterer) {
	"use strict";
    
    /**
     * Wrapper control for a google map.
     * @class
     */
	return Control.extend("msg.maps.Map", {
	    metadata: {
	        properties: {
				width: {type: "sap.ui.core.CSSSize", defaultValue: "100%"},
				height: {type: "sap.ui.core.CSSSize", defaultValue: "100%"},
				zoom:   {type: "int", defaultValue: 4},
				latitude: {type: "any", defaultValue: 0},
				longitude: {type: "any", defaultValue: 0},
				drawing: {type: "boolean", defaultValue: false}
	        },
	        aggregations: {
	            "_html": {
	                type:       "sap.ui.core.HTML",
	                visibility: "hidden",
	                multiple:   false
	            },
	            "markers": {
	                type:           "msg.maps.Marker",
	                multiple:       true,
	                singularName:   "marker"
	            },
	            "circles": {
	                type:           "msg.maps.Circle",
	                multiple:       true,
	                singularName:   "circle"
	            }
	        },
	        events: {
	            drawPolygon: {polygon: {type: "object"}}
	        }
	    },
	    
	    _drawManager: null,
	    _lastPoly: null,
	    
	    init: function() {
	        var oHtml = new HTML({
				content: '<div style="height:' + this.getHeight() + ';width:' + this.getWidth() + '"/></div>'
			});
			this.setAggregation("_html", oHtml);
			oHtml.attachAfterRendering(function(){
			    if (!this._map && oHtml.getDomRef()) {
    	            this._map = new google.maps.Map(oHtml.getDomRef(), {
    	                center: new google.maps.LatLng({lat: parseFloat(this.getLatitude()), lng: parseFloat(this.getLongitude())}), 
    	                zoom:   this.getZoom()
    	            });
    	            this._deferred.resolve(this._map);
    	        }
			}, this);
			this._deferred = jQuery.Deferred();
	    },
	    
	    setDrawing: function(bValue) {
	        this.setProperty("drawing", bValue);
	        if (bValue) {
	            var oManager = new google.maps.drawing.DrawingManager({
                    drawingMode: null,
                    drawingControl: true,
                    drawingControlOptions: {
                        position: google.maps.ControlPosition.TOP_CENTER,
                        drawingModes: ['polygon']
                    }
                });
                oManager.addListener("polygoncomplete", function(oP) {
	                this.fireEvent("drawPolygon", {polygon: oP});
	                if (this._lastPoly) {
	                    this._lastPoly.setMap(null);
	                }
	                this._lastPoly = oP;
	            }.bind(this)); 
	            this._drawManager = oManager;
                this._deferred.then(function(oMap){
                    oManager.setMap(oMap);
                });
	        }
	        else {
	            if (this._drawManager) {
	                this._drawManager.setMap(null);
	                this._drawManager = null;
	            }
	            if (this._lastPoly) {
	                this._lastPoly.setMap(null);
	                this._lastPoly = null;
	            }
	        }
	    },
	    
	    getMap: function() {
	        return this._deferred.promise();
	    },
	    
		setHeight: function(sValue) {
			this.setProperty("height", sValue, true);
			this.getAggregation("_html").setContent('<div style="height:' + this.getHeight() + ';width:' + this.getWidth() + '"></div>');
		},
		
		setWidth: function(sValue) {
			this.setProperty("width", sValue, true);
			this.getAggregation("_html").setContent('<div style="height:' + this.getHeight() + ';width:' + this.getWidth() + '"/></div>');
		},
		
		setLongitude: function(sValue) {
		    var fValue = parseFloat(sValue);
		    this.setProperty("longitude", fValue);
		    if (this._map) {
		        this._map.setCenter(new google.maps.LatLng({lat: this.getLatitude(), lng: fValue}));
		    }
		},
		
		setLatitude: function(sValue) {
		    var fValue = parseFloat(sValue);
		    this.setProperty("latitude", fValue);
		    if (this._map) {
		        this._map.setCenter(new google.maps.LatLng({lat: fValue, lng: this.getLongitude()}));
		    }
		},
		
		/**
		 * Updates the maps center to match the UI5 settings.
		 * @returns {Map} this
		 */
		updateCenter: function() {
		    this._map.setCenter(new google.maps.LatLng({lat: this.getLatitude(), lng: this.getLongitude()}));
		    return this;
		},
		
		setZoom: function(iValue) {
		    this.setProperty("zoom", iValue);
		    if (this._map) {
		        this._map.setZoom(iValue);
		    }
		},
		
		/**
		 * Performs the UI-based clustering.
		 * @return {void}
		 */
		doClustering: function(){
		    var oOpts = {imagePath: jQuery.sap.getModulePath("msg.maps.images", "/m")},
		        aMarkers = (this.getMarkers() || []).map(function(oMarker){
		            return oMarker._marker;
		        });
		    return new MarkerClusterer(this._map, aMarkers, oOpts);
		},
			
		renderer : function (oRM, oControl) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.addStyle("height", "100%");
			oRM.addStyle("width", "100%");
			oRM.writeStyles();
			oRM.write(">");
			oRM.renderControl(oControl.getAggregation("_html"));
			oRM.write("</div>");
		}
	});
});