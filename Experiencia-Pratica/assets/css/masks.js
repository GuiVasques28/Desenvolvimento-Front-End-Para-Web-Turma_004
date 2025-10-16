// masks.js - Máscaras de CPF, Telefone, CEP + integração ViaCEP

const APIUrl = 'https://viacep.com.br/ws/01001000/json/';
/* ============================================================
   ARQUIVO: masks.js
   DESCRIÇÃO:
   Aplica máscaras de input (CPF, telefone, CEP)
   e preenche automaticamente endereço via API ViaCEP.
   ============================================================ */

/* ==========  FUNÇÃO GERAL PARA APLICAR MÁSCARAS ========== */
function aplicarMascara(input, funcaoMascara) {
  input.addEventListener('input', (event) => {
    event.target.value = funcaoMascara(event.target.value);
  });
}

/* ==========  MÁSCARA DE CPF  (ex: 123.456.789-00) ========== */
function mascaraCPF(valor) {
  return valor
    .replace(/\D/g, '')                 // Remove tudo que não for número
    .replace(/(\d{3})(\d)/, '$1.$2')    // Coloca o primeiro ponto
    .replace(/(\d{3})(\d)/, '$1.$2')    // Coloca o segundo ponto
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Coloca o traço
}

/* ==========  MÁSCARA DE TELEFONE  (ex: (11) 91234-5678) ========== */
function mascaraTelefone(valor) {
  return valor
    .replace(/\D/g, '')                                // Remove tudo que não for número
    .replace(/^(\d{2})(\d)/g, '($1) $2')               // Adiciona parênteses no DDD
    .replace(/(\d{5})(\d{4})$/, '$1-$2');              // Adiciona o traço no final
}

/* ==========  MÁSCARA DE CEP  (ex: 01001-000) ========== */
function mascaraCEP(valor) {
  return valor
    .replace(/\D/g, '')                 // Remove tudo que não for número
    .replace(/(\d{5})(\d)/, '$1-$2');   // Coloca o traço depois dos 5 primeiros números
}

/* ============================================================
   BUSCA DE ENDEREÇO AUTOMÁTICA COM A API ViaCEP
   ============================================================ */
async function buscarEndereco(cep) {
  // Remove caracteres não numéricos
  const cepLimpo = cep.replace(/\D/g, '');

  // Verifica se o CEP tem 8 dígitos (formato correto)
  if (cepLimpo.length !== 8) return;

  try {
    // Faz requisição à API ViaCEP (sem HTTPS obrigatório)
    const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

    // Converte a resposta para JSON
    const dados = await resposta.json();

    // Se a resposta não contém erro, preenche os campos
    if (!dados.erro) {
      document.getElementById('endereco').value = dados.logradouro || '';
      document.getElementById('cidade').value = dados.localidade || '';
      document.getElementById('estado').value = dados.uf || '';
    } else {
      alert('CEP não encontrado. Verifique e tente novamente.');
    }
  } catch (erro) {
    console.error('Erro ao buscar CEP:', erro);
    alert('Erro ao buscar o CEP. Verifique sua conexão.');
  }
}

/* ============================================================
   INICIALIZAÇÃO DAS MÁSCARAS E EVENTOS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Seleciona os inputs de CPF, telefone e CEP
  const inputCPF = document.getElementById('cpf');
  const inputTelefone = document.getElementById('telefone');
  const inputCEP = document.getElementById('cep');

  // Aplica as máscaras conforme o usuário digita
  if (inputCPF) aplicarMascara(inputCPF, mascaraCPF);
  if (inputTelefone) aplicarMascara(inputTelefone, mascaraTelefone);
  if (inputCEP) aplicarMascara(inputCEP, mascaraCEP);

  // Quando o campo CEP perde o foco, busca o endereço automaticamente
  if (inputCEP) {
    inputCEP.addEventListener('blur', () => {
      const cep = inputCEP.value;
      buscarEndereco(cep);
    });
  }
});
