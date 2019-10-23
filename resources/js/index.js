/**
 * Generate the grid HTML color coding the corresponding products and obstacles.
 * Generate Grids Complexity: O(n) = no. of cols * no. of rows.
 */
const generateGrids = () => {
    let gridsData = "<table border='1' style='border: solid 3px #c0c0c0;'><tbody>";

    for (let col in grids) {
        for (let row in grids[col]) {
            if(row === 0) {
                gridsData += "<tr>";
            }
            let cellId = row.toString() + col.toString();
            if(grids[col][row].is_start === 1) {
                if (isRobotStartGridSet === true) {
                    console.log("You can have only one starting point");
                    alert("You can have only one starting point");
                    isRobotStartGridSet = false;
                } else {
                    startGrid = {id: 0, name: "start", x: parseInt(row), y: parseInt(col)};
                    isRobotStartGridSet = true;
                    gridsData += "<td class='grid-cell' id=" + cellId + " style='background-color: #71ea96;'>Start</td>";
                }

            } else if(grids[col][row].path === 0) {
                gridsData += "<td class='grid-cell' id=" + cellId + " style='background-color: #c0c0c0;'></td>";
            } else {
                gridsData += "<td class='grid-cell' id=" + cellId + " style='background-color:  #e7e4d3;'></td>";
            }
            if(parseInt(row) === gridWidth-1) {
                gridsData += "</tr>";
            }
        }

    }

    gridsData += "</tbody></table>";
    document.getElementById("grids").innerHTML = gridsData;
};

/**
 * Fetch products data from the products array and populate the products menu.
 * Generate Products Menu Complexity: O(n) = P * S (available number of products)
 */
const generateProductsMenu = () => {
    let productsMenu = "<select class='product-select' id='productData' multiple onchange='getSelectedProducts()'><option value=''>Select Products</option>";
    reInitCartData();
    for(let item in products) {
        let cellId = products[item].x.toString() + products[item].y.toString();
        let disabled = "";
        let gridStartEnabled = (grids[startGrid.y][startGrid.x].path === 1) ? true : false;
        if (grids[products[item].y][products[item].x].path === 0 || !gridStartEnabled || isRobotStartGridSet === false) {
            disabled = "disabled=";
            document.getElementById(startGrid.x.toString() + startGrid.y.toString()).innerHTML = "Enable to start";
            document.getElementById(startGrid.x.toString() + startGrid.y.toString()).style.backgroundColor = "darkgray";
        } else {
            document.getElementById(cellId).innerHTML = products[item].name;
            if(grids[products[item].y][products[item].x].is_start === 0) {
                document.getElementById(cellId).style.backgroundColor = "#206ba4";
                document.getElementById(cellId).style.color = " #e7e4d3";
            } else {
                startGrid.name = products[item].name;
                startGrid.price = products[item].price;
                productStart = true;
            }
        }
        productsMenu += "<option " + disabled + "value='" + item + "'>" + products[item].name + " ( "+ products[item].price + " MYR )" + "</option>";
    }
    productsMenu += "</select>";
    document.getElementById("products").innerHTML = productsMenu;
};

/**
 * Re initialize cart data.
 */
const reInitCartData = () => {
    document.getElementById("cart-items").innerHTML = "";
    document.getElementById("cart-price").innerHTML = "";
    document.getElementById("cart-time").innerHTML = "";
    document.querySelectorAll('.img-arrow').forEach(e => e.remove());
};

/**
 * Loop through the products and return the ones selected by the user.
 */
const getSelectedProducts = () => {
    let select = document.getElementById("productData");
    let options = select && select.options;
    let opt;
    let selectedItems = [];
    let totalPrice = 0;
    productLocations = [];
    selectedProducts = [];
    selectedProducts.length = 0;
    reInitCartData();
    selectedProducts.push(startGrid);
    if (productStart) {
        selectedItems.push(startGrid.name);
        totalPrice += startGrid.price;
    }

    for (let i=0; i <options.length; i++) {
        opt = options[i];

        if (opt.selected) {
            var newSelectedProduct = products[opt.value];
            if(newSelectedProduct.x !== startGrid.x || newSelectedProduct.y !== startGrid.y) {
                selectedProducts.push(newSelectedProduct);
                selectedItems.push(newSelectedProduct.name);
                totalPrice += newSelectedProduct.price;
            }
        }
    }
    for(var s in selectedProducts) {
        productLocations.push(selectedProducts[s].x.toString() + selectedProducts[s].y.toString());
    }

    if(selectedProducts.length > 1 || productStart) {
        document.getElementById("cart-items").innerHTML = selectedItems.join(", ");
        document.getElementById("cart-price").innerHTML = totalPrice + " MYR";
        document.getElementById("cart-time").innerHTML = "00:00";
        if(selectedProducts.length > 1) {
            calculateProductsPath();
        }
    }
};

