
export const formatCPF = (value: string) => {
    const nums = value.replace(/\D/g, "");
    return nums
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .slice(0, 14);
};

export const formatPhone = (value: string) => {
    const nums = value.replace(/\D/g, "");
    if (nums.length <= 10) {
        // (xx) xxxx-xxxx
        return nums
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2")
            .slice(0, 14);
    } else {
        // (xx) xxxxx-xxxx
        return nums
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .slice(0, 15);
    }
};

export const unformat = (value: string) => value.replace(/\D/g, "");
