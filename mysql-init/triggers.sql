delimiter // 

create trigger verify_date_event
before insert on ingresso_compra
for each row
begin
    declare data_evento datetime;

    select e.data_hora into data_evento from ingresso i join evento e on i.fk_id_evento = e.id_evento where i.id_ingresso = new.fk_id_ingresso;
    if date(data_evento) < curdate() then
        signal sqlstate '45000'
        set message_text = 'Evento já ocorreu, não é possivel compra-lo.';
    end if; 
end; //

delimiter ;

delimiter //

create trigger ImpediraAlteraçãodeDatasdeEventosPassados
before update on evento
for each row
begin   
    if old.data_hora < curdate() then  
        signal sqlstate '45000'
        set message_text = 'Não é permitido alteração de eventos ja ocorridos.';
    end if;
end; //
 delimiter ;


delimiter // 
create trigger ImpedirAlteraçãoDoCPF
before update on usuario
for each row
begin
    if old.cpf <> new.cpf then 
        signal sqlstate '45000'
        set message_text = 'não é permitido alterar o número de CPF do usuário cadastrado';
    end if;
end; //

delimiter ;

delimiter //
create trigger  trg_after_delete_compra
after delete on compra
for each row 
begin
    insert into historico_compra(id_compra, data_compra, id_usuario) values (old.id_compra, old.data_compra, old.fk_id_usuario);
end; // 

delimiter ;

DELIMITER //

CREATE TRIGGER atualizar_total_ingressos
AFTER INSERT ON ingresso_compra
FOR EACH ROW
BEGIN
    DECLARE v_id_evento INT;

    SELECT fk_id_evento INTO v_id_evento
    FROM ingresso
    WHERE id_ingresso = NEW.fk_id_ingresso;

    IF EXISTS (
        SELECT 1 FROM resumo_evento WHERE id_evento = v_id_evento
    ) THEN
        UPDATE resumo_evento
        SET total_ingressos = total_ingressos + NEW.quantidade
        WHERE id_evento = v_id_evento;
    ELSE
        INSERT INTO resumo_evento (id_evento, total_ingressos)
        VALUES (v_id_evento, NEW.quantidade);
    END IF;
END;
//

DELIMITER ;