/**
 * Calculate the path of the selected products.
 */
const calculateProductsPath = () => {
    productsPath = [];
    productsPath.length = 0;
    for(productCount = 0; productCount < selectedProducts.length; productCount++) {
        visitedNodes = [];
        visitedNodes.length = 0;
        nodesLevel = {};
        productsSelected = 0;
        availableRobotRoutes = [];
        availableRobotRoutes.length = 0;
        productsPath[productCount] = [];
        productsPath[productCount][productCount] = 0;
        productsPathCells[productCount] = [];
        productsPathCells[productCount][productCount] = [];
        previousRoute = [];
        previousRoute.length = 0;
        nodeCount = 0;
        previousNodeCount = 0;
        let prodLoc = selectedProducts[productCount].x.toString() + selectedProducts[productCount].y.toString();
        visitedNodes.push(prodLoc);
        nodesLevel[prodLoc] = 0;
        for(nodeCount = 0; nodeCount < visitedNodes.length; nodeCount++) {
            if(productsSelected === selectedProducts.length - 1) {
                break;
            }
            let x = parseInt(visitedNodes[nodeCount].charAt(0));
            let y = parseInt(visitedNodes[nodeCount].charAt(1));
            checkNeighborNodes(x, y, nodesLevel[visitedNodes[nodeCount]]);
        }
    }

    shortestPathDynamic();
};


/**
 * Check the neighbor nodes. 
 * 
 * @param {int} x Node x position
 * @param {int} y Node y position
 * @param {int} level The node level
 */
const checkNeighborNodes = (x, y, level) => {
    if (x == 0  && y == 0) {
        // 1
        addVisitedNode((x+1), y, level, x, y);
        addVisitedNode((x), (y+1), level, x, y);
        //
        addVisitedNode((x+1), (y+1), level, x, y);
    } else if(x == gridWidth - 1 && y == 0) {
        // 2
        addVisitedNode((x-1), y, level, x, y);
        addVisitedNode((x), (y+1), level, x, y);
        //
        addVisitedNode((x-1), (y+1), level, x, y);
    } else if(x == gridWidth - 1 && y < gridHeight - 1) {
        // 3
        addVisitedNode((x), (y-1), level, x, y);
        addVisitedNode((x-1), y, level, x, y);
        addVisitedNode((x), (y+1), level, x, y);
        //
        addVisitedNode((x-1), (y-1), level, x, y);
        addVisitedNode((x-1), (y+1), level, x, y);
    } else if(x == 0 && y == gridHeight - 1) {
        // 4
        addVisitedNode(x, (y-1), level, x, y);
        addVisitedNode((x+1), (y), level, x, y);
        // 
        addVisitedNode((x+1), (y-1), level, x, y);
    } else if(x == 0 && y < gridHeight - 1) {
        // 5
        addVisitedNode(x, (y-1), level, x, y);
        addVisitedNode((x+1), y, level, x, y);
        addVisitedNode(x, (y+1), level, x, y);
        //
        addVisitedNode((x+1), (y-1), level, x, y);
        addVisitedNode((x+1), (y+1), level, x, y);
    } else if(x == gridWidth - 1 && y == gridHeight - 1) {
        // 6
        addVisitedNode((x-1), (y), level, x, y);
        addVisitedNode(x, (y-1), level, x, y);
        //
        addVisitedNode((x-1), (y-1), level, x, y);
    } else if(x < gridWidth - 1 && y == 0) {
        // 7
        addVisitedNode((x-1), y, level, x, y);
        addVisitedNode((x), (y+1), level, x, y);
        addVisitedNode((x+1), y, level, x, y);
        //
        addVisitedNode((x-1), (y+1), level, x, y);
        addVisitedNode((x+1), (y+1), level, x, y);
    } else if(x < gridWidth - 1 && y == gridHeight - 1) {
        // 8
        addVisitedNode((x-1), (y), level, x, y);
        addVisitedNode(x, (y-1), level, x, y);
        addVisitedNode((x+1), (y), level, x, y);
        // 
        addVisitedNode((x-1), (y-1), level, x, y);
        addVisitedNode((x+1), (y-1), level, x, y);
    } else {
        // 9
        addVisitedNode((x-1), y, level, x, y);
        addVisitedNode(x, (y-1), level, x, y);
        addVisitedNode((x+1), y, level, x, y);
        addVisitedNode((x), (y+1), level, x, y);
        //
        addVisitedNode((x-1), (y-1), level, x, y);
        addVisitedNode((x+1), (y+1), level, x, y);
        addVisitedNode((x+1), (y-1), level, x, y);
        addVisitedNode((x-1), (y+1), level, x, y);
    }
    previousNodeCount = nodeCount;
};

