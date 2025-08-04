"use client";

import { deleteItem, saveItem } from "@/actions/settingsActions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// Import all UI components
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Import all needed icons from lucide-react
import {
  Briefcase,
  Car,
  Edit,
  Flag,
  Globe,
  Hotel,
  Landmark,
  Loader2,
  LucideIcon,
  MapPin,
  MoreHorizontal,
  PlaneTakeoff,
  Plus,
  Search,
  Ship,
  Trash2,
  Users,
} from "lucide-react";

// --- Type Definitions for TypeScript ---
interface DataItem {
  _id: string;
  name: string;
  [key: string]: any;
}
interface City extends DataItem {}
interface Hotel extends DataItem {
  city: City;
}
interface TabConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  fields: { name: string; label: string; type: string; options?: string[] }[];
}
interface SettingsClientUIProps {
  initialData: DataItem[];
  citiesList: City[];
  activeTab: string;
}
interface DataTableProps {
  data: DataItem[];
  config: TabConfig;
  onEdit: (item: DataItem) => void;
  onDelete: (id: string) => void;
}
interface ItemDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingItem: DataItem | null;
  config: TabConfig;
  citiesList: City[];
  onSave: (data: Partial<DataItem>) => Promise<boolean>;
}

// Helper component
const DashboardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-6">{children}</div>
);

// The complete and updated configuration for all tabs
const tabsConfig: TabConfig[] = [
  { id: "cities", label: "Cities", icon: MapPin, fields: [] },
  {
    id: "hotels",
    label: "Hotels",
    icon: Hotel,
    fields: [{ name: "city", label: "City", type: "select" }],
  },
  {
    id: "guides",
    label: "Guides",
    icon: Users,
    fields: [{ name: "city", label: "City", type: "select" }],
  },
  { id: "vendors", label: "Vendors", icon: Briefcase, fields: [] },
  { id: "supplier", label: "Supplier", icon: Briefcase, fields: [] },
  {
    id: "domesticAirlines",
    label: "Domestic Airlines",
    icon: PlaneTakeoff,
    fields: [],
  },
  {
    id: "internationalAirlines",
    label: "Int'l Airlines",
    icon: Globe,
    fields: [],
  },
  {
    id: "vans",
    label: "Vans",
    icon: Car,
    fields: [{ name: "capacity", label: "Capacity", type: "number" }],
  },
  { id: "sites", label: "Sites", icon: Landmark, fields: [] },
  {
    id: "extraIncomingTypes",
    label: "extraIncomingTypes",
    icon: Landmark,
    fields: [],
  },
  { id: "nileCruises", label: "Nile Cruises", icon: Ship, fields: [] },
  { id: "nationalities", label: "Nationalities", icon: Flag, fields: [] },
];

// Main Client Component
export function SettingsClientUI({
  initialData,
  citiesList,
  activeTab,
}: SettingsClientUIProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<DataItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const activeConfig = tabsConfig.find((t) => t.id === activeTab)!;

  const handleTabChange = (newTab: string) => {
    router.push(`/admin/settings?tab=${newTab}`);
  };

  const handleSave = async (itemData: Partial<DataItem>) => {
    const result = await saveItem(activeTab as any, itemData, editingItem?._id);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
      return false;
    }
    toast({ title: "Success", description: "Item saved successfully." });
    setIsDialogOpen(false);
    return true;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const result = await deleteItem(activeTab as any, id);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Item deleted." });
    }
  };

  const filteredData = initialData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardHeader>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">
            Manage dynamic data for bookings
          </p>
        </DashboardHeader>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="overflow-x-auto pb-2">
            <TabsList
              className="grid w-full min-w-fit"
              style={{
                gridTemplateColumns: `repeat(${tabsConfig.length}, 1fr)`,
              }}
            >
              {tabsConfig.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2"
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <activeConfig.icon className="h-5 w-5" />
                      Manage {activeConfig.label}
                    </CardTitle>
                    <CardDescription>
                      View, add, edit, or delete{" "}
                      {activeConfig.label.toLowerCase()}.
                    </CardDescription>
                  </div>
                  <div className="flex w-full md:w-auto items-center gap-2">
                    <div className="relative flex-1 md:flex-none">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search by name..."
                        className="w-full pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={() => {
                        setEditingItem(null);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add New
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <DataTable
                    data={filteredData}
                    config={activeConfig}
                    onEdit={(item: DataItem) => {
                      setEditingItem(item);
                      setIsDialogOpen(true);
                    }}
                    onDelete={handleDelete}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <ItemDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          editingItem={editingItem}
          config={activeConfig}
          citiesList={citiesList}
          onSave={handleSave}
        />
      </div>
    </DashboardLayout>
  );
}

// Sub-component: Data Table
function DataTable({ data, config, onEdit, onDelete }: DataTableProps) {
  const columns = ["name", ...(config.fields.map((f) => f.name) || [])];
  const columnLabels = {
    name: "Name",
    ...Object.fromEntries(config.fields.map((f) => [f.name, f.label]) || []),
  };
  return (
    <Table className="min-w-[600px]">
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col}>{columnLabels[col] || col}</TableHead>
          ))}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item._id}>
            {columns.map((col) => (
              <TableCell key={col}>
                {col === "city" &&
                typeof item[col] === "object" &&
                item[col] !== null
                  ? item[col].name
                  : item[col]}
              </TableCell>
            ))}
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(item._id)}
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
  );
}

// Sub-component: Add/Edit Dialog
function ItemDialog({
  isOpen,
  setIsOpen,
  editingItem,
  config,
  citiesList,
  onSave,
}: ItemDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Partial<DataItem>>();
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        const formValues = { ...editingItem };
        if (typeof formValues.city === "object" && formValues.city?._id) {
          formValues.city = formValues.city._id;
        }
        reset(formValues);
      } else {
        reset({ name: "", capacity: "", languages: "", type: "", city: "" });
      }
    }
  }, [isOpen, editingItem, reset]);
  const onSubmit = async (data: Partial<DataItem>) => {
    setIsSaving(true);
    const success = await onSave(data);
    setIsSaving(false);
    if (success) {
      setIsOpen(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Edit" : "Add"} {config.label}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">
                {errors.name.message as string}
              </p>
            )}
          </div>
          {config.fields.map((field) => {
            if (field.type === "select") {
              const list =
                field.name === "city" ? citiesList : field.options || [];
              return (
                <div key={field.name}>
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue(field.name as any, value, {
                        shouldValidate: true,
                      })
                    }
                    value={watch(field.name as any)}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue
                        placeholder={`Select a ${field.label.toLowerCase()}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {list.map((item) => (
                        <SelectItem
                          key={typeof item === "string" ? item : item._id}
                          value={typeof item === "string" ? item : item._id}
                        >
                          {typeof item === "string" ? item : item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }
            return (
              <div key={field.name}>
                <Label htmlFor={field.name}>{field.label}</Label>
                <Input
                  id={field.name}
                  type={field.type}
                  {...register(field.name as any, {
                    required: `${field.label} is required`,
                  })}
                />
                {errors[field.name as keyof DataItem] && (
                  <p className="text-sm text-destructive mt-1">
                    {errors[field.name as keyof DataItem]?.message as string}
                  </p>
                )}
              </div>
            );
          })}
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
