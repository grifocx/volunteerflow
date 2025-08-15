import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertVolunteerSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { z } from "zod";

type FormData = z.infer<typeof insertVolunteerSchema>;

interface LeadFormProps {
  onSuccess: () => void;
}

export default function LeadForm({ onSuccess }: LeadFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    resolver: zodResolver(insertVolunteerSchema),
    defaultValues: {
      status: 'interested',
      skills: [],
      languages: [],
    }
  });

  const createVolunteerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/volunteers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      toast({
        title: "Success",
        description: "New volunteer lead added successfully",
      });
      reset();
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add volunteer lead",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createVolunteerMutation.mutate(data);
  };

  const dateOfBirth = watch("dateOfBirth");
  const availability = watch("availability");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="form-add-lead">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            {...register("firstName")}
            data-testid="input-first-name"
          />
          {errors.firstName && (
            <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            {...register("lastName")}
            data-testid="input-last-name"
          />
          {errors.lastName && (
            <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            data-testid="input-email"
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...register("phone")}
            data-testid="input-phone"
          />
          {errors.phone && (
            <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                data-testid="button-date-of-birth"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateOfBirth ? format(new Date(dateOfBirth), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateOfBirth ? new Date(dateOfBirth) : undefined}
                onSelect={(date) => setValue("dateOfBirth", date?.toISOString().split('T')[0])}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label>Availability Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                data-testid="button-availability"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {availability ? format(new Date(availability), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={availability ? new Date(availability) : undefined}
                onSelect={(date) => setValue("availability", date?.toISOString().split('T')[0])}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nationality">Nationality</Label>
          <Input
            id="nationality"
            {...register("nationality")}
            data-testid="input-nationality"
          />
        </div>
        
        <div>
          <Label htmlFor="currentCountry">Current Country</Label>
          <Input
            id="currentCountry"
            {...register("currentCountry")}
            data-testid="input-current-country"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="education">Education Background</Label>
        <Textarea
          id="education"
          {...register("education")}
          placeholder="Describe educational background..."
          data-testid="textarea-education"
        />
      </div>

      <div>
        <Label htmlFor="experience">Relevant Experience</Label>
        <Textarea
          id="experience"
          {...register("experience")}
          placeholder="Describe relevant work or volunteer experience..."
          data-testid="textarea-experience"
        />
      </div>

      <div>
        <Label htmlFor="motivation">Motivation</Label>
        <Textarea
          id="motivation"
          {...register("motivation")}
          placeholder="Why do you want to volunteer with us?"
          data-testid="textarea-motivation"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="skills">Skills (comma-separated)</Label>
          <Input
            id="skills"
            placeholder="e.g. Teaching, Programming, Medical"
            onChange={(e) => {
              const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
              setValue("skills", skills);
            }}
            data-testid="input-skills"
          />
        </div>
        
        <div>
          <Label htmlFor="languages">Languages (comma-separated)</Label>
          <Input
            id="languages"
            placeholder="e.g. English, Spanish, French"
            onChange={(e) => {
              const languages = e.target.value.split(',').map(l => l.trim()).filter(l => l);
              setValue("languages", languages);
            }}
            data-testid="input-languages"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="source">How did you hear about us?</Label>
        <Select onValueChange={(value) => setValue("source", value)}>
          <SelectTrigger data-testid="select-source">
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="social_media">Social Media</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="university">University</SelectItem>
            <SelectItem value="job_board">Job Board</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Any additional information..."
          data-testid="textarea-notes"
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
          disabled={createVolunteerMutation.isPending}
          data-testid="button-submit"
        >
          {createVolunteerMutation.isPending ? "Adding..." : "Add Lead"}
        </Button>
      </div>
    </form>
  );
}
