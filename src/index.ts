import { takeScreenshots } from "./crawler"
import { prepare } from "./prepare"
import { createAudioFiles } from "./tts"
import { makeVideo } from "./video"

const redditSessionId = Bun.env.REDDIT_SESSION_ID
if (!redditSessionId) throw new Error("Reddit Session ID is not defined")

const redditUrl = Bun.env.REDDIT_URL
if (!redditUrl) throw new Error("Reddit URL is not defined")

const elevenlabsApiKey = Bun.env.ELEVENLABS_API_KEY
if (!elevenlabsApiKey) throw new Error("Elevenlabs API Key is not defined")

const elevenlabsVoiceId = Bun.env.ELEVENLABS_VOICE_ID
if (!elevenlabsVoiceId) throw new Error("Elevenlabs Voice ID is not defined")

await prepare()
await takeScreenshots(redditSessionId, redditUrl)
await createAudioFiles(elevenlabsApiKey, elevenlabsVoiceId)
await makeVideo()

console.log("Done! Check the out/ directory for the result")
