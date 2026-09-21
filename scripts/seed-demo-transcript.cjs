const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const sessionId = process.argv[2];

async function main() {
  if (!sessionId) throw new Error('sessionId required');

  const ana = await prisma.speakerProfile.upsert({
    where: { sessionId_label: { sessionId, label: 'Ana Costa' } },
    create: { sessionId, label: 'Ana Costa', displayName: 'Ana Costa' },
    update: {},
  });
  const carlos = await prisma.speakerProfile.upsert({
    where: { sessionId_label: { sessionId, label: 'Carlos Mendes' } },
    create: { sessionId, label: 'Carlos Mendes', displayName: 'Carlos Mendes' },
    update: {},
  });

  await prisma.transcriptSegment.createMany({
    data: [
      {
        sessionId,
        speakerId: ana.id,
        speakerLabel: 'Ana Costa',
        text: 'Bom dia, pessoal. Vamos revisar o roadmap do trimestre.',
        startedAt: new Date(Date.now() - 600_000),
      },
      {
        sessionId,
        speakerId: ana.id,
        speakerLabel: 'Ana Costa',
        text: 'A prioridade é fechar a transcrição em tempo real no Teams.',
        startedAt: new Date(Date.now() - 480_000),
      },
      {
        sessionId,
        speakerId: carlos.id,
        speakerLabel: 'Carlos Mendes',
        text: 'Concordo. Também precisamos do alerta do calendário funcionando.',
        startedAt: new Date(Date.now() - 300_000),
      },
      {
        sessionId,
        speakerId: carlos.id,
        speakerLabel: 'Carlos Mendes',
        text: 'Depois eu valido no app desktop do Teams.',
        startedAt: new Date(Date.now() - 120_000),
      },
    ],
  });

  console.log('segments ok');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
