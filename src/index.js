import fs from 'fs'
import core from '@actions/core'
import { TwitterApi } from 'twitter-api-v2'

function requiredInput(param) {
  if (!core.getInput(param)) throw new Error(`${param} is a required input`)
}

;(async () => {
    try {
        if (core.getInput('type') !== 'json') throw Error(`${core.getInput('type')} feed type not supported`)

        const feed = JSON.parse(core.getInput('feed'))
        const status = JSON.parse(core.getInput('status'))

        if (core.getInput('targets').split(',').includes('twitter')) {

            requiredInput('twitter-consumer-key')
            requiredInput('twitter-consumer-secret')
            requiredInput('twitter-access-token')
            requiredInput('twitter-access-token-secret')

            const twitterClient = new TwitterApi({
                appKey: core.getInput('twitter-consumer-key'),
                appSecret: core.getInput('twitter-consumer-secret'),
                accessToken: core.getInput('twitter-access-token'),
                accessSecret: core.getInput('twitter-access-token-secret'),
            })

            for (post of feed.items) {
                const { title, url } = post

                if (!status.items[url].twitter) {
                    const { data: createdTweet } = await twitterClient.v2.tweet(`New blog post: ${title} ${url}`);
                    status.items = status.items || {}
                    status.items[url] = {...status[url], twitter: true, tweetID: createdTweet.id }
                }
            }

        }

        status.updated = Date.now()
        core.setOutput('status', JSON.stringify(status))

    } catch (e) {
        core.setFailed(error.message)
    }

})()
