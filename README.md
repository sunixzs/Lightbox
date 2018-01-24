# Lightbox
Just another lightbox for iframe, ajax and images.

## ChangeLog

### 0.0.0 initial beta version
Tested some stuff, but not all.

## Requirements
* Dragdealer for multiple items in lightbox (https://github.com/skidding/dragdealer)
* Uses FontAwesome for the spinner-icon (http://fontawesome.io/)

## Example JavaScript-Configuration with requirejs
Have a look at the example_with_requirejs.html file.

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
  lb.addItem({...});
  lb.open();
  </script>
</body>
</html>
```