import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";
import { UseFormRegisterReturn } from "react-hook-form";

interface FormFieldProps {
    id: string;
    label: string;
    type?: string;
    placeholder: string;
    icon: LucideIcon;
    disabled?: boolean;
    registration: UseFormRegisterReturn;
    error?: string;
    rightElement?: React.ReactNode;
}

export function FormField({
    id,
    label,
    type = "text",
    placeholder,
    icon: Icon,
    disabled,
    registration,
    error,
    rightElement,
}: FormFieldProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-sm font-medium">
                {label}
            </Label>
            <div className="relative">
                <Input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    className={`pl-10 transition-colors focus:ring-2 ${
                        rightElement ? "pr-10" : ""
                    }`}
                    disabled={disabled}
                    {...registration}
                    aria-invalid={!!error}
                />
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {rightElement}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
