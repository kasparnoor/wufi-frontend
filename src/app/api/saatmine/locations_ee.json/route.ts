import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // Get the path to the locations file in the public directory
    const filePath = path.join(process.cwd(), 'public', 'saatmine', 'locations_ee.json')
    
    console.log('Looking for file at:', filePath)
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('Locations file not found:', filePath)
      return new NextResponse('Not Found', { status: 404 })
    }
    
    console.log('File exists, reading content...')
    
    // Read the file
    const fileContents = fs.readFileSync(filePath, 'utf8')
    
    console.log('File read successfully, content length:', fileContents.length)
    
    // Return the JSON data with proper headers
    return new NextResponse(fileContents, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error serving locations file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 