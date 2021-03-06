var SampleFluctApiClient = function(linkTarget){
  this.linkTarget = linkTarget;
  this.fd = null;
};
SampleFluctApiClient.prototype = {
    setFluctData: function(json){
      if(json.status == 'success'){
        this.fd = json;
      }
      else{
        alert('fluct から広告取得できませんでした。');
      }
    },
    getBody: function(){
      return document.getElementsByTagName('body')[0];
    },
    createImage: function(){
      return document.createElement('img');
    },
    createLink: function(){
      return document.createElement('a');
    },
    beacon: function(url){
      var beacon = this.createImage();
      beacon.setAttribute('src', url);
      beacon.setAttribute('style', 'display:none');
      beacon.setAttribute('width',1);
      beacon.setAttribute('height', 1);
      this.getBody().appendChild(beacon);
    },
    renderCommon: function(){
      if( this.fd != null && this.fd.sync != ''){
        var sync = this.createImage();
        sync.setAttribute('src',this.fd.sync);
        sync.setAttribute('style', "display:none;position:absolute;border:none;padding:0;margin:0;");
        sync.setAttribute('width',1);
        sync.setAttribute('height',1);
        this.getBody().appendChild(sync);
      }
    },
    renderAd: function(unit_id){
      if( this.fd == null ){
        return;
      }
      for(var i =0 ; i < this.fd.ads.length; i++){
        var ad = this.fd.ads[i];
        if(ad.unit_id == unit_id){
          switch(ad.creative_type){
          case 'html':
            this._renderHTML(ad);
            break;
          case 'flash':
            this._renderFlash(ad);
            break;
          case 'image':
            this._renderImage(ad);
            break;
          }
          this.beacon(ad.beacon);
        }
      }
    },
    _renderImage: function(ad){
      var img = this.createImage();
      img.setAttribute('src', ad.creative_url);
      img.setAttribute('width', ad.width);
      img.setAttribute('height', ad.height);
      img.setAttribute('alt', json_str_decode(ad.alt));
      var link  = this.createLink();
      link.setAttribute('href', ad.landing_url);
      link.setAttribute('target', this.linkTarget);
      this.getBody().appendChild(link);
      link.appendChild(img);
    },
    _renderHTML: function(ad){
        document.write(ad.html);
    },
    _renderFlash: function(ad){
      
      if( fpCheck() ){
        var flashVars = 'clickTAG=' + escape(ad.landing_url) + '&targetTAG=' +this.linkTarget;
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
        document.write(objStr);
    }
    else{
      if( ad.alt_image != null && ad.alt_image != '' ){
        var img = this.createImage();
        img.setAttribute('src', ad.alt_image);
        img.setAttribute('width', ad.width);
        img.setAttribute('height', ad.height);
        img.setAttribute('alt', json_str_decode(ad.alt));
        var link  = this.createLink();
        link.setAttribute('href', ad.landing_url);
        link.setAttribute('target', this.linkTarget);
        this.getBody().appendChild(link);
        link.appendChild(img);
      }
    }
  }
    
};

function fpCheck(){
  var userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('msie') != -1) {
    try{
      if( typeof new ActiveXObject('ShockwaveFlash.ShockwaveFlash') !== 'undefined' ){
        return true;
      }
    }
    catch(e){
    }
  }
  else{
    if( typeof navigator.plugins["Shockwave Flash"] !== 'undefined' ){
      return true;
    }
  }
  return false;
};
function json_str_decode(str){
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