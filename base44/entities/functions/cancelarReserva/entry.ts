import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth
      .me()
      .catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Apenas administradores podem cancelar reservas.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const reserva_id = typeof body.reserva_id === 'string' ? body.reserva_id.trim() : '';
    if (!reserva_id) {
      return Response.json({ error: 'Informe a reserva.' }, { status: 400 });
    }

    const reserva = await base44.asServiceRole.entities.Reserva.get(reserva_id).catch((e) =>
      e.status === 404 ? null : Promise.reject(e)
    );
    if (!reserva) return Response.json({ error: 'Reserva não encontrada.' }, { status: 404 });

    if (reserva.status === 'cancelada') {
      return Response.json({ reserva });
    }

    const cancelada = await base44.asServiceRole.entities.Reserva.update(reserva.id, {
      status: 'cancelada',
    });

    if (reserva.setor_id) {
      const setor = await base44.asServiceRole.entities.Setor.get(reserva.setor_id).catch((e) =>
        e.status === 404 ? null : Promise.reject(e)
      );
      if (setor) {
        const capacidade = Number(setor.capacidade_total) || 0;
        const devolvidas = (Number(setor.vagas_disponiveis) || 0) + (Number(reserva.quantidade) || 0);
        await base44.asServiceRole.entities.Setor.update(setor.id, {
          vagas_disponiveis: capacidade > 0 ? Math.min(capacidade, devolvidas) : devolvidas,
        });
      }
    }

    return Response.json({ reserva: cancelada });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}