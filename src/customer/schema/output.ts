export type EligibleOutputSchema = {
  type: any;
  additionalProperties: boolean;
  required: [string];
  properties: {
    elegivel: boolean;
    economiaAnualDeCO2: number;
  };
};

export const output = {
  type: 'object',
  additionalProperties: false,
  required: ['elegivel', 'razoesDeInelegibilidade'],
  properties: {
    elegivel: Boolean, // always false
    razoesDeInelegibilidade: {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'string',
        enum: [
          'Classe de consumo não aceita',
          'Modalidade tarifária não aceita',
          'Consumo muito baixo para tipo de conexão',
        ],
      },
    },
  },
};
