var canvas = document.getElementById('canvas'),
context = canvas.getContext('2d');
context.translate(0.5, 0.5);
window.addEventListener('resize', resizeCanvas, false);
canvas.addEventListener('mousedown',drag_node,false);
canvas.addEventListener('mouseup',drop_node,false);
canvas.addEventListener('mousemove',move_node,false);

var lastX=canvas.width/2, lastY=canvas.height/2;
trackTransforms(context);

var add_node_flag = false;
var add_edge_flag = false;
var remove_node_flag = false;
var remove_edge_flag = false;
var selection_mode = true;
var selected_node = -1;
var scaleMultiplier = 0.2;
var scaleFactor = 1.1;
var drag = false;
var nodeRadius = 10;
var g = new Graph();
var minDistance = 100;

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
        context.stroke();
    });

    //Draw Node
    
    this.nodes.forEach(node => {
        context.beginPath();
        context.fillStyle="#000";
        context.arc(node.x,node.y,nodeRadius,0,Math.PI*2,true);
        context.closePath();
        context.fill();
    }); 
}
var simulation;

Graph.prototype.draw = function() {
    //Clear Canvas   
    var maxDistance = document.getElementById('strength').value;
    var scaledPos = context.transformedPoint(canvas.width,canvas.height);
    simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function (d) { return d.id; }).distance(100/scaleFactor).strength(1))
      
      .force("charge", d3.forceManyBody().strength(-(200/scaleFactor)).distanceMin(minDistance/scaleFactor).distanceMax(maxDistance))
      .force("center", d3.forceCenter(scaledPos.x / 2, scaledPos.y / 2));
     
    simulation.nodes(this.nodes).on("tick", () => this.ticked());
    simulation.force("link").links(this.edges);
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
            remove_node_flag = false; 
            remove_edge_flag = false;
            break;
        case 1:
            document.getElementById("modeLabel").innerText = "Node Ekleme Modu";
            selection_mode = false; 
            add_node_flag = true; 
            add_edge_flag = false; 
            remove_node_flag = false; 
            remove_edge_flag = false;
            break;
        case 2:
            document.getElementById("modeLabel").innerText = "Kenar Ekleme Modu";
            selection_mode = false; 
            add_node_flag = false; 
            add_edge_flag = true; 
            remove_node_flag = false; 
            remove_edge_flag = false;
            break;
        case 3:
            document.getElementById("modeLabel").innerText = "Node Silme Modu";
            selection_mode = false; 
            add_node_flag = false; 
            add_edge_flag = false; 
            remove_node_flag = true; 
            remove_edge_flag = false;
            break;
        case 4:
            document.getElementById("modeLabel").innerText = "Kenar Silme Modu";
            selection_mode = false; 
            add_node_flag = false; 
            add_edge_flag = false; 
            remove_node_flag = false; 
            remove_edge_flag = true;
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
    var temp_selected = -1;
    g.nodes.forEach( function (element, i) {
        if(( (element.x-nodeRadius) < scaledPos.x  && scaledPos.x < (element.x + nodeRadius) 
            && (element.y-nodeRadius) < scaledPos.y && scaledPos.y < (element.y + nodeRadius)) )
        {
            temp_selected = i;
            element.selected = true;  
        }    
    });
    

    if(selection_mode)
    {
        clearSelection(temp_selected);
        selected_node = temp_selected;
    }
    else
    {       
        if(selected_node == -1 && temp_selected != -1 )
        {
            selected_node = temp_selected;
        }
        else if(selected_node != -1 && temp_selected != -1 && add_edge_flag)
        {
            edges.push([selected_node, temp_selected]);
            clearSelection(selected_node);
        }
        else
        {
            clearSelection(selected_node);
        }     
    }
    g.ticked();
}
function drop_node(event)
{
    lastX = event.offsetX || (event.pageX - canvas.offsetLeft);
    lastY = event.offsetY || (event.pageY - canvas.offsetTop);
    drag = false;
    if(add_node_flag)
        add_node(event);
}
function add_node(event) {
    lastX = event.offsetX || (event.pageX - canvas.offsetLeft);
    lastY = event.offsetY || (event.pageY - canvas.offsetTop);
    scaledPos = context.transformedPoint(lastX,lastY);
    if(selected_node == -1)
    {
        //console.log(g.nodes);

        var n = (new Node(last_id,last_id));
        g.addNode(n);
        last_id++;
        if(simulation)
        {
            simulation
            .nodes(g.nodes);

            simulation.alpha(0.3).restart();
        }
       
        n.x = scaledPos.x;
        n.y = scaledPos.y;
        console.log(n);
    }       
   
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



    
    

function loadMatrix()
{
    g = new Graph();
    for(i =0; i < adj.length;i++)
        g.addNode(new Node(i,i));
    last_id = adj.length;
    for(i =0; i < adj.length;i++)
    {
        for( j=0; j<adj.length; j++)
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
    console.log( adj);
    if(adj[0].length != adj.length || adj[0].length < 2)
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










