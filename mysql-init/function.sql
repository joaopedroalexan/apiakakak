delimiter $$ 
create function calcula_idade(datanascimento date)
returns int 
deterministic
no sql 
begin
    declare idade int;
    set idade = timestampdiff(year, datanascimento, curdate());
    return idade;
end; $$
delimiter ;

-- funcional

DELIMITER $$ 
CREATE FUNCTION calcula_idade(datanascimento DATE)
RETURNS INT 
DETERMINISTIC
CONTAINS SQL
BEGIN
    DECLARE idade INT;
    SET idade = TIMESTAMPDIFF(YEAR, datanascimento, CURDATE());
    RETURN idade;
END $$ 
DELIMITER ;

show create function calcula_idade;

select name, calcula_idade(data_nascimento) as idade from usuario;

select name, calcula_idade(data_nascimento) from usuario;

delimiter $$
create function status_sistema()
returns varchar(50)
no sql
begin
return 'sistema operando normalmente';
end; $$
delimiter

select status_sistema();

delimiter $$
create function total_compras_usuario(id_usuario int)
returns int 
reads sql data
begin
declare total int;
select count(*) into total
from compra 
where id_usuario = compra.fk_id_usuario;

return total;
end; $$
delimiter ;

create table log_evento(
    id_log int auto_increment PRIMARY KEY,
    mensagem varchar (255),
    data_log datetime DEFAULT current_timestamp
);

delimiter $$
create  function registrar_log_evento(texto varchar (255))
returns varchar (50)
not deterministic
modifies sql data 
begin
insert into  log_evento(mensagem)
values(texto);
return 'log inserido com sucesso';
end; $$
delimiter ;

show create function registrar_log_evento;

drop function registrar_log_evento;

show variables like 'log_bin_trust_function_creators';

set global log_bin_trust_function_creators = 1;

select registrar_log_evento('evento') as log;

delimiter $$ 
create function mensagem_boas_vindas(nome_usuario varchar(100))
returns varchar(255)
deterministic
contains sql
begin
    declare msg varchar(255);
    set msg = concat('Olá, ', nome_usuario, '! Seja bem-vindo(a) ao sistema VIO.');
    return msg;
end; $$ 
delimiter ;

select mensagem_boas_vindas("seu nome");

select routine_name from information_schema.routines where routine_type = 'FUNCTION' and routine_schema = 'vio_jon';

delimiter $$

create function is_maior_idade(data_nascimento date)
returns boolean
not deterministic
contains sql
begin
    declare idade int;

    set idade = calcula_idade(data_nascimento);
    return idade >= 18;

end; $$

delimiter ;

delimiter $$

create function faixa_etaria(data_nascimento date)
returns varchar(20)
not deterministic
contains sql
begin   
    declare idade int;
    set idade = calcula_idade(data_nascimento);
    if idade < 18 then 
        return "menor de idade";
    elseif idade < 60 then
        return "adulto";
    else 
        return "idoso";
    end if;
end; $$
delimiter ;

-- agrupa clientes por faixa etaria

select faixa_etaria(data_nascimento) as faixa, count(*) as quantidade from usuario group by faixa;

--identificar uma faixa etaria especifica

select name from usuario
    where faixa_etaria(data_nascimento) = "adulto";

    --calculo da media de idade dos usuarios cadastrados
delimiter $$

create function media_idade()
returns decimal(5,2)
not deterministic
reads sql data
 begin 
    declare media decimal(5,2);
    -- calculo da media das idades 
    select avg(timestampdiff(year, data_nascimento,curdate())) into media from usuario;

    return ifnull(media, 0);
end; $$

delimiter ;

select "a media de idade dos clientes é maior que 30" as resultado where media_idade() > 30;

-- Exercicio direcionado
-- calculo do total gasto do usuario

delimiter $$
create function calcula_total_gasto(pid_usuario int)
returns decimal(10,2)
not deterministic
reads sql data
begin
    declare total decimal(10,2);
    select sum(i.preco * ic.quantidade) into total from compra c
    join ingresso_compra ic on c.id_compra = ic.fk_id_compra
    join ingresso i on i.id_ingresso = ic.fk_id_ingresso
    where c.fk_id_usuario = pid_usuario;

    return ifnull (total, 0);
end; $$
delimiter ;

delimiter $$
create function buscar_faixa_etaria_usuario(pid int)
returns varchar(20)
not deterministic
reads sql data
begin
    declare nascimento date;
    declare faixa varchar(20);
    select data_nascimento into nascimento from usuario where id_usuario = pid;
    set faixa = faixa_etaria(nascimento);
    return faixa;

end; $$

delimiter ;

delimiter $$ 
create function total_ingressos_vendidos(id_evento int)
returns int 
reads sql data
begin
declare total int;
select sum(quantidade) into total from ingresso_compra ic 
join ingresso i on i.id_ingresso = ic.fk_id_ingresso
where i.fk_id_evento = id_evento;
return total;
end; $$
delimiter ;

delimiter $$
create function renda_total_evento(id_evento int)
returns decimal (10,2)
reads sql data
not deterministic
begin
    declare total decimal(10,2);
    select sum(i.preco * ic.quantidade) into total 
    from compra c
    join ingresso_compra ic on c.id_compra = ic.fk_id_compra
    join ingresso i on i.id_ingresso = ic.fk_id_ingresso
where i.fk_id_evento = id_evento;
return total;
end; $$
delimiter ;