/**
 * Add node to the visited node array.
 * @param {*} x 
 * @param {*} y 
 * @param {*} level 
 * @param {*} parentX 
 * @param {*} parentY 
 */
const addVisitedNode = (x, y, level, parentX, parentY) => {
    let loc = x.toString() + y.toString();
    let parentLoc = parentX.toString() + parentY.toString();
    if(nodesLevel[loc] === undefined && grids[y][x].path === 1) {
        visitedNodes.push(loc);
        nodesLevel[loc] = parseInt(level + 1);
        let currRoute = addRoutes(loc, parentLoc);
        checkProductLocation(loc, currRoute);
    }
};

/**
 * Add the rioute
 * @param {*} loc Current location 
 * @param {*} parentLoc Parent location
 */
const addRoutes = (loc, parentLoc) => {
    let parentRoute = [];
    for (let r = 0; r < availableRobotRoutes.length; r++) {
        if (availableRobotRoutes[r].indexOf(parentLoc) > -1) {
            parentRoute = availableRobotRoutes[r].slice();
            break;
        }
    }
    if(parentRoute.length === 0) {
        parentRoute = [parentLoc, loc];
        availableRobotRoutes.push(parentRoute);
    } else {
        if(previousRoute.indexOf(parentLoc) > -1 && previousNodeCount === nodeCount) {
            parentRoute.splice(parentRoute.length-1, 1, loc);
        } else {
            parentRoute.push(loc);
        }
        availableRobotRoutes.push(parentRoute);
    }
    previousRoute = parentRoute;
    return availableRobotRoutes.length - 1;
};

const checkProductLocation = (loc, currRoute) => {
    var prodId = productLocations.indexOf(loc);
    if (prodId > -1) {
        productsPath[productCount][prodId] = nodesLevel[loc];
        productsPathCells[productCount][prodId] = availableRobotRoutes[currRoute];
        productsSelected++;
    }
};

/**
 * Find the shortest path
 * Memory needed: O(P * 2^P)
 * P => The products selected
 */
