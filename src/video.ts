import { readdir } from "node:fs/promises"
import { $ } from "bun"

async function getMediaLength(path: string) {
	const result =
		await $`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${path}`.text()
	return parseFloat(result)
}

async function processVideo(videoStart: number) {
	const audioFiles = (await readdir("out/audios"))
		.map((path) => `out/audios/${path}`)
		.toSorted()
	const screenshotFiles = (await readdir("out/screenshots"))
		.map((path) => `out/screenshots/${path}`)
		.toSorted()

	const audioFilesForProcessing = audioFiles.join("|out/cache/silence.mp3|")
	await $`ffmpeg -i "concat:${audioFilesForProcessing}" -y out/cache/audio.mp3`

	const inputs = ["-i", "in/background.mp4"]
	const conversions: string[] = []
	const filters: string[] = []
	let currentStart = videoStart
	let totalLength = 0
	let lastVar = "[0:v]"

	for (let i = 0; i < screenshotFiles.length; i++) {
		const audioLength = await getMediaLength(audioFiles[i] ?? "")
		const screenshotFile = screenshotFiles[i] ?? ""

		const start = currentStart
		const end = currentStart + audioLength + 1.0
		totalLength += audioLength + 1.0
		currentStart = end

		inputs.push("-i")
		inputs.push(screenshotFile)
		conversions.push(`[${i + 1}:v]scale=1080:-1[img${i}];`)

		const newVar = i === screenshotFiles.length - 1 ? "" : `[tmp${i}]`
		filters.push(
			`${lastVar}[img${i}]overlay=x=(main_w-overlay_w)/2:y=(main_h-overlay_h)/2:enable='between(t,${start},${end})'${newVar};`,
		)
		lastVar = newVar
	}

	await $`ffmpeg ${inputs} -filter_complex "${conversions.join("")}${filters.join("")}" -ss ${videoStart} -t ${totalLength} -y out/cache/video.mp4`
	await $`ffmpeg -i out/cache/video.mp4 -i out/cache/audio.mp3 -c:v copy -map 0:v:0 -map 1:a:0 -y out/final.mp4`
}

export async function makeVideo() {
	await $`ffmpeg -y -f lavfi -t 1 -i anullsrc=r=44100:cl=stereo out/cache/silence.mp3`

	const bgVidLen = await getMediaLength("in/background.mp4")

	if (bgVidLen < 200) {
		console.error("input video is too short!")
		return
	}

	const bgVidStart = Math.floor(Math.random() * (bgVidLen - 185))
	await processVideo(bgVidStart)
}
