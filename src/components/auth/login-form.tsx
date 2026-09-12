"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { requestOtpAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/shared/field-label";
import { FormFieldMessage } from "@/components/shared/form-field-message";
import { useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { requestOtpSchema, type RequestOtpInput } from "@/lib/validations/auth";

export function LoginForm() {
  const t = useTranslations("auth.login");
  const tGlobal = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<RequestOtpInput>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: RequestOtpInput) {
    startTransition(async () => {
      const result = await requestOtpAction(values, locale);
      if (!result.success) {
        toast.error(tGlobal(result.messageKey));
        return;
      }
      router.push(`/verify?email=${encodeURIComponent(values.email)}`);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full max-w-sm flex-col gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FieldLabel required>{t("emailLabel")}</FieldLabel>
              <FormControl>
                <Input type="email" placeholder={t("emailPlaceholder")} autoComplete="email" {...field} />
              </FormControl>
              <FormFieldMessage messageKey={fieldState.error?.message} />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? t("submitting") : t("submit")}
        </Button>
      </form>
    </Form>
  );
}
