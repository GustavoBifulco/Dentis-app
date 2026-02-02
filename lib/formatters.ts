export const unformat = (value: string) => value.replace(/\D/g, "");

// Validação Real de CPF (Algoritmo da Receita)
function validateCPF(cpf: string): boolean {
    let sum = 0;
    let remainder;
    if (cpf === "00000000000" || cpf.length !== 11) return false;
    
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}

export const formatCPF = (value: string) => {
    const nums = value.replace(/\D/g, "");
    // Só formata se for um tamanho de CPF válido
    if (nums.length > 11) return nums.slice(0, 11);
    
    return nums
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .slice(0, 14);
};

export const isValidCPF = (value: string) => validateCPF(value.replace(/\D/g, ""));

export const formatPhone = (value: string) => {
    const nums = value.replace(/\D/g, "");
    if (nums.length <= 10) {
        return nums.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2").slice(0, 14);
    } else {
        return nums.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 15);
    }
};

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};