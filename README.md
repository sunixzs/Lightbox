# Lightbox
Just another lightbox for iframe, ajax and images.

## ChangeLog

### 0.0.0 initial beta version
Tested some stuff, but not all.

## Requirements
* Dragdealer for multiple items in lightbox (https://github.com/skidding/dragdealer)
* Uses FontAwesome for the spinner-icon (http://fontawesome.io/)

## Example JavaScript-Configuration with requirejs
```
<!DOCTYPE html>
<html>
<head>
  <title>requirejs example</title>
  <link rel="stylesheet" type="text/css" href="Lightbbox.css" media="all">
</head>
<body>
  <h1>iframe</h1>
  <a href="iframe.html" class="iframe" title="My iframe">open iframe in lightbox</a>
  <script>
  requirejs(["Lightbox.min"], function (Lightbox) {
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
  });
  </script>

  <h1>AJAX single</h1>
  <a href="#" data-url="ajax_single.html" id="ajax-single">load ajax single</a>
  <script>
  requirejs(["Lightbox.min"], function (Lightbox) {
    var anchor = document.querySelector("#ajax-single");
    anchor.addEventListener("click", function (evt){
      evt.preventDefault();
      var target = this.target.getAttribute("data-url");
      if (target) {
        var lb = new Lightbox();
        lb.addItem({
          target: target,
          mode: 'get'
        });
        lb.open();
      }
    }, false);
  });
  </script>

  <h1>AJAX multiple</h1>
  <p>shows previous- and next-button and uses dragdealer</p>
  <button id="ajax-multiple">load ajax multiple</button>
  <script>
  requirejs(["Lightbox.min"], function (Lightbox) {
    var button = document.querySelector("#ajax-multiple");
    button.addEventListener("click", function (evt){
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
    }, false);
  });
  </script>

  <h1>Images</h1>
  <p>shows previous- and next-button and uses dragdealer</p>
  <ul>
    <li><a href="path/to/image1.jpg" class="lightbox" data-title="Title of image 1" data-group="lightbox_group_1">open image in lightbox</a></li>
    <li><a href="path/to/image2.jpg" class="lightbox" data-title="Title of image 2" data-group="lightbox_group_1">open image in lightbox</a></li>
    <li><a href="path/to/image3.jpg" class="lightbox" data-title="Title of image 3" data-group="lightbox_group_1">open image in lightbox</a></li>
  </ul>

  <ul>
    <li><a href="path/to/image4.jpg" class="lightbox" data-title="Title of image 3" data-group="lightbox_group_4">open image in lightbox</a></li>
  </ul>

  <ul>
    <li><a href="path/to/image5.jpg" class="lightbox">open image in lightbox</a></li>
  </ul>

  <script>
  requirejs(["Lightbox.min"], function (Lightbox) {
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
  </script>
</body>
</html>
```

## Without requirejs
You have to load Dragdealer before calling the lightbox.

You also have to set the parameter `pathToRequirejsDragdealer` to an empty string.

```
<!DOCTYPE html>
<html>
<head>
  <title>without requirejs</title>
  <link rel="stylesheet" type="text/css" href="Lightbbox.css" media="all">
</head>
<body>
  Some content...

  <script src="path/to/dragdealer.min.js" type="text/javascript"></script>
  <script src="Lightbox.min.js" type="text/javascript"></script>
  <script>
  var lb = new Lightbox({
    pathToRequirejsDragdealer: ""
  });
  </script>
</body>
</html>
```