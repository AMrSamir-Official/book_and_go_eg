// TransportationItem.tsx
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
import { useFieldArray } from "react-hook-form";

export const TransportationItem = ({
  control,
  transportIndex,
  register,
  watch,
  setValue,
  removeTransportation,
}) => {
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
        {/* زر الحذف يظهر فقط إذا كان هناك أكثر من عنصر واحد */}
        {removeTransportation && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeTransportation(transportIndex)}
          >
            <Minus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* --- الحقول الرئيسية للمواصلات --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <Label>City</Label>
          <Select
            onValueChange={(value) =>
              setValue(`transportation.${transportIndex}.city`, value)
            }
            defaultValue={watch(`transportation.${transportIndex}.city`)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cairo">Cairo</SelectItem>
              <SelectItem value="Aswan">Aswan</SelectItem>
              <SelectItem value="Luxor">Luxor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Supplier Name</Label>
          <Input
            {...register(`transportation.${transportIndex}.supplierName`)}
            placeholder="Supplier name"
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
          <RadioGroup
            defaultValue={watch(`transportation.${transportIndex}.currency`)}
            className="flex items-center space-x-4 pt-2"
            onValueChange={(value) =>
              setValue(
                `transportation.${transportIndex}.currency`,
                value as "EGP" | "USD"
              )
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="EGP" id={`trans-egp-${transportIndex}`} />
              <Label htmlFor={`trans-egp-${transportIndex}`}>EGP</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="USD" id={`trans-usd-${transportIndex}`} />
              <Label htmlFor={`trans-usd-${transportIndex}`}>USD</Label>
            </div>
          </RadioGroup>
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
        <RadioGroup
          defaultValue={watch(`transportation.${transportIndex}.status`)}
          onValueChange={(value) =>
            setValue(
              `transportation.${transportIndex}.status`,
              value as "pending" | "paid"
            )
          }
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="pending"
                id={`trans-pending-${transportIndex}`}
              />
              <Label htmlFor={`trans-pending-${transportIndex}`}>Pending</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="paid"
                id={`trans-paid-${transportIndex}`}
              />
              <Label htmlFor={`trans-paid-${transportIndex}`}>Paid</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* --- جدول تفاصيل المرشدين الديناميكي --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h6 className="font-medium">Guide Details</h6>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendGuideDetail({
                guideNumber: `Guide ${guideDetailFields.length + 1}`,
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
                  <Input
                    {...register(
                      `transportation.${transportIndex}.guides.${guideIndex}.guideNumber`
                    )}
                    placeholder="Guide Name/No"
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
                    variant="outline"
                    size="sm"
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
