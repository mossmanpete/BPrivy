/**
 * @preserve
 * @author Sumeet Singh
 * @mail sumeet@untrix.com
 * @copyright Copyright (c) 2012. All Right Reserved, Sumeet S Singh
 */

/* JSLint directives */
/*global chrome */
/*jslint browser:true, devel:true, es5:true, maxlen:150, passfail:false, plusplus:true, regexp:true,
  undef:false, vars:true, white:true, continue: true, nomen:true */

/**
 * @ModuleBegin GoogleChrome Platform
 */
var BP_MOD_CS_PLAT = (function() 
{
    "use strict"; //TODO: Remove this from prod. build
    
    var module =
    {
        postMsgToMothership: function (o)
        {
            function rcvAck (rsp) 
            {
                if (!rsp) {if (chrome.extension.lastError) {
                       console.log(chrome.extension.lastError.message);
                    }
                }
            }
            chrome.extension.sendRequest(o, rcvAck);
        },
        
        rpcToMothership: function (req, respCallback)
        {
            chrome.extension.sendRequest(req, respCallback);
        },
        
        registerMsgListener: function(foo)
        {
            chrome.extension.onRequest.addListener(foo);
        },
        
        getURL: function(path)
        {
            return chrome.extension.getURL(path);
        },
        
        addEventListener: function(el, ev, fn)
        {
            el.addEventListener(ev, fn);
        }
    };
    
    return module;
}());