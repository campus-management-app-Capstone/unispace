import { rawMap, x, p, sp, e, pa, pb, pc, pd, f, c, o } from "@/data/map";

// 加interactive 给按那个图片可以直接输入进去那个To where

// store:
// start
// end
// journey: start->lift->end
// path
// currentPosition
// turningPoint

// user input start and end points 
// get the coordinates from rawMap
// set current position to start point
// while current position not equal to end point
// if need to go up or down floor (look at the first index in array), find coordinates of nearest Lift on same floor by substracting the corrdinate of start with the floor's Lifts
// after go up or down lift, set current position to the ELift's coordinate
// look up down right left from current position looking for path, if the path better shorten total after substracting the distance, move and store position
// if both shorten the best, choose one direction to move
// store the point as turningPoint
// change current location to new position
// store all current position in path array
// if no path and does not reach end point, return back to turningPoint
// need to save which path refer to which turningPoint
// return path as array of coordinates
// color the path on the map

// x = colIndex, y = rowIndex, z = currentFloor 
export type Coordinate = {
    x: number;
    y: number;
    z: number;
};

// normal: user input => press search => find start & end entry coord => find navigate path => return navigate path => color path on map
// toilet stair lift: user input => press search => find start entry coord => use start entry coord to find nearest EToilet EStair ELift=end entry coord => find navigate path => return navigate path => color path on map

export const findNearest = (fromCoord: Coordinate, targetCellName: string) => {
    // find the nearest EToilet, EStair, ELift coordinate
    // toLowerCase
    targetCellName = targetCellName.toLowerCase().trim();

    // change to entry
    const targetCell = `e${targetCellName}`;

    let shortestCount = Infinity;
    let foundCoord: Coordinate | null = null;

    const currentFloorMap = rawMap[fromCoord.z];

    // loop through current floor row
    for (let y = 0; y < currentFloorMap.length; y++){
        // find x of target cell in each row
        const x = currentFloorMap[y].indexOf(targetCell);
        // find target
        if(x !== -1){
            // always positive
            const distance = Math.abs(fromCoord.x - x) + Math.abs(fromCoord.y - y);
            // found shorter distance
            if (distance < shortestCount) {
                shortestCount = distance;
                foundCoord = { x, y, z: fromCoord.z };
            }
        }
    }
    return foundCoord;
}

export const findEntry = (cellName: string) => {
    // not for toilet, stair, lift
    cellName = cellName.toLowerCase().trim();

    // for audi with two floor but one entry, hardcode the entry point for auditorium 1
    if (cellName === "auditorium 1") {
        return { x: 26, y: 10, z: 2 };
    }

    // change to entry point
    const targetCell = `e${cellName}`;

    // loop thourgh floor
    if (cellName !== "lift" && cellName !== "stair" && cellName !== "toilet") {
        for (let z = 0; z < rawMap.length; z++) {
            // loop thorugh row of each floor
            for (let y = 0; y < rawMap[z].length; y++) {
                // find x of target cell in each row
                const x = rawMap[z][y].indexOf(targetCell);
                // find the target cell in this row
                if (x !== -1) {
                    return { x, y, z };
                }
            }
        }
    } 

    return null; // not found
}

export const navigate = (fromCoord, toCoord): Coordinate[] => {
    // only handle and return coordinate 
    const path: Coordinate[] = [];



    return path;
};