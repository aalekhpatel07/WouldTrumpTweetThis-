<script>
    import RangeSlider from 'svelte-range-slider-pips'
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher();

    export let voted = false;

    let percentageToHue = (p) => {
        let polynomial = (x) => {
            return 148 * (x ** 2) - 388 * x + 360
        }
        return Math.round(polynomial(p));
    }
    
    function handleStop({detail}){
        if(!voted) {
            dispatch('vote', {
                value: (detail.values[0] + 100)/200
            })
        }
    }

    const emojiMap = {
        '-100': '👎 fake',
        '0': '😐 idk maybe?',
        '100': '👍 real'
    }

    let hue = [0];
    let tick = (v) => {
        return emojiMap[`${v}`]
    }

    let topTick = (v) => {
        return v
    }

    $: percentage = (hue[0] + 100)/200;
    $: lightColor = `hsl(${percentageToHue(percentage)}, 89.1%, 53.1%)`;
    $: color = `hsl(${percentageToHue(percentage) - 10}, 89.1%, 53.1%)`;

</script>
<div
    class="w-full xl:w-96 px-8"
    style={`
        --range-handle-focus: ${color};
        --range-range: ${lightColor};
        --range-handle-inactive: ${lightColor};
        `}
>
   <RangeSlider
        bind:values={hue}
        min={-100}
        max={100}
        pips
        pipstep={100}
        all="label"
        formatter={tick}
        handleFormatter={topTick}
        on:stop={handleStop}
        disabled={voted}
    />
</div>