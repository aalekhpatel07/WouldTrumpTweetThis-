import { writable } from 'svelte/store'

function createStreak() {
    const { subscribe, set, update } = writable(0);
    return {
        subscribe,
        increment: () => update(n => n + 1),
        decrement: () => update(n => n - 1),
        reset: () => update(n => 0)
    }
}

export const streak = createStreak();
export const bestScore = writable(0);

export function increment(){
    streak.update(n => n + 1)
    if(streak > bestStreak){
        bestStreak.update(n => streak)
    }
}

export function decrement(){
    streak.update(n => n - 1)
}

export function resetStreak(){
    streak.update(n => 0)
}