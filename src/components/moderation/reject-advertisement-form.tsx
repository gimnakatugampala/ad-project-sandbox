"use client";

import { useActionState } from "react";

import { rejectAdvertisement } from "@/app/actions/moderation-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RejectAdvertisementState } from "@/types/moderation-action";

type RejectAdvertisementFormProps = {
  advertisementId: string;
};

const initialState: RejectAdvertisementState = {
  fieldErrors: {},
  message: null,
};

export function RejectAdvertisementForm({
  advertisementId,
}: RejectAdvertisementFormProps) {
  const rejectAdvertisementWithId =
    rejectAdvertisement.bind(null, advertisementId);

  const [state, formAction, isPending] = useActionState(
    rejectAdvertisementWithId,
    initialState
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={`note-${advertisementId}`}>
          Rejection reason
        </Label>

       <Textarea
      id={`note-${advertisementId}`}
      name="note"
      placeholder="Explain the exact reason for rejection so the seller can correct the advertisement."
      minLength={5}
      maxLength={500}
      required
      rows={5}
      className="resize-y bg-background"
    />
    <p className="text-xs leading-5 text-muted-foreground">
    This explanation will be shown to the seller and included in
    their rejection email.
  </p>

        {state.fieldErrors.note?.[0] && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.note[0]}
          </p>
        )}
      </div>

      {state.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}

     <Button
    type="submit"
    variant="destructive"
    disabled={isPending}
    className="w-full"
  >
    {isPending
      ? "Rejecting..."
      : "Reject advertisement"}
  </Button>
    </form>
  );
}