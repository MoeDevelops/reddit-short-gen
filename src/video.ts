import ffmpeg from "fluent-ffmpeg"

const inPath = "in/background.mp4"

function getVideoLength(): Promise<number> {
    return new Promise((resolve) => {
        ffmpeg.ffprobe(inPath, (_, data) => {
            return resolve(data.format.duration ?? 0)
        })
    })
}

export async function makeVideo() {
    const bgVidLen = await getVideoLength()

    if (bgVidLen < 200) {
        console.error("input video is too short!")
    }

    const bgVidStart = Math.floor(Math.random() * (bgVidLen - 185))

    ffmpeg()
        .input(inPath)
        .setStartTime(bgVidStart)
        .setDuration(bgVidStart + 180)
        .saveToFile("out/video.mp4")
}
