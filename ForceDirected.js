var canvas = document.getElementById('canvas'),
context = canvas.getContext('2d');
context.translate(0.5, 0.5);
window.addEventListener('resize', resizeCanvas, false);
canvas.addEventListener('mousedown',drag_node,false);
canvas.addEventListener('mouseup',drop_node,false);
canvas.addEventListener('mousemove',move_node,false);

var lastX=canvas.width/2, lastY=canvas.height/2;
trackTransforms(context);
var drawGrid = function(ctx, w, h, step) {
    var p1 = context.transformedPoint(0,0);
    var p2 = context.transformedPoint(canvas.width,canvas.height);
    context.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);
    ctx.beginPath(); 
    for (var x=p1.x;x<=p2.x;x+=step) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
    }
    ctx.strokeStyle = 'rgb(255,0,0)';
    ctx.lineWidth = 0.1;
    ctx.stroke(); 
    ctx.beginPath(); 
    for (var y=p1.y;y<=p2.y;y+=step) {
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
    }
    ctx.strokeStyle = 'rgb(20,20,20)';
    ctx.lineWidth = 0.1;
    ctx.stroke(); 
};


var add_node_flag = false;
var add_edge_flag = false;
var remove_flag = false;
var selection_mode = true;
var selected_node = -1;
var selected_edge = -1;
var scaleMultiplier = 0.2;
var scaleFactor = 1.1;
var drag = false;
var nodeRadius = 10;
var g = new Graph();
var minDistance = 100;
var adj = [];
var handleScroll = function(evt){
    lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
    lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
    var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
    if (delta) zoom(delta);
    return evt.preventDefault() && false;
};
canvas.addEventListener('DOMMouseScroll',handleScroll,false);
canvas.addEventListener('mousewheel',handleScroll,false);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight*0.7;
function Graph()
{
    this.nodes = [];
    this.edges = [];
}
Graph.prototype.addEdge = function(edge)
{
    this.edges.push(edge);
}
Graph.prototype.addNode = function(node)
{
    this.nodes.push(node);
}
Graph.prototype.ticked = function ticked()
{
    clear();
    context = canvas.getContext('2d');
    //Get Node positions
    this.edges.forEach(edge => {
        context.beginPath();
        context.moveTo(edge.source.x, edge.source.y);
        context.lineTo( edge.target.x, edge.target.y);
        context.lineWidth = 3;

        context.strokeStyle ="#000";
        if(edge.selected)
            context.strokeStyle ="#0d6efd";
        context.stroke();
    });

    //Draw Node
    
    this.nodes.forEach(node => {
        context.beginPath();
        context.fillStyle="#000";
        if(node.selected)
            context.fillStyle="#0d6efd";
        context.arc(node.x,node.y,nodeRadius,0,Math.PI*2,true);
        context.closePath();
        context.fill();
    }); 
}
var simulation;

Graph.prototype.draw = function() {
    //Clear Canvas   
    var maxDistance = document.getElementById('strength').value;
    var distance = document.getElementById('length').value;
    var scaledPos = context.transformedPoint(canvas.width,canvas.height);
    simulation = d3.forceSimulation(this.nodes)    
    
    .force("charge", d3.forceManyBody().strength(-(maxDistance)))
    .force("center", d3.forceCenter(canvas.width/ 2, canvas.height / 2))
    .force("collide", d3.forceCollide(nodeRadius).strength(0.2))
    .force('y', d3.forceY().y(function(d) {
        return 0;
    }))
    .on("tick", () => this.ticked());
    simulation.force('link', d3.forceLink().links(this.edges).distance(distance));
};
function Edge(source, target)
{
    this.source = source; 
    this.target = target;
}

