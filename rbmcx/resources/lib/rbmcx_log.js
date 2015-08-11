var cx;
r(function () {
    cx = new cxGraph('graph');
    document.addEventListener("onOverlayDataUpdate", function (e) {
        update(e.detail);
    });
});
function r(f) { /in/.test(document.readyState) ? setTimeout('r(' + f + ')', 9) : f() }

function update(data) {
    if (data == "[]" || !cx.ready)
        return;
    data = JSON.parse(data);
    displayEntities(data);
    cx.update()
    displayEdges(data);
    cx.labelFix();

}
function displayEntities(data) {
    for (var i in data) {
        var e = data[i];
        debug("creating node:" + e.ID);
        cx.drawNode(e);
    }
}
function displayEdges(data) {
    for (var i in data) {
        createEdges(data[i]);
    }
}
function createEdges(e) {
    if (typeof e.ActionBuffer[0] == 'undefined')
        return;
    for (var i in e.ActionBuffer) {
        var a = e.ActionBuffer[i];
        if (a.target == e.ID) {

        } else {
            cx.drawEdge(e.ID, a);
        }
        
    }
}
function debug(m) {
    d3.select("#debug").html(":"+m)
}