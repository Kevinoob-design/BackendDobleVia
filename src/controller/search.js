module.exports = function (routes, collissions) {

    console.log(routes);
    console.log(collissions);

    // The graph
    const adjacencyList = new Map();

    // Add node
    function addNode(route) {
        adjacencyList.set(route, []);
    }

    // Add edge, undirected
    function addEdge(edges) {
        for (let i = 0; i < edges.length; i++) {
            if (i + 1 < edges.length) {
                adjacencyList.get(edges[0]).push(edges[i + 1]);
                adjacencyList.get(edges[i + 1]).push(edges[0]);
            }
        }
    }

    // Create the Graph
    routes.forEach(addNode);
    collissions.forEach(collission => addEdge(collission));
    console.log(adjacencyList);

    //------------------------------------------------------------------------------------------------------------------------

    // Breadth-first Search (BFS)
    this.bfs = function (start, ends) {
        const visited = new Set();
        const queue = [start];
        const confirmed = [];

        // console.log(`starts in ${start}`);

        while (queue.length > 0) {

            const route = queue.shift(); // mutates the queue
            const destinations = adjacencyList.get(route);

            for (const destination of destinations) {

                for (const end of ends) {
                    if (destination === end) {
                        confirmed.push(route === start ? [start, end] : [start, route, end]);
                        console.log(`${route} - ${end} found!`);
                    }
                }

                if (!visited.has(destination)) {
                    visited.add(destination);
                    if(!ends.includes(destination)){
                        queue.push(destination);
                    }
                    console.log(visited);
                }
            }
        }
        let filter = confirmed.filter((t={},a=>!(t[a]=a in t)));
        return filter;
    }

    // Depth-first Search (DFS)
    this.dfs = function (start, ends, visited = new Set()) {

        visited.add(start);
        const destinations = adjacencyList.get(start);
        console.log(`starts in ${start}`);

        for (const destination of destinations) {

            for (const end of ends) {
                if (destination === end) {
                    console.log(`${start} - ${end} found!`);
                    return;
                }
            }

            if (!visited.has(destination)) {
                this.dfs(destination, ends, visited);
                console.log(destination);
            }
        }
    }

    //------------------------------------------------------------------------------------------------------------------------
}