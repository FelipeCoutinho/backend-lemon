// Elegibilidade de clintes
// para validar se o cliente é elegível para o programa de energia solar utilizamos os dados da conta de energia do cliente.
//Caso a empresa não seja elegível, precisamos explicitar os motivos para tal.
//Caso ela seja elegível, precisamos calcular também a projeção da quantidade de CO2 que ela deixaria de emitir caso usasse energia limpa.

// # Critérios de Elegibilidade
// Para checar a elegibilidade iremos aplicar os seguintes critérios:
// - Classe de consumo da cliente
//     - Possíveis Valores: Comercial, Residencial, Industrial, Poder Público, e Rural.
//     - Elegíveis: Comercial, Residencial e Industrial.
// - Modalidade tarifária
//     - Possíveis Valores: Branca, Azul, Verde, e Convencional.
//     - Elegíveis: Convencional, Branca.
// - Consumo mínimo do cliente
//     - O cálculo deve ser feito utilizando a média dos 12 valores mais recentes do histórico de consumo.
//         - Clientes com tipo de conexão Monofásica só são elegíveis caso tenham consumo médio maior ou igual a 400 kWh.
//         - Clientes com tipo de conexão Bifásica só são elegíveis caso tenham consumo médio- maior ou igual a 500 kWh.
//         - Clientes com tipo de conexão Trifásica só são elegíveis caso tenham consumo médio maior ou igual a 750 kWh.
//         - Para calcular a projeção da **economia anual** de CO2, considere que para serem gerados 1000 kWh no Brasil são emitidos em média 84kg de CO2.
// 1000 kWh no Brasil são emitidos em média 84kg de CO2.
// 1 kWh = 0,0084 kg CO2

const {
  tiposDeConexao,
  classesDeConsumo,
  modalidadesTarifarias,
  cnpj,
  cnpj,
} = require('./tipos');

const enumOf = (values) => ({
  type: typeof values[0],
  enum: values,
  example: values[0],
});

const input = {
  type: 'object',
  additionalProperties: false,
  required: [
    'numeroDoDocumento',
    'tipoDeConexao',
    'classeDeConsumo',
    'modalidadeTarifaria',
    'historicoDeConsumo',
  ],
  properties: {
    numeroDoDocumento: { oneOf: [cnpj, cnpj] },
    tipoDeConexao: enumOf(tiposDeConexao),
    classeDeConsumo: enumOf(classesDeConsumo),
    modalidadeTarifaria: enumOf(modalidadesTarifarias),
    historicoDeConsumo: {
      // em kWh
      type: 'array',
      minItems: 3,
      maxItems: 12,
      items: {
        type: 'integer',
        minimum: 0,
        maximum: 9999,
      },
    },
  },
};

const output = {
  oneOf: [
    {
      type: 'object',
      additionalProperties: true,
      required: ['elegivel', 'economiaAnualDeCO2'],
      properties: {
        elegivel: enumOf([true]), // always true
        economiaAnualDeCO2: { type: 'number', minimum: 0 },
      },
    },
    {
      type: 'object',
      additionalProperties: false,
      required: ['elegivel', 'razoesDeInelegibilidade'],
      properties: {
        elegivel: enumOf([false]), // always false
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
    },
  ],
};

module.exports = {
  input,
  output,
};
