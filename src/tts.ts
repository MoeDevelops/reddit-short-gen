import { readdirSync, readFileSync, writeFileSync } from "node:fs"

type Comment = {
    fileName: string
    text: string
}

async function getComments() {
    const comments: Comment[] = []

    const fileNames = readdirSync("out/comments", {})

    for (const fileRaw of fileNames) {
        const fileName = fileRaw.toString()
        const text = readFileSync(`out/comments/${fileName}`, {}).toString()

        comments.push({
            fileName: fileName.replace(".txt", "").replace("comment", ""),
            text: text,
        })
    }

    return comments
}

async function createAudioFile(comment: Comment) {
    const result = await fetch(
        "https://tiktok-tts.printmechanicalbeltpumpkingutter.workers.dev/api/generation",
        {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                text: comment.text,
                voice: "en_us_010",
            }),
        },
    )

    type Audio = {
        audio: string
    }

    const audio: Audio = await result.json()
    const base64Audio = audio.audio
    writeFileSync(`out/audios/audio${comment.fileName}.mp3`, base64Audio, {
        encoding: "base64",
    })
}

export async function createAudioFiles() {
    const comments = await getComments()

    for (const comment of comments) {
        createAudioFile(comment)
    }
}
