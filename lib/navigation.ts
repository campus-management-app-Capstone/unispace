import { rawMap, x, p, sp, e, pa, pb, pc, pd, f, c, o } from "@/data/map";

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

    // loop through current floor rowa
    for (let y = 0; y < currentFloorMap.length; y++) {
        // loop thorugh each col
        for (let x = 0; x < currentFloorMap[y].length; x++) {
            if (currentFloorMap[y][x].toLowerCase() === targetCell.toLowerCase()) {
                // always positive
                const distance = Math.abs(fromCoord.x - x) + Math.abs(fromCoord.y - y);
                // found shorter distance
                if (distance < shortestCount) {
                    shortestCount = distance;
                    foundCoord = { x, y, z: fromCoord.z };
                    console.log(`Found ${targetCell} at (${x}, ${y}, ${fromCoord.z}) with distance ${distance}`);
                }
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
                const x = rawMap[z][y].findIndex(cell => cell.toLowerCase() === targetCell.toLowerCase());
                // find the target cell in this row
                if (x !== -1) {
                    return { x, y, z };
                }
            }
        }
    }

    return null; // not found
}

// store:
// start
// end
// journey: start->lift->end
// path
// currentPosition
// turningPoint

// chekcthe z is it on the same floor, if yes, add ELift as checkpoint
// find p or target entry in four direction, if only one way to go, set it as next position, if have more than one way to go, find the shortest distance to target entry and set it as next position
// if have turning point, save it and save the current choice of way, if cant find way to go after, delete the path from the choice and set the current position with the turning point
// return entire path coordinate

type TurningPoint = {
    position: Coordinate;
    alternatives: Coordinate[];
    pathUpToThis: Coordinate[];
};

