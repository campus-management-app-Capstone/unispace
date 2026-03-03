export function getParkingCost(startTimeString: string) {
    const safeDateString = startTimeString.replace(' ', 'T');
    const startTime = new Date(safeDateString).getTime();
    const now = new Date().getTime();

    const diffInMilliseconds = Math.max(0, now - startTime);

    const hoursPassed = diffInMilliseconds / (1000 * 60 * 60);
    const minutesPassed = (diffInMilliseconds/(1000*60)) %60

    const billedHours = Math.ceil(hoursPassed);

    if (minutesPassed <= 15) {
        return 0;
    }

    let cost = billedHours * 1;

    // RM 5 maximum 
    cost = Math.min(cost, 5);

    return cost;
}