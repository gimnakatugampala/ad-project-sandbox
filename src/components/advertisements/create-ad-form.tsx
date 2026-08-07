"use client";
import { createAdvertisement } from "@/app/actions/advertisement-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateAdvertisementState } from "@/types/advertisement-action";
import { useActionState } from "react";

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

    const initialState: CreateAdvertisementState = {
        fieldErrors: {},
        message: "",
        };

    const [state, formAction, isPending] = useActionState(
    createAdvertisement,
    initialState
    );

    return (
  // return the form
<form
  action={formAction}
  className="space-y-8 rounded-2xl border bg-card p-5 shadow-sm sm:p-8"
>
  <div>
  <h2 className="text-xl font-semibold">
    Advertisement details
  </h2>

  <p className="mt-1 text-sm text-muted-foreground">
    Fields marked with an asterisk are required.
  </p>
</div>
<div className="border-t" />


  <Label htmlFor="title">
    Title <span aria-hidden="true">*</span>
  </Label>

    <Input
    id="title"
    name="title"
    type="text"
    minLength={5}
    maxLength={200}
    required
    />
    {state.fieldErrors && state.fieldErrors.title?.[0] && (
    <p className="text-sm text-destructive">
        {state.fieldErrors.title[0]}
    </p>
    )}

 <Label htmlFor="title">Description <span aria-hidden="true">*</span></Label>
    <Textarea
    id="description"
    name="description"
    minLength={20}
    maxLength={5000}
    required 
    rows={8}
    >
    </Textarea>


        {state.fieldErrors && state.fieldErrors.description?.[0] && (
        <p className="text-sm text-destructive">
            {state.fieldErrors.description[0]}
        </p>
        )}

<div className="space-y-2">
  <Label htmlFor="price">
    Price <span aria-hidden="true">*</span>
  </Label>

  <div className="flex">
    <span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
      LKR
    </span>

    <Input
      id="price"
      name="price"
      type="number"
      min="0.01"
      step="0.01"
      required
      placeholder="0.00"
      className="rounded-l-none"
    />
  </div>

    {state.fieldErrors && state.fieldErrors.price?.[0] && (
  <p className="text-sm text-destructive">
    {state.fieldErrors.price[0]}
  </p>
)}

</div>

<div className="grid gap-6 sm:grid-cols-2">
   <div className="space-y-2">
  <Label htmlFor="categoryId">Category <span aria-hidden="true">*</span></Label>

  <select
    id="categoryId"
    name="categoryId"
    defaultValue=""
    required
   className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

  {state.fieldErrors && state.fieldErrors.categoryId?.[0] && (
  <p className="text-sm text-destructive">
    {state.fieldErrors.categoryId[0]}
  </p>
)}
</div>

<div className="space-y-2">
  <Label htmlFor="locationId">Location <span aria-hidden="true">*</span></Label>

  <select
    id="locationId"
    name="locationId"
    defaultValue=""
    required
    className="h-10 w-full rounded-md border bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

{state.fieldErrors && state.fieldErrors.locationId?.[0] && (
  <p className="text-sm text-destructive">
    {state.fieldErrors.locationId[0]}
  </p>
)}

</div>
</div>

<div className="space-y-2">
  <Label htmlFor="images">
    Advertisement images 
  </Label>

  <Input
    id="images"
    name="images"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    multiple
    required
  />

  <p className="text-sm text-muted-foreground">
    Upload between 1 and 5 JPG, PNG or WebP images.
    Maximum size: 5 MB per image.
  </p>

  {state.fieldErrors?.images?.[0] && (
    <p className="text-sm text-destructive">
      {state.fieldErrors.images[0]}
    </p>
  )}
</div>

<div className="rounded-xl border bg-muted/40 p-4">
  <p className="text-sm font-medium">
    What happens after submission?
  </p>

  <p className="mt-1 text-sm leading-6 text-muted-foreground">
    Your advertisement will be submitted for moderator review.
    It will become publicly visible only after approval.
  </p>
</div>

<Button
  type="submit"
  disabled={isPending}
  className="w-full"
>
  {isPending
    ? "Submitting..."
    : "Submit advertisement"}
</Button>

{state.message && (
  <p
    role="alert"
    className="text-sm text-destructive"
  >
    {state.message}
  </p>
)}

  </form>
  )
}