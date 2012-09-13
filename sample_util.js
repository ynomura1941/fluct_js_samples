(function()
{
  if(window.HTMLElement)
  {
    if('insertAdjacentElement' in HTMLElement.prototype){
      return;
    };
  }
  else
  {
    if(navigator.vendor == 'Apple Computer, Inc.')
    {
      document.createElement('html');
      window.HTMLElement = { prototype : window["[[DOMElement.prototype]]"] || {}};
    }
    else
    {
      return;
    };
  };

  HTMLElement.prototype.insertAdjacentElement = function(w, n)
  {
    switch(w.toLowerCase())
    {
      case 'beforebegin':
        this.parentNode.insertBefore(n, this);
        break;
      case 'afterbegin':
        this.insertBefore(n, this.childNodes[0]);
        break;
      case 'beforeend':
        this.appendChild(n);
        break;
      case 'afterend':
        this.parentNode.insertBefore(n, this.nextSibling);
        break;
    };
    return n;
  };

  HTMLElement.prototype.insertAdjacentText = function(w, t){
    this.insertAdjacentElement(w, document.createTextNode(t || ''));
  };

  HTMLElement.prototype.insertAdjacentHTML = function(w, h)
  {
    var r = document.createRange(); r.selectNode(this);
    this.insertAdjacentElement(w, r.createContextualFragment(h));
  };

})();

function _debug(str){
  var userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('msie') == -1) {
    console.log(str);
  }
}
/**
 * flash playerが存在するか否か
 * バージョンチェックはしない
 * @returns {Boolean}
 */
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

/**
 * ユニコードエスケープ文字列のでコード
 * @param str
 * @returns {String}
 */
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
};

function customWriter(elm){
  return function(){ elm.insertAdjacentHTML('beforeBegin', Array.prototype.join.call(arguments, '')); };
};

function exeScript(element)
{
    // document.write関数を上書き用

    // オリジナルのdocument.writeの退避
    var temp = document.write;
    
    // 指定された要素のscriptオブジェクトの取得
    var i, f, script, scripts = element.getElementsByTagName('script');
    // 上で取得したscriptの実行
    for(i=0,f=scripts.length;i<f;i++)
    {
        script = scripts[i];
        
        if(script.text !== '')
        {
          _debug(script.text);
          document.write = customWriter(script);
          eval(script.text);
        }
    };
    for(i=0,f=scripts.length;i<f;i++)
    {
      script = scripts[i];
      if(script.text === ''){
        var sc = document.createElement('script');
        sc.src = script.src;
        sc.type = script.type;
        element.removeChild(script);
        element.appendChild(sc);
      }
    }
    script = null;
    scripts = null;

    document.write = temp;
};

var FluctApiClient = function(){
  this.adInfo = null;
  this.target = '_top';
};
FluctApiClient.prototype = {
  setTarget: function(_target){
    this.target = _target;
  },
  setAdInfo: function(_adInfo){
    if( _adInfo.status === 'success'){
      this.adInfo = _adInfo;
    }else{
      this.adInfo = null;
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
    if( this.adInfo != null && this.adInfo.sync != ''){
      var sync = this.createImage();
      sync.setAttribute('src',this.fd.sync);
      sync.setAttribute('style', "display:none;position:absolute;border:none;padding:0;margin:0;");
      sync.setAttribute('width',1);
      sync.setAttribute('height',1);
      this.getBody().appendChild(sync);
    }
  },
  renderAll: function(){
    if( this.adInfo == null ){
      return;
    }
    for(var i =0 ; i < this.adInfo.ads.length; i++){
      var ad = this.adInfo.ads[i];
      this._renderAd(ad);
    }
  },
  _renderAd:function(ad){
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
    var tempDiv = document.createElement('div');
    this.getBody().appendChild(tempDiv);
    tempDiv.innerHTML = ad.html;
    exeScript(tempDiv);
    
  },
  _renderFlash: function(ad){
    
    if( fpCheck() ){
      var temp = document.write;
      var tempDiv = document.createElement('div');
      this.getBody().appendChild(tempDiv);
      document.write = customWriter(tempDiv);
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
      document.write = temp;
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
