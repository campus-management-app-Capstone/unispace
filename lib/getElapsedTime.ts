export function getElapsedTime(startTimeString: string) {
    // solve compatibility issue
    const dateString = startTimeString.replace(' ', 'T');
    const startTime = new Date(dateString).getTime();
    
    // current time
    const now = new Date().getTime();
    
    // difference in milliseconds
    const diffInMilliseconds = Math.max(0, now - startTime);
    
    // hours, minutes, and seconds, floor always round down, 1h 1min 30s
    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60)); // 1.025, floor will get 1 = 1h
    const minutes = Math.floor((diffInMilliseconds / (1000 * 60)) % 60); // 61.5 min at (1000 * 60) % 60 to remove hour and get the remain 0.025 = 1.5(min+sec), floor get 1min
    const seconds = Math.floor((diffInMilliseconds / 1000) % 60); // get 0.5 of 61.5, 0.5 min = 30 sec
    
    // format with leading zeros
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}