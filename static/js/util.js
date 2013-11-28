function getQuery() {
    var query = {};
    if (!window.location.search || window.location.search[0] != '?') {
        return query;
    }
    window.location.search.substring(1).split('&').forEach(function (parameter) {
        var parts = parameter.split('=');
        if (parts.length < 2) {
            query[decodeURIComponent(parameter)] = true;
        } else {
            query[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
        }
    });
    return query;
}

function makeQuery(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

function reach (obj, chain) {
    var path = chain.split('.');
    var ref = obj;
    for (var i = 0, il = path.length; i < il; ++i) {
        if (ref) {
            ref = ref[path[i]];
        }
    }
    return ref;
}

function propCmp(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function multiPropCmp() {
    var props = arguments;
    return function (a,b) {
        for (var i = 0, result = 0, numberOfProperties = props.length; i < numberOfProperties; i++) {
            result = propCmp(props[i])(a, b);
            if (result) {
                break;
            }
        }
        return result;
    }
}
