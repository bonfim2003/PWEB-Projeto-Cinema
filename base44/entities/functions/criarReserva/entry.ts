import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return `AGL-${out}`;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const sessao_id = typeof body.sessao_id === 'string' ? body.sessao_id.trim() : '';
    const setor_id = typeof body.setor_id === 'string' ? body.setor_id.trim() : '';
    const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const quantidade = Number(body.quantidade);

    if (!sessao_id || !setor_id) {
      return Response.json({ error: 'Selecione uma sessão e um setor.' }, { status: 400 });
    }

    const user = await base44.auth
      .me()
      .catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) {
      return Response.json(
        { error: 'Entre na sua conta para concluir a reserva.' },
        { status: 401 }
      );
    }

    const nomeFinal = nome || user.full_name || '';
    const emailFinal = email || user.email || '';

    if (nomeFinal.length < 3) {
      return Response.json({ error: 'Informe o nome do visitante.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFinal)) {
      return Response.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
    }
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 6) {
      return Response.json({ error: 'Escolha entre 1 e 6 ingressos.' }, { status: 400 });
    }

    const sessao = await base44.asServiceRole.entities.Sessao.get(sessao_id).catch((e) =>
      e.status === 404 ? null : Promise.reject(e)
    );
    if (!sessao) {
      return Response.json({ error: 'Sessão não encontrada.' }, { status: 404 });
    }
    if (sessao.status === 'cancelada') {
      return Response.json({ error: 'Esta sessão foi cancelada.' }, { status: 409 });
    }

    const setor = await base44.asServiceRole.entities.Setor.get(setor_id).catch((e) =>
      e.status === 404 ? null : Promise.reject(e)
    );
    if (!setor || setor.sessao_id !== sessao.id) {
      return Response.json({ error: 'Setor inválido para esta sessão.' }, { status: 404 });
    }

    const jaReservado = await base44.asServiceRole.entities.Reserva.filter(
      { user_id: user.id, sessao_id: sessao.id, status: 'confirmada' },
      { limit: 1 }
    );
    if (jaReservado.items && jaReservado.items.length > 0) {
      return Response.json(
        { error: 'Você já tem uma reserva confirmada para esta sessão.' },
        { status: 409 }
      );
    }

    // Reserva atômica: só desconta se ainda houver vagas suficientes neste instante,
    // evitando que duas pessoas fiquem com as mesmas últimas vagas.
    const desconto = await base44.asServiceRole.entities.Setor.updateMany(
      {
        id: setor.id,
        sessao_id: sessao.id,
        vagas_disponiveis: { $gte: quantidade },
      },
      { $inc: { vagas_disponiveis: -quantidade } }
    );

    if (!desconto || desconto.updated !== 1) {
      return Response.json(
        { error: 'As últimas vagas deste setor acabaram de ser reservadas. Escolha outro setor.' },
        { status: 409 }
      );
    }

    const filme = sessao.filme_id
      ? await base44.asServiceRole.entities.Filme.get(sessao.filme_id).catch((e) =>
          e.status === 404 ? null : Promise.reject(e)
        )
      : null;

    let codigo = generateCode();
    for (let attempt = 0; attempt < 3; attempt++) {
      const existente = await base44.asServiceRole.entities.Reserva.filter(
        { codigo },
        { limit: 1 }
      );
      if (!existente.items || existente.items.length === 0) break;
      codigo = generateCode();
    }

    let reserva;
    try {
      reserva = await base44.asServiceRole.entities.Reserva.create({
        codigo,
        sessao_id: sessao.id,
        setor_id: setor.id,
        filme_titulo: sessao.filme_titulo || filme?.titulo || '',
        filme_poster: filme?.poster_url || '',
        sessao_data: sessao.data,
        sessao_horario: sessao.horario,
        local: sessao.local || '',
        setor_nome: setor.nome,
        nome: nomeFinal,
        email: emailFinal,
        quantidade,
        status: 'confirmada',
        user_id: user.id,
      });
    } catch (erro) {
      // devolve as vagas caso a reserva não seja criada
      await base44.asServiceRole.entities.Setor.updateMany(
        { id: setor.id },
        { $inc: { vagas_disponiveis: quantidade } }
      );
      throw erro;
    }

    const atualizado = await base44.asServiceRole.entities.Setor.get(setor.id).catch(() => null);

    return Response.json({
      reserva,
      vagas_restantes:
        atualizado?.vagas_disponiveis ??
        Math.max(0, (Number(setor.vagas_disponiveis) || 0) - quantidade),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}