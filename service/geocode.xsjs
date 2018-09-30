var API_KEY = "<<API KEY HERE>>";

var oDestination = $.net.http.readDestination("spet.service", "google");

function callGeocodingApi(sApiKey, sAddress) {
    try {
        var sUrl = "/geocode/json?address=" + encodeURIComponent(sAddress) + "&key=" + sApiKey,
    		oRequest = new $.net.http.Request($.net.http.GET, sUrl),
            oClient = new $.net.http.Client(),
    		oResponse = oClient.request(oRequest, oDestination).getResponse(),
    		sData = oResponse.body.asString(),
    		oData = JSON.parse(sData);
    		$.trace.error("Got response: " + sData);
    	return oData;
    }
    catch (e) {
        $.trace.error(e);
        return null;
    } 
    finally {
        if (oClient) {
            oClient.close();
        }
    }
}

/**
 * Geocodes an address using the google API library.
 * @param   {string}    sAddress    The address to be geocoded.
 * @returns {object}    The coordinates in the form {lat: number, lng: number}.
 * 
 */
function geocodeAddress(sAddress) {
    try {
        var oData = callGeocodingApi(API_KEY, sAddress);
    	if (oData && oData.results && oData.results.length && oData.results[0].geometry) {
    	    return oData.results[0].geometry.location;
    	}
    	else {
    	    return null;
    	}
    }
    catch (e) {
        $.trace.error(e);
        return null;
    }
}

function extractSentiment(sentiment) {
    if (sentiment && sentiment.label) {
        switch(sentiment.label) {
            case "StrongNegativeSentiment":
            case "StrongNegativeEmoticon":
                return {
                    startIndex: sentiment.offset,
                    endIndex: sentiment.offset + sentiment.text.length,
                    text: sentiment.text,
                    type: "NEGATIVE",
                    strong: true
                };
            case "WeakNegativeSentiment":
            case "WeakNegativeEmoticon":
                return {
                    startIndex: sentiment.offset,
                    endIndex: sentiment.offset + sentiment.text.length,
                    text: sentiment.text,
                    type: "NEGATIVE",
                    strong: false
                };
            case "StrongPositiveSentiment":
            case "StrongPositiveEmoticon":
                return {
                    startIndex: sentiment.offset,
                    endIndex: sentiment.offset + sentiment.text.length,
                    text: sentiment.text,
                    type: "POSITIVE",
                    strong: true
                };
            case "WeakPositiveSentiment":
            case "WeakPositiveEmoticon":
                return {
                    startIndex: sentiment.offset,
                    endIndex: sentiment.offset + sentiment.text.length,
                    text: sentiment.text,
                    type: "POSITIVE",
                    strong: false
                };
            case "NeutralSentiment":
            case "NeutralSentiment":
                return {
                    startIndex: sentiment.offset,
                    endIndex: sentiment.offset + sentiment.text.length,
                    text: sentiment.text,
                    type: "NEUTRAL",
                    strong: false
                };
        }
    }
    return null;
}

function notNull(object) {
    return object !== null;
}

var TA = new $.text.analysis.Session({configuration: "sap.hana.ta.config::EXTRACTION_CORE_VOICEOFCUSTOMER.hdbtextconfig"});

function sentimentAnalysis(text) {
    return TA.analyze({inputDocumentText: text || ""}).entities.map(extractSentiment).filter(notNull);
}

function process() {
    var oConn = $.hdb.getConnection(),
        aEntries = oConn.executeQuery('SELECT "text", "address" FROM "SPET"."spet.data::core.Raw"');
    
    oConn.executeUpdate('DELETE FROM "SPET"."spet.data::core.Processed"');
    oConn.executeUpdate('DELETE FROM "SPET"."spet.data::core.Sentiment"');
    
    var j = 0;
    for (var i = 0; i < aEntries.length; ++i) {
        var oLatLng = geocodeAddress(aEntries[i].address) || {lat: 0, lng: 0};
        var aSentiments = sentimentAnalysis(aEntries[i].text) || [];
        oConn.executeUpdate('INSERT INTO "SPET"."spet.data::core.Processed" VALUES (?, ?, ?, NEW ST_POINT(TO_DECIMAL(?, 9, 6), TO_DECIMAL(?, 9, 6)))',
            i, aEntries[i].text, aEntries[i].address, oLatLng.lng, oLatLng.lat);
        for (var k = 0; k < aSentiments.length; ++k) {
            oConn.executeUpdate('INSERT INTO "SPET"."spet.data::core.Sentiment" VALUES (?, ?, ?, ?, ?, ?, ?)',
                ++j, aSentiments[k].startIndex, aSentiments[k].endIndex, aSentiments[k].type, aSentiments[k].strong ? 1 : 0, aSentiments[k].text, i);
        }
    }
    
    oConn.commit();
    oConn.close();
}

process();