function Node(id, label,pos)
{
    this.id = id;
    this.label = label;
    this.selected = false;
}
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight*0.7;
    trackTransforms(context);
    g.ticked(); 
}
resizeCanvas();
function new_graph()
{
    simulation.stop();
    g.nodes= [];
    g.edges = [];
    clear();
    clearSelection();
}
function zoom(delta)
{
    var pt = context.transformedPoint(lastX,lastY);
    context.translate(pt.x,pt.y);
    var factor = Math.pow(scaleFactor,delta);
    context.scale(factor,factor);
    context.translate(-pt.x,-pt.y);

    g.ticked();
}
function clear()
{
    var p1 = context.transformedPoint(0,0);
    var p2 = context.transformedPoint(canvas.width,canvas.height);
    context.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);
}
function clearSelection (selected)
{
    selected_node = -1;
    g.nodes.forEach( function (element, i) {
        if(element.id != selected)
            element.selected = false;
    });
}
function mode_change(mode)
{
    switch(mode)
    {
        case 0:
            document.getElementById("modeLabel").innerText = "Seçim Modu";
            selection_mode = true; 
            add_node_flag = false; 
            add_edge_flag = false; 
            remove_flag = false; 
            break;
        case 1:
            document.getElementById("modeLabel").innerText = "Node Ekleme Modu";
            selection_mode = false; 
            add_node_flag = true; 
            add_edge_flag = false; 
            remove_flag = false; 
            break;
        case 2:
            document.getElementById("modeLabel").innerText = "Kenar Ekleme Modu";
            selection_mode = false; 
            add_node_flag = false; 
            add_edge_flag = true; 
            remove_flag = false; 
            break;
        case 3:
            document.getElementById("modeLabel").innerText = "Silme Modu";
            selection_mode = false; 
            add_node_flag = false; 
            add_edge_flag = false; 
            remove_flag = true;  
            break;
    }
}

var dragStart = context.transformedPoint(lastX,lastY);
var last_id = 0;
function drag_node(event)
{

    drag = true;
    /* if(simulation)
        simulation.stop(); */

    lastX = event.offsetX || (event.pageX - canvas.offsetLeft);
    lastY = event.offsetY || (event.pageY - canvas.offsetTop);
    scaledPos = context.transformedPoint(lastX,lastY); 
    dragStart = context.transformedPoint(lastX,lastY); 

    var temp_selected_node = -1;
    var temp_selected_edge = -1;

    g.nodes.forEach( function (element, i) {
        if(( (element.x-nodeRadius) < scaledPos.x  && scaledPos.x < (element.x + nodeRadius) 
            && (element.y-nodeRadius) < scaledPos.y && scaledPos.y < (element.y + nodeRadius))  && !element.selected)
        {
            temp_selected_node = i;
            element.selected = true;  
        }    
    });

    if(remove_flag)
    {
        g.edges.forEach( function (element, i) {

            context.beginPath();
            context.moveTo(element.source.x, element.source.y);
            context.lineTo( element.target.x, element.target.y);
            context.lineWidth = 10;
            context.strokeStyle = 'rgba(0,0,0,1.0)';
            context.stroke();
    
            if(  context.isPointInStroke(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop) ) 
            {
                element.selected=true;
                temp_selected_edge = i;
            }
            else
            {
                element.selected=false;
            }
        });
    }

    if(selection_mode)
    {
        clearSelection(temp_selected_node);
        selected_node = temp_selected_node;
    }
    else if(add_edge_flag)
    {
        if(selected_node != -1 && temp_selected_node != -1)
        {
            var e = (new Edge(g.nodes[selected_node],g.nodes[temp_selected_node]));
            g.addEdge(e);
            if(simulation)
            {
                simulation
                .nodes(g.nodes)
                .force("link").links(g.edges);
                simulation.alphaTarget(0.3).restart();
            }          
            clearSelection(-1);
        }
        else if(temp_selected_node != -1)
        {
            clearSelection(temp_selected_node);
            selected_node = temp_selected_node;
        }
    }
    else if(add_node_flag )
    {
        var n = (new Node(last_id,last_id));
        g.addNode(n);
        last_id++;
        if(simulation)
        {
            simulation
            .nodes(g.nodes);

            simulation.alphaTarget(0.3).restart();
        }
       
        n.x = scaledPos.x;
        n.y = scaledPos.y;
    }
    else if(remove_flag)
    {
        if(temp_selected_node != -1)
        {
            for(i=g.edges.length-1;i>=0;i--)
            { 
                if(g.edges[i].source.index == g.nodes[temp_selected_node].index || g.edges[i].target.index == g.nodes[temp_selected_node].index )
                {
                    g.edges.splice(i,1);
                }
            }
            g.nodes.splice(temp_selected_node,1);
        }
        else if(temp_selected_edge != -1)
        {
            g.edges.splice(temp_selected_edge,1);
        }
        if(simulation)
            {
                simulation
                .nodes(g.nodes)
                .force("link").links(g.edges);
                simulation.alphaTarget(0.3).restart();
            }          
            clearSelection(-1);
    }
    else
    {       
       console.log("Nothing");
    }
    g.ticked();
}
function drop_node(event)
{
    lastX = event.offsetX || (event.pageX - canvas.offsetLeft);
    lastY = event.offsetY || (event.pageY - canvas.offsetTop);
    drag = false;
    
}
function move_node(event)
{
    
    lastX = event.offsetX || (event.pageX - canvas.offsetLeft);
    lastY = event.offsetY || (event.pageY - canvas.offsetTop);
    scaledPos = context.transformedPoint(lastX,lastY); 
    if(simulation!=null)
        simulation.alphaTarget(0).restart();
    if(drag)
    {
        
        if(selected_node != -1)
        {
            g.nodes[selected_node].x = scaledPos.x;
            g.nodes[selected_node].y = scaledPos.y;
            g.ticked();
        }
        else
        {
            var pt = context.transformedPoint(lastX,lastY);
            context.translate(pt.x-dragStart.x,pt.y-dragStart.y);
        }
    }
    
}



    
    
