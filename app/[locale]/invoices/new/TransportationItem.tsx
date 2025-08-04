"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Minus, Plus } from "lucide-react";
import {
  Control,
  Controller,
  useFieldArray,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
// types/invoice.ts أو في نفس الملف إذا كان الاستخدام محصورًا هنا
export interface InvoiceFormData {
  // ... يجب أن يكون هذا مطابقًا لهيكل الفورم الكامل لديك
  transportation: Array<{
    city: string;
    supplierName: string;
    siteCostNo: string;
    amount: number;
    currency: "EGP" | "USD";
    exchangeRate?: number;
    status: "pending" | "paid";
    guides: Array<{
      guideNumber: string;
      date: string;
      note: string;
      totalCost: number;
    }>;
  }>;
}

interface DataItem {
  id: string;
  _id?: string;
  name: string;
}

interface TransportationItemProps {
  control: Control<InvoiceFormData>;
  transportIndex: number;
  register: UseFormRegister<InvoiceFormData>;
  watch: UseFormWatch<InvoiceFormData>;
  setValue: UseFormSetValue<InvoiceFormData>;
  removeTransportation: (index: number) => void;
  cities: DataItem[];
  vendors: DataItem[];
  guides: DataItem[];
}
export const TransportationItem = ({
  control,
  transportIndex,
  register,
  watch,
  setValue,
  removeTransportation,
  cities,
  vendors,
  guides,
}: TransportationItemProps) => {
  const {
    fields: guideDetailFields,
    append: appendGuideDetail,
    remove: removeGuideDetail,
  } = useFieldArray({
    control,
    name: `transportation.${transportIndex}.guides`,
  });

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-medium">Transportation {transportIndex + 1}</h5>
        {removeTransportation && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => removeTransportation(transportIndex)}
          >
            <Minus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* --- Main Transportation Fields --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <Label>City</Label>
          <Controller
            name={`transportation.${transportIndex}.city`}
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label>Supplier Name</Label>
          <Controller
            name={`transportation.${transportIndex}.supplierName`}
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem
                      key={vendor.id || vendor._id}
                      value={vendor.name}
                    >
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label>Site Cost No</Label>
          <Input
            {...register(`transportation.${transportIndex}.siteCostNo`)}
            placeholder="Site cost number"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-start">
        <div>
          <Label>Amount</Label>
          <Input
            type="number"
            step="0.01"
            {...register(`transportation.${transportIndex}.amount`, {
              valueAsNumber: true,
            })}
            placeholder="0.00"
          />
        </div>
        <div>
          <Label>Currency</Label>
          <Controller
            name={`transportation.${transportIndex}.currency`}
            control={control}
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex items-center space-x-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="EGP"
                    id={`trans-egp-${transportIndex}`}
                  />
                  <Label htmlFor={`trans-egp-${transportIndex}`}>EGP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="USD"
                    id={`trans-usd-${transportIndex}`}
                  />
                  <Label htmlFor={`trans-usd-${transportIndex}`}>USD</Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>
        {watch(`transportation.${transportIndex}.currency`) === "USD" && (
          <div>
            <Label>Exchange Rate ($ to E£)</Label>
            <Input
              type="number"
              step="0.01"
              {...register(`transportation.${transportIndex}.exchangeRate`, {
                valueAsNumber: true,
              })}
              placeholder="e.g., 47.50"
            />
          </div>
        )}
      </div>

      <div className="mb-4">
        <Label>Status</Label>
        <Controller
          name={`transportation.${transportIndex}.status`}
          control={control}
          render={({ field }) => (
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="flex items-center space-x-4 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="pending"
                  id={`trans-pending-${transportIndex}`}
                />
                <Label htmlFor={`trans-pending-${transportIndex}`}>
                  Pending
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="paid"
                  id={`trans-paid-${transportIndex}`}
                />
                <Label htmlFor={`trans-paid-${transportIndex}`}>Paid</Label>
              </div>
            </RadioGroup>
          )}
        />
      </div>

      {/* --- Dynamic Guide Details Table --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h6 className="font-medium">Guide Details</h6>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendGuideDetail({
                guideNumber: "",
                date: "",
                note: "",
                totalCost: 0,
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add Guide Detail
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guide</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {guideDetailFields.map((guideField, guideIndex) => (
              <TableRow key={guideField.id}>
                <TableCell>
                  <Controller
                    name={`transportation.${transportIndex}.guides.${guideIndex}.guideNumber`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select guide" />
                        </SelectTrigger>
                        <SelectContent>
                          {guides.map((guide) => (
                            <SelectItem key={guide.id} value={guide.name}>
                              {guide.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="date"
                    {...register(
                      `transportation.${transportIndex}.guides.${guideIndex}.date`
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    {...register(
                      `transportation.${transportIndex}.guides.${guideIndex}.note`
                    )}
                    placeholder="Note"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    {...register(
                      `transportation.${transportIndex}.guides.${guideIndex}.totalCost`,
                      { valueAsNumber: true }
                    )}
                    placeholder="0.00"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeGuideDetail(guideIndex)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
