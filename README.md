# Reddit Short Gen

Generate reddit shorts

## Preperation

### Video

- Get a 1080x1920 video to use as a background and put it in `in/background.mp4`

### Environment

- Copy the .env.example file to .env

#### Reddit

- Make a Reddit Account and extract the Session ID from the `reddit_session` cookie
- Put the Session ID into .env as `REDDIT_SESSION_ID`

- Select a Reddit Thread and copy its URL
- Put the URL into .env as `REDDIT_URL`

#### Elevenlabs (Voice)

- Make an ElevenLabs Account and generate an API Key
- Put the API Key into .env as `ELEVENLABS_API_KEY`

- Copy the Voice ID of a Voice you like on Elevenlabs
- Put the Voice ID inti .env as `ELEVENLABS_VOICE_ID`

### Dependencies

- Install bun (JS Runtime)
- Install FFmpeg (Software for video and audio)
- Install dependencies

```sh
bun i
```

## Running

- Start the program. This may take some time.

```sh
bun run start
```

- Get the result from out/final.mp4