function updateMatrix()
{
    adj = [];

    
    for(i=0;i<g.nodes.length;i++)
    {
        temp = []; 
        for(j=0;j<g.nodes.length;j++)
            temp[j] = "0";
        adj.push(temp);
    }

    g.edges.forEach(element =>{
        console.log(element.source.index);
        adj[element.source.index][element.target.index] = "1";
        adj[element.target.index][element.source.index] = "1";
    });
    console.log(adj);
    var data = document.getElementById('adjancency_matrix');
    data.value = "";
    for(i=0;i<adj.length;i++)
    {
        for(j=0;j<adj.length;j++)
        {
            data.value += adj[i][j];
            data.value += (j != g.nodes.length) ? ",":"";
        }
        
        data.value += "\n";
    }
        

}
function loadMatrix()
{
    g = new Graph();
    for(i =0; i < adj.length;i++)
        g.addNode(new Node(i,i));
    last_id = adj.length;
    for(i =0; i < adj.length;i++)
    {
        for( j=i; j<adj.length; j++)
            if(adj[i][j])
                g.addEdge(new Edge(i,j));
    }
    g.draw();
}
var parse_matrix = function parse_matrix()
{
    var data = document.getElementById('adjancency_matrix');
    var lines = data.value.replace(/\r\n/g,"\n").split("\n");
    adj = [];
    lines.forEach(line => {
        var cells = line.split(',');
        if(cells != "" && cells.length > 0)
        {
            var cell_array = [];
            for(var i=0; i<cells.length;i++) 
            {
                if(!isNaN(parseFloat(cells[i])))
                    cell_array[i] = + parseFloat(cells[i]);
            }
            if(cell_array.length>0)
                adj.push(cell_array);
        }
        
    })
    if(adj.length == 0 || adj[0].length != adj.length || adj[0].length < 2)
    {
        $('#error').html("<strong>Hata</strong>: Satır ve sütun sayısı eşit olmalıdır!");
        $('#error').show();
    }
    else
    {
        $('#error').hide();
        loadMatrix();
    }
}

function trackTransforms(context){
    var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
    var xform = svg.createSVGMatrix();
    context.getTransform = function(){ return xform; };
    
    var savedTransforms = [];
    var save = context.save;
    context.save = function(){
        savedTransforms.push(xform.translate(0,0));
        return save.call(context);
    };
    var restore = context.restore;
    context.restore = function(){
        xform = savedTransforms.pop();
        return restore.call(context);
    };

    var scale = context.scale;
    context.scale = function(sx,sy){
        xform = xform.scaleNonUniform(sx,sy);
        return scale.call(context,sx,sy);
    };
    var rotate = context.rotate;
    context.rotate = function(radians){
        xform = xform.rotate(radians*180/Math.PI);
        return rotate.call(context,radians);
    };
    var translate = context.translate;
    context.translate = function(dx,dy){
        xform = xform.translate(dx,dy);
        return translate.call(context,dx,dy);
    };
    var transform = context.transform;
    context.transform = function(a,b,c,d,e,f){
        var m2 = svg.createSVGMatrix();
        m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
        xform = xform.multiply(m2);
        return transform.call(context,a,b,c,d,e,f);
    };
    var setTransform = context.setTransform;
    context.setTransform = function(a,b,c,d,e,f){
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;
        return setTransform.call(context,a,b,c,d,e,f);
    };
    var pt  = svg.createSVGPoint();
    context.transformedPoint = function(x,y){
        pt.x=x; pt.y=y;
        return pt.matrixTransform(xform.inverse());
    }
}
function redraw()
{
    updateMatrix();
    new_graph();
    parse_matrix();

}
parse_matrix();




