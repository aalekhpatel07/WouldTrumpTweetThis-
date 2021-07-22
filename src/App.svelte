<script>
	export let tweet = 'Code refactoring is an art to deliver the same (or better) performance with a leaner muscle 💪🎫';
</script>
<main>
    <blockquote class="twitter-tweet" data-lang="en">
        <p lang="en" dir="ltr">
            {tweet}
        </p>
        — Donald Trump (@donaldtrump)
    </blockquote>
</main>

<style>
    blockquote.twitter-tweet {
        display: inline-block;
        font-family: "Helvetica Neue", Roboto, "Segoe UI", Calibri, sans-serif;
        font-size: 12px;
        font-weight: bold;
        line-height: 16px;
        border-color: #eee #ddd #bbb;
        border-radius: 5px;
        border-style: solid;
        border-width: 1px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        margin: 10px 5px;
        padding: 0 16px 16px 16px;
        max-width: 468px;
    }

    blockquote.twitter-tweet p {
        font-size: 16px;
        font-weight: normal;
        line-height: 20px;
    }

    blockquote.twitter-tweet a {
        color: inherit;
        font-weight: normal;
        text-decoration: none;
        outline: 0 none;
    }

    blockquote.twitter-tweet a:hover,
    blockquote.twitter-tweet a:focus {
        text-decoration: underline;
    }

</style>
