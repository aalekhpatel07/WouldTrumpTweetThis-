<script>
    import TweetBlock from './TweetBlock.svelte'
    import TweetOrNotBlock from './TweetOrNotBlock.svelte'
    import { onMount } from 'svelte'
    import TextContent from './TextContent.svelte'
    import Graphs from './Graphs.svelte'

    import numeral from 'numeral'
    import Footer from './Footer.svelte'
    
    // load a locale
    numeral.register('locale', 'enc', {
        abbreviations: {
            thousand: 'K',
            million: 'M',
            billion: 'B',
            trillion: 'T'
        },
    });

    numeral.locale('enc')

    function endpoint(action, version=1) {
        let BASE = 'https://would-trump-tweet-this.herokuapp.com/'
        return BASE + `api/v${version}/${action}`
    }
    const tweetEndpoint = endpoint('tweet')
    const voteEndpoint = endpoint('vote')

    export let voted = false;
    export let shouldReset = false;

    async function getTweet() {
        let response = await fetch(tweetEndpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        return await response.json()
    }

    async function castVote({ tweet_id, value }) {
        let response = await fetch(voteEndpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tweet_id,
                value
            })
        })
        return await response.json()
    }

    let tweet = undefined;
    
    function handleVote({detail}) {
        console.log(detail)
        voted = true
        castVote({
            tweet_id: tweet._id,
            value: detail.value
        })
        .then(() => {
        })
        .catch(err => {
            console.log(err)
        })
        .finally(() => {
            setTimeout(() => {
                shouldReset = true
            }, 3000)
        })
    }

    async function handleReset() {
        tweet = await getTweet()
        voted = false;
        shouldReset = false;
    }

    $: {
        if (shouldReset) {
            handleReset()
        }
    }

    onMount(async () => {
        tweet = await getTweet()
    })


</script>
<main>
    <div class="xl:flex" >
        <div class="xl:w-2/3 xl:overflow-auto">
            <TextContent/>
            <div
                class="mt-4 mx-auto flex justify-center items-center flex-col px-4"
            >
            {#if tweet}
                <TweetBlock
                    bind:conclusion={voted}
                    fullName="Donald Trump"
                    username="realDonaldTrump"
                    text={tweet.text}
                    date={new Date(tweet.date)}
                    favorites={Number.parseInt(tweet.favorites)}
                    retweets={Number.parseInt(tweet.retweets)}
                    real={tweet.real}
                />
                <br/>
                <!-- <article class="prose">
                    <h5>So... fake? or not? or maybe?</h5>
                </article> -->
                <br/>
                <TweetOrNotBlock
                    key={tweet}
                    on:vote={handleVote}
                    bind:voted
                />
                <br/>
                <button
                    class="rounded-full w-16 h-16 flex justify-center items-center"
                    style="background: rgb(29, 161, 242); color: white;"
                    on:click={handleReset}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
                <br/>
                <br/>
            {/if}
            </div>
        </div>
        <div
            class="xl:w-1/3"
        >
            <div
                class="border-t xl:border-l xl:border-t-0 h-auto w-auto xl:min-h-screen xl:fixed xl:w-full"
            >
                <Graphs
                    tweet={tweet}
                />
            </div>
        </div>
    </div>
    <Footer/>
</main>