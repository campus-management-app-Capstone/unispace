// client helper - avoids importing server packages into a browser bundle
// pages -> lib file -> api (usually for thrid party call)
// can also pages -> lib file for all back end

export async function getUserWallet() {
    const res = await fetch('/api/wallet');
    if (!res.ok) {
        throw new Error(`Failed to load wallet data: ${res.status}`);
    }
    return res.json();
}