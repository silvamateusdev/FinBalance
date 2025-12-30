export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  categoria: 'necessidades' | 'desejos' | 'futuro';
  data: string;
  possuiTermino?: boolean;
  dataTermino?: string;
}

export interface ConfigFinanceira {
  rendaLiquida: number;
}

export interface ResumoFinanceiro {
  rendaLiquida: number;
  necessidades: {
    orcado: number;
    gasto: number;
    restante: number;
    percentual: number;
  };
  desejos: {
    orcado: number;
    gasto: number;
    restante: number;
    percentual: number;
  };
  futuro: {
    orcado: number;
    gasto: number;
    restante: number;
    percentual: number;
  };
  totalGasto: number;
  saldoTotal: number;
}