export const navigate = (from: Coordinate, to: Coordinate): Coordinate[] => {
    // only handle and return coordinate 
    const path: Coordinate[] = [];
    const checkpoint = [];
    let currentPosition: Coordinate = { ...from };

    // push checkpoint and the first checkpoint to walked path
    checkpoint.push({ target: rawMap[from.z][from.y][from.x], coord: from });
    path.push(from);
    // check if need to change floor
    if (from.z !== to.z) {
        // find nearest lift
        const nearestLift = findNearest(from, "lift");
        if (!nearestLift) {
            return [];
        }
        checkpoint.push({ target: rawMap[nearestLift.z][nearestLift.y][nearestLift.x], coord: nearestLift });
        checkpoint.push({ target: rawMap[to.z][nearestLift.y][nearestLift.x], coord: { x: nearestLift.x, y: nearestLift.y, z: to.z } });
    }
    checkpoint.push({ target: rawMap[to.z][to.y][to.x], coord: to });
    console.log("Checkpoint:", checkpoint);

    // up right down left
    const directions = [
        { x: 0, y: -1 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: -1, y: 0 }
    ]

    // loop through checkpoint to find path
    for (let i = 0; i < checkpoint.length - 1; i++) {
        // check if now is using lift or not, if yes, go to next checkpoint which is going up/down floor
        if (checkpoint[i].coord.x === checkpoint[i + 1].coord.x && checkpoint[i].coord.y === checkpoint[i + 1].coord.y && checkpoint[i].coord.z !== checkpoint[i + 1].coord.z) {
            currentPosition = checkpoint[i + 1].coord;
            path.push(currentPosition);
            continue;
        }

        const turningPointStack: TurningPoint[] = []; // store detail when have many option to choose: currentPosition, alternative, path up to here
        const exploredPositions = new Set<string>(); // store explored positions avoid infinite loops

        // looping when current position and next checkpoint is not same
        while (currentPosition.x !== checkpoint[i + 1].coord.x || currentPosition.y !== checkpoint[i + 1].coord.y || currentPosition.z !== checkpoint[i + 1].coord.z) {
            console.log(`Current checkpoint: (${checkpoint[i].coord.x}, ${checkpoint[i].coord.y}, ${checkpoint[i].coord.z}), Next checkpoint: (${checkpoint[i + 1].coord.x}, ${checkpoint[i + 1].coord.y}, ${checkpoint[i + 1].coord.z})`);

            let shortestCount = Infinity;
            let nextPosition: Coordinate | null = null;

            const surrounded = []; // up right down left, store the obj with coord [{obj: p, coord: xyz}]
            const validOptions: Coordinate[] = []; // valid pathway options

            // try all direction to find p and find shortest distance
            for (const direction of directions) {
                const newX = currentPosition.x + direction.x;
                const newY = currentPosition.y + direction.y;
                const posKey = `${newX},${newY},${currentPosition.z}`;

                // check what is on surround to check is it only have one way
                const surroundedObj = rawMap[currentPosition.z][newY][newX];
                const surroundedCoord = { x: newX, y: newY, z: currentPosition.z };

                // check walked path and dont push it, compare surrounded coord with path coord
                if (path.some((walked) => walked && walked.x === surroundedCoord.x && walked.y === surroundedCoord.y && walked.z === surroundedCoord.z) || exploredPositions.has(posKey)) {
                    console.log(`Already walked to (${surroundedCoord.x}, ${surroundedCoord.y}, ${surroundedCoord.z}), skip`);
                    continue;
                }

                surrounded.push({ obj: surroundedObj, coord: surroundedCoord });
            }
            
            console.log(`Current position: (${currentPosition.x}, ${currentPosition.y}, ${currentPosition.z})`);
            console.log("Current path: ", JSON.stringify(path, null, 2));
            console.log("surrounded: ", JSON.stringify(surrounded, null, 2));

            // only one way to go, set current position to the only way
            if (surrounded.filter((item) => item.obj === p || item.obj === checkpoint[i + 1].target).length === 1) {
                const nextPos = surrounded.find((item) => item.obj === p || item.obj === checkpoint[i + 1].target)!.coord;
                currentPosition = nextPos;
                path.push(currentPosition);
                continue;
            } else {
                // have more than one way, find shortest and store alternatives
                for (const item of surrounded) {
                    if ((item.obj === p || item.obj === checkpoint[i + 1].target)) {
                        validOptions.push(item.coord);
                        const distance = Math.abs((checkpoint[i + 1].coord.x - item.coord.x)) + Math.abs(checkpoint[i + 1].coord.y - item.coord.y);
                        if (distance < shortestCount) {
                            shortestCount = distance;
                            nextPosition = item.coord;
                        }
                    }
                }

                // if there are multiple valid options, store as turning point
                if (validOptions.length > 1) {
                    // store not the chosen one as alternative
                    const alternatives = validOptions.filter(opt => !(opt.x === nextPosition?.x && opt.y === nextPosition?.y && opt.z === nextPosition?.z));
                    turningPointStack.push({
                        position: currentPosition,
                        alternatives: alternatives,
                        pathUpToThis: [...path]
                    });
                    console.log(`Turning point created at (${currentPosition.x}, ${currentPosition.y}, ${currentPosition.z}) with ${alternatives.length} alternatives`);
                }

                if (nextPosition) {
                    currentPosition = nextPosition;
                    path.push(currentPosition);
                    console.log(`Next position: (${nextPosition.x}, ${nextPosition.y}, ${nextPosition.z}) with distance ${shortestCount}`);
                } else {
                    // No valid path found, backtrack to last turning point
                    if (turningPointStack.length > 0) {
                        const lastTurningPoint = turningPointStack.pop()!;
                        if (lastTurningPoint.alternatives.length > 0) {
                            const nextAlternative = lastTurningPoint.alternatives.pop()!;
                            // restore path up to this turning point
                            path.length = lastTurningPoint.pathUpToThis.length;
                            currentPosition = lastTurningPoint.position;
                            // move to the alternative
                            currentPosition = nextAlternative;
                            path.push(currentPosition);
                            // mark this position as explored
                            exploredPositions.add(`${nextAlternative.x},${nextAlternative.y},${nextAlternative.z}`);
                            // push back if there are more alternatives
                            if (lastTurningPoint.alternatives.length > 0) {
                                turningPointStack.push(lastTurningPoint);
                            }
                            console.log(`Backtracked to (${currentPosition.x}, ${currentPosition.y}, ${currentPosition.z})`);
                        }
                    } else {
                        console.log("No turning point to backtrack to, path not found");
                        break;
                    }
                }
            }

            console.log("Path: ", JSON.stringify(path, null, 2));
        }

    }

    const completePath = path.flat();
    return completePath;
}

