export enum FlowType {
    IN = 'IN',
    OUT = 'OUT',
}

export enum InvestmentType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAWAL = 'WITHDRAWAL',
}

export enum ApprovalType {
    APPROVE = 'APPROVE',
    REJECT = 'REJECT',
}

export enum OrderType {
    PURCHASING = 'PURCHASING',
    SALE = 'SALE',
    EXPENSE = 'EXPENSE',
    ADJUSTMENT = 'ADJUSTMENT',
    DEPOSIT = 'DEPOSIT',
    WITHDRAWAL = 'WITHDRAWAL',
    PRODUCTION = 'PRODUCTION',
    OPERATION = 'OPERATION',
    ELSE = 'ELSE'
}

export enum CurrencyEn {
    IDR = 'IDR',
    USD = 'USD',
}

export enum PPnType {
    EXCLUSIVE = 'EXCLUSIVE', INCLUSIVE = 'INCLUSIVE', NONE = 'NONE'
}

export enum PPhType {
    PPh23 = 'PPh23',  // Services, rental, consulting
    PPh22 = 'PPh22',  // Goods purchase, imports, pengadaaan
    PPh4_2 = 'PPh4_2', // Construction, land/building rental
    NONE = 'NONE'
}