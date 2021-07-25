<svelte:head>
</svelte:head>

<script>
    import { onMount } from "svelte"

    export let tweet = {};

    onMount(() => {

        let plotDiv = document.getElementById('plotlyPlot');
        if (plotDiv) {
            new Plotly.newPlot('plotlyPlot', /* JSON object */ {
                "data": [{ "y": [1, 2, 3] }],
                "layout": { "width": 600, "height": 400}
            })
        }
    })

</script>

<article class="prose text-center mt-8">
<h2>Some Graphs</h2>
<p>Here's the raw data!</p>
    {JSON.stringify(tweet, null, 2)}
</article>

<div id="plotlyPlot">

</div>

