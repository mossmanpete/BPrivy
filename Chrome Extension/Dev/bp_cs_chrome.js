/**
 * @preserve
 * @author Sumeet Singh
 * @mail sumeet@untrix.com
 * @copyright Copyright (c) 2012. All Rights Reserved, Sumeet S Singh
 */

/* JSLint directives */
/*global chrome, $ */
/*jslint browser:true, devel:true, es5:true, maxlen:150, passfail:false, plusplus:true, regexp:true,
  undef:false, vars:true, white:true, continue: true, nomen:true */

//////////////// MAKE SURE THERE IS NO DEPENDENCY ON ANY OTHER MODULE ////////////////////
/**
 * @ModuleBegin GoogleChrome Platform
 */
function BP_GET_CS_PLAT(g)
{
    "use strict";
    var window = g.g_win, document = g.g_win.document, console = g.g_console,
        g_win = g.g_win,
        g_doc = g_win.document;
    var g_bTopLevel = (g_win.top === g_win.self), 
        g_frameUrl = g_bTopLevel ? null : g_win.location.href;
        
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
                else if (rsp.result===false) {
                    console.log(rsp.err);
                }
            }
            chrome.extension.sendRequest(o, rcvAck);
        },
        
        rpcToMothership: function (req, respCallback)
        {
            chrome.extension.sendRequest(req, function (resp)
            {
                respCallback(resp); // respCallback exists in function closure
            });
        },
        
        registerMsgListener: function(foo)
        {
            chrome.extension.onMessage.addListener(function(req, sender, callback)
            {
                if (req.frameUrl)
                { 
                    if (g_frameUrl !== req.frameUrl)
                    {
                        return;
                    }
                }
                else // frame url not provided
                {
                    var tag = g_doc.activeElement.localName;
                    if (g_doc.hasFocus())
                    {
                        if (tag==='iframe')
                        {
                            return;
                        }
                    }
                    else // document not focussed
                    {
                        if (!g_bTopLevel)
                        {
                            return;
                        }
                    }
                }
                
                //console.log("MsgListener@bp_cs_chrome: Handling received message in document " + g_doc.location.href);
                foo(req, sender, callback);
            });
        },
        
        getURL: function(path)
        {
            var url = chrome.extension.getURL(path);
            return url;
            //return "chrome-extension://" + BP_MOD_DEV.chrome_extension_id + "/" + path;
        },
        
        /*getAbsPath: function(path)
        {
            // get url and then remove the leading file:///
            return chrome.extension.getURL(path).slice(8);
        },*/
        
        getBackgroundPage: function ()
        {
            return chrome.extension.getBackgroundPage();
        },

        addEventListener: function(el, ev, fn)
        {
            el.addEventListener(ev, fn);
        },
        
        addEventListeners: function(selector, ev, fn)
        {
            var j = $(selector), i = j.length;
            for (--i; i>=0; --i) {
                var el = j[i];
                if (el) {el.addEventListener(ev, fn);}               
            }
        },
        
        addHandlers: function (el, on) 
        {
            if (!el || !on || (typeof on !== 'object')) {return;}
            
            var ks = Object.keys(on), k, i, n;
            for (i=0, n=ks.length, k=ks[0]; i<n ; k=ks[++i])
            {
                el.addEventListener(k, on[k]);
            }
        },
        
        trigger: function (el, eventType, eventInterface)
        {
            var ev = g_doc.createEvent(eventInterface || 'HTMLEvents');
            ev.initEvent(eventType, true, true);
            el.dispatchEvent(ev);
        }
    };
    
    console.log("constructed mod_cs_plat");    
    return module;
}