"use client"

import type React from "react"

import { createContext, useState, useEffect, type ReactNode } from "react"

// This is a placeholder for your actual data structure
interface AppData {
  "@definitions": {
    "@actors": {
      OilShape: {
        "@state": Array<{
          polygon: string
        }>
      }
    }
  }
}

interface AppContextType {
  data: AppData | null
  loading: boolean
  error: string | null
}

// Create context with default values
export const AppContext = createContext<AppContextType>({
  data: null,
  loading: false,
  error: null,
})

// Sample data for demonstration
const sampleData: AppData = {
  "@definitions": {
    "@actors": {
      OilShape: {
        "@state": [
          {
            polygon: JSON.stringify({
              type: "MultiPoint",
              coordinates: Array.from({ length: 100 }, () => [Math.random() * 360 - 180, Math.random() * 180 - 90]),
            }),
          },
        ],
      },
    },
  },
}

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate data fetching
    const fetchData = async () => {
      try {
        // In a real app, you would fetch data from an API
        // For now, we'll use the sample data with a delay to simulate loading
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setData(sampleData)
        setLoading(false)
      } catch {
        setError("Failed to fetch data")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return <AppContext.Provider value={{ data, loading, error }}>{children}</AppContext.Provider>
}

