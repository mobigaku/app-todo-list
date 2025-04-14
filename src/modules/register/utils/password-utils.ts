import {
    PASSWORD_STRENGTH_LEVELS,
    PASSWORD_VALIDATION_RULES,
} from "../constants/password-validation";

export const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;

    return PASSWORD_VALIDATION_RULES.reduce((strength, rule) => {
        return strength + (rule.validator(password) ? 25 : 0);
    }, 0);
};

export const getPasswordStrengthText = (strength: number) => {
    if (strength === PASSWORD_STRENGTH_LEVELS.EMPTY.threshold)
        return PASSWORD_STRENGTH_LEVELS.EMPTY;
    if (strength <= PASSWORD_STRENGTH_LEVELS.WEAK.threshold)
        return PASSWORD_STRENGTH_LEVELS.WEAK;
    if (strength <= PASSWORD_STRENGTH_LEVELS.MEDIUM.threshold)
        return PASSWORD_STRENGTH_LEVELS.MEDIUM;
    if (strength <= PASSWORD_STRENGTH_LEVELS.GOOD.threshold)
        return PASSWORD_STRENGTH_LEVELS.GOOD;
    return PASSWORD_STRENGTH_LEVELS.STRONG;
};
