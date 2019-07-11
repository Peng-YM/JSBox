function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const obj2Map = obj => {
  const mp = new Map();
  Object.keys(obj).forEach(k => {
    mp.set(k, obj[k]);
  });
  return mp;
};

const map2Obj = aMap => {
  const obj = {};
  aMap.forEach((v, k) => {
    obj[k] = v;
  });
  return obj;
};

function cutString(str, maxChars) {
  if (str.length < maxChars) {
    return str;
  }
  return str.slice(0, maxChars).concat("...");
}

function shadowView(view, alpha = 0.3) {
  var layer = view.runtimeValue().invoke("layer");

  layer.invoke("setCornerRadius", 5);
  layer.invoke("setShadowOffset", $size(0, 0));
  layer.invoke(
    "setShadowColor",
    $color("lightGray")
      .runtimeValue()
      .invoke("CGColor")
  );
  layer.invoke("setShadowOpacity", alpha);
  layer.invoke("setShadowRadius", 10);
}

function shadowButton(view, radius = 3) {
  var layer = view.runtimeValue().invoke("layer");

  layer.invoke("setShadowOffset", $size(2, 2));
  layer.invoke(
    "setShadowColor",
    $color("lightGray")
      .runtimeValue()
      .invoke("CGColor")
  );
  layer.invoke("setShadowOpacity", 0.2);
  layer.invoke("setShadowRadius", radius);
}

function shadowImage(view) {
  var layer = view.runtimeValue().invoke("layer");

  var subLayer = $objc("CALayer").invoke("layer");
  subLayer.invoke("setFrame", $rect(5, 5, 190, 270));
  subLayer.invoke(
    "setBackgroundColor",
    $color("white")
      .runtimeValue()
      .invoke("CGColor")
  );
  subLayer.invoke("setMasksToBounds", false);
  subLayer.invoke("setShadowOffset", $size(10, 10));
  subLayer.invoke(
    "setShadowColor",
    $color("gray")
      .runtimeValue()
      .invoke("CGColor")
  );
  subLayer.invoke("setShadowOpacity", 0.5);
  subLayer.invoke("setShadowRadius", 10);
  layer.invoke("addSublayer", subLayer);
}

const COLOR_PRESETS = {
  light_gray: $rgb(245, 245, 245),
  blue: $color("#3478f7"),
  red: $color("red"),
  gray: $color("gray")
};

module.exports = {
  uuidv4,
  obj2Map,
  map2Obj,
  cutString,
  shadowView,
  shadowButton,
  shadowImage,
  COLOR_PRESETS
};
