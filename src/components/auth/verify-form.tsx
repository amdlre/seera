"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { requestOtpAction, verifyOtpAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { FieldLabel } from "@/components/shared/field-label";
import { FormFieldMessage } from "@/components/shared/form-field-message";
import { Link, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { verifyOtpSchema, type VerifyOtpInput } from "@/lib/validations/auth";

const OTP_SLOT_INDEXES = [0, 1, 2, 3, 4, 5] as const;

export function VerifyForm({ email }: { email: string }) {
  const t = useTranslations("auth.verify");
  const tGlobal = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [isVerifying, startVerifying] = useTransition();
  const [isResending, startResending] = useTransition();

  const form = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email, code: "" },
  });

  function onSubmit(values: VerifyOtpInput) {
    startVerifying(async () => {
      const result = await verifyOtpAction(values, locale);
      if (!result.success) {
        toast.error(tGlobal(result.messageKey));
        return;
      }
      router.push("/dashboard");
    });
  }

  function onResend() {
    startResending(async () => {
      const result = await requestOtpAction({ email }, locale);
      if (!result.success) {
        toast.error(tGlobal(result.messageKey));
        return;
      }
      toast.success(t("resendSuccess"));
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full max-w-sm flex-col gap-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field, fieldState }) => (
            <FormItem className="flex flex-col items-center gap-3">
              <FieldLabel required>{t("codeLabel")}</FieldLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  autoFocus
                  containerClassName="justify-center"
                >
                  <InputOTPGroup dir="ltr">
                    {OTP_SLOT_INDEXES.map((index) => (
                      <InputOTPSlot key={index} index={index} className="size-14 text-xl font-semibold" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormFieldMessage messageKey={fieldState.error?.message} />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isVerifying} className="w-full">
          {isVerifying ? t("submitting") : t("submit")}
        </Button>
        <div className="flex items-center justify-between text-sm">
          <Button type="button" variant="link" className="h-auto p-0" disabled={isResending} onClick={onResend}>
            {t("resend")}
          </Button>
          <Link href="/login" className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
            {t("changeEmail")}
          </Link>
        </div>
      </form>
    </Form>
  );
}
