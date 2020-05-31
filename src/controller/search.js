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
    function addEdge(origin, destination) {
        adjacencyList.get(origin).push(destination);
        adjacencyList.get(destination).push(origin);
    }

    // Create the Graph
    routes.forEach(addNode);
    collissions.forEach(collission => addEdge(...collission));

    console.log(adjacencyList);

    //------------------------------------------------------------------------------------------------------------------------

    // Breadth-first Search (BFS)
    this.bfs = function (start, end) {
        const visited = new Set();
        const queue = start;
        const confirmed = [];

        console.log(`starts in ${start}`);

        while (queue.length > 0) {

            const route = queue.shift(); // mutates the queue
            const destinations = adjacencyList.get(route);

            for (const destination of destinations) {
                if (destination === end) {
                    // console.log(`starts in ${start}`);
                    // confirmed.push(route === start ? [start, end] : [start, route, end]);
                    console.log(`${route} - ${end} found!`);
                }

                if (!visited.has(destination)) {
                    visited.add(destination);
                    queue.push(destination);
                    console.log(destination);
                }
            }
        }

        console.log(confirmed);

    }

    // Depth-first Search (DFS)
    this.dfs = function (start, end, visited = new Set()) {

        visited.add(start);
        const destinations = adjacencyList.get(start);
        console.log(`starts in ${start}`);

        for (const destination of destinations) {

            if (destination === end) {
                console.log(`${start} - ${end} found!`);
                return;
            }

            if (!visited.has(destination)) {
                this.dfs(destination, end, visited);
                console.log(destination);
            }
        }
    }

    //------------------------------------------------------------------------------------------------------------------------
}