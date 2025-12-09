"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, ChefHat, Plus, X, RefreshCw, Clock, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface Recipe {
  name: string
  description: string
  cookTime: string
  servings: number
  difficulty: "easy" | "medium" | "hard"
  steps: string[]
  tips: string
}

export interface RecipeFromIngredientsDemoProps {
  /** Default ingredients */
  defaultIngredients?: string[]
}

export function RecipeFromIngredientsDemo({
  defaultIngredients = ["chicken breast", "garlic", "lemon", "olive oil"],
}: RecipeFromIngredientsDemoProps = {}) {
  const [ingredients, setIngredients] = useState<string[]>(defaultIngredients)
  const [newIngredient, setNewIngredient] = useState("")
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim().toLowerCase())) {
      setIngredients([...ingredients, newIngredient.trim().toLowerCase()])
      setNewIngredient("")
    }
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const handleGenerate = async () => {
    if (ingredients.length < 2) return
    setIsLoading(true)
    setRecipe(null)

    try {
      const response = await generateText({
        prompt: `Create a recipe using these ingredients:

Available: ${ingredients.join(", ")}

Requirements:
- Use at least 3 of the listed ingredients
- Can assume basic pantry staples (salt, pepper, butter, etc.)
- Make it practical and tasty
- Include clear step-by-step instructions

Return as JSON:
{
  "name": "Creative recipe name",
  "description": "Brief appetizing description",
  "cookTime": "30 minutes",
  "servings": 2,
  "difficulty": "easy|medium|hard",
  "steps": ["Step 1", "Step 2", "Step 3"],
  "tips": "A helpful cooking tip for this dish"
}

Be creative with the recipe name!`,
        maxTokens: 500,
      })

      const parsed = JSON.parse(response.text)
      setRecipe(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">What ingredients do you have?</Label>
        <div className="flex flex-wrap gap-2">
          {ingredients.map((ingredient, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="px-3 py-1 flex items-center gap-1"
            >
              {ingredient}
              <button
                onClick={() => removeIngredient(i)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            placeholder="Add an ingredient..."
            onKeyDown={(e) => e.key === "Enter" && addIngredient()}
          />
          <Button
            variant="outline"
            onClick={addIngredient}
            disabled={!newIngredient.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isLoading || ingredients.length < 2}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Cooking up ideas...
          </>
        ) : (
          <>
            <ChefHat className="h-4 w-4 mr-2" />
            Generate Recipe
          </>
        )}
      </Button>

      {recipe && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <h3 className="text-xl font-bold">{recipe.name}</h3>
              <p className="text-sm text-muted-foreground">{recipe.description}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {recipe.cookTime}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                {recipe.servings} servings
              </div>
              <Badge className={getDifficultyColor(recipe.difficulty)}>
                {recipe.difficulty}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Instructions:</p>
              <ol className="space-y-2">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">💡 Chef's tip:</p>
              <p className="text-sm">{recipe.tips}</p>
            </div>

            <Button
              variant="outline"
              onClick={handleGenerate}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Different Recipe
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
