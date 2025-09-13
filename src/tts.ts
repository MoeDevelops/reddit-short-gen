import { readdir, readFile } from "node:fs/promises"
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"

type Comment = {
	fileName: string
	text: string
}

async function getComments() {
	const comments: Comment[] = []

	const fileNames = await readdir("out/comments")

	for (const fileRaw of fileNames) {
		const fileName = fileRaw.toString()
		const text = await readFile(`out/comments/${fileName}`).then((buffer) =>
			buffer.toString("utf-8"),
		)

		comments.push({
			fileName: fileName.replace(".txt", "").replace("comment", ""),
			text: text,
		})
	}

	return comments
}

async function createAudioFile(
	comment: Comment,
	elevenlabsApiKey: string,
	elevenlabsVoiceId: string,
) {
	const client = new ElevenLabsClient({
		apiKey: elevenlabsApiKey,
	})

	const audio = await client.textToSpeech.convert(elevenlabsVoiceId, {
		text: comment.text,
		modelId: "eleven_flash_v2_5",
		outputFormat: "mp3_44100_128",
	})

	const chunks = []
	for await (const chunk of audio) {
		chunks.push(chunk)
	}

	const audioBuffer = Buffer.concat(chunks)
	const uint8Array = new Uint8Array(
		audioBuffer.buffer,
		audioBuffer.byteOffset,
		audioBuffer.byteLength,
	)

	await Bun.write(`out/audios/audio${comment.fileName}.mp3`, uint8Array)
}

export async function createAudioFiles(
	elevenlabsApiKey: string,
	elevenlabsVoiceId: string,
) {
	const comments = await getComments()

	for (const comment of comments) {
		await createAudioFile(comment, elevenlabsApiKey, elevenlabsVoiceId)
	}
}
