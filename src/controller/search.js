module.exports = function (routes, collissions) {

    // The graph
    const adjacencyList = new Map();

    // Add node
    function addNode(route) {
        adjacencyList.set(route, []);
    }

    function addEdge(edges) {
        for (let i = 0; i < edges.ID.length; i++) {
            if (i + 1 < edges.ID.length) {
                adjacencyList.get(edges.ID[0]).push({ ID: edges.ID[i + 1], street: edges.street[i + 1] });
                adjacencyList.get(edges.ID[i + 1]).push({ ID: edges.ID[0], street: edges.street[0] });
            }
        }
    }

    // Create the Graph
    routes.forEach(addNode);
    collissions.forEach(collission => addEdge(collission));

    //------------------------------------------------------------------------------------------------------------------------

    // Breadth-first Search (BFS)
    this.bfs = function (start, ends) {
        const visited = new Set();
        const queue = [start.ID];
        const confirmed = [];

        while (queue.length > 0) {

            const route = queue.shift(); // mutates the queue
            const destinations = adjacencyList.get(route);

            let trasferStart = destinations.filter(destination => destination.ID == start.ID);
            if (trasferStart.length > 0) trasferStart = trasferStart.map(trasfer => trasfer.street);

            for (const destination of destinations) {
                for (const end of ends.ID) {
                    if (destination.ID === end) {
                        confirmed.push(route === start.ID ?
                            [start, { end: end, streetTransferStart: destination.street, streeTransfertEnd: ends.street }]
                            :
                            [start, { transfer: route, streetTransferStart: trasferStart, streeTransfertEnd: destination.street }, { end: end, street: ends.street }]);
                    }
                }

                if (!visited.has(destination.ID)) {
                    visited.add(destination.ID);
                    if (!ends.ID.includes(destination.ID)) {
                        queue.push(destination.ID);
                    }
                }
            }
        }
        // let filter = confirmed.filter((t={},a=>!(t[a]=a in t)));
        return confirmed;
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