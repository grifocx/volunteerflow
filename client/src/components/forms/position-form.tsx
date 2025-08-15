import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertPositionSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, addMonths } from "date-fns";
import type { z } from "zod";

type FormData = z.infer<typeof insertPositionSchema>;

const SECTORS = [
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'environment', label: 'Environment' },
  { value: 'technology', label: 'Technology' },
  { value: 'community_development', label: 'Community Development' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

interface PositionFormProps {
  onSuccess: () => void;
}

export default function PositionForm({ onSuccess }: PositionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: zodResolver(insertPositionSchema),
    defaultValues: {
      isOpen: true,
      maxVolunteers: 1,
      currentVolunteers: 0,
      priority: 'medium',
      requirements: [],
      responsibilities: [],
    }
  });

  const createPositionMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/positions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/positions"] });
      toast({
        title: "Success",
        description: "New position created successfully",
      });
      reset();
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create position",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // Automatically calculate end date (27 months from start date)
    if (data.startDate) {
      const startDate = new Date(data.startDate);
      const endDate = addMonths(startDate, 27);
      data.endDate = endDate.toISOString().split('T')[0];
    }
    
    createPositionMutation.mutate(data);
  };

  const startDate = watch("startDate");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="form-create-position">
      <div>
        <Label htmlFor="title">Position Title *</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="e.g. Education Coordinator"
          data-testid="input-title"
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Describe the position, its purpose, and context..."
          rows={4}
          data-testid="textarea-description"
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Sector *</Label>
          <Select onValueChange={(value) => setValue("sector", value as any)}>
            <SelectTrigger data-testid="select-sector">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map(sector => (
                <SelectItem key={sector.value} value={sector.value}>
                  {sector.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sector && (
            <p className="text-sm text-red-600 mt-1">{errors.sector.message}</p>
          )}
        </div>

        <div>
          <Label>Priority</Label>
          <Select onValueChange={(value) => setValue("priority", value as any)} defaultValue="medium">
            <SelectTrigger data-testid="select-priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map(priority => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="country">Country *</Label>
          <Input
            id="country"
            {...register("country")}
            placeholder="e.g. Kenya"
            data-testid="input-country"
          />
          {errors.country && (
            <p className="text-sm text-red-600 mt-1">{errors.country.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="location">Location/City</Label>
          <Input
            id="location"
            {...register("location")}
            placeholder="e.g. Nairobi"
            data-testid="input-location"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                data-testid="button-start-date"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(new Date(startDate), "PPP") : "Pick start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate ? new Date(startDate) : undefined}
                onSelect={(date) => setValue("startDate", date?.toISOString().split('T')[0])}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.startDate && (
            <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <Label>End Date</Label>
          <div className="flex items-center h-10 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {startDate 
                ? format(addMonths(new Date(startDate), 27), "PPP") + " (27 months)"
                : "Automatically calculated (27 months)"
              }
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maxVolunteers">Maximum Volunteers</Label>
          <Input
            id="maxVolunteers"
            type="number"
            min="1"
            defaultValue="1"
            {...register("maxVolunteers", { valueAsNumber: true })}
            data-testid="input-max-volunteers"
          />
        </div>

        <div>
          <Label htmlFor="currentVolunteers">Current Volunteers</Label>
          <Input
            id="currentVolunteers"
            type="number"
            min="0"
            defaultValue="0"
            {...register("currentVolunteers", { valueAsNumber: true })}
            data-testid="input-current-volunteers"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="requirements">Requirements (comma-separated)</Label>
        <Textarea
          id="requirements"
          placeholder="e.g. Bachelor's degree in Education, Teaching experience, Fluent in English"
          onChange={(e) => {
            const requirements = e.target.value.split(',').map(r => r.trim()).filter(r => r);
            setValue("requirements", requirements);
          }}
          data-testid="textarea-requirements"
        />
      </div>

      <div>
        <Label htmlFor="responsibilities">Responsibilities (comma-separated)</Label>
        <Textarea
          id="responsibilities"
          placeholder="e.g. Teach English to local students, Develop curriculum, Train local teachers"
          onChange={(e) => {
            const responsibilities = e.target.value.split(',').map(r => r.trim()).filter(r => r);
            setValue("responsibilities", responsibilities);
          }}
          data-testid="textarea-responsibilities"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => reset()}
          data-testid="button-reset"
        >
          Reset
        </Button>
        <Button 
          type="submit" 
          disabled={createPositionMutation.isPending}
          data-testid="button-submit"
        >
          {createPositionMutation.isPending ? "Creating..." : "Create Position"}
        </Button>
      </div>
    </form>
  );
}
