const utils = require("../utils");

function getFooter(){
    return {
        type: "view",
        props: {
          height: 50
        },
        views: [
          {
            type: "label",
            props: {
              text: $l10n("detail_footer"),
              font: $font(12),
              textColor: $color("#AAAAAA"),
              align: $align.center
            },
            layout: function(make) {
              make.left.top.right.inset(10);
            }
          }
        ]
    }
}

function customToast(message, error = false) {
  if ($("toast")) {
    $("toast").remove()
  }
  
  $ui.window.add({
    type: "view",
    props: {
      id: "toast"
    },
    layout: function(make, view) {
      make.height.equalTo(50)
      make.centerX.equalTo()
      make.left.right.inset(0)
      if ($device.isIphonePlus && $app.env == $env.app)
        make.top.equalTo(view.super.safeAreaTop).offset(-50)
      else
        make.top.equalTo(view.super.top).offset(-50)
      utils.shadowView(view)
    },
    views: [{
      type: "label",
      props: {
        text: `${message}      `,
        font: $font("PingFangSC-Medium", 16),
        bgcolor: error ? $color("#EF454A") : $color("tint"),
        textColor: error ? $color("white") : $color("white"),
        align: $align.center,
        circular: true
      },
      layout: function(make) {
        make.height.equalTo(35)
        make.width.greaterThanOrEqualTo(150)
        make.width.lessThanOrEqualTo(JSBox.device.info.screen.width - 30)
        make.centerX.equalTo()
        make.centerY.equalTo()
      }
    }],
    events: {
      ready: function(view) {
        $delay(0.0, function() {
          toggleToast(view, true, function() {
            toggleToast(view, false, function() {
              view.remove()
            })
          })
        })
      }
    }
  })
  
  // if (error) haptic(2)
}

function haptic(type) {
  let haptic = $objc("UINotificationFeedbackGenerator").invoke("new")
  haptic.$notificationOccurred(type)
}

function toggleToast(view, show = true, completetion = null) {
  var inset = show ? 20 : -50
  var delay = show ? 0.0 : 1.5
  var damping = show ? 0.6 : 1.0
  var alpha = show ? 1.0 : 0.0
  
  view.updateLayout(function(make) {
    if ($device.isIphonePlus && $app.env == $env.app)
      make.top.equalTo(view.super.safeAreaTop).offset(inset)
    else
      make.top.equalTo(view.super.top).offset(inset)
  })
  
  $ui.animate({
    duration: 0.5,
    delay: delay,
    damping: damping,
    animation: function() {
      view.relayout()
      view.alpha = alpha
    },
    completion: function() {
      if (completetion) completetion()
    }
  })
}

module.exports = {
    getFooter,
    customToast
};