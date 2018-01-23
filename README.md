# Lightbox
Just another lightbox for iframe, ajax and images.

## Requirements
* requirejs (http://requirejs.org/)
* jQuery (https://jquery.com/)
* Dragdealer.js (https://github.com/skidding/dragdealer)
* Uses FontAwesome for the spinner-icon (http://fontawesome.io/)

## Example JavaScript-Configuration
```
requirejs(["Lightbox"], function (Lightbox) {
  // bind iframe-anchors
  // Example HTML:
  // <a href="iframe.html" class="iframe" title="My iframe">open iframe in lightbox</a>
  var anchors = document.querySelectorAll("a.iframe");
  for (var a = 0; a < anchors.length; a++) {
    anchors[a].addEventListener("click", function (evt) {
      evt.preventDefault();
      var target = evt.target.getAttribute("href");
      if (target) {
        var lb = new Lightbox();
        lb.addItem({
          target: target,
          mode: "iframe",
          title: evt.target.getAttribute("title") || ""
        });
        lb.open();
      }
    }, false);
  }
  
  // ajax single
  var lb = new Lightbox();
  lb.addItem({
    target: 'ajax_url.html',
    mode: 'get'
  });
  lb.open();
  
  // ajax multiple
  // shows previous- and next-button and uses Dragdealer
  var lb = new Lightbox();
  lb.addItem({
    target: 'ajax_get_url.html',
    mode: 'get'
  });
  lb.addItem({
    target: 'ajax_post_url.html',
    mode: 'post',
    parameter: {
      foo: 'bar',
      anotherPostVar: 'baz'
    }
  });
  lb.open();
  
  // bind image-anchors
  // shows previous- and next-button and uses Dragdealer
  // Example HTML:
  // <a href="path/to/image1.jpg" class="lightbox" data-title="Title of image 1" data-group="lightbox_group_1">open image in lightbox</a>
  // <a href="path/to/image2.jpg" class="lightbox" data-title="Title of image 2" data-group="lightbox_group_1">open image in lightbox</a>
  // <a href="path/to/image3.jpg" class="lightbox" data-title="Title of image 3" data-group="lightbox_group_1">open image in lightbox</a>
  // <a href="path/to/image4.jpg" class="lightbox" data-title="Title of image 3" data-group="lightbox_group_4">open image in lightbox</a>
  // <a href="path/to/image5.jpg" class="lightbox">open image in lightbox</a>
  var anchors = document.querySelectorAll("a.lightbox");
  for (var a = 0; a < anchors.length; a++) {
    anchors[a].addEventListener("click", function (evt) {
      evt.preventDefault();
      var target = evt.target.getAttribute("href");
      if (target && target.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
        var lb = new Lightbox();
        var index = 0;
        if (evt.target.getAttribute("data-group")) {
          var groupedAnchors = document.querySelectorAll("a.lightbox[data-group='" + evt.target.getAttribute("data-group") + "']");
            for (var a = 0; a < groupedAnchors.length; a++) {
              lb.addItem({
                target: groupedAnchors[a].getAttribute("href"),
                mode: "image",
                title: groupedAnchors[a].getAttribute("data-title") || ""
              });
              if (target === groupedAnchors[a].getAttribute("href")) {
                index = a;
              }
            }
          } else {
            lb.addItem({
              target: target,
              mode: "image",
              title: evt.target.getAttribute("data-title") || ""
            });
          }
          
          lb.set("itemsKey", index);
          lb.open();
        }
        return;
      }
    }, false);
  }
});
```
