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
}

function animateTraversal(traversal,i, g) {
    var framesPerSecond = 4; 
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
                if(!traversal.includes(i) && isNeighbour(graph, i, selectedNode))
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