const shortestPathDynamic = () => {
    let nextSet = new Array();
    let bestPath = new Array();
    let bestLength = Infinity;
    bestTourWeight = 0;
    bestTour = [];
    bestTour.length = 0;

    function nextSetOf(num,nextSet,tspCount) {
        let count = 0;
        let ret = 0;
        for (let i = 0; i < tspCount; ++i) {
            count += nextSet[i];
        }
        if (count < num) {
            for (let i = 0; i < num; ++i) {
                nextSet[i] = 1;
            }
            for (let i = num; i < tspCount; ++i) {
                nextSet[i] = 0;
            }
        } else {
            
            let firstOne = -1;
            for (let i = 0; i < tspCount; ++i) {
                if (nextSet[i]) {
                    firstOne = i;
                    break;
                }
            }
            
            let firstZero = -1;
            for (let i = firstOne + 1; i < tspCount; ++i) {
                if (!nextSet[i]) {
                    firstZero = i;
                    break;
                }
            }
            if (firstZero < 0) {
                return -1;
            }
            
            nextSet[firstZero] = 1;
            
            for (let i = 0; i < firstZero - firstOne - 1; ++i) {
                nextSet[i] = 1;
            }
            for (let i = firstZero - firstOne - 1; i < firstZero; ++i) {
                nextSet[i] = 0;
            }
        }
        
        for (let i = 0; i < tspCount; ++i) {
            ret += (nextSet[i]<<i);
        }
        return ret;
    };
    let numCombos = 1<<productsPath.length;
    let C = new Array();
    let parent = new Array();
    for (let i = 0; i < numCombos; ++i) {
        C[i] = new Array();
        parent[i] = new Array();
        for (let j = 0; j < productsPath.length; ++j) {
            C[i][j] = 0.0;
            parent[i][j] = 0;
        }
    }
    for (let k = 1; k < productsPath.length; ++k) {
        let index = 1 + (1<<k);
        C[index][k] = productsPath[0][k];
    }
    let index;
    for (let s = 3; s <= productsPath.length; ++s) {
        for (let i = 0; i < productsPath.length; ++i) {
            nextSet[i] = 0;
        }
        index = nextSetOf(s,nextSet,productsPath.length);
        while (index >= 0) {
            for (let k = 1; k < productsPath.length; ++k) {
                if (nextSet[k]) {
                    let prevIndex = index - (1<<k);
                    C[index][k] = Infinity;
                    for (let m = 1; m < productsPath.length; ++m) {
                        if (nextSet[m] && m != k) {
                            if (C[prevIndex][m] + productsPath[m][k] < C[index][k]) {
                                C[index][k] = C[prevIndex][m] + productsPath[m][k];
                                parent[index][k] = m;
                            }
                        }
                    }
                }
            }
            index = nextSetOf(s,nextSet,productsPath.length);
        }
    }
    for (let i = 0; i < productsPath.length; ++i) {
        bestPath[i] = 0;
    }
    index = (1<<productsPath.length)-1;

    let currNode = -1;
    bestPath[productsPath.length] = 0;
    for (let i = 1; i < productsPath.length; ++i) {
        if (C[index][i] + productsPath[i][0] < bestLength) {
            bestLength = C[index][i] + productsPath[i][0];
            currNode = i;
        }
    }
    bestPath[productsPath.length-1] = currNode;

    for (let i = productsPath.length - 1; i > 0; --i) {
        currNode = parent[index][currNode];
        index -= (1<<bestPath[i]);
        bestPath[i-1] = currNode;
    }


    bestTourWeight = bestLength;
    bestTour = bestPath;
    document.getElementById("cart-time").innerHTML = bestTourWeight.toString().formatTime();
    placeNumbersOnGrid();
};

/**
 * Place the arrows on the grid.
 */
const placeNumbersOnGrid = () => {
    direction = 1;
    for (let path = 0; path < bestTour.length; path++) {
        if (bestTour[path+1] !== undefined) {
            let currPath = productsPathCells[bestTour[path]][bestTour[path+1]];
            for(let cpath = 0; cpath < currPath.length; cpath++) {
                if (currPath[cpath+1] !== undefined) {
                    document.getElementById(currPath[cpath]).innerHTML += getSteps(parseInt(currPath[cpath].charAt(0)), parseInt(currPath[cpath].charAt(1)), parseInt(currPath[cpath+1].charAt(0)), parseInt(currPath[cpath+1].charAt(1)));
                }
            }
        }
    }
};

/**
 * Get directional Array
 * @param x1 Current node x
 * @param y1 Current node y
 * @param x2 Next node x
 * @param y2 Next node y
 */
const getSteps = (x1, y1, x2, y2) => {
    let imgArrow = "";
    imgArrow += "<p class='img-arrow'>" + direction + "</p>";
    direction++;
    return imgArrow;
};

String.prototype.formatTime = function () {
    var sec_num = parseInt(this, 10);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return minutes +':'+ seconds;
}

// Starting position in the grid
let startGrid = {};
// Grids where products are placed
let productLocations = [];
let productStart = false;
// Array of products selected
let selectedProducts = [];
// Is the start grid?
let isRobotStartGridSet = false;
// Array of nodes visited
let visitedNodes = [];
// How far the node is from current position
let nodesLevel = {};
// Number of producst selected
let productsSelected = 0;
// Total number of products
let productCount;
// Number of routes available.
let availableRobotRoutes = [];
let productsPathCells = [];
let previousRoute = [];
let nodeCount = 0;
let previousNodeCount = 0;

let direction;

// No. of grids in the x axis
const gridWidth = grids[0].length;
// No. of grids in the y axis
const gridHeight = grids.length;

window.onload = function() {
    generateGrids();
    generateProductsMenu();
}