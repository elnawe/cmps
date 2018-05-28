(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const EventPropertyHook = require("./EventPropertyHook");

const emptyProperties = {};
const emptyChildren = [];

const type = "Component";

function Component(tagName, properties, children, key) {
    this.tagName = tagName;
    this.properties = properties || emptyProperties;
    this.children = children || emptyChildren;
    this.key = key != null ? String(key) : undefined;

    let count = 0;
    let descendents = 0;
    let hooks;

    for (let propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            let property = properties[propName];

            if (isEvent(property)) {
                if (!hooks) {
                    hooks = {};
                }

                hooks[propName] = property;
            }
        }
    }

    this.count = count;
    this.hooks = hooks;
}

function isEvent(prop) {
    return prop instanceof EventPropertyHook && prop.attach && prop.detach;
}

Component.prototype.type = type;

module.exports = Component;

},{"./EventPropertyHook":3}],2:[function(require,module,exports){
const render = require("./render");
const utils = require("./utils");

/**
 * ComposeApplication
 * @param {Component} rootComponent - Root Component that will be rendered.
 * @param {HTMLElement | String} ownerDOMElement - An HTMLElement or String that hosts the app.
 * @param {Object} options - The options object.
 * @returns {Object} api - Compose api.
 */
module.exports = function ComposeApplication(rootComponent, ownerDOMElement, options) {
    const api = {};
    let owner = ownerDOMElement;
    let rootNode;

    if (typeof ownerDOMElement === "string") {
        owner = document.getElementById(ownerDOMElement);
    }

    if (owner === undefined || owner === null) {
        throw Error("Not an owner node");
    }

    // Safety check the component

    if (rootComponent && utils.isChild(rootComponent)) {
        owner.appendChild(render(rootComponent));
    } else {
        throw Error("Not a component");
    }

    return api;
};

},{"./render":13,"./utils":14}],3:[function(require,module,exports){
const EventStore = require("ev-store");

function EventPropertyHook(propertyValue) {
    if (!(this instanceof EventPropertyHook)) {
        return new EventPropertyHook(propertyValue);
    }

    this.value = propertyValue;
    console.log(this.value);
}

EventPropertyHook.prototype.attach = function (node, propertyName) {
    let elementEvents = EventStore(node);
    let eventName = propertyName.substr(2).toLowerCase(); // onClick -> click
    console.log("Event " + propertyName + " attached with value: ", this.value);

    elementEvents[eventName] = this.value;
}

EventPropertyHook.prototype.detach = function (node, propertyName) {
    let elementEvents = EventStore(node);
    let eventName = propertyName.substr(2).toLowerCase();
    console.log("Event " + propertyName + " detached");

    elementEvents[eventName] = undefined;
}

module.exports = EventPropertyHook;

},{"ev-store":9}],4:[function(require,module,exports){
function Text(text) {
    this.text = String(text);
}

Text.prototype.type = "Text";

module.exports = Text;

},{}],5:[function(require,module,exports){
const errors = require("./errors");
const Component = require("./Component");
const propertiesParser = require("./properties-parser");
const Text = require("./Text");
const utils = require("./utils");

function createComponent(tagName, properties, children) {
    let childNodes = [];
    let tag, props, key, namespace;

    // If second parameter is children instead of prop.
    if (!children && utils.isChildren(properties)) {
        children = properties;
        props = {};
    }

    props = propertiesParser(props || properties || {});
    tag = tagName;

    // Support and save key.
    if (props.hasOwnProperty("key")) {
        key = props.key;
        props.key = undefined;
    }

    if (children !== undefined && children !== null) {
        if (Array.isArray(children)) {
            for (let index = 0; index < children.length; index++) {
                childNodes.push(parseChild(children[index], tag, props));
            }
        } else {
            childNodes.push(parseChild(children, tag, props));
        }
    }

    return new Component(tag, props, childNodes, key);
}

function parseChild(child, tag, properties) {
    switch(typeof child) {
    case "string":
        return new Text(child);
    case "number":
        return new Text(child);
    case "function":
        if (utils.isChild(child())) return child();
    case "object":
        if (utils.isChild(child)) return child;
    case "undefined":
        return;
    default:
        throw errors.UnexpectedElement({
            element: child,
            parent: {
                tag: tag,
                properties: properties
            }
        });
    }
}

module.exports = createComponent;

},{"./Component":1,"./Text":4,"./errors":6,"./properties-parser":12,"./utils":14}],6:[function(require,module,exports){
function UnexpectedElement(data) {
    let err = new Error();

    // Fix error message.
    err.type = "cmps.unexpected.element";
    err.message = "Trying to render unexpected element " + data.element + "."
    err.node = data.element;

    return err;
}

module.exports = {
    UnexpectedElement: UnexpectedElement
};

},{}],7:[function(require,module,exports){
const utils = require("./utils");

function handleBuffers(a, b) {
    let renderedBufferA = a;
    let renderedBufferB = b;

    if (utils.isBuffer(b)) {
        renderedBufferB = renderBuffer(b);
    }

    if (utils.isBuffer(a)) {
        rendererdBufferA = renderBuffer(a);
    }

    return {
        a: renderedBufferA,
        b: renderedBufferB
    };
}

function renderBuffer(buffer, previous) {
    let renderedBuffer = buffer.purNode;

    if (!renderedBuffer) {
        renderedBuffer = buffer.purNode = buffer.render(previous);
    }

    if (!(utils.isComponent(renderedBuffer) || utils.isText(renderedBuffer))) {
        throw Error("Not valid node in buffer");
    }

    return renderedBuffer;
}

module.exports = handleBuffers;

},{"./utils":14}],8:[function(require,module,exports){
const ComposeApplication = require("./ComposeApplication");
const createComponent = require("./create-component");
const render = require("./render");

module.exports = {
    application: ComposeApplication,
    component: createComponent
};

},{"./ComposeApplication":2,"./create-component":5,"./render":13}],9:[function(require,module,exports){
'use strict';

var OneVersionConstraint = require('individual/one-version');

var MY_VERSION = '7';
OneVersionConstraint('ev-store', MY_VERSION);

var hashKey = '__EV_STORE_KEY@' + MY_VERSION;

module.exports = EvStore;

function EvStore(elem) {
    var hash = elem[hashKey];

    if (!hash) {
        hash = elem[hashKey] = {};
    }

    return hash;
}

},{"individual/one-version":11}],10:[function(require,module,exports){
(function (global){
'use strict';

/*global window, global*/

var root = typeof window !== 'undefined' ?
    window : typeof global !== 'undefined' ?
    global : {};

module.exports = Individual;

function Individual(key, value) {
    if (key in root) {
        return root[key];
    }

    root[key] = value;

    return value;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
'use strict';

var Individual = require('./index.js');

module.exports = OneVersion;

function OneVersion(moduleName, version, defaultValue) {
    var key = '__INDIVIDUAL_ONE_VERSION_' + moduleName;
    var enforceKey = key + '_ENFORCE_SINGLETON';

    var versionValue = Individual(enforceKey, version);

    if (versionValue !== version) {
        throw new Error('Can only have one copy of ' +
            moduleName + '.\n' +
            'You already have version ' + versionValue +
            ' installed.\n' +
            'This means you cannot install version ' + version);
    }

    return Individual(key, defaultValue);
}

},{"./index.js":10}],12:[function(require,module,exports){
const EventPropertyHook = require("./EventPropertyHook");

/**
 * Properties Parser
 * @description Parses properties and understand which kind of property is and what should do in the Component.
 * @return {Object} a properties object to assign to the Component.
 */
function propertiesParser(properties) {
    let result = {};

    for (let propName in properties) {
        const propValue = properties[propName];

        switch (typeof propValue) {
        case "undefined":
            // TODO should remove prop
            console.log("prop should be removed");
            break;
        case "function":
            // TODO: Perform this better.
            result[propName.toLowerCase()] = propValue;
            break;
        case "object":
            if (propValue instanceof Object && !(propValue instanceof Array)) {
                if (propName === "style") result[propName] = parseStyleProperty(propValue);
            } else if (propValue instanceof Array) {
                result[propName] = propValue.join(" ");
            }
            break;
        case "string":
            result[propName] = propValue;
            break;
        }
    }

    return result;
}

function parseStyleProperty(styleProperties) {
    let style = [];

    for (let key in styleProperties) {
        let styleKey = getStyleDOMKey(key);

        style.push(`${styleKey}:${styleProperties[key]};`);
    }

    return style.join(" ");
}

function getStyleDOMKey(key) {
    const styleKey = {
        backgroundColor: "background-color",

        flexDirection: "flex-direction",

        marginBottom: "margin-bottom",
        marginLeft: "margin-left",
        marginRight: "margin-right",
        marginTop: "margin-top",

        paddingBottom: "padding-bottom",
        paddingLeft: "padding-left",
        paddingRight: "padding-right",
        paddingTop: "padding-top"
    };

    return styleKey[key] || key;
}

module.exports = propertiesParser;

},{"./EventPropertyHook":3}],13:[function(require,module,exports){
// TODO: Add docs
// TODO This will be part of the .application method.
// element should be a Component or Text.
const EventPropertyHook = require("./EventPropertyHook");
const propertiesParser = require("./properties-parser");
const utils = require("./utils");
const handleBuffers = require("./handle-buffers");

function render(element, context, errorHandler) {
    let doc = context || document;

    if (typeof element === "function") {
        element = element();
    }

    //element = handleBuffers(element).a;

    if (utils.isText(element)) {
        return doc.createTextNode(element.text);
    } else if (!utils.isComponent(element)) {
        if (errorHandler) {
            errorHandler("Element not valid: ", element);
        }

        return null;
    }

    let node = doc.createElement(element.tagName);
    let props = element.properties;

    // Add properties to the node.
    for (let propName in props) {
        const propValue = props[propName];

        if (propValue === undefined) {
            // TODO: check this! Should be safer
            node[propName] = undefined;
        } else if (propValue instanceof EventPropertyHook && propValue.attach) {
            node[propName] = undefined;
            propValue.attach(node, propName);
        } else {
            node[propName] = props[propName];
        }
    }

    let children = element.children;

    for (let index = 0; index < children.length; index++) {
        let childNode = render(children[index], context, errorHandler);

        if (childNode) {
            node.appendChild(childNode);
        }
    }

    return node;
}

module.exports = render;

},{"./EventPropertyHook":3,"./handle-buffers":7,"./properties-parser":12,"./utils":14}],14:[function(require,module,exports){
// TODO: Add docs
const Component = require("./Component");
const Text = require("./Text");

function isBuffer(element) {
    return element && element.type === "Buffer";
}

function isChild(element) {
    return isComponent(element) || isText(element) || (typeof element === "function" && isChild(element()));
}

function isChildren(elements) {
    return typeof elements === "string" || Array.isArray(elements) || isChild(elements);
}

function isComponent(element) {
    return element.type === "Component";
}

function isText(element) {
    return element.type === "Text";
}

module.exports = {
    isBuffer: isBuffer,
    isChild: isChild,
    isChildren: isChildren,
    isComponent: isComponent,
    isText: isText
};

},{"./Component":1,"./Text":4}],15:[function(require,module,exports){
const Compose = require("../core");

function Header() {
    return Compose.component("div", {
        className: "header",
        style: {
            backgroundColor: "blue",
            color: "yellow",
            paddingLeft: "10px"
        }
    }, Title);
}

function Title() {
    return Compose.component("h1", "CMPS");
}

module.exports = Header;

},{"../core":8}],16:[function(require,module,exports){
// TODO: Handle a tree for the Virtual DOM
// TODO: Add logic to push Virtual DOM tree into the real DOM
// TODO: Add logic to patch the DOM with the Virtual DOM
// TODO: Add support to functions and object-like properties.

const Compose = require("../core");
const Header = require("./Header");

// A semi functional state, just for testing
let numberOfButtons = 0;

// A higher-order component
function withIndex(component) {
    numberOfButtons++;

    return component(numberOfButtons);
}

function log() {
    console.log("My button is clicked");
}

// A custom button component
function button (state) {
    count = state || "";

    return Compose.component("button", {
        className: "my-button-class",
        id: "test",
        onclick: () => {
            log();
        }
    }, ["My Button Component", count]);
}

// A Compose framework demo Component
function ComposeDemo() {
    return Compose.component("div", {
        className: "my-div"
    }, [
        Header(),
        "This is a Compose Demo: ",
        button(),
        Compose.component("button", "I Love Compose")
    ]);
}

const MyProgram = Compose.application(ComposeDemo, document.getElementById("root"));

/*
Compose.application = function (rootComponent, DOMNode, options);
rootComponent: Layout component or routes,
DOMNode: Element where the app will be rendered.
options: Object

   const MyProgram = Compose.application(MyComponent, document.getElementById("root"), {
       update:
   });
*/

},{"../core":8,"./Header":15}]},{},[16]);
