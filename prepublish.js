const fs = require("fs")

const filesToCopy = [
    "package.json",
    "package-lock.json",
    "README.md"
]

for (const fileToCopy of filesToCopy) {
    fs.copyFileSync(fileToCopy, "./js/" + fileToCopy)
}