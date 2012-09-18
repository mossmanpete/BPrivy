/**
 * @preserve
 * @author Sumeet Singh
 * @mail sumeet@untrix.com
 * Copyright (c) 2012. All Right Reserved, Sumeet S Singh
 */

/* JSLint directives */
/*global $, console, window, BP_MOD_CONNECT, BP_MOD_CS_PLAT, IMPORT, BP_MOD_COMMON,
  BP_MOD_ERROR, BP_MOD_MEMSTORE, BP_MOD_W$, BP_MOD_TRAITS */
 
/*jslint browser:true, devel:true, es5:true, maxlen:150, passfail:false, plusplus:true, regexp:true,
  undef:false, vars:true, white:true, continue: true, nomen:true */

/**
 * @ModuleBegin Panel
 */
var BP_MOD_WDL = (function ()
{
    "use strict";
    var m;
    /** @import-module-begin Common */
    m = BP_MOD_COMMON;
    var MOD_COMMON = IMPORT(m),
        encrypt = IMPORT(m.encrypt),
        decrypt = IMPORT(m.decrypt),
        stopPropagation = IMPORT(m.stopPropagation),
        preventDefault = IMPORT(m.preventDefault),
        newInherited = IMPORT(m.newInherited);
    /** @import-module-begin W$ */
    m = IMPORT(BP_MOD_W$);
    var w$exec = IMPORT(m.w$exec),
        w$defineProto = IMPORT(m.w$defineProto),
        Widget = IMPORT(m.Widget),
        w$undefined = IMPORT(m.w$undefined);
    /** @import-module-begin CSPlatform */
    m = BP_MOD_CS_PLAT;
    var getURL = IMPORT(m.getURL),
        addHandlers = IMPORT(m.addHandlers); // Compatibility function
    /** @import-module-begin Connector */
    m = BP_MOD_CONNECT;
    var newPRecord = IMPORT(m.newPRecord),
        saveRecord = IMPORT(m.saveRecord),
        deleteRecord = IMPORT(m.deleteRecord);
    /** @import-module-begin Error */
    m = BP_MOD_ERROR;
    var BPError = IMPORT(m.BPError);
    /** @import-module-begin */
    m = BP_MOD_TRAITS;
    var MOD_TRAITS = IMPORT(m),
        UI_TRAITS = IMPORT(m.UI_TRAITS),
        fn_userid = IMPORT(m.fn_userid),   // Represents data-type userid
        fn_pass = IMPORT(m.fn_pass),        // Represents data-type password
        dt_eRecord = IMPORT(m.dt_eRecord),
        dt_pRecord = IMPORT(m.dt_pRecord);
        /** @import-module-end **/    m = null;

    /** @globals-begin */
    // Names used in the code. A mapping is being defined here because
    // these names are externally visible and therefore may need to be
    // changed in order to prevent name clashes with other libraries.
    // These are all merely nouns/strings and do not share a common
    // semantic. They are grouped according to semantics.
    // Element ID values. These could clash with other HTML elements
    // Therefore they need to be crafted to be globally unique within the DOM.
    var eid_panel = "com-bprivy-panel"; // Used by panel elements
    var eid_panelTitle ="com-bprivy-panelTitle"; // Used by panel elements
    var eid_panelTitleText = "com-bprivy-TitleText";
    var eid_panelList ="com-bprivy-panelList"; // Used by panel elements
    var eid_ioItem = "com-bprivy-ioItem-";
    var eid_opElement = 'com-bprivy-op-'; // ID prefix of an output line of panel
    var eid_userOElement = "com-bprivy-useridO-"; // ID Prefix used by panel elements
    var eid_passOElement = "com-bprivy-passO-"; // ID Prefix Used by panel elements
    var eid_userIElement = "com-bprivy-useridI-"; // ID Prefix used by panel elements
    var eid_passIElement = "com-bprivy-passI-"; // ID Prefix Used by panel elements
    var eid_inForm = "com-bprivy-iform-";
    var eid_tButton = "com-bprivy-tB-"; // ID prefix for IO toggle button
    var eid_xButton = "com-bprivy-xB"; // ID of the panel close button
    var eid_fButton = "com-bprivy-fB"; // ID of the fill fields button

    // CSS Class Names. Visible as value of 'class' attribute in HTML
    // and used as keys in CSS selectors. These need to be globally
    // unique as well. We need these here in order to ensure they're
    // globally unique and also as a single location to map to CSS files.
    var css_class_li = "com-bprivy-li "; // Space at the end allows concatenation
    var css_class_ioFields = "com-bprivy-io-fieldset ";// Space at the end allows concatenation
    var css_class_field ="com-bprivy-field ";// Space at the end allows concatenation
    var css_class_userIn = "com-bprivy-user-in ";// Space at the end allows concatenation
    var css_class_userOut = "com-bprivy-user-out ";// Space at the end allows concatenation
    var css_class_passIn = "com-bprivy-pass-in ";// Space at the end allows concatenation
    var css_class_passOut = "com-bprivy-pass-out ";// Space at the end allows concatenation
    var css_class_tButton = "com-bprivy-tB ";
    var css_class_nButton = "com-bprivy-nB ";
    var css_class_xButton = "com-bprivy-xB ";

    // These are 'data' attribute names.
    //var prop_value = "bpValue";
    //var prop_fieldName = "bprivy_FN";
    //var prop_peerID = 'bpPID';
    //var prop_panelID = 'bpPanelID';
    //var prop_ctx = 'bpPanelCtx';
    var CT_TEXT_PLAIN = 'text/plain';
    var CT_BP_PREFIX = 'application/x-untrix-';
    var CT_BP_FN = CT_BP_PREFIX + 'fn';
    var CT_BP_PASS = CT_BP_PREFIX + fn_pass;
    var CT_BP_USERID = CT_BP_PREFIX + fn_userid;

    // Other Globals
    var g_win = window;
    var g_doc = g_win.document;
    var g_loc = g_doc.location;
    var g_ioItemID = 0;
    var u_cir_s = '\u24E2';
    var u_cir_S = '\u24C8';
    var u_cir_e = '\u24D4';
    var u_cir_E = '\u24BA';
    var u_cir_F = '\u24BB';
    var u_cir_N = '\u24C3';
    var u_cir_X = '\u24CD';
    /** @globals-end **/
       
    function MiniDB()
    {
        this.init();
    }
    MiniDB.prototype = Object.freeze(
    {
        ingest: function(db, dbInfo)
        {
            if (db) 
            {
                this.empty();
                if (db.pRecsMap) {this.pRecsMap = db.pRecsMap;} 
                if (db.eRecsMapArray) {this.eRecsMapArray = db.eRecsMapArray;}
                if (this.pRecsMap) {this.numUserids = Object.keys(this.pRecsMap).length;}
                else {this.numUserids = 0;}
                if (dbInfo) {
                    if (dbInfo.dbName) {this.dbName = dbInfo.dbName;}
                    if (dbInfo.dbPath) {this.dbPath = dbInfo.dbPath;}
                }
                this.preventEdits();
            }
            else
            { 
                this.init();
            }
        },
        init: function ()
        {
            this.empty();
            this.preventEdits();
        },
        empty: function ()
        {
            BP_MOD_COMMON.clear(this);
            this.eRecsMapArray = BP_MOD_COMMON.EMPTY_ARRAY;
            this.pRecsMap = BP_MOD_COMMON.EMPTY_OBJECT;
            this.numUserids = 0;
        },
        preventEdits: function ()
        {
            Object.defineProperties(this,
            {
                eRecsMapArray: {configurable:true, enumerable:true},
                pRecsMap: {configurable:true, enumerable:true},
                dbName: {configurable:true, enumerable:true},
                dbPath: {configurable:true, enumerable:true}
            });
        }
    });
    
    function image_wdt(ctx)
    {
        var imgPath = ctx.imgPath;
        return {
            tag:"img", 
            attrs:{ src:getURL(imgPath) }
        };
    }
    
    function cs_panelTitleText_wdt (ctx)
    {
        // uses ctx.dbName and ctx.dbPath
        return {
            tag:"div",
            attr:{ id: eid_panelTitleText, title:ctx.dbPath },
            text:ctx.dbName || "No wallet open"
        };
    }

    /**
     * New Item button 
     */
    function NButton () {}
    NButton.prototype = w$defineProto(NButton,
    {
        newItem: {value: function ()
        {
            this.panel.itemList.newItem();
        }}
    });
    NButton.wdt = function (w$ctx)
    {
        return {
        cons: NButton,
        html:'<button type="button"></button>', 
        attr:{ class:css_class_nButton},
        on:{ click:NButton.prototype.newItem },
        css:{ width:'20px', float:'left' },
            children:[
            {tag:"i",
            css:{ 'vertical-align':'middle' },
            addClass:'icon-plus'
            }],
        _iface:{ w$ctx:{ panel:'panel' } }
        };
    };
    
    /**
     * Settings/Options page link 
     */
    function SButton(){}
    SButton.wdt = function (w$ctx)
    {
        return {
        tag: 'a',
        attr:{ class:css_class_xButton, href:BP_MOD_CS_PLAT.getURL("/bp_manage.html"), target:"_blank" },
        css:{ width:'20px' },
            children:[
            {tag:"i",
            css:{ 'vertical-align':'middle', cursor:'auto' },
            addClass:'icon-cog'
            }]
        };
    };
    
    /**
     * Panel Dismiss/Close button - 'x' button 
     */
    function XButton () {}
    XButton.wdt = function (w$ctx)
    {
        // make sure panel is captured into private closure, so we won't lose it.
        // values inside ctx will get changed as other wdls and wdts are executed.
        var panel = w$ctx.panel;

        return {
        cons: XButton,
        html:'<button type="button"></button>',
        css:{ float:'right' },
        //attr:{ /*class:css_class_xButton,*/},
        //text:u_cir_X,
        on:{ click:XButton.prototype.x },
        iface:{ panel:panel },
            children:[
            {tag:"i",
            css:{ 'vertical-align':'middle' },
            addClass:'icon-remove'
            }]
        };
    };
    XButton.prototype = w$defineProto (XButton,
    {
        x: {value: function click (e)
        {
            if (this.panel) {               
                e.stopPropagation(); // We don't want the enclosing web-page to interefere
                e.preventDefault(); // Causes event to get cancelled if cancellable
                this.panel.close();
                return false; // Causes the event to be cancelled (except mouseover event).
            }
        }}
    });

    /**
     * AutoFill button 
     */
    function FButton(){}
    FButton.prototype =  w$defineProto(FButton,
    {
        onClick: {value: function(ev)
        {
            if (!this.ioItem.bInp) {
                this._autoFill(this.ioItem.oItem.u.value, this.ioItem.oItem.p.value);
            }
            else {
                this._autoFill(this.ioItem.iItem.u.value, this.ioItem.iItem.p.value);
            }
        }}
    });
    FButton.wdt = function(w$ctx)
    {
        var autoFill = w$ctx.autoFill;
        return {
        cons: FButton,
        html:'<button type="button"></button>',
        attr:{class:css_class_tButton, title:'auto fill' },
        ctx:{ w$:{ fButton:"w$el" } },
        on:{ click:FButton.prototype.onClick },
        css:{ width:'20px' },
        iface:{ ioItem:w$ctx.ioItem, _autoFill:autoFill },
            children:[
            {tag:"i",
            css:{ 'vertical-align':'middle' },
            addClass:"icon-arrow-left"
            }]
        };
    };   
    
    function DButton () {}
    DButton.wdt = function(w$ctx)
    {
        var ioItem = w$ctx.ioItem;
        return {
        cons: DButton,
        html:'<button type="button"></button>',
        css:{ float:'right', width:'20px' },
        on:{ click:DButton.prototype.onClick },
        _iface:{ ioItem:ioItem },
            children:[
            {tag:"i",
            css:{ 'vertical-align':'middle' },
            addClass:"icon-trash",
            }]
        };
    };
    DButton.prototype = w$defineProto(DButton,
    {
        onClick: {value: function(ev)
        {
            this.ioItem.destroy();
        }}
    });
        
    function isValidInput(str) {return Boolean(str);}
    
    function TButton () {}
    TButton.wdt = function (w$ctx)
    {
        var bInp = w$ctx.io_bInp;
        return {
         cons: TButton,
         html:'<button type="button">',
         attr:{ class:css_class_tButton, /*id:eid_tButton+w$i*/ },
         on:{ click:TButton.prototype.toggleIO2 },
         css:{ width:'20px' },
            children:[
            {tag:"i",
            css:{ 'vertical-align':'middle' },
            addClass:bInp? "icon-eye-close" :"icon-eye-open",
            ctx:{ w$:{icon:'w$el'} }
            }],
         _iface:{ w$ctx:{ ioItem:"ioItem", icon:'icon' } }
        };
    };
    TButton.prototype = w$defineProto(TButton,
    {
        toggleIO2: {value: function (ev) 
        {
            var bInp = this.ioItem.toggleIO();
            if (bInp) {
                this.icon.removeClass('icon-eye-open');
                this.icon.addClass('icon-eye-close');
            }
            else {
                this.icon.removeClass('icon-eye-close');
                this.icon.addClass('icon-eye-open');                    
            }
        }}
    });
    
    function IItemP () {}
    IItemP.wdt = function (w$ctx)
    {
        var u, p, 
        ioItem = w$ctx.ioItem,
        pRec = ioItem.rec;
        
        if (pRec)
        {
            u = pRec.u;
            p = pRec.p;
        }
        else { // create a new pRec and save it back to ioItem.
            pRec = newPRecord(ioItem.loc);
            ioItem.rec = pRec; // Save this back to ioItem.
        }
        return {
        cons: IItemP,
        tag:'div', addClass:css_class_ioFields,
        ctx:{ w$:{iItem:'w$el'} },
        //on:{ 'submit':ioItem.toggleIO },
        iface:{ ioItem:ioItem },
            children: [
            {tag:'input',
             attr:{ type:'text', value:u, placeholder:'Username' },
             prop:{ disabled:u?true:false },
             addClass:css_class_field+css_class_userIn,
             ctx:{ w$:{ u:'w$el' } },
             _iface:{ value: u } 
            },
            {tag:'input',
             attr:{ type:'text', value:p, placeholder:'Password' },
             addClass:css_class_field+css_class_passIn,
             ctx:{ w$:{p:'w$el'} },
             _iface:{ value: p },
             }
            ],
        _iface:{ w$ctx:{ u:'u', p:'p' } },
        //_final:{show:true}
        };
    };
    IItemP.prototype = w$defineProto (IItemP,
    {
        checkInput: {value: function() 
        {
            var ioItem = this.ioItem,
                nU = this.u.el.value,
                oU = ioItem.rec? ioItem.rec.u: undefined,
                nP = encrypt(this.p.el.value),
                oP = ioItem.rec? ioItem.rec.p: undefined;
            
            if (!isValidInput(nU) || !isValidInput(nP)) {
                return false; // inputs are invalid
            }
            
            if ((nU !== oU) || (nP !== oP)) {
                return true; // inputs are valid and different
            }
            // else return undefined; inputs are valid but same.
        }},
        saveInput: {value: function(callback)
        {
            var ioItem = this.ioItem,
                nU = this.u.el.value,
                oU = ioItem.rec? ioItem.rec.u: undefined,
                nP = encrypt(this.p.el.value),
                oP = ioItem.rec? ioItem.rec.p: undefined;

            // save to db
            var pRec = newPRecord(ioItem.loc, Date.now(), nU, nP);
            saveRecord(pRec, dt_pRecord, callback);
            //ioItem.rec = pRec;
            if (oU && (nU !== oU)) {
                this.deleteRecord(dt_pRecord, oU); // TODO: Needs URL
            }                
        }},
        deleteRecord: {value: function(dt, key)
        {
            if (dt === dt_pRecord) {
                deleteRecord({loc:this.ioItem.loc, u:key});
            }
        }}
    });
    
    function OItemP () {}
    OItemP.wdt = function (w$ctx)
    {
        var u, p, 
            autoFill = w$ctx.autoFill,
            ioItem = w$ctx.ioItem,
            pRec = (ioItem && ioItem.rec) ? ioItem.rec:undefined;
        if (pRec) {
            u = pRec.u;
            p = pRec.p;

            return {
            cons: OItemP,
            tag:'div', 
            addClass:css_class_ioFields,
            ctx:{ w$:{ oItem:'w$el' } },
                children:[
                //autoFill ? FButton.wdt : w$undefined,
                {tag:'span',
                 attr:{ draggable:true },
                 addClass:css_class_field+css_class_userOut,
                 text:u,
                 ctx:{ w$:{ u:'w$el' } },
                 _iface:{ fn:fn_userid, value:u }
                },
                {tag:'span',
                 attr:{ draggable:true },
                 addClass:css_class_field+css_class_passOut,
                 text:'*****',
                 ctx:{ w$:{p:'w$el' } },
                 _iface:{ fn:fn_pass, value:p }
                }],
            _iface:{ ioItem:ioItem, w$ctx:{ u:'u', p:'p' } },
            //_final:{show:true}
            };
        }
    };
    OItemP.prototype = w$defineProto (OItemP, {});
    
    function IoItem () {}
    IoItem.wdi = function (w$ctx)
    {
        var acns=w$ctx.w$rec,
            rec = acns? acns.curr: undefined,
            loc = w$ctx.loc,
            panel = w$ctx.panel,
            bInp = w$ctx.io_bInp,
            autoFill = panel.autoFill;
        return {
        cons: IoItem,
        tag:'div', 
        attr:{ class:css_class_li },
        ctx:{ w$:{ ioItem:'w$el' }, trash:IoItem.prototype.toggleIO },
        iface: { acns:acns, rec:rec, loc:loc, panel:panel, bInp:bInp },
        on: {mousedown:stopPropagation},
            children:[
            autoFill ? FButton.wdt : w$undefined,
            TButton.wdt,
            bInp ? IItemP.wdt : OItemP.wdt,
            DButton.wdt
            ],
         // save references to relevant objects.
         _iface:{ w$ctx:{oItem:"oItem", iItem:"iItem"} }
        };
    };
    IoItem.prototype = w$defineProto(IoItem, // same syntax as Object.defineProperties
    {
        toggleIO: {value: function() 
        {
            var iI = this.iItem, 
                oI = this.oItem,
                ctx={ioItem:this, autoFill:this.panel.autoFill},
                res,
                self = this;
            if (iI)
            { // Create output element
                res = iI.checkInput();
                if (res===undefined) 
                {
                    this.oItem = w$exec(OItemP.wdt, ctx);
                    MOD_COMMON.delProps(ctx); // Clear DOM refs inside the ctx to aid GC
                    if (this.oItem) {
                        delete this.iItem; 
                        iI.destroy();
                        this.append(this.oItem);
                        this.bInp = false;
                    }
                }
                else if (res === true) 
                {
                    iI.saveInput(function(resp)
                    {
                        if (resp.result===true) {
                            self.panel.reload();
                        }
                        else {
                            BP_MOD_ERROR.warn(resp.err);
                            self.panel.reload();
                        }
                    });
                }
            }
            else if (oI)
            { // Create input element, destroy output element
                this.iItem = w$exec(IItemP.wdt, ctx);
                MOD_COMMON.delProps(ctx); // Clear DOM refs inside the ctx to aid GC
                if (this.iItem) {
                    delete this.oItem; oI.destroy();
                    this.append(this.iItem);
                    this.bInp = true;
                }
            }
            
            return Boolean(this.iItem);
        }}
    });
    
    function PanelList () {}
    PanelList.wdt = function (ctx)
    {
        var loc = ctx.loc || g_loc,
            panel = ctx.panel,
            it = ctx.it;
        return {
        cons: PanelList,
        tag:'div', attr:{ id:eid_panelList },
        onTarget:{ dragstart:PanelList.prototype.handleDragStart,
        drag:PanelList.prototype.handleDrag, 
        dragend:PanelList.prototype.handleDragEnd },
        ctx:{ io_bInp:false, w$:{ itemList:'w$el' } },
        iface:{ loc:loc, panel:panel },
             iterate:{ it:it, wdi:IoItem.wdi }
        };
    };
    PanelList.prototype = w$defineProto(PanelList,
    {
        handleDragStart: {value: function handleDragStart (e)
        {   // CAUTION: 'this' is bound to e.target
            
            //console.info("DragStartHandler entered");
            e.dataTransfer.effectAllowed = "copy";
            var data = this.value;
            if (this.fn === fn_pass) {
                data = decrypt(this.value);
            }
            
            e.dataTransfer.items.add('', CT_BP_PREFIX + this.fn); // Keep this on top for quick matching later
            e.dataTransfer.items.add(this.fn, CT_BP_FN); // Keep this second for quick matching later
            e.dataTransfer.items.add(data, CT_TEXT_PLAIN); // Keep this last
            e.dataTransfer.setDragImage(w$exec(image_wdt,{imgPath:"/icons/icon16.png"}).el, 0, 0);
            e.stopImmediatePropagation(); // We don't want the enclosing web-page to interefere
            //console.log("handleDragStart:dataTransfer.getData("+CT_BP_FN+")="+e.dataTransfer.getData(CT_BP_FN));
            //return true;
        }},
        handleDrag: {value: function handleDrag(e)
        {   // CAUTION: 'this' is bound to e.target
            //console.info("handleDrag invoked. effectAllowed/dropEffect =" + e.dataTransfer.effectAllowed + '/' + e.dataTransfer.dropEffect);
            //if (e.dataTransfer.effectAllowed !== 'copy') {e.preventDefault();} // Someone has intercepted our drag operation.
            e.stopImmediatePropagation();
        }},
        handleDragEnd: {value: function handleDragEnd(e)
        {   // CAUTION: 'this' is bound to e.target
            //console.info("DragEnd received ! effectAllowed/dropEffect = "+ e.dataTransfer.effectAllowed + '/' + e.dataTransfer.dropEffect);
            e.stopImmediatePropagation(); // We don't want the enclosing web-page to interefere
            //return true;
        }},
        newItem: {value: function()
        {
            if (!this.newItemCreated) {
                w$exec(IoItem.wdi, {io_bInp:true, loc:this.loc, panel:this.panel }).appendTo(this);
                this.newItemCreated = true;    
            }
            
        }}
    });
    
    function Panel () {}
    Panel.wdt = function(ctx) 
    {
        var loc = ctx.loc || g_loc,
            reload = ctx.reload,
            autoFill = ctx.autoFill,
            onClosed = ctx.onClosed;
        return {
        cons:Panel, // static prototype object.
        tag:"div",
        attr:{ id:eid_panel },
        css:{ position:'fixed', top:'0px', 'right':"0px" },
        // Post w$el creation steps
        ctx:{ w$:{ panel:"w$el" }, loc:loc },
        iface:{ _reload:reload, id:eid_panel, autoFill:autoFill, onClosed:onClosed },

            // Create children
            children:[
            {tag:"div", attr:{ id:eid_panelTitle },
                children:[
                (UI_TRAITS.getTraits(dt_pRecord).showRecs(loc)&&ctx.dbName)?NButton.wdt: w$undefined,
                cs_panelTitleText_wdt,
                XButton.wdt,
                SButton.wdt
                // ctx.dbName? CButton.wdt: w$undefined,
                ]
            },
            UI_TRAITS.getTraits(dt_pRecord).showRecs(loc)? PanelList.wdt : w$undefined],

        // Post processing steps
        _iface:{ w$:{}, w$ctx:{itemList:'itemList'} },
        _final:{ 
            appendTo:document.body, 
            show:true
            ,exec:Panel.prototype.makeDraggable 
            }
        };
    };
    w$defineProto( Panel, // same syntax as Object.defineProperties
    {
        makeDraggable: {value: function(ctx, w$)
        {
            // Make sure that postion:fixed is supplied at element level otherwise draggable() overrides it
            // by setting position:relative. Also we can use right:0px here because draggable() does not like it.
            // Hence we need to calculate the left value :(  
            // var panelW = this.$el.outerWidth() || 300;
            // var winW = g_doc.body.clientWidth || $(g_doc.body).innerWidth();
            // var left = (winW-panelW);
            // left = (left>0)? left: 0;
            // this.$el.css({position: 'fixed', top: '0px', 'left': left + "px"});               
            $(this.el).draggable();
        }},
        reload: {value: function() 
        {
            var _reload = this._reload; // save the func because destroy will delete it from this
            this.close();//panel should be destroyed before a new one is created.
            _reload();
        }},
        close: {value: function()
        {
            var _onClosed = this.onClosed;
            this.destroy();
            _onClosed();
        }},
        tempRecord: {value: function(u, p) // TODO
        {
            
        }},
        editRecord: {value: function(u, p){}} // TODO
    });
      
    var iface = 
    {
       MiniDB: MiniDB,
       cs_panel_wdt: Panel.wdt,
       CT_BP_FN: CT_BP_FN,
       CT_TEXT_PLAIN: CT_TEXT_PLAIN,
       CT_BP_PREFIX: CT_BP_PREFIX,
       CT_BP_USERID: CT_BP_USERID,
       CT_BP_PASS: CT_BP_PASS,
       image_wdt: image_wdt
    };
    
    console.log("loaded wdl");
    return Object.freeze(iface);
}());