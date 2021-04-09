function performAlgorithm(algo, graph, selectedNode)
{
    if(algo == "DFS")
    {
        var traversal = DFS(graph, selectedNode);
        animateTraversal(traversal,0,graph);
        return "Dolaşım Sonucu: "+ traversal.toString();
    }
}

function animateTraversal(traversal,i, g) {
    var framesPerSecond = 4; 
    setTimeout(function() {
        if(i!=traversal.length-1)
            requestAnimationFrame(function() { animateTraversal(traversal,i+1, g)});
        g.nodes[traversal[i]].selected = true;
        g.ticked();


    }, 1000 / framesPerSecond);
}
function isNeighbour(g, x, y)
{
    for( var  i=0; i <g.edges.length; i++)
        if(  (  (g.edges[i].source.id == x && g.edges[i].target.id == y )  || (g.edges[i].source.id ==y && g.edges[i].target.id == x ) ) ) 
            return true;
        
    return false;
}
function getDFSseq(graph, traversal, selectedNode)
{
    traversal.push(selectedNode);

    for(var i=0; i<graph.nodes.length; i++)
        if( !traversal.includes(i) && isNeighbour(graph, i, selectedNode))
            getDFSseq(graph, traversal, i);
}
var DFS = function(graph,  selectedNode)
{
    console.log(graph);
    var traversal = [];
    while(traversal.length < graph.nodes.length)
    {
        console.log(selectedNode);
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