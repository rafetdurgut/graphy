function performAlgorithm(algo, graph, selectedNode)
{
    if(algo == "DFS")
    {
        var traversal = DFS(graph, selectedNode);
        animateTraversal(traversal,0,graph);
        return "DFS Dolaşım Sonucu: "+ traversal.toString();

    }else if(algo == "BFS")
    {
        var traversal = BFS(graph, selectedNode);
        animateTraversal(traversal,0,graph);
        return "BFS Dolaşım Sonucu: "+ traversal.toString();
    }
    else if(algo == "GraphColoring")
    {
        var colors = ["red","green","blue","yellow","black"];
        var chromNumber = GraphColoring(graph, colors);
        return "Kromatik Sayı: "+ chromNumber;
    }
    else if(algo == "GraphParameters")
    {
        var cc = ConnectedComponent(graph,selectedNode);
        alert(cc);
    }
    
}

function animateTraversal(traversal,i, g) {
    var framesPerSecond = 1; 
    setTimeout(function() {
        if(i!=traversal.length-1)
        {
            requestAnimationFrame(function() { animateTraversal(traversal,i+1, g)});
        }
        else
        {
            setTimeout(function()
            {
                algorithmEnd();
            },5000);
        }

        g.nodes[traversal[i]].selected = true;
        g.ticked();
    }, 1000 / framesPerSecond);
}
function isNeighbour(g, s, t)
{
    for( var  i=0; i <g.edges.length; i++)
        if(  (  (g.edges[i].source.id == s && g.edges[i].target.id == t )  || ( !g.directed && (g.edges[i].source.id ==t && g.edges[i].target.id == s ) ) )) 
            return true;
        
    return false;
}
function getDFSseq(graph, traversal, selectedNode)
{
    traversal.push(selectedNode);

    for(var i=0; i<graph.nodes.length; i++)
        if( !traversal.includes(i) && isNeighbour(graph, selectedNode, i ))
            getDFSseq(graph, traversal, i);
}
var DFS = function(graph,  selectedNode)
{
    var traversal = [];
    while(traversal.length < graph.nodes.length)
    {
        getDFSseq(graph, traversal, selectedNode);
        if(traversal.length != graph.nodes.length)
            for(var i=0;i<graph.nodes.length;i++)
                if(!traversal.includes(i))
                {
                    selectedNode = i;
                    break;
                }
    }
    return traversal;
}
var BFS = function(graph,  selectedNode)
{
    var traversal = [];
    var queue = [selectedNode];
    while(traversal.length < graph.nodes.length)
    {
        while(queue.length >0)
        {
            selectedNode = queue.pop();
            traversal.push(selectedNode);
            for(var i=0; i<graph.nodes.length;i++)
                if(!traversal.includes(i) && isNeighbour(graph, selectedNode, i ))
                    queue.unshift(i);
        }
        if(traversal.length != graph.nodes.length)
            for(var i=0;i<graph.nodes.length;i++)
                if(!traversal.includes(i))
                {
                    queue.unshift(i);
                    break;
                }
    }
    return traversal;
}
var getNextNode = function(graph, visited)
{
    for(v in graph.nodes)
        if(!visited.includes(v))
            return v;

    return -1;
}
function coloringOk(graph)
{
    for(e in graph.edges)
        if( (graph.edges[e].source.color != null && graph.edges[e].target.color != null) && (graph.edges[e].source.color == graph.edges[e].target.color) )
            return false;
    return true;
}
var backtrack = function(graph, visited, colors)
{
    if(visited.length == graph.nodes.length)
        return graph;
    
    var nextNode = getNextNode(graph, visited);

    for( c in colors)
    {
        copy_visited = visited.map( (x) => x);
        copy_visited.push(nextNode);

        copy_graph = $.extend(true, {}, graph);
        copy_graph.nodes[nextNode].color = colors[c];

        if(coloringOk (copy_graph))
        {
            result = backtrack(copy_graph, copy_visited, colors);
            if(result != null)
                return result;
        }
    }
    return null;
}
var ConnectedComponent = function(graph,  selectedNode)
{
    var diameter = -1;
    var cc = 0;
    var traversal = [];
    var traversSize = 0;
    while(traversal.length < graph.nodes.length)
    {
        cc ++;
        getDFSseq(graph, traversal, selectedNode);
        if ( (traversal.length - traversSize) > diameter) 
            diameter = traversal.length - traversSize;
        traversSize = traversal.length;
        if(traversal.length != graph.nodes.length)
            for(var i=0;i<graph.nodes.length;i++)
                if(!traversal.includes(i))
                {
                    selectedNode = i;
                    break;
                }
    }
    alert("diameter: "+ diameter);
    return cc;

}
var GraphColoring = function(graph, colors)
{
    var visited = [];

    var result = backtrack(graph, visited, colors);

    var usedColors = [];
    for(v in graph.nodes)
    {
        if(!usedColors.includes(graph.nodes[v].color))
            usedColors.push(graph.nodes[v].color);
    }
    return usedColors.length;
}