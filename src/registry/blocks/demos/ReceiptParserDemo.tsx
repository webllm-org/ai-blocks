"use client"

import { useState } from "react"
import { generateText } from "@webllm/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Receipt, Download, Copy, Check } from "lucide-react"

interface ParsedReceipt {
  merchant: string
  date: string
  items: { name: string; quantity: number; price: number }[]
  subtotal: number
  tax: number
  total: number
  paymentMethod?: string
  category: string
}

export interface ReceiptParserDemoProps {
  /** Default receipt text */
  defaultReceipt?: string
}

export function ReceiptParserDemo({
  defaultReceipt = `WHOLE FOODS MARKET
123 Main Street
New York, NY 10001

Date: 01/15/2024 2:34 PM

Organic Bananas      $2.99
Almond Milk 64oz     $4.49
Sourdough Bread      $5.99
Free Range Eggs      $6.99
Avocados (3)         $4.50
Greek Yogurt         $5.49

Subtotal:           $30.45
Tax (8.875%):        $2.70
Total:              $33.15

VISA ****4521
Thank you for shopping!`,
}: ReceiptParserDemoProps = {}) {
  const [receiptText, setReceiptText] = useState(defaultReceipt)
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleParse = async () => {
    if (!receiptText.trim()) return
    setIsLoading(true)
    setParsed(null)

    try {
      const response = await generateText({
        prompt: `Parse this receipt into structured data:

${receiptText}

Extract all information and return as JSON:
{
  "merchant": "Store name",
  "date": "YYYY-MM-DD",
  "items": [
    {"name": "Item name", "quantity": 1, "price": 0.00}
  ],
  "subtotal": 0.00,
  "tax": 0.00,
  "total": 0.00,
  "paymentMethod": "VISA ****4521",
  "category": "groceries/restaurant/retail/other"
}

Parse prices as numbers. Infer quantity from text if not explicit.`,
        maxTokens: 500,
      })

      const parsed = JSON.parse(response.text)
      setParsed(parsed)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!parsed) return
    await navigator.clipboard.writeText(JSON.stringify(parsed, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportCSV = () => {
    if (!parsed) return
    const headers = "Item,Quantity,Price\n"
    const rows = parsed.items.map(i => `"${i.name}",${i.quantity},${i.price.toFixed(2)}`).join('\n')
    const totals = `\n\nSubtotal,,${parsed.subtotal.toFixed(2)}\nTax,,${parsed.tax.toFixed(2)}\nTotal,,${parsed.total.toFixed(2)}`
    const csv = headers + rows + totals

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${parsed.date || 'export'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      groceries: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      restaurant: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      retail: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    }
    return colors[category] || colors.other
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      <div className="space-y-2">
        <Label className="text-sm">Receipt text</Label>
        <Textarea
          value={receiptText}
          onChange={(e) => setReceiptText(e.target.value)}
          placeholder="Paste receipt text here..."
          rows={8}
          className="font-mono text-xs"
        />
      </div>

      <Button
        onClick={handleParse}
        disabled={isLoading || !receiptText.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Parsing...
          </>
        ) : (
          <>
            <Receipt className="h-4 w-4 mr-2" />
            Parse Receipt
          </>
        )}
      </Button>

      {parsed && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{parsed.merchant}</h3>
                <p className="text-sm text-muted-foreground">{parsed.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getCategoryColor(parsed.category)}>
                  {parsed.category}
                </Badge>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsed.items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${parsed.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${parsed.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t">
                <span>Total</span>
                <span>${parsed.total.toFixed(2)}</span>
              </div>
            </div>

            {parsed.paymentMethod && (
              <p className="text-xs text-muted-foreground">
                Paid with: {parsed.paymentMethod}
              </p>
            )}

            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex-1"
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-1" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                Copy JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
