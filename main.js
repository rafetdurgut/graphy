
    var canvas = document.getElementById('canvas'),
            context = canvas.getContext('2d');
            context.translate(0.5, 0.5);
    var adj = [ [0,1,1,1,1,1], [1,0,0,1,0,0],  [1,0,0,0,0,0],  [1,1,0,0,0,0],  [1,0,0,0,0,0],  [1,0,0,0,0,0] ];
    var degrees = [];
    var nodes = [];
    var add_node_flag = false;
    var add_edge_flag = false;
    var remove_node_flag = false;
    var remove_edge_flag = false;
    var selection_mode = true;
    var edges = [];
    var radius = 20;
    var selected_node = -1;

    var scaleMultiplier = 0.2;
    var scaleFactor = 1.1;
    var lastX=canvas.width/2, lastY=canvas.height/2;
    trackTransforms(context);
    window.addEventListener('resize', resizeCanvas, false);
    //window.addEventListener('contextmenu', rightclick, false);
    window.addEventListener('mousedown',drag_node,false);
    window.addEventListener('mouseup',drop_node,false);
    window.addEventListener('mousemove',move_node,false);
    
    var handleScroll = function(evt){
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
        if (delta) zoom(delta);
        return evt.preventDefault() && false;
    };
    canvas.addEventListener('DOMMouseScroll',handleScroll,false);
    canvas.addEventListener('mousewheel',handleScroll,false);
    //load_matrix();

    function getNextVertex(visited)
    {
        var numV = adj[0].length;
        var maxDegree = -1;
        var max_ind = -1;
        console.log("visited: "+visited);
        for(i=0; i< numV; i++)
        {
            var d = 0;
            for(j = 0; j< numV;j++) if(adj[i][j]) d++;
            degrees.push(d);

            if(d>maxDegree && !visited.includes(i))
            {
                maxDegree = d; max_ind = i
            };
        }
        return max_ind;
    }
    function new_graph()
    {
        nodes=[];
        edges = [];
        clear();
    }
    function parse_matrix()
    {
        var data = document.getElementById('adjancency_matrix');
        var lines = data.value.replace(/\r\n/g,"\n").split("\n");
        adj = [];
        lines.forEach(line => {
            var cells = line.split(',');
            if(cells != "" && cells.length != 0)
            {
                var cell_array = [];
                for(var i=0; i<cells.length;i++) 
                {
                    if(!isNaN(parseFloat(cells[i])))
                        cell_array[i] = + parseFloat(cells[i]);
                }
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
            load_matrix();
        }
        
    }
    function load_matrix()
    {
        new_graph();
        var numV = adj[0].length;
        //Start from max_ind;
        var visited = [];
        var parent = null;
        var pos = [200, 50];
        var edgeLenth = 50;
        var current = getNextVertex(visited);
        node_list = [];        
        while(visited.length < numV)
        {
            
            visited.push(current);
            nodes.push([pos[0] , pos[1], false, current] );
            console.log(current);
            node_list.push(current)
            
            var neighbors = [];
            for(j = 0; j< numV;j++) if(adj[current][j]) neighbors.push([j, degrees[j]]);
            neighbors.sort(function (x, y) {
                return y[1] - x[1];
            });
            var theta = (Math.PI*2)/neighbors.length;
            if (theta> Math.PI / 2) theta = Math.PI / 2;
            neighbors.forEach(function(element, ind) {
                if(!node_list.includes(element[0]))
                {
                    nodes.push([pos[0]+ edgeLenth*Math.cos(theta*ind), pos[1]+ edgeLenth*Math.sin(theta*ind), false, element[0]] );
                    console.log(element[0]);
                    node_list.push(element[0]);
                    visited.push(element[0]);
                    
                }
            });


            //Neighbors kendi içinde komsu ise...
            for(i=0; i<neighbors.length;i++)
            {
                //edges.push( [added_size, added_size + i + 1] )
                /* for(j = i+1; j<neighbors.length;j++)
                    if(adj[neighbors[i]][neighbors[j]])
                        edges.push( [added_size + i + 1, added_size + j + 1] ) */
            }
           
            current = getNextVertex(visited);
            
            pos[0] += 100;
            pos[1] += 50;
            //console.log("Visited Number: "+added_size+"  Total Number:"+numV);
            //komsuları kuyruga ekle

            //BFS 
            if(current != -1)
            {
                //Ortak olanlardan en yüksek dereceli olanını bul.
            }
            else
            {
                //Mainin komsularından en yüksek dereceli olanı bul.
            }
        } 
        for(i = 0; i< numV;i++)
        {
            for(j = i+1; j< numV; j++)
                if(adj[i][j]) 
                    edges.push([node_list[i], node_list[j], adj[i][j]]);
        } 
        drawStuff();    
        
    }
    function rightclick(evt)
    {
        evt.preventDefault();
        return false;
    }
    function zoom(delta)
    {
        var pt = context.transformedPoint(lastX,lastY);
        context.translate(pt.x,pt.y);
        var factor = Math.pow(scaleFactor,delta);
        context.scale(factor,factor);
        context.translate(-pt.x,-pt.y);

        drawStuff();
    }
    
    var drag = false;
    function clearSelection (selected)
    {
        selected_node = -1;
        nodes.forEach( function (element, i) {
            if(i != selected)
                element[2] = false;
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
    function drag_node(event)
    {

        drag = true;
        lastX = event.offsetX || (event.pageX - canvas.offsetLeft);
        lastY = event.offsetY || (event.pageY - canvas.offsetTop);
        scaledPos = context.transformedPoint(lastX,lastY);
        // Eğer seçili yoksa, ve burdan seçili gelirse burdan geleni seç

        

        var temp_selected = -1;
        nodes.forEach( function (element, i) {
            if(( (element[0]-radius) < scaledPos.x  && scaledPos.x < (element[0] + radius) 
                && (element[1]-radius) < scaledPos.y && scaledPos.y < (element[1] + radius)) )
            {
                temp_selected = i;
                element[2] = true;  
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
        console.log(selected_node);
        drawStuff();
    }
    function drop_node(event)
    {
        lastX = event.offsetX || (event.pageX - canvas.offsetLeft);
        lastY = event.offsetY || (event.pageY - canvas.offsetTop);
        
        drag = false;
        if(add_node_flag)
            add_node(event);
    }
    function move_node(event)
    {
        
        lastX = event.offsetX || (event.pageX - canvas.offsetLeft);
        lastY = event.offsetY || (event.pageY - canvas.offsetTop);
        scaledPos = context.transformedPoint(lastX,lastY);

        if(drag && selected_node != -1)
        {
            nodes[selected_node][0] = scaledPos.x;
            nodes[selected_node][1] = scaledPos.y;
            drawStuff();
        }
        
    }
    
    function resizeCanvas() {

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight/2;
            trackTransforms(context);
            drawStuff(); 
    }
    resizeCanvas();
    
    function add_node(event) {
        if(selected_node == -1)
        {
            lastX = event.offsetX || (event.pageX - canvas.offsetLeft);
            lastY = event.offsetY || (event.pageY - canvas.offsetTop);
            scaledPos = context.transformedPoint(lastX,lastY);
            nodes.push([scaledPos.x, scaledPos.y,false,nodes.length]);
        }       
        drawStuff(); 
    }

    function clear()
    {
        var p1 = context.transformedPoint(0,0);
        var p2 = context.transformedPoint(canvas.width,canvas.height);
        context.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);
    }
    function draw_edge(edge)
    {
        context.beginPath();
        context.moveTo(nodes[edge[0]][0], nodes[edge[0]][1]);
        context.lineTo(nodes[edge[1]][0], nodes[edge[1]][1]);

        context.stroke();
    }
    function draw_node(element, i)
    {
        context.beginPath();
        if(!element[2])
            context.fillStyle="#fff";
        else
            context.fillStyle="#819deb";
        
        context.arc(element[0],element[1],radius,0,Math.PI*2,true);
        context.closePath();
        context.fill();

        context.lineWidth = 1;
        if(!element[2])
            context.strokeStyle="black";
        else
            context.strokeStyle="#819deb";
        context.stroke();

        context.font = '12pt Calibri';
        if(!element[2])
            context.fillStyle="black";
        else
            context.fillStyle="white";
        context.textAlign = 'center';
        context.fillText(element[3], element[0], element[1]+radius/4);
    }
    
    function drawStuff() {
            clear();
            edges.forEach( function(element, i) {
                draw_edge(element);
                });
            nodes.forEach( function(element, i) {
                draw_node(element,i);
           });     
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
    


