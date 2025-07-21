"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useDuesStore } from "@/lib/store"
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DueFormData {
  type: "owed_to_me" | "i_owe"
  amount: number
  currency: "USD" | "EGP"
  person: string
  description: string
  dueDate: string
}

export function DuesPageClient() {
  const t = useTranslations("common")
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const highlightId = searchParams.get("highlight")
  const { entries, addEntry, updateEntry, deleteEntry, markAsPaid, getTotalOwedToMe, getTotalIOwe } = useDuesStore()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "paid" | "overdue">("all")
  const [filterType, setFilterType] = useState<"all" | "owed_to_me" | "i_owe">("all")
  const [formData, setFormData] = useState<DueFormData>({
    type: "owed_to_me",
    amount: 0,
    currency: "USD",
    person: "",
    description: "",
    dueDate: "",
  })

  // Highlight effect for notifications
  useEffect(() => {
    if (highlightId) {
      const element = document.getElementById(`due-${highlightId}`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.classList.add("ring-2", "ring-primary", "ring-offset-2")
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-primary", "ring-offset-2")
        }, 3000)
      }
    }
  }, [highlightId])

  const resetForm = () => {
    setFormData({
      type: "owed_to_me",
      amount: 0,
      currency: "USD",
      person: "",
      description: "",
      dueDate: "",
    })
    setEditingEntry(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.person || !formData.description || !formData.dueDate || formData.amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values.",
        variant: "destructive",
      })
      return
    }

    if (editingEntry) {
      updateEntry(editingEntry, formData)
      toast({
        title: "Entry Updated",
        description: "The due entry has been updated successfully.",
      })
    } else {
      addEntry(formData)
      toast({
        title: "Entry Added",
        description: "New due entry has been added successfully.",
      })
    }

    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (entry: any) => {
    setFormData({
      type: entry.type,
      amount: entry.amount,
      currency: entry.currency,
      person: entry.person,
      description: entry.description,
      dueDate: entry.dueDate,
    })
    setEditingEntry(entry.id)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteEntry(id)
    toast({
      title: "Entry Deleted",
      description: "The due entry has been removed.",
    })
  }

  const handleMarkAsPaid = (id: string) => {
    markAsPaid(id)
    toast({
      title: "Marked as Paid",
      description: "The payment has been marked as complete.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "overdue":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === "paid") return false
    return new Date(dueDate) < new Date()
  }

  const filteredEntries = entries
    .filter((entry) => {
      const statusMatch =
        filterStatus === "all" ||
        (filterStatus === "overdue" ? isOverdue(entry.dueDate, entry.status) : entry.status === filterStatus)
      const typeMatch = filterType === "all" || entry.type === filterType
      return statusMatch && typeMatch
    })
    .map((entry) => ({
      ...entry,
      status: isOverdue(entry.dueDate, entry.status) ? "overdue" : entry.status,
    }))

  const totalOwedToMe = getTotalOwedToMe()
  const totalIOwe = getTotalIOwe()
  const netBalance = totalOwedToMe - totalIOwe

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Dues & Settlements</h1>
            <p className="text-muted-foreground">Track payments owed to you and payments you owe</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingEntry ? "Edit Entry" : "Add New Entry"}</DialogTitle>
                <DialogDescription>
                  {editingEntry ? "Update the due entry details." : "Add a new payment due entry."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "owed_to_me" | "i_owe") => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owed_to_me">Owed to Me</SelectItem>
                      <SelectItem value="i_owe">I Owe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value: "USD" | "EGP") => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EGP">EGP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="person">Person/Company</Label>
                  <Input
                    id="person"
                    value={formData.person}
                    onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                    placeholder="Enter person or company name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description of the payment"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingEntry ? "Update Entry" : "Add Entry"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Owed to Me</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalOwedToMe.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {entries.filter((e) => e.type === "owed_to_me" && e.status === "pending").length} pending payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">I Owe</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalIOwe.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {entries.filter((e) => e.type === "i_owe" && e.status === "pending").length} pending payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${Math.abs(netBalance).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">{netBalance >= 0 ? "Net positive" : "Net negative"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>All Entries</CardTitle>
                <CardDescription>Manage your payment dues and settlements</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="owed_to_me">Owed to Me</SelectItem>
                    <SelectItem value="i_owe">I Owe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Person/Company</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">No entries found</p>
                          <p className="text-sm">Add your first due entry to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry) => (
                      <TableRow key={entry.id} id={`due-${entry.id}`} className="transition-colors">
                        <TableCell>
                          <Badge variant={entry.type === "owed_to_me" ? "default" : "secondary"}>
                            {entry.type === "owed_to_me" ? "Owed to Me" : "I Owe"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{entry.person}</TableCell>
                        <TableCell className="max-w-xs truncate" title={entry.description}>
                          {entry.description}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-semibold ${entry.type === "owed_to_me" ? "text-green-600" : "text-red-600"}`}
                          >
                            {entry.amount.toLocaleString()} {entry.currency}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{entry.dueDate}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(entry.status)}
                            <Badge variant={getStatusColor(entry.status)} className="capitalize">
                              {entry.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(entry)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              {entry.status === "pending" && (
                                <DropdownMenuItem onClick={() => handleMarkAsPaid(entry.id)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark as Paid
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(entry.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
