"use client";

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
import {
  Car,
  Edit,
  Flag,
  Hotel,
  MapPin,
  MoreHorizontal,
  Plane,
  Plus,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

// --- MOCK COMPONENTS START ---
// These components replace missing imports for standalone functionality.

const DashboardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-6">{children}</div>
);

// Mock hook to replace useTranslations from next-intl
const useTranslations = (namespace?: string) => {
  return (key: string) => key; // Returns the key itself
};
// --- MOCK COMPONENTS END ---

// 1. Data structure aligned with the booking form
const fakeData = {
  cities: [
    { id: "c1", name: "Cairo" },
    { id: "c2", name: "Aswan" },
    { id: "c3", name: "Luxor" },
    { id: "c4", name: "Hurghada" },
  ],
  hotels: {
    Cairo: [
      { id: "h1", name: "Ramses Hilton" },
      { id: "h2", name: "Le Méridien Pyramids" },
    ],
    Aswan: [{ id: "h3", name: "Mövenpick Aswan" }],
    Luxor: [{ id: "h4", name: "Steigenberger Nile Palace" }],
  },
  guides: [
    {
      id: "g1",
      name: "Ahmed Ali",
      city: "Cairo",
      languages: "English, Arabic",
    },
  ],
  // Suppliers now include vendors and airlines, distinguished by type
  suppliers: [
    { id: "s1", name: "Rmit", type: "Vendor" },
    { id: "s2", name: "Viator", type: "Vendor" },
    { id: "s3", name: "Egyptair", type: "International Airline" },
    { id: "s4", name: "Aircairo", type: "Domestic Airline" },
  ],
  vans: [
    { id: "v1", name: "Lemosine", capacity: 2 },
    { id: "v2", name: "H1", capacity: 4 },
    { id: "v3", name: "Hice", capacity: 7 },
  ],
  // Added nationalities to be managed
  nationalities: [
    { id: "n1", name: "USA" },
    { id: "n2", name: "Indian" },
    { id: "n3", name: "British" },
  ],
};

// 2. Unified data interface
interface DataItem {
  id: string;
  name: string;
  [key: string]: any;
}

// 3. Updated tab configuration to include all manageable data
const tabsConfig = [
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
    fields: [
      { name: "city", label: "City", type: "text" },
      {
        name: "languages",
        label: "Languages (e.g., English, Arabic)",
        type: "text",
      },
    ],
  },
  {
    id: "suppliers",
    label: "Suppliers",
    icon: Plane,
    fields: [
      {
        name: "type",
        label: "Type",
        type: "select",
        options: ["Vendor", "International Airline", "Domestic Airline"],
      },
    ],
  },
  {
    id: "vans",
    label: "Vans",
    icon: Car,
    fields: [{ name: "capacity", label: "Capacity (people)", type: "number" }],
  },
  { id: "nationalities", label: "Nationalities", icon: Flag, fields: [] },
];

export default function AdminSettingsPage() {
  const t = useTranslations("common");
  const [activeTab, setActiveTab] = useState("cities");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DataItem | null>(null);

  // 4. Prepare data for table display based on the active tab
  const prepareDataForTable = () => {
    if (activeTab === "hotels") {
      return Object.entries(fakeData.hotels).flatMap(([city, hotelArray]) =>
        hotelArray.map((hotel) => ({ ...hotel, city }))
      );
    }
    return fakeData[activeTab as keyof Omit<typeof fakeData, "hotels">] || [];
  };

  const currentData = prepareDataForTable();
  const citiesList = fakeData.cities;

  const handleAddNew = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: DataItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Settings</h1>
              <p className="text-muted-foreground">
                Manage dropdown data for bookings
              </p>
            </div>
            <Settings className="h-8 w-8 text-muted-foreground" />
          </div>
        </DashboardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full grid-cols-${tabsConfig.length}`}>
            {tabsConfig.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center space-x-2"
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabsConfig.map((tab) => (
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
                        Add, edit, or delete {tab.label.toLowerCase()} for use
                        in bookings.
                      </CardDescription>
                    </div>
                    <Button onClick={handleAddNew}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add New
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={currentData}
                    config={tabsConfig.find((t) => t.id === activeTab)}
                    onEdit={handleEdit}
                    activeTab={tab.id}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <ItemDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          editingItem={editingItem}
          config={tabsConfig.find((t) => t.id === activeTab)}
          citiesList={citiesList}
        />
      </div>
    </DashboardLayout>
  );
}

// =================================================================
// Sub-components
// =================================================================

interface DataTableProps {
  data: DataItem[];
  config: any;
  onEdit: (item: DataItem) => void;
  activeTab: string;
}

function DataTable({ data, config, onEdit, activeTab }: DataTableProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const columns = ["name", ...(config?.fields.map((f: any) => f.name) || [])];
  const columnLabels = {
    name: config?.id === "hotels" ? "Hotel Name" : "Name",
    ...Object.fromEntries(
      config?.fields.map((f: any) => [f.name, f.label]) || []
    ),
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      console.log(`Deleting item ${id} from ${activeTab}`);
      toast({
        title: "Successfully Deleted",
        description: `Item has been deleted from ${activeTab}.`,
      });
    });
  };

  return (
    <Table>
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
          <TableRow key={item.id}>
            {columns.map((col) => (
              <TableCell key={col}>{item[col]}</TableCell>
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
                    onClick={() => handleDelete(item.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />{" "}
                    {isPending ? "Deleting..." : "Delete"}
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

interface ItemDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingItem: DataItem | null;
  config: any;
  citiesList: DataItem[];
}

function ItemDialog({
  isOpen,
  setIsOpen,
  editingItem,
  config,
  citiesList,
}: ItemDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, reset, setValue } = useForm<DataItem>();

  useEffect(() => {
    if (isOpen) {
      reset(editingItem || {});
    }
  }, [isOpen, editingItem, reset]);

  const onSubmit = (data: DataItem) => {
    startTransition(async () => {
      const action = editingItem ? "Updated" : "Added";
      console.log(`Submitting data for ${config?.id}:`, {
        ...editingItem,
        ...data,
      });
      toast({ title: `Successfully ${action}` });
      setIsOpen(false);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Edit" : "Add"} {config?.label.slice(0, -1)}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">
              {config?.id === "hotels" ? "Hotel Name" : "Name"}
            </Label>
            <Input
              id="name"
              {...register("name", { required: true })}
              placeholder="Enter name"
            />
          </div>

          {config?.fields.map((field: any) => {
            if (field.type === "select") {
              const list = field.name === "city" ? citiesList : field.options;
              return (
                <div key={field.name}>
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Select
                    onValueChange={(value) => setValue(field.name, value)}
                    defaultValue={editingItem?.[field.name]}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue
                        placeholder={`Select ${field.label.toLowerCase()}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {list.map((item: any) => (
                        <SelectItem
                          key={item.id || item}
                          value={item.name || item}
                        >
                          {item.name || item}
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
                  {...register(field.name)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : editingItem ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
