"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Mail, Send, Users, Calendar, AlertCircle, Clock, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmailFormData {
  subject: string
  message: string
  recipients: string
  priority: string
  template: string
  scheduledDate?: string
  scheduledTime?: string
}

const emailTemplates = [
  {
    id: "welcome",
    name: "Welcome Message",
    subject: "Welcome to Book & Go Travel!",
    content:
      "Dear valued customer,\n\nWelcome to Book & Go Travel! We're excited to have you join our community of travelers.\n\nOur team is here to help you create unforgettable travel experiences. If you have any questions, please don't hesitate to contact us.\n\nBest regards,\nThe Book & Go Team",
  },
  {
    id: "booking_confirmation",
    name: "Booking Confirmation",
    subject: "Your Booking Has Been Confirmed",
    content:
      "Dear customer,\n\nYour booking has been confirmed! Here are the details:\n\n[Booking details will be inserted here]\n\nWe look forward to serving you.\n\nBest regards,\nThe Book & Go Team",
  },
  {
    id: "invoice_reminder",
    name: "Invoice Reminder",
    subject: "Payment Reminder - Invoice Due Soon",
    content:
      "Dear customer,\n\nThis is a friendly reminder that your invoice is due soon.\n\nPlease review your invoice and make payment at your earliest convenience.\n\nThank you for your business.\n\nBest regards,\nThe Book & Go Team",
  },
  {
    id: "announcement",
    name: "General Announcement",
    subject: "Important Update from Book & Go Travel",
    content:
      "Dear valued customers,\n\nWe have an important update to share with you.\n\n[Your announcement content here]\n\nThank you for your continued trust in our services.\n\nBest regards,\nThe Book & Go Team",
  },
]

const recipientGroups = [
  { id: "all", name: "All Users", count: 156 },
  { id: "customers", name: "Customers Only", count: 142 },
  { id: "admins", name: "Admin Users", count: 14 },
  { id: "active", name: "Active Users", count: 128 },
  { id: "inactive", name: "Inactive Users", count: 28 },
]

const sentEmails = [
  {
    id: "1",
    subject: "Welcome to Book & Go Travel!",
    recipients: "All Users",
    recipientCount: 156,
    sentDate: "2024-01-20T10:30:00Z",
    status: "delivered",
    openRate: "68%",
    clickRate: "12%",
  },
  {
    id: "2",
    subject: "New Year Travel Deals",
    recipients: "Customers Only",
    recipientCount: 142,
    sentDate: "2024-01-15T14:00:00Z",
    status: "delivered",
    openRate: "72%",
    clickRate: "18%",
  },
  {
    id: "3",
    subject: "System Maintenance Notice",
    recipients: "All Users",
    recipientCount: 156,
    sentDate: "2024-01-10T09:00:00Z",
    status: "delivered",
    openRate: "85%",
    clickRate: "5%",
  },
]

