import { writable } from 'svelte/store'

let localStorage = window?.localStorage;

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

bestScore.subscribe(v => {
    if(localStorage) {
        let prev = localStorage.getItem('wttt-best-score')
        if (prev) {
            localStorage.setItem('wttt-best-score', Math.max(v, prev))
        } else {
            localStorage.setItem('wttt-best-score', v)
        }
    }
})