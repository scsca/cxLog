function cxNode(e, g) {
    if (e === null)
        return false;
    this.id = e.ID;
    this.name = e.Name;
    this.encdps = e.DPS;
    this.type = e.Type;
    this.updated = new Date();

    //parent cxGraph
    this.graph = g;

    this.color = function () {
        return (this.type === 0) ? 'rgba(0,0,255,0.4)' : 'red';
    };
    //draw node
    this.draw = function () {
        this.group = this.graph.gnode.append("g");
        this.group.attr("type", "node");
        this.node = this.group.append("circle")
        	.attr("class", (this.type == 0) ? "ally" : "enemy")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 17);
        //.attr("fill", this.color());
        this.label = this.graph.glabel.append("text")
            .attr("class", "label node")
            .attr("text-anchor", "middle")
            .attr("dy", 5)
            .attr("fill", 'white')
            .attr("font-family", "Meiryo")
            .attr("type", "node")
            .text(this.name);
    };
    this.draw();
}

function cxEdge(s, a, g) {
    this.graph = g;
    this.source = this.graph.hasNode(s);
    this.target = this.graph.hasNode(a.target);
    this.name = a.name;
    this.damage = a.damage;
    this.time = createDate(a.time);

    this.color = (this.source.type === 0) ? 'blue' : 'red';

    //draw edge

    this.draw = function () {
        this.group = this.graph.gedge.append("g");
        this.group.attr("type", "edge");
        this.edge = this.group.append("line")
        	.attr("class", this.source.type == 0 ? "ally" : "enemy")
            .attr("x1", this.source.node.attr("cx"))
            .attr("y1", this.source.node.attr("cy"))
            .attr("x2", this.target.node.attr("cx"))
            .attr("y2", this.target.node.attr("cy"));

        this.label = this.graph.glabel.append("text")
            .attr("class", "label edge")
            .attr("text-anchor", "middle")
            .attr("x", (parseFloat(this.edge.attr("x1")) + parseFloat(this.edge.attr("x2") * 0.2)))
            .attr("y", (parseFloat(this.edge.attr("y1")) + parseFloat(this.edge.attr("y2") * 0.2)))
            .attr("fill", 'white')
            .attr("font-family", "Meiryo")
            .attr("type", "edge")
            .text(this.name + "|" + this.damage);
    };

    this.timeout = function () {
        this.group.transition()
        .delay(800)
        .style("opacity", 0)
        .duration(500)
        .remove();
        this.label.transition().delay(800).style("opacity", 0).duration(500).remove();
    };

    this.draw();
    this.timeout();    
}

