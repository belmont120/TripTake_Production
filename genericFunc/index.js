
var functionObj = {};

functionObj.nthIndex = function(str, pat, n){
    var L= str.length, i= -1;
    while(n-- && i++<L){
        i= str.indexOf(pat, i);
        if (i < 0) break;
    }
    return i;
}

functionObj.getApiUrl = function(url) {
	return (url.substring(0, nthIndex(url, "/", 3) + 1) + "api/" + url.substring(nthIndex(url, "/", 3) + 1));
}

module.exports = functionObj;


