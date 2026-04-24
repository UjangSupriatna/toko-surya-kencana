import seedData from '@/data/db.json'
import type { AppData } from './types'

// Deep clone for mutable in-memory state
let data: AppData = JSON.parse(JSON.stringify(seedData))

export async function readData(): Promise<AppData> {
  return data
}

export async function writeData(newData: AppData): Promise<void> {
  data = newData
  // Only write to file in dev
  if (process.env.NODE_ENV === 'development') {
    try {
      const { writeFileSync } = await import('fs')
      const { join } = await import('path')
      writeFileSync(join(process.cwd(), 'src/data/db.json'), JSON.stringify(data, null, 2))
    } catch {}
  }
}
