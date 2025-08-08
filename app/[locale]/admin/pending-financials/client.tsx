"use client";

import { markInvoiceItemAsPaidAction } from "@/actions/invoiceActions"; // استيراد الدالة الجديدة
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Eye, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

interface PendingItem {
  itemId: string;
  invoiceId: string;
  invoiceNumber: string;
  fileNumber: string;
  itemType: string;
  itemName: string;
  amount: number;
  currency: string;
  paymentDate: string;
  direction: "dueToMe" | "dueFromMe"; // <-- أضف هذا الحقل
}

export function PendingItemsClientPage({
  initialItems,
}: {
  initialItems: PendingItem[];
}) {
  const t = useTranslations("financials");
  const { toast } = useToast();
  const [items, setItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [fadingOutItems, setFadingOutItems] = useState<string[]>([]);

  const itemTypes = [
    "all",
    ...Array.from(new Set(initialItems.map((item) => item.itemType))),
  ];

  const filteredItems = items.filter((item) => {
    const matchesType =
      selectedType === "all" || item.itemType === selectedType;
    const matchesSearch =
      item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // تم تحديث الدالة لتحديث بند واحد فقط
  const handleMarkItemAsPaid = async (
    invoiceId: string,
    itemId: string,
    itemType: string
  ) => {
    const result = await markInvoiceItemAsPaidAction(
      invoiceId,
      itemId,
      itemType
    );

    if (result.success) {
      setFadingOutItems((prev) => [...prev, itemId]);

      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.itemId !== itemId));
        setFadingOutItems((prev) => prev.filter((id) => id !== itemId));
      }, 500);

      toast({
        title: "Success",
        description: "Item has been marked as paid.",
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("pendingItemsTitle")}</CardTitle>
            <CardDescription>{t("pendingItemsDescription")}</CardDescription>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder={t("filterByType")} />
                </SelectTrigger>
                <SelectContent>
                  {itemTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "all" ? t("allTypes") : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("invoiceNumber")}</TableHead>
                  <TableHead>{t("itemType")}</TableHead>
                  <TableHead>{t("itemName")}</TableHead>
                  <TableHead>{t("direction")}</TableHead>
                  <TableHead>{t("paymentDate")}</TableHead>
                  <TableHead className="text-right">{t("amount")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <TableRow
                      key={item.itemId}
                      className={`transition-opacity duration-500 ${
                        fadingOutItems.includes(item.itemId)
                          ? "opacity-0"
                          : "opacity-100"
                      }`}
                    >
                      <TableCell className="font-medium">
                        {item.invoiceNumber}
                      </TableCell>
                      <TableCell>{item.itemType}</TableCell>
                      <TableCell>{item.itemName || "N/A"}</TableCell>
                      <TableCell>
                        {item.direction === "dueToMe" ? (
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            مستحق لك
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                            مستحق عليك
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-orange-500" />
                          {item.paymentDate
                            ? new Date(item.paymentDate).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.amount.toLocaleString()} {item.currency}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/invoices/${item.invoiceId}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleMarkItemAsPaid(
                              item.invoiceId,
                              item.itemId,
                              item.itemType
                            )
                          }
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {t("markPaid")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {t("noPendingItems")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
