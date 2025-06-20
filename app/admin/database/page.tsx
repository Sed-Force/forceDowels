'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface DatabaseStatus {
  connectionWorking: boolean
  connectionTime: string
  ordersTableExists: boolean
  currentOrderCount: number
  tableStructure: Array<{
    column_name: string
    data_type: string
    is_nullable: string
    column_default: string
  }>
  indexes: string[]
  databaseReady: boolean
}

export default function DatabaseAdminPage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkDatabaseStatus = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/init-database')
      const data = await response.json()
      
      if (data.success) {
        setStatus(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check database status')
    } finally {
      setLoading(false)
    }
  }

  const initializeDatabase = async () => {
    setInitializing(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/init-database', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        setStatus({
          connectionWorking: true,
          connectionTime: data.data.connectionTime,
          ordersTableExists: true,
          currentOrderCount: data.data.currentOrderCount,
          tableStructure: data.data.tableStructure,
          indexes: data.data.indexes,
          databaseReady: true
        })
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize database')
    } finally {
      setInitializing(false)
    }
  }

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="h-8 w-8" />
          Database Administration
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage and monitor your Force Dowels database
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Database Status
              <Button
                variant="outline"
                size="sm"
                onClick={checkDatabaseStatus}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </CardTitle>
            <CardDescription>
              Current status of your database connection and tables
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !status ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Checking database status...</span>
              </div>
            ) : status ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {status.connectionWorking ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                    <div className="text-sm font-medium">Connection</div>
                    <Badge variant={status.connectionWorking ? "default" : "destructive"}>
                      {status.connectionWorking ? "Working" : "Failed"}
                    </Badge>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {status.ordersTableExists ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                    <div className="text-sm font-medium">Orders Table</div>
                    <Badge variant={status.ordersTableExists ? "default" : "destructive"}>
                      {status.ordersTableExists ? "Exists" : "Missing"}
                    </Badge>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {status.currentOrderCount}
                    </div>
                    <div className="text-sm font-medium">Total Orders</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {status.indexes.length}
                    </div>
                    <div className="text-sm font-medium">Indexes</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Last checked: {new Date(status.connectionTime).toLocaleString()}
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Initialize Database */}
        {status && !status.databaseReady && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Database Setup Required</CardTitle>
              <CardDescription className="text-orange-700">
                Your database needs to be initialized to handle incoming orders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={initializeDatabase}
                disabled={initializing}
                className="w-full"
              >
                {initializing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Initializing Database...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Initialize Database
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Database Ready */}
        {status && status.databaseReady && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Database Ready
              </CardTitle>
              <CardDescription className="text-green-700">
                Your database is properly configured and ready to handle orders.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
}
