# Lightbox
Just another lightbox for iframes, ajax-content and images.

Uses Dragdealer to handle multiple items (screens) in lightbox.

## ChangeLog

### 0.0.0 initial version
Tested some stuff, but not all. Should work in all major browsers (01/2018).

Tested in:
* Mozilla Firefox 57
* Google Chrome 63
* Apple Safari 11 on Desktop
* Apple Safari iOS 11 on iPad and iPhone
* Microsoft Internet Explorer 11
* Microsoft Internet Explorer 10
* Microsoft Edge 16

## Requirements
* Dragdealer for multiple items in lightbox (https://github.com/skidding/dragdealer)
* Uses FontAwesome for the spinner-icon (http://fontawesome.io/). Of course you're able to replace the icon with your own.

## Example JavaScript-Configuration with requirejs
Have a look at the example_with_requirejs.html file.

## General usage

1. **Include the script- and css-files or let requirejs do it for you.**
```
<link rel="stylesheet" type="text/css" href="Lightbox.css" media="all">
<link rel="stylesheet" type="text/css" href="https://opensource.keycdn.com/fontawesome/4.7.0/font-awesome.min.css" media="all">
<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/dragdealer/0.9.9/dragdealer.min.js" ></script>
<script type="text/javascript" src="Lightbox.min.js" ></script>
```

2. **Make an instance**
```
var LB = new Lightbox();
```

3. **Add item(s)**

  **_Repeat for each item to show:_**
```
LB.addItem([
  target: "url",
  mode: "image", // one of iframe, image, get or post
  title: "seen in bottom right edge in lightbox",
  callback: function (item, LightboxInstance) {
    // doing stuff after item is loaded
  },
  data: null // can be a FormData-object when using mode 'post'
]);
```

  **_Set position, if there are multiple items_**
```
LB.set("itemsKey", 1); // index starts a 0 for the first item and is the default value
```

4. **Open Lightbox**
```
LB.open();
```

## Without requirejs
You have to load Dragdealer before calling the lightbox.

You also have to set the parameter `pathToRequirejsDragdealer` to an empty string.

```
<!DOCTYPE html>
<html>
<head>
  <title>without requirejs</title>
  <link rel="stylesheet" type="text/css" href="Lightbox.css" media="all">
</head>
<body>
  Some content...

  <script src="path/to/dragdealer.min.js" type="text/javascript"></script>
  <script src="Lightbox.min.js" type="text/javascript"></script>
  <script>
  var lb = new Lightbox({
    pathToRequirejsDragdealer: ""
  });
  lb.addItem({...});
  lb.open();
  </script>
</body>
</html>
```