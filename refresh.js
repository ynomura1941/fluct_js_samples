(function(doc) {
  currentScript = (function(e) {
    if (e.nodeName.toLowerCase() == 'script')
      return e;
    return arguments.callee(e.lastChild);
  })(doc);
  
  queryParams = (function(url){
    var selfUrl = currentScript.src;
    var queryStr = selfUrl.substring(selfUrl.indexOf('?')+1);
    queryStr = queryStr.split('&');
    var paramNum = queryStr.length;
    var params = {};
    
    for(var i = 0; i < paramNum;i ++){
      var param = queryStr[i].split('=');
      params[param[0]] = param[1];
    }
    return params;
  })(currentScript.src);
  
  var FluchRefresh = function(params, selfElement) {
    this.params = params;
    this.self = selfElement;
    this.openTarget = '_blank';
    this.timer = null;
  };
  FluchRefresh.prototype = {
    init: function(){
      var div = document.createElement('div');
      div.setAttribute('id', 'fluctRefresh');
      div.setAttribute('style', 'width:'+this.params.w+'px;height:'+this.params.h+'px;border:none;padding:0;margin:0;');
      this.self.parentNode.insertBefore(div,this.self);
      document.addEventListener("DOMContentLoaded",function(){
        var fr = fluctRefresh;
        fr.loadData();
        fr.timer = setTimeout(fr.refresher, fr.params.ttl * 1000);
        fr = null;
      }, true);
    },
    refresher: function(){
      var fr = fluctRefresh;
      fr.loadData();
      clearTimeout(fr.timer);
      fr.timer = setTimeout(fr.refresher, fr.params.ttl * 1000);
      fr = null;
    },
    getSelf: function(){
      return this.self;
    },
    getParams: function(){
      return this.params;
    },
    createframe: function(data){
      var div = document.getElementById('fluctRefresh');
      div.innerHTML = '';
    },
    
    loadData: function(){
        var script = document.createElement('script');
        var queryStr = [];
        for (val in this.params){
          queryStr.push(val + '=' + this.params[val]);
          
        }
        
        script.src='http://sh.adingo.jp/api/json/v1/?' + queryStr.join('&') + '&cb=fluctRefreshCallback&' + Math.random();
        var div = document.getElementById('fluctRefresh');
        div.appendChild(script);
    },
    beaconImage: function(target, url){
      var beacon = document.createElement('img');
      beacon.setAttribute('src', url);
      beacon.setAttribute('style', 'display:none');
      beacon.setAttribute('width',1);
      beacon.setAttribute('height', 1);
      target.appendChild(beacon);
    },
    _renderImage: function(target,ad){
      var img = document.createElement('img');
      img.setAttribute('src', ad.creative_url);
      img.setAttribute('width', ad.width);
      img.setAttribute('height', ad.height);
      img.setAttribute('alt', this.json_str_decode(ad.alt));
      var link  = document.createElement('a');
      link.setAttribute('href', ad.landing_url);
      link.setAttribute('target', this.openTarget);
      target.appendChild(link);
      link.appendChild(img);
    },
    _renderHTML: function(target, ad){
      var iframe = this._generateIframe('fluctRefresh_iframe');
      target.appendChild(iframe);
      var iframeDoc = document.getElementById('fluctRefresh_iframe').contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(
          '<html><head></head><body style="padding:0px;margin:0px;border:none;">'
              + ad.html + '</body></html>');
      iframeDoc.close();
      iframeDoc = null;
      iframe =null;
    },
    _generateIframe: function(id){
      var iframe = document.createElement('iframe');
      iframe.setAttribute('id', id);
      iframe.setAttribute('style', 'width:'+this.params.w+'px;height:'+this.params.h+'px;border:none;padding:0;margin:0;');
      iframe.setAttribute('marginwidth', 0);
      iframe.setAttribute('marginheight', 0);
      iframe.setAttribute('allowtransparency', 'false');
      iframe.setAttribute('vspace', 0);
      iframe.setAttribute('hspace', 0);
      iframe.setAttribute('frameborder', 0);
      iframe.setAttribute('scrolling', 'no');
      return iframe;
    },
    _renderFlush: function(target, ad){
      var info = this.fpInfo();
      if(info.exist && info.v > 5){
        var flashVars = 'clickTAG=' + escape(ad.landing_url) + '&targetTAG=' + this.openTarget;
        var objStr = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' +
          'codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,0,0"' +
          'width="{$sWidth}" height="{$sHeight}" style="border:none;padding:0;margin:0">' +
          '<param name="movie" value="{$sSrc}">' +
          '<param name="flashvars" value="{$flashVars}">' +
          '<param name="allowScriptAccess" value="always">' +
          '<param name="quality" value="autohigh">' +
          '<param name="bgcolor" value="#fff">' +
          '<param name="wmode" value="opaque">' +
          '<embed src="{$sSrc}"' +
          'flashvars="{$flashVars}"' +
          'quality="autohigh"' +
          'allowscriptaccess="always"' +
          'swliveconnect="FALSE"' +
          'width="{$sWidth}"' +
          'height="{$sHeight}"' +
          'wmode="opaque"' +
          'type="application/x-shockwave-flash"' +
          'pluginspage="http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash">' +
          '</object>';
        objStr = objStr.replace(/\{\$sWidth\}/g, ad.width);
        objStr = objStr.replace(/\{\$sHeight\}/g, ad.height);
        objStr = objStr.replace(/\{\$sSrc}/g, ad.creative_url);
        objStr = objStr.replace(/\{\$flashVars}/g, flashVars);
        var iframe = this._generateIframe('fluctRefresh_iframe');
        target.appendChild(iframe);
        var iframeDoc = document.getElementById('fluctRefresh_iframe').contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(
            '<html><head></head><body style="padding:0px;margin:0px;border:none;">'
                + objStr + '</body></html>');
        iframeDoc.close();
        iframeDoc = null;
        iframe =null;
      }
      else{
        if( ad.alt_image != null && ad.alt_image != '' ){
          var img = document.createElement('img');
          img.setAttribute('src', ad.alt_image);
          img.setAttribute('width', ad.width);
          img.setAttribute('height', ad.height);
          img.setAttribute('alt', this.json_str_decode(ad.alt));
          var link  = document.createElement('a');
          link.setAttribute('href', ad.landing_url);
          link.setAttribute('target', this.openTarget);
          target.appendChild(link);
          link.appendChild(img);
        }
      }
      
    },
    fpInfo: function(){
      var userAgent = window.navigator.userAgent.toLowerCase();
      var rtn = {
          v: 0,
          exist: false
      };
      if (userAgent.indexOf('msie') != -1) {
        try{
          if( typeof new ActiveXObject('ShockwaveFlash.ShockwaveFlash') !== 'undefined' ){
            var flashOCX = new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version");
            rtn.v = parseInt(flashOCX.match(/([0-9]+)/)[0]);
            rtn.exist = true;
          }
        }
        catch(e){
        }
      }
      else{
        if( typeof navigator.plugins["Shockwave Flash"] !== 'undefined' ){
          rtn.v =parseInt(navigator.plugins["Shockwave Flash"].description.match(/\d+\.\d+/));
          rtn.exist = rtn.v != 0 ? true : false;
        }
      }
      return rtn;
    },
    json_str_decode: function(str){
      arrs=str.match(/\\u.{4}/g);
      var t="";
      if( arrs == null ){
        return '';
      }
      for(var i=0;i<arrs.length;i++){
          t+=String.fromCharCode(arrs[i].replace("\\u","0x"));
      }
      return(t);
    }
  };

  
  if( typeof(fluctRefresh) === 'undefined'){
    fluctRefresh = new FluchRefresh(queryParams,currentScript);
    fluctRefresh.init();
    fluctRefreshCallback = function(json){
      var fr = fluctRefresh;
      if( json.status == 'success' ){
        for(var i =0 ; i < json.ads.length; i++){
          var ad = json.ads[i];
          if( ad.unit_id == fr.getParams().u){
            var div = document.getElementById('fluctRefresh');
            div.innerHTML = '';
            switch(ad.creative_type){
            case 'html':
              fr._renderHTML(div, ad);
              break;
            case 'flash':
              fr._renderFlush(div, ad);
              break;
            case 'image':
              fr._renderImage(div, ad);
              break;
            }
            fr.beaconImage(div, ad.beacon);
            div = null;
          }
          ad = null;
        }
      }
      fr = null;
    };
  }
})(document);