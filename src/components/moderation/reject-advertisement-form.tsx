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
          placeholder="Explain why this advertisement is being rejected."
          minLength={5}
          maxLength={500}
          required
        />

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
      >
        {isPending ? "Rejecting..." : "Reject"}
      </Button>
    </form>
  );
}