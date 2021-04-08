
var pathGraph = function(n)
{
    var g = new Graph();
    for(i=0;i<n;i++)
    {
        var node = new Node(i,i);
        g.addNode(node);
    }

    for(i=0;i<n-1;i++)
    {
        g.addEdge(new Edge(g.nodes[i],g.nodes[i+1]));
    }
    return g;
}

var cycleGraph = function(n)
{
    var g = pathGraph(n);
    g.addEdge(new Edge(g.nodes[0], g.nodes[g.nodes.length-1]));
    return g;
}

var completeGraph = function(n)
{
    var g = new Graph();
    for(i=0;i<n;i++)
    {
        var node = new Node(i,i);
        g.addNode(node);
    }

    for(i=0;i<n-1;i++)
        for(j=i+1;j<n;j++)
            g.addEdge(new Edge(g.nodes[i],g.nodes[j]));

    return g;
}

var wheelGraph = function(n)
{
    var g = cycleGraph(n);
    g.addNode( new Node(n,n) );

    for(i=0;i<n;i++)
    {
        g.addEdge(new Edge(g.nodes[i], g.nodes[n]));
    }
    return g;
}
var starGraph = function(n)
{
    var g = new Graph();
    for(i=0;i<n;i++)
    {
        var node = new Node(i,i);
        g.addNode(node);
    }

    for(i=1;i<n;i++)
    {
        g.addEdge(new Edge(g.nodes[0], g.nodes[i]));
    }

    return g;
}

var friendship = function(n)
{
    var g = new Graph();
    for(i=0;i<n*2+1;i++)
    {
        var node = new Node(i,i);
        g.addNode(node);
    }

    for(i=0;i<n;i++)
    {
        g.addEdge(new Edge(g.nodes[i*2+1], g.nodes[i*2+2]));
        g.addEdge(new Edge(g.nodes[0], g.nodes[i*2+1]));
        g.addEdge(new Edge(g.nodes[0], g.nodes[i*2+2]));
    }
    return g;
}


var comet = function(n,m)
{
    var g = new Graph();
    //Path Graph
    for(var i=0;i<n;i++)
    {
        var node = new Node(i,i);
        g.addNode(node);
    }
    for(var i=0;i<n-1;i++)
    {
        g.addEdge(new Edge(g.nodes[i],g.nodes[i+1]));
    }

    //Star Graph
    for(var i=n;i<m+n;i++)
    {
        var node = new Node(i,i);
        g.addNode(node);
    }
    
    for(var i=n;i<n+m;i++)
    {
        g.addEdge(new Edge(g.nodes[n-1], g.nodes[i]));
    }
    return g;
}
function combinations(array) {
    return new Array(1 << array.length).fill().map(
      (e1, i) => array.filter((e2, j) => i & 1 << j));
  }
  
function getAllCombinations(arr, n,m)
{
    return combinations(arr).filter(a => a.length == n)
}

  
var kneserGraph = function(n,m)
{
    g = new Graph(); 
    var array=new Array(n);
    for(i=0;i<n;i++)
        array[i] = i;
    var combinations = getAllCombinations(array,m);
    for(i = 0;i<combinations.length; i++)
    {
        var node = new Node(i,i);
        g.addNode(node);
    }

    for(i=0;i<combinations.length-1; i++)
    {
        for(j=i+1;j<combinations.length;j++)
        {
            var arr = combinations[i].filter(value => combinations[j].includes(value));
            console.log(arr);
            if(arr.length==0)
            {
                g.addEdge(new Edge(g.nodes[i], g.nodes[j]));
            }
        }
    }    
    return g;
}