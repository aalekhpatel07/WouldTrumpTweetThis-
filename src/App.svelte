<script>
    import TweetBlock from './TweetBlock.svelte'

    let BASE = 'http://localhost:5001/'
    if (process?.env?.isProd) {
        BASE = "/"
    }
    const ENDPOINT = 'api/v1/tweet'

    async function getTweet() {
        let response = await fetch(BASE + ENDPOINT, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        return await response.json()
    }

    let tweetPromise = getTweet()
    

</script>
<main>
    <div class="mx-auto flex justify-center items-center">
        {#await tweetPromise}
            <p> Loading tweet... </p>
        {:then tweet}
            <TweetBlock
                fullName="Donald Trump"
                username="realDonaldTrump"
                text={tweet.text}
                date={new Date(tweet.date)}
                favorites={Number.parseInt(tweet.favorites)}
                retweets={Number.parseInt(tweet.retweets)}
            />
        {:catch error}
            <p class="text-red-500">{error.message}</p>
        {/await}
    </div>
</main>