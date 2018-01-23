define(['jquery'], function ($) {
    "use strict";

    var Lightbox = function (params) {
        var self = this;
        this.isVisible = false;
        this.dragdealer = null;
        this.settings = {
            items: [], // items to show in lightbox. Each item must have target and mode defined. A title and parameter (post-parameters) could be defined.
            itemsKey: 0, // Current position in items. The current visible screen.
            container: $("body"), // main container to add the lightbox
            backgroundHtml: '<div class="lightbox-background"></div>', // HTML used for the lightbox background
            closeHtml: '<div class="lightbox-close"></div>', // HTML used for the close button
            contentContainerHtml: '<div class="lightbox-content-container"></div>', // HTML used for the element with the content in
            multipleItemsClass: 'multiple-items', // CSS-class, which will be set on the previous container-element and the info-element, if there are multiple items.
            multipleItemsContainerHtml: '<div></div>', // HTML used for the inner container, if there is more than one item.
            multipleItemsContainerClass: 'lightbox-multiple-items-container', // CSS-class for the container above. Also used for Dragdealer as slide.
            contentHtml: '<div class="lightbox-content"></div>', // HTML used for each item as wrap
            contentClassIos: 'ios', // additional CSS-class for iframe-content-elements, if iOS was detected (for scrolling/touchmove purpose)
            contentClassIframe: 'lightbox-content-iframe', // additional CSS-class for content-elements in iframe-mode
            contentClassImage: 'lightbox-content-image', // additional CSS-class for content-elements in image-mode
            contentClassGet: 'lightbox-content-ajax lightbox-content-get', // additional CSS-classes for content-elements in ajax-get-mode
            contentClassPost: 'lightbox-content-ajax lightbox-content-post', // additional CSS-class for content-elements in ajax-post-mode
            iframeClass: 'lightbox-iframe', // CSS-class for the iframe-element in the content-element in iframe-mode
            iframeTransparencyMode: true, // if true, the iframe gets an transparency-attribute.
            htmlActiveClass: 'lightbox-active', // CSS-class to be set/removed, if the lightbox is active/inactive
            previousHtml: '<div class="lightbox-previous"></div>', // HTML used for the previous-button-element
            nextHtml: '<div class="lightbox-next"></div>', // HTML used for the next-button-element
            infoHtml: '<div class="lightbox-info"></div>', // HTML used for the info-area
            loadingHtml: '<div class="lightbox-loading"><i class="fa fa-spinner fa-spin fa-fw"></i></div>', // HTML used for the spinner
            closeOnBackgroundClick: true, // if true, the lightbox will be closed if the background was clicked
            pathToRequirejsDragdealer: 'dragdealer.min' // we use requirejs to load Dragdealer if needed, if there are multiple items. This is the part in the requirejs-array.
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
            var self = this;
            this.html = html;
            this.jqe = null;
            this.isVisible = true;

            this.get = function () {
                if (this.jqe === null || this.jqe.length === 0) {
                    this.jqe = $(html);
                }
                return this.jqe;
            };

            this.show = function (cb) {
                if (this.isVisible === false) {
                    this.get().stop().fadeIn(function () {
                        if (typeof cb === "function") {
                            cb(self);
                        }
                    });
                    this.isVisible = true;
                }
            };

            this.hide = function (cb) {
                if (this.isVisible === true) {
                    this.get().stop().fadeOut(function () {
                        if (typeof cb === "function") {
                            cb(self);
                        }
                    });
                    this.isVisible = false;
                }
            }

            this.remove = function (cb) {
                this.get().remove();
                this.jqe = null;
                if (typeof cb === "function") {
                    cb(self);
                }
            }

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
                parameter: params.parameter || {}
            });

            return this;
        }

        /**
         * Method to open the lightbox after items or one item is defined.
         */
        this.open = function () {
            if (typeof this.settings.items[this.settings.itemsKey] !== "object") {
                console.log("Error in Lightbox: No items defined!");
                return null;
            }

            if (this.isVisible === false) {
                // create background
                this.backgroundElement = new Element(this.settings.backgroundHtml);
                this.settings.container.append(this.backgroundElement.get());
                this.backgroundElement.show();

                if (this.settings.closeOnBackgroundClick === true) {
                    this.backgroundElement.get().on("click", function () {
                        self.close();
                    });
                }

                // create close button
                this.closeElement = new Element(this.settings.closeHtml);
                this.settings.container.append(this.closeElement.get());
                this.closeElement.show();
                this.closeElement.get().on("click", function () {
                    self.close();
                });

                // create container for all contents
                this.contentContainerElement = new Element(this.settings.contentContainerHtml);
                this.settings.container.append(this.contentContainerElement.get());

                // add special method to add automatically content to the container in relation to one item at all or multiple items.
                this.contentContainerElement.multipleItemsContainer = null;
                this.contentContainerElement.addContentElement = function (ceToAdd) {
                    if (self.settings.items.length > 1) {
                        if (this.multipleItemsContainer === null) {
                            this.multipleItemsContainer = new Element(self.settings.multipleItemsContainerHtml);
                            this.get().append(this.multipleItemsContainer.get().addClass(self.settings.multipleItemsContainerClass).css("width", self.settings.items.length * 100 + "%"));
                        }
                        this.multipleItemsContainer.get().append(ceToAdd.css("width", 100 / self.settings.items.length + "%"));
                    } else {
                        this.get().append(ceToAdd);
                    }
                };

                // create info area
                this.infoElement = new Element(this.settings.infoHtml);
                this.settings.container.append(this.infoElement.get());

                // do some more, if there is more than one item
                if (this.settings.items.length > 1) {
                    // create previous button
                    this.previousElement = new Element(this.settings.previousHtml);
                    this.previousElement.get().on("click", function () {
                        self.showPreviousItem();
                    });
                    this.settings.container.append(this.previousElement.get());

                    // create next button
                    this.nextElement = new Element(this.settings.nextHtml);
                    this.nextElement.get().on("click", function () {
                        self.showNextItem();
                    });
                    this.settings.container.append(this.nextElement.get());
                }

                this.isVisible = true;
            }

            if (this.settings.items.length > 1) {
                // add multiple-items-class to container- and info-element
                this.infoElement.get().addClass(this.settings.multipleItemsClass);
                this.contentContainerElement.get().addClass(this.settings.multipleItemsClass);
                for (var e = 0; e < this.settings.items.length; e++) {
                    this.addContent(this.settings.items[e]);
                }

                // load and init Dragdealer
                require([this.settings.pathToRequirejsDragdealer], function (Dragdealer) {
                    self.dragdealer = new Dragdealer(self.contentContainerElement.get().get(0), {
                        steps: self.settings.items.length,
                        speed: 0.3,
                        loose: true,
                        requestAnimationFrame: true,
                        handleClass: self.settings.multipleItemsContainerClass,
                        callback: function () {
                            var s = self.dragdealer.getStep()[0];
                            self.settings.itemsKey = s;
                            self.infoElement.get().html(self.settings.items[s - 1].title ? s + "/" + self.settings.items.length + " - " + self.settings.items[s - 1].title : s + "/" + self.settings.items.length);
                        }
                    });

                    self.dragdealer.setStep(self.settings.itemsKey + 1);
                });
            } else {
                this.addContent(this.settings.items[this.settings.itemsKey]);
            }

            // prevent scrolling the page (on touchdevices)
            $("html").addClass(this.settings.htmlActiveClass);
            $(window).on("touchmove.Lightbox", function (event) {
                event.preventDefault();
            });

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
            item.contentElement.get().addClass(this.settings.contentClassIframe);
            this.contentContainerElement.addContentElement(item.contentElement.get());

            var loadingElement = new Element(this.settings.loadingHtml);
            item.contentElement.get().html(loadingElement.get());

            var scrolling = 'yes';
            if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
                item.contentElement.get().addClass(this.settings.contentClassIos);
                scrolling = 'no';
            }

            var iframe = $('<iframe>', {
                src: item.target,
                class: this.settings.iframeClass,
                frameborder: 0,
                allowTransparency: (this.settings.iframeTransparencyMode) ? 'true' : 'false',
                scrolling: scrolling
            })
                .hide()
                .css("background-color", "transparent")
                .on("load", function () {
                    // console.log($(this).contents().height());
                    if (self.settings.iframeTransparencyMode) {
                        $(this).fadeIn().contents().find("html,body").css("background-color", "transparent");
                    }

                    loadingElement.hide(function (e) {
                        e.remove();
                    });
                });

            item.contentElement.get().append(iframe);
        };

        /**
         * Adds ajax-content to content-container.
         * @param {object} item 
         * @param {string} method Either "get" or "post"
         */
        this.addContentAjax = function (item, method) {
            item.contentElement = new Element(this.settings.contentHtml);
            item.contentElement.get().addClass(method === "get" ? this.settings.contentClassGet : this.settings.contentClassPost);
            this.contentContainerElement.addContentElement(item.contentElement.get());

            var loadingElement = new Element(this.settings.loadingHtml);
            item.contentElement.get().html(loadingElement.get());

            if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
                item.contentElement.get().addClass(this.settings.contentClassIos);
            }

            var xhr = null;
            $.ajax({
                method: method === "get" ? "GET" : "POST",
                url: item.target,
                data: typeof item.parameter === "object" ? item.parameter : {}
            })
                .done(function (returnHtml) {
                    item.contentElement.get().html(returnHtml);
                    if (item.contentElement.get() === null) {
                        console.log("ERROR: You've loaded a html document (including the html-tag) via AJAX and not only a html-node!");
                    }
                })
                .fail(function () {
                    item.contentElement.get().html("ERROR: could not load content from " + item.target + "!");
                });
        };

        /**
         * Adds an image to the content-container.
         * @param {object} item 
         */
        this.addContentImage = function (item) {
            item.contentElement = new Element(this.settings.contentHtml);
            item.contentElement.get().addClass(this.settings.contentClassImage);
            this.contentContainerElement.addContentElement(item.contentElement.get());

            item.loadingElement = new Element(this.settings.loadingHtml);
            item.contentElement.get().html(item.loadingElement.get());

            this.loadImage(item, function (item, state) {
                item.loadingElement.hide(function (elem) {
                    elem.remove();
                });
                switch (state) {
                    case "error":
                        item.contentElement.get().html("ERROR: could not load the image from " + item.target + ".");
                        break;
                    case "timeout":
                        item.contentElement.get().html("ERROR: loading the image from " + item.target + " took too long.");
                        break;
                    default:
                        item.contentElement.get().css("backgroundImage", "url(" + item.target + ")");
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
            timeout = timeout || 5000;
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
                this.backgroundElement.hide(function (elem) {
                    elem.remove();
                    self.backgroundElement = null;
                });
            }

            if (this.closeElement) {
                this.closeElement.hide(function (elem) {
                    elem.remove();
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
                this.previousElement.hide(function (elem) {
                    elem.remove();
                    self.previousElement = null;
                });
            }
            if (this.nextElement) {
                this.nextElement.hide(function (elem) {
                    elem.remove();
                    self.nextElement = null;
                });
            }

            this.isVisible = false;

            $("html").removeClass(this.settings.htmlActiveClass);
            $(window).off("touchmove.Lightbox");

            return this;
        };
    };

    return Lightbox;
});
