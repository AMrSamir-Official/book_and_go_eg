"use client"

import { memo, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  UserCheck,
  UserX,
  Calendar,
  Monitor,
  Smartphone,
  Globe,
  Clock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  status: "active" | "inactive"
  lastLogin: string
  joinDate: string
  bookingsCount: number
  invoicesCount: number
  avatar?: string
}

interface LoginLog {
  id: string
  userId: string
  timestamp: string
  device: string
  browser: string
  ipAddress: string
  location: string
}

const sampleUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@bookandgo.com",
    role: "admin",
    status: "active",
    lastLogin: "2024-01-20T10:30:00Z",
    joinDate: "2023-01-15",
    bookingsCount: 0,
    invoicesCount: 0,
  },
  {
    id: "2",
    name: "John Smith",
    email: "john.smith@email.com",
    role: "user",
    status: "active",
    lastLogin: "2024-01-19T15:45:00Z",
    joinDate: "2023-06-20",
    bookingsCount: 5,
    invoicesCount: 3,
  },
  {
    id: "3",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    role: "user",
    status: "active",
    lastLogin: "2024-01-18T09:20:00Z",
    joinDate: "2023-08-10",
    bookingsCount: 8,
    invoicesCount: 6,
  },
  {
    id: "4",
    name: "Michael Brown",
    email: "michael.brown@email.com",
    role: "user",
    status: "inactive",
    lastLogin: "2023-12-15T14:30:00Z",
    joinDate: "2023-03-05",
    bookingsCount: 2,
    invoicesCount: 1,
  },
]

const sampleLoginLogs: LoginLog[] = [
  {
    id: "1",
    userId: "2",
    timestamp: "2024-01-20T10:30:00Z",
    device: "Desktop",
    browser: "Chrome 120.0",
    ipAddress: "192.168.1.100",
    location: "Cairo, Egypt",
  },
  {
    id: "2",
    userId: "2",
    timestamp: "2024-01-19T15:45:00Z",
    device: "Mobile",
    browser: "Safari 17.0",
    ipAddress: "192.168.1.101",
    location: "Cairo, Egypt",
  },
  {
    id: "3",
    userId: "3",
    timestamp: "2024-01-18T09:20:00Z",
    device: "Desktop",
    browser: "Firefox 121.0",
    ipAddress: "10.0.0.50",
    location: "Alexandria, Egypt",
  },
]

export const AdminUsersContent = memo(function AdminUsersContent() {
  const t = useTranslations("common")
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("users")

  const filteredUsers = useMemo(() => {
    return sampleUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm])

  const handleViewUser = useCallback((user: User) => {
    setSelectedUser(user)
    setActiveTab("details")
  }, [])

  const handleDeleteUser = useCallback(
    (userId: string) => {
      toast({
        title: "User Deleted",
        description: "The user has been removed from the system.",
      })
    },
    [toast],
  )

  const handleToggleStatus = useCallback(
    (userId: string, currentStatus: string) => {
      const newStatus = currentStatus === "active" ? "inactive" : "active"
      toast({
        title: "User Status Updated",
        description: `User has been ${newStatus === "active" ? "activated" : "deactivated"}.`,
      })
    },
    [toast],
  )

  const formatLastLogin = useCallback((timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }, [])

  const getDeviceIcon = useCallback((device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
      case "tablet":
        return <Smartphone className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }, [])

  const getUserLoginLogs = useCallback((userId: string) => {
    return sampleLoginLogs.filter((log) => log.userId === userId)
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
            <Users className="mr-3 h-8 w-8" />
            User Management
          </h1>
          <p className="text-muted-foreground">Manage users, view their activity, and monitor login logs</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">All Users</TabsTrigger>
            <TabsTrigger value="details">User Details</TabsTrigger>
            <TabsTrigger value="logs">Login Logs</TabsTrigger>
          </TabsList>

          {/* Users List Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>Manage and monitor all system users</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-full sm:w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Bookings</TableHead>
                        <TableHead>Invoices</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === "active" ? "default" : "destructive"}>{user.status}</Badge>
                          </TableCell>
                          <TableCell>{formatLastLogin(user.lastLogin)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.bookingsCount}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.invoicesCount}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.status)}>
                                  {user.status === "active" ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Details Tab */}
          <TabsContent value="details">
            {selectedUser ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>Detailed information about {selectedUser.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.name} />
                        <AvatarFallback className="text-2xl">
                          {selectedUser.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                        <p className="text-muted-foreground">{selectedUser.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Role</label>
                        <div className="mt-1">
                          <Badge variant={selectedUser.role === "admin" ? "default" : "secondary"}>
                            {selectedUser.role}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <div className="mt-1">
                          <Badge variant={selectedUser.status === "active" ? "default" : "destructive"}>
                            {selectedUser.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                        <div className="mt-1">{new Date(selectedUser.joinDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                        <div className="mt-1">{formatLastLogin(selectedUser.lastLogin)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Activity Summary</CardTitle>
                    <CardDescription>User's booking and invoice activity</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{selectedUser.bookingsCount}</div>
                        <div className="text-sm text-muted-foreground">Total Bookings</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{selectedUser.invoicesCount}</div>
                        <div className="text-sm text-muted-foreground">Total Invoices</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                        onClick={() => router.push(`/bookings?user=${selectedUser.id}`)}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        View All Bookings
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                        onClick={() => router.push(`/invoices?user=${selectedUser.id}`)}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        View All Invoices
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Login Logs for Selected User */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Login Activity</CardTitle>
                    <CardDescription>Latest login sessions for {selectedUser.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Device</TableHead>
                            <TableHead>Browser</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Location</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getUserLoginLogs(selectedUser.id).map((log) => (
                            <TableRow key={log.id}>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {getDeviceIcon(log.device)}
                                  <span>{log.device}</span>
                                </div>
                              </TableCell>
                              <TableCell>{log.browser}</TableCell>
                              <TableCell>
                                <code className="text-sm bg-muted px-2 py-1 rounded">{log.ipAddress}</code>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Globe className="h-4 w-4 text-muted-foreground" />
                                  <span>{log.location}</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No User Selected</h3>
                  <p className="text-muted-foreground text-center">
                    Select a user from the Users tab to view their details and activity.
                  </p>
                  <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setActiveTab("users")}>
                    Go to Users List
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Login Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>System Login Logs</CardTitle>
                <CardDescription>Monitor all user login activities across the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Browser</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleLoginLogs.map((log) => {
                        const user = sampleUsers.find((u) => u.id === log.userId)
                        return (
                          <TableRow key={log.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                                  <AvatarFallback className="text-xs">
                                    {user?.name?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-sm">{user?.name}</div>
                                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{new Date(log.timestamp).toLocaleString()}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {getDeviceIcon(log.device)}
                                <span className="text-sm">{log.device}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{log.browser}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">{log.ipAddress}</code>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{log.location}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
})
