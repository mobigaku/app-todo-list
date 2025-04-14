import { Progress } from "@/components/ui/progress";
import { PASSWORD_VALIDATION_RULES } from "../constants/password-validation";

interface PasswordStrengthIndicatorProps {
    password: string;
    strength: number;
    strengthColor: {
        text: string;
        color: string;
    };
}

export function PasswordStrengthIndicator({
    password,
    strength,
    strengthColor,
}: PasswordStrengthIndicatorProps) {
    if (!password) return null;

    return (
        <div className="space-y-2">
            <Progress value={strength} className="h-1" />
            <p className={`text-xs ${strengthColor.color}`}>
                Força da senha: {strengthColor.text}
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
                {PASSWORD_VALIDATION_RULES.map((rule) => (
                    <li
                        key={rule.id}
                        className={
                            rule.validator(password) ? "text-green-500" : ""
                        }
                    >
                        • {rule.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}
