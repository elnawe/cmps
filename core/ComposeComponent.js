const Component = require("./Component");
const errors = require("./errors");
const Text = require("./Text");
const utils = require("./utils");

function ComposeComponent(tagName, properties, children) {
    let childNodes = [];
    let tag, props, key, namespace;

    // If second parameter is children instead of prop.
    if (!children && utils.isChildren(properties)) {
        children = properties;
        props = {};
    }

    props = parseProperties(props || properties || {});
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
    case "undefined":
        return;
    case "string":
        return new Text(child);
    case "number":
        return new Text(child);
    case "function":
        if (utils.isChild(child())) return child();
    case "object":
        if (utils.isChild(child)) return child;
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

/**
 * @function parseProperties
 * @description Parses properties and understand which kind of property is and what should do in the Component.
 * @return {Object} a properties object to assign to the Component.
 */
function parseProperties(properties) {
    let result = {};

    for (let propName in properties) {
        const propValue = properties[propName];

        switch (typeof propValue) {
        case "function":
            result[propName.toLowerCase()] = propValue;
        case "object":
            if (propValue instanceof Object && !Array.isArray(propValue)) {
                result[propName] = propValue;
            } else if (Array.isArray(propValue)) {
                result[propName] = propValue.join(" ");
            }
            break;
        default:
            result[propName] = propValue;
        }
    }

    return result;
}

module.exports = ComposeComponent;
