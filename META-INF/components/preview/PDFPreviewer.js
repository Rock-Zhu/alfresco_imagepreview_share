/**
 * This is the "WebPreviewer" plugin (one of many plugins to "Alfresco.WebPreview")
 * used to display multi paged documents (i.e. text, word or pdf documents) that has a "webpreview" thumbmail,
 * in other words a .swf movie created by the "pdf2swf" utility.
 *
 * Supports the following thumbnails: "webpreview"
 *
 * @param wp {Alfresco.WebPreview} The Alfresco.WebPreview instance that decides which plugin to use
 * @param attributes {Object} Arbitrary attributes brought in from the <plugin> element
 */
Alfresco.WebPreview.prototype.Plugins.PDFPreviewer = function(wp, attributes)
{
   this.wp = wp;
   this.attributes = YAHOO.lang.merge(Alfresco.util.deepCopy(this.attributes), attributes);
   this.swfDiv = null;
   return this;
};

Alfresco.WebPreview.prototype.Plugins.PDFPreviewer.prototype =
{
   /**
    * Attributes
    */
   attributes:
   {
      src: null,
      paging: "false",

      /**
       * Decides if flash previewers shall disable the i18n input fix all browsers.
       * If it shall be disabled for certain a certain os/browser override the disableI18nInputFix() method.
       *
       * Fix solves the Flash i18n input keyCode bug when "wmode" is set to "transparent"
       * http://bugs.adobe.com/jira/browse/FP-479
       * http://issues.alfresco.com/jira/browse/ALF-1351
       *
       * ...see "Browser Testing" on this page to see supported browser/language combinations for AS2 version
       * http://analogcode.com/p/JSTextReader/
       *
       * ... We are using the AS3 version of the same fix
       * http://blog.madebypi.co.uk/2009/04/21/transparent-flash-text-entry/
       *
       * @property disableI18nInputFix
       * @type boolean
       */
      disableI18nInputFix: "false",
      showFullScreenButton: "true",
      showFullWindowButton: "true"
   },

   /**
    * Reference to the div in which the flash movie is placed.
    *
    * @type HTMLElement
    * @private
    */
   swfDiv: null,

   /**
    * Tests if the plugin can be used in the users browser.
    *
    * @method report
    * @return {String} Returns nothing if the plugin may be used, otherwise returns a message containing the reason
    *         it cant be used as a string.
    * @public
    */
   report: function PDFPreviewer_report()
   {
//      if (!Alfresco.util.hasRequiredFlashPlayer(9, 0, 124))
//      {
//         return this.wp.msg("label.noFlash");
//      }
	   return false;
   },

   /**
    * Display the node.
    *
    * @method display
    * @public
    */
   display: function PDFPreviewer_display()
   {
      var ctx = this.resolveUrls();
      this.createSwfDiv();
      
      var conUrl = ctx.url;
      //conUrl = conUrl.substring(0, conUrl.indexOf("imagepreview")) + "filepagenumber";
      conUrl = conUrl.replace("imagepreview", "filepagenumber");
      
      var urls = new Array(ctx.url + "&page=1"); //, ctx.url + "&page=2"
      var imageContainer = new YAHOO.util.Element(document.createElement("div"));
      for(var pageIndex = 0; pageIndex < urls.length; pageIndex++) {
    	  var imageCon = new YAHOO.util.Element(document.createElement("div"));
    	  imageCon.setStyle("margin-top", "24px");
    	  imageCon.set("id", "pageId-" + (pageIndex + 1));
    	  
    	  var imgEl = new YAHOO.util.Element(document.createElement("img"));
    	 // imgEl.set("src", urls[pageIndex]);
    	  imgEl.appendTo(imageCon);
    	  imageCon.appendTo(imageContainer);
    	  
      			}
      
      imageContainer.appendTo(this.swfDiv);
//      imageContainer.setStyle("height", "640px");
//      imageContainer.setStyle("background", "gray");
 //     imageContainer.setStyle("overflow-y", "scroll");
      imageContainer.set("id", "preview_image_container");
      
      var scrollContainer = jQuery('#preview_image_container');
      function getPageNumberSuccess(response) {
  	  		var totalPageNumber = response.json.totalPageNumber;
  	  		var firstImage = jQuery(jQuery('#pageId-1').find('img')[0]);
  	  		var imageW = firstImage.width();
  	  		var imageH = firstImage.height();
  	  		var firstSrc = firstImage.attr('src');
  	  		var resolution = firstSrc.substring(firstSrc.indexOf('&resolution='));
//  	  		var containerWidth = jQuery('#pageId-1').width();
//  	  		var imagePadding = (containerWidth - firstImage.width()) / 2;
		 	for(var index = 1; index < totalPageNumber; index++) {
	 		   //var divContainer = '<div style="height:990px"><img /></div>';
	 		  var divContainer = '<div class="lazyContainer" style="height:' + imageH + 'px;width:' + imageW + 'px"><img class="lazy" data-original="' + ctx.url + '&page=' +  (index + 1) + resolution + '" style="height:' + imageH + 'px;width:' + imageW + 'px" /></div>';
	 		  scrollContainer.append(divContainer);
		 	 }
		 	//it's very important to unbind the scroll for the container, 
		 	//otherwise it will become very slow other several load, this maybe a bug for the lazyload.
		 	scrollContainer.unbind("scrollstop");
     		jQuery("img.lazy").lazyload({
		 		container: scrollContainer,
		 		event : "scrollstop",
		 		threshold : 1600
		 	 });
	   }
      
      function scrollbarWidth() {
    	    var div = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div>');
    	    // Append our div, do our calculation and then remove it
    	    $('body').append(div);
    	    var w1 = $('div', div).innerWidth();
    	    div.css('overflow-y', 'scroll');
    	    var w2 = $('div', div).innerWidth();
    	    $(div).remove();
    	    return (w1 - w2);
      }
      var scrollBar = scrollbarWidth();
      
      jQuery('#pageId-1').find('img').load(function(){
    	  	var self = jQuery(this);
	      var width = self.width();
	      var height = self.height();
	      var parent = jQuery('#pageId-1');
	      parent.css("width", width + "px");
	      parent.css("height", height + "px");
	      parent.css("margin-left", "auto");
	      parent.css("margin-right", "auto");
	      
	      if(width > scrollContainer.width()) {
	    	  var scrollCenter = (width - (scrollContainer.width() - scrollBar)) / 2;
	    	  scrollContainer.animate({ scrollLeft:  scrollCenter});
	      }
	      
	      //scroll bar width is 8 pxiel
//	      var imageLeftPadding = (scrollContainer[0].scrollWidth - width) / 2;
//	      scrollContainer.css("padding-left", imageLeftPadding + "px");
	      Alfresco.util.Ajax.request(
	      		      {
	      		         url: conUrl,// + this.options.siteId + "/invitations",
	      		         method: "GET",
	      		         responseContentType: "application/json",
	      		         successCallback:
	      				{
	      					fn: getPageNumberSuccess
	      				},
	      			});
	      
	      	 });
      
      jQuery('#pageId-1').find('img').attr("src", urls[0] + "&resolution=82");
      

      
      
      var swfId = "PDFPreviewer_" + this.wp.id;
      
      var controlPanel = jQuery('<div class="previewControlPanel" id="controlPanel"><button class="controlButton" id="zoomin_image">+</button><button class="controlButton" id="zoomout_img" disabled>-</button></div>');
      controlPanel.insertBefore('#preview_image_container');

      jQuery('#zoomin_image').click(function(){
    	  $(this).attr("disabled", true);
    	  jQuery('#zoomout_img').attr("disabled", false);
    	  jQuery('img.lazy').parent().remove();
    	  jQuery('#pageId-1').find('img').attr("src", urls[0] + '&resolution=100');
      });
      
      jQuery('#zoomout_img').click(function(){
    	  $(this).attr("disabled", true);
    	  jQuery('#zoomin_image').attr("disabled", false);
    	  var parents = jQuery('img.lazy').parent();
    	  jQuery('img.lazy').remove();
    	  parents.remove();
    	  jQuery('#pageId-1').find('img').attr("src", urls[0] + '&resolution=82');
      });
      

      /**
       * FF3 and SF4 hides the browser cursor if the flashmovie uses a custom cursor
       * when the flash movie is placed/hidden under a div (which is what happens if a dialog
       * is placed on top of the web previewer) so we must turn off custom cursor
       * when the html environment tells us to.
       */
      YAHOO.util.Event.addListener(swfId, "mouseover", function(e)
      {
         var swf = YAHOO.util.Dom.get(swfId);
         if (swf && YAHOO.lang.isFunction(swf.setMode))
         {
            YAHOO.util.Dom.get(swfId).setMode("active");
         }
      });
      YAHOO.util.Event.addListener(swfId, "mouseout", function(e)
      {
         var swf = YAHOO.util.Dom.get(swfId);
         if (swf && YAHOO.lang.isFunction(swf.setMode))
         {
            YAHOO.util.Dom.get(swfId).setMode("inactive");
         }
      });

      // Page unload / unsaved changes behaviour
      YAHOO.util.Event.addListener(window, "resize", function ()
      {
         // Only if not in maximize view
         if (this.swfDiv.getStyle("height") !== "100%")
         {
            this.synchronizeSwfDivPosition();
         }
      }, this, true);

      // Place the real flash preview div on top of the shadow div
      this.synchronizeSwfDivPosition();
      
      
   },

   /**
    * Helper method to get the urls to use depending on the given attributes.
    *
    * @method resolveUrls
    * @return {Object} An object containing urls.
    */
   resolveUrls: function PDFPreviewer_resolveUrls()
   {
	   var thumbnailUrl = this.wp.getThumbnailUrl(this.attributes.src);
	   thumbnailUrl = thumbnailUrl.replace("thumbnails", "imagepreview");
      return {
         url: this.attributes.src ? thumbnailUrl : this.wp.getContentUrl()
      };
   },
   


   /**
    * Called from the WebPreviewer when a log message has been logged.
    *
    * @method onWebPreviewerLogging
    * @param msg {string} The log message
    * @param level {string} The log level
    */
   onWebPreviewerLogging: function WebPreviewer_onWebPreviewerLogging(msg, level)
   {
      if (YAHOO.lang.isFunction(Alfresco.logger[level]))
      {
         Alfresco.logger[level].call(Alfresco.logger, "WebPreviewer: " + msg);
      }
   },

   /**
    * Called from the WebPreviewer when an event or error is dispatched.
    *
    * @method onWebPreviewerEvent
    * @param event {object} an WebPreview message
    */
   onWebPreviewerEvent: function WebPreviewer_onWebPreviewerEvent(event)
   {
      if (event.event)
      {
         if (event.event.type == "onFullWindowClick")
         {
            var clientRegion = YAHOO.util.Dom.getClientRegion();
            this.swfDiv.setStyle("left", clientRegion.left + "px");
            this.swfDiv.setStyle("top", clientRegion.top + "px");
            this.swfDiv.setStyle("width", "100%");
            this.swfDiv.setStyle("height", "100%");
         }
         else if (event.event.type == "onFullWindowEscape")
         {
            this.synchronizeSwfDivPosition();
         }
      }
      else if (event.error)
      {
         // Inform the user about the failure
         var message = "Error";
         if (event.error.code)
         {
            message = this.wp.msg("error." + event.error.code);
         }
         Alfresco.util.PopupManager.displayMessage(
         {
            text: message
         });
      }
   },

   /**
    *
    * Overriding this method to implement a os/browser version dependent version that decides
    * if the i18n fix described for the disableI18nInputFix option shall be disabled or not.
    *
    * @method disableI18nInputFix
    * @return false
    */
   disableI18nInputFix: function WebPreviewer__resolvePreview(event)
   {
      // Override this method if you want to turn off the fix for a specific client
      return this.attributes.disableI18nInputFix;
   },

   /**
    * To support full window mode an extra div (realSwfDivEl) is created with absolute positioning
    * which will have the same position and dimensions as shadowSfwDivEl.
    * The realSwfDivEl element is to make sure the flash move is on top of all other divs and
    * the shadowSfwDivEl element is to make sure the previewer takes the screen real estate it needs.
    *
    * @method createSwfDiv
    */
   createSwfDiv: function WebPreviewer_createSwfDiv()
   {
      if (!this.swfDiv)
      {
         var realSwfDivEl = new YAHOO.util.Element(document.createElement("div"));
         realSwfDivEl.set("id", this.wp.id + "-full-window-div");
         realSwfDivEl.setStyle("position", "absolute");
         realSwfDivEl.addClass("web-preview");
         realSwfDivEl.addClass("real");
         realSwfDivEl.appendTo(document.body);
         this.swfDiv = realSwfDivEl;
      }
   },

   /**
    * Positions the one element over another
    *
    * @method synchronizePosition
    */
   synchronizeSwfDivPosition: function WebPreviewer_synchronizePosition()
   {
//      var sourceYuiEl = new YAHOO.util.Element(this.wp.getPreviewerElement());
//      var region = YAHOO.util.Dom.getRegion(sourceYuiEl.get("id"));
//      var sourceYuiEl = new YAHOO.util.Element(this.wp.getPreviewerElement());
//      sourceYuiEl.setStyle("left", region.left + "px");
//      sourceYuiEl.setStyle("top", region.top + "px");
//      sourceYuiEl.setStyle("width", region.width + "px");
//      sourceYuiEl.setStyle("height", region.height + "px");
      
      var sourceYuiEl = new YAHOO.util.Element(this.wp.getPreviewerElement());
      var region = YAHOO.util.Dom.getRegion(sourceYuiEl.get("id"));
      this.swfDiv.setStyle("left", region.left + "px");
      this.swfDiv.setStyle("top", region.top + "px");
      this.swfDiv.setStyle("width", region.width + "px");
      this.swfDiv.setStyle("height", "670px");
   }

};