require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"FontFace":[function(require,module,exports){
exports.FontFace = (function() {
  var TEST, addFontFace, loadTestingFileError, missingArgumentError, removeTestLayer, testNewFace;

  TEST = {
    face: "monospace",
    text: "foo",
    time: .01,
    maxLoadAttempts: 50,
    hideErrorMessages: true
  };

  TEST.style = {
    width: "auto",
    fontSize: "150px",
    fontFamily: TEST.face
  };

  TEST.layer = new Layer({
    name: "FontFace Tester",
    width: 0,
    height: 1,
    maxX: -Screen.width,
    visible: false,
    html: TEST.text,
    style: TEST.style
  });

  function FontFace(options) {
    this.name = this.file = this.testLayer = this.isLoaded = this.loadFailed = this.loadAttempts = this.originalSize = this.hideErrors = null;
    if (options != null) {
      this.name = options.name || null;
      this.file = options.file || null;
    }
    if (!((this.name != null) && (this.file != null))) {
      return missingArgumentError();
    }
    this.testLayer = TEST.layer.copy();
    this.testLayer.style = TEST.style;
    this.testLayer.maxX = -Screen.width;
    this.testLayer.visible = true;
    this.isLoaded = false;
    this.loadFailed = false;
    this.loadAttempts = 0;
    this.hideErrors = options.hideErrors;
    return addFontFace(this.name, this.file, this);
  }

  addFontFace = function(name, file, object) {
    var faceCSS, styleTag;
    styleTag = document.createElement('style');
    faceCSS = document.createTextNode("@font-face { font-family: '" + name + "'; src: url('" + file + "') format('truetype'); }");
    styleTag.appendChild(faceCSS);
    document.head.appendChild(styleTag);
    return testNewFace(name, object);
  };

  removeTestLayer = function(object) {
    object.testLayer.destroy();
    return object.testLayer = null;
  };

  testNewFace = function(name, object) {
    var initialWidth, widthUpdate;
    initialWidth = object.testLayer._element.getBoundingClientRect().width;
    if (initialWidth === 0) {
      if (object.hideErrors === false || TEST.hideErrorMessages === false) {
        print("Load testing failed. Attempting again.");
      }
      return Utils.delay(TEST.time, function() {
        return testNewFace(name, object);
      });
    }
    object.loadAttempts++;
    if (object.originalSize === null) {
      object.originalSize = initialWidth;
      object.testLayer.style = {
        fontFamily: name + ", " + TEST.face
      };
    }
    widthUpdate = object.testLayer._element.getBoundingClientRect().width;
    if (object.originalSize === widthUpdate) {
      if (object.loadAttempts < TEST.maxLoadAttempts) {
        return Utils.delay(TEST.time, function() {
          return testNewFace(name, object);
        });
      }
      if (!object.hideErrors) {
        print("⚠️ Failed loading FontFace: " + name);
      }
      object.isLoaded = false;
      object.loadFailed = true;
      if (!object.hideErrors) {
        loadTestingFileError(object);
      }
      return;
    } else {
      if (!(object.hideErrors === false || TEST.hideErrorMessages)) {
        print("LOADED: " + name);
      }
      object.isLoaded = true;
      object.loadFailed = false;
    }
    removeTestLayer(object);
    return name;
  };

  missingArgumentError = function() {
    error(null);
    return console.error("Error: You must pass name & file properites when creating a new FontFace. \n\nExample: myFace = new FontFace name:\"Gotham\", file:\"gotham.ttf\" \n");
  };

  loadTestingFileError = function(object) {
    error(null);
    return console.error("Error: Couldn't detect the font: \"" + object.name + "\" and file: \"" + object.file + "\" was loaded.  \n\nEither the file couldn't be found or your browser doesn't support the file type that was provided. \n\nSuppress this message by adding \"hideErrors: true\" when creating a new FontFace. \n");
  };

  return FontFace;

})();


},{}],"TextLayer":[function(require,module,exports){
var TextLayer, convertTextLayers, convertToTextLayer,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

TextLayer = (function(superClass) {
  extend(TextLayer, superClass);

  function TextLayer(options) {
    if (options == null) {
      options = {};
    }
    this.doAutoSize = false;
    this.doAutoSizeHeight = false;
    if (options.backgroundColor == null) {
      options.backgroundColor = options.setup ? "hsla(60, 90%, 47%, .4)" : "transparent";
    }
    if (options.color == null) {
      options.color = "red";
    }
    if (options.lineHeight == null) {
      options.lineHeight = 1.25;
    }
    if (options.fontFamily == null) {
      options.fontFamily = "Helvetica";
    }
    if (options.fontSize == null) {
      options.fontSize = 20;
    }
    if (options.text == null) {
      options.text = "Use layer.text to add text";
    }
    TextLayer.__super__.constructor.call(this, options);
    this.style.whiteSpace = "pre-line";
    this.style.outline = "none";
  }

  TextLayer.prototype.setStyle = function(property, value, pxSuffix) {
    if (pxSuffix == null) {
      pxSuffix = false;
    }
    this.style[property] = pxSuffix ? value + "px" : value;
    this.emit("change:" + property, value);
    if (this.doAutoSize) {
      return this.calcSize();
    }
  };

  TextLayer.prototype.calcSize = function() {
    var constraints, size, sizeAffectingStyles;
    sizeAffectingStyles = {
      lineHeight: this.style["line-height"],
      fontSize: this.style["font-size"],
      fontWeight: this.style["font-weight"],
      paddingTop: this.style["padding-top"],
      paddingRight: this.style["padding-right"],
      paddingBottom: this.style["padding-bottom"],
      paddingLeft: this.style["padding-left"],
      textTransform: this.style["text-transform"],
      borderWidth: this.style["border-width"],
      letterSpacing: this.style["letter-spacing"],
      fontFamily: this.style["font-family"],
      fontStyle: this.style["font-style"],
      fontVariant: this.style["font-variant"]
    };
    constraints = {};
    if (this.doAutoSizeHeight) {
      constraints.width = this.width;
    }
    size = Utils.textSize(this.text, sizeAffectingStyles, constraints);
    if (this.style.textAlign === "right") {
      this.width = size.width;
      this.x = this.x - this.width;
    } else {
      this.width = size.width;
    }
    return this.height = size.height;
  };

  TextLayer.define("autoSize", {
    get: function() {
      return this.doAutoSize;
    },
    set: function(value) {
      this.doAutoSize = value;
      if (this.doAutoSize) {
        return this.calcSize();
      }
    }
  });

  TextLayer.define("autoSizeHeight", {
    set: function(value) {
      this.doAutoSize = value;
      this.doAutoSizeHeight = value;
      if (this.doAutoSize) {
        return this.calcSize();
      }
    }
  });

  TextLayer.define("contentEditable", {
    set: function(boolean) {
      this._element.contentEditable = boolean;
      this.ignoreEvents = !boolean;
      return this.on("input", function() {
        if (this.doAutoSize) {
          return this.calcSize();
        }
      });
    }
  });

  TextLayer.define("text", {
    get: function() {
      return this._element.textContent;
    },
    set: function(value) {
      this._element.textContent = value;
      this.emit("change:text", value);
      if (this.doAutoSize) {
        return this.calcSize();
      }
    }
  });

  TextLayer.define("fontFamily", {
    get: function() {
      return this.style.fontFamily;
    },
    set: function(value) {
      return this.setStyle("fontFamily", value);
    }
  });

  TextLayer.define("fontSize", {
    get: function() {
      return this.style.fontSize.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("fontSize", value, true);
    }
  });

  TextLayer.define("lineHeight", {
    get: function() {
      return this.style.lineHeight;
    },
    set: function(value) {
      return this.setStyle("lineHeight", value);
    }
  });

  TextLayer.define("fontWeight", {
    get: function() {
      return this.style.fontWeight;
    },
    set: function(value) {
      return this.setStyle("fontWeight", value);
    }
  });

  TextLayer.define("fontStyle", {
    get: function() {
      return this.style.fontStyle;
    },
    set: function(value) {
      return this.setStyle("fontStyle", value);
    }
  });

  TextLayer.define("fontVariant", {
    get: function() {
      return this.style.fontVariant;
    },
    set: function(value) {
      return this.setStyle("fontVariant", value);
    }
  });

  TextLayer.define("padding", {
    set: function(value) {
      this.setStyle("paddingTop", value, true);
      this.setStyle("paddingRight", value, true);
      this.setStyle("paddingBottom", value, true);
      return this.setStyle("paddingLeft", value, true);
    }
  });

  TextLayer.define("paddingTop", {
    get: function() {
      return this.style.paddingTop.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("paddingTop", value, true);
    }
  });

  TextLayer.define("paddingRight", {
    get: function() {
      return this.style.paddingRight.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("paddingRight", value, true);
    }
  });

  TextLayer.define("paddingBottom", {
    get: function() {
      return this.style.paddingBottom.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("paddingBottom", value, true);
    }
  });

  TextLayer.define("paddingLeft", {
    get: function() {
      return this.style.paddingLeft.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("paddingLeft", value, true);
    }
  });

  TextLayer.define("textAlign", {
    set: function(value) {
      return this.setStyle("textAlign", value);
    }
  });

  TextLayer.define("textTransform", {
    get: function() {
      return this.style.textTransform;
    },
    set: function(value) {
      return this.setStyle("textTransform", value);
    }
  });

  TextLayer.define("letterSpacing", {
    get: function() {
      return this.style.letterSpacing.replace("px", "");
    },
    set: function(value) {
      return this.setStyle("letterSpacing", value, true);
    }
  });

  TextLayer.define("length", {
    get: function() {
      return this.text.length;
    }
  });

  return TextLayer;

})(Layer);

convertToTextLayer = function(layer) {
  var css, cssObj, importPath, t;
  t = new TextLayer({
    name: layer.name,
    frame: layer.frame,
    parent: layer.parent
  });
  cssObj = {};
  css = layer._info.metadata.css;
  css.forEach(function(rule) {
    var arr;
    if (_.contains(rule, '/*')) {
      return;
    }
    arr = rule.split(': ');
    return cssObj[arr[0]] = arr[1].replace(';', '');
  });
  t.style = cssObj;
  importPath = layer.__framerImportedFromPath;
  if (_.contains(importPath, '@2x')) {
    t.fontSize *= 2;
    t.lineHeight = (parseInt(t.lineHeight) * 2) + 'px';
    t.letterSpacing *= 2;
  }
  t.y -= (parseInt(t.lineHeight) - t.fontSize) / 2;
  t.y -= t.fontSize * 0.1;
  t.x -= t.fontSize * 0.08;
  t.width += t.fontSize * 0.5;
  t.text = layer._info.metadata.string;
  layer.destroy();
  return t;
};

Layer.prototype.convertToTextLayer = function() {
  return convertToTextLayer(this);
};

convertTextLayers = function(obj) {
  var layer, prop, results;
  results = [];
  for (prop in obj) {
    layer = obj[prop];
    if (layer._info.kind === "text") {
      results.push(obj[prop] = convertToTextLayer(layer));
    } else {
      results.push(void 0);
    }
  }
  return results;
};

Layer.prototype.frameAsTextLayer = function(properties) {
  var t;
  t = new TextLayer;
  t.frame = this.frame;
  t.superLayer = this.superLayer;
  _.extend(t, properties);
  this.destroy();
  return t;
};

exports.TextLayer = TextLayer;

exports.convertTextLayers = convertTextLayers;


},{}],"ViewController":[function(require,module,exports){
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

module.exports = (function(superClass) {
  extend(exports, superClass);

  function exports(options) {
    var autoInitial, backButtons, btn, i, len, transitions;
    if (options == null) {
      options = {};
    }
    if (options.width == null) {
      options.width = Screen.width;
    }
    if (options.height == null) {
      options.height = Screen.height;
    }
    if (options.clip == null) {
      options.clip = true;
    }
    if (options.initialViewName == null) {
      options.initialViewName = 'initialView';
    }
    if (options.backButtonName == null) {
      options.backButtonName = 'backButton';
    }
    if (options.animationOptions == null) {
      options.animationOptions = {
        curve: "cubic-bezier(0.19, 1, 0.22, 1)",
        time: .7
      };
    }
    if (options.backgroundColor == null) {
      options.backgroundColor = "black";
    }
    if (options.scroll == null) {
      options.scroll = false;
    }
    if (options.autoLink == null) {
      options.autoLink = true;
    }
    exports.__super__.constructor.call(this, options);
    this.history = [];
    this.onChange("subLayers", (function(_this) {
      return function(changeList) {
        var c, children, i, len, scrollComponent, view;
        view = changeList.added[0];
        if (view != null) {
          view.clip = true;
          view.on(Events.Click, function() {});
          if (_this.scroll) {
            children = view.children;
            scrollComponent = new ScrollComponent({
              name: "scrollComponent",
              width: _this.width,
              height: _this.height,
              parent: view
            });
            scrollComponent.content.backgroundColor = "";
            if (view.width <= _this.width) {
              scrollComponent.scrollHorizontal = false;
            }
            if (view.height <= _this.height) {
              scrollComponent.scrollVertical = false;
            }
            for (i = 0, len = children.length; i < len; i++) {
              c = children[i];
              c.parent = scrollComponent.content;
            }
            view.scrollComponent = scrollComponent;
            return view.size = {
              width: _this.width,
              height: _this.height
            };
          }
        }
      };
    })(this));
    transitions = {
      switchInstant: {
        newView: {
          to: {
            x: 0,
            y: 0
          }
        }
      },
      fadeIn: {
        newView: {
          from: {
            opacity: 0
          },
          to: {
            opacity: 1
          }
        }
      },
      zoomIn: {
        newView: {
          from: {
            scale: 0.8,
            opacity: 0
          },
          to: {
            scale: 1,
            opacity: 1
          }
        }
      },
      zoomOut: {
        oldView: {
          to: {
            scale: 0.8,
            opacity: 0
          }
        }
      },
      slideInUp: {
        newView: {
          from: {
            y: this.height
          },
          to: {
            y: 0
          }
        }
      },
      slideInRight: {
        newView: {
          from: {
            x: this.width
          },
          to: {
            x: 0
          }
        }
      },
      slideInDown: {
        newView: {
          from: {
            maxY: 0
          },
          to: {
            y: 0
          }
        }
      },
      moveInRight: {
        oldView: {
          to: {
            maxX: 0
          }
        },
        newView: {
          from: {
            x: this.width
          },
          to: {
            x: 0
          }
        }
      },
      moveInLeft: {
        oldView: {
          to: {
            x: this.width
          }
        },
        newView: {
          from: {
            maxX: 0
          },
          to: {
            x: 0
          }
        }
      },
      slideInLeft: {
        newView: {
          from: {
            maxX: 0
          },
          to: {
            maxX: this.width
          }
        }
      },
      pushInRight: {
        oldView: {
          to: {
            x: -(this.width / 5),
            brightness: 70
          }
        },
        newView: {
          from: {
            x: this.width
          },
          to: {
            x: 0
          }
        }
      },
      pushInLeft: {
        oldView: {
          to: {
            x: this.width / 5,
            brightness: 70
          }
        },
        newView: {
          from: {
            x: -this.width
          },
          to: {
            x: 0
          }
        }
      },
      pushOutRight: {
        oldView: {
          to: {
            x: this.width
          }
        },
        newView: {
          from: {
            x: -(this.width / 5),
            brightness: 70
          },
          to: {
            x: 0,
            brightness: 100
          }
        }
      },
      pushOutLeft: {
        oldView: {
          to: {
            maxX: 0
          }
        },
        newView: {
          from: {
            x: this.width / 5,
            brightness: 70
          },
          to: {
            x: 0,
            brightness: 100
          }
        }
      },
      slideOutUp: {
        oldView: {
          to: {
            maxY: 0
          }
        }
      },
      slideOutRight: {
        oldView: {
          to: {
            x: this.width
          }
        }
      },
      slideOutDown: {
        oldView: {
          to: {
            y: this.height
          }
        }
      },
      slideOutLeft: {
        oldView: {
          to: {
            maxX: 0
          }
        }
      }
    };
    transitions.slideIn = transitions.slideInRight;
    transitions.slideOut = transitions.slideOutRight;
    transitions.pushIn = transitions.pushInRight;
    transitions.pushOut = transitions.pushOutRight;
    Events.ViewWillSwitch = "viewWillSwitch";
    Events.ViewDidSwitch = "viewDidSwitch";
    Layer.prototype.onViewWillSwitch = function(cb) {
      return this.on(Events.ViewWillSwitch, cb);
    };
    Layer.prototype.onViewDidSwitch = function(cb) {
      return this.on(Events.ViewDidSwitch, cb);
    };
    _.each(transitions, (function(_this) {
      return function(animProps, name) {
        var btn, i, layers, len, viewController;
        if (options.autoLink) {
          layers = Framer.CurrentContext.getLayers();
          for (i = 0, len = layers.length; i < len; i++) {
            btn = layers[i];
            if (_.contains(btn.name, name)) {
              viewController = _this;
              btn.onClick(function() {
                var anim, linkName;
                anim = this.name.split('_')[0];
                linkName = this.name.replace(anim + '_', '');
                linkName = linkName.replace(/\d+/g, '');
                return viewController[anim](_.find(layers, function(l) {
                  return l.name === linkName;
                }));
              });
            }
          }
        }
        return _this[name] = function(newView, animationOptions) {
          var incoming, outgoing, ref, ref1, ref2, ref3, ref4, ref5, ref6;
          if (animationOptions == null) {
            animationOptions = _this.animationOptions;
          }
          if (newView === _this.currentView) {
            return;
          }
          newView.parent = _this;
          newView.sendToBack();
          newView.point = {
            x: 0,
            y: 0
          };
          newView.opacity = 1;
          newView.scale = 1;
          newView.brightness = 100;
          if ((ref = _this.currentView) != null) {
            ref.point = {
              x: 0,
              y: 0
            };
          }
          if ((ref1 = _this.currentView) != null) {
            ref1.props = (ref2 = animProps.oldView) != null ? ref2.from : void 0;
          }
          outgoing = (ref3 = _this.currentView) != null ? ref3.animate(_.extend(animationOptions, {
            properties: (ref4 = animProps.oldView) != null ? ref4.to : void 0
          })) : void 0;
          newView.props = (ref5 = animProps.newView) != null ? ref5.from : void 0;
          incoming = newView.animate(_.extend(animationOptions, {
            properties: (ref6 = animProps.newView) != null ? ref6.to : void 0
          }));
          if (_.contains(name, 'Out')) {
            newView.placeBehind(_this.currentView);
            outgoing.on(Events.AnimationEnd, function() {
              return _this.currentView.bringToFront();
            });
          } else {
            newView.placeBefore(_this.currentView);
          }
          _this.emit(Events.ViewWillSwitch, _this.currentView, newView);
          _this.saveCurrentViewToHistory(name, outgoing, incoming);
          _this.currentView = newView;
          _this.emit("change:previousView", _this.previousView);
          _this.emit("change:currentView", _this.currentView);
          return incoming.on(Events.AnimationEnd, function() {
            return _this.emit(Events.ViewDidSwitch, _this.previousView, _this.currentView);
          });
        };
      };
    })(this));
    if (options.initialViewName != null) {
      autoInitial = _.find(Framer.CurrentContext.getLayers(), function(l) {
        return l.name === options.initialViewName;
      });
      if (autoInitial != null) {
        this.switchInstant(autoInitial);
      }
    }
    if (options.initialView != null) {
      this.switchInstant(options.initialView);
    }
    if (options.backButtonName != null) {
      backButtons = _.filter(Framer.CurrentContext.getLayers(), function(l) {
        return _.contains(l.name, options.backButtonName);
      });
      for (i = 0, len = backButtons.length; i < len; i++) {
        btn = backButtons[i];
        btn.onClick((function(_this) {
          return function() {
            return _this.back();
          };
        })(this));
      }
    }
  }

  exports.define("previousView", {
    get: function() {
      return this.history[0].view;
    }
  });

  exports.prototype.saveCurrentViewToHistory = function(name, outgoingAnimation, incomingAnimation) {
    return this.history.unshift({
      view: this.currentView,
      animationName: name,
      incomingAnimation: incomingAnimation,
      outgoingAnimation: outgoingAnimation
    });
  };

  exports.prototype.back = function() {
    var backIn, moveOut, previous;
    previous = this.history[0];
    if (previous.view != null) {
      if (_.contains(previous.animationName, 'Out')) {
        previous.view.bringToFront();
      }
      backIn = previous.outgoingAnimation.reverse();
      moveOut = previous.incomingAnimation.reverse();
      backIn.start();
      moveOut.start();
      this.currentView = previous.view;
      this.history.shift();
      return moveOut.on(Events.AnimationEnd, (function(_this) {
        return function() {
          return _this.currentView.bringToFront();
        };
      })(this));
    }
  };

  return exports;

})(Layer);


},{}],"firebase":[function(require,module,exports){
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

exports.Firebase = (function(superClass) {
  var getCORSurl, request;

  extend(Firebase, superClass);

  getCORSurl = function(server, path, secret, project) {
    var url;
    switch (Utils.isWebKit()) {
      case true:
        url = "https://" + server + path + ".json?auth=" + secret + "&ns=" + project + "&sse=true";
        break;
      default:
        url = "https://" + project + ".firebaseio.com" + path + ".json?auth=" + secret;
    }
    return url;
  };

  Firebase.define("status", {
    get: function() {
      return this._status;
    }
  });

  function Firebase(options) {
    var base, base1, base2, base3;
    this.options = options != null ? options : {};
    this.projectID = (base = this.options).projectID != null ? base.projectID : base.projectID = null;
    this.secret = (base1 = this.options).secret != null ? base1.secret : base1.secret = null;
    this.server = (base2 = this.options).server != null ? base2.server : base2.server = void 0;
    this.debug = (base3 = this.options).debug != null ? base3.debug : base3.debug = false;
    if (this._status == null) {
      this._status = "disconnected";
    }
    Firebase.__super__.constructor.apply(this, arguments);
    if (this.server === void 0) {
      Utils.domLoadJSON("https://" + this.projectID + ".firebaseio.com/.settings/owner.json", function(a, server) {
        var msg;
        print(msg = "Add ______ server:" + '   "' + server + '"' + " _____ to your instance of Firebase.");
        if (this.debug) {
          return console.log("Firebase: " + msg);
        }
      });
    }
    if (this.debug) {
      console.log("Firebase: Connecting to Firebase Project '" + this.projectID + "' ... \n URL: '" + (getCORSurl(this.server, "/", this.secret, this.projectID)) + "'");
    }
    this.onChange("connection");
  }

  request = function(project, secret, path, callback, method, data, parameters, debug) {
    var url, xhttp;
    url = "https://" + project + ".firebaseio.com" + path + ".json?auth=" + secret;
    if (parameters !== void 0) {
      if (parameters.shallow) {
        url += "&shallow=true";
      }
      if (parameters.format === "export") {
        url += "&format=export";
      }
      switch (parameters.print) {
        case "pretty":
          url += "&print=pretty";
          break;
        case "silent":
          url += "&print=silent";
      }
      if (typeof parameters.download === "string") {
        url += "&download=" + parameters.download;
        window.open(url, "_self");
      }
      if (typeof parameters.orderBy === "string") {
        url += "&orderBy=" + '"' + parameters.orderBy + '"';
      }
      if (typeof parameters.limitToFirst === "number") {
        url += "&limitToFirst=" + parameters.limitToFirst;
      }
      if (typeof parameters.limitToLast === "number") {
        url += "&limitToLast=" + parameters.limitToLast;
      }
      if (typeof parameters.startAt === "number") {
        url += "&startAt=" + parameters.startAt;
      }
      if (typeof parameters.endAt === "number") {
        url += "&endAt=" + parameters.endAt;
      }
      if (typeof parameters.equalTo === "number") {
        url += "&equalTo=" + parameters.equalTo;
      }
    }
    xhttp = new XMLHttpRequest;
    if (debug) {
      console.log("Firebase: New '" + method + "'-request with data: '" + (JSON.stringify(data)) + "' \n URL: '" + url + "'");
    }
    xhttp.onreadystatechange = (function(_this) {
      return function() {
        if (parameters !== void 0) {
          if (parameters.print === "silent" || typeof parameters.download === "string") {
            return;
          }
        }
        switch (xhttp.readyState) {
          case 0:
            if (debug) {
              console.log("Firebase: Request not initialized \n URL: '" + url + "'");
            }
            break;
          case 1:
            if (debug) {
              console.log("Firebase: Server connection established \n URL: '" + url + "'");
            }
            break;
          case 2:
            if (debug) {
              console.log("Firebase: Request received \n URL: '" + url + "'");
            }
            break;
          case 3:
            if (debug) {
              console.log("Firebase: Processing request \n URL: '" + url + "'");
            }
            break;
          case 4:
            if (callback != null) {
              callback(JSON.parse(xhttp.responseText));
            }
            if (debug) {
              console.log("Firebase: Request finished, response: '" + (JSON.parse(xhttp.responseText)) + "' \n URL: '" + url + "'");
            }
        }
        if (xhttp.status === "404") {
          if (debug) {
            return console.warn("Firebase: Invalid request, page not found \n URL: '" + url + "'");
          }
        }
      };
    })(this);
    xhttp.open(method, url, true);
    xhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
    return xhttp.send(data = "" + (JSON.stringify(data)));
  };

  Firebase.prototype.get = function(path, callback, parameters) {
    return request(this.projectID, this.secret, path, callback, "GET", null, parameters, this.debug);
  };

  Firebase.prototype.put = function(path, data, callback, parameters) {
    return request(this.projectID, this.secret, path, callback, "PUT", data, parameters, this.debug);
  };

  Firebase.prototype.post = function(path, data, callback, parameters) {
    return request(this.projectID, this.secret, path, callback, "POST", data, parameters, this.debug);
  };

  Firebase.prototype.patch = function(path, data, callback, parameters) {
    return request(this.projectID, this.secret, path, callback, "PATCH", data, parameters, this.debug);
  };

  Firebase.prototype["delete"] = function(path, callback, parameters) {
    return request(this.projectID, this.secret, path, callback, "DELETE", null, parameters, this.debug);
  };

  Firebase.prototype.onChange = function(path, callback) {
    var currentStatus, source, url;
    if (path === "connection") {
      url = getCORSurl(this.server, "/", this.secret, this.projectID);
      currentStatus = "disconnected";
      source = new EventSource(url);
      source.addEventListener("open", (function(_this) {
        return function() {
          if (currentStatus === "disconnected") {
            _this._status = "connected";
            if (callback != null) {
              callback("connected");
            }
            if (_this.debug) {
              console.log("Firebase: Connection to Firebase Project '" + _this.projectID + "' established");
            }
          }
          return currentStatus = "connected";
        };
      })(this));
      return source.addEventListener("error", (function(_this) {
        return function() {
          if (currentStatus === "connected") {
            _this._status = "disconnected";
            if (callback != null) {
              callback("disconnected");
            }
            if (_this.debug) {
              console.warn("Firebase: Connection to Firebase Project '" + _this.projectID + "' closed");
            }
          }
          return currentStatus = "disconnected";
        };
      })(this));
    } else {
      url = getCORSurl(this.server, path, this.secret, this.projectID);
      source = new EventSource(url);
      if (this.debug) {
        console.log("Firebase: Listening to changes made to '" + path + "' \n URL: '" + url + "'");
      }
      source.addEventListener("put", (function(_this) {
        return function(ev) {
          if (callback != null) {
            callback(JSON.parse(ev.data).data, "put", JSON.parse(ev.data).path, _.tail(JSON.parse(ev.data).path.split("/"), 1));
          }
          if (_this.debug) {
            return console.log("Firebase: Received changes made to '" + path + "' via 'PUT': " + (JSON.parse(ev.data).data) + " \n URL: '" + url + "'");
          }
        };
      })(this));
      return source.addEventListener("patch", (function(_this) {
        return function(ev) {
          if (callback != null) {
            callback(JSON.parse(ev.data).data, "patch", JSON.parse(ev.data).path, _.tail(JSON.parse(ev.data).path.split("/"), 1));
          }
          if (_this.debug) {
            return console.log("Firebase: Received changes made to '" + path + "' via 'PATCH': " + (JSON.parse(ev.data).data) + " \n URL: '" + url + "'");
          }
        };
      })(this));
    }
  };

  return Firebase;

})(Framer.BaseClass);


},{}],"input":[function(require,module,exports){
var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

exports.keyboardLayer = new Layer({
  x: 0,
  y: Screen.height,
  width: 750,
  height: 432,
  image: "modules/keyboard.png"
});

exports.keyboardLayer.states.add({
  "shown": {
    y: Screen.height - exports.keyboardLayer.height
  }
});

exports.keyboardLayer.states.animationOptions = {
  curve: "spring(500,50,15)"
};

exports.Input = (function(superClass) {
  extend(Input, superClass);

  Input.define("style", {
    get: function() {
      return this.input.style;
    },
    set: function(value) {
      return _.extend(this.input.style, value);
    }
  });

  Input.define("value", {
    get: function() {
      return this.input.value;
    },
    set: function(value) {
      return this.input.value = value;
    }
  });

  function Input(options) {
    if (options == null) {
      options = {};
    }
    if (options.setup == null) {
      options.setup = false;
    }
    if (options.width == null) {
      options.width = Screen.width;
    }
    if (options.clip == null) {
      options.clip = false;
    }
    if (options.height == null) {
      options.height = 60;
    }
    if (options.backgroundColor == null) {
      options.backgroundColor = options.setup ? "rgba(255, 60, 47, .5)" : "transparent";
    }
    if (options.fontSize == null) {
      options.fontSize = 30;
    }
    if (options.lineHeight == null) {
      options.lineHeight = 30;
    }
    if (options.padding == null) {
      options.padding = 10;
    }
    if (options.text == null) {
      options.text = "";
    }
    if (options.placeholder == null) {
      options.placeholder = "";
    }
    if (options.virtualKeyboard == null) {
      options.virtualKeyboard = Utils.isMobile() ? false : true;
    }
    if (options.type == null) {
      options.type = "text";
    }
    if (options.goButton == null) {
      options.goButton = false;
    }
    Input.__super__.constructor.call(this, options);
    if (options.placeholderColor != null) {
      this.placeholderColor = options.placeholderColor;
    }
    this.input = document.createElement("input");
    this.input.id = "input-" + (_.now());
    this.input.style.cssText = "font-size: " + options.fontSize + "px; line-height: " + options.lineHeight + "px; padding: " + options.padding + "px; width: " + options.width + "px; height: " + options.height + "px; border: none; outline-width: 0; background-image: url(about:blank); background-color: " + options.backgroundColor + ";";
    this.input.value = options.text;
    this.input.type = options.type;
    this.input.placeholder = options.placeholder;
    this.form = document.createElement("form");
    if (options.goButton) {
      this.form.action = "#";
      this.form.addEventListener("submit", function(event) {
        return event.preventDefault();
      });
    }
    this.form.appendChild(this.input);
    this._element.appendChild(this.form);
    this.backgroundColor = "transparent";
    if (this.placeholderColor) {
      this.updatePlaceholderColor(options.placeholderColor);
    }
    if (!Utils.isMobile() || options.virtualKeyboard) {
      this.input.addEventListener("focus", function() {
        exports.keyboardLayer.bringToFront();
        return exports.keyboardLayer.states.next();
      });
      this.input.addEventListener("blur", function() {
        return exports.keyboardLayer.states["switch"]("default");
      });
    }
  }

  Input.prototype.updatePlaceholderColor = function(color) {
    var css;
    this.placeholderColor = color;
    if (this.pageStyle != null) {
      document.head.removeChild(this.pageStyle);
    }
    this.pageStyle = document.createElement("style");
    this.pageStyle.type = "text/css";
    css = "#" + this.input.id + "::-webkit-input-placeholder { color: " + this.placeholderColor + "; }";
    this.pageStyle.appendChild(document.createTextNode(css));
    return document.head.appendChild(this.pageStyle);
  };

  Input.prototype.focus = function() {
    return this.input.focus();
  };

  return Input;

})(Layer);


},{}],"libraryBooks":[function(require,module,exports){
exports.data = [
  {
    "cover": "http://edmonterrubio.com/files/book-covers/618CjM-Fm4L.jpg",
    "book": "100 Hungry Monkeys!",
    "subtitle": "None",
    "author": "Masayuki Sebe",
    "illustrator": "Masayuki Sebe",
    "year": 2014,
    "category": "Animals",
    "tags": "Monkeys, Kissing, Bedtime",
    "rating": "Liked it",
    "amazon": "4 stars",
    "timesRead": 1,
    "description": "This playful picture book encourages pre-readers and early readers to explore the concept of 100. Unusual in that it is a narrative-driven counting book, it offers a delightful and lively story about 100 hungry monkeys who set out to find themselves some food. Once their bellies are full, they all settle in for a nap, but then a monster suddenly appears. They fear he wants to make them lunch, so they all run for their lives. All ends well, however, once the monkeys realize the monster really just wants to be their friend."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/612r3iBpUdL.jpg",
    "book": "123 Versus ABC",
    "subtitle": "None",
    "author": "Mike Boldt",
    "illustrator": "Mike Boldt",
    "year": 2013,
    "category": "Animals",
    "tags": "Animals, Letters, Counting",
    "checkedOut": "2016-04-02T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Numbers think they're the stars of this book, but Letters disagree! Numbers and letters, the colorful characters in this story, compete to be the stars of this book. Their debate escalates when funny animals and props arrive—starting with 1 alligator, 2 bears, and 3 cars. Who is this book really about?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51RDHcUXL6L.jpg",
    "book": "A Bean, A Stalk, and A Boy Named Jack",
    "subtitle": "None",
    "author": "William Joyce",
    "illustrator": "Kenny Callicutt",
    "year": 2014,
    "category": "Fantasy",
    "tags": "Faiytales, Giant",
    "checkedOut": "2015-08-20T07:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "You might think you know the story of Jack and the Beanstalk, but you might want to think again. In this fairy tale with a twist, it hasn’t rained in days and the king has dictated that something must be done—his royal pinky is getting stinky! With a little magic from a wizard, young Jack, paired with his pea pod pal, will find a GIANT reason as to why there’s no water left in the kingdom...and prove that size doesn’t prevent anyone from doing something BIG."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51SSU1Nx-gL.jpg",
    "book": "A Call for a New Alphabet",
    "subtitle": "None",
    "author": "Jef Czejak",
    "illustrator": "Jef Czejak",
    "year": 2011,
    "category": "Fantasy",
    "tags": "Letters",
    "checkedOut": "2016-01-23T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Tired of being near the end of the alphabet, starting few words, and being governed by grammar rules, X calls for a vote on a new Alphabet Constitution and then dreams of how life would be if he became a different letter. Tired of being near the end of the alphabet, starting few words, and being governed by grammar rules, X calls for a vote on a new Alphabet Constitution, then dreams of how life would be if he became a different letter."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/71x4iy12bKL.jpg",
    "book": "A Day with the Animal Builders",
    "subtitle": "None",
    "author": "Sharon Rentta",
    "illustrator": "Sharon Rentta",
    "year": 2013,
    "category": "Animals",
    "tags": "Builders, Construction",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "The penguins' dream home is going to be amazing, with an ice rink, a helter-skelter and a swimming pool on the roof. However, the animal builders' apprentice, Donkey, is turning out to be a bit of a disaster. His bricklaying is a mess; he's a positive danger behind the wheel of a dumper truck, and his plumbing is a catastrophe. But who saves the day when a runaway bulldozer threatens to flatten all the builders' hard work? Donkey does! So that's what Donkey's good at: being super-strong!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/41RNKguQDQL.jpg",
    "book": "A Day with the Animal Doctors",
    "subtitle": "None",
    "author": "Sharon Rentta",
    "illustrator": "Sharon Rentta",
    "year": 2013,
    "category": "Animals",
    "tags": "Doctors",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "It's going to be a busy day for the Animal Doctors. A snake needs unknotting, a leopard has lost his spots, and a dog has swallowed an alarm clock . . . A fabulously funny book for every child who loves playing doctors and nurses."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61WwpBgrATL.jpg",
    "book": "A Day With Wilbur Robinson",
    "subtitle": "None",
    "author": "William Joyce",
    "illustrator": "William Joyce",
    "year": 2006,
    "category": "Humans",
    "tags": "Humorous",
    "checkedOut": "2015-09-19T07:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "While spending the day in the Robinson household, Wilbur's best friend joins in the search for Grandfather Robinson's missing false teeth and meets one wacky relative after another. This is an expanded version of A DAY WITH WILBUR ROBINSON (1990). While spending the day in the Robinson household, Wilbur's best friend joins in the search for Grandfather Robinson's missing false teeth and meets one wacky relative after another."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51uClH2HQ0L.jpg",
    "book": "A Dinosaur Called Tiny",
    "subtitle": "None",
    "author": "Alan Durant",
    "illustrator": "Jo Simpson",
    "year": 2008,
    "category": "Dinosaurs",
    "tags": "Dinosaurs",
    "checkedOut": "2015-12-31T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "None",
    "timesRead": 4,
    "description": "Tiny the dinosaur tries to make friends with the other young dinosaurs, who make fun of Tiny because of his size, but when one of his friends gets in trouble, Tiny's small size and big heart help save the day. Tiny the small dinosaur hatches from a large egg. He's too small to join the other dinosaurs in games. But when one of the dinosaurs in trouble, Tiny goes to the rescue."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61qa6uGSCjL.jpg",
    "book": "A Dog Wearing Shoes",
    "subtitle": "None",
    "author": "Sangmi Ko",
    "illustrator": "Sangmi Ko",
    "year": 2015,
    "category": "Animals",
    "tags": "Dogs, Shoes",
    "checkedOut": "2016-02-21T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "When Mini finds a small moppet of a dog, with fluffy ears, no collar, and wearing yellow booties, she understandably wants to take it home. Despite Mom s insistence that the dog probably already has a family, Mini gets attached and is awfully proud of her new pal, who can sing, sit, and give both paws. But when the pup runs off one day at the park, Mini comes to understand how someone else out there might be missing the little guy too."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61gwqPd1DTL.jpg",
    "book": "A Funny Thing Happened on the Way to School",
    "subtitle": "None",
    "author": "Davide Cali",
    "illustrator": "Benjamin Chaud",
    "year": 2015,
    "category": "Humans",
    "tags": "Excuses, Tardiness, Apes",
    "checkedOut": "2016-03-22T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Then there are the evil ninjas, massive ape, mysterious mole people, giant blob, and countless other daunting (and astonishing) detours along the way to school. Are these excuses really why this student is late? Or is there another explanation that is even more outrageous than the rest? From Davide Cali and Benjamin Chaud, the critically acclaimed author/illustrator team behind I Didn't Do My Homework Because . . . comes a fast-paced, actionpacked, laugh-out-loud story about finding the way to school despite the odds—and the unbelievable oddness!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51SWC4p6x-L.jpg",
    "book": "A Giraffe and a half",
    "subtitle": "None",
    "author": "Shel Silverstein",
    "illustrator": "Shel Silverstein",
    "year": 2014,
    "category": "Animals",
    "tags": "Giraffes, Rhymes",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 4,
    "description": "In this book, cumulative, rhyming text explains what might happen if you had a giraffe that stretched another half, put on a hat in which lived a rat that looked cute in a suit, and so on. Cumulative rhymed text explains what might happen if you had a giraffe that stretched another half, put on a hat in which lived a rat that looked cute in a suit, and so on."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/91AGYikzkoL.jpg",
    "book": "A Gold Star for Zog",
    "subtitle": "None",
    "author": "Julia Donaldson",
    "illustrator": "Axel Scheffler",
    "year": 2012,
    "category": "Fantasy",
    "tags": "Dragons",
    "checkedOut": "2016-01-30T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "Each year, as Zog practices new skills learned at Madam Dragon's school, a little girl helps him out, until one day, he finds a way to help make her dream come true for herself, a new friend, and Zog. Each year, as Zog practices new skills learned at Madam Dragon's school, a little girl helps him out until one day he finds a way to help make her dream come true for herself, a new friend, and Zog."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51RhAncNwOL.jpg",
    "book": "A Hungry Lion, Or, A Dwindling Assortment of Animals",
    "subtitle": "None",
    "author": "Lucy Ruth Cummins",
    "illustrator": "Lucy Ruth Cummins",
    "year": 2016,
    "category": "Animals",
    "tags": "Surprise, Penguins, Rabbits, Koalas",
    "rating": "Have not read yet",
    "amazon": "4.5 stars",
    "description": "There once was a hungry lion, a penguin (Well he was just here…), a little calico kitten (I could have sworn I just saw him…), a brown mouse (Now wait a second…), a bunny with floppy ears and a bunny with un-floppy ears (Okay this is just getting ridiculous), a frog, a bat, a pig, a slightly bigger pig, a wooly sheep, a koala, a hen, and also a turtle. Hey! What’s going on here… The very hungry lion is all set to enjoy an exciting day with his other animal pals. But all of a sudden his friends start disappearing at an alarming rate! Is someone stealing the hungry lion’s friends, or is the culprit a little…closer to home?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/512dSPnFxoL.jpg",
    "book": "A Kitten Tale",
    "subtitle": "None",
    "author": "Eric Rohmann",
    "illustrator": "Eric Rohmann",
    "year": 2008,
    "category": "Animals",
    "tags": "Cats",
    "checkedOut": "2016-02-12T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "Four kittens have never seen the snow. The first three kittens are wary--snow is cold, it's wet, it covers everything. This unknown thing called snow is a little bit. . . scary. As the seasons pass and winter begins to loom, the three skittish kittens worry. But the fourth kitten takes a different view. The fourth kitten is getting excited. Snow will cover everything?! \"I can't wait!\""
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61XciAPhdmL.jpg",
    "book": "Adventures With Barefoot Critters",
    "subtitle": "None",
    "author": "Teagan White",
    "illustrator": "Teagan White",
    "year": 2014,
    "category": "Animals",
    "tags": "Seasons, Alphabet",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Join an adorable cast of animal characters as they explore the alphabet through the seasons. From gathering honey in spring to building cozy campfires in fall, the friends make the most of each season, both enjoying the great outdoors and staying snug inside. Learning the alphabet is fun when adventuring with these critters, and children and adults alike will delight in Teagan White's sweet, nostalgic illustrations."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61T6oqNHSVL.jpg",
    "book": "Alexander and the Terrible, Horrible, No Good, Very Bad Day",
    "subtitle": "None",
    "author": "Judith Viorst",
    "illustrator": "Ray Cruz",
    "year": 2009,
    "category": "Humans",
    "tags": "Humorous",
    "checkedOut": "2015-12-31T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "On a day when everything goes wrong for him, Alexander is consoled by the thought that other people have bad days too. One day when everything goes wrong for him, Alexander is consoled by the thought that other people have bad days, too."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/91QXnlCeNHL.jpg",
    "book": "Aliens Love Underpants",
    "subtitle": "None",
    "author": "Claire Freedman",
    "illustrator": "Ben Cort",
    "year": 2013,
    "category": "Fantasy",
    "tags": "Aliens, Underwear",
    "checkedOut": "2016-03-11T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 3,
    "description": "When aliens come to Earth, it is for the simple reason that they love to play with and hide in freshly laundered underpants of all shapes and sizes. Illustrations and rhyming text reveal the true reason aliens visit Earth is that they deem underpants so much fun to play with."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/71GCD2xskdL.jpg",
    "book": "All Paws on Deck",
    "subtitle": "Haggis and Tank Unleashed #1",
    "author": "Jessica Young",
    "illustrator": "James Burks",
    "year": 2015,
    "category": "Animals",
    "tags": "Dogs",
    "checkedOut": "2016-01-23T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "Tank is a clumsy, outgoing Great Dane, and Haggis is a bored, curmudgeonly Scottie--so one afternoon Tank suggests they turn the wagon in the backyard into a ship and play pirate."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61pVkJswdyL.jpg",
    "book": "Amelia Bedelia's First Library Card",
    "subtitle": "None",
    "author": "Herman Parish",
    "illustrator": "Lynne Avril",
    "year": 2013,
    "category": "Humans",
    "tags": "Girls",
    "checkedOut": "2016-02-21T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "3.5 stars",
    "timesRead": 0,
    "description": "Amelia Bedelia helps out at the library with her classmates and wonders what kind of book she should borrow when she receives her first library card. Amelia Bedelia loves to read, so a visit to the library is right up her alley. Amelia Bedelia and her classmates are especially excited to meet the librarians, help out at the circulation desk, and investigate the stacks."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51sgZjnPbcL.jpg",
    "book": "An Extraordinary Egg",
    "subtitle": "None",
    "author": "Leo Lionni",
    "illustrator": "Leo Lionni",
    "year": 1998,
    "category": "Animals",
    "tags": "Alligators, Frogs, Friendship, Identity",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "It's an extraordinary day on Pebble Island for three frogs when one of them discovers a beautiful white egg. They've never seen a chicken egg before, but they're sure that's what this must be. So when the egg hatches and out crawls a long green, scaly creature, they naturally call it . . . a chicken! From award winning-artist Leo Lionni, here's a hilarious case of mistaken identity that children are sure to delight in."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/517-pXUSSEL.jpg",
    "book": "Angelina Ballerina",
    "subtitle": "None",
    "author": "Katharine Holabird",
    "illustrator": "Helen Craig",
    "year": 2008,
    "category": "Animals",
    "tags": "Ballet Dancing, Mice, Dancers",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "A pretty little mouse wants to become a ballerina more than anything else in the world. Angelina loves to dance and wants to become a ballerina more than anything else in the world. A true modern classic, Angelina continues to be adored by her legions of fans. Featuring a lavish jacket that’s as sparkly as one of Angelina’s costumes, this book is the perfect way to commemorate her anniversary."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51YGpFOilPL.jpg",
    "book": "Are the Dinosaurs Dead, Dad?",
    "subtitle": "None",
    "author": "Julie Middleton",
    "illustrator": "Russell Ayto",
    "year": 2013,
    "category": "Dinosaurs",
    "tags": "Dinosaurs, Museum, humans",
    "checkedOut": "2016-02-23T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Kids love to imagine what dinosaurs might have been like when they were alive. But when a trip to the museum turns into a real-life prehistoric encounter, Dave and his dad don t need to use their imagination. As they walk through the rooms of the exhibit, Dave keeps trying to get his dads attention. The dinosaurs around him spring to life, but Dad remains oblivious to the unfolding scene and keeps insisting they re dead. Dave knows better, though, and when they find themselves pursued by a hungry Tyrannosaurus, Dad finally realizes it too!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/510LpmPvqrL.jpg",
    "book": "Bad Dog, Marley!",
    "subtitle": "None",
    "author": "John Grogan",
    "illustrator": "Richard Cowdrey",
    "year": 2011,
    "category": "Animals",
    "tags": "Dogs",
    "checkedOut": "2016-02-27T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "Mommy, Daddy, Cassie, and Baby Louie welcome Marley, a lovable puppy, into their home. But Marley doesn’t stay a pint-sized pup for long. He grows and grows, and the bigger Marley gets, the bigger trouble he gets into. Big, bad-boy trouble. Will this family have to find a new home for their misbehaving pooch, or will he prove he can be a good boy?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/81Z3NJsVXAL.jpg",
    "book": "Bad Kitty",
    "subtitle": "None",
    "author": "Nick Bruel",
    "illustrator": "Nick Bruel",
    "year": 2015,
    "category": "Animals",
    "tags": "Cats",
    "checkedOut": "2016-04-02T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Kitty is not happy hen she's told that her favorite foods are all gone and all that's left are Asparagus, Beets, Cauliflower, Dill...and 22 other equally unappealing vegetables. So she: Ate my homework, Bit grandma, Clawed the curtains, Damaged the dishes, and so on, through Z. Only when tastier things arrive (An Assortment of Anchovies, Buffalo Burritos, Chicken Cheesecake...) does she Apologize to Grandma."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51C2nxiDLBL.jpg",
    "book": "Badger's Fancy Meal",
    "subtitle": "None",
    "author": "Keiko Kasza",
    "illustrator": "Keiko Kasza",
    "year": 2009,
    "category": "Animals",
    "tags": "Badgers",
    "rating": "Have not read yet",
    "amazon": "4.5 stars",
    "description": "Badger just can?t face eating the same old apples, worms, and roots. They?re too boring! He dreams of eating something new and fancy. Badger gets some yummy ideas from seeing the animals who live near his den, but the main ingredients he tries to catch aren?t so eager to become his lunch. And in the end, they unwittingly convince Badger that he should have appreciated what he had in the first place."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51LYH8wlhSL.jpg",
    "book": "Bedtime!",
    "subtitle": "None",
    "author": "Christine Anderson",
    "illustrator": "Steven Salerno",
    "year": 2005,
    "category": "Humans",
    "tags": "Dogs, Human",
    "checkedOut": "2015-09-11T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 3,
    "description": "It’s bedtime. But Melanie is far too busy to sleep. The tower she is building needs to be BIGGER—what if elephants come over to play? Yet Mom is just as stubborn as Melanie, and somebody is going to take a bath, put on her princess pajamas, kiss Daddy goodnight and get under the covers for a bedtime story. The only question is:Who? With irresistible illustrations by Steven Salerno, this hilarious picture book—based on a real event in the author’s life—will light a mischievous gleam in the eyes of parents and children everywhere."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51qcdmYBDUL.jpg",
    "book": "Betty Bunny Loves Chocolate Cake",
    "subtitle": "None",
    "author": "Michael Kaplan",
    "illustrator": "Stephane Jorisch",
    "year": 2011,
    "category": "Animals",
    "tags": "Cake, Rabbits, Behavior",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "From her first bite, young Betty Bunny likes chocolate cake so much that she claims she will marry it one day, and she has trouble learning to wait patiently until she can have her next taste."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51jK6xWad8L.jpg",
    "book": "Betty Bunny Wants Everything",
    "subtitle": "None",
    "author": "Michael Kaplan",
    "illustrator": "Stephane Jorisch",
    "year": 2012,
    "category": "Animals",
    "tags": "Rabbits, Shopping, Avarice, Family",
    "rating": "Liked it",
    "amazon": "4 stars",
    "timesRead": 1,
    "description": "Betty Bunny's mother takes her and her siblings to a toy store, where each is allowed to pick out one item, but Betty refuses to choose just one and throws a tantrum when she learns the alternative is to get nothing. Betty Bunny's mother takes her and her siblings to a toy store where each is allowed to pick out one item, but Betty refuses to choose just one and throws a tantrum when she learns the alternative is to get nothing."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51HoXwJCsyL.jpg",
    "book": "Billy's Booger",
    "subtitle": "A Memoir",
    "author": "William Joyce",
    "illustrator": "William Joyce",
    "year": 2015,
    "category": "Humans",
    "tags": "Contest, Imagination, School",
    "checkedOut": "2016-04-02T07:00:00.000Z",
    "rating": "Did Not Like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Billy loves to draw. He draws on books and on his homework and even on his math tests he might not get the answer right, but doesn t it look swell sitting in a boat at sea? His teacher doesn t think so, and neither does the principal. But the librarian has an idea that just might help Billy better direct his illustrative energies: a book-making contest! Billy gets right to work, reading everything he can about meteors, mythology, space travel, and mucus?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/A1t7y62Sc2L.jpg",
    "book": "Bo-La-La Witch Spa",
    "subtitle": "None",
    "author": "Samantha Berger",
    "illustrator": "Isabel Roxas",
    "year": 2015,
    "category": "Fantasy",
    "tags": "Witches",
    "checkedOut": "2016-01-23T08:00:00.000Z",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "Halloween is the most important day of the year for any witch. So when the holiday ends and the witches are tired from tricking and treating, they all head to the fa-boo Witch Spa. Here they indulge in Bat-Whisker Tea, Broom Bristle Facials, and other spooky spa goodies. A trip to the Witch Spa is sure to make any witch or warlock feel refreshed, revived, and positively revolting."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51Ms1U+6OML.jpg",
    "book": "Bob the Dog",
    "subtitle": "None",
    "author": "Rodrigo Folgueira, Poly Bernatene",
    "illustrator": "Rodrigo Folgueira, Poly Bernatene",
    "year": 2011,
    "category": "Animals",
    "tags": "Dogs, Owls, Rabbits, Cats",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "Bob the Dog and Mark are playing in the park one day when Bob swallows a yellow canary. What will they do? This whimsical tale and its cast of friendly characters will delight young readers and adults alike! This picture book features vibrant full-color illustrations."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61vKzxGODxL.jpg",
    "book": "Boot & Shoe",
    "subtitle": "None",
    "author": "Marla Frazee",
    "illustrator": "Marla Frazee",
    "year": 2012,
    "category": "Animals",
    "tags": "Dogs",
    "checkedOut": "2015-12-31T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 3,
    "description": "Boot and Shoe are dogs that live in the same house, eat from the same bowl, and sleep in the same bed but spend their days on separate porches, until a squirrel mixes things up. Boot and Shoe are dogs that live in the same house, eat from the same bowl, and sleep in the same bed but spend their days on separate porches until a squirrel mixes things up."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/41vKY1fpk+L.jpg",
    "book": "Boy + Bot",
    "subtitle": "None",
    "author": "Ame Dyckman",
    "illustrator": "Dan Yaccarino",
    "year": 2012,
    "category": "Humans",
    "tags": "Robots",
    "checkedOut": "2015-12-31T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "One day, a boy and a robot meet in the woods. They play. They have fun. But when Bot gets switched off, Boy thinks he's sick. The usual remedies—applesauce, reading a story—don't help, so Boy tucks the sick Bot in, then falls asleep. Bot is worried when he powers on and finds his friend powered off. He takes Boy home with him and tries all his remedies: oil, reading an instruction manual. Nothing revives the malfunctioning Boy! Can the Inventor help fix him?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51vgPpRvedL.jpg",
    "book": "Bruno Munari's Zoo",
    "subtitle": "None",
    "author": "Bruno Munari",
    "illustrator": "Bruno Munari",
    "year": 2005,
    "category": "Animals",
    "tags": "Zoo",
    "checkedOut": "2016-02-26T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 3,
    "description": "Illustrations and brief text introduce more than twenty zoo animals, including a rhinoceros that is always ready to fight and a kangaroo that is all legs but doesn't know it."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61K5fAd-7qL.jpg",
    "book": "Bug in A Vacuum",
    "subtitle": "None",
    "author": "Melanie Watt",
    "illustrator": "Melanie Watt",
    "year": 2015,
    "category": "Animals",
    "tags": "Flies, Insects, Vacumm Cleaners",
    "checkedOut": "2016-02-12T08:00:00.000Z",
    "rating": "Loved it",
    "amazon": "4.5 stars",
    "timesRead": 6,
    "description": "A bug flies through an open door into a house, through a bathroom, across a kitchen and bedroom and into a living room ... where its entire life changes with the switch of a button. Sucked into the void of a vacuum bag, this one little bug moves through denial, bargaining, anger, despair and eventually acceptance -- the five stages of grief -- as it comes to terms with its fate. Will there be a light at the end of the tunnel? Will there be dust bunnies in the void? A funny, suspenseful and poignant look at the travails of a bug trapped in a vacuum."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61bYJr9bm-L.jpg",
    "book": "Bunnies!!!",
    "subtitle": "None",
    "author": "Kevan Atteberry",
    "illustrator": "Kevan Atteberry",
    "year": 2015,
    "category": "Animals",
    "tags": "Rabbits",
    "checkedOut": "2015-10-10T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "Story time for little ones has never been this exciting! When a friendly monster spots a group of bunnies in the woods, his delight is contagious! And when they're gone, how he misses them so! With bright illustrations and a simple text, this is the most fun type of read aloud and one that mirrors most every toddler's emotional life."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/91hRxfkmyyL.jpg",
    "book": "Buster the Little Garbage Truck",
    "subtitle": "None",
    "author": "Marcia Berneger",
    "illustrator": "Kevin Zimmer",
    "year": 2015,
    "category": "Fantasy",
    "tags": "Fears, Trucks",
    "checkedOut": "2016-03-11T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "Buster is a sweet little garbage truck. He can't wait to grow up to be a big truck, just like his father. Buster practices driving and lifting and beeping with his friend, Kitty. There's one small problem. Loud noises frighten Buster. When his father takes him to the truck yard to meet the other vehicles, their air-horn blasts and roaring engines send Buster skidding away to hide. He wants to be big and brave, but how can he work with Daddy and his friends when their loud sounds scare him? Buster feels terrible. When Kitty gets into trouble, little Buster musters up his courage to save her."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51m0p5S6e1L.jpg",
    "book": "By Mouse & Frog",
    "subtitle": "None",
    "author": "Deborah Freedman",
    "illustrator": "Deborah Freedman",
    "year": 2015,
    "category": "Animals",
    "tags": "Frogs, Mice",
    "checkedOut": "2016-03-11T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4 stars",
    "timesRead": 0,
    "description": "Fastidious Mouse has one idea about how to tell a story. Free-spirited Frog has another. What happens when Frog crashes into Mouse's story with some wild ideas? Chaos!...followed by the discovery that working together means being willing to compromise—and that listening to one another can lead to the most beautiful stories of all."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/510c6Zngj-L.jpg",
    "book": "Calvin, Look Out!",
    "subtitle": "A Bookworm Birdie Gets Glasses",
    "author": "Jennifer Berne",
    "illustrator": "Keith Bendis",
    "year": 2014,
    "category": "Animals",
    "tags": "Owls",
    "checkedOut": "2016-02-12T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "But when Bot gets switched off, Boy thinks he's sick. The usual remedies—applesauce, reading a story—don't help, so Boy tucks the sick Bot in, then falls asleep."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51ZhoRNKN0L.jpg",
    "book": "Camp Rex",
    "subtitle": "None",
    "author": "Molly Idle",
    "illustrator": "Molly Idle",
    "year": 2014,
    "category": "Dinosaurs",
    "tags": "Dinosaurs",
    "checkedOut": "2015-09-19T07:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4 stars",
    "timesRead": 0,
    "description": "It’s important to set a few wilderness safety guidelines first. . . like making sure he stays on the trail. And does not disturb the local wildlife. And knows how to build a safe campfire. But sometimes dinosaurs have a different way of doing things, and that’s why it’s best to be prepared . . . for anything! Cordelia and her troup of dino-scouts enjoy a camping trip in the great outdoors."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61r5HK3CJbL.jpg",
    "book": "Can You Make A Scary Face?",
    "subtitle": "None",
    "author": "Jan Thomas",
    "illustrator": "Jan Thomas",
    "year": 2009,
    "category": "Animals",
    "tags": "Insects, Ladybug",
    "checkedOut": "2015-08-20T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "Bot is worried when he powers on and finds his friend powered off. He takes Boy home with him and tries all his remedies: oil, reading an instruction manual. Nothing revives the malfunctioning Boy! Can the Inventor help fix him?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51mf4XIwFVL.jpg",
    "book": "Carnivores",
    "subtitle": "None",
    "author": "Aaron Reynolds",
    "illustrator": "Dan Santat",
    "year": 2013,
    "category": "Animals",
    "tags": "Clubs, Carnivores, Food Chains",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "A lion, a great white shark, and a timber wolf, all meat-eaters who have been hurt by the cruelty of plant-eaters, form a support group that has limited success until their newest member, a great horned owl, shares some advice. A lion, a great white shark, and a timber wolf, all meat-eaters who have been hurt by the cruelty of plant-eaters, form a support group which has limited success until their newest member, a great horned owl, shares some advice."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/71uSjVVPM1L.jpg",
    "book": "Catch That Cookie!",
    "subtitle": "None",
    "author": "Hallie Durand",
    "illustrator": "David Small",
    "year": 2014,
    "category": "Humans",
    "tags": "School",
    "checkedOut": "2016-02-21T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "Marshall knows one thing for sure, despite what all the stories say: Gingerbread men cannot run. Cookies are for eating, and he can't wait to eat his after spending all morning baking them with his class. But when it's time to take the gingerbread men out of the oven . . . they're gone! Now, to find those rogue cookies, Marshall and his class have to solve a series of rhyming clues. And Marshall just might have to rethink his stance on magic."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61lQ4hbFInL.jpg",
    "book": "Charlotte Jane Battles Bedtime!",
    "subtitle": "None",
    "author": "Myra Wolfe",
    "illustrator": "Maria Monescillo",
    "year": 2011,
    "category": "Humans",
    "tags": "Parents, Child, Pirates, Sleep",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Charlotte Jane the Hearty gets all the juice out of her days with pirate-girl pizzazz! She loves swashbuckling sessions, treasure hunts, and Fantastic Feats of Daring—all of which prove she hasformidable oomph. There’s absolutely no room in her day for bedtime. But can Charlotte Jane refuse to snooze and still be her hearty pirate self?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/415Ce-XktvL.jpg",
    "book": "Chicken Big!",
    "subtitle": "None",
    "author": "Keith Graves",
    "illustrator": "Keith Graves",
    "year": 2014,
    "category": "Animals",
    "tags": "Chickens, Size",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 3,
    "description": "On a teeny little farm, in an itty-bitty coop, a very small hen laid a big, giant egg. And out of this egg came one big, humongous . . . something. No matter how they try, these clueless chickens can't make sense of the gigantic new member of their family—until he saves the day. With wacky, laugh-out-loud humor and silliness to spare, this BIG twist on the classic Chicken Little story lends a whole new perspective to what it means to be chicken."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51dQmtyVQ1L.jpg",
    "book": "Chicks Run Wild",
    "subtitle": "None",
    "author": "Sudipta Bardhan-Quallen",
    "illustrator": "Ward Jenkins",
    "year": 2011,
    "category": "Animals",
    "tags": "Chickens",
    "checkedOut": "2015-10-10T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "When Mama Chick kisses her kids goodnight, she expects them to stay in bed, but those chicks...run...wild! They jump around and do cartwheels, until Mama comes in and says \"You're all in trouble. But when she turns out the lights...they start a pillow fight! Finally, Mama gets them settled, but she's not ready for bed either!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51WtDkFj8qL.jpg",
    "book": "Children Make Terrible Pets",
    "subtitle": "None",
    "author": "Peter Brown",
    "illustrator": "Peter Brown",
    "year": 2010,
    "category": "Animals",
    "tags": "Bears, Children",
    "checkedOut": "2015-10-10T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 3,
    "description": "When Lucy, a young bear, discovers a boy in the woods, she's absolutely delighted. She brings him home and begs her mom to let her keep him, even though her mom warns, \"Children make terrible pets.\" But mom relents, and Lucy gets to name her new pet Squeaker."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61Mp8SNtnFL.jpg",
    "book": "Cinderella's Stepsister and the Big Bad Wolf",
    "subtitle": "None",
    "author": "Lorraine Carey",
    "illustrator": "Migy Blanco",
    "year": 2015,
    "category": "Humans",
    "tags": "Faiytales",
    "checkedOut": "2015-10-10T07:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4 stars",
    "timesRead": 0,
    "description": "So, you think you know the story of Cinderella? Well, you'd better think again because in this hilarious tale, nothing is what it seems. Did you know that Cinderella wasn't actually very nice? And that there were three Ugly stepsisters? And that the youngest sister, Gertie, was absolutely the nicest person you could ever hope to meet? But she'll have to act mean and bad like the rest of her family if she wants to go to the ball. With the help of some favorite fairy-tale characters, can she learn how to fit in with her family in time?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61vbN+azHIL.jpg",
    "book": "Clark the Shark",
    "subtitle": "None",
    "author": "Bruce Hale",
    "illustrator": "Guy Francis",
    "year": 2013,
    "category": "Animals",
    "tags": "Sharks",
    "checkedOut": "2016-01-23T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "Clark finds everything about school fun and exciting, but his enthusiasm causes problems until he begins inventing rhymes to remind himself to stay cool at school. Clark finds everything about school fun and exciting, but his enthusiasm causes problems when he begins inventing rhymes to remind himself to stay cool at school."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61vcqmXeugL.jpg",
    "book": "Cock-a-doodle-doo-bop!",
    "subtitle": "None",
    "author": "Michael Ian Black",
    "illustrator": "Matt Myers",
    "year": 2015,
    "category": "Animals",
    "tags": "Roosters, Farm Life",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Mel the rooster s boring old cock-a-doodle-doo is making him cock-a-doodle-blue until one day he decides to jazz it up with something brand-new: the cock-a-doodle-doo-bop! But while Mel scats and trumpets away to his revised refrain, the rest of the barnyard isn t getting into the groove. Because they want the sun, and the sun won t rise to Mel s creative interpretation of his standard cock-a-doodle-crow. So the barnyard residents will have to band together and compromise to bring about a fresh day in a fresh way!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/91kiHZbkCrL.jpg",
    "book": "Corduroy",
    "subtitle": "None",
    "author": "Don Freedman",
    "illustrator": "Don Freedman",
    "year": 2008,
    "category": "Animals",
    "tags": "Bears",
    "checkedOut": "2016-01-12T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "Don Freeman's classic character, Corduroy, is even more popular today then he was when he first came on the scene in 1968. This story of a small teddy bear waiting on a department store shelf for a child’s friendship has appealed to young readers generation after generation."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/618ItDVSRrL.jpg",
    "book": "Count the Monkeys",
    "subtitle": "None",
    "author": "Marc Barnnett",
    "illustrator": "Kevin Cornell",
    "year": 2013,
    "category": "Animals",
    "tags": "Monkeys",
    "checkedOut": "2015-10-10T07:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "Kids will giggle as they count all the animals that have frightened the monkeys off the pages. Full of fun reader interactions and keeps readers guessing until the very last page! Matching Mac Barnett's brilliant wit are Kevin Cornell's luminous illustrations, which will have young readers begging to count the monkeys all over again."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/617CfEOVO6L.jpg",
    "book": "Counting Crocodiles",
    "subtitle": "None",
    "author": "Judy Sierra",
    "illustrator": "Will Hillenbrand",
    "year": 2001,
    "category": "Animals",
    "tags": "Crocodiles, Monkeys, Counting, Folklore",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "By using her ability to count, a clever monkey outwits the hungry crocodiles that stand between her and a banana tree on another island across the sea. In this rhymed retelling of a traditional Asian tale, a clever monkey uses her ability to count to outwit the hungry crocodiles that stand between her and a banana tree on another island across the sea."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51SPIWmEusL.jpg",
    "book": "Cowboy Boyd and Mighty Calliope",
    "subtitle": "None",
    "author": "Lisa Moser",
    "illustrator": "Sebastiaan Van Doninck",
    "year": 2013,
    "category": "Humans",
    "tags": "Cowboys, Rhinoceroses, Ranch, Animals",
    "checkedOut": "2016-03-11T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "A cowboy and his trusty rhinoceros try to prove themselves at the Double R Ranch, where Slim, Hardtack, and Rancher Rose doubt Calliope's potential, but Boyd believes in her. A cowboy and his trusty rhinocerous try to prove themselves at the Double R Ranch, where the Slim, Hardtack, and Rancher Rose doubt Calliope's potential, but Boyd believes in her."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51oi+rWMaCL.jpg",
    "book": "Crankenstein",
    "subtitle": "None",
    "author": "Samantha Berger",
    "illustrator": "Dan Santat",
    "year": 2013,
    "category": "Fantasy",
    "tags": "Monsters",
    "checkedOut": "2016-01-30T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "He may look like any boy, but when faced with a rainy day, a melting Popsicle, or an early bedtime, one boy transforms into a mumbling, grumbling Crankenstein. When he meets his match in a fellow Crankenstein, the results could be catastrophic. A boy who looks ordinary transforms into grumbling Crankenstein when faced with a rainy day, a melting popsicle, or bedtime but everything changes when he meets a fellow Crankenstein."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51sKulT8Y+L.jpg",
    "book": "Curious George Flies A Kite",
    "subtitle": "None",
    "author": "Margret Rey",
    "illustrator": "Margret Rey",
    "year": 1977,
    "category": "Animals",
    "tags": "Monkeys",
    "checkedOut": "2015-12-10T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "After a day of playing with a ball, fishing at the lake, and losing a baby rabbit, Curious George needs to be rescued when he tries to fly a kite. A little monkey needs to be rescued when he tries to fly a kite."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61pV3Mcd9LL.jpg",
    "book": "Dangerously Ever After",
    "subtitle": "None",
    "author": "Dashka Slater",
    "illustrator": "Valeria Docampo",
    "year": 2012,
    "category": "Humans",
    "tags": "Princesses, Gardens",
    "checkedOut": "2016-03-22T07:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Princess Amanita laughs in the face of danger. Brakeless bicycles, pet scorpions, spiky plants--that's her thing. So when quiet Prince Florian gives her roses, Amanita is unimpressed . . . until she sees their glorious thorns! Now she must have rose seeds of her own. But when huge, honking noses grow instead, what is a princess with a taste for danger to do?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61N7hK6D4iL.jpg",
    "book": "Dino-swimming",
    "subtitle": "None",
    "author": "Lisa Wheeler",
    "illustrator": "Barry Gott",
    "year": 2015,
    "category": "Dinsosaurs",
    "tags": "Swimming",
    "checkedOut": "2015-12-10T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "The Land Sharks take on the Algae Eaters in a dino-swimming showdown! Raptor and Stegosaurus start it off in the individual medley, while the Ptero twins battle it out in the butterfly race. Then Galli and Diplo wow the crowd with their flips and tricks off the diving board! But which team will win the swim meet? It comes down to the last event, the backstroke. Both Stego and Galli think they'll take the prize. Let's hope these dinos remembered their goggles this swim meet is bound to make a splash!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/91weNzTOXpL.jpg",
    "book": "Disney Fairies Storybook Collection",
    "subtitle": "None",
    "author": "Disney Book Group",
    "illustrator": "Disney Book Group",
    "year": 2014,
    "category": "Fantasy",
    "tags": "Fairies",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "Join Tinker Bell, Vidia, Rosetta, Silvermist, Iridessa, Fawn, and the rest of their friends in this magical storybook collection. Featuring 18 stories, including 4 original tales, and retellings of Tinker Bell, Tinker Bell and the Lost Treasure, and Tinker Bell and the Great Fairy Rescue, young readers are in for hours of pixie-dusted fun."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51ARjEU4B1L.jpg",
    "book": "Do You Really Want A Horse?",
    "subtitle": "Do You Really Want a Pet?",
    "author": "Bridget Heos",
    "illustrator": "Katya Longhi",
    "year": 2013,
    "category": "Animals",
    "tags": "Horses, Pets",
    "checkedOut": "2016-03-22T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "So you really want a pet? The dog will turn your house into a gym if you don’t walk him, the cat will join a gang if you don’t bring it in at night, and the rabbit will begin looking like a walrus with nothing to chew. These humorous but cautionary tales show kids why they should be careful what they wish for… or at least be prepared for the responsibility."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51Mf5aTuexL.jpg",
    "book": "Dogs",
    "subtitle": "None",
    "author": "Emily Gravett",
    "illustrator": "Emily Gravett",
    "year": 2010,
    "category": "Animals",
    "tags": "Dogs",
    "checkedOut": "2015-11-24T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "Gorgeous canines of every shape, size and color are bounding through this irresistible book. Can you choose one dog to love best of all? With playful pencil and watercolor illustrations to delight children and adults alike, everyone will long to bark along with the Chihuahua and tickle the Dalmatian's tummy. This is a wonderfully satisfying book with a twist in the tail."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61x5f9BhBDL.jpg",
    "book": "Dragons Love Tacos",
    "subtitle": "None",
    "author": "Adam Rubin",
    "illustrator": "Daniel Saimieri",
    "year": 2012,
    "category": "Fantasy",
    "tags": "Dragons",
    "checkedOut": "2015-12-31T08:00:00.000Z",
    "rating": "Loved it",
    "amazon": "4.5 stars",
    "timesRead": 6,
    "description": "Dragons love tacos. They love chicken tacos, beef tacos, great big tacos, and teeny tiny tacos. So if you want to lure a bunch of dragons to your party, you should definitely serve tacos. Buckets and buckets of tacos. Unfortunately, where there are tacos, there is also salsa. And if a dragon accidentally eats spicy salsa . . . oh, boy. You're in red-hot trouble."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51z0Bs8hlWL.jpg",
    "book": "Duck, Duck, Dinosaur",
    "subtitle": "None",
    "author": "Kallie George",
    "illustrator": "Oriol Vidal",
    "year": 2016,
    "category": "Animals",
    "tags": "Dinosaurs, Ducks",
    "rating": "Liked it",
    "amazon": "None",
    "timesRead": 2,
    "description": "Three eggs in a nest begin to wiggle and wobble, until CRACK! CRACK! CRACK! It’s a duck . . . duck . . . DINOSAUR! Meet Feather, Flap, and Spike. They’re three unlikely siblings who each want to stand out. But together, they make the biggest splash! Perfect for families of all kinds, this playful, clever story has a dino-sized heart."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/615yz4ab4TL.jpg",
    "book": "Duddle Puck",
    "subtitle": "The Puddle Duck",
    "author": "Karma Wilson",
    "illustrator": "Marcellus Hall",
    "year": 2015,
    "category": "Animals",
    "tags": "Ducks, Birds",
    "checkedOut": "2016-01-23T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "A very odd duck that refuses to quack shocks and flusters animals all over the farm with his clucking, honking, oinking, and neighing."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51VQNhdlnsL.jpg",
    "book": "Duncan the Story Dragon",
    "subtitle": "None",
    "author": "Amanda Driscoll",
    "illustrator": "Amanda Driscoll",
    "year": 2015,
    "category": "Fantasy",
    "tags": "Dragons, Friendship",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Duncan the Dragon loves to read. When he reads a story, his imagination catches fire! Unfortunately . . . so does his book. Fire breath is great for roasting marshmallows, but it’s not so great for reading. Duncan just wants to get to those two wonderful words, like the last sip of a chocolate milk shake: The End. Will he ever find out how the story ends?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61hd+OvlxNL.jpg",
    "book": "Edmond, the Moonlit Party",
    "subtitle": "None",
    "author": "Astrid Desbordes",
    "illustrator": "Marc Boutavant",
    "year": 2015,
    "category": "Animals",
    "tags": "Owls, Squirrels, Friendship, Parties",
    "checkedOut": "2016-02-27T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "Edmond the squirrel is shy and a bit lonely, but he nevertheless believes that his life is just as it should be. He's happy making his colorful pompoms, stirring his nut jam, and going to sleep early. But one evening, when there's once again a party in his apartment house tree, the fragrance of his jam brings an unexpected visitor to his door. With the entrance of Owl, an aficionado of disguises and fun, into his life, everything begins to change for Edmond. Not only does he agree to attend Owl's party. He goes and has the best evening ever, and the world seems deeper and more wonderful than ever before, and just right, too!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/71VUvIfKo7L.jpg",
    "book": "El pollo desplumado",
    "subtitle": "Spanish Edition",
    "author": "Chih-Yuan Chen",
    "illustrator": "Chih-Yuan Chen",
    "year": 2012,
    "category": "Animals",
    "tags": "Chickens, Spanish",
    "checkedOut": "2016-01-12T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "None",
    "timesRead": 0,
    "description": "One day, a featherless chicken meets four chickens with splendid plumage. He wants to be their friend, but they look down upon him because he doesn’t have any feathers. Dejected, the featherless chicken falls into a mud pile, and soon so many leaves and papers are sticking to him that the four chickens do not recognize him and want to be his friend because of his interesting plumage. When his feathers fall off, the other chickens learn that appearances can be deceiving and that friendship is about more than what is on the outside."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51VQ-dV1S1L.jpg",
    "book": "Elwood Bigfoot",
    "subtitle": "Wanted: Birdie Friends!",
    "author": "Jill Esbaum",
    "illustrator": "Nate Wragg",
    "year": 2015,
    "category": "Fantasy",
    "tags": "Sasquash, Friendhsip, Birds, Bigfoot",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Elwood Bigfoot is big, clumsy, LOUD . . . and lonely. It's hard for him to make friends—especially with the tiny, delicate birdies he loves so much. Each flash of their feathers, each chirp and cheerful song helps him feel less alone. But whenever a birdie swoops by, and Elwood hollers at it to STAY, the scared creature flies away. He tries everything: sitting on a branch, having a housewarming party, even building an amusement park with snacks and pools. But nothing helps—until Elwood finally learns how to make his bird dreams come true."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51FcMJwiWcL.jpg",
    "book": "Emily's Blue Period",
    "subtitle": "None",
    "author": "Cathleen Daly",
    "illustrator": "Lisa Brown",
    "year": 2014,
    "category": "Humans",
    "tags": "Art, Color, Imagination",
    "checkedOut": "2016-02-12T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 Stars",
    "timesRead": 2,
    "description": "Emily wants to be an artist. She likes painting and loves the way artists such as Pablo Picasso mixed things up. \"When Picasso was sad for a while,\" says Emily, \"he only painted in blue. And now I am in my blue period.\" It might last quite some time. After her parents get divorced, Emily finds comfort in making and learning about art."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61A881elnTL.jpg",
    "book": "Farley Follows His Nose",
    "subtitle": "None",
    "author": "Lynn Frank Johnston",
    "illustrator": "Beth Cruikshank",
    "year": 2009,
    "category": "Animals",
    "tags": "Dogs",
    "checkedOut": "2015-12-31T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "Farley the dog follows his nose from one good smell to another all over town. Farley the dog follows his nose from one good smell to another all over town. The coauthor is Beth Cruikshank."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51SDfouNY-L.jpg",
    "book": "Flora and the Penguin",
    "subtitle": "None",
    "author": "Molly Idle",
    "illustrator": "Molly Idle",
    "year": 2014,
    "category": "Animals",
    "tags": "Penguins",
    "checkedOut": "2015-09-19T07:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Follow-up to Flora and the Flamingo.Flora takes to the ice and forms an unexpected friendship with a penguin. Twirling, leaping, spinning, and gliding, on skates and flippers, the duo mirror each other's graceful dance above and below the ice. But when Flora gives the penguin the cold shoulder, the pair must figure out a way to work together for uplifting results."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/518HfNabjTL.jpg",
    "book": "Frank Was A Monster Who Wanted to Dance",
    "subtitle": "None",
    "author": "Keith Graves",
    "illustrator": "Keith Graves",
    "year": 1999,
    "category": "Fantasy",
    "tags": "Monsters",
    "checkedOut": "2015-12-10T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Frank was a monster who wanted to dance. So he put on his hat, and his shoes made in France... and opened a jar and put ants in his pants! So begins this monstrously funny, deliciously disgusting, horrifyingly hilarious story of a monster who follows his dream. Keith Graves' wacky illustrations and laugh-out-loud text will tickle the funny bone and leave readers clamoring for an encore."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51Vjw5UfmFL.jpg",
    "book": "Frankenstein",
    "subtitle": "A Monstrous Parody",
    "author": "Rick Walton",
    "illustrator": "Nathan Hale",
    "year": 2012,
    "category": "Monsters",
    "tags": "Frankenstein, Humor",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Frankenstein is the scariest of all the monsters in Miss Devel's castle until one night when he loses his head. Frankenstein is the scariest of all the monsters in Miss Devel's castle until one night when he loses his head. Parody of Ludwig Bemelmans' Madeline."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51kW3aQh0GL.jpg",
    "book": "Freddy & Frito and the Clubhouse Rules",
    "subtitle": "None",
    "author": "Alison Friend",
    "illustrator": "Alison Friend",
    "year": 2015,
    "category": "Animals",
    "tags": "Fox, Mice, Friendship",
    "checkedOut": "2016-01-30T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "3 stars",
    "timesRead": 0,
    "description": "Freddy and Frito play together every day -- sometimes at Frito's and sometimes at Freddy's. But there are rules. Rules aren't fun! So what do these best buddies do? They build their own clubhouse in a tree in the park! With no rules, there's plenty of fun -- until all of their friends come by for a party, and suddenly Freddy and Frito wish for a way to make them all leave!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/81GU4HspPlL.jpg",
    "book": "Gaston",
    "subtitle": "None",
    "author": "Kelly DiPucchio",
    "illustrator": "Christian Robinson",
    "year": 2014,
    "category": "Animals",
    "tags": "Dogs",
    "checkedOut": "2015-12-10T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "This is the story of four puppies: Fi-Fi, Foo-Foo, Ooh-La-La, and Gaston. Gaston works the hardest at his lessons on how to be a proper pooch. He sips-never slobbers! He yips-never yaps! And he walks with grace-never races!Gaston fits right in with his poodle sisters. A proper bulldog raised in a poodle family and a tough poodle raised in a bulldog family meet one day in the park."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61USZVA4kZL.jpg",
    "book": "Gigantosaurus",
    "subtitle": "None",
    "author": "Jonny Duddle",
    "illustrator": "Jonny Duddle",
    "year": 2014,
    "category": "Dinosaurs",
    "tags": "Giant",
    "checkedOut": "2015-08-20T07:00:00.000Z",
    "rating": "Loved it",
    "amazon": "4.5 stars",
    "timesRead": 6,
    "description": "Four young dinosaurs are warned about the scary Gigantosaurus, so one of them volunteers to keep watch for the others while they play. But Bonehead, the lookout, quickly gets bored, and he can’t resist shouting, \"GIGANTOSAURUS!\" just to see what the others do. When his friends finally wise up, Bonehead is in for a rather snappy (and crunchy) surprise!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51ReqGcr8WL.jpg",
    "book": "Go Track A Yak!",
    "subtitle": "None",
    "author": "Tony Johnston",
    "illustrator": "Tim Raglin",
    "year": 2003,
    "category": "Animals",
    "tags": "Yak, Parents, Witches",
    "checkedOut": "2016-03-22T07:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "A couple of bumbling parents with a hungry baby seek help from a tricky little witch, but it is a sweet black-eyed yak who really helps them to live happily ever after."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/81X01Ani2dL.jpg",
    "book": "Goldi Rocks and the Three Bears",
    "subtitle": "None",
    "author": "Corey Rosen Schwartz",
    "illustrator": "Nate Wragg",
    "year": 2014,
    "category": "Humans",
    "tags": "Bears, Stories, fairytales",
    "checkedOut": "2016-03-03T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "In this fractured fairy tale, the Three Bear Band holds tryouts for a lead singer. The coauthor is Beth Coulton. Papa Bear, Mama Bear, and Baby Bear know how to rock! But they need a new singer, so they audition everyone--the Three Pigs, Little Red Riding Hood, and more. To their dismay, no one seems just right. Could the perfect lead singer be the mysterious girl sleeping on Baby Bear's keyboard?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51-N4NY3M8L.jpg",
    "book": "Goldilicious",
    "subtitle": "Pinkalicious",
    "author": "Victoria Kann",
    "illustrator": "Victoria Kann",
    "year": 2009,
    "category": "Fantasy",
    "tags": "Fairy Tales, Princess, Unicorns",
    "checkedOut": "2016-03-11T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "3.5 stars",
    "timesRead": 0,
    "description": "A little girl and her brother play with her imaginary gold-horned unicorn that can float on water, fly, and turn herself into a fairy princess. Being Pinkalicious is pinkatastic, especially when she's accompanied by her pet unicorn, Goldilicious. Goldie is a roller-skating, kite-flying, high-jumping unicorn who will protect Pinkalicious from the evil wizardry of her little brother, Peter."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51Cwey5xhsL.jpg",
    "book": "Goldilocks And The Three Dinosaurs",
    "subtitle": "None",
    "author": "Mo Willems",
    "illustrator": "Mo Willems",
    "year": 2012,
    "category": "Humans",
    "tags": "Dinosaurs, Tricks, Fairytales",
    "rating": "Liked it",
    "amazon": "5 stars",
    "description": "Once upon a time, there were three hungry Dinosaurs: Papa Dinosaur, Mama Dinosaur . . . and a Dinosaur who happened to be visiting from Norway. One day—for no particular reason—they decided to tidy up their house, make the beds, and prepare pudding of varying temperatures. And then—for no particular reason—they decided to go . . . someplace else. They were definitely not setting a trap for some succulent, unsupervised little girl. Definitely not!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/516kRrg+j3L.jpg",
    "book": "Goodnight Already!",
    "subtitle": "None",
    "author": "Jory John",
    "illustrator": "Benji Davies",
    "year": 2015,
    "category": "Animals",
    "tags": "Bears, Ducks, Neighbors",
    "checkedOut": "2016-01-16T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Bear has never been so tired but his next-door neighbor, a wide-awake duck, keeps disturbing his sleep. Bear has never been so tired, but his next-door neighbor, a wide-awake duck, keeps disturbing his sleep. The coauthor is Benji Davies."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61f1OlwjOkL.jpg",
    "book": "Gorgonzola",
    "subtitle": "A Very Stinkysaurus",
    "author": "Margie Palatini",
    "illustrator": "Tim Bowers",
    "year": 2008,
    "category": "Dinosaurs",
    "tags": "Dinosaurs, Baths, Hygiene",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "When Gorgonzola the dinosaur learns that everyone runs from him to avoid his smell rather than out of fear, he is grateful to the little bird who shows him how to brush his teeth and wash. When Gorgonzola the dinosaur learns that everyone runs from him to avoid his smell, rather than out of fear, he is grateful to the little bird who shows him how to brush his teeth and wash."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51xPiR1sHdL.jpg",
    "book": "Granny Gomez & Jigsaw",
    "subtitle": "None",
    "author": "Deborah Underwood",
    "illustrator": "Scott Magoon",
    "year": 2010,
    "category": "Animals",
    "tags": "Pets, Pigs, Swine",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "Granny Gomez's baby pig, Jigsaw, is the perfect roommate. He eats watermelon and watches cooking shows with her—he even does puzzles. But Jigsaw grows up—and out—quickly. Soon he's too big to get up Granny's back steps. It seems the only thing to do is build Jigsaw a barn. But once Jigsaw moves in, the two miss each other like crazy! Surely Granny and Jigsaw can find a solution, if they just put the pieces together. . . ."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61NJl0VwSSL.jpg",
    "book": "Gus, the Dinosaur Bus",
    "subtitle": "None",
    "author": "Siyuan Liu",
    "illustrator": "Bei Lynn",
    "year": 2013,
    "category": "Dinosaurs",
    "tags": "Children, school",
    "checkedOut": "2016-01-23T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Even though the schoolchildren think Gus the dinosaur bus is a great way to get to school, his size is causing traffic problems for the principal and the town. Even though the school children think Gus the dinosaur bus is a great way to get to school, his size is causing traffic problems for the principal and the town."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51gJVlt+enL.jpg",
    "book": "Harry, the Dirty Dog",
    "subtitle": "None",
    "author": "Gene Zion",
    "illustrator": "Margaret Bloy Graham",
    "year": 2006,
    "category": "Animals",
    "tags": "Dogs",
    "checkedOut": "2015-12-31T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "Harry is a white dog with black spots who loves everything . . . except baths. So one day before bath time, Harry runs away. He plays outside all day long, digging and sliding in everything from garden soil to pavement tar. By the time he returns home, Harry is so dirty he looks like a black dog with white spots. His family doesn't even recognize him!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61aPgYUUajL.jpg",
    "book": "Help!",
    "subtitle": "A Story of Friendship",
    "author": "Holly Keller",
    "illustrator": "Holly Keller",
    "year": 2007,
    "category": "Animals",
    "tags": "Friendship, Fear",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Mouse hears a rumor that snakes do not like mice and while trying to avoid his former friend, Snake, Mouse falls into a hole from which neither Hedgehog, Squirrel, nor Rabbit can help him out. Mouse hears a rumor that snakes do not like mice and while trying to avoid his former friend, Snake, he falls into a hole from which neither Hedgehog, Squirrel, nor Rabbit can help him out."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51UV7fZl54L.jpg",
    "book": "Here Comes the Tooth Fairy Cat",
    "subtitle": "None",
    "author": "Deborah Underwood",
    "illustrator": "Claudia Rueda",
    "year": 2015,
    "category": "Animals",
    "tags": "Cats, Mice, Tooth Fairies",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 3,
    "description": "When Cat loses a tooth, the Tooth Fairy delivers a wholly unwanted sidekick: a mouse. Together, Cat and Mouse are tasked with running a few Tooth Fairy-related errands—a challenge, since Mouse is just as competitive and mischievous and hilariously self-involved as Cat. The stakes rise and so does the deadpan humor, culminating in a satisfying surprise that will leave readers eager for yet another delightfully devious Cat adventure."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51--jYa2cdL.jpg",
    "book": "Hermelin The Detective Mouse",
    "subtitle": "None",
    "author": "Mini Grey",
    "illustrator": "Mini Grey",
    "year": 2013,
    "category": "Animals",
    "tags": "Mice",
    "checkedOut": "2016-02-12T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "Hermelin, a mouse with typewriting skills, secretly helps the people of Offley Street find lost items. A special little mouse who lives in the attic at 33 Offley Street uses his investigative talents anonymously to help solve mysteries on the street, but when his neighbors invite him to a thank-you party in his honor and discover that Hermelin is a mouse, he's unsure whether he will be welcome."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51F4NkHRNkL.jpg",
    "book": "Hildie Bitterpickles Needs Her Sleep",
    "subtitle": "None",
    "author": "Robin Newman",
    "illustrator": "Chris Ewald",
    "year": 2016,
    "category": "Fantasy",
    "tags": "Witches, Neighbors, Sleep",
    "checkedOut": "2016-04-02T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Hildie Bitterpickles is a witch who needs her sleep. Her quiet neighborhood has been turned upside down with the sudden arrival of the old woman in her shoe, big bad wolf, and other fairy tale characters. What will Hildie have to do to get a quiet night's sleep?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/619ydl7steL.jpg",
    "book": "Hoot and Peep",
    "subtitle": "None",
    "author": "Lita Judge",
    "illustrator": "Lita Judge",
    "year": 2016,
    "category": "Animals",
    "tags": "Owls, Brothers and Sisters, Individuality",
    "checkedOut": "2016-03-17T07:00:00.000Z",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "Hoot the owl is very excited for his little sister, Peep, to join him on the cathedral rooftops. She's finally old enough to learn all his big brother owly wisdom: First, owls say hooo. Second, they always say hooo. Lastly, they ONLY say hooo! But why would Peep say hooo when she could say schweeepty peep ordingity dong? Why would she speak when she could sing? As she explores the breathtaking Parisian cityscape, Peep discovers so many inspiring sights and sounds—the ring of cathedral bells, the slap of waves on stone—that she can’t help but be swept up in the magic of it all. Hoot doesn’t understand Peep’s awe, until he takes a pause to listen . . . and realizes that you're never too old to learn a little something new."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61Vlv0XxzNL.jpg",
    "book": "Horton Hears A Who!",
    "subtitle": "None",
    "author": "Dr. Seuss",
    "illustrator": "Dr. Seuss",
    "year": 1954,
    "category": "Fantasy",
    "tags": "Stories",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Horton is back! After his first appearance in Horton Hatches the Egg, everyone’s favorite elephant returns in this timeless, moving, and comical classic in which we discover that “a person’s a person, no matter how small.” Thanks to the irrepressible rhymes and eye-catching illustrations, young readers will learn kindness and perseverance (as well as the importance of a good “Yopp”) from the very determined—and very endearing—Horton the elephant."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/71ot4gV2p0L.jpg",
    "book": "How Do Dinosaurs Eat Their Food?",
    "subtitle": "None",
    "author": "Jane Yolen",
    "illustrator": "Mark Teague",
    "year": 2005,
    "category": "Dinosaurs",
    "tags": "Dinosaurs",
    "checkedOut": "2015-12-10T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "Just like kids, dinosaurs have a difficult time learning to behave at the table. However, with a little help from Mom and Dad, these young dinosaurs eat all before them with smiles and goodwill."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61j3xL1PpPL.jpg",
    "book": "How Martha Saved Her Parents From Green Beans",
    "subtitle": "None",
    "author": "David Larochelle",
    "illustrator": "Mark Fearing",
    "year": 2015,
    "category": "Humans",
    "tags": "Food, Beans, Parents",
    "checkedOut": "2016-03-11T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "Martha HATES green beans. When some mean, green bandits stroll into town, anyone who ever said \"Eat your green beans\" is in big trouble. But when the beans kidnap Martha's parents, Martha is forced to take action. She can think of only one way to stop the villainous veggies from taking over her town, and it’s not pretty...or tasty. Featuring absurdly funny text and illustrations with attitude, this is a hilarious read for everyone – even the pickiest of eaters."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51Vsgqb2eaL.jpg",
    "book": "How Rocket Learned to Read",
    "subtitle": "None",
    "author": "Tad Hills",
    "illustrator": "Tad Hills",
    "year": 2012,
    "category": "Animals",
    "tags": "Dogs, Birds",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "A little yellow bird teaches Rocket the dog how to read by first introducing him to the \"wondrous, mighty, gorgeous alphabet.\" A little yellow bird teaches Rocket the dog how to read by first introducing him to the alphabet."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51oec0NJcWL.jpg",
    "book": "How to Cheer up Dad",
    "subtitle": "None",
    "author": "Fred Koehler",
    "illustrator": "Fred Koehler",
    "year": 2014,
    "category": "Animals",
    "tags": "Elephants, Mood, Behavior, Father and Child",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Little Jumbo just can't understand why his dad is having such a bad day. It couldn't be the raisins Little Jumbo spit out at the ceiling or the bath he refused to take--after all, Little Jumbo's dad knew he hated raisins and had already taken a bath that week! Luckily, Little Jumbo is such a thoughtful elephant that he decides to turn his dad's bad day around with some of his--ahem, his dad's--favorite things."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51WL6EckLdL.jpg",
    "book": "How To Train a Train",
    "subtitle": "None",
    "author": "Jason Carter Eaton",
    "illustrator": "John Rocco",
    "year": 2013,
    "category": "Transportation",
    "tags": "Trains",
    "checkedOut": "2016-02-09T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "A railroad enthusiast gives the secret to everything you need to know about finding, keeping, and training your very own pet train. Loco for locomotives? Get your ticket ready--here is everything you need to know about finding, keeping, and training your very own pet train."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51Y9OI09K4L.jpg",
    "book": "I Need My Monster",
    "subtitle": "None",
    "author": "Amanda Noll",
    "illustrator": "Howard McWilliam",
    "year": 2009,
    "category": "Fantasy",
    "tags": "Monsters, Bedtime, Fear, Night",
    "checkedOut": "OWN",
    "rating": "Loved it",
    "amazon": "4.5 stars",
    "timesRead": 6,
    "description": "When Ethan checks under the bed for his monster, he finds a note saying that Gabe has gone fishing and will be back in a week. He tries out several substitute monsters, but finds that none are as perfect as Gabe. When Gabe, the monster that lives under Ethan's bed, goes on vacation, Ethan finds that the substitute monsters Gabe has sent just won't do and wonders how he will ever fall asleep."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/618rdsUYwJL.jpg",
    "book": "I Will Chomp You!",
    "subtitle": "None",
    "author": "Jory John",
    "illustrator": "Bob Shea",
    "year": 2015,
    "category": "Fantasy",
    "tags": "Monsters",
    "checkedOut": "2015-11-24T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "In their funny read-aloud, Jory John and Bob Shea bring a fresh twist to a time-tested blueprint as their little monster threatens, reasons, and pleads with readers to go no further in the book because he will NOT share his beautiful, delicious cakes. Children will identify with the monster’s high valuation of his possessions, and (importantly) will laugh at the silly measures he takes to protect them."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/41RZXrnyM2L.jpg",
    "book": "I'm Bored",
    "subtitle": "None",
    "author": "Michael Ian Black",
    "illustrator": "Debbie Ridpath Ohi",
    "year": 2012,
    "category": "Humans",
    "tags": "Girls",
    "checkedOut": "2015-10-10T07:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Just when a little girl thinks she couldn’t possibly be more bored, she stumbles upon a potato who turns the tables on her by declaring that children are boring. But this girl isn’t going to let a vegetable tell her what’s what, so she sets out to show the unimpressed potato all the amazing things kids can do."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61CA273CWNL.jpg",
    "book": "I'm My Own Dog",
    "subtitle": "None",
    "author": "David Ezra Stein",
    "illustrator": "David Ezra Stein",
    "year": 2014,
    "category": "Animals",
    "tags": "Dogs",
    "checkedOut": "2016-01-30T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "Many dogs have human owners. Not this dog. He fetches his own slippers, curls up at his own feet, and gives himself a good scratch. But there is one spot, in the middle of his back, that he just can’t reach. So one day, he lets a human scratch it. And the poor little fella follows him home. What can the dog do but get a leash to lead the guy around with? Dog lovers of all ages will revel in the humorous role-reversal as this dog teaches his human all the skills he needs to be a faithful companion."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61sCaN30xfL.jpg",
    "book": "If I Had A Gryphon",
    "subtitle": "None",
    "author": "Vikki VanSickle",
    "illustrator": "Cale Atkinson",
    "year": 2016,
    "category": "Fantasy",
    "tags": "Pets, Hamsters, Mythical Creatures",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Sam just got a hamster for a pet. But the hamster is kind of boring. he just eats and sleeps and gets his shavings wet. Inspired by her book of mythological creatures, Sam longs for a more exciting pet. But she soon realises that taking care of these magical beasts might not be as wonderful as she thought. Sasquatches are messy, unicorns are shy, gryphons scare the dogs at the dogpark, and having a fire extinguisher handy at all times makes dragons seem like an awful lot of work. In the end, Sam realises that her hamster is a pretty sweet and safe pet. or is he?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51e7X4vkpCL.jpg",
    "book": "If You Ever Want to Bring An Alligator to School, Dont!",
    "subtitle": "None",
    "author": "Elise Parsley",
    "illustrator": "Elise Parsley",
    "year": 2015,
    "category": "Animals",
    "tags": "Alligators, School",
    "checkedOut": "2016-03-22T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Note to self: If your teacher tells you to bring something from nature for show-and-tell, she does not want you to bring an alligator! But nothing will stop Magnolia, who's determined to have the best show-and-tell of all--until her reptilian rapscallion starts getting her into some major trouble. Now it's up to Magnolia to find a way to send this troublemaker home--but what could possibly scare an alligator away?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61LuWqrwbTL.jpg",
    "book": "Iggy Peck, Architect",
    "subtitle": "None",
    "author": "Andrea Beaty",
    "illustrator": "David Roberts",
    "year": 2007,
    "category": "Humans",
    "tags": "Building",
    "checkedOut": "2016-02-26T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Ever since he was a baby, Iggy Peck has built towers, bridges, and buildings, which comes in handy when his second grade class is stranded on an island during a picnic. Ever since he was two, Iggy Peck has built towers, bridges, and buildings, which comes in handy when his second grade class is stranded on an island during a picnic."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61g4Ie5q8ML.jpg",
    "book": "Inside A Zoo in the City",
    "subtitle": "None",
    "author": "Alyssa Satin Capucilli",
    "illustrator": "Tedd Arnold",
    "year": 2005,
    "category": "Animals",
    "tags": "Stories, Zoo Animals",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "A squawking parrot wakes a stalking tiger and disturbs the sleep of a lion that roars...and a symphony of chattering and barking ensues, as all the animals race from the dormitory where they live to the zoo in time to greet the visitors."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51pCtTo+7PL.jpg",
    "book": "Interrupting Chicken",
    "subtitle": "None",
    "author": "David Ezra Stein",
    "illustrator": "David Ezra Stein",
    "year": 2010,
    "category": "Animals",
    "tags": "Chickens, Birds",
    "checkedOut": "2016-01-12T08:00:00.000Z",
    "rating": "Liked It",
    "amazon": "4.5 stars",
    "timesRead": 3,
    "description": "It’s time for the little red chicken’s bedtime story—and a reminder from Papa to try not to interrupt. But the chicken can’t help herself! Whether the tale is Hansel and Grettel or Little Red Riding Hood or evenChicken Little, she jumps into the story to save its hapless characters from doing some dangerous or silly thing."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51ayoT-o0ML.jpg",
    "book": "Is There A Dog in This Book?",
    "subtitle": "None",
    "author": "Viviane Scwarz",
    "illustrator": "Viviane Scwarz",
    "year": 2014,
    "category": "Animals",
    "tags": "Cats",
    "checkedOut": "2015-12-10T08:00:00.000Z",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 10,
    "description": "Can cats and dogs share the same turf? Revisit the age-old dilemma with a hide-and-seek romp among furry friends. Brimming with humor and featuring Viviane Schwarz’s exuberant artwork, here is a lively interactive exploration of the surprising joys of unlikely friendships from the creator of There Are Cats in This Book and There Are No Cats in This Book."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51-fiRJZ+xL.jpg",
    "book": "It's a Big World, Little Pig!",
    "subtitle": "None",
    "author": "Kristi Yamaguchi",
    "illustrator": "Tim Bowers",
    "year": 2012,
    "category": "Animals",
    "tags": "Pigs, Skating",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Poppy, the adorable, persistent, dreaming-big pig, has a new adventure in store for her: the World Games ice-skating championship in Paris! Poppy is nervous about meeting so many new people in a new place. But, ever courageous and supported by her family (Emma, too!), Poppy embarks upon this exciting adventure head-on. She meets a snowboarding Panda, a Maltese who skies, and two fellow skaters, a Crane and a Kangaroo. Poppy begins to realize that although these animals look different, act different, and are from different places, they are all the same at heart. They all smile in the same language!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/616pjFrVSpL.jpg",
    "book": "Itsy Mitsy Runs Away",
    "subtitle": "None",
    "author": "Elanna Allen",
    "illustrator": "Elanna Allen",
    "year": 2011,
    "category": "Humans",
    "tags": "Children",
    "checkedOut": "2016-02-12T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "NO ONE likes bedtime, and Itsy Mitsy has had quite enough. So tonight’s the night she’s running away to the perfect place where there are no more bedtimes ever (not even one). But running away isn't as easy as it seems. There's a lot to pack: Mitsy's friendliest dinosaur Mister Roar; a snack for Mister Roar; her dog, Pupcake, to keep the bedtime beasties away from said snack; the list goes on and on. But with a helpful Dad who makes sure Mitsy doesn't leave anything behind--especially not him--Mitsy might want to run away tomorrow night, too."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51xXd20Z2wL.jpg",
    "book": "Julia's House for Lost Creatures",
    "subtitle": "None",
    "author": "Ben Hatke",
    "illustrator": "Ben Hatke",
    "year": 2014,
    "category": "Fantasy",
    "tags": "Monsters",
    "checkedOut": "2015-12-31T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "Julia welcomes all lost and homeless creatures into her house, whether they be cats or trolls, ghosts or dragons, but soon realizes that each must have a chore in order for the arrangement to work. Julia welcomes all lost and homeless creatures into her house, whether they be cats or trolls, ghosts or dragons, but she soon realizes that each must have a chore in order for the arrangement to work."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51hUPACQnML.jpg",
    "book": "Jumanji",
    "subtitle": "None",
    "author": "Chris Van Allsburg",
    "illustrator": "Chris Van Allsburg",
    "year": 1981,
    "category": "Animals",
    "tags": "Animals",
    "checkedOut": "2016-02-09T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "Left on their own for an afternoon, two bored and restless children find more excitement than they bargained for in a mysterious and mystical jungle adventure board game. Two children play a dice game, Jumanji, that must be played to the very end."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51jYyEHP3PL.jpg",
    "book": "Kermit The Hermit",
    "subtitle": "None",
    "author": "Bill Peet",
    "illustrator": "Bill Peet",
    "year": 1965,
    "category": "Animals",
    "tags": "Animals",
    "checkedOut": "2016-02-12T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "A little boy saves Kermit from disaster, and the once cranky crab works hard to repay him."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/513Nho0uAZL.jpg",
    "book": "King Hugo's Huge Ego",
    "subtitle": "None",
    "author": "Chris Van Dusen",
    "illustrator": "Chris Van Dusen",
    "year": 2011,
    "category": "Humans",
    "tags": "Kings and Rules, Egoism",
    "checkedOut": "2016-03-17T07:00:00.000Z",
    "rating": "Liked",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "Hugo is a tiny king with a very large ego. But when he mistreats a villager who also happens to be a sorceress, the spell she casts causes his head to literally swell. The more he boasts, the bigger it gets, until it finally topples the mini monarch right off his castle! Who will cut this royal pain down to size? And, more important, will anyone live happily ever after? Chris Van Dusen’s hilarious story is matched only by his outrageous illustrations. Together, they make for a picture book that is sometimes fairy tale, sometimes cautionary tale, and always laugh-out loud funny."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61bLvlEBXvL.jpg",
    "book": "La araña muy ocupada",
    "subtitle": "Spanish Edition",
    "author": "Eric Carle",
    "illustrator": "Eric Carle",
    "year": 2004,
    "category": "Animals",
    "tags": "Insects, Spanish",
    "checkedOut": "2015-12-10T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4 stars",
    "timesRead": 0,
    "description": "Eric Carle?s The Very Busy Spider has been a favorite for more than 20 years. This colorful, touch-and-feel story of an industrious spider is a classic, and now the Spanish-language edition is available as a board book, perfect for the youngest children who speak Spanish or who are beginning to learn it."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/710v7gPhnyL.jpg",
    "book": "La oruga muy hambrienta",
    "subtitle": "Spanish Edition",
    "author": "Eric Carle",
    "illustrator": "Eric Carle",
    "year": 2002,
    "category": "Animals",
    "tags": "Insects, Spanish",
    "checkedOut": "2015-12-10T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "The Very Hungry Caterpillar is inarguably one of the most popular children's books of all time. Now, here is the Spanish board book version of The Very Hungry Caterpillar, filling an important niche for the youngest of Spanish-speaking children."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51oapcmgbNL.jpg",
    "book": "Lady Pancake & Sir French Toast",
    "subtitle": "None",
    "author": "Josh Funk",
    "illustrator": "Brendan Kearney",
    "year": 2015,
    "category": "Food",
    "tags": "Pancakes, French Toast, Waffles, Friendship",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "A thoroughly delicious picture book about the funniest \"food fight\" ever! Lady Pancake and Sir French Toast have a beautiful friendship—until they discover that there's ONLY ONE DROP of maple syrup left. Off they go, racing past the Orange Juice Fountain, skiing through Sauerkraut Peak, and reeling down the linguini. But who will enjoy the sweet taste of victory? And could working together be better than tearing each other apart? The action-packed rhyme makes for an adrenaline-filled breakfast . . . even without a drop of coffee!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61Z4R07gJhL.jpg",
    "book": "Ladybug Girl and the Bug Squad",
    "subtitle": "None",
    "author": "Jacky Davis",
    "illustrator": "David Soman",
    "year": 2011,
    "category": "Humans",
    "tags": "Play, Cooperativeness",
    "checkedOut": "2016-03-22T07:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "When Lulu invites her friends from the Bug Squad--all dressed up as insects--to come over for a play date, she wants everything to go just as she has planned. When Lulu invites her friends from the Bug Squad, dressed up as insects, to come over for a playdate, she wants everything to go just as she has planned. The coauthor is Jacky Davis."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/A1iCa3CdXhL.jpg",
    "book": "Ladybug Girl at the Beach",
    "subtitle": "None",
    "author": "David Soman",
    "illustrator": "Jacky Davis",
    "year": 2010,
    "category": "Humans",
    "tags": "Adventure, Ladybig",
    "checkedOut": "2015-10-10T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "Lulu, who likes to wear a ladybug costume, goes to the beach for the first time and makes sand castles, flies kites, and deals with her fear of the ocean. Lulu, who likes to wear a ladybug costume, goes to the beach for the first time and makes sand castles, flies kites, and deals with her fear of the ocean."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51eD3PpCd3L.jpg",
    "book": "Learning to Ski With Mr. Magee",
    "subtitle": "None",
    "author": "Chris Van Dusen",
    "illustrator": "Chris Van Dusen",
    "year": 2010,
    "category": "Humans",
    "tags": "Dogs, Skiing",
    "checkedOut": "2016-02-21T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "One winter morning, Mr. Magee and his little dog, Dee, head out bright and early to learn how to ski. But what begins as a pleasant day in the snow quickly goes downhill when a run-in with a curious moose sends them flying through the air and hanging above an abyss! How will Dee and Magee find their way out of this snowy situation? Chris Van Dusen, the creator of Down to the Sea with Mr. Magee and A Camping Spree with Mr. Magee, has craftedyet another fun-filled adventure for Magee fans old and new."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/511QOo8RVXL.jpg",
    "book": "Let's Go for a Drive",
    "subtitle": "An Elephant and Piggie Book",
    "author": "Go Willems",
    "illustrator": "Go Willems",
    "year": 2012,
    "category": "Animals",
    "tags": "Elephants, Pigs",
    "checkedOut": "2016-01-16T08:00:00.000Z",
    "rating": "Loved it",
    "timesRead": 3,
    "description": "Elephant Gerald and Piggie want to go for a drive, but as Gerald thinks of one thing after another that they will have to take along, they come to realize that they lack the most important thing of all. Gerald and Piggie want to go for a drive, but as Gerald thinks of one thing after another that they will have to take along, they come to realize that they lack the most important thing of all."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51OC6x2CBFL.jpg",
    "book": "Library Lion",
    "subtitle": "None",
    "author": "Michelle Knudsen",
    "illustrator": "Kevon Hawkes",
    "year": 2009,
    "category": "Animals",
    "tags": "Lions, Libraries, Obedience",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "Miss Merriweather, the head librarian, is very particular about rules in the library. No running allowed. And you must be quiet. As long as you follow the rules, you are permitted to enjoy the library. There are no rules about lions in a library, and why would there be? But one day, a lion walks into Miss Merriweather’s library, and no one is sure what to do. It turns out that the lion seems very well suited for the library. His big feet are quiet on the library floor. He makes a comfy backrest for the children at story hour. And he never roars in the library—at least not anymore. But when something terrible happens, the lion helps in the only way he knows how. Could there ever be a good reason to break the rules? Even in the library?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/511pVFz1bbL.jpg",
    "book": "Library Mouse",
    "subtitle": "A Museum Adventure",
    "author": "Daniel Kirk",
    "illustrator": "Daniel Kirk",
    "year": 2012,
    "category": "Animals",
    "tags": "Mice, Museums, Authorship",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "Sam the library mouse and his friend Sarah are off on a new adventure. This time they leave the library behind and go to a museum so Sam can make sketches in his explorer’s journal. Sarah isn’t so sure that explorers have the time or the interest to write in journals. But Sam shows her that a journal can contain anything, from a ticket stub to drawings of cool things like dinosaurs and ancient Egyptian mummies. As they explore the museum, they see all kinds of art and unexpectedly make friends with another artist."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51lmKou2LgL.jpg",
    "book": "Library Mouse",
    "subtitle": "None",
    "author": "Daniel Kirk",
    "illustrator": "Daniel Kirk",
    "year": 2007,
    "category": "Animals",
    "tags": "Mice, Libraries, Authorship",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "Sam, a shy but creative mouse who lives in a library, decides to write and illustrate his own stories which he places on the shelves with the other library books. When children find the tales, they all want to meet the author. Sam, a shy but creative mouse who lives in a library, decides to write and illustrate his own stories which he places on the shelves with the other library books but when children find the tales, they all want to meet the author."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51W69KfJWEL.jpg",
    "book": "Lilly's Big Day",
    "subtitle": "None",
    "author": "Kevin Henkes",
    "illustrator": "Kevin Henkes",
    "year": 2014,
    "category": "Animals",
    "tags": "Teachers, Weddings, Mice",
    "checkedOut": "2016-03-22T07:00:00.000Z",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "Lilly, the star of Lilly's Purple Plastic Purse; Julius, the Baby of the World; and Chester's Way, rises to the occasion as only Lilly can, turning heartbreak into wedding cake (a delicious three-tiered frosted Swiss cheese, no less), and disappointment into friendship. This is the paperback edition of the acclaimed #1New York Times bestseller by Caldecott Medalist Kevin Henkes."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/71-WbUVfHaL.jpg",
    "book": "Lionheart",
    "subtitle": "None",
    "author": "Richard Collingridge",
    "illustrator": "Richard Collingridge",
    "year": 2016,
    "category": "Animals",
    "tags": "Lions, Fear, Toys, Imagination",
    "checkedOut": "2016-05-27T07:00:00.000Z",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Richard hears something in his room before bedtime. Is it a monster? He doesn't wait to find out and sets off running through the streets, over the hills, through the forest, and into the fields until he finds himself in a magical jungle. With the help of his stuffed lion Lionheart, Richard finds the courage he needs to face his fears."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/412eOI9HJoL.jpg",
    "book": "Little Owl Lost",
    "subtitle": "None",
    "author": "Chris Haughton",
    "illustrator": "Chris Haughton",
    "year": 2013,
    "category": "Animals",
    "tags": "Owls",
    "checkedOut": "2016-01-06T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "Little Owl falls out of his nest and tries to find his mommy. With the help of his new friend Squirrel, Little Owl goes in search of animals that fit his description of Mommy Owl. Friendly forest animals help a newborn owl find his mother."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51+I3e0XxuL.jpg",
    "book": "Little Penguin Gets the Hiccups",
    "subtitle": "None",
    "author": "Tadgh Bentley",
    "illustrator": "Tadgh Bentley",
    "year": 2015,
    "category": "Animals",
    "tags": "Penguins, Hiccups",
    "checkedOut": "2016-03-11T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "Poor Little Penguin has a major case of the . . . HIC! . . . hiccups. It all started last week on chili night. Since then he's tried everything to get rid of them, but nothing—HIC!—works. So when his friend Franklin suggests that a good scare might do the trick, Little Penguin is willing to give it a try . . . all he needs is a little help from YOU!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51ZAibear0L.jpg",
    "book": "Little Red Hot",
    "subtitle": "None",
    "author": "Eric A. Kimmel",
    "illustrator": "Laura Huliska Beith",
    "year": 2013,
    "category": "Humans",
    "checkedOut": "2016-02-12T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "Little Red Hot loves red hot chilli peppers. She eats them for breakfast, lunch, and dinner. When her grandmother catches a cold, Little Red makes her a hot pepper pie that will \"knock those cold germs right out of her\". But before Little Red shares her pie with Grandma, she meets Señor Lobo. The pie comes in very handy when the wily wolf tries to trick her into thinking he's her grandmother."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/71xPjNEPspL.jpg",
    "book": "Lizard From the Park",
    "subtitle": "None",
    "author": "Mark Pett",
    "illustrator": "Mark Pett",
    "year": 2015,
    "category": "Animals",
    "tags": "Lizards, Dinosaurs, Pets",
    "checkedOut": "2016-03-11T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "When a lizard hatches from the egg Leonard finds in the park, he names it Buster and takes it all around the city, but Buster grows bigger and bigger until Leonard realizes he must devise a way to return his pet to the deepest, darkest part of the park and set him free."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/81s2AHzU1nL.jpg",
    "book": "Lost and Found",
    "subtitle": "None",
    "author": "Oliver Jeffers",
    "illustrator": "Oliver Jeffers",
    "year": 2005,
    "category": "Animals",
    "tags": "Penguins, Travels, Voyages, Friendship",
    "rating": "Have not read yet",
    "amazon": "4.5 stars",
    "description": "What is a boy to do when a lost penguin shows up at his door? Find out where it comes from, of course, and return it. But the journey to the South Pole is long and difficult in the boy’s rowboat. There are storms to brave and deep, dark nights.To pass the time, the boy tells the penguin stories. Finally, they arrive. Yet instead of being happy, both are sad. That’s when the boy realizes: The penguin hadn’t been lost, it had merely been lonely."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51VRYGLwDwL.jpg",
    "book": "Louis I, KIng of Sheep",
    "subtitle": "None",
    "author": "Olivier Tallec",
    "illustrator": "Olivier Tallec",
    "year": 2015,
    "category": "Animals",
    "tags": "Sheep",
    "checkedOut": "2016-02-09T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4 stars",
    "timesRead": 1,
    "description": "Louis I, King of the Sheep is a funny philosophical fable about a sheep who finds a crown, and revels in dreams of power."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/A1r5RaJeFIL.jpg",
    "book": "Lovabye Dragon",
    "subtitle": "None",
    "author": "Barbara Joosee",
    "illustrator": "Randy Cecil",
    "year": 2012,
    "category": "Fantasy",
    "tags": "Dragons",
    "checkedOut": "2015-11-24T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "When a lonely dragon follows a trail of princess tears, a beautiful friendship is born. They march and sing, roar and whisper, hide and seek, then settle into snug companionship at bedtime\"-- Provided by publisher. When a lonely dragon follows a trail of princess tears, a beautiful friendship is born. They march and sing, roar and whisper, hide and seek, and then settle into snug companionship at bedtime."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61rOmEopr7L.jpg",
    "book": "Lucy in the City",
    "subtitle": "A Story About Developing Spatial Thinking Skills",
    "author": "Julie Dillemuth",
    "illustrator": "Laura Wood",
    "year": 2015,
    "category": "Animals",
    "tags": "Racoons",
    "checkedOut": "2016-03-17T07:00:00.000Z",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "Lucy in the City is a picture book about a young raccoon who gets separated from her family one night and has to find her way home. Faced with the challenge of being on her own, Lucy tunes in to her surroundings for the first time and discovers that she can re-trace her steps using smells, sights, and sounds. At its heart, the story focuses on developing spatial thinking, understanding the world around us, and using concepts of space for problem-solving. Includes a 'Note to Parents and Caregivers.\""
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/91tUH12ObbL.jpg",
    "book": "Lumpito and the Painter From Spain",
    "subtitle": "None",
    "author": "Monica Kulling",
    "illustrator": "Dean Griffiths",
    "year": 2013,
    "category": "Animals",
    "tags": "Dogs, Artists",
    "checkedOut": "2016-02-27T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Lump the dachshund is content living with David in Italy. But he needs a vacation from Big Dog, who hounds him day and night. So when David announces that he's off to the south of France to photograph a famous painter, Lump positively scrambles at the chance to ride along. At the villa, Pablo Picasso greets them and is enchanted with the little dog he calls Lumpito. The feeling is mutual; from that moment on, the two become soul mates. Lump loves David. But how can he show his master, and Picasso, that he is home at last?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61MGFICGOJL.jpg",
    "book": "Maisy Goes to the Museum",
    "subtitle": "A Maisy First Experience Book",
    "author": "Lucy Cousins",
    "illustrator": "Lucy Cousins",
    "year": 2009,
    "category": "Animals",
    "tags": "Mice, Museums",
    "checkedOut": "2016-02-27T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "On a rainy-day visit to the museum, Maisy and her friends explore everything from dinosaurs to a moon exhibit, from vintage vehicles to a giant dollhouse to the food exhibit. There’s always something new (or old) to see at a museum, and for little readers, it’s good to have a friend like Maisy along for the adventure."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51KhWDnLZCL.jpg",
    "book": "Maisy Plays Soccer",
    "subtitle": "None",
    "author": "Lucy Cousins",
    "illustrator": "Lucy Cousins",
    "year": 2014,
    "category": "Animals",
    "tags": "Mice, Soccer, Sports",
    "checkedOut": "2016-02-27T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4 stars",
    "timesRead": 1,
    "description": "Maisy and her friends can’t wait to play soccer! Maisy puts on her uniform, laces up her sneakers, and heads to the field. Charlie, Tallulah, and Dotty are on the blue team, while Maisy, Cyril, and Eddie are on the red. Let’s play! Soon enough the game heats up, with plenty of action, excitement, and suspense. Who will be the first team to make a goal? Whatever the score, it’s all in good fun, and everyone is still the best of friends at the end!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51MDBfXWDGL.jpg",
    "book": "Marilyn's Monster",
    "subtitle": "None",
    "author": "Michelle Knudsen",
    "illustrator": "Matt Phelan",
    "year": 2015,
    "category": "Fantasy",
    "tags": "Monsters",
    "checkedOut": "2015-09-19T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "Some of the kids in Marilyn’s class have monsters. Marilyn doesn’t have hers yet, but she can’t just go out and look for one. Your monster has to find you. That’s just the way it works. Marilyn tries to be patient and the kind of girl no monster can resist, but her monster doesn’t come. Could she go out and search for him herself? Even if that’s not the way it works? From favorite picture-book creators Michelle Knudsen and Matt Phelan comes a story about one little girl and the perfect monster she knows is out there . . . and what happens when she decides she’s waited long enough."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/41l5WOd1tcL.jpg",
    "book": "Max the Brave",
    "subtitle": "None",
    "author": "Ed Vere",
    "illustrator": "Ed Vere",
    "year": 2015,
    "category": "Animals",
    "tags": "Cats",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "Max is a fearless kitten. Max is a brave kitten. Max is a kitten who chases mice. There's only one problem-Max doesn't know what a mouse looks like! With a little bit of bad advice, Max finds himself facing a much bigger challenge. Maybe Max doesn't have to be Max the Brave all the time..."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51mhxC5onQL.jpg",
    "book": "Memoirs of A Goldfish",
    "subtitle": "None",
    "author": "Devin Scillian",
    "illustrator": "Tim Bowers",
    "year": 2010,
    "category": "Animals",
    "tags": "Goldfish, Friendship",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "A goldfish presents a tell-all tale of his experiences of swimming around his bowl as it slowly fills with intruders. When he is relocated for a cleaning, he realizes how much he misses his new companions. A goldfish gives a personal account of his experiences while swimming around his bowl as it slowly fills with fish and other accessories, only to realize when he is relocated for a cleaning how much he misses them."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51BkvXe6SEL.jpg",
    "book": "Mercy Watson Fights Crime",
    "subtitle": "None",
    "author": "Kate DiCamillo",
    "illustrator": "Chris Van Dusen",
    "year": 2006,
    "category": "Animals",
    "tags": "Pigs",
    "checkedOut": "2016-02-23T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Leroy Ninker is a small man with a big dream: he wants to be a cowboy, but for now he’s just a thief. In fact, Leroy is robbing the Watsons’ kitchen right this minute! But little does he know that a certain pig who loves toast with a great deal of butter is stirring from sleep. Even less could he guess that a comedy of errors will soon lead this little man on the wild and raucous rodeo ride he’s always dreamed of! Nosy neighbors, astonished firemen, a puzzled policeman, and the ever-doting Watsons return for a hilarious adventure."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/91SLTMJ8XvL.jpg",
    "book": "Miss Bindergarten Gets Ready for Kindergarten",
    "subtitle": "None",
    "author": "Joseph Slate",
    "illustrator": "Ashley Wolff",
    "year": 2001,
    "category": "Animals",
    "tags": "School, Kindergarten",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 6,
    "description": "It's the first day of kindergarten and Miss Bindergarten is hard at work getting the classroom ready for her twenty-six new students. Meanwhile, Adam Krupp wakes up, Brenda Heath brushes her teeth, and Christopher Beaker finds his sneaker. Miss Bindergarten puts the finishing touches on the room just in time, and the students arrive. Now the fun can begin! This rhyming, brightly illustrated book is the perfect way to practice the alphabet and to introduce young children to kindergarten."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51dbloozt-L.jpg",
    "book": "Miss Hazeltine's Home for Shy and Fearful Cats",
    "subtitle": "None",
    "author": "Alicia Potter",
    "illustrator": "Birgitta Sif",
    "year": 2015,
    "category": "Animals",
    "tags": "Cats, Fear",
    "checkedOut": "2016-03-03T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Miss Hazeltine is opening a very special school for shy and fearful cats. They come from all over, and Miss Hazeltine gives them lessons in everything, from \"Bird Basics\" to \"How Not to Fear the Broom.\" The most timid of all is Crumb. He cowers in a corner. Miss Hazeltine doesn't mind. But when she gets in trouble and only Crumb knows where she is, will he find his inner courage and lead a daring rescue?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51-AzMc5+gL.jpg",
    "book": "Miss Mary Mack",
    "subtitle": "A Hand-clapping Rhyme",
    "author": "Mary Ann Hoberman",
    "illustrator": "Nadine Bernard Westcott",
    "year": 2003,
    "category": "Animals",
    "tags": "Nursery Rhymes, Children's Poetry",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 3,
    "description": "This book presents an expanded adaptation of the familiar hand-clapping rhyme about a young girl and an elephant. An expanded adaptation of the familiar hand-clapping rhyme about a young girl and an elephant. Includes music and directions for the hand-clapping actions."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51Llwuj-C-L.jpg",
    "book": "Miss Nelson Has A Field Day",
    "subtitle": "None",
    "author": "Harry Allard",
    "illustrator": "James Marshall",
    "year": 1988,
    "category": "Humans",
    "tags": "Teachers, School",
    "checkedOut": "2016-02-27T08:00:00.000Z",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 6,
    "description": "The notorious Miss Swamp reappears at the Horace B. Smedley School, this time to shape up the football team and help them to win at least one game."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51mnShOKkJL.jpg",
    "book": "Miss Nelson Is Back",
    "subtitle": "None",
    "author": "Harry J Allard Jr",
    "illustrator": "James Marschall",
    "year": 1982,
    "category": "Humans",
    "tags": "Teachers, School",
    "checkedOut": "2016-01-12T08:00:00.000Z",
    "rating": "Loved it",
    "amazon": "4.5 stars",
    "timesRead": 6,
    "description": "While Miss Nelson is recuperating from her tonsillectomy, her class dreads the arrival of Miss Swamp, the substitute teacher. When their teacher has to go away for a week, the kids in room 207 plan to \"really act up.\""
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51u-72EK34L.jpg",
    "book": "Miss Nelson Is Missing!",
    "subtitle": "None",
    "author": "Harry J Allard Jr",
    "illustrator": "James Marschall",
    "year": 1985,
    "category": "Humans",
    "tags": "Teachers, SChool",
    "checkedOut": "2015-12-31T08:00:00.000Z",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 6,
    "description": "Miss Nelson has the worst-behaved class in school; then Miss Swamp turns up to straighten things out. Who is Miss Swamp? That's the mystery. The kids in Room 207 take advantage of their teacher's good nature until she disappears and they are faced with a vile substitute."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51d2XhKtjhL.jpg",
    "book": "Mitford at the Fashion Zoo",
    "subtitle": "None",
    "author": "Donald Robertson",
    "illustrator": "Donald Robertson",
    "year": 2015,
    "category": "Animals",
    "tags": "Giraffes, Fashion",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Mitford is a giraffe.But not your everyday, live-on-the-savannah giraffe. Mitford lives in the city. But not your everyday, filled-with-people city. This city is filled with animals. Animals who like to dress up, especially the animals who work at COVER magazine. Mitford would do ANYTHING to work there. But first Mitford must prove himself. Can Mitford survive the Fashion Zoo?!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51JqKZIrsBL.jpg",
    "book": "Mo's Mustache",
    "subtitle": "None",
    "author": "Ben Clanton",
    "illustrator": "Ben Clanton",
    "year": 2013,
    "category": "Animals",
    "tags": "Mice",
    "checkedOut": "2016-02-09T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "Monster Mo's big, beautiful mustache inspires all his friends to copy his style by getting mustaches of their own, leaving Mo to wonder how he will continue to distinguish himself. Mo expresses his anger when everyone is copying his fashions, but when the other monsters compliment his style, he's the king of the fashion show!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/510Qf8juztL.jpg",
    "book": "Monster Trouble",
    "subtitle": "None",
    "author": "Lane Fredrickson",
    "illustrator": "Michael Robertson",
    "year": 2015,
    "category": "Fantasy",
    "tags": "Monsters",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "Nothing frightens Winifred Schnitzel—but she DOES need her sleep, and the neighborhood monsters WON'T let her be! Every night they sneak in, growling and belching and making a ruckus. Winifred constructs clever traps, but nothing stops these crafty creatures. What's a girl to do? (Hint: Monsters HATE kisses!) The delightfully sweet ending will have every kid—and little monster—begging for an encore."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/612EEVlFeVL.jpg",
    "book": "Monsters Love School",
    "subtitle": "None",
    "author": "Mike Austin",
    "illustrator": "Mike Austin",
    "year": 2014,
    "category": "Fantasy",
    "tags": "Monsters",
    "checkedOut": "2015-10-10T07:00:00.000Z",
    "rating": "Did not like",
    "timesRead": 1,
    "description": "Summer is over, and now it is time for the biggest adventure of all, Monster School. Join these colorful monsters as they go to school for the first time. Reading and writing and learning monster history has never been so much fun. Nervous monsters attending school for the first time learn new things, make friends, and sample Chef Octi's special School Gruel."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61gq47UW6vL.jpg",
    "book": "Monty's Magnificent Mane",
    "subtitle": "None",
    "author": "Gemma O'Neill",
    "illustrator": "Gemma O'Neill",
    "year": 2015,
    "category": "Animals",
    "tags": "Lions, Meerkat",
    "checkedOut": "2016-01-12T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Monty the lion loves his long, golden mane, so he’s not happy when his meerkat friends mess it up. Stomping off to the waterhole, he’s cheered up by the flattery of a new friend . . . a green friend . . . a big, green friend. With a SNAP Monty realizes that his flattering pal is actually a giant crocodile looking for dinner. And it’s up to Monty to save everyone?—?including himself!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/91uxqe71J9L.jpg",
    "book": "Mr. Goat's Valentine",
    "subtitle": "None",
    "author": "Eve Bunting",
    "illustrator": "Kevin Zimmer",
    "year": 2016,
    "category": "Animals",
    "tags": "Goats",
    "checkedOut": "2016-02-12T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "After reading in the newspaper that it's Valentine's Day, Mr. Goat sets out in search of very special gifts for his first love. But just what would a goat choose as the perfect gifts to show how he feels? Readers will be in for a surprise at Mr. Goat's nontraditional selections. From acclaimed children's author Eve Bunting comes a sweet holiday tale sure to warm hearts on Valentine's Day and every day of the year."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61CuGs6aTIL.jpg",
    "book": "Mr. Hare's Big Secret",
    "subtitle": "None",
    "author": "Hannah Dale",
    "illustrator": "Hannah Dale",
    "year": 2016,
    "category": "Animals",
    "tags": "Hares, Forest Animals",
    "checkedOut": "2016-03-17T07:00:00.000Z",
    "rating": "Did not read",
    "amazon": "None",
    "timesRead": 0,
    "description": "Mr. Hare has a secret: there are big, juicy cherries at the top of the tree, but he needs his friends’ help to get them down. One by one, he tricks each friend into dancing with him under the tree, until all the cherries fall to the ground and the forest friends have a great feast."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/612Uq0Hr1CL.jpg",
    "book": "Mummy Cat",
    "subtitle": "None",
    "author": "Marcus Ewert",
    "illustrator": "Lisa Brown",
    "year": 2015,
    "category": "Animals",
    "tags": "Cats, Mummies, Cleopatra",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Mummy Cat prowls his pyramid home, longing for his beloved owner. As he roams the tomb, lavish murals above his head display scenes of the cat with his young Egyptian queen, creating a story-within-a-story about the events of centuries past. Hidden hieroglyphs deepen the tale and are explained in an informative author’s note."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51phBugoIvL.jpg",
    "book": "Mungo and the Spiders From Space",
    "subtitle": "None",
    "author": "Timothy Knapman",
    "illustrator": "Adam Stower",
    "year": 2009,
    "category": "Humans",
    "tags": "Space, Heros, Voyages",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Mungo is pulled into the pages of his space adventure comic, where he must battle the evil Dr. Frankenstinker, a raging Gobblebeast, and an entire robot spider army. When Mungo discovers that the last page of his exciting space adventure story is missing, he jumps into the book to save Captain Galacticus and foil Dr. Frankenstinker's dastardly plan to rule the universe."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/91rwPvtpkFL.jpg",
    "book": "Munschworks",
    "subtitle": "The First Munsch Collection",
    "author": "Robert Munsch",
    "illustrator": "Michael Martchenko",
    "year": 1998,
    "category": "Fantasy",
    "tags": "Short Stories",
    "checkedOut": "OWN",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 6,
    "description": "The stories in this Munsch collection are: • The Paper Bag Princess • I Have to Go! • David’s Father • The Fire Station • Thomas’ Snowsuit"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/513hiUGtJmL.jpg",
    "book": "Mustache Baby",
    "subtitle": "None",
    "author": "Bridget Heos",
    "illustrator": "Joy Ang",
    "year": 2013,
    "category": "Humans",
    "tags": "Babies, Mustaches",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "When Baby Billy is born with a mustache, his family takes it in stride. They are reassured when he nobly saves the day in imaginary-play sessions as a cowboy or cop and his mustache looks good-guy great. But as time passes, their worst fears are confirmed when little Billy’s mustache starts to curl up at the ends in a suspiciously villainous fashion. Sure enough, “Billy’s disreputable mustache led him into a life of dreadful crime.” Plenty of tongue-in-cheek humor and cartoonish illustrations make this the perfect baby-shower gift for a mustachioed father-to-be."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51CAI1qnBVL.jpg",
    "book": "Mustache Baby Meets His Match",
    "subtitle": "None",
    "author": "Bridget Heos",
    "illustrator": "Joy Ang",
    "year": 2015,
    "category": "Humans",
    "tags": "Mustaches, Competitions, Toddlers",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 4,
    "description": "When Baby Javier comes for a playdate, Baby Billy, a.k.a. Mustache Baby, feels the need to show him a thing or two, seeing how Javier’s new to town—and also sports an impressive beard. What ensues is a hilarious test of wills and facial hair, as each baby sets out to prove his manliness. It seems Mustache Baby may have truly met his match . . . but one-upmanship isn’t the point of a playdate, is it?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51oOqrDO3uL.jpg",
    "book": "Mustache!",
    "subtitle": "None",
    "author": "Mac Barnett",
    "illustrator": "Kevin Cornel",
    "year": 2011,
    "category": "Humans",
    "tags": "Mustaches, Pride, Vanity, Kings, Rulers",
    "checkedOut": "2016-02-12T08:00:00.000Z",
    "rating": "Loved it",
    "amazon": "4 stars",
    "timesRead": 6,
    "description": "King Duncan is terribly handsome, but a terrible king. His kingdom is in ruins, and when his subjects appeal for help, he only builds more tributes to his handsome face. His subjects are finally ready to stand up for themselves, and they have just the plan to get out of this hairy situation."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/819PW+SOGQL.jpg",
    "book": "My Lucky Day",
    "subtitle": "None",
    "author": "Keiko Kasza",
    "illustrator": "Keiko Kasza",
    "year": 2005,
    "category": "Animals",
    "tags": "Foxes, Pigs",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "When a delicious-looking piglet knocks on Mr. Fox's door \"accidentally,\" the fox can hardly believe his good luck. It's not every day that dinner just shows up on your doorstep. It must be his lucky day! Or is it? Before Mr. Fox can say grace, the piglet has manipulated him into giving him a fabulously tasty meal, the full spa treatment (with bath and massage), and . . . freedom. In a funny trickster tale of her own, Kasza keeps readers guessing until the surprise ending when they'll realize it was piglet's lucky day all along."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51u3poQJiZL.jpg",
    "book": "My Pet Book",
    "subtitle": "None",
    "author": "Bob Staake",
    "illustrator": "Bob Staake",
    "year": 2014,
    "category": "Humans",
    "tags": "Pets, Imagination",
    "checkedOut": "2016-01-12T08:00:00.000Z",
    "rating": "Loved it",
    "amazon": "4.5 stars",
    "timesRead": 4,
    "description": "Most pets are cats and dogs, but what happens when a boy wants a different kind of pet, one that doesn’t meow or bark? Bob Staake’s exuberant tale of a little boy and the pet of his dreams will appeal to anyone whose best friends are . . . books! Books make the perfect pets, the boy decides, and chooses a bright red one. When it goes missing, a lively adventure is in store for readers who love a happy ending. Soon kids everywhere will wish for a pet book of their very own."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/81T36fZ2v4L.jpg",
    "book": "My Teacher Is A Monster!",
    "subtitle": "No I am Not",
    "author": "Peter Brown",
    "illustrator": "Peter Brown",
    "year": 2014,
    "category": "Humans",
    "tags": "Monsters, Schools, Teachers",
    "checkedOut": "2016-02-12T08:00:00.000Z",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 6,
    "description": "A young boy named Bobby has the worst teacher. She's loud, she yells, and if you throw paper airplanes, she won't allow you to enjoy recess. She is a monster! Luckily, Bobby can go to his favorite spot in the park on weekends to play. Until one day... he finds his teacher there! Over the course of one day, Bobby learns that monsters are not always what they seem."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/91fzcfKh3jL.jpg",
    "book": "Naughty Mabel",
    "subtitle": "None",
    "author": "Nathan Lane",
    "illustrator": "Dan Krall",
    "year": 2015,
    "category": "Animals",
    "tags": "Dogs, Humorous",
    "checkedOut": "OWN",
    "rating": "Loved it",
    "amazon": "4.5 stars",
    "timesRead": 6,
    "description": "Meet Mabel, the fanciest French bulldog the Hamptons have ever seen. Mabel is many things: sassy, classy (and sometimes a bit gassy!), but especially ... naughty! Mabel s always getting herself into trouble and with style like hers, can you really blame her? When Naughty Mabel s parents throw a party and try to leave her out of the fun, of course she must take matters into her own perfectly pedicured paws. As the hilarity ensues, Mabel and her parents learn that through thick and thin, naughty or nice, they ll always be a family, just as they are."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51uEL808D5L.jpg",
    "book": "Noni the Pony Goes to the Beach",
    "subtitle": "None",
    "author": "Alison Lester",
    "illustrator": "Alison Lester",
    "year": 2015,
    "category": "Animals",
    "tags": "Horses",
    "checkedOut": "2015-11-24T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "Noni the Pony and her friends are off to the beach! Their playful day is going swimmingly—until Dave Dog follows a whale a bit too far out to sea. Luckily, Noni is there to rescue the poor pup and bring him back to safety…and back to the fun!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61ozPFpJiFL.jpg",
    "book": "Not your Typical Dragon",
    "subtitle": "None",
    "author": "Dan Bar-el",
    "illustrator": "Tim Bowers",
    "year": 2013,
    "category": "Fantasy",
    "tags": "Dragons",
    "checkedOut": "2015-09-11T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 5,
    "description": "\"When Crispin Blaze turns seven, he's expected to breathe fire like all the other dragons. But instead of fire, he breathes a host of unusual things\"--Provided by publisher. When Crispin Blaze turns seven years old, he is expected to breathe fire like all the other dragons, but instead of fire, he breathes a host of unusual things."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61U4YEhFe9L.jpg",
    "book": "Nugget and Fang",
    "subtitle": "Friends Forever—or Snack Time?",
    "author": "Tammi Sauer",
    "illustrator": "Michael Slack",
    "year": 2013,
    "category": "Animals",
    "tags": "Sharks, Fish",
    "checkedOut": "2015-11-24T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "In the deep ocean, tiny Nugget and big, toothy Fang get along swimmingly--until Nugget's first day of minnow school. There Nugget learns that minnows are supposed to be afraid of sharks! To regain Nugget's trust, Fang takes desperate (and hilarious) measures. But it's not until his big sharp teeth save the entire school that minnows learn this shark is no foe. Fantastically stylized artwork adds even more humor to this undersea story of unlikely friendship."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51eMW7QbXgL.jpg",
    "book": "Officer Panda, Fingerprint Detective",
    "subtitle": "None",
    "author": "Ashley Crowley",
    "illustrator": "Ashley Crowley",
    "year": 2015,
    "category": "Animals",
    "tags": "Pandas, Detectives",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "When Officer Panda notices some strange fingerprints in his neighborhood, he sets out to solve the curious case. Children will giggle along as they help Officer Panda figure out who's been leaving mysterious prints everywhere."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/41h1aGkc1sL.jpg",
    "book": "Oh No, George!",
    "subtitle": "None",
    "author": "Chris Haughton",
    "illustrator": "Chris Haughton",
    "year": 2012,
    "category": "Animals",
    "tags": "Dogs",
    "checkedOut": "2015-12-31T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 3,
    "description": "George finds it hard to be a good dog when there are cats to chase, flowers to dig up, and a delicious cake sitting on the kitchen table. George tries very hard to be a good dog, but he is tempted to eat the delicious cake on the kitchen table, chase the cats, and dig up the flowers."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61yPY2BGodL.jpg",
    "book": "Oh, no!",
    "subtitle": "None",
    "author": "Candace Fleming",
    "illustrator": "Eric Rohmann",
    "year": 2012,
    "category": "Animals",
    "tags": "Stories in Rhyme",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Young children will delight in repeating the refrain \"OH, NO!\" as one animal after another falls into a deep, deep hole in this lively read-aloud. This simple and irresistible picture book by hugely popular picture book creators—Candace Fleming and Caldecott medalist Eric Rohmann—feels like a classic-in-the-making. Fans of Rohmann's Caldecott Medal­-winning My Friend Rabbit, will be thrilled to see a new book created in the same expressive and comical style."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/410UuG0JfAL.jpg",
    "book": "Olivia",
    "subtitle": "None",
    "author": "Ian Falconer",
    "illustrator": "Ian Falconer",
    "year": 2000,
    "category": "Animals",
    "tags": "Pigs, Behavior",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "Whether at home getting ready for the day, enjoying the beach, or at bedtime, Olivia is a feisty pig who has too much energy for her own good."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51IIV6mY0IL.jpg",
    "book": "Olivia Saves the Circus",
    "subtitle": "None",
    "author": "Ian Falconer",
    "illustrator": "Ian Falconer",
    "year": 2010,
    "category": "Animals",
    "tags": "Pigs, Circus, School",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "When all of the performers at the circus are out sick with ear infections, it's up to Olivia to save the day! That's no problem for Olivia, of course, because she knows how to do everything. From lion taming to trampoline jumping, unicycling to tight-rope walking, Olivia is the ultimate performer--with the ultimate imagination. Now in a board book edition perfect for little hands, readers will delight to see how Ringmaster Olivia learns to fly!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/513LBbnFoiL.jpg",
    "book": "Ollie and Claire",
    "subtitle": "None",
    "author": "Tiffany Strelitz Haber",
    "illustrator": "Matthew Cordell",
    "year": 2013,
    "category": "Animals",
    "tags": "Dogs, Friendship, Best Friends, Stories in Rhyme",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Ollie and Claire are as tight as two friends can be. Every day they picnic together, every day they do yoga together, and every evening they eat dinner together. But when Claire longs to break free from this routine and dreams of traveling the world, she worries that Ollie would never join her. So she takes matters into her own hands and finds a mysterious travel partner when she sees a sign posted on a tree. Who could it be? And how can she ever tell Ollie? With a fun twist leading to a surprise ending, Ollie and Claire is a sweet and fun tribute to dynamic duos everywhere, who might feel the need to mix things up every once in a while."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51r1NDhywXL.jpg",
    "book": "One Bear Extraordinaire",
    "subtitle": "None",
    "author": "Jayme McGowan",
    "illustrator": "Jayme McGowan",
    "year": 2015,
    "category": "Animals",
    "tags": "Bears, Bands, Music",
    "checkedOut": "2016-03-03T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "Bear wakes up one morning with a song in his head, but something is missing. What’s a one-bear band to do? He travels the forest in search of his song and meets a few other musicians along the way, but even with their help, his song still feels incomplete. Will Bear find the perfect accompaniment and learn that every song sounds sweeter with friends by his side?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/91STmLiQrBL.jpg",
    "book": "One Cool Friend",
    "subtitle": "None",
    "author": "Toni Buzzeo",
    "illustrator": "David Small",
    "year": 2012,
    "category": "Animals",
    "tags": "Penguins",
    "checkedOut": "2016-02-21T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "When well-mannered Elliot reluctantly visits the aquarium with his distractible father, he politely asks whether he can have a penguin--and then removes one from the penguin pool to his backpack. The fun of caring for a penguin in a New England Victorian house is followed by a surprise revelation by Elliot's father."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61H508LV6iL.jpg",
    "book": "Open This Little Book",
    "subtitle": "None",
    "author": "Jesse Klausmeier ",
    "illustrator": "Suzy Lee",
    "year": 2013,
    "category": "Animals",
    "tags": "Interactive",
    "checkedOut": "2016-02-21T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "What will you find when you open this little book? A fun story? Sweet characters? Enticing pictures? Yes! But much more. Open this book and you will find...another book...and another...and another. Debut author Jesse Klausmeier and master book creator Suzy Lee have combined their creative visions to craft a seemingly simple book about colors for the very youngest readers, an imaginative exploration of the art of book making for more sophisticated aficionados, and a charming story of friendship and the power of books for all."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/81vyezQMA6L.jpg",
    "book": "Over There",
    "subtitle": "None",
    "author": "Steve Pilcher",
    "illustrator": "Steve Pilcher",
    "year": 2014,
    "category": "Animals",
    "tags": "Friendship, Mice",
    "checkedOut": "2015-12-10T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4 stars",
    "timesRead": 0,
    "description": "Shredder is a little shrew who lives by himself, and while he loves his forest home, he gets a bit lonely. There must be something more, he thinks. So when he sees a \"silver line twinkling in the distance,\" he decides to find out what it is. He discovers a beautiful stream, but then he gets caught up in the current! Luckily, a mole named Nosey saves him. As they explore, Shredder begins to miss the forest, so he and Nosey return together, and Shredder realizes that all he really needed was a friend."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51KATrRQLtL.jpg",
    "book": "Over-scheduled Andrew",
    "subtitle": "None",
    "author": "Ashley Spires",
    "illustrator": "Ashley Spires",
    "year": 2016,
    "category": "Animals",
    "tags": "Birds",
    "checkedOut": "2016-02-19T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "Andrew loves putting on plays so he decides to join the drama club at school. Determined to make his performance the best it can be, he joins the debate club to practice his public speaking. He signs up for dance and karate to help with his coordination. Then he's asked to play for the tennis team and edit the school newspaper. Before long he's learning to play the bagpipes, attending Spanish classes and joining the French film club. Suddenly Andrew doesn't have time for anything or anyone else, not even his best friend Edie. And he definitely doesn't have time to sleep. "
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51lI+qyYKkL.jpg",
    "book": "P.J. Funnybunny Camps Out",
    "subtitle": "None",
    "author": "Marylin Sadler",
    "illustrator": "Roger Bollen",
    "year": 1993,
    "category": "Animals",
    "tags": "Rabbits",
    "checkedOut": "2016-01-12T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "Two girls tag along on a boys' campout. Although P.J. and his friends refuse to let Donna and Honey Bunny go camping with them because \"camping is not for girls,\" the girls follow and get proof that camping is hard work even for boys."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51vwhm9NMtL.jpg",
    "book": "Paddington",
    "subtitle": "None",
    "author": "Michael Bond",
    "illustrator": "R. W. Alley",
    "year": 2007,
    "category": "Animals",
    "tags": "Bears",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Nearly fifty years ago, a small bear from Darkest Peru set out on an adventure of a lifetime. With nothing but a suitcase, several jars of marmalade, and a label around his neck that read, \"Please Look After This Bear,\" he stowed away on a ship headed for faraway England. When the little bear arrived at London's busy Paddington Station, he was discovered by Mr. and Mrs. Brown. As luck would have it, the Browns were just the sort of people to welcome a lost bear into their family."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51etd-3IlYL.jpg",
    "book": "Peppa Pig and the Treasure Hunt",
    "subtitle": "None",
    "author": "Candlewick Press",
    "illustrator": "Candlewick Press",
    "year": 2015,
    "category": "Animals",
    "tags": "Pigs",
    "checkedOut": "2016-02-27T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Peppa Pig and her little brother, George, are excited about spending the day with Granny Pig and Grandpa Pig. But when they arrive, they’re even more excited to find Grandpa Pig wearing a pirate hat and Grandma Pig holding a map. It’s time for a treasure hunt in the backyard! X marks the spot?—?but how will they get there, and what will they find?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51tlAK-jSkL.jpg",
    "book": "Polar Bear's Underwear",
    "subtitle": "None",
    "author": "Tupera Tupera",
    "illustrator": "Tupera Tupera",
    "year": 2015,
    "category": "Animals",
    "tags": "Bears",
    "checkedOut": "2015-12-31T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "Polar Bear has lost his underwear! Where could it be? There's only one thing to do: Remove the book's underwear-shaped bellyband to find the missing pair! Is that Polar Bear's underwear? No, it's Zebra's—see the colorful stripes? What about that itty-bitty pair? No, those belong to Butterfly! And so the search continues, with every page revealing an animal in eye-popping undies. This laugh-out-loud, one-of-a-kind novelty book from Japanese design talents tupera tupera will surprise and amuse children and their parents, all while affirming the importance of putting on your underwear."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51aLxGnd2cL.jpg",
    "book": "Poopendous!",
    "subtitle": "The Inside Scoop on Every Type and Use of Poop!",
    "author": "Artie Bennett",
    "illustrator": "Mike Moran",
    "year": 2012,
    "category": "Humans",
    "tags": "Humorous",
    "checkedOut": "2015-09-19T07:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Rhyming couplets feature Professor Poopdeck and two young friends as he takes them on a type of poop safari. Words for poop (e.g., guano, number two, ca-ca), its forms and styles (cubes, tubular, wet and dry), and myriad of uses (souvenirs, a means of tracking and marking, housing insulation, food, fertilizer, fuel, etc.) are all conveyed with humor and a certain demand for respect. It's a book that says: Don't just flush this stuff away! While it may dismay and stink, there's more to this than you might think!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61Zl3+OBxZL.jpg",
    "book": "Prince of A Frog",
    "subtitle": "None",
    "author": "Jackie Urbanovick",
    "illustrator": "Jackie Urbanovick",
    "year": 2015,
    "category": "Animals",
    "tags": "Frogs",
    "checkedOut": "2015-09-11T07:00:00.000Z",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "Hopper is a frog who thinks he is a prince, so he starts out on an adventure to find a princess, whose kiss will transform him to his royal self."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61lGOPwm3nL.jpg",
    "book": "Princess In Training",
    "subtitle": "None",
    "author": "Tammi Sauer",
    "illustrator": "Joe Berger",
    "year": 2012,
    "category": "Humans",
    "tags": "Princess",
    "checkedOut": "2016-02-12T08:00:00.000Z",
    "rating": "Liked It",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "Princess Viola is great at skateboarding and karate-chopping, but she's lousy at the royal wave, walk, and waltz. The king and queen are not pleased. What's a princess to do? Attend skill-polishing Camp Princess, of course. Viola is a skateboarding, karate-chopping, moat-diving princess, to the distress of her parents, and so she accepts an invitation to Princess Camp, hoping to become the \"darling of her kingdom.\""
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/5162h5nCA8L.jpg",
    "book": "Princess Peepers",
    "subtitle": "None",
    "author": "Pam Calvert",
    "illustrator": "Pam Calvert",
    "year": 2008,
    "category": "Humans",
    "tags": "Princess, Glasses",
    "checkedOut": "2016-02-12T08:00:00.000Z",
    "rating": "Liked It",
    "amazon": "4 stars",
    "timesRead": 1,
    "description": "When the other princesses make fun of her for wearing glasses, Princess Peepers vows to go without, but after several mishaps, one of which is especially coincidental, she admits that she really does need them if she wants to see. When the other princesses make fun of her for wearing glasses, Princess Peepers vows to go without, but after several mishaps--one of which is especially coincidental--she admits that she really does need them if she wants to see."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/6155HyvhX7L.jpg",
    "book": "Princess Says Goodnight",
    "subtitle": "None",
    "author": "Naomi Howland",
    "illustrator": "David Small",
    "year": 2010,
    "category": "Humans",
    "tags": "Princesses, Bedtime, Imagination, Stories in Rhyme",
    "rating": "Have not read yet",
    "amazon": "4.5 stars",
    "description": "When a little girl pretends she's a real princess, her imagination soars and her bedtime routine is transformed into a majestic affair. While practicing curtsies on her way to bed, she gets the royal treatment: chocolate cream éclairs, glass slippers, ladies-in-waiting, a tiara—even a bubble bath with a special fluffy towel to dry her toes. Being a princess is so much fun! But at bedtime, there's one thing a little girl—or a princess—always gets: a kiss before saying goodnight."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51tiQrFVTdL.jpg",
    "book": "Princesses on the Run",
    "subtitle": "None",
    "author": "Smiljana Coh",
    "illustrator": "Smiljana Coh",
    "year": 2013,
    "category": "Humans",
    "tags": "Princess",
    "checkedOut": "2015-08-20T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "Princess Antonia cannot be cured of her boredom, so despite pretty dresses and the coolest toys, she decides to run away. With friends like Rapunzel, Cinderella, Sleeping Beauty, and Snow White, a big adventure ensues. Princess Antonia cannot be cured of her boredom, so despite pretty dresses and the coolest toys, she decides to run away--and with friends like Rapunzel, Cinderella, Sleeping Beauty, and Snow White, a big adventure ensues."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/912eKkvkiKL.jpg",
    "book": "Purple, Green and Yellow",
    "subtitle": "None",
    "author": "Robert Munsch",
    "illustrator": "Hélène Desputeaux",
    "year": 1992,
    "category": "Humans",
    "tags": "Colors, Art",
    "checkedOut": "OWN",
    "rating": "Liked it",
    "amazon": "3 stars",
    "timesRead": 3,
    "description": "Brigid really loves markers. But when she draws on herself with super-permanent ink, she knows that spells trouble."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61xIhJm5TmL.jpg",
    "book": "Rappy the Raptor",
    "subtitle": "None",
    "author": "Dan Gutman",
    "illustrator": "Tim Bowers",
    "year": 2015,
    "category": "Dinosaurs",
    "tags": "Dinosaurs",
    "checkedOut": "2016-01-23T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "3 stars",
    "timesRead": 0,
    "description": "Rappy the Raptor tells the story of how he bacame a rapping velociraptor, all in rhyme"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61VMT4K2V4L.jpg",
    "book": "Read-aloud Rhymes for the Very Young",
    "subtitle": "None",
    "author": "Jack Prelutsky",
    "illustrator": "Marc Brown",
    "year": 1986,
    "category": "Humans",
    "tags": "Poetry, Recitations",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "First published in 1986 and just as fresh and relevant today, this widely acclaimed, child-friendly poetry anthology is now being reissued with a striking new jacket. In his introduction to this book Jim Trelease, bestselling author of The Read-Aloud Handbook, writes, “No one better recognizes the essence of the child-poetry connection than poet and anthologist Jack Prelutsky. . . . Here are more than 200 little poems to feed little people with little attention spans to help both grow. Marc Brown’s inviting illustrations add a visual dimension to the poems, which further engage young imaginations.” The poems are by 119 of the best-known poets of the 20th century."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51zBca3pD7L.jpg",
    "book": "Ribbit!",
    "subtitle": "None",
    "author": "Rodrigo Folgueira",
    "illustrator": "Poly Bernatene",
    "year": 2013,
    "category": "Animals",
    "tags": "Pigs",
    "checkedOut": "2015-12-31T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "A group of frogs are living happily in a peaceful pond, until they discover a surprise visitor: a little pink pig. Sitting contentedly on a rock in the middle of their pond, the pig opens his mouth and says: RIBBIT!The frogs are bewildered at first, and then a bit annoyed—\"What did that little pig just say?\", \"Does he think he's a frog?\", \"Is he making fun of us?\""
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/81f-ban+7nL.jpg",
    "book": "Room on the Broom",
    "subtitle": "None",
    "author": "Julia Donaldson",
    "illustrator": "Axel Scheffler",
    "year": 2001,
    "category": "Fantasy",
    "tags": "Witches",
    "checkedOut": "2016-02-23T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "The witch and her cat are happily flying through the sky on a broomstick when the wind picks up and blows away the witch's hat, then her bow, and then her wand! Luckily, three helpful animals find the missing items, and all they want in return is a ride on the broom. But is there room on the broom for so many friends? And when disaster strikes, will they be able to save the witch from a hungry dragon?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/91+ileTnb2L.jpg",
    "book": "Rosie Revere, Engineer",
    "subtitle": "None",
    "author": "Andrea Beaty",
    "illustrator": "David Roberts",
    "year": 2013,
    "category": "Humans",
    "tags": "Inventions",
    "checkedOut": "2016-01-16T08:00:00.000Z",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 6,
    "description": "Rosie may seem quiet during the day, but at night she's a brilliant inventor of gizmos and gadgets who dreams of becoming a great engineer. When her great-great-aunt Rose (Rosie the Riveter) comes for a visit and mentions her one unfinished goal--to fly--Rosie sets to work building a contraption to make her aunt's dream come true. But when her contraption doesn't fl y but rather hovers for a moment and then crashes, Rosie deems the invention a failure. On the contrary, Aunt Rose inisists that Rosie's contraption was a raging success. You can only truly fail, she explains, if you quit."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/91U4+7eyeIL.jpg",
    "book": "Rude Cakes",
    "subtitle": "None",
    "author": "Rowboat Watkins",
    "illustrator": "Rowboat Watkins",
    "year": 2015,
    "category": "Fantasy",
    "tags": "Cake, Food",
    "checkedOut": "2016-02-21T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4 stars",
    "timesRead": 1,
    "description": "Who knew that cakes were so rude?! In this deliciously entertaining book, a not-so-sweet cake—who never says please or thank you or listens to its parents—gets its just desserts. Mixing hilarious text and pictures, Rowboat Watkins, a former Sendak fellow, has cooked up a laugh-out- loud story that can also be served up as a delectable discussion starter about manners or bullying, as it sweetly reminds us all that even the rudest cake can learn to change its ways."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61tttsZK2+L.jpg",
    "book": "Rufus Goes to School",
    "subtitle": "None",
    "author": "Kim Griswell",
    "illustrator": "Gorbachev Valeri",
    "year": 2013,
    "category": "Animals",
    "tags": "Pig, School",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "All Rufus Leroy Williams III wants is to go to school so he can learn to read his favorite book. But there's one problem: he's a pig and Principal Lipid says: “NO PIGS IN SCHOOL!” Rufus even gets a backpack, a lunchbox, and a blanket to prove he's ready. But Mr. Lipid won't budge. Is there ANYTHING Rufus can do to change his mind? Kim Griswell and illustrator Valeri Gorbachev have created a love letter to reading that's also a charming, original, and child-friendly first-day-of-school story."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51Qg-gCa-SL.jpg",
    "book": "Russell the Sheep",
    "subtitle": "None",
    "author": "Rob Scotton",
    "illustrator": "Rob Scotton",
    "year": 2005,
    "category": "Animals",
    "tags": "Sheep",
    "checkedOut": "2015-09-19T07:00:00.000Z",
    "rating": "Liked It",
    "amazon": "5 stars",
    "timesRead": 4,
    "description": "Russell the sheep tries all different ways to get to sleep. Russell the sheep tries many different ways to get to sleep."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/512ZmgZsb5L.jpg",
    "book": "Sam & Dave Dig a Hole",
    "subtitle": "None",
    "author": "Mac Barnett",
    "illustrator": "Jon Classen",
    "year": 2014,
    "category": "Humans",
    "tags": "Humorous",
    "checkedOut": "2016-01-30T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "Sam and Dave are sure they will discover something exciting if they just keep digging their hole. Sam and Dave are on a mission to find something spectacular. So they dig a hole and keep digging and they find nothing. Yet the day turns out to be pretty spectacular after all."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/41zlEnh18VL.jpg",
    "book": "Say Hello to Zorro!",
    "subtitle": "None",
    "author": "Carter Goodrich",
    "illustrator": "Carter Goodrich",
    "year": 2011,
    "category": "Animals",
    "tags": "Dogs, Change",
    "checkedOut": "2016-02-27T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "Mister Bud is a dog of routine. He has wake up time, nap time, rest time, dinner time, etc. And everyone knows to follow his schedule. Then disaster strikes. A stranger comes home at \"make a fuss time\" and throws everything off! Zorro is little bit bossy and Mister Bud wants nothing to do with him. But when the dogs discover they like the same things (like chasing the cat and napping), everything becomes more fun. As long as everyone follows the schedule."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51D0R46QYIL.jpg",
    "book": "Secret Agent Splat!",
    "subtitle": "Splat the Cat",
    "author": "Rob Scotton",
    "illustrator": "Rob Scotton",
    "year": 2012,
    "category": "Animals",
    "tags": "Cats",
    "checkedOut": "2015-10-10T07:00:00.000Z",
    "rating": "Loved it",
    "amazon": "4.5 stars",
    "timesRead": 4,
    "description": "Splat the Cat notices that something isn’t quite right in his house. First his father’s duck decoys start to go missing. Then they are mysteriously returned but, strangely enough, without their beaks! Who could possibly be causing all of this trouble? To solve the mystery, Splat musters up his courage and rises to the challenge as Secret Agent Splat."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/41WOiIRjWhL.jpg",
    "book": "Shh! We Have A Plan",
    "subtitle": "None",
    "author": "Chris Haughton",
    "illustrator": "Chris Haughton",
    "year": 2014,
    "category": "Humans",
    "tags": "Bird Trapping",
    "checkedOut": "2016-01-06T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "Four friends creep through the woods, and what do they spot? An exquisite bird high in a tree! \"Hello birdie,\" waves one. \"Shh! We have a plan,\" hush the others. They stealthily make their advance, nets in the air. Ready one, ready two, ready three, and go! But as one comically foiled plan follows another, it soon becomes clear that their quiet, observant companion, hand outstretched, has a far better idea."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51XRijhwu6L.jpg",
    "book": "Shifty McGifty and Slippery Sam",
    "subtitle": "None",
    "author": "Tracey Corderoy",
    "illustrator": "Steven Lenton",
    "year": 2013,
    "category": "Animals",
    "tags": "Dogs, Baking, Robbers",
    "checkedOut": "2015-08-20T07:00:00.000Z",
    "rating": "Like it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "Shifty McGifty and Slippery Sam are two hapless robber dogs who decide the perfect way to rob their neighbors would be to invite them over for a lovely tea party. The only problem is they’ve never baked a cupcake or pastry in their lives. Could this be the change of pace they’ve been looking for? A funny, quirky story, deliciously dished up!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/71ZOHrs9mTL.jpg",
    "book": "Shoe Dog",
    "subtitle": "None",
    "author": "Megan McDonald",
    "illustrator": "Katherine Tillotson",
    "year": 2014,
    "category": "Animals",
    "tags": "Dogs",
    "checkedOut": "2016-01-23T08:00:00.000Z",
    "rating": "Liked It",
    "amazon": "4 stars",
    "timesRead": 1,
    "description": "In order to stay in the warm and cozy home he has longed for, Shoe Dog must learn to stop chewing shoes."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51ieamVoxvL.jpg",
    "book": "Silly Goose's Big Story",
    "subtitle": "None",
    "author": "Keiko Kasza",
    "illustrator": "Keiko Kasza",
    "year": 2012,
    "category": "Animals",
    "tags": "Geese",
    "checkedOut": "2015-09-11T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "Goose's friends love the stories he makes up when they're playing. Except one thing - Goose is always the hero. And when they ask to take turns leading the fun, Goose doesn't agree. While they argue about it, no one notices the hungry wolf sneaking up on them until he shouts, \"Hello, Lunch!\""
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/915Ahwafh3L.jpg",
    "book": "Simpson's Sheep Won't Go to Sleep!",
    "subtitle": "None",
    "author": "Bruce Arant",
    "illustrator": "Bruce Arant",
    "year": 2013,
    "category": "Animals",
    "tags": "Sheep",
    "checkedOut": "2015-09-11T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "\"When Farmer Simpson tries to put his sheep to bed, they think of every excuse to stay awake. Finally, he thinks of a warm and cozy solution that will help lull the sheep right to sleep\""
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61pg9wkpn+L.jpg",
    "book": "Snip Snap!",
    "subtitle": "What's That?",
    "author": "Mara Bergman",
    "illustrator": "Nick Maland",
    "year": 2005,
    "category": "Humans",
    "tags": "Fears, Alligators",
    "checkedOut": "2015-10-10T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "Three siblings are frightened by the wide mouth, long teeth, and strong jaws of the alligator that has crept up the stairs, until they decide they have had enough. Three siblings are frightened by the wide mouth, long teeth, and strong jaws of the alligator who has crept up the stairs--until they decide they have had enough."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51m+iTpuOeL.jpg",
    "book": "Sparky!",
    "subtitle": "None",
    "author": "Jenny Offill",
    "illustrator": "Chris Appelhans",
    "year": 2014,
    "category": "Animals",
    "tags": "Sloths, Pets",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 0.5,
    "description": "Sparky stars a pet who has more to offer than meets the eye. When our narrator orders a sloth through the mail, the creature that arrives isn't good at tricks or hide-and-seek . . . or much of anything. Still, there's something about Sparky that is irresistible."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/71sCIYnaZNL.jpg",
    "book": "Spike",
    "subtitle": "The Mixed-up Monster",
    "author": "Susan Hood",
    "illustrator": "Melissa Sweet",
    "year": 2012,
    "category": "Fantasy",
    "tags": "Monsters",
    "checkedOut": "2015-09-19T07:00:00.000Z",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "While Spike, a tiny axolotl salamander, practices being the monster he believes he is, other animals call him cute and funny but when a gila monster arrives and the other creatures hide, Spike shows his true nature. While Spike, a tiny salamander, practices being the monster he believes he is, other animals call him cute and funny. But when a Gila monster arrives and the other creatures hide, Spike shows his true nature."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51lCx3yGICL.jpg",
    "book": "Splat Says Thank You!",
    "subtitle": "Splat the Cat",
    "author": "Rob Scotton",
    "illustrator": "Rob Scotton",
    "year": 2012,
    "category": "Animals",
    "tags": "Cats",
    "checkedOut": "2015-09-19T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "Splat the Cat's trusty mouse friend, Seymour, needs cheering up, and Splat wants to help. He's been working on something special for Seymour—not just a thank-you card but a thank-you book! His book lists all the sweet and often hilarious reasons Splat is thankful for their friendship."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51a6WjE1zsL.jpg",
    "book": "Splat the Cat",
    "subtitle": "Up in the Air at the Fair",
    "author": "Rob Scotton",
    "illustrator": "Rob Scotton",
    "year": 2014,
    "category": "Animals",
    "tags": "Cats, Friendship",
    "checkedOut": "2016-02-21T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Splat the Cat can't wait to try the rides and food at the fair with his friends, but when Kitten can't come, Splat, Spike, and Plank are determined to cheer her up by bringing her back something from the fair. Based on the series created by Rob Scotton. \"Splat the Cat can't wait to try all the rides and food at the fair with his friends. When Kitten can't join them, Splat, Spike, and Plank are determined to bring back something from the fair to cheer her up--but how do they find the perfect get-well gift? Join Splat and his friends as they embark on their mission to find the best gift ever."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51ZXT4Ec9RL.jpg",
    "book": "Splish, Splash, Splat!",
    "subtitle": "None",
    "author": "Rob Scotton",
    "illustrator": "Rob Scotton",
    "year": 2011,
    "category": "Animals",
    "tags": "Cats, Swimming, Friendship, School, Fear",
    "checkedOut": "2015-08-20T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4 stars",
    "timesRead": 4,
    "description": "Splat does not want to have a playdate with Spike. Spike will break his toys and eat all of his candy fish! And he does not want to learn how to swim—water is horrible, scary, and wet! He's sure that this is going to be the worst day ever. But when the rest of their classmates rush straight into the pool, Splat and Spike find that they may have more in common than they thought. Will Splat overcome his fear of water and get into the pool? And how can he help Spike to do the same?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61sDP6w6UmL.jpg",
    "book": "Stand Back, Said the Elephant, \"I'm Going to Sneeze!\"",
    "subtitle": "None",
    "author": "Patricia Thomas",
    "illustrator": "Wallace Tripp",
    "year": 1990,
    "category": "Animals",
    "tags": "Elephants",
    "checkedOut": "2016-03-22T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "All the animals are in a panic. The elephant's sneeze would blow the monkeys out of the trees, the feathers off the birds, the stripes off the zebra. Even the fish and the fly, the crocodile and the kangaroo, know what a catastrophe that sneeze would be."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51tyREBDGnL.jpg",
    "book": "Stop That Pickle!",
    "subtitle": "None",
    "author": "Peter Armour",
    "illustrator": "Peter Armour",
    "year": 2005,
    "category": "Food",
    "tags": "Pickles",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 3,
    "description": "When Mrs. Elmira Deeds waddles into Mr. Adolph’s deli and asks for a pickle, chaos erupts! The pickle escapes from the jar, and a cast of zany characters, including a peanut butter and jelly sandwich and seventeen toasted almonds, joins in the chase to stop the pickle as it attempts to run away. Can anyone stop that pickle?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/81-j4Uz5SLL.jpg",
    "book": "Strictly No Elephants",
    "subtitle": "None",
    "author": "Lisa Mantchev",
    "illustrator": "Taeeun Yoo",
    "year": 2015,
    "category": "Animals",
    "tags": "Elephants, Pets",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "When the local Pet Club won’t admit a boy’s tiny pet elephant, he finds a solution—one that involves all kinds of unusual animals in this sweet and adorable picture book. Today is Pet Club day. There will be cats and dogs and fish, but strictly no elephants are allowed. The Pet Club doesn’t understand that pets come in all shapes and sizes, just like friends. Now it is time for a boy and his tiny pet elephant to show them what it means to be a true friend."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/513hvoQBmDL.jpg",
    "book": "Surf's up",
    "subtitle": "None",
    "author": "Kwame Alexander",
    "illustrator": "Daniel Miyares",
    "year": 2016,
    "category": "Animals",
    "tags": "Frogs, Beach, Surfing",
    "checkedOut": "2016-02-23T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4 stars",
    "timesRead": 0,
    "description": "Surf's up! Not yet, Dude! Books are boring! Not this one! Bro and Dude have very different ideas about how to spend the day at the beach. But as Bro continues to gasp and cheer as he reads his book (Moby Dick), Dude can't help but get curious. Before you can shout 'Surf's up!' both frogs are sharing the same adventure, that is, until they get to the beach. Newbery Award Medal Winner, Kwame Alexander, and Daniel Miyares have joined forces to give little listeners a wild ride."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/810oIYja4LL.jpg",
    "book": "Sylvester and the Magic Pebble",
    "subtitle": "None",
    "author": "William Steig",
    "illustrator": "William Steig",
    "year": 2012,
    "category": "Animals",
    "tags": "Donkeys, Magic, Missing CHildren",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Sylvester can’t believe his luck when he finds a magic pebble that can make wishes come true. But when a lion jumps out at him on his way home, Sylvester is shocked into making a wish that has unexpected consequences. After overcoming a series of obstacles, Sylvester is eventually reunited with his loving family. Illustrated with William Steig’s glowing pictures, this winner of the Caldecott Medal is beloved by children everywhere."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61bYVF9Z9lL.jpg",
    "book": "Tacky the Penguin",
    "subtitle": "None",
    "author": "Helen Lester",
    "illustrator": "Lynn Munsinger",
    "year": 1990,
    "category": "Animals",
    "tags": "Penguins, Behavior, Individuality",
    "rating": "Have not read yet",
    "amazon": "5 stars",
    "description": "Tacky the penguin does not fit in with his sleek and graceful companions, but his odd behavior comes in handy when hunters come with maps and traps."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51NH1GK9QJL.jpg",
    "book": "Take A Hike, Snoopy!",
    "subtitle": "Peanuts",
    "author": "Judie Katschke",
    "illustrator": "Charles M. Schulz",
    "year": 2002,
    "category": "Animals",
    "tags": "Dogs",
    "checkedOut": "2016-02-21T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "The world famous Beagle Scout takes his eager bird troop on a camping and hiking trip that turns out to be very different from what Snoopy planned. This adaptation is based on the works of Charles M. Schulz. The world famous Beagle Scout takes his eager bird troops on a camping and hiking trip that turns out to be very different from what Snoopy planned."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/41KwP05-vNL.jpg",
    "book": "Take Away The A",
    "subtitle": "None",
    "author": "Michaël Escoffier",
    "illustrator": "Kris Di Giacomo",
    "year": 2014,
    "category": "Monsters",
    "tags": "Alphabet, Vocabulary, Play on Words",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Take Away the A is a fun, imaginative romp through the alphabet. The idea behind the book is that within every language there are words that change and become a different word through the simple subtraction of a single letter. In other words, without the \"A,\" the Beast is Best. Or, without the \"M,\" a chomp becomes a chop—though it could be that this particular play on words didn't even make it into the book, there are so many!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51I-CFxSr5L.jpg",
    "book": "That's Not Bunny!",
    "subtitle": "None",
    "author": "Chris Barton",
    "illustrator": "Colin Jack",
    "year": 2016,
    "category": "Animals",
    "tags": "Birds, Hawks, Rabbits",
    "checkedOut": "2016-03-11T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "None",
    "timesRead": 1,
    "description": "From high above on his perch, Hawk searches for his next meal. When he spots a bunny he swoops down and snatches-a carrot!? He decides to try again; because after all, he isn't a Carrot Hawk. But when Hawk goes for his second attempt he comes up with a cucumber! And the third time he grabs a head of lettuce! How can Hawk be a hawk, if he can't catch a single bunny? As he surveys the assortment of vegetables in his nest, he gets a great idea for baiting the bunny. But will it work?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51XeNr1lx2L.jpg",
    "book": "The Adventures of Beekle",
    "subtitle": "The Unimaginary Friend",
    "author": "Dan Santat",
    "illustrator": "Dan Santat",
    "year": 2014,
    "category": "Fantasy",
    "tags": "Imaginary Playmates, Friendship",
    "checkedOut": "2016-01-06T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "An imaginary friend waits a long time to be imagined by a child and given a special name, and finally does the unimaginable--he sets out on a quest to find his perfect match in the real world. An imaginary friend waits a long time to be imagined by a child and given a special name. He finally does the unimaginable--he sets out on a quest to find his perfect match in the real world."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51vdgaQEiKL.jpg",
    "book": "The Bear Ate your Sandwich",
    "subtitle": "None",
    "author": "Julia Sarcone-Roach",
    "illustrator": "Julia Sarcone-Roach",
    "year": 2015,
    "category": "Animals",
    "tags": "Bears",
    "checkedOut": "2016-01-16T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "So begins Julia Sarcone-Roach’s delicious tale of a bear, lost in the city, who happens upon an unattended sandwich in the park. The bear’s journey from forest to city and back home again is full of happy accidents, funny encounters, and sensory delights. The story is so engrossing, it’s not until the very end that we begin to suspect this is a TALL tale."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51u68xTpV4L.jpg",
    "book": "The Best Pet of All",
    "subtitle": "None",
    "author": "David LaRochelle",
    "illustrator": "David LaRochelle",
    "year": 2009,
    "category": "Fantasy",
    "tags": "Dragons, Dogs",
    "checkedOut": "2016-03-11T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "A little boy's mother won't let him have a dog. Dogs are too messy and too loud. But she says he can have a dragon for a pet - if he can find one. Enter the coolest - but naughtiest - pet ever. The dragon is messier and louder than any dog. And he will not leave. How will the boy ever get a dog now?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51UBKyqjDdL.jpg",
    "book": "The Best Story",
    "subtitle": "None",
    "author": "Eileen Spinelli",
    "illustrator": "Anne Wilsdorf",
    "year": 2008,
    "category": "Humans",
    "tags": "Creative Writing",
    "rating": "did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "The best story is one that comes from the heart The library is having a contest for the best story, and the quirky narrator of this story just has to win that rollercoaster ride with her favorite author! But what makes a story the best? Her brother Tim says the best stories have lots of action. Her father thinks the best stories are the funniest. And Aunt Jane tells her the best stories have to make people cry. A story that does all these things doesn?t seem quite right, though, and the one thing the whole family can agree on is that the best story has to be your own."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/71ivTq4NUSL.jpg",
    "book": "The Big Adventure",
    "subtitle": "None",
    "author": "Ellina Ellis",
    "illustrator": "Ellina Ellis",
    "year": 2015,
    "category": "Animals",
    "tags": "Fox, Chicken, Moose, Bear",
    "checkedOut": "2016-01-30T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Fox, Moose, Bear, and Chicken are four friends who want to go on a big adventure! But where should they go? The North Pole? The moon? After climbing to the top of a very big hill, they decide to visit Chicken's auntie's house instead, which isn't as cold as the North Pole, or as far away as the moon, but is still a big adventure!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/4148uGcgdEL.jpg",
    "book": "The Book With No Pictures",
    "subtitle": "None",
    "author": "B.J. Novak",
    "illustrator": "B.J. Novak",
    "year": 2014,
    "category": "Humans",
    "tags": "Oral reading",
    "checkedOut": "OWN",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 7,
    "description": "You might think a book with no pictures seems boring and serious. Except . . . here’s how books work. Everything written on the page has to be said by the person reading it aloud. Even if the words say . . . BLORK. Or BLUURF. Even if the words are a preposterous song about eating ants for breakfast, or just a list of astonishingly goofy sounds like BLAGGITY BLAGGITY and GLIBBITY GLOBBITY."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61LVj3feJAL.jpg",
    "book": "The Boy Who Cried Bigfoot!",
    "subtitle": "None",
    "author": "Scott Magoon",
    "illustrator": "Scott Magoon",
    "year": 2013,
    "category": "Fantasy",
    "tags": "Yeti, Sasquatch, Honesty",
    "checkedOut": "OWN",
    "rating": "Loved it",
    "amazon": "4.5 stars",
    "timesRead": 6,
    "description": "This clever twist on “The Boy Who Cried Wolf” is told from the point of view of an unexpected narrator and, through snappy text and lighthearted illustrations, demonstrates the value of telling the truth, the importance of establishing trust, and (of course!) the possibility that a beast you created to get attention can become a real-life friend."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51Yyj6c2+qL.jpg",
    "book": "The Boy with Pink Hair",
    "subtitle": "None",
    "author": "Perez Hilton",
    "illustrator": "Jen Hill",
    "year": 2011,
    "category": "Humans",
    "tags": "Boys",
    "checkedOut": "2016-01-23T08:00:00.000Z",
    "rating": "Liked It",
    "timesRead": 1,
    "description": "When a boy who was born with pink hair enters school for the first time, he is teased until he makes a friend and uses his talents to solve a problem."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/6134jhnUk.jpg",
    "book": "The Cat in the Hat",
    "subtitle": "None",
    "author": "Dr. Seuss",
    "illustrator": "Dr. Seuss",
    "year": 1957,
    "category": "Fantasy",
    "tags": "Cats",
    "checkedOut": "2016-01-23T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "Two children sitting at home on a rainy day are visited by the Cat in the Hat who shows them some tricks and games."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61GhpsyyTEL.jpg",
    "book": "The Circus Ship",
    "subtitle": "None",
    "author": "Chris Van Dusen",
    "illustrator": "Chris Van Dusen",
    "year": 2009,
    "category": "Animals",
    "tags": "Circus, Ships, People",
    "checkedOut": "2016-03-11T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "A circus ship has an accident off the coast of Maine, which leaves the animals stranded. They are soon taken in by the citizens of a small island, who grow fond of the new residents and fight to protect them. When a circus ship runs aground off the coast of Maine, the poor animals are left on their own to swim the chilly waters. Staggering onto a nearby island, they soon win over the wary townspeople with their kind, courageous ways. So well do the critters blend in that when the greedy circus owner returns to claim them, villagers of all species conspire to outsmart the bloated blowhard."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51huEx-GgFL.jpg",
    "book": "The Crocodile Who Didn't Like Water",
    "subtitle": "None",
    "author": "Gemma Merino",
    "illustrator": "Gemma Merino",
    "year": 2014,
    "category": "Animals",
    "tags": "Crocodiles, Water",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "Everybody knows that crocodiles love water, but this little crocodile is different—he doesn't like it at all! He tries to his best to change, but when attempt at swimming causes a shiver then a sneeze—could it be that this little crocodile isn't a crocodile at all? A little crocodile cannot get himself to like water and then finds out why."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51XmE9U9DML.jpg",
    "book": "The Curious Garden",
    "subtitle": "None",
    "author": "Peter Brown",
    "illustrator": "Peter Brown",
    "year": 2009,
    "category": "Humans",
    "tags": "Gardening",
    "checkedOut": "2016-03-22T07:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "While out exploring one day, a little boy named Liam discovers a struggling garden and decides to take care of it. As time passes, the garden spreads throughout the dark, gray city, transforming it into a lush, green world."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51HoHYJv6TL.jpg",
    "book": "The Day the Crayons Quit",
    "subtitle": "None",
    "author": "Drew Daywalt",
    "illustrator": "Oliver Jeffers",
    "year": 2013,
    "category": "Fantasy",
    "tags": "Crayons, Letters, Colors",
    "checkedOut": "2016-01-30T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "Poor Duncan just wants to color. But when he opens his box of crayons, he finds only letters, all saying the same thing: His crayons have had enough! They quit! Beige Crayon is tired of playing second fiddle to Brown Crayon. Black wants to be used for more than just outlining. Blue needs a break from coloring all those bodies of water. And Orange and Yellow are no longer speaking—each believes he is the true color of the sun."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/A1Vm1eVfn2L.jpg",
    "book": "The Dead Family Diaz",
    "subtitle": "None",
    "author": "P.J. Bracegirdle",
    "illustrator": "Poly Bernatene",
    "year": 2015,
    "category": "Humans",
    "tags": "Dead, Fear, Family",
    "checkedOut": "2016-03-11T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "Every skeleton in the Land of the Dead is excited to celebrate el Día de los Muertos with the Living. But not Angelito. His big sister has told him all about their horrifying bulgy eyes and squishy skin. So when Angelito is separated from his family in the Land of the Living, he's petrified—until he makes a new friend who is just as terrified of THEM as Angelito is. Then his new buddy turns out to be (gulp!) a living boy!Angelito runs as fast as his bony feet can carry him. Fortunately the traditions of the Day of the Dead reunite the two boys, just in time for some holiday fun."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51SPox+8vJL.jpg",
    "book": "The Donut Chef",
    "subtitle": "None",
    "author": "Bob Staake",
    "illustrator": "Bob Staake",
    "year": 2008,
    "category": "Humans",
    "tags": "Baking, Donuts",
    "checkedOut": "2016-01-30T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "In this delicious tale, a baker hangs out his shingle on a small street and soon the line for his donuts stretches down the block. But it's not long before the competition arrives and a battle of the bakers ensues. A baker must come up with new flavor ideas to stay competitive with the new donut shop that has opened up across the street from his store, but his unique combinations start to drive his customers away."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/517CT-RGXEL.jpg",
    "book": "The Fantastic Flying Books of Mr. Morris Lessmore",
    "subtitle": "None",
    "author": "William Joyce",
    "illustrator": "Joe Bluhm",
    "year": 2012,
    "category": "Fantasy",
    "tags": "Books, Libraries",
    "checkedOut": "OWN",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "Morris Lessmore loves words, stories, and books, and after a tornado carries him to another land, dreary and colorless, he finds a single book in color that leads him to an amazing library, where he learns the books need him as much as he needs them. Morris Lessmore loves words, stories and books, and after a tornado carries him to another land, dreary and colorless, he finds a single book in color that leads him to an amazing library where, he learns, the books need him as much as he needs them."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51LlpqEe3qL.jpg",
    "book": "The Farmer's Away! Baa! Neigh!",
    "subtitle": "None",
    "author": "Anne Vittur Kennedy",
    "illustrator": "Anne Vittur Kennedy",
    "year": 2014,
    "category": "Animals",
    "tags": "Domestic Animals, Animal Sounds",
    "checkedOut": "2016-03-03T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "What mischief do the animals get up to when the farmer’s back is turned? Anne Vittur Kennedy lets us know in the animals’ own words! There will be boating, of course, and a picnic, a rollercoaster ride, Jet Skiing, a hot-air balloon, ballroom dancing — oh, no! Could that arf! arf! arf! mean the farmer’s heading back? Even the youngest listeners can read this book aloud by following along with the pictures and making each animal’s sound."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51Y28YvWTKL.jpg",
    "book": "The Full Moon at the Napping House",
    "subtitle": "None",
    "author": "Audrey Wood",
    "illustrator": "Don Wood",
    "year": 2015,
    "category": "Humans",
    "tags": "Pets, Sleep",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 6,
    "description": "In the wide-awake bed in the full-moon house, everyone is restless! The moonlight is pouring in and no one can get to sleep: not Granny, her grandchild, the dog, the cat, or even a mouse. It's not until a tiny musical visitor offers up a soothing song does the menagerie settle down, and finally everyone is off to dreamland."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51CYcgcFOoL.jpg",
    "book": "The Gingerbread Man",
    "subtitle": "None",
    "author": "Karen Schmidt",
    "illustrator": "Karen Schmidt",
    "year": 1985,
    "category": "Fantasy",
    "tags": "Folklore, Fairy Tales",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "An old man and an old woman bake a gingerbread man who runs off. A freshly baked gingerbread man escapes when he is taken out of the oven and eludes a number of animals until he meets a clever fox."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51uy-Gn+gmL.jpg",
    "book": "The Great Lollipop Caper",
    "subtitle": "None",
    "author": "Dan Krall",
    "illustrator": "Dan Krall",
    "year": 2013,
    "category": "Food",
    "tags": "Lollipops, Capers, Contentment, Candy",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "One cranky caper is about to learn that being salty might be just as good as being sweet. Having adults love his acidic taste is not enough for Mr. Caper. He wants more. He wants the children of the world to love him—just as much as they love the sweet, saccharine Lollipop. And thus a plot is hatched: Caper-flavored lollipops are dispatched throughout the world...and everything goes horribly wrong. Will Mr. Caper find a way to repair the havoc he’s wreaked by over-reaching? Maybe, if Lollipop helps save the day!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61qFOIalGUL.jpg",
    "book": "The Gruffalo",
    "subtitle": "None",
    "author": "Julia Donaldson",
    "illustrator": "Julia Donaldson",
    "year": 1999,
    "category": "Fantasy",
    "tags": "Monsters",
    "checkedOut": "2016-01-12T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "Mouse escapes his predators by telling them he is on his way to meet his friend the gruffalo, a creature with terrible claws, tusks, and jaws. The gruffalo, however, is just in Mouse's imagination, or is it? A clever mouse uses the threat of a terrifying creature to keep from being eaten by a fox, an owl, and a snake-- only to have to outwit that creature as well."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51krIDxSt9L.jpg",
    "book": "The Incredible Book Eating Boy",
    "subtitle": "None",
    "author": "Oliver Jeffers",
    "illustrator": "Oliver Jeffers",
    "year": 2007,
    "category": "Humans",
    "tags": "Food, Habits",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Like many children, Henry loves books. But Henry doesn’t like to read books, he likes to eat them. Big books, picture books, reference books . . . if it has pages, Henry chews them up and swallows (but red ones are his favorite). And the more he eats, the smarter he gets—he’s on his way to being the smartest boy in the world! But one day he feels sick to his stomach. And the information is so jumbled up inside, he can’t digest it! Can Henry find a way to enjoy books without using his teeth?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/713ERqIv9hL.jpg",
    "book": "The Last Chocolate Chip Cookie",
    "subtitle": "None",
    "author": "Jamie Rix",
    "illustrator": "Clare Elsom",
    "year": 2015,
    "category": "Humans",
    "tags": "Baking",
    "checkedOut": "2016-02-19T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "None",
    "timesRead": 1,
    "description": "There is one chocolate chip cookie left--and Jack is ready to eat it! But then his mom reminds him of his manners. He must offer the cookie to EVERYONE else first. So Jack offers it to all sorts of people--he even goes to space and offers it to an alien! But the alien doesn't want to eat the cookie--he wants to eat Jack!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/41ArSBBZaBL.jpg",
    "book": "The Little Mouse Santi",
    "subtitle": "None",
    "author": "David Eugene Ray",
    "illustrator": "Santiago Germano",
    "year": 2015,
    "category": "Animals",
    "tags": "Mice, Cats",
    "checkedOut": "2016-02-27T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "Meet the little mouse Santi—he may be small, but he has a big dream! This beautifully illustrated story explores one of the most important aspects of a child’s life, the search for identity. Santi wants to be a cat, and even though all the other mice laugh at him, he follows his dream. This timeless story ends with a whimsical twist as Santi learns a valuable lesson about self-determination while also learning he is not the only dreamer!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51YF0d8CKiL.jpg",
    "book": "The Lonely Beast",
    "subtitle": "None",
    "author": "Chris Judge",
    "illustrator": "Chris Judge",
    "year": 2012,
    "category": "Fantasy",
    "tags": "Creatures, Voyages, Travels",
    "checkedOut": "2015-12-10T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "Have you heard of the Beasts? No? Well, Im not surprised. Not many people have. Thats because the Beasts are very rare. This is the tale of one Beast, the rarest of the rare, a Beast who decides he is lonely and sets out to find the other Beasts. Will his daring and dangerous journey lead him to some friends?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51SM5e+Y7KL.jpg",
    "book": "The Lorax",
    "subtitle": "None",
    "author": "Dr. Seuss",
    "illustrator": "Dr. Seuss",
    "year": 1977,
    "category": "Fantasy",
    "tags": "Creatures",
    "checkedOut": "2015-11-24T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Long before saving the earth became a global concern, Dr. Seuss, speaking through his character the Lorax, warned against mindless progress and the danger it posed to the earth's natural beauty."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61QTjZ8vycL.jpg",
    "book": "The Magic Rabbit",
    "subtitle": "None",
    "author": "Annette LeBlanc Cate",
    "illustrator": "Annette LeBlanc Cate",
    "year": 2007,
    "category": "Animals",
    "tags": "Rabbits",
    "checkedOut": "2015-09-11T07:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "When Bunny becomes separated from Ray, a magician who is his business partner and friend, the lonely and frightened Bunny finds a glittering trail of hope. When Bunny becomes separated from Ray, a magician who is his business partner and friend, he follows a crowd to a park where he has a lovely afternoon, and after the people leave and darkness falls, the lonely and frightened Bunny finds a glittering trail of hope."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51iYZCZ7HHL.jpg",
    "book": "The Mitten",
    "subtitle": "A Ukrainian Folktale",
    "author": "Jan Brett",
    "illustrator": "Jan Brett",
    "year": 2009,
    "category": "Animals",
    "tags": "Bears, Owls, Fox, Rabbits, Mice",
    "checkedOut": "2016-01-16T08:00:00.000Z",
    "rating": "Loved it",
    "amazon": "4.5 stars",
    "timesRead": 3,
    "description": "Several animals sleep snugly in Nicki's lost mitten until the bear sneezes. One by one, animals in a snowy forest crawl into Nicki's lost white mitten to get warm until the bear sneezes, sending the animals flying up and out of the mitten. On each turn of the page, signature borders inspired by Ukrainian folk art hint at what animal is coming next."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51iqb0PRF5L.jpg",
    "book": "The Monster Who Lost His Mean",
    "subtitle": "None",
    "author": "Tiffany Strelitz Haber",
    "illustrator": "Kirstie Edmunds",
    "year": 2012,
    "category": "Fantasy",
    "tags": "Monsters",
    "checkedOut": "2015-12-10T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "Teased by the other monsters for being nice instead of mean, Onster prefers playing with children and helping them with their chores to frightening them. Teased by the other monsters for being nice instead of mean, Onster prefers to play with children and help them with their chores rather than frighten them."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51caIyZJNeL.jpg",
    "book": "The Monsters' Monster",
    "subtitle": "None",
    "author": "Patrick McDonnell",
    "illustrator": "Patrick McDonnell",
    "year": 2012,
    "category": "Fantasy",
    "tags": "Monsters",
    "checkedOut": "2016-02-27T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "Grouch, Grump, and little Gloom 'n' Doom spend much of their time arguing over who is the biggest and baddest until they build a monster together that turns out to be very different than what they expect. Grouch, Grump, and little Gloom 'n' Doom spend much of their time arguing over who is the \"biggest and baddest\" until they build a monster together that turns out to be very different than what they expect."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/71HdbAku6WL.jpg",
    "book": "The Monstore",
    "subtitle": "None",
    "author": "Tara Lazar",
    "illustrator": "James Burks",
    "year": 2013,
    "category": "Fantasy",
    "tags": "Monsters, Brothers, Sisters",
    "checkedOut": "OWN",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 8,
    "description": "The Monstore is the place to go for all of your monsterly needs. Which is perfect, since Zack definitely has a monsterly need. The problem? His pesky little sister, Gracie, who never pays attention to that \"Keep Out\" sign on Zack's door--the one he has made especially for her. But when Zack's monsters don't exactly work as planned, he soon finds out that the Monstore has a few rules: No Refunds. No exchanges. No exceptions."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51OsXr4lEOL.jpg",
    "book": "The Most Magnificent Thing",
    "subtitle": "None",
    "author": "Ashley Spires",
    "illustrator": "Ashley Spires",
    "year": 2014,
    "category": "Humans",
    "tags": "Inventions, Dogs, Frustration, Anger, Girls",
    "checkedOut": "2016-01-06T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "A little girl and her canine assistant set out to make the most magnificent thing. But after much hard work, the end result is not what the girl had in mind. Frustrated, she quits. Her assistant suggests a long walk, and as they walk, it slowly becomes clear what the girl needs to do to succeed. A charming story that will give kids the most magnificent thing: perspective! A little girl and her canine assistant set out to make the most magnificent thing, but after much hard work, the end result is not what the girl had in mind."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51CZWgb8kqL.jpg",
    "book": "The Napping House",
    "subtitle": "None",
    "author": "Audrey Wood",
    "illustrator": "Don Wood",
    "year": 2009,
    "category": "Humans",
    "tags": "Pets, Sleep",
    "rating": "Loved it",
    "amazon": "4.5 stars",
    "timesRead": 6,
    "description": "In this cumulative tale, a wakeful flea atop a number of sleeping people and assorted creatures causes a commotion, with just one bite. In this cumulative tale, a wakeful flea atop a number of sleeping creatures causes a commotion with just one bite."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51A6wZJW7TL.jpg",
    "book": "The Nicest Naughtiest Fairy",
    "subtitle": "None",
    "author": "Nick Ward",
    "illustrator": "Nick Ward",
    "year": 2016,
    "category": "Fantasy",
    "tags": "Fairies, Magic",
    "checkedOut": "2016-03-03T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "None",
    "timesRead": 1,
    "description": "When the villagers threaten to chase the Naughty Fairy out of town if she doesn't start being nice, she vows to be well-behaved, but despite the good she tries to do, her magic continually backfires."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/71eOXj8+KkL.jpg",
    "book": "The Octopuppy",
    "subtitle": "None",
    "author": "Martin McKenna",
    "illustrator": "Martin McKenna",
    "year": 2015,
    "category": "Animals",
    "tags": "Octopus, Dogs, Pets",
    "checkedOut": "2016-03-11T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "Edgar wanted a dog. Instead, he got an octopus named Jarvis. Jarvis is brilliant and does his best to act like the dog Edgar wants, but nothing he does is good enough to please Edgar. Ultimately, Edgar recognizes that while Jarvis might not be the dog he wanted, he is special in his own endearing way."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51tOO4SKZIL.jpg",
    "book": "The Pigeon Wants A Puppy!",
    "subtitle": "None",
    "author": "Mo Williems",
    "illustrator": "Mo Williems",
    "year": 2008,
    "category": "Animals",
    "tags": "Birds",
    "checkedOut": "2016-02-21T08:00:00.000Z",
    "rating": "Like it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "The pigeon really, really wants a puppy, but when a puppy arrives the pigeon changes its mind. The pigeon really wants a puppy and will take care of it, until the pigeon meets one."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/614Myy7-H7L.jpg",
    "book": "The Pirates Next Door",
    "subtitle": "None",
    "author": "Jonny Duddle",
    "illustrator": "Jonny Duddle",
    "year": 2012,
    "category": "Humans",
    "tags": "Pirates, Neighbors, Friendship",
    "checkedOut": "2016-03-11T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "A pirate family moves into a quiet seaside neighborhood and causes all the neighbors to gossip, and after Matilda becomes friends with young pirate Jim Lad, the pirate family decides to set sail but not without leaving behind a few hidden surprises. When a pirate family moves into her quiet seaside town during ship repairs, young Matilda defies the edicts of the gossiping adults in the community to befriend young pirate Jim Lad."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61TpyBc+HXL.jpg",
    "book": "The Princess and the Giant",
    "subtitle": "None",
    "author": "Caryl Hart",
    "illustrator": "Sarah Warburton",
    "year": 2015,
    "category": "Fantasy",
    "tags": "Princesses, Sleep, Giants",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "Princess Sophie is exhausted, and it's all because that grumpy old giant up on the beanstalk can't sleep. His stomps and stamps keep everyone awake. But as the resourceful Princess Sophie reads her favorite book of fairy tales, she wonders if she might just have the answer. She bravely climbs the beanstalk carrying a tasty bowl of porridge, a cuddly teddy bear, and cozy blanket to help soothe the giant. But nothing works until finally Sophie hits upon the perfect thing — a bedtime story! Everyone lives (and sleeps) happily ever after, but when Sophie then teaches the giant how to read himself, it is the most perfect ending of all."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/711Zb2keFvL.jpg",
    "book": "The Princess and the Pig",
    "subtitle": "None",
    "author": "Johnattan Emmett",
    "illustrator": "Poly Bernatene",
    "year": 2012,
    "category": "Humans",
    "tags": "Princess, Pigs",
    "checkedOut": "2015-11-24T08:00:00.000Z",
    "rating": "Liked It",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "There's been a terrible mix-up in the royal nursery. Priscilla the princess has accidentally switched places with Pigmella, the farmer's new piglet. The kindly farmer and his wife believe it's the work of a good witch, while the ill-tempered king and queen blame the bad witch-after all, this happens in fairy tales all the time! While Priscilla grows up on the farm, poor yet very happy, things don't turn out quite so well for Pigmella. Kissing a frog has done wonders before, but will it work for a pig?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/71DdmXAXVvL.jpg",
    "book": "The Rainbow Fish",
    "subtitle": "None",
    "author": "Marcus Pfister",
    "illustrator": "J Alison James",
    "year": 1999,
    "category": "Animals",
    "tags": "Fish, Beauty, Friendship",
    "rating": "Did not read",
    "amazon": "4 stars",
    "timesRead": 0,
    "description": "The Rainbow Fish is an international best-seller and a modern classic. Eye-catching foil stamping, glittering on every page, offers instant child appeal, but it is the universal message at the heart of this simple story about a beautiful fish who learns to make friends by sharing his most prized possessions that gives the book its lasting value."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/81DYX86sy0L.jpg",
    "book": "The Skunk",
    "subtitle": "None",
    "author": "Mac Barnett",
    "illustrator": "Patrick McDonnell",
    "year": 2015,
    "category": "Animals",
    "tags": "Skunks",
    "checkedOut": "2016-01-12T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4 stars",
    "timesRead": 1,
    "description": "When a skunk first appears in the tuxedoed man's doorway, it's a strange but possibly harmless occurrence. But then the man finds the skunk following him, and the unlikely pair embark on an increasingly frantic chase through the city, from the streets to the opera house to the fairground. What does the skunk want? It's not clear―but soon the man has bought a new house in a new neighborhood to escape the little creature's attention, only to find himself missing something. . ."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/81YrCQVFKfL.jpg",
    "book": "The Snail and the Whale",
    "subtitle": "None",
    "author": "Julia Donaldson",
    "illustrator": "Axel Scheffler",
    "year": 2006,
    "category": "Animals",
    "tags": "Snails, Whales, Marine",
    "checkedOut": "2016-01-30T08:00:00.000Z",
    "rating": "DId not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "Looking for adventure, a snail hitches a ride on a humpback whale and then rescues his new friend from being stuck on a sandy beach. Wanting to sail beyond its rock, a tiny snail hitches a ride on a big humpback whale and then is able to help the whale when it gets stuck in the sand."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61weEnfu3CL.jpg",
    "book": "The Snatchabook",
    "subtitle": "None",
    "author": "Hellen Docherty",
    "illustrator": "Thomas Docherty",
    "year": 2013,
    "category": "Animals",
    "tags": "Forest Creatures",
    "checkedOut": "2016-01-30T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "It is bedtime in the woods of Burrow Down, and all the animals are ready for their bedtime story. But books are mysteriously disappearing. Eliza Brown decides to stay awake and catch the book thief. The woodland animals of Burrow Down are ready for a bedtime story, but where are the books?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51E5DwbaecL.jpg",
    "book": "The Sneetches and Other Stories",
    "subtitle": "None",
    "author": "Dr. Seuss",
    "illustrator": "Dr. Seuss",
    "year": 1961,
    "category": "Fantasy",
    "tags": "Stories",
    "rating": "Liked It",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Dr. Seuss creates another timeless picture-book classic with The Sneetches and Other Stories. Are you a Star-Belly Sneetch or a Plain-Belly Sneetch? This delightful book contains four tales with deliciously subtle takes on how silly it is to be, well, silly. “The Sneetches,” “The Zax,” “Too Many Daves,” and “What Was I Scared Of?” make this energetic compilation a must-have for every library. Full of Dr. Seuss’s signature rhymes and unmistakable characters, it’s perfect for new and lifelong Seuss fans."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/412B4HVGRBL.jpg",
    "book": "The Snowman",
    "subtitle": "None",
    "author": "Raymond Briggs",
    "illustrator": "Raymond Briggs",
    "year": 1978,
    "category": "Fantasy",
    "tags": "Snowman",
    "checkedOut": "2015-09-11T07:00:00.000Z",
    "rating": "Liked It",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "Illus. in full color. A wordless story. The pictures have \"the hazy softness of air in snow. A little boy rushes out into the wintry day to build a snowman, which comes alive in his dreams that night. The experience is one that neither he nor young 'readers' will ever regret or forget."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51aQk0Vq9AL.jpg",
    "book": "The Spaghetti-slurping Sewer Serpent",
    "subtitle": "None",
    "author": "Laura Ripes",
    "illustrator": "Aaron Zenz",
    "year": 2012,
    "category": "Fantasy",
    "tags": "Sea Serpents\n",
    "checkedOut": "2016-01-12T08:00:00.000Z",
    "rating": "Loved it",
    "amazon": "4.5 stars",
    "timesRead": 5,
    "description": "Sammy Sanders can't sleep. He is 77 percent sure that a spaghetti-slurping serpent lives in his sewer. Sammy and his sidekicks his sister, Sally, and their slobbery dog, Stan set out to discover the truth. What Sammy finds is a surprise in this tonguetwisting mystery featuring the slippery letter S. The bright, fun artwork was created in colored pencil."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61jurA6wsFL.jpg",
    "book": "The Story of Deva and Flea",
    "subtitle": "None",
    "author": "Go Willems",
    "illustrator": "Tony DiTerlizzi",
    "year": 2015,
    "category": "Animals",
    "tags": "Dogs, Cats",
    "checkedOut": "2016-01-16T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Diva, a small yet brave dog, and Flea, a curious streetwise cat, develop an unexpected friendship in this unforgettable tale of discovery."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61l+WXJoLZL.jpg",
    "book": "The Story of Fish and Snail",
    "subtitle": "None",
    "author": "Deborah Freedman",
    "illustrator": "Deborah Freedman",
    "year": 2013,
    "category": "Animals",
    "tags": "Fish, Snails",
    "checkedOut": "2016-01-16T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Every day, Snail waits for Fish to return and tell him a story, but their friendship is tested when Fish asks Snail to take a leap out of their book to actually see a new pirate book in the library. Every day, Snail waits for Fish to return and tell him a story but their friendship is tested when Fish asks Snail to take a leap out of their book to actually see a new pirate book in the library."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61hgeArdAYL.jpg",
    "book": "The Super Hungry Dinosaur",
    "subtitle": "None",
    "author": "Martin Waddell",
    "illustrator": "Leonie Lord",
    "year": 2009,
    "category": "Dinosaurs",
    "tags": "Dinosaurs",
    "checkedOut": "2015-09-19T07:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "Hal calms the ravenous dinosaur's tantrum and saves his parents and dog, Billy, from the Super Hungry Dinosaur. Hal and his little dog Billy calmly deal with a dinosaur's monstrous temper tantrum."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61LTrlMVpFL.jpg",
    "book": "The Thing About Spring",
    "subtitle": "None",
    "author": "Daniel Kirk",
    "illustrator": "Daniel Kirk",
    "year": 2015,
    "category": "Animals",
    "tags": "Birds, Mice, Bear, Rabbits",
    "checkedOut": "2015-11-24T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "Spring is in the air! Bear, Bird, and Mouse are all excited that winter snows are melting away, but their friend Rabbit is not. There are too many things about winter that Rabbit adores, and spring just seems to spell trouble. His friends offer an abundance of reasons to love spring and the changing seasons, but will Rabbit listen?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51oRGrDaWEL.jpg",
    "book": "The Three Little Tamales",
    "subtitle": "None",
    "author": "Eric A. Kimmel",
    "illustrator": "Valeria Docampo",
    "year": 2009,
    "category": "Food",
    "tags": "FairyTales, Wolves, Tamales",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 3,
    "description": "While the three little tamales cool off on a windowsill, a tortilla rolls by. \"You’ll be eaten. You’d better run!\" he tells them. And so the tamales jump out the window. The first runs to the prairie and builds a house of sagebrush. The second runs to a cornfield and builds a house of cornstalks. The third runs to the desrt and builds a house of cactus. Then who should come along but Señor Lobo, the Big Bad Wolf, who plans to blow their houses down!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51Dqp6R3NaL.jpg",
    "book": "The Whisper",
    "subtitle": "None",
    "author": "Pamela Zagarenski",
    "illustrator": "Pamela Zagarenski",
    "year": 2015,
    "category": "Humans",
    "tags": "Girls, Fox, Imagination",
    "checkedOut": "2016-01-16T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "Step inside the pages of a little girl's magical book as she discovers the profound and inspiring notion that we each bring something different to the same story. Two-time Caldecott Honor artist Pamela Zagarenski debuts as an author in this tender picture book about the joy of reading."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61e3LiEroKL.jpg",
    "book": "The Wide-mouthed Frog",
    "subtitle": "A Pop-ip Book",
    "author": "Keith Faulkner",
    "illustrator": "Johnathan Lambert",
    "year": 1996,
    "category": "Animals",
    "tags": "Frogs",
    "checkedOut": "2016-01-06T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "From the Okefenokee Swamp comes a frog with a wide mouth that he just loves to use. He's particularly interested in the eating habits of other creatures found in the great outdoors--that is, of course, until he comes upon a big green one with lots of teeth who finds wide-mouthed frogs simply delicious."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/613mb+cx5mL.jpg",
    "book": "The Worst Princess",
    "subtitle": "None",
    "author": "Anna Kemp",
    "illustrator": "Anna Kemp",
    "year": 2014,
    "category": "Fantasy",
    "tags": "Dragons, Princesses",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 3,
    "description": "Lonely Princess Sue longs to leave her castle tower, but when her prince finally rescues her, she realizes she is destined for a less traditional partner. The coauthor is Sara Ogilvie. Lonely Princess Sue longs to leave her castle tower, but when her prince finally rescues her, she realizes she is destined for a less traditional partner."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/41a-5P4Z+rL.jpg",
    "book": "There Are No Cats in This Book!",
    "subtitle": "None",
    "author": "Viviane Scwarz",
    "illustrator": "Viviane Scwarz",
    "year": 2010,
    "category": "Animals",
    "tags": "Cats",
    "checkedOut": "2015-12-10T08:00:00.000Z",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 50,
    "description": "Our lovable feline friends Tiny, Moonpie, and Andre have returned, and this time they’re filled with the spirit of adventure: they want to go off to explore the world! They have their suitcases packed and are ready to set out, but can’t get out of the book. They try pushing their way out and jumping their way out, but nothing seems to work. Finally, they get a brilliant idea: they decide to wish themselves out! But they’re going to need help. Will it work? Are you missing them yet?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51ad4x-EOEL.jpg",
    "book": "There Was An Old Dragon Who Swallowed A Knight",
    "subtitle": "None",
    "author": "Penny Parker Klostermann",
    "illustrator": "Ben Mantle",
    "year": 2015,
    "category": "Fantasy",
    "tags": "Dragons, Knights",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "We all know that “there was an old lady” who swallowed lots of things. Now meet the old dragon who swallows pretty much an entire kingdom! Will he ever learn a little moderation?! This rollicking rhyme is full to bursting with sight gags, silly characters, and plenty of burps! Parents and kids alike will delight in Ben Mantle’s precisely funny illustrations and in Penny Parker Klostermann’s wacky rhymes."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51cCZ3HtciL.jpg",
    "book": "There Was An Old Monster!",
    "subtitle": "None",
    "author": "Rebecca Emberley",
    "illustrator": "Ed Emberley",
    "year": 2009,
    "category": "Monsters",
    "tags": "Folk Songs",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "In this variation of a traditional cumulative rhyme, a monster swallows ants, a lizard, a bat, and other creatures to try to cure a stomachache that began when he swallowed a tick. In this variation on the traditional cumulative rhyme, a monster swallows ants, a lizard, a bat, and other creatures to try to cure a stomach ache than began when he swallowed a tick."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/41RfhWQELZL.jpg",
    "book": "There's A Bird on your Head",
    "subtitle": "An Elephant and Piggie Book",
    "author": "Go Willems",
    "illustrator": "Go Willems",
    "year": 2007,
    "category": "Animals",
    "tags": "Birds, Elephant, Pig",
    "checkedOut": "2016-01-16T08:00:00.000Z",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "Gerald the elephant discovers that there is something worse than a bird on your head--two birds on your head! Piggie will try to help her best friend. Opposite best friends Gerald, who is careful and worrisome, and Piggie, who is clumsy and carefree, run into a problem when two birds land on Gerald's head."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51aJOY+vIbL.jpg",
    "book": "There's A Giraffe in My Soup",
    "subtitle": "None",
    "author": "Ross Burach",
    "illustrator": "Ross Burach",
    "year": 2016,
    "category": "Animals",
    "tags": "Restaurants",
    "checkedOut": "2016-03-17T07:00:00.000Z",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 6,
    "description": "Each time a waiter returns with a new bowl of soup to satisfy a customer's complaint, a different animal appears in the soup."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/81ju74D477L.jpg",
    "book": "This Book Just Ate My Dog!",
    "subtitle": "None",
    "author": "Richard Byrne",
    "illustrator": "Richard Byrne",
    "year": 2014,
    "category": "Animals",
    "tags": "Dogs",
    "checkedOut": "2016-01-12T08:00:00.000Z",
    "rating": "Liked It",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "When her dog disappears into the gutter of the book, Bella calls for help. But when the helpers disappear too, Bella realizes it will take more than a tug on the leash to put things right. Cleverly using the physicality of the book, This book just ate my dog! is inventive, ingenious, and just pure kid-friendly fun!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61WYyWCzlCL.jpg",
    "book": "This Orq",
    "subtitle": "He say \"UGH!\"",
    "author": "David Elliot",
    "illustrator": "Lori Nichols",
    "year": 2015,
    "category": "Humans",
    "tags": "Pets, Mammoth",
    "checkedOut": "2016-01-30T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4 stars",
    "timesRead": 0,
    "description": "\"Meet Orq. He cave boy. Meet Woma. He woolly mammoth. Now meet Dorq. Dorq big. Dorq strong. Dorq mean. And Caba, he even worse. Ugh! Double ugh!\""
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/612Y1EnpxZL.jpg",
    "book": "Those Darn Squirrels!",
    "subtitle": "None",
    "author": "Adam Rubin",
    "illustrator": "Daniel Saimieri",
    "year": 2008,
    "category": "Animals",
    "tags": "Squirrels",
    "checkedOut": "2016-01-12T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "Old Man Fookwire is a grump who only likes to paint pictures of birds that visit his backyard. The problem is, they fly south every winter, leaving him sad and lonely. So he decides to get them to stay by putting up beautiful birdfeeders filled with seeds and berries. Unfortunately, the squirrels like the treats, too, and make a daring raid on the feeders. The conflict escalates—until the birds depart (as usual), and the squirrels come up with a plan that charms the old grump."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51u6QupwhCL.jpg",
    "book": "Tiger and Badger",
    "subtitle": "None",
    "author": "Emily Jenkins",
    "illustrator": "Marie-Louise Gay",
    "year": 2016,
    "category": "Animals",
    "tags": "Tigers, Badger, Friendship, Conflict Management",
    "checkedOut": "2016-04-02T07:00:00.000Z",
    "rating": "Did not read",
    "amazon": "3.5 stars",
    "timesRead": 0,
    "description": "Tiger and Badger are best friends. Of course, sometimes even very best friends can get into disagreements —over a toy, or a chair, or even sharing some orange slices. But no matter what, after a bit of pouting and with the help of some very silly faces, they always make up. Tiger and Badger is an exuberant read-aloud bursting with bright illustrations to hold the attention of very young readers just learning to make—and keep—friends."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51V4Ey49-oL.jpg",
    "book": "Toot",
    "subtitle": "None",
    "author": "Leslie Patricelli",
    "illustrator": "Leslie Patricelli",
    "year": 2014,
    "category": "Humans",
    "tags": "Humorous",
    "checkedOut": "2015-08-20T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 4,
    "description": "Everybody does it: Kitty, Doggie, Daddy — even Mommy! And when Leslie Patricelli’s beloved bald baby does it while running, it sounds like a train. This frank and very funny look at a certain noisy body function is perfectly suited to the youngest of listeners, while their giggling older siblings will be happy to read it aloud."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61D3+1r-MGL.jpg",
    "book": "Troll and the Oliver",
    "subtitle": "None",
    "author": "Adam Stower",
    "illustrator": "Adam Stower",
    "year": 2015,
    "category": "Fantasy",
    "tags": "Monsters",
    "checkedOut": "2016-01-30T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "Every day when Oliver goes out, Troll tries to eat him. But catching Oliver is very tricky he s fast, sneaky, and just too clever! It is only when it looks like Troll has given up and Oliver celebrates victory that CHOMP! he gets eaten, and it turns out that Olivers don t taste very nice after all. But fortunately the two discover that Trolls and Olivers both love cake!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/91HoWIwvL1L.jpg",
    "book": "Uh-Oh Octopus!",
    "subtitle": "None",
    "author": "Elle van Lieshout",
    "illustrator": "Mies van Hout",
    "year": 2015,
    "category": "Animals",
    "tags": "Friendship, Octopuses, Mermaids",
    "rating": "Did not like",
    "amazon": "4 stars",
    "timesRead": 1,
    "description": "A small octopus lives in a snug apartment until one day an intruder barricades the entrance. Octopus asks for advice on how to escape but the more suggestions he gets, the less he is able to figure out what to do. Eventually, Octopus learns to trust his own instincts and learns that things are not always what they seem. Mies van Hout's expert eye and execution are stunningly revealed in a red lobster, pink jellyfish and a wide variety of fish contrasted against an aqua sea."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51W+-TrvlbL.jpg",
    "book": "Uni the Unicorn",
    "subtitle": "None",
    "author": "Amy Krouse Rosenthal",
    "illustrator": "Brigette Barrager",
    "year": 2014,
    "category": "Fantasy",
    "tags": "Unicorns",
    "checkedOut": "2016-01-16T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "In this clever twist on the age-old belief that there’s no such thing as unicorns, Uni the unicorn is told there’s no such thing as little girls! No matter what the grown-up unicorns say, Uni believes that little girls are real. Somewhere there must be a smart, strong, wonderful, magical little girl waiting to be best friends. In fact, far away (but not too far), a real little girl believes there is a unicorn waiting for her. This refreshing and sweet story of friendship reminds believers and nonbelievers alike that sometimes wishes really can come true."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61M+ZxSj-pL.jpg",
    "book": "Violet and Victor Write the Most Fabulous Fairy Tale",
    "subtitle": "None",
    "author": "Alice Kuipers",
    "illustrator": "Bethanie Murguia",
    "year": 2016,
    "category": "Humans",
    "tags": "Fairytales, Brothers and Sisters, Animals",
    "checkedOut": "2016-03-03T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "Violet is determined to write the most fabulous fairy tale that has ever been imagined! Her twin, Victor, is not in the mood for make-believe."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51r-eMDvnWL.jpg",
    "book": "Warning: Do Not Open This Book!",
    "subtitle": "None",
    "author": "Adam Lehrhaupt",
    "illustrator": "Matthew Forsythe",
    "year": 2013,
    "category": "Animals",
    "tags": "Humor, Aligators, Toucans, Monkeys",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 4,
    "description": "It looks like a book, it feels like a book, and it even smells like a book. But watch out...madness and mayhem lie within! Debut author Adam Lehrhaupt urges you NOT to take a walk on the wild side in this humorous, interactive romp with inventive and engaging illustrations from Eisner Award-winning comic artist and rising star children's book illustrator Matthew Forsythe. This quirky, subversive creation begs to be enjoyed again and again and again."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/81fME2CqXsL.jpg",
    "book": "We're in the Wrong Book!",
    "subtitle": "None",
    "author": "Richard Byrne",
    "illustrator": "Richard Byrne",
    "year": 2015,
    "category": "Humans",
    "tags": "Humorous",
    "checkedOut": "2016-02-09T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "3.5 stars",
    "timesRead": 1,
    "description": "When a potato sack race goes awry, Bella and Ben find themselves bumped from their familiar page into uncharted territory. It's a brave new world of lollipops and sphinxes―and Bella and Ben are on one page-turning adventure. How will they find their way back into their very own book?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61HhNxM02CL.jpg",
    "book": "Weird but True!",
    "subtitle": "300 Slimy, Sticky, and Smelly Facts",
    "author": "National Geographic Kids",
    "illustrator": "None",
    "year": 2016,
    "category": "Science",
    "tags": "Curiosities, Wonders",
    "rating": "liked it",
    "amazon": "5 stars",
    "timesRead": 3,
    "description": "Get ready to be grossed out -- in a good way! This latest addition to the crazy popular Weird but True series is slimy and sticky and jam-packed with more icky, zany fun! Step up to the plate and try not to lose your lunch, with 300 all-new, amazing facts plus photos that kids just can't get enough of."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61jjYi8aiJL.jpg",
    "book": "Weird but True! 5",
    "subtitle": "300 Outrageous Facts",
    "author": "National Geographic Kids",
    "illustrator": "None",
    "year": 2013,
    "category": "Science",
    "tags": "Curiosities, Wonders",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "Presenting all-new, brain-bending facts and eye-popping illustrations on science, animals, food, space, pop culture, geography and everything else imaginable. Did you know lemons can power light bulbs, or that some goats and climb trees? - In this title are 300 more outrageous and unbelievable facts like these in fifth installment of the Weird But True series, Weird But True! 5."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/81ZqLONV4dL.jpg",
    "book": "What Does the Fox Say?",
    "subtitle": "None",
    "author": "Ylvis and Christian Løchstøer",
    "illustrator": "Svein Nyhus",
    "year": 2013,
    "category": "Animals",
    "tags": "Foxes, Fiction",
    "checkedOut": "2016-03-03T08:00:00.000Z",
    "rating": "Liked It",
    "amazon": "4.5 stars",
    "timesRead": 4,
    "description": "Do you know what the fox says? Based on the hugely popular YouTube video with more than 200 million views, this picture book is packed full of foxy fun."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/619MqcIIZ+L.jpg",
    "book": "What's New at the Zoo?",
    "subtitle": "None",
    "author": "Betty Comden",
    "illustrator": "Adolph Green",
    "year": 2011,
    "category": "Animals",
    "tags": "Zoo Animals",
    "rating": "Loved it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "The zoo is overloaded! The population has exploded! And the animals want out—NOW! What’s New at the Zoo? (from the hit Broadway show Do Re Mi) perfectly captures the grumblings and rumblings of all the animals, and kids will delight in the hilarious lift-the-flap surprises of acclaimed illustrator Travis Foster’s spot-on comic creations."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61Pnn3oLTqL.jpg",
    "book": "When A Dragon Moves in Again",
    "subtitle": "None",
    "author": "Jodi Moore",
    "illustrator": "Howard McWilliam",
    "year": 2015,
    "category": "Fantasy",
    "tags": "Dragons",
    "checkedOut": "2016-01-12T08:00:00.000Z",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "If you build a perfect castle, a dragon will move in – and that’s exactly what happens to one very lucky boy when his family gears up for some changes. The boy and his dragon bounce in their castle, duel with delight, and have an amazing time together…until they find out that their castle is a crib for a new baby. Huh? As soon as they get used to the news, the boy and dragon are back in roaring form, entertaining the infant with marching music, aerial acrobatics, and baby-bottle bowling. But merriment turns to mischief and mischief leads to consequences. Can a dragon friend – real or not – help smooth the transition to big brotherhood?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51lSy1ooEwL.jpg",
    "book": "When Moon Fell Down",
    "subtitle": "None",
    "author": "Linda Smith",
    "illustrator": "Kathryn Brown",
    "year": 2001,
    "category": "Animals",
    "tags": "Cowa, Moons, Stories in Rhyme",
    "rating": "Have not read yet",
    "amazon": "4.5 stars",
    "description": "When Moon falls down one night, he and an adventure-minded cow roan up hills and down, wander through city streets, and finally return back home at dawn. A joyous and lyrical romp, this picture book captures the magic and wonder of seeing familiar things in a whole new way."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61CtlTtBQcL.jpg",
    "book": "Where the Wild Things Are",
    "subtitle": "None",
    "author": "Maurice Sendak",
    "illustrator": "Maurice Sendak",
    "year": 2012,
    "category": "Fantasy",
    "tags": "Monsters",
    "checkedOut": "2015-12-10T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "4.5 stars",
    "timesRead": 0,
    "description": "After he is sent to bed without supper for behaving like a wild thing, Max dreams of a voyage to the island where the wild things are. A naughty little boy, sent to bed without his supper, sails to the land of the wild things where he becomes their king."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61LYvphySKL.jpg",
    "book": "Wherever You Go",
    "subtitle": "None",
    "author": "Pat Zietlow Miller",
    "illustrator": "Eliza Wheeler",
    "year": 2015,
    "category": "Animals",
    "tags": "Rabbits, Roads, Voyages, Travels",
    "rating": "Did not like",
    "amazon": "4.5 stars",
    "timesRead": 1,
    "description": "An adventurous rabbit and his animal friends journey over steep mountain peaks, through bustling cityscapes, and down long, winding roads to discover the magical worlds that await them just outside their doors. Illustrations and rhyming text follow a young rabbit as he leaves home on a journey, discovering the joys of different kinds of roads and what they may bring--including a way back home."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/71fKNiIl0kL.jpg",
    "book": "Who Done It?",
    "subtitle": "None",
    "author": "Oliver Tallec",
    "illustrator": "Oliver Tallec",
    "year": 2015,
    "category": "Animals",
    "tags": "Interactive",
    "checkedOut": "2016-01-16T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "4.5 stars",
    "timesRead": 2,
    "description": "In this charming book, each page asks the reader a question about the lineup of characters featured on the spread. Sharp eyes and keen observation are necessary. There's only one right answer, and it's not always easy!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51cokj7xj0L.jpg",
    "book": "Who Wants Broccoli?",
    "subtitle": "None",
    "author": "Val Jones",
    "illustrator": "Val Jones",
    "year": 2015,
    "category": "Animals",
    "tags": "Dogs, Pets, Adoption",
    "checkedOut": "2016-02-27T08:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 2,
    "description": "Broccoli is a big, lovable dog who likes to show off his bowl-tossing and tail-chasing skills and especially his great big BARK! Broccoli lives at Beezley s Animal Shelter and dreams of playing in a yard with a boy. When a boy named Oscar comes looking for his perfect pet, Broccoli is hidden away. Will Broccoli find his perfect home?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51guJPdy1hL.jpg",
    "book": "Who's in the Tree?",
    "subtitle": "And Other Lift-the-flap Surprises",
    "author": "Craig Shuttlewood",
    "illustrator": "Craig Shuttlewood",
    "year": 2014,
    "category": "Animals",
    "tags": "Stories, Lift-the-flap-books",
    "checkedOut": "2016-02-27T08:00:00.000Z",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 6,
    "description": "An elephant in the sky? A peacock in the sea? Are creatures hiding where they shouldn't be? Lift the large flaps, follow the romping rhyme, and find each face that's out of place. Graphic artist Craig Shuttlewood whisks kids from desert to forest to ocean deep—and finally to the zoo, where the only one who doesn't fit is YOU! His outstanding debut introduces the idea of where animals (and humans) live-and will delight kids over and over again."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61eYX7S9+aL.jpg",
    "book": "Whose Shoe?",
    "subtitle": "None",
    "author": "Eve Bunting",
    "illustrator": "Sergio Ruzzier",
    "year": 2015,
    "category": "Animals",
    "tags": "Mice, Shoes, Lost and Found",
    "rating": "Have not read yet",
    "amazon": "5 stars",
    "description": "A mouse comes across a shoe and sets out to find its owner. A conscientious role model, this determined mouse asks an unlikely assortment of animals if the shoe belongs to them, hears about their own shoes, and receives a surprising reward at the end. Eve Bunting's cheerful rhymed text and Sergio Ruzzier's charmingly unique illustrations make this a delightful book to share with a young child."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51pf9xrxDRL.jpg",
    "book": "Wooby & Peep",
    "subtitle": "A Story of Unlikely Friendship",
    "author": "Cynthea Liu",
    "illustrator": "Mary Peterson",
    "year": 2013,
    "category": "Animals",
    "tags": "Animals",
    "checkedOut": "2016-01-23T08:00:00.000Z",
    "rating": "Liked It",
    "amazon": "4 stars",
    "timesRead": 1,
    "description": "When Peep leaves the city with her pet iguana to live in the country, her new neighbor, Wooby, is concerned but tries to be polite and neighborly, even when her efforts to become his friend lead to disaster. When Peep leaves the city to live in the country with her pet iguana, her new neighbor, Wooby is concerned but tries to be polite and neighborly, even when her efforts to become his friend lead to disaster."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51nGf+II7lL.jpg",
    "book": "Yeti, Turn Out the Light!",
    "subtitle": "None",
    "author": "Greg Long, Chris Edmundson",
    "illustrator": "Wednesday Kirwan",
    "year": 2013,
    "category": "Fantasy",
    "tags": "Yeti, Bedtime",
    "checkedOut": "2016-02-27T08:00:00.000Z",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "All Yeti wants to do after a long day in the woods is to close his eyes and go to sleep. But something is not right! Shadows lurk, sounds creak, and there are monsters...or are there? This entertaining bedtime book featuring the fierce and frenetic GAMAGO Yeti will amuse and delight kids, all while encouraging them to turn out the light and go to sleep!"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/51pvgGGbgIL.jpg",
    "book": "You Think It's Easy Being the Tooth Fairy?",
    "subtitle": "None",
    "author": "Sheri Bell-Rehwoldt",
    "illustrator": "David Slonim",
    "year": 2007,
    "category": "Fantasy",
    "tags": "Teeth, Fairies, Tooth Fairy",
    "rating": "Did not like",
    "amazon": "5 stars",
    "timesRead": 1,
    "description": "All over America, kids are losing their teeth. And who is there to gather them up, leaving coins in their places? The Tooth Fairy, of course! A self-described \"action kind of gal\" with plenty of attitude, she reveals her secrets at last. Learn about her amazing Tooth-o-Finder. Marvel at her ingenious flying machine. Watch her in action, dodging dogs and cats and gerbils. You Think It's Easy Being the Tooth Fairy? is the essential guide for every kid about to lose a tooth. And don't forget, February is National Children's Dental Health Month."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/41COvJovauL.jpg",
    "book": "Your Alien",
    "subtitle": "None",
    "author": "Tammi Sauer",
    "illustrator": "Goro Fujita",
    "year": 2015,
    "category": "Fantasy",
    "tags": "Aliens, Friendship",
    "rating": "Did not read",
    "amazon": "5 stars",
    "timesRead": 0,
    "description": "When a little boy meets a stranded alien child, the two instantly strike up a fabulous friendship. They go to school, explore the neighborhood, and have lots of fun. But at bedtime, the alien suddenly grows very, very sad. Can the boy figure out what his new buddy needs most of all? This funny, heartwarming story proves that friends and family are the most important things in the universe . . . no matter who or where you are."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/510KPyg2TYL.jpg",
    "book": "Zombelina",
    "subtitle": "None",
    "author": "Kristyn Crow",
    "illustrator": "Molly Schaar Idle",
    "year": 2013,
    "category": "Fantasy",
    "tags": "Zombies, Dancing",
    "checkedOut": "2016-03-22T07:00:00.000Z",
    "rating": "Liked it",
    "amazon": "5 stars",
    "timesRead": 4,
    "description": "Zombelina loves to dance. She moonwalks with mummies and boogies with bats. She spins like a specter and glides like a ghost and loves to dance for her family the most. When Zombelina enrolls in a ballet class for real girls, her dancing gives everyone the chills! But when her first recital brings on a case of stage fright, her zombie moans and ghoulish groans scare her audience away. Only her devoted family's cheers, in their special spooky way, help Zombelina dance the ballet debut of her dreams."
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/61YD7aw3DqL.jpg",
    "book": "Zombie in Love",
    "subtitle": "None",
    "author": "Kelly DiPucchio",
    "illustrator": "Scott Campbell",
    "year": 2011,
    "category": "Fantasy",
    "tags": "Zombies",
    "checkedOut": "OWN",
    "rating": "Loved it",
    "amazon": "5 stars",
    "timesRead": 7,
    "description": "Mortimer is looking for love. And he’s looking everywhere! He’s worked out at the gym (if only his arm wouldn’t keep falling off). He’s tried ballroom dancing lessons (but the ladies found him to be a bit stiff). He’s even been on stalemate.com. How’s a guy supposed to find a ghoul? When it seems all hope has died, could the girl of Mortimer’s dreams be just one horrifying shriek away?"
  }, {
    "cover": "http://edmonterrubio.com/files/book-covers/81I2lss+y2L.jpg",
    "book": "Zombie in Love 2+1",
    "subtitle": "None",
    "author": "Kelly DiPucchio",
    "illustrator": "Scott Campbell",
    "year": 2014,
    "category": "Fantasy",
    "tags": "Zombies",
    "checkedOut": "OWN",
    "rating": "Loved it",
    "amazon": "4.5 stars",
    "timesRead": 10,
    "description": "Zombie lovebirds Mortimer and Mildred discover a baby on their doorstep. They are worried sick when the baby sleeps through the night and hardly ever cries. How will they teach him to be a proper zombie child? \"Zombie lovebirds Mortimer and Mildred discover a baby on their doorstep. They're worried sick when the baby sleeps through the night and hardly ever cries. How will they teach him to be a proper zombie child?\""
  }
];


},{}],"myModule":[function(require,module,exports){
exports.myVar = "myVariable";

exports.myFunction = function() {
  return print("myFunction is running");
};

exports.myArray = [1, 2, 3];


},{}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1VzZXJzL2VkbW9udGVycnViaW8vZ2l0aHViL2NoaWxkcmVuc0Jvb2tzL2NoaWxkcmVuc0Jvb2tzLmZyYW1lci9tb2R1bGVzL215TW9kdWxlLmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL2VkbW9udGVycnViaW8vZ2l0aHViL2NoaWxkcmVuc0Jvb2tzL2NoaWxkcmVuc0Jvb2tzLmZyYW1lci9tb2R1bGVzL2xpYnJhcnlCb29rcy5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9lZG1vbnRlcnJ1YmlvL2dpdGh1Yi9jaGlsZHJlbnNCb29rcy9jaGlsZHJlbnNCb29rcy5mcmFtZXIvbW9kdWxlcy9pbnB1dC5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9lZG1vbnRlcnJ1YmlvL2dpdGh1Yi9jaGlsZHJlbnNCb29rcy9jaGlsZHJlbnNCb29rcy5mcmFtZXIvbW9kdWxlcy9maXJlYmFzZS5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9lZG1vbnRlcnJ1YmlvL2dpdGh1Yi9jaGlsZHJlbnNCb29rcy9jaGlsZHJlbnNCb29rcy5mcmFtZXIvbW9kdWxlcy9WaWV3Q29udHJvbGxlci5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9lZG1vbnRlcnJ1YmlvL2dpdGh1Yi9jaGlsZHJlbnNCb29rcy9jaGlsZHJlbnNCb29rcy5mcmFtZXIvbW9kdWxlcy9UZXh0TGF5ZXIuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvZWRtb250ZXJydWJpby9naXRodWIvY2hpbGRyZW5zQm9va3MvY2hpbGRyZW5zQm9va3MuZnJhbWVyL21vZHVsZXMvRm9udEZhY2UuY29mZmVlIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIjIEFkZCB0aGUgZm9sbG93aW5nIGxpbmUgdG8geW91ciBwcm9qZWN0IGluIEZyYW1lciBTdHVkaW8uIFxuIyBteU1vZHVsZSA9IHJlcXVpcmUgXCJteU1vZHVsZVwiXG4jIFJlZmVyZW5jZSB0aGUgY29udGVudHMgYnkgbmFtZSwgbGlrZSBteU1vZHVsZS5teUZ1bmN0aW9uKCkgb3IgbXlNb2R1bGUubXlWYXJcblxuZXhwb3J0cy5teVZhciA9IFwibXlWYXJpYWJsZVwiXG5cbmV4cG9ydHMubXlGdW5jdGlvbiA9IC0+XG5cdHByaW50IFwibXlGdW5jdGlvbiBpcyBydW5uaW5nXCJcblxuZXhwb3J0cy5teUFycmF5ID0gWzEsIDIsIDNdIiwiZXhwb3J0cy5kYXRhID0gW1xuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MThDak0tRm00TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiMTAwIEh1bmdyeSBNb25rZXlzIVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIk1hc2F5dWtpIFNlYmVcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIk1hc2F5dWtpIFNlYmVcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTQsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIk1vbmtleXMsIEtpc3NpbmcsIEJlZHRpbWVcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlRoaXMgcGxheWZ1bCBwaWN0dXJlIGJvb2sgZW5jb3VyYWdlcyBwcmUtcmVhZGVycyBhbmQgZWFybHkgcmVhZGVycyB0byBleHBsb3JlIHRoZSBjb25jZXB0IG9mIDEwMC4gVW51c3VhbCBpbiB0aGF0IGl0IGlzIGEgbmFycmF0aXZlLWRyaXZlbiBjb3VudGluZyBib29rLCBpdCBvZmZlcnMgYSBkZWxpZ2h0ZnVsIGFuZCBsaXZlbHkgc3RvcnkgYWJvdXQgMTAwIGh1bmdyeSBtb25rZXlzIHdobyBzZXQgb3V0IHRvIGZpbmQgdGhlbXNlbHZlcyBzb21lIGZvb2QuIE9uY2UgdGhlaXIgYmVsbGllcyBhcmUgZnVsbCwgdGhleSBhbGwgc2V0dGxlIGluIGZvciBhIG5hcCwgYnV0IHRoZW4gYSBtb25zdGVyIHN1ZGRlbmx5IGFwcGVhcnMuIFRoZXkgZmVhciBoZSB3YW50cyB0byBtYWtlIHRoZW0gbHVuY2gsIHNvIHRoZXkgYWxsIHJ1biBmb3IgdGhlaXIgbGl2ZXMuIEFsbCBlbmRzIHdlbGwsIGhvd2V2ZXIsIG9uY2UgdGhlIG1vbmtleXMgcmVhbGl6ZSB0aGUgbW9uc3RlciByZWFsbHkganVzdCB3YW50cyB0byBiZSB0aGVpciBmcmllbmQuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MTJyM2lCcFVkTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiMTIzIFZlcnN1cyBBQkNcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJNaWtlIEJvbGR0XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJNaWtlIEJvbGR0XCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEzLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJBbmltYWxzLCBMZXR0ZXJzLCBDb3VudGluZ1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTA0LTAyVDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTnVtYmVycyB0aGluayB0aGV5J3JlIHRoZSBzdGFycyBvZiB0aGlzIGJvb2ssIGJ1dCBMZXR0ZXJzIGRpc2FncmVlISBOdW1iZXJzIGFuZCBsZXR0ZXJzLCB0aGUgY29sb3JmdWwgY2hhcmFjdGVycyBpbiB0aGlzIHN0b3J5LCBjb21wZXRlIHRvIGJlIHRoZSBzdGFycyBvZiB0aGlzIGJvb2suIFRoZWlyIGRlYmF0ZSBlc2NhbGF0ZXMgd2hlbiBmdW5ueSBhbmltYWxzIGFuZCBwcm9wcyBhcnJpdmXigJRzdGFydGluZyB3aXRoIDEgYWxsaWdhdG9yLCAyIGJlYXJzLCBhbmQgMyBjYXJzLiBXaG8gaXMgdGhpcyBib29rIHJlYWxseSBhYm91dD9cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxUkRIY1VYTDZMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJBIEJlYW4sIEEgU3RhbGssIGFuZCBBIEJveSBOYW1lZCBKYWNrXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiV2lsbGlhbSBKb3ljZVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiS2VubnkgQ2FsbGljdXR0XCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJGYWl5dGFsZXMsIEdpYW50XCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMDgtMjBUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiWW91IG1pZ2h0IHRoaW5rIHlvdSBrbm93IHRoZSBzdG9yeSBvZiBKYWNrIGFuZCB0aGUgQmVhbnN0YWxrLCBidXQgeW91IG1pZ2h0IHdhbnQgdG8gdGhpbmsgYWdhaW4uIEluIHRoaXMgZmFpcnkgdGFsZSB3aXRoIGEgdHdpc3QsIGl0IGhhc27igJl0IHJhaW5lZCBpbiBkYXlzIGFuZCB0aGUga2luZyBoYXMgZGljdGF0ZWQgdGhhdCBzb21ldGhpbmcgbXVzdCBiZSBkb25l4oCUaGlzIHJveWFsIHBpbmt5IGlzIGdldHRpbmcgc3Rpbmt5ISBXaXRoIGEgbGl0dGxlIG1hZ2ljIGZyb20gYSB3aXphcmQsIHlvdW5nIEphY2ssIHBhaXJlZCB3aXRoIGhpcyBwZWEgcG9kIHBhbCwgd2lsbCBmaW5kIGEgR0lBTlQgcmVhc29uIGFzIHRvIHdoeSB0aGVyZeKAmXMgbm8gd2F0ZXIgbGVmdCBpbiB0aGUga2luZ2RvbS4uLmFuZCBwcm92ZSB0aGF0IHNpemUgZG9lc27igJl0IHByZXZlbnQgYW55b25lIGZyb20gZG9pbmcgc29tZXRoaW5nIEJJRy5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxU1NVMU54LWdMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJBIENhbGwgZm9yIGEgTmV3IEFscGhhYmV0XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSmVmIEN6ZWpha1wiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiSmVmIEN6ZWpha1wiLFxuICAgICAgICBcInllYXJcIjogMjAxMSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkZhbnRhc3lcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiTGV0dGVyc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAxLTIzVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUaXJlZCBvZiBiZWluZyBuZWFyIHRoZSBlbmQgb2YgdGhlIGFscGhhYmV0LCBzdGFydGluZyBmZXcgd29yZHMsIGFuZCBiZWluZyBnb3Zlcm5lZCBieSBncmFtbWFyIHJ1bGVzLCBYIGNhbGxzIGZvciBhIHZvdGUgb24gYSBuZXcgQWxwaGFiZXQgQ29uc3RpdHV0aW9uIGFuZCB0aGVuIGRyZWFtcyBvZiBob3cgbGlmZSB3b3VsZCBiZSBpZiBoZSBiZWNhbWUgYSBkaWZmZXJlbnQgbGV0dGVyLiBUaXJlZCBvZiBiZWluZyBuZWFyIHRoZSBlbmQgb2YgdGhlIGFscGhhYmV0LCBzdGFydGluZyBmZXcgd29yZHMsIGFuZCBiZWluZyBnb3Zlcm5lZCBieSBncmFtbWFyIHJ1bGVzLCBYIGNhbGxzIGZvciBhIHZvdGUgb24gYSBuZXcgQWxwaGFiZXQgQ29uc3RpdHV0aW9uLCB0aGVuIGRyZWFtcyBvZiBob3cgbGlmZSB3b3VsZCBiZSBpZiBoZSBiZWNhbWUgYSBkaWZmZXJlbnQgbGV0dGVyLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNzF4NGl5MTJiS0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkEgRGF5IHdpdGggdGhlIEFuaW1hbCBCdWlsZGVyc1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlNoYXJvbiBSZW50dGFcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlNoYXJvbiBSZW50dGFcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTMsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkJ1aWxkZXJzLCBDb25zdHJ1Y3Rpb25cIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUaGUgcGVuZ3VpbnMnIGRyZWFtIGhvbWUgaXMgZ29pbmcgdG8gYmUgYW1hemluZywgd2l0aCBhbiBpY2UgcmluaywgYSBoZWx0ZXItc2tlbHRlciBhbmQgYSBzd2ltbWluZyBwb29sIG9uIHRoZSByb29mLiBIb3dldmVyLCB0aGUgYW5pbWFsIGJ1aWxkZXJzJyBhcHByZW50aWNlLCBEb25rZXksIGlzIHR1cm5pbmcgb3V0IHRvIGJlIGEgYml0IG9mIGEgZGlzYXN0ZXIuIEhpcyBicmlja2xheWluZyBpcyBhIG1lc3M7IGhlJ3MgYSBwb3NpdGl2ZSBkYW5nZXIgYmVoaW5kIHRoZSB3aGVlbCBvZiBhIGR1bXBlciB0cnVjaywgYW5kIGhpcyBwbHVtYmluZyBpcyBhIGNhdGFzdHJvcGhlLiBCdXQgd2hvIHNhdmVzIHRoZSBkYXkgd2hlbiBhIHJ1bmF3YXkgYnVsbGRvemVyIHRocmVhdGVucyB0byBmbGF0dGVuIGFsbCB0aGUgYnVpbGRlcnMnIGhhcmQgd29yaz8gRG9ua2V5IGRvZXMhIFNvIHRoYXQncyB3aGF0IERvbmtleSdzIGdvb2QgYXQ6IGJlaW5nIHN1cGVyLXN0cm9uZyFcIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzQxUk5LZ3VRRFFMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJBIERheSB3aXRoIHRoZSBBbmltYWwgRG9jdG9yc1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlNoYXJvbiBSZW50dGFcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlNoYXJvbiBSZW50dGFcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTMsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkRvY3RvcnNcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJdCdzIGdvaW5nIHRvIGJlIGEgYnVzeSBkYXkgZm9yIHRoZSBBbmltYWwgRG9jdG9ycy4gQSBzbmFrZSBuZWVkcyB1bmtub3R0aW5nLCBhIGxlb3BhcmQgaGFzIGxvc3QgaGlzIHNwb3RzLCBhbmQgYSBkb2cgaGFzIHN3YWxsb3dlZCBhbiBhbGFybSBjbG9jayAuIC4gLiBBIGZhYnVsb3VzbHkgZnVubnkgYm9vayBmb3IgZXZlcnkgY2hpbGQgd2hvIGxvdmVzIHBsYXlpbmcgZG9jdG9ycyBhbmQgbnVyc2VzLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFXd3BCZ3JBVEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkEgRGF5IFdpdGggV2lsYnVyIFJvYmluc29uXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiV2lsbGlhbSBKb3ljZVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiV2lsbGlhbSBKb3ljZVwiLFxuICAgICAgICBcInllYXJcIjogMjAwNixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJIdW1vcm91c1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTA5LTE5VDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIldoaWxlIHNwZW5kaW5nIHRoZSBkYXkgaW4gdGhlIFJvYmluc29uIGhvdXNlaG9sZCwgV2lsYnVyJ3MgYmVzdCBmcmllbmQgam9pbnMgaW4gdGhlIHNlYXJjaCBmb3IgR3JhbmRmYXRoZXIgUm9iaW5zb24ncyBtaXNzaW5nIGZhbHNlIHRlZXRoIGFuZCBtZWV0cyBvbmUgd2Fja3kgcmVsYXRpdmUgYWZ0ZXIgYW5vdGhlci4gVGhpcyBpcyBhbiBleHBhbmRlZCB2ZXJzaW9uIG9mIEEgREFZIFdJVEggV0lMQlVSIFJPQklOU09OICgxOTkwKS4gV2hpbGUgc3BlbmRpbmcgdGhlIGRheSBpbiB0aGUgUm9iaW5zb24gaG91c2Vob2xkLCBXaWxidXIncyBiZXN0IGZyaWVuZCBqb2lucyBpbiB0aGUgc2VhcmNoIGZvciBHcmFuZGZhdGhlciBSb2JpbnNvbidzIG1pc3NpbmcgZmFsc2UgdGVldGggYW5kIG1lZXRzIG9uZSB3YWNreSByZWxhdGl2ZSBhZnRlciBhbm90aGVyLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTF1Q2xIMkhRMEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkEgRGlub3NhdXIgQ2FsbGVkIFRpbnlcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJBbGFuIER1cmFudFwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiSm8gU2ltcHNvblwiLFxuICAgICAgICBcInllYXJcIjogMjAwOCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkRpbm9zYXVyc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJEaW5vc2F1cnNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNS0xMi0zMVQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCJOb25lXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDQsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUaW55IHRoZSBkaW5vc2F1ciB0cmllcyB0byBtYWtlIGZyaWVuZHMgd2l0aCB0aGUgb3RoZXIgeW91bmcgZGlub3NhdXJzLCB3aG8gbWFrZSBmdW4gb2YgVGlueSBiZWNhdXNlIG9mIGhpcyBzaXplLCBidXQgd2hlbiBvbmUgb2YgaGlzIGZyaWVuZHMgZ2V0cyBpbiB0cm91YmxlLCBUaW55J3Mgc21hbGwgc2l6ZSBhbmQgYmlnIGhlYXJ0IGhlbHAgc2F2ZSB0aGUgZGF5LiBUaW55IHRoZSBzbWFsbCBkaW5vc2F1ciBoYXRjaGVzIGZyb20gYSBsYXJnZSBlZ2cuIEhlJ3MgdG9vIHNtYWxsIHRvIGpvaW4gdGhlIG90aGVyIGRpbm9zYXVycyBpbiBnYW1lcy4gQnV0IHdoZW4gb25lIG9mIHRoZSBkaW5vc2F1cnMgaW4gdHJvdWJsZSwgVGlueSBnb2VzIHRvIHRoZSByZXNjdWUuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MXFhNnVHU0NqTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQSBEb2cgV2VhcmluZyBTaG9lc1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlNhbmdtaSBLb1wiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiU2FuZ21pIEtvXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJEb2dzLCBTaG9lc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTIxVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiV2hlbiBNaW5pIGZpbmRzIGEgc21hbGwgbW9wcGV0IG9mIGEgZG9nLCB3aXRoIGZsdWZmeSBlYXJzLCBubyBjb2xsYXIsIGFuZCB3ZWFyaW5nIHllbGxvdyBib290aWVzLCBzaGUgdW5kZXJzdGFuZGFibHkgd2FudHMgdG8gdGFrZSBpdCBob21lLiBEZXNwaXRlIE1vbSBzIGluc2lzdGVuY2UgdGhhdCB0aGUgZG9nIHByb2JhYmx5IGFscmVhZHkgaGFzIGEgZmFtaWx5LCBNaW5pIGdldHMgYXR0YWNoZWQgYW5kIGlzIGF3ZnVsbHkgcHJvdWQgb2YgaGVyIG5ldyBwYWwsIHdobyBjYW4gc2luZywgc2l0LCBhbmQgZ2l2ZSBib3RoIHBhd3MuIEJ1dCB3aGVuIHRoZSBwdXAgcnVucyBvZmYgb25lIGRheSBhdCB0aGUgcGFyaywgTWluaSBjb21lcyB0byB1bmRlcnN0YW5kIGhvdyBzb21lb25lIGVsc2Ugb3V0IHRoZXJlIG1pZ2h0IGJlIG1pc3NpbmcgdGhlIGxpdHRsZSBndXkgdG9vLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFnd3FQZDFEVEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkEgRnVubnkgVGhpbmcgSGFwcGVuZWQgb24gdGhlIFdheSB0byBTY2hvb2xcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJEYXZpZGUgQ2FsaVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiQmVuamFtaW4gQ2hhdWRcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRXhjdXNlcywgVGFyZGluZXNzLCBBcGVzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDMtMjJUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUaGVuIHRoZXJlIGFyZSB0aGUgZXZpbCBuaW5qYXMsIG1hc3NpdmUgYXBlLCBteXN0ZXJpb3VzIG1vbGUgcGVvcGxlLCBnaWFudCBibG9iLCBhbmQgY291bnRsZXNzIG90aGVyIGRhdW50aW5nIChhbmQgYXN0b25pc2hpbmcpIGRldG91cnMgYWxvbmcgdGhlIHdheSB0byBzY2hvb2wuIEFyZSB0aGVzZSBleGN1c2VzIHJlYWxseSB3aHkgdGhpcyBzdHVkZW50IGlzIGxhdGU/IE9yIGlzIHRoZXJlIGFub3RoZXIgZXhwbGFuYXRpb24gdGhhdCBpcyBldmVuIG1vcmUgb3V0cmFnZW91cyB0aGFuIHRoZSByZXN0PyBGcm9tIERhdmlkZSBDYWxpIGFuZCBCZW5qYW1pbiBDaGF1ZCwgdGhlIGNyaXRpY2FsbHkgYWNjbGFpbWVkIGF1dGhvci9pbGx1c3RyYXRvciB0ZWFtIGJlaGluZCBJIERpZG4ndCBEbyBNeSBIb21ld29yayBCZWNhdXNlIC4gLiAuIGNvbWVzIGEgZmFzdC1wYWNlZCwgYWN0aW9ucGFja2VkLCBsYXVnaC1vdXQtbG91ZCBzdG9yeSBhYm91dCBmaW5kaW5nIHRoZSB3YXkgdG8gc2Nob29sIGRlc3BpdGUgdGhlIG9kZHPigJRhbmQgdGhlIHVuYmVsaWV2YWJsZSBvZGRuZXNzIVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFTV0M0cDZ4LUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkEgR2lyYWZmZSBhbmQgYSBoYWxmXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiU2hlbCBTaWx2ZXJzdGVpblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiU2hlbCBTaWx2ZXJzdGVpblwiLFxuICAgICAgICBcInllYXJcIjogMjAxNCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiR2lyYWZmZXMsIFJoeW1lc1wiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxvdmVkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiA0LFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSW4gdGhpcyBib29rLCBjdW11bGF0aXZlLCByaHltaW5nIHRleHQgZXhwbGFpbnMgd2hhdCBtaWdodCBoYXBwZW4gaWYgeW91IGhhZCBhIGdpcmFmZmUgdGhhdCBzdHJldGNoZWQgYW5vdGhlciBoYWxmLCBwdXQgb24gYSBoYXQgaW4gd2hpY2ggbGl2ZWQgYSByYXQgdGhhdCBsb29rZWQgY3V0ZSBpbiBhIHN1aXQsIGFuZCBzbyBvbi4gQ3VtdWxhdGl2ZSByaHltZWQgdGV4dCBleHBsYWlucyB3aGF0IG1pZ2h0IGhhcHBlbiBpZiB5b3UgaGFkIGEgZ2lyYWZmZSB0aGF0IHN0cmV0Y2hlZCBhbm90aGVyIGhhbGYsIHB1dCBvbiBhIGhhdCBpbiB3aGljaCBsaXZlZCBhIHJhdCB0aGF0IGxvb2tlZCBjdXRlIGluIGEgc3VpdCwgYW5kIHNvIG9uLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvOTFBR1lpa3prb0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkEgR29sZCBTdGFyIGZvciBab2dcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJKdWxpYSBEb25hbGRzb25cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkF4ZWwgU2NoZWZmbGVyXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEyLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJEcmFnb25zXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMzBUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiRWFjaCB5ZWFyLCBhcyBab2cgcHJhY3RpY2VzIG5ldyBza2lsbHMgbGVhcm5lZCBhdCBNYWRhbSBEcmFnb24ncyBzY2hvb2wsIGEgbGl0dGxlIGdpcmwgaGVscHMgaGltIG91dCwgdW50aWwgb25lIGRheSwgaGUgZmluZHMgYSB3YXkgdG8gaGVscCBtYWtlIGhlciBkcmVhbSBjb21lIHRydWUgZm9yIGhlcnNlbGYsIGEgbmV3IGZyaWVuZCwgYW5kIFpvZy4gRWFjaCB5ZWFyLCBhcyBab2cgcHJhY3RpY2VzIG5ldyBza2lsbHMgbGVhcm5lZCBhdCBNYWRhbSBEcmFnb24ncyBzY2hvb2wsIGEgbGl0dGxlIGdpcmwgaGVscHMgaGltIG91dCB1bnRpbCBvbmUgZGF5IGhlIGZpbmRzIGEgd2F5IHRvIGhlbHAgbWFrZSBoZXIgZHJlYW0gY29tZSB0cnVlIGZvciBoZXJzZWxmLCBhIG5ldyBmcmllbmQsIGFuZCBab2cuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MVJoQW5jTndPTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQSBIdW5ncnkgTGlvbiwgT3IsIEEgRHdpbmRsaW5nIEFzc29ydG1lbnQgb2YgQW5pbWFsc1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkx1Y3kgUnV0aCBDdW1taW5zXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJMdWN5IFJ1dGggQ3VtbWluc1wiLFxuICAgICAgICBcInllYXJcIjogMjAxNixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiU3VycHJpc2UsIFBlbmd1aW5zLCBSYWJiaXRzLCBLb2FsYXNcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJIYXZlIG5vdCByZWFkIHlldFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVGhlcmUgb25jZSB3YXMgYSBodW5ncnkgbGlvbiwgYSBwZW5ndWluIChXZWxsIGhlIHdhcyBqdXN0IGhlcmXigKYpLCBhIGxpdHRsZSBjYWxpY28ga2l0dGVuIChJIGNvdWxkIGhhdmUgc3dvcm4gSSBqdXN0IHNhdyBoaW3igKYpLCBhIGJyb3duIG1vdXNlIChOb3cgd2FpdCBhIHNlY29uZOKApiksIGEgYnVubnkgd2l0aCBmbG9wcHkgZWFycyBhbmQgYSBidW5ueSB3aXRoIHVuLWZsb3BweSBlYXJzIChPa2F5IHRoaXMgaXMganVzdCBnZXR0aW5nIHJpZGljdWxvdXMpLCBhIGZyb2csIGEgYmF0LCBhIHBpZywgYSBzbGlnaHRseSBiaWdnZXIgcGlnLCBhIHdvb2x5IHNoZWVwLCBhIGtvYWxhLCBhIGhlbiwgYW5kIGFsc28gYSB0dXJ0bGUuIEhleSEgV2hhdOKAmXMgZ29pbmcgb24gaGVyZeKApiBUaGUgdmVyeSBodW5ncnkgbGlvbiBpcyBhbGwgc2V0IHRvIGVuam95IGFuIGV4Y2l0aW5nIGRheSB3aXRoIGhpcyBvdGhlciBhbmltYWwgcGFscy4gQnV0IGFsbCBvZiBhIHN1ZGRlbiBoaXMgZnJpZW5kcyBzdGFydCBkaXNhcHBlYXJpbmcgYXQgYW4gYWxhcm1pbmcgcmF0ZSEgSXMgc29tZW9uZSBzdGVhbGluZyB0aGUgaHVuZ3J5IGxpb27igJlzIGZyaWVuZHMsIG9yIGlzIHRoZSBjdWxwcml0IGEgbGl0dGxl4oCmY2xvc2VyIHRvIGhvbWU/XCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MTJkU1BuRnhvTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQSBLaXR0ZW4gVGFsZVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkVyaWMgUm9obWFublwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiRXJpYyBSb2htYW5uXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDA4LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJDYXRzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDItMTJUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkZvdXIga2l0dGVucyBoYXZlIG5ldmVyIHNlZW4gdGhlIHNub3cuIFRoZSBmaXJzdCB0aHJlZSBraXR0ZW5zIGFyZSB3YXJ5LS1zbm93IGlzIGNvbGQsIGl0J3Mgd2V0LCBpdCBjb3ZlcnMgZXZlcnl0aGluZy4gVGhpcyB1bmtub3duIHRoaW5nIGNhbGxlZCBzbm93IGlzIGEgbGl0dGxlIGJpdC4gLiAuIHNjYXJ5LiBBcyB0aGUgc2Vhc29ucyBwYXNzIGFuZCB3aW50ZXIgYmVnaW5zIHRvIGxvb20sIHRoZSB0aHJlZSBza2l0dGlzaCBraXR0ZW5zIHdvcnJ5LiBCdXQgdGhlIGZvdXJ0aCBraXR0ZW4gdGFrZXMgYSBkaWZmZXJlbnQgdmlldy4gVGhlIGZvdXJ0aCBraXR0ZW4gaXMgZ2V0dGluZyBleGNpdGVkLiBTbm93IHdpbGwgY292ZXIgZXZlcnl0aGluZz8hIFxcXCJJIGNhbid0IHdhaXQhXFxcIlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFYY2lBUGhkbUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkFkdmVudHVyZXMgV2l0aCBCYXJlZm9vdCBDcml0dGVyc1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlRlYWdhbiBXaGl0ZVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiVGVhZ2FuIFdoaXRlXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJTZWFzb25zLCBBbHBoYWJldFwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkpvaW4gYW4gYWRvcmFibGUgY2FzdCBvZiBhbmltYWwgY2hhcmFjdGVycyBhcyB0aGV5IGV4cGxvcmUgdGhlIGFscGhhYmV0IHRocm91Z2ggdGhlIHNlYXNvbnMuIEZyb20gZ2F0aGVyaW5nIGhvbmV5IGluIHNwcmluZyB0byBidWlsZGluZyBjb3p5IGNhbXBmaXJlcyBpbiBmYWxsLCB0aGUgZnJpZW5kcyBtYWtlIHRoZSBtb3N0IG9mIGVhY2ggc2Vhc29uLCBib3RoIGVuam95aW5nIHRoZSBncmVhdCBvdXRkb29ycyBhbmQgc3RheWluZyBzbnVnIGluc2lkZS4gTGVhcm5pbmcgdGhlIGFscGhhYmV0IGlzIGZ1biB3aGVuIGFkdmVudHVyaW5nIHdpdGggdGhlc2UgY3JpdHRlcnMsIGFuZCBjaGlsZHJlbiBhbmQgYWR1bHRzIGFsaWtlIHdpbGwgZGVsaWdodCBpbiBUZWFnYW4gV2hpdGUncyBzd2VldCwgbm9zdGFsZ2ljIGlsbHVzdHJhdGlvbnMuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MVQ2b3FOSFNWTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQWxleGFuZGVyIGFuZCB0aGUgVGVycmlibGUsIEhvcnJpYmxlLCBObyBHb29kLCBWZXJ5IEJhZCBEYXlcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJKdWRpdGggVmlvcnN0XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJSYXkgQ3J1elwiLFxuICAgICAgICBcInllYXJcIjogMjAwOSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJIdW1vcm91c1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTEyLTMxVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk9uIGEgZGF5IHdoZW4gZXZlcnl0aGluZyBnb2VzIHdyb25nIGZvciBoaW0sIEFsZXhhbmRlciBpcyBjb25zb2xlZCBieSB0aGUgdGhvdWdodCB0aGF0IG90aGVyIHBlb3BsZSBoYXZlIGJhZCBkYXlzIHRvby4gT25lIGRheSB3aGVuIGV2ZXJ5dGhpbmcgZ29lcyB3cm9uZyBmb3IgaGltLCBBbGV4YW5kZXIgaXMgY29uc29sZWQgYnkgdGhlIHRob3VnaHQgdGhhdCBvdGhlciBwZW9wbGUgaGF2ZSBiYWQgZGF5cywgdG9vLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvOTFRWG5sQ2VOSEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkFsaWVucyBMb3ZlIFVuZGVycGFudHNcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJDbGFpcmUgRnJlZWRtYW5cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkJlbiBDb3J0XCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEzLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJBbGllbnMsIFVuZGVyd2VhclwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAzLTExVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAzLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiV2hlbiBhbGllbnMgY29tZSB0byBFYXJ0aCwgaXQgaXMgZm9yIHRoZSBzaW1wbGUgcmVhc29uIHRoYXQgdGhleSBsb3ZlIHRvIHBsYXkgd2l0aCBhbmQgaGlkZSBpbiBmcmVzaGx5IGxhdW5kZXJlZCB1bmRlcnBhbnRzIG9mIGFsbCBzaGFwZXMgYW5kIHNpemVzLiBJbGx1c3RyYXRpb25zIGFuZCByaHltaW5nIHRleHQgcmV2ZWFsIHRoZSB0cnVlIHJlYXNvbiBhbGllbnMgdmlzaXQgRWFydGggaXMgdGhhdCB0aGV5IGRlZW0gdW5kZXJwYW50cyBzbyBtdWNoIGZ1biB0byBwbGF5IHdpdGguXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy83MUdDRDJ4c2tkTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQWxsIFBhd3Mgb24gRGVja1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiSGFnZ2lzIGFuZCBUYW5rIFVubGVhc2hlZCAjMVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkplc3NpY2EgWW91bmdcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkphbWVzIEJ1cmtzXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJEb2dzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMjNUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVGFuayBpcyBhIGNsdW1zeSwgb3V0Z29pbmcgR3JlYXQgRGFuZSwgYW5kIEhhZ2dpcyBpcyBhIGJvcmVkLCBjdXJtdWRnZW9ubHkgU2NvdHRpZS0tc28gb25lIGFmdGVybm9vbiBUYW5rIHN1Z2dlc3RzIHRoZXkgdHVybiB0aGUgd2Fnb24gaW4gdGhlIGJhY2t5YXJkIGludG8gYSBzaGlwIGFuZCBwbGF5IHBpcmF0ZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxcFZrSnN3ZHlMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJBbWVsaWEgQmVkZWxpYSdzIEZpcnN0IExpYnJhcnkgQ2FyZFwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkhlcm1hbiBQYXJpc2hcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkx5bm5lIEF2cmlsXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEzLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkdpcmxzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDItMjFUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjMuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQW1lbGlhIEJlZGVsaWEgaGVscHMgb3V0IGF0IHRoZSBsaWJyYXJ5IHdpdGggaGVyIGNsYXNzbWF0ZXMgYW5kIHdvbmRlcnMgd2hhdCBraW5kIG9mIGJvb2sgc2hlIHNob3VsZCBib3Jyb3cgd2hlbiBzaGUgcmVjZWl2ZXMgaGVyIGZpcnN0IGxpYnJhcnkgY2FyZC4gQW1lbGlhIEJlZGVsaWEgbG92ZXMgdG8gcmVhZCwgc28gYSB2aXNpdCB0byB0aGUgbGlicmFyeSBpcyByaWdodCB1cCBoZXIgYWxsZXkuIEFtZWxpYSBCZWRlbGlhIGFuZCBoZXIgY2xhc3NtYXRlcyBhcmUgZXNwZWNpYWxseSBleGNpdGVkIHRvIG1lZXQgdGhlIGxpYnJhcmlhbnMsIGhlbHAgb3V0IGF0IHRoZSBjaXJjdWxhdGlvbiBkZXNrLCBhbmQgaW52ZXN0aWdhdGUgdGhlIHN0YWNrcy5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxc2daam5QYmNMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJBbiBFeHRyYW9yZGluYXJ5IEVnZ1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkxlbyBMaW9ubmlcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkxlbyBMaW9ubmlcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDE5OTgsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkFsbGlnYXRvcnMsIEZyb2dzLCBGcmllbmRzaGlwLCBJZGVudGl0eVwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAzLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSXQncyBhbiBleHRyYW9yZGluYXJ5IGRheSBvbiBQZWJibGUgSXNsYW5kIGZvciB0aHJlZSBmcm9ncyB3aGVuIG9uZSBvZiB0aGVtIGRpc2NvdmVycyBhIGJlYXV0aWZ1bCB3aGl0ZSBlZ2cuIFRoZXkndmUgbmV2ZXIgc2VlbiBhIGNoaWNrZW4gZWdnIGJlZm9yZSwgYnV0IHRoZXkncmUgc3VyZSB0aGF0J3Mgd2hhdCB0aGlzIG11c3QgYmUuIFNvIHdoZW4gdGhlIGVnZyBoYXRjaGVzIGFuZCBvdXQgY3Jhd2xzIGEgbG9uZyBncmVlbiwgc2NhbHkgY3JlYXR1cmUsIHRoZXkgbmF0dXJhbGx5IGNhbGwgaXQgLiAuIC4gYSBjaGlja2VuISBGcm9tIGF3YXJkIHdpbm5pbmctYXJ0aXN0IExlbyBMaW9ubmksIGhlcmUncyBhIGhpbGFyaW91cyBjYXNlIG9mIG1pc3Rha2VuIGlkZW50aXR5IHRoYXQgY2hpbGRyZW4gYXJlIHN1cmUgdG8gZGVsaWdodCBpbi5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxNy1wWFVTU0VMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJBbmdlbGluYSBCYWxsZXJpbmFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJLYXRoYXJpbmUgSG9sYWJpcmRcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkhlbGVuIENyYWlnXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDA4LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJCYWxsZXQgRGFuY2luZywgTWljZSwgRGFuY2Vyc1wiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQSBwcmV0dHkgbGl0dGxlIG1vdXNlIHdhbnRzIHRvIGJlY29tZSBhIGJhbGxlcmluYSBtb3JlIHRoYW4gYW55dGhpbmcgZWxzZSBpbiB0aGUgd29ybGQuIEFuZ2VsaW5hIGxvdmVzIHRvIGRhbmNlIGFuZCB3YW50cyB0byBiZWNvbWUgYSBiYWxsZXJpbmEgbW9yZSB0aGFuIGFueXRoaW5nIGVsc2UgaW4gdGhlIHdvcmxkLiBBIHRydWUgbW9kZXJuIGNsYXNzaWMsIEFuZ2VsaW5hIGNvbnRpbnVlcyB0byBiZSBhZG9yZWQgYnkgaGVyIGxlZ2lvbnMgb2YgZmFucy4gRmVhdHVyaW5nIGEgbGF2aXNoIGphY2tldCB0aGF04oCZcyBhcyBzcGFya2x5IGFzIG9uZSBvZiBBbmdlbGluYeKAmXMgY29zdHVtZXMsIHRoaXMgYm9vayBpcyB0aGUgcGVyZmVjdCB3YXkgdG8gY29tbWVtb3JhdGUgaGVyIGFubml2ZXJzYXJ5LlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFZR3BGT2lsUEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkFyZSB0aGUgRGlub3NhdXJzIERlYWQsIERhZD9cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJKdWxpZSBNaWRkbGV0b25cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlJ1c3NlbGwgQXl0b1wiLFxuICAgICAgICBcInllYXJcIjogMjAxMyxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkRpbm9zYXVyc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJEaW5vc2F1cnMsIE11c2V1bSwgaHVtYW5zXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDItMjNUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiS2lkcyBsb3ZlIHRvIGltYWdpbmUgd2hhdCBkaW5vc2F1cnMgbWlnaHQgaGF2ZSBiZWVuIGxpa2Ugd2hlbiB0aGV5IHdlcmUgYWxpdmUuIEJ1dCB3aGVuIGEgdHJpcCB0byB0aGUgbXVzZXVtIHR1cm5zIGludG8gYSByZWFsLWxpZmUgcHJlaGlzdG9yaWMgZW5jb3VudGVyLCBEYXZlIGFuZCBoaXMgZGFkIGRvbiB0IG5lZWQgdG8gdXNlIHRoZWlyIGltYWdpbmF0aW9uLiBBcyB0aGV5IHdhbGsgdGhyb3VnaCB0aGUgcm9vbXMgb2YgdGhlIGV4aGliaXQsIERhdmUga2VlcHMgdHJ5aW5nIHRvIGdldCBoaXMgZGFkcyBhdHRlbnRpb24uIFRoZSBkaW5vc2F1cnMgYXJvdW5kIGhpbSBzcHJpbmcgdG8gbGlmZSwgYnV0IERhZCByZW1haW5zIG9ibGl2aW91cyB0byB0aGUgdW5mb2xkaW5nIHNjZW5lIGFuZCBrZWVwcyBpbnNpc3RpbmcgdGhleSByZSBkZWFkLiBEYXZlIGtub3dzIGJldHRlciwgdGhvdWdoLCBhbmQgd2hlbiB0aGV5IGZpbmQgdGhlbXNlbHZlcyBwdXJzdWVkIGJ5IGEgaHVuZ3J5IFR5cmFubm9zYXVydXMsIERhZCBmaW5hbGx5IHJlYWxpemVzIGl0IHRvbyFcIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxMExwbVB2cXJMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJCYWQgRG9nLCBNYXJsZXkhXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSm9obiBHcm9nYW5cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlJpY2hhcmQgQ293ZHJleVwiLFxuICAgICAgICBcInllYXJcIjogMjAxMSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRG9nc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTI3VDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAyLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTW9tbXksIERhZGR5LCBDYXNzaWUsIGFuZCBCYWJ5IExvdWllIHdlbGNvbWUgTWFybGV5LCBhIGxvdmFibGUgcHVwcHksIGludG8gdGhlaXIgaG9tZS4gQnV0IE1hcmxleSBkb2VzbuKAmXQgc3RheSBhIHBpbnQtc2l6ZWQgcHVwIGZvciBsb25nLiBIZSBncm93cyBhbmQgZ3Jvd3MsIGFuZCB0aGUgYmlnZ2VyIE1hcmxleSBnZXRzLCB0aGUgYmlnZ2VyIHRyb3VibGUgaGUgZ2V0cyBpbnRvLiBCaWcsIGJhZC1ib3kgdHJvdWJsZS4gV2lsbCB0aGlzIGZhbWlseSBoYXZlIHRvIGZpbmQgYSBuZXcgaG9tZSBmb3IgdGhlaXIgbWlzYmVoYXZpbmcgcG9vY2gsIG9yIHdpbGwgaGUgcHJvdmUgaGUgY2FuIGJlIGEgZ29vZCBib3k/XCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy84MVozTkpzVlhBTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQmFkIEtpdHR5XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTmljayBCcnVlbFwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiTmljayBCcnVlbFwiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQ2F0c1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTA0LTAyVDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiS2l0dHkgaXMgbm90IGhhcHB5IGhlbiBzaGUncyB0b2xkIHRoYXQgaGVyIGZhdm9yaXRlIGZvb2RzIGFyZSBhbGwgZ29uZSBhbmQgYWxsIHRoYXQncyBsZWZ0IGFyZSBBc3BhcmFndXMsIEJlZXRzLCBDYXVsaWZsb3dlciwgRGlsbC4uLmFuZCAyMiBvdGhlciBlcXVhbGx5IHVuYXBwZWFsaW5nIHZlZ2V0YWJsZXMuIFNvIHNoZTogQXRlIG15IGhvbWV3b3JrLCBCaXQgZ3JhbmRtYSwgQ2xhd2VkIHRoZSBjdXJ0YWlucywgRGFtYWdlZCB0aGUgZGlzaGVzLCBhbmQgc28gb24sIHRocm91Z2ggWi4gT25seSB3aGVuIHRhc3RpZXIgdGhpbmdzIGFycml2ZSAoQW4gQXNzb3J0bWVudCBvZiBBbmNob3ZpZXMsIEJ1ZmZhbG8gQnVycml0b3MsIENoaWNrZW4gQ2hlZXNlY2FrZS4uLikgZG9lcyBzaGUgQXBvbG9naXplIHRvIEdyYW5kbWEuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MUMybnhpRExCTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQmFkZ2VyJ3MgRmFuY3kgTWVhbFwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIktlaWtvIEthc3phXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJLZWlrbyBLYXN6YVwiLFxuICAgICAgICBcInllYXJcIjogMjAwOSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQmFkZ2Vyc1wiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkhhdmUgbm90IHJlYWQgeWV0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJCYWRnZXIganVzdCBjYW4/dCBmYWNlIGVhdGluZyB0aGUgc2FtZSBvbGQgYXBwbGVzLCB3b3JtcywgYW5kIHJvb3RzLiBUaGV5P3JlIHRvbyBib3JpbmchIEhlIGRyZWFtcyBvZiBlYXRpbmcgc29tZXRoaW5nIG5ldyBhbmQgZmFuY3kuIEJhZGdlciBnZXRzIHNvbWUgeXVtbXkgaWRlYXMgZnJvbSBzZWVpbmcgdGhlIGFuaW1hbHMgd2hvIGxpdmUgbmVhciBoaXMgZGVuLCBidXQgdGhlIG1haW4gaW5ncmVkaWVudHMgaGUgdHJpZXMgdG8gY2F0Y2ggYXJlbj90IHNvIGVhZ2VyIHRvIGJlY29tZSBoaXMgbHVuY2guIEFuZCBpbiB0aGUgZW5kLCB0aGV5IHVud2l0dGluZ2x5IGNvbnZpbmNlIEJhZGdlciB0aGF0IGhlIHNob3VsZCBoYXZlIGFwcHJlY2lhdGVkIHdoYXQgaGUgaGFkIGluIHRoZSBmaXJzdCBwbGFjZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxTFlIOHdsaFNMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJCZWR0aW1lIVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkNocmlzdGluZSBBbmRlcnNvblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiU3RldmVuIFNhbGVybm9cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRG9ncywgSHVtYW5cIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNS0wOS0xMVQwNzowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMyxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkl04oCZcyBiZWR0aW1lLiBCdXQgTWVsYW5pZSBpcyBmYXIgdG9vIGJ1c3kgdG8gc2xlZXAuIFRoZSB0b3dlciBzaGUgaXMgYnVpbGRpbmcgbmVlZHMgdG8gYmUgQklHR0VS4oCUd2hhdCBpZiBlbGVwaGFudHMgY29tZSBvdmVyIHRvIHBsYXk/IFlldCBNb20gaXMganVzdCBhcyBzdHViYm9ybiBhcyBNZWxhbmllLCBhbmQgc29tZWJvZHkgaXMgZ29pbmcgdG8gdGFrZSBhIGJhdGgsIHB1dCBvbiBoZXIgcHJpbmNlc3MgcGFqYW1hcywga2lzcyBEYWRkeSBnb29kbmlnaHQgYW5kIGdldCB1bmRlciB0aGUgY292ZXJzIGZvciBhIGJlZHRpbWUgc3RvcnkuIFRoZSBvbmx5IHF1ZXN0aW9uIGlzOldobz8gV2l0aCBpcnJlc2lzdGlibGUgaWxsdXN0cmF0aW9ucyBieSBTdGV2ZW4gU2FsZXJubywgdGhpcyBoaWxhcmlvdXMgcGljdHVyZSBib29r4oCUYmFzZWQgb24gYSByZWFsIGV2ZW50IGluIHRoZSBhdXRob3LigJlzIGxpZmXigJR3aWxsIGxpZ2h0IGEgbWlzY2hpZXZvdXMgZ2xlYW0gaW4gdGhlIGV5ZXMgb2YgcGFyZW50cyBhbmQgY2hpbGRyZW4gZXZlcnl3aGVyZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxcWNkbVlCRFVMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJCZXR0eSBCdW5ueSBMb3ZlcyBDaG9jb2xhdGUgQ2FrZVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIk1pY2hhZWwgS2FwbGFuXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJTdGVwaGFuZSBKb3Jpc2NoXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDExLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJDYWtlLCBSYWJiaXRzLCBCZWhhdmlvclwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJGcm9tIGhlciBmaXJzdCBiaXRlLCB5b3VuZyBCZXR0eSBCdW5ueSBsaWtlcyBjaG9jb2xhdGUgY2FrZSBzbyBtdWNoIHRoYXQgc2hlIGNsYWltcyBzaGUgd2lsbCBtYXJyeSBpdCBvbmUgZGF5LCBhbmQgc2hlIGhhcyB0cm91YmxlIGxlYXJuaW5nIHRvIHdhaXQgcGF0aWVudGx5IHVudGlsIHNoZSBjYW4gaGF2ZSBoZXIgbmV4dCB0YXN0ZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxaks2eFdhZDhMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJCZXR0eSBCdW5ueSBXYW50cyBFdmVyeXRoaW5nXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTWljaGFlbCBLYXBsYW5cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlN0ZXBoYW5lIEpvcmlzY2hcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTIsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlJhYmJpdHMsIFNob3BwaW5nLCBBdmFyaWNlLCBGYW1pbHlcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkJldHR5IEJ1bm55J3MgbW90aGVyIHRha2VzIGhlciBhbmQgaGVyIHNpYmxpbmdzIHRvIGEgdG95IHN0b3JlLCB3aGVyZSBlYWNoIGlzIGFsbG93ZWQgdG8gcGljayBvdXQgb25lIGl0ZW0sIGJ1dCBCZXR0eSByZWZ1c2VzIHRvIGNob29zZSBqdXN0IG9uZSBhbmQgdGhyb3dzIGEgdGFudHJ1bSB3aGVuIHNoZSBsZWFybnMgdGhlIGFsdGVybmF0aXZlIGlzIHRvIGdldCBub3RoaW5nLiBCZXR0eSBCdW5ueSdzIG1vdGhlciB0YWtlcyBoZXIgYW5kIGhlciBzaWJsaW5ncyB0byBhIHRveSBzdG9yZSB3aGVyZSBlYWNoIGlzIGFsbG93ZWQgdG8gcGljayBvdXQgb25lIGl0ZW0sIGJ1dCBCZXR0eSByZWZ1c2VzIHRvIGNob29zZSBqdXN0IG9uZSBhbmQgdGhyb3dzIGEgdGFudHJ1bSB3aGVuIHNoZSBsZWFybnMgdGhlIGFsdGVybmF0aXZlIGlzIHRvIGdldCBub3RoaW5nLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFIb1h3SkNzeUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkJpbGx5J3MgQm9vZ2VyXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJBIE1lbW9pclwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIldpbGxpYW0gSm95Y2VcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIldpbGxpYW0gSm95Y2VcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQ29udGVzdCwgSW1hZ2luYXRpb24sIFNjaG9vbFwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTA0LTAyVDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgTm90IExpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJCaWxseSBsb3ZlcyB0byBkcmF3LiBIZSBkcmF3cyBvbiBib29rcyBhbmQgb24gaGlzIGhvbWV3b3JrIGFuZCBldmVuIG9uIGhpcyBtYXRoIHRlc3RzIGhlIG1pZ2h0IG5vdCBnZXQgdGhlIGFuc3dlciByaWdodCwgYnV0IGRvZXNuIHQgaXQgbG9vayBzd2VsbCBzaXR0aW5nIGluIGEgYm9hdCBhdCBzZWE/IEhpcyB0ZWFjaGVyIGRvZXNuIHQgdGhpbmsgc28sIGFuZCBuZWl0aGVyIGRvZXMgdGhlIHByaW5jaXBhbC4gQnV0IHRoZSBsaWJyYXJpYW4gaGFzIGFuIGlkZWEgdGhhdCBqdXN0IG1pZ2h0IGhlbHAgQmlsbHkgYmV0dGVyIGRpcmVjdCBoaXMgaWxsdXN0cmF0aXZlIGVuZXJnaWVzOiBhIGJvb2stbWFraW5nIGNvbnRlc3QhIEJpbGx5IGdldHMgcmlnaHQgdG8gd29yaywgcmVhZGluZyBldmVyeXRoaW5nIGhlIGNhbiBhYm91dCBtZXRlb3JzLCBteXRob2xvZ3ksIHNwYWNlIHRyYXZlbCwgYW5kIG11Y3VzP1wiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvQTF0N3k2MlNjMkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkJvLUxhLUxhIFdpdGNoIFNwYVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlNhbWFudGhhIEJlcmdlclwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiSXNhYmVsIFJveGFzXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJXaXRjaGVzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMjNUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxvdmVkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAzLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSGFsbG93ZWVuIGlzIHRoZSBtb3N0IGltcG9ydGFudCBkYXkgb2YgdGhlIHllYXIgZm9yIGFueSB3aXRjaC4gU28gd2hlbiB0aGUgaG9saWRheSBlbmRzIGFuZCB0aGUgd2l0Y2hlcyBhcmUgdGlyZWQgZnJvbSB0cmlja2luZyBhbmQgdHJlYXRpbmcsIHRoZXkgYWxsIGhlYWQgdG8gdGhlIGZhLWJvbyBXaXRjaCBTcGEuIEhlcmUgdGhleSBpbmR1bGdlIGluIEJhdC1XaGlza2VyIFRlYSwgQnJvb20gQnJpc3RsZSBGYWNpYWxzLCBhbmQgb3RoZXIgc3Bvb2t5IHNwYSBnb29kaWVzLiBBIHRyaXAgdG8gdGhlIFdpdGNoIFNwYSBpcyBzdXJlIHRvIG1ha2UgYW55IHdpdGNoIG9yIHdhcmxvY2sgZmVlbCByZWZyZXNoZWQsIHJldml2ZWQsIGFuZCBwb3NpdGl2ZWx5IHJldm9sdGluZy5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxTXMxVSs2T01MLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJCb2IgdGhlIERvZ1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlJvZHJpZ28gRm9sZ3VlaXJhLCBQb2x5IEJlcm5hdGVuZVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiUm9kcmlnbyBGb2xndWVpcmEsIFBvbHkgQmVybmF0ZW5lXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDExLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJEb2dzLCBPd2xzLCBSYWJiaXRzLCBDYXRzXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDMsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJCb2IgdGhlIERvZyBhbmQgTWFyayBhcmUgcGxheWluZyBpbiB0aGUgcGFyayBvbmUgZGF5IHdoZW4gQm9iIHN3YWxsb3dzIGEgeWVsbG93IGNhbmFyeS4gV2hhdCB3aWxsIHRoZXkgZG8/IFRoaXMgd2hpbXNpY2FsIHRhbGUgYW5kIGl0cyBjYXN0IG9mIGZyaWVuZGx5IGNoYXJhY3RlcnMgd2lsbCBkZWxpZ2h0IHlvdW5nIHJlYWRlcnMgYW5kIGFkdWx0cyBhbGlrZSEgVGhpcyBwaWN0dXJlIGJvb2sgZmVhdHVyZXMgdmlicmFudCBmdWxsLWNvbG9yIGlsbHVzdHJhdGlvbnMuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MXZLenhHT0R4TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQm9vdCAmIFNob2VcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJNYXJsYSBGcmF6ZWVcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIk1hcmxhIEZyYXplZVwiLFxuICAgICAgICBcInllYXJcIjogMjAxMixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRG9nc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTEyLTMxVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAzLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQm9vdCBhbmQgU2hvZSBhcmUgZG9ncyB0aGF0IGxpdmUgaW4gdGhlIHNhbWUgaG91c2UsIGVhdCBmcm9tIHRoZSBzYW1lIGJvd2wsIGFuZCBzbGVlcCBpbiB0aGUgc2FtZSBiZWQgYnV0IHNwZW5kIHRoZWlyIGRheXMgb24gc2VwYXJhdGUgcG9yY2hlcywgdW50aWwgYSBzcXVpcnJlbCBtaXhlcyB0aGluZ3MgdXAuIEJvb3QgYW5kIFNob2UgYXJlIGRvZ3MgdGhhdCBsaXZlIGluIHRoZSBzYW1lIGhvdXNlLCBlYXQgZnJvbSB0aGUgc2FtZSBib3dsLCBhbmQgc2xlZXAgaW4gdGhlIHNhbWUgYmVkIGJ1dCBzcGVuZCB0aGVpciBkYXlzIG9uIHNlcGFyYXRlIHBvcmNoZXMgdW50aWwgYSBzcXVpcnJlbCBtaXhlcyB0aGluZ3MgdXAuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy80MXZLWTFmcGsrTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQm95ICsgQm90XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQW1lIER5Y2ttYW5cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkRhbiBZYWNjYXJpbm9cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTIsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiUm9ib3RzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMTItMzFUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJPbmUgZGF5LCBhIGJveSBhbmQgYSByb2JvdCBtZWV0IGluIHRoZSB3b29kcy4gVGhleSBwbGF5LiBUaGV5IGhhdmUgZnVuLiBCdXQgd2hlbiBCb3QgZ2V0cyBzd2l0Y2hlZCBvZmYsIEJveSB0aGlua3MgaGUncyBzaWNrLiBUaGUgdXN1YWwgcmVtZWRpZXPigJRhcHBsZXNhdWNlLCByZWFkaW5nIGEgc3RvcnnigJRkb24ndCBoZWxwLCBzbyBCb3kgdHVja3MgdGhlIHNpY2sgQm90IGluLCB0aGVuIGZhbGxzIGFzbGVlcC4gQm90IGlzIHdvcnJpZWQgd2hlbiBoZSBwb3dlcnMgb24gYW5kIGZpbmRzIGhpcyBmcmllbmQgcG93ZXJlZCBvZmYuIEhlIHRha2VzIEJveSBob21lIHdpdGggaGltIGFuZCB0cmllcyBhbGwgaGlzIHJlbWVkaWVzOiBvaWwsIHJlYWRpbmcgYW4gaW5zdHJ1Y3Rpb24gbWFudWFsLiBOb3RoaW5nIHJldml2ZXMgdGhlIG1hbGZ1bmN0aW9uaW5nIEJveSEgQ2FuIHRoZSBJbnZlbnRvciBoZWxwIGZpeCBoaW0/XCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MXZnUHBSdmVkTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQnJ1bm8gTXVuYXJpJ3MgWm9vXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQnJ1bm8gTXVuYXJpXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJCcnVubyBNdW5hcmlcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlpvb1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTI2VDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAzLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSWxsdXN0cmF0aW9ucyBhbmQgYnJpZWYgdGV4dCBpbnRyb2R1Y2UgbW9yZSB0aGFuIHR3ZW50eSB6b28gYW5pbWFscywgaW5jbHVkaW5nIGEgcmhpbm9jZXJvcyB0aGF0IGlzIGFsd2F5cyByZWFkeSB0byBmaWdodCBhbmQgYSBrYW5nYXJvbyB0aGF0IGlzIGFsbCBsZWdzIGJ1dCBkb2Vzbid0IGtub3cgaXQuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MUs1ZkFkLTdxTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQnVnIGluIEEgVmFjdXVtXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTWVsYW5pZSBXYXR0XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJNZWxhbmllIFdhdHRcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkZsaWVzLCBJbnNlY3RzLCBWYWN1bW0gQ2xlYW5lcnNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0xMlQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTG92ZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogNixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkEgYnVnIGZsaWVzIHRocm91Z2ggYW4gb3BlbiBkb29yIGludG8gYSBob3VzZSwgdGhyb3VnaCBhIGJhdGhyb29tLCBhY3Jvc3MgYSBraXRjaGVuIGFuZCBiZWRyb29tIGFuZCBpbnRvIGEgbGl2aW5nIHJvb20gLi4uIHdoZXJlIGl0cyBlbnRpcmUgbGlmZSBjaGFuZ2VzIHdpdGggdGhlIHN3aXRjaCBvZiBhIGJ1dHRvbi4gU3Vja2VkIGludG8gdGhlIHZvaWQgb2YgYSB2YWN1dW0gYmFnLCB0aGlzIG9uZSBsaXR0bGUgYnVnIG1vdmVzIHRocm91Z2ggZGVuaWFsLCBiYXJnYWluaW5nLCBhbmdlciwgZGVzcGFpciBhbmQgZXZlbnR1YWxseSBhY2NlcHRhbmNlIC0tIHRoZSBmaXZlIHN0YWdlcyBvZiBncmllZiAtLSBhcyBpdCBjb21lcyB0byB0ZXJtcyB3aXRoIGl0cyBmYXRlLiBXaWxsIHRoZXJlIGJlIGEgbGlnaHQgYXQgdGhlIGVuZCBvZiB0aGUgdHVubmVsPyBXaWxsIHRoZXJlIGJlIGR1c3QgYnVubmllcyBpbiB0aGUgdm9pZD8gQSBmdW5ueSwgc3VzcGVuc2VmdWwgYW5kIHBvaWduYW50IGxvb2sgYXQgdGhlIHRyYXZhaWxzIG9mIGEgYnVnIHRyYXBwZWQgaW4gYSB2YWN1dW0uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MWJZSnI5Ym0tTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQnVubmllcyEhIVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIktldmFuIEF0dGViZXJyeVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiS2V2YW4gQXR0ZWJlcnJ5XCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJSYWJiaXRzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMTAtMTBUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAzLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3RvcnkgdGltZSBmb3IgbGl0dGxlIG9uZXMgaGFzIG5ldmVyIGJlZW4gdGhpcyBleGNpdGluZyEgV2hlbiBhIGZyaWVuZGx5IG1vbnN0ZXIgc3BvdHMgYSBncm91cCBvZiBidW5uaWVzIGluIHRoZSB3b29kcywgaGlzIGRlbGlnaHQgaXMgY29udGFnaW91cyEgQW5kIHdoZW4gdGhleSdyZSBnb25lLCBob3cgaGUgbWlzc2VzIHRoZW0gc28hIFdpdGggYnJpZ2h0IGlsbHVzdHJhdGlvbnMgYW5kIGEgc2ltcGxlIHRleHQsIHRoaXMgaXMgdGhlIG1vc3QgZnVuIHR5cGUgb2YgcmVhZCBhbG91ZCBhbmQgb25lIHRoYXQgbWlycm9ycyBtb3N0IGV2ZXJ5IHRvZGRsZXIncyBlbW90aW9uYWwgbGlmZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzkxaFJ4ZmtteXlMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJCdXN0ZXIgdGhlIExpdHRsZSBHYXJiYWdlIFRydWNrXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTWFyY2lhIEJlcm5lZ2VyXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJLZXZpbiBaaW1tZXJcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkZlYXJzLCBUcnVja3NcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMy0xMVQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQnVzdGVyIGlzIGEgc3dlZXQgbGl0dGxlIGdhcmJhZ2UgdHJ1Y2suIEhlIGNhbid0IHdhaXQgdG8gZ3JvdyB1cCB0byBiZSBhIGJpZyB0cnVjaywganVzdCBsaWtlIGhpcyBmYXRoZXIuIEJ1c3RlciBwcmFjdGljZXMgZHJpdmluZyBhbmQgbGlmdGluZyBhbmQgYmVlcGluZyB3aXRoIGhpcyBmcmllbmQsIEtpdHR5LiBUaGVyZSdzIG9uZSBzbWFsbCBwcm9ibGVtLiBMb3VkIG5vaXNlcyBmcmlnaHRlbiBCdXN0ZXIuIFdoZW4gaGlzIGZhdGhlciB0YWtlcyBoaW0gdG8gdGhlIHRydWNrIHlhcmQgdG8gbWVldCB0aGUgb3RoZXIgdmVoaWNsZXMsIHRoZWlyIGFpci1ob3JuIGJsYXN0cyBhbmQgcm9hcmluZyBlbmdpbmVzIHNlbmQgQnVzdGVyIHNraWRkaW5nIGF3YXkgdG8gaGlkZS4gSGUgd2FudHMgdG8gYmUgYmlnIGFuZCBicmF2ZSwgYnV0IGhvdyBjYW4gaGUgd29yayB3aXRoIERhZGR5IGFuZCBoaXMgZnJpZW5kcyB3aGVuIHRoZWlyIGxvdWQgc291bmRzIHNjYXJlIGhpbT8gQnVzdGVyIGZlZWxzIHRlcnJpYmxlLiBXaGVuIEtpdHR5IGdldHMgaW50byB0cm91YmxlLCBsaXR0bGUgQnVzdGVyIG11c3RlcnMgdXAgaGlzIGNvdXJhZ2UgdG8gc2F2ZSBoZXIuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MW0wcDVTNmUxTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQnkgTW91c2UgJiBGcm9nXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRGVib3JhaCBGcmVlZG1hblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiRGVib3JhaCBGcmVlZG1hblwiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRnJvZ3MsIE1pY2VcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMy0xMVQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNCBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiRmFzdGlkaW91cyBNb3VzZSBoYXMgb25lIGlkZWEgYWJvdXQgaG93IHRvIHRlbGwgYSBzdG9yeS4gRnJlZS1zcGlyaXRlZCBGcm9nIGhhcyBhbm90aGVyLiBXaGF0IGhhcHBlbnMgd2hlbiBGcm9nIGNyYXNoZXMgaW50byBNb3VzZSdzIHN0b3J5IHdpdGggc29tZSB3aWxkIGlkZWFzPyBDaGFvcyEuLi5mb2xsb3dlZCBieSB0aGUgZGlzY292ZXJ5IHRoYXQgd29ya2luZyB0b2dldGhlciBtZWFucyBiZWluZyB3aWxsaW5nIHRvIGNvbXByb21pc2XigJRhbmQgdGhhdCBsaXN0ZW5pbmcgdG8gb25lIGFub3RoZXIgY2FuIGxlYWQgdG8gdGhlIG1vc3QgYmVhdXRpZnVsIHN0b3JpZXMgb2YgYWxsLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTEwYzZabmdqLUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkNhbHZpbiwgTG9vayBPdXQhXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJBIEJvb2t3b3JtIEJpcmRpZSBHZXRzIEdsYXNzZXNcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJKZW5uaWZlciBCZXJuZVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiS2VpdGggQmVuZGlzXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJPd2xzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDItMTJUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkJ1dCB3aGVuIEJvdCBnZXRzIHN3aXRjaGVkIG9mZiwgQm95IHRoaW5rcyBoZSdzIHNpY2suIFRoZSB1c3VhbCByZW1lZGllc+KAlGFwcGxlc2F1Y2UsIHJlYWRpbmcgYSBzdG9yeeKAlGRvbid0IGhlbHAsIHNvIEJveSB0dWNrcyB0aGUgc2ljayBCb3QgaW4sIHRoZW4gZmFsbHMgYXNsZWVwLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFaaG9STktOMEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkNhbXAgUmV4XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTW9sbHkgSWRsZVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiTW9sbHkgSWRsZVwiLFxuICAgICAgICBcInllYXJcIjogMjAxNCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkRpbm9zYXVyc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJEaW5vc2F1cnNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNS0wOS0xOVQwNzowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNCBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSXTigJlzIGltcG9ydGFudCB0byBzZXQgYSBmZXcgd2lsZGVybmVzcyBzYWZldHkgZ3VpZGVsaW5lcyBmaXJzdC4gLiAuIGxpa2UgbWFraW5nIHN1cmUgaGUgc3RheXMgb24gdGhlIHRyYWlsLiBBbmQgZG9lcyBub3QgZGlzdHVyYiB0aGUgbG9jYWwgd2lsZGxpZmUuIEFuZCBrbm93cyBob3cgdG8gYnVpbGQgYSBzYWZlIGNhbXBmaXJlLiBCdXQgc29tZXRpbWVzIGRpbm9zYXVycyBoYXZlIGEgZGlmZmVyZW50IHdheSBvZiBkb2luZyB0aGluZ3MsIGFuZCB0aGF04oCZcyB3aHkgaXTigJlzIGJlc3QgdG8gYmUgcHJlcGFyZWQgLiAuIC4gZm9yIGFueXRoaW5nISBDb3JkZWxpYSBhbmQgaGVyIHRyb3VwIG9mIGRpbm8tc2NvdXRzIGVuam95IGEgY2FtcGluZyB0cmlwIGluIHRoZSBncmVhdCBvdXRkb29ycy5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxcjVISzNDSmJMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJDYW4gWW91IE1ha2UgQSBTY2FyeSBGYWNlP1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkphbiBUaG9tYXNcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkphbiBUaG9tYXNcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDksXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkluc2VjdHMsIExhZHlidWdcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNS0wOC0yMFQwNzowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkJvdCBpcyB3b3JyaWVkIHdoZW4gaGUgcG93ZXJzIG9uIGFuZCBmaW5kcyBoaXMgZnJpZW5kIHBvd2VyZWQgb2ZmLiBIZSB0YWtlcyBCb3kgaG9tZSB3aXRoIGhpbSBhbmQgdHJpZXMgYWxsIGhpcyByZW1lZGllczogb2lsLCByZWFkaW5nIGFuIGluc3RydWN0aW9uIG1hbnVhbC4gTm90aGluZyByZXZpdmVzIHRoZSBtYWxmdW5jdGlvbmluZyBCb3khIENhbiB0aGUgSW52ZW50b3IgaGVscCBmaXggaGltP1wiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFtZjRYSXdGVkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkNhcm5pdm9yZXNcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJBYXJvbiBSZXlub2xkc1wiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiRGFuIFNhbnRhdFwiLFxuICAgICAgICBcInllYXJcIjogMjAxMyxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQ2x1YnMsIENhcm5pdm9yZXMsIEZvb2QgQ2hhaW5zXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkEgbGlvbiwgYSBncmVhdCB3aGl0ZSBzaGFyaywgYW5kIGEgdGltYmVyIHdvbGYsIGFsbCBtZWF0LWVhdGVycyB3aG8gaGF2ZSBiZWVuIGh1cnQgYnkgdGhlIGNydWVsdHkgb2YgcGxhbnQtZWF0ZXJzLCBmb3JtIGEgc3VwcG9ydCBncm91cCB0aGF0IGhhcyBsaW1pdGVkIHN1Y2Nlc3MgdW50aWwgdGhlaXIgbmV3ZXN0IG1lbWJlciwgYSBncmVhdCBob3JuZWQgb3dsLCBzaGFyZXMgc29tZSBhZHZpY2UuIEEgbGlvbiwgYSBncmVhdCB3aGl0ZSBzaGFyaywgYW5kIGEgdGltYmVyIHdvbGYsIGFsbCBtZWF0LWVhdGVycyB3aG8gaGF2ZSBiZWVuIGh1cnQgYnkgdGhlIGNydWVsdHkgb2YgcGxhbnQtZWF0ZXJzLCBmb3JtIGEgc3VwcG9ydCBncm91cCB3aGljaCBoYXMgbGltaXRlZCBzdWNjZXNzIHVudGlsIHRoZWlyIG5ld2VzdCBtZW1iZXIsIGEgZ3JlYXQgaG9ybmVkIG93bCwgc2hhcmVzIHNvbWUgYWR2aWNlLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNzF1U2pWVlBNMUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkNhdGNoIFRoYXQgQ29va2llIVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkhhbGxpZSBEdXJhbmRcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkRhdmlkIFNtYWxsXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlNjaG9vbFwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTIxVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNYXJzaGFsbCBrbm93cyBvbmUgdGhpbmcgZm9yIHN1cmUsIGRlc3BpdGUgd2hhdCBhbGwgdGhlIHN0b3JpZXMgc2F5OiBHaW5nZXJicmVhZCBtZW4gY2Fubm90IHJ1bi4gQ29va2llcyBhcmUgZm9yIGVhdGluZywgYW5kIGhlIGNhbid0IHdhaXQgdG8gZWF0IGhpcyBhZnRlciBzcGVuZGluZyBhbGwgbW9ybmluZyBiYWtpbmcgdGhlbSB3aXRoIGhpcyBjbGFzcy4gQnV0IHdoZW4gaXQncyB0aW1lIHRvIHRha2UgdGhlIGdpbmdlcmJyZWFkIG1lbiBvdXQgb2YgdGhlIG92ZW4gLiAuIC4gdGhleSdyZSBnb25lISBOb3csIHRvIGZpbmQgdGhvc2Ugcm9ndWUgY29va2llcywgTWFyc2hhbGwgYW5kIGhpcyBjbGFzcyBoYXZlIHRvIHNvbHZlIGEgc2VyaWVzIG9mIHJoeW1pbmcgY2x1ZXMuIEFuZCBNYXJzaGFsbCBqdXN0IG1pZ2h0IGhhdmUgdG8gcmV0aGluayBoaXMgc3RhbmNlIG9uIG1hZ2ljLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFsUTRoYkZJbkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkNoYXJsb3R0ZSBKYW5lIEJhdHRsZXMgQmVkdGltZSFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJNeXJhIFdvbGZlXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJNYXJpYSBNb25lc2NpbGxvXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDExLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlBhcmVudHMsIENoaWxkLCBQaXJhdGVzLCBTbGVlcFwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQ2hhcmxvdHRlIEphbmUgdGhlIEhlYXJ0eSBnZXRzIGFsbCB0aGUganVpY2Ugb3V0IG9mIGhlciBkYXlzIHdpdGggcGlyYXRlLWdpcmwgcGl6emF6eiEgU2hlIGxvdmVzIHN3YXNoYnVja2xpbmcgc2Vzc2lvbnMsIHRyZWFzdXJlIGh1bnRzLCBhbmQgRmFudGFzdGljIEZlYXRzIG9mIERhcmluZ+KAlGFsbCBvZiB3aGljaCBwcm92ZSBzaGUgaGFzZm9ybWlkYWJsZSBvb21waC4gVGhlcmXigJlzIGFic29sdXRlbHkgbm8gcm9vbSBpbiBoZXIgZGF5IGZvciBiZWR0aW1lLiBCdXQgY2FuIENoYXJsb3R0ZSBKYW5lIHJlZnVzZSB0byBzbm9vemUgYW5kIHN0aWxsIGJlIGhlciBoZWFydHkgcGlyYXRlIHNlbGY/XCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy80MTVDZS1Ya3R2TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQ2hpY2tlbiBCaWchXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiS2VpdGggR3JhdmVzXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJLZWl0aCBHcmF2ZXNcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTQsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkNoaWNrZW5zLCBTaXplXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMyxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk9uIGEgdGVlbnkgbGl0dGxlIGZhcm0sIGluIGFuIGl0dHktYml0dHkgY29vcCwgYSB2ZXJ5IHNtYWxsIGhlbiBsYWlkIGEgYmlnLCBnaWFudCBlZ2cuIEFuZCBvdXQgb2YgdGhpcyBlZ2cgY2FtZSBvbmUgYmlnLCBodW1vbmdvdXMgLiAuIC4gc29tZXRoaW5nLiBObyBtYXR0ZXIgaG93IHRoZXkgdHJ5LCB0aGVzZSBjbHVlbGVzcyBjaGlja2VucyBjYW4ndCBtYWtlIHNlbnNlIG9mIHRoZSBnaWdhbnRpYyBuZXcgbWVtYmVyIG9mIHRoZWlyIGZhbWlseeKAlHVudGlsIGhlIHNhdmVzIHRoZSBkYXkuIFdpdGggd2Fja3ksIGxhdWdoLW91dC1sb3VkIGh1bW9yIGFuZCBzaWxsaW5lc3MgdG8gc3BhcmUsIHRoaXMgQklHIHR3aXN0IG9uIHRoZSBjbGFzc2ljIENoaWNrZW4gTGl0dGxlIHN0b3J5IGxlbmRzIGEgd2hvbGUgbmV3IHBlcnNwZWN0aXZlIHRvIHdoYXQgaXQgbWVhbnMgdG8gYmUgY2hpY2tlbi5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxZFFtdHlWUTFMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJDaGlja3MgUnVuIFdpbGRcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJTdWRpcHRhIEJhcmRoYW4tUXVhbGxlblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiV2FyZCBKZW5raW5zXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDExLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJDaGlja2Vuc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTEwLTEwVDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIldoZW4gTWFtYSBDaGljayBraXNzZXMgaGVyIGtpZHMgZ29vZG5pZ2h0LCBzaGUgZXhwZWN0cyB0aGVtIHRvIHN0YXkgaW4gYmVkLCBidXQgdGhvc2UgY2hpY2tzLi4ucnVuLi4ud2lsZCEgVGhleSBqdW1wIGFyb3VuZCBhbmQgZG8gY2FydHdoZWVscywgdW50aWwgTWFtYSBjb21lcyBpbiBhbmQgc2F5cyBcXFwiWW91J3JlIGFsbCBpbiB0cm91YmxlLiBCdXQgd2hlbiBzaGUgdHVybnMgb3V0IHRoZSBsaWdodHMuLi50aGV5IHN0YXJ0IGEgcGlsbG93IGZpZ2h0ISBGaW5hbGx5LCBNYW1hIGdldHMgdGhlbSBzZXR0bGVkLCBidXQgc2hlJ3Mgbm90IHJlYWR5IGZvciBiZWQgZWl0aGVyIVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFXdERrRmo4cUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkNoaWxkcmVuIE1ha2UgVGVycmlibGUgUGV0c1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlBldGVyIEJyb3duXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJQZXRlciBCcm93blwiLFxuICAgICAgICBcInllYXJcIjogMjAxMCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQmVhcnMsIENoaWxkcmVuXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMTAtMTBUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDMsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaGVuIEx1Y3ksIGEgeW91bmcgYmVhciwgZGlzY292ZXJzIGEgYm95IGluIHRoZSB3b29kcywgc2hlJ3MgYWJzb2x1dGVseSBkZWxpZ2h0ZWQuIFNoZSBicmluZ3MgaGltIGhvbWUgYW5kIGJlZ3MgaGVyIG1vbSB0byBsZXQgaGVyIGtlZXAgaGltLCBldmVuIHRob3VnaCBoZXIgbW9tIHdhcm5zLCBcXFwiQ2hpbGRyZW4gbWFrZSB0ZXJyaWJsZSBwZXRzLlxcXCIgQnV0IG1vbSByZWxlbnRzLCBhbmQgTHVjeSBnZXRzIHRvIG5hbWUgaGVyIG5ldyBwZXQgU3F1ZWFrZXIuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MU1wOFNOdG5GTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQ2luZGVyZWxsYSdzIFN0ZXBzaXN0ZXIgYW5kIHRoZSBCaWcgQmFkIFdvbGZcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJMb3JyYWluZSBDYXJleVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiTWlneSBCbGFuY29cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRmFpeXRhbGVzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMTAtMTBUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNvLCB5b3UgdGhpbmsgeW91IGtub3cgdGhlIHN0b3J5IG9mIENpbmRlcmVsbGE/IFdlbGwsIHlvdSdkIGJldHRlciB0aGluayBhZ2FpbiBiZWNhdXNlIGluIHRoaXMgaGlsYXJpb3VzIHRhbGUsIG5vdGhpbmcgaXMgd2hhdCBpdCBzZWVtcy4gRGlkIHlvdSBrbm93IHRoYXQgQ2luZGVyZWxsYSB3YXNuJ3QgYWN0dWFsbHkgdmVyeSBuaWNlPyBBbmQgdGhhdCB0aGVyZSB3ZXJlIHRocmVlIFVnbHkgc3RlcHNpc3RlcnM/IEFuZCB0aGF0IHRoZSB5b3VuZ2VzdCBzaXN0ZXIsIEdlcnRpZSwgd2FzIGFic29sdXRlbHkgdGhlIG5pY2VzdCBwZXJzb24geW91IGNvdWxkIGV2ZXIgaG9wZSB0byBtZWV0PyBCdXQgc2hlJ2xsIGhhdmUgdG8gYWN0IG1lYW4gYW5kIGJhZCBsaWtlIHRoZSByZXN0IG9mIGhlciBmYW1pbHkgaWYgc2hlIHdhbnRzIHRvIGdvIHRvIHRoZSBiYWxsLiBXaXRoIHRoZSBoZWxwIG9mIHNvbWUgZmF2b3JpdGUgZmFpcnktdGFsZSBjaGFyYWN0ZXJzLCBjYW4gc2hlIGxlYXJuIGhvdyB0byBmaXQgaW4gd2l0aCBoZXIgZmFtaWx5IGluIHRpbWU/XCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MXZiTithekhJTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQ2xhcmsgdGhlIFNoYXJrXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQnJ1Y2UgSGFsZVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiR3V5IEZyYW5jaXNcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTMsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlNoYXJrc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAxLTIzVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkNsYXJrIGZpbmRzIGV2ZXJ5dGhpbmcgYWJvdXQgc2Nob29sIGZ1biBhbmQgZXhjaXRpbmcsIGJ1dCBoaXMgZW50aHVzaWFzbSBjYXVzZXMgcHJvYmxlbXMgdW50aWwgaGUgYmVnaW5zIGludmVudGluZyByaHltZXMgdG8gcmVtaW5kIGhpbXNlbGYgdG8gc3RheSBjb29sIGF0IHNjaG9vbC4gQ2xhcmsgZmluZHMgZXZlcnl0aGluZyBhYm91dCBzY2hvb2wgZnVuIGFuZCBleGNpdGluZywgYnV0IGhpcyBlbnRodXNpYXNtIGNhdXNlcyBwcm9ibGVtcyB3aGVuIGhlIGJlZ2lucyBpbnZlbnRpbmcgcmh5bWVzIHRvIHJlbWluZCBoaW1zZWxmIHRvIHN0YXkgY29vbCBhdCBzY2hvb2wuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MXZjcW1YZXVnTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQ29jay1hLWRvb2RsZS1kb28tYm9wIVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIk1pY2hhZWwgSWFuIEJsYWNrXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJNYXR0IE15ZXJzXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJSb29zdGVycywgRmFybSBMaWZlXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCBsaWtlXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTWVsIHRoZSByb29zdGVyIHMgYm9yaW5nIG9sZCBjb2NrLWEtZG9vZGxlLWRvbyBpcyBtYWtpbmcgaGltIGNvY2stYS1kb29kbGUtYmx1ZSB1bnRpbCBvbmUgZGF5IGhlIGRlY2lkZXMgdG8gamF6eiBpdCB1cCB3aXRoIHNvbWV0aGluZyBicmFuZC1uZXc6IHRoZSBjb2NrLWEtZG9vZGxlLWRvby1ib3AhIEJ1dCB3aGlsZSBNZWwgc2NhdHMgYW5kIHRydW1wZXRzIGF3YXkgdG8gaGlzIHJldmlzZWQgcmVmcmFpbiwgdGhlIHJlc3Qgb2YgdGhlIGJhcm55YXJkIGlzbiB0IGdldHRpbmcgaW50byB0aGUgZ3Jvb3ZlLiBCZWNhdXNlIHRoZXkgd2FudCB0aGUgc3VuLCBhbmQgdGhlIHN1biB3b24gdCByaXNlIHRvIE1lbCBzIGNyZWF0aXZlIGludGVycHJldGF0aW9uIG9mIGhpcyBzdGFuZGFyZCBjb2NrLWEtZG9vZGxlLWNyb3cuIFNvIHRoZSBiYXJueWFyZCByZXNpZGVudHMgd2lsbCBoYXZlIHRvIGJhbmQgdG9nZXRoZXIgYW5kIGNvbXByb21pc2UgdG8gYnJpbmcgYWJvdXQgYSBmcmVzaCBkYXkgaW4gYSBmcmVzaCB3YXkhXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy85MWtpSFpia0NyTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQ29yZHVyb3lcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJEb24gRnJlZWRtYW5cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkRvbiBGcmVlZG1hblwiLFxuICAgICAgICBcInllYXJcIjogMjAwOCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQmVhcnNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0xMlQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJEb24gRnJlZW1hbidzIGNsYXNzaWMgY2hhcmFjdGVyLCBDb3JkdXJveSwgaXMgZXZlbiBtb3JlIHBvcHVsYXIgdG9kYXkgdGhlbiBoZSB3YXMgd2hlbiBoZSBmaXJzdCBjYW1lIG9uIHRoZSBzY2VuZSBpbiAxOTY4LiBUaGlzIHN0b3J5IG9mIGEgc21hbGwgdGVkZHkgYmVhciB3YWl0aW5nIG9uIGEgZGVwYXJ0bWVudCBzdG9yZSBzaGVsZiBmb3IgYSBjaGlsZOKAmXMgZnJpZW5kc2hpcCBoYXMgYXBwZWFsZWQgdG8geW91bmcgcmVhZGVycyBnZW5lcmF0aW9uIGFmdGVyIGdlbmVyYXRpb24uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MThJdERWU1JyTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQ291bnQgdGhlIE1vbmtleXNcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJNYXJjIEJhcm5uZXR0XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJLZXZpbiBDb3JuZWxsXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEzLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJNb25rZXlzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMTAtMTBUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiS2lkcyB3aWxsIGdpZ2dsZSBhcyB0aGV5IGNvdW50IGFsbCB0aGUgYW5pbWFscyB0aGF0IGhhdmUgZnJpZ2h0ZW5lZCB0aGUgbW9ua2V5cyBvZmYgdGhlIHBhZ2VzLiBGdWxsIG9mIGZ1biByZWFkZXIgaW50ZXJhY3Rpb25zIGFuZCBrZWVwcyByZWFkZXJzIGd1ZXNzaW5nIHVudGlsIHRoZSB2ZXJ5IGxhc3QgcGFnZSEgTWF0Y2hpbmcgTWFjIEJhcm5ldHQncyBicmlsbGlhbnQgd2l0IGFyZSBLZXZpbiBDb3JuZWxsJ3MgbHVtaW5vdXMgaWxsdXN0cmF0aW9ucywgd2hpY2ggd2lsbCBoYXZlIHlvdW5nIHJlYWRlcnMgYmVnZ2luZyB0byBjb3VudCB0aGUgbW9ua2V5cyBhbGwgb3ZlciBhZ2Fpbi5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxN0NmRU9WTzZMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJDb3VudGluZyBDcm9jb2RpbGVzXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSnVkeSBTaWVycmFcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIldpbGwgSGlsbGVuYnJhbmRcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDEsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkNyb2NvZGlsZXMsIE1vbmtleXMsIENvdW50aW5nLCBGb2xrbG9yZVwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQnkgdXNpbmcgaGVyIGFiaWxpdHkgdG8gY291bnQsIGEgY2xldmVyIG1vbmtleSBvdXR3aXRzIHRoZSBodW5ncnkgY3JvY29kaWxlcyB0aGF0IHN0YW5kIGJldHdlZW4gaGVyIGFuZCBhIGJhbmFuYSB0cmVlIG9uIGFub3RoZXIgaXNsYW5kIGFjcm9zcyB0aGUgc2VhLiBJbiB0aGlzIHJoeW1lZCByZXRlbGxpbmcgb2YgYSB0cmFkaXRpb25hbCBBc2lhbiB0YWxlLCBhIGNsZXZlciBtb25rZXkgdXNlcyBoZXIgYWJpbGl0eSB0byBjb3VudCB0byBvdXR3aXQgdGhlIGh1bmdyeSBjcm9jb2RpbGVzIHRoYXQgc3RhbmQgYmV0d2VlbiBoZXIgYW5kIGEgYmFuYW5hIHRyZWUgb24gYW5vdGhlciBpc2xhbmQgYWNyb3NzIHRoZSBzZWEuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MVNQSVdtRXVzTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiQ293Ym95IEJveWQgYW5kIE1pZ2h0eSBDYWxsaW9wZVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkxpc2EgTW9zZXJcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlNlYmFzdGlhYW4gVmFuIERvbmluY2tcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTMsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQ293Ym95cywgUmhpbm9jZXJvc2VzLCBSYW5jaCwgQW5pbWFsc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAzLTExVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJBIGNvd2JveSBhbmQgaGlzIHRydXN0eSByaGlub2Nlcm9zIHRyeSB0byBwcm92ZSB0aGVtc2VsdmVzIGF0IHRoZSBEb3VibGUgUiBSYW5jaCwgd2hlcmUgU2xpbSwgSGFyZHRhY2ssIGFuZCBSYW5jaGVyIFJvc2UgZG91YnQgQ2FsbGlvcGUncyBwb3RlbnRpYWwsIGJ1dCBCb3lkIGJlbGlldmVzIGluIGhlci4gQSBjb3dib3kgYW5kIGhpcyB0cnVzdHkgcmhpbm9jZXJvdXMgdHJ5IHRvIHByb3ZlIHRoZW1zZWx2ZXMgYXQgdGhlIERvdWJsZSBSIFJhbmNoLCB3aGVyZSB0aGUgU2xpbSwgSGFyZHRhY2ssIGFuZCBSYW5jaGVyIFJvc2UgZG91YnQgQ2FsbGlvcGUncyBwb3RlbnRpYWwsIGJ1dCBCb3lkIGJlbGlldmVzIGluIGhlci5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxb2krcldNYUNMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJDcmFua2Vuc3RlaW5cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJTYW1hbnRoYSBCZXJnZXJcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkRhbiBTYW50YXRcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTMsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIk1vbnN0ZXJzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMzBUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSGUgbWF5IGxvb2sgbGlrZSBhbnkgYm95LCBidXQgd2hlbiBmYWNlZCB3aXRoIGEgcmFpbnkgZGF5LCBhIG1lbHRpbmcgUG9wc2ljbGUsIG9yIGFuIGVhcmx5IGJlZHRpbWUsIG9uZSBib3kgdHJhbnNmb3JtcyBpbnRvIGEgbXVtYmxpbmcsIGdydW1ibGluZyBDcmFua2Vuc3RlaW4uIFdoZW4gaGUgbWVldHMgaGlzIG1hdGNoIGluIGEgZmVsbG93IENyYW5rZW5zdGVpbiwgdGhlIHJlc3VsdHMgY291bGQgYmUgY2F0YXN0cm9waGljLiBBIGJveSB3aG8gbG9va3Mgb3JkaW5hcnkgdHJhbnNmb3JtcyBpbnRvIGdydW1ibGluZyBDcmFua2Vuc3RlaW4gd2hlbiBmYWNlZCB3aXRoIGEgcmFpbnkgZGF5LCBhIG1lbHRpbmcgcG9wc2ljbGUsIG9yIGJlZHRpbWUgYnV0IGV2ZXJ5dGhpbmcgY2hhbmdlcyB3aGVuIGhlIG1lZXRzIGEgZmVsbG93IENyYW5rZW5zdGVpbi5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxc0t1bFQ4WStMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJDdXJpb3VzIEdlb3JnZSBGbGllcyBBIEtpdGVcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJNYXJncmV0IFJleVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiTWFyZ3JldCBSZXlcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDE5NzcsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIk1vbmtleXNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNS0xMi0xMFQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJBZnRlciBhIGRheSBvZiBwbGF5aW5nIHdpdGggYSBiYWxsLCBmaXNoaW5nIGF0IHRoZSBsYWtlLCBhbmQgbG9zaW5nIGEgYmFieSByYWJiaXQsIEN1cmlvdXMgR2VvcmdlIG5lZWRzIHRvIGJlIHJlc2N1ZWQgd2hlbiBoZSB0cmllcyB0byBmbHkgYSBraXRlLiBBIGxpdHRsZSBtb25rZXkgbmVlZHMgdG8gYmUgcmVzY3VlZCB3aGVuIGhlIHRyaWVzIHRvIGZseSBhIGtpdGUuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MXBWM01jZDlMTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiRGFuZ2Vyb3VzbHkgRXZlciBBZnRlclwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkRhc2hrYSBTbGF0ZXJcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlZhbGVyaWEgRG9jYW1wb1wiLFxuICAgICAgICBcInllYXJcIjogMjAxMixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJQcmluY2Vzc2VzLCBHYXJkZW5zXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDMtMjJUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiUHJpbmNlc3MgQW1hbml0YSBsYXVnaHMgaW4gdGhlIGZhY2Ugb2YgZGFuZ2VyLiBCcmFrZWxlc3MgYmljeWNsZXMsIHBldCBzY29ycGlvbnMsIHNwaWt5IHBsYW50cy0tdGhhdCdzIGhlciB0aGluZy4gU28gd2hlbiBxdWlldCBQcmluY2UgRmxvcmlhbiBnaXZlcyBoZXIgcm9zZXMsIEFtYW5pdGEgaXMgdW5pbXByZXNzZWQgLiAuIC4gdW50aWwgc2hlIHNlZXMgdGhlaXIgZ2xvcmlvdXMgdGhvcm5zISBOb3cgc2hlIG11c3QgaGF2ZSByb3NlIHNlZWRzIG9mIGhlciBvd24uIEJ1dCB3aGVuIGh1Z2UsIGhvbmtpbmcgbm9zZXMgZ3JvdyBpbnN0ZWFkLCB3aGF0IGlzIGEgcHJpbmNlc3Mgd2l0aCBhIHRhc3RlIGZvciBkYW5nZXIgdG8gZG8/XCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MU43aEs2RDRpTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiRGluby1zd2ltbWluZ1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkxpc2EgV2hlZWxlclwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiQmFycnkgR290dFwiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkRpbnNvc2F1cnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiU3dpbW1pbmdcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNS0xMi0xMFQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUaGUgTGFuZCBTaGFya3MgdGFrZSBvbiB0aGUgQWxnYWUgRWF0ZXJzIGluIGEgZGluby1zd2ltbWluZyBzaG93ZG93biEgUmFwdG9yIGFuZCBTdGVnb3NhdXJ1cyBzdGFydCBpdCBvZmYgaW4gdGhlIGluZGl2aWR1YWwgbWVkbGV5LCB3aGlsZSB0aGUgUHRlcm8gdHdpbnMgYmF0dGxlIGl0IG91dCBpbiB0aGUgYnV0dGVyZmx5IHJhY2UuIFRoZW4gR2FsbGkgYW5kIERpcGxvIHdvdyB0aGUgY3Jvd2Qgd2l0aCB0aGVpciBmbGlwcyBhbmQgdHJpY2tzIG9mZiB0aGUgZGl2aW5nIGJvYXJkISBCdXQgd2hpY2ggdGVhbSB3aWxsIHdpbiB0aGUgc3dpbSBtZWV0PyBJdCBjb21lcyBkb3duIHRvIHRoZSBsYXN0IGV2ZW50LCB0aGUgYmFja3N0cm9rZS4gQm90aCBTdGVnbyBhbmQgR2FsbGkgdGhpbmsgdGhleSdsbCB0YWtlIHRoZSBwcml6ZS4gTGV0J3MgaG9wZSB0aGVzZSBkaW5vcyByZW1lbWJlcmVkIHRoZWlyIGdvZ2dsZXMgdGhpcyBzd2ltIG1lZXQgaXMgYm91bmQgdG8gbWFrZSBhIHNwbGFzaCFcIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzkxd2VOelRPWHBMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJEaXNuZXkgRmFpcmllcyBTdG9yeWJvb2sgQ29sbGVjdGlvblwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkRpc25leSBCb29rIEdyb3VwXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJEaXNuZXkgQm9vayBHcm91cFwiLFxuICAgICAgICBcInllYXJcIjogMjAxNCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkZhbnRhc3lcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRmFpcmllc1wiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSm9pbiBUaW5rZXIgQmVsbCwgVmlkaWEsIFJvc2V0dGEsIFNpbHZlcm1pc3QsIElyaWRlc3NhLCBGYXduLCBhbmQgdGhlIHJlc3Qgb2YgdGhlaXIgZnJpZW5kcyBpbiB0aGlzIG1hZ2ljYWwgc3Rvcnlib29rIGNvbGxlY3Rpb24uIEZlYXR1cmluZyAxOCBzdG9yaWVzLCBpbmNsdWRpbmcgNCBvcmlnaW5hbCB0YWxlcywgYW5kIHJldGVsbGluZ3Mgb2YgVGlua2VyIEJlbGwsIFRpbmtlciBCZWxsIGFuZCB0aGUgTG9zdCBUcmVhc3VyZSwgYW5kIFRpbmtlciBCZWxsIGFuZCB0aGUgR3JlYXQgRmFpcnkgUmVzY3VlLCB5b3VuZyByZWFkZXJzIGFyZSBpbiBmb3IgaG91cnMgb2YgcGl4aWUtZHVzdGVkIGZ1bi5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxQVJqRVU0QjFMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJEbyBZb3UgUmVhbGx5IFdhbnQgQSBIb3JzZT9cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIkRvIFlvdSBSZWFsbHkgV2FudCBhIFBldD9cIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJCcmlkZ2V0IEhlb3NcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkthdHlhIExvbmdoaVwiLFxuICAgICAgICBcInllYXJcIjogMjAxMyxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiSG9yc2VzLCBQZXRzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDMtMjJUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU28geW91IHJlYWxseSB3YW50IGEgcGV0PyBUaGUgZG9nIHdpbGwgdHVybiB5b3VyIGhvdXNlIGludG8gYSBneW0gaWYgeW91IGRvbuKAmXQgd2FsayBoaW0sIHRoZSBjYXQgd2lsbCBqb2luIGEgZ2FuZyBpZiB5b3UgZG9u4oCZdCBicmluZyBpdCBpbiBhdCBuaWdodCwgYW5kIHRoZSByYWJiaXQgd2lsbCBiZWdpbiBsb29raW5nIGxpa2UgYSB3YWxydXMgd2l0aCBub3RoaW5nIHRvIGNoZXcuIFRoZXNlIGh1bW9yb3VzIGJ1dCBjYXV0aW9uYXJ5IHRhbGVzIHNob3cga2lkcyB3aHkgdGhleSBzaG91bGQgYmUgY2FyZWZ1bCB3aGF0IHRoZXkgd2lzaCBmb3LigKYgb3IgYXQgbGVhc3QgYmUgcHJlcGFyZWQgZm9yIHRoZSByZXNwb25zaWJpbGl0eS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxTWY1YVR1ZXhMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJEb2dzXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRW1pbHkgR3JhdmV0dFwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiRW1pbHkgR3JhdmV0dFwiLFxuICAgICAgICBcInllYXJcIjogMjAxMCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRG9nc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTExLTI0VDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAyLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiR29yZ2VvdXMgY2FuaW5lcyBvZiBldmVyeSBzaGFwZSwgc2l6ZSBhbmQgY29sb3IgYXJlIGJvdW5kaW5nIHRocm91Z2ggdGhpcyBpcnJlc2lzdGlibGUgYm9vay4gQ2FuIHlvdSBjaG9vc2Ugb25lIGRvZyB0byBsb3ZlIGJlc3Qgb2YgYWxsPyBXaXRoIHBsYXlmdWwgcGVuY2lsIGFuZCB3YXRlcmNvbG9yIGlsbHVzdHJhdGlvbnMgdG8gZGVsaWdodCBjaGlsZHJlbiBhbmQgYWR1bHRzIGFsaWtlLCBldmVyeW9uZSB3aWxsIGxvbmcgdG8gYmFyayBhbG9uZyB3aXRoIHRoZSBDaGlodWFodWEgYW5kIHRpY2tsZSB0aGUgRGFsbWF0aWFuJ3MgdHVtbXkuIFRoaXMgaXMgYSB3b25kZXJmdWxseSBzYXRpc2Z5aW5nIGJvb2sgd2l0aCBhIHR3aXN0IGluIHRoZSB0YWlsLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjF4NWY5QmhCREwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkRyYWdvbnMgTG92ZSBUYWNvc1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkFkYW0gUnViaW5cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkRhbmllbCBTYWltaWVyaVwiLFxuICAgICAgICBcInllYXJcIjogMjAxMixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkZhbnRhc3lcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRHJhZ29uc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTEyLTMxVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMb3ZlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiA2LFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiRHJhZ29ucyBsb3ZlIHRhY29zLiBUaGV5IGxvdmUgY2hpY2tlbiB0YWNvcywgYmVlZiB0YWNvcywgZ3JlYXQgYmlnIHRhY29zLCBhbmQgdGVlbnkgdGlueSB0YWNvcy4gU28gaWYgeW91IHdhbnQgdG8gbHVyZSBhIGJ1bmNoIG9mIGRyYWdvbnMgdG8geW91ciBwYXJ0eSwgeW91IHNob3VsZCBkZWZpbml0ZWx5IHNlcnZlIHRhY29zLiBCdWNrZXRzIGFuZCBidWNrZXRzIG9mIHRhY29zLiBVbmZvcnR1bmF0ZWx5LCB3aGVyZSB0aGVyZSBhcmUgdGFjb3MsIHRoZXJlIGlzIGFsc28gc2Fsc2EuIEFuZCBpZiBhIGRyYWdvbiBhY2NpZGVudGFsbHkgZWF0cyBzcGljeSBzYWxzYSAuIC4gLiBvaCwgYm95LiBZb3UncmUgaW4gcmVkLWhvdCB0cm91YmxlLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTF6MEJzOGhsV0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkR1Y2ssIER1Y2ssIERpbm9zYXVyXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiS2FsbGllIEdlb3JnZVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiT3Jpb2wgVmlkYWxcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTYsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkRpbm9zYXVycywgRHVja3NcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlRocmVlIGVnZ3MgaW4gYSBuZXN0IGJlZ2luIHRvIHdpZ2dsZSBhbmQgd29iYmxlLCB1bnRpbCBDUkFDSyEgQ1JBQ0shIENSQUNLISBJdOKAmXMgYSBkdWNrIC4gLiAuIGR1Y2sgLiAuIC4gRElOT1NBVVIhIE1lZXQgRmVhdGhlciwgRmxhcCwgYW5kIFNwaWtlLiBUaGV54oCZcmUgdGhyZWUgdW5saWtlbHkgc2libGluZ3Mgd2hvIGVhY2ggd2FudCB0byBzdGFuZCBvdXQuIEJ1dCB0b2dldGhlciwgdGhleSBtYWtlIHRoZSBiaWdnZXN0IHNwbGFzaCEgUGVyZmVjdCBmb3IgZmFtaWxpZXMgb2YgYWxsIGtpbmRzLCB0aGlzIHBsYXlmdWwsIGNsZXZlciBzdG9yeSBoYXMgYSBkaW5vLXNpemVkIGhlYXJ0LlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjE1eXo0YWI0VEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkR1ZGRsZSBQdWNrXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJUaGUgUHVkZGxlIER1Y2tcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJLYXJtYSBXaWxzb25cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIk1hcmNlbGx1cyBIYWxsXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJEdWNrcywgQmlyZHNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0yM1QwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJBIHZlcnkgb2RkIGR1Y2sgdGhhdCByZWZ1c2VzIHRvIHF1YWNrIHNob2NrcyBhbmQgZmx1c3RlcnMgYW5pbWFscyBhbGwgb3ZlciB0aGUgZmFybSB3aXRoIGhpcyBjbHVja2luZywgaG9ua2luZywgb2lua2luZywgYW5kIG5laWdoaW5nLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFWUU5oZGxuc0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkR1bmNhbiB0aGUgU3RvcnkgRHJhZ29uXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQW1hbmRhIERyaXNjb2xsXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJBbWFuZGEgRHJpc2NvbGxcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkRyYWdvbnMsIEZyaWVuZHNoaXBcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkR1bmNhbiB0aGUgRHJhZ29uIGxvdmVzIHRvIHJlYWQuIFdoZW4gaGUgcmVhZHMgYSBzdG9yeSwgaGlzIGltYWdpbmF0aW9uIGNhdGNoZXMgZmlyZSEgVW5mb3J0dW5hdGVseSAuIC4gLiBzbyBkb2VzIGhpcyBib29rLiBGaXJlIGJyZWF0aCBpcyBncmVhdCBmb3Igcm9hc3RpbmcgbWFyc2htYWxsb3dzLCBidXQgaXTigJlzIG5vdCBzbyBncmVhdCBmb3IgcmVhZGluZy4gRHVuY2FuIGp1c3Qgd2FudHMgdG8gZ2V0IHRvIHRob3NlIHR3byB3b25kZXJmdWwgd29yZHMsIGxpa2UgdGhlIGxhc3Qgc2lwIG9mIGEgY2hvY29sYXRlIG1pbGsgc2hha2U6IFRoZSBFbmQuIFdpbGwgaGUgZXZlciBmaW5kIG91dCBob3cgdGhlIHN0b3J5IGVuZHM/XCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MWhkK092bHhOTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiRWRtb25kLCB0aGUgTW9vbmxpdCBQYXJ0eVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkFzdHJpZCBEZXNib3JkZXNcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIk1hcmMgQm91dGF2YW50XCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJPd2xzLCBTcXVpcnJlbHMsIEZyaWVuZHNoaXAsIFBhcnRpZXNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0yN1QwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJFZG1vbmQgdGhlIHNxdWlycmVsIGlzIHNoeSBhbmQgYSBiaXQgbG9uZWx5LCBidXQgaGUgbmV2ZXJ0aGVsZXNzIGJlbGlldmVzIHRoYXQgaGlzIGxpZmUgaXMganVzdCBhcyBpdCBzaG91bGQgYmUuIEhlJ3MgaGFwcHkgbWFraW5nIGhpcyBjb2xvcmZ1bCBwb21wb21zLCBzdGlycmluZyBoaXMgbnV0IGphbSwgYW5kIGdvaW5nIHRvIHNsZWVwIGVhcmx5LiBCdXQgb25lIGV2ZW5pbmcsIHdoZW4gdGhlcmUncyBvbmNlIGFnYWluIGEgcGFydHkgaW4gaGlzIGFwYXJ0bWVudCBob3VzZSB0cmVlLCB0aGUgZnJhZ3JhbmNlIG9mIGhpcyBqYW0gYnJpbmdzIGFuIHVuZXhwZWN0ZWQgdmlzaXRvciB0byBoaXMgZG9vci4gV2l0aCB0aGUgZW50cmFuY2Ugb2YgT3dsLCBhbiBhZmljaW9uYWRvIG9mIGRpc2d1aXNlcyBhbmQgZnVuLCBpbnRvIGhpcyBsaWZlLCBldmVyeXRoaW5nIGJlZ2lucyB0byBjaGFuZ2UgZm9yIEVkbW9uZC4gTm90IG9ubHkgZG9lcyBoZSBhZ3JlZSB0byBhdHRlbmQgT3dsJ3MgcGFydHkuIEhlIGdvZXMgYW5kIGhhcyB0aGUgYmVzdCBldmVuaW5nIGV2ZXIsIGFuZCB0aGUgd29ybGQgc2VlbXMgZGVlcGVyIGFuZCBtb3JlIHdvbmRlcmZ1bCB0aGFuIGV2ZXIgYmVmb3JlLCBhbmQganVzdCByaWdodCwgdG9vIVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNzFWVXZJZktvN0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkVsIHBvbGxvIGRlc3BsdW1hZG9cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIlNwYW5pc2ggRWRpdGlvblwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkNoaWgtWXVhbiBDaGVuXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJDaGloLVl1YW4gQ2hlblwiLFxuICAgICAgICBcInllYXJcIjogMjAxMixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQ2hpY2tlbnMsIFNwYW5pc2hcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0xMlQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiTm9uZVwiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiT25lIGRheSwgYSBmZWF0aGVybGVzcyBjaGlja2VuIG1lZXRzIGZvdXIgY2hpY2tlbnMgd2l0aCBzcGxlbmRpZCBwbHVtYWdlLiBIZSB3YW50cyB0byBiZSB0aGVpciBmcmllbmQsIGJ1dCB0aGV5IGxvb2sgZG93biB1cG9uIGhpbSBiZWNhdXNlIGhlIGRvZXNu4oCZdCBoYXZlIGFueSBmZWF0aGVycy4gRGVqZWN0ZWQsIHRoZSBmZWF0aGVybGVzcyBjaGlja2VuIGZhbGxzIGludG8gYSBtdWQgcGlsZSwgYW5kIHNvb24gc28gbWFueSBsZWF2ZXMgYW5kIHBhcGVycyBhcmUgc3RpY2tpbmcgdG8gaGltIHRoYXQgdGhlIGZvdXIgY2hpY2tlbnMgZG8gbm90IHJlY29nbml6ZSBoaW0gYW5kIHdhbnQgdG8gYmUgaGlzIGZyaWVuZCBiZWNhdXNlIG9mIGhpcyBpbnRlcmVzdGluZyBwbHVtYWdlLiBXaGVuIGhpcyBmZWF0aGVycyBmYWxsIG9mZiwgdGhlIG90aGVyIGNoaWNrZW5zIGxlYXJuIHRoYXQgYXBwZWFyYW5jZXMgY2FuIGJlIGRlY2VpdmluZyBhbmQgdGhhdCBmcmllbmRzaGlwIGlzIGFib3V0IG1vcmUgdGhhbiB3aGF0IGlzIG9uIHRoZSBvdXRzaWRlLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFWUS1kVjFTMUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkVsd29vZCBCaWdmb290XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJXYW50ZWQ6IEJpcmRpZSBGcmllbmRzIVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkppbGwgRXNiYXVtXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJOYXRlIFdyYWdnXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJTYXNxdWFzaCwgRnJpZW5kaHNpcCwgQmlyZHMsIEJpZ2Zvb3RcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJFbHdvb2QgQmlnZm9vdCBpcyBiaWcsIGNsdW1zeSwgTE9VRCAuIC4gLiBhbmQgbG9uZWx5LiBJdCdzIGhhcmQgZm9yIGhpbSB0byBtYWtlIGZyaWVuZHPigJRlc3BlY2lhbGx5IHdpdGggdGhlIHRpbnksIGRlbGljYXRlIGJpcmRpZXMgaGUgbG92ZXMgc28gbXVjaC4gRWFjaCBmbGFzaCBvZiB0aGVpciBmZWF0aGVycywgZWFjaCBjaGlycCBhbmQgY2hlZXJmdWwgc29uZyBoZWxwcyBoaW0gZmVlbCBsZXNzIGFsb25lLiBCdXQgd2hlbmV2ZXIgYSBiaXJkaWUgc3dvb3BzIGJ5LCBhbmQgRWx3b29kIGhvbGxlcnMgYXQgaXQgdG8gU1RBWSwgdGhlIHNjYXJlZCBjcmVhdHVyZSBmbGllcyBhd2F5LiBIZSB0cmllcyBldmVyeXRoaW5nOiBzaXR0aW5nIG9uIGEgYnJhbmNoLCBoYXZpbmcgYSBob3VzZXdhcm1pbmcgcGFydHksIGV2ZW4gYnVpbGRpbmcgYW4gYW11c2VtZW50IHBhcmsgd2l0aCBzbmFja3MgYW5kIHBvb2xzLiBCdXQgbm90aGluZyBoZWxwc+KAlHVudGlsIEVsd29vZCBmaW5hbGx5IGxlYXJucyBob3cgdG8gbWFrZSBoaXMgYmlyZCBkcmVhbXMgY29tZSB0cnVlLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFGY01Kd2lXY0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkVtaWx5J3MgQmx1ZSBQZXJpb2RcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJDYXRobGVlbiBEYWx5XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJMaXNhIEJyb3duXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkFydCwgQ29sb3IsIEltYWdpbmF0aW9uXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDItMTJUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IFN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJFbWlseSB3YW50cyB0byBiZSBhbiBhcnRpc3QuIFNoZSBsaWtlcyBwYWludGluZyBhbmQgbG92ZXMgdGhlIHdheSBhcnRpc3RzIHN1Y2ggYXMgUGFibG8gUGljYXNzbyBtaXhlZCB0aGluZ3MgdXAuIFxcXCJXaGVuIFBpY2Fzc28gd2FzIHNhZCBmb3IgYSB3aGlsZSxcXFwiIHNheXMgRW1pbHksIFxcXCJoZSBvbmx5IHBhaW50ZWQgaW4gYmx1ZS4gQW5kIG5vdyBJIGFtIGluIG15IGJsdWUgcGVyaW9kLlxcXCIgSXQgbWlnaHQgbGFzdCBxdWl0ZSBzb21lIHRpbWUuIEFmdGVyIGhlciBwYXJlbnRzIGdldCBkaXZvcmNlZCwgRW1pbHkgZmluZHMgY29tZm9ydCBpbiBtYWtpbmcgYW5kIGxlYXJuaW5nIGFib3V0IGFydC5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxQTg4MWVsblRMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJGYXJsZXkgRm9sbG93cyBIaXMgTm9zZVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkx5bm4gRnJhbmsgSm9obnN0b25cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkJldGggQ3J1aWtzaGFua1wiLFxuICAgICAgICBcInllYXJcIjogMjAwOSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRG9nc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTEyLTMxVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAyLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiRmFybGV5IHRoZSBkb2cgZm9sbG93cyBoaXMgbm9zZSBmcm9tIG9uZSBnb29kIHNtZWxsIHRvIGFub3RoZXIgYWxsIG92ZXIgdG93bi4gRmFybGV5IHRoZSBkb2cgZm9sbG93cyBoaXMgbm9zZSBmcm9tIG9uZSBnb29kIHNtZWxsIHRvIGFub3RoZXIgYWxsIG92ZXIgdG93bi4gVGhlIGNvYXV0aG9yIGlzIEJldGggQ3J1aWtzaGFuay5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxU0Rmb3VOWS1MLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJGbG9yYSBhbmQgdGhlIFBlbmd1aW5cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJNb2xseSBJZGxlXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJNb2xseSBJZGxlXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJQZW5ndWluc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTA5LTE5VDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkZvbGxvdy11cCB0byBGbG9yYSBhbmQgdGhlIEZsYW1pbmdvLkZsb3JhIHRha2VzIHRvIHRoZSBpY2UgYW5kIGZvcm1zIGFuIHVuZXhwZWN0ZWQgZnJpZW5kc2hpcCB3aXRoIGEgcGVuZ3Vpbi4gVHdpcmxpbmcsIGxlYXBpbmcsIHNwaW5uaW5nLCBhbmQgZ2xpZGluZywgb24gc2thdGVzIGFuZCBmbGlwcGVycywgdGhlIGR1byBtaXJyb3IgZWFjaCBvdGhlcidzIGdyYWNlZnVsIGRhbmNlIGFib3ZlIGFuZCBiZWxvdyB0aGUgaWNlLiBCdXQgd2hlbiBGbG9yYSBnaXZlcyB0aGUgcGVuZ3VpbiB0aGUgY29sZCBzaG91bGRlciwgdGhlIHBhaXIgbXVzdCBmaWd1cmUgb3V0IGEgd2F5IHRvIHdvcmsgdG9nZXRoZXIgZm9yIHVwbGlmdGluZyByZXN1bHRzLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTE4SGZOYWJqVEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkZyYW5rIFdhcyBBIE1vbnN0ZXIgV2hvIFdhbnRlZCB0byBEYW5jZVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIktlaXRoIEdyYXZlc1wiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiS2VpdGggR3JhdmVzXCIsXG4gICAgICAgIFwieWVhclwiOiAxOTk5LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJNb25zdGVyc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTEyLTEwVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkZyYW5rIHdhcyBhIG1vbnN0ZXIgd2hvIHdhbnRlZCB0byBkYW5jZS4gU28gaGUgcHV0IG9uIGhpcyBoYXQsIGFuZCBoaXMgc2hvZXMgbWFkZSBpbiBGcmFuY2UuLi4gYW5kIG9wZW5lZCBhIGphciBhbmQgcHV0IGFudHMgaW4gaGlzIHBhbnRzISBTbyBiZWdpbnMgdGhpcyBtb25zdHJvdXNseSBmdW5ueSwgZGVsaWNpb3VzbHkgZGlzZ3VzdGluZywgaG9ycmlmeWluZ2x5IGhpbGFyaW91cyBzdG9yeSBvZiBhIG1vbnN0ZXIgd2hvIGZvbGxvd3MgaGlzIGRyZWFtLiBLZWl0aCBHcmF2ZXMnIHdhY2t5IGlsbHVzdHJhdGlvbnMgYW5kIGxhdWdoLW91dC1sb3VkIHRleHQgd2lsbCB0aWNrbGUgdGhlIGZ1bm55IGJvbmUgYW5kIGxlYXZlIHJlYWRlcnMgY2xhbW9yaW5nIGZvciBhbiBlbmNvcmUuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MVZqdzVVZm1GTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiRnJhbmtlbnN0ZWluXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJBIE1vbnN0cm91cyBQYXJvZHlcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJSaWNrIFdhbHRvblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiTmF0aGFuIEhhbGVcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTIsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJNb25zdGVyc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJGcmFua2Vuc3RlaW4sIEh1bW9yXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCBsaWtlXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJGcmFua2Vuc3RlaW4gaXMgdGhlIHNjYXJpZXN0IG9mIGFsbCB0aGUgbW9uc3RlcnMgaW4gTWlzcyBEZXZlbCdzIGNhc3RsZSB1bnRpbCBvbmUgbmlnaHQgd2hlbiBoZSBsb3NlcyBoaXMgaGVhZC4gRnJhbmtlbnN0ZWluIGlzIHRoZSBzY2FyaWVzdCBvZiBhbGwgdGhlIG1vbnN0ZXJzIGluIE1pc3MgRGV2ZWwncyBjYXN0bGUgdW50aWwgb25lIG5pZ2h0IHdoZW4gaGUgbG9zZXMgaGlzIGhlYWQuIFBhcm9keSBvZiBMdWR3aWcgQmVtZWxtYW5zJyBNYWRlbGluZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxa1czYVFoMEdMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJGcmVkZHkgJiBGcml0byBhbmQgdGhlIENsdWJob3VzZSBSdWxlc1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkFsaXNvbiBGcmllbmRcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkFsaXNvbiBGcmllbmRcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkZveCwgTWljZSwgRnJpZW5kc2hpcFwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAxLTMwVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCIzIHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJGcmVkZHkgYW5kIEZyaXRvIHBsYXkgdG9nZXRoZXIgZXZlcnkgZGF5IC0tIHNvbWV0aW1lcyBhdCBGcml0bydzIGFuZCBzb21ldGltZXMgYXQgRnJlZGR5J3MuIEJ1dCB0aGVyZSBhcmUgcnVsZXMuIFJ1bGVzIGFyZW4ndCBmdW4hIFNvIHdoYXQgZG8gdGhlc2UgYmVzdCBidWRkaWVzIGRvPyBUaGV5IGJ1aWxkIHRoZWlyIG93biBjbHViaG91c2UgaW4gYSB0cmVlIGluIHRoZSBwYXJrISBXaXRoIG5vIHJ1bGVzLCB0aGVyZSdzIHBsZW50eSBvZiBmdW4gLS0gdW50aWwgYWxsIG9mIHRoZWlyIGZyaWVuZHMgY29tZSBieSBmb3IgYSBwYXJ0eSwgYW5kIHN1ZGRlbmx5IEZyZWRkeSBhbmQgRnJpdG8gd2lzaCBmb3IgYSB3YXkgdG8gbWFrZSB0aGVtIGFsbCBsZWF2ZSFcIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzgxR1U0SHNwUGxMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJHYXN0b25cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJLZWxseSBEaVB1Y2NoaW9cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkNocmlzdGlhbiBSb2JpbnNvblwiLFxuICAgICAgICBcInllYXJcIjogMjAxNCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRG9nc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTEyLTEwVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlRoaXMgaXMgdGhlIHN0b3J5IG9mIGZvdXIgcHVwcGllczogRmktRmksIEZvby1Gb28sIE9vaC1MYS1MYSwgYW5kIEdhc3Rvbi4gR2FzdG9uIHdvcmtzIHRoZSBoYXJkZXN0IGF0IGhpcyBsZXNzb25zIG9uIGhvdyB0byBiZSBhIHByb3BlciBwb29jaC4gSGUgc2lwcy1uZXZlciBzbG9iYmVycyEgSGUgeWlwcy1uZXZlciB5YXBzISBBbmQgaGUgd2Fsa3Mgd2l0aCBncmFjZS1uZXZlciByYWNlcyFHYXN0b24gZml0cyByaWdodCBpbiB3aXRoIGhpcyBwb29kbGUgc2lzdGVycy4gQSBwcm9wZXIgYnVsbGRvZyByYWlzZWQgaW4gYSBwb29kbGUgZmFtaWx5IGFuZCBhIHRvdWdoIHBvb2RsZSByYWlzZWQgaW4gYSBidWxsZG9nIGZhbWlseSBtZWV0IG9uZSBkYXkgaW4gdGhlIHBhcmsuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MVVTWlZBNGtaTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiR2lnYW50b3NhdXJ1c1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkpvbm55IER1ZGRsZVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiSm9ubnkgRHVkZGxlXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRGlub3NhdXJzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkdpYW50XCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMDgtMjBUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxvdmVkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDYsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJGb3VyIHlvdW5nIGRpbm9zYXVycyBhcmUgd2FybmVkIGFib3V0IHRoZSBzY2FyeSBHaWdhbnRvc2F1cnVzLCBzbyBvbmUgb2YgdGhlbSB2b2x1bnRlZXJzIHRvIGtlZXAgd2F0Y2ggZm9yIHRoZSBvdGhlcnMgd2hpbGUgdGhleSBwbGF5LiBCdXQgQm9uZWhlYWQsIHRoZSBsb29rb3V0LCBxdWlja2x5IGdldHMgYm9yZWQsIGFuZCBoZSBjYW7igJl0IHJlc2lzdCBzaG91dGluZywgXFxcIkdJR0FOVE9TQVVSVVMhXFxcIiBqdXN0IHRvIHNlZSB3aGF0IHRoZSBvdGhlcnMgZG8uIFdoZW4gaGlzIGZyaWVuZHMgZmluYWxseSB3aXNlIHVwLCBCb25laGVhZCBpcyBpbiBmb3IgYSByYXRoZXIgc25hcHB5IChhbmQgY3J1bmNoeSkgc3VycHJpc2UhXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MVJlcUdjcjhXTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiR28gVHJhY2sgQSBZYWshXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiVG9ueSBKb2huc3RvblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiVGltIFJhZ2xpblwiLFxuICAgICAgICBcInllYXJcIjogMjAwMyxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiWWFrLCBQYXJlbnRzLCBXaXRjaGVzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDMtMjJUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQSBjb3VwbGUgb2YgYnVtYmxpbmcgcGFyZW50cyB3aXRoIGEgaHVuZ3J5IGJhYnkgc2VlayBoZWxwIGZyb20gYSB0cmlja3kgbGl0dGxlIHdpdGNoLCBidXQgaXQgaXMgYSBzd2VldCBibGFjay1leWVkIHlhayB3aG8gcmVhbGx5IGhlbHBzIHRoZW0gdG8gbGl2ZSBoYXBwaWx5IGV2ZXIgYWZ0ZXIuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy84MVgwMUFuaTJkTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiR29sZGkgUm9ja3MgYW5kIHRoZSBUaHJlZSBCZWFyc1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkNvcmV5IFJvc2VuIFNjaHdhcnR6XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJOYXRlIFdyYWdnXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkJlYXJzLCBTdG9yaWVzLCBmYWlyeXRhbGVzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDMtMDNUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkluIHRoaXMgZnJhY3R1cmVkIGZhaXJ5IHRhbGUsIHRoZSBUaHJlZSBCZWFyIEJhbmQgaG9sZHMgdHJ5b3V0cyBmb3IgYSBsZWFkIHNpbmdlci4gVGhlIGNvYXV0aG9yIGlzIEJldGggQ291bHRvbi4gUGFwYSBCZWFyLCBNYW1hIEJlYXIsIGFuZCBCYWJ5IEJlYXIga25vdyBob3cgdG8gcm9jayEgQnV0IHRoZXkgbmVlZCBhIG5ldyBzaW5nZXIsIHNvIHRoZXkgYXVkaXRpb24gZXZlcnlvbmUtLXRoZSBUaHJlZSBQaWdzLCBMaXR0bGUgUmVkIFJpZGluZyBIb29kLCBhbmQgbW9yZS4gVG8gdGhlaXIgZGlzbWF5LCBubyBvbmUgc2VlbXMganVzdCByaWdodC4gQ291bGQgdGhlIHBlcmZlY3QgbGVhZCBzaW5nZXIgYmUgdGhlIG15c3RlcmlvdXMgZ2lybCBzbGVlcGluZyBvbiBCYWJ5IEJlYXIncyBrZXlib2FyZD9cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxLU40TlkzTThMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJHb2xkaWxpY2lvdXNcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIlBpbmthbGljaW91c1wiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlZpY3RvcmlhIEthbm5cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlZpY3RvcmlhIEthbm5cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDksXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkZhaXJ5IFRhbGVzLCBQcmluY2VzcywgVW5pY29ybnNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMy0xMVQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiMy41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJBIGxpdHRsZSBnaXJsIGFuZCBoZXIgYnJvdGhlciBwbGF5IHdpdGggaGVyIGltYWdpbmFyeSBnb2xkLWhvcm5lZCB1bmljb3JuIHRoYXQgY2FuIGZsb2F0IG9uIHdhdGVyLCBmbHksIGFuZCB0dXJuIGhlcnNlbGYgaW50byBhIGZhaXJ5IHByaW5jZXNzLiBCZWluZyBQaW5rYWxpY2lvdXMgaXMgcGlua2F0YXN0aWMsIGVzcGVjaWFsbHkgd2hlbiBzaGUncyBhY2NvbXBhbmllZCBieSBoZXIgcGV0IHVuaWNvcm4sIEdvbGRpbGljaW91cy4gR29sZGllIGlzIGEgcm9sbGVyLXNrYXRpbmcsIGtpdGUtZmx5aW5nLCBoaWdoLWp1bXBpbmcgdW5pY29ybiB3aG8gd2lsbCBwcm90ZWN0IFBpbmthbGljaW91cyBmcm9tIHRoZSBldmlsIHdpemFyZHJ5IG9mIGhlciBsaXR0bGUgYnJvdGhlciwgUGV0ZXIuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MUN3ZXk1eGhzTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiR29sZGlsb2NrcyBBbmQgVGhlIFRocmVlIERpbm9zYXVyc1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIk1vIFdpbGxlbXNcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIk1vIFdpbGxlbXNcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTIsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRGlub3NhdXJzLCBUcmlja3MsIEZhaXJ5dGFsZXNcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk9uY2UgdXBvbiBhIHRpbWUsIHRoZXJlIHdlcmUgdGhyZWUgaHVuZ3J5IERpbm9zYXVyczogUGFwYSBEaW5vc2F1ciwgTWFtYSBEaW5vc2F1ciAuIC4gLiBhbmQgYSBEaW5vc2F1ciB3aG8gaGFwcGVuZWQgdG8gYmUgdmlzaXRpbmcgZnJvbSBOb3J3YXkuIE9uZSBkYXnigJRmb3Igbm8gcGFydGljdWxhciByZWFzb27igJR0aGV5IGRlY2lkZWQgdG8gdGlkeSB1cCB0aGVpciBob3VzZSwgbWFrZSB0aGUgYmVkcywgYW5kIHByZXBhcmUgcHVkZGluZyBvZiB2YXJ5aW5nIHRlbXBlcmF0dXJlcy4gQW5kIHRoZW7igJRmb3Igbm8gcGFydGljdWxhciByZWFzb27igJR0aGV5IGRlY2lkZWQgdG8gZ28gLiAuIC4gc29tZXBsYWNlIGVsc2UuIFRoZXkgd2VyZSBkZWZpbml0ZWx5IG5vdCBzZXR0aW5nIGEgdHJhcCBmb3Igc29tZSBzdWNjdWxlbnQsIHVuc3VwZXJ2aXNlZCBsaXR0bGUgZ2lybC4gRGVmaW5pdGVseSBub3QhXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MTZrUnJnK2ozTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiR29vZG5pZ2h0IEFscmVhZHkhXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSm9yeSBKb2huXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJCZW5qaSBEYXZpZXNcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkJlYXJzLCBEdWNrcywgTmVpZ2hib3JzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMTZUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkJlYXIgaGFzIG5ldmVyIGJlZW4gc28gdGlyZWQgYnV0IGhpcyBuZXh0LWRvb3IgbmVpZ2hib3IsIGEgd2lkZS1hd2FrZSBkdWNrLCBrZWVwcyBkaXN0dXJiaW5nIGhpcyBzbGVlcC4gQmVhciBoYXMgbmV2ZXIgYmVlbiBzbyB0aXJlZCwgYnV0IGhpcyBuZXh0LWRvb3IgbmVpZ2hib3IsIGEgd2lkZS1hd2FrZSBkdWNrLCBrZWVwcyBkaXN0dXJiaW5nIGhpcyBzbGVlcC4gVGhlIGNvYXV0aG9yIGlzIEJlbmppIERhdmllcy5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxZjFPbHdqT2tMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJHb3Jnb256b2xhXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJBIFZlcnkgU3Rpbmt5c2F1cnVzXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTWFyZ2llIFBhbGF0aW5pXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJUaW0gQm93ZXJzXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDA4LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRGlub3NhdXJzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkRpbm9zYXVycywgQmF0aHMsIEh5Z2llbmVcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIldoZW4gR29yZ29uem9sYSB0aGUgZGlub3NhdXIgbGVhcm5zIHRoYXQgZXZlcnlvbmUgcnVucyBmcm9tIGhpbSB0byBhdm9pZCBoaXMgc21lbGwgcmF0aGVyIHRoYW4gb3V0IG9mIGZlYXIsIGhlIGlzIGdyYXRlZnVsIHRvIHRoZSBsaXR0bGUgYmlyZCB3aG8gc2hvd3MgaGltIGhvdyB0byBicnVzaCBoaXMgdGVldGggYW5kIHdhc2guIFdoZW4gR29yZ29uem9sYSB0aGUgZGlub3NhdXIgbGVhcm5zIHRoYXQgZXZlcnlvbmUgcnVucyBmcm9tIGhpbSB0byBhdm9pZCBoaXMgc21lbGwsIHJhdGhlciB0aGFuIG91dCBvZiBmZWFyLCBoZSBpcyBncmF0ZWZ1bCB0byB0aGUgbGl0dGxlIGJpcmQgd2hvIHNob3dzIGhpbSBob3cgdG8gYnJ1c2ggaGlzIHRlZXRoIGFuZCB3YXNoLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTF4UGlSMXNIZEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkdyYW5ueSBHb21leiAmIEppZ3Nhd1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkRlYm9yYWggVW5kZXJ3b29kXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJTY290dCBNYWdvb25cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTAsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlBldHMsIFBpZ3MsIFN3aW5lXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDMsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJHcmFubnkgR29tZXoncyBiYWJ5IHBpZywgSmlnc2F3LCBpcyB0aGUgcGVyZmVjdCByb29tbWF0ZS4gSGUgZWF0cyB3YXRlcm1lbG9uIGFuZCB3YXRjaGVzIGNvb2tpbmcgc2hvd3Mgd2l0aCBoZXLigJRoZSBldmVuIGRvZXMgcHV6emxlcy4gQnV0IEppZ3NhdyBncm93cyB1cOKAlGFuZCBvdXTigJRxdWlja2x5LiBTb29uIGhlJ3MgdG9vIGJpZyB0byBnZXQgdXAgR3Jhbm55J3MgYmFjayBzdGVwcy4gSXQgc2VlbXMgdGhlIG9ubHkgdGhpbmcgdG8gZG8gaXMgYnVpbGQgSmlnc2F3IGEgYmFybi4gQnV0IG9uY2UgSmlnc2F3IG1vdmVzIGluLCB0aGUgdHdvIG1pc3MgZWFjaCBvdGhlciBsaWtlIGNyYXp5ISBTdXJlbHkgR3Jhbm55IGFuZCBKaWdzYXcgY2FuIGZpbmQgYSBzb2x1dGlvbiwgaWYgdGhleSBqdXN0IHB1dCB0aGUgcGllY2VzIHRvZ2V0aGVyLiAuIC4gLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFOSmwwVndTU0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkd1cywgdGhlIERpbm9zYXVyIEJ1c1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlNpeXVhbiBMaXVcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkJlaSBMeW5uXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEzLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRGlub3NhdXJzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkNoaWxkcmVuLCBzY2hvb2xcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0yM1QwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJFdmVuIHRob3VnaCB0aGUgc2Nob29sY2hpbGRyZW4gdGhpbmsgR3VzIHRoZSBkaW5vc2F1ciBidXMgaXMgYSBncmVhdCB3YXkgdG8gZ2V0IHRvIHNjaG9vbCwgaGlzIHNpemUgaXMgY2F1c2luZyB0cmFmZmljIHByb2JsZW1zIGZvciB0aGUgcHJpbmNpcGFsIGFuZCB0aGUgdG93bi4gRXZlbiB0aG91Z2ggdGhlIHNjaG9vbCBjaGlsZHJlbiB0aGluayBHdXMgdGhlIGRpbm9zYXVyIGJ1cyBpcyBhIGdyZWF0IHdheSB0byBnZXQgdG8gc2Nob29sLCBoaXMgc2l6ZSBpcyBjYXVzaW5nIHRyYWZmaWMgcHJvYmxlbXMgZm9yIHRoZSBwcmluY2lwYWwgYW5kIHRoZSB0b3duLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFnSlZsdCtlbkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkhhcnJ5LCB0aGUgRGlydHkgRG9nXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiR2VuZSBaaW9uXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJNYXJnYXJldCBCbG95IEdyYWhhbVwiLFxuICAgICAgICBcInllYXJcIjogMjAwNixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRG9nc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTEyLTMxVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAyLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSGFycnkgaXMgYSB3aGl0ZSBkb2cgd2l0aCBibGFjayBzcG90cyB3aG8gbG92ZXMgZXZlcnl0aGluZyAuIC4gLiBleGNlcHQgYmF0aHMuIFNvIG9uZSBkYXkgYmVmb3JlIGJhdGggdGltZSwgSGFycnkgcnVucyBhd2F5LiBIZSBwbGF5cyBvdXRzaWRlIGFsbCBkYXkgbG9uZywgZGlnZ2luZyBhbmQgc2xpZGluZyBpbiBldmVyeXRoaW5nIGZyb20gZ2FyZGVuIHNvaWwgdG8gcGF2ZW1lbnQgdGFyLiBCeSB0aGUgdGltZSBoZSByZXR1cm5zIGhvbWUsIEhhcnJ5IGlzIHNvIGRpcnR5IGhlIGxvb2tzIGxpa2UgYSBibGFjayBkb2cgd2l0aCB3aGl0ZSBzcG90cy4gSGlzIGZhbWlseSBkb2Vzbid0IGV2ZW4gcmVjb2duaXplIGhpbSFcIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxYVBnWVVVYWpMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJIZWxwIVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiQSBTdG9yeSBvZiBGcmllbmRzaGlwXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSG9sbHkgS2VsbGVyXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJIb2xseSBLZWxsZXJcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDcsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkZyaWVuZHNoaXAsIEZlYXJcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1vdXNlIGhlYXJzIGEgcnVtb3IgdGhhdCBzbmFrZXMgZG8gbm90IGxpa2UgbWljZSBhbmQgd2hpbGUgdHJ5aW5nIHRvIGF2b2lkIGhpcyBmb3JtZXIgZnJpZW5kLCBTbmFrZSwgTW91c2UgZmFsbHMgaW50byBhIGhvbGUgZnJvbSB3aGljaCBuZWl0aGVyIEhlZGdlaG9nLCBTcXVpcnJlbCwgbm9yIFJhYmJpdCBjYW4gaGVscCBoaW0gb3V0LiBNb3VzZSBoZWFycyBhIHJ1bW9yIHRoYXQgc25ha2VzIGRvIG5vdCBsaWtlIG1pY2UgYW5kIHdoaWxlIHRyeWluZyB0byBhdm9pZCBoaXMgZm9ybWVyIGZyaWVuZCwgU25ha2UsIGhlIGZhbGxzIGludG8gYSBob2xlIGZyb20gd2hpY2ggbmVpdGhlciBIZWRnZWhvZywgU3F1aXJyZWwsIG5vciBSYWJiaXQgY2FuIGhlbHAgaGltIG91dC5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxVVY3ZlpsNTRMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJIZXJlIENvbWVzIHRoZSBUb290aCBGYWlyeSBDYXRcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJEZWJvcmFoIFVuZGVyd29vZFwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiQ2xhdWRpYSBSdWVkYVwiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQ2F0cywgTWljZSwgVG9vdGggRmFpcmllc1wiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDMsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaGVuIENhdCBsb3NlcyBhIHRvb3RoLCB0aGUgVG9vdGggRmFpcnkgZGVsaXZlcnMgYSB3aG9sbHkgdW53YW50ZWQgc2lkZWtpY2s6IGEgbW91c2UuIFRvZ2V0aGVyLCBDYXQgYW5kIE1vdXNlIGFyZSB0YXNrZWQgd2l0aCBydW5uaW5nIGEgZmV3IFRvb3RoIEZhaXJ5LXJlbGF0ZWQgZXJyYW5kc+KAlGEgY2hhbGxlbmdlLCBzaW5jZSBNb3VzZSBpcyBqdXN0IGFzIGNvbXBldGl0aXZlIGFuZCBtaXNjaGlldm91cyBhbmQgaGlsYXJpb3VzbHkgc2VsZi1pbnZvbHZlZCBhcyBDYXQuIFRoZSBzdGFrZXMgcmlzZSBhbmQgc28gZG9lcyB0aGUgZGVhZHBhbiBodW1vciwgY3VsbWluYXRpbmcgaW4gYSBzYXRpc2Z5aW5nIHN1cnByaXNlIHRoYXQgd2lsbCBsZWF2ZSByZWFkZXJzIGVhZ2VyIGZvciB5ZXQgYW5vdGhlciBkZWxpZ2h0ZnVsbHkgZGV2aW91cyBDYXQgYWR2ZW50dXJlLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTEtLWpZYTJjZEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkhlcm1lbGluIFRoZSBEZXRlY3RpdmUgTW91c2VcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJNaW5pIEdyZXlcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIk1pbmkgR3JleVwiLFxuICAgICAgICBcInllYXJcIjogMjAxMyxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiTWljZVwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTEyVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkhlcm1lbGluLCBhIG1vdXNlIHdpdGggdHlwZXdyaXRpbmcgc2tpbGxzLCBzZWNyZXRseSBoZWxwcyB0aGUgcGVvcGxlIG9mIE9mZmxleSBTdHJlZXQgZmluZCBsb3N0IGl0ZW1zLiBBIHNwZWNpYWwgbGl0dGxlIG1vdXNlIHdobyBsaXZlcyBpbiB0aGUgYXR0aWMgYXQgMzMgT2ZmbGV5IFN0cmVldCB1c2VzIGhpcyBpbnZlc3RpZ2F0aXZlIHRhbGVudHMgYW5vbnltb3VzbHkgdG8gaGVscCBzb2x2ZSBteXN0ZXJpZXMgb24gdGhlIHN0cmVldCwgYnV0IHdoZW4gaGlzIG5laWdoYm9ycyBpbnZpdGUgaGltIHRvIGEgdGhhbmsteW91IHBhcnR5IGluIGhpcyBob25vciBhbmQgZGlzY292ZXIgdGhhdCBIZXJtZWxpbiBpcyBhIG1vdXNlLCBoZSdzIHVuc3VyZSB3aGV0aGVyIGhlIHdpbGwgYmUgd2VsY29tZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxRjROa0hSTmtMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJIaWxkaWUgQml0dGVycGlja2xlcyBOZWVkcyBIZXIgU2xlZXBcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJSb2JpbiBOZXdtYW5cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkNocmlzIEV3YWxkXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE2LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJXaXRjaGVzLCBOZWlnaGJvcnMsIFNsZWVwXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDQtMDJUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSGlsZGllIEJpdHRlcnBpY2tsZXMgaXMgYSB3aXRjaCB3aG8gbmVlZHMgaGVyIHNsZWVwLiBIZXIgcXVpZXQgbmVpZ2hib3Job29kIGhhcyBiZWVuIHR1cm5lZCB1cHNpZGUgZG93biB3aXRoIHRoZSBzdWRkZW4gYXJyaXZhbCBvZiB0aGUgb2xkIHdvbWFuIGluIGhlciBzaG9lLCBiaWcgYmFkIHdvbGYsIGFuZCBvdGhlciBmYWlyeSB0YWxlIGNoYXJhY3RlcnMuIFdoYXQgd2lsbCBIaWxkaWUgaGF2ZSB0byBkbyB0byBnZXQgYSBxdWlldCBuaWdodCdzIHNsZWVwP1wiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjE5eWRsN3N0ZUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkhvb3QgYW5kIFBlZXBcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJMaXRhIEp1ZGdlXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJMaXRhIEp1ZGdlXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE2LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJPd2xzLCBCcm90aGVycyBhbmQgU2lzdGVycywgSW5kaXZpZHVhbGl0eVwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAzLTE3VDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJIb290IHRoZSBvd2wgaXMgdmVyeSBleGNpdGVkIGZvciBoaXMgbGl0dGxlIHNpc3RlciwgUGVlcCwgdG8gam9pbiBoaW0gb24gdGhlIGNhdGhlZHJhbCByb29mdG9wcy4gU2hlJ3MgZmluYWxseSBvbGQgZW5vdWdoIHRvIGxlYXJuIGFsbCBoaXMgYmlnIGJyb3RoZXIgb3dseSB3aXNkb206IEZpcnN0LCBvd2xzIHNheSBob29vLiBTZWNvbmQsIHRoZXkgYWx3YXlzIHNheSBob29vLiBMYXN0bHksIHRoZXkgT05MWSBzYXkgaG9vbyEgQnV0IHdoeSB3b3VsZCBQZWVwIHNheSBob29vIHdoZW4gc2hlIGNvdWxkIHNheSBzY2h3ZWVlcHR5IHBlZXAgb3JkaW5naXR5IGRvbmc/IFdoeSB3b3VsZCBzaGUgc3BlYWsgd2hlbiBzaGUgY291bGQgc2luZz8gQXMgc2hlIGV4cGxvcmVzIHRoZSBicmVhdGh0YWtpbmcgUGFyaXNpYW4gY2l0eXNjYXBlLCBQZWVwIGRpc2NvdmVycyBzbyBtYW55IGluc3BpcmluZyBzaWdodHMgYW5kIHNvdW5kc+KAlHRoZSByaW5nIG9mIGNhdGhlZHJhbCBiZWxscywgdGhlIHNsYXAgb2Ygd2F2ZXMgb24gc3RvbmXigJR0aGF0IHNoZSBjYW7igJl0IGhlbHAgYnV0IGJlIHN3ZXB0IHVwIGluIHRoZSBtYWdpYyBvZiBpdCBhbGwuIEhvb3QgZG9lc27igJl0IHVuZGVyc3RhbmQgUGVlcOKAmXMgYXdlLCB1bnRpbCBoZSB0YWtlcyBhIHBhdXNlIHRvIGxpc3RlbiAuIC4gLiBhbmQgcmVhbGl6ZXMgdGhhdCB5b3UncmUgbmV2ZXIgdG9vIG9sZCB0byBsZWFybiBhIGxpdHRsZSBzb21ldGhpbmcgbmV3LlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFWbHYwWHh6TkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkhvcnRvbiBIZWFycyBBIFdobyFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJEci4gU2V1c3NcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkRyLiBTZXVzc1wiLFxuICAgICAgICBcInllYXJcIjogMTk1NCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkZhbnRhc3lcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiU3Rvcmllc1wiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSG9ydG9uIGlzIGJhY2shIEFmdGVyIGhpcyBmaXJzdCBhcHBlYXJhbmNlIGluIEhvcnRvbiBIYXRjaGVzIHRoZSBFZ2csIGV2ZXJ5b25l4oCZcyBmYXZvcml0ZSBlbGVwaGFudCByZXR1cm5zIGluIHRoaXMgdGltZWxlc3MsIG1vdmluZywgYW5kIGNvbWljYWwgY2xhc3NpYyBpbiB3aGljaCB3ZSBkaXNjb3ZlciB0aGF0IOKAnGEgcGVyc29u4oCZcyBhIHBlcnNvbiwgbm8gbWF0dGVyIGhvdyBzbWFsbC7igJ0gVGhhbmtzIHRvIHRoZSBpcnJlcHJlc3NpYmxlIHJoeW1lcyBhbmQgZXllLWNhdGNoaW5nIGlsbHVzdHJhdGlvbnMsIHlvdW5nIHJlYWRlcnMgd2lsbCBsZWFybiBraW5kbmVzcyBhbmQgcGVyc2V2ZXJhbmNlIChhcyB3ZWxsIGFzIHRoZSBpbXBvcnRhbmNlIG9mIGEgZ29vZCDigJxZb3Bw4oCdKSBmcm9tIHRoZSB2ZXJ5IGRldGVybWluZWTigJRhbmQgdmVyeSBlbmRlYXJpbmfigJRIb3J0b24gdGhlIGVsZXBoYW50LlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNzFvdDRnVjJwMEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkhvdyBEbyBEaW5vc2F1cnMgRWF0IFRoZWlyIEZvb2Q/XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSmFuZSBZb2xlblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiTWFyayBUZWFndWVcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJEaW5vc2F1cnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRGlub3NhdXJzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMTItMTBUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSnVzdCBsaWtlIGtpZHMsIGRpbm9zYXVycyBoYXZlIGEgZGlmZmljdWx0IHRpbWUgbGVhcm5pbmcgdG8gYmVoYXZlIGF0IHRoZSB0YWJsZS4gSG93ZXZlciwgd2l0aCBhIGxpdHRsZSBoZWxwIGZyb20gTW9tIGFuZCBEYWQsIHRoZXNlIHlvdW5nIGRpbm9zYXVycyBlYXQgYWxsIGJlZm9yZSB0aGVtIHdpdGggc21pbGVzIGFuZCBnb29kd2lsbC5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxajN4TDFQcFBMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJIb3cgTWFydGhhIFNhdmVkIEhlciBQYXJlbnRzIEZyb20gR3JlZW4gQmVhbnNcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJEYXZpZCBMYXJvY2hlbGxlXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJNYXJrIEZlYXJpbmdcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRm9vZCwgQmVhbnMsIFBhcmVudHNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMy0xMVQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNYXJ0aGEgSEFURVMgZ3JlZW4gYmVhbnMuIFdoZW4gc29tZSBtZWFuLCBncmVlbiBiYW5kaXRzIHN0cm9sbCBpbnRvIHRvd24sIGFueW9uZSB3aG8gZXZlciBzYWlkIFxcXCJFYXQgeW91ciBncmVlbiBiZWFuc1xcXCIgaXMgaW4gYmlnIHRyb3VibGUuIEJ1dCB3aGVuIHRoZSBiZWFucyBraWRuYXAgTWFydGhhJ3MgcGFyZW50cywgTWFydGhhIGlzIGZvcmNlZCB0byB0YWtlIGFjdGlvbi4gU2hlIGNhbiB0aGluayBvZiBvbmx5IG9uZSB3YXkgdG8gc3RvcCB0aGUgdmlsbGFpbm91cyB2ZWdnaWVzIGZyb20gdGFraW5nIG92ZXIgaGVyIHRvd24sIGFuZCBpdOKAmXMgbm90IHByZXR0eS4uLm9yIHRhc3R5LiBGZWF0dXJpbmcgYWJzdXJkbHkgZnVubnkgdGV4dCBhbmQgaWxsdXN0cmF0aW9ucyB3aXRoIGF0dGl0dWRlLCB0aGlzIGlzIGEgaGlsYXJpb3VzIHJlYWQgZm9yIGV2ZXJ5b25lIOKAkyBldmVuIHRoZSBwaWNraWVzdCBvZiBlYXRlcnMuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MVZzZ3FiMmVhTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiSG93IFJvY2tldCBMZWFybmVkIHRvIFJlYWRcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJUYWQgSGlsbHNcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlRhZCBIaWxsc1wiLFxuICAgICAgICBcInllYXJcIjogMjAxMixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRG9ncywgQmlyZHNcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkEgbGl0dGxlIHllbGxvdyBiaXJkIHRlYWNoZXMgUm9ja2V0IHRoZSBkb2cgaG93IHRvIHJlYWQgYnkgZmlyc3QgaW50cm9kdWNpbmcgaGltIHRvIHRoZSBcXFwid29uZHJvdXMsIG1pZ2h0eSwgZ29yZ2VvdXMgYWxwaGFiZXQuXFxcIiBBIGxpdHRsZSB5ZWxsb3cgYmlyZCB0ZWFjaGVzIFJvY2tldCB0aGUgZG9nIGhvdyB0byByZWFkIGJ5IGZpcnN0IGludHJvZHVjaW5nIGhpbSB0byB0aGUgYWxwaGFiZXQuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MW9lYzBOSmNXTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiSG93IHRvIENoZWVyIHVwIERhZFwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkZyZWQgS29laGxlclwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiRnJlZCBLb2VobGVyXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJFbGVwaGFudHMsIE1vb2QsIEJlaGF2aW9yLCBGYXRoZXIgYW5kIENoaWxkXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJMaXR0bGUgSnVtYm8ganVzdCBjYW4ndCB1bmRlcnN0YW5kIHdoeSBoaXMgZGFkIGlzIGhhdmluZyBzdWNoIGEgYmFkIGRheS4gSXQgY291bGRuJ3QgYmUgdGhlIHJhaXNpbnMgTGl0dGxlIEp1bWJvIHNwaXQgb3V0IGF0IHRoZSBjZWlsaW5nIG9yIHRoZSBiYXRoIGhlIHJlZnVzZWQgdG8gdGFrZS0tYWZ0ZXIgYWxsLCBMaXR0bGUgSnVtYm8ncyBkYWQga25ldyBoZSBoYXRlZCByYWlzaW5zIGFuZCBoYWQgYWxyZWFkeSB0YWtlbiBhIGJhdGggdGhhdCB3ZWVrISBMdWNraWx5LCBMaXR0bGUgSnVtYm8gaXMgc3VjaCBhIHRob3VnaHRmdWwgZWxlcGhhbnQgdGhhdCBoZSBkZWNpZGVzIHRvIHR1cm4gaGlzIGRhZCdzIGJhZCBkYXkgYXJvdW5kIHdpdGggc29tZSBvZiBoaXMtLWFoZW0sIGhpcyBkYWQncy0tZmF2b3JpdGUgdGhpbmdzLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFXTDZFY2tMZEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkhvdyBUbyBUcmFpbiBhIFRyYWluXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSmFzb24gQ2FydGVyIEVhdG9uXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJKb2huIFJvY2NvXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEzLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiVHJhbnNwb3J0YXRpb25cIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiVHJhaW5zXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDItMDlUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQSByYWlscm9hZCBlbnRodXNpYXN0IGdpdmVzIHRoZSBzZWNyZXQgdG8gZXZlcnl0aGluZyB5b3UgbmVlZCB0byBrbm93IGFib3V0IGZpbmRpbmcsIGtlZXBpbmcsIGFuZCB0cmFpbmluZyB5b3VyIHZlcnkgb3duIHBldCB0cmFpbi4gTG9jbyBmb3IgbG9jb21vdGl2ZXM/IEdldCB5b3VyIHRpY2tldCByZWFkeS0taGVyZSBpcyBldmVyeXRoaW5nIHlvdSBuZWVkIHRvIGtub3cgYWJvdXQgZmluZGluZywga2VlcGluZywgYW5kIHRyYWluaW5nIHlvdXIgdmVyeSBvd24gcGV0IHRyYWluLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFZOU9JMDlLNEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkkgTmVlZCBNeSBNb25zdGVyXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQW1hbmRhIE5vbGxcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkhvd2FyZCBNY1dpbGxpYW1cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDksXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIk1vbnN0ZXJzLCBCZWR0aW1lLCBGZWFyLCBOaWdodFwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCJPV05cIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMb3ZlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiA2LFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiV2hlbiBFdGhhbiBjaGVja3MgdW5kZXIgdGhlIGJlZCBmb3IgaGlzIG1vbnN0ZXIsIGhlIGZpbmRzIGEgbm90ZSBzYXlpbmcgdGhhdCBHYWJlIGhhcyBnb25lIGZpc2hpbmcgYW5kIHdpbGwgYmUgYmFjayBpbiBhIHdlZWsuIEhlIHRyaWVzIG91dCBzZXZlcmFsIHN1YnN0aXR1dGUgbW9uc3RlcnMsIGJ1dCBmaW5kcyB0aGF0IG5vbmUgYXJlIGFzIHBlcmZlY3QgYXMgR2FiZS4gV2hlbiBHYWJlLCB0aGUgbW9uc3RlciB0aGF0IGxpdmVzIHVuZGVyIEV0aGFuJ3MgYmVkLCBnb2VzIG9uIHZhY2F0aW9uLCBFdGhhbiBmaW5kcyB0aGF0IHRoZSBzdWJzdGl0dXRlIG1vbnN0ZXJzIEdhYmUgaGFzIHNlbnQganVzdCB3b24ndCBkbyBhbmQgd29uZGVycyBob3cgaGUgd2lsbCBldmVyIGZhbGwgYXNsZWVwLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjE4cmRzVVl3SkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkkgV2lsbCBDaG9tcCBZb3UhXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSm9yeSBKb2huXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJCb2IgU2hlYVwiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkZhbnRhc3lcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiTW9uc3RlcnNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNS0xMS0yNFQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkluIHRoZWlyIGZ1bm55IHJlYWQtYWxvdWQsIEpvcnkgSm9obiBhbmQgQm9iIFNoZWEgYnJpbmcgYSBmcmVzaCB0d2lzdCB0byBhIHRpbWUtdGVzdGVkIGJsdWVwcmludCBhcyB0aGVpciBsaXR0bGUgbW9uc3RlciB0aHJlYXRlbnMsIHJlYXNvbnMsIGFuZCBwbGVhZHMgd2l0aCByZWFkZXJzIHRvIGdvIG5vIGZ1cnRoZXIgaW4gdGhlIGJvb2sgYmVjYXVzZSBoZSB3aWxsIE5PVCBzaGFyZSBoaXMgYmVhdXRpZnVsLCBkZWxpY2lvdXMgY2FrZXMuIENoaWxkcmVuIHdpbGwgaWRlbnRpZnkgd2l0aCB0aGUgbW9uc3RlcuKAmXMgaGlnaCB2YWx1YXRpb24gb2YgaGlzIHBvc3Nlc3Npb25zLCBhbmQgKGltcG9ydGFudGx5KSB3aWxsIGxhdWdoIGF0IHRoZSBzaWxseSBtZWFzdXJlcyBoZSB0YWtlcyB0byBwcm90ZWN0IHRoZW0uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy80MVJaWHJueU0yTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiSSdtIEJvcmVkXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTWljaGFlbCBJYW4gQmxhY2tcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkRlYmJpZSBSaWRwYXRoIE9oaVwiLFxuICAgICAgICBcInllYXJcIjogMjAxMixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJHaXJsc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTEwLTEwVDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkp1c3Qgd2hlbiBhIGxpdHRsZSBnaXJsIHRoaW5rcyBzaGUgY291bGRu4oCZdCBwb3NzaWJseSBiZSBtb3JlIGJvcmVkLCBzaGUgc3R1bWJsZXMgdXBvbiBhIHBvdGF0byB3aG8gdHVybnMgdGhlIHRhYmxlcyBvbiBoZXIgYnkgZGVjbGFyaW5nIHRoYXQgY2hpbGRyZW4gYXJlIGJvcmluZy4gQnV0IHRoaXMgZ2lybCBpc27igJl0IGdvaW5nIHRvIGxldCBhIHZlZ2V0YWJsZSB0ZWxsIGhlciB3aGF04oCZcyB3aGF0LCBzbyBzaGUgc2V0cyBvdXQgdG8gc2hvdyB0aGUgdW5pbXByZXNzZWQgcG90YXRvIGFsbCB0aGUgYW1hemluZyB0aGluZ3Mga2lkcyBjYW4gZG8uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MUNBMjczQ1dOTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiSSdtIE15IE93biBEb2dcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJEYXZpZCBFenJhIFN0ZWluXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJEYXZpZCBFenJhIFN0ZWluXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJEb2dzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMzBUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAzLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTWFueSBkb2dzIGhhdmUgaHVtYW4gb3duZXJzLiBOb3QgdGhpcyBkb2cuIEhlIGZldGNoZXMgaGlzIG93biBzbGlwcGVycywgY3VybHMgdXAgYXQgaGlzIG93biBmZWV0LCBhbmQgZ2l2ZXMgaGltc2VsZiBhIGdvb2Qgc2NyYXRjaC4gQnV0IHRoZXJlIGlzIG9uZSBzcG90LCBpbiB0aGUgbWlkZGxlIG9mIGhpcyBiYWNrLCB0aGF0IGhlIGp1c3QgY2Fu4oCZdCByZWFjaC4gU28gb25lIGRheSwgaGUgbGV0cyBhIGh1bWFuIHNjcmF0Y2ggaXQuIEFuZCB0aGUgcG9vciBsaXR0bGUgZmVsbGEgZm9sbG93cyBoaW0gaG9tZS4gV2hhdCBjYW4gdGhlIGRvZyBkbyBidXQgZ2V0IGEgbGVhc2ggdG8gbGVhZCB0aGUgZ3V5IGFyb3VuZCB3aXRoPyBEb2cgbG92ZXJzIG9mIGFsbCBhZ2VzIHdpbGwgcmV2ZWwgaW4gdGhlIGh1bW9yb3VzIHJvbGUtcmV2ZXJzYWwgYXMgdGhpcyBkb2cgdGVhY2hlcyBoaXMgaHVtYW4gYWxsIHRoZSBza2lsbHMgaGUgbmVlZHMgdG8gYmUgYSBmYWl0aGZ1bCBjb21wYW5pb24uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MXNDYU4zMHhmTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiSWYgSSBIYWQgQSBHcnlwaG9uXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiVmlra2kgVmFuU2lja2xlXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJDYWxlIEF0a2luc29uXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE2LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJQZXRzLCBIYW1zdGVycywgTXl0aGljYWwgQ3JlYXR1cmVzXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCBsaWtlXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTYW0ganVzdCBnb3QgYSBoYW1zdGVyIGZvciBhIHBldC4gQnV0IHRoZSBoYW1zdGVyIGlzIGtpbmQgb2YgYm9yaW5nLiBoZSBqdXN0IGVhdHMgYW5kIHNsZWVwcyBhbmQgZ2V0cyBoaXMgc2hhdmluZ3Mgd2V0LiBJbnNwaXJlZCBieSBoZXIgYm9vayBvZiBteXRob2xvZ2ljYWwgY3JlYXR1cmVzLCBTYW0gbG9uZ3MgZm9yIGEgbW9yZSBleGNpdGluZyBwZXQuIEJ1dCBzaGUgc29vbiByZWFsaXNlcyB0aGF0IHRha2luZyBjYXJlIG9mIHRoZXNlIG1hZ2ljYWwgYmVhc3RzIG1pZ2h0IG5vdCBiZSBhcyB3b25kZXJmdWwgYXMgc2hlIHRob3VnaHQuIFNhc3F1YXRjaGVzIGFyZSBtZXNzeSwgdW5pY29ybnMgYXJlIHNoeSwgZ3J5cGhvbnMgc2NhcmUgdGhlIGRvZ3MgYXQgdGhlIGRvZ3BhcmssIGFuZCBoYXZpbmcgYSBmaXJlIGV4dGluZ3Vpc2hlciBoYW5keSBhdCBhbGwgdGltZXMgbWFrZXMgZHJhZ29ucyBzZWVtIGxpa2UgYW4gYXdmdWwgbG90IG9mIHdvcmsuIEluIHRoZSBlbmQsIFNhbSByZWFsaXNlcyB0aGF0IGhlciBoYW1zdGVyIGlzIGEgcHJldHR5IHN3ZWV0IGFuZCBzYWZlIHBldC4gb3IgaXMgaGU/XCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MWU3WDR2a3BDTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiSWYgWW91IEV2ZXIgV2FudCB0byBCcmluZyBBbiBBbGxpZ2F0b3IgdG8gU2Nob29sLCBEb250IVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkVsaXNlIFBhcnNsZXlcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkVsaXNlIFBhcnNsZXlcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkFsbGlnYXRvcnMsIFNjaG9vbFwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAzLTIyVDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTm90ZSB0byBzZWxmOiBJZiB5b3VyIHRlYWNoZXIgdGVsbHMgeW91IHRvIGJyaW5nIHNvbWV0aGluZyBmcm9tIG5hdHVyZSBmb3Igc2hvdy1hbmQtdGVsbCwgc2hlIGRvZXMgbm90IHdhbnQgeW91IHRvIGJyaW5nIGFuIGFsbGlnYXRvciEgQnV0IG5vdGhpbmcgd2lsbCBzdG9wIE1hZ25vbGlhLCB3aG8ncyBkZXRlcm1pbmVkIHRvIGhhdmUgdGhlIGJlc3Qgc2hvdy1hbmQtdGVsbCBvZiBhbGwtLXVudGlsIGhlciByZXB0aWxpYW4gcmFwc2NhbGxpb24gc3RhcnRzIGdldHRpbmcgaGVyIGludG8gc29tZSBtYWpvciB0cm91YmxlLiBOb3cgaXQncyB1cCB0byBNYWdub2xpYSB0byBmaW5kIGEgd2F5IHRvIHNlbmQgdGhpcyB0cm91YmxlbWFrZXIgaG9tZS0tYnV0IHdoYXQgY291bGQgcG9zc2libHkgc2NhcmUgYW4gYWxsaWdhdG9yIGF3YXk/XCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MUx1V3Fyd2JUTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiSWdneSBQZWNrLCBBcmNoaXRlY3RcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJBbmRyZWEgQmVhdHlcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkRhdmlkIFJvYmVydHNcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDcsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQnVpbGRpbmdcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0yNlQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCBsaWtlXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiRXZlciBzaW5jZSBoZSB3YXMgYSBiYWJ5LCBJZ2d5IFBlY2sgaGFzIGJ1aWx0IHRvd2VycywgYnJpZGdlcywgYW5kIGJ1aWxkaW5ncywgd2hpY2ggY29tZXMgaW4gaGFuZHkgd2hlbiBoaXMgc2Vjb25kIGdyYWRlIGNsYXNzIGlzIHN0cmFuZGVkIG9uIGFuIGlzbGFuZCBkdXJpbmcgYSBwaWNuaWMuIEV2ZXIgc2luY2UgaGUgd2FzIHR3bywgSWdneSBQZWNrIGhhcyBidWlsdCB0b3dlcnMsIGJyaWRnZXMsIGFuZCBidWlsZGluZ3MsIHdoaWNoIGNvbWVzIGluIGhhbmR5IHdoZW4gaGlzIHNlY29uZCBncmFkZSBjbGFzcyBpcyBzdHJhbmRlZCBvbiBhbiBpc2xhbmQgZHVyaW5nIGEgcGljbmljLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFnNEllNXE4TUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkluc2lkZSBBIFpvbyBpbiB0aGUgQ2l0eVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkFseXNzYSBTYXRpbiBDYXB1Y2lsbGlcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlRlZGQgQXJub2xkXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDA1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJTdG9yaWVzLCBab28gQW5pbWFsc1wiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkEgc3F1YXdraW5nIHBhcnJvdCB3YWtlcyBhIHN0YWxraW5nIHRpZ2VyIGFuZCBkaXN0dXJicyB0aGUgc2xlZXAgb2YgYSBsaW9uIHRoYXQgcm9hcnMuLi5hbmQgYSBzeW1waG9ueSBvZiBjaGF0dGVyaW5nIGFuZCBiYXJraW5nIGVuc3VlcywgYXMgYWxsIHRoZSBhbmltYWxzIHJhY2UgZnJvbSB0aGUgZG9ybWl0b3J5IHdoZXJlIHRoZXkgbGl2ZSB0byB0aGUgem9vIGluIHRpbWUgdG8gZ3JlZXQgdGhlIHZpc2l0b3JzLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFwQ3RUbys3UEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkludGVycnVwdGluZyBDaGlja2VuXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRGF2aWQgRXpyYSBTdGVpblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiRGF2aWQgRXpyYSBTdGVpblwiLFxuICAgICAgICBcInllYXJcIjogMjAxMCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQ2hpY2tlbnMsIEJpcmRzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMTJUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIEl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDMsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJdOKAmXMgdGltZSBmb3IgdGhlIGxpdHRsZSByZWQgY2hpY2tlbuKAmXMgYmVkdGltZSBzdG9yeeKAlGFuZCBhIHJlbWluZGVyIGZyb20gUGFwYSB0byB0cnkgbm90IHRvIGludGVycnVwdC4gQnV0IHRoZSBjaGlja2VuIGNhbuKAmXQgaGVscCBoZXJzZWxmISBXaGV0aGVyIHRoZSB0YWxlIGlzIEhhbnNlbCBhbmQgR3JldHRlbCBvciBMaXR0bGUgUmVkIFJpZGluZyBIb29kIG9yIGV2ZW5DaGlja2VuIExpdHRsZSwgc2hlIGp1bXBzIGludG8gdGhlIHN0b3J5IHRvIHNhdmUgaXRzIGhhcGxlc3MgY2hhcmFjdGVycyBmcm9tIGRvaW5nIHNvbWUgZGFuZ2Vyb3VzIG9yIHNpbGx5IHRoaW5nLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFheW9ULW8wTUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIklzIFRoZXJlIEEgRG9nIGluIFRoaXMgQm9vaz9cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJWaXZpYW5lIFNjd2FyelwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiVml2aWFuZSBTY3dhcnpcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTQsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkNhdHNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNS0xMi0xMFQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTG92ZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQ2FuIGNhdHMgYW5kIGRvZ3Mgc2hhcmUgdGhlIHNhbWUgdHVyZj8gUmV2aXNpdCB0aGUgYWdlLW9sZCBkaWxlbW1hIHdpdGggYSBoaWRlLWFuZC1zZWVrIHJvbXAgYW1vbmcgZnVycnkgZnJpZW5kcy4gQnJpbW1pbmcgd2l0aCBodW1vciBhbmQgZmVhdHVyaW5nIFZpdmlhbmUgU2Nod2FyeuKAmXMgZXh1YmVyYW50IGFydHdvcmssIGhlcmUgaXMgYSBsaXZlbHkgaW50ZXJhY3RpdmUgZXhwbG9yYXRpb24gb2YgdGhlIHN1cnByaXNpbmcgam95cyBvZiB1bmxpa2VseSBmcmllbmRzaGlwcyBmcm9tIHRoZSBjcmVhdG9yIG9mIFRoZXJlIEFyZSBDYXRzIGluIFRoaXMgQm9vayBhbmQgVGhlcmUgQXJlIE5vIENhdHMgaW4gVGhpcyBCb29rLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTEtZmlSSloreEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkl0J3MgYSBCaWcgV29ybGQsIExpdHRsZSBQaWchXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiS3Jpc3RpIFlhbWFndWNoaVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiVGltIEJvd2Vyc1wiLFxuICAgICAgICBcInllYXJcIjogMjAxMixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiUGlncywgU2thdGluZ1wiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJQb3BweSwgdGhlIGFkb3JhYmxlLCBwZXJzaXN0ZW50LCBkcmVhbWluZy1iaWcgcGlnLCBoYXMgYSBuZXcgYWR2ZW50dXJlIGluIHN0b3JlIGZvciBoZXI6IHRoZSBXb3JsZCBHYW1lcyBpY2Utc2thdGluZyBjaGFtcGlvbnNoaXAgaW4gUGFyaXMhIFBvcHB5IGlzIG5lcnZvdXMgYWJvdXQgbWVldGluZyBzbyBtYW55IG5ldyBwZW9wbGUgaW4gYSBuZXcgcGxhY2UuIEJ1dCwgZXZlciBjb3VyYWdlb3VzIGFuZCBzdXBwb3J0ZWQgYnkgaGVyIGZhbWlseSAoRW1tYSwgdG9vISksIFBvcHB5IGVtYmFya3MgdXBvbiB0aGlzIGV4Y2l0aW5nIGFkdmVudHVyZSBoZWFkLW9uLiBTaGUgbWVldHMgYSBzbm93Ym9hcmRpbmcgUGFuZGEsIGEgTWFsdGVzZSB3aG8gc2tpZXMsIGFuZCB0d28gZmVsbG93IHNrYXRlcnMsIGEgQ3JhbmUgYW5kIGEgS2FuZ2Fyb28uIFBvcHB5IGJlZ2lucyB0byByZWFsaXplIHRoYXQgYWx0aG91Z2ggdGhlc2UgYW5pbWFscyBsb29rIGRpZmZlcmVudCwgYWN0IGRpZmZlcmVudCwgYW5kIGFyZSBmcm9tIGRpZmZlcmVudCBwbGFjZXMsIHRoZXkgYXJlIGFsbCB0aGUgc2FtZSBhdCBoZWFydC4gVGhleSBhbGwgc21pbGUgaW4gdGhlIHNhbWUgbGFuZ3VhZ2UhXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MTZwakZyVlNwTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiSXRzeSBNaXRzeSBSdW5zIEF3YXlcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJFbGFubmEgQWxsZW5cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkVsYW5uYSBBbGxlblwiLFxuICAgICAgICBcInllYXJcIjogMjAxMSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJDaGlsZHJlblwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTEyVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk5PIE9ORSBsaWtlcyBiZWR0aW1lLCBhbmQgSXRzeSBNaXRzeSBoYXMgaGFkIHF1aXRlIGVub3VnaC4gU28gdG9uaWdodOKAmXMgdGhlIG5pZ2h0IHNoZeKAmXMgcnVubmluZyBhd2F5IHRvIHRoZSBwZXJmZWN0IHBsYWNlIHdoZXJlIHRoZXJlIGFyZSBubyBtb3JlIGJlZHRpbWVzIGV2ZXIgKG5vdCBldmVuIG9uZSkuIEJ1dCBydW5uaW5nIGF3YXkgaXNuJ3QgYXMgZWFzeSBhcyBpdCBzZWVtcy4gVGhlcmUncyBhIGxvdCB0byBwYWNrOiBNaXRzeSdzIGZyaWVuZGxpZXN0IGRpbm9zYXVyIE1pc3RlciBSb2FyOyBhIHNuYWNrIGZvciBNaXN0ZXIgUm9hcjsgaGVyIGRvZywgUHVwY2FrZSwgdG8ga2VlcCB0aGUgYmVkdGltZSBiZWFzdGllcyBhd2F5IGZyb20gc2FpZCBzbmFjazsgdGhlIGxpc3QgZ29lcyBvbiBhbmQgb24uIEJ1dCB3aXRoIGEgaGVscGZ1bCBEYWQgd2hvIG1ha2VzIHN1cmUgTWl0c3kgZG9lc24ndCBsZWF2ZSBhbnl0aGluZyBiZWhpbmQtLWVzcGVjaWFsbHkgbm90IGhpbS0tTWl0c3kgbWlnaHQgd2FudCB0byBydW4gYXdheSB0b21vcnJvdyBuaWdodCwgdG9vLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTF4WGQyMFoyd0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkp1bGlhJ3MgSG91c2UgZm9yIExvc3QgQ3JlYXR1cmVzXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQmVuIEhhdGtlXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJCZW4gSGF0a2VcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTQsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIk1vbnN0ZXJzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMTItMzFUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJKdWxpYSB3ZWxjb21lcyBhbGwgbG9zdCBhbmQgaG9tZWxlc3MgY3JlYXR1cmVzIGludG8gaGVyIGhvdXNlLCB3aGV0aGVyIHRoZXkgYmUgY2F0cyBvciB0cm9sbHMsIGdob3N0cyBvciBkcmFnb25zLCBidXQgc29vbiByZWFsaXplcyB0aGF0IGVhY2ggbXVzdCBoYXZlIGEgY2hvcmUgaW4gb3JkZXIgZm9yIHRoZSBhcnJhbmdlbWVudCB0byB3b3JrLiBKdWxpYSB3ZWxjb21lcyBhbGwgbG9zdCBhbmQgaG9tZWxlc3MgY3JlYXR1cmVzIGludG8gaGVyIGhvdXNlLCB3aGV0aGVyIHRoZXkgYmUgY2F0cyBvciB0cm9sbHMsIGdob3N0cyBvciBkcmFnb25zLCBidXQgc2hlIHNvb24gcmVhbGl6ZXMgdGhhdCBlYWNoIG11c3QgaGF2ZSBhIGNob3JlIGluIG9yZGVyIGZvciB0aGUgYXJyYW5nZW1lbnQgdG8gd29yay5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxaFVQQUNRbk1MLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJKdW1hbmppXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQ2hyaXMgVmFuIEFsbHNidXJnXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJDaHJpcyBWYW4gQWxsc2J1cmdcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDE5ODEsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0wOVQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJMZWZ0IG9uIHRoZWlyIG93biBmb3IgYW4gYWZ0ZXJub29uLCB0d28gYm9yZWQgYW5kIHJlc3RsZXNzIGNoaWxkcmVuIGZpbmQgbW9yZSBleGNpdGVtZW50IHRoYW4gdGhleSBiYXJnYWluZWQgZm9yIGluIGEgbXlzdGVyaW91cyBhbmQgbXlzdGljYWwganVuZ2xlIGFkdmVudHVyZSBib2FyZCBnYW1lLiBUd28gY2hpbGRyZW4gcGxheSBhIGRpY2UgZ2FtZSwgSnVtYW5qaSwgdGhhdCBtdXN0IGJlIHBsYXllZCB0byB0aGUgdmVyeSBlbmQuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MWpZeUVIUDNQTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiS2VybWl0IFRoZSBIZXJtaXRcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJCaWxsIFBlZXRcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkJpbGwgUGVldFwiLFxuICAgICAgICBcInllYXJcIjogMTk2NSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTEyVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJBIGxpdHRsZSBib3kgc2F2ZXMgS2VybWl0IGZyb20gZGlzYXN0ZXIsIGFuZCB0aGUgb25jZSBjcmFua3kgY3JhYiB3b3JrcyBoYXJkIHRvIHJlcGF5IGhpbS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxM05obzB1QVpMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJLaW5nIEh1Z28ncyBIdWdlIEVnb1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkNocmlzIFZhbiBEdXNlblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiQ2hyaXMgVmFuIER1c2VuXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDExLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIktpbmdzIGFuZCBSdWxlcywgRWdvaXNtXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDMtMTdUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAzLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSHVnbyBpcyBhIHRpbnkga2luZyB3aXRoIGEgdmVyeSBsYXJnZSBlZ28uIEJ1dCB3aGVuIGhlIG1pc3RyZWF0cyBhIHZpbGxhZ2VyIHdobyBhbHNvIGhhcHBlbnMgdG8gYmUgYSBzb3JjZXJlc3MsIHRoZSBzcGVsbCBzaGUgY2FzdHMgY2F1c2VzIGhpcyBoZWFkIHRvIGxpdGVyYWxseSBzd2VsbC4gVGhlIG1vcmUgaGUgYm9hc3RzLCB0aGUgYmlnZ2VyIGl0IGdldHMsIHVudGlsIGl0IGZpbmFsbHkgdG9wcGxlcyB0aGUgbWluaSBtb25hcmNoIHJpZ2h0IG9mZiBoaXMgY2FzdGxlISBXaG8gd2lsbCBjdXQgdGhpcyByb3lhbCBwYWluIGRvd24gdG8gc2l6ZT8gQW5kLCBtb3JlIGltcG9ydGFudCwgd2lsbCBhbnlvbmUgbGl2ZSBoYXBwaWx5IGV2ZXIgYWZ0ZXI/IENocmlzIFZhbiBEdXNlbuKAmXMgaGlsYXJpb3VzIHN0b3J5IGlzIG1hdGNoZWQgb25seSBieSBoaXMgb3V0cmFnZW91cyBpbGx1c3RyYXRpb25zLiBUb2dldGhlciwgdGhleSBtYWtlIGZvciBhIHBpY3R1cmUgYm9vayB0aGF0IGlzIHNvbWV0aW1lcyBmYWlyeSB0YWxlLCBzb21ldGltZXMgY2F1dGlvbmFyeSB0YWxlLCBhbmQgYWx3YXlzIGxhdWdoLW91dCBsb3VkIGZ1bm55LlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFiTHZsRUJYdkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkxhIGFyYcOxYSBtdXkgb2N1cGFkYVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiU3BhbmlzaCBFZGl0aW9uXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRXJpYyBDYXJsZVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiRXJpYyBDYXJsZVwiLFxuICAgICAgICBcInllYXJcIjogMjAwNCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiSW5zZWN0cywgU3BhbmlzaFwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTEyLTEwVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJFcmljIENhcmxlP3MgVGhlIFZlcnkgQnVzeSBTcGlkZXIgaGFzIGJlZW4gYSBmYXZvcml0ZSBmb3IgbW9yZSB0aGFuIDIwIHllYXJzLiBUaGlzIGNvbG9yZnVsLCB0b3VjaC1hbmQtZmVlbCBzdG9yeSBvZiBhbiBpbmR1c3RyaW91cyBzcGlkZXIgaXMgYSBjbGFzc2ljLCBhbmQgbm93IHRoZSBTcGFuaXNoLWxhbmd1YWdlIGVkaXRpb24gaXMgYXZhaWxhYmxlIGFzIGEgYm9hcmQgYm9vaywgcGVyZmVjdCBmb3IgdGhlIHlvdW5nZXN0IGNoaWxkcmVuIHdobyBzcGVhayBTcGFuaXNoIG9yIHdobyBhcmUgYmVnaW5uaW5nIHRvIGxlYXJuIGl0LlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNzEwdjdnUGhueUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkxhIG9ydWdhIG11eSBoYW1icmllbnRhXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJTcGFuaXNoIEVkaXRpb25cIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJFcmljIENhcmxlXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJFcmljIENhcmxlXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDAyLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJJbnNlY3RzLCBTcGFuaXNoXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMTItMTBUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVGhlIFZlcnkgSHVuZ3J5IENhdGVycGlsbGFyIGlzIGluYXJndWFibHkgb25lIG9mIHRoZSBtb3N0IHBvcHVsYXIgY2hpbGRyZW4ncyBib29rcyBvZiBhbGwgdGltZS4gTm93LCBoZXJlIGlzIHRoZSBTcGFuaXNoIGJvYXJkIGJvb2sgdmVyc2lvbiBvZiBUaGUgVmVyeSBIdW5ncnkgQ2F0ZXJwaWxsYXIsIGZpbGxpbmcgYW4gaW1wb3J0YW50IG5pY2hlIGZvciB0aGUgeW91bmdlc3Qgb2YgU3BhbmlzaC1zcGVha2luZyBjaGlsZHJlbi5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxb2FwY21nYk5MLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJMYWR5IFBhbmNha2UgJiBTaXIgRnJlbmNoIFRvYXN0XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSm9zaCBGdW5rXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJCcmVuZGFuIEtlYXJuZXlcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGb29kXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlBhbmNha2VzLCBGcmVuY2ggVG9hc3QsIFdhZmZsZXMsIEZyaWVuZHNoaXBcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkEgdGhvcm91Z2hseSBkZWxpY2lvdXMgcGljdHVyZSBib29rIGFib3V0IHRoZSBmdW5uaWVzdCBcXFwiZm9vZCBmaWdodFxcXCIgZXZlciEgTGFkeSBQYW5jYWtlIGFuZCBTaXIgRnJlbmNoIFRvYXN0IGhhdmUgYSBiZWF1dGlmdWwgZnJpZW5kc2hpcOKAlHVudGlsIHRoZXkgZGlzY292ZXIgdGhhdCB0aGVyZSdzIE9OTFkgT05FIERST1Agb2YgbWFwbGUgc3lydXAgbGVmdC4gT2ZmIHRoZXkgZ28sIHJhY2luZyBwYXN0IHRoZSBPcmFuZ2UgSnVpY2UgRm91bnRhaW4sIHNraWluZyB0aHJvdWdoIFNhdWVya3JhdXQgUGVhaywgYW5kIHJlZWxpbmcgZG93biB0aGUgbGluZ3VpbmkuIEJ1dCB3aG8gd2lsbCBlbmpveSB0aGUgc3dlZXQgdGFzdGUgb2YgdmljdG9yeT8gQW5kIGNvdWxkIHdvcmtpbmcgdG9nZXRoZXIgYmUgYmV0dGVyIHRoYW4gdGVhcmluZyBlYWNoIG90aGVyIGFwYXJ0PyBUaGUgYWN0aW9uLXBhY2tlZCByaHltZSBtYWtlcyBmb3IgYW4gYWRyZW5hbGluZS1maWxsZWQgYnJlYWtmYXN0IC4gLiAuIGV2ZW4gd2l0aG91dCBhIGRyb3Agb2YgY29mZmVlIVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFaNFIwN2dKaEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkxhZHlidWcgR2lybCBhbmQgdGhlIEJ1ZyBTcXVhZFwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkphY2t5IERhdmlzXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJEYXZpZCBTb21hblwiLFxuICAgICAgICBcInllYXJcIjogMjAxMSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJQbGF5LCBDb29wZXJhdGl2ZW5lc3NcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMy0yMlQwNzowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaGVuIEx1bHUgaW52aXRlcyBoZXIgZnJpZW5kcyBmcm9tIHRoZSBCdWcgU3F1YWQtLWFsbCBkcmVzc2VkIHVwIGFzIGluc2VjdHMtLXRvIGNvbWUgb3ZlciBmb3IgYSBwbGF5IGRhdGUsIHNoZSB3YW50cyBldmVyeXRoaW5nIHRvIGdvIGp1c3QgYXMgc2hlIGhhcyBwbGFubmVkLiBXaGVuIEx1bHUgaW52aXRlcyBoZXIgZnJpZW5kcyBmcm9tIHRoZSBCdWcgU3F1YWQsIGRyZXNzZWQgdXAgYXMgaW5zZWN0cywgdG8gY29tZSBvdmVyIGZvciBhIHBsYXlkYXRlLCBzaGUgd2FudHMgZXZlcnl0aGluZyB0byBnbyBqdXN0IGFzIHNoZSBoYXMgcGxhbm5lZC4gVGhlIGNvYXV0aG9yIGlzIEphY2t5IERhdmlzLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvQTFpQ2EzQ2RYaEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkxhZHlidWcgR2lybCBhdCB0aGUgQmVhY2hcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJEYXZpZCBTb21hblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiSmFja3kgRGF2aXNcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTAsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQWR2ZW50dXJlLCBMYWR5YmlnXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMTAtMTBUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAyLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTHVsdSwgd2hvIGxpa2VzIHRvIHdlYXIgYSBsYWR5YnVnIGNvc3R1bWUsIGdvZXMgdG8gdGhlIGJlYWNoIGZvciB0aGUgZmlyc3QgdGltZSBhbmQgbWFrZXMgc2FuZCBjYXN0bGVzLCBmbGllcyBraXRlcywgYW5kIGRlYWxzIHdpdGggaGVyIGZlYXIgb2YgdGhlIG9jZWFuLiBMdWx1LCB3aG8gbGlrZXMgdG8gd2VhciBhIGxhZHlidWcgY29zdHVtZSwgZ29lcyB0byB0aGUgYmVhY2ggZm9yIHRoZSBmaXJzdCB0aW1lIGFuZCBtYWtlcyBzYW5kIGNhc3RsZXMsIGZsaWVzIGtpdGVzLCBhbmQgZGVhbHMgd2l0aCBoZXIgZmVhciBvZiB0aGUgb2NlYW4uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MWVEM1BwQ2QzTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTGVhcm5pbmcgdG8gU2tpIFdpdGggTXIuIE1hZ2VlXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQ2hyaXMgVmFuIER1c2VuXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJDaHJpcyBWYW4gRHVzZW5cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTAsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRG9ncywgU2tpaW5nXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDItMjFUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiT25lIHdpbnRlciBtb3JuaW5nLCBNci4gTWFnZWUgYW5kIGhpcyBsaXR0bGUgZG9nLCBEZWUsIGhlYWQgb3V0IGJyaWdodCBhbmQgZWFybHkgdG8gbGVhcm4gaG93IHRvIHNraS4gQnV0IHdoYXQgYmVnaW5zIGFzIGEgcGxlYXNhbnQgZGF5IGluIHRoZSBzbm93IHF1aWNrbHkgZ29lcyBkb3duaGlsbCB3aGVuIGEgcnVuLWluIHdpdGggYSBjdXJpb3VzIG1vb3NlIHNlbmRzIHRoZW0gZmx5aW5nIHRocm91Z2ggdGhlIGFpciBhbmQgaGFuZ2luZyBhYm92ZSBhbiBhYnlzcyEgSG93IHdpbGwgRGVlIGFuZCBNYWdlZSBmaW5kIHRoZWlyIHdheSBvdXQgb2YgdGhpcyBzbm93eSBzaXR1YXRpb24/IENocmlzIFZhbiBEdXNlbiwgdGhlIGNyZWF0b3Igb2YgRG93biB0byB0aGUgU2VhIHdpdGggTXIuIE1hZ2VlIGFuZCBBIENhbXBpbmcgU3ByZWUgd2l0aCBNci4gTWFnZWUsIGhhcyBjcmFmdGVkeWV0IGFub3RoZXIgZnVuLWZpbGxlZCBhZHZlbnR1cmUgZm9yIE1hZ2VlIGZhbnMgb2xkIGFuZCBuZXcuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MTFRT284UlZYTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTGV0J3MgR28gZm9yIGEgRHJpdmVcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIkFuIEVsZXBoYW50IGFuZCBQaWdnaWUgQm9va1wiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkdvIFdpbGxlbXNcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkdvIFdpbGxlbXNcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTIsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkVsZXBoYW50cywgUGlnc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAxLTE2VDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMb3ZlZCBpdFwiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAzLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiRWxlcGhhbnQgR2VyYWxkIGFuZCBQaWdnaWUgd2FudCB0byBnbyBmb3IgYSBkcml2ZSwgYnV0IGFzIEdlcmFsZCB0aGlua3Mgb2Ygb25lIHRoaW5nIGFmdGVyIGFub3RoZXIgdGhhdCB0aGV5IHdpbGwgaGF2ZSB0byB0YWtlIGFsb25nLCB0aGV5IGNvbWUgdG8gcmVhbGl6ZSB0aGF0IHRoZXkgbGFjayB0aGUgbW9zdCBpbXBvcnRhbnQgdGhpbmcgb2YgYWxsLiBHZXJhbGQgYW5kIFBpZ2dpZSB3YW50IHRvIGdvIGZvciBhIGRyaXZlLCBidXQgYXMgR2VyYWxkIHRoaW5rcyBvZiBvbmUgdGhpbmcgYWZ0ZXIgYW5vdGhlciB0aGF0IHRoZXkgd2lsbCBoYXZlIHRvIHRha2UgYWxvbmcsIHRoZXkgY29tZSB0byByZWFsaXplIHRoYXQgdGhleSBsYWNrIHRoZSBtb3N0IGltcG9ydGFudCB0aGluZyBvZiBhbGwuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MU9DNngyQ0JGTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTGlicmFyeSBMaW9uXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTWljaGVsbGUgS251ZHNlblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiS2V2b24gSGF3a2VzXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDA5LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJMaW9ucywgTGlicmFyaWVzLCBPYmVkaWVuY2VcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1pc3MgTWVycml3ZWF0aGVyLCB0aGUgaGVhZCBsaWJyYXJpYW4sIGlzIHZlcnkgcGFydGljdWxhciBhYm91dCBydWxlcyBpbiB0aGUgbGlicmFyeS4gTm8gcnVubmluZyBhbGxvd2VkLiBBbmQgeW91IG11c3QgYmUgcXVpZXQuIEFzIGxvbmcgYXMgeW91IGZvbGxvdyB0aGUgcnVsZXMsIHlvdSBhcmUgcGVybWl0dGVkIHRvIGVuam95IHRoZSBsaWJyYXJ5LiBUaGVyZSBhcmUgbm8gcnVsZXMgYWJvdXQgbGlvbnMgaW4gYSBsaWJyYXJ5LCBhbmQgd2h5IHdvdWxkIHRoZXJlIGJlPyBCdXQgb25lIGRheSwgYSBsaW9uIHdhbGtzIGludG8gTWlzcyBNZXJyaXdlYXRoZXLigJlzIGxpYnJhcnksIGFuZCBubyBvbmUgaXMgc3VyZSB3aGF0IHRvIGRvLiBJdCB0dXJucyBvdXQgdGhhdCB0aGUgbGlvbiBzZWVtcyB2ZXJ5IHdlbGwgc3VpdGVkIGZvciB0aGUgbGlicmFyeS4gSGlzIGJpZyBmZWV0IGFyZSBxdWlldCBvbiB0aGUgbGlicmFyeSBmbG9vci4gSGUgbWFrZXMgYSBjb21meSBiYWNrcmVzdCBmb3IgdGhlIGNoaWxkcmVuIGF0IHN0b3J5IGhvdXIuIEFuZCBoZSBuZXZlciByb2FycyBpbiB0aGUgbGlicmFyeeKAlGF0IGxlYXN0IG5vdCBhbnltb3JlLiBCdXQgd2hlbiBzb21ldGhpbmcgdGVycmlibGUgaGFwcGVucywgdGhlIGxpb24gaGVscHMgaW4gdGhlIG9ubHkgd2F5IGhlIGtub3dzIGhvdy4gQ291bGQgdGhlcmUgZXZlciBiZSBhIGdvb2QgcmVhc29uIHRvIGJyZWFrIHRoZSBydWxlcz8gRXZlbiBpbiB0aGUgbGlicmFyeT9cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxMXBWRnoxYmJMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJMaWJyYXJ5IE1vdXNlXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJBIE11c2V1bSBBZHZlbnR1cmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJEYW5pZWwgS2lya1wiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiRGFuaWVsIEtpcmtcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTIsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIk1pY2UsIE11c2V1bXMsIEF1dGhvcnNoaXBcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTYW0gdGhlIGxpYnJhcnkgbW91c2UgYW5kIGhpcyBmcmllbmQgU2FyYWggYXJlIG9mZiBvbiBhIG5ldyBhZHZlbnR1cmUuIFRoaXMgdGltZSB0aGV5IGxlYXZlIHRoZSBsaWJyYXJ5IGJlaGluZCBhbmQgZ28gdG8gYSBtdXNldW0gc28gU2FtIGNhbiBtYWtlIHNrZXRjaGVzIGluIGhpcyBleHBsb3JlcuKAmXMgam91cm5hbC4gU2FyYWggaXNu4oCZdCBzbyBzdXJlIHRoYXQgZXhwbG9yZXJzIGhhdmUgdGhlIHRpbWUgb3IgdGhlIGludGVyZXN0IHRvIHdyaXRlIGluIGpvdXJuYWxzLiBCdXQgU2FtIHNob3dzIGhlciB0aGF0IGEgam91cm5hbCBjYW4gY29udGFpbiBhbnl0aGluZywgZnJvbSBhIHRpY2tldCBzdHViIHRvIGRyYXdpbmdzIG9mIGNvb2wgdGhpbmdzIGxpa2UgZGlub3NhdXJzIGFuZCBhbmNpZW50IEVneXB0aWFuIG11bW1pZXMuIEFzIHRoZXkgZXhwbG9yZSB0aGUgbXVzZXVtLCB0aGV5IHNlZSBhbGwga2luZHMgb2YgYXJ0IGFuZCB1bmV4cGVjdGVkbHkgbWFrZSBmcmllbmRzIHdpdGggYW5vdGhlciBhcnRpc3QuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MWxtS291MkxnTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTGlicmFyeSBNb3VzZVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkRhbmllbCBLaXJrXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJEYW5pZWwgS2lya1wiLFxuICAgICAgICBcInllYXJcIjogMjAwNyxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiTWljZSwgTGlicmFyaWVzLCBBdXRob3JzaGlwXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU2FtLCBhIHNoeSBidXQgY3JlYXRpdmUgbW91c2Ugd2hvIGxpdmVzIGluIGEgbGlicmFyeSwgZGVjaWRlcyB0byB3cml0ZSBhbmQgaWxsdXN0cmF0ZSBoaXMgb3duIHN0b3JpZXMgd2hpY2ggaGUgcGxhY2VzIG9uIHRoZSBzaGVsdmVzIHdpdGggdGhlIG90aGVyIGxpYnJhcnkgYm9va3MuIFdoZW4gY2hpbGRyZW4gZmluZCB0aGUgdGFsZXMsIHRoZXkgYWxsIHdhbnQgdG8gbWVldCB0aGUgYXV0aG9yLiBTYW0sIGEgc2h5IGJ1dCBjcmVhdGl2ZSBtb3VzZSB3aG8gbGl2ZXMgaW4gYSBsaWJyYXJ5LCBkZWNpZGVzIHRvIHdyaXRlIGFuZCBpbGx1c3RyYXRlIGhpcyBvd24gc3RvcmllcyB3aGljaCBoZSBwbGFjZXMgb24gdGhlIHNoZWx2ZXMgd2l0aCB0aGUgb3RoZXIgbGlicmFyeSBib29rcyBidXQgd2hlbiBjaGlsZHJlbiBmaW5kIHRoZSB0YWxlcywgdGhleSBhbGwgd2FudCB0byBtZWV0IHRoZSBhdXRob3IuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MVc2OUtmSldFTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTGlsbHkncyBCaWcgRGF5XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiS2V2aW4gSGVua2VzXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJLZXZpbiBIZW5rZXNcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTQsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlRlYWNoZXJzLCBXZWRkaW5ncywgTWljZVwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAzLTIyVDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJMaWxseSwgdGhlIHN0YXIgb2YgTGlsbHkncyBQdXJwbGUgUGxhc3RpYyBQdXJzZTsgSnVsaXVzLCB0aGUgQmFieSBvZiB0aGUgV29ybGQ7IGFuZCBDaGVzdGVyJ3MgV2F5LCByaXNlcyB0byB0aGUgb2NjYXNpb24gYXMgb25seSBMaWxseSBjYW4sIHR1cm5pbmcgaGVhcnRicmVhayBpbnRvIHdlZGRpbmcgY2FrZSAoYSBkZWxpY2lvdXMgdGhyZWUtdGllcmVkIGZyb3N0ZWQgU3dpc3MgY2hlZXNlLCBubyBsZXNzKSwgYW5kIGRpc2FwcG9pbnRtZW50IGludG8gZnJpZW5kc2hpcC4gVGhpcyBpcyB0aGUgcGFwZXJiYWNrIGVkaXRpb24gb2YgdGhlIGFjY2xhaW1lZCAjMU5ldyBZb3JrIFRpbWVzIGJlc3RzZWxsZXIgYnkgQ2FsZGVjb3R0IE1lZGFsaXN0IEtldmluIEhlbmtlcy5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzcxLVdiVVZmSGFMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJMaW9uaGVhcnRcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJSaWNoYXJkIENvbGxpbmdyaWRnZVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiUmljaGFyZCBDb2xsaW5ncmlkZ2VcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTYsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkxpb25zLCBGZWFyLCBUb3lzLCBJbWFnaW5hdGlvblwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTA1LTI3VDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJSaWNoYXJkIGhlYXJzIHNvbWV0aGluZyBpbiBoaXMgcm9vbSBiZWZvcmUgYmVkdGltZS4gSXMgaXQgYSBtb25zdGVyPyBIZSBkb2Vzbid0IHdhaXQgdG8gZmluZCBvdXQgYW5kIHNldHMgb2ZmIHJ1bm5pbmcgdGhyb3VnaCB0aGUgc3RyZWV0cywgb3ZlciB0aGUgaGlsbHMsIHRocm91Z2ggdGhlIGZvcmVzdCwgYW5kIGludG8gdGhlIGZpZWxkcyB1bnRpbCBoZSBmaW5kcyBoaW1zZWxmIGluIGEgbWFnaWNhbCBqdW5nbGUuIFdpdGggdGhlIGhlbHAgb2YgaGlzIHN0dWZmZWQgbGlvbiBMaW9uaGVhcnQsIFJpY2hhcmQgZmluZHMgdGhlIGNvdXJhZ2UgaGUgbmVlZHMgdG8gZmFjZSBoaXMgZmVhcnMuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy80MTJlT0k5SEpvTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTGl0dGxlIE93bCBMb3N0XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQ2hyaXMgSGF1Z2h0b25cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkNocmlzIEhhdWdodG9uXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEzLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJPd2xzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMDZUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTGl0dGxlIE93bCBmYWxscyBvdXQgb2YgaGlzIG5lc3QgYW5kIHRyaWVzIHRvIGZpbmQgaGlzIG1vbW15LiBXaXRoIHRoZSBoZWxwIG9mIGhpcyBuZXcgZnJpZW5kIFNxdWlycmVsLCBMaXR0bGUgT3dsIGdvZXMgaW4gc2VhcmNoIG9mIGFuaW1hbHMgdGhhdCBmaXQgaGlzIGRlc2NyaXB0aW9uIG9mIE1vbW15IE93bC4gRnJpZW5kbHkgZm9yZXN0IGFuaW1hbHMgaGVscCBhIG5ld2Jvcm4gb3dsIGZpbmQgaGlzIG1vdGhlci5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxK0kzZTBYeHVMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJMaXR0bGUgUGVuZ3VpbiBHZXRzIHRoZSBIaWNjdXBzXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiVGFkZ2ggQmVudGxleVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiVGFkZ2ggQmVudGxleVwiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiUGVuZ3VpbnMsIEhpY2N1cHNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMy0xMVQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDMsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJQb29yIExpdHRsZSBQZW5ndWluIGhhcyBhIG1ham9yIGNhc2Ugb2YgdGhlIC4gLiAuIEhJQyEgLiAuIC4gaGljY3Vwcy4gSXQgYWxsIHN0YXJ0ZWQgbGFzdCB3ZWVrIG9uIGNoaWxpIG5pZ2h0LiBTaW5jZSB0aGVuIGhlJ3MgdHJpZWQgZXZlcnl0aGluZyB0byBnZXQgcmlkIG9mIHRoZW0sIGJ1dCBub3RoaW5n4oCUSElDIeKAlHdvcmtzLiBTbyB3aGVuIGhpcyBmcmllbmQgRnJhbmtsaW4gc3VnZ2VzdHMgdGhhdCBhIGdvb2Qgc2NhcmUgbWlnaHQgZG8gdGhlIHRyaWNrLCBMaXR0bGUgUGVuZ3VpbiBpcyB3aWxsaW5nIHRvIGdpdmUgaXQgYSB0cnkgLiAuIC4gYWxsIGhlIG5lZWRzIGlzIGEgbGl0dGxlIGhlbHAgZnJvbSBZT1UhXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MVpBaWJlYXIwTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTGl0dGxlIFJlZCBIb3RcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJFcmljIEEuIEtpbW1lbFwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiTGF1cmEgSHVsaXNrYSBCZWl0aFwiLFxuICAgICAgICBcInllYXJcIjogMjAxMyxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTEyVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJMaXR0bGUgUmVkIEhvdCBsb3ZlcyByZWQgaG90IGNoaWxsaSBwZXBwZXJzLiBTaGUgZWF0cyB0aGVtIGZvciBicmVha2Zhc3QsIGx1bmNoLCBhbmQgZGlubmVyLiBXaGVuIGhlciBncmFuZG1vdGhlciBjYXRjaGVzIGEgY29sZCwgTGl0dGxlIFJlZCBtYWtlcyBoZXIgYSBob3QgcGVwcGVyIHBpZSB0aGF0IHdpbGwgXFxcImtub2NrIHRob3NlIGNvbGQgZ2VybXMgcmlnaHQgb3V0IG9mIGhlclxcXCIuIEJ1dCBiZWZvcmUgTGl0dGxlIFJlZCBzaGFyZXMgaGVyIHBpZSB3aXRoIEdyYW5kbWEsIHNoZSBtZWV0cyBTZcOxb3IgTG9iby4gVGhlIHBpZSBjb21lcyBpbiB2ZXJ5IGhhbmR5IHdoZW4gdGhlIHdpbHkgd29sZiB0cmllcyB0byB0cmljayBoZXIgaW50byB0aGlua2luZyBoZSdzIGhlciBncmFuZG1vdGhlci5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzcxeFBqTkVQc3BMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJMaXphcmQgRnJvbSB0aGUgUGFya1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIk1hcmsgUGV0dFwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiTWFyayBQZXR0XCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJMaXphcmRzLCBEaW5vc2F1cnMsIFBldHNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMy0xMVQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaGVuIGEgbGl6YXJkIGhhdGNoZXMgZnJvbSB0aGUgZWdnIExlb25hcmQgZmluZHMgaW4gdGhlIHBhcmssIGhlIG5hbWVzIGl0IEJ1c3RlciBhbmQgdGFrZXMgaXQgYWxsIGFyb3VuZCB0aGUgY2l0eSwgYnV0IEJ1c3RlciBncm93cyBiaWdnZXIgYW5kIGJpZ2dlciB1bnRpbCBMZW9uYXJkIHJlYWxpemVzIGhlIG11c3QgZGV2aXNlIGEgd2F5IHRvIHJldHVybiBoaXMgcGV0IHRvIHRoZSBkZWVwZXN0LCBkYXJrZXN0IHBhcnQgb2YgdGhlIHBhcmsgYW5kIHNldCBoaW0gZnJlZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzgxczJBSHpVMW5MLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJMb3N0IGFuZCBGb3VuZFwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIk9saXZlciBKZWZmZXJzXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJPbGl2ZXIgSmVmZmVyc1wiLFxuICAgICAgICBcInllYXJcIjogMjAwNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiUGVuZ3VpbnMsIFRyYXZlbHMsIFZveWFnZXMsIEZyaWVuZHNoaXBcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJIYXZlIG5vdCByZWFkIHlldFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiV2hhdCBpcyBhIGJveSB0byBkbyB3aGVuIGEgbG9zdCBwZW5ndWluIHNob3dzIHVwIGF0IGhpcyBkb29yPyBGaW5kIG91dCB3aGVyZSBpdCBjb21lcyBmcm9tLCBvZiBjb3Vyc2UsIGFuZCByZXR1cm4gaXQuIEJ1dCB0aGUgam91cm5leSB0byB0aGUgU291dGggUG9sZSBpcyBsb25nIGFuZCBkaWZmaWN1bHQgaW4gdGhlIGJveeKAmXMgcm93Ym9hdC4gVGhlcmUgYXJlIHN0b3JtcyB0byBicmF2ZSBhbmQgZGVlcCwgZGFyayBuaWdodHMuVG8gcGFzcyB0aGUgdGltZSwgdGhlIGJveSB0ZWxscyB0aGUgcGVuZ3VpbiBzdG9yaWVzLiBGaW5hbGx5LCB0aGV5IGFycml2ZS4gWWV0IGluc3RlYWQgb2YgYmVpbmcgaGFwcHksIGJvdGggYXJlIHNhZC4gVGhhdOKAmXMgd2hlbiB0aGUgYm95IHJlYWxpemVzOiBUaGUgcGVuZ3VpbiBoYWRu4oCZdCBiZWVuIGxvc3QsIGl0IGhhZCBtZXJlbHkgYmVlbiBsb25lbHkuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MVZSWUdMd0R3TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTG91aXMgSSwgS0luZyBvZiBTaGVlcFwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIk9saXZpZXIgVGFsbGVjXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJPbGl2aWVyIFRhbGxlY1wiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiU2hlZXBcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0wOVQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCBsaWtlXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNCBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTG91aXMgSSwgS2luZyBvZiB0aGUgU2hlZXAgaXMgYSBmdW5ueSBwaGlsb3NvcGhpY2FsIGZhYmxlIGFib3V0IGEgc2hlZXAgd2hvIGZpbmRzIGEgY3Jvd24sIGFuZCByZXZlbHMgaW4gZHJlYW1zIG9mIHBvd2VyLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvQTFyNVJhSmVGSUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIkxvdmFieWUgRHJhZ29uXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQmFyYmFyYSBKb29zZWVcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlJhbmR5IENlY2lsXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEyLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJEcmFnb25zXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMTEtMjRUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaGVuIGEgbG9uZWx5IGRyYWdvbiBmb2xsb3dzIGEgdHJhaWwgb2YgcHJpbmNlc3MgdGVhcnMsIGEgYmVhdXRpZnVsIGZyaWVuZHNoaXAgaXMgYm9ybi4gVGhleSBtYXJjaCBhbmQgc2luZywgcm9hciBhbmQgd2hpc3BlciwgaGlkZSBhbmQgc2VlaywgdGhlbiBzZXR0bGUgaW50byBzbnVnIGNvbXBhbmlvbnNoaXAgYXQgYmVkdGltZVxcXCItLSBQcm92aWRlZCBieSBwdWJsaXNoZXIuIFdoZW4gYSBsb25lbHkgZHJhZ29uIGZvbGxvd3MgYSB0cmFpbCBvZiBwcmluY2VzcyB0ZWFycywgYSBiZWF1dGlmdWwgZnJpZW5kc2hpcCBpcyBib3JuLiBUaGV5IG1hcmNoIGFuZCBzaW5nLCByb2FyIGFuZCB3aGlzcGVyLCBoaWRlIGFuZCBzZWVrLCBhbmQgdGhlbiBzZXR0bGUgaW50byBzbnVnIGNvbXBhbmlvbnNoaXAgYXQgYmVkdGltZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxck9tRW9wcjdMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJMdWN5IGluIHRoZSBDaXR5XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJBIFN0b3J5IEFib3V0IERldmVsb3BpbmcgU3BhdGlhbCBUaGlua2luZyBTa2lsbHNcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJKdWxpZSBEaWxsZW11dGhcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkxhdXJhIFdvb2RcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlJhY29vbnNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMy0xN1QwNzowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTHVjeSBpbiB0aGUgQ2l0eSBpcyBhIHBpY3R1cmUgYm9vayBhYm91dCBhIHlvdW5nIHJhY2Nvb24gd2hvIGdldHMgc2VwYXJhdGVkIGZyb20gaGVyIGZhbWlseSBvbmUgbmlnaHQgYW5kIGhhcyB0byBmaW5kIGhlciB3YXkgaG9tZS4gRmFjZWQgd2l0aCB0aGUgY2hhbGxlbmdlIG9mIGJlaW5nIG9uIGhlciBvd24sIEx1Y3kgdHVuZXMgaW4gdG8gaGVyIHN1cnJvdW5kaW5ncyBmb3IgdGhlIGZpcnN0IHRpbWUgYW5kIGRpc2NvdmVycyB0aGF0IHNoZSBjYW4gcmUtdHJhY2UgaGVyIHN0ZXBzIHVzaW5nIHNtZWxscywgc2lnaHRzLCBhbmQgc291bmRzLiBBdCBpdHMgaGVhcnQsIHRoZSBzdG9yeSBmb2N1c2VzIG9uIGRldmVsb3Bpbmcgc3BhdGlhbCB0aGlua2luZywgdW5kZXJzdGFuZGluZyB0aGUgd29ybGQgYXJvdW5kIHVzLCBhbmQgdXNpbmcgY29uY2VwdHMgb2Ygc3BhY2UgZm9yIHByb2JsZW0tc29sdmluZy4gSW5jbHVkZXMgYSAnTm90ZSB0byBQYXJlbnRzIGFuZCBDYXJlZ2l2ZXJzLlxcXCJcIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzkxdFVIMTJPYmJMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJMdW1waXRvIGFuZCB0aGUgUGFpbnRlciBGcm9tIFNwYWluXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTW9uaWNhIEt1bGxpbmdcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkRlYW4gR3JpZmZpdGhzXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEzLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJEb2dzLCBBcnRpc3RzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDItMjdUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTHVtcCB0aGUgZGFjaHNodW5kIGlzIGNvbnRlbnQgbGl2aW5nIHdpdGggRGF2aWQgaW4gSXRhbHkuIEJ1dCBoZSBuZWVkcyBhIHZhY2F0aW9uIGZyb20gQmlnIERvZywgd2hvIGhvdW5kcyBoaW0gZGF5IGFuZCBuaWdodC4gU28gd2hlbiBEYXZpZCBhbm5vdW5jZXMgdGhhdCBoZSdzIG9mZiB0byB0aGUgc291dGggb2YgRnJhbmNlIHRvIHBob3RvZ3JhcGggYSBmYW1vdXMgcGFpbnRlciwgTHVtcCBwb3NpdGl2ZWx5IHNjcmFtYmxlcyBhdCB0aGUgY2hhbmNlIHRvIHJpZGUgYWxvbmcuIEF0IHRoZSB2aWxsYSwgUGFibG8gUGljYXNzbyBncmVldHMgdGhlbSBhbmQgaXMgZW5jaGFudGVkIHdpdGggdGhlIGxpdHRsZSBkb2cgaGUgY2FsbHMgTHVtcGl0by4gVGhlIGZlZWxpbmcgaXMgbXV0dWFsOyBmcm9tIHRoYXQgbW9tZW50IG9uLCB0aGUgdHdvIGJlY29tZSBzb3VsIG1hdGVzLiBMdW1wIGxvdmVzIERhdmlkLiBCdXQgaG93IGNhbiBoZSBzaG93IGhpcyBtYXN0ZXIsIGFuZCBQaWNhc3NvLCB0aGF0IGhlIGlzIGhvbWUgYXQgbGFzdD9cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxTUdGSUNHT0pMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJNYWlzeSBHb2VzIHRvIHRoZSBNdXNldW1cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIkEgTWFpc3kgRmlyc3QgRXhwZXJpZW5jZSBCb29rXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTHVjeSBDb3VzaW5zXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJMdWN5IENvdXNpbnNcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDksXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIk1pY2UsIE11c2V1bXNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0yN1QwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk9uIGEgcmFpbnktZGF5IHZpc2l0IHRvIHRoZSBtdXNldW0sIE1haXN5IGFuZCBoZXIgZnJpZW5kcyBleHBsb3JlIGV2ZXJ5dGhpbmcgZnJvbSBkaW5vc2F1cnMgdG8gYSBtb29uIGV4aGliaXQsIGZyb20gdmludGFnZSB2ZWhpY2xlcyB0byBhIGdpYW50IGRvbGxob3VzZSB0byB0aGUgZm9vZCBleGhpYml0LiBUaGVyZeKAmXMgYWx3YXlzIHNvbWV0aGluZyBuZXcgKG9yIG9sZCkgdG8gc2VlIGF0IGEgbXVzZXVtLCBhbmQgZm9yIGxpdHRsZSByZWFkZXJzLCBpdOKAmXMgZ29vZCB0byBoYXZlIGEgZnJpZW5kIGxpa2UgTWFpc3kgYWxvbmcgZm9yIHRoZSBhZHZlbnR1cmUuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MUtoV0RuTFpDTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTWFpc3kgUGxheXMgU29jY2VyXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTHVjeSBDb3VzaW5zXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJMdWN5IENvdXNpbnNcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTQsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIk1pY2UsIFNvY2NlciwgU3BvcnRzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDItMjdUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1haXN5IGFuZCBoZXIgZnJpZW5kcyBjYW7igJl0IHdhaXQgdG8gcGxheSBzb2NjZXIhIE1haXN5IHB1dHMgb24gaGVyIHVuaWZvcm0sIGxhY2VzIHVwIGhlciBzbmVha2VycywgYW5kIGhlYWRzIHRvIHRoZSBmaWVsZC4gQ2hhcmxpZSwgVGFsbHVsYWgsIGFuZCBEb3R0eSBhcmUgb24gdGhlIGJsdWUgdGVhbSwgd2hpbGUgTWFpc3ksIEN5cmlsLCBhbmQgRWRkaWUgYXJlIG9uIHRoZSByZWQuIExldOKAmXMgcGxheSEgU29vbiBlbm91Z2ggdGhlIGdhbWUgaGVhdHMgdXAsIHdpdGggcGxlbnR5IG9mIGFjdGlvbiwgZXhjaXRlbWVudCwgYW5kIHN1c3BlbnNlLiBXaG8gd2lsbCBiZSB0aGUgZmlyc3QgdGVhbSB0byBtYWtlIGEgZ29hbD8gV2hhdGV2ZXIgdGhlIHNjb3JlLCBpdOKAmXMgYWxsIGluIGdvb2QgZnVuLCBhbmQgZXZlcnlvbmUgaXMgc3RpbGwgdGhlIGJlc3Qgb2YgZnJpZW5kcyBhdCB0aGUgZW5kIVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFNREJmWFdER0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk1hcmlseW4ncyBNb25zdGVyXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTWljaGVsbGUgS251ZHNlblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiTWF0dCBQaGVsYW5cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIk1vbnN0ZXJzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMDktMTlUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAyLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU29tZSBvZiB0aGUga2lkcyBpbiBNYXJpbHlu4oCZcyBjbGFzcyBoYXZlIG1vbnN0ZXJzLiBNYXJpbHluIGRvZXNu4oCZdCBoYXZlIGhlcnMgeWV0LCBidXQgc2hlIGNhbuKAmXQganVzdCBnbyBvdXQgYW5kIGxvb2sgZm9yIG9uZS4gWW91ciBtb25zdGVyIGhhcyB0byBmaW5kIHlvdS4gVGhhdOKAmXMganVzdCB0aGUgd2F5IGl0IHdvcmtzLiBNYXJpbHluIHRyaWVzIHRvIGJlIHBhdGllbnQgYW5kIHRoZSBraW5kIG9mIGdpcmwgbm8gbW9uc3RlciBjYW4gcmVzaXN0LCBidXQgaGVyIG1vbnN0ZXIgZG9lc27igJl0IGNvbWUuIENvdWxkIHNoZSBnbyBvdXQgYW5kIHNlYXJjaCBmb3IgaGltIGhlcnNlbGY/IEV2ZW4gaWYgdGhhdOKAmXMgbm90IHRoZSB3YXkgaXQgd29ya3M/IEZyb20gZmF2b3JpdGUgcGljdHVyZS1ib29rIGNyZWF0b3JzIE1pY2hlbGxlIEtudWRzZW4gYW5kIE1hdHQgUGhlbGFuIGNvbWVzIGEgc3RvcnkgYWJvdXQgb25lIGxpdHRsZSBnaXJsIGFuZCB0aGUgcGVyZmVjdCBtb25zdGVyIHNoZSBrbm93cyBpcyBvdXQgdGhlcmUgLiAuIC4gYW5kIHdoYXQgaGFwcGVucyB3aGVuIHNoZSBkZWNpZGVzIHNoZeKAmXMgd2FpdGVkIGxvbmcgZW5vdWdoLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNDFsNVdPZDF0Y0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk1heCB0aGUgQnJhdmVcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJFZCBWZXJlXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJFZCBWZXJlXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJDYXRzXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNYXggaXMgYSBmZWFybGVzcyBraXR0ZW4uIE1heCBpcyBhIGJyYXZlIGtpdHRlbi4gTWF4IGlzIGEga2l0dGVuIHdobyBjaGFzZXMgbWljZS4gVGhlcmUncyBvbmx5IG9uZSBwcm9ibGVtLU1heCBkb2Vzbid0IGtub3cgd2hhdCBhIG1vdXNlIGxvb2tzIGxpa2UhIFdpdGggYSBsaXR0bGUgYml0IG9mIGJhZCBhZHZpY2UsIE1heCBmaW5kcyBoaW1zZWxmIGZhY2luZyBhIG11Y2ggYmlnZ2VyIGNoYWxsZW5nZS4gTWF5YmUgTWF4IGRvZXNuJ3QgaGF2ZSB0byBiZSBNYXggdGhlIEJyYXZlIGFsbCB0aGUgdGltZS4uLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFtaHhDNW9uUUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk1lbW9pcnMgb2YgQSBHb2xkZmlzaFwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkRldmluIFNjaWxsaWFuXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJUaW0gQm93ZXJzXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEwLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJHb2xkZmlzaCwgRnJpZW5kc2hpcFwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQSBnb2xkZmlzaCBwcmVzZW50cyBhIHRlbGwtYWxsIHRhbGUgb2YgaGlzIGV4cGVyaWVuY2VzIG9mIHN3aW1taW5nIGFyb3VuZCBoaXMgYm93bCBhcyBpdCBzbG93bHkgZmlsbHMgd2l0aCBpbnRydWRlcnMuIFdoZW4gaGUgaXMgcmVsb2NhdGVkIGZvciBhIGNsZWFuaW5nLCBoZSByZWFsaXplcyBob3cgbXVjaCBoZSBtaXNzZXMgaGlzIG5ldyBjb21wYW5pb25zLiBBIGdvbGRmaXNoIGdpdmVzIGEgcGVyc29uYWwgYWNjb3VudCBvZiBoaXMgZXhwZXJpZW5jZXMgd2hpbGUgc3dpbW1pbmcgYXJvdW5kIGhpcyBib3dsIGFzIGl0IHNsb3dseSBmaWxscyB3aXRoIGZpc2ggYW5kIG90aGVyIGFjY2Vzc29yaWVzLCBvbmx5IHRvIHJlYWxpemUgd2hlbiBoZSBpcyByZWxvY2F0ZWQgZm9yIGEgY2xlYW5pbmcgaG93IG11Y2ggaGUgbWlzc2VzIHRoZW0uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MUJrdlhlNlNFTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTWVyY3kgV2F0c29uIEZpZ2h0cyBDcmltZVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkthdGUgRGlDYW1pbGxvXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJDaHJpcyBWYW4gRHVzZW5cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDYsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlBpZ3NcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0yM1QwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkxlcm95IE5pbmtlciBpcyBhIHNtYWxsIG1hbiB3aXRoIGEgYmlnIGRyZWFtOiBoZSB3YW50cyB0byBiZSBhIGNvd2JveSwgYnV0IGZvciBub3cgaGXigJlzIGp1c3QgYSB0aGllZi4gSW4gZmFjdCwgTGVyb3kgaXMgcm9iYmluZyB0aGUgV2F0c29uc+KAmSBraXRjaGVuIHJpZ2h0IHRoaXMgbWludXRlISBCdXQgbGl0dGxlIGRvZXMgaGUga25vdyB0aGF0IGEgY2VydGFpbiBwaWcgd2hvIGxvdmVzIHRvYXN0IHdpdGggYSBncmVhdCBkZWFsIG9mIGJ1dHRlciBpcyBzdGlycmluZyBmcm9tIHNsZWVwLiBFdmVuIGxlc3MgY291bGQgaGUgZ3Vlc3MgdGhhdCBhIGNvbWVkeSBvZiBlcnJvcnMgd2lsbCBzb29uIGxlYWQgdGhpcyBsaXR0bGUgbWFuIG9uIHRoZSB3aWxkIGFuZCByYXVjb3VzIHJvZGVvIHJpZGUgaGXigJlzIGFsd2F5cyBkcmVhbWVkIG9mISBOb3N5IG5laWdoYm9ycywgYXN0b25pc2hlZCBmaXJlbWVuLCBhIHB1enpsZWQgcG9saWNlbWFuLCBhbmQgdGhlIGV2ZXItZG90aW5nIFdhdHNvbnMgcmV0dXJuIGZvciBhIGhpbGFyaW91cyBhZHZlbnR1cmUuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy85MVNMVE1KOFh2TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTWlzcyBCaW5kZXJnYXJ0ZW4gR2V0cyBSZWFkeSBmb3IgS2luZGVyZ2FydGVuXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSm9zZXBoIFNsYXRlXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJBc2hsZXkgV29sZmZcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDEsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlNjaG9vbCwgS2luZGVyZ2FydGVuXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTG92ZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDYsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJdCdzIHRoZSBmaXJzdCBkYXkgb2Yga2luZGVyZ2FydGVuIGFuZCBNaXNzIEJpbmRlcmdhcnRlbiBpcyBoYXJkIGF0IHdvcmsgZ2V0dGluZyB0aGUgY2xhc3Nyb29tIHJlYWR5IGZvciBoZXIgdHdlbnR5LXNpeCBuZXcgc3R1ZGVudHMuIE1lYW53aGlsZSwgQWRhbSBLcnVwcCB3YWtlcyB1cCwgQnJlbmRhIEhlYXRoIGJydXNoZXMgaGVyIHRlZXRoLCBhbmQgQ2hyaXN0b3BoZXIgQmVha2VyIGZpbmRzIGhpcyBzbmVha2VyLiBNaXNzIEJpbmRlcmdhcnRlbiBwdXRzIHRoZSBmaW5pc2hpbmcgdG91Y2hlcyBvbiB0aGUgcm9vbSBqdXN0IGluIHRpbWUsIGFuZCB0aGUgc3R1ZGVudHMgYXJyaXZlLiBOb3cgdGhlIGZ1biBjYW4gYmVnaW4hIFRoaXMgcmh5bWluZywgYnJpZ2h0bHkgaWxsdXN0cmF0ZWQgYm9vayBpcyB0aGUgcGVyZmVjdCB3YXkgdG8gcHJhY3RpY2UgdGhlIGFscGhhYmV0IGFuZCB0byBpbnRyb2R1Y2UgeW91bmcgY2hpbGRyZW4gdG8ga2luZGVyZ2FydGVuLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFkYmxvb3p0LUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk1pc3MgSGF6ZWx0aW5lJ3MgSG9tZSBmb3IgU2h5IGFuZCBGZWFyZnVsIENhdHNcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJBbGljaWEgUG90dGVyXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJCaXJnaXR0YSBTaWZcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkNhdHMsIEZlYXJcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMy0wM1QwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNaXNzIEhhemVsdGluZSBpcyBvcGVuaW5nIGEgdmVyeSBzcGVjaWFsIHNjaG9vbCBmb3Igc2h5IGFuZCBmZWFyZnVsIGNhdHMuIFRoZXkgY29tZSBmcm9tIGFsbCBvdmVyLCBhbmQgTWlzcyBIYXplbHRpbmUgZ2l2ZXMgdGhlbSBsZXNzb25zIGluIGV2ZXJ5dGhpbmcsIGZyb20gXFxcIkJpcmQgQmFzaWNzXFxcIiB0byBcXFwiSG93IE5vdCB0byBGZWFyIHRoZSBCcm9vbS5cXFwiIFRoZSBtb3N0IHRpbWlkIG9mIGFsbCBpcyBDcnVtYi4gSGUgY293ZXJzIGluIGEgY29ybmVyLiBNaXNzIEhhemVsdGluZSBkb2Vzbid0IG1pbmQuIEJ1dCB3aGVuIHNoZSBnZXRzIGluIHRyb3VibGUgYW5kIG9ubHkgQ3J1bWIga25vd3Mgd2hlcmUgc2hlIGlzLCB3aWxsIGhlIGZpbmQgaGlzIGlubmVyIGNvdXJhZ2UgYW5kIGxlYWQgYSBkYXJpbmcgcmVzY3VlP1wiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTEtQXpNYzUrZ0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk1pc3MgTWFyeSBNYWNrXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJBIEhhbmQtY2xhcHBpbmcgUmh5bWVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJNYXJ5IEFubiBIb2Jlcm1hblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiTmFkaW5lIEJlcm5hcmQgV2VzdGNvdHRcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDMsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIk51cnNlcnkgUmh5bWVzLCBDaGlsZHJlbidzIFBvZXRyeVwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDMsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUaGlzIGJvb2sgcHJlc2VudHMgYW4gZXhwYW5kZWQgYWRhcHRhdGlvbiBvZiB0aGUgZmFtaWxpYXIgaGFuZC1jbGFwcGluZyByaHltZSBhYm91dCBhIHlvdW5nIGdpcmwgYW5kIGFuIGVsZXBoYW50LiBBbiBleHBhbmRlZCBhZGFwdGF0aW9uIG9mIHRoZSBmYW1pbGlhciBoYW5kLWNsYXBwaW5nIHJoeW1lIGFib3V0IGEgeW91bmcgZ2lybCBhbmQgYW4gZWxlcGhhbnQuIEluY2x1ZGVzIG11c2ljIGFuZCBkaXJlY3Rpb25zIGZvciB0aGUgaGFuZC1jbGFwcGluZyBhY3Rpb25zLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFMbHd1ai1DLUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk1pc3MgTmVsc29uIEhhcyBBIEZpZWxkIERheVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkhhcnJ5IEFsbGFyZFwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiSmFtZXMgTWFyc2hhbGxcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDE5ODgsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiVGVhY2hlcnMsIFNjaG9vbFwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTI3VDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMb3ZlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogNixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlRoZSBub3RvcmlvdXMgTWlzcyBTd2FtcCByZWFwcGVhcnMgYXQgdGhlIEhvcmFjZSBCLiBTbWVkbGV5IFNjaG9vbCwgdGhpcyB0aW1lIHRvIHNoYXBlIHVwIHRoZSBmb290YmFsbCB0ZWFtIGFuZCBoZWxwIHRoZW0gdG8gd2luIGF0IGxlYXN0IG9uZSBnYW1lLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFtblNoT0trSkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk1pc3MgTmVsc29uIElzIEJhY2tcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJIYXJyeSBKIEFsbGFyZCBKclwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiSmFtZXMgTWFyc2NoYWxsXCIsXG4gICAgICAgIFwieWVhclwiOiAxOTgyLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlRlYWNoZXJzLCBTY2hvb2xcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0xMlQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTG92ZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogNixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIldoaWxlIE1pc3MgTmVsc29uIGlzIHJlY3VwZXJhdGluZyBmcm9tIGhlciB0b25zaWxsZWN0b215LCBoZXIgY2xhc3MgZHJlYWRzIHRoZSBhcnJpdmFsIG9mIE1pc3MgU3dhbXAsIHRoZSBzdWJzdGl0dXRlIHRlYWNoZXIuIFdoZW4gdGhlaXIgdGVhY2hlciBoYXMgdG8gZ28gYXdheSBmb3IgYSB3ZWVrLCB0aGUga2lkcyBpbiByb29tIDIwNyBwbGFuIHRvIFxcXCJyZWFsbHkgYWN0IHVwLlxcXCJcIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxdS03MkVLMzRMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJNaXNzIE5lbHNvbiBJcyBNaXNzaW5nIVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkhhcnJ5IEogQWxsYXJkIEpyXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJKYW1lcyBNYXJzY2hhbGxcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDE5ODUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiVGVhY2hlcnMsIFNDaG9vbFwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTEyLTMxVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMb3ZlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogNixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1pc3MgTmVsc29uIGhhcyB0aGUgd29yc3QtYmVoYXZlZCBjbGFzcyBpbiBzY2hvb2w7IHRoZW4gTWlzcyBTd2FtcCB0dXJucyB1cCB0byBzdHJhaWdodGVuIHRoaW5ncyBvdXQuIFdobyBpcyBNaXNzIFN3YW1wPyBUaGF0J3MgdGhlIG15c3RlcnkuIFRoZSBraWRzIGluIFJvb20gMjA3IHRha2UgYWR2YW50YWdlIG9mIHRoZWlyIHRlYWNoZXIncyBnb29kIG5hdHVyZSB1bnRpbCBzaGUgZGlzYXBwZWFycyBhbmQgdGhleSBhcmUgZmFjZWQgd2l0aCBhIHZpbGUgc3Vic3RpdHV0ZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxZDJYaEt0amhMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJNaXRmb3JkIGF0IHRoZSBGYXNoaW9uIFpvb1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkRvbmFsZCBSb2JlcnRzb25cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkRvbmFsZCBSb2JlcnRzb25cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkdpcmFmZmVzLCBGYXNoaW9uXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCBsaWtlXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNaXRmb3JkIGlzIGEgZ2lyYWZmZS5CdXQgbm90IHlvdXIgZXZlcnlkYXksIGxpdmUtb24tdGhlLXNhdmFubmFoIGdpcmFmZmUuIE1pdGZvcmQgbGl2ZXMgaW4gdGhlIGNpdHkuIEJ1dCBub3QgeW91ciBldmVyeWRheSwgZmlsbGVkLXdpdGgtcGVvcGxlIGNpdHkuIFRoaXMgY2l0eSBpcyBmaWxsZWQgd2l0aCBhbmltYWxzLiBBbmltYWxzIHdobyBsaWtlIHRvIGRyZXNzIHVwLCBlc3BlY2lhbGx5IHRoZSBhbmltYWxzIHdobyB3b3JrIGF0IENPVkVSIG1hZ2F6aW5lLiBNaXRmb3JkIHdvdWxkIGRvIEFOWVRISU5HIHRvIHdvcmsgdGhlcmUuIEJ1dCBmaXJzdCBNaXRmb3JkIG11c3QgcHJvdmUgaGltc2VsZi4gQ2FuIE1pdGZvcmQgc3Vydml2ZSB0aGUgRmFzaGlvbiBab28/IVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFKcUtaSXJzQkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk1vJ3MgTXVzdGFjaGVcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJCZW4gQ2xhbnRvblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiQmVuIENsYW50b25cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTMsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIk1pY2VcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0wOVQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTW9uc3RlciBNbydzIGJpZywgYmVhdXRpZnVsIG11c3RhY2hlIGluc3BpcmVzIGFsbCBoaXMgZnJpZW5kcyB0byBjb3B5IGhpcyBzdHlsZSBieSBnZXR0aW5nIG11c3RhY2hlcyBvZiB0aGVpciBvd24sIGxlYXZpbmcgTW8gdG8gd29uZGVyIGhvdyBoZSB3aWxsIGNvbnRpbnVlIHRvIGRpc3Rpbmd1aXNoIGhpbXNlbGYuIE1vIGV4cHJlc3NlcyBoaXMgYW5nZXIgd2hlbiBldmVyeW9uZSBpcyBjb3B5aW5nIGhpcyBmYXNoaW9ucywgYnV0IHdoZW4gdGhlIG90aGVyIG1vbnN0ZXJzIGNvbXBsaW1lbnQgaGlzIHN0eWxlLCBoZSdzIHRoZSBraW5nIG9mIHRoZSBmYXNoaW9uIHNob3chXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MTBRZjhqdXp0TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTW9uc3RlciBUcm91YmxlXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTGFuZSBGcmVkcmlja3NvblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiTWljaGFlbCBSb2JlcnRzb25cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIk1vbnN0ZXJzXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJOb3RoaW5nIGZyaWdodGVucyBXaW5pZnJlZCBTY2huaXR6ZWzigJRidXQgc2hlIERPRVMgbmVlZCBoZXIgc2xlZXAsIGFuZCB0aGUgbmVpZ2hib3Job29kIG1vbnN0ZXJzIFdPTidUIGxldCBoZXIgYmUhIEV2ZXJ5IG5pZ2h0IHRoZXkgc25lYWsgaW4sIGdyb3dsaW5nIGFuZCBiZWxjaGluZyBhbmQgbWFraW5nIGEgcnVja3VzLiBXaW5pZnJlZCBjb25zdHJ1Y3RzIGNsZXZlciB0cmFwcywgYnV0IG5vdGhpbmcgc3RvcHMgdGhlc2UgY3JhZnR5IGNyZWF0dXJlcy4gV2hhdCdzIGEgZ2lybCB0byBkbz8gKEhpbnQ6IE1vbnN0ZXJzIEhBVEUga2lzc2VzISkgVGhlIGRlbGlnaHRmdWxseSBzd2VldCBlbmRpbmcgd2lsbCBoYXZlIGV2ZXJ5IGtpZOKAlGFuZCBsaXR0bGUgbW9uc3RlcuKAlGJlZ2dpbmcgZm9yIGFuIGVuY29yZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxMkVFVmxGZVZMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJNb25zdGVycyBMb3ZlIFNjaG9vbFwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIk1pa2UgQXVzdGluXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJNaWtlIEF1c3RpblwiLFxuICAgICAgICBcInllYXJcIjogMjAxNCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkZhbnRhc3lcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiTW9uc3RlcnNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNS0xMC0xMFQwNzowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCBsaWtlXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTdW1tZXIgaXMgb3ZlciwgYW5kIG5vdyBpdCBpcyB0aW1lIGZvciB0aGUgYmlnZ2VzdCBhZHZlbnR1cmUgb2YgYWxsLCBNb25zdGVyIFNjaG9vbC4gSm9pbiB0aGVzZSBjb2xvcmZ1bCBtb25zdGVycyBhcyB0aGV5IGdvIHRvIHNjaG9vbCBmb3IgdGhlIGZpcnN0IHRpbWUuIFJlYWRpbmcgYW5kIHdyaXRpbmcgYW5kIGxlYXJuaW5nIG1vbnN0ZXIgaGlzdG9yeSBoYXMgbmV2ZXIgYmVlbiBzbyBtdWNoIGZ1bi4gTmVydm91cyBtb25zdGVycyBhdHRlbmRpbmcgc2Nob29sIGZvciB0aGUgZmlyc3QgdGltZSBsZWFybiBuZXcgdGhpbmdzLCBtYWtlIGZyaWVuZHMsIGFuZCBzYW1wbGUgQ2hlZiBPY3RpJ3Mgc3BlY2lhbCBTY2hvb2wgR3J1ZWwuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MWdxNDdVVzZ2TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTW9udHkncyBNYWduaWZpY2VudCBNYW5lXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiR2VtbWEgTydOZWlsbFwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiR2VtbWEgTydOZWlsbFwiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiTGlvbnMsIE1lZXJrYXRcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0xMlQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1vbnR5IHRoZSBsaW9uIGxvdmVzIGhpcyBsb25nLCBnb2xkZW4gbWFuZSwgc28gaGXigJlzIG5vdCBoYXBweSB3aGVuIGhpcyBtZWVya2F0IGZyaWVuZHMgbWVzcyBpdCB1cC4gU3RvbXBpbmcgb2ZmIHRvIHRoZSB3YXRlcmhvbGUsIGhl4oCZcyBjaGVlcmVkIHVwIGJ5IHRoZSBmbGF0dGVyeSBvZiBhIG5ldyBmcmllbmQgLiAuIC4gYSBncmVlbiBmcmllbmQgLiAuIC4gYSBiaWcsIGdyZWVuIGZyaWVuZC4gV2l0aCBhIFNOQVAgTW9udHkgcmVhbGl6ZXMgdGhhdCBoaXMgZmxhdHRlcmluZyBwYWwgaXMgYWN0dWFsbHkgYSBnaWFudCBjcm9jb2RpbGUgbG9va2luZyBmb3IgZGlubmVyLiBBbmQgaXTigJlzIHVwIHRvIE1vbnR5IHRvIHNhdmUgZXZlcnlvbmU/4oCUP2luY2x1ZGluZyBoaW1zZWxmIVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvOTF1eHFlNzFKOUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk1yLiBHb2F0J3MgVmFsZW50aW5lXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRXZlIEJ1bnRpbmdcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIktldmluIFppbW1lclwiLFxuICAgICAgICBcInllYXJcIjogMjAxNixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiR29hdHNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0xMlQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCBsaWtlXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQWZ0ZXIgcmVhZGluZyBpbiB0aGUgbmV3c3BhcGVyIHRoYXQgaXQncyBWYWxlbnRpbmUncyBEYXksIE1yLiBHb2F0IHNldHMgb3V0IGluIHNlYXJjaCBvZiB2ZXJ5IHNwZWNpYWwgZ2lmdHMgZm9yIGhpcyBmaXJzdCBsb3ZlLiBCdXQganVzdCB3aGF0IHdvdWxkIGEgZ29hdCBjaG9vc2UgYXMgdGhlIHBlcmZlY3QgZ2lmdHMgdG8gc2hvdyBob3cgaGUgZmVlbHM/IFJlYWRlcnMgd2lsbCBiZSBpbiBmb3IgYSBzdXJwcmlzZSBhdCBNci4gR29hdCdzIG5vbnRyYWRpdGlvbmFsIHNlbGVjdGlvbnMuIEZyb20gYWNjbGFpbWVkIGNoaWxkcmVuJ3MgYXV0aG9yIEV2ZSBCdW50aW5nIGNvbWVzIGEgc3dlZXQgaG9saWRheSB0YWxlIHN1cmUgdG8gd2FybSBoZWFydHMgb24gVmFsZW50aW5lJ3MgRGF5IGFuZCBldmVyeSBkYXkgb2YgdGhlIHllYXIuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MUN1R3M2YVRJTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTXIuIEhhcmUncyBCaWcgU2VjcmV0XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSGFubmFoIERhbGVcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkhhbm5haCBEYWxlXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE2LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJIYXJlcywgRm9yZXN0IEFuaW1hbHNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMy0xN1QwNzowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiTm9uZVwiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTXIuIEhhcmUgaGFzIGEgc2VjcmV0OiB0aGVyZSBhcmUgYmlnLCBqdWljeSBjaGVycmllcyBhdCB0aGUgdG9wIG9mIHRoZSB0cmVlLCBidXQgaGUgbmVlZHMgaGlzIGZyaWVuZHPigJkgaGVscCB0byBnZXQgdGhlbSBkb3duLiBPbmUgYnkgb25lLCBoZSB0cmlja3MgZWFjaCBmcmllbmQgaW50byBkYW5jaW5nIHdpdGggaGltIHVuZGVyIHRoZSB0cmVlLCB1bnRpbCBhbGwgdGhlIGNoZXJyaWVzIGZhbGwgdG8gdGhlIGdyb3VuZCBhbmQgdGhlIGZvcmVzdCBmcmllbmRzIGhhdmUgYSBncmVhdCBmZWFzdC5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxMlVxMEhyMUNMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJNdW1teSBDYXRcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJNYXJjdXMgRXdlcnRcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkxpc2EgQnJvd25cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkNhdHMsIE11bW1pZXMsIENsZW9wYXRyYVwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNdW1teSBDYXQgcHJvd2xzIGhpcyBweXJhbWlkIGhvbWUsIGxvbmdpbmcgZm9yIGhpcyBiZWxvdmVkIG93bmVyLiBBcyBoZSByb2FtcyB0aGUgdG9tYiwgbGF2aXNoIG11cmFscyBhYm92ZSBoaXMgaGVhZCBkaXNwbGF5IHNjZW5lcyBvZiB0aGUgY2F0IHdpdGggaGlzIHlvdW5nIEVneXB0aWFuIHF1ZWVuLCBjcmVhdGluZyBhIHN0b3J5LXdpdGhpbi1hLXN0b3J5IGFib3V0IHRoZSBldmVudHMgb2YgY2VudHVyaWVzIHBhc3QuIEhpZGRlbiBoaWVyb2dseXBocyBkZWVwZW4gdGhlIHRhbGUgYW5kIGFyZSBleHBsYWluZWQgaW4gYW4gaW5mb3JtYXRpdmUgYXV0aG9y4oCZcyBub3RlLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFwaEJ1Z29JdkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk11bmdvIGFuZCB0aGUgU3BpZGVycyBGcm9tIFNwYWNlXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiVGltb3RoeSBLbmFwbWFuXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJBZGFtIFN0b3dlclwiLFxuICAgICAgICBcInllYXJcIjogMjAwOSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJTcGFjZSwgSGVyb3MsIFZveWFnZXNcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk11bmdvIGlzIHB1bGxlZCBpbnRvIHRoZSBwYWdlcyBvZiBoaXMgc3BhY2UgYWR2ZW50dXJlIGNvbWljLCB3aGVyZSBoZSBtdXN0IGJhdHRsZSB0aGUgZXZpbCBEci4gRnJhbmtlbnN0aW5rZXIsIGEgcmFnaW5nIEdvYmJsZWJlYXN0LCBhbmQgYW4gZW50aXJlIHJvYm90IHNwaWRlciBhcm15LiBXaGVuIE11bmdvIGRpc2NvdmVycyB0aGF0IHRoZSBsYXN0IHBhZ2Ugb2YgaGlzIGV4Y2l0aW5nIHNwYWNlIGFkdmVudHVyZSBzdG9yeSBpcyBtaXNzaW5nLCBoZSBqdW1wcyBpbnRvIHRoZSBib29rIHRvIHNhdmUgQ2FwdGFpbiBHYWxhY3RpY3VzIGFuZCBmb2lsIERyLiBGcmFua2Vuc3RpbmtlcidzIGRhc3RhcmRseSBwbGFuIHRvIHJ1bGUgdGhlIHVuaXZlcnNlLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvOTFyd1B2dHBrRkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk11bnNjaHdvcmtzXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJUaGUgRmlyc3QgTXVuc2NoIENvbGxlY3Rpb25cIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJSb2JlcnQgTXVuc2NoXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJNaWNoYWVsIE1hcnRjaGVua29cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDE5OTgsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlNob3J0IFN0b3JpZXNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiT1dOXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTG92ZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDYsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUaGUgc3RvcmllcyBpbiB0aGlzIE11bnNjaCBjb2xsZWN0aW9uIGFyZTog4oCiIFRoZSBQYXBlciBCYWcgUHJpbmNlc3Mg4oCiIEkgSGF2ZSB0byBHbyEg4oCiIERhdmlk4oCZcyBGYXRoZXIg4oCiIFRoZSBGaXJlIFN0YXRpb24g4oCiIFRob21hc+KAmSBTbm93c3VpdFwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTEzaGlVR3RKbUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk11c3RhY2hlIEJhYnlcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJCcmlkZ2V0IEhlb3NcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkpveSBBbmdcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTMsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQmFiaWVzLCBNdXN0YWNoZXNcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMb3ZlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIldoZW4gQmFieSBCaWxseSBpcyBib3JuIHdpdGggYSBtdXN0YWNoZSwgaGlzIGZhbWlseSB0YWtlcyBpdCBpbiBzdHJpZGUuIFRoZXkgYXJlIHJlYXNzdXJlZCB3aGVuIGhlIG5vYmx5IHNhdmVzIHRoZSBkYXkgaW4gaW1hZ2luYXJ5LXBsYXkgc2Vzc2lvbnMgYXMgYSBjb3dib3kgb3IgY29wIGFuZCBoaXMgbXVzdGFjaGUgbG9va3MgZ29vZC1ndXkgZ3JlYXQuIEJ1dCBhcyB0aW1lIHBhc3NlcywgdGhlaXIgd29yc3QgZmVhcnMgYXJlIGNvbmZpcm1lZCB3aGVuIGxpdHRsZSBCaWxseeKAmXMgbXVzdGFjaGUgc3RhcnRzIHRvIGN1cmwgdXAgYXQgdGhlIGVuZHMgaW4gYSBzdXNwaWNpb3VzbHkgdmlsbGFpbm91cyBmYXNoaW9uLiBTdXJlIGVub3VnaCwg4oCcQmlsbHnigJlzIGRpc3JlcHV0YWJsZSBtdXN0YWNoZSBsZWQgaGltIGludG8gYSBsaWZlIG9mIGRyZWFkZnVsIGNyaW1lLuKAnSBQbGVudHkgb2YgdG9uZ3VlLWluLWNoZWVrIGh1bW9yIGFuZCBjYXJ0b29uaXNoIGlsbHVzdHJhdGlvbnMgbWFrZSB0aGlzIHRoZSBwZXJmZWN0IGJhYnktc2hvd2VyIGdpZnQgZm9yIGEgbXVzdGFjaGlvZWQgZmF0aGVyLXRvLWJlLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFDQUkxcW5CVkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk11c3RhY2hlIEJhYnkgTWVldHMgSGlzIE1hdGNoXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQnJpZGdldCBIZW9zXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJKb3kgQW5nXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIk11c3RhY2hlcywgQ29tcGV0aXRpb25zLCBUb2RkbGVyc1wiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxvdmVkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiA0LFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiV2hlbiBCYWJ5IEphdmllciBjb21lcyBmb3IgYSBwbGF5ZGF0ZSwgQmFieSBCaWxseSwgYS5rLmEuIE11c3RhY2hlIEJhYnksIGZlZWxzIHRoZSBuZWVkIHRvIHNob3cgaGltIGEgdGhpbmcgb3IgdHdvLCBzZWVpbmcgaG93IEphdmllcuKAmXMgbmV3IHRvIHRvd27igJRhbmQgYWxzbyBzcG9ydHMgYW4gaW1wcmVzc2l2ZSBiZWFyZC4gV2hhdCBlbnN1ZXMgaXMgYSBoaWxhcmlvdXMgdGVzdCBvZiB3aWxscyBhbmQgZmFjaWFsIGhhaXIsIGFzIGVhY2ggYmFieSBzZXRzIG91dCB0byBwcm92ZSBoaXMgbWFubGluZXNzLiBJdCBzZWVtcyBNdXN0YWNoZSBCYWJ5IG1heSBoYXZlIHRydWx5IG1ldCBoaXMgbWF0Y2ggLiAuIC4gYnV0IG9uZS11cG1hbnNoaXAgaXNu4oCZdCB0aGUgcG9pbnQgb2YgYSBwbGF5ZGF0ZSwgaXMgaXQ/XCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MW9PcXJETzN1TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTXVzdGFjaGUhXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTWFjIEJhcm5ldHRcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIktldmluIENvcm5lbFwiLFxuICAgICAgICBcInllYXJcIjogMjAxMSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJNdXN0YWNoZXMsIFByaWRlLCBWYW5pdHksIEtpbmdzLCBSdWxlcnNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0xMlQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTG92ZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDYsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJLaW5nIER1bmNhbiBpcyB0ZXJyaWJseSBoYW5kc29tZSwgYnV0IGEgdGVycmlibGUga2luZy4gSGlzIGtpbmdkb20gaXMgaW4gcnVpbnMsIGFuZCB3aGVuIGhpcyBzdWJqZWN0cyBhcHBlYWwgZm9yIGhlbHAsIGhlIG9ubHkgYnVpbGRzIG1vcmUgdHJpYnV0ZXMgdG8gaGlzIGhhbmRzb21lIGZhY2UuIEhpcyBzdWJqZWN0cyBhcmUgZmluYWxseSByZWFkeSB0byBzdGFuZCB1cCBmb3IgdGhlbXNlbHZlcywgYW5kIHRoZXkgaGF2ZSBqdXN0IHRoZSBwbGFuIHRvIGdldCBvdXQgb2YgdGhpcyBoYWlyeSBzaXR1YXRpb24uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy84MTlQVytTT0dRTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTXkgTHVja3kgRGF5XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiS2Vpa28gS2FzemFcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIktlaWtvIEthc3phXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDA1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJGb3hlcywgUGlnc1wiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAyLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiV2hlbiBhIGRlbGljaW91cy1sb29raW5nIHBpZ2xldCBrbm9ja3Mgb24gTXIuIEZveCdzIGRvb3IgXFxcImFjY2lkZW50YWxseSxcXFwiIHRoZSBmb3ggY2FuIGhhcmRseSBiZWxpZXZlIGhpcyBnb29kIGx1Y2suIEl0J3Mgbm90IGV2ZXJ5IGRheSB0aGF0IGRpbm5lciBqdXN0IHNob3dzIHVwIG9uIHlvdXIgZG9vcnN0ZXAuIEl0IG11c3QgYmUgaGlzIGx1Y2t5IGRheSEgT3IgaXMgaXQ/IEJlZm9yZSBNci4gRm94IGNhbiBzYXkgZ3JhY2UsIHRoZSBwaWdsZXQgaGFzIG1hbmlwdWxhdGVkIGhpbSBpbnRvIGdpdmluZyBoaW0gYSBmYWJ1bG91c2x5IHRhc3R5IG1lYWwsIHRoZSBmdWxsIHNwYSB0cmVhdG1lbnQgKHdpdGggYmF0aCBhbmQgbWFzc2FnZSksIGFuZCAuIC4gLiBmcmVlZG9tLiBJbiBhIGZ1bm55IHRyaWNrc3RlciB0YWxlIG9mIGhlciBvd24sIEthc3phIGtlZXBzIHJlYWRlcnMgZ3Vlc3NpbmcgdW50aWwgdGhlIHN1cnByaXNlIGVuZGluZyB3aGVuIHRoZXknbGwgcmVhbGl6ZSBpdCB3YXMgcGlnbGV0J3MgbHVja3kgZGF5IGFsbCBhbG9uZy5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxdTNwb1FKaVpMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJNeSBQZXQgQm9va1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkJvYiBTdGFha2VcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkJvYiBTdGFha2VcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTQsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiUGV0cywgSW1hZ2luYXRpb25cIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0xMlQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTG92ZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogNCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1vc3QgcGV0cyBhcmUgY2F0cyBhbmQgZG9ncywgYnV0IHdoYXQgaGFwcGVucyB3aGVuIGEgYm95IHdhbnRzIGEgZGlmZmVyZW50IGtpbmQgb2YgcGV0LCBvbmUgdGhhdCBkb2VzbuKAmXQgbWVvdyBvciBiYXJrPyBCb2IgU3RhYWtl4oCZcyBleHViZXJhbnQgdGFsZSBvZiBhIGxpdHRsZSBib3kgYW5kIHRoZSBwZXQgb2YgaGlzIGRyZWFtcyB3aWxsIGFwcGVhbCB0byBhbnlvbmUgd2hvc2UgYmVzdCBmcmllbmRzIGFyZSAuIC4gLiBib29rcyEgQm9va3MgbWFrZSB0aGUgcGVyZmVjdCBwZXRzLCB0aGUgYm95IGRlY2lkZXMsIGFuZCBjaG9vc2VzIGEgYnJpZ2h0IHJlZCBvbmUuIFdoZW4gaXQgZ29lcyBtaXNzaW5nLCBhIGxpdmVseSBhZHZlbnR1cmUgaXMgaW4gc3RvcmUgZm9yIHJlYWRlcnMgd2hvIGxvdmUgYSBoYXBweSBlbmRpbmcuIFNvb24ga2lkcyBldmVyeXdoZXJlIHdpbGwgd2lzaCBmb3IgYSBwZXQgYm9vayBvZiB0aGVpciB2ZXJ5IG93bi5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzgxVDM2ZloydjRMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJNeSBUZWFjaGVyIElzIEEgTW9uc3RlciFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vIEkgYW0gTm90XCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiUGV0ZXIgQnJvd25cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlBldGVyIEJyb3duXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIk1vbnN0ZXJzLCBTY2hvb2xzLCBUZWFjaGVyc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTEyVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMb3ZlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogNixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkEgeW91bmcgYm95IG5hbWVkIEJvYmJ5IGhhcyB0aGUgd29yc3QgdGVhY2hlci4gU2hlJ3MgbG91ZCwgc2hlIHllbGxzLCBhbmQgaWYgeW91IHRocm93IHBhcGVyIGFpcnBsYW5lcywgc2hlIHdvbid0IGFsbG93IHlvdSB0byBlbmpveSByZWNlc3MuIFNoZSBpcyBhIG1vbnN0ZXIhIEx1Y2tpbHksIEJvYmJ5IGNhbiBnbyB0byBoaXMgZmF2b3JpdGUgc3BvdCBpbiB0aGUgcGFyayBvbiB3ZWVrZW5kcyB0byBwbGF5LiBVbnRpbCBvbmUgZGF5Li4uIGhlIGZpbmRzIGhpcyB0ZWFjaGVyIHRoZXJlISBPdmVyIHRoZSBjb3Vyc2Ugb2Ygb25lIGRheSwgQm9iYnkgbGVhcm5zIHRoYXQgbW9uc3RlcnMgYXJlIG5vdCBhbHdheXMgd2hhdCB0aGV5IHNlZW0uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy85MWZ6Y2ZLaDNqTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTmF1Z2h0eSBNYWJlbFwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIk5hdGhhbiBMYW5lXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJEYW4gS3JhbGxcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkRvZ3MsIEh1bW9yb3VzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIk9XTlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxvdmVkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDYsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNZWV0IE1hYmVsLCB0aGUgZmFuY2llc3QgRnJlbmNoIGJ1bGxkb2cgdGhlIEhhbXB0b25zIGhhdmUgZXZlciBzZWVuLiBNYWJlbCBpcyBtYW55IHRoaW5nczogc2Fzc3ksIGNsYXNzeSAoYW5kIHNvbWV0aW1lcyBhIGJpdCBnYXNzeSEpLCBidXQgZXNwZWNpYWxseSAuLi4gbmF1Z2h0eSEgTWFiZWwgcyBhbHdheXMgZ2V0dGluZyBoZXJzZWxmIGludG8gdHJvdWJsZSBhbmQgd2l0aCBzdHlsZSBsaWtlIGhlcnMsIGNhbiB5b3UgcmVhbGx5IGJsYW1lIGhlcj8gV2hlbiBOYXVnaHR5IE1hYmVsIHMgcGFyZW50cyB0aHJvdyBhIHBhcnR5IGFuZCB0cnkgdG8gbGVhdmUgaGVyIG91dCBvZiB0aGUgZnVuLCBvZiBjb3Vyc2Ugc2hlIG11c3QgdGFrZSBtYXR0ZXJzIGludG8gaGVyIG93biBwZXJmZWN0bHkgcGVkaWN1cmVkIHBhd3MuIEFzIHRoZSBoaWxhcml0eSBlbnN1ZXMsIE1hYmVsIGFuZCBoZXIgcGFyZW50cyBsZWFybiB0aGF0IHRocm91Z2ggdGhpY2sgYW5kIHRoaW4sIG5hdWdodHkgb3IgbmljZSwgdGhleSBsbCBhbHdheXMgYmUgYSBmYW1pbHksIGp1c3QgYXMgdGhleSBhcmUuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MXVFTDgwOEQ1TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiTm9uaSB0aGUgUG9ueSBHb2VzIHRvIHRoZSBCZWFjaFwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkFsaXNvbiBMZXN0ZXJcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkFsaXNvbiBMZXN0ZXJcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkhvcnNlc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTExLTI0VDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMyxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk5vbmkgdGhlIFBvbnkgYW5kIGhlciBmcmllbmRzIGFyZSBvZmYgdG8gdGhlIGJlYWNoISBUaGVpciBwbGF5ZnVsIGRheSBpcyBnb2luZyBzd2ltbWluZ2x54oCUdW50aWwgRGF2ZSBEb2cgZm9sbG93cyBhIHdoYWxlIGEgYml0IHRvbyBmYXIgb3V0IHRvIHNlYS4gTHVja2lseSwgTm9uaSBpcyB0aGVyZSB0byByZXNjdWUgdGhlIHBvb3IgcHVwIGFuZCBicmluZyBoaW0gYmFjayB0byBzYWZldHnigKZhbmQgYmFjayB0byB0aGUgZnVuIVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFvelBGcEppRkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk5vdCB5b3VyIFR5cGljYWwgRHJhZ29uXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRGFuIEJhci1lbFwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiVGltIEJvd2Vyc1wiLFxuICAgICAgICBcInllYXJcIjogMjAxMyxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkZhbnRhc3lcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRHJhZ29uc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTA5LTExVDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogNSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlxcXCJXaGVuIENyaXNwaW4gQmxhemUgdHVybnMgc2V2ZW4sIGhlJ3MgZXhwZWN0ZWQgdG8gYnJlYXRoZSBmaXJlIGxpa2UgYWxsIHRoZSBvdGhlciBkcmFnb25zLiBCdXQgaW5zdGVhZCBvZiBmaXJlLCBoZSBicmVhdGhlcyBhIGhvc3Qgb2YgdW51c3VhbCB0aGluZ3NcXFwiLS1Qcm92aWRlZCBieSBwdWJsaXNoZXIuIFdoZW4gQ3Jpc3BpbiBCbGF6ZSB0dXJucyBzZXZlbiB5ZWFycyBvbGQsIGhlIGlzIGV4cGVjdGVkIHRvIGJyZWF0aGUgZmlyZSBsaWtlIGFsbCB0aGUgb3RoZXIgZHJhZ29ucywgYnV0IGluc3RlYWQgb2YgZmlyZSwgaGUgYnJlYXRoZXMgYSBob3N0IG9mIHVudXN1YWwgdGhpbmdzLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFVNFlFaEZlOUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk51Z2dldCBhbmQgRmFuZ1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiRnJpZW5kcyBGb3JldmVy4oCUb3IgU25hY2sgVGltZT9cIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJUYW1taSBTYXVlclwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiTWljaGFlbCBTbGFja1wiLFxuICAgICAgICBcInllYXJcIjogMjAxMyxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiU2hhcmtzLCBGaXNoXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMTEtMjRUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJbiB0aGUgZGVlcCBvY2VhbiwgdGlueSBOdWdnZXQgYW5kIGJpZywgdG9vdGh5IEZhbmcgZ2V0IGFsb25nIHN3aW1taW5nbHktLXVudGlsIE51Z2dldCdzIGZpcnN0IGRheSBvZiBtaW5ub3cgc2Nob29sLiBUaGVyZSBOdWdnZXQgbGVhcm5zIHRoYXQgbWlubm93cyBhcmUgc3VwcG9zZWQgdG8gYmUgYWZyYWlkIG9mIHNoYXJrcyEgVG8gcmVnYWluIE51Z2dldCdzIHRydXN0LCBGYW5nIHRha2VzIGRlc3BlcmF0ZSAoYW5kIGhpbGFyaW91cykgbWVhc3VyZXMuIEJ1dCBpdCdzIG5vdCB1bnRpbCBoaXMgYmlnIHNoYXJwIHRlZXRoIHNhdmUgdGhlIGVudGlyZSBzY2hvb2wgdGhhdCBtaW5ub3dzIGxlYXJuIHRoaXMgc2hhcmsgaXMgbm8gZm9lLiBGYW50YXN0aWNhbGx5IHN0eWxpemVkIGFydHdvcmsgYWRkcyBldmVuIG1vcmUgaHVtb3IgdG8gdGhpcyB1bmRlcnNlYSBzdG9yeSBvZiB1bmxpa2VseSBmcmllbmRzaGlwLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFlTVc3UWJYZ0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk9mZmljZXIgUGFuZGEsIEZpbmdlcnByaW50IERldGVjdGl2ZVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkFzaGxleSBDcm93bGV5XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJBc2hsZXkgQ3Jvd2xleVwiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiUGFuZGFzLCBEZXRlY3RpdmVzXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiV2hlbiBPZmZpY2VyIFBhbmRhIG5vdGljZXMgc29tZSBzdHJhbmdlIGZpbmdlcnByaW50cyBpbiBoaXMgbmVpZ2hib3Job29kLCBoZSBzZXRzIG91dCB0byBzb2x2ZSB0aGUgY3VyaW91cyBjYXNlLiBDaGlsZHJlbiB3aWxsIGdpZ2dsZSBhbG9uZyBhcyB0aGV5IGhlbHAgT2ZmaWNlciBQYW5kYSBmaWd1cmUgb3V0IHdobydzIGJlZW4gbGVhdmluZyBteXN0ZXJpb3VzIHByaW50cyBldmVyeXdoZXJlLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNDFoMWFHa2Mxc0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk9oIE5vLCBHZW9yZ2UhXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQ2hyaXMgSGF1Z2h0b25cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkNocmlzIEhhdWdodG9uXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEyLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJEb2dzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMTItMzFUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDMsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJHZW9yZ2UgZmluZHMgaXQgaGFyZCB0byBiZSBhIGdvb2QgZG9nIHdoZW4gdGhlcmUgYXJlIGNhdHMgdG8gY2hhc2UsIGZsb3dlcnMgdG8gZGlnIHVwLCBhbmQgYSBkZWxpY2lvdXMgY2FrZSBzaXR0aW5nIG9uIHRoZSBraXRjaGVuIHRhYmxlLiBHZW9yZ2UgdHJpZXMgdmVyeSBoYXJkIHRvIGJlIGEgZ29vZCBkb2csIGJ1dCBoZSBpcyB0ZW1wdGVkIHRvIGVhdCB0aGUgZGVsaWNpb3VzIGNha2Ugb24gdGhlIGtpdGNoZW4gdGFibGUsIGNoYXNlIHRoZSBjYXRzLCBhbmQgZGlnIHVwIHRoZSBmbG93ZXJzLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjF5UFkyQkdvZEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk9oLCBubyFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJDYW5kYWNlIEZsZW1pbmdcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkVyaWMgUm9obWFublwiLFxuICAgICAgICBcInllYXJcIjogMjAxMixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiU3RvcmllcyBpbiBSaHltZVwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiWW91bmcgY2hpbGRyZW4gd2lsbCBkZWxpZ2h0IGluIHJlcGVhdGluZyB0aGUgcmVmcmFpbiBcXFwiT0gsIE5PIVxcXCIgYXMgb25lIGFuaW1hbCBhZnRlciBhbm90aGVyIGZhbGxzIGludG8gYSBkZWVwLCBkZWVwIGhvbGUgaW4gdGhpcyBsaXZlbHkgcmVhZC1hbG91ZC4gVGhpcyBzaW1wbGUgYW5kIGlycmVzaXN0aWJsZSBwaWN0dXJlIGJvb2sgYnkgaHVnZWx5IHBvcHVsYXIgcGljdHVyZSBib29rIGNyZWF0b3Jz4oCUQ2FuZGFjZSBGbGVtaW5nIGFuZCBDYWxkZWNvdHQgbWVkYWxpc3QgRXJpYyBSb2htYW5u4oCUZmVlbHMgbGlrZSBhIGNsYXNzaWMtaW4tdGhlLW1ha2luZy4gRmFucyBvZiBSb2htYW5uJ3MgQ2FsZGVjb3R0IE1lZGFswq0td2lubmluZyBNeSBGcmllbmQgUmFiYml0LCB3aWxsIGJlIHRocmlsbGVkIHRvIHNlZSBhIG5ldyBib29rIGNyZWF0ZWQgaW4gdGhlIHNhbWUgZXhwcmVzc2l2ZSBhbmQgY29taWNhbCBzdHlsZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzQxMFV1RzBKZkFMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJPbGl2aWFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJJYW4gRmFsY29uZXJcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIklhbiBGYWxjb25lclwiLFxuICAgICAgICBcInllYXJcIjogMjAwMCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiUGlncywgQmVoYXZpb3JcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIldoZXRoZXIgYXQgaG9tZSBnZXR0aW5nIHJlYWR5IGZvciB0aGUgZGF5LCBlbmpveWluZyB0aGUgYmVhY2gsIG9yIGF0IGJlZHRpbWUsIE9saXZpYSBpcyBhIGZlaXN0eSBwaWcgd2hvIGhhcyB0b28gbXVjaCBlbmVyZ3kgZm9yIGhlciBvd24gZ29vZC5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxSUlWNm1ZMElMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJPbGl2aWEgU2F2ZXMgdGhlIENpcmN1c1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIklhbiBGYWxjb25lclwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiSWFuIEZhbGNvbmVyXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEwLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJQaWdzLCBDaXJjdXMsIFNjaG9vbFwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiV2hlbiBhbGwgb2YgdGhlIHBlcmZvcm1lcnMgYXQgdGhlIGNpcmN1cyBhcmUgb3V0IHNpY2sgd2l0aCBlYXIgaW5mZWN0aW9ucywgaXQncyB1cCB0byBPbGl2aWEgdG8gc2F2ZSB0aGUgZGF5ISBUaGF0J3Mgbm8gcHJvYmxlbSBmb3IgT2xpdmlhLCBvZiBjb3Vyc2UsIGJlY2F1c2Ugc2hlIGtub3dzIGhvdyB0byBkbyBldmVyeXRoaW5nLiBGcm9tIGxpb24gdGFtaW5nIHRvIHRyYW1wb2xpbmUganVtcGluZywgdW5pY3ljbGluZyB0byB0aWdodC1yb3BlIHdhbGtpbmcsIE9saXZpYSBpcyB0aGUgdWx0aW1hdGUgcGVyZm9ybWVyLS13aXRoIHRoZSB1bHRpbWF0ZSBpbWFnaW5hdGlvbi4gTm93IGluIGEgYm9hcmQgYm9vayBlZGl0aW9uIHBlcmZlY3QgZm9yIGxpdHRsZSBoYW5kcywgcmVhZGVycyB3aWxsIGRlbGlnaHQgdG8gc2VlIGhvdyBSaW5nbWFzdGVyIE9saXZpYSBsZWFybnMgdG8gZmx5IVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTEzTEJibkZvaUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk9sbGllIGFuZCBDbGFpcmVcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJUaWZmYW55IFN0cmVsaXR6IEhhYmVyXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJNYXR0aGV3IENvcmRlbGxcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTMsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkRvZ3MsIEZyaWVuZHNoaXAsIEJlc3QgRnJpZW5kcywgU3RvcmllcyBpbiBSaHltZVwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiT2xsaWUgYW5kIENsYWlyZSBhcmUgYXMgdGlnaHQgYXMgdHdvIGZyaWVuZHMgY2FuIGJlLiBFdmVyeSBkYXkgdGhleSBwaWNuaWMgdG9nZXRoZXIsIGV2ZXJ5IGRheSB0aGV5IGRvIHlvZ2EgdG9nZXRoZXIsIGFuZCBldmVyeSBldmVuaW5nIHRoZXkgZWF0IGRpbm5lciB0b2dldGhlci4gQnV0IHdoZW4gQ2xhaXJlIGxvbmdzIHRvIGJyZWFrIGZyZWUgZnJvbSB0aGlzIHJvdXRpbmUgYW5kIGRyZWFtcyBvZiB0cmF2ZWxpbmcgdGhlIHdvcmxkLCBzaGUgd29ycmllcyB0aGF0IE9sbGllIHdvdWxkIG5ldmVyIGpvaW4gaGVyLiBTbyBzaGUgdGFrZXMgbWF0dGVycyBpbnRvIGhlciBvd24gaGFuZHMgYW5kIGZpbmRzIGEgbXlzdGVyaW91cyB0cmF2ZWwgcGFydG5lciB3aGVuIHNoZSBzZWVzIGEgc2lnbiBwb3N0ZWQgb24gYSB0cmVlLiBXaG8gY291bGQgaXQgYmU/IEFuZCBob3cgY2FuIHNoZSBldmVyIHRlbGwgT2xsaWU/IFdpdGggYSBmdW4gdHdpc3QgbGVhZGluZyB0byBhIHN1cnByaXNlIGVuZGluZywgT2xsaWUgYW5kIENsYWlyZSBpcyBhIHN3ZWV0IGFuZCBmdW4gdHJpYnV0ZSB0byBkeW5hbWljIGR1b3MgZXZlcnl3aGVyZSwgd2hvIG1pZ2h0IGZlZWwgdGhlIG5lZWQgdG8gbWl4IHRoaW5ncyB1cCBldmVyeSBvbmNlIGluIGEgd2hpbGUuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MXIxTkRoeXdYTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiT25lIEJlYXIgRXh0cmFvcmRpbmFpcmVcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJKYXltZSBNY0dvd2FuXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJKYXltZSBNY0dvd2FuXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJCZWFycywgQmFuZHMsIE11c2ljXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDMtMDNUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkJlYXIgd2FrZXMgdXAgb25lIG1vcm5pbmcgd2l0aCBhIHNvbmcgaW4gaGlzIGhlYWQsIGJ1dCBzb21ldGhpbmcgaXMgbWlzc2luZy4gV2hhdOKAmXMgYSBvbmUtYmVhciBiYW5kIHRvIGRvPyBIZSB0cmF2ZWxzIHRoZSBmb3Jlc3QgaW4gc2VhcmNoIG9mIGhpcyBzb25nIGFuZCBtZWV0cyBhIGZldyBvdGhlciBtdXNpY2lhbnMgYWxvbmcgdGhlIHdheSwgYnV0IGV2ZW4gd2l0aCB0aGVpciBoZWxwLCBoaXMgc29uZyBzdGlsbCBmZWVscyBpbmNvbXBsZXRlLiBXaWxsIEJlYXIgZmluZCB0aGUgcGVyZmVjdCBhY2NvbXBhbmltZW50IGFuZCBsZWFybiB0aGF0IGV2ZXJ5IHNvbmcgc291bmRzIHN3ZWV0ZXIgd2l0aCBmcmllbmRzIGJ5IGhpcyBzaWRlP1wiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvOTFTVG1MaVFyQkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk9uZSBDb29sIEZyaWVuZFwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlRvbmkgQnV6emVvXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJEYXZpZCBTbWFsbFwiLFxuICAgICAgICBcInllYXJcIjogMjAxMixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiUGVuZ3VpbnNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0yMVQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaGVuIHdlbGwtbWFubmVyZWQgRWxsaW90IHJlbHVjdGFudGx5IHZpc2l0cyB0aGUgYXF1YXJpdW0gd2l0aCBoaXMgZGlzdHJhY3RpYmxlIGZhdGhlciwgaGUgcG9saXRlbHkgYXNrcyB3aGV0aGVyIGhlIGNhbiBoYXZlIGEgcGVuZ3Vpbi0tYW5kIHRoZW4gcmVtb3ZlcyBvbmUgZnJvbSB0aGUgcGVuZ3VpbiBwb29sIHRvIGhpcyBiYWNrcGFjay4gVGhlIGZ1biBvZiBjYXJpbmcgZm9yIGEgcGVuZ3VpbiBpbiBhIE5ldyBFbmdsYW5kIFZpY3RvcmlhbiBob3VzZSBpcyBmb2xsb3dlZCBieSBhIHN1cnByaXNlIHJldmVsYXRpb24gYnkgRWxsaW90J3MgZmF0aGVyLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFINTA4TFY2aUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk9wZW4gVGhpcyBMaXR0bGUgQm9va1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkplc3NlIEtsYXVzbWVpZXIgXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJTdXp5IExlZVwiLFxuICAgICAgICBcInllYXJcIjogMjAxMyxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiSW50ZXJhY3RpdmVcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0yMVQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCBsaWtlXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaGF0IHdpbGwgeW91IGZpbmQgd2hlbiB5b3Ugb3BlbiB0aGlzIGxpdHRsZSBib29rPyBBIGZ1biBzdG9yeT8gU3dlZXQgY2hhcmFjdGVycz8gRW50aWNpbmcgcGljdHVyZXM/IFllcyEgQnV0IG11Y2ggbW9yZS4gT3BlbiB0aGlzIGJvb2sgYW5kIHlvdSB3aWxsIGZpbmQuLi5hbm90aGVyIGJvb2suLi5hbmQgYW5vdGhlci4uLmFuZCBhbm90aGVyLiBEZWJ1dCBhdXRob3IgSmVzc2UgS2xhdXNtZWllciBhbmQgbWFzdGVyIGJvb2sgY3JlYXRvciBTdXp5IExlZSBoYXZlIGNvbWJpbmVkIHRoZWlyIGNyZWF0aXZlIHZpc2lvbnMgdG8gY3JhZnQgYSBzZWVtaW5nbHkgc2ltcGxlIGJvb2sgYWJvdXQgY29sb3JzIGZvciB0aGUgdmVyeSB5b3VuZ2VzdCByZWFkZXJzLCBhbiBpbWFnaW5hdGl2ZSBleHBsb3JhdGlvbiBvZiB0aGUgYXJ0IG9mIGJvb2sgbWFraW5nIGZvciBtb3JlIHNvcGhpc3RpY2F0ZWQgYWZpY2lvbmFkb3MsIGFuZCBhIGNoYXJtaW5nIHN0b3J5IG9mIGZyaWVuZHNoaXAgYW5kIHRoZSBwb3dlciBvZiBib29rcyBmb3IgYWxsLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvODF2eWV6UU1BNkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk92ZXIgVGhlcmVcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJTdGV2ZSBQaWxjaGVyXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJTdGV2ZSBQaWxjaGVyXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJGcmllbmRzaGlwLCBNaWNlXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMTItMTBUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNocmVkZGVyIGlzIGEgbGl0dGxlIHNocmV3IHdobyBsaXZlcyBieSBoaW1zZWxmLCBhbmQgd2hpbGUgaGUgbG92ZXMgaGlzIGZvcmVzdCBob21lLCBoZSBnZXRzIGEgYml0IGxvbmVseS4gVGhlcmUgbXVzdCBiZSBzb21ldGhpbmcgbW9yZSwgaGUgdGhpbmtzLiBTbyB3aGVuIGhlIHNlZXMgYSBcXFwic2lsdmVyIGxpbmUgdHdpbmtsaW5nIGluIHRoZSBkaXN0YW5jZSxcXFwiIGhlIGRlY2lkZXMgdG8gZmluZCBvdXQgd2hhdCBpdCBpcy4gSGUgZGlzY292ZXJzIGEgYmVhdXRpZnVsIHN0cmVhbSwgYnV0IHRoZW4gaGUgZ2V0cyBjYXVnaHQgdXAgaW4gdGhlIGN1cnJlbnQhIEx1Y2tpbHksIGEgbW9sZSBuYW1lZCBOb3NleSBzYXZlcyBoaW0uIEFzIHRoZXkgZXhwbG9yZSwgU2hyZWRkZXIgYmVnaW5zIHRvIG1pc3MgdGhlIGZvcmVzdCwgc28gaGUgYW5kIE5vc2V5IHJldHVybiB0b2dldGhlciwgYW5kIFNocmVkZGVyIHJlYWxpemVzIHRoYXQgYWxsIGhlIHJlYWxseSBuZWVkZWQgd2FzIGEgZnJpZW5kLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFLQVRyUlFMdEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIk92ZXItc2NoZWR1bGVkIEFuZHJld1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkFzaGxleSBTcGlyZXNcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkFzaGxleSBTcGlyZXNcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTYsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkJpcmRzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDItMTlUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkFuZHJldyBsb3ZlcyBwdXR0aW5nIG9uIHBsYXlzIHNvIGhlIGRlY2lkZXMgdG8gam9pbiB0aGUgZHJhbWEgY2x1YiBhdCBzY2hvb2wuIERldGVybWluZWQgdG8gbWFrZSBoaXMgcGVyZm9ybWFuY2UgdGhlIGJlc3QgaXQgY2FuIGJlLCBoZSBqb2lucyB0aGUgZGViYXRlIGNsdWIgdG8gcHJhY3RpY2UgaGlzIHB1YmxpYyBzcGVha2luZy4gSGUgc2lnbnMgdXAgZm9yIGRhbmNlIGFuZCBrYXJhdGUgdG8gaGVscCB3aXRoIGhpcyBjb29yZGluYXRpb24uIFRoZW4gaGUncyBhc2tlZCB0byBwbGF5IGZvciB0aGUgdGVubmlzIHRlYW0gYW5kIGVkaXQgdGhlIHNjaG9vbCBuZXdzcGFwZXIuIEJlZm9yZSBsb25nIGhlJ3MgbGVhcm5pbmcgdG8gcGxheSB0aGUgYmFncGlwZXMsIGF0dGVuZGluZyBTcGFuaXNoIGNsYXNzZXMgYW5kIGpvaW5pbmcgdGhlIEZyZW5jaCBmaWxtIGNsdWIuIFN1ZGRlbmx5IEFuZHJldyBkb2Vzbid0IGhhdmUgdGltZSBmb3IgYW55dGhpbmcgb3IgYW55b25lIGVsc2UsIG5vdCBldmVuIGhpcyBiZXN0IGZyaWVuZCBFZGllLiBBbmQgaGUgZGVmaW5pdGVseSBkb2Vzbid0IGhhdmUgdGltZSB0byBzbGVlcC4gXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MWxJK3F5WUtrTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiUC5KLiBGdW5ueWJ1bm55IENhbXBzIE91dFwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIk1hcnlsaW4gU2FkbGVyXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJSb2dlciBCb2xsZW5cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDE5OTMsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlJhYmJpdHNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0xMlQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlR3byBnaXJscyB0YWcgYWxvbmcgb24gYSBib3lzJyBjYW1wb3V0LiBBbHRob3VnaCBQLkouIGFuZCBoaXMgZnJpZW5kcyByZWZ1c2UgdG8gbGV0IERvbm5hIGFuZCBIb25leSBCdW5ueSBnbyBjYW1waW5nIHdpdGggdGhlbSBiZWNhdXNlIFxcXCJjYW1waW5nIGlzIG5vdCBmb3IgZ2lybHMsXFxcIiB0aGUgZ2lybHMgZm9sbG93IGFuZCBnZXQgcHJvb2YgdGhhdCBjYW1waW5nIGlzIGhhcmQgd29yayBldmVuIGZvciBib3lzLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTF2d2htOU5NdEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlBhZGRpbmd0b25cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJNaWNoYWVsIEJvbmRcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlIuIFcuIEFsbGV5XCIsXG4gICAgICAgIFwieWVhclwiOiAyMDA3LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJCZWFyc1wiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk5lYXJseSBmaWZ0eSB5ZWFycyBhZ28sIGEgc21hbGwgYmVhciBmcm9tIERhcmtlc3QgUGVydSBzZXQgb3V0IG9uIGFuIGFkdmVudHVyZSBvZiBhIGxpZmV0aW1lLiBXaXRoIG5vdGhpbmcgYnV0IGEgc3VpdGNhc2UsIHNldmVyYWwgamFycyBvZiBtYXJtYWxhZGUsIGFuZCBhIGxhYmVsIGFyb3VuZCBoaXMgbmVjayB0aGF0IHJlYWQsIFxcXCJQbGVhc2UgTG9vayBBZnRlciBUaGlzIEJlYXIsXFxcIiBoZSBzdG93ZWQgYXdheSBvbiBhIHNoaXAgaGVhZGVkIGZvciBmYXJhd2F5IEVuZ2xhbmQuIFdoZW4gdGhlIGxpdHRsZSBiZWFyIGFycml2ZWQgYXQgTG9uZG9uJ3MgYnVzeSBQYWRkaW5ndG9uIFN0YXRpb24sIGhlIHdhcyBkaXNjb3ZlcmVkIGJ5IE1yLiBhbmQgTXJzLiBCcm93bi4gQXMgbHVjayB3b3VsZCBoYXZlIGl0LCB0aGUgQnJvd25zIHdlcmUganVzdCB0aGUgc29ydCBvZiBwZW9wbGUgdG8gd2VsY29tZSBhIGxvc3QgYmVhciBpbnRvIHRoZWlyIGZhbWlseS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxZXRkLTNJbFlMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJQZXBwYSBQaWcgYW5kIHRoZSBUcmVhc3VyZSBIdW50XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQ2FuZGxld2ljayBQcmVzc1wiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiQ2FuZGxld2ljayBQcmVzc1wiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiUGlnc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTI3VDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlBlcHBhIFBpZyBhbmQgaGVyIGxpdHRsZSBicm90aGVyLCBHZW9yZ2UsIGFyZSBleGNpdGVkIGFib3V0IHNwZW5kaW5nIHRoZSBkYXkgd2l0aCBHcmFubnkgUGlnIGFuZCBHcmFuZHBhIFBpZy4gQnV0IHdoZW4gdGhleSBhcnJpdmUsIHRoZXnigJlyZSBldmVuIG1vcmUgZXhjaXRlZCB0byBmaW5kIEdyYW5kcGEgUGlnIHdlYXJpbmcgYSBwaXJhdGUgaGF0IGFuZCBHcmFuZG1hIFBpZyBob2xkaW5nIGEgbWFwLiBJdOKAmXMgdGltZSBmb3IgYSB0cmVhc3VyZSBodW50IGluIHRoZSBiYWNreWFyZCEgWCBtYXJrcyB0aGUgc3BvdD/igJQ/YnV0IGhvdyB3aWxsIHRoZXkgZ2V0IHRoZXJlLCBhbmQgd2hhdCB3aWxsIHRoZXkgZmluZD9cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxdGxBSy1qU2tMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJQb2xhciBCZWFyJ3MgVW5kZXJ3ZWFyXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiVHVwZXJhIFR1cGVyYVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiVHVwZXJhIFR1cGVyYVwiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQmVhcnNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNS0xMi0zMVQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDMsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJQb2xhciBCZWFyIGhhcyBsb3N0IGhpcyB1bmRlcndlYXIhIFdoZXJlIGNvdWxkIGl0IGJlPyBUaGVyZSdzIG9ubHkgb25lIHRoaW5nIHRvIGRvOiBSZW1vdmUgdGhlIGJvb2sncyB1bmRlcndlYXItc2hhcGVkIGJlbGx5YmFuZCB0byBmaW5kIHRoZSBtaXNzaW5nIHBhaXIhIElzIHRoYXQgUG9sYXIgQmVhcidzIHVuZGVyd2Vhcj8gTm8sIGl0J3MgWmVicmEnc+KAlHNlZSB0aGUgY29sb3JmdWwgc3RyaXBlcz8gV2hhdCBhYm91dCB0aGF0IGl0dHktYml0dHkgcGFpcj8gTm8sIHRob3NlIGJlbG9uZyB0byBCdXR0ZXJmbHkhIEFuZCBzbyB0aGUgc2VhcmNoIGNvbnRpbnVlcywgd2l0aCBldmVyeSBwYWdlIHJldmVhbGluZyBhbiBhbmltYWwgaW4gZXllLXBvcHBpbmcgdW5kaWVzLiBUaGlzIGxhdWdoLW91dC1sb3VkLCBvbmUtb2YtYS1raW5kIG5vdmVsdHkgYm9vayBmcm9tIEphcGFuZXNlIGRlc2lnbiB0YWxlbnRzIHR1cGVyYSB0dXBlcmEgd2lsbCBzdXJwcmlzZSBhbmQgYW11c2UgY2hpbGRyZW4gYW5kIHRoZWlyIHBhcmVudHMsIGFsbCB3aGlsZSBhZmZpcm1pbmcgdGhlIGltcG9ydGFuY2Ugb2YgcHV0dGluZyBvbiB5b3VyIHVuZGVyd2Vhci5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxYUx4R25kMmNMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJQb29wZW5kb3VzIVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiVGhlIEluc2lkZSBTY29vcCBvbiBFdmVyeSBUeXBlIGFuZCBVc2Ugb2YgUG9vcCFcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJBcnRpZSBCZW5uZXR0XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJNaWtlIE1vcmFuXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEyLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkh1bW9yb3VzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMDktMTlUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiUmh5bWluZyBjb3VwbGV0cyBmZWF0dXJlIFByb2Zlc3NvciBQb29wZGVjayBhbmQgdHdvIHlvdW5nIGZyaWVuZHMgYXMgaGUgdGFrZXMgdGhlbSBvbiBhIHR5cGUgb2YgcG9vcCBzYWZhcmkuIFdvcmRzIGZvciBwb29wIChlLmcuLCBndWFubywgbnVtYmVyIHR3bywgY2EtY2EpLCBpdHMgZm9ybXMgYW5kIHN0eWxlcyAoY3ViZXMsIHR1YnVsYXIsIHdldCBhbmQgZHJ5KSwgYW5kIG15cmlhZCBvZiB1c2VzIChzb3V2ZW5pcnMsIGEgbWVhbnMgb2YgdHJhY2tpbmcgYW5kIG1hcmtpbmcsIGhvdXNpbmcgaW5zdWxhdGlvbiwgZm9vZCwgZmVydGlsaXplciwgZnVlbCwgZXRjLikgYXJlIGFsbCBjb252ZXllZCB3aXRoIGh1bW9yIGFuZCBhIGNlcnRhaW4gZGVtYW5kIGZvciByZXNwZWN0LiBJdCdzIGEgYm9vayB0aGF0IHNheXM6IERvbid0IGp1c3QgZmx1c2ggdGhpcyBzdHVmZiBhd2F5ISBXaGlsZSBpdCBtYXkgZGlzbWF5IGFuZCBzdGluaywgdGhlcmUncyBtb3JlIHRvIHRoaXMgdGhhbiB5b3UgbWlnaHQgdGhpbmshXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MVpsMytPQnhaTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiUHJpbmNlIG9mIEEgRnJvZ1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkphY2tpZSBVcmJhbm92aWNrXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJKYWNraWUgVXJiYW5vdmlja1wiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRnJvZ3NcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNS0wOS0xMVQwNzowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSG9wcGVyIGlzIGEgZnJvZyB3aG8gdGhpbmtzIGhlIGlzIGEgcHJpbmNlLCBzbyBoZSBzdGFydHMgb3V0IG9uIGFuIGFkdmVudHVyZSB0byBmaW5kIGEgcHJpbmNlc3MsIHdob3NlIGtpc3Mgd2lsbCB0cmFuc2Zvcm0gaGltIHRvIGhpcyByb3lhbCBzZWxmLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFsR09Qd20zbkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlByaW5jZXNzIEluIFRyYWluaW5nXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiVGFtbWkgU2F1ZXJcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkpvZSBCZXJnZXJcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTIsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiUHJpbmNlc3NcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0xMlQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgSXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJQcmluY2VzcyBWaW9sYSBpcyBncmVhdCBhdCBza2F0ZWJvYXJkaW5nIGFuZCBrYXJhdGUtY2hvcHBpbmcsIGJ1dCBzaGUncyBsb3VzeSBhdCB0aGUgcm95YWwgd2F2ZSwgd2FsaywgYW5kIHdhbHR6LiBUaGUga2luZyBhbmQgcXVlZW4gYXJlIG5vdCBwbGVhc2VkLiBXaGF0J3MgYSBwcmluY2VzcyB0byBkbz8gQXR0ZW5kIHNraWxsLXBvbGlzaGluZyBDYW1wIFByaW5jZXNzLCBvZiBjb3Vyc2UuIFZpb2xhIGlzIGEgc2thdGVib2FyZGluZywga2FyYXRlLWNob3BwaW5nLCBtb2F0LWRpdmluZyBwcmluY2VzcywgdG8gdGhlIGRpc3RyZXNzIG9mIGhlciBwYXJlbnRzLCBhbmQgc28gc2hlIGFjY2VwdHMgYW4gaW52aXRhdGlvbiB0byBQcmluY2VzcyBDYW1wLCBob3BpbmcgdG8gYmVjb21lIHRoZSBcXFwiZGFybGluZyBvZiBoZXIga2luZ2RvbS5cXFwiXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MTYyaDVuQ0E4TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiUHJpbmNlc3MgUGVlcGVyc1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlBhbSBDYWx2ZXJ0XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJQYW0gQ2FsdmVydFwiLFxuICAgICAgICBcInllYXJcIjogMjAwOCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJQcmluY2VzcywgR2xhc3Nlc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTEyVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBJdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIldoZW4gdGhlIG90aGVyIHByaW5jZXNzZXMgbWFrZSBmdW4gb2YgaGVyIGZvciB3ZWFyaW5nIGdsYXNzZXMsIFByaW5jZXNzIFBlZXBlcnMgdm93cyB0byBnbyB3aXRob3V0LCBidXQgYWZ0ZXIgc2V2ZXJhbCBtaXNoYXBzLCBvbmUgb2Ygd2hpY2ggaXMgZXNwZWNpYWxseSBjb2luY2lkZW50YWwsIHNoZSBhZG1pdHMgdGhhdCBzaGUgcmVhbGx5IGRvZXMgbmVlZCB0aGVtIGlmIHNoZSB3YW50cyB0byBzZWUuIFdoZW4gdGhlIG90aGVyIHByaW5jZXNzZXMgbWFrZSBmdW4gb2YgaGVyIGZvciB3ZWFyaW5nIGdsYXNzZXMsIFByaW5jZXNzIFBlZXBlcnMgdm93cyB0byBnbyB3aXRob3V0LCBidXQgYWZ0ZXIgc2V2ZXJhbCBtaXNoYXBzLS1vbmUgb2Ygd2hpY2ggaXMgZXNwZWNpYWxseSBjb2luY2lkZW50YWwtLXNoZSBhZG1pdHMgdGhhdCBzaGUgcmVhbGx5IGRvZXMgbmVlZCB0aGVtIGlmIHNoZSB3YW50cyB0byBzZWUuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MTU1SHl2aFg3TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiUHJpbmNlc3MgU2F5cyBHb29kbmlnaHRcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJOYW9taSBIb3dsYW5kXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJEYXZpZCBTbWFsbFwiLFxuICAgICAgICBcInllYXJcIjogMjAxMCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJQcmluY2Vzc2VzLCBCZWR0aW1lLCBJbWFnaW5hdGlvbiwgU3RvcmllcyBpbiBSaHltZVwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkhhdmUgbm90IHJlYWQgeWV0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaGVuIGEgbGl0dGxlIGdpcmwgcHJldGVuZHMgc2hlJ3MgYSByZWFsIHByaW5jZXNzLCBoZXIgaW1hZ2luYXRpb24gc29hcnMgYW5kIGhlciBiZWR0aW1lIHJvdXRpbmUgaXMgdHJhbnNmb3JtZWQgaW50byBhIG1hamVzdGljIGFmZmFpci4gV2hpbGUgcHJhY3RpY2luZyBjdXJ0c2llcyBvbiBoZXIgd2F5IHRvIGJlZCwgc2hlIGdldHMgdGhlIHJveWFsIHRyZWF0bWVudDogY2hvY29sYXRlIGNyZWFtIMOpY2xhaXJzLCBnbGFzcyBzbGlwcGVycywgbGFkaWVzLWluLXdhaXRpbmcsIGEgdGlhcmHigJRldmVuIGEgYnViYmxlIGJhdGggd2l0aCBhIHNwZWNpYWwgZmx1ZmZ5IHRvd2VsIHRvIGRyeSBoZXIgdG9lcy4gQmVpbmcgYSBwcmluY2VzcyBpcyBzbyBtdWNoIGZ1biEgQnV0IGF0IGJlZHRpbWUsIHRoZXJlJ3Mgb25lIHRoaW5nIGEgbGl0dGxlIGdpcmzigJRvciBhIHByaW5jZXNz4oCUYWx3YXlzIGdldHM6IGEga2lzcyBiZWZvcmUgc2F5aW5nIGdvb2RuaWdodC5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxdGlRckZWVGRMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJQcmluY2Vzc2VzIG9uIHRoZSBSdW5cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJTbWlsamFuYSBDb2hcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlNtaWxqYW5hIENvaFwiLFxuICAgICAgICBcInllYXJcIjogMjAxMyxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJQcmluY2Vzc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTA4LTIwVDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAyLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiUHJpbmNlc3MgQW50b25pYSBjYW5ub3QgYmUgY3VyZWQgb2YgaGVyIGJvcmVkb20sIHNvIGRlc3BpdGUgcHJldHR5IGRyZXNzZXMgYW5kIHRoZSBjb29sZXN0IHRveXMsIHNoZSBkZWNpZGVzIHRvIHJ1biBhd2F5LiBXaXRoIGZyaWVuZHMgbGlrZSBSYXB1bnplbCwgQ2luZGVyZWxsYSwgU2xlZXBpbmcgQmVhdXR5LCBhbmQgU25vdyBXaGl0ZSwgYSBiaWcgYWR2ZW50dXJlIGVuc3Vlcy4gUHJpbmNlc3MgQW50b25pYSBjYW5ub3QgYmUgY3VyZWQgb2YgaGVyIGJvcmVkb20sIHNvIGRlc3BpdGUgcHJldHR5IGRyZXNzZXMgYW5kIHRoZSBjb29sZXN0IHRveXMsIHNoZSBkZWNpZGVzIHRvIHJ1biBhd2F5LS1hbmQgd2l0aCBmcmllbmRzIGxpa2UgUmFwdW56ZWwsIENpbmRlcmVsbGEsIFNsZWVwaW5nIEJlYXV0eSwgYW5kIFNub3cgV2hpdGUsIGEgYmlnIGFkdmVudHVyZSBlbnN1ZXMuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy85MTJlS2t2a2lLTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiUHVycGxlLCBHcmVlbiBhbmQgWWVsbG93XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiUm9iZXJ0IE11bnNjaFwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiSMOpbMOobmUgRGVzcHV0ZWF1eFwiLFxuICAgICAgICBcInllYXJcIjogMTk5MixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJDb2xvcnMsIEFydFwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCJPV05cIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjMgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMyxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkJyaWdpZCByZWFsbHkgbG92ZXMgbWFya2Vycy4gQnV0IHdoZW4gc2hlIGRyYXdzIG9uIGhlcnNlbGYgd2l0aCBzdXBlci1wZXJtYW5lbnQgaW5rLCBzaGUga25vd3MgdGhhdCBzcGVsbHMgdHJvdWJsZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxeEloSm01VG1MLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJSYXBweSB0aGUgUmFwdG9yXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRGFuIEd1dG1hblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiVGltIEJvd2Vyc1wiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkRpbm9zYXVyc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJEaW5vc2F1cnNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0yM1QwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiMyBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiUmFwcHkgdGhlIFJhcHRvciB0ZWxscyB0aGUgc3Rvcnkgb2YgaG93IGhlIGJhY2FtZSBhIHJhcHBpbmcgdmVsb2NpcmFwdG9yLCBhbGwgaW4gcmh5bWVcIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxVk1UNEsyVjRMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJSZWFkLWFsb3VkIFJoeW1lcyBmb3IgdGhlIFZlcnkgWW91bmdcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJKYWNrIFByZWx1dHNreVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiTWFyYyBCcm93blwiLFxuICAgICAgICBcInllYXJcIjogMTk4NixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJQb2V0cnksIFJlY2l0YXRpb25zXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCBsaWtlXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJGaXJzdCBwdWJsaXNoZWQgaW4gMTk4NiBhbmQganVzdCBhcyBmcmVzaCBhbmQgcmVsZXZhbnQgdG9kYXksIHRoaXMgd2lkZWx5IGFjY2xhaW1lZCwgY2hpbGQtZnJpZW5kbHkgcG9ldHJ5IGFudGhvbG9neSBpcyBub3cgYmVpbmcgcmVpc3N1ZWQgd2l0aCBhIHN0cmlraW5nIG5ldyBqYWNrZXQuIEluIGhpcyBpbnRyb2R1Y3Rpb24gdG8gdGhpcyBib29rIEppbSBUcmVsZWFzZSwgYmVzdHNlbGxpbmcgYXV0aG9yIG9mIFRoZSBSZWFkLUFsb3VkIEhhbmRib29rLCB3cml0ZXMsIOKAnE5vIG9uZSBiZXR0ZXIgcmVjb2duaXplcyB0aGUgZXNzZW5jZSBvZiB0aGUgY2hpbGQtcG9ldHJ5IGNvbm5lY3Rpb24gdGhhbiBwb2V0IGFuZCBhbnRob2xvZ2lzdCBKYWNrIFByZWx1dHNreS4gLiAuIC4gSGVyZSBhcmUgbW9yZSB0aGFuIDIwMCBsaXR0bGUgcG9lbXMgdG8gZmVlZCBsaXR0bGUgcGVvcGxlIHdpdGggbGl0dGxlIGF0dGVudGlvbiBzcGFucyB0byBoZWxwIGJvdGggZ3Jvdy4gTWFyYyBCcm93buKAmXMgaW52aXRpbmcgaWxsdXN0cmF0aW9ucyBhZGQgYSB2aXN1YWwgZGltZW5zaW9uIHRvIHRoZSBwb2Vtcywgd2hpY2ggZnVydGhlciBlbmdhZ2UgeW91bmcgaW1hZ2luYXRpb25zLuKAnSBUaGUgcG9lbXMgYXJlIGJ5IDExOSBvZiB0aGUgYmVzdC1rbm93biBwb2V0cyBvZiB0aGUgMjB0aCBjZW50dXJ5LlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTF6QmNhM3BEN0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlJpYmJpdCFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJSb2RyaWdvIEZvbGd1ZWlyYVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiUG9seSBCZXJuYXRlbmVcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTMsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlBpZ3NcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNS0xMi0zMVQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDMsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJBIGdyb3VwIG9mIGZyb2dzIGFyZSBsaXZpbmcgaGFwcGlseSBpbiBhIHBlYWNlZnVsIHBvbmQsIHVudGlsIHRoZXkgZGlzY292ZXIgYSBzdXJwcmlzZSB2aXNpdG9yOiBhIGxpdHRsZSBwaW5rIHBpZy4gU2l0dGluZyBjb250ZW50ZWRseSBvbiBhIHJvY2sgaW4gdGhlIG1pZGRsZSBvZiB0aGVpciBwb25kLCB0aGUgcGlnIG9wZW5zIGhpcyBtb3V0aCBhbmQgc2F5czogUklCQklUIVRoZSBmcm9ncyBhcmUgYmV3aWxkZXJlZCBhdCBmaXJzdCwgYW5kIHRoZW4gYSBiaXQgYW5ub3llZOKAlFxcXCJXaGF0IGRpZCB0aGF0IGxpdHRsZSBwaWcganVzdCBzYXk/XFxcIiwgXFxcIkRvZXMgaGUgdGhpbmsgaGUncyBhIGZyb2c/XFxcIiwgXFxcIklzIGhlIG1ha2luZyBmdW4gb2YgdXM/XFxcIlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvODFmLWJhbis3bkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlJvb20gb24gdGhlIEJyb29tXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSnVsaWEgRG9uYWxkc29uXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJBeGVsIFNjaGVmZmxlclwiLFxuICAgICAgICBcInllYXJcIjogMjAwMSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkZhbnRhc3lcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiV2l0Y2hlc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTIzVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUaGUgd2l0Y2ggYW5kIGhlciBjYXQgYXJlIGhhcHBpbHkgZmx5aW5nIHRocm91Z2ggdGhlIHNreSBvbiBhIGJyb29tc3RpY2sgd2hlbiB0aGUgd2luZCBwaWNrcyB1cCBhbmQgYmxvd3MgYXdheSB0aGUgd2l0Y2gncyBoYXQsIHRoZW4gaGVyIGJvdywgYW5kIHRoZW4gaGVyIHdhbmQhIEx1Y2tpbHksIHRocmVlIGhlbHBmdWwgYW5pbWFscyBmaW5kIHRoZSBtaXNzaW5nIGl0ZW1zLCBhbmQgYWxsIHRoZXkgd2FudCBpbiByZXR1cm4gaXMgYSByaWRlIG9uIHRoZSBicm9vbS4gQnV0IGlzIHRoZXJlIHJvb20gb24gdGhlIGJyb29tIGZvciBzbyBtYW55IGZyaWVuZHM/IEFuZCB3aGVuIGRpc2FzdGVyIHN0cmlrZXMsIHdpbGwgdGhleSBiZSBhYmxlIHRvIHNhdmUgdGhlIHdpdGNoIGZyb20gYSBodW5ncnkgZHJhZ29uP1wiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvOTEraWxlVG5iMkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlJvc2llIFJldmVyZSwgRW5naW5lZXJcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJBbmRyZWEgQmVhdHlcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkRhdmlkIFJvYmVydHNcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTMsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiSW52ZW50aW9uc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAxLTE2VDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMb3ZlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogNixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlJvc2llIG1heSBzZWVtIHF1aWV0IGR1cmluZyB0aGUgZGF5LCBidXQgYXQgbmlnaHQgc2hlJ3MgYSBicmlsbGlhbnQgaW52ZW50b3Igb2YgZ2l6bW9zIGFuZCBnYWRnZXRzIHdobyBkcmVhbXMgb2YgYmVjb21pbmcgYSBncmVhdCBlbmdpbmVlci4gV2hlbiBoZXIgZ3JlYXQtZ3JlYXQtYXVudCBSb3NlIChSb3NpZSB0aGUgUml2ZXRlcikgY29tZXMgZm9yIGEgdmlzaXQgYW5kIG1lbnRpb25zIGhlciBvbmUgdW5maW5pc2hlZCBnb2FsLS10byBmbHktLVJvc2llIHNldHMgdG8gd29yayBidWlsZGluZyBhIGNvbnRyYXB0aW9uIHRvIG1ha2UgaGVyIGF1bnQncyBkcmVhbSBjb21lIHRydWUuIEJ1dCB3aGVuIGhlciBjb250cmFwdGlvbiBkb2Vzbid0IGZsIHkgYnV0IHJhdGhlciBob3ZlcnMgZm9yIGEgbW9tZW50IGFuZCB0aGVuIGNyYXNoZXMsIFJvc2llIGRlZW1zIHRoZSBpbnZlbnRpb24gYSBmYWlsdXJlLiBPbiB0aGUgY29udHJhcnksIEF1bnQgUm9zZSBpbmlzaXN0cyB0aGF0IFJvc2llJ3MgY29udHJhcHRpb24gd2FzIGEgcmFnaW5nIHN1Y2Nlc3MuIFlvdSBjYW4gb25seSB0cnVseSBmYWlsLCBzaGUgZXhwbGFpbnMsIGlmIHlvdSBxdWl0LlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvOTFVNCs3ZXllSUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlJ1ZGUgQ2FrZXNcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJSb3dib2F0IFdhdGtpbnNcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlJvd2JvYXQgV2F0a2luc1wiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkZhbnRhc3lcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQ2FrZSwgRm9vZFwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTIxVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaG8ga25ldyB0aGF0IGNha2VzIHdlcmUgc28gcnVkZT8hIEluIHRoaXMgZGVsaWNpb3VzbHkgZW50ZXJ0YWluaW5nIGJvb2ssIGEgbm90LXNvLXN3ZWV0IGNha2XigJR3aG8gbmV2ZXIgc2F5cyBwbGVhc2Ugb3IgdGhhbmsgeW91IG9yIGxpc3RlbnMgdG8gaXRzIHBhcmVudHPigJRnZXRzIGl0cyBqdXN0IGRlc3NlcnRzLiBNaXhpbmcgaGlsYXJpb3VzIHRleHQgYW5kIHBpY3R1cmVzLCBSb3dib2F0IFdhdGtpbnMsIGEgZm9ybWVyIFNlbmRhayBmZWxsb3csIGhhcyBjb29rZWQgdXAgYSBsYXVnaC1vdXQtIGxvdWQgc3RvcnkgdGhhdCBjYW4gYWxzbyBiZSBzZXJ2ZWQgdXAgYXMgYSBkZWxlY3RhYmxlIGRpc2N1c3Npb24gc3RhcnRlciBhYm91dCBtYW5uZXJzIG9yIGJ1bGx5aW5nLCBhcyBpdCBzd2VldGx5IHJlbWluZHMgdXMgYWxsIHRoYXQgZXZlbiB0aGUgcnVkZXN0IGNha2UgY2FuIGxlYXJuIHRvIGNoYW5nZSBpdHMgd2F5cy5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxdHR0c1pLMitMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJSdWZ1cyBHb2VzIHRvIFNjaG9vbFwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIktpbSBHcmlzd2VsbFwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiR29yYmFjaGV2IFZhbGVyaVwiLFxuICAgICAgICBcInllYXJcIjogMjAxMyxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiUGlnLCBTY2hvb2xcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkFsbCBSdWZ1cyBMZXJveSBXaWxsaWFtcyBJSUkgd2FudHMgaXMgdG8gZ28gdG8gc2Nob29sIHNvIGhlIGNhbiBsZWFybiB0byByZWFkIGhpcyBmYXZvcml0ZSBib29rLiBCdXQgdGhlcmUncyBvbmUgcHJvYmxlbTogaGUncyBhIHBpZyBhbmQgUHJpbmNpcGFsIExpcGlkIHNheXM6IOKAnE5PIFBJR1MgSU4gU0NIT09MIeKAnSBSdWZ1cyBldmVuIGdldHMgYSBiYWNrcGFjaywgYSBsdW5jaGJveCwgYW5kIGEgYmxhbmtldCB0byBwcm92ZSBoZSdzIHJlYWR5LiBCdXQgTXIuIExpcGlkIHdvbid0IGJ1ZGdlLiBJcyB0aGVyZSBBTllUSElORyBSdWZ1cyBjYW4gZG8gdG8gY2hhbmdlIGhpcyBtaW5kPyBLaW0gR3Jpc3dlbGwgYW5kIGlsbHVzdHJhdG9yIFZhbGVyaSBHb3JiYWNoZXYgaGF2ZSBjcmVhdGVkIGEgbG92ZSBsZXR0ZXIgdG8gcmVhZGluZyB0aGF0J3MgYWxzbyBhIGNoYXJtaW5nLCBvcmlnaW5hbCwgYW5kIGNoaWxkLWZyaWVuZGx5IGZpcnN0LWRheS1vZi1zY2hvb2wgc3RvcnkuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MVFnLWdDYS1TTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiUnVzc2VsbCB0aGUgU2hlZXBcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJSb2IgU2NvdHRvblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiUm9iIFNjb3R0b25cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlNoZWVwXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMDktMTlUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIEl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiA0LFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiUnVzc2VsbCB0aGUgc2hlZXAgdHJpZXMgYWxsIGRpZmZlcmVudCB3YXlzIHRvIGdldCB0byBzbGVlcC4gUnVzc2VsbCB0aGUgc2hlZXAgdHJpZXMgbWFueSBkaWZmZXJlbnQgd2F5cyB0byBnZXQgdG8gc2xlZXAuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MTJabWdac2I1TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiU2FtICYgRGF2ZSBEaWcgYSBIb2xlXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTWFjIEJhcm5ldHRcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkpvbiBDbGFzc2VuXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkh1bW9yb3VzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMzBUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU2FtIGFuZCBEYXZlIGFyZSBzdXJlIHRoZXkgd2lsbCBkaXNjb3ZlciBzb21ldGhpbmcgZXhjaXRpbmcgaWYgdGhleSBqdXN0IGtlZXAgZGlnZ2luZyB0aGVpciBob2xlLiBTYW0gYW5kIERhdmUgYXJlIG9uIGEgbWlzc2lvbiB0byBmaW5kIHNvbWV0aGluZyBzcGVjdGFjdWxhci4gU28gdGhleSBkaWcgYSBob2xlIGFuZCBrZWVwIGRpZ2dpbmcgYW5kIHRoZXkgZmluZCBub3RoaW5nLiBZZXQgdGhlIGRheSB0dXJucyBvdXQgdG8gYmUgcHJldHR5IHNwZWN0YWN1bGFyIGFmdGVyIGFsbC5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzQxemxFbmgxOFZMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJTYXkgSGVsbG8gdG8gWm9ycm8hXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQ2FydGVyIEdvb2RyaWNoXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJDYXJ0ZXIgR29vZHJpY2hcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTEsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkRvZ3MsIENoYW5nZVwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTI3VDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk1pc3RlciBCdWQgaXMgYSBkb2cgb2Ygcm91dGluZS4gSGUgaGFzIHdha2UgdXAgdGltZSwgbmFwIHRpbWUsIHJlc3QgdGltZSwgZGlubmVyIHRpbWUsIGV0Yy4gQW5kIGV2ZXJ5b25lIGtub3dzIHRvIGZvbGxvdyBoaXMgc2NoZWR1bGUuIFRoZW4gZGlzYXN0ZXIgc3RyaWtlcy4gQSBzdHJhbmdlciBjb21lcyBob21lIGF0IFxcXCJtYWtlIGEgZnVzcyB0aW1lXFxcIiBhbmQgdGhyb3dzIGV2ZXJ5dGhpbmcgb2ZmISBab3JybyBpcyBsaXR0bGUgYml0IGJvc3N5IGFuZCBNaXN0ZXIgQnVkIHdhbnRzIG5vdGhpbmcgdG8gZG8gd2l0aCBoaW0uIEJ1dCB3aGVuIHRoZSBkb2dzIGRpc2NvdmVyIHRoZXkgbGlrZSB0aGUgc2FtZSB0aGluZ3MgKGxpa2UgY2hhc2luZyB0aGUgY2F0IGFuZCBuYXBwaW5nKSwgZXZlcnl0aGluZyBiZWNvbWVzIG1vcmUgZnVuLiBBcyBsb25nIGFzIGV2ZXJ5b25lIGZvbGxvd3MgdGhlIHNjaGVkdWxlLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFEMFI0NlFZSUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlNlY3JldCBBZ2VudCBTcGxhdCFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIlNwbGF0IHRoZSBDYXRcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJSb2IgU2NvdHRvblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiUm9iIFNjb3R0b25cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTIsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkNhdHNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNS0xMC0xMFQwNzowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTG92ZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogNCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNwbGF0IHRoZSBDYXQgbm90aWNlcyB0aGF0IHNvbWV0aGluZyBpc27igJl0IHF1aXRlIHJpZ2h0IGluIGhpcyBob3VzZS4gRmlyc3QgaGlzIGZhdGhlcuKAmXMgZHVjayBkZWNveXMgc3RhcnQgdG8gZ28gbWlzc2luZy4gVGhlbiB0aGV5IGFyZSBteXN0ZXJpb3VzbHkgcmV0dXJuZWQgYnV0LCBzdHJhbmdlbHkgZW5vdWdoLCB3aXRob3V0IHRoZWlyIGJlYWtzISBXaG8gY291bGQgcG9zc2libHkgYmUgY2F1c2luZyBhbGwgb2YgdGhpcyB0cm91YmxlPyBUbyBzb2x2ZSB0aGUgbXlzdGVyeSwgU3BsYXQgbXVzdGVycyB1cCBoaXMgY291cmFnZSBhbmQgcmlzZXMgdG8gdGhlIGNoYWxsZW5nZSBhcyBTZWNyZXQgQWdlbnQgU3BsYXQuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy80MVdPaUlSaldoTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiU2hoISBXZSBIYXZlIEEgUGxhblwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkNocmlzIEhhdWdodG9uXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJDaHJpcyBIYXVnaHRvblwiLFxuICAgICAgICBcInllYXJcIjogMjAxNCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJCaXJkIFRyYXBwaW5nXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMDZUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJGb3VyIGZyaWVuZHMgY3JlZXAgdGhyb3VnaCB0aGUgd29vZHMsIGFuZCB3aGF0IGRvIHRoZXkgc3BvdD8gQW4gZXhxdWlzaXRlIGJpcmQgaGlnaCBpbiBhIHRyZWUhIFxcXCJIZWxsbyBiaXJkaWUsXFxcIiB3YXZlcyBvbmUuIFxcXCJTaGghIFdlIGhhdmUgYSBwbGFuLFxcXCIgaHVzaCB0aGUgb3RoZXJzLiBUaGV5IHN0ZWFsdGhpbHkgbWFrZSB0aGVpciBhZHZhbmNlLCBuZXRzIGluIHRoZSBhaXIuIFJlYWR5IG9uZSwgcmVhZHkgdHdvLCByZWFkeSB0aHJlZSwgYW5kIGdvISBCdXQgYXMgb25lIGNvbWljYWxseSBmb2lsZWQgcGxhbiBmb2xsb3dzIGFub3RoZXIsIGl0IHNvb24gYmVjb21lcyBjbGVhciB0aGF0IHRoZWlyIHF1aWV0LCBvYnNlcnZhbnQgY29tcGFuaW9uLCBoYW5kIG91dHN0cmV0Y2hlZCwgaGFzIGEgZmFyIGJldHRlciBpZGVhLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFYUmlqaHd1NkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlNoaWZ0eSBNY0dpZnR5IGFuZCBTbGlwcGVyeSBTYW1cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJUcmFjZXkgQ29yZGVyb3lcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlN0ZXZlbiBMZW50b25cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTMsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkRvZ3MsIEJha2luZywgUm9iYmVyc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTA4LTIwVDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTaGlmdHkgTWNHaWZ0eSBhbmQgU2xpcHBlcnkgU2FtIGFyZSB0d28gaGFwbGVzcyByb2JiZXIgZG9ncyB3aG8gZGVjaWRlIHRoZSBwZXJmZWN0IHdheSB0byByb2IgdGhlaXIgbmVpZ2hib3JzIHdvdWxkIGJlIHRvIGludml0ZSB0aGVtIG92ZXIgZm9yIGEgbG92ZWx5IHRlYSBwYXJ0eS4gVGhlIG9ubHkgcHJvYmxlbSBpcyB0aGV54oCZdmUgbmV2ZXIgYmFrZWQgYSBjdXBjYWtlIG9yIHBhc3RyeSBpbiB0aGVpciBsaXZlcy4gQ291bGQgdGhpcyBiZSB0aGUgY2hhbmdlIG9mIHBhY2UgdGhleeKAmXZlIGJlZW4gbG9va2luZyBmb3I/IEEgZnVubnksIHF1aXJreSBzdG9yeSwgZGVsaWNpb3VzbHkgZGlzaGVkIHVwIVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNzFaT0hyczltVEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlNob2UgRG9nXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTWVnYW4gTWNEb25hbGRcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkthdGhlcmluZSBUaWxsb3Rzb25cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTQsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkRvZ3NcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0yM1QwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgSXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJbiBvcmRlciB0byBzdGF5IGluIHRoZSB3YXJtIGFuZCBjb3p5IGhvbWUgaGUgaGFzIGxvbmdlZCBmb3IsIFNob2UgRG9nIG11c3QgbGVhcm4gdG8gc3RvcCBjaGV3aW5nIHNob2VzLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFpZWFtVm94dkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlNpbGx5IEdvb3NlJ3MgQmlnIFN0b3J5XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiS2Vpa28gS2FzemFcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIktlaWtvIEthc3phXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEyLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJHZWVzZVwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTA5LTExVDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkdvb3NlJ3MgZnJpZW5kcyBsb3ZlIHRoZSBzdG9yaWVzIGhlIG1ha2VzIHVwIHdoZW4gdGhleSdyZSBwbGF5aW5nLiBFeGNlcHQgb25lIHRoaW5nIC0gR29vc2UgaXMgYWx3YXlzIHRoZSBoZXJvLiBBbmQgd2hlbiB0aGV5IGFzayB0byB0YWtlIHR1cm5zIGxlYWRpbmcgdGhlIGZ1biwgR29vc2UgZG9lc24ndCBhZ3JlZS4gV2hpbGUgdGhleSBhcmd1ZSBhYm91dCBpdCwgbm8gb25lIG5vdGljZXMgdGhlIGh1bmdyeSB3b2xmIHNuZWFraW5nIHVwIG9uIHRoZW0gdW50aWwgaGUgc2hvdXRzLCBcXFwiSGVsbG8sIEx1bmNoIVxcXCJcIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzkxNUFod2FmaDNMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJTaW1wc29uJ3MgU2hlZXAgV29uJ3QgR28gdG8gU2xlZXAhXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQnJ1Y2UgQXJhbnRcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkJydWNlIEFyYW50XCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEzLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJTaGVlcFwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTA5LTExVDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlxcXCJXaGVuIEZhcm1lciBTaW1wc29uIHRyaWVzIHRvIHB1dCBoaXMgc2hlZXAgdG8gYmVkLCB0aGV5IHRoaW5rIG9mIGV2ZXJ5IGV4Y3VzZSB0byBzdGF5IGF3YWtlLiBGaW5hbGx5LCBoZSB0aGlua3Mgb2YgYSB3YXJtIGFuZCBjb3p5IHNvbHV0aW9uIHRoYXQgd2lsbCBoZWxwIGx1bGwgdGhlIHNoZWVwIHJpZ2h0IHRvIHNsZWVwXFxcIlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFwZzl3a3BuK0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlNuaXAgU25hcCFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIldoYXQncyBUaGF0P1wiLFxuICAgICAgICBcImF1dGhvclwiOiBcIk1hcmEgQmVyZ21hblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiTmljayBNYWxhbmRcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRmVhcnMsIEFsbGlnYXRvcnNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNS0xMC0xMFQwNzowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUaHJlZSBzaWJsaW5ncyBhcmUgZnJpZ2h0ZW5lZCBieSB0aGUgd2lkZSBtb3V0aCwgbG9uZyB0ZWV0aCwgYW5kIHN0cm9uZyBqYXdzIG9mIHRoZSBhbGxpZ2F0b3IgdGhhdCBoYXMgY3JlcHQgdXAgdGhlIHN0YWlycywgdW50aWwgdGhleSBkZWNpZGUgdGhleSBoYXZlIGhhZCBlbm91Z2guIFRocmVlIHNpYmxpbmdzIGFyZSBmcmlnaHRlbmVkIGJ5IHRoZSB3aWRlIG1vdXRoLCBsb25nIHRlZXRoLCBhbmQgc3Ryb25nIGphd3Mgb2YgdGhlIGFsbGlnYXRvciB3aG8gaGFzIGNyZXB0IHVwIHRoZSBzdGFpcnMtLXVudGlsIHRoZXkgZGVjaWRlIHRoZXkgaGF2ZSBoYWQgZW5vdWdoLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFtK2lUcHVPZUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlNwYXJreSFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJKZW5ueSBPZmZpbGxcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkNocmlzIEFwcGVsaGFuc1wiLFxuICAgICAgICBcInllYXJcIjogMjAxNCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiU2xvdGhzLCBQZXRzXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCBsaWtlXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAuNSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNwYXJreSBzdGFycyBhIHBldCB3aG8gaGFzIG1vcmUgdG8gb2ZmZXIgdGhhbiBtZWV0cyB0aGUgZXllLiBXaGVuIG91ciBuYXJyYXRvciBvcmRlcnMgYSBzbG90aCB0aHJvdWdoIHRoZSBtYWlsLCB0aGUgY3JlYXR1cmUgdGhhdCBhcnJpdmVzIGlzbid0IGdvb2QgYXQgdHJpY2tzIG9yIGhpZGUtYW5kLXNlZWsgLiAuIC4gb3IgbXVjaCBvZiBhbnl0aGluZy4gU3RpbGwsIHRoZXJlJ3Mgc29tZXRoaW5nIGFib3V0IFNwYXJreSB0aGF0IGlzIGlycmVzaXN0aWJsZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzcxc0NJWW5hWk5MLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJTcGlrZVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiVGhlIE1peGVkLXVwIE1vbnN0ZXJcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJTdXNhbiBIb29kXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJNZWxpc3NhIFN3ZWV0XCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEyLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJNb25zdGVyc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTA5LTE5VDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaGlsZSBTcGlrZSwgYSB0aW55IGF4b2xvdGwgc2FsYW1hbmRlciwgcHJhY3RpY2VzIGJlaW5nIHRoZSBtb25zdGVyIGhlIGJlbGlldmVzIGhlIGlzLCBvdGhlciBhbmltYWxzIGNhbGwgaGltIGN1dGUgYW5kIGZ1bm55IGJ1dCB3aGVuIGEgZ2lsYSBtb25zdGVyIGFycml2ZXMgYW5kIHRoZSBvdGhlciBjcmVhdHVyZXMgaGlkZSwgU3Bpa2Ugc2hvd3MgaGlzIHRydWUgbmF0dXJlLiBXaGlsZSBTcGlrZSwgYSB0aW55IHNhbGFtYW5kZXIsIHByYWN0aWNlcyBiZWluZyB0aGUgbW9uc3RlciBoZSBiZWxpZXZlcyBoZSBpcywgb3RoZXIgYW5pbWFscyBjYWxsIGhpbSBjdXRlIGFuZCBmdW5ueS4gQnV0IHdoZW4gYSBHaWxhIG1vbnN0ZXIgYXJyaXZlcyBhbmQgdGhlIG90aGVyIGNyZWF0dXJlcyBoaWRlLCBTcGlrZSBzaG93cyBoaXMgdHJ1ZSBuYXR1cmUuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MWxDeDN5R0lDTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiU3BsYXQgU2F5cyBUaGFuayBZb3UhXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJTcGxhdCB0aGUgQ2F0XCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiUm9iIFNjb3R0b25cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlJvYiBTY290dG9uXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEyLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJDYXRzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMDktMTlUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTcGxhdCB0aGUgQ2F0J3MgdHJ1c3R5IG1vdXNlIGZyaWVuZCwgU2V5bW91ciwgbmVlZHMgY2hlZXJpbmcgdXAsIGFuZCBTcGxhdCB3YW50cyB0byBoZWxwLiBIZSdzIGJlZW4gd29ya2luZyBvbiBzb21ldGhpbmcgc3BlY2lhbCBmb3IgU2V5bW91cuKAlG5vdCBqdXN0IGEgdGhhbmsteW91IGNhcmQgYnV0IGEgdGhhbmsteW91IGJvb2shIEhpcyBib29rIGxpc3RzIGFsbCB0aGUgc3dlZXQgYW5kIG9mdGVuIGhpbGFyaW91cyByZWFzb25zIFNwbGF0IGlzIHRoYW5rZnVsIGZvciB0aGVpciBmcmllbmRzaGlwLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFhNldqRTF6c0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlNwbGF0IHRoZSBDYXRcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIlVwIGluIHRoZSBBaXIgYXQgdGhlIEZhaXJcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJSb2IgU2NvdHRvblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiUm9iIFNjb3R0b25cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTQsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkNhdHMsIEZyaWVuZHNoaXBcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0yMVQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNwbGF0IHRoZSBDYXQgY2FuJ3Qgd2FpdCB0byB0cnkgdGhlIHJpZGVzIGFuZCBmb29kIGF0IHRoZSBmYWlyIHdpdGggaGlzIGZyaWVuZHMsIGJ1dCB3aGVuIEtpdHRlbiBjYW4ndCBjb21lLCBTcGxhdCwgU3Bpa2UsIGFuZCBQbGFuayBhcmUgZGV0ZXJtaW5lZCB0byBjaGVlciBoZXIgdXAgYnkgYnJpbmdpbmcgaGVyIGJhY2sgc29tZXRoaW5nIGZyb20gdGhlIGZhaXIuIEJhc2VkIG9uIHRoZSBzZXJpZXMgY3JlYXRlZCBieSBSb2IgU2NvdHRvbi4gXFxcIlNwbGF0IHRoZSBDYXQgY2FuJ3Qgd2FpdCB0byB0cnkgYWxsIHRoZSByaWRlcyBhbmQgZm9vZCBhdCB0aGUgZmFpciB3aXRoIGhpcyBmcmllbmRzLiBXaGVuIEtpdHRlbiBjYW4ndCBqb2luIHRoZW0sIFNwbGF0LCBTcGlrZSwgYW5kIFBsYW5rIGFyZSBkZXRlcm1pbmVkIHRvIGJyaW5nIGJhY2sgc29tZXRoaW5nIGZyb20gdGhlIGZhaXIgdG8gY2hlZXIgaGVyIHVwLS1idXQgaG93IGRvIHRoZXkgZmluZCB0aGUgcGVyZmVjdCBnZXQtd2VsbCBnaWZ0PyBKb2luIFNwbGF0IGFuZCBoaXMgZnJpZW5kcyBhcyB0aGV5IGVtYmFyayBvbiB0aGVpciBtaXNzaW9uIHRvIGZpbmQgdGhlIGJlc3QgZ2lmdCBldmVyLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFaWFQ0RWM5UkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlNwbGlzaCwgU3BsYXNoLCBTcGxhdCFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJSb2IgU2NvdHRvblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiUm9iIFNjb3R0b25cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTEsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkNhdHMsIFN3aW1taW5nLCBGcmllbmRzaGlwLCBTY2hvb2wsIEZlYXJcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNS0wOC0yMFQwNzowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDQsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTcGxhdCBkb2VzIG5vdCB3YW50IHRvIGhhdmUgYSBwbGF5ZGF0ZSB3aXRoIFNwaWtlLiBTcGlrZSB3aWxsIGJyZWFrIGhpcyB0b3lzIGFuZCBlYXQgYWxsIG9mIGhpcyBjYW5keSBmaXNoISBBbmQgaGUgZG9lcyBub3Qgd2FudCB0byBsZWFybiBob3cgdG8gc3dpbeKAlHdhdGVyIGlzIGhvcnJpYmxlLCBzY2FyeSwgYW5kIHdldCEgSGUncyBzdXJlIHRoYXQgdGhpcyBpcyBnb2luZyB0byBiZSB0aGUgd29yc3QgZGF5IGV2ZXIuIEJ1dCB3aGVuIHRoZSByZXN0IG9mIHRoZWlyIGNsYXNzbWF0ZXMgcnVzaCBzdHJhaWdodCBpbnRvIHRoZSBwb29sLCBTcGxhdCBhbmQgU3Bpa2UgZmluZCB0aGF0IHRoZXkgbWF5IGhhdmUgbW9yZSBpbiBjb21tb24gdGhhbiB0aGV5IHRob3VnaHQuIFdpbGwgU3BsYXQgb3ZlcmNvbWUgaGlzIGZlYXIgb2Ygd2F0ZXIgYW5kIGdldCBpbnRvIHRoZSBwb29sPyBBbmQgaG93IGNhbiBoZSBoZWxwIFNwaWtlIHRvIGRvIHRoZSBzYW1lP1wiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFzRFA2dzZVbUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlN0YW5kIEJhY2ssIFNhaWQgdGhlIEVsZXBoYW50LCBcXFwiSSdtIEdvaW5nIHRvIFNuZWV6ZSFcXFwiXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiUGF0cmljaWEgVGhvbWFzXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJXYWxsYWNlIFRyaXBwXCIsXG4gICAgICAgIFwieWVhclwiOiAxOTkwLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJFbGVwaGFudHNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMy0yMlQwNzowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJBbGwgdGhlIGFuaW1hbHMgYXJlIGluIGEgcGFuaWMuIFRoZSBlbGVwaGFudCdzIHNuZWV6ZSB3b3VsZCBibG93IHRoZSBtb25rZXlzIG91dCBvZiB0aGUgdHJlZXMsIHRoZSBmZWF0aGVycyBvZmYgdGhlIGJpcmRzLCB0aGUgc3RyaXBlcyBvZmYgdGhlIHplYnJhLiBFdmVuIHRoZSBmaXNoIGFuZCB0aGUgZmx5LCB0aGUgY3JvY29kaWxlIGFuZCB0aGUga2FuZ2Fyb28sIGtub3cgd2hhdCBhIGNhdGFzdHJvcGhlIHRoYXQgc25lZXplIHdvdWxkIGJlLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTF0eVJFQkRHbkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlN0b3AgVGhhdCBQaWNrbGUhXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiUGV0ZXIgQXJtb3VyXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJQZXRlciBBcm1vdXJcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGb29kXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlBpY2tsZXNcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAzLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiV2hlbiBNcnMuIEVsbWlyYSBEZWVkcyB3YWRkbGVzIGludG8gTXIuIEFkb2xwaOKAmXMgZGVsaSBhbmQgYXNrcyBmb3IgYSBwaWNrbGUsIGNoYW9zIGVydXB0cyEgVGhlIHBpY2tsZSBlc2NhcGVzIGZyb20gdGhlIGphciwgYW5kIGEgY2FzdCBvZiB6YW55IGNoYXJhY3RlcnMsIGluY2x1ZGluZyBhIHBlYW51dCBidXR0ZXIgYW5kIGplbGx5IHNhbmR3aWNoIGFuZCBzZXZlbnRlZW4gdG9hc3RlZCBhbG1vbmRzLCBqb2lucyBpbiB0aGUgY2hhc2UgdG8gc3RvcCB0aGUgcGlja2xlIGFzIGl0IGF0dGVtcHRzIHRvIHJ1biBhd2F5LiBDYW4gYW55b25lIHN0b3AgdGhhdCBwaWNrbGU/XCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy84MS1qNFV6NVNMTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiU3RyaWN0bHkgTm8gRWxlcGhhbnRzXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTGlzYSBNYW50Y2hldlwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiVGFlZXVuIFlvb1wiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRWxlcGhhbnRzLCBQZXRzXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDMsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaGVuIHRoZSBsb2NhbCBQZXQgQ2x1YiB3b27igJl0IGFkbWl0IGEgYm954oCZcyB0aW55IHBldCBlbGVwaGFudCwgaGUgZmluZHMgYSBzb2x1dGlvbuKAlG9uZSB0aGF0IGludm9sdmVzIGFsbCBraW5kcyBvZiB1bnVzdWFsIGFuaW1hbHMgaW4gdGhpcyBzd2VldCBhbmQgYWRvcmFibGUgcGljdHVyZSBib29rLiBUb2RheSBpcyBQZXQgQ2x1YiBkYXkuIFRoZXJlIHdpbGwgYmUgY2F0cyBhbmQgZG9ncyBhbmQgZmlzaCwgYnV0IHN0cmljdGx5IG5vIGVsZXBoYW50cyBhcmUgYWxsb3dlZC4gVGhlIFBldCBDbHViIGRvZXNu4oCZdCB1bmRlcnN0YW5kIHRoYXQgcGV0cyBjb21lIGluIGFsbCBzaGFwZXMgYW5kIHNpemVzLCBqdXN0IGxpa2UgZnJpZW5kcy4gTm93IGl0IGlzIHRpbWUgZm9yIGEgYm95IGFuZCBoaXMgdGlueSBwZXQgZWxlcGhhbnQgdG8gc2hvdyB0aGVtIHdoYXQgaXQgbWVhbnMgdG8gYmUgYSB0cnVlIGZyaWVuZC5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxM2h2b1FCbURMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJTdXJmJ3MgdXBcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJLd2FtZSBBbGV4YW5kZXJcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkRhbmllbCBNaXlhcmVzXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE2LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJGcm9ncywgQmVhY2gsIFN1cmZpbmdcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0yM1QwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNCBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3VyZidzIHVwISBOb3QgeWV0LCBEdWRlISBCb29rcyBhcmUgYm9yaW5nISBOb3QgdGhpcyBvbmUhIEJybyBhbmQgRHVkZSBoYXZlIHZlcnkgZGlmZmVyZW50IGlkZWFzIGFib3V0IGhvdyB0byBzcGVuZCB0aGUgZGF5IGF0IHRoZSBiZWFjaC4gQnV0IGFzIEJybyBjb250aW51ZXMgdG8gZ2FzcCBhbmQgY2hlZXIgYXMgaGUgcmVhZHMgaGlzIGJvb2sgKE1vYnkgRGljayksIER1ZGUgY2FuJ3QgaGVscCBidXQgZ2V0IGN1cmlvdXMuIEJlZm9yZSB5b3UgY2FuIHNob3V0ICdTdXJmJ3MgdXAhJyBib3RoIGZyb2dzIGFyZSBzaGFyaW5nIHRoZSBzYW1lIGFkdmVudHVyZSwgdGhhdCBpcywgdW50aWwgdGhleSBnZXQgdG8gdGhlIGJlYWNoLiBOZXdiZXJ5IEF3YXJkIE1lZGFsIFdpbm5lciwgS3dhbWUgQWxleGFuZGVyLCBhbmQgRGFuaWVsIE1peWFyZXMgaGF2ZSBqb2luZWQgZm9yY2VzIHRvIGdpdmUgbGl0dGxlIGxpc3RlbmVycyBhIHdpbGQgcmlkZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzgxMG9JWWphNExMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJTeWx2ZXN0ZXIgYW5kIHRoZSBNYWdpYyBQZWJibGVcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJXaWxsaWFtIFN0ZWlnXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJXaWxsaWFtIFN0ZWlnXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEyLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJEb25rZXlzLCBNYWdpYywgTWlzc2luZyBDSGlsZHJlblwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTeWx2ZXN0ZXIgY2Fu4oCZdCBiZWxpZXZlIGhpcyBsdWNrIHdoZW4gaGUgZmluZHMgYSBtYWdpYyBwZWJibGUgdGhhdCBjYW4gbWFrZSB3aXNoZXMgY29tZSB0cnVlLiBCdXQgd2hlbiBhIGxpb24ganVtcHMgb3V0IGF0IGhpbSBvbiBoaXMgd2F5IGhvbWUsIFN5bHZlc3RlciBpcyBzaG9ja2VkIGludG8gbWFraW5nIGEgd2lzaCB0aGF0IGhhcyB1bmV4cGVjdGVkIGNvbnNlcXVlbmNlcy4gQWZ0ZXIgb3ZlcmNvbWluZyBhIHNlcmllcyBvZiBvYnN0YWNsZXMsIFN5bHZlc3RlciBpcyBldmVudHVhbGx5IHJldW5pdGVkIHdpdGggaGlzIGxvdmluZyBmYW1pbHkuIElsbHVzdHJhdGVkIHdpdGggV2lsbGlhbSBTdGVpZ+KAmXMgZ2xvd2luZyBwaWN0dXJlcywgdGhpcyB3aW5uZXIgb2YgdGhlIENhbGRlY290dCBNZWRhbCBpcyBiZWxvdmVkIGJ5IGNoaWxkcmVuIGV2ZXJ5d2hlcmUuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MWJZVkY5WjlsTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGFja3kgdGhlIFBlbmd1aW5cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJIZWxlbiBMZXN0ZXJcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkx5bm4gTXVuc2luZ2VyXCIsXG4gICAgICAgIFwieWVhclwiOiAxOTkwLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJQZW5ndWlucywgQmVoYXZpb3IsIEluZGl2aWR1YWxpdHlcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJIYXZlIG5vdCByZWFkIHlldFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlRhY2t5IHRoZSBwZW5ndWluIGRvZXMgbm90IGZpdCBpbiB3aXRoIGhpcyBzbGVlayBhbmQgZ3JhY2VmdWwgY29tcGFuaW9ucywgYnV0IGhpcyBvZGQgYmVoYXZpb3IgY29tZXMgaW4gaGFuZHkgd2hlbiBodW50ZXJzIGNvbWUgd2l0aCBtYXBzIGFuZCB0cmFwcy5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxTkgxR0s5UUpMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUYWtlIEEgSGlrZSwgU25vb3B5IVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiUGVhbnV0c1wiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkp1ZGllIEthdHNjaGtlXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJDaGFybGVzIE0uIFNjaHVselwiLFxuICAgICAgICBcInllYXJcIjogMjAwMixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRG9nc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTIxVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlRoZSB3b3JsZCBmYW1vdXMgQmVhZ2xlIFNjb3V0IHRha2VzIGhpcyBlYWdlciBiaXJkIHRyb29wIG9uIGEgY2FtcGluZyBhbmQgaGlraW5nIHRyaXAgdGhhdCB0dXJucyBvdXQgdG8gYmUgdmVyeSBkaWZmZXJlbnQgZnJvbSB3aGF0IFNub29weSBwbGFubmVkLiBUaGlzIGFkYXB0YXRpb24gaXMgYmFzZWQgb24gdGhlIHdvcmtzIG9mIENoYXJsZXMgTS4gU2NodWx6LiBUaGUgd29ybGQgZmFtb3VzIEJlYWdsZSBTY291dCB0YWtlcyBoaXMgZWFnZXIgYmlyZCB0cm9vcHMgb24gYSBjYW1waW5nIGFuZCBoaWtpbmcgdHJpcCB0aGF0IHR1cm5zIG91dCB0byBiZSB2ZXJ5IGRpZmZlcmVudCBmcm9tIHdoYXQgU25vb3B5IHBsYW5uZWQuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy80MUt3UDA1LXZOTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGFrZSBBd2F5IFRoZSBBXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTWljaGHDq2wgRXNjb2ZmaWVyXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJLcmlzIERpIEdpYWNvbW9cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTQsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJNb25zdGVyc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJBbHBoYWJldCwgVm9jYWJ1bGFyeSwgUGxheSBvbiBXb3Jkc1wiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVGFrZSBBd2F5IHRoZSBBIGlzIGEgZnVuLCBpbWFnaW5hdGl2ZSByb21wIHRocm91Z2ggdGhlIGFscGhhYmV0LiBUaGUgaWRlYSBiZWhpbmQgdGhlIGJvb2sgaXMgdGhhdCB3aXRoaW4gZXZlcnkgbGFuZ3VhZ2UgdGhlcmUgYXJlIHdvcmRzIHRoYXQgY2hhbmdlIGFuZCBiZWNvbWUgYSBkaWZmZXJlbnQgd29yZCB0aHJvdWdoIHRoZSBzaW1wbGUgc3VidHJhY3Rpb24gb2YgYSBzaW5nbGUgbGV0dGVyLiBJbiBvdGhlciB3b3Jkcywgd2l0aG91dCB0aGUgXFxcIkEsXFxcIiB0aGUgQmVhc3QgaXMgQmVzdC4gT3IsIHdpdGhvdXQgdGhlIFxcXCJNLFxcXCIgYSBjaG9tcCBiZWNvbWVzIGEgY2hvcOKAlHRob3VnaCBpdCBjb3VsZCBiZSB0aGF0IHRoaXMgcGFydGljdWxhciBwbGF5IG9uIHdvcmRzIGRpZG4ndCBldmVuIG1ha2UgaXQgaW50byB0aGUgYm9vaywgdGhlcmUgYXJlIHNvIG1hbnkhXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MUktQ0Z4U3I1TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhhdCdzIE5vdCBCdW5ueSFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJDaHJpcyBCYXJ0b25cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkNvbGluIEphY2tcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTYsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkJpcmRzLCBIYXdrcywgUmFiYml0c1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAzLTExVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCJOb25lXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJGcm9tIGhpZ2ggYWJvdmUgb24gaGlzIHBlcmNoLCBIYXdrIHNlYXJjaGVzIGZvciBoaXMgbmV4dCBtZWFsLiBXaGVuIGhlIHNwb3RzIGEgYnVubnkgaGUgc3dvb3BzIGRvd24gYW5kIHNuYXRjaGVzLWEgY2Fycm90IT8gSGUgZGVjaWRlcyB0byB0cnkgYWdhaW47IGJlY2F1c2UgYWZ0ZXIgYWxsLCBoZSBpc24ndCBhIENhcnJvdCBIYXdrLiBCdXQgd2hlbiBIYXdrIGdvZXMgZm9yIGhpcyBzZWNvbmQgYXR0ZW1wdCBoZSBjb21lcyB1cCB3aXRoIGEgY3VjdW1iZXIhIEFuZCB0aGUgdGhpcmQgdGltZSBoZSBncmFicyBhIGhlYWQgb2YgbGV0dHVjZSEgSG93IGNhbiBIYXdrIGJlIGEgaGF3aywgaWYgaGUgY2FuJ3QgY2F0Y2ggYSBzaW5nbGUgYnVubnk/IEFzIGhlIHN1cnZleXMgdGhlIGFzc29ydG1lbnQgb2YgdmVnZXRhYmxlcyBpbiBoaXMgbmVzdCwgaGUgZ2V0cyBhIGdyZWF0IGlkZWEgZm9yIGJhaXRpbmcgdGhlIGJ1bm55LiBCdXQgd2lsbCBpdCB3b3JrP1wiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFYZU5yMWx4MkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlRoZSBBZHZlbnR1cmVzIG9mIEJlZWtsZVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiVGhlIFVuaW1hZ2luYXJ5IEZyaWVuZFwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkRhbiBTYW50YXRcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkRhbiBTYW50YXRcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTQsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkltYWdpbmFyeSBQbGF5bWF0ZXMsIEZyaWVuZHNoaXBcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0wNlQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkFuIGltYWdpbmFyeSBmcmllbmQgd2FpdHMgYSBsb25nIHRpbWUgdG8gYmUgaW1hZ2luZWQgYnkgYSBjaGlsZCBhbmQgZ2l2ZW4gYSBzcGVjaWFsIG5hbWUsIGFuZCBmaW5hbGx5IGRvZXMgdGhlIHVuaW1hZ2luYWJsZS0taGUgc2V0cyBvdXQgb24gYSBxdWVzdCB0byBmaW5kIGhpcyBwZXJmZWN0IG1hdGNoIGluIHRoZSByZWFsIHdvcmxkLiBBbiBpbWFnaW5hcnkgZnJpZW5kIHdhaXRzIGEgbG9uZyB0aW1lIHRvIGJlIGltYWdpbmVkIGJ5IGEgY2hpbGQgYW5kIGdpdmVuIGEgc3BlY2lhbCBuYW1lLiBIZSBmaW5hbGx5IGRvZXMgdGhlIHVuaW1hZ2luYWJsZS0taGUgc2V0cyBvdXQgb24gYSBxdWVzdCB0byBmaW5kIGhpcyBwZXJmZWN0IG1hdGNoIGluIHRoZSByZWFsIHdvcmxkLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTF2ZGdhUUVpS0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlRoZSBCZWFyIEF0ZSB5b3VyIFNhbmR3aWNoXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSnVsaWEgU2FyY29uZS1Sb2FjaFwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiSnVsaWEgU2FyY29uZS1Sb2FjaFwiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQmVhcnNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0xNlQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCBsaWtlXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTbyBiZWdpbnMgSnVsaWEgU2FyY29uZS1Sb2FjaOKAmXMgZGVsaWNpb3VzIHRhbGUgb2YgYSBiZWFyLCBsb3N0IGluIHRoZSBjaXR5LCB3aG8gaGFwcGVucyB1cG9uIGFuIHVuYXR0ZW5kZWQgc2FuZHdpY2ggaW4gdGhlIHBhcmsuIFRoZSBiZWFy4oCZcyBqb3VybmV5IGZyb20gZm9yZXN0IHRvIGNpdHkgYW5kIGJhY2sgaG9tZSBhZ2FpbiBpcyBmdWxsIG9mIGhhcHB5IGFjY2lkZW50cywgZnVubnkgZW5jb3VudGVycywgYW5kIHNlbnNvcnkgZGVsaWdodHMuIFRoZSBzdG9yeSBpcyBzbyBlbmdyb3NzaW5nLCBpdOKAmXMgbm90IHVudGlsIHRoZSB2ZXJ5IGVuZCB0aGF0IHdlIGJlZ2luIHRvIHN1c3BlY3QgdGhpcyBpcyBhIFRBTEwgdGFsZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxdTY4eFRwVjRMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgQmVzdCBQZXQgb2YgQWxsXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRGF2aWQgTGFSb2NoZWxsZVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiRGF2aWQgTGFSb2NoZWxsZVwiLFxuICAgICAgICBcInllYXJcIjogMjAwOSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkZhbnRhc3lcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRHJhZ29ucywgRG9nc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAzLTExVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkEgbGl0dGxlIGJveSdzIG1vdGhlciB3b24ndCBsZXQgaGltIGhhdmUgYSBkb2cuIERvZ3MgYXJlIHRvbyBtZXNzeSBhbmQgdG9vIGxvdWQuIEJ1dCBzaGUgc2F5cyBoZSBjYW4gaGF2ZSBhIGRyYWdvbiBmb3IgYSBwZXQgLSBpZiBoZSBjYW4gZmluZCBvbmUuIEVudGVyIHRoZSBjb29sZXN0IC0gYnV0IG5hdWdodGllc3QgLSBwZXQgZXZlci4gVGhlIGRyYWdvbiBpcyBtZXNzaWVyIGFuZCBsb3VkZXIgdGhhbiBhbnkgZG9nLiBBbmQgaGUgd2lsbCBub3QgbGVhdmUuIEhvdyB3aWxsIHRoZSBib3kgZXZlciBnZXQgYSBkb2cgbm93P1wiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFVQkt5cWpEZEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlRoZSBCZXN0IFN0b3J5XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRWlsZWVuIFNwaW5lbGxpXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJBbm5lIFdpbHNkb3JmXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDA4LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkNyZWF0aXZlIFdyaXRpbmdcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJkaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUaGUgYmVzdCBzdG9yeSBpcyBvbmUgdGhhdCBjb21lcyBmcm9tIHRoZSBoZWFydCBUaGUgbGlicmFyeSBpcyBoYXZpbmcgYSBjb250ZXN0IGZvciB0aGUgYmVzdCBzdG9yeSwgYW5kIHRoZSBxdWlya3kgbmFycmF0b3Igb2YgdGhpcyBzdG9yeSBqdXN0IGhhcyB0byB3aW4gdGhhdCByb2xsZXJjb2FzdGVyIHJpZGUgd2l0aCBoZXIgZmF2b3JpdGUgYXV0aG9yISBCdXQgd2hhdCBtYWtlcyBhIHN0b3J5IHRoZSBiZXN0PyBIZXIgYnJvdGhlciBUaW0gc2F5cyB0aGUgYmVzdCBzdG9yaWVzIGhhdmUgbG90cyBvZiBhY3Rpb24uIEhlciBmYXRoZXIgdGhpbmtzIHRoZSBiZXN0IHN0b3JpZXMgYXJlIHRoZSBmdW5uaWVzdC4gQW5kIEF1bnQgSmFuZSB0ZWxscyBoZXIgdGhlIGJlc3Qgc3RvcmllcyBoYXZlIHRvIG1ha2UgcGVvcGxlIGNyeS4gQSBzdG9yeSB0aGF0IGRvZXMgYWxsIHRoZXNlIHRoaW5ncyBkb2Vzbj90IHNlZW0gcXVpdGUgcmlnaHQsIHRob3VnaCwgYW5kIHRoZSBvbmUgdGhpbmcgdGhlIHdob2xlIGZhbWlseSBjYW4gYWdyZWUgb24gaXMgdGhhdCB0aGUgYmVzdCBzdG9yeSBoYXMgdG8gYmUgeW91ciBvd24uXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy83MWl2VHE0TlVTTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIEJpZyBBZHZlbnR1cmVcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJFbGxpbmEgRWxsaXNcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkVsbGluYSBFbGxpc1wiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRm94LCBDaGlja2VuLCBNb29zZSwgQmVhclwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAxLTMwVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkZveCwgTW9vc2UsIEJlYXIsIGFuZCBDaGlja2VuIGFyZSBmb3VyIGZyaWVuZHMgd2hvIHdhbnQgdG8gZ28gb24gYSBiaWcgYWR2ZW50dXJlISBCdXQgd2hlcmUgc2hvdWxkIHRoZXkgZ28/IFRoZSBOb3J0aCBQb2xlPyBUaGUgbW9vbj8gQWZ0ZXIgY2xpbWJpbmcgdG8gdGhlIHRvcCBvZiBhIHZlcnkgYmlnIGhpbGwsIHRoZXkgZGVjaWRlIHRvIHZpc2l0IENoaWNrZW4ncyBhdW50aWUncyBob3VzZSBpbnN0ZWFkLCB3aGljaCBpc24ndCBhcyBjb2xkIGFzIHRoZSBOb3J0aCBQb2xlLCBvciBhcyBmYXIgYXdheSBhcyB0aGUgbW9vbiwgYnV0IGlzIHN0aWxsIGEgYmlnIGFkdmVudHVyZSFcIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzQxNDh1R2NnZEVMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgQm9vayBXaXRoIE5vIFBpY3R1cmVzXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQi5KLiBOb3Zha1wiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiQi5KLiBOb3Zha1wiLFxuICAgICAgICBcInllYXJcIjogMjAxNCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJPcmFsIHJlYWRpbmdcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiT1dOXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTG92ZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDcsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJZb3UgbWlnaHQgdGhpbmsgYSBib29rIHdpdGggbm8gcGljdHVyZXMgc2VlbXMgYm9yaW5nIGFuZCBzZXJpb3VzLiBFeGNlcHQgLiAuIC4gaGVyZeKAmXMgaG93IGJvb2tzIHdvcmsuIEV2ZXJ5dGhpbmcgd3JpdHRlbiBvbiB0aGUgcGFnZSBoYXMgdG8gYmUgc2FpZCBieSB0aGUgcGVyc29uIHJlYWRpbmcgaXQgYWxvdWQuIEV2ZW4gaWYgdGhlIHdvcmRzIHNheSAuIC4gLiBCTE9SSy4gT3IgQkxVVVJGLiBFdmVuIGlmIHRoZSB3b3JkcyBhcmUgYSBwcmVwb3N0ZXJvdXMgc29uZyBhYm91dCBlYXRpbmcgYW50cyBmb3IgYnJlYWtmYXN0LCBvciBqdXN0IGEgbGlzdCBvZiBhc3RvbmlzaGluZ2x5IGdvb2Z5IHNvdW5kcyBsaWtlIEJMQUdHSVRZIEJMQUdHSVRZIGFuZCBHTElCQklUWSBHTE9CQklUWS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxTFZqM2ZlSkFMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgQm95IFdobyBDcmllZCBCaWdmb290IVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlNjb3R0IE1hZ29vblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiU2NvdHQgTWFnb29uXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEzLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJZZXRpLCBTYXNxdWF0Y2gsIEhvbmVzdHlcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiT1dOXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTG92ZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogNixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlRoaXMgY2xldmVyIHR3aXN0IG9uIOKAnFRoZSBCb3kgV2hvIENyaWVkIFdvbGbigJ0gaXMgdG9sZCBmcm9tIHRoZSBwb2ludCBvZiB2aWV3IG9mIGFuIHVuZXhwZWN0ZWQgbmFycmF0b3IgYW5kLCB0aHJvdWdoIHNuYXBweSB0ZXh0IGFuZCBsaWdodGhlYXJ0ZWQgaWxsdXN0cmF0aW9ucywgZGVtb25zdHJhdGVzIHRoZSB2YWx1ZSBvZiB0ZWxsaW5nIHRoZSB0cnV0aCwgdGhlIGltcG9ydGFuY2Ugb2YgZXN0YWJsaXNoaW5nIHRydXN0LCBhbmQgKG9mIGNvdXJzZSEpIHRoZSBwb3NzaWJpbGl0eSB0aGF0IGEgYmVhc3QgeW91IGNyZWF0ZWQgdG8gZ2V0IGF0dGVudGlvbiBjYW4gYmVjb21lIGEgcmVhbC1saWZlIGZyaWVuZC5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxWXlqNmMyK3FMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgQm95IHdpdGggUGluayBIYWlyXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiUGVyZXogSGlsdG9uXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJKZW4gSGlsbFwiLFxuICAgICAgICBcInllYXJcIjogMjAxMSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJCb3lzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMjNUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIEl0XCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaGVuIGEgYm95IHdobyB3YXMgYm9ybiB3aXRoIHBpbmsgaGFpciBlbnRlcnMgc2Nob29sIGZvciB0aGUgZmlyc3QgdGltZSwgaGUgaXMgdGVhc2VkIHVudGlsIGhlIG1ha2VzIGEgZnJpZW5kIGFuZCB1c2VzIGhpcyB0YWxlbnRzIHRvIHNvbHZlIGEgcHJvYmxlbS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxMzRqaG5Vay5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIENhdCBpbiB0aGUgSGF0XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRHIuIFNldXNzXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJEci4gU2V1c3NcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDE5NTcsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkNhdHNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0yM1QwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUd28gY2hpbGRyZW4gc2l0dGluZyBhdCBob21lIG9uIGEgcmFpbnkgZGF5IGFyZSB2aXNpdGVkIGJ5IHRoZSBDYXQgaW4gdGhlIEhhdCB3aG8gc2hvd3MgdGhlbSBzb21lIHRyaWNrcyBhbmQgZ2FtZXMuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MUdocHN5eVRFTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIENpcmN1cyBTaGlwXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQ2hyaXMgVmFuIER1c2VuXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJDaHJpcyBWYW4gRHVzZW5cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDksXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkNpcmN1cywgU2hpcHMsIFBlb3BsZVwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAzLTExVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkEgY2lyY3VzIHNoaXAgaGFzIGFuIGFjY2lkZW50IG9mZiB0aGUgY29hc3Qgb2YgTWFpbmUsIHdoaWNoIGxlYXZlcyB0aGUgYW5pbWFscyBzdHJhbmRlZC4gVGhleSBhcmUgc29vbiB0YWtlbiBpbiBieSB0aGUgY2l0aXplbnMgb2YgYSBzbWFsbCBpc2xhbmQsIHdobyBncm93IGZvbmQgb2YgdGhlIG5ldyByZXNpZGVudHMgYW5kIGZpZ2h0IHRvIHByb3RlY3QgdGhlbS4gV2hlbiBhIGNpcmN1cyBzaGlwIHJ1bnMgYWdyb3VuZCBvZmYgdGhlIGNvYXN0IG9mIE1haW5lLCB0aGUgcG9vciBhbmltYWxzIGFyZSBsZWZ0IG9uIHRoZWlyIG93biB0byBzd2ltIHRoZSBjaGlsbHkgd2F0ZXJzLiBTdGFnZ2VyaW5nIG9udG8gYSBuZWFyYnkgaXNsYW5kLCB0aGV5IHNvb24gd2luIG92ZXIgdGhlIHdhcnkgdG93bnNwZW9wbGUgd2l0aCB0aGVpciBraW5kLCBjb3VyYWdlb3VzIHdheXMuIFNvIHdlbGwgZG8gdGhlIGNyaXR0ZXJzIGJsZW5kIGluIHRoYXQgd2hlbiB0aGUgZ3JlZWR5IGNpcmN1cyBvd25lciByZXR1cm5zIHRvIGNsYWltIHRoZW0sIHZpbGxhZ2VycyBvZiBhbGwgc3BlY2llcyBjb25zcGlyZSB0byBvdXRzbWFydCB0aGUgYmxvYXRlZCBibG93aGFyZC5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxaHVFeC1HZ0ZMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgQ3JvY29kaWxlIFdobyBEaWRuJ3QgTGlrZSBXYXRlclwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkdlbW1hIE1lcmlub1wiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiR2VtbWEgTWVyaW5vXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJDcm9jb2RpbGVzLCBXYXRlclwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJFdmVyeWJvZHkga25vd3MgdGhhdCBjcm9jb2RpbGVzIGxvdmUgd2F0ZXIsIGJ1dCB0aGlzIGxpdHRsZSBjcm9jb2RpbGUgaXMgZGlmZmVyZW504oCUaGUgZG9lc24ndCBsaWtlIGl0IGF0IGFsbCEgSGUgdHJpZXMgdG8gaGlzIGJlc3QgdG8gY2hhbmdlLCBidXQgd2hlbiBhdHRlbXB0IGF0IHN3aW1taW5nIGNhdXNlcyBhIHNoaXZlciB0aGVuIGEgc25lZXpl4oCUY291bGQgaXQgYmUgdGhhdCB0aGlzIGxpdHRsZSBjcm9jb2RpbGUgaXNuJ3QgYSBjcm9jb2RpbGUgYXQgYWxsPyBBIGxpdHRsZSBjcm9jb2RpbGUgY2Fubm90IGdldCBoaW1zZWxmIHRvIGxpa2Ugd2F0ZXIgYW5kIHRoZW4gZmluZHMgb3V0IHdoeS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxWG1FOVU5RE1MLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgQ3VyaW91cyBHYXJkZW5cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJQZXRlciBCcm93blwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiUGV0ZXIgQnJvd25cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDksXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiR2FyZGVuaW5nXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDMtMjJUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiV2hpbGUgb3V0IGV4cGxvcmluZyBvbmUgZGF5LCBhIGxpdHRsZSBib3kgbmFtZWQgTGlhbSBkaXNjb3ZlcnMgYSBzdHJ1Z2dsaW5nIGdhcmRlbiBhbmQgZGVjaWRlcyB0byB0YWtlIGNhcmUgb2YgaXQuIEFzIHRpbWUgcGFzc2VzLCB0aGUgZ2FyZGVuIHNwcmVhZHMgdGhyb3VnaG91dCB0aGUgZGFyaywgZ3JheSBjaXR5LCB0cmFuc2Zvcm1pbmcgaXQgaW50byBhIGx1c2gsIGdyZWVuIHdvcmxkLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFIb0hZSnY2VEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlRoZSBEYXkgdGhlIENyYXlvbnMgUXVpdFwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkRyZXcgRGF5d2FsdFwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiT2xpdmVyIEplZmZlcnNcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTMsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkNyYXlvbnMsIExldHRlcnMsIENvbG9yc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAxLTMwVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAyLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiUG9vciBEdW5jYW4ganVzdCB3YW50cyB0byBjb2xvci4gQnV0IHdoZW4gaGUgb3BlbnMgaGlzIGJveCBvZiBjcmF5b25zLCBoZSBmaW5kcyBvbmx5IGxldHRlcnMsIGFsbCBzYXlpbmcgdGhlIHNhbWUgdGhpbmc6IEhpcyBjcmF5b25zIGhhdmUgaGFkIGVub3VnaCEgVGhleSBxdWl0ISBCZWlnZSBDcmF5b24gaXMgdGlyZWQgb2YgcGxheWluZyBzZWNvbmQgZmlkZGxlIHRvIEJyb3duIENyYXlvbi4gQmxhY2sgd2FudHMgdG8gYmUgdXNlZCBmb3IgbW9yZSB0aGFuIGp1c3Qgb3V0bGluaW5nLiBCbHVlIG5lZWRzIGEgYnJlYWsgZnJvbSBjb2xvcmluZyBhbGwgdGhvc2UgYm9kaWVzIG9mIHdhdGVyLiBBbmQgT3JhbmdlIGFuZCBZZWxsb3cgYXJlIG5vIGxvbmdlciBzcGVha2luZ+KAlGVhY2ggYmVsaWV2ZXMgaGUgaXMgdGhlIHRydWUgY29sb3Igb2YgdGhlIHN1bi5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzL0ExVm0xZVZmbjJMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgRGVhZCBGYW1pbHkgRGlhelwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlAuSi4gQnJhY2VnaXJkbGVcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlBvbHkgQmVybmF0ZW5lXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkRlYWQsIEZlYXIsIEZhbWlseVwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAzLTExVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkV2ZXJ5IHNrZWxldG9uIGluIHRoZSBMYW5kIG9mIHRoZSBEZWFkIGlzIGV4Y2l0ZWQgdG8gY2VsZWJyYXRlIGVsIETDrWEgZGUgbG9zIE11ZXJ0b3Mgd2l0aCB0aGUgTGl2aW5nLiBCdXQgbm90IEFuZ2VsaXRvLiBIaXMgYmlnIHNpc3RlciBoYXMgdG9sZCBoaW0gYWxsIGFib3V0IHRoZWlyIGhvcnJpZnlpbmcgYnVsZ3kgZXllcyBhbmQgc3F1aXNoeSBza2luLiBTbyB3aGVuIEFuZ2VsaXRvIGlzIHNlcGFyYXRlZCBmcm9tIGhpcyBmYW1pbHkgaW4gdGhlIExhbmQgb2YgdGhlIExpdmluZywgaGUncyBwZXRyaWZpZWTigJR1bnRpbCBoZSBtYWtlcyBhIG5ldyBmcmllbmQgd2hvIGlzIGp1c3QgYXMgdGVycmlmaWVkIG9mIFRIRU0gYXMgQW5nZWxpdG8gaXMuIFRoZW4gaGlzIG5ldyBidWRkeSB0dXJucyBvdXQgdG8gYmUgKGd1bHAhKSBhIGxpdmluZyBib3khQW5nZWxpdG8gcnVucyBhcyBmYXN0IGFzIGhpcyBib255IGZlZXQgY2FuIGNhcnJ5IGhpbS4gRm9ydHVuYXRlbHkgdGhlIHRyYWRpdGlvbnMgb2YgdGhlIERheSBvZiB0aGUgRGVhZCByZXVuaXRlIHRoZSB0d28gYm95cywganVzdCBpbiB0aW1lIGZvciBzb21lIGhvbGlkYXkgZnVuLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFTUG94Kzh2SkwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlRoZSBEb251dCBDaGVmXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQm9iIFN0YWFrZVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiQm9iIFN0YWFrZVwiLFxuICAgICAgICBcInllYXJcIjogMjAwOCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJCYWtpbmcsIERvbnV0c1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAxLTMwVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJbiB0aGlzIGRlbGljaW91cyB0YWxlLCBhIGJha2VyIGhhbmdzIG91dCBoaXMgc2hpbmdsZSBvbiBhIHNtYWxsIHN0cmVldCBhbmQgc29vbiB0aGUgbGluZSBmb3IgaGlzIGRvbnV0cyBzdHJldGNoZXMgZG93biB0aGUgYmxvY2suIEJ1dCBpdCdzIG5vdCBsb25nIGJlZm9yZSB0aGUgY29tcGV0aXRpb24gYXJyaXZlcyBhbmQgYSBiYXR0bGUgb2YgdGhlIGJha2VycyBlbnN1ZXMuIEEgYmFrZXIgbXVzdCBjb21lIHVwIHdpdGggbmV3IGZsYXZvciBpZGVhcyB0byBzdGF5IGNvbXBldGl0aXZlIHdpdGggdGhlIG5ldyBkb251dCBzaG9wIHRoYXQgaGFzIG9wZW5lZCB1cCBhY3Jvc3MgdGhlIHN0cmVldCBmcm9tIGhpcyBzdG9yZSwgYnV0IGhpcyB1bmlxdWUgY29tYmluYXRpb25zIHN0YXJ0IHRvIGRyaXZlIGhpcyBjdXN0b21lcnMgYXdheS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxN0NULVJHWEVMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgRmFudGFzdGljIEZseWluZyBCb29rcyBvZiBNci4gTW9ycmlzIExlc3Ntb3JlXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiV2lsbGlhbSBKb3ljZVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiSm9lIEJsdWhtXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEyLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJCb29rcywgTGlicmFyaWVzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIk9XTlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNb3JyaXMgTGVzc21vcmUgbG92ZXMgd29yZHMsIHN0b3JpZXMsIGFuZCBib29rcywgYW5kIGFmdGVyIGEgdG9ybmFkbyBjYXJyaWVzIGhpbSB0byBhbm90aGVyIGxhbmQsIGRyZWFyeSBhbmQgY29sb3JsZXNzLCBoZSBmaW5kcyBhIHNpbmdsZSBib29rIGluIGNvbG9yIHRoYXQgbGVhZHMgaGltIHRvIGFuIGFtYXppbmcgbGlicmFyeSwgd2hlcmUgaGUgbGVhcm5zIHRoZSBib29rcyBuZWVkIGhpbSBhcyBtdWNoIGFzIGhlIG5lZWRzIHRoZW0uIE1vcnJpcyBMZXNzbW9yZSBsb3ZlcyB3b3Jkcywgc3RvcmllcyBhbmQgYm9va3MsIGFuZCBhZnRlciBhIHRvcm5hZG8gY2FycmllcyBoaW0gdG8gYW5vdGhlciBsYW5kLCBkcmVhcnkgYW5kIGNvbG9ybGVzcywgaGUgZmluZHMgYSBzaW5nbGUgYm9vayBpbiBjb2xvciB0aGF0IGxlYWRzIGhpbSB0byBhbiBhbWF6aW5nIGxpYnJhcnkgd2hlcmUsIGhlIGxlYXJucywgdGhlIGJvb2tzIG5lZWQgaGltIGFzIG11Y2ggYXMgaGUgbmVlZHMgdGhlbS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxTGxwcUVlM3FMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgRmFybWVyJ3MgQXdheSEgQmFhISBOZWlnaCFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJBbm5lIFZpdHR1ciBLZW5uZWR5XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJBbm5lIFZpdHR1ciBLZW5uZWR5XCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJEb21lc3RpYyBBbmltYWxzLCBBbmltYWwgU291bmRzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDMtMDNUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiV2hhdCBtaXNjaGllZiBkbyB0aGUgYW5pbWFscyBnZXQgdXAgdG8gd2hlbiB0aGUgZmFybWVy4oCZcyBiYWNrIGlzIHR1cm5lZD8gQW5uZSBWaXR0dXIgS2VubmVkeSBsZXRzIHVzIGtub3cgaW4gdGhlIGFuaW1hbHPigJkgb3duIHdvcmRzISBUaGVyZSB3aWxsIGJlIGJvYXRpbmcsIG9mIGNvdXJzZSwgYW5kIGEgcGljbmljLCBhIHJvbGxlcmNvYXN0ZXIgcmlkZSwgSmV0IFNraWluZywgYSBob3QtYWlyIGJhbGxvb24sIGJhbGxyb29tIGRhbmNpbmcg4oCUIG9oLCBubyEgQ291bGQgdGhhdCBhcmYhIGFyZiEgYXJmISBtZWFuIHRoZSBmYXJtZXLigJlzIGhlYWRpbmcgYmFjaz8gRXZlbiB0aGUgeW91bmdlc3QgbGlzdGVuZXJzIGNhbiByZWFkIHRoaXMgYm9vayBhbG91ZCBieSBmb2xsb3dpbmcgYWxvbmcgd2l0aCB0aGUgcGljdHVyZXMgYW5kIG1ha2luZyBlYWNoIGFuaW1hbOKAmXMgc291bmQuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MVkyOFl2V1RLTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIEZ1bGwgTW9vbiBhdCB0aGUgTmFwcGluZyBIb3VzZVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkF1ZHJleSBXb29kXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJEb24gV29vZFwiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJQZXRzLCBTbGVlcFwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxvdmVkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiA2LFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSW4gdGhlIHdpZGUtYXdha2UgYmVkIGluIHRoZSBmdWxsLW1vb24gaG91c2UsIGV2ZXJ5b25lIGlzIHJlc3RsZXNzISBUaGUgbW9vbmxpZ2h0IGlzIHBvdXJpbmcgaW4gYW5kIG5vIG9uZSBjYW4gZ2V0IHRvIHNsZWVwOiBub3QgR3Jhbm55LCBoZXIgZ3JhbmRjaGlsZCwgdGhlIGRvZywgdGhlIGNhdCwgb3IgZXZlbiBhIG1vdXNlLiBJdCdzIG5vdCB1bnRpbCBhIHRpbnkgbXVzaWNhbCB2aXNpdG9yIG9mZmVycyB1cCBhIHNvb3RoaW5nIHNvbmcgZG9lcyB0aGUgbWVuYWdlcmllIHNldHRsZSBkb3duLCBhbmQgZmluYWxseSBldmVyeW9uZSBpcyBvZmYgdG8gZHJlYW1sYW5kLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFDWWNnY0ZPb0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlRoZSBHaW5nZXJicmVhZCBNYW5cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJLYXJlbiBTY2htaWR0XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJLYXJlbiBTY2htaWR0XCIsXG4gICAgICAgIFwieWVhclwiOiAxOTg1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJGb2xrbG9yZSwgRmFpcnkgVGFsZXNcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkFuIG9sZCBtYW4gYW5kIGFuIG9sZCB3b21hbiBiYWtlIGEgZ2luZ2VyYnJlYWQgbWFuIHdobyBydW5zIG9mZi4gQSBmcmVzaGx5IGJha2VkIGdpbmdlcmJyZWFkIG1hbiBlc2NhcGVzIHdoZW4gaGUgaXMgdGFrZW4gb3V0IG9mIHRoZSBvdmVuIGFuZCBlbHVkZXMgYSBudW1iZXIgb2YgYW5pbWFscyB1bnRpbCBoZSBtZWV0cyBhIGNsZXZlciBmb3guXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MXV5LUduK2dtTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIEdyZWF0IExvbGxpcG9wIENhcGVyXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRGFuIEtyYWxsXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJEYW4gS3JhbGxcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTMsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGb29kXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkxvbGxpcG9wcywgQ2FwZXJzLCBDb250ZW50bWVudCwgQ2FuZHlcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMyxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk9uZSBjcmFua3kgY2FwZXIgaXMgYWJvdXQgdG8gbGVhcm4gdGhhdCBiZWluZyBzYWx0eSBtaWdodCBiZSBqdXN0IGFzIGdvb2QgYXMgYmVpbmcgc3dlZXQuIEhhdmluZyBhZHVsdHMgbG92ZSBoaXMgYWNpZGljIHRhc3RlIGlzIG5vdCBlbm91Z2ggZm9yIE1yLiBDYXBlci4gSGUgd2FudHMgbW9yZS4gSGUgd2FudHMgdGhlIGNoaWxkcmVuIG9mIHRoZSB3b3JsZCB0byBsb3ZlIGhpbeKAlGp1c3QgYXMgbXVjaCBhcyB0aGV5IGxvdmUgdGhlIHN3ZWV0LCBzYWNjaGFyaW5lIExvbGxpcG9wLiBBbmQgdGh1cyBhIHBsb3QgaXMgaGF0Y2hlZDogQ2FwZXItZmxhdm9yZWQgbG9sbGlwb3BzIGFyZSBkaXNwYXRjaGVkIHRocm91Z2hvdXQgdGhlIHdvcmxkLi4uYW5kIGV2ZXJ5dGhpbmcgZ29lcyBob3JyaWJseSB3cm9uZy4gV2lsbCBNci4gQ2FwZXIgZmluZCBhIHdheSB0byByZXBhaXIgdGhlIGhhdm9jIGhl4oCZcyB3cmVha2VkIGJ5IG92ZXItcmVhY2hpbmc/IE1heWJlLCBpZiBMb2xsaXBvcCBoZWxwcyBzYXZlIHRoZSBkYXkhXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MXFGT0lhbEdVTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIEdydWZmYWxvXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSnVsaWEgRG9uYWxkc29uXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJKdWxpYSBEb25hbGRzb25cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDE5OTksXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIk1vbnN0ZXJzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMTJUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAyLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTW91c2UgZXNjYXBlcyBoaXMgcHJlZGF0b3JzIGJ5IHRlbGxpbmcgdGhlbSBoZSBpcyBvbiBoaXMgd2F5IHRvIG1lZXQgaGlzIGZyaWVuZCB0aGUgZ3J1ZmZhbG8sIGEgY3JlYXR1cmUgd2l0aCB0ZXJyaWJsZSBjbGF3cywgdHVza3MsIGFuZCBqYXdzLiBUaGUgZ3J1ZmZhbG8sIGhvd2V2ZXIsIGlzIGp1c3QgaW4gTW91c2UncyBpbWFnaW5hdGlvbiwgb3IgaXMgaXQ/IEEgY2xldmVyIG1vdXNlIHVzZXMgdGhlIHRocmVhdCBvZiBhIHRlcnJpZnlpbmcgY3JlYXR1cmUgdG8ga2VlcCBmcm9tIGJlaW5nIGVhdGVuIGJ5IGEgZm94LCBhbiBvd2wsIGFuZCBhIHNuYWtlLS0gb25seSB0byBoYXZlIHRvIG91dHdpdCB0aGF0IGNyZWF0dXJlIGFzIHdlbGwuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MWtySUR4U3Q5TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIEluY3JlZGlibGUgQm9vayBFYXRpbmcgQm95XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiT2xpdmVyIEplZmZlcnNcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIk9saXZlciBKZWZmZXJzXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDA3LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkZvb2QsIEhhYml0c1wiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTGlrZSBtYW55IGNoaWxkcmVuLCBIZW5yeSBsb3ZlcyBib29rcy4gQnV0IEhlbnJ5IGRvZXNu4oCZdCBsaWtlIHRvIHJlYWQgYm9va3MsIGhlIGxpa2VzIHRvIGVhdCB0aGVtLiBCaWcgYm9va3MsIHBpY3R1cmUgYm9va3MsIHJlZmVyZW5jZSBib29rcyAuIC4gLiBpZiBpdCBoYXMgcGFnZXMsIEhlbnJ5IGNoZXdzIHRoZW0gdXAgYW5kIHN3YWxsb3dzIChidXQgcmVkIG9uZXMgYXJlIGhpcyBmYXZvcml0ZSkuIEFuZCB0aGUgbW9yZSBoZSBlYXRzLCB0aGUgc21hcnRlciBoZSBnZXRz4oCUaGXigJlzIG9uIGhpcyB3YXkgdG8gYmVpbmcgdGhlIHNtYXJ0ZXN0IGJveSBpbiB0aGUgd29ybGQhIEJ1dCBvbmUgZGF5IGhlIGZlZWxzIHNpY2sgdG8gaGlzIHN0b21hY2guIEFuZCB0aGUgaW5mb3JtYXRpb24gaXMgc28ganVtYmxlZCB1cCBpbnNpZGUsIGhlIGNhbuKAmXQgZGlnZXN0IGl0ISBDYW4gSGVucnkgZmluZCBhIHdheSB0byBlbmpveSBib29rcyB3aXRob3V0IHVzaW5nIGhpcyB0ZWV0aD9cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzcxM0VScUl2OWhMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgTGFzdCBDaG9jb2xhdGUgQ2hpcCBDb29raWVcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJKYW1pZSBSaXhcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkNsYXJlIEVsc29tXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkJha2luZ1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTE5VDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCJOb25lXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUaGVyZSBpcyBvbmUgY2hvY29sYXRlIGNoaXAgY29va2llIGxlZnQtLWFuZCBKYWNrIGlzIHJlYWR5IHRvIGVhdCBpdCEgQnV0IHRoZW4gaGlzIG1vbSByZW1pbmRzIGhpbSBvZiBoaXMgbWFubmVycy4gSGUgbXVzdCBvZmZlciB0aGUgY29va2llIHRvIEVWRVJZT05FIGVsc2UgZmlyc3QuIFNvIEphY2sgb2ZmZXJzIGl0IHRvIGFsbCBzb3J0cyBvZiBwZW9wbGUtLWhlIGV2ZW4gZ29lcyB0byBzcGFjZSBhbmQgb2ZmZXJzIGl0IHRvIGFuIGFsaWVuISBCdXQgdGhlIGFsaWVuIGRvZXNuJ3Qgd2FudCB0byBlYXQgdGhlIGNvb2tpZS0taGUgd2FudHMgdG8gZWF0IEphY2shXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy80MUFyU0JCWmFCTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIExpdHRsZSBNb3VzZSBTYW50aVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkRhdmlkIEV1Z2VuZSBSYXlcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlNhbnRpYWdvIEdlcm1hbm9cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIk1pY2UsIENhdHNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0yN1QwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTWVldCB0aGUgbGl0dGxlIG1vdXNlIFNhbnRp4oCUaGUgbWF5IGJlIHNtYWxsLCBidXQgaGUgaGFzIGEgYmlnIGRyZWFtISBUaGlzIGJlYXV0aWZ1bGx5IGlsbHVzdHJhdGVkIHN0b3J5IGV4cGxvcmVzIG9uZSBvZiB0aGUgbW9zdCBpbXBvcnRhbnQgYXNwZWN0cyBvZiBhIGNoaWxk4oCZcyBsaWZlLCB0aGUgc2VhcmNoIGZvciBpZGVudGl0eS4gU2FudGkgd2FudHMgdG8gYmUgYSBjYXQsIGFuZCBldmVuIHRob3VnaCBhbGwgdGhlIG90aGVyIG1pY2UgbGF1Z2ggYXQgaGltLCBoZSBmb2xsb3dzIGhpcyBkcmVhbS4gVGhpcyB0aW1lbGVzcyBzdG9yeSBlbmRzIHdpdGggYSB3aGltc2ljYWwgdHdpc3QgYXMgU2FudGkgbGVhcm5zIGEgdmFsdWFibGUgbGVzc29uIGFib3V0IHNlbGYtZGV0ZXJtaW5hdGlvbiB3aGlsZSBhbHNvIGxlYXJuaW5nIGhlIGlzIG5vdCB0aGUgb25seSBkcmVhbWVyIVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFZRjBkOENLaUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlRoZSBMb25lbHkgQmVhc3RcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJDaHJpcyBKdWRnZVwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiQ2hyaXMgSnVkZ2VcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTIsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkNyZWF0dXJlcywgVm95YWdlcywgVHJhdmVsc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTEyLTEwVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMyxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkhhdmUgeW91IGhlYXJkIG9mIHRoZSBCZWFzdHM/IE5vPyBXZWxsLCBJbSBub3Qgc3VycHJpc2VkLiBOb3QgbWFueSBwZW9wbGUgaGF2ZS4gVGhhdHMgYmVjYXVzZSB0aGUgQmVhc3RzIGFyZSB2ZXJ5IHJhcmUuIFRoaXMgaXMgdGhlIHRhbGUgb2Ygb25lIEJlYXN0LCB0aGUgcmFyZXN0IG9mIHRoZSByYXJlLCBhIEJlYXN0IHdobyBkZWNpZGVzIGhlIGlzIGxvbmVseSBhbmQgc2V0cyBvdXQgdG8gZmluZCB0aGUgb3RoZXIgQmVhc3RzLiBXaWxsIGhpcyBkYXJpbmcgYW5kIGRhbmdlcm91cyBqb3VybmV5IGxlYWQgaGltIHRvIHNvbWUgZnJpZW5kcz9cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxU001ZStZN0tMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgTG9yYXhcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJEci4gU2V1c3NcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkRyLiBTZXVzc1wiLFxuICAgICAgICBcInllYXJcIjogMTk3NyxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkZhbnRhc3lcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQ3JlYXR1cmVzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMTEtMjRUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkxvbmcgYmVmb3JlIHNhdmluZyB0aGUgZWFydGggYmVjYW1lIGEgZ2xvYmFsIGNvbmNlcm4sIERyLiBTZXVzcywgc3BlYWtpbmcgdGhyb3VnaCBoaXMgY2hhcmFjdGVyIHRoZSBMb3JheCwgd2FybmVkIGFnYWluc3QgbWluZGxlc3MgcHJvZ3Jlc3MgYW5kIHRoZSBkYW5nZXIgaXQgcG9zZWQgdG8gdGhlIGVhcnRoJ3MgbmF0dXJhbCBiZWF1dHkuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MVFUalo4dnljTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIE1hZ2ljIFJhYmJpdFwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkFubmV0dGUgTGVCbGFuYyBDYXRlXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJBbm5ldHRlIExlQmxhbmMgQ2F0ZVwiLFxuICAgICAgICBcInllYXJcIjogMjAwNyxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiUmFiYml0c1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTA5LTExVDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIldoZW4gQnVubnkgYmVjb21lcyBzZXBhcmF0ZWQgZnJvbSBSYXksIGEgbWFnaWNpYW4gd2hvIGlzIGhpcyBidXNpbmVzcyBwYXJ0bmVyIGFuZCBmcmllbmQsIHRoZSBsb25lbHkgYW5kIGZyaWdodGVuZWQgQnVubnkgZmluZHMgYSBnbGl0dGVyaW5nIHRyYWlsIG9mIGhvcGUuIFdoZW4gQnVubnkgYmVjb21lcyBzZXBhcmF0ZWQgZnJvbSBSYXksIGEgbWFnaWNpYW4gd2hvIGlzIGhpcyBidXNpbmVzcyBwYXJ0bmVyIGFuZCBmcmllbmQsIGhlIGZvbGxvd3MgYSBjcm93ZCB0byBhIHBhcmsgd2hlcmUgaGUgaGFzIGEgbG92ZWx5IGFmdGVybm9vbiwgYW5kIGFmdGVyIHRoZSBwZW9wbGUgbGVhdmUgYW5kIGRhcmtuZXNzIGZhbGxzLCB0aGUgbG9uZWx5IGFuZCBmcmlnaHRlbmVkIEJ1bm55IGZpbmRzIGEgZ2xpdHRlcmluZyB0cmFpbCBvZiBob3BlLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFpWVpDWjdISEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlRoZSBNaXR0ZW5cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIkEgVWtyYWluaWFuIEZvbGt0YWxlXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSmFuIEJyZXR0XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJKYW4gQnJldHRcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDksXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkJlYXJzLCBPd2xzLCBGb3gsIFJhYmJpdHMsIE1pY2VcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0xNlQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTG92ZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMyxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNldmVyYWwgYW5pbWFscyBzbGVlcCBzbnVnbHkgaW4gTmlja2kncyBsb3N0IG1pdHRlbiB1bnRpbCB0aGUgYmVhciBzbmVlemVzLiBPbmUgYnkgb25lLCBhbmltYWxzIGluIGEgc25vd3kgZm9yZXN0IGNyYXdsIGludG8gTmlja2kncyBsb3N0IHdoaXRlIG1pdHRlbiB0byBnZXQgd2FybSB1bnRpbCB0aGUgYmVhciBzbmVlemVzLCBzZW5kaW5nIHRoZSBhbmltYWxzIGZseWluZyB1cCBhbmQgb3V0IG9mIHRoZSBtaXR0ZW4uIE9uIGVhY2ggdHVybiBvZiB0aGUgcGFnZSwgc2lnbmF0dXJlIGJvcmRlcnMgaW5zcGlyZWQgYnkgVWtyYWluaWFuIGZvbGsgYXJ0IGhpbnQgYXQgd2hhdCBhbmltYWwgaXMgY29taW5nIG5leHQuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MWlxYjBQUkY1TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIE1vbnN0ZXIgV2hvIExvc3QgSGlzIE1lYW5cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJUaWZmYW55IFN0cmVsaXR6IEhhYmVyXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJLaXJzdGllIEVkbXVuZHNcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTIsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIk1vbnN0ZXJzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTUtMTItMTBUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAyLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVGVhc2VkIGJ5IHRoZSBvdGhlciBtb25zdGVycyBmb3IgYmVpbmcgbmljZSBpbnN0ZWFkIG9mIG1lYW4sIE9uc3RlciBwcmVmZXJzIHBsYXlpbmcgd2l0aCBjaGlsZHJlbiBhbmQgaGVscGluZyB0aGVtIHdpdGggdGhlaXIgY2hvcmVzIHRvIGZyaWdodGVuaW5nIHRoZW0uIFRlYXNlZCBieSB0aGUgb3RoZXIgbW9uc3RlcnMgZm9yIGJlaW5nIG5pY2UgaW5zdGVhZCBvZiBtZWFuLCBPbnN0ZXIgcHJlZmVycyB0byBwbGF5IHdpdGggY2hpbGRyZW4gYW5kIGhlbHAgdGhlbSB3aXRoIHRoZWlyIGNob3JlcyByYXRoZXIgdGhhbiBmcmlnaHRlbiB0aGVtLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFjYUl5WkpOZUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlRoZSBNb25zdGVycycgTW9uc3RlclwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlBhdHJpY2sgTWNEb25uZWxsXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJQYXRyaWNrIE1jRG9ubmVsbFwiLFxuICAgICAgICBcInllYXJcIjogMjAxMixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkZhbnRhc3lcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiTW9uc3RlcnNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0yN1QwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJHcm91Y2gsIEdydW1wLCBhbmQgbGl0dGxlIEdsb29tICduJyBEb29tIHNwZW5kIG11Y2ggb2YgdGhlaXIgdGltZSBhcmd1aW5nIG92ZXIgd2hvIGlzIHRoZSBiaWdnZXN0IGFuZCBiYWRkZXN0IHVudGlsIHRoZXkgYnVpbGQgYSBtb25zdGVyIHRvZ2V0aGVyIHRoYXQgdHVybnMgb3V0IHRvIGJlIHZlcnkgZGlmZmVyZW50IHRoYW4gd2hhdCB0aGV5IGV4cGVjdC4gR3JvdWNoLCBHcnVtcCwgYW5kIGxpdHRsZSBHbG9vbSAnbicgRG9vbSBzcGVuZCBtdWNoIG9mIHRoZWlyIHRpbWUgYXJndWluZyBvdmVyIHdobyBpcyB0aGUgXFxcImJpZ2dlc3QgYW5kIGJhZGRlc3RcXFwiIHVudGlsIHRoZXkgYnVpbGQgYSBtb25zdGVyIHRvZ2V0aGVyIHRoYXQgdHVybnMgb3V0IHRvIGJlIHZlcnkgZGlmZmVyZW50IHRoYW4gd2hhdCB0aGV5IGV4cGVjdC5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzcxSGRiQWt1NldMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgTW9uc3RvcmVcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJUYXJhIExhemFyXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJKYW1lcyBCdXJrc1wiLFxuICAgICAgICBcInllYXJcIjogMjAxMyxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkZhbnRhc3lcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiTW9uc3RlcnMsIEJyb3RoZXJzLCBTaXN0ZXJzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIk9XTlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxvdmVkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiA4LFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVGhlIE1vbnN0b3JlIGlzIHRoZSBwbGFjZSB0byBnbyBmb3IgYWxsIG9mIHlvdXIgbW9uc3Rlcmx5IG5lZWRzLiBXaGljaCBpcyBwZXJmZWN0LCBzaW5jZSBaYWNrIGRlZmluaXRlbHkgaGFzIGEgbW9uc3Rlcmx5IG5lZWQuIFRoZSBwcm9ibGVtPyBIaXMgcGVza3kgbGl0dGxlIHNpc3RlciwgR3JhY2llLCB3aG8gbmV2ZXIgcGF5cyBhdHRlbnRpb24gdG8gdGhhdCBcXFwiS2VlcCBPdXRcXFwiIHNpZ24gb24gWmFjaydzIGRvb3ItLXRoZSBvbmUgaGUgaGFzIG1hZGUgZXNwZWNpYWxseSBmb3IgaGVyLiBCdXQgd2hlbiBaYWNrJ3MgbW9uc3RlcnMgZG9uJ3QgZXhhY3RseSB3b3JrIGFzIHBsYW5uZWQsIGhlIHNvb24gZmluZHMgb3V0IHRoYXQgdGhlIE1vbnN0b3JlIGhhcyBhIGZldyBydWxlczogTm8gUmVmdW5kcy4gTm8gZXhjaGFuZ2VzLiBObyBleGNlcHRpb25zLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFPc1hyNGxFT0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlRoZSBNb3N0IE1hZ25pZmljZW50IFRoaW5nXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQXNobGV5IFNwaXJlc1wiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiQXNobGV5IFNwaXJlc1wiLFxuICAgICAgICBcInllYXJcIjogMjAxNCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJJbnZlbnRpb25zLCBEb2dzLCBGcnVzdHJhdGlvbiwgQW5nZXIsIEdpcmxzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMDZUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJBIGxpdHRsZSBnaXJsIGFuZCBoZXIgY2FuaW5lIGFzc2lzdGFudCBzZXQgb3V0IHRvIG1ha2UgdGhlIG1vc3QgbWFnbmlmaWNlbnQgdGhpbmcuIEJ1dCBhZnRlciBtdWNoIGhhcmQgd29yaywgdGhlIGVuZCByZXN1bHQgaXMgbm90IHdoYXQgdGhlIGdpcmwgaGFkIGluIG1pbmQuIEZydXN0cmF0ZWQsIHNoZSBxdWl0cy4gSGVyIGFzc2lzdGFudCBzdWdnZXN0cyBhIGxvbmcgd2FsaywgYW5kIGFzIHRoZXkgd2FsaywgaXQgc2xvd2x5IGJlY29tZXMgY2xlYXIgd2hhdCB0aGUgZ2lybCBuZWVkcyB0byBkbyB0byBzdWNjZWVkLiBBIGNoYXJtaW5nIHN0b3J5IHRoYXQgd2lsbCBnaXZlIGtpZHMgdGhlIG1vc3QgbWFnbmlmaWNlbnQgdGhpbmc6IHBlcnNwZWN0aXZlISBBIGxpdHRsZSBnaXJsIGFuZCBoZXIgY2FuaW5lIGFzc2lzdGFudCBzZXQgb3V0IHRvIG1ha2UgdGhlIG1vc3QgbWFnbmlmaWNlbnQgdGhpbmcsIGJ1dCBhZnRlciBtdWNoIGhhcmQgd29yaywgdGhlIGVuZCByZXN1bHQgaXMgbm90IHdoYXQgdGhlIGdpcmwgaGFkIGluIG1pbmQuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MUNaV2diOGtxTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIE5hcHBpbmcgSG91c2VcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJBdWRyZXkgV29vZFwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiRG9uIFdvb2RcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDksXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiUGV0cywgU2xlZXBcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMb3ZlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiA2LFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSW4gdGhpcyBjdW11bGF0aXZlIHRhbGUsIGEgd2FrZWZ1bCBmbGVhIGF0b3AgYSBudW1iZXIgb2Ygc2xlZXBpbmcgcGVvcGxlIGFuZCBhc3NvcnRlZCBjcmVhdHVyZXMgY2F1c2VzIGEgY29tbW90aW9uLCB3aXRoIGp1c3Qgb25lIGJpdGUuIEluIHRoaXMgY3VtdWxhdGl2ZSB0YWxlLCBhIHdha2VmdWwgZmxlYSBhdG9wIGEgbnVtYmVyIG9mIHNsZWVwaW5nIGNyZWF0dXJlcyBjYXVzZXMgYSBjb21tb3Rpb24gd2l0aCBqdXN0IG9uZSBiaXRlLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFBNndaSlc3VEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlRoZSBOaWNlc3QgTmF1Z2h0aWVzdCBGYWlyeVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIk5pY2sgV2FyZFwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiTmljayBXYXJkXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE2LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJGYWlyaWVzLCBNYWdpY1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAzLTAzVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIldoZW4gdGhlIHZpbGxhZ2VycyB0aHJlYXRlbiB0byBjaGFzZSB0aGUgTmF1Z2h0eSBGYWlyeSBvdXQgb2YgdG93biBpZiBzaGUgZG9lc24ndCBzdGFydCBiZWluZyBuaWNlLCBzaGUgdm93cyB0byBiZSB3ZWxsLWJlaGF2ZWQsIGJ1dCBkZXNwaXRlIHRoZSBnb29kIHNoZSB0cmllcyB0byBkbywgaGVyIG1hZ2ljIGNvbnRpbnVhbGx5IGJhY2tmaXJlcy5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzcxZU9YajgrS2tMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgT2N0b3B1cHB5XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTWFydGluIE1jS2VubmFcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIk1hcnRpbiBNY0tlbm5hXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJPY3RvcHVzLCBEb2dzLCBQZXRzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDMtMTFUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAzLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiRWRnYXIgd2FudGVkIGEgZG9nLiBJbnN0ZWFkLCBoZSBnb3QgYW4gb2N0b3B1cyBuYW1lZCBKYXJ2aXMuIEphcnZpcyBpcyBicmlsbGlhbnQgYW5kIGRvZXMgaGlzIGJlc3QgdG8gYWN0IGxpa2UgdGhlIGRvZyBFZGdhciB3YW50cywgYnV0IG5vdGhpbmcgaGUgZG9lcyBpcyBnb29kIGVub3VnaCB0byBwbGVhc2UgRWRnYXIuIFVsdGltYXRlbHksIEVkZ2FyIHJlY29nbml6ZXMgdGhhdCB3aGlsZSBKYXJ2aXMgbWlnaHQgbm90IGJlIHRoZSBkb2cgaGUgd2FudGVkLCBoZSBpcyBzcGVjaWFsIGluIGhpcyBvd24gZW5kZWFyaW5nIHdheS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxdE9PNFNLWklMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgUGlnZW9uIFdhbnRzIEEgUHVwcHkhXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTW8gV2lsbGllbXNcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIk1vIFdpbGxpZW1zXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDA4LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJCaXJkc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAyLTIxVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAyLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVGhlIHBpZ2VvbiByZWFsbHksIHJlYWxseSB3YW50cyBhIHB1cHB5LCBidXQgd2hlbiBhIHB1cHB5IGFycml2ZXMgdGhlIHBpZ2VvbiBjaGFuZ2VzIGl0cyBtaW5kLiBUaGUgcGlnZW9uIHJlYWxseSB3YW50cyBhIHB1cHB5IGFuZCB3aWxsIHRha2UgY2FyZSBvZiBpdCwgdW50aWwgdGhlIHBpZ2VvbiBtZWV0cyBvbmUuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MTRNeXk3LUg3TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIFBpcmF0ZXMgTmV4dCBEb29yXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSm9ubnkgRHVkZGxlXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJKb25ueSBEdWRkbGVcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTIsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiUGlyYXRlcywgTmVpZ2hib3JzLCBGcmllbmRzaGlwXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDMtMTFUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQSBwaXJhdGUgZmFtaWx5IG1vdmVzIGludG8gYSBxdWlldCBzZWFzaWRlIG5laWdoYm9yaG9vZCBhbmQgY2F1c2VzIGFsbCB0aGUgbmVpZ2hib3JzIHRvIGdvc3NpcCwgYW5kIGFmdGVyIE1hdGlsZGEgYmVjb21lcyBmcmllbmRzIHdpdGggeW91bmcgcGlyYXRlIEppbSBMYWQsIHRoZSBwaXJhdGUgZmFtaWx5IGRlY2lkZXMgdG8gc2V0IHNhaWwgYnV0IG5vdCB3aXRob3V0IGxlYXZpbmcgYmVoaW5kIGEgZmV3IGhpZGRlbiBzdXJwcmlzZXMuIFdoZW4gYSBwaXJhdGUgZmFtaWx5IG1vdmVzIGludG8gaGVyIHF1aWV0IHNlYXNpZGUgdG93biBkdXJpbmcgc2hpcCByZXBhaXJzLCB5b3VuZyBNYXRpbGRhIGRlZmllcyB0aGUgZWRpY3RzIG9mIHRoZSBnb3NzaXBpbmcgYWR1bHRzIGluIHRoZSBjb21tdW5pdHkgdG8gYmVmcmllbmQgeW91bmcgcGlyYXRlIEppbSBMYWQuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MVRweUJjK0hYTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIFByaW5jZXNzIGFuZCB0aGUgR2lhbnRcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJDYXJ5bCBIYXJ0XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJTYXJhaCBXYXJidXJ0b25cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlByaW5jZXNzZXMsIFNsZWVwLCBHaWFudHNcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMyxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlByaW5jZXNzIFNvcGhpZSBpcyBleGhhdXN0ZWQsIGFuZCBpdCdzIGFsbCBiZWNhdXNlIHRoYXQgZ3J1bXB5IG9sZCBnaWFudCB1cCBvbiB0aGUgYmVhbnN0YWxrIGNhbid0IHNsZWVwLiBIaXMgc3RvbXBzIGFuZCBzdGFtcHMga2VlcCBldmVyeW9uZSBhd2FrZS4gQnV0IGFzIHRoZSByZXNvdXJjZWZ1bCBQcmluY2VzcyBTb3BoaWUgcmVhZHMgaGVyIGZhdm9yaXRlIGJvb2sgb2YgZmFpcnkgdGFsZXMsIHNoZSB3b25kZXJzIGlmIHNoZSBtaWdodCBqdXN0IGhhdmUgdGhlIGFuc3dlci4gU2hlIGJyYXZlbHkgY2xpbWJzIHRoZSBiZWFuc3RhbGsgY2FycnlpbmcgYSB0YXN0eSBib3dsIG9mIHBvcnJpZGdlLCBhIGN1ZGRseSB0ZWRkeSBiZWFyLCBhbmQgY296eSBibGFua2V0IHRvIGhlbHAgc29vdGhlIHRoZSBnaWFudC4gQnV0IG5vdGhpbmcgd29ya3MgdW50aWwgZmluYWxseSBTb3BoaWUgaGl0cyB1cG9uIHRoZSBwZXJmZWN0IHRoaW5nIOKAlCBhIGJlZHRpbWUgc3RvcnkhIEV2ZXJ5b25lIGxpdmVzIChhbmQgc2xlZXBzKSBoYXBwaWx5IGV2ZXIgYWZ0ZXIsIGJ1dCB3aGVuIFNvcGhpZSB0aGVuIHRlYWNoZXMgdGhlIGdpYW50IGhvdyB0byByZWFkIGhpbXNlbGYsIGl0IGlzIHRoZSBtb3N0IHBlcmZlY3QgZW5kaW5nIG9mIGFsbC5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzcxMVpiMmtlRnZMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgUHJpbmNlc3MgYW5kIHRoZSBQaWdcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJKb2huYXR0YW4gRW1tZXR0XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJQb2x5IEJlcm5hdGVuZVwiLFxuICAgICAgICBcInllYXJcIjogMjAxMixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJQcmluY2VzcywgUGlnc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTExLTI0VDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBJdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlRoZXJlJ3MgYmVlbiBhIHRlcnJpYmxlIG1peC11cCBpbiB0aGUgcm95YWwgbnVyc2VyeS4gUHJpc2NpbGxhIHRoZSBwcmluY2VzcyBoYXMgYWNjaWRlbnRhbGx5IHN3aXRjaGVkIHBsYWNlcyB3aXRoIFBpZ21lbGxhLCB0aGUgZmFybWVyJ3MgbmV3IHBpZ2xldC4gVGhlIGtpbmRseSBmYXJtZXIgYW5kIGhpcyB3aWZlIGJlbGlldmUgaXQncyB0aGUgd29yayBvZiBhIGdvb2Qgd2l0Y2gsIHdoaWxlIHRoZSBpbGwtdGVtcGVyZWQga2luZyBhbmQgcXVlZW4gYmxhbWUgdGhlIGJhZCB3aXRjaC1hZnRlciBhbGwsIHRoaXMgaGFwcGVucyBpbiBmYWlyeSB0YWxlcyBhbGwgdGhlIHRpbWUhIFdoaWxlIFByaXNjaWxsYSBncm93cyB1cCBvbiB0aGUgZmFybSwgcG9vciB5ZXQgdmVyeSBoYXBweSwgdGhpbmdzIGRvbid0IHR1cm4gb3V0IHF1aXRlIHNvIHdlbGwgZm9yIFBpZ21lbGxhLiBLaXNzaW5nIGEgZnJvZyBoYXMgZG9uZSB3b25kZXJzIGJlZm9yZSwgYnV0IHdpbGwgaXQgd29yayBmb3IgYSBwaWc/XCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy83MURkbVhBWFZ2TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIFJhaW5ib3cgRmlzaFwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIk1hcmN1cyBQZmlzdGVyXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJKIEFsaXNvbiBKYW1lc1wiLFxuICAgICAgICBcInllYXJcIjogMTk5OSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRmlzaCwgQmVhdXR5LCBGcmllbmRzaGlwXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNCBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVGhlIFJhaW5ib3cgRmlzaCBpcyBhbiBpbnRlcm5hdGlvbmFsIGJlc3Qtc2VsbGVyIGFuZCBhIG1vZGVybiBjbGFzc2ljLiBFeWUtY2F0Y2hpbmcgZm9pbCBzdGFtcGluZywgZ2xpdHRlcmluZyBvbiBldmVyeSBwYWdlLCBvZmZlcnMgaW5zdGFudCBjaGlsZCBhcHBlYWwsIGJ1dCBpdCBpcyB0aGUgdW5pdmVyc2FsIG1lc3NhZ2UgYXQgdGhlIGhlYXJ0IG9mIHRoaXMgc2ltcGxlIHN0b3J5IGFib3V0IGEgYmVhdXRpZnVsIGZpc2ggd2hvIGxlYXJucyB0byBtYWtlIGZyaWVuZHMgYnkgc2hhcmluZyBoaXMgbW9zdCBwcml6ZWQgcG9zc2Vzc2lvbnMgdGhhdCBnaXZlcyB0aGUgYm9vayBpdHMgbGFzdGluZyB2YWx1ZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzgxRFlYODZzeTBMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgU2t1bmtcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJNYWMgQmFybmV0dFwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiUGF0cmljayBNY0Rvbm5lbGxcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlNrdW5rc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAxLTEyVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaGVuIGEgc2t1bmsgZmlyc3QgYXBwZWFycyBpbiB0aGUgdHV4ZWRvZWQgbWFuJ3MgZG9vcndheSwgaXQncyBhIHN0cmFuZ2UgYnV0IHBvc3NpYmx5IGhhcm1sZXNzIG9jY3VycmVuY2UuIEJ1dCB0aGVuIHRoZSBtYW4gZmluZHMgdGhlIHNrdW5rIGZvbGxvd2luZyBoaW0sIGFuZCB0aGUgdW5saWtlbHkgcGFpciBlbWJhcmsgb24gYW4gaW5jcmVhc2luZ2x5IGZyYW50aWMgY2hhc2UgdGhyb3VnaCB0aGUgY2l0eSwgZnJvbSB0aGUgc3RyZWV0cyB0byB0aGUgb3BlcmEgaG91c2UgdG8gdGhlIGZhaXJncm91bmQuIFdoYXQgZG9lcyB0aGUgc2t1bmsgd2FudD8gSXQncyBub3QgY2xlYXLigJVidXQgc29vbiB0aGUgbWFuIGhhcyBib3VnaHQgYSBuZXcgaG91c2UgaW4gYSBuZXcgbmVpZ2hib3Job29kIHRvIGVzY2FwZSB0aGUgbGl0dGxlIGNyZWF0dXJlJ3MgYXR0ZW50aW9uLCBvbmx5IHRvIGZpbmQgaGltc2VsZiBtaXNzaW5nIHNvbWV0aGluZy4gLiAuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy84MVlyQ1FWRktmTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIFNuYWlsIGFuZCB0aGUgV2hhbGVcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJKdWxpYSBEb25hbGRzb25cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkF4ZWwgU2NoZWZmbGVyXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDA2LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJTbmFpbHMsIFdoYWxlcywgTWFyaW5lXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMzBUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRJZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkxvb2tpbmcgZm9yIGFkdmVudHVyZSwgYSBzbmFpbCBoaXRjaGVzIGEgcmlkZSBvbiBhIGh1bXBiYWNrIHdoYWxlIGFuZCB0aGVuIHJlc2N1ZXMgaGlzIG5ldyBmcmllbmQgZnJvbSBiZWluZyBzdHVjayBvbiBhIHNhbmR5IGJlYWNoLiBXYW50aW5nIHRvIHNhaWwgYmV5b25kIGl0cyByb2NrLCBhIHRpbnkgc25haWwgaGl0Y2hlcyBhIHJpZGUgb24gYSBiaWcgaHVtcGJhY2sgd2hhbGUgYW5kIHRoZW4gaXMgYWJsZSB0byBoZWxwIHRoZSB3aGFsZSB3aGVuIGl0IGdldHMgc3R1Y2sgaW4gdGhlIHNhbmQuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MXdlRW5mdTNDTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIFNuYXRjaGFib29rXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiSGVsbGVuIERvY2hlcnR5XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJUaG9tYXMgRG9jaGVydHlcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTMsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkZvcmVzdCBDcmVhdHVyZXNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0zMFQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCBsaWtlXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiSXQgaXMgYmVkdGltZSBpbiB0aGUgd29vZHMgb2YgQnVycm93IERvd24sIGFuZCBhbGwgdGhlIGFuaW1hbHMgYXJlIHJlYWR5IGZvciB0aGVpciBiZWR0aW1lIHN0b3J5LiBCdXQgYm9va3MgYXJlIG15c3RlcmlvdXNseSBkaXNhcHBlYXJpbmcuIEVsaXphIEJyb3duIGRlY2lkZXMgdG8gc3RheSBhd2FrZSBhbmQgY2F0Y2ggdGhlIGJvb2sgdGhpZWYuIFRoZSB3b29kbGFuZCBhbmltYWxzIG9mIEJ1cnJvdyBEb3duIGFyZSByZWFkeSBmb3IgYSBiZWR0aW1lIHN0b3J5LCBidXQgd2hlcmUgYXJlIHRoZSBib29rcz9cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxRTVEd2JhZWNMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgU25lZXRjaGVzIGFuZCBPdGhlciBTdG9yaWVzXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRHIuIFNldXNzXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJEci4gU2V1c3NcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDE5NjEsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlN0b3JpZXNcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBJdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkRyLiBTZXVzcyBjcmVhdGVzIGFub3RoZXIgdGltZWxlc3MgcGljdHVyZS1ib29rIGNsYXNzaWMgd2l0aCBUaGUgU25lZXRjaGVzIGFuZCBPdGhlciBTdG9yaWVzLiBBcmUgeW91IGEgU3Rhci1CZWxseSBTbmVldGNoIG9yIGEgUGxhaW4tQmVsbHkgU25lZXRjaD8gVGhpcyBkZWxpZ2h0ZnVsIGJvb2sgY29udGFpbnMgZm91ciB0YWxlcyB3aXRoIGRlbGljaW91c2x5IHN1YnRsZSB0YWtlcyBvbiBob3cgc2lsbHkgaXQgaXMgdG8gYmUsIHdlbGwsIHNpbGx5LiDigJxUaGUgU25lZXRjaGVzLOKAnSDigJxUaGUgWmF4LOKAnSDigJxUb28gTWFueSBEYXZlcyzigJ0gYW5kIOKAnFdoYXQgV2FzIEkgU2NhcmVkIE9mP+KAnSBtYWtlIHRoaXMgZW5lcmdldGljIGNvbXBpbGF0aW9uIGEgbXVzdC1oYXZlIGZvciBldmVyeSBsaWJyYXJ5LiBGdWxsIG9mIERyLiBTZXVzc+KAmXMgc2lnbmF0dXJlIHJoeW1lcyBhbmQgdW5taXN0YWthYmxlIGNoYXJhY3RlcnMsIGl04oCZcyBwZXJmZWN0IGZvciBuZXcgYW5kIGxpZmVsb25nIFNldXNzIGZhbnMuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy80MTJCNEhWR1JCTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIFNub3dtYW5cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJSYXltb25kIEJyaWdnc1wiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiUmF5bW9uZCBCcmlnZ3NcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDE5NzgsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlNub3dtYW5cIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNS0wOS0xMVQwNzowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgSXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIklsbHVzLiBpbiBmdWxsIGNvbG9yLiBBIHdvcmRsZXNzIHN0b3J5LiBUaGUgcGljdHVyZXMgaGF2ZSBcXFwidGhlIGhhenkgc29mdG5lc3Mgb2YgYWlyIGluIHNub3cuIEEgbGl0dGxlIGJveSBydXNoZXMgb3V0IGludG8gdGhlIHdpbnRyeSBkYXkgdG8gYnVpbGQgYSBzbm93bWFuLCB3aGljaCBjb21lcyBhbGl2ZSBpbiBoaXMgZHJlYW1zIHRoYXQgbmlnaHQuIFRoZSBleHBlcmllbmNlIGlzIG9uZSB0aGF0IG5laXRoZXIgaGUgbm9yIHlvdW5nICdyZWFkZXJzJyB3aWxsIGV2ZXIgcmVncmV0IG9yIGZvcmdldC5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxYVFrMFZxOUFMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgU3BhZ2hldHRpLXNsdXJwaW5nIFNld2VyIFNlcnBlbnRcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJMYXVyYSBSaXBlc1wiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiQWFyb24gWmVuelwiLFxuICAgICAgICBcInllYXJcIjogMjAxMixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkZhbnRhc3lcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiU2VhIFNlcnBlbnRzXFxuXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMTJUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxvdmVkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDUsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJTYW1teSBTYW5kZXJzIGNhbid0IHNsZWVwLiBIZSBpcyA3NyBwZXJjZW50IHN1cmUgdGhhdCBhIHNwYWdoZXR0aS1zbHVycGluZyBzZXJwZW50IGxpdmVzIGluIGhpcyBzZXdlci4gU2FtbXkgYW5kIGhpcyBzaWRla2lja3MgaGlzIHNpc3RlciwgU2FsbHksIGFuZCB0aGVpciBzbG9iYmVyeSBkb2csIFN0YW4gc2V0IG91dCB0byBkaXNjb3ZlciB0aGUgdHJ1dGguIFdoYXQgU2FtbXkgZmluZHMgaXMgYSBzdXJwcmlzZSBpbiB0aGlzIHRvbmd1ZXR3aXN0aW5nIG15c3RlcnkgZmVhdHVyaW5nIHRoZSBzbGlwcGVyeSBsZXR0ZXIgUy4gVGhlIGJyaWdodCwgZnVuIGFydHdvcmsgd2FzIGNyZWF0ZWQgaW4gY29sb3JlZCBwZW5jaWwuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MWp1ckE2d3NGTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIFN0b3J5IG9mIERldmEgYW5kIEZsZWFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJHbyBXaWxsZW1zXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJUb255IERpVGVybGl6emlcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkRvZ3MsIENhdHNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0xNlQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCBsaWtlXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiRGl2YSwgYSBzbWFsbCB5ZXQgYnJhdmUgZG9nLCBhbmQgRmxlYSwgYSBjdXJpb3VzIHN0cmVldHdpc2UgY2F0LCBkZXZlbG9wIGFuIHVuZXhwZWN0ZWQgZnJpZW5kc2hpcCBpbiB0aGlzIHVuZm9yZ2V0dGFibGUgdGFsZSBvZiBkaXNjb3ZlcnkuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MWwrV1hKb0xaTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIFN0b3J5IG9mIEZpc2ggYW5kIFNuYWlsXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRGVib3JhaCBGcmVlZG1hblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiRGVib3JhaCBGcmVlZG1hblwiLFxuICAgICAgICBcInllYXJcIjogMjAxMyxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRmlzaCwgU25haWxzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMTZUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJFdmVyeSBkYXksIFNuYWlsIHdhaXRzIGZvciBGaXNoIHRvIHJldHVybiBhbmQgdGVsbCBoaW0gYSBzdG9yeSwgYnV0IHRoZWlyIGZyaWVuZHNoaXAgaXMgdGVzdGVkIHdoZW4gRmlzaCBhc2tzIFNuYWlsIHRvIHRha2UgYSBsZWFwIG91dCBvZiB0aGVpciBib29rIHRvIGFjdHVhbGx5IHNlZSBhIG5ldyBwaXJhdGUgYm9vayBpbiB0aGUgbGlicmFyeS4gRXZlcnkgZGF5LCBTbmFpbCB3YWl0cyBmb3IgRmlzaCB0byByZXR1cm4gYW5kIHRlbGwgaGltIGEgc3RvcnkgYnV0IHRoZWlyIGZyaWVuZHNoaXAgaXMgdGVzdGVkIHdoZW4gRmlzaCBhc2tzIFNuYWlsIHRvIHRha2UgYSBsZWFwIG91dCBvZiB0aGVpciBib29rIHRvIGFjdHVhbGx5IHNlZSBhIG5ldyBwaXJhdGUgYm9vayBpbiB0aGUgbGlicmFyeS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxaGdlQXJkQVlMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgU3VwZXIgSHVuZ3J5IERpbm9zYXVyXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiTWFydGluIFdhZGRlbGxcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkxlb25pZSBMb3JkXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDA5LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRGlub3NhdXJzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkRpbm9zYXVyc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTA5LTE5VDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkhhbCBjYWxtcyB0aGUgcmF2ZW5vdXMgZGlub3NhdXIncyB0YW50cnVtIGFuZCBzYXZlcyBoaXMgcGFyZW50cyBhbmQgZG9nLCBCaWxseSwgZnJvbSB0aGUgU3VwZXIgSHVuZ3J5IERpbm9zYXVyLiBIYWwgYW5kIGhpcyBsaXR0bGUgZG9nIEJpbGx5IGNhbG1seSBkZWFsIHdpdGggYSBkaW5vc2F1cidzIG1vbnN0cm91cyB0ZW1wZXIgdGFudHJ1bS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxTFRybE1WcEZMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGUgVGhpbmcgQWJvdXQgU3ByaW5nXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRGFuaWVsIEtpcmtcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkRhbmllbCBLaXJrXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJCaXJkcywgTWljZSwgQmVhciwgUmFiYml0c1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTExLTI0VDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlNwcmluZyBpcyBpbiB0aGUgYWlyISBCZWFyLCBCaXJkLCBhbmQgTW91c2UgYXJlIGFsbCBleGNpdGVkIHRoYXQgd2ludGVyIHNub3dzIGFyZSBtZWx0aW5nIGF3YXksIGJ1dCB0aGVpciBmcmllbmQgUmFiYml0IGlzIG5vdC4gVGhlcmUgYXJlIHRvbyBtYW55IHRoaW5ncyBhYm91dCB3aW50ZXIgdGhhdCBSYWJiaXQgYWRvcmVzLCBhbmQgc3ByaW5nIGp1c3Qgc2VlbXMgdG8gc3BlbGwgdHJvdWJsZS4gSGlzIGZyaWVuZHMgb2ZmZXIgYW4gYWJ1bmRhbmNlIG9mIHJlYXNvbnMgdG8gbG92ZSBzcHJpbmcgYW5kIHRoZSBjaGFuZ2luZyBzZWFzb25zLCBidXQgd2lsbCBSYWJiaXQgbGlzdGVuP1wiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFvUkdyRGFXRUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlRoZSBUaHJlZSBMaXR0bGUgVGFtYWxlc1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkVyaWMgQS4gS2ltbWVsXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJWYWxlcmlhIERvY2FtcG9cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDksXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGb29kXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkZhaXJ5VGFsZXMsIFdvbHZlcywgVGFtYWxlc1wiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDMsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaGlsZSB0aGUgdGhyZWUgbGl0dGxlIHRhbWFsZXMgY29vbCBvZmYgb24gYSB3aW5kb3dzaWxsLCBhIHRvcnRpbGxhIHJvbGxzIGJ5LiBcXFwiWW914oCZbGwgYmUgZWF0ZW4uIFlvdeKAmWQgYmV0dGVyIHJ1biFcXFwiIGhlIHRlbGxzIHRoZW0uIEFuZCBzbyB0aGUgdGFtYWxlcyBqdW1wIG91dCB0aGUgd2luZG93LiBUaGUgZmlyc3QgcnVucyB0byB0aGUgcHJhaXJpZSBhbmQgYnVpbGRzIGEgaG91c2Ugb2Ygc2FnZWJydXNoLiBUaGUgc2Vjb25kIHJ1bnMgdG8gYSBjb3JuZmllbGQgYW5kIGJ1aWxkcyBhIGhvdXNlIG9mIGNvcm5zdGFsa3MuIFRoZSB0aGlyZCBydW5zIHRvIHRoZSBkZXNydCBhbmQgYnVpbGRzIGEgaG91c2Ugb2YgY2FjdHVzLiBUaGVuIHdobyBzaG91bGQgY29tZSBhbG9uZyBidXQgU2XDsW9yIExvYm8sIHRoZSBCaWcgQmFkIFdvbGYsIHdobyBwbGFucyB0byBibG93IHRoZWlyIGhvdXNlcyBkb3duIVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFEcXA2UjNOYUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlRoZSBXaGlzcGVyXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiUGFtZWxhIFphZ2FyZW5za2lcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlBhbWVsYSBaYWdhcmVuc2tpXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkdpcmxzLCBGb3gsIEltYWdpbmF0aW9uXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMTZUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiU3RlcCBpbnNpZGUgdGhlIHBhZ2VzIG9mIGEgbGl0dGxlIGdpcmwncyBtYWdpY2FsIGJvb2sgYXMgc2hlIGRpc2NvdmVycyB0aGUgcHJvZm91bmQgYW5kIGluc3BpcmluZyBub3Rpb24gdGhhdCB3ZSBlYWNoIGJyaW5nIHNvbWV0aGluZyBkaWZmZXJlbnQgdG8gdGhlIHNhbWUgc3RvcnkuIFR3by10aW1lIENhbGRlY290dCBIb25vciBhcnRpc3QgUGFtZWxhIFphZ2FyZW5za2kgZGVidXRzIGFzIGFuIGF1dGhvciBpbiB0aGlzIHRlbmRlciBwaWN0dXJlIGJvb2sgYWJvdXQgdGhlIGpveSBvZiByZWFkaW5nLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFlM0xpRXJvS0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlRoZSBXaWRlLW1vdXRoZWQgRnJvZ1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiQSBQb3AtaXAgQm9va1wiLFxuICAgICAgICBcImF1dGhvclwiOiBcIktlaXRoIEZhdWxrbmVyXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJKb2huYXRoYW4gTGFtYmVydFwiLFxuICAgICAgICBcInllYXJcIjogMTk5NixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRnJvZ3NcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0wNlQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCBsaWtlXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiRnJvbSB0aGUgT2tlZmVub2tlZSBTd2FtcCBjb21lcyBhIGZyb2cgd2l0aCBhIHdpZGUgbW91dGggdGhhdCBoZSBqdXN0IGxvdmVzIHRvIHVzZS4gSGUncyBwYXJ0aWN1bGFybHkgaW50ZXJlc3RlZCBpbiB0aGUgZWF0aW5nIGhhYml0cyBvZiBvdGhlciBjcmVhdHVyZXMgZm91bmQgaW4gdGhlIGdyZWF0IG91dGRvb3JzLS10aGF0IGlzLCBvZiBjb3Vyc2UsIHVudGlsIGhlIGNvbWVzIHVwb24gYSBiaWcgZ3JlZW4gb25lIHdpdGggbG90cyBvZiB0ZWV0aCB3aG8gZmluZHMgd2lkZS1tb3V0aGVkIGZyb2dzIHNpbXBseSBkZWxpY2lvdXMuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MTNtYitjeDVtTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlIFdvcnN0IFByaW5jZXNzXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQW5uYSBLZW1wXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJBbm5hIEtlbXBcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTQsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkRyYWdvbnMsIFByaW5jZXNzZXNcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAzLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiTG9uZWx5IFByaW5jZXNzIFN1ZSBsb25ncyB0byBsZWF2ZSBoZXIgY2FzdGxlIHRvd2VyLCBidXQgd2hlbiBoZXIgcHJpbmNlIGZpbmFsbHkgcmVzY3VlcyBoZXIsIHNoZSByZWFsaXplcyBzaGUgaXMgZGVzdGluZWQgZm9yIGEgbGVzcyB0cmFkaXRpb25hbCBwYXJ0bmVyLiBUaGUgY29hdXRob3IgaXMgU2FyYSBPZ2lsdmllLiBMb25lbHkgUHJpbmNlc3MgU3VlIGxvbmdzIHRvIGxlYXZlIGhlciBjYXN0bGUgdG93ZXIsIGJ1dCB3aGVuIGhlciBwcmluY2UgZmluYWxseSByZXNjdWVzIGhlciwgc2hlIHJlYWxpemVzIHNoZSBpcyBkZXN0aW5lZCBmb3IgYSBsZXNzIHRyYWRpdGlvbmFsIHBhcnRuZXIuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy80MWEtNVA0WityTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlcmUgQXJlIE5vIENhdHMgaW4gVGhpcyBCb29rIVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlZpdmlhbmUgU2N3YXJ6XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJWaXZpYW5lIFNjd2FyelwiLFxuICAgICAgICBcInllYXJcIjogMjAxMCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiQ2F0c1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTEyLTEwVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMb3ZlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogNTAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJPdXIgbG92YWJsZSBmZWxpbmUgZnJpZW5kcyBUaW55LCBNb29ucGllLCBhbmQgQW5kcmUgaGF2ZSByZXR1cm5lZCwgYW5kIHRoaXMgdGltZSB0aGV54oCZcmUgZmlsbGVkIHdpdGggdGhlIHNwaXJpdCBvZiBhZHZlbnR1cmU6IHRoZXkgd2FudCB0byBnbyBvZmYgdG8gZXhwbG9yZSB0aGUgd29ybGQhIFRoZXkgaGF2ZSB0aGVpciBzdWl0Y2FzZXMgcGFja2VkIGFuZCBhcmUgcmVhZHkgdG8gc2V0IG91dCwgYnV0IGNhbuKAmXQgZ2V0IG91dCBvZiB0aGUgYm9vay4gVGhleSB0cnkgcHVzaGluZyB0aGVpciB3YXkgb3V0IGFuZCBqdW1waW5nIHRoZWlyIHdheSBvdXQsIGJ1dCBub3RoaW5nIHNlZW1zIHRvIHdvcmsuIEZpbmFsbHksIHRoZXkgZ2V0IGEgYnJpbGxpYW50IGlkZWE6IHRoZXkgZGVjaWRlIHRvIHdpc2ggdGhlbXNlbHZlcyBvdXQhIEJ1dCB0aGV54oCZcmUgZ29pbmcgdG8gbmVlZCBoZWxwLiBXaWxsIGl0IHdvcms/IEFyZSB5b3UgbWlzc2luZyB0aGVtIHlldD9cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxYWQ0eC1FT0VMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGVyZSBXYXMgQW4gT2xkIERyYWdvbiBXaG8gU3dhbGxvd2VkIEEgS25pZ2h0XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiUGVubnkgUGFya2VyIEtsb3N0ZXJtYW5uXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJCZW4gTWFudGxlXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJEcmFnb25zLCBLbmlnaHRzXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXZSBhbGwga25vdyB0aGF0IOKAnHRoZXJlIHdhcyBhbiBvbGQgbGFkeeKAnSB3aG8gc3dhbGxvd2VkIGxvdHMgb2YgdGhpbmdzLiBOb3cgbWVldCB0aGUgb2xkIGRyYWdvbiB3aG8gc3dhbGxvd3MgcHJldHR5IG11Y2ggYW4gZW50aXJlIGtpbmdkb20hIFdpbGwgaGUgZXZlciBsZWFybiBhIGxpdHRsZSBtb2RlcmF0aW9uPyEgVGhpcyByb2xsaWNraW5nIHJoeW1lIGlzIGZ1bGwgdG8gYnVyc3Rpbmcgd2l0aCBzaWdodCBnYWdzLCBzaWxseSBjaGFyYWN0ZXJzLCBhbmQgcGxlbnR5IG9mIGJ1cnBzISBQYXJlbnRzIGFuZCBraWRzIGFsaWtlIHdpbGwgZGVsaWdodCBpbiBCZW4gTWFudGxl4oCZcyBwcmVjaXNlbHkgZnVubnkgaWxsdXN0cmF0aW9ucyBhbmQgaW4gUGVubnkgUGFya2VyIEtsb3N0ZXJtYW5u4oCZcyB3YWNreSByaHltZXMuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MWNDWjNIdGNpTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlcmUgV2FzIEFuIE9sZCBNb25zdGVyIVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlJlYmVjY2EgRW1iZXJsZXlcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkVkIEVtYmVybGV5XCIsXG4gICAgICAgIFwieWVhclwiOiAyMDA5LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiTW9uc3RlcnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRm9sayBTb25nc1wiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJbiB0aGlzIHZhcmlhdGlvbiBvZiBhIHRyYWRpdGlvbmFsIGN1bXVsYXRpdmUgcmh5bWUsIGEgbW9uc3RlciBzd2FsbG93cyBhbnRzLCBhIGxpemFyZCwgYSBiYXQsIGFuZCBvdGhlciBjcmVhdHVyZXMgdG8gdHJ5IHRvIGN1cmUgYSBzdG9tYWNoYWNoZSB0aGF0IGJlZ2FuIHdoZW4gaGUgc3dhbGxvd2VkIGEgdGljay4gSW4gdGhpcyB2YXJpYXRpb24gb24gdGhlIHRyYWRpdGlvbmFsIGN1bXVsYXRpdmUgcmh5bWUsIGEgbW9uc3RlciBzd2FsbG93cyBhbnRzLCBhIGxpemFyZCwgYSBiYXQsIGFuZCBvdGhlciBjcmVhdHVyZXMgdG8gdHJ5IHRvIGN1cmUgYSBzdG9tYWNoIGFjaGUgdGhhbiBiZWdhbiB3aGVuIGhlIHN3YWxsb3dlZCBhIHRpY2suXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy80MVJmaFdRRUxaTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhlcmUncyBBIEJpcmQgb24geW91ciBIZWFkXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJBbiBFbGVwaGFudCBhbmQgUGlnZ2llIEJvb2tcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJHbyBXaWxsZW1zXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJHbyBXaWxsZW1zXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDA3LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJCaXJkcywgRWxlcGhhbnQsIFBpZ1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAxLTE2VDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMb3ZlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMyxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkdlcmFsZCB0aGUgZWxlcGhhbnQgZGlzY292ZXJzIHRoYXQgdGhlcmUgaXMgc29tZXRoaW5nIHdvcnNlIHRoYW4gYSBiaXJkIG9uIHlvdXIgaGVhZC0tdHdvIGJpcmRzIG9uIHlvdXIgaGVhZCEgUGlnZ2llIHdpbGwgdHJ5IHRvIGhlbHAgaGVyIGJlc3QgZnJpZW5kLiBPcHBvc2l0ZSBiZXN0IGZyaWVuZHMgR2VyYWxkLCB3aG8gaXMgY2FyZWZ1bCBhbmQgd29ycmlzb21lLCBhbmQgUGlnZ2llLCB3aG8gaXMgY2x1bXN5IGFuZCBjYXJlZnJlZSwgcnVuIGludG8gYSBwcm9ibGVtIHdoZW4gdHdvIGJpcmRzIGxhbmQgb24gR2VyYWxkJ3MgaGVhZC5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxYUpPWSt2SWJMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJUaGVyZSdzIEEgR2lyYWZmZSBpbiBNeSBTb3VwXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiUm9zcyBCdXJhY2hcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlJvc3MgQnVyYWNoXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE2LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJSZXN0YXVyYW50c1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAzLTE3VDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMb3ZlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogNixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkVhY2ggdGltZSBhIHdhaXRlciByZXR1cm5zIHdpdGggYSBuZXcgYm93bCBvZiBzb3VwIHRvIHNhdGlzZnkgYSBjdXN0b21lcidzIGNvbXBsYWludCwgYSBkaWZmZXJlbnQgYW5pbWFsIGFwcGVhcnMgaW4gdGhlIHNvdXAuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy84MWp1NzRENDc3TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhpcyBCb29rIEp1c3QgQXRlIE15IERvZyFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJSaWNoYXJkIEJ5cm5lXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJSaWNoYXJkIEJ5cm5lXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJEb2dzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMTJUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIEl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAyLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiV2hlbiBoZXIgZG9nIGRpc2FwcGVhcnMgaW50byB0aGUgZ3V0dGVyIG9mIHRoZSBib29rLCBCZWxsYSBjYWxscyBmb3IgaGVscC4gQnV0IHdoZW4gdGhlIGhlbHBlcnMgZGlzYXBwZWFyIHRvbywgQmVsbGEgcmVhbGl6ZXMgaXQgd2lsbCB0YWtlIG1vcmUgdGhhbiBhIHR1ZyBvbiB0aGUgbGVhc2ggdG8gcHV0IHRoaW5ncyByaWdodC4gQ2xldmVybHkgdXNpbmcgdGhlIHBoeXNpY2FsaXR5IG9mIHRoZSBib29rLCBUaGlzIGJvb2sganVzdCBhdGUgbXkgZG9nISBpcyBpbnZlbnRpdmUsIGluZ2VuaW91cywgYW5kIGp1c3QgcHVyZSBraWQtZnJpZW5kbHkgZnVuIVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFXWXlXQ3psQ0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlRoaXMgT3JxXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJIZSBzYXkgXFxcIlVHSCFcXFwiXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRGF2aWQgRWxsaW90XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJMb3JpIE5pY2hvbHNcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJIdW1hbnNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiUGV0cywgTWFtbW90aFwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAxLTMwVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJcXFwiTWVldCBPcnEuIEhlIGNhdmUgYm95LiBNZWV0IFdvbWEuIEhlIHdvb2xseSBtYW1tb3RoLiBOb3cgbWVldCBEb3JxLiBEb3JxIGJpZy4gRG9ycSBzdHJvbmcuIERvcnEgbWVhbi4gQW5kIENhYmEsIGhlIGV2ZW4gd29yc2UuIFVnaCEgRG91YmxlIHVnaCFcXFwiXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MTJZMUVucHhaTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVGhvc2UgRGFybiBTcXVpcnJlbHMhXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQWRhbSBSdWJpblwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiRGFuaWVsIFNhaW1pZXJpXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDA4LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJTcXVpcnJlbHNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMS0xMlQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIk9sZCBNYW4gRm9va3dpcmUgaXMgYSBncnVtcCB3aG8gb25seSBsaWtlcyB0byBwYWludCBwaWN0dXJlcyBvZiBiaXJkcyB0aGF0IHZpc2l0IGhpcyBiYWNreWFyZC4gVGhlIHByb2JsZW0gaXMsIHRoZXkgZmx5IHNvdXRoIGV2ZXJ5IHdpbnRlciwgbGVhdmluZyBoaW0gc2FkIGFuZCBsb25lbHkuIFNvIGhlIGRlY2lkZXMgdG8gZ2V0IHRoZW0gdG8gc3RheSBieSBwdXR0aW5nIHVwIGJlYXV0aWZ1bCBiaXJkZmVlZGVycyBmaWxsZWQgd2l0aCBzZWVkcyBhbmQgYmVycmllcy4gVW5mb3J0dW5hdGVseSwgdGhlIHNxdWlycmVscyBsaWtlIHRoZSB0cmVhdHMsIHRvbywgYW5kIG1ha2UgYSBkYXJpbmcgcmFpZCBvbiB0aGUgZmVlZGVycy4gVGhlIGNvbmZsaWN0IGVzY2FsYXRlc+KAlHVudGlsIHRoZSBiaXJkcyBkZXBhcnQgKGFzIHVzdWFsKSwgYW5kIHRoZSBzcXVpcnJlbHMgY29tZSB1cCB3aXRoIGEgcGxhbiB0aGF0IGNoYXJtcyB0aGUgb2xkIGdydW1wLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTF1NlF1cHdoQ0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlRpZ2VyIGFuZCBCYWRnZXJcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJFbWlseSBKZW5raW5zXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJNYXJpZS1Mb3Vpc2UgR2F5XCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE2LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJUaWdlcnMsIEJhZGdlciwgRnJpZW5kc2hpcCwgQ29uZmxpY3QgTWFuYWdlbWVudFwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTA0LTAyVDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCIzLjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlRpZ2VyIGFuZCBCYWRnZXIgYXJlIGJlc3QgZnJpZW5kcy4gT2YgY291cnNlLCBzb21ldGltZXMgZXZlbiB2ZXJ5IGJlc3QgZnJpZW5kcyBjYW4gZ2V0IGludG8gZGlzYWdyZWVtZW50cyDigJRvdmVyIGEgdG95LCBvciBhIGNoYWlyLCBvciBldmVuIHNoYXJpbmcgc29tZSBvcmFuZ2Ugc2xpY2VzLiBCdXQgbm8gbWF0dGVyIHdoYXQsIGFmdGVyIGEgYml0IG9mIHBvdXRpbmcgYW5kIHdpdGggdGhlIGhlbHAgb2Ygc29tZSB2ZXJ5IHNpbGx5IGZhY2VzLCB0aGV5IGFsd2F5cyBtYWtlIHVwLiBUaWdlciBhbmQgQmFkZ2VyIGlzIGFuIGV4dWJlcmFudCByZWFkLWFsb3VkIGJ1cnN0aW5nIHdpdGggYnJpZ2h0IGlsbHVzdHJhdGlvbnMgdG8gaG9sZCB0aGUgYXR0ZW50aW9uIG9mIHZlcnkgeW91bmcgcmVhZGVycyBqdXN0IGxlYXJuaW5nIHRvIG1ha2XigJRhbmQga2VlcOKAlGZyaWVuZHMuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MVY0RXk0OS1vTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVG9vdFwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkxlc2xpZSBQYXRyaWNlbGxpXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJMZXNsaWUgUGF0cmljZWxsaVwiLFxuICAgICAgICBcInllYXJcIjogMjAxNCxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkh1bWFuc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJIdW1vcm91c1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE1LTA4LTIwVDA3OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogNCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkV2ZXJ5Ym9keSBkb2VzIGl0OiBLaXR0eSwgRG9nZ2llLCBEYWRkeSDigJQgZXZlbiBNb21teSEgQW5kIHdoZW4gTGVzbGllIFBhdHJpY2VsbGnigJlzIGJlbG92ZWQgYmFsZCBiYWJ5IGRvZXMgaXQgd2hpbGUgcnVubmluZywgaXQgc291bmRzIGxpa2UgYSB0cmFpbi4gVGhpcyBmcmFuayBhbmQgdmVyeSBmdW5ueSBsb29rIGF0IGEgY2VydGFpbiBub2lzeSBib2R5IGZ1bmN0aW9uIGlzIHBlcmZlY3RseSBzdWl0ZWQgdG8gdGhlIHlvdW5nZXN0IG9mIGxpc3RlbmVycywgd2hpbGUgdGhlaXIgZ2lnZ2xpbmcgb2xkZXIgc2libGluZ3Mgd2lsbCBiZSBoYXBweSB0byByZWFkIGl0IGFsb3VkLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFEMysxci1NR0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlRyb2xsIGFuZCB0aGUgT2xpdmVyXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQWRhbSBTdG93ZXJcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkFkYW0gU3Rvd2VyXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJNb25zdGVyc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAxLTMwVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBpdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkV2ZXJ5IGRheSB3aGVuIE9saXZlciBnb2VzIG91dCwgVHJvbGwgdHJpZXMgdG8gZWF0IGhpbS4gQnV0IGNhdGNoaW5nIE9saXZlciBpcyB2ZXJ5IHRyaWNreSBoZSBzIGZhc3QsIHNuZWFreSwgYW5kIGp1c3QgdG9vIGNsZXZlciEgSXQgaXMgb25seSB3aGVuIGl0IGxvb2tzIGxpa2UgVHJvbGwgaGFzIGdpdmVuIHVwIGFuZCBPbGl2ZXIgY2VsZWJyYXRlcyB2aWN0b3J5IHRoYXQgQ0hPTVAhIGhlIGdldHMgZWF0ZW4sIGFuZCBpdCB0dXJucyBvdXQgdGhhdCBPbGl2ZXJzIGRvbiB0IHRhc3RlIHZlcnkgbmljZSBhZnRlciBhbGwuIEJ1dCBmb3J0dW5hdGVseSB0aGUgdHdvIGRpc2NvdmVyIHRoYXQgVHJvbGxzIGFuZCBPbGl2ZXJzIGJvdGggbG92ZSBjYWtlIVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvOTFIb1dJd3ZMMUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlVoLU9oIE9jdG9wdXMhXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiRWxsZSB2YW4gTGllc2hvdXRcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIk1pZXMgdmFuIEhvdXRcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkZyaWVuZHNoaXAsIE9jdG9wdXNlcywgTWVybWFpZHNcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJBIHNtYWxsIG9jdG9wdXMgbGl2ZXMgaW4gYSBzbnVnIGFwYXJ0bWVudCB1bnRpbCBvbmUgZGF5IGFuIGludHJ1ZGVyIGJhcnJpY2FkZXMgdGhlIGVudHJhbmNlLiBPY3RvcHVzIGFza3MgZm9yIGFkdmljZSBvbiBob3cgdG8gZXNjYXBlIGJ1dCB0aGUgbW9yZSBzdWdnZXN0aW9ucyBoZSBnZXRzLCB0aGUgbGVzcyBoZSBpcyBhYmxlIHRvIGZpZ3VyZSBvdXQgd2hhdCB0byBkby4gRXZlbnR1YWxseSwgT2N0b3B1cyBsZWFybnMgdG8gdHJ1c3QgaGlzIG93biBpbnN0aW5jdHMgYW5kIGxlYXJucyB0aGF0IHRoaW5ncyBhcmUgbm90IGFsd2F5cyB3aGF0IHRoZXkgc2VlbS4gTWllcyB2YW4gSG91dCdzIGV4cGVydCBleWUgYW5kIGV4ZWN1dGlvbiBhcmUgc3R1bm5pbmdseSByZXZlYWxlZCBpbiBhIHJlZCBsb2JzdGVyLCBwaW5rIGplbGx5ZmlzaCBhbmQgYSB3aWRlIHZhcmlldHkgb2YgZmlzaCBjb250cmFzdGVkIGFnYWluc3QgYW4gYXF1YSBzZWEuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MVcrLVRydmxiTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiVW5pIHRoZSBVbmljb3JuXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQW15IEtyb3VzZSBSb3NlbnRoYWxcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkJyaWdldHRlIEJhcnJhZ2VyXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJVbmljb3Juc1wiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAxLTE2VDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkluIHRoaXMgY2xldmVyIHR3aXN0IG9uIHRoZSBhZ2Utb2xkIGJlbGllZiB0aGF0IHRoZXJl4oCZcyBubyBzdWNoIHRoaW5nIGFzIHVuaWNvcm5zLCBVbmkgdGhlIHVuaWNvcm4gaXMgdG9sZCB0aGVyZeKAmXMgbm8gc3VjaCB0aGluZyBhcyBsaXR0bGUgZ2lybHMhIE5vIG1hdHRlciB3aGF0IHRoZSBncm93bi11cCB1bmljb3JucyBzYXksIFVuaSBiZWxpZXZlcyB0aGF0IGxpdHRsZSBnaXJscyBhcmUgcmVhbC4gU29tZXdoZXJlIHRoZXJlIG11c3QgYmUgYSBzbWFydCwgc3Ryb25nLCB3b25kZXJmdWwsIG1hZ2ljYWwgbGl0dGxlIGdpcmwgd2FpdGluZyB0byBiZSBiZXN0IGZyaWVuZHMuIEluIGZhY3QsIGZhciBhd2F5IChidXQgbm90IHRvbyBmYXIpLCBhIHJlYWwgbGl0dGxlIGdpcmwgYmVsaWV2ZXMgdGhlcmUgaXMgYSB1bmljb3JuIHdhaXRpbmcgZm9yIGhlci4gVGhpcyByZWZyZXNoaW5nIGFuZCBzd2VldCBzdG9yeSBvZiBmcmllbmRzaGlwIHJlbWluZHMgYmVsaWV2ZXJzIGFuZCBub25iZWxpZXZlcnMgYWxpa2UgdGhhdCBzb21ldGltZXMgd2lzaGVzIHJlYWxseSBjYW4gY29tZSB0cnVlLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFNK1p4U2otcEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIlZpb2xldCBhbmQgVmljdG9yIFdyaXRlIHRoZSBNb3N0IEZhYnVsb3VzIEZhaXJ5IFRhbGVcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJBbGljZSBLdWlwZXJzXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJCZXRoYW5pZSBNdXJndWlhXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE2LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkZhaXJ5dGFsZXMsIEJyb3RoZXJzIGFuZCBTaXN0ZXJzLCBBbmltYWxzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDMtMDNUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiVmlvbGV0IGlzIGRldGVybWluZWQgdG8gd3JpdGUgdGhlIG1vc3QgZmFidWxvdXMgZmFpcnkgdGFsZSB0aGF0IGhhcyBldmVyIGJlZW4gaW1hZ2luZWQhIEhlciB0d2luLCBWaWN0b3IsIGlzIG5vdCBpbiB0aGUgbW9vZCBmb3IgbWFrZS1iZWxpZXZlLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFyLWVNRHZuV0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIldhcm5pbmc6IERvIE5vdCBPcGVuIFRoaXMgQm9vayFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJBZGFtIExlaHJoYXVwdFwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiTWF0dGhldyBGb3JzeXRoZVwiLFxuICAgICAgICBcInllYXJcIjogMjAxMyxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiSHVtb3IsIEFsaWdhdG9ycywgVG91Y2FucywgTW9ua2V5c1wiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDQsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJdCBsb29rcyBsaWtlIGEgYm9vaywgaXQgZmVlbHMgbGlrZSBhIGJvb2ssIGFuZCBpdCBldmVuIHNtZWxscyBsaWtlIGEgYm9vay4gQnV0IHdhdGNoIG91dC4uLm1hZG5lc3MgYW5kIG1heWhlbSBsaWUgd2l0aGluISBEZWJ1dCBhdXRob3IgQWRhbSBMZWhyaGF1cHQgdXJnZXMgeW91IE5PVCB0byB0YWtlIGEgd2FsayBvbiB0aGUgd2lsZCBzaWRlIGluIHRoaXMgaHVtb3JvdXMsIGludGVyYWN0aXZlIHJvbXAgd2l0aCBpbnZlbnRpdmUgYW5kIGVuZ2FnaW5nIGlsbHVzdHJhdGlvbnMgZnJvbSBFaXNuZXIgQXdhcmQtd2lubmluZyBjb21pYyBhcnRpc3QgYW5kIHJpc2luZyBzdGFyIGNoaWxkcmVuJ3MgYm9vayBpbGx1c3RyYXRvciBNYXR0aGV3IEZvcnN5dGhlLiBUaGlzIHF1aXJreSwgc3VidmVyc2l2ZSBjcmVhdGlvbiBiZWdzIHRvIGJlIGVuam95ZWQgYWdhaW4gYW5kIGFnYWluIGFuZCBhZ2Fpbi5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzgxZk1FMkNxWHNMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJXZSdyZSBpbiB0aGUgV3JvbmcgQm9vayFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJSaWNoYXJkIEJ5cm5lXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJSaWNoYXJkIEJ5cm5lXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiSHVtYW5zXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkh1bW9yb3VzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDItMDlUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjMuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiV2hlbiBhIHBvdGF0byBzYWNrIHJhY2UgZ29lcyBhd3J5LCBCZWxsYSBhbmQgQmVuIGZpbmQgdGhlbXNlbHZlcyBidW1wZWQgZnJvbSB0aGVpciBmYW1pbGlhciBwYWdlIGludG8gdW5jaGFydGVkIHRlcnJpdG9yeS4gSXQncyBhIGJyYXZlIG5ldyB3b3JsZCBvZiBsb2xsaXBvcHMgYW5kIHNwaGlueGVz4oCVYW5kIEJlbGxhIGFuZCBCZW4gYXJlIG9uIG9uZSBwYWdlLXR1cm5pbmcgYWR2ZW50dXJlLiBIb3cgd2lsbCB0aGV5IGZpbmQgdGhlaXIgd2F5IGJhY2sgaW50byB0aGVpciB2ZXJ5IG93biBib29rP1wiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFIaE54TTAyQ0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIldlaXJkIGJ1dCBUcnVlIVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiMzAwIFNsaW15LCBTdGlja3ksIGFuZCBTbWVsbHkgRmFjdHNcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJOYXRpb25hbCBHZW9ncmFwaGljIEtpZHNcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTYsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJTY2llbmNlXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkN1cmlvc2l0aWVzLCBXb25kZXJzXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwibGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDMsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJHZXQgcmVhZHkgdG8gYmUgZ3Jvc3NlZCBvdXQgLS0gaW4gYSBnb29kIHdheSEgVGhpcyBsYXRlc3QgYWRkaXRpb24gdG8gdGhlIGNyYXp5IHBvcHVsYXIgV2VpcmQgYnV0IFRydWUgc2VyaWVzIGlzIHNsaW15IGFuZCBzdGlja3kgYW5kIGphbS1wYWNrZWQgd2l0aCBtb3JlIGlja3ksIHphbnkgZnVuISBTdGVwIHVwIHRvIHRoZSBwbGF0ZSBhbmQgdHJ5IG5vdCB0byBsb3NlIHlvdXIgbHVuY2gsIHdpdGggMzAwIGFsbC1uZXcsIGFtYXppbmcgZmFjdHMgcGx1cyBwaG90b3MgdGhhdCBraWRzIGp1c3QgY2FuJ3QgZ2V0IGVub3VnaCBvZi5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxampZaThhaUpMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJXZWlyZCBidXQgVHJ1ZSEgNVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiMzAwIE91dHJhZ2VvdXMgRmFjdHNcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJOYXRpb25hbCBHZW9ncmFwaGljIEtpZHNcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTMsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJTY2llbmNlXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkN1cmlvc2l0aWVzLCBXb25kZXJzXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiUHJlc2VudGluZyBhbGwtbmV3LCBicmFpbi1iZW5kaW5nIGZhY3RzIGFuZCBleWUtcG9wcGluZyBpbGx1c3RyYXRpb25zIG9uIHNjaWVuY2UsIGFuaW1hbHMsIGZvb2QsIHNwYWNlLCBwb3AgY3VsdHVyZSwgZ2VvZ3JhcGh5IGFuZCBldmVyeXRoaW5nIGVsc2UgaW1hZ2luYWJsZS4gRGlkIHlvdSBrbm93IGxlbW9ucyBjYW4gcG93ZXIgbGlnaHQgYnVsYnMsIG9yIHRoYXQgc29tZSBnb2F0cyBhbmQgY2xpbWIgdHJlZXM/IC0gSW4gdGhpcyB0aXRsZSBhcmUgMzAwIG1vcmUgb3V0cmFnZW91cyBhbmQgdW5iZWxpZXZhYmxlIGZhY3RzIGxpa2UgdGhlc2UgaW4gZmlmdGggaW5zdGFsbG1lbnQgb2YgdGhlIFdlaXJkIEJ1dCBUcnVlIHNlcmllcywgV2VpcmQgQnV0IFRydWUhIDUuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy84MVpxTE9OVjRkTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiV2hhdCBEb2VzIHRoZSBGb3ggU2F5P1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIllsdmlzIGFuZCBDaHJpc3RpYW4gTMO4Y2hzdMO4ZXJcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlN2ZWluIE55aHVzXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEzLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJGb3hlcywgRmljdGlvblwiLFxuICAgICAgICBcImNoZWNrZWRPdXRcIjogXCIyMDE2LTAzLTAzVDA4OjAwOjAwLjAwMFpcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJMaWtlZCBJdFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjQuNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiA0LFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiRG8geW91IGtub3cgd2hhdCB0aGUgZm94IHNheXM/IEJhc2VkIG9uIHRoZSBodWdlbHkgcG9wdWxhciBZb3VUdWJlIHZpZGVvIHdpdGggbW9yZSB0aGFuIDIwMCBtaWxsaW9uIHZpZXdzLCB0aGlzIHBpY3R1cmUgYm9vayBpcyBwYWNrZWQgZnVsbCBvZiBmb3h5IGZ1bi5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxOU1xY0lJWitMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJXaGF0J3MgTmV3IGF0IHRoZSBab28/XCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQmV0dHkgQ29tZGVuXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJBZG9scGggR3JlZW5cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTEsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlpvbyBBbmltYWxzXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTG92ZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMixcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIlRoZSB6b28gaXMgb3ZlcmxvYWRlZCEgVGhlIHBvcHVsYXRpb24gaGFzIGV4cGxvZGVkISBBbmQgdGhlIGFuaW1hbHMgd2FudCBvdXTigJROT1chIFdoYXTigJlzIE5ldyBhdCB0aGUgWm9vPyAoZnJvbSB0aGUgaGl0IEJyb2Fkd2F5IHNob3cgRG8gUmUgTWkpIHBlcmZlY3RseSBjYXB0dXJlcyB0aGUgZ3J1bWJsaW5ncyBhbmQgcnVtYmxpbmdzIG9mIGFsbCB0aGUgYW5pbWFscywgYW5kIGtpZHMgd2lsbCBkZWxpZ2h0IGluIHRoZSBoaWxhcmlvdXMgbGlmdC10aGUtZmxhcCBzdXJwcmlzZXMgb2YgYWNjbGFpbWVkIGlsbHVzdHJhdG9yIFRyYXZpcyBGb3N0ZXLigJlzIHNwb3Qtb24gY29taWMgY3JlYXRpb25zLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFQbm4zb0xUcUwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIldoZW4gQSBEcmFnb24gTW92ZXMgaW4gQWdhaW5cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJKb2RpIE1vb3JlXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJIb3dhcmQgTWNXaWxsaWFtXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJEcmFnb25zXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMTJUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIklmIHlvdSBidWlsZCBhIHBlcmZlY3QgY2FzdGxlLCBhIGRyYWdvbiB3aWxsIG1vdmUgaW4g4oCTIGFuZCB0aGF04oCZcyBleGFjdGx5IHdoYXQgaGFwcGVucyB0byBvbmUgdmVyeSBsdWNreSBib3kgd2hlbiBoaXMgZmFtaWx5IGdlYXJzIHVwIGZvciBzb21lIGNoYW5nZXMuIFRoZSBib3kgYW5kIGhpcyBkcmFnb24gYm91bmNlIGluIHRoZWlyIGNhc3RsZSwgZHVlbCB3aXRoIGRlbGlnaHQsIGFuZCBoYXZlIGFuIGFtYXppbmcgdGltZSB0b2dldGhlcuKApnVudGlsIHRoZXkgZmluZCBvdXQgdGhhdCB0aGVpciBjYXN0bGUgaXMgYSBjcmliIGZvciBhIG5ldyBiYWJ5LiBIdWg/IEFzIHNvb24gYXMgdGhleSBnZXQgdXNlZCB0byB0aGUgbmV3cywgdGhlIGJveSBhbmQgZHJhZ29uIGFyZSBiYWNrIGluIHJvYXJpbmcgZm9ybSwgZW50ZXJ0YWluaW5nIHRoZSBpbmZhbnQgd2l0aCBtYXJjaGluZyBtdXNpYywgYWVyaWFsIGFjcm9iYXRpY3MsIGFuZCBiYWJ5LWJvdHRsZSBib3dsaW5nLiBCdXQgbWVycmltZW50IHR1cm5zIHRvIG1pc2NoaWVmIGFuZCBtaXNjaGllZiBsZWFkcyB0byBjb25zZXF1ZW5jZXMuIENhbiBhIGRyYWdvbiBmcmllbmQg4oCTIHJlYWwgb3Igbm90IOKAkyBoZWxwIHNtb290aCB0aGUgdHJhbnNpdGlvbiB0byBiaWcgYnJvdGhlcmhvb2Q/XCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MWxTeTFvb0V3TC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiV2hlbiBNb29uIEZlbGwgRG93blwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkxpbmRhIFNtaXRoXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJLYXRocnluIEJyb3duXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDAxLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJDb3dhLCBNb29ucywgU3RvcmllcyBpbiBSaHltZVwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkhhdmUgbm90IHJlYWQgeWV0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaGVuIE1vb24gZmFsbHMgZG93biBvbmUgbmlnaHQsIGhlIGFuZCBhbiBhZHZlbnR1cmUtbWluZGVkIGNvdyByb2FuIHVwIGhpbGxzIGFuZCBkb3duLCB3YW5kZXIgdGhyb3VnaCBjaXR5IHN0cmVldHMsIGFuZCBmaW5hbGx5IHJldHVybiBiYWNrIGhvbWUgYXQgZGF3bi4gQSBqb3lvdXMgYW5kIGx5cmljYWwgcm9tcCwgdGhpcyBwaWN0dXJlIGJvb2sgY2FwdHVyZXMgdGhlIG1hZ2ljIGFuZCB3b25kZXIgb2Ygc2VlaW5nIGZhbWlsaWFyIHRoaW5ncyBpbiBhIHdob2xlIG5ldyB3YXkuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy82MUN0bFR0QlFjTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiV2hlcmUgdGhlIFdpbGQgVGhpbmdzIEFyZVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIk1hdXJpY2UgU2VuZGFrXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJNYXVyaWNlIFNlbmRha1wiLFxuICAgICAgICBcInllYXJcIjogMjAxMixcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkZhbnRhc3lcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiTW9uc3RlcnNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNS0xMi0xMFQwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiRGlkIG5vdCByZWFkXCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJBZnRlciBoZSBpcyBzZW50IHRvIGJlZCB3aXRob3V0IHN1cHBlciBmb3IgYmVoYXZpbmcgbGlrZSBhIHdpbGQgdGhpbmcsIE1heCBkcmVhbXMgb2YgYSB2b3lhZ2UgdG8gdGhlIGlzbGFuZCB3aGVyZSB0aGUgd2lsZCB0aGluZ3MgYXJlLiBBIG5hdWdodHkgbGl0dGxlIGJveSwgc2VudCB0byBiZWQgd2l0aG91dCBoaXMgc3VwcGVyLCBzYWlscyB0byB0aGUgbGFuZCBvZiB0aGUgd2lsZCB0aGluZ3Mgd2hlcmUgaGUgYmVjb21lcyB0aGVpciBraW5nLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNjFMWXZwaHlTS0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIldoZXJldmVyIFlvdSBHb1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIlBhdCBaaWV0bG93IE1pbGxlclwiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiRWxpemEgV2hlZWxlclwiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiUmFiYml0cywgUm9hZHMsIFZveWFnZXMsIFRyYXZlbHNcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IGxpa2VcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI0LjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkFuIGFkdmVudHVyb3VzIHJhYmJpdCBhbmQgaGlzIGFuaW1hbCBmcmllbmRzIGpvdXJuZXkgb3ZlciBzdGVlcCBtb3VudGFpbiBwZWFrcywgdGhyb3VnaCBidXN0bGluZyBjaXR5c2NhcGVzLCBhbmQgZG93biBsb25nLCB3aW5kaW5nIHJvYWRzIHRvIGRpc2NvdmVyIHRoZSBtYWdpY2FsIHdvcmxkcyB0aGF0IGF3YWl0IHRoZW0ganVzdCBvdXRzaWRlIHRoZWlyIGRvb3JzLiBJbGx1c3RyYXRpb25zIGFuZCByaHltaW5nIHRleHQgZm9sbG93IGEgeW91bmcgcmFiYml0IGFzIGhlIGxlYXZlcyBob21lIG9uIGEgam91cm5leSwgZGlzY292ZXJpbmcgdGhlIGpveXMgb2YgZGlmZmVyZW50IGtpbmRzIG9mIHJvYWRzIGFuZCB3aGF0IHRoZXkgbWF5IGJyaW5nLS1pbmNsdWRpbmcgYSB3YXkgYmFjayBob21lLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNzFmS05pSWwwa0wuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIldobyBEb25lIEl0P1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIk9saXZlciBUYWxsZWNcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIk9saXZlciBUYWxsZWNcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTUsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwidGFnc1wiOiBcIkludGVyYWN0aXZlXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMTZUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJJbiB0aGlzIGNoYXJtaW5nIGJvb2ssIGVhY2ggcGFnZSBhc2tzIHRoZSByZWFkZXIgYSBxdWVzdGlvbiBhYm91dCB0aGUgbGluZXVwIG9mIGNoYXJhY3RlcnMgZmVhdHVyZWQgb24gdGhlIHNwcmVhZC4gU2hhcnAgZXllcyBhbmQga2VlbiBvYnNlcnZhdGlvbiBhcmUgbmVjZXNzYXJ5LiBUaGVyZSdzIG9ubHkgb25lIHJpZ2h0IGFuc3dlciwgYW5kIGl0J3Mgbm90IGFsd2F5cyBlYXN5IVwiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFjb2tqN3hqMEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIldobyBXYW50cyBCcm9jY29saT9cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJWYWwgSm9uZXNcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlZhbCBKb25lc1wiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiRG9ncywgUGV0cywgQWRvcHRpb25cIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiMjAxNi0wMi0yN1QwODowMDowMC4wMDBaXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTGlrZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJCcm9jY29saSBpcyBhIGJpZywgbG92YWJsZSBkb2cgd2hvIGxpa2VzIHRvIHNob3cgb2ZmIGhpcyBib3dsLXRvc3NpbmcgYW5kIHRhaWwtY2hhc2luZyBza2lsbHMgYW5kIGVzcGVjaWFsbHkgaGlzIGdyZWF0IGJpZyBCQVJLISBCcm9jY29saSBsaXZlcyBhdCBCZWV6bGV5IHMgQW5pbWFsIFNoZWx0ZXIgYW5kIGRyZWFtcyBvZiBwbGF5aW5nIGluIGEgeWFyZCB3aXRoIGEgYm95LiBXaGVuIGEgYm95IG5hbWVkIE9zY2FyIGNvbWVzIGxvb2tpbmcgZm9yIGhpcyBwZXJmZWN0IHBldCwgQnJvY2NvbGkgaXMgaGlkZGVuIGF3YXkuIFdpbGwgQnJvY2NvbGkgZmluZCBoaXMgcGVyZmVjdCBob21lP1wiXG4gICAgfSxcbiAgICB7XG4gICAgICAgIFwiY292ZXJcIjogXCJodHRwOi8vZWRtb250ZXJydWJpby5jb20vZmlsZXMvYm9vay1jb3ZlcnMvNTFndUpQZHkxaEwuanBnXCIsXG4gICAgICAgIFwiYm9va1wiOiBcIldobydzIGluIHRoZSBUcmVlP1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiQW5kIE90aGVyIExpZnQtdGhlLWZsYXAgU3VycHJpc2VzXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiQ3JhaWcgU2h1dHRsZXdvb2RcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkNyYWlnIFNodXR0bGV3b29kXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJTdG9yaWVzLCBMaWZ0LXRoZS1mbGFwLWJvb2tzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDItMjdUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxvdmVkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiA2LFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQW4gZWxlcGhhbnQgaW4gdGhlIHNreT8gQSBwZWFjb2NrIGluIHRoZSBzZWE/IEFyZSBjcmVhdHVyZXMgaGlkaW5nIHdoZXJlIHRoZXkgc2hvdWxkbid0IGJlPyBMaWZ0IHRoZSBsYXJnZSBmbGFwcywgZm9sbG93IHRoZSByb21waW5nIHJoeW1lLCBhbmQgZmluZCBlYWNoIGZhY2UgdGhhdCdzIG91dCBvZiBwbGFjZS4gR3JhcGhpYyBhcnRpc3QgQ3JhaWcgU2h1dHRsZXdvb2Qgd2hpc2tzIGtpZHMgZnJvbSBkZXNlcnQgdG8gZm9yZXN0IHRvIG9jZWFuIGRlZXDigJRhbmQgZmluYWxseSB0byB0aGUgem9vLCB3aGVyZSB0aGUgb25seSBvbmUgd2hvIGRvZXNuJ3QgZml0IGlzIFlPVSEgSGlzIG91dHN0YW5kaW5nIGRlYnV0IGludHJvZHVjZXMgdGhlIGlkZWEgb2Ygd2hlcmUgYW5pbWFscyAoYW5kIGh1bWFucykgbGl2ZS1hbmQgd2lsbCBkZWxpZ2h0IGtpZHMgb3ZlciBhbmQgb3ZlciBhZ2Fpbi5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxZVlYN1M5K2FMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJXaG9zZSBTaG9lP1wiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkV2ZSBCdW50aW5nXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJTZXJnaW8gUnV6emllclwiLFxuICAgICAgICBcInllYXJcIjogMjAxNSxcbiAgICAgICAgXCJjYXRlZ29yeVwiOiBcIkFuaW1hbHNcIixcbiAgICAgICAgXCJ0YWdzXCI6IFwiTWljZSwgU2hvZXMsIExvc3QgYW5kIEZvdW5kXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiSGF2ZSBub3QgcmVhZCB5ZXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJBIG1vdXNlIGNvbWVzIGFjcm9zcyBhIHNob2UgYW5kIHNldHMgb3V0IHRvIGZpbmQgaXRzIG93bmVyLiBBIGNvbnNjaWVudGlvdXMgcm9sZSBtb2RlbCwgdGhpcyBkZXRlcm1pbmVkIG1vdXNlIGFza3MgYW4gdW5saWtlbHkgYXNzb3J0bWVudCBvZiBhbmltYWxzIGlmIHRoZSBzaG9lIGJlbG9uZ3MgdG8gdGhlbSwgaGVhcnMgYWJvdXQgdGhlaXIgb3duIHNob2VzLCBhbmQgcmVjZWl2ZXMgYSBzdXJwcmlzaW5nIHJld2FyZCBhdCB0aGUgZW5kLiBFdmUgQnVudGluZydzIGNoZWVyZnVsIHJoeW1lZCB0ZXh0IGFuZCBTZXJnaW8gUnV6emllcidzIGNoYXJtaW5nbHkgdW5pcXVlIGlsbHVzdHJhdGlvbnMgbWFrZSB0aGlzIGEgZGVsaWdodGZ1bCBib29rIHRvIHNoYXJlIHdpdGggYSB5b3VuZyBjaGlsZC5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxcGY5eHJ4RFJMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJXb29ieSAmIFBlZXBcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIkEgU3Rvcnkgb2YgVW5saWtlbHkgRnJpZW5kc2hpcFwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkN5bnRoZWEgTGl1XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJNYXJ5IFBldGVyc29uXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEzLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiQW5pbWFsc1wiLFxuICAgICAgICBcInRhZ3NcIjogXCJBbmltYWxzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDEtMjNUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIEl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNCBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiAxLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiV2hlbiBQZWVwIGxlYXZlcyB0aGUgY2l0eSB3aXRoIGhlciBwZXQgaWd1YW5hIHRvIGxpdmUgaW4gdGhlIGNvdW50cnksIGhlciBuZXcgbmVpZ2hib3IsIFdvb2J5LCBpcyBjb25jZXJuZWQgYnV0IHRyaWVzIHRvIGJlIHBvbGl0ZSBhbmQgbmVpZ2hib3JseSwgZXZlbiB3aGVuIGhlciBlZmZvcnRzIHRvIGJlY29tZSBoaXMgZnJpZW5kIGxlYWQgdG8gZGlzYXN0ZXIuIFdoZW4gUGVlcCBsZWF2ZXMgdGhlIGNpdHkgdG8gbGl2ZSBpbiB0aGUgY291bnRyeSB3aXRoIGhlciBwZXQgaWd1YW5hLCBoZXIgbmV3IG5laWdoYm9yLCBXb29ieSBpcyBjb25jZXJuZWQgYnV0IHRyaWVzIHRvIGJlIHBvbGl0ZSBhbmQgbmVpZ2hib3JseSwgZXZlbiB3aGVuIGhlciBlZmZvcnRzIHRvIGJlY29tZSBoaXMgZnJpZW5kIGxlYWQgdG8gZGlzYXN0ZXIuXCJcbiAgICB9LFxuICAgIHtcbiAgICAgICAgXCJjb3ZlclwiOiBcImh0dHA6Ly9lZG1vbnRlcnJ1YmlvLmNvbS9maWxlcy9ib29rLWNvdmVycy81MW5HZitJSTdsTC5qcGdcIixcbiAgICAgICAgXCJib29rXCI6IFwiWWV0aSwgVHVybiBPdXQgdGhlIExpZ2h0IVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIkdyZWcgTG9uZywgQ2hyaXMgRWRtdW5kc29uXCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJXZWRuZXNkYXkgS2lyd2FuXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEzLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJZZXRpLCBCZWR0aW1lXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDItMjdUMDg6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgcmVhZFwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMCxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkFsbCBZZXRpIHdhbnRzIHRvIGRvIGFmdGVyIGEgbG9uZyBkYXkgaW4gdGhlIHdvb2RzIGlzIHRvIGNsb3NlIGhpcyBleWVzIGFuZCBnbyB0byBzbGVlcC4gQnV0IHNvbWV0aGluZyBpcyBub3QgcmlnaHQhIFNoYWRvd3MgbHVyaywgc291bmRzIGNyZWFrLCBhbmQgdGhlcmUgYXJlIG1vbnN0ZXJzLi4ub3IgYXJlIHRoZXJlPyBUaGlzIGVudGVydGFpbmluZyBiZWR0aW1lIGJvb2sgZmVhdHVyaW5nIHRoZSBmaWVyY2UgYW5kIGZyZW5ldGljIEdBTUFHTyBZZXRpIHdpbGwgYW11c2UgYW5kIGRlbGlnaHQga2lkcywgYWxsIHdoaWxlIGVuY291cmFnaW5nIHRoZW0gdG8gdHVybiBvdXQgdGhlIGxpZ2h0IGFuZCBnbyB0byBzbGVlcCFcIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxcHZnR0diZ0lMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJZb3UgVGhpbmsgSXQncyBFYXN5IEJlaW5nIHRoZSBUb290aCBGYWlyeT9cIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJTaGVyaSBCZWxsLVJlaHdvbGR0XCIsXG4gICAgICAgIFwiaWxsdXN0cmF0b3JcIjogXCJEYXZpZCBTbG9uaW1cIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMDcsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlRlZXRoLCBGYWlyaWVzLCBUb290aCBGYWlyeVwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkRpZCBub3QgbGlrZVwiLFxuICAgICAgICBcImFtYXpvblwiOiBcIjUgc3RhcnNcIixcbiAgICAgICAgXCJ0aW1lc1JlYWRcIjogMSxcbiAgICAgICAgXCJkZXNjcmlwdGlvblwiOiBcIkFsbCBvdmVyIEFtZXJpY2EsIGtpZHMgYXJlIGxvc2luZyB0aGVpciB0ZWV0aC4gQW5kIHdobyBpcyB0aGVyZSB0byBnYXRoZXIgdGhlbSB1cCwgbGVhdmluZyBjb2lucyBpbiB0aGVpciBwbGFjZXM/IFRoZSBUb290aCBGYWlyeSwgb2YgY291cnNlISBBIHNlbGYtZGVzY3JpYmVkIFxcXCJhY3Rpb24ga2luZCBvZiBnYWxcXFwiIHdpdGggcGxlbnR5IG9mIGF0dGl0dWRlLCBzaGUgcmV2ZWFscyBoZXIgc2VjcmV0cyBhdCBsYXN0LiBMZWFybiBhYm91dCBoZXIgYW1hemluZyBUb290aC1vLUZpbmRlci4gTWFydmVsIGF0IGhlciBpbmdlbmlvdXMgZmx5aW5nIG1hY2hpbmUuIFdhdGNoIGhlciBpbiBhY3Rpb24sIGRvZGdpbmcgZG9ncyBhbmQgY2F0cyBhbmQgZ2VyYmlscy4gWW91IFRoaW5rIEl0J3MgRWFzeSBCZWluZyB0aGUgVG9vdGggRmFpcnk/IGlzIHRoZSBlc3NlbnRpYWwgZ3VpZGUgZm9yIGV2ZXJ5IGtpZCBhYm91dCB0byBsb3NlIGEgdG9vdGguIEFuZCBkb24ndCBmb3JnZXQsIEZlYnJ1YXJ5IGlzIE5hdGlvbmFsIENoaWxkcmVuJ3MgRGVudGFsIEhlYWx0aCBNb250aC5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzQxQ092Sm92YXVMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJZb3VyIEFsaWVuXCIsXG4gICAgICAgIFwic3VidGl0bGVcIjogXCJOb25lXCIsXG4gICAgICAgIFwiYXV0aG9yXCI6IFwiVGFtbWkgU2F1ZXJcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIkdvcm8gRnVqaXRhXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE1LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJBbGllbnMsIEZyaWVuZHNoaXBcIixcbiAgICAgICAgXCJyYXRpbmdcIjogXCJEaWQgbm90IHJlYWRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDAsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJXaGVuIGEgbGl0dGxlIGJveSBtZWV0cyBhIHN0cmFuZGVkIGFsaWVuIGNoaWxkLCB0aGUgdHdvIGluc3RhbnRseSBzdHJpa2UgdXAgYSBmYWJ1bG91cyBmcmllbmRzaGlwLiBUaGV5IGdvIHRvIHNjaG9vbCwgZXhwbG9yZSB0aGUgbmVpZ2hib3Job29kLCBhbmQgaGF2ZSBsb3RzIG9mIGZ1bi4gQnV0IGF0IGJlZHRpbWUsIHRoZSBhbGllbiBzdWRkZW5seSBncm93cyB2ZXJ5LCB2ZXJ5IHNhZC4gQ2FuIHRoZSBib3kgZmlndXJlIG91dCB3aGF0IGhpcyBuZXcgYnVkZHkgbmVlZHMgbW9zdCBvZiBhbGw/IFRoaXMgZnVubnksIGhlYXJ0d2FybWluZyBzdG9yeSBwcm92ZXMgdGhhdCBmcmllbmRzIGFuZCBmYW1pbHkgYXJlIHRoZSBtb3N0IGltcG9ydGFudCB0aGluZ3MgaW4gdGhlIHVuaXZlcnNlIC4gLiAuIG5vIG1hdHRlciB3aG8gb3Igd2hlcmUgeW91IGFyZS5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzUxMEtQeWcyVFlMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJab21iZWxpbmFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJLcmlzdHluIENyb3dcIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIk1vbGx5IFNjaGFhciBJZGxlXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDEzLFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJab21iaWVzLCBEYW5jaW5nXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIjIwMTYtMDMtMjJUMDc6MDA6MDAuMDAwWlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxpa2VkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNSBzdGFyc1wiLFxuICAgICAgICBcInRpbWVzUmVhZFwiOiA0LFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiWm9tYmVsaW5hIGxvdmVzIHRvIGRhbmNlLiBTaGUgbW9vbndhbGtzIHdpdGggbXVtbWllcyBhbmQgYm9vZ2llcyB3aXRoIGJhdHMuIFNoZSBzcGlucyBsaWtlIGEgc3BlY3RlciBhbmQgZ2xpZGVzIGxpa2UgYSBnaG9zdCBhbmQgbG92ZXMgdG8gZGFuY2UgZm9yIGhlciBmYW1pbHkgdGhlIG1vc3QuIFdoZW4gWm9tYmVsaW5hIGVucm9sbHMgaW4gYSBiYWxsZXQgY2xhc3MgZm9yIHJlYWwgZ2lybHMsIGhlciBkYW5jaW5nIGdpdmVzIGV2ZXJ5b25lIHRoZSBjaGlsbHMhIEJ1dCB3aGVuIGhlciBmaXJzdCByZWNpdGFsIGJyaW5ncyBvbiBhIGNhc2Ugb2Ygc3RhZ2UgZnJpZ2h0LCBoZXIgem9tYmllIG1vYW5zIGFuZCBnaG91bGlzaCBncm9hbnMgc2NhcmUgaGVyIGF1ZGllbmNlIGF3YXkuIE9ubHkgaGVyIGRldm90ZWQgZmFtaWx5J3MgY2hlZXJzLCBpbiB0aGVpciBzcGVjaWFsIHNwb29reSB3YXksIGhlbHAgWm9tYmVsaW5hIGRhbmNlIHRoZSBiYWxsZXQgZGVidXQgb2YgaGVyIGRyZWFtcy5cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzYxWUQ3YXczRHFMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJab21iaWUgaW4gTG92ZVwiLFxuICAgICAgICBcInN1YnRpdGxlXCI6IFwiTm9uZVwiLFxuICAgICAgICBcImF1dGhvclwiOiBcIktlbGx5IERpUHVjY2hpb1wiLFxuICAgICAgICBcImlsbHVzdHJhdG9yXCI6IFwiU2NvdHQgQ2FtcGJlbGxcIixcbiAgICAgICAgXCJ5ZWFyXCI6IDIwMTEsXG4gICAgICAgIFwiY2F0ZWdvcnlcIjogXCJGYW50YXN5XCIsXG4gICAgICAgIFwidGFnc1wiOiBcIlpvbWJpZXNcIixcbiAgICAgICAgXCJjaGVja2VkT3V0XCI6IFwiT1dOXCIsXG4gICAgICAgIFwicmF0aW5nXCI6IFwiTG92ZWQgaXRcIixcbiAgICAgICAgXCJhbWF6b25cIjogXCI1IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDcsXG4gICAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJNb3J0aW1lciBpcyBsb29raW5nIGZvciBsb3ZlLiBBbmQgaGXigJlzIGxvb2tpbmcgZXZlcnl3aGVyZSEgSGXigJlzIHdvcmtlZCBvdXQgYXQgdGhlIGd5bSAoaWYgb25seSBoaXMgYXJtIHdvdWxkbuKAmXQga2VlcCBmYWxsaW5nIG9mZikuIEhl4oCZcyB0cmllZCBiYWxscm9vbSBkYW5jaW5nIGxlc3NvbnMgKGJ1dCB0aGUgbGFkaWVzIGZvdW5kIGhpbSB0byBiZSBhIGJpdCBzdGlmZikuIEhl4oCZcyBldmVuIGJlZW4gb24gc3RhbGVtYXRlLmNvbS4gSG934oCZcyBhIGd1eSBzdXBwb3NlZCB0byBmaW5kIGEgZ2hvdWw/IFdoZW4gaXQgc2VlbXMgYWxsIGhvcGUgaGFzIGRpZWQsIGNvdWxkIHRoZSBnaXJsIG9mIE1vcnRpbWVy4oCZcyBkcmVhbXMgYmUganVzdCBvbmUgaG9ycmlmeWluZyBzaHJpZWsgYXdheT9cIlxuICAgIH0sXG4gICAge1xuICAgICAgICBcImNvdmVyXCI6IFwiaHR0cDovL2VkbW9udGVycnViaW8uY29tL2ZpbGVzL2Jvb2stY292ZXJzLzgxSTJsc3MreTJMLmpwZ1wiLFxuICAgICAgICBcImJvb2tcIjogXCJab21iaWUgaW4gTG92ZSAyKzFcIixcbiAgICAgICAgXCJzdWJ0aXRsZVwiOiBcIk5vbmVcIixcbiAgICAgICAgXCJhdXRob3JcIjogXCJLZWxseSBEaVB1Y2NoaW9cIixcbiAgICAgICAgXCJpbGx1c3RyYXRvclwiOiBcIlNjb3R0IENhbXBiZWxsXCIsXG4gICAgICAgIFwieWVhclwiOiAyMDE0LFxuICAgICAgICBcImNhdGVnb3J5XCI6IFwiRmFudGFzeVwiLFxuICAgICAgICBcInRhZ3NcIjogXCJab21iaWVzXCIsXG4gICAgICAgIFwiY2hlY2tlZE91dFwiOiBcIk9XTlwiLFxuICAgICAgICBcInJhdGluZ1wiOiBcIkxvdmVkIGl0XCIsXG4gICAgICAgIFwiYW1hem9uXCI6IFwiNC41IHN0YXJzXCIsXG4gICAgICAgIFwidGltZXNSZWFkXCI6IDEwLFxuICAgICAgICBcImRlc2NyaXB0aW9uXCI6IFwiWm9tYmllIGxvdmViaXJkcyBNb3J0aW1lciBhbmQgTWlsZHJlZCBkaXNjb3ZlciBhIGJhYnkgb24gdGhlaXIgZG9vcnN0ZXAuIFRoZXkgYXJlIHdvcnJpZWQgc2ljayB3aGVuIHRoZSBiYWJ5IHNsZWVwcyB0aHJvdWdoIHRoZSBuaWdodCBhbmQgaGFyZGx5IGV2ZXIgY3JpZXMuIEhvdyB3aWxsIHRoZXkgdGVhY2ggaGltIHRvIGJlIGEgcHJvcGVyIHpvbWJpZSBjaGlsZD8gXFxcIlpvbWJpZSBsb3ZlYmlyZHMgTW9ydGltZXIgYW5kIE1pbGRyZWQgZGlzY292ZXIgYSBiYWJ5IG9uIHRoZWlyIGRvb3JzdGVwLiBUaGV5J3JlIHdvcnJpZWQgc2ljayB3aGVuIHRoZSBiYWJ5IHNsZWVwcyB0aHJvdWdoIHRoZSBuaWdodCBhbmQgaGFyZGx5IGV2ZXIgY3JpZXMuIEhvdyB3aWxsIHRoZXkgdGVhY2ggaGltIHRvIGJlIGEgcHJvcGVyIHpvbWJpZSBjaGlsZD9cXFwiXCJcbiAgICB9XG5dXG4iLCJleHBvcnRzLmtleWJvYXJkTGF5ZXIgPSBuZXcgTGF5ZXJcblx0eDowLCB5OlNjcmVlbi5oZWlnaHQsIHdpZHRoOjc1MCwgaGVpZ2h0OjQzMiwgaW1hZ2U6XCJtb2R1bGVzL2tleWJvYXJkLnBuZ1wiXG5cbmV4cG9ydHMua2V5Ym9hcmRMYXllci5zdGF0ZXMuYWRkXG5cdFwic2hvd25cIjogeTogU2NyZWVuLmhlaWdodCAtIGV4cG9ydHMua2V5Ym9hcmRMYXllci5oZWlnaHRcblxuZXhwb3J0cy5rZXlib2FyZExheWVyLnN0YXRlcy5hbmltYXRpb25PcHRpb25zID1cblx0Y3VydmU6IFwic3ByaW5nKDUwMCw1MCwxNSlcIlxuXG5jbGFzcyBleHBvcnRzLklucHV0IGV4dGVuZHMgTGF5ZXJcblx0QGRlZmluZSBcInN0eWxlXCIsXG5cdFx0Z2V0OiAtPiBAaW5wdXQuc3R5bGVcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdF8uZXh0ZW5kIEBpbnB1dC5zdHlsZSwgdmFsdWVcblxuXHRAZGVmaW5lIFwidmFsdWVcIixcblx0XHRnZXQ6IC0+IEBpbnB1dC52YWx1ZVxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0QGlucHV0LnZhbHVlID0gdmFsdWVcblxuXHRjb25zdHJ1Y3RvcjogKG9wdGlvbnMgPSB7fSkgLT5cblx0XHRvcHRpb25zLnNldHVwID89IGZhbHNlXG5cdFx0b3B0aW9ucy53aWR0aCA/PSBTY3JlZW4ud2lkdGhcblx0XHRvcHRpb25zLmNsaXAgPz0gZmFsc2Vcblx0XHRvcHRpb25zLmhlaWdodCA/PSA2MFxuXHRcdG9wdGlvbnMuYmFja2dyb3VuZENvbG9yID89IGlmIG9wdGlvbnMuc2V0dXAgdGhlbiBcInJnYmEoMjU1LCA2MCwgNDcsIC41KVwiIGVsc2UgXCJ0cmFuc3BhcmVudFwiXG5cdFx0b3B0aW9ucy5mb250U2l6ZSA/PSAzMFxuXHRcdG9wdGlvbnMubGluZUhlaWdodCA/PSAzMFxuXHRcdG9wdGlvbnMucGFkZGluZyA/PSAxMFxuXHRcdG9wdGlvbnMudGV4dCA/PSBcIlwiXG5cdFx0b3B0aW9ucy5wbGFjZWhvbGRlciA/PSBcIlwiXG5cdFx0b3B0aW9ucy52aXJ0dWFsS2V5Ym9hcmQgPz0gaWYgVXRpbHMuaXNNb2JpbGUoKSB0aGVuIGZhbHNlIGVsc2UgdHJ1ZVxuXHRcdG9wdGlvbnMudHlwZSA/PSBcInRleHRcIlxuXHRcdG9wdGlvbnMuZ29CdXR0b24gPz0gZmFsc2VcblxuXHRcdHN1cGVyIG9wdGlvbnNcblxuXHRcdEBwbGFjZWhvbGRlckNvbG9yID0gb3B0aW9ucy5wbGFjZWhvbGRlckNvbG9yIGlmIG9wdGlvbnMucGxhY2Vob2xkZXJDb2xvcj9cblx0XHRAaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwiaW5wdXRcIlxuXHRcdEBpbnB1dC5pZCA9IFwiaW5wdXQtI3tfLm5vdygpfVwiXG5cdFx0QGlucHV0LnN0eWxlLmNzc1RleHQgPSBcImZvbnQtc2l6ZTogI3tvcHRpb25zLmZvbnRTaXplfXB4OyBsaW5lLWhlaWdodDogI3tvcHRpb25zLmxpbmVIZWlnaHR9cHg7IHBhZGRpbmc6ICN7b3B0aW9ucy5wYWRkaW5nfXB4OyB3aWR0aDogI3tvcHRpb25zLndpZHRofXB4OyBoZWlnaHQ6ICN7b3B0aW9ucy5oZWlnaHR9cHg7IGJvcmRlcjogbm9uZTsgb3V0bGluZS13aWR0aDogMDsgYmFja2dyb3VuZC1pbWFnZTogdXJsKGFib3V0OmJsYW5rKTsgYmFja2dyb3VuZC1jb2xvcjogI3tvcHRpb25zLmJhY2tncm91bmRDb2xvcn07XCJcblx0XHRAaW5wdXQudmFsdWUgPSBvcHRpb25zLnRleHRcblx0XHRAaW5wdXQudHlwZSA9IG9wdGlvbnMudHlwZVxuXHRcdEBpbnB1dC5wbGFjZWhvbGRlciA9IG9wdGlvbnMucGxhY2Vob2xkZXJcblx0XHRAZm9ybSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgXCJmb3JtXCJcblxuXHRcdGlmIG9wdGlvbnMuZ29CdXR0b25cblx0XHRcdEBmb3JtLmFjdGlvbiA9IFwiI1wiXG5cdFx0XHRAZm9ybS5hZGRFdmVudExpc3RlbmVyIFwic3VibWl0XCIsIChldmVudCkgLT5cblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG5cdFx0QGZvcm0uYXBwZW5kQ2hpbGQgQGlucHV0XG5cdFx0QF9lbGVtZW50LmFwcGVuZENoaWxkIEBmb3JtXG5cblx0XHRAYmFja2dyb3VuZENvbG9yID0gXCJ0cmFuc3BhcmVudFwiXG5cdFx0QHVwZGF0ZVBsYWNlaG9sZGVyQ29sb3Igb3B0aW9ucy5wbGFjZWhvbGRlckNvbG9yIGlmIEBwbGFjZWhvbGRlckNvbG9yXG5cblx0XHRpZiAhVXRpbHMuaXNNb2JpbGUoKSB8fCBvcHRpb25zLnZpcnR1YWxLZXlib2FyZFxuXHRcdFx0QGlucHV0LmFkZEV2ZW50TGlzdGVuZXIgXCJmb2N1c1wiLCAtPlxuXHRcdFx0XHRleHBvcnRzLmtleWJvYXJkTGF5ZXIuYnJpbmdUb0Zyb250KClcblx0XHRcdFx0ZXhwb3J0cy5rZXlib2FyZExheWVyLnN0YXRlcy5uZXh0KClcblx0XHRcdEBpbnB1dC5hZGRFdmVudExpc3RlbmVyIFwiYmx1clwiLCAtPlxuXHRcdFx0XHRleHBvcnRzLmtleWJvYXJkTGF5ZXIuc3RhdGVzLnN3aXRjaCBcImRlZmF1bHRcIlxuXG5cdHVwZGF0ZVBsYWNlaG9sZGVyQ29sb3I6IChjb2xvcikgLT5cblx0XHRAcGxhY2Vob2xkZXJDb2xvciA9IGNvbG9yXG5cdFx0aWYgQHBhZ2VTdHlsZT9cblx0XHRcdGRvY3VtZW50LmhlYWQucmVtb3ZlQ2hpbGQgQHBhZ2VTdHlsZVxuXHRcdEBwYWdlU3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50IFwic3R5bGVcIlxuXHRcdEBwYWdlU3R5bGUudHlwZSA9IFwidGV4dC9jc3NcIlxuXHRcdGNzcyA9IFwiIyN7QGlucHV0LmlkfTo6LXdlYmtpdC1pbnB1dC1wbGFjZWhvbGRlciB7IGNvbG9yOiAje0BwbGFjZWhvbGRlckNvbG9yfTsgfVwiXG5cdFx0QHBhZ2VTdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSBjc3MpXG5cdFx0ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCBAcGFnZVN0eWxlXG5cblx0Zm9jdXM6ICgpIC0+XG5cdFx0QGlucHV0LmZvY3VzKClcbiIsIlxuXG5cbiMgJ0ZpcmViYXNlIFJFU1QgQVBJIENsYXNzJyBtb2R1bGUgdjEuMFxuIyBieSBNYXJjIEtyZW5uLCBKdW5lIDIybmQsIDIwMTYgfCBtYXJjLmtyZW5uQGdtYWlsLmNvbSB8IEBtYXJjX2tyZW5uXG5cbiMgRG9jdW1lbnRhdGlvbiBvZiB0aGlzIE1vZHVsZTogaHR0cHM6Ly9naXRodWIuY29tL21hcmNrcmVubi9mcmFtZXItRmlyZWJhc2VcbiMgLS0tLS0tIDogLS0tLS0tLSBGaXJlYmFzZSBSRVNUIEFQSTogaHR0cHM6Ly9maXJlYmFzZS5nb29nbGUuY29tL2RvY3MvcmVmZXJlbmNlL3Jlc3QvZGF0YWJhc2UvXG5cblxuIyBUb0RvOlxuIyBGaXggb25DaGFuZ2UgXCJjb25uZWN0aW9uXCIsIGB0aGlzwrQgY29udGV4dFxuXG5cblxuIyBGaXJlYmFzZSBSRVNUIEFQSSBDbGFzcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNsYXNzIGV4cG9ydHMuRmlyZWJhc2UgZXh0ZW5kcyBGcmFtZXIuQmFzZUNsYXNzXG5cblxuXG5cdGdldENPUlN1cmwgPSAoc2VydmVyLCBwYXRoLCBzZWNyZXQsIHByb2plY3QpIC0+XG5cblx0XHRzd2l0Y2ggVXRpbHMuaXNXZWJLaXQoKVxuXHRcdFx0d2hlbiB0cnVlIHRoZW4gdXJsID0gXCJodHRwczovLyN7c2VydmVyfSN7cGF0aH0uanNvbj9hdXRoPSN7c2VjcmV0fSZucz0je3Byb2plY3R9JnNzZT10cnVlXCIgIyBXZWJraXQgWFNTIHdvcmthcm91bmRcblx0XHRcdGVsc2UgICAgICAgICAgIHVybCA9IFwiaHR0cHM6Ly8je3Byb2plY3R9LmZpcmViYXNlaW8uY29tI3twYXRofS5qc29uP2F1dGg9I3tzZWNyZXR9XCJcblxuXHRcdHJldHVybiB1cmxcblxuXG5cdEAuZGVmaW5lIFwic3RhdHVzXCIsXG5cdFx0Z2V0OiAtPiBAX3N0YXR1cyAjIHJlYWRPbmx5XG5cblx0Y29uc3RydWN0b3I6IChAb3B0aW9ucz17fSkgLT5cblx0XHRAcHJvamVjdElEID0gQG9wdGlvbnMucHJvamVjdElEID89IG51bGxcblx0XHRAc2VjcmV0ICAgID0gQG9wdGlvbnMuc2VjcmV0ICAgID89IG51bGxcblx0XHRAc2VydmVyICAgID0gQG9wdGlvbnMuc2VydmVyICAgID89IHVuZGVmaW5lZCAjIHJlcXVpcmVkIGZvciBXZWJLaXQgWFNTIHdvcmthcm91bmRcblx0XHRAZGVidWcgICAgID0gQG9wdGlvbnMuZGVidWcgICAgID89IGZhbHNlXG5cdFx0QF9zdGF0dXMgICAgICAgICAgICAgICAgICAgICAgICA/PSBcImRpc2Nvbm5lY3RlZFwiXG5cdFx0c3VwZXJcblxuXG5cdFx0aWYgQHNlcnZlciBpcyB1bmRlZmluZWRcblx0XHRcdFV0aWxzLmRvbUxvYWRKU09OIFwiaHR0cHM6Ly8je0Bwcm9qZWN0SUR9LmZpcmViYXNlaW8uY29tLy5zZXR0aW5ncy9vd25lci5qc29uXCIsIChhLHNlcnZlcikgLT5cblx0XHRcdFx0cHJpbnQgbXNnID0gXCJBZGQgX19fX19fIHNlcnZlcjpcIiArICcgICBcIicgKyBzZXJ2ZXIgKyAnXCInICsgXCIgX19fX18gdG8geW91ciBpbnN0YW5jZSBvZiBGaXJlYmFzZS5cIlxuXHRcdFx0XHRjb25zb2xlLmxvZyBcIkZpcmViYXNlOiAje21zZ31cIiBpZiBAZGVidWdcblxuXG5cdFx0Y29uc29sZS5sb2cgXCJGaXJlYmFzZTogQ29ubmVjdGluZyB0byBGaXJlYmFzZSBQcm9qZWN0ICcje0Bwcm9qZWN0SUR9JyAuLi4gXFxuIFVSTDogJyN7Z2V0Q09SU3VybChAc2VydmVyLCBcIi9cIiwgQHNlY3JldCwgQHByb2plY3RJRCl9J1wiIGlmIEBkZWJ1Z1xuXHRcdEAub25DaGFuZ2UgXCJjb25uZWN0aW9uXCJcblxuXG5cdHJlcXVlc3QgPSAocHJvamVjdCwgc2VjcmV0LCBwYXRoLCBjYWxsYmFjaywgbWV0aG9kLCBkYXRhLCBwYXJhbWV0ZXJzLCBkZWJ1ZykgLT5cblxuXHRcdHVybCA9IFwiaHR0cHM6Ly8je3Byb2plY3R9LmZpcmViYXNlaW8uY29tI3twYXRofS5qc29uP2F1dGg9I3tzZWNyZXR9XCJcblxuXG5cdFx0dW5sZXNzIHBhcmFtZXRlcnMgaXMgdW5kZWZpbmVkXG5cdFx0XHRpZiBwYXJhbWV0ZXJzLnNoYWxsb3cgICAgICAgICAgICB0aGVuIHVybCArPSBcIiZzaGFsbG93PXRydWVcIlxuXHRcdFx0aWYgcGFyYW1ldGVycy5mb3JtYXQgaXMgXCJleHBvcnRcIiB0aGVuIHVybCArPSBcIiZmb3JtYXQ9ZXhwb3J0XCJcblxuXHRcdFx0c3dpdGNoIHBhcmFtZXRlcnMucHJpbnRcblx0XHRcdFx0d2hlbiBcInByZXR0eVwiIHRoZW4gdXJsICs9IFwiJnByaW50PXByZXR0eVwiXG5cdFx0XHRcdHdoZW4gXCJzaWxlbnRcIiB0aGVuIHVybCArPSBcIiZwcmludD1zaWxlbnRcIlxuXG5cdFx0XHRpZiB0eXBlb2YgcGFyYW1ldGVycy5kb3dubG9hZCBpcyBcInN0cmluZ1wiXG5cdFx0XHRcdHVybCArPSBcIiZkb3dubG9hZD0je3BhcmFtZXRlcnMuZG93bmxvYWR9XCJcblx0XHRcdFx0d2luZG93Lm9wZW4odXJsLFwiX3NlbGZcIilcblxuXG5cdFx0XHR1cmwgKz0gXCImb3JkZXJCeT1cIiArICdcIicgKyBwYXJhbWV0ZXJzLm9yZGVyQnkgKyAnXCInIGlmIHR5cGVvZiBwYXJhbWV0ZXJzLm9yZGVyQnkgICAgICBpcyBcInN0cmluZ1wiXG5cdFx0XHR1cmwgKz0gXCImbGltaXRUb0ZpcnN0PSN7cGFyYW1ldGVycy5saW1pdFRvRmlyc3R9XCIgICBpZiB0eXBlb2YgcGFyYW1ldGVycy5saW1pdFRvRmlyc3QgaXMgXCJudW1iZXJcIlxuXHRcdFx0dXJsICs9IFwiJmxpbWl0VG9MYXN0PSN7cGFyYW1ldGVycy5saW1pdFRvTGFzdH1cIiAgICAgaWYgdHlwZW9mIHBhcmFtZXRlcnMubGltaXRUb0xhc3QgIGlzIFwibnVtYmVyXCJcblx0XHRcdHVybCArPSBcIiZzdGFydEF0PSN7cGFyYW1ldGVycy5zdGFydEF0fVwiICAgICAgICAgICAgIGlmIHR5cGVvZiBwYXJhbWV0ZXJzLnN0YXJ0QXQgICAgICBpcyBcIm51bWJlclwiXG5cdFx0XHR1cmwgKz0gXCImZW5kQXQ9I3twYXJhbWV0ZXJzLmVuZEF0fVwiICAgICAgICAgICAgICAgICBpZiB0eXBlb2YgcGFyYW1ldGVycy5lbmRBdCAgICAgICAgaXMgXCJudW1iZXJcIlxuXHRcdFx0dXJsICs9IFwiJmVxdWFsVG89I3twYXJhbWV0ZXJzLmVxdWFsVG99XCIgICAgICAgICAgICAgaWYgdHlwZW9mIHBhcmFtZXRlcnMuZXF1YWxUbyAgICAgIGlzIFwibnVtYmVyXCJcblxuXG5cdFx0eGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3Rcblx0XHRjb25zb2xlLmxvZyBcIkZpcmViYXNlOiBOZXcgJyN7bWV0aG9kfSctcmVxdWVzdCB3aXRoIGRhdGE6ICcje0pTT04uc3RyaW5naWZ5KGRhdGEpfScgXFxuIFVSTDogJyN7dXJsfSdcIiBpZiBkZWJ1Z1xuXHRcdHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9ID0+XG5cblx0XHRcdHVubGVzcyBwYXJhbWV0ZXJzIGlzIHVuZGVmaW5lZFxuXHRcdFx0XHRpZiBwYXJhbWV0ZXJzLnByaW50IGlzIFwic2lsZW50XCIgb3IgdHlwZW9mIHBhcmFtZXRlcnMuZG93bmxvYWQgaXMgXCJzdHJpbmdcIiB0aGVuIHJldHVybiAjIHVnaFxuXG5cdFx0XHRzd2l0Y2ggeGh0dHAucmVhZHlTdGF0ZVxuXHRcdFx0XHR3aGVuIDAgdGhlbiBjb25zb2xlLmxvZyBcIkZpcmViYXNlOiBSZXF1ZXN0IG5vdCBpbml0aWFsaXplZCBcXG4gVVJMOiAnI3t1cmx9J1wiICAgICAgIGlmIGRlYnVnXG5cdFx0XHRcdHdoZW4gMSB0aGVuIGNvbnNvbGUubG9nIFwiRmlyZWJhc2U6IFNlcnZlciBjb25uZWN0aW9uIGVzdGFibGlzaGVkIFxcbiBVUkw6ICcje3VybH0nXCIgaWYgZGVidWdcblx0XHRcdFx0d2hlbiAyIHRoZW4gY29uc29sZS5sb2cgXCJGaXJlYmFzZTogUmVxdWVzdCByZWNlaXZlZCBcXG4gVVJMOiAnI3t1cmx9J1wiICAgICAgICAgICAgICBpZiBkZWJ1Z1xuXHRcdFx0XHR3aGVuIDMgdGhlbiBjb25zb2xlLmxvZyBcIkZpcmViYXNlOiBQcm9jZXNzaW5nIHJlcXVlc3QgXFxuIFVSTDogJyN7dXJsfSdcIiAgICAgICAgICAgIGlmIGRlYnVnXG5cdFx0XHRcdHdoZW4gNFxuXHRcdFx0XHRcdGNhbGxiYWNrKEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KSkgaWYgY2FsbGJhY2s/XG5cdFx0XHRcdFx0Y29uc29sZS5sb2cgXCJGaXJlYmFzZTogUmVxdWVzdCBmaW5pc2hlZCwgcmVzcG9uc2U6ICcje0pTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KX0nIFxcbiBVUkw6ICcje3VybH0nXCIgaWYgZGVidWdcblxuXHRcdFx0aWYgeGh0dHAuc3RhdHVzIGlzIFwiNDA0XCJcblx0XHRcdFx0Y29uc29sZS53YXJuIFwiRmlyZWJhc2U6IEludmFsaWQgcmVxdWVzdCwgcGFnZSBub3QgZm91bmQgXFxuIFVSTDogJyN7dXJsfSdcIiBpZiBkZWJ1Z1xuXG5cblx0XHR4aHR0cC5vcGVuKG1ldGhvZCwgdXJsLCB0cnVlKVxuXHRcdHhodHRwLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LXR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04XCIpXG5cdFx0eGh0dHAuc2VuZChkYXRhID0gXCIje0pTT04uc3RyaW5naWZ5KGRhdGEpfVwiKVxuXG5cblxuXHQjIEF2YWlsYWJsZSBtZXRob2RzXG5cblx0Z2V0OiAgICAocGF0aCwgY2FsbGJhY2ssICAgICAgIHBhcmFtZXRlcnMpIC0+IHJlcXVlc3QoQHByb2plY3RJRCwgQHNlY3JldCwgcGF0aCwgY2FsbGJhY2ssIFwiR0VUXCIsICAgIG51bGwsIHBhcmFtZXRlcnMsIEBkZWJ1Zylcblx0cHV0OiAgICAocGF0aCwgZGF0YSwgY2FsbGJhY2ssIHBhcmFtZXRlcnMpIC0+IHJlcXVlc3QoQHByb2plY3RJRCwgQHNlY3JldCwgcGF0aCwgY2FsbGJhY2ssIFwiUFVUXCIsICAgIGRhdGEsIHBhcmFtZXRlcnMsIEBkZWJ1Zylcblx0cG9zdDogICAocGF0aCwgZGF0YSwgY2FsbGJhY2ssIHBhcmFtZXRlcnMpIC0+IHJlcXVlc3QoQHByb2plY3RJRCwgQHNlY3JldCwgcGF0aCwgY2FsbGJhY2ssIFwiUE9TVFwiLCAgIGRhdGEsIHBhcmFtZXRlcnMsIEBkZWJ1Zylcblx0cGF0Y2g6ICAocGF0aCwgZGF0YSwgY2FsbGJhY2ssIHBhcmFtZXRlcnMpIC0+IHJlcXVlc3QoQHByb2plY3RJRCwgQHNlY3JldCwgcGF0aCwgY2FsbGJhY2ssIFwiUEFUQ0hcIiwgIGRhdGEsIHBhcmFtZXRlcnMsIEBkZWJ1Zylcblx0ZGVsZXRlOiAocGF0aCwgY2FsbGJhY2ssICAgICAgIHBhcmFtZXRlcnMpIC0+IHJlcXVlc3QoQHByb2plY3RJRCwgQHNlY3JldCwgcGF0aCwgY2FsbGJhY2ssIFwiREVMRVRFXCIsIG51bGwsIHBhcmFtZXRlcnMsIEBkZWJ1ZylcblxuXG5cblx0b25DaGFuZ2U6IChwYXRoLCBjYWxsYmFjaykgLT5cblxuXG5cdFx0aWYgcGF0aCBpcyBcImNvbm5lY3Rpb25cIlxuXG5cdFx0XHR1cmwgPSBnZXRDT1JTdXJsKEBzZXJ2ZXIsIFwiL1wiLCBAc2VjcmV0LCBAcHJvamVjdElEKVxuXHRcdFx0Y3VycmVudFN0YXR1cyA9IFwiZGlzY29ubmVjdGVkXCJcblx0XHRcdHNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZSh1cmwpXG5cblx0XHRcdHNvdXJjZS5hZGRFdmVudExpc3RlbmVyIFwib3BlblwiLCA9PlxuXHRcdFx0XHRpZiBjdXJyZW50U3RhdHVzIGlzIFwiZGlzY29ubmVjdGVkXCJcblx0XHRcdFx0XHRALl9zdGF0dXMgPSBcImNvbm5lY3RlZFwiXG5cdFx0XHRcdFx0Y2FsbGJhY2soXCJjb25uZWN0ZWRcIikgaWYgY2FsbGJhY2s/XG5cdFx0XHRcdFx0Y29uc29sZS5sb2cgXCJGaXJlYmFzZTogQ29ubmVjdGlvbiB0byBGaXJlYmFzZSBQcm9qZWN0ICcje0Bwcm9qZWN0SUR9JyBlc3RhYmxpc2hlZFwiIGlmIEBkZWJ1Z1xuXHRcdFx0XHRjdXJyZW50U3RhdHVzID0gXCJjb25uZWN0ZWRcIlxuXG5cdFx0XHRzb3VyY2UuYWRkRXZlbnRMaXN0ZW5lciBcImVycm9yXCIsID0+XG5cdFx0XHRcdGlmIGN1cnJlbnRTdGF0dXMgaXMgXCJjb25uZWN0ZWRcIlxuXHRcdFx0XHRcdEAuX3N0YXR1cyA9IFwiZGlzY29ubmVjdGVkXCJcblx0XHRcdFx0XHRjYWxsYmFjayhcImRpc2Nvbm5lY3RlZFwiKSBpZiBjYWxsYmFjaz9cblx0XHRcdFx0XHRjb25zb2xlLndhcm4gXCJGaXJlYmFzZTogQ29ubmVjdGlvbiB0byBGaXJlYmFzZSBQcm9qZWN0ICcje0Bwcm9qZWN0SUR9JyBjbG9zZWRcIiBpZiBAZGVidWdcblx0XHRcdFx0Y3VycmVudFN0YXR1cyA9IFwiZGlzY29ubmVjdGVkXCJcblxuXG5cdFx0ZWxzZVxuXG5cdFx0XHR1cmwgPSBnZXRDT1JTdXJsKEBzZXJ2ZXIsIHBhdGgsIEBzZWNyZXQsIEBwcm9qZWN0SUQpXG5cdFx0XHRzb3VyY2UgPSBuZXcgRXZlbnRTb3VyY2UodXJsKVxuXHRcdFx0Y29uc29sZS5sb2cgXCJGaXJlYmFzZTogTGlzdGVuaW5nIHRvIGNoYW5nZXMgbWFkZSB0byAnI3twYXRofScgXFxuIFVSTDogJyN7dXJsfSdcIiBpZiBAZGVidWdcblxuXHRcdFx0c291cmNlLmFkZEV2ZW50TGlzdGVuZXIgXCJwdXRcIiwgKGV2KSA9PlxuXHRcdFx0XHRjYWxsYmFjayhKU09OLnBhcnNlKGV2LmRhdGEpLmRhdGEsIFwicHV0XCIsIEpTT04ucGFyc2UoZXYuZGF0YSkucGF0aCwgXy50YWlsKEpTT04ucGFyc2UoZXYuZGF0YSkucGF0aC5zcGxpdChcIi9cIiksMSkpIGlmIGNhbGxiYWNrP1xuXHRcdFx0XHRjb25zb2xlLmxvZyBcIkZpcmViYXNlOiBSZWNlaXZlZCBjaGFuZ2VzIG1hZGUgdG8gJyN7cGF0aH0nIHZpYSAnUFVUJzogI3tKU09OLnBhcnNlKGV2LmRhdGEpLmRhdGF9IFxcbiBVUkw6ICcje3VybH0nXCIgaWYgQGRlYnVnXG5cblx0XHRcdHNvdXJjZS5hZGRFdmVudExpc3RlbmVyIFwicGF0Y2hcIiwgKGV2KSA9PlxuXHRcdFx0XHRjYWxsYmFjayhKU09OLnBhcnNlKGV2LmRhdGEpLmRhdGEsIFwicGF0Y2hcIiwgSlNPTi5wYXJzZShldi5kYXRhKS5wYXRoLCBfLnRhaWwoSlNPTi5wYXJzZShldi5kYXRhKS5wYXRoLnNwbGl0KFwiL1wiKSwxKSkgaWYgY2FsbGJhY2s/XG5cdFx0XHRcdGNvbnNvbGUubG9nIFwiRmlyZWJhc2U6IFJlY2VpdmVkIGNoYW5nZXMgbWFkZSB0byAnI3twYXRofScgdmlhICdQQVRDSCc6ICN7SlNPTi5wYXJzZShldi5kYXRhKS5kYXRhfSBcXG4gVVJMOiAnI3t1cmx9J1wiIGlmIEBkZWJ1Z1xuIiwiY2xhc3MgbW9kdWxlLmV4cG9ydHMgZXh0ZW5kcyBMYXllclxuXHRcdFxuXHRjb25zdHJ1Y3RvcjogKG9wdGlvbnM9e30pIC0+XG5cdFx0b3B0aW9ucy53aWR0aCA/PSBTY3JlZW4ud2lkdGhcblx0XHRvcHRpb25zLmhlaWdodCA/PSBTY3JlZW4uaGVpZ2h0XG5cdFx0b3B0aW9ucy5jbGlwID89IHRydWVcblx0XHRvcHRpb25zLmluaXRpYWxWaWV3TmFtZSA/PSAnaW5pdGlhbFZpZXcnXG5cdFx0b3B0aW9ucy5iYWNrQnV0dG9uTmFtZSA/PSAnYmFja0J1dHRvbidcblx0XHRvcHRpb25zLmFuaW1hdGlvbk9wdGlvbnMgPz0gY3VydmU6IFwiY3ViaWMtYmV6aWVyKDAuMTksIDEsIDAuMjIsIDEpXCIsIHRpbWU6IC43XG5cdFx0b3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3IgPz0gXCJibGFja1wiXG5cdFx0b3B0aW9ucy5zY3JvbGwgPz0gZmFsc2Vcblx0XHRvcHRpb25zLmF1dG9MaW5rID89IHRydWVcblxuXHRcdHN1cGVyIG9wdGlvbnNcblx0XHRAaGlzdG9yeSA9IFtdXG5cblx0XHRAb25DaGFuZ2UgXCJzdWJMYXllcnNcIiwgKGNoYW5nZUxpc3QpID0+XG5cdFx0XHR2aWV3ID0gY2hhbmdlTGlzdC5hZGRlZFswXVxuXHRcdFx0aWYgdmlldz9cblx0XHRcdFx0IyBkZWZhdWx0IGJlaGF2aW9ycyBmb3Igdmlld3Ncblx0XHRcdFx0dmlldy5jbGlwID0gdHJ1ZVxuXHRcdFx0XHR2aWV3Lm9uIEV2ZW50cy5DbGljaywgLT4gcmV0dXJuICMgcHJldmVudCBjbGljay10aHJvdWdoL2J1YmJsaW5nXG5cdFx0XHRcdCMgYWRkIHNjcm9sbGNvbXBvbmVudFxuXHRcdFx0XHRpZiBAc2Nyb2xsXG5cdFx0XHRcdFx0Y2hpbGRyZW4gPSB2aWV3LmNoaWxkcmVuXG5cdFx0XHRcdFx0c2Nyb2xsQ29tcG9uZW50ID0gbmV3IFNjcm9sbENvbXBvbmVudFxuXHRcdFx0XHRcdFx0bmFtZTogXCJzY3JvbGxDb21wb25lbnRcIlxuXHRcdFx0XHRcdFx0d2lkdGg6IEB3aWR0aFxuXHRcdFx0XHRcdFx0aGVpZ2h0OiBAaGVpZ2h0XG5cdFx0XHRcdFx0XHRwYXJlbnQ6IHZpZXdcblx0XHRcdFx0XHRzY3JvbGxDb21wb25lbnQuY29udGVudC5iYWNrZ3JvdW5kQ29sb3IgPSBcIlwiXG5cdFx0XHRcdFx0aWYgdmlldy53aWR0aCA8PSBAd2lkdGhcblx0XHRcdFx0XHRcdHNjcm9sbENvbXBvbmVudC5zY3JvbGxIb3Jpem9udGFsID0gZmFsc2Vcblx0XHRcdFx0XHRpZiB2aWV3LmhlaWdodCA8PSBAaGVpZ2h0XG5cdFx0XHRcdFx0XHRzY3JvbGxDb21wb25lbnQuc2Nyb2xsVmVydGljYWwgPSBmYWxzZVxuXHRcdFx0XHRcdGZvciBjIGluIGNoaWxkcmVuXG5cdFx0XHRcdFx0XHRjLnBhcmVudCA9IHNjcm9sbENvbXBvbmVudC5jb250ZW50XG5cdFx0XHRcdFx0dmlldy5zY3JvbGxDb21wb25lbnQgPSBzY3JvbGxDb21wb25lbnQgIyBtYWtlIGl0IGFjY2Vzc2libGUgYXMgYSBwcm9wZXJ0eVxuXHRcdFx0XHRcdCMgcmVzZXQgc2l6ZSBzaW5jZSBjb250ZW50IG1vdmVkIHRvIHNjcm9sbENvbXBvbmVudC4gcHJldmVudHMgc2Nyb2xsIGJ1ZyB3aGVuIGRyYWdnaW5nIG91dHNpZGUuXG5cdFx0XHRcdFx0dmlldy5zaXplID0ge3dpZHRoOiBAd2lkdGgsIGhlaWdodDogQGhlaWdodH1cblxuXHRcdHRyYW5zaXRpb25zID1cblx0XHRcdHN3aXRjaEluc3RhbnQ6XG5cdFx0XHRcdG5ld1ZpZXc6XG5cdFx0XHRcdFx0dG86IHt4OiAwLCB5OiAwfVxuXHRcdFx0ZmFkZUluOlxuXHRcdFx0XHRuZXdWaWV3OlxuXHRcdFx0XHRcdGZyb206IHtvcGFjaXR5OiAwfVxuXHRcdFx0XHRcdHRvOiB7b3BhY2l0eTogMX1cblx0XHRcdHpvb21Jbjpcblx0XHRcdFx0bmV3Vmlldzpcblx0XHRcdFx0XHRmcm9tOiB7c2NhbGU6IDAuOCwgb3BhY2l0eTogMH1cblx0XHRcdFx0XHR0bzoge3NjYWxlOiAxLCBvcGFjaXR5OiAxfVxuXHRcdFx0em9vbU91dDpcblx0XHRcdFx0b2xkVmlldzpcblx0XHRcdFx0XHR0bzoge3NjYWxlOiAwLjgsIG9wYWNpdHk6IDB9XG5cdFx0XHRzbGlkZUluVXA6XG5cdFx0XHRcdG5ld1ZpZXc6XG5cdFx0XHRcdFx0ZnJvbToge3k6IEBoZWlnaHR9XG5cdFx0XHRcdFx0dG86IHt5OiAwfVxuXHRcdFx0c2xpZGVJblJpZ2h0OlxuXHRcdFx0XHRuZXdWaWV3OlxuXHRcdFx0XHRcdGZyb206IHt4OiBAd2lkdGh9XG5cdFx0XHRcdFx0dG86IHt4OiAwfVxuXHRcdFx0c2xpZGVJbkRvd246XG5cdFx0XHRcdG5ld1ZpZXc6XG5cdFx0XHRcdFx0ZnJvbToge21heFk6IDB9XG5cdFx0XHRcdFx0dG86IHt5OiAwfVxuXHRcdFx0bW92ZUluUmlnaHQ6XG5cdFx0XHRcdG9sZFZpZXc6XG5cdFx0XHRcdFx0dG86IHttYXhYOiAwfVxuXHRcdFx0XHRuZXdWaWV3OlxuXHRcdFx0XHRcdGZyb206IHt4OiBAd2lkdGh9XG5cdFx0XHRcdFx0dG86IHt4OiAwfVxuXHRcdFx0bW92ZUluTGVmdDpcblx0XHRcdFx0b2xkVmlldzpcblx0XHRcdFx0XHR0bzoge3g6IEB3aWR0aH1cblx0XHRcdFx0bmV3Vmlldzpcblx0XHRcdFx0XHRmcm9tOiB7bWF4WDogMH1cblx0XHRcdFx0XHR0bzoge3g6IDB9XG5cdFx0XHRzbGlkZUluTGVmdDpcblx0XHRcdFx0bmV3Vmlldzpcblx0XHRcdFx0XHRmcm9tOiB7bWF4WDogMH1cblx0XHRcdFx0XHR0bzoge21heFg6IEB3aWR0aH1cblx0XHRcdHB1c2hJblJpZ2h0OlxuXHRcdFx0XHRvbGRWaWV3OlxuXHRcdFx0XHRcdHRvOiB7eDogLShAd2lkdGgvNSksIGJyaWdodG5lc3M6IDcwfVxuXHRcdFx0XHRuZXdWaWV3OlxuXHRcdFx0XHRcdGZyb206IHt4OiBAd2lkdGh9XG5cdFx0XHRcdFx0dG86IHt4OiAwfVxuXHRcdFx0cHVzaEluTGVmdDpcblx0XHRcdFx0b2xkVmlldzpcblx0XHRcdFx0XHR0bzoge3g6IEB3aWR0aC81LCBicmlnaHRuZXNzOiA3MH1cblx0XHRcdFx0bmV3Vmlldzpcblx0XHRcdFx0XHRmcm9tOiB7eDogLUB3aWR0aH1cblx0XHRcdFx0XHR0bzoge3g6IDB9XG5cdFx0XHRwdXNoT3V0UmlnaHQ6XG5cdFx0XHRcdG9sZFZpZXc6XG5cdFx0XHRcdFx0dG86IHt4OiBAd2lkdGh9XG5cdFx0XHRcdG5ld1ZpZXc6XG5cdFx0XHRcdFx0ZnJvbToge3g6IC0oQHdpZHRoLzUpLCBicmlnaHRuZXNzOiA3MH1cblx0XHRcdFx0XHR0bzoge3g6IDAsIGJyaWdodG5lc3M6IDEwMH1cblx0XHRcdHB1c2hPdXRMZWZ0OlxuXHRcdFx0XHRvbGRWaWV3OlxuXHRcdFx0XHRcdHRvOiB7bWF4WDogMH1cblx0XHRcdFx0bmV3Vmlldzpcblx0XHRcdFx0XHRmcm9tOiB7eDogQHdpZHRoLzUsIGJyaWdodG5lc3M6IDcwfVxuXHRcdFx0XHRcdHRvOiB7eDogMCwgYnJpZ2h0bmVzczogMTAwfVxuXHRcdFx0c2xpZGVPdXRVcDpcblx0XHRcdFx0b2xkVmlldzpcblx0XHRcdFx0XHR0bzoge21heFk6IDB9XG5cdFx0XHRzbGlkZU91dFJpZ2h0OlxuXHRcdFx0XHRvbGRWaWV3OlxuXHRcdFx0XHRcdHRvOiB7eDogQHdpZHRofVxuXHRcdFx0c2xpZGVPdXREb3duOlxuXHRcdFx0XHRvbGRWaWV3OlxuXHRcdFx0XHRcdHRvOiB7eTogQGhlaWdodH1cblx0XHRcdHNsaWRlT3V0TGVmdDpcblx0XHRcdFx0b2xkVmlldzpcblx0XHRcdFx0XHR0bzoge21heFg6IDB9XG5cblx0XHQjIHNob3J0Y3V0c1xuXHRcdHRyYW5zaXRpb25zLnNsaWRlSW4gPSB0cmFuc2l0aW9ucy5zbGlkZUluUmlnaHRcblx0XHR0cmFuc2l0aW9ucy5zbGlkZU91dCA9IHRyYW5zaXRpb25zLnNsaWRlT3V0UmlnaHRcblx0XHR0cmFuc2l0aW9ucy5wdXNoSW4gPSB0cmFuc2l0aW9ucy5wdXNoSW5SaWdodFxuXHRcdHRyYW5zaXRpb25zLnB1c2hPdXQgPSB0cmFuc2l0aW9ucy5wdXNoT3V0UmlnaHRcblxuXHRcdCMgZXZlbnRzXG5cdFx0RXZlbnRzLlZpZXdXaWxsU3dpdGNoID0gXCJ2aWV3V2lsbFN3aXRjaFwiXG5cdFx0RXZlbnRzLlZpZXdEaWRTd2l0Y2ggPSBcInZpZXdEaWRTd2l0Y2hcIlxuXHRcdExheWVyOjpvblZpZXdXaWxsU3dpdGNoID0gKGNiKSAtPiBAb24oRXZlbnRzLlZpZXdXaWxsU3dpdGNoLCBjYilcblx0XHRMYXllcjo6b25WaWV3RGlkU3dpdGNoID0gKGNiKSAtPiBAb24oRXZlbnRzLlZpZXdEaWRTd2l0Y2gsIGNiKVx0XHRcblxuXHRcdF8uZWFjaCB0cmFuc2l0aW9ucywgKGFuaW1Qcm9wcywgbmFtZSkgPT5cblxuXHRcdFx0aWYgb3B0aW9ucy5hdXRvTGlua1xuXHRcdFx0XHRsYXllcnMgPSBGcmFtZXIuQ3VycmVudENvbnRleHQuZ2V0TGF5ZXJzKClcblx0XHRcdFx0Zm9yIGJ0biBpbiBsYXllcnNcblx0XHRcdFx0XHRpZiBfLmNvbnRhaW5zIGJ0bi5uYW1lLCBuYW1lXG5cdFx0XHRcdFx0XHR2aWV3Q29udHJvbGxlciA9IEBcblx0XHRcdFx0XHRcdGJ0bi5vbkNsaWNrIC0+XG5cdFx0XHRcdFx0XHRcdGFuaW0gPSBAbmFtZS5zcGxpdCgnXycpWzBdXG5cdFx0XHRcdFx0XHRcdGxpbmtOYW1lID0gQG5hbWUucmVwbGFjZShhbmltKydfJywnJylcblx0XHRcdFx0XHRcdFx0bGlua05hbWUgPSBsaW5rTmFtZS5yZXBsYWNlKC9cXGQrL2csICcnKSAjIHJlbW92ZSBudW1iZXJzXG5cdFx0XHRcdFx0XHRcdHZpZXdDb250cm9sbGVyW2FuaW1dIF8uZmluZChsYXllcnMsIChsKSAtPiBsLm5hbWUgaXMgbGlua05hbWUpXG5cblx0XHRcdEBbbmFtZV0gPSAobmV3VmlldywgYW5pbWF0aW9uT3B0aW9ucyA9IEBhbmltYXRpb25PcHRpb25zKSA9PlxuXG5cdFx0XHRcdHJldHVybiBpZiBuZXdWaWV3IGlzIEBjdXJyZW50Vmlld1xuXG5cdFx0XHRcdCMgbWFrZSBzdXJlIHRoZSBuZXcgbGF5ZXIgaXMgaW5zaWRlIHRoZSB2aWV3Y29udHJvbGxlclxuXHRcdFx0XHRuZXdWaWV3LnBhcmVudCA9IEBcblx0XHRcdFx0bmV3Vmlldy5zZW5kVG9CYWNrKClcblxuXHRcdFx0XHQjIHJlc2V0IHByb3BzIGluIGNhc2UgdGhleSB3ZXJlIGNoYW5nZWQgYnkgYSBwcmV2IGFuaW1hdGlvblxuXHRcdFx0XHRuZXdWaWV3LnBvaW50ID0ge3g6MCwgeTogMH1cblx0XHRcdFx0bmV3Vmlldy5vcGFjaXR5ID0gMVxuXHRcdFx0XHRuZXdWaWV3LnNjYWxlID0gMVxuXHRcdFx0XHRuZXdWaWV3LmJyaWdodG5lc3MgPSAxMDBcblxuXHRcdFx0XHQjIG9sZFZpZXdcblx0XHRcdFx0QGN1cnJlbnRWaWV3Py5wb2ludCA9IHt4OiAwLCB5OiAwfSAjIGZpeGVzIG9mZnNldCBpc3N1ZSB3aGVuIG1vdmluZyB0b28gZmFzdCBiZXR3ZWVuIHNjcmVlbnNcblx0XHRcdFx0QGN1cnJlbnRWaWV3Py5wcm9wcyA9IGFuaW1Qcm9wcy5vbGRWaWV3Py5mcm9tXG5cdFx0XHRcdG91dGdvaW5nID0gQGN1cnJlbnRWaWV3Py5hbmltYXRlIF8uZXh0ZW5kIGFuaW1hdGlvbk9wdGlvbnMsIHtwcm9wZXJ0aWVzOiBhbmltUHJvcHMub2xkVmlldz8udG99XG5cblx0XHRcdFx0IyBuZXdWaWV3XG5cdFx0XHRcdG5ld1ZpZXcucHJvcHMgPSBhbmltUHJvcHMubmV3Vmlldz8uZnJvbVxuXHRcdFx0XHRpbmNvbWluZyA9IG5ld1ZpZXcuYW5pbWF0ZSBfLmV4dGVuZCBhbmltYXRpb25PcHRpb25zLCB7cHJvcGVydGllczogYW5pbVByb3BzLm5ld1ZpZXc/LnRvfVxuXHRcdFx0XHRcblx0XHRcdFx0IyBsYXllciBvcmRlclxuXHRcdFx0XHRpZiBfLmNvbnRhaW5zIG5hbWUsICdPdXQnXG5cdFx0XHRcdFx0bmV3Vmlldy5wbGFjZUJlaGluZChAY3VycmVudFZpZXcpXG5cdFx0XHRcdFx0b3V0Z29pbmcub24gRXZlbnRzLkFuaW1hdGlvbkVuZCwgPT4gQGN1cnJlbnRWaWV3LmJyaW5nVG9Gcm9udCgpXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRuZXdWaWV3LnBsYWNlQmVmb3JlKEBjdXJyZW50Vmlldylcblx0XHRcdFx0XHRcblx0XHRcdFx0QGVtaXQoRXZlbnRzLlZpZXdXaWxsU3dpdGNoLCBAY3VycmVudFZpZXcsIG5ld1ZpZXcpXG5cdFx0XHRcdFxuXHRcdFx0XHQjIGNoYW5nZSBDdXJyZW50VmlldyBiZWZvcmUgYW5pbWF0aW9uIGhhcyBmaW5pc2hlZCBzbyBvbmUgY291bGQgZ28gYmFjayBpbiBoaXN0b3J5XG5cdFx0XHRcdCMgd2l0aG91dCBoYXZpbmcgdG8gd2FpdCBmb3IgdGhlIHRyYW5zaXRpb24gdG8gZmluaXNoXG5cdFx0XHRcdEBzYXZlQ3VycmVudFZpZXdUb0hpc3RvcnkgbmFtZSwgb3V0Z29pbmcsIGluY29taW5nXG5cdFx0XHRcdEBjdXJyZW50VmlldyA9IG5ld1ZpZXdcblx0XHRcdFx0QGVtaXQoXCJjaGFuZ2U6cHJldmlvdXNWaWV3XCIsIEBwcmV2aW91c1ZpZXcpXG5cdFx0XHRcdEBlbWl0KFwiY2hhbmdlOmN1cnJlbnRWaWV3XCIsIEBjdXJyZW50Vmlldylcblx0XHRcdFx0XG5cdFx0XHRcdGluY29taW5nLm9uIEV2ZW50cy5BbmltYXRpb25FbmQsID0+IFxuXHRcdFx0XHRcdEBlbWl0KEV2ZW50cy5WaWV3RGlkU3dpdGNoLCBAcHJldmlvdXNWaWV3LCBAY3VycmVudFZpZXcpXG5cdFx0XHRcdFxuXG5cdFx0aWYgb3B0aW9ucy5pbml0aWFsVmlld05hbWU/XG5cdFx0XHRhdXRvSW5pdGlhbCA9IF8uZmluZCBGcmFtZXIuQ3VycmVudENvbnRleHQuZ2V0TGF5ZXJzKCksIChsKSAtPiBsLm5hbWUgaXMgb3B0aW9ucy5pbml0aWFsVmlld05hbWVcblx0XHRcdGlmIGF1dG9Jbml0aWFsPyB0aGVuIEBzd2l0Y2hJbnN0YW50IGF1dG9Jbml0aWFsXG5cblx0XHRpZiBvcHRpb25zLmluaXRpYWxWaWV3P1xuXHRcdFx0QHN3aXRjaEluc3RhbnQgb3B0aW9ucy5pbml0aWFsVmlld1xuXG5cdFx0aWYgb3B0aW9ucy5iYWNrQnV0dG9uTmFtZT9cblx0XHRcdGJhY2tCdXR0b25zID0gXy5maWx0ZXIgRnJhbWVyLkN1cnJlbnRDb250ZXh0LmdldExheWVycygpLCAobCkgLT4gXy5jb250YWlucyBsLm5hbWUsIG9wdGlvbnMuYmFja0J1dHRvbk5hbWVcblx0XHRcdGZvciBidG4gaW4gYmFja0J1dHRvbnNcblx0XHRcdFx0YnRuLm9uQ2xpY2sgPT4gQGJhY2soKVxuXG5cdEBkZWZpbmUgXCJwcmV2aW91c1ZpZXdcIixcblx0XHRcdGdldDogLT4gQGhpc3RvcnlbMF0udmlld1xuXG5cdHNhdmVDdXJyZW50Vmlld1RvSGlzdG9yeTogKG5hbWUsb3V0Z29pbmdBbmltYXRpb24saW5jb21pbmdBbmltYXRpb24pIC0+XG5cdFx0QGhpc3RvcnkudW5zaGlmdFxuXHRcdFx0dmlldzogQGN1cnJlbnRWaWV3XG5cdFx0XHRhbmltYXRpb25OYW1lOiBuYW1lXG5cdFx0XHRpbmNvbWluZ0FuaW1hdGlvbjogaW5jb21pbmdBbmltYXRpb25cblx0XHRcdG91dGdvaW5nQW5pbWF0aW9uOiBvdXRnb2luZ0FuaW1hdGlvblxuXG5cdGJhY2s6IC0+XG5cdFx0cHJldmlvdXMgPSBAaGlzdG9yeVswXVxuXHRcdGlmIHByZXZpb3VzLnZpZXc/XG5cblx0XHRcdGlmIF8uY29udGFpbnMgcHJldmlvdXMuYW5pbWF0aW9uTmFtZSwgJ091dCdcblx0XHRcdFx0cHJldmlvdXMudmlldy5icmluZ1RvRnJvbnQoKVxuXG5cdFx0XHRiYWNrSW4gPSBwcmV2aW91cy5vdXRnb2luZ0FuaW1hdGlvbi5yZXZlcnNlKClcblx0XHRcdG1vdmVPdXQgPSBwcmV2aW91cy5pbmNvbWluZ0FuaW1hdGlvbi5yZXZlcnNlKClcblxuXHRcdFx0YmFja0luLnN0YXJ0KClcblx0XHRcdG1vdmVPdXQuc3RhcnQoKVxuXG5cdFx0XHRAY3VycmVudFZpZXcgPSBwcmV2aW91cy52aWV3XG5cdFx0XHRAaGlzdG9yeS5zaGlmdCgpXG5cdFx0XHRtb3ZlT3V0Lm9uIEV2ZW50cy5BbmltYXRpb25FbmQsID0+IEBjdXJyZW50Vmlldy5icmluZ1RvRnJvbnQoKVxuIiwiY2xhc3MgVGV4dExheWVyIGV4dGVuZHMgTGF5ZXJcblx0XHRcblx0Y29uc3RydWN0b3I6IChvcHRpb25zPXt9KSAtPlxuXHRcdEBkb0F1dG9TaXplID0gZmFsc2Vcblx0XHRAZG9BdXRvU2l6ZUhlaWdodCA9IGZhbHNlXG5cdFx0b3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3IgPz0gaWYgb3B0aW9ucy5zZXR1cCB0aGVuIFwiaHNsYSg2MCwgOTAlLCA0NyUsIC40KVwiIGVsc2UgXCJ0cmFuc3BhcmVudFwiXG5cdFx0b3B0aW9ucy5jb2xvciA/PSBcInJlZFwiXG5cdFx0b3B0aW9ucy5saW5lSGVpZ2h0ID89IDEuMjVcblx0XHRvcHRpb25zLmZvbnRGYW1pbHkgPz0gXCJIZWx2ZXRpY2FcIlxuXHRcdG9wdGlvbnMuZm9udFNpemUgPz0gMjBcblx0XHRvcHRpb25zLnRleHQgPz0gXCJVc2UgbGF5ZXIudGV4dCB0byBhZGQgdGV4dFwiXG5cdFx0c3VwZXIgb3B0aW9uc1xuXHRcdEBzdHlsZS53aGl0ZVNwYWNlID0gXCJwcmUtbGluZVwiICMgYWxsb3cgXFxuIGluIC50ZXh0XG5cdFx0QHN0eWxlLm91dGxpbmUgPSBcIm5vbmVcIiAjIG5vIGJvcmRlciB3aGVuIHNlbGVjdGVkXG5cdFx0XG5cdHNldFN0eWxlOiAocHJvcGVydHksIHZhbHVlLCBweFN1ZmZpeCA9IGZhbHNlKSAtPlxuXHRcdEBzdHlsZVtwcm9wZXJ0eV0gPSBpZiBweFN1ZmZpeCB0aGVuIHZhbHVlK1wicHhcIiBlbHNlIHZhbHVlXG5cdFx0QGVtaXQoXCJjaGFuZ2U6I3twcm9wZXJ0eX1cIiwgdmFsdWUpXG5cdFx0aWYgQGRvQXV0b1NpemUgdGhlbiBAY2FsY1NpemUoKVxuXHRcdFxuXHRjYWxjU2l6ZTogLT5cblx0XHRzaXplQWZmZWN0aW5nU3R5bGVzID1cblx0XHRcdGxpbmVIZWlnaHQ6IEBzdHlsZVtcImxpbmUtaGVpZ2h0XCJdXG5cdFx0XHRmb250U2l6ZTogQHN0eWxlW1wiZm9udC1zaXplXCJdXG5cdFx0XHRmb250V2VpZ2h0OiBAc3R5bGVbXCJmb250LXdlaWdodFwiXVxuXHRcdFx0cGFkZGluZ1RvcDogQHN0eWxlW1wicGFkZGluZy10b3BcIl1cblx0XHRcdHBhZGRpbmdSaWdodDogQHN0eWxlW1wicGFkZGluZy1yaWdodFwiXVxuXHRcdFx0cGFkZGluZ0JvdHRvbTogQHN0eWxlW1wicGFkZGluZy1ib3R0b21cIl1cblx0XHRcdHBhZGRpbmdMZWZ0OiBAc3R5bGVbXCJwYWRkaW5nLWxlZnRcIl1cblx0XHRcdHRleHRUcmFuc2Zvcm06IEBzdHlsZVtcInRleHQtdHJhbnNmb3JtXCJdXG5cdFx0XHRib3JkZXJXaWR0aDogQHN0eWxlW1wiYm9yZGVyLXdpZHRoXCJdXG5cdFx0XHRsZXR0ZXJTcGFjaW5nOiBAc3R5bGVbXCJsZXR0ZXItc3BhY2luZ1wiXVxuXHRcdFx0Zm9udEZhbWlseTogQHN0eWxlW1wiZm9udC1mYW1pbHlcIl1cblx0XHRcdGZvbnRTdHlsZTogQHN0eWxlW1wiZm9udC1zdHlsZVwiXVxuXHRcdFx0Zm9udFZhcmlhbnQ6IEBzdHlsZVtcImZvbnQtdmFyaWFudFwiXVxuXHRcdGNvbnN0cmFpbnRzID0ge31cblx0XHRpZiBAZG9BdXRvU2l6ZUhlaWdodCB0aGVuIGNvbnN0cmFpbnRzLndpZHRoID0gQHdpZHRoXG5cdFx0c2l6ZSA9IFV0aWxzLnRleHRTaXplIEB0ZXh0LCBzaXplQWZmZWN0aW5nU3R5bGVzLCBjb25zdHJhaW50c1xuXHRcdGlmIEBzdHlsZS50ZXh0QWxpZ24gaXMgXCJyaWdodFwiXG5cdFx0XHRAd2lkdGggPSBzaXplLndpZHRoXG5cdFx0XHRAeCA9IEB4LUB3aWR0aFxuXHRcdGVsc2Vcblx0XHRcdEB3aWR0aCA9IHNpemUud2lkdGhcblx0XHRAaGVpZ2h0ID0gc2l6ZS5oZWlnaHRcblxuXHRAZGVmaW5lIFwiYXV0b1NpemVcIixcblx0XHRnZXQ6IC0+IEBkb0F1dG9TaXplXG5cdFx0c2V0OiAodmFsdWUpIC0+IFxuXHRcdFx0QGRvQXV0b1NpemUgPSB2YWx1ZVxuXHRcdFx0aWYgQGRvQXV0b1NpemUgdGhlbiBAY2FsY1NpemUoKVxuXHRAZGVmaW5lIFwiYXV0b1NpemVIZWlnaHRcIixcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gXG5cdFx0XHRAZG9BdXRvU2l6ZSA9IHZhbHVlXG5cdFx0XHRAZG9BdXRvU2l6ZUhlaWdodCA9IHZhbHVlXG5cdFx0XHRpZiBAZG9BdXRvU2l6ZSB0aGVuIEBjYWxjU2l6ZSgpXG5cdEBkZWZpbmUgXCJjb250ZW50RWRpdGFibGVcIixcblx0XHRzZXQ6IChib29sZWFuKSAtPlxuXHRcdFx0QF9lbGVtZW50LmNvbnRlbnRFZGl0YWJsZSA9IGJvb2xlYW5cblx0XHRcdEBpZ25vcmVFdmVudHMgPSAhYm9vbGVhblxuXHRcdFx0QG9uIFwiaW5wdXRcIiwgLT4gQGNhbGNTaXplKCkgaWYgQGRvQXV0b1NpemVcblx0QGRlZmluZSBcInRleHRcIixcblx0XHRnZXQ6IC0+IEBfZWxlbWVudC50ZXh0Q29udGVudFxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0QF9lbGVtZW50LnRleHRDb250ZW50ID0gdmFsdWVcblx0XHRcdEBlbWl0KFwiY2hhbmdlOnRleHRcIiwgdmFsdWUpXG5cdFx0XHRpZiBAZG9BdXRvU2l6ZSB0aGVuIEBjYWxjU2l6ZSgpXG5cdEBkZWZpbmUgXCJmb250RmFtaWx5XCIsIFxuXHRcdGdldDogLT4gQHN0eWxlLmZvbnRGYW1pbHlcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQHNldFN0eWxlKFwiZm9udEZhbWlseVwiLCB2YWx1ZSlcblx0QGRlZmluZSBcImZvbnRTaXplXCIsIFxuXHRcdGdldDogLT4gQHN0eWxlLmZvbnRTaXplLnJlcGxhY2UoXCJweFwiLFwiXCIpXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBzZXRTdHlsZShcImZvbnRTaXplXCIsIHZhbHVlLCB0cnVlKVxuXHRAZGVmaW5lIFwibGluZUhlaWdodFwiLCBcblx0XHRnZXQ6IC0+IEBzdHlsZS5saW5lSGVpZ2h0IFxuXHRcdHNldDogKHZhbHVlKSAtPiBAc2V0U3R5bGUoXCJsaW5lSGVpZ2h0XCIsIHZhbHVlKVxuXHRAZGVmaW5lIFwiZm9udFdlaWdodFwiLCBcblx0XHRnZXQ6IC0+IEBzdHlsZS5mb250V2VpZ2h0IFxuXHRcdHNldDogKHZhbHVlKSAtPiBAc2V0U3R5bGUoXCJmb250V2VpZ2h0XCIsIHZhbHVlKVxuXHRAZGVmaW5lIFwiZm9udFN0eWxlXCIsIFxuXHRcdGdldDogLT4gQHN0eWxlLmZvbnRTdHlsZVxuXHRcdHNldDogKHZhbHVlKSAtPiBAc2V0U3R5bGUoXCJmb250U3R5bGVcIiwgdmFsdWUpXG5cdEBkZWZpbmUgXCJmb250VmFyaWFudFwiLCBcblx0XHRnZXQ6IC0+IEBzdHlsZS5mb250VmFyaWFudFxuXHRcdHNldDogKHZhbHVlKSAtPiBAc2V0U3R5bGUoXCJmb250VmFyaWFudFwiLCB2YWx1ZSlcblx0QGRlZmluZSBcInBhZGRpbmdcIixcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gXG5cdFx0XHRAc2V0U3R5bGUoXCJwYWRkaW5nVG9wXCIsIHZhbHVlLCB0cnVlKVxuXHRcdFx0QHNldFN0eWxlKFwicGFkZGluZ1JpZ2h0XCIsIHZhbHVlLCB0cnVlKVxuXHRcdFx0QHNldFN0eWxlKFwicGFkZGluZ0JvdHRvbVwiLCB2YWx1ZSwgdHJ1ZSlcblx0XHRcdEBzZXRTdHlsZShcInBhZGRpbmdMZWZ0XCIsIHZhbHVlLCB0cnVlKVxuXHRAZGVmaW5lIFwicGFkZGluZ1RvcFwiLCBcblx0XHRnZXQ6IC0+IEBzdHlsZS5wYWRkaW5nVG9wLnJlcGxhY2UoXCJweFwiLFwiXCIpXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBzZXRTdHlsZShcInBhZGRpbmdUb3BcIiwgdmFsdWUsIHRydWUpXG5cdEBkZWZpbmUgXCJwYWRkaW5nUmlnaHRcIiwgXG5cdFx0Z2V0OiAtPiBAc3R5bGUucGFkZGluZ1JpZ2h0LnJlcGxhY2UoXCJweFwiLFwiXCIpXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBzZXRTdHlsZShcInBhZGRpbmdSaWdodFwiLCB2YWx1ZSwgdHJ1ZSlcblx0QGRlZmluZSBcInBhZGRpbmdCb3R0b21cIiwgXG5cdFx0Z2V0OiAtPiBAc3R5bGUucGFkZGluZ0JvdHRvbS5yZXBsYWNlKFwicHhcIixcIlwiKVxuXHRcdHNldDogKHZhbHVlKSAtPiBAc2V0U3R5bGUoXCJwYWRkaW5nQm90dG9tXCIsIHZhbHVlLCB0cnVlKVxuXHRAZGVmaW5lIFwicGFkZGluZ0xlZnRcIixcblx0XHRnZXQ6IC0+IEBzdHlsZS5wYWRkaW5nTGVmdC5yZXBsYWNlKFwicHhcIixcIlwiKVxuXHRcdHNldDogKHZhbHVlKSAtPiBAc2V0U3R5bGUoXCJwYWRkaW5nTGVmdFwiLCB2YWx1ZSwgdHJ1ZSlcblx0QGRlZmluZSBcInRleHRBbGlnblwiLFxuXHRcdHNldDogKHZhbHVlKSAtPiBAc2V0U3R5bGUoXCJ0ZXh0QWxpZ25cIiwgdmFsdWUpXG5cdEBkZWZpbmUgXCJ0ZXh0VHJhbnNmb3JtXCIsIFxuXHRcdGdldDogLT4gQHN0eWxlLnRleHRUcmFuc2Zvcm0gXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBzZXRTdHlsZShcInRleHRUcmFuc2Zvcm1cIiwgdmFsdWUpXG5cdEBkZWZpbmUgXCJsZXR0ZXJTcGFjaW5nXCIsIFxuXHRcdGdldDogLT4gQHN0eWxlLmxldHRlclNwYWNpbmcucmVwbGFjZShcInB4XCIsXCJcIilcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQHNldFN0eWxlKFwibGV0dGVyU3BhY2luZ1wiLCB2YWx1ZSwgdHJ1ZSlcblx0QGRlZmluZSBcImxlbmd0aFwiLCBcblx0XHRnZXQ6IC0+IEB0ZXh0Lmxlbmd0aFxuXG5jb252ZXJ0VG9UZXh0TGF5ZXIgPSAobGF5ZXIpIC0+XG5cdHQgPSBuZXcgVGV4dExheWVyXG5cdFx0bmFtZTogbGF5ZXIubmFtZVxuXHRcdGZyYW1lOiBsYXllci5mcmFtZVxuXHRcdHBhcmVudDogbGF5ZXIucGFyZW50XG5cdFxuXHRjc3NPYmogPSB7fVxuXHRjc3MgPSBsYXllci5faW5mby5tZXRhZGF0YS5jc3Ncblx0Y3NzLmZvckVhY2ggKHJ1bGUpIC0+XG5cdFx0cmV0dXJuIGlmIF8uY29udGFpbnMgcnVsZSwgJy8qJ1xuXHRcdGFyciA9IHJ1bGUuc3BsaXQoJzogJylcblx0XHRjc3NPYmpbYXJyWzBdXSA9IGFyclsxXS5yZXBsYWNlKCc7JywnJylcblx0dC5zdHlsZSA9IGNzc09ialxuXHRcblx0aW1wb3J0UGF0aCA9IGxheWVyLl9fZnJhbWVySW1wb3J0ZWRGcm9tUGF0aFxuXHRpZiBfLmNvbnRhaW5zIGltcG9ydFBhdGgsICdAMngnXG5cdFx0dC5mb250U2l6ZSAqPSAyXG5cdFx0dC5saW5lSGVpZ2h0ID0gKHBhcnNlSW50KHQubGluZUhlaWdodCkqMikrJ3B4J1xuXHRcdHQubGV0dGVyU3BhY2luZyAqPSAyXG5cdFx0XHRcdFx0XG5cdHQueSAtPSAocGFyc2VJbnQodC5saW5lSGVpZ2h0KS10LmZvbnRTaXplKS8yICMgY29tcGVuc2F0ZSBmb3IgaG93IENTUyBoYW5kbGVzIGxpbmUgaGVpZ2h0XG5cdHQueSAtPSB0LmZvbnRTaXplICogMC4xICMgc2tldGNoIHBhZGRpbmdcblx0dC54IC09IHQuZm9udFNpemUgKiAwLjA4ICMgc2tldGNoIHBhZGRpbmdcblx0dC53aWR0aCArPSB0LmZvbnRTaXplICogMC41ICMgc2tldGNoIHBhZGRpbmdcblxuXHR0LnRleHQgPSBsYXllci5faW5mby5tZXRhZGF0YS5zdHJpbmdcblx0bGF5ZXIuZGVzdHJveSgpXG5cdHJldHVybiB0XG5cbkxheWVyOjpjb252ZXJ0VG9UZXh0TGF5ZXIgPSAtPiBjb252ZXJ0VG9UZXh0TGF5ZXIoQClcblxuY29udmVydFRleHRMYXllcnMgPSAob2JqKSAtPlxuXHRmb3IgcHJvcCxsYXllciBvZiBvYmpcblx0XHRpZiBsYXllci5faW5mby5raW5kIGlzIFwidGV4dFwiXG5cdFx0XHRvYmpbcHJvcF0gPSBjb252ZXJ0VG9UZXh0TGF5ZXIobGF5ZXIpXG5cbiMgQmFja3dhcmRzIGNvbXBhYmlsaXR5LiBSZXBsYWNlZCBieSBjb252ZXJ0VG9UZXh0TGF5ZXIoKVxuTGF5ZXI6OmZyYW1lQXNUZXh0TGF5ZXIgPSAocHJvcGVydGllcykgLT5cbiAgICB0ID0gbmV3IFRleHRMYXllclxuICAgIHQuZnJhbWUgPSBAZnJhbWVcbiAgICB0LnN1cGVyTGF5ZXIgPSBAc3VwZXJMYXllclxuICAgIF8uZXh0ZW5kIHQscHJvcGVydGllc1xuICAgIEBkZXN0cm95KClcbiAgICB0XG5cbmV4cG9ydHMuVGV4dExheWVyID0gVGV4dExheWVyXG5leHBvcnRzLmNvbnZlcnRUZXh0TGF5ZXJzID0gY29udmVydFRleHRMYXllcnNcbiIsIiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4jIENyZWF0ZWQgYnkgSm9yZGFuIFJvYmVydCBEb2Jzb24gb24gMDUgT2N0b2JlciAyMDE1XG4jIFxuIyBVc2UgdG8gYWRkIGZvbnQgZmlsZXMgYW5kIHJlZmVyZW5jZSB0aGVtIGluIHlvdXIgQ1NTIHN0eWxlIHNldHRpbmdzLlxuI1xuIyBUbyBHZXQgU3RhcnRlZC4uLlxuI1xuIyAxLiBQbGFjZSB0aGUgRm9udEZhY2UuY29mZmVlIGZpbGUgaW4gRnJhbWVyIFN0dWRpbyBtb2R1bGVzIGRpcmVjdG9yeVxuI1xuIyAyLiBJbiB5b3VyIHByb2plY3QgaW5jbHVkZTpcbiMgICAgIHtGb250RmFjZX0gPSByZXF1aXJlIFwiRm9udEZhY2VcIlxuI1xuIyAzLiBUbyBhZGQgYSBmb250IGZhY2U6IFxuIyAgICAgZ290aGFtID0gbmV3IEZvbnRGYWNlIG5hbWU6IFwiR290aGFtXCIsIGZpbGU6IFwiR290aGFtLnR0ZlwiXG4jIFxuIyA0LiBJdCBjaGVja3MgdGhhdCB0aGUgZm9udCB3YXMgbG9hZGVkLiBFcnJvcnMgY2FuIGJlIHN1cHByZXNzZWQgbGlrZSBzby4uLlxuIyAgICBnb3RoYW0gPSBuZXcgRm9udEZhY2UgbmFtZTogXCJHb3RoYW1cIiwgZmlsZTogXCJHb3RoYW0udHRmXCIsIGhpZGVFcnJvcnM6IHRydWUgXG4jXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXG5jbGFzcyBleHBvcnRzLkZvbnRGYWNlXG5cblx0VEVTVCA9XG5cdFx0ZmFjZTogXCJtb25vc3BhY2VcIlxuXHRcdHRleHQ6IFwiZm9vXCJcblx0XHR0aW1lOiAuMDFcblx0XHRtYXhMb2FkQXR0ZW1wdHM6IDUwXG5cdFx0aGlkZUVycm9yTWVzc2FnZXM6IHRydWVcblx0XHRcblx0VEVTVC5zdHlsZSA9IFxuXHRcdHdpZHRoOiBcImF1dG9cIlxuXHRcdGZvbnRTaXplOiBcIjE1MHB4XCJcblx0XHRmb250RmFtaWx5OiBURVNULmZhY2Vcblx0XHRcblx0VEVTVC5sYXllciA9IG5ldyBMYXllclxuXHRcdG5hbWU6XCJGb250RmFjZSBUZXN0ZXJcIlxuXHRcdHdpZHRoOiAwXG5cdFx0aGVpZ2h0OiAxXG5cdFx0bWF4WDogLShTY3JlZW4ud2lkdGgpXG5cdFx0dmlzaWJsZTogZmFsc2Vcblx0XHRodG1sOiBURVNULnRleHRcblx0XHRzdHlsZTogVEVTVC5zdHlsZVxuXHRcdFxuXHRcblx0IyBTRVRVUCBGT1IgRVZFUlkgSU5TVEFOQ0Vcblx0Y29uc3RydWN0b3I6IChvcHRpb25zKSAtPlxuXHRcblx0XHRAbmFtZSA9IEBmaWxlID0gQHRlc3RMYXllciA9IEBpc0xvYWRlZCA9IEBsb2FkRmFpbGVkID0gQGxvYWRBdHRlbXB0cyA9IEBvcmlnaW5hbFNpemUgPSBAaGlkZUVycm9ycyA9ICBudWxsXG5cdFx0XG5cdFx0aWYgb3B0aW9ucz9cblx0XHRcdEBuYW1lID0gb3B0aW9ucy5uYW1lIHx8IG51bGxcblx0XHRcdEBmaWxlID0gb3B0aW9ucy5maWxlIHx8IG51bGxcblx0XHRcblx0XHRyZXR1cm4gbWlzc2luZ0FyZ3VtZW50RXJyb3IoKSB1bmxlc3MgQG5hbWU/IGFuZCBAZmlsZT9cblx0XHRcblx0XHRAdGVzdExheWVyICAgICAgICAgPSBURVNULmxheWVyLmNvcHkoKVxuXHRcdEB0ZXN0TGF5ZXIuc3R5bGUgICA9IFRFU1Quc3R5bGVcblx0XHRAdGVzdExheWVyLm1heFggICAgPSAtKFNjcmVlbi53aWR0aClcblx0XHRAdGVzdExheWVyLnZpc2libGUgPSB0cnVlXG5cdFx0XG5cdFx0QGlzTG9hZGVkICAgICA9IGZhbHNlXG5cdFx0QGxvYWRGYWlsZWQgICA9IGZhbHNlXG5cdFx0QGxvYWRBdHRlbXB0cyA9IDBcblx0XHRAaGlkZUVycm9ycyAgID0gb3B0aW9ucy5oaWRlRXJyb3JzXG5cblx0XHRyZXR1cm4gYWRkRm9udEZhY2UgQG5hbWUsIEBmaWxlLCBAXG5cdFx0XG5cdCMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXHQjIFByaXZhdGUgSGVscGVyIE1ldGhvZHMgIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblx0XHRcblx0YWRkRm9udEZhY2UgPSAobmFtZSwgZmlsZSwgb2JqZWN0KSAtPlxuXHRcdCMgQ3JlYXRlIG91ciBFbGVtZW50ICYgTm9kZVxuXHRcdHN0eWxlVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnc3R5bGUnXG5cdFx0ZmFjZUNTUyAgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSBcIkBmb250LWZhY2UgeyBmb250LWZhbWlseTogJyN7bmFtZX0nOyBzcmM6IHVybCgnI3tmaWxlfScpIGZvcm1hdCgndHJ1ZXR5cGUnKTsgfVwiXG5cdFx0IyBBZGQgdGhlIEVsZW1lbnQgJiBOb2RlIHRvIHRoZSBkb2N1bWVudFxuXHRcdHN0eWxlVGFnLmFwcGVuZENoaWxkIGZhY2VDU1Ncblx0XHRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkIHN0eWxlVGFnXG5cdFx0IyBUZXN0IG91dCB0aGUgRmFzdCB0byBzZWUgaWYgaXQgY2hhbmdlZFxuXHRcdHRlc3ROZXdGYWNlIG5hbWUsIG9iamVjdFxuXHRcdFxuXHQjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblx0XHRcblx0cmVtb3ZlVGVzdExheWVyID0gKG9iamVjdCkgLT5cblx0XHRvYmplY3QudGVzdExheWVyLmRlc3Ryb3koKVxuXHRcdG9iamVjdC50ZXN0TGF5ZXIgPSBudWxsXG5cdFx0XG5cdCMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXHRcdFxuXHR0ZXN0TmV3RmFjZSA9IChuYW1lLCBvYmplY3QpIC0+XG5cdFx0XG5cdFx0aW5pdGlhbFdpZHRoID0gb2JqZWN0LnRlc3RMYXllci5fZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aFxuXHRcdFxuXHRcdCMgQ2hlY2sgdG8gc2VlIGlmIGl0J3MgcmVhZHkgeWV0XG5cdFx0aWYgaW5pdGlhbFdpZHRoIGlzIDBcblx0XHRcdGlmIG9iamVjdC5oaWRlRXJyb3JzIGlzIGZhbHNlIG9yIFRFU1QuaGlkZUVycm9yTWVzc2FnZXMgaXMgZmFsc2Vcblx0XHRcdFx0cHJpbnQgXCJMb2FkIHRlc3RpbmcgZmFpbGVkLiBBdHRlbXB0aW5nIGFnYWluLlwiXG5cdFx0XHRyZXR1cm4gVXRpbHMuZGVsYXkgVEVTVC50aW1lLCAtPiB0ZXN0TmV3RmFjZSBuYW1lLCBvYmplY3Rcblx0XHRcblx0XHRvYmplY3QubG9hZEF0dGVtcHRzKytcblx0XHRcblx0XHRpZiBvYmplY3Qub3JpZ2luYWxTaXplIGlzIG51bGxcblx0XHRcdG9iamVjdC5vcmlnaW5hbFNpemUgPSBpbml0aWFsV2lkdGhcblx0XHRcdG9iamVjdC50ZXN0TGF5ZXIuc3R5bGUgPSBmb250RmFtaWx5OiBcIiN7bmFtZX0sICN7VEVTVC5mYWNlfVwiXG5cdFx0XG5cdFx0d2lkdGhVcGRhdGUgPSBvYmplY3QudGVzdExheWVyLl9lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoXG5cblx0XHRpZiBvYmplY3Qub3JpZ2luYWxTaXplIGlzIHdpZHRoVXBkYXRlXG5cdFx0XHQjIElmIHdlIGNhbiBhdHRlbXB0IHRvIGNoZWNrIGFnYWluLi4uIERvIGl0XG5cdFx0XHRpZiBvYmplY3QubG9hZEF0dGVtcHRzIDwgVEVTVC5tYXhMb2FkQXR0ZW1wdHNcblx0XHRcdFx0cmV0dXJuIFV0aWxzLmRlbGF5IFRFU1QudGltZSwgLT4gdGVzdE5ld0ZhY2UgbmFtZSwgb2JqZWN0XG5cdFx0XHRcdFxuXHRcdFx0cHJpbnQgXCLimqDvuI8gRmFpbGVkIGxvYWRpbmcgRm9udEZhY2U6ICN7bmFtZX1cIiB1bmxlc3Mgb2JqZWN0LmhpZGVFcnJvcnNcblx0XHRcdG9iamVjdC5pc0xvYWRlZCAgID0gZmFsc2Vcblx0XHRcdG9iamVjdC5sb2FkRmFpbGVkID0gdHJ1ZVxuXHRcdFx0bG9hZFRlc3RpbmdGaWxlRXJyb3Igb2JqZWN0IHVubGVzcyBvYmplY3QuaGlkZUVycm9yc1xuXHRcdFx0cmV0dXJuXG5cdFx0XHRcblx0XHRlbHNlXG5cdFx0XHRwcmludCBcIkxPQURFRDogI3tuYW1lfVwiIHVubGVzcyBvYmplY3QuaGlkZUVycm9ycyBpcyBmYWxzZSBvciBURVNULmhpZGVFcnJvck1lc3NhZ2VzXG5cdFx0XHRvYmplY3QuaXNMb2FkZWQgICA9IHRydWVcblx0XHRcdG9iamVjdC5sb2FkRmFpbGVkID0gZmFsc2VcblxuXHRcdHJlbW92ZVRlc3RMYXllciBvYmplY3Rcblx0XHRyZXR1cm4gbmFtZVxuXG5cdCMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuXHQjIEVycm9yIEhhbmRsZXIgTWV0aG9kcyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuXHRtaXNzaW5nQXJndW1lbnRFcnJvciA9IC0+XG5cdFx0ZXJyb3IgbnVsbFxuXHRcdGNvbnNvbGUuZXJyb3IgXCJcIlwiXG5cdFx0XHRFcnJvcjogWW91IG11c3QgcGFzcyBuYW1lICYgZmlsZSBwcm9wZXJpdGVzIHdoZW4gY3JlYXRpbmcgYSBuZXcgRm9udEZhY2UuIFxcblxuXHRcdFx0RXhhbXBsZTogbXlGYWNlID0gbmV3IEZvbnRGYWNlIG5hbWU6XFxcIkdvdGhhbVxcXCIsIGZpbGU6XFxcImdvdGhhbS50dGZcXFwiIFxcblwiXCJcIlxuXHRcdFx0XG5cdGxvYWRUZXN0aW5nRmlsZUVycm9yID0gKG9iamVjdCkgLT5cblx0XHRlcnJvciBudWxsXG5cdFx0Y29uc29sZS5lcnJvciBcIlwiXCJcblx0XHRcdEVycm9yOiBDb3VsZG4ndCBkZXRlY3QgdGhlIGZvbnQ6IFxcXCIje29iamVjdC5uYW1lfVxcXCIgYW5kIGZpbGU6IFxcXCIje29iamVjdC5maWxlfVxcXCIgd2FzIGxvYWRlZC4gIFxcblxuXHRcdFx0RWl0aGVyIHRoZSBmaWxlIGNvdWxkbid0IGJlIGZvdW5kIG9yIHlvdXIgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgdGhlIGZpbGUgdHlwZSB0aGF0IHdhcyBwcm92aWRlZC4gXFxuXG5cdFx0XHRTdXBwcmVzcyB0aGlzIG1lc3NhZ2UgYnkgYWRkaW5nIFxcXCJoaWRlRXJyb3JzOiB0cnVlXFxcIiB3aGVuIGNyZWF0aW5nIGEgbmV3IEZvbnRGYWNlLiBcXG5cIlwiXCJcbiIsIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBT0FBO0FEb0JNLE9BQU8sQ0FBQztBQUViLE1BQUE7O0VBQUEsSUFBQSxHQUNDO0lBQUEsSUFBQSxFQUFNLFdBQU47SUFDQSxJQUFBLEVBQU0sS0FETjtJQUVBLElBQUEsRUFBTSxHQUZOO0lBR0EsZUFBQSxFQUFpQixFQUhqQjtJQUlBLGlCQUFBLEVBQW1CLElBSm5COzs7RUFNRCxJQUFJLENBQUMsS0FBTCxHQUNDO0lBQUEsS0FBQSxFQUFPLE1BQVA7SUFDQSxRQUFBLEVBQVUsT0FEVjtJQUVBLFVBQUEsRUFBWSxJQUFJLENBQUMsSUFGakI7OztFQUlELElBQUksQ0FBQyxLQUFMLEdBQWlCLElBQUEsS0FBQSxDQUNoQjtJQUFBLElBQUEsRUFBSyxpQkFBTDtJQUNBLEtBQUEsRUFBTyxDQURQO0lBRUEsTUFBQSxFQUFRLENBRlI7SUFHQSxJQUFBLEVBQU0sQ0FBRSxNQUFNLENBQUMsS0FIZjtJQUlBLE9BQUEsRUFBUyxLQUpUO0lBS0Es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
