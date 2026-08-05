"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CategoryOption = {
  id: string;
  name: string;
  children: {
    id: string;
    name: string;
  }[];
};

type LocationOption = {
  id: string;
  name: string;
};

type CreateAdFormProps = {
  categories: CategoryOption[];
  locations: LocationOption[];
};


export function CreateAdForm({
  categories,
  locations,
}: CreateAdFormProps) {
    return (
  // return the form
  <form className="space-y-6">
    <Label htmlFor="title">Title</Label>
    <Input
    id="title"
    name="title"
    type="text"
    minLength={5}
    maxLength={200}
    required
    />

 <Label htmlFor="title">Description</Label>
    <Textarea
    id="description"
    name="description"
    minLength={20}
    maxLength={5000}
    required 
    rows={8}
    >
    </Textarea>


    <Label htmlFor="price">Price</Label>
     <Input
    id="price"
    name="price"
    type="number"
    min="0.01"
    step="0.01"
    required
    />

   <div className="space-y-2">
  <Label htmlFor="categoryId">Category</Label>

  <select
    id="categoryId"
    name="categoryId"
    defaultValue=""
    required
    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
  >
    <option value="" disabled>
      Select a category
    </option>

   {categories.map((parent) => (
  <optgroup key={parent.id} label={parent.name}>
    {parent.children.map((child) => (
      <option key={child.id} value={child.id}>
        {child.name}
      </option>
    ))}
  </optgroup>
))}


  </select>
</div>

<div className="space-y-2">
  <Label htmlFor="locationId">Location</Label>

  <select
    id="locationId"
    name="locationId"
    defaultValue=""
    required
    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
  >
    <option value="" disabled>
      Select a location
    </option>

    {locations.map((location) => (
      <option key={location.id} value={location.id}>
        {location.name}
      </option>
    ))}
  </select>
</div>

<Button type="submit" disabled className="w-full">
  Submit advertisement
</Button>

  </form>
  )
}