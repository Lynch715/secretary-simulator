/* 链条登记处。每条线自己一个文件，写完调 defArc 挂上来 */
var ARCS = [];
var ARCS_BY_ID = {};
function defArc(a){ ARCS.push(a); ARCS_BY_ID[a.id] = a; }
