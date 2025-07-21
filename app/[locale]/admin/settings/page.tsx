"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, MoreHorizontal, Settings, MapPin, Hotel, Users, Plane, Car } from "lucide-react"
import { cities, hotels, guides, suppliers, vanTypes } from "@/lib/fake-data"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const t = useTranslations("common")
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("cities")

  const handleAdd = (type: string) => {
    setEditingItem(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string, type: string) => {
    toast({
      title: "Item Deleted",
      description: `${type} has been deleted successfully.`,
    })
  }

  const handleSave = () => {
    toast({
      title: editingItem ? "Item Updated" : "Item Added",
      description: `Item has been ${editingItem ? "updated" : "added"} successfully.`,
    })
    setIsDialogOpen(false)
    setEditingItem(null)
  }

  const tabs = [
    { id: "cities", label: "Cities", icon: MapPin, data: cities },
    { id: "hotels", label: "Hotels", icon: Hotel, data: hotels },
    { id: "guides", label: "Guides", icon: Users, data: guides },
    { id: "suppliers", label: "Suppliers", icon: Plane, data: suppliers },
    { id: "vans", label: "Van Types", icon: Car, data: vanTypes },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Settings</h1>
            <p className="text-muted-foreground">Manage dropdown data for bookings and invoices</p>
          </div>
          <Settings className="h-8 w-8 text-muted-foreground" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <tab.icon className="mr-2 h-5 w-5" />
                        Manage {tab.label}
                      </CardTitle>
                      <CardDescription>
                        Add, edit, or delete {tab.label.toLowerCase()} for use in bookings
                      </CardDescription>
                    </div>
                    <Button onClick={() => handleAdd(tab.id)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add {tab.label.slice(0, -1)}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        {tab.id === "cities" && <TableHead>Arabic Name</TableHead>}
                        {tab.id === "hotels" && (
                          <>
                            <TableHead>City</TableHead>
                            <TableHead>Rating</TableHead>
                          </>
                        )}
                        {tab.id === "guides" && (
                          <>
                            <TableHead>City</TableHead>
                            <TableHead>Languages</TableHead>
                          </>
                        )}
                        {tab.id === "suppliers" && <TableHead>Type</TableHead>}
                        {tab.id === "vans" && <TableHead>Capacity</TableHead>}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tab.data.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          {tab.id === "cities" && <TableCell>{item.nameAr}</TableCell>}
                          {tab.id === "hotels" && (
                            <>
                              <TableCell>{item.city}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{item.rating} ⭐</Badge>
                              </TableCell>
                            </>
                          )}
                          {tab.id === "guides" && (
                            <>
                              <TableCell>{item.city}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {item.languages.map((lang: string) => (
                                    <Badge key={lang} variant="outline" className="text-xs">
                                      {lang}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                            </>
                          )}
                          {tab.id === "suppliers" && <TableCell>{item.type}</TableCell>}
                          {tab.id === "vans" && <TableCell>{item.capacity} people</TableCell>}
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(item)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(item.id, tab.label.slice(0, -1))}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit" : "Add"} {tabs.find((t) => t.id === activeTab)?.label.slice(0, -1)}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? "Update the" : "Add a new"}{" "}
                {tabs
                  .find((t) => t.id === activeTab)
                  ?.label.slice(0, -1)
                  .toLowerCase()}{" "}
                to the system.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue={editingItem?.name || ""} placeholder="Enter name" />
              </div>

              {activeTab === "cities" && (
                <div>
                  <Label htmlFor="nameAr">Arabic Name</Label>
                  <Input id="nameAr" defaultValue={editingItem?.nameAr || ""} placeholder="Enter Arabic name" />
                </div>
              )}

              {activeTab === "hotels" && (
                <>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" defaultValue={editingItem?.city || ""} placeholder="Enter city" />
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="1"
                      max="5"
                      defaultValue={editingItem?.rating || ""}
                      placeholder="Enter rating (1-5)"
                    />
                  </div>
                </>
              )}

              {activeTab === "guides" && (
                <>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" defaultValue={editingItem?.city || ""} placeholder="Enter city" />
                  </div>
                  <div>
                    <Label htmlFor="languages">Languages (comma separated)</Label>
                    <Input
                      id="languages"
                      defaultValue={editingItem?.languages?.join(", ") || ""}
                      placeholder="English, Arabic, French"
                    />
                  </div>
                </>
              )}

              {activeTab === "suppliers" && (
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Input id="type" defaultValue={editingItem?.type || ""} placeholder="Enter supplier type" />
                </div>
              )}

              {activeTab === "vans" && (
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    defaultValue={editingItem?.capacity || ""}
                    placeholder="Enter capacity"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>{editingItem ? "Update" : "Add"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
