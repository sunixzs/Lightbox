(function (window) {
    'use strict';

    function Lightbox(params) {
        var self = this;

        this.dragdealer = null;
        this.settings = {
            items: [], // items to show in lightbox. Each item must have target and mode defined. A title and parameter (post-parameters) could be defined.
            itemsKey: 0, // Current position in items. The current visible screen.
            container: document.querySelector("body"), // main container to add the lightbox
            backgroundHtml: '<div class="lightbox-background lightbox-opacity-animation"></div>', // HTML used for the lightbox background
            closeHtml: '<div class="lightbox-close lightbox-opacity-animation"></div>', // HTML used for the close button
            contentContainerHtml: '<div class="lightbox-content-container lightbox-opacity-animation"></div>', // HTML used for the element with the content in
            multipleItemsClass: 'multiple-items', // CSS-class, which will be set on the previous container-element and the info-element, if there are multiple items.
            multipleItemsContainerHtml: '<div></div>', // HTML used for the inner container, if there is more than one item.
            multipleItemsContainerClass: 'lightbox-multiple-items-container', // CSS-class for the container above. Also used for Dragdealer as slide.
            contentHtml: '<div class="lightbox-content"></div>', // HTML used for each item as wrap
            contentClassIos: 'ios', // additional CSS-class for iframe-content-elements, if iOS was detected (for scrolling/touchmove purpose)
            contentClassIframe: 'lightbox-content-iframe', // additional CSS-class for content-elements in iframe-mode
            contentClassImage: 'lightbox-content-image', // additional CSS-class for content-elements in image-mode
            contentClassGet: 'lightbox-content-ajax lightbox-content-get', // additional CSS-classes for content-elements in ajax-get-mode
            contentClassPost: 'lightbox-content-ajax lightbox-content-post', // additional CSS-class for content-elements in ajax-post-mode
            executeAjaxScript: true,
            iframeClass: 'lightbox-iframe', // CSS-class for the iframe-element in the content-element in iframe-mode
            iframeTransparencyMode: true, // if true, the iframe gets an transparency-attribute.
            htmlActiveClass: 'lightbox-active', // CSS-class to be set/removed, if the lightbox is active/inactive
            previousHtml: '<div class="lightbox-previous lightbox-opacity-animation"></div>', // HTML used for the previous-button-element
            nextHtml: '<div class="lightbox-next lightbox-opacity-animation"></div>', // HTML used for the next-button-element
            infoHtml: '<div class="lightbox-info lightbox-opacity-animation"></div>', // HTML used for the info-area
            loadingHtml: '<div class="lightbox-loading lightbox-opacity-animation"><i class="fa fa-spinner fa-spin fa-fw"></i></div>', // HTML used for the spinner
            closeOnBackgroundClick: true, // if true, the lightbox will be closed if the background was clicked
            imageLoadTimeout: 10, // sends an image should be loaded before timeout
            pathToRequirejsDragdealer: 'dragdealer.min' // we use requirejs to load Dragdealer if needed, if there are multiple items. This is the part in the requirejs-array. Leave empty, if Dragdealer is allready loaded.
        };

        /**
         * If there are some params, set them.
         */
        if (typeof params === "object") {
            for (var key in params) {
                if (params.hasOwnProperty(key) && typeof this.settings[key] !== "undefined") {
                    this.settings[key] = params[key];
                }
            }
        }

        /**
         * Some of the main HTML-elements we use in this script.
         */
        this.backgroundElement = null;
        this.closeElement = null;
        this.contentContainerElement = null;
        this.infoElement = null;
        this.previousElement = null;
        this.nextElement = null;

        /**
         * Helper-class to handle HTML-elements.
         * @param {string} html 
         */
        var Element = function (html) {
            var selfElem = this;
            this.isVisible = true;
            this.html = html.trim();
            this.element = null;

            this.get = function () {
                if (this.element === null || typeof this.element !== "object") {
                    if ("content" in document.createElement('template')) {
                        var template = document.createElement('template'); // create dom-element from html-string by using html5 template-element
                        template.innerHTML = this.html;
                        this.element = template.content.firstChild;
                    } else {
                        var div = document.createElement('div'); // we only can create elements which are valid as a direct child in a div
                        div.innerHTML = this.html;
                        this.element = div.firstChild;
                    }
                }
                return this.element;
            };

            this.show = function () {
                if (this.isVisible === false) {
                    this.get().style.opacity = 1;
                    this.isVisible = true;
                }
                return this;
            };

            this.hide = function () {
                if (this.isVisible === true && this.get()) {
                    this.get().style.opacity = 0;
                    this.isVisible = false;
                }
                return this;
            }

            this.remove = function () {
                if (this.get() && this.get().parentNode) {
                    this.get().parentNode.removeChild(this.get());
                }
                return this;
            }

            this.hideAndRemove = function (cb) {
                this.hide();
                window.setTimeout(function () {
                    selfElem.remove();
                    if (typeof cb === "function") {
                        cb();
                    }
                }, 300);
                return this;
            }

            this.addClass = function (c) {
                if (!this.get()) {
                    return this;
                }
                if (c.trim().indexOf(" ") >= 0) {
                    var cc = c.split(" ");
                    for (var i = 0; i < cc.length; i++) {
                        if (cc[i].trim()) {
                            this.get().classList.add(cc[i].trim());
                        }
                    }
                } else {
                    this.get().classList.add(c.trim());
                }
                return this;
            };

            this.removeClass = function (c) {
                if (!this.get()) {
                    return this;
                }
                if (c.trim().indexOf(" ") >= 0) {
                    var cc = c.split(" ");
                    for (var i = 0; i < cc.length; i++) {
                        if (cc[i].trim()) {
                            this.get().classList.remove(cc[i]);
                        }
                    }
                } else {
                    this.get().classList.remove(c.trim());
                }
                return this;
            };

            this.preventTouchmove = function () {
                self.event.addEvent(this.get(), "touchmove", self.event.preventDefault);
            };
            return this;
        };

        /**
         * Public method to set a param in settings.
         * @param {string} key 
         * @param {mixed} value 
         */
        this.set = function (key, value) {
            if (typeof this.settings[key] !== "undefined") {
                this.settings[key] = value;
            }
            return this;
        };

        /**
         * Public method to add one item.
         * @param {object} params 
         */
        this.addItem = function (params) {
            if (typeof params.target !== "string") {
                return null;
            }

            this.settings.items.push({
                target: params.target,
                mode: params.mode || "iframe",
                title: params.title || "",
                data: params.data || null,
                callback: params.callback || null
            });

            return this;
        }

        /**
         * event wrapper
         */
        this.event = {
            addEvent: function (elem, event, fn) {
                elem.addEventListener(event, fn, false);
            },
            removeEvent: function (elem, event, fn) {
                elem.removeEventListener(event, fn, false);
            },
            preventDefault: function (evt) {
                evt.preventDefault();
            },
            itemCallback: function (item) {
                if (item.callback && typeof item.callback === "function") {
                    item.callback(item, self);
                }
            }
        };

        /**
         * Finds and evals javascript in html string
         * @param {string} html 
         */
        this.executeScript = function (html) {
            var scripts = [];

            while (html.indexOf("<script") > -1 || html.indexOf("</script") > -1) {
                var start_a = html.indexOf("<script");
                var start_o = html.indexOf(">", start_a);
                var end_a = html.indexOf("</script", start_a);
                var end_o = html.indexOf(">", end_a);
                scripts.push(html.substring(start_o + 1, end_a));

                // remove from html-string
                html = html.substring(0, start_a) + html.substring(end_o + 1);
            }

            for (var i = 0; i < scripts.length; i++) {
                try {
                    eval(scripts[i]);
                } catch (e) {
                    console.log(e);
                }
            }
        };

        /**
         * Method to open the lightbox after items or one item is defined.
         */
        this.open = function () {
            if (typeof this.settings.items[this.settings.itemsKey] !== "object") {
                console.log("Error in Lightbox: No items defined!");
                return null;
            }

            // create background
            this.backgroundElement = new Element(this.settings.backgroundHtml);
            this.backgroundElement.hide();
            this.backgroundElement.preventTouchmove();
            this.settings.container.appendChild(this.backgroundElement.get());
            this.backgroundElement.show();

            if (this.settings.closeOnBackgroundClick === true) {
                this.event.addEvent(this.backgroundElement.get(), "click", function () {
                    self.close();
                });
            }

            // create close button
            this.closeElement = new Element(this.settings.closeHtml);
            this.closeElement.preventTouchmove();
            this.closeElement.hide();
            this.settings.container.appendChild(this.closeElement.get());
            this.closeElement.show();
            this.event.addEvent(this.closeElement.get(), "click", function () {
                self.close();
            });

            // create container for all contents
            this.contentContainerElement = new Element(this.settings.contentContainerHtml);
            this.settings.container.appendChild(this.contentContainerElement.get());

            // add special method to add automatically content to the container in relation to one item at all or multiple items.
            this.contentContainerElement.multipleItemsContainer = null;
            this.contentContainerElement.addContentElement = function (ceToAdd) {
                if (self.settings.items.length > 1) {
                    if (this.multipleItemsContainer === null) {
                        this.multipleItemsContainer = new Element(self.settings.multipleItemsContainerHtml);
                        this.multipleItemsContainer.addClass(self.settings.multipleItemsContainerClass);
                        this.multipleItemsContainer.get().style.width = self.settings.items.length * 100 + "%";
                        this.get().appendChild(this.multipleItemsContainer.get());
                    }
                    ceToAdd.style.width = 100 / self.settings.items.length + "%";
                    this.multipleItemsContainer.get().appendChild(ceToAdd);
                } else {
                    this.get().appendChild(ceToAdd);
                }
            };

            // create info area
            this.infoElement = new Element(this.settings.infoHtml);
            this.infoElement.preventTouchmove();
            this.settings.container.appendChild(this.infoElement.get());

            // do some more, if there is more than one item
            if (this.settings.items.length > 1) {
                // create previous button
                this.previousElement = new Element(this.settings.previousHtml);
                this.previousElement.preventTouchmove();
                this.event.addEvent(this.previousElement.get(), "click", function () {
                    self.showPreviousItem();
                });
                this.settings.container.appendChild(this.previousElement.get());

                // create next button
                this.nextElement = new Element(this.settings.nextHtml);
                this.nextElement.preventTouchmove();
                this.event.addEvent(this.nextElement.get(), "click", function () {
                    self.showNextItem();
                });
                this.settings.container.appendChild(this.nextElement.get());

                // add multiple-items-class to container- and info-element
                this.infoElement.addClass(this.settings.multipleItemsClass);
                this.contentContainerElement.addClass(this.settings.multipleItemsClass);
                for (var e = 0; e < this.settings.items.length; e++) {
                    this.addContent(this.settings.items[e]);
                }

                // load and init Dragdealer
                var dragdealerConfiguration = {
                    steps: self.settings.items.length,
                    speed: 0.3,
                    loose: true,
                    requestAnimationFrame: true,
                    handleClass: self.settings.multipleItemsContainerClass,
                    callback: function () {
                        var s = self.dragdealer.getStep()[0];
                        self.settings.itemsKey = s;
                        self.infoElement.get().innerHTML = self.settings.items[s - 1].title ? s + "/" + self.settings.items.length + " - " + self.settings.items[s - 1].title : s + "/" + self.settings.items.length;
                    }
                };
                if (this.settings.pathToRequirejsDragdealer) {
                    require([this.settings.pathToRequirejsDragdealer], function (Dragdealer) {
                        self.dragdealer = new Dragdealer(self.contentContainerElement.get(), dragdealerConfiguration);
                        self.dragdealer.setStep(self.settings.itemsKey + 1);
                    });
                } else {
                    self.dragdealer = new Dragdealer(self.contentContainerElement.get(), dragdealerConfiguration);
                    self.dragdealer.setStep(self.settings.itemsKey + 1);
                }
            } else {
                this.addContent(this.settings.items[this.settings.itemsKey]);
            }

            // prevent scrolling the page
            document.querySelector("html").classList.add(this.settings.htmlActiveClass);

            return this;
        };

        /**
         * Just a helper-method to add several types of content to the content-container.
         * @param {object} item 
         */
        this.addContent = function (item) {
            switch (item.mode) {
                case "iframe":
                    this.addContentIframe(item);
                    break;
                case "get":
                    this.addContentAjax(item, "get");
                    break;
                case "post":
                    this.addContentAjax(item, "post");
                    break;
                case "image":
                    this.addContentImage(item);
                    break;
            }
        };

        /**
         * Adds an iframe to the content-container.
         * @param {object} item 
         */
        this.addContentIframe = function (item) {
            item.contentElement = new Element(this.settings.contentHtml);
            item.contentElement.addClass(this.settings.contentClassIframe);
            this.contentContainerElement.addContentElement(item.contentElement.get());

            item.loadingElement = new Element(this.settings.loadingHtml);
            item.contentElement.get().appendChild(item.loadingElement.get());

            var scrolling = 'yes';
            if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
                item.contentElement.addClass(this.settings.contentClassIos);
                scrolling = 'no';
            }

            var iframe = new Element('<iframe src="' + item.target + '" class="' + this.settings.iframeClass + '" frameborder="0" scrolling="' + scrolling + '"></iframe>');
            iframe.hide();
            if (this.settings.iframeTransparencyMode) {
                iframe.get().setAttribute("allowtransparency", "true");
                iframe.get().style.backgroundColor = "transparent";
            }
            item.contentElement.get().appendChild(iframe.get());

            this.event.addEvent(iframe.get(), "load", function () {
                // @todo Find html and body in iframe and set backgroundColor to transparent
                //if (self.settings.iframeTransparencyMode) {
                //
                //}
                iframe.show();
                item.loadingElement.hideAndRemove();
                if (item.title && self.settings.items.length === 1) {
                    self.infoElement.get().innerHTML = item.title;
                }
                self.event.itemCallback(item);
            });
        };

        /**
         * Adds ajax-content to content-container.
         * @param {object} item 
         * @param {string} method Either "get" or "post"
         */
        this.addContentAjax = function (item, method) {
            item.contentElement = new Element(this.settings.contentHtml);
            item.contentElement.addClass(method === "get" ? this.settings.contentClassGet : this.settings.contentClassPost);
            this.contentContainerElement.addContentElement(item.contentElement.get());

            item.loadingElement = new Element(this.settings.loadingHtml);
            item.contentElement.get().appendChild(item.loadingElement.get());

            if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
                item.contentElement.addClass(this.settings.contentClassIos);
            }

            var xhr = new XMLHttpRequest();
            xhr.open(method === "get" ? "GET" : "POST", item.target);
            this.event.addEvent(xhr, 'load', function (evt) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    item.contentElement.get().innerHTML = xhr.responseText;
                    self.event.itemCallback(item);
                    if (self.settings.executeAjaxScript) {
                        self.executeScript(xhr.responseText);
                    }
                } else {
                    item.contentElement.get().innerHTML = "ERROR: could not load content from " + item.target + "!";
                    console.warn(xhr.statusText, xhr.responseText);
                }
            });
            xhr.send(method === "post" && item.data ? item.data : null);
        };

        /**
         * Adds an image to the content-container.
         * @param {object} item 
         */
        this.addContentImage = function (item) {
            item.contentElement = new Element(this.settings.contentHtml);
            item.contentElement.addClass(this.settings.contentClassImage);
            this.contentContainerElement.addContentElement(item.contentElement.get());

            item.loadingElement = new Element(this.settings.loadingHtml);
            item.contentElement.get().appendChild(item.loadingElement.get());

            this.loadImage(item, function (item, state) {
                item.loadingElement.hideAndRemove();
                switch (state) {
                    case "error":
                        item.contentElement.get().innerHTML = "ERROR: could not load the image from " + item.target + ".";
                        break;
                    case "timeout":
                        item.contentElement.get().innerHTML = "ERROR: loading the image from " + item.target + " took too long.";
                        break;
                    default:
                        item.contentElement.get().style.backgroundImage = "url(" + item.target + ")";
                        if (item.title && self.settings.items.length === 1) {
                            self.infoElement.get().innerHTML = item.title;
                        }
                        self.event.itemCallback(item);
                        break;
                }
            }, 5000);
        };

        /**
         * Helper for this.addContentImage() to load an image.
         * @param {object} item 
         * @param {function} cb 
         * @param {number} timeout 
         */
        this.loadImage = function (item, cb, timeout) {
            timeout = timeout || self.settings.imageLoadTimeout;
            var timedOut = false, timer;
            var img = new Image();
            img.onerror = img.onabort = function () {
                if (!timedOut) {
                    clearTimeout(timer);
                    cb(item, "error");
                }
            };
            img.onload = function () {
                if (!timedOut) {
                    clearTimeout(timer);
                    cb(item, "success");
                }
            };
            img.src = item.target;
            timer = setTimeout(function () {
                timedOut = true;
                img.src = "//!!!!/test.jpg"; // reset .src to invalid URL so it stops previous loading, but doesn't trigger new load
                cb(item, "timeout");
            }, timeout);
        }

        /**
         * If there are multiple items, this is the function to go to the next screen.
         */
        this.showNextItem = function () {
            if (!this.dragdealer) {
                return;
            }
            this.settings.itemsKey = this.settings.itemsKey + 1 <= this.settings.items.length ? this.settings.itemsKey + 1 : 1;
            this.dragdealer.setStep(this.settings.itemsKey);
        };

        /**
         * If there are multiple items, this is the function to go to the previous screen.
         */
        this.showPreviousItem = function () {
            if (!this.dragdealer) {
                return;
            }
            this.settings.itemsKey = this.settings.itemsKey - 1 > 0 ? this.settings.itemsKey - 1 : this.settings.items.length;
            this.dragdealer.setStep(this.settings.itemsKey);
        };

        /**
         * Removes all elements from stage. Closes the lightbox.
         */
        this.close = function () {
            if (this.backgroundElement) {
                this.backgroundElement.hideAndRemove(function () {
                    self.backgroundElement = null;
                });
            }

            if (this.closeElement) {
                this.closeElement.hideAndRemove(function () {
                    self.closeElement = null;
                });
            }
            if (this.contentContainerElement) {
                this.contentContainerElement.remove();
                this.contentContainerElement = null;
            }
            if (this.infoElement) {
                this.infoElement.remove();
                this.infoElement = null;
            }
            if (this.previousElement) {
                this.previousElement.hideAndRemove(function () {
                    self.previousElement = null;
                });
            }
            if (this.nextElement) {
                this.nextElement.hideAndRemove(function () {
                    self.nextElement = null;
                });
            }

            // reactivate scrolling
            document.querySelector("html").classList.remove(this.settings.htmlActiveClass);

            return this;
        };
    }

    if (typeof define === 'function' && define.amd) {
        define(function () {
            return Lightbox;
        });
    } else {
        window.Lightbox = Lightbox;
    }
})(window);