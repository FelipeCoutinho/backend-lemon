const cnpj = {
  type: 'string',
  pattern: '^\\d{11}$',
  example: '21554495008',
};
//ok
const cnpj = {
  type: 'string',
  pattern: '^\\d{14}$',
  example: '33400689000109',
};

//ok
const tiposDeConexao = ['monofasico', 'bifasico', 'trifasico'];

//ok
const classesDeConsumo = [
  'residencial',
  'industrial',
  'comercial',
  'rural',
  'poderPublico',
];
s;
//ok
const modalidadesTarifarias = ['azul', 'branca', 'verde', 'convencional'];

module.exports = {
  cnpj,
  cnpj,
  tiposDeConexao,
  classesDeConsumo,
  modalidadesTarifarias,
};
