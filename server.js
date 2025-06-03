const express = require("express")
const fs = require("fs").promises
const path = require("path")
const bodyParser = require("body-parser")

const app = express()
const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, "public")))
app.use(bodyParser.json())

async function readJSONFile(filename) {
  try {
    const data = await fs.readFile(path.join(__dirname, filename), "utf8")
    return JSON.parse(data)
  } catch (error) {
    if (error.code === "ENOENT") {
      console.warn(`File not found: ${filename}. Returning default empty data.`)
      if (filename.endsWith("s.json") || filename === "bookmarks.json") return []
      return {}
    }
    console.error(`Error reading JSON file ${filename}:`, error)
    return null
  }
}

async function writeJSONFile(filename, data) {
  try {
    await fs.writeFile(path.join(__dirname, filename), JSON.stringify(data, null, 2), "utf8")
    return true
  } catch (error) {
    console.error(`Error writing JSON file ${filename}:`, error)
    return false
  }
}

let allPlacesDataCache = null
async function getAllPlacesCached() {
  if (allPlacesDataCache) return allPlacesDataCache
  console.log("Reading places.json from disk for cache...")
  allPlacesDataCache = await readJSONFile("places.json")
  if (!allPlacesDataCache || typeof allPlacesDataCache !== "object" || Object.keys(allPlacesDataCache).length === 0) {
    console.error("Failed to load or parse places.json, or it's empty. Using default structure.")
    allPlacesDataCache = { southwesternregion: [], northeasternregion: [], JungguDistrict: [] }
  }
  return allPlacesDataCache
}
getAllPlacesCached().then(() => console.log("Places data initially pre-loaded or default set."))

app.get("/api/places", async (req, res) => {
  const places = await getAllPlacesCached()
  if (!places) return res.status(500).json({ error: "Failed to load places data." })
  res.json(places)
})

app.get("/api/search", async (req, res) => {
  const { lang = "ko", keyword, region } = req.query
  const placesData = await getAllPlacesCached()

  if (!placesData) return res.status(500).json({ error: "Failed to load places data." })

  let results = []

  if (region && region !== "all") {
    if (placesData[region] && Array.isArray(placesData[region])) {
      results = [...placesData[region]]
    } else {
      results = []
    }
  } else {
    Object.values(placesData).forEach((regionPlaces) => {
      if (Array.isArray(regionPlaces)) results.push(...regionPlaces)
    })
  }

  if (keyword) {
    const lowerKeyword = keyword.toLowerCase()
    results = results.filter((place) => {
      if (!place || typeof place.name !== 'object' || typeof place.description !== 'object') return false
      const nameInLang = place.name[lang]?.toLowerCase() || ""
      const nameInKo = place.name.ko?.toLowerCase() || ""
      const descInLang = place.description[lang]?.toLowerCase() || ""
      const descInKo = place.description.ko?.toLowerCase() || ""
      return (
        nameInLang.includes(lowerKeyword) ||
        nameInKo.includes(lowerKeyword) ||
        descInLang.includes(lowerKeyword) ||
        descInKo.includes(lowerKeyword)
      )
    })
  }

  res.json(results)
})

app.get("/api/stats", async (req, res) => {
  const placesData = await getAllPlacesCached()
  const visitsData = await readJSONFile("visits.json") || {}

  if (!placesData) return res.status(500).json({ error: "Failed to load places data." })

  const totalPlaces = Object.values(placesData).reduce((sum, region) => sum + (region.length || 0), 0)
  const totalVisits = Object.values(visitsData).reduce((sum, count) => sum + (Number(count) || 0), 0)

  const popularPlaces = Object.entries(visitsData)
    .map(([id, visitCount]) => ({ id, visitCount: Number(visitCount) || 0 }))
    .sort((a, b) => b.visitCount - a.visitCount)

  res.json({ totalPlaces, totalVisits, popularPlaces })
})

app.post("/api/places/:id/visit", async (req, res) => {
  const placeId = req.params.id
  const visitsData = await readJSONFile("visits.json") || {}
  visitsData[placeId] = (visitsData[placeId] || 0) + 1
  if (await writeJSONFile("visits.json", visitsData)) {
    res.json({ message: "Visit recorded", placeId, visitCount: visitsData[placeId] })
  } else {
    res.status(500).json({ error: "Failed to record visit" })
  }
})

app.get("/api/bookmarks", async (req, res) => {
  const bookmarks = await readJSONFile("bookmarks.json")
  res.json(bookmarks || [])
})

app.post("/api/bookmark", async (req, res) => {
  const { placeId } = req.body
  if (!placeId) return res.status(400).json({ error: "placeId is required" })
  const bookmarks = await readJSONFile("bookmarks.json") || []
  if (!bookmarks.includes(placeId)) {
    bookmarks.push(placeId)
    if (await writeJSONFile("bookmarks.json", bookmarks)) {
      res.status(201).json({ message: "Bookmark added", placeId })
    } else {
      res.status(500).json({ error: "Failed to save bookmark" })
    }
  } else {
    res.status(200).json({ message: "Bookmark already exists", placeId })
  }
})

app.delete("/api/bookmark/:id", async (req, res) => {
  const placeIdToRemove = req.params.id
  let bookmarks = await readJSONFile("bookmarks.json") || []
  const initialLength = bookmarks.length
  bookmarks = bookmarks.filter((id) => id !== placeIdToRemove)
  if (bookmarks.length < initialLength) {
    if (await writeJSONFile("bookmarks.json", bookmarks)) {
      res.status(200).json({ message: "Bookmark removed", placeId: placeIdToRemove })
    } else {
      res.status(500).json({ error: "Failed to remove bookmark" })
    }
  } else {
    res.status(404).json({ error: "Bookmark not found" })
  }
})

app.get("/api/visits", async (req, res) => {
  const visits = await readJSONFile("visits.json")
  res.json(visits || {})
})

app.get("/api/translations/:lang", async (req, res) => {
  const lang = req.params.lang || "ko"
  const translations = await readJSONFile("translations.json")
  if (translations?.[lang]) {
    res.json(translations[lang])
  } else if (translations?.["ko"]) {
    res.json(translations["ko"])
  } else {
    res.status(404).json({ error: "Translations not found" })
  }
})

app.get("/api/recommend", async (req, res) => {
  const { theme = "default", duration = "half", lang = "ko" } = req.query
  const placesData = await getAllPlacesCached()
  if (!placesData) return res.status(500).json({ error: "No places data available." })

  const allPlaces = Object.values(placesData).flat().filter(place => place && place.id)
  if (!allPlaces.length) return res.status(500).json({ error: "No valid places found." })

  const shuffled = allPlaces.sort(() => 0.5 - Math.random())
  const courseLength = duration === "full" ? 5 : 3
  const recommendedPlaces = shuffled.slice(0, courseLength)

  res.json({
    theme,
    duration,
    recommendedPlaces
  })
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
  console.log(`Serving static files from: ${path.join(__dirname, "public")}`)
})
