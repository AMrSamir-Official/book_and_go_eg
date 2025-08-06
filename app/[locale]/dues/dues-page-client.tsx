"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  createDueAction,
  deleteDueAction,
  markDueAsPaidAction,
  updateDueAction,
} from "@/actions/duesActions"; // Import new server actions
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Loader2,
  MoreHorizontal,
  Plus,
  ShieldAlert,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useMemo, useState } from "react";

// Data structure from your API
interface ApiDue {
  id?: string;
  _id: string;
  type: "receive" | "pay";
  name: string;
  amount: number;
  currency: "USD" | "EGP";
  dueDate: string;
  status: "Pending" | "Paid";
  notes: string;
  createdAt: string;
  updatedAt: string;
}

type DisplayDue = Omit<ApiDue, "status"> & {
  status: "Pending" | "Paid" | "overdue";
};

// Data structure for the form
interface DueFormData {
  type: "receive" | "pay";
  name: string;
  amount: number;
  currency: "USD" | "EGP";
  notes: string;
  dueDate: string;
}

// Remove useEffect, useCallback
// ...
// const apiClient = createApiClient(); // DELETE THIS LINE
// ...
export function DuesPageClient({ initialDues }: { initialDues: ApiDue[] }) {
  // Accept props
  const t = useTranslations("common");
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuthStore();

  // --- DEBUGGING LOG ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dues, setDues] = useState<ApiDue[]>(initialDues);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DueFormData>({
    type: "receive",
    amount: 0,
    currency: "EGP",
    name: "",
    notes: "",
    dueDate: "",
  });

  const [filterStatus, setFilterStatus] = useState<
    "all" | "Pending" | "Paid" | "overdue"
  >("all");
  const [filterType, setFilterType] = useState<"all" | "receive" | "pay">(
    "all"
  );

  const resetForm = () => {
    setFormData({
      type: "receive",
      amount: 0,
      currency: "EGP",
      name: "",
      notes: "",
      dueDate: "",
    });
    setEditingEntryId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.notes ||
      !formData.dueDate ||
      formData.amount <= 0
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const action = editingEntryId
        ? () => updateDueAction(editingEntryId, formData)
        : () => createDueAction(formData);

      const result = await action(); // Call the server action

      if (result.success) {
        toast({ title: "Success", description: result.message });
        resetForm();
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
      // No need to call fetchDues()!
    } catch (err) {
      toast({
        title: "Submission Error",
        description: "An error occurred while saving the entry.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (entry: ApiDue) => {
    setFormData({
      type: entry.type,
      amount: entry.amount,
      currency: entry.currency,
      name: entry.name,
      notes: entry.notes,
      dueDate: entry.dueDate.split("T")[0],
    });
    if (entry._id) {
      setEditingEntryId(entry._id);
    } else {
      if (entry.id) {
        setEditingEntryId(entry.id);
      }
    }
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteDueAction(id);
    if (result.success) {
      toast({ title: "Success", description: result.message });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    const result = await markDueAsPaidAction(id);
    if (result.success) {
      toast({ title: "Success", description: result.message });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const filteredEntries: DisplayDue[] = useMemo(() => {
    const isOverdue = (dueDate: string, status: string): boolean =>
      status !== "Paid" && new Date(dueDate) < new Date();
    return dues
      .map((entry) => ({
        ...entry,
        status: isOverdue(entry.dueDate, entry.status)
          ? "overdue"
          : entry.status,
      }))
      .filter((entry) => {
        const statusMatch =
          filterStatus === "all" || entry.status === filterStatus;
        const typeMatch = filterType === "all" || entry.type === filterType;
        return statusMatch && typeMatch;
      });
  }, [dues, filterStatus, filterType]);

  const [totalReceive, totalPay] = useMemo(() => {
    return dues
      .filter((d) => d.status === "Pending")
      .reduce(
        ([receive, pay], due) => {
          if (due.type === "receive") return [receive + due.amount, pay];
          return [receive, pay + due.amount];
        },
        [0, 0]
      );
  }, [dues]);

  const netBalance = totalReceive - totalPay;

  if (isAuthLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">
            You do not have permission to view this page.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) =>
    status === "Paid"
      ? "default"
      : status === "Pending"
      ? "secondary"
      : "destructive";
  const getStatusIcon = (status: string) =>
    status === "Paid" ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : status === "overdue" ? (
      <AlertTriangle className="h-4 w-4 text-red-500" />
    ) : (
      <Clock className="h-4 w-4 text-yellow-500" />
    );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              Dues & Settlements
            </h1>
            <p className="text-muted-foreground">
              Track payments owed to you and payments you owe
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" /> Add New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingEntryId ? "Edit Entry" : "Add New Entry"}
                </DialogTitle>
                <DialogDescription>
                  {editingEntryId
                    ? "Update the due entry details."
                    : "Add a new payment due entry."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "receive" | "pay") =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receive">Owed to Me</SelectItem>
                      <SelectItem value="pay">I Owe</SelectItem>
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          amount: Number(e.target.value),
                        })
                      }
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
                      onValueChange={(value: "USD" | "EGP") =>
                        setFormData({ ...formData, currency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EGP">EGP</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="name">Person/Company</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter person or company name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Description</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    required
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : editingEntryId
                      ? "Update Entry"
                      : "Add Entry"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Owed to Me (Pending)
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalReceive.toLocaleString()} EGP
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                I Owe (Pending)
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {totalPay.toLocaleString()} EGP
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  netBalance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {Math.abs(netBalance).toLocaleString()} EGP
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>All Entries</CardTitle>
                <CardDescription>
                  Manage your payment dues and settlements
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={filterStatus}
                  onValueChange={(value: any) => setFilterStatus(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterType}
                  onValueChange={(value: any) => setFilterType(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="receive">Owed to Me</SelectItem>
                    <SelectItem value="pay">I Owe</SelectItem>
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
                  {filteredEntries.map((entry) => (
                    <TableRow
                      key={entry._id || entry.id}
                      id={`due-${entry._id || entry.id}`}
                      className="transition-colors"
                    >
                      <TableCell>
                        <Badge
                          variant={
                            entry.type === "receive" ? "default" : "secondary"
                          }
                        >
                          {entry.type === "receive" ? "Owed to Me" : "I Owe"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.name}
                      </TableCell>
                      <TableCell
                        className="max-w-xs truncate"
                        title={entry.notes}
                      >
                        {entry.notes}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-semibold ${
                            entry.type === "receive"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {entry.amount.toLocaleString()} {entry.currency}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(entry.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(entry.status)}
                          <Badge
                            variant={getStatusColor(entry.status)}
                            className="capitalize"
                          >
                            {entry.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(entry)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            {entry.status !== "Paid" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  entry._id
                                    ? handleMarkAsPaid(entry._id)
                                    : entry.id
                                    ? handleMarkAsPaid(entry.id)
                                    : null
                                }
                              >
                                <CheckCircle className="mr-2 h-4 w-4" /> Mark as
                                Paid
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                entry._id
                                  ? handleDelete(entry._id)
                                  : entry.id
                                  ? handleDelete(entry.id)
                                  : null
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
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
      </div>
    </DashboardLayout>
  );
}
