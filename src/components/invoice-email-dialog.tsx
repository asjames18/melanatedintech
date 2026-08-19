import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendClientInvoiceEmail } from "@/lib/invoices.functions";

export function InvoiceEmailDialog({
  invoiceNumber,
  clientEmail,
  compact = false,
}: {
  invoiceNumber: string;
  clientEmail: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const sendInvoiceEmail = useServerFn(sendClientInvoiceEmail);
  const mutation = useMutation({
    mutationFn: () =>
      sendInvoiceEmail({
        data: { invoiceNumber, note: note.trim() || undefined },
      }),
    onSuccess: (result) => {
      toast.success(
        result.delivery === "sent"
          ? `Invoice emailed to ${result.email}.`
          : `Invoice email queued for ${result.email}.`,
      );
      setOpen(false);
      setNote("");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not email the invoice."),
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !mutation.isPending && setOpen(next)}>
      <DialogTrigger asChild>
        <Button variant={compact ? "outline" : "default"} size={compact ? "sm" : "default"}>
          <Mail className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          {compact ? "Email" : "Email invoice to customer"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Email invoice to customer</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="rounded-xl border border-border bg-muted/35 p-4 text-sm">
            <p>
              <span className="text-muted-foreground">Invoice:</span>{" "}
              <span className="font-mono font-semibold">{invoiceNumber}</span>
            </p>
            <p className="mt-1 break-all">
              <span className="text-muted-foreground">Recipient:</span>{" "}
              <span className="font-medium">{clientEmail}</span>
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`invoice-email-note-${invoiceNumber}`}>Optional note to customer</Label>
            <Textarea
              id={`invoice-email-note-${invoiceNumber}`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={1000}
              rows={5}
              placeholder="Example: Thank you for reviewing the proposal. Please reply if you have questions before submitting the deposit."
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>This appears near the top of the customer’s email.</span>
              <span>{note.length}/1000</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="button" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {mutation.isPending ? "Sending…" : "Send invoice email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