function cxGraph(container, w, h) {
    this.ready = false;
    //grab container
    this.container = d3.select("#" + container);
    //style
    this.width = w || parseInt(this.container.style("width"), 10);
    this.height = h || parseInt(this.container.style("height"), 10);
    this.container.style({
        'width': this.width + "px",
        'height': this.height + "px"
    });

    //create svg
    this.svg = this.container.append("svg")
    .attr("width", this.width)
    .attr("height", this.height)
    .append("g").attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

    this.gedge = this.svg.append("g");
    this.gedge.attr("type", "edges");

    this.gnode = this.svg.append("g");
    this.gnode.attr("type", "nodes");

    this.glabel = this.svg.append("g");
    this.glabel.attr("type", "labels");

    //node array
    this.nodes = [];

    //add node
    this.drawNode = function (n) {
        if ((f = this.hasNode(n.ID)) !== null) {
            f.type = n.Type;
            f.name = n.Name;
            f.encdps = n.DPS;
            f.node.attr("fill", f.color());
            f.updated = new Date();
            return;
        }
        var tmp = new cxNode(n, this);
        this.nodes.push(tmp); // add to cxGraph.nodes
        //this.layout();
    };

    //add edge
    this.drawEdge = function (s, a) {
        var tmp = new cxEdge(s, a, this);
    };

    //anything after node + edge creation
    this.update = function () {
        this.cleanup(10000); // 10 sec timeout on nodes
        this.layout();
    };

    this.layout = function () {
        for (i = 0; i < this.nodes.length; i++) {
            var pos = this.getPos(i);
            this.nodes[i].node.attr("cx", pos.x);
            this.nodes[i].label.attr("x", pos.x);
            this.nodes[i].node.attr("cy", pos.y);
            this.nodes[i].label.attr("y", pos.y);
        }
    };

    this.getPos = function (i) {
        var node = this.nodes[i];
        var rad = (node.type === 0) ? this.width / 2 - 30 : this.width / 3 - 25;
        var type = this.sameType(node.type);
        ang = 180 / (type.length + 1);
        angle = (node.type === 0) ? (180 + ang * (type.indexOf(node) + 1)) : ang * (type.indexOf(node) + 1);

        tmp = { "x": rad * Math.cos(angle * Math.PI / 180), "y": rad * -Math.sin(angle * Math.PI / 180) };
        return tmp;
    };

    this.drawLabel = function (e, a) {
        if ((f = this.hasNode(a.target)) !== null) {
            this.glabel.append("text")
                .attr("type", "fixed")
                .attr("class", "small")
            	.attr("text-anchor", "middle")
                .attr("x", f.node.attr("cx"))
                .attr("y", f.node.attr("cy"))
                .attr("dx", 15)
                .attr("dy", 15)
                .attr("fill", 'white')
                .attr("font-family", "Meiryo")
                .text("+" + a.name)
            	.transition()
                .style("opacity", 0)
                .duration(1200)
                .remove();
        }
    };

    //find node
    this.hasNode = function (id) {
        var tmp = this.nodes.filter(function (n) {
            return n.id == id;
        });
        return (tmp.length === 0) ? null : tmp[0];
    };

    this.sameType = function (type) {
        return this.nodes.filter(function (n) {
            return n.type == type;
        });
    };

    this.cleanup = function (t) {
        var ts = new Date();
        for (var n in this.nodes) {
            var node = this.nodes[n];
            if (ts - node.updated > t) {
                this.nodes.splice(n, 1);
                node.label.remove();
                node.group.remove();
            }
        }
    };

    this.clear = function () {
        this.svg.selectAll("g").remove();
        this.nodes = [];
    };

    this.labelFix = function () {
        var svg = this.svg;
        while (this.collisions("text", "node")) {
            svg.selectAll("text").each(function (d, i) {
                if (d3.select(this).attr("type") == "node" || d3.select(this).attr("type") == "fixed")
                    return;
                var that = this;
                svg.selectAll("text").each(function (d, i) {
                    if (this != that) {
                        if (d3.select(this).attr("type") == "node" || d3.select(this).attr("type") == "fixed")
                            return;
                        if (collide(this, that)) {
                            var a = d3.select(that);
                            var b = d3.select(this);
                            if (a.attr("x") == b.attr("x") && a.attr("y") == b.attr("y")) {
                                a.attr("y", parseFloat(a.attr("y")) - this.getBoundingClientRect().height);
                            } else {
                                var ar = that.getBoundingClientRect();
                                var br = this.getBoundingClientRect();
                                dx = Math.min(Math.abs(ar.left - br.right), Math.abs(ar.right - br.left)) / 2;

                                if (ar.left > br.left) {
                                    a.attr("x", parseFloat(a.attr("x")) + dx);
                                    b.attr("x", parseFloat(b.attr("x")) - dx);
                                } else {
                                    a.attr("x", parseFloat(a.attr("x")) - dx);
                                    b.attr("x", parseFloat(b.attr("x")) + dx);
                                }

                                //console.log(dx);
                                //a.attr("x", parseFloat(a.attr("x"))+dx*2);
                                //b.attr("x", parseFloat(b.attr("x"))-dx);
                            }
                        }
                    }
                });
            });
        }
    };

    this.collisions = function (t, ex) {
        var svg = this.svg;
        c = false;
        svg.selectAll(t).each(function (d, i) {
            if (d3.select(this).attr("type") == ex || d3.select(this).attr("type") == "fixed")
                return;
            var that = this;
            svg.selectAll(t).each(function (d, i) {
                if (this != that) {
                    if (d3.select(this).attr("type") == ex || d3.select(this).attr("type") == "fixed")
                        return;
                    a = d3.select(that);
                    b = d3.select(this);
                    if (a.attr("x") == b.attr("x") && a.attr("y") == b.attr("y"))
                        c = true;
                }
            });
        });
        return c;
    };

    this.ready = true;
}

function collide(na, nb) {
    a = na.getBoundingClientRect();
    b = nb.getBoundingClientRect();
    return ((Math.abs(a.left - b.left) * 2 < (a.width + b.width)) &&
            (Math.abs(a.top - b.top) * 2 < (a.height + b.height)));
}

function createDate(t) {
    var format = d3.time.format("%H:%M:%S.%L");
    now = new Date();
    date = format.parse(t);
    date.setDate(now.getDate());
    date.setMonth(now.getMonth());
    date.setFullYear(now.getFullYear());
    return date;
}