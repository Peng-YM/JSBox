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

const COLOR_PRESETS = {
  light_gray: $rgb(237, 238, 239),
  blue: $color("#3478f7"),
  red: $color("red"),
  gray: $color("gray")
};

module.exports = {
  uuidv4,
  obj2Map,
  map2Obj,
  cutString,
  COLOR_PRESETS
};
