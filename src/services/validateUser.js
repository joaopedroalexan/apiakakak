module.exports = function validateUser({
    cpf,
    email,
    password,
    name,
    data_nascimento
}) {
    if (!cpf || !email || !password || !name || !data_nascimento) {
        return { error: "Todos os campos devem ser preenchidos" };
      } else if (isNaN(cpf) || cpf.length !== 11) {
        return{
          error: "CPF inválido. Deve conter exatamente 11 dígitos numéricos",
        };
      } else if (!email.includes("@")) {
        return {error: "Email inválido. Deve conter @" };
      } 
    return false
}