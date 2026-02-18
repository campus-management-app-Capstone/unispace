import { rawMap, x, p, sp, e, pa, pb, pc, pd, f, c, o } from "@/data/map";

// store:
// start
// end
// journey: start->lift->end
// pathWalked
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
// store all current position in pathWalked array
// if no path and does not reach end point, return back to turningPoint
// need to save which pathWalked refer to which turningPoint
// return pathWalked as array of coordinates
// color the pathWalked on the map

export const navigationLogic = (start, end) => {

};