import { NextRequest, NextResponse } from "next/server"
import { migrateBrands } from "../../../../../lib/data/brand-migration"

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dryRun = searchParams.get("dry_run") === "true"
    const batchSize = parseInt(searchParams.get("batch_size") || "100")
    const forceUpdate = searchParams.get("force_update") === "true"
    
    const results = await migrateBrands({
      dryRun,
      batchSize,
      forceUpdate
    })
    
    return NextResponse.json(results)
  } catch (error) {
    console.error("Brand migration API error:", error)
    return NextResponse.json(
      { 
        error: "Migration failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    
    if (action === "status") {
      // Return migration status
      const statusResults = await migrateBrands({
        dryRun: true,
        batchSize: 10,
        forceUpdate: false
      })
      
      return NextResponse.json({
        status: "ready",
        preview: statusResults
      })
    }
    
    return NextResponse.json({
      error: "Invalid action. Use ?action=status for migration preview"
    }, { status: 400 })
    
  } catch (error) {
    console.error("Brand migration status error:", error)
    return NextResponse.json(
      { 
        error: "Status check failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
} 