export default function AdminEmailsPage() {
  const t = useTranslations("common")
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [previewMode, setPreviewMode] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EmailFormData>({
    defaultValues: {
      priority: "medium",
      recipients: "all",
    },
  })

  const watchedValues = watch()

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find((t) => t.id === templateId)
    if (template) {
      setValue("subject", template.subject)
      setValue("message", template.content)
      setSelectedTemplate(templateId)
    }
  }

  const handleSendEmail = async (data: EmailFormData) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Email Sent Successfully!",
        description: `Email sent to ${recipientGroups.find((g) => g.id === data.recipients)?.name} (${recipientGroups.find((g) => g.id === data.recipients)?.count} recipients)`,
      })
      reset()
      setSelectedTemplate("")
      setIsLoading(false)
    }, 2000)
  }

  const handleScheduleEmail = async (data: EmailFormData) => {
    setIsLoading(true)

    setTimeout(() => {
      toast({
        title: "Email Scheduled Successfully!",
        description: `Email scheduled for ${data.scheduledDate} at ${data.scheduledTime}`,
      })
      reset()
      setSelectedTemplate("")
      setIsLoading(false)
    }, 1000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Mail className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
            <Mail className="mr-3 h-8 w-8" />
            Email Management
          </h1>
          <p className="text-muted-foreground">Send announcements and updates to your users</p>
        </div>

        <Tabs defaultValue="compose" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compose">Compose Email</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">Email History</TabsTrigger>
          </TabsList>

          {/* Compose Email Tab */}
          <TabsContent value="compose">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Compose New Email</CardTitle>
                    <CardDescription>Create and send emails to your users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(handleSendEmail)} className="space-y-6">
                      {/* Recipients */}
                      <div>
                        <Label htmlFor="recipients">Recipients</Label>
                        <Select
                          value={watchedValues.recipients}
                          onValueChange={(value) => setValue("recipients", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select recipient group" />
                          </SelectTrigger>
                          <SelectContent>
                            {recipientGroups.map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{group.name}</span>
                                  <Badge variant="outline" className="ml-2">
                                    {group.count}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Template Selection */}
                      <div>
                        <Label htmlFor="template">Email Template (Optional)</Label>
                        <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a template or write custom email" />
                          </SelectTrigger>
                          <SelectContent>
                            {emailTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Subject */}
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          {...register("subject", { required: "Subject is required" })}
                          placeholder="Enter email subject"
                        />
                        {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>}
                      </div>

                      {/* Message */}
                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          {...register("message", { required: "Message is required" })}
                          placeholder="Enter your email message"
                          rows={10}
                          className="resize-none"
                        />
                        {errors.message && <p className="text-sm text-destructive mt-1">{errors.message.message}</p>}
                      </div>

                      {/* Priority */}
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={watchedValues.priority} onValueChange={(value) => setValue("priority", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Schedule Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="scheduledDate">Schedule Date (Optional)</Label>
                          <Input id="scheduledDate" type="date" {...register("scheduledDate")} />
                        </div>
                        <div>
                          <Label htmlFor="scheduledTime">Schedule Time (Optional)</Label>
                          <Input id="scheduledTime" type="time" {...register("scheduledTime")} />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button type="submit" disabled={isLoading} className="flex-1">
                          <Send className="mr-2 h-4 w-4" />
                          {isLoading ? "Sending..." : "Send Now"}
                        </Button>
                        {watchedValues.scheduledDate && watchedValues.scheduledTime && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleSubmit(handleScheduleEmail)}
                            disabled={isLoading}
                            className="flex-1 bg-transparent"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Email
                          </Button>
                        )}
                        <Button type="button" variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                          {previewMode ? "Edit" : "Preview"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Preview/Stats Sidebar */}
              <div className="space-y-6">
                {previewMode ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Email Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">To:</Label>
                          <p className="text-sm">
                            {recipientGroups.find((g) => g.id === watchedValues.recipients)?.name}(
                            {recipientGroups.find((g) => g.id === watchedValues.recipients)?.count} recipients)
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Subject:</Label>
                          <p className="text-sm font-medium">{watchedValues.subject || "No subject"}</p>
                        </div>
                        <Separator />
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Message:</Label>
                          <div className="text-sm mt-2 p-3 bg-muted rounded-lg whitespace-pre-wrap">
                            {watchedValues.message || "No message content"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recipient Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recipientGroups.map((group) => (
                          <div key={group.id} className="flex items-center justify-between">
                            <span className="text-sm">{group.name}</span>
                            <Badge variant="outline">{group.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Email Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Keep subject lines clear and concise</p>
                      <p>• Use templates for consistency</p>
                      <p>• Schedule emails for optimal delivery times</p>
                      <p>• Test with a small group first</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {emailTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.subject}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm bg-muted p-3 rounded-lg max-h-32 overflow-y-auto">{template.content}</div>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => {
                          handleTemplateSelect(template.id)
                          // Switch to compose tab
                          const composeTab = document.querySelector('[value="compose"]') as HTMLElement
                          composeTab?.click()
                        }}
                      >
                        Use This Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Email History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Email History</CardTitle>
                <CardDescription>View previously sent emails and their performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sentEmails.map((email) => (
                    <Card key={email.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusIcon(email.status)}
                              <h4 className="font-semibold">{email.subject}</h4>
                              <Badge variant="outline" className="text-xs">
                                {email.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>
                                <Users className="inline h-3 w-3 mr-1" />
                                {email.recipients} ({email.recipientCount} recipients)
                              </p>
                              <p>
                                <Calendar className="inline h-3 w-3 mr-1" />
                                {new Date(email.sentDate).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="space-y-1">
                              <div>
                                <span className="text-muted-foreground">Open Rate:</span>
                                <span className="ml-2 font-medium">{email.openRate}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Click Rate:</span>
                                <span className="ml-2 font-medium">{email.clickRate}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
