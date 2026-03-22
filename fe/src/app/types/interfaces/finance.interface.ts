import { FlowType, OrderType, PPhType, PPnType } from "../enums/common.enum";

export interface IAccounting {
  _id?: string;
  flow_type: FlowType;
  order_id: string;
  order_data: any;
  order_type: OrderType;
  transaction_amount: { $numberDecimal: string };
  tax_base: { $numberDecimal: string };
  ppn_type?: PPnType;
  ppn_rate?: number;
  ppn_amount?: { $numberDecimal: string };
  pph_type?: PPhType;
  pph_rate?: number;
  pph_amount?: { $numberDecimal: string };
  tax_facture_number?: string;
  record_date?: Date;
  correction_id?: string;
  correction_data?: any;
  createdAt?: Date;
  updatedAt?: Date;
}
