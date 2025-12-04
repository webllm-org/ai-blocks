"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Sparkles, ExternalLink } from "lucide-react"

// Simulated search results
const searchResults = {
  "best laptop 2024": [
    { title: "MacBook Pro M3 Review", snippet: "The M3 chip delivers exceptional performance. Battery life improved to 22 hours. Starting at $1,599." },
    { title: "Dell XPS 15 Analysis", snippet: "OLED display option, Intel Core Ultra. Great for professionals. Priced from $1,299." },
    { title: "ThinkPad X1 Carbon Gen 12", snippet: "Business-focused, excellent keyboard. 14-inch display, lightweight at 2.48 lbs. From $1,449." },
    { title: "Framework Laptop 16", snippet: "Modular design, user-upgradeable. AMD Ryzen option. Unique approach to sustainability." },
  ],
  "healthy breakfast ideas": [
    { title: "10 Quick Breakfast Recipes", snippet: "Overnight oats, Greek yogurt parfaits, smoothie bowls. Prep time under 10 minutes." },
    { title: "High-Protein Morning Meals", snippet: "Eggs, cottage cheese, protein pancakes. Great for muscle building and satiety." },
    { title: "Mediterranean Breakfast Guide", snippet: "Whole grains, olive oil, fresh vegetables. Heart-healthy and delicious." },
    { title: "Vegan Breakfast Options", snippet: "Tofu scramble, chia pudding, avocado toast. Plant-based nutrition to start your day." },
  ],
  "learn guitar": [
    { title: "Guitar Basics for Beginners", snippet: "Start with open chords: G, C, D, Em. Practice 15-30 minutes daily." },
    { title: "Best Online Guitar Courses", snippet: "JustinGuitar (free), Fender Play ($10/mo), Guitar Tricks. Structured learning paths." },
    { title: "Essential Guitar Gear", snippet: "Acoustic vs electric for beginners. Picks, tuner, capo. Budget options available." },
    { title: "Common Beginner Mistakes", snippet: "Poor posture, pressing too hard, skipping basics. Tips to avoid frustration." },
  ]
}

export function SearchSummaryDemo() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<typeof searchResults["best laptop 2024"]>([])
  const [summary, setSummary] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)

  const search = async () => {
    if (!query.trim()) return

    setIsSearching(true)
    setSummary("")
    setResults([])

    // Simulate search delay
    await new Promise(r => setTimeout(r, 300))

    // Find matching results or use default
    const lowerQuery = query.toLowerCase()
    let matchedResults = searchResults["best laptop 2024"]

    for (const [key, value] of Object.entries(searchResults)) {
      if (lowerQuery.includes(key.split(" ")[0]) || key.includes(lowerQuery.split(" ")[0])) {
        matchedResults = value
        break
      }
    }

    setResults(matchedResults)
    setIsSearching(false)

    // Generate summary
    setIsSummarizing(true)
    try {
      const resultsText = matchedResults.map(r => `${r.title}: ${r.snippet}`).join("\n")

      const result = await generateText({
          prompt: `Summarize these search results for "${query}" in 2-3 sentences. Be helpful and direct.

Results:
${resultsText}

Summary:`,
          temperature: 0.5,
          maxTokens: 100,
        })

      setSummary(result.text.trim())
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") search()
  }

  return (
    <div className="space-y-4 w-full max-w-xl mx-auto">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search anything..."
            className="pl-10"
          />
        </div>
        <Button onClick={search} disabled={isSearching || !query.trim()}>
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      {/* Quick Searches */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(searchResults).map(q => (
          <Badge
            key={q}
            variant="secondary"
            className="cursor-pointer text-xs"
            onClick={() => {
              setQuery(q)
              setTimeout(search, 100)
            }}
          >
            {q}
          </Badge>
        ))}
      </div>

      {/* AI Summary */}
      {(isSummarizing || summary) && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Summary</span>
            </div>
            {isSummarizing ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Summarizing results...
              </div>
            ) : (
              <p className="text-sm">{summary}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            {results.length} results
          </div>
          {results.map((result, index) => (
            <Card key={index} className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm text-primary flex items-center gap-1">
                      {result.title}
                      <ExternalLink className="h-3 w-3" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{result.snippet}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isSearching && results.length === 0 && query && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No results found. Try one of the suggested searches.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
